# Jednosměrný spojový seznam – Singly Linked List (SLL)

## Popis datové struktury

**Jednosměrný spojový seznam** je sekvence **uzlů** (angl. *nodes*). Každý uzel nese:

* **data** (hodnotu, např. `E item`)
* **odkaz na další uzel** (`next`)

Seznam typicky udržuje ukazatel na **první uzel** (*head*). Často se navíc udržuje i **poslední uzel** (*tail*) kvůli **O(1) vložení na konec**.

## Základní operace a intuitivní složitosti

* **`addFirst` / `removeFirst`** – práce s čelem v **O(1)**.
* **`addLast`** – v **O(1)**, pokud udržujeme `tail`, jinak **O(n)** (musíme projít na konec).
* **`get(i)`, `set(i,x)`** – **O(n)** (chybí náhodný přístup; musíme projít `i` uzlů).
* **`add(i,x)`, `remove(i)`** – **O(n)** (nejprve najít předchůdce).
* **`contains(x)`, `indexOf(x)`** – **O(n)** (lineární hledání).
* **Paměť** – každý uzel = samostatný objekt s jedním odkazem `next` (větší režie než pole).

## Kdy se hodí

* Když často **vkládáš/mažeš na začátku** (`addFirst/removeFirst`) nebo **za známým uzlem** (máš-li ukazatel na předchůdce).
* Pro **streamované** scénáře, kdy nepotřebuješ náhodný přístup a velikost roste/průběžně se mění.

## Kompromisy proti poli/dynamickému poli

* **Proti poli/dynamickému poli (`ArrayList`)**:

  * Rychlé **O(1)** operace na začátku a po známém uzlu.
  * **Žádný náhodný přístup** (všechno je průchod), horší **cache lokalita**, vyšší **GC/alokace**.
  * V praxi bývá i sekvenční průchod pomalejší kvůli pointer chasingu.

## Důležité implementační detaily

* **`size`**: počítadlo prvků je praktické udržovat průběžně (O(1) získání velikosti).
* **`tail`**: doporučeno – výrazně zrychlí `addLast`.
* **Sentinel (strážce)**: někdy se používá *dummy head* pro zjednodušení okrajů (my níže ukážeme bez sentinelu, pro čitelnost).
* **Mazání**: pro smazání uzlu na indexu `i` musíme znát **předchozí uzel** (`i-1`), abychom uměli přepojit `next`.
* **Vyprázdnění**: doporučujeme uzlům explicitně nulovat `item` i `next` (pomoc GC).

# Implementace po krocích (Java)

> Třída `MySinglyLinkedList<E>` se stavem: `Node<E> head`, `Node<E> tail`, `int size`. Uzel: `E item`, `Node<E> next`.

### 1) Uzel, stav a metriky

```java
private static final class Node<E> {
  E item;
  Node<E> next;
  Node(E item, Node<E> next) { this.item = item; this.next = next; }
}

private Node<E> head; // první uzel
private Node<E> tail; // poslední uzel (kvůli O(1) addLast)
private int size;

public int size() { return size; }
public boolean isEmpty() { return size == 0; }
```

### 2) Přidání na začátek / konec

```java
public void addFirst(E e) {
  Node<E> n = new Node<>(e, head);
  head = n;
  if (tail == null) tail = n;
  size++;
}

public void addLast(E e) {
  Node<E> n = new Node<>(e, null);
  if (tail == null) { head = tail = n; }
  else { tail.next = n; tail = n; }
  size++;
}
```

### 3) Získání a nastavení hodnoty podle indexu (O(n))

```java
private void checkIndex(int index) {
  if (index < 0 || index >= size) throw new IndexOutOfBoundsException();
}

private Node<E> nodeAt(int index) {
  Node<E> cur = head;
  for (int i = 0; i < index; i++) cur = cur.next;
  return cur;
}

public E get(int index) {
  checkIndex(index);
  return nodeAt(index).item;
}

public E set(int index, E element) {
  checkIndex(index);
  Node<E> n = nodeAt(index);
  E old = n.item;
  n.item = element;
  return old;
}
```

### 4) Vložení na libovolný index (O(n))

```java
public void add(int index, E e) {
  if (index < 0 || index > size) throw new IndexOutOfBoundsException();

  if (index == 0) { addFirst(e); return; }
  if (index == size) { addLast(e); return; }

  Node<E> prev = nodeAt(index - 1);
  Node<E> n = new Node<>(e, prev.next);
  prev.next = n;
  size++;
}
```

### 5) Odebrání z čela / z konce

```java
public E removeFirst() {
  if (head == null) throw new java.util.NoSuchElementException();
  E val = head.item;
  head = head.next;
  if (head == null) tail = null; // byl tam 1 prvek
  size--;
  return val;
}

// removeLast je O(n) – musíme najít předposlední
public E removeLast() {
  if (head == null) throw new java.util.NoSuchElementException();
  if (head == tail) { // jediný prvek
    E val = head.item;
    head = tail = null;
    size--;
    return val;
  }
  Node<E> prev = head;
  while (prev.next != tail) prev = prev.next;
  E val = tail.item;
  tail = prev;
  tail.next = null;
  size--;
  return val;
}
```

