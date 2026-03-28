
# Funkční rozhraní (SAM)

## Definice a vlastnosti

* **SAM (Single Abstract Method)** = rozhraní s jednou abstraktní metodou → umožňuje psát **lambda výrazy** a **method references** místo anonymních tříd.
* `@FunctionalInterface`:

  * není povinná, ale **zajistí chybu při přidání druhé abstraktní metody**;
  * může obsahovat **výchozí (`default`) a statické (`static`) metody**, které **neporušují** SAM.
* Lambdy mohou zachytávat pouze **efektivně finální** lokální proměnné (hodnota se po přiřazení už nemění).

## Standardní funkční rozhraní - „Velká čtyřka“

### Supplier<T>

* **Smysl:** odložené dodání hodnoty bez vstupu (lazy, memoizace, factory).
* **Typické vzory:**

  * **Lazy inicializace:** otevření spojení/souboru až při `get()`.
  * **Retry/obnova:** opakované volání `get()` může vracet pokaždé jiný výsledek.
* **Pozor:** pokud je konstrukce drahá a voláte `get()` často, zvažte **memoizaci** (uchování jednou spočtené hodnoty).
* **Signatura**: `T get()`

```java
Supplier<UUID> uuid = UUID::randomUUID;
System.out.println(uuid.get()); // vygeneruje nové UUID
```

### Consumer<T>

* **Smysl:** side-effect akce nad hodnotou (log, zápis, odeslání).
* **Skládání:** `a.andThen(b)` provede **a pak** b; pokud `a` vyhodí výjimku, b se neprovede.
* **Pozor u paralelizace:** side-effecty musí být **thread-safe** a idempotentní, jinak hrozí duplicity či race conditions.
* **Signatura**: `void accept(T t)`
* **Skládání**: `andThen`

```java
Consumer<String> log = System.out::println;
Consumer<String> logUpper = s -> System.out.println(s.toUpperCase());
log.andThen(logUpper).accept("ahoj"); // vypíše „ahoj“ a pak „AHOJ“
```

### Function<T,R>

* **Smysl:** čistá transformace `T → R`.
* **Skládání:**

  * `f.andThen(g)` = nejdřív `f`, výsledek do `g`.
  * `f.compose(g)` = nejdřív `g`, výsledek do `f`.
  * `Function.identity()` – užitečná v mapách a sběračích.
* **Testovatelnost:** snažte se držet **čisté** funkce (bez side-effectů) – zjednodušuje unit testy.
* **Signatura**: `R apply(T t)`
* **Skládání**: `andThen`, `compose`, `identity()`

```java
Function<String, Integer> length = String::length;
Function<Integer, Boolean> isLong = n -> n > 5;
boolean res = length.andThen(isLong).apply("Java Streams"); // true
```

### Predicate<T>

* **Smysl:** booleovské tvrzení nad `T`.
* **Skládání:** `and`, `or`, `negate`; existuje i `Predicate.isEqual(x)`.
* **Pozor:** složitější pravidla raději **pojmenovávat** (např. `isAdult.and(isStudent)`).
* **Signatura**: `boolean test(T t)`
* **Skládání**: `and`, `or`, `negate`

```java
Predicate<String> nonEmpty = s -> !s.isEmpty();
Predicate<String> longEnough = s -> s.length() >= 3;
boolean ok = nonEmpty.and(longEnough).test("ABC"); // true
```

## Operátory (T → T)

### UnaryOperator<T>

* Stejný typ vstupu i výstupu – často **normalizace**, „sanitizace“ nebo **akumulace** (fold).
* **Signatura**: `T apply(T t)`

```java
UnaryOperator<String> trimAndUpper = s -> s.trim().toUpperCase();
System.out.println(trimAndUpper.apply("  ahoj ")); // „AHOJ“
```

### BinaryOperator<T>

* Kombinace dvou hodnot stejného typu – **redukování** (`reduce`), **výběr min/max**.
* `minBy(cmp)`, `maxBy(cmp)` – užitečné pro deterministické redukce (nezapomeňte, že při shodě rozhoduje implementace komparátoru).
* **Signatura**: `T apply(T a, T b)`
* **Pomocníci**: `minBy(cmp)`, `maxBy(cmp)`

```java
BinaryOperator<Integer> sum = Integer::sum;
int s = sum.apply(10, 20); // 30

Comparator<String> byLen = Comparator.comparingInt(String::length);
BinaryOperator<String> longer = BinaryOperator.maxBy(byLen);
System.out.println(longer.apply("Kočka", "Tygr")); // „Kočka“
```

