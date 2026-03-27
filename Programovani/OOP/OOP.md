# Objektově orientované programování (OOP)

**Cíl objektově orientovaného programování:** modelovat problém „objekty“ (instancemi tříd), které nesou **stav** (atributy) a **chování** (metody).

## Viditelnost a modifikátory přístupu

| Modifikátor                     | Viditelné odkud                                      |         Třída | Pole | Metody | Konstruktory | Poznámky                                                                                          |
| ------------------------------- | ---------------------------------------------------- | ------------: | ---: | -----: | -----------: | ------------------------------------------------------------------------------------------------- |
| `private`                       | jen **z téže třídy**                                 | ✖️ *top-level* |   ✔️ |     ✔️ |           ✔️ | Lze u vnořených tříd; nejpřísnější.                                                               |
| *(žádný)* — **package-private** | **ze stejného balíčku**                              |            ✔️ |   ✔️ |     ✔️ |           ✔️ | Výchozí, když nic neuvedeš.                                                                       |
| `protected`                     | **stejný balíček** + **potomci** (i v jiném balíčku) | ✖️ *top-level* |   ✔️ |     ✔️ |           ✔️ | Mimo balíček jen přes dědičnost (a obvykle přes referenci typu potomka).                          |
| `public`                        | **odkudkoli**                                        |            ✔️ |   ✔️ |     ✔️ |           ✔️ | *Top-level* třída může být nejvýše jedna `public` v souboru a jméno musí odpovídat názvu souboru. |

**Legenda:** Top-level = „nejvyšší“ třída v souboru (ne vnořená).

## Poznámky k modifikátorům přístupu

* **Top-level třídy**: mohou být jen `public` nebo package-private (bez modifikátoru). `private`/`protected` se pro ně nepoužívá.
* **Vnořené (nested) třídy**: mohou mít všechny úrovně (`private`, `protected`, …).
* **`protected`** v jiném balíčku funguje **jen** pro podtřídy a typicky přes referenci na instanci té podtřídy (ne na libovolný objekt předka).
* **Rozhraní (interface)**:

  * *top-level* rozhraní: `public` nebo package-private.
  * Členové rozhraní: pole jsou implicitně `public static final`; metody jsou implicitně `public` (od Javy 9 mohou mít **private** metody jako pomocné).
* **`abstract`/`final`/`static`** nejsou modifikátory přístupu (řeší dědičnost/chování, ne viditelnost).
* **Konstruktory** lze udělat `private` (např. pro singletony či tovární metody).

### Ukázka

```java
// Soubor: UserService.java
public class UserService {           // veřejná třída

    private Repository repo;         // jen uvnitř UserService
    int cacheSize = 128;             // package-private: v rámci balíčku

    protected void warmUp() {        // v balíčku + v potomcích
        // ...
    }

    public void process() {          // odkudkoli
        // ...
    }

    private UserService() {}         // nelze vytvořit mimo třídu
}

// Vnořená třída
class PackageHelper {                 // package-private top-level
    private static class Secret {}    // private nested třída
}
```

## Základní principy OOP

Hlavní principy:

* **Zapouzdření (Encapsulation)** – skryju vnitřní stav a vystavuju jen nezbytné rozhraní. Implementace přes atributy a metody. Atributy obvykle `private`, přístup přes gettery/settery.
* **Dědičnost (Inheritance)** – nová třída přebírá a rozšiřuje chování a stav předka.
* **Polymorfismus (Polymorphism)** – jedna reference (typ předka/rozhraní), různé konkrétní realizace (potomci). Krátká ilustrace polymorfismu:

```java
interface Shape { double area(); }

final class Circle implements Shape {
    private final double r;
    Circle(double r) { this.r = r; }
    public double area() { return Math.PI * r * r; }
}

final class Rectangle implements Shape {
    private final double w, h;
    Rectangle(double w, double h) { this.w = w; this.h = h; }
    public double area() { return w * h; }
}

static double totalArea(List<Shape> shapes) {
    return shapes.stream().mapToDouble(Shape::area).sum();
}
```

Doplňkové idiomy:

* **Abstrakce (Abstraction)** – odhalím podstatné, skryju detaily; v Javě pomocí rozhraní a abstraktních tříd.
* **Složení, kompozice (Composition) > Dědičnost** – skládej z menších objektů místo „je to“ zbytečné dědit.
* **SOLID** – zejména SRP (jedna odpovědnost), OCP (rozšiřuj, neměň), LSP (substituční princip), ISP (princip rozhraní) a DIP (princip závislostí).

## Třída

