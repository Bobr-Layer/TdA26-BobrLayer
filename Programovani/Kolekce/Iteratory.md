# `Iterable<T>` a `Iterator<T>`

`Iterable<;T>` je **zdroj prvků**, který umí dodat **iterátor** pro postupné procházení kolekce/sekvence.

## Klíčové body

* **for-each** (`for (T x : iterable)`) **volá** `iterable.iterator()` a přes něj postupně `hasNext()/next()`.
* Od Javy 8 má `Iterable` **výchozí** metody:

  * `default void forEach(Consumer<? super T> action)` – provede akci pro každý prvek.
  * `default Spliterator<T> spliterator()` – napojení na Stream API a paralelní průchody.
* `Iterable` neříká **nic o velikosti**, náhodném přístupu, mutaci apod. To řeší konkrétní typy (např. `Collection`, `List`).

### Mini-příklad

```java
class Range implements Iterable<Integer> {
    private final int start, end; // [start, end)
    Range(int start, int end) { this.start = start; this.end = end; }

    @Override public Iterator<Integer> iterator() {
        return new Iterator<>() {
            private int cur = start;
            @Override public boolean hasNext() { return cur < end; }
            @Override public Integer next() {
                if (!hasNext()) throw new NoSuchElementException();
                return cur++;
            }
        };
    }
}

for (int x : new Range(3, 6)) {
    System.out.print(x + " "); // 3 4 5
}
```

## `Iterator<T>` – externí kurzor nad sekvencí

`Iterator<T>` je **stavový objekt** s ukazatelem na „další“ prvek.

## Kontrakt a hlavní metody

* `boolean hasNext()` – zda je k dispozici další prvek.
* `T next()` – vrátí další prvek a **posune** kurzor. Pokud už není co, **musí** hodit `NoSuchElementException`.
* `default void forEachRemaining(Consumer<? super T> action)` – (JDK 8) provede akci pro **všechny zbývající** prvky.
* `default void remove()` – (v rozhraní od JDK 1.2; **volitelné**) odstraní **naposledy vrácený** prvek. Pokud odstranění nedává smysl (např. neměnná kolekce), může házet `UnsupportedOperationException`.

### Správné pořadí volání

* `next()` **až potom**, co `hasNext()` vrátí `true`.
* `remove()` **nejdřív** po alespoň **jednom** `next()` a **nejvýše jednou** na každý vrácený prvek.

### Krátký příklad průchodu a mazání

```java
Iterator<String> it = new ArrayList<>(List.of("A","B","C")).iterator();
while (it.hasNext()) {
    String s = it.next();
    if (s.equals("B")) it.remove(); // smaže právě vrácený "B"
}
```

> **Pozor:** `remove()` **není** povinné – iterátor ho může **nepodporovat**.

## „Fail-fast“ vs. „fail-safe“ a konkurentní úpravy

### Fail-fast (většina kolekcí v `java.util`)

* Detekují **strukturální změny** mimo aktuální iterátor (např. `list.add(...)` v průběhu iterace).
* Jakmile si toho iterátor všimne, obvykle hodí `ConcurrentModificationException` (nejpozději při dalším `next()/hasNext()`).
* Je to **diagnostická vlastnost**, ne garance – v „racing“ situacích může chyba projít bez detekce.

### Jak iterovat bezpečně při mazání/přidávání

* Mazat přes **tentýž iterátor** (`it.remove()`), ne přes kolekci.
* Nebo použít **`ListIterator`** (viz níže) pro bezpečné `add/remove/set`.
* Pro scénáře se souběhem použij:

  * `CopyOnWriteArrayList` (iterátor je **snapshot**, „fail-safe“, ale zápisy jsou dražší),
  * `ConcurrentHashMap` a jeho `keySet().iterator()` (iterátor je **slabě konzistentní** – neuvidí všechny změny, ale „neselže“).

## `ListIterator<E>` – obousměrný iterátor pro seznamy

Rozšiřuje `Iterator<E>` o **pohyb zpět** a **indexy**:

* `boolean hasPrevious()` - zda je předchozí prvek.
* `E previous()` - vrátí předchozí prvek a posune kurzor zpět.
* `int nextIndex()`, `int previousIndex()` - indexy prvků, které by `next()`/`previous()` vrátily.
* **Mutace**: `void set(E e)`, `void add(E e)` (kromě `remove()`) - všechny mění kolekci a kurzor.

```java
List<String> xs = new ArrayList<>(List.of("A","C"));
ListIterator<String> it = xs.listIterator();
it.next();         // "A"
it.add("B");       // vloží mezi "A" a "C"
it.next();         // "C"
it.previous();     // zpět na "C"
it.set("Z");       // nahradí "C" -> "Z"
System.out.println(xs); // [A, B, Z]
```

## `Spliterator<T>` – moderní iterátor pro Streamy (JDK 8)

`Spliterator` (split-iterator) slouží ke **štípání** dat na části kvůli paralelizaci a k **popisu charakteristik** dat (např. `SIZED`, `SORTED`, `IMMUTABLE`, `CONCURRENT`…).

* `boolean tryAdvance(Consumer<? super T> action)` – zpracuje **jeden** prvek.
* `Spliterator<T> trySplit()` – vrátí **druhou polovinu** práce (nebo `null`, když už to nejde).
* `long estimateSize()` / `getExactSizeIfKnown()`
* `int characteristics()`

### Napojení na Stream

* `StreamSupport.stream(iterable.spliterator(), /* parallel? */ false)` vyrobí stream z libovolného `Iterable`.
* Kolekce už dodávají optimalizovaný spliterator (`ArrayList` – indexovatelný, `LinkedList` – sekvenční, atd.).

