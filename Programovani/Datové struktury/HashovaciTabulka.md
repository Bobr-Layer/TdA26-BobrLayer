# Hašovací tabulka 

## Definice a princip

**Hašovací tabulka** mapuje **klíče → hodnoty**. Klíč se přes **hašovací funkci** (`hashCode`) promění na celé číslo (hash), ze kterého odvodíme **index** do vnitřního pole **bucketů** (věder). Tím dosáhneme průměrně **O(1)** pro `put/get/remove`, protože přístup do pole je konstantní a kolize řešíme efektivně.

## Základní operace a očekávaná složitost

* `put(k, v)` – vložit/aktualizovat hodnotu pro klíč `k`.
* `get(k)` – najít hodnotu pro klíč `k`.
* `remove(k)` – odstranit záznam s klíčem `k`.
* `containsKey(k)` – test, zda je klíč přítomen.
* Iterace přes záznamy (bez garance pořadí u obyčejné hash tabulky).

**Amortizovaně:** `put/get/remove` ≈ **O(1)**, za předpokladu rozumného **load factoru** (zatížení) a „slušné“ hašovací funkce.

## Kolize: proč vznikají a jak je řešíme

**Kolize** nastane, když dva různé klíče spadnou do stejného bucketu (mají stejný index). Řeší se dvěma hlavními přístupy:

1. **Řetězení (separate chaining)**
   Každý bucket je **seznam** (nebo strom od Javy 8+ v JDK), který obsahuje páry `(key, value)`.

   * Výhody: jednoduché mazání, snadné zvětšování kapacity (rehash).
   * Nevýhody: extra ukazatele (paměť), v nejhorším případě O(n) na bucket.

2. **Open addressing (lineární/kvadratické sondování, double hashing)**
   Při kolizi hledáme **další volné místo** přímo v poli podle sondovacího schématu.

   * Výhody: lepší lokální paměťová lokalita (cache).
   * Nevýhody: mazání je těžší (tombstones), při vysokém load factoru hrozí „shlukování“.

V této ukázce použijeme **řetězení** (přehledné a blízké `HashMap` v JDK).

## Load factor (α) a zvětšování kapacity

**Load factor** `α = size / capacity` říká, jak „plná“ je tabulka. Typicky se volí **0.75** (kompromis mezi pamětí a rychlostí).
Jakmile `size` překročí práh `threshold = capacity * α`, zvětšíme tabulku (obvykle **2×**) a **rehashujeme** všechny prvky do nových bucketů. To je drahá operace **O(n)**, ale děje se **zřídka**, takže průměrná cena vložení zůstává **O(1)** (amortizace).

## Hash → index: míchání bitů a maskování

* V Javě je typické **„promíchání“** hash kódu: `h ^ (h >>> 16)` snižuje kolize na vyšších bitech, protože index obvykle používá jen spodní bity.
* Pokud je kapacita pole **mocnina 2**, index spočteme rychle: `index = hash & (capacity - 1)`. Je to ekvivalent `hash % capacity`, ale rychlejší.

## Kontrakt `equals` / `hashCode`

Pro korektní chování **musí** platit:

* Pokud `a.equals(b)`, **musí** platit `a.hashCode() == b.hashCode()`.
* Opačně to neplatí nutně (stejný hash nemusí znamenat `equals`).
* **NEMĚŇ** obsah klíče, který ovlivňuje `equals/hashCode`, **po** vložení do mapy – jinak prvek „ztratíš“ (už ho nenajdeš pod původním indexem).

## „Worst-case“ a mitigace

* Teoreticky může útočník vygenerovat mnoho klíčů se stejným hash prefixem → **O(n)**.
* JDK 8+ v `HashMap` umí dlouhé řetězce v bucketu **stromovat** (RB-tree) po překročení určité délky, čímž worst-case zlepší na **O(log n)**. (Naše ukázka nechá bucket jako seznam kvůli jednoduchosti.)

## Paměť a GC

* Každý prvek v řetězení je uzel s `key`, `value`, `next`.
* Při mazání uvolníme referenci z bucketu i z `next` a necháme **GC** uklidit.

## Pořadí iterace

* Obyčejná hash tabulka **negarantuje** pořadí.
* Chceš-li pořadí vložení/přístupu, použij `LinkedHashMap`.
* Chceš-li **seřazené** klíče a range operace, použij `TreeMap` (RB-tree, **O(log n)**).

## Kdy hash tabulku použít / ne

**Použít**, když:

