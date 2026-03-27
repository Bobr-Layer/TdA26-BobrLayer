# Obousměrný spojový seznam –  Doubly Linked List (DLL)

## Co to je

**Dvousměrný spojový seznam** je sekvence **uzlů**, kde každý uzel nese:

* **data** (hodnotu, např. `E item`)
* **odkaz na předchozí uzel** (`prev`)
* **odkaz na následující uzel** (`next`)

Struktura udržuje ukazatele na **první uzel** (*head*) a **poslední uzel** (*tail*), díky čemuž umí v **O(1)** vkládat/odebírat na obou koncích. Oproti jednosměrnému seznamu umožňuje **O(1)** odpojení uzlu i bez znalosti jeho předchůdce (pokud máme přímý ukazatel na uzel).

## Základní operace a složitosti

* **Okraje (obě strany):**
  `addFirst`, `addLast`, `removeFirst`, `removeLast` → **O(1)**
* **Uvnitř seznamu (bez indexu):**
  Máš-li **ukazatel na uzel** (nebo jeho předchůdce/následníka), vložení či odpojení je **O(1)** (jen přepojení `prev/next`).
* **Podle indexu:**
  `get(i)`, `set(i,x)`, `add(i,x)`, `remove(i)` → **O(n)** (musí se najít uzel; optimalizace: začni z bližšího konce).
* **Hledání hodnoty:**
  `contains(x)`, `indexOf(x)`, `lastIndexOf(x)` → **O(n)**.
* **Paměť:**
  Větší režie než u jednosměrného seznamu (dva odkazy/uzel), ale snadnější lokální operace.

## Kdy se hodí

* Když často pracuješ na **obou koncích** (Deque chování).
* Když často **odebíráš/vkládáš uprostřed** za známým uzlem (např. udržuješ iterátor/ukazatel).
* Když chceš **rychlé remove** bez lineárního hledání předchůdce (máš-li přímý uzel).

## Porovnání s alternativami

* **Proti jednosměrnému seznamu:** + symetrie operací, + rychlé odpojování známého uzlu, − vyšší paměťová režie, − složitější konzistence ukazatelů.
* **Proti dynamickému poli (`ArrayList`):** + rychlé vkládání/mazání na okrajích/za uzlem, − žádný náhodný přístup, − horší cache lokalita, − obvykle pomalejší sekvenčně kvůli pointer chasingu.
* **Deque v JCF:** `LinkedList<E>` implementuje `Deque`, ale pro rychlost/paměť je často lepší `ArrayDeque` (kruhové pole), pokud nepotřebuješ ukazatele na uzly.

## Implementační detaily a invarianta

* Každý uzel musí udržovat **konzistentně** `prev` ↔ `next`.
* **Prázdný** seznam: `head == null && tail == null`, `size == 0`.
* **Jeden prvek:** `head == tail`, `head.prev == null`, `tail.next == null`.
* Při odpojování uzlu **vynuluj reference** (`item`, `prev`, `next`) → pomůže GC a sníží riziko náhodného použití.

## Sentinel (strážce) vs. bez sentinelu

* **Se sentinel** (fiktivní `header` s kruhovými odkazy) zjednodušuje okraje (méně `if`), ale je hůř čitelný pro začátečníky.
* **Bez sentinelu** (níže): explicitně ošetřujeme prázdno/první/poslední.

# Implementace po krocích (Java)

> Třída `MyDoublyLinkedList<E>` se stavem: `Node<E> head`, `Node<E> tail`, `int size`. Uzel: `E item`, `Node<E> prev`, `Node<E> next`.
> Níže ukázky metod po částech; **kompletní třída** je na konci.

### 1) Uzel, stav, metriky

```java
private static final class Node<E> {
  E item;
  Node<E> prev;
  Node<E> next;
  Node(Node<E> prev, E item, Node<E> next) {
    this.prev = prev; this.item = item; this.next = next;
  }
}

private Node<E> head; // první
private Node<E> tail; // poslední
private int size;

public int size() { return size; }
public boolean isEmpty() { return size == 0; }
```

