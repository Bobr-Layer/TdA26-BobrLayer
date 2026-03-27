# Rozhraní - interface

* **Kontrakt chování**: definuje *co* typ umí, ne *jak* to dělá.
* **Bez stavu**: nemůže mít instanční pole (výjimkou jsou **konstanty** – implicitně `public static final`).
* **Metody**: mohou být

  * **abstraktní** (implicitně `public abstract`),
  * **defaultní** (s implementací; Java 8+),
  * **statické** (`static`; Java 8+),
  * **privátní** (`private` a `private static` – pomocné pro defaultní metody; **Java 9+**).

> Třída může implementovat **více rozhraní** (forma „mnohonásobné dědičnosti chování“). Rozhraní může **rozšiřovat více rozhraní**.

## Obecné signatury

### Základní rozhraní

**Definice**: Rozhraní je typ, který definuje sadu metod, které musí implementovat jakákoliv třída, jež toto rozhraní implementuje. Rozhraní nemůže mít instanční pole (může mít pouze konstanty) a nemůže obsahovat implementaci metod (až na výjimky pro defaultní a statické metody).

```java
[annotations]
[public | package-private] interface Jmeno
    [<T extends ... , U ...>]
    [extends Rozhrani1, Rozhrani2, ...] {
    // konstanty (public static final)
    // metody: abstract | default | static | private   // private v interface: Java 9+
    // vnořené typy (implicitně public static)
}
```

### Sealed rozhraní (**Java 17+**)

**Definice:** Rozhraní, které omezuje, které třídy nebo rozhraní jej mohou implementovat nebo rozšiřovat. Toto je užitečné pro kontrolu hierarchie typů a zajištění bezpečnosti typů.

```java
[annotations]
public sealed interface Jmeno
    permits Implementace1, Implementace2, ... {
    // ...
}
```

### Pravidla a vlastnosti

| Prvek                                   | Platí     | Poznámka                                                                  |
| --------------------------------------- | ---------- | -------------------------------------------------------------------------- |
| **Instanční pole**              | ❌         | Není stav. Jen**konstanty**: `public static final` (implicitně). |
| **Konstruktory**                  | ❌         | Rozhraní se**neinstancuje**.                                        |
| **Metody bez těla**              | ✅         | `public abstract` (implicitně).                                         |
| **`default` metody**            | ✅         | Mají tělo; lze je volat a i**překrývat** v implementacích.      |
| **`static` metody**             | ✅         | Volají se přes `Rozhrani.metoda()`.                                    |
| **`private` metody**            | ✅         | Pomocné pro `default`/`static` (**Java 9+**).                   |
| **Vnořené typy**                | ✅         | Implicitně `public static`.                                             |
| **Rozšíření více rozhraní** | ✅         | `interface A extends B, C {}`                                            |
| **Implementace více rozhraní**  | ✅         | `class X implements A, B {}`                                             |
| **Konflikt `default` metod**    | Řeší se | Třída**musí** konflikt vyřešit (viz níže).                    |

### Defaultní a statické metody (Java 8+)

**`default` metody:** Umožňují přidat novou metodu do rozhraní bez nutnosti měnit všechny implementující třídy. Mohou být přepsány v implementacích.

```java
public interface MyInterface {
    default void defaultMethod() {
        System.out.println("This is a default method.");
    }
}
```

**`static` metody:** Mohou být volány přímo na rozhraní a nejsou děděny implementujícími třídami.

```java
public interface MyInterface {
    static void staticMethod() {
        System.out.println("This is a static method.");
    }
}
```

### Soukromé metody v rozhraní (Java 9+)

**`private` metody:** Umožňují sdílet kód mezi `default` a `static` metodami v rozhraní, aniž by byly přístupné zvenčí.

```java
public interface MyInterface {
    private void privateHelper() {
        System.out.println("This is a private helper method.");
    }

    default void defaultMethod() {
        privateHelper();
    }

    static void staticMethod() {
        // Nelze volat privateHelper() zde, protože je to instance metoda
    }
}
```

## Vícenásobná dědičnost rozhraní a diamantový problém
Rozhraní umožňují **vícenásobnou dědičnost**, což znamená, že třída může implementovat více rozhraní najednou, nebo rozhraní může dědit z více rozhraní zároveň. To může vést k situacím, kdy dvě rozhraní definují metodu se stejnou signaturou, což vytváří tzv. **diamantový problém**.

**Problém vícenásobné dědičnosti:** co když dva předci mají stejnou metodu/pole? → **Diamantový problém.**

