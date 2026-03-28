# Prioritní fronta

## Co je prioritní fronta

**Prioritní fronta** je datová struktura, ve které se prvky neodebírají podle pořadí vložení jako u běžné fronty, ale podle jejich  **priority** .

To znamená:

* prvek s **nejvyšší prioritou** se odebere jako první,
* nebo naopak prvek s **nejnižší prioritou** se odebere jako první.

Podle toho rozlišujeme:

* **min-priority queue** – první jde ven **nejmenší** prvek,
* **max-priority queue** – první jde ven **největší** prvek.

V Javě třída `PriorityQueue` funguje standardně jako  **min-heap** , tedy první vrací **nejmenší** prvek podle `Comparable` nebo `Comparator`.

---

## Rozdíl oproti obyčejné frontě

Běžná fronta je  **FIFO** :

* první dovnitř, první ven.

Prioritní fronta je:

* **nejdůležitější dovnitř, první ven** .

Například:

* do běžné fronty vložíš: `5, 1, 8`
  odebereš: `5, 1, 8`
* do prioritní fronty typu **min** vložíš: `5, 1, 8`
  odebereš: `1, 5, 8`

Takže prioritní fronta  **neudržuje pořadí vložení** , ale  **pořadí podle priority** .

---

## K čemu se používá

Prioritní fronta je velmi důležitá v algoritmech a systémech, kde je nutné vždy vybrat „nejlepší“, „nejmenší“, „nejbližší“ nebo „nejurgentnější“ prvek.

Typické použití:

* **Dijkstraův algoritmus** – vybírá vrchol s nejmenší aktuální vzdáleností,
* **Primův algoritmus** – vybírá nejlevnější hranu,
* **plánování úloh** v operačních systémech,
* **simulace událostí** ,
* **A*** a další heuristické algoritmy,
* **top-k problémy** ,
* **heap sort** ,
* zpracování prioritních požadavků.

---

## Základní operace

Prioritní fronta obvykle podporuje tyto operace:

* `insert(x)` / `offer(x)` / `add(x)`
  vloží nový prvek
* `peek()`
  vrátí prvek s nejvyšší prioritou, ale neodebere ho
* `poll()` / `remove()` / `extractMin()` / `extractMax()`
  vrátí a odebere prioritní prvek
* `isEmpty()`
  test prázdnosti
* `size()`
  počet prvků

Někdy se podporuje i:

* `decreaseKey()` – snížení priority existujícího prvku,
* `increaseKey()` – zvýšení priority,
* `merge()` – sloučení dvou prioritních front.

V běžné binární haldě se `decreaseKey()` implementuje komplikovaněji, protože je třeba znát pozici prvku.

---

## Jak se prioritní fronta implementuje

Existuje více možností:

### 1. Neuspořádané pole/seznam

* vložení: **O(1)**
* nalezení minima/maxima: **O(n)**
* odebrání minima/maxima: **O(n)**

Nevýhoda: odebrání prioritního prvku je pomalé.

### 2. Uspořádané pole/seznam

* vložení: **O(n)** (musíš zařadit na správné místo)
* minimum/maximum: **O(1)**
* odebrání: **O(1)** nebo **O(n)** podle směru

Nevýhoda: vložení je pomalé.

### 3. Binární halda (binary heap)

To je nejčastější implementace.

* vložení: **O(log n)**
* odebrání minima/maxima: **O(log n)**
* náhled minima/maxima: **O(1)**

To je velmi dobrý kompromis mezi rychlým vložením a rychlým odebráním prioritního prvku.

---

# Binární halda

## Co je binární halda

**Binární halda** je téměř úplný binární strom, který splňuje  **hal­dovou vlastnost** .

### Min-heap

Každý rodič je **menší nebo roven** svým dětem.

Takže:

* nejmenší prvek je vždy v  **kořeni** .

### Max-heap

Každý rodič je **větší nebo roven** svým dětem.

Takže:

* největší prvek je vždy v  **kořeni** .

---

## Proč se halda ukládá do pole

