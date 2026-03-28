# Java Collections Framework (JCF)

Je to ucelený rámec v Javě pro práci se skupinami objektů: definuje rozhraní, třídy (implementace) a algoritmy pro ukládání, vyhledávání, řazení a průchod daty.

## JCF (rozhraní → běžné implementace)

Jasně — tady je **hezčí textová verze** se sjednoceným značením:

* `[I]` rozhraní • `[A]` abstraktní třída • `[C]` konkrétní třída
* Legacy prvky jsou šedě poznámkou v závorce

```
[I] Iterable
└── [I] Collection
    ├── [I] List
    │   ├── [A] AbstractCollection
    │   │   └── [A] AbstractList
    │   │       ├── [A] AbstractSequentialList
    │   │       │   └── [C] LinkedList  ⇐ implements [I] Queue, [I] Deque
    │   │       └── [C] ArrayList
    │   └── [C] Vector (legacy)
    │       └── [C] Stack  (legacy)
    │
    ├── [I] Set
    │   ├── [A] AbstractCollection
    │   │   └── [A] AbstractSet
    │   │       ├── [C] HashSet
    │   │       │   └── [C] LinkedHashSet
    │   │       ├── [C] TreeSet        ⇐ also [I] SortedSet / [I] NavigableSet
    │   │       └── [A] EnumSet        (konkrétní impl. skryté v JDK)
    │   ├── [I] SortedSet
    │   │   └── [I] NavigableSet
    │   └── (viz také TreeSet výše)
    │
    └── [I] Queue
        ├── [A] AbstractCollection
        │   └── [A] AbstractQueue
        │       ├── [C] PriorityQueue
        │       └── [C] ArrayDeque     ⇐ implements [I] Deque
        └── [I] Deque
            └── (typické impl.: ArrayDeque, LinkedList)
```

## Větev Map (mimo Collection)

```
[I] Map
├── [I] SortedMap
│   └── [I] NavigableMap
├── [A] AbstractMap
│   ├── [C] HashMap
│   │   └── [C] LinkedHashMap
│   ├── [C] TreeMap          ⇐ also [I] SortedMap / [I] NavigableMap
│   ├── [C] WeakHashMap
│   ├── [C] IdentityHashMap
│   └── [C] EnumMap
└── [C] Hashtable  (legacy; historicky nad [A] Dictionary)
```

## Související (pro komplet obrázek)

```
[I] Iterator, [I] ListIterator
[I] Comparable, [I] Comparator
[C] Collections (utility / wrappery)
[C] Arrays      (pole ↔ kolekce, řazení, streamy)
[A] Dictionary  (legacy předek Hashtable)
```

Chceš k tomu ještě **mini tabulku složitostí** (add/get/contains) pro hlavní struktury hned pod to? Přihodím ji pěkně formátovanou.

## Co je co (rychlá legenda)

* **Iterable** – základ pro `for-each`.

* **Collection** – kořen všech kolekcí (mimo `Map`).

* **List** – uspořádaná kolekce s indexy (duplikáty povoleny).

  * **ArrayList** (dynamické pole, rychlé indexy).
  * **LinkedList** (dvojitě vázaný seznam, rychlé vkládání/mazání uprostřed).
  * **Vector/Stack** – starší (synchronizované) typy – dnes spíše nepoužívat.

* **Set** – množina (bez duplikátů, rovnost dle `equals`/`hashCode`).

  * **HashSet** (neuspořádaný, O(1) průměr).
  * **LinkedHashSet** (pamatuje pořadí vkládání).
  * **TreeSet** (tříděný strom – O(log n), vyžaduje `Comparable`/`Comparator`).
  * **SortedSet/NavigableSet** – rozšíření pro třídění a navigaci (`lower/higher/...`).

* **Queue** – fronta (FIFO), případně prioritní.

  * **ArrayDeque** (rychlá obousměrná fronta, implementuje i **Deque**).
  * **LinkedList** (umí `Queue` i `Deque`).
  * **PriorityQueue** (prioritní fronta podle pořadí/komparátoru).

* **Deque** – obousměrná fronta (zásobník i fronta).

  * **ArrayDeque**, **LinkedList**.