## Dvojvstupové varianty (Bi-*)

### BiConsumer<T,U>

* Dvě hodnoty, žádný návrat – např. `Map::put`, logování párů, akumulace do kolekcí.
* **Signatura**: `void accept(T t, U u)`

```java
BiConsumer<String, Integer> printPair = (name, age) ->
    System.out.println(name + " (" + age + ")");
printPair.accept("Ema", 30);
```

### BiFunction<T,U,R>

* Dva vstupy, jeden výstup – skládání klíčů, spojování entit.
* **Signatura**: `R apply(T t, U u)`

```java
BiFunction<String, String, String> join = (a, b) -> a + " & " + b;
System.out.println(join.apply("ACE", "BDF")); // „ACE & BDF“
```

### BiPredicate<T,U>

* Booleovský test nad dvojicí – př. „soubor končí příponou“, „uživatel má roli“.
* **Signatura**: `boolean test(T t, U u)`

```java
BiPredicate<String, String> endsWith = String::endsWith;
System.out.println(endsWith.test("soubor.txt", ".txt")); // true
```

## Primární specializace (bez autoboxingu)

> Používejte kvůli výkonu u číselných streamů (`IntStream`, `LongStream`, `DoubleStream`).

* **Supplier**: `IntSupplier`, `LongSupplier`, `DoubleSupplier`, `BooleanSupplier`
* **Consumer**: `IntConsumer`, `LongConsumer`, `DoubleConsumer`, a smíšené `ObjIntConsumer<T>` apod.
* **Predicate**: `IntPredicate`, `LongPredicate`, `DoublePredicate`
* **Function**:

  * `IntFunction<R>`, `LongFunction<R>`, `DoubleFunction<R>` (prim → objekt)
  * `ToIntFunction<T>`, `ToLongFunction<T>`, `ToDoubleFunction<T>` (objekt → prim)
  * křížové převody: `IntToLongFunction`, `IntToDoubleFunction`, `LongToIntFunction`, `DoubleToIntFunction`, …
* **Operátory**: `IntUnaryOperator`, `LongUnaryOperator`, `DoubleUnaryOperator`, `IntBinaryOperator`, `LongBinaryOperator`, `DoubleBinaryOperator`

```java
IntPredicate even = x -> (x & 1) == 0;
int sumSquaresEven = IntStream.of(1,2,3,4,5,6)
    .filter(even)
    .map(x -> x * x)      // IntUnaryOperator
    .sum();               // 4^2 + 6^2 = 52
```

## Další běžná funkční rozhraní v JDK

### Runnable vs. Callable<V>

* `Runnable#run()`: bez návratu, bez checked výjimek. Používá se pro **jednoduché úlohy** (vlákna, plánovače).
* `Callable#call()` vrací `V`, může **checked exception** – vhodné pro `ExecutorService#submit`. Pokud nepotřebujete výsledek, použijte `Runnable` (méně režie).
* **Tip:** Pro jednoduché úlohy často stačí `CompletableFuture.supplyAsync(...)` (vrací výsledek a hezky se skládá).

### FileFilter / FilenameFilter

* Lehká filtrace v IO – pro moderní práci se soubory preferujte často **NIO** (`Files.find`, `PathMatcher`).

### PathMatcher (NIO.2)

* Vzory `glob:` a `regex:`; `glob:**/*.java` → rekurzivní shoda.

## Method references (detail)

* `obj::instMetoda` – vázaná na instanci (`out::println`).
* `Třída::statMetoda` – statická (`Integer::parseInt`).
* `Třída::new` – konstruktor (`ArrayList::new`).
* `Třída::instMetoda` – **nevázaná** instance metoda, první argument je příjemcem (`String::toUpperCase` v kontextu `Function<String,String>`).

## Streams – idiomatické drobnosti

* **Nepoužívejte `forEach` k mutaci sdílených struktur** v paralelním streamu.
* Preferujte **kolektorové operace** (`collect`, `toList`, `groupingBy`) a **čisté** map/filter kroky.
  *Pozn.: **neměnné kolekce `List.of(...)`, `Set.of(...)`, `Map.of(...)`** – **(od Java 9+)***.

## Comparable<T> a Comparator<T>

### Rozdíl v jedné větě

* **`Comparable<T>`**: **přirozené pořadí** je definováno **uvnitř třídy** metodou `compareTo`.
* **`Comparator<T>`**: **externí** strategie porovnání – můžete jich mít víc a libovolně je **řetězit**.

### Signatury (zkráceně)

