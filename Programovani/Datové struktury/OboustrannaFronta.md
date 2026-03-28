# Oboustranná fronta - Deque

## Formální definice

**Deque** (*double-ended queue*) je abstraktní datový typ, který podporuje **vkládání i odebírání na obou koncích** sekvence. Má dvě hrany:

* **předek** (*front/head*) – operace `addFirst`, `removeFirst`, `peekFirst`
* **zadek** (*back/tail*) – operace `addLast`, `removeLast`, `peekLast`

Dequeue (odebrání) vrací prvek a zároveň zmenší velikost sekvence.

## Rozhraní a základní operace

Minimální API:

* Vkládání: `addFirst(x)`, `addLast(x)`
* Odebírání: `removeFirst()`, `removeLast()` (výjimka při prázdnu)
* Bezvýjimkové: `offerFirst(x)`, `offerLast(x)`, `pollFirst()`, `pollLast()` (vrací `null`)
* Náhled: `peekFirst()`, `peekLast()`
* Stav: `isEmpty()`, `size()`, `clear()`

K Deque se často přidává **stackové API**: `push(x)` ≙ `addFirst(x)`, `pop()` ≙ `removeFirst()`.

## Složitost a amortizace

Cílem dobré implementace je, aby tyto operace měly:

* **Amortizovaně O(1)** pro `addFirst/addLast` (díky „růstu po blocích“ u pole),
* **O(1)** pro `removeFirst/removeLast/peekFirst/peekLast`.

**Amortizace**: Pokud při vkládání občas dojde k **zvětšení kapacity** (reálné kopírování všech prvků je O(n)), rozpočítáme tuto „drahou“ operaci na velký počet předchozích levných vložení. Při geometrickém růstu (typicky 2×) vychází průměr na vložení **konstantní**.

## Implementační varianty

### 1) Kruhový buffer (pole)

* Vnitřně držíme **pole** a dva indexy: `head` (ukazuje na **první** prvek), `tail` (ukazuje na **pozici za posledním**).
* Indexy se „otáčejí“ po kruhu: inkrement/dekrement s **mod** kapacitou.
* Výhody:

  * minimální paměťová režie (žádné ukazatele v uzlech),
  * skvělá **cache lokalita** (prvky v poli),
  * **konstantní** (amort.) časy na obou koncích.
* Nevýhody:

  * občasná **realokace** a **kopie** prvků při růstu,
  * při explicitním „zmenšení“ je třeba kopírovat (volitelná optimalizace).

### 2) Spojový seznam (dvousměrný)

* Každý uzel: `prev`, `item`, `next`.
* Okrajové operace O(1) bez amortizace, žádná realokace.
* Nevýhody:

  * vyšší paměťová režie (2 odkazy/uzel),
  * horší cache lokalita, více alokací GC,
  * reálná rychlost v praxi často horší než pole.

**V JCF**: `ArrayDeque<E>` používá **kruhové pole** (rychlé), `LinkedList<E>` je spoják (větší overhead).

## Indexování a maskování (rychlá aritmetika)

Pokud držíme kapacitu jako **mocninu 2**, můžeme modulo implementovat bitovou maskou:

* `i % capacity ≙ i & (capacity - 1)`
  To je důvod, proč `ArrayDeque` i naše implementace zvětšují kapacitu **na dvojnásobek**.

## Invarianta správnosti

* `0 ≤ size ≤ data.length`
* `head` a `tail` jsou **vždy** v rozsahu `[0, data.length)`.
* **Prázdný** deque: `size == 0` ⇒ `head == tail` (ale neimplikuje to, že pole je nulové).
* **Obsazený** deque: prvek na čele je v `data[head]`, poslední prvek je v `data[(tail-1) & mask]`.

## Růst kapacity (re-layout)

* Při `size == data.length` navýšíme kapacitu (typicky **2×**).
* Překopírujeme `size` prvků **v logickém pořadí** (od `head` po `tail-1`) na začátek nového pole.
* Nastavíme `head = 0`, `tail = size`.

Tento re-layout zachovává **pořadí** a poskytuje amortizaci O(1) na vkládání.

## Paměť a GC

* Při odebrání prvku **vynulujeme** slot v poli, aby se uvolnila reference (GC-friendly).
* `clear()` vynuluje všechna obsazená místa a resetuje indexy.

## Bezpečnost a výjimky

* `removeFirst/Last` na prázdném deku → `NoSuchElementException`.
* Bezvýjimkové varianty (`poll*`, `peek*`) vrací `null` pro prázdný stav.

## Thread-safety

* Základní `Deque` **není** thread-safe.
  Pokud potřebuješ **producent–konzument**, použij:

  * `LinkedBlockingDeque` (blokující s kapacitou),
  * nebo obal synchronizací (hrubá, ale jednoduchá),
  * případně lock-free/MPMC struktury (pokročilé).

## Typické použití a idiomy

* **Náhrada `Stack`**: `push/pop/peek` → pracuj s předkem (`addFirst/removeFirst/peekFirst`).
* **BFS/DFS**:

  * BFS = `addLast` + `removeFirst` (klasická fronta),
  * DFS = `push` + `pop` (stack na Deque).
* **Sliding window** & **monotónní deque**: udržuj v deku kandidáty v monotónním pořadí (např. pro maximum v okně O(n)).
* **LRU**: v praxi spíš `LinkedHashMap` (má pořadí dle přístupu), ale pro jednodušší buffery stačí i Deque.

## Porovnání s `ArrayDeque` (JDK)

* `ArrayDeque` má velmi podobný design (kruhový buffer, mocniny 2, bitové maskování).
* Neumožňuje `null` prvky (kvůli odlišení „prázdného slotu“); v naší ukázce je `null` tolerován pro zjednodušení.
* Je **nesynchronizovaná** (pro výkon).