Protože binární halda je  **téměř úplný binární strom** , nemusíme ji ukládat pomocí ukazatelů jako klasický strom. Stačí obyčejné pole.

Pro index `i` platí:

* levý potomek: `2*i + 1`
* pravý potomek: `2*i + 2`
* rodič: `(i - 1) / 2`

To je velmi efektivní:

* žádné uzly s odkazy,
* výborná cache lokalita,
* jednoduchá implementace.

---

## Hal­dová vlastnost

U min-heapu platí:

* `parent <= leftChild`
* `parent <= rightChild`

Důležité:

* halda  **není úplně seřazená** .
* garantuje pouze to, že nejlepší prvek je v kořeni.

Například toto je validní min-heap:

```text
        2
      /   \
     5     8
    / \   /
   9  10 12
```

Pole:

```text
[2, 5, 8, 9, 10, 12]
```

Není to běžně seřazené pole, ale nejmenší prvek je správně na začátku.

---

## Operace v binární haldě

### Vložení

1. Nový prvek se vloží na  **konec pole** .
2. Potom se porovnává s rodičem.
3. Pokud porušuje haldovou vlastnost, **vymění se** s rodičem.
4. To se opakuje směrem nahoru.

Tomu se říká:

* **sift up**
* nebo **bubble up**

Složitost:

* nejvýš výška stromu → **O(log n)**

### Odebrání minima/maxima

1. Odebere se kořen.
2. Na jeho místo se přesune **poslední prvek** z pole.
3. Tento prvek se porovnává s dětmi.
4. Pokud porušuje haldovou vlastnost, vymění se s „lepší“ z dětí.
5. Pokračuje směrem dolů.

Tomu se říká:

* **sift down**
* nebo **heapify down**

Složitost:

* opět maximálně výška stromu → **O(log n)**

### Náhled na minimum/maximum

* kořen je vždy na indexu `0`
* tedy **O(1)**

---

## Složitosti prioritní fronty implementované haldou

| Operace                                |         Složitost |
| -------------------------------------- | -----------------: |
| `peek()`                             |     **O(1)** |
| `offer()`/`add()`                  | **O(log n)** |
| `poll()`/`remove()`                | **O(log n)** |
| `size()`                             |     **O(1)** |
| `isEmpty()`                          |     **O(1)** |
| vytvoření haldy z n prvků (heapify) |     **O(n)** |

---

## Min-heap vs. Max-heap

### Min-heap

První jde ven nejmenší prvek.

Použití:

* Dijkstra,
* plánování podle nejbližšího termínu,
* nejmenší klíč jako priorita.

### Max-heap

První jde ven největší prvek.

Použití:

* top největších hodnot,
* plánování podle nejvyšší priority,
* „vždy vyber největší“.

Max-heap lze udělat:

* úpravou porovnávání,
* nebo použitím opačného komparátoru.

---

## Výhody prioritní fronty

* rychlý přístup k nejdůležitějšímu prvku,
* efektivní implementace přes haldu,
* vhodná pro algoritmy nad grafy a plánování,
* snadná reprezentace polem.

## Nevýhody

* neumí rychlé vyhledání libovolného prvku,
* není vhodná pro úplné třídění během každého vložení,
* odstranění libovolného prvku není v základní haldě efektivní,
* běžná halda negarantuje pořadí prvků se stejnou prioritou.

---

## Priority a stabilita

Pokud dva prvky mají stejnou prioritu, klasická prioritní fronta:

* **nezaručuje stabilitu** , tedy pořadí vložení nemusí být zachováno.

Když chceš stabilitu, musíš si pomoci:

* přidáním sekundárního klíče, například pořadového čísla vložení.

---

## Prioritní fronta v Javě

Java má třídu:

```java
PriorityQueue<E>
```

Charakteristika:

* implementace přes  **min-heap** ,
* používá přirozené pořadí (`Comparable`) nebo dodaný `Comparator`,
* `peek()` vrací minimum,
* `poll()` odebere minimum,
* **není synchronizovaná** ,
* neudržuje plné seřazení při iteraci.

Příklad:

