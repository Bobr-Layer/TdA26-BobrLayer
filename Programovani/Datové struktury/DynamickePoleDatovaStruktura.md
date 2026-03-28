# Dynamické pole – ArrayList

## Idea a motivace

Statické pole má **pevnou velikost**. Dynamické pole zajišťuje **sekvenční kontejner** s rychlým náhodným přístupem `O(1)` jako pole, ale umí **růst** (a případně **zmenšovat**) podle potřeby. Implementačně jde o **kontinuální blok paměti** (např. `Object[]`), ke kterému držíme:

* **`size`** – kolik prvků je skutečně uloženo,
* **`capacity`** – kolik se vejde bez realokace,
* růst pomocí **reallocace** a **kopie** do většího pole.

## Časové složitosti

* `get(i)`, `set(i, x)` → **O(1)** (přímá adresa `base + i*sizeof(T)`).
* `add(x)` na **konec** → **amort. O(1)** (občas reallokace a kopie).
* `insert(i, x)`, `remove(i)` → **O(n)** (musí se posunout suffix).
* `contains(x)`, `indexOf(x)` → **O(n)** (lineární hledání).
* Změna kapacity (resize) → **O(n)**, ale **zřídka** (amortizace).

## Amortizace a růstový faktor

Geometrický růst (typicky **2×** nebo ~**1.5×**) zajišťuje, že průměrná cena jednoho `add` je **konstantní**. Volba faktoru:

* **2×**: méně realokací (rychlejší), ale větší „vzduch“ (paměť navíc).
* **1.5×**: lepší paměť, více realokací (pomalé špičky).
* JDK `ArrayList` používá cca **1.5×**.

## Shrink (zmenšování)

Zmenšování je volitelné: může probíhat **líně** (např. `trimToSize()` na vyžádání) nebo automaticky, ale pozor na **thrashing** (střídání rozšíření/zmenšení). Bezpečné je:

* explicitní `trimToSize()`,
* nebo zmenšit až při **dlouhodobé** nízké zaplněnosti (např. `size < capacity/4`).

## Vlastnosti a kompromisy

* **Cache lokalita**: vynikající (kontinuální blok) → rychlé sekvenční průchody.
* **Vložení/mazání uprostřed**: drahé (posuny).
* **Paměťová režie**: menší než u spojového seznamu (žádné ukazatele na uzlech), ale držíme **rezervu** do kapacity.
* **Pořadí**: stabilní (indexy 0..`size-1`, zachovává pořadí vložení).
* **Iterace**: rychlá, sekvenční.

## Java nuance (oproti `ArrayList`)

* V naší ukázce máme **vlastní** třídu (např. `MyDynamicArray<E>`). `ArrayList` v JDK navíc:

  * implementuje `List`, má **fail-fast** iterátory a `subList` view,
  * má sofistikované okrajové případy, serializaci, modCount atd.
* Generika v Javě jsou **vymazaná** (*type erasure*), uvnitř máme `Object[]` a přetypy s `@SuppressWarnings("unchecked")`.


# Implementace po krocích (Java)

> Struktura: `Object[] data`, `int size`, růst kapacity, `add`, `insert`, `remove`, `get/set`, `indexOf/contains`, `ensureCapacity`, `trimToSize`, `clear`. Kompletní kód je úplně dole.

### 1) Stav, konstrukce, základní metriky

```java
private Object[] data;
private int size;
private static final int DEFAULT_CAPACITY = 10;

public MyDynamicArray() {
  this.data = new Object[DEFAULT_CAPACITY];
}

public MyDynamicArray(int initialCapacity) {
  if (initialCapacity < 0) throw new IllegalArgumentException();
  this.data = new Object[Math.max(initialCapacity, 1)];
}

public int size() { return size; }
public boolean isEmpty() { return size == 0; }
public int capacity() { return data.length; }
```

### 2) Přístup a změna (O(1))

```java
private void checkIndex(int index) {
  if (index < 0 || index >= size) throw new IndexOutOfBoundsException();
}

@SuppressWarnings("unchecked")
public E get(int index) {
  checkIndex(index);
  return (E) data[index];
}

@SuppressWarnings("unchecked")
public E set(int index, E element) {
  checkIndex(index);
  E old = (E) data[index];
  data[index] = element;
  return old;
}
```

### 3) Přidání na konec – amort. O(1)

```java
public void add(E element) {
  ensureCapacity(size + 1);
  data[size++] = element;
}
```

### 4) Vložení na libovolný index – O(n) (posun suffixu)

```java
public void add(int index, E element) {
  if (index < 0 || index > size) throw new IndexOutOfBoundsException();
  ensureCapacity(size + 1);
  System.arraycopy(data, index, data, index + 1, size - index);
  data[index] = element;
  size++;
}
```

### 5) Odstranění podle indexu – O(n) (posun suffixu)

```java
@SuppressWarnings("unchecked")
public E remove(int index) {
  checkIndex(index);
  E old = (E) data[index];
  int numMoved = size - index - 1;
  if (numMoved > 0) {
    System.arraycopy(data, index + 1, data, index, numMoved);
  }
  data[--size] = null; // GC-friendly
  return old;
}
```

