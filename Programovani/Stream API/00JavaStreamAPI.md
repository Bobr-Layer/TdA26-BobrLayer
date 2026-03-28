# Stream API v Javě

**Stream** je „proud“ hodnot z nějakého zdroje (kolekce, soubor, generátor…), nad nimiž skládáte **pipeline**:
**zdroj → (mezikroky: *intermediate*) → (terminální operace: *terminal*)**.
Mezikroky jsou **lenivé** (nic nedělají, dokud nepřijde terminál), obvykle vrací další `Stream` a jsou buď **stateless** (např. `map`) nebo **stateful** (např. `sorted`, `distinct`). Terminální operace výpočet **spustí** a stream „uzavřou“.

## Vytvoření streamu (zdroje)

```java

import java.nio.file.*;
import java.util.regex.Pattern;
import java.util.stream.*;

Stream<String> s1 = Stream.of("A", "B", "C");
IntStream s2 = IntStream.range(0, 3);                 // 0,1,2
IntStream s3 = IntStream.rangeClosed(1, 3);           // 1,2,3
Stream<String> s4 = Arrays.stream(new String[]{"a","b"});
Stream<String> s5 = List.of("x","y").stream();        // z kolekce
Stream<Double> s6 = Stream.generate(Math::random);    // nekonečný
Stream<Integer> s7 = Stream.iterate(1, n -> n + 1);   // nekonečný
Stream<Integer> s8 = Stream.iterate(0, n -> n < 10, n -> n + 2); // JDK 9+
Stream<String> s9 = Files.lines(Path.of("data.txt")); // řádky souboru (IO)
Stream<String> s10 = Pattern.compile("\\s+").splitAsStream("a b  c");
```

> Pozor: u nekonečných streamů použijte `limit`.

## Mezikroky (intermediate)

| Metoda                            | Popis                                      | Příklad                                                                             |
| --------------------------------- | ------------------------------------------ | ----------------------------------------------------------------------------------- |
| `filter(Predicate)`               | ponechá prvky splňující podmínku           | `List.of(1,2,3,4).stream().filter(n->n%2==0).toList()` → `[2,4]`                    |
| `map(Function)`                   | transformace prvků                         | `Stream.of("a","bb").map(String::length).toList()` → `[1,2]`                        |
| `flatMap(Function)`               | „zploští“ vnořené streamy                  | `Stream.of("a b","c").flatMap(s->Arrays.stream(s.split(" "))).toList()` → `[a,b,c]` |
| `mapToInt/Long/Double`            | na primitivní stream                       | `Stream.of("1","20").mapToInt(Integer::parseInt).sum()` → `21`                      |
| `boxed()`                         | zpět na objektový stream                   | `IntStream.range(0,3).boxed().toList()` → `[0,1,2]`                                 |
| `distinct()`                      | odstraní duplicity (stateful)              | `Stream.of(1,1,2).distinct().toList()` → `[1,2]`                                    |
| `sorted()` / `sorted(Comparator)` | řazení (stateful)                          | `Stream.of("b","a").sorted().toList()` → `[a,b]`                                    |
| `peek(Consumer)`                  | nahlédnutí (debug/log)                     | `Stream.of(1,2).peek(System.out::println).count()`                                  |
| `limit(n)`                        | vezme prvních `n`                          | `IntStream.iterate(1,n->n+1).limit(3).boxed().toList()` → `[1,2,3]`                 |
| `skip(n)`                         | přeskočí prvních `n`                       | `IntStream.range(0,5).skip(2).boxed().toList()` → `[2,3,4]`                         |
| `takeWhile(Predicate)` (JDK 9+)   | bere, dokud platí                          | `Stream.of(1,2,3,1).takeWhile(n->n<3).toList()` → `[1,2]`                           |
| `dropWhile(Predicate)` (JDK 9+)   | zahodí, dokud platí                        | `Stream.of(1,2,3,1).dropWhile(n->n<3).toList()` → `[3,1]`                           |
| `onClose(Runnable)`               | zaregistruje akci při `close()`            | `Stream.of(1).onClose(()->System.out.println("bye")).close();`                      |
| `unordered()`                     | může zrušit pořadí (opt. pro paralelismus) | `list.stream().unordered().distinct()`                                              |

