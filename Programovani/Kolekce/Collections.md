# `java.util.Collections`

## Signatura

```java
package java.util;

public final class Collections {
    // ...
}
```

*Utility* třída pro kolekce:

* **algoritmy** (řazení, míchání…),
* **pohledy/wrappery** (read-only, synchronized, checked),
* drobné **továrny** (`emptyXxx`, `singletonXxx`, `nCopies`) a
* **konverze** (`enumeration`, `list`).

> `Collections` ≠ `Collection` (to je rozhraní).

## Algoritmy nad seznamy

### Řazení a vyhledávání

* `sort` (s/bez komparátoru) - třídí seznam.
* `binarySearch` (s/bez komparátoru) - vyhledává prvek v setříděném seznamu.

```java
List<Integer> xs = new ArrayList<>(List.of(3,1,4,1,5));
Collections.sort(xs);                                 // přirozené pořadí
Collections.sort(xs, Comparator.reverseOrder());      // s komparátorem

int i = Collections.binarySearch(xs, 4);              // seznam musí být setříděný
int j = Collections.binarySearch(xs, 7, Comparator.naturalOrder());
```

* `min/max` (s/bez komparátoru) - vrací nejmenší/největší prvek podle přirozeného řazení nebo zadaného komparátoru:

```java
int mn = Collections.min(xs);
String longest = Collections.max(List.of("A","B","C"), Comparator.comparingInt(String::length));
```

## Permutace a hromadné změny

* `shuffle(kolekce)` – náhodné promíchání.
* `reverse(kolekce)` – obrátí pořadí.
* `rotate(kolekce, posun)` – cyklický posun.
* `swap(kolekce, i, j)` – prohodí dva prvky.
* `fill(kolekce, hodnota)` – nastaví všechny prvky na zadanou hodnotu.

```java
Collections.shuffle(xs);               // náhodné promíchání
Collections.reverse(xs);               // obrátí pořadí
Collections.rotate(xs, 2);             // cyklický posun o +2
Collections.swap(xs, 0, xs.size()-1);  // prohození prvků
Collections.fill(xs, 0);               // všechny prvky na 0
```

## Kopírování a náhrady

* `copy(dest, src)` – zkopíruje prvky ze `src` do `dest` (přepíše prvky v `dest`).
* `replaceAll(list, oldVal, newVal)` – nahradí všechny výskyty `oldVal` v seznamu `list` hodnotou `newVal`.

```java
var src = new ArrayList<>(List.of(1,2,3));
var dst = new ArrayList<>(List.of(9,9,9,9));
Collections.copy(dst, src);            // dst -> [1,2,3,9] (dst musí být dost velký)
Collections.replaceAll(dst, 9, 0);     // nahradí všechny 9 nulou
```

## Podseznamy a četnost

* `indexOfSubList(main, sub)` – index prvního výskytu podseznamu `sub` v `main` (nebo -1).
* `lastIndexOfSubList(main, sub)` – index posledního výskytu podseznamu `sub` v `main` (nebo -1).
* `frequency(coll, obj)` – počet výskytů `obj` v kolekci `coll`.
* `disjoint(coll1, coll2)` – zda jsou kolekce `coll1` a `coll2` disjunktní (nemají žádný společný prvek).

```java
int from = Collections.indexOfSubList(List.of(1,2,3,2,3), List.of(2,3));     // 1
int last = Collections.lastIndexOfSubList(List.of(1,2,3,2,3), List.of(2,3)); // 3
int freq = Collections.frequency(List.of("A","B","A"), "A");                  // 2
boolean disj = Collections.disjoint(List.of(1,2), List.of(3,4));              // true
```

## Drobné neměnné „továrny“ v `Collections`

* `emptyXxx()` – prázdná kolekce.
* `singletonXxx(elem)` – kolekce s jedním prvkem.
* `nCopies(n, obj)` – seznam s `n` odkazy na `obj`.

```java
List<String> empty = Collections.emptyList();             // neměnný prázdný
Set<Integer> one = Collections.singleton(42);             // jednoprvkový neměnný
Map<String,Integer> m = Collections.singletonMap("A", 1);
List<String> fiveX = Collections.nCopies(5, "X");         // 5× stejná reference
```

* Všechny vracejí **neměnné** kolekce (zápisy hází `UnsupportedOperationException`).
* Pokud už používáš **`List.of/Set.of/Map.of` [JDK 9+]** nebo **`copyOf` [JDK 10+]**, jsou často kompaktnější a ještě úspornější; `Collections.*` varianty se hodí, když nechceš měnit stávající kód a potřebuješ přesně tyto tvary.

## Wrappery (pohledy) nad existující kolekcí

### Unmodifiable (read-only pohled)