```java
public interface Comparable<T> {
    int compareTo(T other); // this ? other: záporné / 0 / kladné
}

public interface Comparator<T> {
    int compare(T a, T b);
    // default metody:
    Comparator<T> reversed();
    Comparator<T> thenComparing(Comparator<? super T> other);
    // a továrny:
    static <T,U extends Comparable<? super U>> Comparator<T> comparing(Function<T,U> keyExtractor) { ... }
    static <T> Comparator<T> nullsFirst(Comparator<? super T> cmp) { ... }
    static <T> Comparator<T> naturalOrder() { ... }
    // atd.
}
```

## Kontexty a pravidla

* **Konzistence s equals:**

  * Doporučeno: `compareTo(a,b) == 0 ⇔ a.equals(b)` (není striktně vyžadováno, ale vyhnete se překvapením v `SortedSet`/`SortedMap`).
* **Transitivita:**

  * `a > b` a `b > c` ⇒ `a > c` (platí pro `Comparable` i `Comparator`).
* **Antisymetrie:**

  * `signum(compare(a,b)) == -signum(compare(b,a))`.
* **Null bezpečnost:**

  * `Comparator` nabízí `nullsFirst/Last`; u `Comparable` null prostě neporovnáváte (NPE).
* **Stabilita vs. nestabilita:**

  * `Comparator` neřeší stabilitu třídění sám o sobě; stabilitu zajišťuje algoritmus (Java 8+ používá Timsort, který je stabilní pro referenční typy).

## Implementace v custom třídě – „Přirozené pořadí“

Řekněme, že máme entitu `Person` s přirozeným pořadím podle `lastName`, `firstName`, `age`.

```java
public final class Person implements Comparable<Person> {
    private final String firstName;
    private final String lastName;
    private final int age;

    public Person(String firstName, String lastName, int age) {
        this.firstName = Objects.requireNonNull(firstName);
        this.lastName  = Objects.requireNonNull(lastName);
        this.age       = age;
    }

    public String firstName() { return firstName; }
    public String lastName()  { return lastName; }
    public int age()          { return age; }

    @Override
    public int compareTo(Person other) {
        int byLast = lastName.compareTo(other.lastName);
        if (byLast != 0) return byLast;

        int byFirst = firstName.compareTo(other.firstName);
        if (byFirst != 0) return byFirst;

        return Integer.compare(age, other.age);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Person p)) return false;
        // pokud chceme konzistenci s compareTo == 0, musíme použít stejné klíče:
        return age == p.age &&
               firstName.equals(p.firstName) &&
               lastName.equals(p.lastName);
    }

    @Override
    public int hashCode() {
        return Objects.hash(firstName, lastName, age);
    }

    @Override
    public String toString() {
        return "%s %s (%d)".formatted(firstName, lastName, age); // (od Java 15+)
    }
}
```

Použití přirozeného pořadí:

```java
List<Person> people = List.of( // (od Java 9+)
    new Person("Adam","Novák",25),
    new Person("Bára","Adamová",30),
    new Person("Adam","Novák",20)
);
List<Person> sorted = new ArrayList<>(people);
Collections.sort(sorted); // použije compareTo
```

### Externí komparátory – více pohledů na třídění

Někdy chcete třídit různě (např. podle věku sestupně, nebo podle délky jména). To vyřeší **`Comparator`**:

```java
Comparator<Person> byAgeDesc =
    Comparator.comparingInt(Person::age).reversed();

Comparator<Person> byFirstLenThenLast =
    Comparator.comparingInt((Person p) -> p.firstName().length())
              .thenComparing(Person::lastName);

Comparator<Person> byLastThenFirstCaseInsensitive =
    Comparator.comparing(Person::lastName, String.CASE_INSENSITIVE_ORDER)
              .thenComparing(Person::firstName, String.CASE_INSENSITIVE_ORDER);

// Null-friendly (pokud některé pole může být null):
Comparator<Person> byNickNullable =
    Comparator.comparing(Person::firstName, Comparator.nullsLast(Comparator.naturalOrder()));
```

Použití:

```java
people.stream().sorted(byAgeDesc).forEach(System.out::println);
```

### Praktické vzory s Comparator

* **Lokální porovnávání (locale-aware):**

  ```java
  Collator cs = Collator.getInstance(new Locale("cs","CZ"));
  Comparator<String> cz = (a,b) -> cs.compare(a,b);
  Comparator<Person> byLastCz = Comparator.comparing(Person::lastName, cz);
  ```
* **Kompozice vícestupňového třídění:** `thenComparing(...)` je idiomatické.
* **Bezpečí vůči NPE:** vždy zvažte `nullsFirst/Last` kolem `naturalOrder` nebo custom cmp.