* **Map** – asociativní pole (klíč → hodnota), **není** podtyp `Collection`.

  * **HashMap** (O(1) průměr, neuspořádaný).
  * **LinkedHashMap** (pořadí vkládání/LRU iterace).
  * **TreeMap** (tříděné podle klíče, O(log n), `SortedMap`/`NavigableMap`).
  * **WeakHashMap** (slabé reference na klíče – vhodné pro cache).
  * **IdentityHashMap** (porovnává klíče referenčně `==`).
  * **Hashtable** (legacy, synchronizovaná – obecně se nedoporučuje).

## Související rozhraní a utility

* **Iterator**, **ListIterator** – průchod kolekcí.
* **Comparable**, **Comparator** – přirozené a externí řazení.
* **Collections** – utilitní třída (třídění, neměnné/unmodifiable view, synchonizace wrappery, atd.).
  *`Collectors.toUnmodifiableList/Set/Map` – neměnné kolekce ze streamu *(JDK 10+)*;
  `Collectors.filtering/flatMapping` *(JDK 9+)*, `Collectors.teeing` *(JDK 12+)*.*
* **Arrays** – most pro práci s poli (např. `Arrays.asList`, `Arrays.sort`, `Arrays.stream`).
  *`Arrays.compare / Arrays.mismatch` – porovnání a první rozdíl *(JDK 9+).*
* **(nové továrny na neměnné kolekce)**: `List.of(...)`, `Set.of(...)`, `Map.of(...)`, `Map.ofEntries(...)`, `Map.entry(k,v)` *(JDK 9+).*
* **(kopie jako neměnné)**: `List.copyOf(...)`, `Set.copyOf(...)`, `Map.copyOf(...)` *(JDK 10+).*
* **(rychlý výstup ze streamu do listu)**: `Stream.toList()` *(JDK 16+).*
* **(sjednocené pořadí u kolekcí/map)**: `SequencedCollection`, `SequencedSet`, `SequencedMap` *(JDK 21+; naplněno např. v `ArrayList`, `LinkedHashSet`, `LinkedHashMap`).*

---

### JCF – časové složitosti operací

| Struktura             | Přidání (add) | Přístup `get` |    `contains` |      `remove` | Iterace | Poznámka                |
| --------------------- | ------------: | ------------: | ------------: | ------------: | ------: | ----------------------- |
| ArrayList             |      A: O(1)* |     A/W: O(1) |       A: O(n) |       A: O(n) |    O(n) | Přesun prvků při mazání |
| LinkedList            |     A: O(1)** |       A: O(n) |       A: O(n) |     A: O(1)** |    O(n) | Umí Queue/Deque         |
| ArrayDeque            |       A: O(1) |             — |       A: O(n) |    A: O(1)*** |    O(n) | Rychlé fronty/zásobníky |
| PriorityQueue         |   A: O(log n) |             — |       A: O(n) |   A: O(log n) |    O(n) | min-heap; `poll/offer`  |
| HashSet               |       A: O(1) |             — |       A: O(1) |       A: O(1) |    O(n) | W: O(n)†                |
| LinkedHashSet         |       A: O(1) |             — |       A: O(1) |       A: O(1) |    O(n) | Zachovává pořadí        |
| TreeSet               | A/W: O(log n) |             — | A/W: O(log n) | A/W: O(log n) |    O(n) | Tříděné, navigace       |
| HashMap (`get`)       |             — |       A: O(1) |             — |             — |    O(n) | W: O( n)†               |
| HashMap (`put`)       |       A: O(1) |             — |             — |             — |       — | W: O(n)†                |
| LinkedHashMap (`get`) |             — |       A: O(1) |             — |             — |    O(n) | Pořadí vkládání/LRU     |
| TreeMap (`get`)       |             — | A/W: O(log n) |             — |             — |    O(n) | Tříděné dle klíče       |
| TreeMap (`put`)       | A/W: O(log n) |             — |             — |             — |       — | —                       |

**Legenda sloupců:**

* `get` = přístup podle indexu (List) nebo podle klíče (Map)
* `contains` = membership (Set/List) resp. `containsKey` (Map)
* `remove` = u Map `remove(key)`, u Set/List `remove(prvek)` (příp. podle indexu)