### 6) Odebrání na indexu / podle hodnoty

```java
public E remove(int index) {
  checkIndex(index);
  if (index == 0) return removeFirst();

  Node<E> prev = nodeAt(index - 1);
  Node<E> target = prev.next;        // existuje, protože index je platný
  prev.next = target.next;           // přeskok
  if (target == tail) tail = prev;   // aktualizace tailu
  size--;
  return target.item;
}

public boolean remove(Object o) {
  if (head == null) return false;

  if (o == null ? head.item == null : o.equals(head.item)) {
    removeFirst();
    return true;
  }

  Node<E> prev = head, cur = head.next;
  while (cur != null) {
    if (o == null ? cur.item == null : o.equals(cur.item)) {
      prev.next = cur.next;
      if (cur == tail) tail = prev;
      size--;
      return true;
    }
    prev = cur; cur = cur.next;
  }
  return false;
}
```

### 7) Hledání a test členství

```java
public int indexOf(Object o) {
  int i = 0;
  for (Node<E> cur = head; cur != null; cur = cur.next, i++) {
    if (o == null ? cur.item == null : o.equals(cur.item)) return i;
  }
  return -1;
}

public boolean contains(Object o) { return indexOf(o) >= 0; }
```

### 8) Vyprázdnění (GC-friendly)

```java
public void clear() {
  Node<E> cur = head;
  while (cur != null) {
    Node<E> next = cur.next;
    cur.item = null;  // uvolnit reference
    cur.next = null;
    cur = next;
  }
  head = tail = null;
  size = 0;
}
```

# Úplná „kapesní“ implementace (vcelku)

```java
import java.util.NoSuchElementException;

public class MySinglyLinkedList<E> {
  private static final class Node<E> {
    E item;
    Node<E> next;
    Node(E item, Node<E> next) { this.item = item; this.next = next; }
  }

  private Node<E> head;
  private Node<E> tail;
  private int size;

  public int size() { return size; }
  public boolean isEmpty() { return size == 0; }

  // --- interní pomocníci ---
  private void checkIndex(int index) {
    if (index < 0 || index >= size) throw new IndexOutOfBoundsException();
  }
  private Node<E> nodeAt(int index) {
    Node<E> cur = head;
    for (int i = 0; i < index; i++) cur = cur.next;
    return cur;
  }

  // --- přístup ---
  public E get(int index) {
    checkIndex(index);
    return nodeAt(index).item;
  }
  public E set(int index, E element) {
    checkIndex(index);
    Node<E> n = nodeAt(index);
    E old = n.item;
    n.item = element;
    return old;
  }

  // --- vkládání ---
  public void addFirst(E e) {
    Node<E> n = new Node<>(e, head);
    head = n;
    if (tail == null) tail = n;
    size++;
  }
  public void addLast(E e) {
    Node<E> n = new Node<>(e, null);
    if (tail == null) { head = tail = n; }
    else { tail.next = n; tail = n; }
    size++;
  }
  public void add(int index, E e) {
    if (index < 0 || index > size) throw new IndexOutOfBoundsException();
    if (index == 0) { addFirst(e); return; }
    if (index == size) { addLast(e); return; }
    Node<E> prev = nodeAt(index - 1);
    Node<E> n = new Node<>(e, prev.next);
    prev.next = n;
    size++;
  }

  // --- odebírání ---
  public E removeFirst() {
    if (head == null) throw new NoSuchElementException();
    E val = head.item;
    head = head.next;
    if (head == null) tail = null;
    size--;
    return val;
  }
  public E removeLast() {
    if (head == null) throw new NoSuchElementException();
    if (head == tail) {
      E val = head.item;
      head = tail = null;
      size--;
      return val;
    }
    Node<E> prev = head;
    while (prev.next != tail) prev = prev.next;
    E val = tail.item;
    tail = prev;
    tail.next = null;
    size--;
    return val;
  }
  public E remove(int index) {
    checkIndex(index);
    if (index == 0) return removeFirst();
    Node<E> prev = nodeAt(index - 1);
    Node<E> target = prev.next;
    prev.next = target.next;
    if (target == tail) tail = prev;
    size--;
    return target.item;
  }
  public boolean remove(Object o) {
    if (head == null) return false;
    if (o == null ? head.item == null : o.equals(head.item)) {
      removeFirst();
      return true;
    }
    Node<E> prev = head, cur = head.next;
    while (cur != null) {
      if (o == null ? cur.item == null : o.equals(cur.item)) {
        prev.next = cur.next;
        if (cur == tail) tail = prev;
        size--;
        return true;
      }
      prev = cur; cur = cur.next;
    }
    return false;
  }

  // --- hledání ---
  public int indexOf(Object o) {
    int i = 0;
    for (Node<E> cur = head; cur != null; cur = cur.next, i++) {
      if (o == null ? cur.item == null : o.equals(cur.item)) return i;
    }
    return -1;
  }
  public boolean contains(Object o) { return indexOf(o) >= 0; }

  // --- čištění ---
  public void clear() {
    Node<E> cur = head;
    while (cur != null) {
      Node<E> next = cur.next;
      cur.item = null; cur.next = null;
      cur = next;
    }
    head = tail = null;
    size = 0;
  }
}
```
