# Abstraktní třídy

**Abstraktní třída:** Třída označená klíčovým slovem `abstract`, kterou **nelze instanciovat** a která může obsahovat abstraktní i konkrétní (už implementované) metody, stav, konstruktory atd.

**Obecná signatura (tvar deklarace):**

```java
[annotations]
[public | protected | private] [abstract] [final | sealed | non-sealed] class Název
    [<T extends ... , U ...>]
    [extends Nadtrida]
    [implements Rozhraní1, Rozhraní2, ...] {
    // pole, konstruktory, metody (abstraktní i konkrétní), vnořené typy...
}
```

## Vlastnosti abstraktní třídy

* **Nelze ji přímo instanciovat.** Slouží jako „kostra“ pro podtřídy.
* **Může obsahovat:**

  * abstraktní metody (bez těla),
  * běžné (konkrétní) metody,
  * pole, statické členy, konstruktory, inicializační bloky, vnořené třídy,
  * generické parametry, implementaci rozhraní.
* **Nemusí** obsahovat žádnou abstraktní metodu (může být abstraktní jen kvůli zákazu přímé tvorby instancí).
* **První neabstraktní potomek** musí implementovat všechny zděděné abstraktní metody.

**Příklad:**

```java
public abstract class Animal {
    protected final String name;
    protected Animal(String name) { this.name = name; }

    public abstract void makeSound();      // abstraktní metoda (viz níže)
    public String id() { return "AN-" + name.toUpperCase(); } // konkrétní metoda
}
```

---

## Abstraktní metoda

**Co to je:** Metoda deklarovaná s klíčovým slovem `abstract`, která **nemá tělo** (končí středníkem) a musí ji dodat (přepsat) první neabstraktní potomek třídy.

**Obecná signatura (tvar deklarace):**

```java
[annotations]
[public | protected] [abstract] [<T ...>] NávratovýTyp jménoMetody(Parametry...)
    [throws Výjimka1, Výjimka2, ...] ;
```

> Pozn.: `private abstract`, `static abstract`, `final abstract`, `native abstract` nedávají smysl / nejsou povoleny. Abstraktní metoda **nemá tělo** (`{ ... }`), pouze středník.

**Klíčová pravidla:**

* Lze deklarovat **jen v abstraktní třídě** (ne v rozhraní — tam se používá implicitně „abstraktní“ bez klíčového slova).
* **Musí** být `public` nebo `protected` (nikoli `private`, protože by ji potomek neviděl).
* **Nesmí** být `static` ani `final`.
* **Nemá tělo** – končí `;`.

**Příklad:**

```java
public abstract class Shape {
    public abstract double area();          // jen signatura, bez těla
    public abstract double perimeter();

    public String summary() {
        return "%s: area=%.2f, perimeter=%.2f"
               .formatted(getClass().getSimpleName(), area(), perimeter());
    }
}
```

**Implementace v potomku:**

```java
public class Circle extends Shape {
    private final double r;
    public Circle(double r) { this.r = r; }

    @Override public double area() { return Math.PI * r * r; }
    @Override public double perimeter() { return 2 * Math.PI * r; }
}
```

### Rychlé protipříklady (co je špatně)

```java
public abstract class Bad1 {
    // ❌ Chyba: abstraktní metoda s tělem
    public abstract void foo() { System.out.println("x"); }
}

public abstract class Bad2 {
    // ❌ Chyba: private abstract – potomek by nemohl implementovat
    private abstract void secret();
}

public abstract class Bad3 {
    // ❌ Chyba: static abstract – statické metody se nepřepisují polymorfně
    public static abstract void util();
}

// ❌ Chyba: třída nemůže být zároveň abstract a final
public final abstract class Bad4 { }
```

## Základní syntaxe

```java
public abstract class Animal {              // třída je abstraktní
    protected final String name;            // může mít stav
    protected Animal(String name) {         // konstruktory jsou povolené
        this.name = name;
    }
    public abstract void makeSound();       // abstraktní metoda – bez těla
    public String id() { return "AN-" + name.toUpperCase(); } // konkrétní metoda
}
```

## Implementace v podtřídách

Každá neabstraktní podtřída **musí** tyto metody implementovat, tj. dodat jejich tělo:

```java
public class Dog extends Animal {
    public Dog(String name) { super(name); }
    @Override
    public void makeSound() { System.out.println("Woof!"); }  // povinné
}
```

> Nelze: `new Animal("X")`, ale lze: `new Dog("Rex")`.

## Kdy použít abstraktní třídu (vs. rozhraní)

Použij ji, když:

* chceš **sdílet stav** (pole) a **společnou částečnou implementaci**,
* potřebuješ **konstruktory**, **neveřejné** metody/fieldy,
* chceš **zaručit některé kroky** (viz Template Method) a jiné nechat na potomcích.

Naopak **rozhraní** je lepší pro **čisté chování/kontrakt**, vícenásobnou „implementaci“ a od Javy 8 i s `default` metodami, ale rozhraní **neuchovává stav** (krom `static final` konstant) a nemá konstruktory.

## Praktické vzory a ukázky

### 1) Skelet s částečnou implementací