### Komparátor ve třídě – praktický příklad

```java
import java.text.Collator;
import java.util.*;
import static java.util.Comparator.*;

public final class Book {
    private final String title;      // může být null (např. neznámé)
    private final String author;     // může být null
    private final int year;          // rok vydání
    private final int pages;         // počet stran
    private final Double rating;     // 0.0–5.0; může být null

    public Book(String title, String author, int year, int pages, Double rating) {
        this.title  = title;
        this.author = author;
        this.year   = year;
        this.pages  = pages;
        this.rating = rating;
    }
    public String title()  { return title; }
    public String author() { return author; }
    public int year()      { return year; }
    public int pages()     { return pages; }
    public Double rating() { return rating; }

    // --------- Praktické komparátory (statická pole uvnitř třídy) ----------

    /** Locale-aware porovnání názvů (čeština), null na konec. */
    public static final Comparator<Book> BY_TITLE_CZ =
        comparing(Book::title,
                  nullsLast(Collator.getInstance(new Locale("cs", "CZ"))));

    /** Autor (CZ), při shodě název (CZ), pak rok vzestupně. */
    public static final Comparator<Book> BY_AUTHOR_THEN_TITLE_THEN_YEAR =
        comparing(Book::author,
                  nullsLast(Collator.getInstance(new Locale("cs", "CZ"))))
        .thenComparing(Book::title,
                  nullsLast(Collator.getInstance(new Locale("cs", "CZ"))))
        .thenComparingInt(Book::year);

    /** Hodnocení sestupně, pak počet stran vzestupně, null rating až na konec. */
    public static final Comparator<Book> BY_RATING_DESC_THEN_PAGES =
        comparing(Book::rating, nullsLast(naturalOrder()))
        .reversed()
        .thenComparingInt(Book::pages);

    /** Rok vydání sestupně (novější první), při shodě název. */
    public static final Comparator<Book> BY_YEAR_DESC =
        comparingInt(Book::year).reversed()
        .thenComparing(b -> Optional.ofNullable(b.title()).orElse(""));

    // ---------- Ukázka továrního komparátoru (parametrizace) ---------------

    /** Továrna: porovná dle počtu stran, volitelně sestupně. */
    public static Comparator<Book> byPages(boolean descending) {
        Comparator<Book> cmp = comparingInt(Book::pages);
        return descending ? cmp.reversed() : cmp;
    }

    @Override public String toString() {
        return "%s — %s (%d), %d s., ⭐%s"
               .formatted(title, author, year, pages, rating); // (od Java 15+)
    }
}
```

#### Použití

```java
List<Book> shelf = List.of( // (od Java 9+)
    new Book("Život je jinde", "Milan Kundera", 1969, 360, 4.5),
    new Book(null, "Neznámý autor", 2001, 120, null),
    new Book("Bílá nemoc", "Karel Čapek", 1937, 168, 4.7),
    new Book("RUR", "Karel Čapek", 1920, 192, 4.2),
    new Book("Spalovač mrtvol", "Ladislav Fuks", 1967, 160, 4.6)
);

// 1) Řazení podle autora → názvu → roku (CZ, null-last):
var byAuthor = new ArrayList<>(shelf); // (od Java 10+)
byAuthor.sort(Book.BY_AUTHOR_THEN_TITLE_THEN_YEAR);
byAuthor.forEach(System.out::println);

// 2) Top knihy: hodnocení sestupně, pak kratší první při shodě:
var byRating = new ArrayList<>(shelf); // (od Java 10+)
byRating.sort(Book.BY_RATING_DESC_THEN_PAGES);
byRating.forEach(System.out::println);

// 3) Stromově řazená množina podle názvu (CZ, null-last):
var nameIndex = new TreeSet<>(Book.BY_TITLE_CZ); // (od Java 10+ pro 'var')
nameIndex.addAll(shelf);
System.out.println("Index velikost: " + nameIndex.size());

// 4) Třídění podle počtu stran, dynamicky zvolené pořadí:
var byPagesDesc = new ArrayList<>(shelf); // (od Java 10+)
byPagesDesc.sort(Book.byPages(true)); // true = sestupně
byPagesDesc.forEach(System.out::println);
```

### Poznámky k praxi