```
    A
   / \
  B   C
   \ /
    D
```

* Proč není diamantový problém u tříd?
* Java má **single inheritance** tříd ⇒ třída nemůže dědit z více tříd najednou ⇒ žádné kolize implementací/stavu mezi třídami.

>**Definice diamantového problému u rozhraní:** Když třída implementuje dvě rozhraní, která obě definují metodu se stejnou signaturou, vzniká konflikt, protože není jasné, kterou implementaci by měla třída použít.

### Diamant u rozhraní (default metody)

Rozhraní mohou mít **default** metody. Pokud třída implementuje více rozhraní se **stejnou signaturou** default metody, může vzniknout konflikt („diamant“ metod).

### Základní pravidla rozřešení

1. **Třída vítězí nad rozhraními**
   Pokud předek třídy (superclass) poskytuje metodu, ta má přednost i před defaulty rozhraní.
2. **Specifičtější rozhraní vítězí**
   Když je stejná default metoda zděděna více cestami a **jen jedno** z rozhraní ji **překrylo**, použije se ta „nejbližší/nejkonkrétnější“ (tj. rozhraní, které je níž v hierarchii).
3. **Skutečný konflikt → musíš přepsat**
   Pokud dvě (nebo více) rozhraní poskytují **různé** default implementace téže metody, kompilátor vyžaduje, abys ji **překryl v třídě** a explicitně zvolil variantu pomocí `X.super.metoda()`.
4. **Metody z `Object` nelze „předefinovat“ defaultem**
   Rozhraní nesmí dodat default pro `equals/hashCode/toString`; třída má vždy „objektovou“ verzi (žádný konflikt).
5. **Statické metody rozhraní se nedědí**
   Volají se kvalifikovaně (`IFace.m()`). Mezi statiky rozhraní tudíž nevzniká konflikt.
6. **Pole v rozhraní jsou vždy `public static final`**
   Nejsou děděna jako instance stav, přistupuje se kvalifikovaně; žádný „diamantový“ stav nevzniká.

### Scénáře a ukázky

#### 1) Klasický „diamant“: dvě odlišné default implementace

```java
interface I1 {
    default void f() { System.out.println("I1"); }
}
interface I2 {
    default void f() { System.out.println("I2"); }
}

class D implements I1, I2 {
    // Kompilátor: konflikt – je nutné rozřešit:
    @Override public void f() {
        I1.super.f();     // explicitní volba – nebo I2.super.f();
        // případně vlastní kombinovaná logika
    }
}
```

#### 2) Specifičtější rozhraní vítězí (bez nutnosti zásahu)

```java
interface Base { default void f() { System.out.println("Base"); } }
interface Left extends Base { }                  // nepřepisuje f()
interface Right extends Base { @Override default void f(){ System.out.println("Right"); } }

class D implements Left, Right {
    // Použije se Right.f(), protože Right je specifičtější a f() přepisuje.
    // Není nutné nic přepisovat, toto se zkompiluje a poběží "Right".
}
```

#### 3) Třída > rozhraní (třída „přebije“ default)

```java
class Super {
    public void f() { System.out.println("Super"); }
}
interface I { default void f(){ System.out.println("I"); } }

class D extends Super implements I {
    // Výsledek: "Super" – metoda ze třídy má přednost před defaultem.
}
```

#### 4) Žádný konflikt: dvě rozhraní deklarují stejnou **abstraktní** metodu

```java
interface I1 { void g(); }   // bez defaultu
interface I2 { void g(); }

class D implements I1, I2 {
    // Stačí jedna implementace → žádný konflikt
    public void g() { System.out.println("OK"); }
}
```

#### 5) Volání konkrétní default implementace z třídy

Můžeš zkombinovat více defaultů:

```java
interface I1 { default String s(){ return "I1"; } }
interface I2 { default String s(){ return "I2"; } }

class D implements I1, I2 {
    @Override public String s() {
        return I1.super.s() + "+" + I2.super.s(); // "I1+I2"
    }
}
```

## Funkční rozhraní (Single Abstract Method (SAM); Java 8+)

**Definice:** Rozhraní, které obsahuje právě jednu abstraktní metodu. Taková rozhraní jsou základem pro lambda výrazy a method references v Javě.

Anotace `@FunctionalInterface` je volitelná, ale doporučená, protože zajistí, že rozhraní skutečně splňuje podmínky funkčního rozhraní (kompilátor vynutí, že nesmí mít více než jednu abstraktní metodu).