## Terminální operace

| Metoda                                    | Popis                                         | Příklad                                                            |
| ----------------------------------------- | --------------------------------------------- | ------------------------------------------------------------------ |
| `forEach(Consumer)`                       | provede akci pro každý prvek (pořadí ne vždy) | `List.of("A","B").stream().forEach(System.out::println);`          |
| `forEachOrdered(Consumer)`                | zachová pořadí (užitečné u paralelních)       | `list.parallelStream().forEachOrdered(System.out::println);`       |
| `toArray()` / `toArray(IntFunction<T[]>)` | do pole                                       | `Stream.of("a","b").toArray(String[]::new)`                        |
| `reduce(...)`                             | skládání do jedné hodnoty                     | `Stream.of(1,2,3).reduce(0, Integer::sum)` → `6`                   |
| `collect(Collector)`                      | sběr do kolekce/struktury                     | `Stream.of(1,2).collect(Collectors.toSet())`                       |
| `min/max(Comparator)`                     | extrémy                                       | `Stream.of("aa","b").min(Comparator.comparingInt(String::length))` |
| `count()`                                 | počet prvků                                   | `IntStream.range(0,10).count()` → `10`                             |
| `anyMatch/allMatch/noneMatch`             | predikáty nad celkem                          | `Stream.of(1,3,5).anyMatch(n->n%2==0)` → `false`                   |
| `findFirst/findAny`                       | nalezne prvek (Optional)                      | `Stream.of(1,2).findFirst().orElse(-1)` → `1`                      |
| `sum/average` (na `IntStream` apod.)      | agregace                                      | `IntStream.of(1,2).average().orElse(0)` → `1.5`                    |
| `summaryStatistics()`                     | souhrn (count/min/max/sum/avg)                | `IntStream.of(1,2,3).summaryStatistics()`                          |

---

## `Collectors` – nejpoužívanější

```java
var list = Stream.of("a","bb","ccc").collect(Collectors.toList());           // toList (JDK 16+ má i List.copyOf-like v Collectors.toUnmodifiableList)
var set  = Stream.of(1,2,2).collect(Collectors.toSet());                     // bez duplicit
var map  = Stream.of("a","bb").collect(Collectors.toMap(
    s -> s, String::length));                                                // klíč -> hodnota

var joined = Stream.of("A","B","C")
    .collect(Collectors.joining(", ", "[", "]"));                            // "[A, B, C]"

var grouped = Stream.of("a","bb","c","ddd")
    .collect(Collectors.groupingBy(String::length));                         // Map<Integer, List<String>>

var partitioned = IntStream.rangeClosed(1,5).boxed()
    .collect(Collectors.partitioningBy(n -> n%2==0));                        // {true:[2,4], false:[1,3,5]}

var countingByLen = Stream.of("a","bb","c")
    .collect(Collectors.groupingBy(String::length, Collectors.counting()));  // Map<Integer, Long>

var averaging = Stream.of(1,2,3)
    .collect(Collectors.averagingInt(i -> i));                               // 2.0

var summarizing = Stream.of(1,2,3)
    .collect(Collectors.summarizingInt(i -> i));                             // IntSummaryStatistics

var mapping = Stream.of("a","bb")
    .collect(Collectors.mapping(String::length, Collectors.toList()));       // [1,2]

var collectingAndThen = Stream.of(1,2,3)
    .collect(Collectors.collectingAndThen(Collectors.toList(),               // finální transformace
        lst -> List.copyOf(lst)));

var reducing = Stream.of(1,2,3)
    .collect(Collectors.reducing(0, Integer::sum));                          // 6

// JDK 12+: teeing – zkombinuje dva collectory do jedné výsledné hodnoty
var both = Stream.of(1,2,3).collect(Collectors.teeing(
    Collectors.summingInt(i->i),
    Collectors.counting(),
    (sum, cnt) -> "avg=" + (sum / (double)cnt)));                            // "avg=2.0"
```