* **`nullsFirst/Last`**: u doménových polí, která mohou být `null`, zamezí NPE a dává jasnou politiku.
* **Locale-aware (`Collator`)**: pro češtinu/neanglické jazyky zásadní (řazení „Č“, „Ř“…).
* **Řetězení (`thenComparing`)**: čitelné vícestupňové třídění; u čísel používejte `comparingInt/Long/Double` (ne odčítání).
* **`TreeSet`/`TreeMap`**: „duplicita“ je dána **porovnáním == 0**, ne `equals`. Dbejte na zamýšlenou definici rovnosti v rámci setu/maps.

### Typické chyby a pasti

* **Nekonzistence s `equals`:**

  * V `TreeSet` se prvek s `compareTo == 0` považuje za duplicitní – **nebude vložen**, i když `equals` by byl `false`.
* **Porovnávání plovoucích čísel:**

  * Preferujte `Double.compare(a,b)`/`Float.compare(a,b)` – ošetřuje NaN a ±0.0.
* **Klamné odčítání:**

  ```java
  // ŠPATNĚ: může přetéct!
  (a, b) -> a.age - b.age
  // SPRÁVNĚ:
  Comparator.comparingInt(Person::age)
  ```

## Comparator vs Comparable – kdy použít které?

* **`Comparable`**:

  * Když má třída **jedno přirozené pořadí** (např. `String`, `BigDecimal`).
  * Hodí se pro **klíče** v `TreeSet`/`TreeMap`, kde chcete implicitní řazení.
* **`Comparator`**:

  * Když potřebujete **více způsobů třídění** (uživatelské preference, různé pohledy).
  * Když třída není pod vaší kontrolou (nemůžete do ní implementovat `Comparable`).
  * Když potřebujete **null-friendly** nebo **locale-aware** řazení.

## Skládání funkcí – praktické patterny (krátce navíc)

### Bezpečné parsování s fallbackem

```java
Function<String, OptionalInt> toInt =
    s -> {
        try { return OptionalInt.of(Integer.parseInt(s.trim())); }
        catch (NumberFormatException e) { return OptionalInt.empty(); }
    };
```

### Validace a mapování chyb

```java
Predicate<String> looksLikeEmail = s -> s != null && s.contains("@");
Function<String, String> normalize = String::trim;

Function<String, String> requireEmail =
    normalize.andThen(s -> {
        if (!looksLikeEmail.test(s)) throw new IllegalArgumentException("Email?");
        return s.toLowerCase(Locale.ROOT);
    });
```

## Rozšíření

### 1) Memoizovaný Supplier

```java
static <T> Supplier<T> memoize(Supplier<T> src) {
    final AtomicReference<T> ref = new AtomicReference<>();
    return () -> {
        T v = ref.get();
        if (v != null) return v;
        synchronized (ref) {
            v = ref.get();
            if (v == null) {
                v = src.get();
                ref.set(v);
            }
            return v;
        }
    };
}
```

### 2) Bezvýjimkový wrapper (checked → unchecked)

Už máte:

```java
@FunctionalInterface
interface ThrowingFunction<T,R> { R apply(T t) throws Exception; }

static <T,R> Function<T,R> wrap(ThrowingFunction<T,R> tf) {
    return t -> {
        try { return tf.apply(t); }
        catch (Exception e) { throw new RuntimeException(e); }
    };
}
```

Varianta s vlastní výjimkou:

```java
static <T,R> Function<T,R> wrap(ThrowingFunction<T,R> tf, Function<Exception, RuntimeException> map) {
    return t -> {
        try { return tf.apply(t); }
        catch (Exception e) { throw map.apply(e); }
    };
}
```

# Porovnání Comparable vs Comparator

|                     | Comparable                    | Comparator                           |
| ------------------- | ----------------------------- | ------------------------------------ |
| Kde je definován    | Uvnitř třídy (`compareTo`)    | Mimo třídu (libovolně mnoho)         |
| Účel                | Přirozené, jednoznačné pořadí | Různé strategie třídění              |
| Řetězení            | Ne (v rámci `compareTo`)      | Ano (`thenComparing`, `reversed`, …) |
| Null-friendly       | Ne                            | Ano (`nullsFirst/Last`)              |
| Locale/Collation    | Složitější                    | Snadné přes `Collator`               |
| Použití v kolekcích | `TreeSet`, `TreeMap` bez cmp  | `TreeSet`, `TreeMap` s cmp           |

## Integrované třídění v kolekcích

```java
var list = new ArrayList<>(people); // (od Java 10+)

// 1) Přirozené pořadí (Comparable)
list.sort(null);

// 2) Explicitní Comparator
list.sort(Comparator.comparing(Person::lastName)
                    .thenComparing(Person::firstName)
                    .thenComparingInt(Person::age)); // stabilní a čitelné
```