```java
@FunctionalInterface
public interface Op<T, R> {
    R apply(T t);                 // jediná abstraktní metoda
    default Op<T,R> andThen(Op<R,?> next) { /* ... */ }  // libovolné defaultní
    static <X> Op<X,X> identity(){ return x -> x; }      // statická továrna
}
```

> Pozn.: Metody z `Object` (např. `toString`, `equals`) se do „jediné abstraktní metody“ **nepočítají**.

### Lambda výrazy a rozhraní

* **Krátká funkce** (bez jména) přiřaditelná do proměnné a předávaná jako argument.
* V Javě je lambda vždy přiřazena k **funkčnímu rozhraní** (*Single Abstract Method = SAM*).

```java
// Funkční rozhraní (jedna abstraktní metoda)
@FunctionalInterface
interface Op { int apply(int x); }

// Lambda přiřazená k SAM
Op inc = x -> x + 1;
System.out.println( inc.apply(41) ); // 42
```

### K čemu slouží

* Zkracuje anonymní třídy pro SAM (Comparator, Runnable, Callable, Listener…).
* Umožňuje styl „funkčního“ programování: **Stream API**, filtry/mapy/redukce, třídění atd.

### Obecná syntaxe (tvary)

```java
// (parametry) -> výraz
x -> x + 1

// (parametry) -> { blok; return ...; }
(x, y) -> { int z = x + y; return z * 2; }

// Typy parametrů jsou obvykle odvozeny (target typing)
(String s) -> s.trim()     // typ explicitně
s -> s.trim()              // typ odvozen
```

* **0 parametrů:** `() -> 42`
* **1 parametr (bez typu, bez závorek):** `x -> x * x`
* **Více parametrů:** `(a, b) -> a + b`
* **Tělo jako blok:** musí obsahovat `return`, pokud má návratovou hodnotu.
* Od Javy **11** lze v parametrech použít `var` (a tím i anotace): `(var s) -> s.trim()` (**Java 11+**).

### Vazba na funkční rozhraní (SAM)

```java
@FunctionalInterface
interface Transformer<T> { T apply(T t); } // jediná abstraktní metoda

Transformer<String> exclaim = s -> s + "!";
```

> Metody zděděné z `Object` (např. `toString`) se do „jediné abstraktní metody“ **nepočítají**.

Běžná hotová SAM rozhraní (java.util.function):

* **Predicate `<T>`**: `boolean test(T t)`
* **Function<T,R>**: `R apply(T t)`
* **Consumer `<T>`**: `void accept(T t)`
* **Supplier `<T>`**: `T get()`
* **UnaryOperator `<T>` / BinaryOperator `<T>`**
* **BiFunction<T,U,R>**, **BiConsumer<T,U>**, **BiPredicate<T,U>**

### Method references (zkratky k lambdám)

```java
// 1) Statická metoda
Function<String, Integer> f1 = Integer::parseInt;     // s -> Integer.parseInt(s)

// 2) Instance konkrétního objektu
Consumer<String> f2 = System.out::println;            // s -> System.out.println(s)

// 3) „Unbound“ instance metoda (první parametr je příjemce)
BiPredicate<String, String> f3 = String::startsWith;  // (s, pref) -> s.startsWith(pref)

// 4) Konstruktor
Supplier<ArrayList<String>> f4 = ArrayList::new;      // () -> new ArrayList<>()
```

### Typová inference a „target typing“

Cílový typ (proměnná/parametr) určuje, **které SAM** se použije a jaké jsou **typy parametrů**:

```java
Comparator<String> byLen = (a, b) -> Integer.compare(a.length(), b.length());

List<String> xs = List.of("aa", "b", "ccc");   // **Java 9+**
xs.sort(byLen);
```

Pokud je inference nejasná, dopiš typy parametrů nebo použij přetypování:

```java
Function<Object, String> f = (Object o) -> String.valueOf(o);
// nebo
Function<?, ?> g = (Function<Object, String>) (Object o) -> o.toString();
```

### Rozsah, `this`, „efektivně final“

* Lambda **nezavádí vlastní `this`** → `this` odkazuje na **enclosing** instanci (na rozdíl od anonymní třídy).
* Lambda může „zachytit“ proměnné okolí, ale **jen pokud jsou efektivně final** (po prvním přiřazení se nemění).

```java
int base = 10;                 // efektivně final
Function<Integer,Integer> add = x -> x + base; // OK
// base++;                     // tohle by rozbilo zachycení
```

Chceš-li měnit hodnotu, použij **wrapper**:

```java
var sum = new int[]{0};
IntConsumer addToSum = v -> sum[0] += v;  // mutace uvnitř pole
```

