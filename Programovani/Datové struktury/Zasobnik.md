# Zásobník – Stack

## Co je zásobník

**Zásobník** je sekvenční struktura s implementací **LIFO** (*last-in, first-out*):

* vkládáš na **vrchol**: `push(x)`,
* odebíráš z **vrcholu**: `pop()`,
* nahlížíš na vrchol: `peek()`.

Typické je i `isEmpty()`, `size()`, `clear()`.

## Použití (k čemu se hodí)

* **Rekurze & návratové adresy** (volací zásobník),
* **Parsování výrazů**, vyhodnocování **RPN** (Reverse Polish Notation),
* **Backtracking** (DFS, labyrinty, sudoku),
* **Undo/Redo** (historie operací),
* **Kontrola závorek**, shoda páru „otevři–zavři“.

## Složitosti

* `push`, `pop`, `peek` → **O(1)** (u pole amortizovaně kvůli růstu).
* `size`, `isEmpty` → **O(1)**.
* Paměť → **O(n)**.

## Implementační varianty

1. **Pole (dynamický buffer)**

   * vnitřní `Object[] data` + index vrcholu `top` (počítáme počet prvků),
   * **rychlé**, výborná cache-lokalita,
   * při zaplnění **zvětšíme kapacitu** (geometricky, typicky 2× nebo ~1.5×).
2. **Spojový seznam**

   * uzly `Node(item,next)`, `head` je vrchol,
   * jednoduché `push/pop` v **O(1)** bez realokací,
   * vyšší režie (alokace uzlů, horší cache).

## Bezpečnost & chyby

* **Underflow**: `pop/peek` na prázdném zásobníku – buď vracej `null` (bezvýjimečná varianta), nebo vyhazuj `NoSuchElementException`.
* **Overflow**: u dynamického pole prakticky nehrozí (zvětší se), u pevného pole by `push` selhal.

## Shrink (zmenšování)

* Volitelné: `trimToSize()` nebo automaticky, když je dlouhodobě málo prvků (pozor na thrashing). V ukázce přidáme manuální `trimToSize()`.

## Thread-safety

* Základní implementace **není** thread-safe. Pro souběh použij synchronizaci nebo specializované lock-free struktury.

## Implementace po krocích (Java) – **pole s dynamickým růstem**

> Třída `MyStack<E>`: `Object[] data`, `int size` (počet prvků). Vrchol je na indexu `size-1`.

### 1) Stav a konstrukce

```java
private Object[] data;
private int size;
private static final int DEFAULT_CAP = 8;

public MyStack() {
  data = new Object[DEFAULT_CAP];
}
public MyStack(int initialCapacity) {
  if (initialCapacity < 1) throw new IllegalArgumentException();
  data = new Object[initialCapacity];
}

public int size() { return size; }
public boolean isEmpty() { return size == 0; }
```

### 2) `push` – vložení na vrchol (O(1) amort.)

```java
public void push(E e) {
  ensureCapacity(size + 1);
  data[size++] = e;
}
```

### 3) `pop` – odebrání z vrcholu (O(1))

```java
@SuppressWarnings("unchecked")
public E pop() {
  if (size == 0) throw new java.util.NoSuchElementException();
  int i = --size;
  E val = (E) data[i];
  data[i] = null; // GC-friendly
  return val;
}
```

### 4) `peek` – nahlédnutí na vrchol (O(1))

```java
@SuppressWarnings("unchecked")
public E peek() {
  if (size == 0) throw new java.util.NoSuchElementException();
  return (E) data[size - 1];
}
```

### 5) `clear` a (volitelně) `trimToSize`

```java
public void clear() {
  for (int i = 0; i < size; i++) data[i] = null;
  size = 0;
}

public void trimToSize() {
  if (data.length == size) return;
  Object[] nd = new Object[Math.max(size, 1)];
  System.arraycopy(data, 0, nd, 0, size);
  data = nd;
}
```

### 6) Růst kapacity (geometricky)

```java
private void ensureCapacity(int min) {
  if (min <= data.length) return;
  int old = data.length;
  int newCap = old + (old >> 1); // ~1.5×
  if (newCap < min) newCap = min;
  Object[] nd = new Object[newCap];
  System.arraycopy(data, 0, nd, 0, size);
  data = nd;
}
```

---

## Alternativa – **spojový seznam** (stručná verze)

```java
private static final class Node<E> {
  E item; Node<E> next;
  Node(E item, Node<E> next) { this.item = item; this.next = next; }
}
private Node<E> head; // vrchol
private int size;

public void push(E e) {
  head = new Node<>(e, head);
  size++;
}

public E pop() {
  if (head == null) throw new java.util.NoSuchElementException();
  E v = head.item;
  Node<E> n = head.next;
  head.item = null; head.next = null;
  head = n;
  size--;
  return v;
}

public E peek() {
  if (head == null) throw new java.util.NoSuchElementException();
  return head.item;
}
```

## Mini-ukázky použití

```java
MyStack<Integer> st = new MyStack<>();
st.push(10);
st.push(20);
int top = st.peek();   // 20
int v1  = st.pop();    // 20
int v2  = st.pop();    // 10
boolean empty = st.isEmpty(); // true
```

# Úplná „kapesní“ implementace (vcelku, pole)

```java
import java.util.NoSuchElementException;

public class MyStack<E> {
  private Object[] data;
  private int size;
  private static final int DEFAULT_CAP = 8;

  public MyStack() {
    data = new Object[DEFAULT_CAP];
  }

  public MyStack(int initialCapacity) {
    if (initialCapacity < 1) throw new IllegalArgumentException("initialCapacity < 1");
    data = new Object[initialCapacity];
  }

  public int size() { return size; }
  public boolean isEmpty() { return size == 0; }

  public void push(E e) {
    ensureCapacity(size + 1);
    data[size++] = e;
  }

  @SuppressWarnings("unchecked")
  public E pop() {
    if (size == 0) throw new NoSuchElementException();
    int i = --size;
    E val = (E) data[i];
    data[i] = null; // GC-friendly
    return val;
  }

  @SuppressWarnings("unchecked")
  public E peek() {
    if (size == 0) throw new NoSuchElementException();
    return (E) data[size - 1];
  }

  public void clear() {
    for (int i = 0; i < size; i++) data[i] = null;
    size = 0;
  }

  public void trimToSize() {
    if (data.length == size) return;
    Object[] nd = new Object[Math.max(size, 1)];
    System.arraycopy(data, 0, nd, 0, size);
    data = nd;
  }

  // --- pomocné ---
  private void ensureCapacity(int min) {
    if (min <= data.length) return;
    int old = data.length;
    int newCap = old + (old >> 1); // ~1.5×
    if (newCap < min) newCap = min;
    Object[] nd = new Object[newCap];
    System.arraycopy(data, 0, nd, 0, size);
    data = nd;
  }
}
```