**Definice:** **Třída** je šablona pro vytváření objektů (instancí), která definuje jejich stav (atributy) a chování (metody).

> **Jmenná konvence:** Název třídy by měl být podstatné jméno s velkým počátečním písmenem (PascalCase), např. `Person`, `Account`, `HttpRequest`.

### Vlastnosti tříd

* **Jmenný prostor:** Je kontejner pro uspořádání souvisejících názvů, jako jsou třídy, funkce a konstanty. V Javě pomocí  `package`, `import`.
* **Modifikátory:** `public`, (package-private), `final`, `abstract`.
* **Členové:** atributy (pole), konstruktory, metody, statické/instanční inicializační bloky, vnořené typy.
* **Životní cyklus:** načtení třídy → inicializace statických členů → konstrukce objektu → inicializace instančních členů → konstruktor → použití → zničení (GC).

> **V Javě odpovídá jedné veřejné třídě jeden soubor `.java` (název souboru = název třídy).**

### Struktura třídy

```java
package cz.skola.oop;

import java.util.Objects;

public class Person {
    // 1) Atributy (soukromé → zapouzdření)
    private String firstName;
    private String lastName;
    private int age;

    // 2) Konstruktory (přetěžování)
    public Person(String firstName, String lastName) { this(firstName, lastName, 0); }
    public Person(String firstName, String lastName, int age) {
        this.firstName = Objects.requireNonNull(firstName);
        this.lastName  = Objects.requireNonNull(lastName);
        this.age       = age;
    }

    // 3) Gettery/Settery (řízený přístup ke stavu)
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = Objects.requireNonNull(firstName); }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = Objects.requireNonNull(lastName); }

    public int getAge() { return age; }
    public void setAge(int age) { if (age < 0) throw new IllegalArgumentException(); this.age = age; }

    // 4) Metody (chování)
    public String fullName() { return firstName + " " + lastName; }

    @Override public String toString() { return fullName() + " (" + age + ")"; }
    
    // Inicializační bloky (méně běžné)
    static { /* statický inicializační blok */ }

    { /* instanční inicializační blok */ }
}
```

### Idiomy pro návrh tříd

* **Nezměnitelná (immutable) třída:** Třída, jejíž instance nelze měnit po vytvoření. Všechna pole `private final`, žádné settery.
  Výhody: jednodušší testování, vlákna, méně chyb.
  
```java
class Point {
    private final int x, y;
    public Point(int x, int y) { this.x = x; this.y = y; }
    public int getX() { return x; }
    public int getY() { return y; }
    public Point move(int dx, int dy) { return new Point(x + dx, y + dy); } // nová instance
}
```

* **Validace v konstruktoru** (ne v setterech): Objekty jsou platné hned po vytvoření, chybné stavy se nešíří.

```java
public record Money(long amountCents, String currency) {
    public Money {
        if (amountCents < 0) throw new IllegalArgumentException();
        currency = Objects.requireNonNull(currency);
    }
}
```

* **Záznam (record):** krátká neměnná datová třída.

```java
public record Money(long amountCents, String currency) {
    public Money { if (amountCents < 0) throw new IllegalArgumentException(); }
}
```

* **Static factory method**: Zvýší čitelnost, mohou vracet cache/podtyp a skrývat detaily vytvoření.

```java
public final class Temperature {
  private final double kelvin;
  private Temperature(double kelvin) { this.kelvin = kelvin; }

  public static Temperature ofCelsius(double c)  { return new Temperature(c + 273.15); }
  public static Temperature ofFahrenheit(double f){ return new Temperature((f - 32) * 5/9 + 273.15); }

  public double toCelsius() { return kelvin - 273.15; }
}
```

### Řetězení tříd

1. **Dědění v řetězu** (`A <- B <- C`) a volání `super(...)`:

```java
class Animal { Animal(String name) { /*...*/ } }
class Dog extends Animal { Dog(String name) { super(name); } }
```

2. **Řetězení konstruktorů** v rámci jedné třídy přes `this(...)`:

```java
class FileSpec {
    private final String path; private final boolean readonly;
    public FileSpec(String path) { this(path, false); }
    public FileSpec(String path, boolean readonly) { this.path = path; this.readonly = readonly; }
}
```

3. **Fluent API (řetězení volání metod)** – každá metoda vrací `this`:

```java
class QueryBuilder {
    private String table; private String where = "1=1";
    public QueryBuilder from(String table){ this.table = table; return this; }
    public QueryBuilder where(String w){ this.where = w; return this; }
    public String build(){ return "SELECT * FROM " + table + " WHERE " + where; }
}
// new QueryBuilder().from("users").where("age > 18").build();
```