```java
List<String> base = new ArrayList<>(List.of("A","B"));
List<String> ro = Collections.unmodifiableList(base);
ro.get(0);      // OK
ro.add("C");    // UnsupportedOperationException (pohled je read-only)
base.add("C");  // změna je přes ro vidět (pohled ≠ kopie)
```

Dostupné varianty:

* `unmodifiableCollection/List/Set/Map` - základní kolekce.
* `unmodifiableSortedSet` / `unmodifiableSortedMap` - pro setříděné kolekce.
* `unmodifiableNavigableSet` / `unmodifiableNavigableMap` **[JDK 8+]** - pro navigovatelné kolekce.

> Pokud chceš **skutečně neměnnou** a často i paměťově úspornější strukturu, zvaž **`List.of/Set.of/Map.of` [JDK 9+]** místo wrapperu (tam žádná podkladová kolekce není).

### Synchronized (jednoduché zamykání)

```java
List<Integer> ts = Collections.synchronizedList(new ArrayList<>());
synchronized (ts) {                 // iterace musí být uvnitř synchronized
    for (int v : ts) { /* ... */ }
}
```

Varianty pro `Collection/List/Set/Map` i `Sorted*/Navigable*` **[JDK 8+]**.

> Pro vyšší paralelizaci preferuj kolekce z `java.util.concurrent` (např. `ConcurrentHashMap`).

### Checked (runtime typová kontrola pro raw kód)

* `checkedXxx(view)` – vrátí **bezpečný pohled** na zadanou kolekci `view`. Při zápisu s nesprávným typem hází `ClassCastException`.

```java
List raw = new ArrayList();                                   // raw usage
List<String> safe = Collections.checkedList(raw, String.class);
raw.add(123);                 // projde (raw)
safe.add((Object) 123);       // ClassCastException – pohled hlídá typy
```

Varianty pro `Collection/List/Set/Map` i `Sorted*/Navigable*` **[JDK 8+]**.

### Další užitečné

* `newSetFromMap(map)` – vytvoří `Set` nad zadanou mapou (hodí se pro `ConcurrentHashMap`).
* `asLifoQueue(deque)` – vytvoří `Queue` chovající se jako zásobník (LIFO) nad zadaným `Deque`.

```java
Set<String> s = Collections.newSetFromMap(new ConcurrentHashMap<>()); // set nad libovolnou mapou
Queue<Integer> lifo = Collections.asLifoQueue(new ArrayDeque<>());    // chová se jako zásobník (LIFO)
```

## Převody `Enumeration` ↔ `List`

* `enumeration(collection)` – převede kolekci na `Enumeration`.
* `list(enumeration)` – převede `Enumeration` na `ArrayList`.

```java
Enumeration<String> e = Collections.enumeration(List.of("A","B","C"));
List<String> fromE = Collections.list(e);
```

## Chování, kontrakty a časté pasti

* **Fail-fast iterátory**: většina kolekcí (i wrapperů) detekuje **strukturální změny** mimo aktuální iterátor a při dalším `next()/hasNext()` může hodit `ConcurrentModificationException`. (Diagnostické, ne garantované.)
* **Unmodifiable wrapper je pohled**: měníš-li **podklad**, změna je vidět i přes „read-only“ wrapper.
* **Synchronized wrapper**: **při iteraci** vždy synchronizuj na návratové kolekci (viz příklad), jinak riskuješ závody.
* **`nCopies(n, obj)`**: do seznamu se vloží **stejná reference** `obj` – mění-li se objekt, „mění se všechny položky“.
* **`binarySearch`**: seznam musí být setříděný **stejným** komparátorem, jaký předáš vyhledávání.
* **`copy(dest, src)`**: `dest.size()` musí být **≥ `src.size()`** (nejde o změnu velikosti, ale přepis prvků).

## Tipy, kdy použít `Collections`

* **Chci rychlý read-only seznam malých dat** → `List.of(...)` **[JDK 9+]** (nebo `Collections.emptyList()/singletonList()` pro speciální tvary).
* **Chci zabránit zápisům do *své* interní kolekce** → `Collections.unmodifiableXxx(view)` (pohled; voličně vidí změny podkladu).
* **Potřebuji „rychle zamknout“ existující kolekci** → `Collections.synchronizedXxx` (nezapomeň na `synchronized` kolem iterace).
* **Mám raw kód bez generik a chci runtime ochranu typů** → `Collections.checkedXxx`.
* **Algoritmy nad seznamem** → `sort`, `shuffle`, `reverse`, `rotate`, `swap`, `binarySearch`, `fill`, `copy`, `replaceAll`, `min/max`, `indexOfSubList/lastIndexOfSubList`, `frequency`, `disjoint`.