### Výjimky v lambdách

Checked výjimky musí být v **signatuře SAM** nebo ošetřeny:

```java
@FunctionalInterface interface ThrowingSupplier<T> { T get() throws IOException; }

ThrowingSupplier<String> sup = () -> Files.readString(Path.of("a.txt")); // **Java 11+** (Files.readString, Path.of)
```

U standardních funkčních rozhraní bez `throws` musíš výjimky zachytit uvnitř:

```java
Supplier<String> safe = () -> {
    try { return Files.readString(Path.of("a.txt")); } // **Java 11+**
    catch (IOException e) { return ""; }
};
```

## Příklady

### 1) Základ s abstraktními metodami

```java
public interface Repository<T, ID> {
    T findById(ID id);            // implicitně public abstract
    void save(T entity);
}
public class InMemoryRepo<T, ID> implements Repository<T, ID> {
    private final Map<ID, T> db = new HashMap<>();
    @Override public T findById(ID id) { return db.get(id); }
    @Override public void save(T e) { /* ... */ }
}
```

### 2) `default` + `static` + `private`

```java
public interface TextOps {
    default String trimAndLower(String s) {
        return prepare(s).toLowerCase();
    }
    private String prepare(String s) {      // **Java 9+**
        return s == null ? "" : s.trim();
    }
    static boolean isBlank(String s) {      // Java 8+
        return s == null || s.trim().isEmpty();
    }
}
```

### 3) Konflikt `default` metod (diamant)

```java
interface A { default void ping(){ System.out.println("A"); } }
interface B { default void ping(){ System.out.println("B"); } }

class C implements A, B {
    @Override public void ping() {
        A.super.ping(); // explicitní volba větve
        B.super.ping();
        System.out.println("C");
    }
}
```

> Pokud dvě rozhraní poskytují stejnou `default` signaturu, implementující třída **musí** poskytnout vlastní implementaci (nebo explicitně zvolit přes `X.super.metoda()`).

### 4) Funkční rozhraní + lambda

```java
@FunctionalInterface
interface Transformer<T> { T apply(T t); }

Transformer<String> exclaim = s -> s + "!";
System.out.println(exclaim.apply("Hello"));
```

### 5) Generické rozhraní + vícenásobné rozšíření

```java
interface Sized { int size(); }
interface Resettable { void reset(); }

public interface Buffer<T> extends Sized, Resettable, Iterable<T> {
    void push(T value);
    T pop();
    default boolean isEmpty() { return size() == 0; }
}
```

### 6) Sealed rozhraní (krátce – navazuje na předchozí téma)

```java
public sealed interface Payment permits Cash, Card, Crypto { } // **Java 17+**
public final class Cash implements Payment { /* ... */ }
public final class Card implements Payment { /* ... */ }
public final class Crypto implements Payment { /* ... */ }
```

## Vztah k abstraktním třídám (stručně)

* **Rozhraní** = *kontrakt*; žádný stav, vícenásobná implementace, `default`/`static` metody, skvělé pro API.
* **Abstraktní třída** = sdílená *částečná implementace se stavem*; konstruktory, pole, chráněné metody; **jediná** nadtřída.

**Praktická vodítka**:

* Potřebuješ **stav** nebo chráněné utility → abstraktní třída.
* Chceš pouze **schopnost/chování** sdílené napříč různými větvemi hierarchií → rozhraní.

## Tipy a drobnosti

* Pole v rozhraní **vždy** `public static final` (psát klíčová slova není nutné, ale bývá zvykem):

  ```java
  interface MathConsts { double PI = 3.141592653589793; }
  ```
* `equals/hashCode/toString` lze deklarovat, ale funkční rozhraní je **nepočítá** do SAM.
* Vnořené typy v rozhraní jsou **implicitně `public static`** (hodí se pro pomocné výčty nebo buildery).
* `default` metoda může volat jinou `default` či `private` metodu v tomtéž rozhraní; stav ale stále nemá. *(Soukromé metody v rozhraní: **Java 9+**.)*

## Ukázka návrhu programu s rozhraními a abstraktními třídami