```java
Iterable<Integer> r = new Range(0, 1_000_000);
long sum = StreamSupport.stream(r.spliterator(), true) // paralelně
                        .mapToLong(i -> i)
                        .sum();
```

> `Spliterator` je **od JDK 8**; v **JDK 9+** se kolem něj nic zásadního nemění, ale přibyly další streamové operace (`takeWhile`, `dropWhile`, nový `iterate` s predikátem), což zlepšuje práci s proudy nad iterovatelnými zdroji.

## For-each (`enhanced for`)

* Syntaktický cukr pro pohodlný průchod přes `Iterable` nebo pole.
* Pro jeho použití **musí** třída implementovat `Iterable` (nebo být polem).

```java
for (String s : someIterable) {
    // používá vnitřně Iterator
}
```

* Přes `someIterable.iterator()` získá iterátor.
* V cyklu volá `hasNext()` a `next()`.
* **Nelze** přímo mazat/přidávat přes kolekci uvnitř smyčky (typicky „fail-fast“).
* Chceš-li mazat, použij explicitní `Iterator` a jeho `remove()`.

## Vliv **[JDK 9+]** – neměnné kolekce a jejich iterátory

**JDK 9** přidalo tovární metody:

* `List.of(...)`, `Set.of(...)`, `Map.of(...)`  **[JDK 9+]**

Tyto kolekce jsou **neměnné**:

* Iterátory **nepodporují** `remove()` → `UnsupportedOperationException`.
* Jsou **rychlé** a paměťově úsporné pro malé počty prvků (speciální interní implementace).
* Příklad:

```java
List<String> names = List.of("A", "B", "C");          // [JDK 9+]
Iterator<String> it = names.iterator();
it.next();             // OK
it.remove();           // UnsupportedOperationException (neměnná kolekce)
```

> To je praktická novinka po **JDK 9** přímo ovlivňující chování iterátorů (dříve se podobné neměnné kolekce řešily přes `Collections.unmodifiableList(...)`, které jen **zabalovalo** původní kolekci).

## Vlastní `Iterable`/`Iterator`: vzory

### Lazy filtrační iterátor

```java
class FilteringIterable<T> implements Iterable<T> {
    private final Iterable<T> src;
    private final Predicate<? super T> pred;
    FilteringIterable(Iterable<T> src, Predicate<? super T> pred) {
        this.src = src; this.pred = pred;
    }
    @Override public Iterator<T> iterator() {
        Iterator<T> it = src.iterator();
        return new Iterator<>() {
            T next; boolean hasBuffered = false;
            private void buffer() {
                while (!hasBuffered && it.hasNext()) {
                    T cand = it.next();
                    if (pred.test(cand)) { next = cand; hasBuffered = true; }
                }
            }
            @Override public boolean hasNext() { buffer(); return hasBuffered; }
            @Override public T next() {
                if (!hasNext()) throw new NoSuchElementException();
                hasBuffered = false; return next;
            }
        };
    }
}
```

### Flatten (zploštění) `Iterable<Iterable<T>>`

```java
class FlatteningIterable<T> implements Iterable<T> {
    private final Iterable<? extends Iterable<? extends T>> src;
    FlatteningIterable(Iterable<? extends Iterable<? extends T>> src) { this.src = src; }

    @Override public Iterator<T> iterator() {
        Iterator<? extends Iterable<? extends T>> outer = src.iterator();
        Iterator<? extends T> inner = List.<T>of().iterator();  // [JDK 9+] prázdný iterátor

        return new Iterator<>() {
            @Override public boolean hasNext() {
                while (!inner.hasNext() && outer.hasNext()) {
                    inner = outer.next().iterator();
                }
                return inner.hasNext();
            }
            @Override public T next() {
                if (!hasNext()) throw new NoSuchElementException();
                return inner.next();
            }
        };
    }
}
```

## Typické chyby a jak se jim vyhnout

* **Mazání v for-each**: dělej přes `Iterator.remove()`, ne `collection.remove(x)` během průchodu.
* **Volání `next()` bez `hasNext()`**: risk `NoSuchElementException`.
* **Ignorování návratové hodnoty `hasNext()`** v kombinaci s prázdnými kolekcemi.
* **Míchání iterátorů** nad **stejnou** kolekcí při mutacích (risk „fail-fast“).
* **Přetěžování bez respektu k pořadí** u `ListIterator.set/add/remove` (každá má přísný kontrakt, kdy ji lze volat).

## Bridge na Stream API (když chceš operátory nad `Iterable`)

I když `Iterable` není stream, snadno ho na stream převedeš:

```java
static <T> Stream<T> streamOf(Iterable<T> it) {
    return StreamSupport.stream(it.spliterator(), false);
}
```

* `spliterator()` je dostupný na `Iterable` od JDK 8.
* Pak můžeš použít bohaté API streamů (`map/filter/flatMap/...`) a případně paralelizaci.

## Shrnutí „co je **[JDK 9+]** relevantní k Iterátoru/Iterable“

* **Neměnné kolekce** `List.of(...)`, `Set.of(...)`, `Map.of(...)` **[JDK 9+]**
  → jejich iterátory **nepodporují** mutace (`remove()` hází `UnsupportedOperationException`).
* (Doplňkově) `Stream` novinky jako `takeWhile`/`dropWhile`/nové `iterate` **[JDK 9+]** zlepšují práci s proudy vytvořenými ze `Iterable` (přes `spliterator()`), i když se netýkají přímo rozhraní `Iterator`/`Iterable`.