**Hvězdičky**

* ***ArrayList add**: amortizovaně O(1); občasná realokace → O(n).
* ** **LinkedList**: `addFirst/addLast/removeFirst/removeLast` jsou O(1). `remove(x)` je O(n) kvůli nalezení; odpojení uzlu je O(1).
* *** **ArrayDeque**: `offer/poll/peek` na obou koncích O(1).
* † **HashMap/HashSet worst-case**: při patologických kolizích W: O(n). Od JDK 8 se dlouhé bucket-listy stromují → často W: O(log n), ale konzervativně se uvádí O(n).

**Pořadí iterace & `null`**

* `ArrayList/LinkedList/ArrayDeque`: iterují v pořadí vkládání; `ArrayDeque` **nepovoluje** `null`.
* `HashSet/HashMap`: nedefinované pořadí; `HashMap` dovolí 1× `null` klíč a `null` hodnoty.
* `LinkedHashSet/LinkedHashMap`: drží pořadí vkládání (u `LinkedHashMap` lze LRU přes `accessOrder=true`).
* `TreeSet/TreeMap`: tříděné dle `Comparable`/`Comparator`; `null` klíče obecně ne (NPE u přirozeného řazení).

**Rychlé doporučení**

* Bez pořadí, rychlé vyhledávání → `HashMap` / `HashSet`.
* Třídění podle klíče/prvku → `TreeMap` / `TreeSet`.
* Pořadí vkládání + rychlost → `LinkedHashMap` / `LinkedHashSet`.
* Indexovaný seznam → `ArrayList` (časté vkládání uprostřed? zvaž `LinkedList`).
* Fronta/Zásobník → `ArrayDeque`; prioritní fronta → `PriorityQueue`.

## Rozhraní `Collection`

* Základní rozhraní pro kolekce.
* Podtřídy: `List`, `Set`, `Queue`, `Deque`.
* Neobsahuje indexy (to je až v `List`).
* Podporuje generika (typ prvků `E`).
* Podporuje `null` (kromě některých implementací, např. `TreeSet/TreeMap`).
* Většina metod vrací `boolean` (úspěch operace).
* Některé metody mají výchozí implementaci (default, JDK 8+).
* Rozhraní je v `java.util` a definuje základní operace nad kolekcemi.

### Signatura

```java
package java.util;

public interface Collection<E> {
    // ...
}
```

### Hlavní metody

* `boolean add(E e)` – přidá prvek (některé kolekce mohou odmítnout duplicitní prvky).
* `boolean remove(Object o)` – odstraní prvek (první výskyt u seznamu).
* `boolean contains(Object o)` – zda kolekce obsahuje prvek.  
* `int size()` – počet prvků.
* `boolean isEmpty()` – zda je kolekce prázdná.
* `void clear()` – odstraní všechny prvky.
* `Iterator<E> iterator()` – vrátí iterátor pro průchod prvky.  
* `Object[] toArray()` – převede na pole.
* `<T> T[] toArray(T[] a)` – převede na pole zadaného typu.
* `boolean addAll(Collection<? extends E> c)` – přidá všechny prvky z jiné kolekce.
* `boolean removeAll(Collection<?> c)` – odstraní všechny prvky, které jsou v zadané kolekci.
* `boolean retainAll(Collection<?> c)` – ponechá jen prvky, které jsou v zadané kolekci.
* `boolean containsAll(Collection<?> c)` – zda kolekce obsahuje všechny prvky zadané kolekce.
* `default void forEach(Consumer<? super E> action)` – (JDK 8) provede akci pro každý prvek.
* `default boolean removeIf(Predicate<? super E> filter)` – (JDK 8) odstraní prvky podle filtru.
* `default Stream<E> stream()` – (JDK 8) vrátí sekvenci (stream) prvků.
* `default Stream<E> parallelStream()` – (JDK 8) vrátí paralelní sekvenci (stream) prvků.
* `default Spliterator<E> spliterator()` – (JDK 8) vrátí spliterator pro efektivní průchod/práce ve streamu.
