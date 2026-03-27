# Množina – Set

## Co je množina

**Množina** je abstraktní datový typ reprezentující **kolekci unikátních prvků**. Základní otázky, na které odpovídá rychle:

* „Je prvek **členem**?“ → `contains(x)`
* „Přidej prvek, pokud tam není.“ → `add(x)`
* „Odstraň prvek, pokud tam je.“ → `remove(x)`

Na rozdíl od „seznamu“ neřeší pozice ani duplikáty; na rozdíl od „mapy“ nemá hodnoty — pouze prvky.

## Varianty a jejich vlastnosti

* **Hashová množina** (např. `HashSet`):

  * **Průměrně O(1)** pro `add/remove/contains`.
  * Pořadí **negarantuje**.
  * Spoléhá na `hashCode` a `equals`.
* **Uspořádaná hashová množina** (`LinkedHashSet`):

  * Zachovává **pořadí vložení** (nebo přístupu – LRU scénáře).
  * Časy zhruba jako `HashSet`, mírně vyšší režie.
* **Stromová množina** (`TreeSet` – Red–Black tree):

  * `add/remove/contains` v **O(log n)**.
  * **Seřazené** prvky dle `Comparable`/`Comparator`.
  * Umožňuje **range** operace (`subSet`, `ceiling`, `floor`…).

V této ukázce si postavíme **hashovou množinu**.

## Jak hashová množina funguje

* Drží vnitřní **pole bucketů** (věder).
* Každý prvek `e` dostane **hash** `h = spread(e.hashCode())`.
* **Index** do pole: `i = h & (capacity - 1)` (kapacita je mocnina 2).
* Pokud do stejného bucketu spadne víc prvků, řešíme **kolize**:

  * nejjednodušeji **řetězením** (každý bucket = jednosměrný seznam uzlů),
  * alternativně **open addressing** (sondování přímo v poli; složitější mazání).

## Unikátnost a kontrakt `equals`/`hashCode`

* **Unikátnost** určuje `equals`: pokud `a.equals(b)`, považují se za **jedno** `a`.
* **Konzistence**: pokud `a.equals(b)`, musí platit `a.hashCode()==b.hashCode()`.
* **Pozor na mutace**: měnit stav prvku ovlivňující `equals/hashCode` po vložení do setu je **nebezpečné** (prvek „ztratíš“).

## Load factor a resize

* **Load factor** `α = size/capacity` typicky **0.75**.
* Když `size > threshold = capacity * α`, zvětšíme kapacitu (obvykle **2×**) a **rehashujeme** prvky.
* Rehash je **O(n)**, ale zřídka → `add` má **amort. O(1)**.

## Pořadí a iterace

* Obyčejný `HashSet` **negarantuje** žádné pořadí.
* Potřebuješ-li stabilní pořadí, zvaž `LinkedHashSet`.
* Potřebuješ-li řazení a intervaly, zvaž `TreeSet`.

## Kdy Set použít / ne

**Použít**, když:

* Odstraňuješ **duplicity**.
* Potřebuješ rychlé „je/ne“ (členství).

**Ne**, když:

* Potřebuješ **seřazené** prvky či **range** → `TreeSet`.
* Potřebuješ **pořadí vložení** → `LinkedHashSet`.
* Potřebuješ **počty výskytů** → spíš `Map<E,Integer>` (multiset).


# Implementace po krocích — hashová množina (řetězení)

Budeme implementovat `MyHashSet<E>`: pole `Node<E>[] table` (mocnina 2), **řetězení** v bucketech, **loadFactor=0.75**, **resize 2×**. Metody: `add`, `remove`, `contains`, `size`, `clear`, `iterator`.

> Pro jednoduchost vynecháme fail-fast iterátor a speciální okraje (stromování bucketů atd.).

## 1) Stav, uzel, konstrukce

```java
private static final class Node<E> {
  final E item;
  Node<E> next;
  Node(E item, Node<E> next) { this.item = item; this.next = next; }
}

private Node<E>[] table; // pole bucketů
private int size;
private int threshold;
private final float loadFactor;

@SuppressWarnings("unchecked")
public MyHashSet(int initialCapacity, float loadFactor) {
  if (initialCapacity < 1) initialCapacity = 16;
  if (loadFactor <= 0) throw new IllegalArgumentException();
  int cap = 1;
  while (cap < initialCapacity) cap <<= 1; // zarovnání na mocninu 2
  this.loadFactor = loadFactor;
  this.table = (Node<E>[]) new Node[cap];
  this.threshold = (int) (cap * loadFactor);
}

public MyHashSet() { this(16, 0.75f); }

public int size() { return size; }
public boolean isEmpty() { return size == 0; }
```

## 2) Hash „spread“ + index

```java
private int hash(Object key) {
  int h = (key == null) ? 0 : key.hashCode();
  return h ^ (h >>> 16); // promíchání vyšších bitů do nižších
}
private int indexFor(int h, int length) { return h & (length - 1); }
```

## 3) `contains(e)` – průchod bucketem

```java
public boolean contains(Object o) {
  int idx = indexFor(hash(o), table.length);
  for (Node<E> n = table[idx]; n != null; n = n.next) {
    if (o == n.item || (o != null && o.equals(n.item))) return true;
  }
  return false;
}
```

## 4) `add(e)` – vlož jen když tam ještě není

```java
public boolean add(E e) {
  int idx = indexFor(hash(e), table.length);
  for (Node<E> n = table[idx]; n != null; n = n.next) {
    if (e == n.item || (e != null && e.equals(n.item))) return false; // duplicitní
  }
  table[idx] = new Node<>(e, table[idx]); // vlož na hlavu řetězu
  if (++size > threshold) resize(table.length << 1);
  return true;
}
```

