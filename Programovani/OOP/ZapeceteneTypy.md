# Zapečetěné typy (sealed types) - Java 17+

**Zapečetěné** (sealed) typy omezují, **které třídy nebo rozhraní** je smějí přímo rozšiřovat/implementovat. Slouží k přesnému modelování uzavřených hierarchií (tj. „známá množina variant“).

* Klíčová slova: `sealed`, `permits`, `non-sealed`, běžné `final`.
* Fungují pro **třídy i rozhraní** (a také pro záznamy `record`, které jsou implicitně `final`).

## Obecné signatury (tvary deklarací)

### Sealed třída

```java
[annotations]
[public | protected | package-private] sealed class Jmeno
    [<T ...>]
    [extends Nadtrida]
    [implements Rozhrani1, ...]
    permits Potomek1, Potomek2, ... {
    // tělo
}
```

### Sealed rozhraní

```java
[annotations]
[public | package-private] sealed interface Jmeno
    [<T ...>]
    permits Implementace1, Implementace2, ... {
    // abstraktní (či defaultní) metody
}
```

### Potomci sealed typu musí být **přesně jedním** z

```java
final class Potomek ... extends/implements Jmeno { ... }      // už dál nerozšiřitelný
sealed class Potomek ... extends/implements Jmeno permits ... { ... } // znovu omezený
non-sealed class Potomek ... extends/implements Jmeno { ... } // záměrně otevřený dál
```

> Každý **povolený potomek** musí **přímo** dědit/implementovat daný sealed typ a **deklarovat** jedno z `final` / `sealed` / `non-sealed`.

## Pravidla a omezení (důležité)

* **Permits seznam**: Uvádí **kompletní** výčet povolených přímých potomků.
* **Umístění potomků**:

  * Je-li sealed typ v **pojmenovaném modulu**, potomci musí být ve **stejném modulu**.
  * Jinak (mimo moduly) musí být ve **stejném balíčku**.
* **Dědičnost**: Povolený potomek **musí** přímo rozšiřovat/implementovat rodiče; neplatí přes prostředníky.
* **Viditelnost**: Potomek musí být přístupný z místa, kde je rodič (odpovídající modifikátory přístupu).
* **Kombinace s `abstract`**: Sealed třída může být abstraktní (`abstract sealed class ...`), není to ale povinné.
* **Záznamy** (`record`) jsou implicitně `final`, takže jsou vhodnými „listovanými“ potomky sealed rozhraní/třídy.

## Základní příklad (výrazy jako algebraický datový typ)

```java
// Rodič: jen přesně tyto tři varianty jsou povolené
public sealed interface Expr permits Const, Add, Mul { }

// Varianty:
// record je implicitně final → splňuje pravidlo „final / sealed / non-sealed“
public record Const(int v) implements Expr { }

public record Add(Expr left, Expr right) implements Expr { }

public record Mul(Expr left, Expr right) implements Expr { }
```

Použití s pattern matching `switch` (Java 21+):

```java
static int eval(Expr e) {
    return switch (e) {
        case Const c -> c.v();
        case Add(var a, var b) -> eval(a) + eval(b);
        case Mul(var a, var b) -> eval(a) * eval(b);
    };
}
// Kompilátor ví, že jsou pokryty všechny varianty → switch je vyčerpávající.
```

## Příklad se třídami: `sealed + final + non-sealed`

```java
public sealed class Shape permits Circle, Rectangle, Polygon { }

public final class Circle extends Shape {
    private final double r;
    public Circle(double r) { this.r = r; }
    public double area() { return Math.PI * r * r; }
}

public final class Rectangle extends Shape {
    private final double w, h;
    public Rectangle(double w, double h) { this.w = w; this.h = h; }
    public double area() { return w * h; }
}

// Tato větev je záměrně otevřená pro další dědičnost (non-sealed)
public non-sealed class Polygon extends Shape {
    protected final List<Point2D> pts;
    public Polygon(List<Point2D> pts) { this.pts = List.copyOf(pts); }
    public double area() { /*...*/ return 0.0; }
}

// Další potomek povolený *jen* přes Polygon větev
public class RegularPolygon extends Polygon {
    public RegularPolygon(List<Point2D> pts) { super(pts); }
}
```

## Sealed rozhraní + defaultní metody

```java
public sealed interface Transport permits Car, Train { 
    default boolean onRails() { return false; }
}

public final class Car implements Transport { }

public final class Train implements Transport {
    @Override public boolean onRails() { return true; }
}
```

## Časté chyby (a proč)

```java
public sealed class A permits B, C { }

// ❌ Potomek B neříká „final/sealed/non-sealed“
class B extends A { } // chyba: „class is not declared final, sealed, or non-sealed“

// ❌ C není přímým potomkem A (např. dědí přes D) → není povoleno
class D extends A { }
final class C extends D { } // chyba: C musí přímo dědit A

// ❌ Potomek v jiném modulu/balíčku (podle režimu) → porušení pravidla umístění
```

## Kdy sealed použít

* Když chceš **uzavřenou množinu variant** (doménové modely, AST, stavy workflow).
* Když potřebuješ **exhaustivní kontrolu** v `switch` — kompilátor tě donutí pokrýt všechny případy.
* Když chceš **bezpečně rozšířit** API: přidáš novou variantu → překladač upozorní na místa, kde chybí obsluha.

## Praktické tipy

* Preferuj **sealed rozhraní + `record`** implementace pro „sum-typy“ (čisté datové varianty).
* Pokud má větev hierarchie zůstat rozšiřitelná uživatelem, označ ji `non-sealed`.
* Pokud je větev finální a uzavřená, dej `final`.
* U větších projektů používej **moduly** (JPMS), aby šly varianty držet v rámci jednoho modulu a přitom v různých balíčcích.
