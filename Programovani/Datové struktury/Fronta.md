
# Fronta – Queue

## Co je fronta

Definice: **Fronta** je lineární datová struktura, která dodržuje princip **FIFO** (*first-in, first-out*). To znamená, že prvky jsou přidávány na konec fronty a odebírány z jejího začátku.


**Fronta** je sekvenční datová struktura s disciplínou **FIFO** (*first-in, first-out*):
vkládáš na **konec** (*enqueue/offer*), odebíráš z **čela** (*dequeue/poll*).
Základní operace:

* `enqueue`/`offer(x)` – přidá prvek na konec,
* `dequeue`/`poll()` – odebere a vrátí prvek z čela,
* `peek()` – nahlédne na čelo bez odebrání,
* `isEmpty()`, `size()` – stav.

V Javě rozhraní `Queue<E>` definuje dvojice **výjimečných** vs. **bezvýjimečných** metod:

* vkládání: `add` (háže výjimku při selhání) / `offer` (vrací `false`/`true`),
* odebírání: `remove` (výjimka na prázdnu) / `poll` (vrací `null`),
* nahlédnutí: `element` (výjimka) / `peek` (null).

## Typické implementace

1. **Kruhový buffer** (pole a dva ukazatele)

   * `head` ukazuje na **první** prvek, `tail` na **místo za posledním**.
   * Indexy se točí modulo kapacita; při zaplnění se pole **zvětší** (např. 2×) a prvky se překopírují v logickém pořadí.
   * Výhody: minimální režie, výborná cache-lokalita, nejrychlejší v praxi.
2. **Spojový seznam** (uzly `next`)

   * Snadné rozšiřování bez realokací; `enqueue`/`dequeue` v O(1) s ukazateli na hlavu/ocas.
   * Nevýhody: vyšší paměťová režie a horší reálný výkon kvůli alokacím/pointer-chasingu.

## Složitosti

* `offer`, `poll`, `peek` → **O(1)** (u pole amortizovaně kvůli občasnému resize).
* `size`, `isEmpty` → **O(1)**.
* Paměť: **O(n)**.

**Amortizace (u pole):** zvětšení kapacity je O(n), ale děje se zřídka (geometrický růst), proto průměr na operaci zůstává **konstantní**.

## Volba růstu kapacity

* **2×** (mocniny 2) → méně resize, rychlejší, více „vzduchu“.
* ~**1.5×** → úspornější paměť, více resize.
  Pro deky/queue se často používá **2×** + kapacita jako **mocnina 2**, aby se dalo indexovat maskou `& (cap-1)`.

## Thread-safety a blokování

* Základní implementace **nejsou** thread-safe.
* Pro producent–konzument vzory použij `BlockingQueue` (`ArrayBlockingQueue`, `LinkedBlockingQueue`, `SynchronousQueue`) nebo synchronizaci.

## Kdy frontu použít

* **BFS** v grafech, **zpracování událostí**, **plánování úloh**, **pipeline** a **producer–consumer**.

# Implementace po krocích – kruhové pole s růstem

> Třída `MyArrayQueue<E>`: `Object[] data`, index **čela** `head`, index **za posledním** `tail` (obojí v [0..cap)), `size`. Kapacitu zvětšujeme **2×** a zachováme pořadí.

### 1) Stav a konstrukce

```java
private Object[] data;
private int head;   // index prvního prvku (čelo)
private int tail;   // index pozice za posledním (konec)
private int size;
private static final int MIN_CAP = 8;

public MyArrayQueue() { data = new Object[MIN_CAP]; }

public int size()    { return size; }
public boolean isEmpty() { return size == 0; }
private int mask()   { return data.length - 1; } // pokud kapacita = mocnina 2
```

### 2) Vkládání na konec – `offer` (O(1) amort.)

```java
public void offer(E e) {
  ensureCapacity(size + 1);
  data[tail] = e;
  tail = (tail + 1) & mask();
  size++;
}
```

### 3) Odebrání z čela – `poll` (O(1))

