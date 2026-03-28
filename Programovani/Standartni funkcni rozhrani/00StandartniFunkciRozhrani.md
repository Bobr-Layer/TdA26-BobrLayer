# Funkční rozhraní (SAM)

* Rozhraní s **jedinou abstraktní metodou** (Single Abstract Method).
* Lze na něj přiřadit **lambda výraz** nebo **method reference**.
* Anotace `@FunctionalInterface` není povinná, ale chrání před omyly.

```java
@FunctionalInterface
interface Formatter<T> {
    String format(T value);  // jediná abstraktní metoda (SAM)
}
```

## Základní čtyřka

### Supplier\<T>

* **Co**: dodá hodnotu, nic nepřebírá.
* **Kdy**: lazy vytvoření, generátory, cache, DI.
* **Signatura**: `T get()`

```java
Supplier<UUID> uuid = UUID::randomUUID;
System.out.println(uuid.get()); // vygeneruje nové UUID
```

### Consumer\<T>

* **Co**: „spotřebuje“ hodnotu, nic nevrací.
* **Kdy**: logování, sběr do kolekcí, side-effect akce.
* **Signatura**: `void accept(T t)`
* **Skládání**: `andThen`

```java
Consumer<String> log = System.out::println;
Consumer<String> logUpper = s -> System.out.println(s.toUpperCase());
log.andThen(logUpper).accept("ahoj"); // vypíše „ahoj“ a pak „AHOJ“
```

### Function\<T,R>

* **Co**: transformace `T → R`.
* **Kdy**: mapování, převody typů, adaptér.
* **Signatura**: `R apply(T t)`
* **Skládání**: `andThen`, `compose`, `identity()`

```java
Function<String, Integer> length = String::length;
Function<Integer, Boolean> isLong = n -> n > 5;
boolean res = length.andThen(isLong).apply("Java Streams"); // true
```

### Predicate\<T>

* **Co**: booleovský test.
* **Kdy**: filtrování, pravidla, validace.
* **Signatura**: `boolean test(T t)`
* **Skládání**: `and`, `or`, `negate`

```java
Predicate<String> nonEmpty = s -> !s.isEmpty();
Predicate<String> longEnough = s -> s.length() >= 3;
boolean ok = nonEmpty.and(longEnough).test("ABC"); // true
```

## Operátory (T → T)

### UnaryOperator\<T>

* **Co**: „uprav sám sebe“ — stejný typ vstupu i výstupu.
* **Signatura**: `T apply(T t)`

```java
UnaryOperator<String> trimAndUpper = s -> s.trim().toUpperCase();
System.out.println(trimAndUpper.apply("  ahoj ")); // „AHOJ“
```

### BinaryOperator\<T>

* **Co**: kombinuje dvě `T` do jednoho `T`.
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

* **Co**: spotřebuje dva vstupy.
* **Signatura**: `void accept(T t, U u)`

```java
BiConsumer<String, Integer> printPair = (name, age) ->
    System.out.println(name + " (" + age + ")");
printPair.accept("Ema", 30);
```

### BiFunction<T,U,R>

* **Co**: dva vstupy → výstup.
* **Signatura**: `R apply(T t, U u)`

```java
BiFunction<String, String, String> join = (a, b) -> a + " & " + b;
System.out.println(join.apply("ACE", "BDF")); // „ACE & BDF“
```

### BiPredicate<T,U>

* **Co**: test nad dvojicí.
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

### Comparator<T> (java.util)

* **SAM**: `int compare(T a, T b)`
* **Bohatá API**: `comparing`, `thenComparing`, `reversed`, `nullsFirst/Last`, `naturalOrder`

```java
record Person(String name, int age) {}
List<Person> ps = List.of(new Person("Adam",25), new Person("Bára",25), new Person("Ema",30));
ps.stream()
  .sorted(Comparator.comparingInt(Person::age).thenComparing(Person::name))
  .forEach(System.out::println);
```

### Runnable (java.lang) vs. Callable<V> (java.util.concurrent)

* **Runnable**: `void run()` — bez návratové hodnoty, bez checked výjimek.
* **Callable**: `V call() throws Exception` — vrací hodnotu, může vyhazovat výjimky.

```java
ExecutorService pool = Executors.newFixedThreadPool(2);
Future<Integer> f = pool.submit((Callable<Integer>) () -> 40 + 2);
System.out.println(f.get()); // 42
pool.shutdown();
```