* prioritou je **rychlé** `get/put/remove` dle klíče (lookup),
* na pořadí ti nezáleží, nebo použiješ `LinkedHashMap`.

**Ne**, když:

* potřebuješ **seřazené** klíče → `TreeMap`,
* máš extrémně kolizní klíče, které nemůžeš ovlivnit → zvaž strom.

# Implementace po krocích — řetězení

Budeme implementovat `MyHashTable<K,V>`: pole bucketů `Node<K,V>[] table`, každý bucket je **jednosměrný seznam** uzlů `(key, value, next)`. Kapacitu držíme jako **mocninu 2**, load factor **0.75**, resize na **2×**.

> Pozn.: Pro jednoduchost vynecháme stromování bucketů, serializaci a fail-fast iterátory.

## 1) Stav, uzel, konstrukce

```java
private static final class Node<K,V> {
  final K key;
  V value;
  Node<K,V> next;
  Node(K k, V v, Node<K,V> n) { key = k; value = v; next = n; }
}

private Node<K,V>[] table; // pole bucketů
private int size;          // počet párů (key,value)
private int threshold;     // spouštěč resize = capacity * loadFactor
private final float loadFactor;

@SuppressWarnings("unchecked")
public MyHashTable(int initialCapacity, float loadFactor) {
  if (initialCapacity < 1) initialCapacity = 16;
  if (loadFactor <= 0) throw new IllegalArgumentException();
  int cap = 1;                       // zarovnat na mocninu 2
  while (cap < initialCapacity) cap <<= 1;
  this.loadFactor = loadFactor;
  this.table = (Node<K,V>[]) new Node[cap];
  this.threshold = (int) (cap * loadFactor);
}

public MyHashTable() { this(16, 0.75f); }

public int size() { return size; }
public boolean isEmpty() { return size == 0; }
```

## 2) Hash spread + index do pole

```java
private int hash(Object key) {
  int h = (key == null) ? 0 : key.hashCode();
  return h ^ (h >>> 16); // promíchání vyšších bitů do nižších
}

private int indexFor(int hash, int length) {
  return hash & (length - 1); // length je mocnina 2
}

private boolean keysEqual(Object a, Object b) {
  return a == b || (a != null && a.equals(b));
}
```

## 3) `get(k)` – průchod bucketem

```java
public V get(Object key) {
  Node<K,V> e = findNode(key);
  return e == null ? null : e.value;
}

private Node<K,V> findNode(Object key) {
  int h = hash(key);
  int idx = indexFor(h, table.length);
  for (Node<K,V> n = table[idx]; n != null; n = n.next) {
    if (keysEqual(key, n.key)) return n;
  }
  return null;
}
```

## 4) `put(k,v)` – aktualizace nebo vložení na hlavu bucketu

```java
public V put(K key, V value) {
  int h = hash(key);
  int idx = indexFor(h, table.length);

  // 1) zkus aktualizovat existující klíč
  for (Node<K,V> n = table[idx]; n != null; n = n.next) {
    if (keysEqual(key, n.key)) {
      V old = n.value;
      n.value = value;
      return old;
    }
  }

  // 2) jinak vlož nový záznam na hlavu řetězu
  table[idx] = new Node<>(key, value, table[idx]);
  if (++size > threshold) resize(table.length << 1);
  return null; // dříve zde nic nebylo
}
```

## 5) `remove(k)` – vyřazení z řetězu

```java
public V remove(Object key) {
  int h = hash(key);
  int idx = indexFor(h, table.length);
  Node<K,V> prev = null, cur = table[idx];

  while (cur != null) {
    if (keysEqual(key, cur.key)) {
      if (prev == null) table[idx] = cur.next;
      else prev.next = cur.next;
      size--;
      return cur.value;
    }
    prev = cur;
    cur = cur.next;
  }
  return null; // nenašlo se
}
```

## 6) Testy a utility

```java
public boolean containsKey(Object key) { return findNode(key) != null; }

public boolean containsValue(Object value) {
  for (Node<K,V> b : table) {
    for (Node<K,V> n = b; n != null; n = n.next) {
      if (value == n.value || (value != null && value.equals(n.value)))
        return true;
    }
  }
  return false;
}

public void clear() {
  java.util.Arrays.fill(table, null);
  size = 0;
}
```

## 7) `resize` – rehash všech prvků do větší tabulky