```java
public abstract class Shape {
    // společný stav
    private String color = "black";
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    // povinná implementace v potomcích
    public abstract double area();
    public abstract double perimeter();

    // sdílená (už hotová) metoda
    public String summary() {
        return "%s (color=%s): area=%.2f, perimeter=%.2f"
                .formatted(getClass().getSimpleName(), color, area(), perimeter());
    }
}

public class Circle extends Shape {
    private final double r;
    public Circle(double r) { this.r = r; }
    @Override public double area() { return Math.PI * r * r; }
    @Override public double perimeter() { return 2 * Math.PI * r; }
}
```

Použití:

```java
Shape s = new Circle(2.5);
s.setColor("red");
System.out.println(s.summary());
```

### 2) Template Method (pevný postup + abstraktní kroky)

```java
public abstract class DataExporter {
    // šablona – neměnitelný postup
    public final void export(String file) {
        open(file);
        writeHeader();
        writeBody();     // proměnný krok
        writeFooter();
        close();
    }
    protected void open(String file)  { System.out.println("Open " + file); }
    protected void writeHeader()      { System.out.println("Header"); }
    protected abstract void writeBody();          // musí dodat potomek
    protected void writeFooter()      { System.out.println("Footer"); }
    protected void close()            { System.out.println("Close"); }
}

public class CsvExporter extends DataExporter {
    @Override protected void writeBody() { System.out.println("CSV,data,rows"); }
}
```

Použití:

```java
new CsvExporter().export("report.csv");
```

### 3) Abstraktní třída + rozhraní

```java
public interface Repository<T, ID> {
    T findById(ID id);
    void save(T entity);
}

public abstract class AbstractRepository<T, ID> implements Repository<T, ID> {
    // sdílená pomocná metoda
    protected void log(String msg) { System.out.println("[repo] " + msg); }
    // jedna metoda hotová, druhá nechána potomkům
    @Override public void save(T entity) { log("Saving " + entity); /* ... */ }
    @Override public abstract T findById(ID id); // povinné v potomcích
}

public class InMemoryUserRepository extends AbstractRepository<User, Long> {
    private final Map<Long, User> db = new HashMap<>();
    @Override public User findById(Long id) { return db.get(id); }
    @Override public void save(User u) { super.save(u); db.put(u.id(), u); }
}

record User(Long id, String name) {}
```

### 4) Anonymní podtřída (rychlé jednorázové „dodefinování“)

```java
Animal a = new Animal("Mystery") {
    @Override public void makeSound() { System.out.println("???"); }
};
a.makeSound();
```

### 5) Generická abstraktní třída

```java
public abstract class Validator<T> {
    public abstract boolean isValid(T value);
    public void requireValid(T value) {
        if (!isValid(value)) throw new IllegalArgumentException("Invalid: " + value);
    }
}

public class EmailValidator extends Validator<String> {
    @Override public boolean isValid(String v) { return v != null && v.contains("@"); }
}
```

### 6) Sealed + abstract (omezení dědiců; Java 17+)

```java
public abstract sealed class Expr permits Const, Add, Mul { }
public final class Const extends Expr { public final int v; public Const(int v){ this.v=v; } }
public final class Add   extends Expr { public final Expr a,b; public Add(Expr a, Expr b){this.a=a; this.b=b;} }
public final class Mul   extends Expr { public final Expr a,b; public Mul(Expr a, Expr b){this.a=a; this.b=b;} }
```

---

# Modifikátory a pravidla (rychlý tahák)

| Prvek                                     | Povoleno s `abstract`? | Poznámka                                                                              |
| ----------------------------------------- | ------------------------ | -------------------------------------------------------------------------------------- |
| **Třída `abstract`**            | Ano                      | Nelze instanciovat, může mít konstruktory/stav.                                     |
| **Metoda `abstract`**             | Ano                      | Jen v abstraktní třídě;**bez těla**.                                        |
| `final` + `abstract` (metoda/třída) | **Ne**             | `final` brání přepsání/rozšíření, což je v rozporu.                        |
| `private` + `abstract` (metoda)       | **Ne**             | Potomek by ji neviděl → nemohl implementovat.                                        |
| `static` + `abstract` (metoda)        | **Ne**             | `static` se nedědí polymorfně.                                                    |
| `native` + `abstract`                 | **Ne**             | `native` impl. existuje mimo JVM; `abstract` říká „žádná impl.“            |
| `synchronized` + `abstract`           | Technicky povoleno?      | Nemá smysl; bez těla není co synchronizovat — běžně se nepoužívá.            |
| Abstraktní**pole**                 | **Ne**             | Pole nikdy nejsou abstraktní.                                                         |
| Konstruktory                              | **Ano**            | Volají se z potomků přes `super(...)`.                                            |
| Implementace rozhraní                    | **Ano**            | Abstraktní třída může `implements` a část metod ponechat neimplementovaných. |

## Časté chyby a tipy

1. **Volání přepisovatelné (abstract/virtual) metody v konstruktoru** → potomek ještě není plně inicializován. Raději se tomu vyhni nebo používej `final` metody.
2. **Záměna s rozhraním** – když sdílíš **stav** a **kód**, zvol abstraktní třídu; když chceš jen **kontrakt** (a třeba vícenásobnou „implementaci“), zvol rozhraní.
3. **Nezapomeň `@Override`** – pomáhá zachytit chyby v signatuře.
4. **První neabstraktní potomek** musí implementovat VŠE abstraktní.