### FileFilter / FilenameFilter

```java
FilenameFilter onlyTxt = (dir, name) -> name.endsWith(".txt");
String[] files = new File("/tmp").list(onlyTxt);
```

### PathMatcher (java.nio.file)

```java
PathMatcher mm = FileSystems.getDefault().getPathMatcher("glob:**/*.java");
boolean matches = mm.matches(Path.of("src/Main.java")); // true
```

## Method references (kratší lambdy)

Typy: `objekt::instMetoda`, `Třída::statMetoda`, `Třída::new`, `Třída::instMetoda`

```java
List<String> xs = List.of("a","bb","ccc");
xs.stream().map(String::length).forEach(System.out::println); // 1,2,3

Supplier<List<String>> newList = ArrayList::new; // konstruktor reference
BiFunction<String, String, Boolean> endsWith = String::endsWith;
```

## Skládání funkcí (idiomaticky)

```java
Function<String, String> trim = String::trim;
Function<String, String> upper = String::toUpperCase;
Function<String, Integer> len = String::length;

int L = trim.andThen(upper).andThen(len).apply("  ahoj  "); // 4
```

```java
Predicate<String> nonBlank = s -> !s.isBlank();
Predicate<String> hasAt = s -> s.contains("@");
Predicate<String> validEmailLike = nonBlank.and(hasAt);
```

## Streams — rychlé minipříklady

```java
// map/filter/reduce s velkou čtyřkou
int total = Stream.of("Java", "Lambda", "Stream")
    .filter(s -> s.length() >= 5)     // Predicate<String>
    .map(String::length)              // Function<String,Integer>
    .reduce(0, Integer::sum);         // BinaryOperator<Integer>

// forEach s Consumerem
Stream.of(1,2,3).forEach(n -> System.out.print(n + " ")); // 1 2 3
```

## Vlastní funkční rozhraní (kdy a jak)

* Potřebuješ **checked výjimky** nebo **specifickou signaturu**.
* Přidej `@FunctionalInterface`.
* Můžeš nabídnout adaptér pro převod na „bezvýjimkovou“ funkci.

```java
@FunctionalInterface
interface ThrowingFunction<T,R> { R apply(T t) throws Exception; }

static <T,R> Function<T,R> wrap(ThrowingFunction<T,R> tf) {
    return t -> {
        try { return tf.apply(t); }
        catch (Exception e) { throw new RuntimeException(e); }
    };
}

// použití
Function<Path, String> readAll = wrap(p -> Files.readString(p, StandardCharsets.UTF_8));
```

## Časté drobnosti a pasti

* **Autoboxing**: u čísel preferuj `Int*`, `Long*`, `Double*` varianty.
* **Vedlejší efekty** (`Consumer`): pozor při paralelním zpracování.
* **Zachycené proměnné**: lambda může použít jen *efektivně finální* lokální proměnné.
* **Geniční inference**: někdy pomůže přidat explicitní typ (`<String, Integer>`), když se překladač „zasekne“.
* **equals/hashCode**: lambdy nejsou „objekty“ se stabilní identitou, neukládej je jako klíče do map kvůli porovnávání.

## Mini-kuchařka „z praxe“

**1) Validace vstupu**

```java
Predicate<String> notBlank = s -> s != null && !s.isBlank();
void require(Predicate<String> pred, String s) {
    if (!pred.test(s)) throw new IllegalArgumentException("Neplatný vstup");
}
```

**2) Lazy zdroj**

```java
Supplier<Connection> conn = () -> DriverManager.getConnection(url, user, pass);
// otevře se až při prvním volání:
try (var c = conn.get()) { /* ... */ }
```

**3) Akční pipeline**

```java
Consumer<String> save = s -> repo.save(s);
Consumer<String> logOk = s -> System.out.println("Uloženo: " + s);
Consumer<String> saveAndLog = save.andThen(logOk);
saveAndLog.accept("záznam-001");
```

**4) Vlastní „min/max“ s komparátorem**

```java
Comparator<Path> bySize = Comparator.comparingLong(p -> p.toFile().length());
BinaryOperator<Path> bigger = BinaryOperator.maxBy(bySize);
Path winner = Stream.of(dir.listFiles()).map(File::toPath).reduce(bigger).orElseThrow();
```