> Pozn.: Od JDK 16 je k dispozici i `Stream.toList()` (metoda na streamu), která vrací nemodifikovatelný seznam. Krátké a rychlé: `var list = someStream.toList();`

## Praktické minivzory (idiomy)

**1) Filtrovaný, seřazený, projekce do jiné kolekce**

```java
List<String> result = people.stream()
    .filter(p -> p.getAge() >= 18)
    .sorted(Comparator.comparing(Person::getLastName).thenComparing(Person::getFirstName))
    .map(Person::getEmail)
    .toList();
```

**2) Unikátní podle klíče (např. e-mail)**
Stream nemá „distinctBy“, ale lze si pomoci Setem:

```java
<T> Predicate<T> distinctByKey(Function<? super T, ?> keyExtractor) {
    Set<Object> seen = ConcurrentHashMap.newKeySet();
    return t -> seen.add(keyExtractor.apply(t));
}
// použití:
var uniq = people.stream().filter(distinctByKey(Person::getEmail)).toList();
```

**3) Frekvenční tabulka**

```java
Map<String, Long> freq = words.stream()
    .collect(Collectors.groupingBy(w -> w, Collectors.counting()));
```

**4) Najdi top N (např. 10)**

```java
var top10 = items.stream()
    .sorted(Comparator.comparing(Item::score).reversed())
    .limit(10)
    .toList();
```

**5) Čtení souboru a počítání řádků se slovem**

```java
long count = Files.lines(Path.of("log.txt"))
    .filter(l -> l.contains("ERROR"))
    .count();
```

## Paralelní streamy (stručně)

* Vznik: `collection.parallelStream()` nebo `stream.parallel()`.
* Vhodné pro **CPU-intenzivní**, dobře **rozdělitelné** úlohy s minimem sdíleného stavu a **bez** závislosti na pořadí.
* Při použití preferujte **ne-stateful** operace a **konkurenční** collectory (např. `toConcurrentMap`, `groupingByConcurrent`).
* Můžete vynutit deterministické pořadí: `forEachOrdered`.

```java
long primes = IntStream.rangeClosed(2, 2_000_000)
    .parallel()
    .filter(StreamCheats::isPrime)
    .count();
```

## Časté nástrahy a dobré praxe

* **Neuchovávejte** odkaz na prvek a neměňte ho v `map/peek` (mutace sdíleného stavu → bugy, obzvlášť u `parallel`).
* `peek` je primárně pro **debug/log**; nepoužívejte k vedlejším efektům byznys logiky.
* `collect(toList())` vrací **modifikovatelný** seznam; `toList()` (metoda na streamu, JDK 16+) vrací **nemodifikovatelný**.
* `sorted/distinct` jsou **stateful** → mohou být náročnější (paměť/čas).
* U **nekonečných** streamů vždy `limit`/`takeWhile`.
* Po terminální operaci je stream **uzavřený** – nejde znovu použít.
* Pokud záleží na pořadí a používáte paralelní stream, preferujte `forEachOrdered`.
* IO streamy (`Files.lines`) zavírejte (try-with-resources) nebo `close()`.

## Mini katalog metod s krátkými ukázkami (rychlý přehled)

```java
// INTERMEDIATE
list.stream().filter(x -> x > 0);
list.stream().map(Object::toString);
list.stream().flatMap(s -> s.getChildren().stream());
list.stream().distinct();
list.stream().sorted(); // nebo .sorted(Comparator.comparing(Foo::bar))
list.stream().peek(System.out::println);
list.stream().limit(5).skip(2);
Stream.of(1,2,3,1).takeWhile(n -> n < 3);   // JDK 9+
Stream.of(1,2,3,1).dropWhile(n -> n < 3);   // JDK 9+

// TERMINAL
list.stream().forEach(System.out::println);
list.stream().forEachOrdered(System.out::println);
list.stream().toArray(String[]::new);
list.stream().reduce(0, Integer::sum);
list.stream().collect(Collectors.toSet());
list.stream().min(Comparator.naturalOrder());
list.stream().count();
list.stream().anyMatch(s -> s.startsWith("A"));
list.stream().findFirst();
IntStream.of(1,2,3).summaryStatistics();
```