```java
@SuppressWarnings("unchecked")
private void resize(int newCap) {
  Node<K,V>[] oldTab = table;
  Node<K,V>[] newTab = (Node<K,V>[]) new Node[newCap];

  for (Node<K,V> b : oldTab) {
    for (Node<K,V> n = b; n != null; ) {
      Node<K,V> next = n.next;              // uchovat dřív
      int idx = indexFor(hash(n.key), newCap);
      n.next = newTab[idx];                 // vlož na hlavu v newTab
      newTab[idx] = n;
      n = next;
    }
  }
  table = newTab;
  threshold = (int) (newCap * loadFactor);
}
```


## Mini-ukázka použití

```java
MyHashTable<String, Integer> map = new MyHashTable<>();
map.put("Ada", 1815);
map.put("Grace", 1906);
map.put("Ada", 42);               // update klíče "Ada"
Integer v = map.get("Grace");     // 1906
boolean has = map.containsKey("Alan"); // false
map.remove("Ada");
```


# Úplná „kapesní“ implementace (vcelku)

```java
import java.util.Arrays;

public class MyHashTable<K,V> {
  private static final class Node<K,V> {
    final K key;
    V value;
    Node<K,V> next;
    Node(K k, V v, Node<K,V> n) { key = k; value = v; next = n; }
  }

  private Node<K,V>[] table;
  private int size;
  private int threshold;
  private final float loadFactor;

  @SuppressWarnings("unchecked")
  public MyHashTable(int initialCapacity, float loadFactor) {
    if (initialCapacity < 1) initialCapacity = 16;
    if (loadFactor <= 0) throw new IllegalArgumentException();
    int cap = 1; // mocnina 2
    while (cap < initialCapacity) cap <<= 1;
    this.loadFactor = loadFactor;
    this.table = (Node<K,V>[]) new Node[cap];
    this.threshold = (int) (cap * loadFactor);
  }

  public MyHashTable() { this(16, 0.75f); }

  public int size() { return size; }
  public boolean isEmpty() { return size == 0; }

  // --- hash & index ---
  private int hash(Object key) {
    int h = (key == null) ? 0 : key.hashCode();
    return h ^ (h >>> 16); // spread
  }
  private int indexFor(int h, int length) { return h & (length - 1); }
  private boolean keysEqual(Object a, Object b) {
    return a == b || (a != null && a.equals(b));
  }

  // --- API ---
  public V get(Object key) {
    Node<K,V> e = findNode(key);
    return e == null ? null : e.value;
  }

  public V put(K key, V value) {
    int h = hash(key);
    int idx = indexFor(h, table.length);

    for (Node<K,V> n = table[idx]; n != null; n = n.next) {
      if (keysEqual(key, n.key)) {
        V old = n.value;
        n.value = value;
        return old;
      }
    }
    table[idx] = new Node<>(key, value, table[idx]);
    if (++size > threshold) resize(table.length << 1);
    return null;
  }

  public V remove(Object key) {
    int h = hash(key);
    int idx = indexFor(h, table.length);
    Node<K,V> prev = null, cur = table[idx];
    while (cur != null) {
      if (keysEqual(key, cur.key)) {
        if (prev == null) table[idx] = cur.next;
        else prev.next = cur.next;
        size--;
        return cur.value;
      }
      prev = cur; cur = cur.next;
    }
    return null;
  }

  public boolean containsKey(Object key) { return findNode(key) != null; }

  public boolean containsValue(Object value) {
    for (Node<K,V> b : table)
      for (Node<K,V> n = b; n != null; n = n.next)
        if (value == n.value || (value != null && value.equals(n.value)))
          return true;
    return false;
  }

  public void clear() {
    Arrays.fill(table, null);
    size = 0;
  }

  // --- pomocné ---
  private Node<K,V> findNode(Object key) {
    int h = hash(key);
    int idx = indexFor(h, table.length);
    for (Node<K,V> n = table[idx]; n != null; n = n.next)
      if (keysEqual(key, n.key)) return n;
    return null;
  }

  @SuppressWarnings("unchecked")
  private void resize(int newCap) {
    Node<K,V>[] oldTab = table;
    Node<K,V>[] newTab = (Node<K,V>[]) new Node[newCap];
    for (Node<K,V> b : oldTab) {
      for (Node<K,V> n = b; n != null; ) {
        Node<K,V> next = n.next;
        int idx = indexFor(hash(n.key), newCap);
        n.next = newTab[idx];
        newTab[idx] = n;
        n = next;
      }
    }
    table = newTab;
    threshold = (int) (newCap * loadFactor);
  }
}
```