```java
PriorityQueue<Integer> pq = new PriorityQueue<>();
pq.add(5);
pq.add(1);
pq.add(8);

System.out.println(pq.poll()); // 1
System.out.println(pq.poll()); // 5
System.out.println(pq.poll()); // 8
```

Max-priority queue:

```java
PriorityQueue<Integer> pq = new PriorityQueue<>(Comparator.reverseOrder());
```

---

# Implementace po krocích – prioritní fronta jako min-heap

Budeme implementovat:

```java
MyPriorityQueue<E extends Comparable<? super E>>
```

Uvnitř bude:

* `Object[] data`
* `int size`

Budeme podporovat:

* `offer`
* `peek`
* `poll`
* `size`
* `isEmpty`
* `clear`
* `heapify up`
* `heapify down`

---

## 1) Stav a konstrukce

```java
private Object[] data;
private int size;
private static final int DEFAULT_CAPACITY = 10;

public MyPriorityQueue() {
  this.data = new Object[DEFAULT_CAPACITY];
}

public int size() { return size; }
public boolean isEmpty() { return size == 0; }
```

---

## 2) Pomocné indexové funkce

```java
private int parent(int i) { return (i - 1) / 2; }
private int left(int i)   { return 2 * i + 1; }
private int right(int i)  { return 2 * i + 2; }
```

---

## 3) Přístup k prvku a porovnání

```java
@SuppressWarnings("unchecked")
private E elementAt(int i) {
  return (E) data[i];
}

private int compare(E a, E b) {
  return a.compareTo(b);
}
```

---

## 4) Výměna prvků

```java
private void swap(int i, int j) {
  Object tmp = data[i];
  data[i] = data[j];
  data[j] = tmp;
}
```

---

## 5) Zvětšení kapacity

```java
private void ensureCapacity(int minCapacity) {
  if (minCapacity <= data.length) return;
  int oldCap = data.length;
  int newCap = oldCap + (oldCap >> 1); // 1.5x
  if (newCap < minCapacity) newCap = minCapacity;
  Object[] nd = new Object[newCap];
  System.arraycopy(data, 0, nd, 0, size);
  data = nd;
}
```

---

## 6) Vložení – `offer`

```java
public void offer(E e) {
  ensureCapacity(size + 1);
  data[size] = e;
  siftUp(size);
  size++;
}
```

---

## 7) Posun nahoru – `siftUp`

```java
private void siftUp(int idx) {
  while (idx > 0) {
    int p = parent(idx);
    E cur = elementAt(idx);
    E par = elementAt(p);
    if (compare(cur, par) >= 0) break;
    swap(idx, p);
    idx = p;
  }
}
```

---

## 8) Náhled – `peek`

```java
@SuppressWarnings("unchecked")
public E peek() {
  return size == 0 ? null : (E) data[0];
}
```

---

## 9) Odebrání minima – `poll`

```java
@SuppressWarnings("unchecked")
public E poll() {
  if (size == 0) return null;

  E root = (E) data[0];
  size--;
  data[0] = data[size];
  data[size] = null;

  if (size > 0) siftDown(0);
  return root;
}
```

---

## 10) Posun dolů – `siftDown`

```java
private void siftDown(int idx) {
  while (true) {
    int l = left(idx);
    int r = right(idx);
    int smallest = idx;

    if (l < size && compare(elementAt(l), elementAt(smallest)) < 0) {
      smallest = l;
    }
    if (r < size && compare(elementAt(r), elementAt(smallest)) < 0) {
      smallest = r;
    }
    if (smallest == idx) break;

    swap(idx, smallest);
    idx = smallest;
  }
}
```

---

## 11) Vyprázdnění

```java
public void clear() {
  for (int i = 0; i < size; i++) data[i] = null;
  size = 0;
}
```

---

## 12) Volitelně – konstrukce haldy z pole (`heapify`)

Pokud máme pole prvků a chceme z něj udělat haldu efektivně, nepřidáváme po jednom, ale uděláme **heapify** odspodu.