### 2) Přístup podle indexu (O(n), z bližšího konce)

```java
private void checkIndex(int index) {
  if (index < 0 || index >= size) throw new IndexOutOfBoundsException();
}
private void checkPositionIndex(int index) { // pro add na [0..size]
  if (index < 0 || index > size) throw new IndexOutOfBoundsException();
}

// vrátí uzel na indexu 0..size-1
private Node<E> node(int index) {
  if (index < (size >> 1)) {
    Node<E> x = head;
    for (int i = 0; i < index; i++) x = x.next;
    return x;
  } else {
    Node<E> x = tail;
    for (int i = size - 1; i > index; i--) x = x.prev;
    return x;
  }
}

public E get(int index) { checkIndex(index); return node(index).item; }

public E set(int index, E element) {
  checkIndex(index);
  Node<E> n = node(index);
  E old = n.item;
  n.item = element;
  return old;
}
```

### 3) Vkládání na okrajích (O(1))

```java
public void addFirst(E e) {
  final Node<E> f = head;
  final Node<E> newNode = new Node<>(null, e, f);
  head = newNode;
  if (f == null) tail = newNode;
  else f.prev = newNode;
  size++;
}

public void addLast(E e) {
  final Node<E> l = tail;
  final Node<E> newNode = new Node<>(l, e, null);
  tail = newNode;
  if (l == null) head = newNode;
  else l.next = newNode;
  size++;
}
```

### 4) Vložení na libovolný index (O(n) pro nalezení, spojení O(1))

```java
public void add(int index, E e) {
  checkPositionIndex(index);
  if (index == size) { addLast(e); return; }
  if (index == 0)    { addFirst(e); return; }
  linkBefore(e, node(index));
}

private void linkBefore(E e, Node<E> succ) { // vlož e před uzel succ
  final Node<E> pred = succ.prev;
  final Node<E> newNode = new Node<>(pred, e, succ);
  succ.prev = newNode;
  if (pred == null) head = newNode;
  else pred.next = newNode;
  size++;
}
```

### 5) Odebírání z okrajů (O(1))

```java
public E removeFirst() {
  if (head == null) throw new java.util.NoSuchElementException();
  return unlink(head);
}

public E removeLast() {
  if (tail == null) throw new java.util.NoSuchElementException();
  return unlink(tail);
}
```

### 6) Odebírání na indexu / podle hodnoty

```java
public E remove(int index) {
  checkIndex(index);
  return unlink(node(index));
}

public boolean remove(Object o) {
  for (Node<E> x = head; x != null; x = x.next) {
    if (o == x.item || (o != null && o.equals(x.item))) {
      unlink(x);
      return true;
    }
  }
  return false;
}
```

### 7) Hledání vpřed i vzad

```java
public int indexOf(Object o) {
  int i = 0;
  for (Node<E> x = head; x != null; x = x.next, i++) {
    if (o == x.item || (o != null && o.equals(x.item))) return i;
  }
  return -1;
}

public int lastIndexOf(Object o) {
  int i = size - 1;
  for (Node<E> x = tail; x != null; x = x.prev, i--) {
    if (o == x.item || (o != null && o.equals(x.item))) return i;
  }
  return -1;
}
```

### 8) Unlink uzlu (O(1)) + clear

```java
private E unlink(Node<E> x) {
  final E element = x.item;
  final Node<E> next = x.next;
  final Node<E> prev = x.prev;

  if (prev == null) head = next;
  else { prev.next = next; x.prev = null; }

  if (next == null) tail = prev;
  else { next.prev = prev; x.next = null; }

  x.item = null; // pomoz GC
  size--;
  return element;
}

public void clear() {
  for (Node<E> x = head; x != null; ) {
    Node<E> n = x.next;
    x.item = null; x.prev = null; x.next = null;
    x = n;
  }
  head = tail = null;
  size = 0;
}
```

# Úplná „kapesní“ implementace (vcelku)