## Balíky a závislosti

* V Javě balím do **balíků (packages)** a distribuuji jako **JAR**.
* Správa závislostí běžně pomocí **Maven/Gradle**. Příklad

```xml
<dependency>
    <groupId>com.google.guava</groupId> <!-- Guava: Google Core Libraries for Java -->
    <artifactId>guava</artifactId> <!-- aktuální verze na https://mvnrepository.com/artifact/com.google.guava/guava -->
    <version>30.1-jre</version> <!-- nebo novější -->
</dependency>
```

* Při práci s balíčkami preferuj **programování proti rozhraním**:

```java
List<String> names = new ArrayList<>(); // používám typ rozhraní List
```

## Kompozice a delegace

* **Kompozice (Composition)** – třída obsahuje jiné třídy jako atributy (má je).
* **Delegace (Delegation)** – třída předává volání metod jinémuu objektu (dělá to za ni).

```java
class Engine {
    void start() { /*...*/ }
    void stop() { /*...*/ }
}
class Car {
    private final Engine engine = new Engine(); // kompozice
    void start() { engine.start(); }            // delegace
    void stop() { engine.stop(); }              // delegace
}
```

## Atributy (fields) a zapouzdření datového typu

### Vlastnosti

* **Viditelnost:** viz. tabulka výše.
* **`final`** – nastaveno jednou (v konstruktoru), pak neměnné.
* **`static`** – patří třídě, ne instanci.
* **Konstanty:** `public static final` (např. `MAX_SIZE`).
* **Inicializace:** přímo v deklaraci, v inicializačním bloku nebo v konstruktoru.

* Nikdy nevystavuj **přímo měnitelnou** kolekci/pole – vrať **kopii** nebo **ne-modifikovatelný pohled**.


## Metody

**Definice:** Metoda je blok kódu, který vykonává konkrétní úkol a může vracet hodnotu.

### Syntaxe

```java
[modifikátory] návratový_typ jméno_metody([parametry]) [throws výjimky] {
    // tělo metody
    [return hodnota;]
}
```
### Metody pro přístup k atributům

* **Getter** - metoda pro získání hodnoty atributu. Jmeno obvykle začíná na `get` (např. `getAge()`), nebo `is` pro boolean (např. `isActive()`).

```java
class Team {
    private final List<String> members = new ArrayList<>();

    public List<String> getMembers() { // obranná kopie nebo Collections.unmodifiableList
        return List.copyOf(members);
    }
    public void addMember(String name) { members.add(name); }
}
```

* **Setter** - metoda pro nastavení hodnoty atributu. Jmeno obvykle začíná na `set` (např. `setAge(int age)`). Vždy validujte v **setterech**:

```java
public void setAge(int age) {
    if (age < 0) throw new IllegalArgumentException("Age must be >= 0");
    this.age = age;
}
```

* U *immutable* tříd nahraďte settery **novými instancemi**:

```java
record Point(int x, int y) {
    public Point move(int dx, int dy) { return new Point(x + dx, y + dy); }
}
```

### Typy návratových hodnot

* **Primitivní typy:** `int`, `boolean`, `char`, atd.
* **Reference na objekty:** `String`, `List`, vlastní třídy, atd.
* **`void`:** metoda nic nevrací.

### „Vlastnosti“ metod

* **Signatura:** jméno + seznam typů parametrů (ne návratový typ).
* **Přetížení (overloading):** stejné jméno, jiné parametry.
* **Překrytí (overriding):** potomek mění implementaci předka (musí zachovat kontrakt).
* **Statické vs. instanční:** `static` není vázáno na objekt.
* **`final` metoda:** nelze překrýt.
* **`abstract` metoda:** bez těla – potomci musí implementovat.
* **`default` metoda v rozhraní:** implicitní implementace v `interface`.
* **Generické metody, varargs, výjimky, synchronizace.**

### Krátké ukázky

**Přetěžování:**

```java
class MathEx {
    public static int sum(int a, int b) { return a + b; }
    public static int sum(int... xs) { return Arrays.stream(xs).sum(); } // varargs
}
```

**Překrytí + `@Override`:**

```java
abstract class Transport {
    abstract int capacity();
    public String info() { return "Capacity: " + capacity(); }
}
class Bus extends Transport {
    @Override int capacity() { return 50; }
}
```

**Statická tovární metoda vs. konstruktor:**

```java
class User {
    private final String email;
    private User(String email) { this.email = email; }
    public static User ofEmail(String email) { return new User(email.toLowerCase()); } // logika navíc
}
```

