# Halda 

## Co je halda

**Halda** je speciální stromová datová struktura, která splňuje dvě hlavní vlastnosti:

1. **Strukturní vlastnost**
   Halda je **úplný binární strom** nebo přesněji  **téměř úplný binární strom** .
   To znamená:
   * všechny úrovně kromě poslední jsou zcela zaplněné,
   * poslední úroveň se zaplňuje zleva doprava.
2. **Hal­dová vlastnost**
   Hodnoty uzlů musí splňovat určité uspořádání mezi rodičem a dětmi.

Podle směru této vlastnosti rozlišujeme:

* **Min-heap**
  každý rodič je **menší nebo roven** svým dětem
  → nejmenší prvek je vždy v kořeni
* **Max-heap**
  každý rodič je **větší nebo roven** svým dětem
  → největší prvek je vždy v kořeni

---

## Co halda garantuje a co ne

Je velmi důležité pochopit, že halda **není běžně seřazený strom** ani běžně seřazené pole.

Například u **min-heapu** platí jen to, že:

* kořen je nejmenší,
* každý podstrom je opět min-heap.

Ale neplatí:

* že levý podstrom obsahuje menší prvky než pravý,
* že inorder průchod dá seřazenou posloupnost,
* že všichni potomci vlevo jsou menší než vpravo.

Halda tedy garantuje pouze  **lokální uspořádání mezi rodičem a jeho dětmi** , nikoliv úplné globální setřídění.

---

## Proč je halda důležitá

Halda je základní datová struktura pro:

* **prioritní frontu** ,
* **heap sort** ,
* **Dijkstrův algoritmus** ,
* **Primův algoritmus** ,
* plánování úloh,
* výběr minima nebo maxima v dynamicky se měnící množině,
* top-k problémy,
* median maintenance (ve dvojici hald).

---

## Proč se halda ukládá do pole

Protože binární halda je  **téměř úplný strom** , nemusíme používat ukazatele jako u běžných stromů. Můžeme ji uložit do obyčejného pole.

To je obrovská výhoda:

* menší paměťová režie,
* výborná cache lokalita,
* jednoduchá implementace,
* rychlé indexování rodiče a dětí.

Pro uzel na indexu `i` platí:

* **rodič** :
  `(i - 1) / 2`
* **levý potomek** :
  `2 * i + 1`
* **pravý potomek** :
  `2 * i + 2`

Například pole:

```text
[2, 5, 8, 9, 10, 12]
```

reprezentuje strom:

```text
        2
      /   \
     5     8
    / \   /
   9 10 12
```

Tento strom je validní  **min-heap** .

---

## Rozdíl mezi haldou a binárním vyhledávacím stromem

Tohle je častý zdroj zmatků.

### Halda

* garantuje minimum nebo maximum v kořeni,
* nepodporuje efektivní hledání libovolného prvku,
* typicky se používá pro prioritní zpracování.

### BST

* levý podstrom obsahuje menší prvky, pravý větší,
* umí efektivní hledání podle klíče,
* minimum/maximem se dostaneš průchodem do krajní větve.

Takže:

* **halda je ideální pro opakované odebírání minima/maxima** ,
* **BST je ideální pro vyhledávání podle hodnoty** .

---

## Základní operace nad haldou

### 1. `peek`

Vrátí kořen:

* u min-heapu minimum,
* u max-heapu maximum.

Složitost:

* **O(1)**

### 2. `insert` / `add`

Nový prvek se vloží na konec pole, aby byla zachována strukturní vlastnost.
Pak se případně přesouvá nahoru, dokud není obnovena haldová vlastnost.

Tomu se říká:

* **sift up**
* **bubble up**
* **percolate up**

Složitost:

* **O(log n)**

### 3. `extractMin` / `extractMax` / `poll`

Kořen se odebere.
Na jeho místo se přesune poslední prvek pole.
Pak se tento prvek posouvá dolů, dokud není halda opět korektní.

Tomu se říká:

* **sift down**
* **heapify down**
* **percolate down**

Složitost:

* **O(log n)**

### 4. `buildHeap`

Když máme celé pole hodnot a chceme z něj vytvořit haldu, můžeme:

* vkládat prvky po jednom →  **O(n log n)** ,
* nebo použít **bottom-up heapify** →  **O(n)** .

To je velmi důležitá vlastnost.

---

## Operace `sift up`

Používá se při vkládání nového prvku.

Postup:

1. nový prvek se vloží na konec,
2. porovná se s rodičem,
3. pokud porušuje haldovou vlastnost, vymění se s rodičem,
4. pokračuje se nahoru.

Například vložení do min-heapu:

```text
[2, 5, 8, 9, 10]
vložíme 1
→ [2, 5, 8, 9, 10, 1]
```

Pak:

* 1 < 8 → prohodit
* 1 < 2 → prohodit

Výsledek:

```text
[1, 5, 2, 9, 10, 8]
```

---

## Operace `sift down`

Používá se při mazání kořene nebo při `buildHeap`.

Postup:

1. kořen odstraníme,
2. poslední prvek přesuneme na začátek,
3. porovnáme ho s dětmi,
4. pokud porušuje haldovou vlastnost, vyměníme ho s vhodnějším dítětem,
5. pokračujeme dolů.

U min-heapu vybíráme **menšího** z potomků.

---

## Časové složitosti

