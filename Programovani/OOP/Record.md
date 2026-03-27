# Záznam `record` [JDK 16+]

Syntaktická konstrukce pro definici neměnných datových tříd s minimem boilerplate kódu. Můžeme říct, že je to „Zkrácená“ neměnná datová třída. Kompilátor **vygeneruje**:

* `private final` pole pro každou **komponentu**,
* **kanonický konstruktor**,

* `equals()`, `hashCode()`, `toString()`,
* *accessor* metody pojmenované jako komponenty (bez `get`). Slouží k přečtení hodnoty.

``` java
public record Point(int x, int y) { }
```

je ekvivalentní k:

``` java
public final class Point {
    private final int x;
    private final int y;

    public Point(int x, int y) {
        this.x = x;
        this.y = y;
    }

    public int x() { return x; }
    public int y() { return y; }

    @Override
    public boolean equals(Object o) { ... }

    @Override
    public int hashCode() { ... }

    @Override
    public String toString() { ... }
}
```

* **Komponenta** = pole + accessor + parametr konstruktoru.

```java
public record User(long id, String name) {}
var u = new User(1, "Alice");
System.out.println(u.name());    // "Alice"
System.out.println(u);           // User[id=1, name=Alice]
```

> Pozn.: Records byly preview v JDK 14/15, stabilní od **JDK 16**.

## Syntaxe a struktura [JDK 16+]

Signatura recordu se definuje podobně jako třída, ale s klíčovým slovem `record` místo `class`.

```java
public record Point(int x, int y) { }
```

* Hlavička definuje **komponenty** (`x`, `y`), z nich vzniknou pole i accessors.
* `record` **nemůže** `extends` běžnou třídu; implicitně dědí z `java.lang.Record`.
* Může **implementovat rozhraní**:

```java
public record Key(String value) implements Comparable<Key> {
    @Override public int compareTo(Key o) { return value.compareTo(o.value()); }
}
```

## Konstruktory [JDK 16+]

### 1) **Kompaktní (compact)** — pro validaci invariantů

Signatura se nedává; parametry odpovídají komponentám.

```java
public record Range(int start, int end) {
    public Range {
        if (start > end) throw new IllegalArgumentException("start <= end");
    }
}
```

### 2) **Kanonický** — explicitní se jmény parametrů

```java
public record Point(int x, int y) {
    public Point(int x, int y) {
        this.x = x; this.y = y;       // přiřazení přímo ke komponentám
    }
}
```

### 3) **Pomocné „továrny“** (statické metody)

```java
public record Email(String local, String domain) {
    public static Email parse(String s) {
        var parts = s.split("@", 2);
        return new Email(parts[0], parts[1]);
    }
}
```

# Generované metody [JDK 16+]

* **Accessors**: `komponenta()` (např. `name()`), návratový typ = typ komponenty. Jedná se o **metody, ne gettery**. Slouží k přečtení hodnoty komponenty.
* **`equals`/`hashCode`**: ze **všech komponent** (v pořadí deklarace).
* **`toString`**: `Typ[comp1=..., comp2=...]`.

> Lze je **překrýt**, ale obvykle to není potřeba.

## Neměnnost a práce s „kopií“ [JDK 16+]

* Všechna pole jsou `final`. Žádné settery.
* Vytvářej **kopie**: buď ručně, nebo malými „with“ metodami:

```java
public record User(long id, String name) {
    public User withName(String n) { return new User(id, n); }
}
```

## Metody, statika, vnoření [JDK 16+]

* Můžeš přidat **vlastní metody** (čisté, bez mutace stavu).
* **Statické** metody a konstanty jsou povolené:

```java
public record Money(long cents, String currency) {
    public static Money of(double amount, String currency) {
        return new Money(Math.round(amount * 100), currency);
    }
}
```

* **Vnořené records** (členy jiné třídy/recordu) jsou podporované.

## Generické records [JDK 16+]

Definujeme jako běžné generické třídy.

```java
public record Box<T>(T value) {
    public <U> Box<U> map(java.util.function.Function<? super T, ? extends U> f) {
        return new Box<>(f.apply(value));
    }
}
```

## Rozhraní „sealed“ a pattern matching

### Sealed hierarchie [JDK 17+]

Umožní **omezený** seznam povolených implementací.

```java
sealed interface Shape permits Circle, Rect {}
public record Circle(double r) implements Shape {}
public record Rect(double w, double h) implements Shape {}
```

### Pattern matching pro `switch` + **record patterns** [JDK 21+]

* **Destrukturování** recordů přímo ve `switch`.
* `switch` je **vyčerpávající**, pokud je nad sealed typem.

```java
static String describe(Shape s) {
    return switch (s) {                                     // JDK 21+
        case Circle(double r) -> "Circle r=" + r;           // record pattern
        case Rect(double w, double h) -> "Rect " + w + "×" + h;
    };
}
```

Také v `instanceof`:

```java
if (s instanceof Rect(double w, double h) && w == h) {      // JDK 21+
    System.out.println("Square: " + w);
}
```

A v **parametrech metod**:

```java
static void print(Point(int x, int y) p) {                  // JDK 21+
    System.out.println(x + "," + y);
}
```

> `instanceof` s *type patternem* je final od **JDK 16+** (např. `if (obj instanceof String s)`), ale **record patterns** a **switch patterns** jsou final až **JDK 21+**.