**Default metoda v rozhraní:**

```java
interface Greeter {
    default String greet(String name) { return "Hello, " + name; }
}
class CasualGreeter implements Greeter { /* dědí default */ }
```

**Abstraktní metoda (abstrakce chování):**

```java
abstract class Processor<T> {
    public final void processAll(List<T> items) { // šablonová metoda
        for (T t : items) handle(t);
    }
    protected abstract void handle(T item);
}
```

**Generická metoda + ohraničení:**

```java
public static <T extends Comparable<? super T>> T max(List<T> xs) {
    return xs.stream().max(Comparator.naturalOrder()).orElseThrow();
}
```

**Výjimky a kontrakt metod:**

```java
class Repository {
    public Optional<String> findById(String id) throws IOException {
        // ... I/O, může vyhodit checked výjimku
        return Optional.empty();
    }
}
```

**Synchronizace (vláknová bezpečnost):**

```java
class Counter {
    private int value;
    public synchronized void inc() { value++; }
    public synchronized int value() { return value; }
}
```

**Fluent (řetězení metod) – builder:**

```java
class HttpRequest {
    private String url; private String method = "GET"; private Map<String,String> headers = new HashMap<>();
    public HttpRequest url(String u){ this.url = u; return this; }
    public HttpRequest method(String m){ this.method = m; return this; }
    public HttpRequest header(String k, String v){ headers.put(k,v); return this; }
    public String send(){ /* ... */ return "OK"; }
}

// new HttpRequest().url("https://api").method("POST").header("Auth","...").send();
```

## Konstruktory

* Speciální metoda pro inicializaci nových objektů.
* **Název musí být stejný** jako název třídy, nemají návratový typ.
* **Mohou být přetížené** (více konstruktorů s různými parametry).
* **Implicitní** bezzparametrový konstruktor, pokud není definován žádný jiný.
* Volání `this(...)` pro řetězení konstruktorů v rámci třídy.
* Volání `super(...)` pro volání konstruktoru předka (musí být první v konstruktoru).
* Nelze je označit jako `static`, `final`, `abstract` nebo `synchronized`.

```java
class Person {
    private final String name;
    private final int age;

    public Person(String name) { this(name, 0); } // řetězení konstruktorů
    public Person(String name, int age) {
        this.name = Objects.requireNonNull(name);
        if (age < 0) throw new IllegalArgumentException("Age must be >= 0");
        this.age = age;
    }
}
```

## Inicializační bloky

* **Statický inicializační blok:** spouští se jednou při načtení třídy, pro inicializaci statických atributů.

```java
class Config {
    static final String APP_NAME;
    static final int APP_VERSION;

    static {
        APP_NAME = "MyApp";
        APP_VERSION = 1;
    }
}
```

* **Instanční inicializační blok:** spouští se při každém vytvoření instance, před konstruktor.

```java
class User {
    private String email;
    private String name;

    {
        // Instanční inicializační blok
        email = "unknown@example.com";
    }

    public User(String name) {
        this.name = name;
    }
}
```

## Mini-příklad: vše dohromady

```java
sealed interface Payment permits CardPayment, CashPayment {
    Money amount();
    default String describe() { return amount().currency() + " " + amount().amountCents()/100.0; }
}

final class CardPayment implements Payment {
    private final Money amount; private final String panMasked;
    CardPayment(Money amount, String panMasked) { this.amount = amount; this.panMasked = panMasked; }
    public Money amount() { return amount; }
    public String toString(){ return "CARD " + panMasked + " " + describe(); }
}

final class CashPayment implements Payment {
    private final Money amount;
    CashPayment(Money amount) { this.amount = amount; }
    public Money amount() { return amount; }
}

final class Checkout {
    private final List<Payment> payments = new ArrayList<>();
    public Checkout add(Payment p){ payments.add(p); return this; }  // fluent
    public Money total(){
        long cents = payments.stream().mapToLong(p -> p.amount().amountCents()).sum();
        return new Money(cents, payments.get(0).amount().currency()); // zjednodušeno
    }
}
```

## Tipy do praxe

* Začni **rozhraními** a **malými třídami** s jednou odpovědností.
* Pole téměř vždy `private` (+ gettery/settery nebo immutable přístup).
* Preferuj **immutable** objekty (zjednodušují testování a vlákna).
* Pro tvorbu složitých objektů použij **Builder** (nebo `record`, když se hodí).
* Přidej `@Override`, `@FunctionalInterface`, `@NotNull` aj. anotace, kde dávají smysl.