```java
interface Drawable {
    void draw();
}
abstract class Shape implements Drawable {
    protected String color;
    public Shape(String color) { this.color = color; }
    public abstract double area(); // abstraktní metoda
}
class Circle extends Shape {
    private double radius;
    public Circle(String color, double radius) {
        super(color);
        this.radius = radius;
    }
    @Override public double area() { return Math.PI * radius * radius; }
    @Override public void draw() {
        System.out.println("Drawing a " + color + " circle with area: " + area());
    }
}
class Rectangle extends Shape {
    private double width, height;
    public Rectangle(String color, double width, double height) {
        super(color);
        this.width = width;
        this.height = height;
    }
    @Override public double area() { return width * height; }
    @Override public void draw() {
        System.out.println("Drawing a " + color + " rectangle with area: " + area());
    }
}
public class Main {
    public static void main(String[] args) {
        Drawable[] shapes = {
            new Circle("red", 5),
            new Rectangle("blue", 4, 6)
        };
        for (Drawable shape : shapes) {
            shape.draw();
        }
    }
}
```

vytvoří výstup

```
Drawing a red circle with area: 78.53981633974483
Drawing a blue rectangle with area: 24.0
```

## Praktické příklady

#### 1) Stream API

```java
List<String> names = List.of("Eva", "Adam", "Petr", "Iva"); // **Java 9+**
List<String> shortUpper = names.stream()
    .filter(s -> s.length() <= 3)   // Predicate<String>
    .map(String::toUpperCase)       // Function<String,String>
    .sorted()                       // Comparator přirozený
    .toList();                      // **Java 16+** (Stream.toList)
```

#### 2) Třídění s `Comparator`

```java
record Person(String name, int age) {}      // **Java 16+**

List<Person> ps = new ArrayList<>(List.of(  // List.of **Java 9+**
    new Person("Anna", 30), new Person("Bob", 25), new Person("Cyril", 25)));

ps.sort( Comparator.comparingInt(Person::age)
                   .thenComparing(Person::name) );
```

#### 3) Sestavování funkcí

```java
Function<Integer,Integer> times2 = x -> x * 2;
Function<Integer,Integer> plus3  = x -> x + 3;
Function<Integer,Integer> f = times2.andThen(plus3);  // (x*2)+3
System.out.println( f.apply(10) ); // 23
```

#### 4) Asynchronně (Executor)

```java
ExecutorService pool = Executors.newFixedThreadPool(2);
Callable<Integer> task = () -> ThreadLocalRandom.current().nextInt(100);
Future<Integer> res = pool.submit(task);
System.out.println(res.get());
pool.shutdown();
```

### Časté chyby

1. **Spoléhání na identitu lambdy** – lambda **nemá stabilní identitu/typ** jako pojmenovaná třída; `equals/hashCode` neřeš.
2. **Záměna s anonymní třídou** – v lambdě `this` míří na **vnější objekt**, ne na „novou“ instanci.
3. **Neefektivní zachytávání velkých objektů** – mysli na životnost a GC; raději omez kontext.
4. **Checked výjimky** – standardní `java.util.function` je nepropouští; zvaž vlastní SAM s `throws` nebo helper wrapper.
5. **Přetížené metody + inference** – u více přetížení s různými SAM může být volba nejednoznačná; použij přetypování.
6. **Mutace zachycených proměnných** – nejde; použij mutable wrapper (`Atomic*`, pole, holder).

### Mini-recepty

#### Debounce s plánovačem

```java
class Debouncer {
    private final ScheduledExecutorService ses = Executors.newSingleThreadScheduledExecutor();
    private ScheduledFuture<?> pending;
    public void trigger(Runnable r, long delayMs) {
        if (pending != null) pending.cancel(false);
        pending = ses.schedule(r, delayMs, TimeUnit.MILLISECONDS);
    }
}
```

#### Jednoduchý retry wrapper pro Supplier

```java
static <T> Supplier<T> retry(Supplier<T> sup, int times) {
    return () -> {
        RuntimeException last = null;
        for (int i=0;i<times;i++) {
            try { return sup.get(); }
            catch (RuntimeException e) { last = e; }
        }
        throw last;
    };
}
```

### Shrnutí

* Lambda = **krátký zápis** implementace **funkčního rozhraní** (SAM).
* Syntaxe: `(params) -> výraz` nebo `(params) -> { blok }`.
* `this` = vnější instance; zachytávání jen **efektivně final**.
* Využití: **Streamy**, **Comparator**, **Executor**, **eventy**.
* Zkratky: **method references** `Type::method`, `obj::method`, `Type::new`.

---

*(Zvýrazněné novinky: **Java 9+** – soukromé metody v rozhraních, **Java 10+** – `var` v lokálních proměnných (použito sporadicky výše), **Java 11+** – `var` v parametrech lambd + `Files.readString/Path.of`, **Java 16+** – `Stream.toList`, `record`, **Java 17+** – sealed rozhraní.)*