## Anotace, serializace, equals-kontrakt [JDK 16+]

* Records jsou **Serializable** jako běžné třídy (pokud komponenty jsou serializovatelné).
* Lze přidávat anotace na:

  * **record** jako celek,
  * **komponenty** (promítne se na pole, parametr ctoru i accessor).

```java
public record Person(
    @NotNull String name,
    @Email String email
) {}
```

## Integrace do ekosystému (JSON, JPA, Lombok) [JDK 16+]

* **JSON**: Jackson/Gson records podporují; Jackson často vyžaduje modul pro JDK 16+ a použije **kanonický konstruktor** (bez setterů).
* **JPA entity** se s records **nesnášejí** (JPA chce no-arg ctor a mutace). Používej records jako **DTO**/view modely, nikoli `@Entity`.
* **Lombok**: records nahrazují běžné případy `@Value`/`@Data` čistým jazykem.

## Ověření vstupu a odvozované hodnoty [JDK 16+]

* Validace patří do **compact** nebo **kanonického** konstruktoru.
* Odvozené hodnoty: ulož je do **samostatné komponenty** nebo počítej „on-demand“ metodou.

```java
public record Line(double x1, double y1, double x2, double y2) {
    public Line {
        if (x1 == x2 && y1 == y2) throw new IllegalArgumentException("degenerate");
    }
    public double length() { 
        return Math.hypot(x2 - x1, y2 - y1);
    }
}
```

## Překrývání metod (kdy a proč) [JDK 16+]

* `toString()` můžeš upravit (např. zkrátit dlouhá pole).
Příklad:

```java
public record DataPoint(double[] values) {
    @Override
    public String toString() {
        return "DataPoint[values=" + Arrays.toString(Arrays.copyOf(values, Math.min(values.length, 5))) + (values.length > 5 ? "..." : "") + "]";
    }
}
```

* `equals()`/`hashCode()` většinou **nepřepisuj** – default pokrývá hodnotovou sémantiku. Pokud odchýlíš, dbej na konzistenci s komponentami.

## Porovnávání a třídění [JDK 16+]

* Implementuj `Comparable<T>` podle jedné či více komponent:

```java
public record User(long id, String name) implements Comparable<User> {
    public int compareTo(User o) {
        int byName = name.compareTo(o.name());
        return byName != 0 ? byName : Long.compare(id, o.id());
    }
}
```

* Nebo použij `Comparator`:

```java
var byNameThenId = java.util.Comparator
        .comparing(User::name)
        .thenComparingLong(User::id);
```

## Testování a buildery [JDK 16+]

* Records se testují snadno: **rovnost** je podle všech komponent.
* „Builder“ není nutný; pokud ho chceš, řeš to **tovární metodou** nebo malým **imperativním builderem** mimo record.

```java
public static User createUser(long id, String name) {
    // Validace atd.
    return new User(id, name);
}

@Test
public void testUserEquality() {
    User u1 = new User(1, "Alice");
    User u2 = new User(1, "Alice");
    assertEquals(u1, u2);  // true díky hodnotové sémantice
}
```

## Kde records dávají největší smysl (a kde ne) [JDK 16+]

**Hodí se:**

* návratové typy metod (místo ad-hoc `Pair`/`Tuple`).
* DTO (Data Transfer Object) do REST/JSON, zprávy v event-driven architekturách,
* klíče do map, „řádkové“ objekty konfigurace,

**Méně vhodné:**

* ORM entity s lazy mutacemi,
* stavy, které se musí **měnit** po vytvoření.

## Rychlý „cheatsheet“

* `public record X(T a, U b) { ... }`  **(JDK 16+)**
* Validace uvnitř `public X { ... }`    **(JDK 16+)**
* `sealed` + records hierarchie         **(JDK 17+)**
* Record patterns ve `switch`           **(JDK 21+)**

## Kdy použít record vs. třídu

| Použití recordu                          | Použití třídy                           |
|-----------------------------------------|----------------------------------------|
| Neměnná datová struktura                | Stavová třída s mutovatelnými poli     |
| Hodnotová sémantika (rovnost podle hodnot) | Identitní sémantika (rovnost podle reference) |
| Jednoduché DTO, klíče do map            | Komplexní objekty s chováním            |

## Proč používat recordy

* Méně boilerplate kódu.
* Jasná záměna pro neměnné datové struktury.
* Lepší integrace s moderními funkcemi Javy (pattern matching, sealed hierarchie).
* Snadnější testování díky hodnotové sémantice.
* Větší čitelnost a údržba kódu.
* Náhrada za vracení více hodnot z metod bez potřeby vytváření speciálních tříd.

## Triviální příklad recordu

Metoda vracící maximum a minimum z pole čísel:

```java
public record MinMax(int min, int max) {}

public static MinMax findMinMax(int[] numbers) {
    int min = Integer.MAX_VALUE;
    int max = Integer.MIN_VALUE;
    for (int n : numbers) {
        if (n < min) min = n;
        if (n > max) max = n;
    }
    return new MinMax(min, max);
}
 

public static void main(String[] args) {
    MinMax result = findMinMax(new int[]{3, 1, 4, 1, 5, 9, 2, 6});
    System.out.println("Min: " + result.min() + ", Max: " + result.max());
}
```