| Operace                      |         Složitost |
| ---------------------------- | -----------------: |
| `peek`                     |     **O(1)** |
| `insert`                   | **O(log n)** |
| `extractMin / extractMax`  | **O(log n)** |
| `buildHeap`                |     **O(n)** |
| hledání libovolného prvku |     **O(n)** |

---

## Proč je `buildHeap` O(n), a ne O(n log n)

Tohle je známý teoretický bod.

Na první pohled by se zdálo, že když na každém uzlu voláme `siftDown`, a ten může stát až `O(log n)`, tak celkem to bude `O(n log n)`.

Jenže:

* většina uzlů je blízko listům,
* ty se posouvají dolů jen o malou výšku,
* jen málo uzlů je vysoko.

Součet prací přes všechny úrovně vyjde  **O(n)** .

Proto je výhodnější stavět haldu z pole přes **bottom-up heapify** než vkládáním po jednom.

---

## Min-heap a Max-heap

### Min-heap

* kořen = minimum
* používá se nejčastěji v prioritních frontách

### Max-heap

* kořen = maximum
* hodí se, když chceš rychle vybírat největší prvek

Max-heap lze realizovat:

* obrácením porovnávání,
* nebo použitím opačného komparátoru.

---

## Výhody haldy

* rychlý přístup k minimu/maximu,
* efektivní vkládání i odebírání,
* jednoduchá reprezentace polem,
* výborná pro prioritní fronty,
* `buildHeap` v lineárním čase.

## Nevýhody haldy

* neumí rychlé vyhledání libovolného prvku,
* neudržuje úplné setřídění,
* odebrání konkrétního vnitřního prvku je komplikovanější,
* klasická halda sama o sobě není stabilní.

---

## Halda a třídění – Heap Sort

Halda je základem algoritmu  **Heap Sort** :

1. z pole vytvoříme haldu,
2. opakovaně přesouváme kořen na konec,
3. zmenšujeme aktivní část haldy,
4. obnovujeme haldovou vlastnost.

Vlastnosti:

* čas  **O(n log n)** ,
* paměť **O(1)** navíc,
* ale v praxi bývá pomalejší než QuickSort/TimSort.

---

## Halda v Javě

Java nemá třídu jménem `Heap`, ale používá:

* **`PriorityQueue<E>`**

Ta je interně implementovaná jako  **binární halda** .

Ve výchozím stavu:

* je to  **min-heap** .

Příklad:

```java
PriorityQueue<Integer> pq = new PriorityQueue<>();
pq.add(5);
pq.add(1);
pq.add(8);

System.out.println(pq.peek()); // 1
```

Pro max-heap:

```java
PriorityQueue<Integer> pq = new PriorityQueue<>(Comparator.reverseOrder());
```

---

# Implementace po krocích – binární min-heap

Budeme implementovat:

```java
MyHeap<E extends Comparable<? super E>>
```

Tato třída bude reprezentovat  **min-heap** .

Uvnitř bude:

* `Object[] data`
* `int size`

Podporované operace:

* `add`
* `peek`
* `poll`
* `size`
* `isEmpty`
* `clear`
* `buildHeap`
* `siftUp`
* `siftDown`

---

## 1) Stav a konstrukce

```java
private Object[] data;
private int size;
private static final int DEFAULT_CAPACITY = 10;

public MyHeap() {
  this.data = new Object[DEFAULT_CAPACITY];
}

public int size() { return size; }
public boolean isEmpty() { return size == 0; }
```

---

## 2) Indexové pomocné funkce

```java
private int parent(int i) { return (i - 1) / 2; }
private int left(int i)   { return 2 * i + 1; }
private int right(int i)  { return 2 * i + 2; }
```

---

## 3) Přístup a porovnávání

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

## 4) Prohození prvků

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

## 6) Vložení – `add`

```java
public void add(E e) {
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

## 8) Náhled na minimum – `peek`

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

## 12) Konstrukce z pole – `buildHeap`

```java
public MyHeap(E[] arr) {
  this.data = new Object[Math.max(arr.length, DEFAULT_CAPACITY)];
  this.size = arr.length;
  System.arraycopy(arr, 0, data, 0, arr.length);

  for (int i = parent(size - 1); i >= 0; i--) {
    siftDown(i);
  }
}
```

Tohle vytvoří haldu v  **O(n)** .

---

## Mini-ukázka použití

```java
MyHeap<Integer> h = new MyHeap<>();
h.add(5);
h.add(1);
h.add(8);
h.add(3);

System.out.println(h.peek()); // 1
System.out.println(h.poll()); // 1
System.out.println(h.poll()); // 3
System.out.println(h.poll()); // 5
System.out.println(h.poll()); // 8
```

---

# Úplná „kapesní“ implementace (vcelku)

```java
public class MyHeap<E extends Comparable<? super E>> {
  private Object[] data;
  private int size;
  private static final int DEFAULT_CAPACITY = 10;

  public MyHeap() {
    this.data = new Object[DEFAULT_CAPACITY];
  }

  public MyHeap(E[] arr) {
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

  public void add(E e) {
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

Halda je:

* speciální téměř úplný binární strom,
* nejčastěji implementovaný polem,
* velmi vhodný pro rychlý přístup k minimu nebo maximu,
* základem prioritní fronty.

U **binární min-heapu** platí:

* minimum je vždy v kořeni,
* `peek()` je  **O(1)** ,
* `add()` a `poll()` jsou  **O(log n)** ,
* `buildHeap()` je  **O(n)** .