```java
@SuppressWarnings("unchecked")
public E poll() {
  if (size == 0) return null;
  E val = (E) data[head];
  data[head] = null;                   // uvolnit referenci pro GC
  head = (head + 1) & mask();
  size--;
  return val;
}
```

### 4) Náhled – `peek` (O(1))

```java
@SuppressWarnings("unchecked")
public E peek() {
  return size == 0 ? null : (E) data[head];
}
```

### 5) Výjimečné varianty (volitelné)

```java
public void add(E e) { offer(e); } // v jednoduché verzi necháme bez výjimek

public E remove() {
  E x = poll();
  if (x == null) throw new java.util.NoSuchElementException();
  return x;
}

public E element() {
  E x = peek();
  if (x == null) throw new java.util.NoSuchElementException();
  return x;
}
```

### 6) Zajištění kapacity (2×, stabilní pořadí)

```java
private void ensureCapacity(int min) {
  if (min <= data.length) return;

  int newCap = data.length << 1;          // 2×
  while (newCap < min) newCap <<= 1;      // držet mocninu 2

  Object[] nd = new Object[newCap];
  // Přeneseme prvky v logickém FIFO pořadí do začátku nového pole
  for (int i = 0; i < size; i++) {
    nd[i] = data[(head + i) & mask()];
  }
  data = nd;
  head = 0;
  tail = size;
}
```

### 7) Vyprázdnění a (volitelné) zmenšení

```java
public void clear() {
  for (int i = 0; i < size; i++) {
    data[(head + i) & mask()] = null;
  }
  head = tail = size = 0;
}

public void trimToSize() {
  if (size == data.length) return;
  ensureCapacity(Math.max(size, MIN_CAP)); // relayout na menší pole
}
```

## Alternativa – spojová implementace (stručné jádro)

> Bez realokací, O(1) okrajové operace s ukazateli.

```java
private static final class Node<E> {
  E item; Node<E> next;
  Node(E item) { this.item = item; }
}
private Node<E> head, tail;
private int size;

public void offer(E e) {
  Node<E> n = new Node<>(e);
  if (tail == null) head = tail = n;
  else { tail.next = n; tail = n; }
  size++;
}

public E poll() {
  if (head == null) return null;
  E v = head.item;
  head = head.next;
  if (head == null) tail = null;
  size--;
  return v;
}

public E peek() { return head == null ? null : head.item; }
```

# Úplná „kapesní“ implementace (kruhový buffer, vcelku)

```java
import java.util.NoSuchElementException;

public class MyArrayQueue<E> {
  private Object[] data;
  private int head; // index čela (na prvek)
  private int tail; // index za posledním
  private int size;
  private static final int MIN_CAP = 8;

  public MyArrayQueue() {
    data = new Object[MIN_CAP]; // kapacita je mocnina 2
  }

  public int size() { return size; }
  public boolean isEmpty() { return size == 0; }

  private int mask() { return data.length - 1; }

  // --- základní API (bezvýjimečné varianty) ---
  public void offer(E e) {
    ensureCapacity(size + 1);
    data[tail] = e;
    tail = (tail + 1) & mask();
    size++;
  }

  @SuppressWarnings("unchecked")
  public E poll() {
    if (size == 0) return null;
    E val = (E) data[head];
    data[head] = null;
    head = (head + 1) & mask();
    size--;
    return val;
  }

  @SuppressWarnings("unchecked")
  public E peek() {
    return size == 0 ? null : (E) data[head];
  }

  // --- volitelné „výjimečné“ aliasy, aby to připomínalo Queue z JDK ---
  public void add(E e) { offer(e); }
  public E remove() {
    E x = poll();
    if (x == null) throw new NoSuchElementException();
    return x;
  }
  public E element() {
    E x = peek();
    if (x == null) throw new NoSuchElementException();
    return x;
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
    ensureCapacity(Math.max(size, MIN_CAP));
  }

  // --- pomocné ---
  private void ensureCapacity(int min) {
    if (min <= data.length) return;

    int newCap = data.length << 1;       // 2×
    while (newCap < min) newCap <<= 1;   // držet mocninu 2

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