### 6) Odstranění podle hodnoty – O(n)

```java
public boolean remove(Object o) {
  for (int i = 0; i < size; i++) {
    if (o == null ? data[i] == null : o.equals(data[i])) {
      remove(i);
      return true;
    }
  }
  return false;
}
```

### 7) Hledání a test členství – O(n)

```java
public int indexOf(Object o) {
  for (int i = 0; i < size; i++) {
    if (o == null ? data[i] == null : o.equals(data[i])) return i;
  }
  return -1;
}

public boolean contains(Object o) { return indexOf(o) >= 0; }
```

### 8) Kapacita – zajištění, explicitní zmenšení

```java
public void ensureCapacity(int minCapacity) {
  if (minCapacity <= data.length) return;
  grow(minCapacity);
}

public void trimToSize() {
  if (size < data.length) {
    Object[] nd = new Object[Math.max(size, 1)];
    System.arraycopy(data, 0, nd, 0, size);
    data = nd;
  }
}
```

### 9) Vyprázdnění (GC-friendly)

```java
public void clear() {
  for (int i = 0; i < size; i++) data[i] = null;
  size = 0;
}
```

### 10) Růst kapacity (1.5×, případně víc podle minima)

```java
private void grow(int minCapacity) {
  int oldCap = data.length;
  // růst 1.5× (old + old/2), ale minimálně minCapacity
  int newCap = oldCap + (oldCap >> 1);
  if (newCap < minCapacity) newCap = minCapacity;
  Object[] nd = new Object[newCap];
  System.arraycopy(data, 0, nd, 0, size);
  data = nd;
}
```

## Mini-ukázka použití

```java
MyDynamicArray<String> arr = new MyDynamicArray<>(2);
arr.add("Ada");
arr.add("Grace");              // kapacita se brzy zvětší
arr.add(1, "Linus");           // vloží doprostřed, posune suffix
String s = arr.get(2);         // "Grace"
arr.remove("Ada");             // najde a smaže první výskyt
arr.trimToSize();              // zmenší pole na aktuální size
```


# Úplná „kapesní“ implementace (vcelku)

```java
public class MyDynamicArray<E> {
  private Object[] data;
  private int size;
  private static final int DEFAULT_CAPACITY = 10;

  public MyDynamicArray() {
    this.data = new Object[DEFAULT_CAPACITY];
  }

  public MyDynamicArray(int initialCapacity) {
    if (initialCapacity < 0) throw new IllegalArgumentException("initialCapacity < 0");
    this.data = new Object[Math.max(initialCapacity, 1)];
  }

  public int size() { return size; }
  public boolean isEmpty() { return size == 0; }
  public int capacity() { return data.length; }

  @SuppressWarnings("unchecked")
  public E get(int index) {
    checkIndex(index);
    return (E) data[index];
  }

  @SuppressWarnings("unchecked")
  public E set(int index, E element) {
    checkIndex(index);
    E old = (E) data[index];
    data[index] = element;
    return old;
  }

  public void add(E element) {
    ensureCapacity(size + 1);
    data[size++] = element;
  }

  public void add(int index, E element) {
    if (index < 0 || index > size) throw new IndexOutOfBoundsException();
    ensureCapacity(size + 1);
    System.arraycopy(data, index, data, index + 1, size - index);
    data[index] = element;
    size++;
  }

  @SuppressWarnings("unchecked")
  public E remove(int index) {
    checkIndex(index);
    E old = (E) data[index];
    int numMoved = size - index - 1;
    if (numMoved > 0) {
      System.arraycopy(data, index + 1, data, index, numMoved);
    }
    data[--size] = null;
    return old;
  }

  public boolean remove(Object o) {
    for (int i = 0; i < size; i++) {
      if (o == null ? data[i] == null : o.equals(data[i])) {
        remove(i);
        return true;
      }
    }
    return false;
  }

  public int indexOf(Object o) {
    for (int i = 0; i < size; i++) {
      if (o == null ? data[i] == null : o.equals(data[i])) return i;
    }
    return -1;
  }

  public boolean contains(Object o) { return indexOf(o) >= 0; }

  public void clear() {
    for (int i = 0; i < size; i++) data[i] = null;
    size = 0;
  }

  public void ensureCapacity(int minCapacity) {
    if (minCapacity > data.length) grow(minCapacity);
  }

  public void trimToSize() {
    if (size < data.length) {
      Object[] nd = new Object[Math.max(size, 1)];
      System.arraycopy(data, 0, nd, 0, size);
      data = nd;
    }
  }

  // --- pomocné ---
  private void checkIndex(int index) {
    if (index < 0 || index >= size) throw new IndexOutOfBoundsException();
  }

  private void grow(int minCapacity) {
    int oldCap = data.length;
    int newCap = oldCap + (oldCap >> 1); // ~1.5×
    if (newCap < minCapacity) newCap = minCapacity;
    Object[] nd = new Object[newCap];
    System.arraycopy(data, 0, nd, 0, size);
    data = nd;
  }
}
```

Chceš navázat verzí s **automatickým zmenšováním** (např. když `size < capacity/4`), přidat **iterátor**, nebo krátce porovnat výkon proti `LinkedList` na typických scénářích?