# Implementace po krocích – kruhové pole (stejné jako minule)

> Třída `MyDeque<E>`: kruhový buffer s kapacitou jako mocnina 2. Všechny okrajové operace jsou O(1) (amort. pro vkládání).

### 1) Stav a konstrukce

```java
public class MyDeque<E> {
  private Object[] data;
  private int head; // index prvního prvku
  private int tail; // index za posledním prvkem
  private int size;
  private static final int MIN_CAP = 8;

  public MyDeque() {
    data = new Object[MIN_CAP]; // 8 = mocnina 2
  }

  public int size() { return size; }
  public boolean isEmpty() { return size == 0; }

  private int mask() { return data.length - 1; }
}
```

### 2) Vkládání na obou koncích

```java
public void addFirst(E e) {
  ensureCapacity(size + 1);
  head = (head - 1) & mask();
  data[head] = e;
  size++;
}

public void addLast(E e) {
  ensureCapacity(size + 1);
  data[tail] = e;
  tail = (tail + 1) & mask();
  size++;
}
```

### 3) Odebírání na obou koncích

```java
@SuppressWarnings("unchecked")
public E removeFirst() {
  if (size == 0) throw new java.util.NoSuchElementException();
  E val = (E) data[head];
  data[head] = null;
  head = (head + 1) & mask();
  size--;
  return val;
}

@SuppressWarnings("unchecked")
public E removeLast() {
  if (size == 0) throw new java.util.NoSuchElementException();
  tail = (tail - 1) & mask();
  E val = (E) data[tail];
  data[tail] = null;
  size--;
  return val;
}
```

### 4) Náhled bez odebrání

```java
@SuppressWarnings("unchecked")
public E peekFirst() {
  return size == 0 ? null : (E) data[head];
}

@SuppressWarnings("unchecked")
public E peekLast() {
  return size == 0 ? null : (E) data[(tail - 1) & mask()];
}
```

### 5) Zajištění kapacity (2×, stabilní pořadí)

```java
private void ensureCapacity(int min) {
  if (min <= data.length) return;

  int newCap = data.length << 1;       // 2×
  while (newCap < min) newCap <<= 1;   // držet mocninu 2

  Object[] nd = new Object[newCap];
  // přenést size prvků v logickém pořadí: head..tail
  for (int i = 0; i < size; i++) {
    nd[i] = data[(head + i) & mask()];
  }
  data = nd;
  head = 0;
  tail = size;
}
```

### 6) Vyprázdnění / zmenšení

```java
public void clear() {
  for (int i = 0; i < size; i++) {
    data[(head + i) & mask()] = null;
  }
  head = tail = size = 0;
}

public void trimToSize() {
  if (size == data.length) return;
  ensureCapacity(size == 0 ? MIN_CAP : size);
}
```

# Úplná „kapesní“ implementace (vcelku)

```java
import java.util.NoSuchElementException;

public class MyDeque<E> {
  private Object[] data;
  private int head; // index prvního prvku
  private int tail; // index za posledním prvkem
  private int size;
  private static final int MIN_CAP = 8;

  public MyDeque() {
    data = new Object[MIN_CAP]; // kapacita = mocnina 2
  }

  public int size() { return size; }
  public boolean isEmpty() { return size == 0; }

  private int mask() { return data.length - 1; }

  // --- vkládání ---
  public void addFirst(E e) {
    ensureCapacity(size + 1);
    head = (head - 1) & mask();
    data[head] = e;
    size++;
  }

  public void addLast(E e) {
    ensureCapacity(size + 1);
    data[tail] = e;
    tail = (tail + 1) & mask();
    size++;
  }

  // aliasy pro queue/stack styl (volitelné)
  public void push(E e) { addFirst(e); } // stack LIFO
  public void offerFirst(E e) { addFirst(e); }
  public void offerLast(E e) { addLast(e); }

  // --- odebírání ---
  @SuppressWarnings("unchecked")
  public E removeFirst() {
    if (size == 0) throw new NoSuchElementException();
    E val = (E) data[head];
    data[head] = null;
    head = (head + 1) & mask();
    size--;
    return val;
  }

  @SuppressWarnings("unchecked")
  public E removeLast() {
    if (size == 0) throw new NoSuchElementException();
    tail = (tail - 1) & mask();
    E val = (E) data[tail];
    data[tail] = null;
    size--;
    return val;
  }

  @SuppressWarnings("unchecked")
  public E pop() { // stack LIFO z čela
    return removeFirst();
  }

  public E pollFirst() { return isEmpty() ? null : removeFirst(); }
  public E pollLast()  { return isEmpty() ? null : removeLast(); }

  // --- náhled ---
  @SuppressWarnings("unchecked")
  public E peekFirst() {
    return size == 0 ? null : (E) data[head];
  }

  @SuppressWarnings("unchecked")
  public E peekLast() {
    return size == 0 ? null : (E) data[(tail - 1) & mask()];
  }

  // --- údržba ---
  public void clear() {
    for (int i = 0; i < size; i++) {
      data[(head + i) & mask()] = null;
    }
    head = tail = size = 0;
  }

  public void trimToSize() {
    if (size == data.length) return;
    ensureCapacity(size == 0 ? MIN_CAP : size);
  }

  // --- pomocné ---
  private void ensureCapacity(int min) {
    if (min <= data.length) return;
    int newCap = data.length << 1;         // 2× růst
    while (newCap < min) newCap <<= 1;     // držet mocninu 2

    Object[] nd = new Object[newCap];
    for (int i = 0; i < size; i++) {
      nd[i] = data[(head + i) & (data.length - 1)];
    }
    data = nd;
    head = 0;
    tail = size;
  }
}
```