## 5) `remove(e)` – vyřazení z řetězce

```java
public boolean remove(Object o) {
  int idx = indexFor(hash(o), table.length);
  Node<E> prev = null, cur = table[idx];
  while (cur != null) {
    if (o == cur.item || (o != null && o.equals(cur.item))) {
      if (prev == null) table[idx] = cur.next;
      else prev.next = cur.next;
      size--;
      return true;
    }
    prev = cur;
    cur = cur.next;
  }
  return false;
}
```

## 6) `clear()` + jednoduchý `Iterator<E>`

```java
public void clear() {
  java.util.Arrays.fill(table, null);
  size = 0;
}

// Jednoduchý iterátor (bez fail-fast a bez remove())
public java.util.Iterator<E> iterator() {
  return new java.util.Iterator<>() {
    int bucket = 0;
    Node<E> cur = advance();

    private Node<E> advance() {
      while (bucket < table.length) {
        Node<E> n = table[bucket++];
        if (n != null) return n;
      }
      return null;
    }

    public boolean hasNext() { return cur != null; }

    public E next() {
      if (cur == null) throw new java.util.NoSuchElementException();
      E val = cur.item;
      cur = (cur.next != null) ? cur.next : advance();
      return val;
    }
  };
}
```

## 7) `resize` – rehash do větší tabulky

```java
@SuppressWarnings("unchecked")
private void resize(int newCap) {
  Node<E>[] old = table;
  Node<E>[] nw  = (Node<E>[]) new Node[newCap];
  for (Node<E> b : old) {
    for (Node<E> n = b; n != null; ) {
      Node<E> next = n.next;
      int idx = indexFor(hash(n.item), newCap);
      n.next = nw[idx];
      nw[idx] = n;
      n = next;
    }
  }
  table = nw;
  threshold = (int) (newCap * loadFactor);
}
```

## Mini-ukázka použití

```java
MyHashSet<String> s = new MyHashSet<>();
s.add("Ada");      // true
s.add("Ada");      // false (duplicitní)
s.add("Grace");    // true
boolean has = s.contains("Grace"); // true
s.remove("Ada");   // true
```


# Úplná „kapesní“ implementace (vcelku)

```java
import java.util.Arrays;
import java.util.Iterator;
import java.util.NoSuchElementException;

public class MyHashSet<E> implements Iterable<E> {
  private static final class Node<E> {
    final E item;
    Node<E> next;
    Node(E item, Node<E> next) { this.item = item; this.next = next; }
  }

  private Node<E>[] table;
  private int size;
  private int threshold;
  private final float loadFactor;

  @SuppressWarnings("unchecked")
  public MyHashSet(int initialCapacity, float loadFactor) {
    if (initialCapacity < 1) initialCapacity = 16;
    if (loadFactor <= 0) throw new IllegalArgumentException();
    int cap = 1;
    while (cap < initialCapacity) cap <<= 1;
    this.loadFactor = loadFactor;
    this.table = (Node<E>[]) new Node[cap];
    this.threshold = (int) (cap * loadFactor);
  }

  public MyHashSet() { this(16, 0.75f); }

  public int size() { return size; }
  public boolean isEmpty() { return size == 0; }

  private int hash(Object key) {
    int h = (key == null) ? 0 : key.hashCode();
    return h ^ (h >>> 16);
  }
  private int indexFor(int h, int length) { return h & (length - 1); }

  public boolean contains(Object o) {
    int idx = indexFor(hash(o), table.length);
    for (Node<E> n = table[idx]; n != null; n = n.next) {
      if (o == n.item || (o != null && o.equals(n.item))) return true;
    }
    return false;
  }

  public boolean add(E e) {
    int idx = indexFor(hash(e), table.length);
    for (Node<E> n = table[idx]; n != null; n = n.next) {
      if (e == n.item || (e != null && e.equals(n.item))) return false;
    }
    table[idx] = new Node<>(e, table[idx]);
    if (++size > threshold) resize(table.length << 1);
    return true;
  }

  public boolean remove(Object o) {
    int idx = indexFor(hash(o), table.length);
    Node<E> prev = null, cur = table[idx];
    while (cur != null) {
      if (o == cur.item || (o != null && o.equals(cur.item))) {
        if (prev == null) table[idx] = cur.next;
        else prev.next = cur.next;
        size--;
        return true;
      }
      prev = cur; cur = cur.next;
    }
    return false;
  }

  public void clear() {
    Arrays.fill(table, null);
    size = 0;
  }

  @SuppressWarnings("unchecked")
  private void resize(int newCap) {
    Node<E>[] old = table;
    Node<E>[] nw  = (Node<E>[]) new Node[newCap];
    for (Node<E> b : old) {
      for (Node<E> n = b; n != null; ) {
        Node<E> next = n.next;
        int idx = indexFor(hash(n.item), newCap);
        n.next = nw[idx];
        nw[idx] = n;
        n = next;
      }
    }
    table = nw;
    threshold = (int) (newCap * loadFactor);
  }

  @Override
  public Iterator<E> iterator() {
    return new Iterator<>() {
      int bucket = 0;
      Node<E> cur = advance();

      private Node<E> advance() {
        while (bucket < table.length) {
          Node<E> n = table[bucket++];
          if (n != null) return n;
        }
        return null;
      }

      public boolean hasNext() { return cur != null; }

      public E next() {
        if (cur == null) throw new NoSuchElementException();
        E val = cur.item;
        cur = (cur.next != null) ? cur.next : advance();
        return val;
      }
    };
  }
}
```