```java
public MyPriorityQueue(E[] arr) {
  this.data = new Object[Math.max(arr.length, DEFAULT_CAPACITY)];
  this.size = arr.length;
  System.arraycopy(arr, 0, data, 0, arr.length);

  for (int i = parent(size - 1); i >= 0; i--) {
    siftDown(i);
  }
}
```

Tím vytvoříme haldu v  **O(n)** .

---

## Mini-ukázka použití

```java
MyPriorityQueue<Integer> pq = new MyPriorityQueue<>();
pq.offer(5);
pq.offer(1);
pq.offer(8);
pq.offer(3);

System.out.println(pq.peek()); // 1
System.out.println(pq.poll()); // 1
System.out.println(pq.poll()); // 3
System.out.println(pq.poll()); // 5
System.out.println(pq.poll()); // 8
```

---

# Úplná „kapesní“ implementace (vcelku)

```java
public class MyPriorityQueue<E extends Comparable<? super E>> {
  private Object[] data;
  private int size;
  private static final int DEFAULT_CAPACITY = 10;

  public MyPriorityQueue() {
    this.data = new Object[DEFAULT_CAPACITY];
  }

  public MyPriorityQueue(E[] arr) {
    this.data = new Object[Math.max(arr.length, DEFAULT_CAPACITY)];
    this.size = arr.length;
    System.arraycopy(arr, 0, data, 0, arr.length);

    for (int i = parent(size - 1); i >= 0; i--) {
      siftDown(i);
    }
  }

  public int size() { return size; }
  public boolean isEmpty() { return size == 0; }

  private int parent(int i) { return (i - 1) / 2; }
  private int left(int i)   { return 2 * i + 1; }
  private int right(int i)  { return 2 * i + 2; }

  @SuppressWarnings("unchecked")
  private E elementAt(int i) {
    return (E) data[i];
  }

  private int compare(E a, E b) {
    return a.compareTo(b);
  }

  private void swap(int i, int j) {
    Object tmp = data[i];
    data[i] = data[j];
    data[j] = tmp;
  }

  private void ensureCapacity(int minCapacity) {
    if (minCapacity <= data.length) return;
    int oldCap = data.length;
    int newCap = oldCap + (oldCap >> 1); // 1.5x
    if (newCap < minCapacity) newCap = minCapacity;
    Object[] nd = new Object[newCap];
    System.arraycopy(data, 0, nd, 0, size);
    data = nd;
  }

  public void offer(E e) {
    ensureCapacity(size + 1);
    data[size] = e;
    siftUp(size);
    size++;
  }

  @SuppressWarnings("unchecked")
  public E peek() {
    return size == 0 ? null : (E) data[0];
  }

  @SuppressWarnings("unchecked")
  public E poll() {
    if (size == 0) return null;

    E root = (E) data[0];
    size--;
    data[0] = data[size];
    data[size] = null;

    if (size > 0) siftDown(0);
    return root;
  }

  public void clear() {
    for (int i = 0; i < size; i++) data[i] = null;
    size = 0;
  }

  private void siftUp(int idx) {
    while (idx > 0) {
      int p = parent(idx);
      E cur = elementAt(idx);
      E par = elementAt(p);

      if (compare(cur, par) >= 0) break;

      swap(idx, p);
      idx = p;
    }
  }

  private void siftDown(int idx) {
    while (true) {
      int l = left(idx);
      int r = right(idx);
      int smallest = idx;

      if (l < size && compare(elementAt(l), elementAt(smallest)) < 0) {
        smallest = l;
      }
      if (r < size && compare(elementAt(r), elementAt(smallest)) < 0) {
        smallest = r;
      }
      if (smallest == idx) break;

      swap(idx, smallest);
      idx = smallest;
    }
  }
}
```

---

# Shrnutí

Prioritní fronta:

* neodebírá podle pořadí vložení,
* ale podle priority,
* nejčastěji se implementuje jako  **binární halda** ,
* `peek()` má  **O(1)** ,
* `offer()` a `poll()` mají  **O(log n)** ,
* je klíčová v algoritmech jako  **Dijkstra** ,  **Prim** , **A*** a v plánování úloh.