```java
import java.util.NoSuchElementException;

public class MyDoublyLinkedList<E> {
  private static final class Node<E> {
    E item;
    Node<E> prev;
    Node<E> next;
    Node(Node<E> prev, E item, Node<E> next) {
      this.prev = prev; this.item = item; this.next = next;
    }
  }

  private Node<E> head;
  private Node<E> tail;
  private int size;

  public int size() { return size; }
  public boolean isEmpty() { return size == 0; }

  // --- indexování ---
  private void checkIndex(int index) {
    if (index < 0 || index >= size) throw new IndexOutOfBoundsException();
  }
  private void checkPositionIndex(int index) {
    if (index < 0 || index > size) throw new IndexOutOfBoundsException();
  }
  private Node<E> node(int index) {
    if (index < (size >> 1)) {
      Node<E> x = head;
      for (int i = 0; i < index; i++) x = x.next;
      return x;
    } else {
      Node<E> x = tail;
      for (int i = size - 1; i > index; i--) x = x.prev;
      return x;
    }
  }

  // --- přístup ---
  public E get(int index) { checkIndex(index); return node(index).item; }
  public E set(int index, E element) {
    checkIndex(index);
    Node<E> n = node(index);
    E old = n.item;
    n.item = element;
    return old;
  }

  // --- vkládání ---
  public void addFirst(E e) {
    final Node<E> f = head;
    final Node<E> newNode = new Node<>(null, e, f);
    head = newNode;
    if (f == null) tail = newNode;
    else f.prev = newNode;
    size++;
  }
  public void addLast(E e) {
    final Node<E> l = tail;
    final Node<E> newNode = new Node<>(l, e, null);
    tail = newNode;
    if (l == null) head = newNode;
    else l.next = newNode;
    size++;
  }
  public void add(int index, E e) {
    checkPositionIndex(index);
    if (index == size) { addLast(e); return; }
    if (index == 0)    { addFirst(e); return; }
    linkBefore(e, node(index));
  }
  private void linkBefore(E e, Node<E> succ) {
    final Node<E> pred = succ.prev;
    final Node<E> newNode = new Node<>(pred, e, succ);
    succ.prev = newNode;
    if (pred == null) head = newNode;
    else pred.next = newNode;
    size++;
  }

  // --- odebírání ---
  public E removeFirst() {
    if (head == null) throw new NoSuchElementException();
    return unlink(head);
  }
  public E removeLast() {
    if (tail == null) throw new NoSuchElementException();
    return unlink(tail);
  }
  public E remove(int index) {
    checkIndex(index);
    return unlink(node(index));
  }
  public boolean remove(Object o) {
    for (Node<E> x = head; x != null; x = x.next) {
      if (o == x.item || (o != null && o.equals(x.item))) {
        unlink(x);
        return true;
      }
    }
    return false;
  }

  // --- hledání ---
  public int indexOf(Object o) {
    int i = 0;
    for (Node<E> x = head; x != null; x = x.next, i++) {
      if (o == x.item || (o != null && o.equals(x.item))) return i;
    }
    return -1;
  }
  public int lastIndexOf(Object o) {
    int i = size - 1;
    for (Node<E> x = tail; x != null; x = x.prev, i--) {
      if (o == x.item || (o != null && o.equals(x.item))) return i;
    }
    return -1;
  }
  public boolean contains(Object o) { return indexOf(o) >= 0; }

  // --- čištění ---
  public void clear() {
    for (Node<E> x = head; x != null; ) {
      Node<E> n = x.next;
      x.item = null; x.prev = null; x.next = null;
      x = n;
    }
    head = tail = null;
    size = 0;
  }

  // --- pomocné ---
  private E unlink(Node<E> x) {
    final E element = x.item;
    final Node<E> next = x.next;
    final Node<E> prev = x.prev;

    if (prev == null) head = next;
    else { prev.next = next; x.prev = null; }

    if (next == null) tail = prev;
    else { next.prev = prev; x.next = null; }

    x.item = null;
    size--;
    return element;
  }
}
```