# Dědičnost

 **Dědičnost (inheritance)** je mechanismus, který umožňuje jedné třídě (potomkovi) **zdědit** vlastnosti a chování jiné třídy (předka).

* V Javě má třída **jednoho** přímého předka (single inheritance).
* Potomek přebírá **stav i chování** předka (pole a metody) a může je **rozšířit** nebo **překrýt**.

Dělení dědičnosti:

* **jednoduchá** (single) — třída má jednoho přímého předka.
* **vícenásobná** (multiple) — třída má více přímých předků (Java u tříd nepodporuje, ale u rozhraní ano).

## Základní syntaxe

```java
class Osoba {
    String jmeno;
    void pozdrav() { System.out.println("Ahoj, jsem " + jmeno); }
}

class Zamestnanec extends Osoba {     // ← dědí z Osoba
    double mzda;
    void pracuj() { System.out.println("Pracuji..."); }
}
```

Co z toho plyne:

* `Zamestnanec` má `jmeno`, `pozdrav()` i své nové členy `mzda`, `pracuj()`.

## Co se dědí a co ne

* **Dědí se:** `public`, `protected` a (v rámci stejného balíku) „package-private“ členy.
* **Nedědí se:** `private` členy (jsou přístupné jen přes veřejné/protected metody předka).
* **Konstruktory se nedědí.**

## Konstruktory a volání `super(...)`

Potomek **musí** spustit konstruktor předka — buď implicitně, nebo explicitně.

* Pokud **předek** má **bezzparametrový** konstruktor, vloží kompilátor `super();` automaticky.
* Pokud **předek nemá** bezzparametrový konstruktor, **musíš** zavolat konkrétní `super(...)`.

```java
class Osoba {
    final String jmeno;
    Osoba(String jmeno) { this.jmeno = jmeno; }
}

class Zamestnanec extends Osoba {
    final double mzda;

    // MUSÍME předat jméno konstruktoru předka:
    Zamestnanec(String jmeno, double mzda) {
        super(jmeno);          // Od Java 22 nemusí být prvním příkazem.
        this.mzda = mzda;
    }
}
```

`this(...)` vs. `super(...)`:

* `this(...)` volá jiný konstruktor **téže** třídy.
* `super(...)` volá konstruktor **předka**.
* V konstruktoru může být **jen jedno** z nich a od Java 22 nemusí být prvním příkazem.

## Pořadí inicializace

1. Statické inicializace předka → potomka.
2. Inicializace instančních polí + inicializační bloky předka → konstruktor předka.
3. Inicializace instančních polí + bloky potomka → konstruktor potomka.

> Pozor: v konstruktoru předka se už mohou volat **překryté metody** potomka (dynamická vazba). Nevolat z konstruktorů logiku závislou na plně zkonstruovaném potomkovi.

## Překrývání metod (overriding)

Potomek může změnit implementaci metody předka se **stejnou signaturou**.

Pravidla:

* Návratový typ může být **kovariantní** (může být „užší“ podtyp).
* Viditelnost nesmí být **přísnější** (můžeš ji **rozšířit**).
* Vyhazované výjimky (checked) mohou být stejné nebo **užší**.
* `@Override` používej vždy — zaručí, že opravdu překrýváš.

```java
class Osoba {
    String info() { return "Osoba"; }
}

class Zamestnanec extends Osoba {
    @Override
    String info() { return "Zamestnanec"; } // stejná signatura, jiná implementace
}
```

Volání předkovy verze:

```java
class Maminka {
    void popis() { System.out.println("Jsem maminka"); }
}

class Dcera extends Maminka {
    @Override
    void popis() {
        super.popis();                  // zavolá předkovu verzi
        System.out.println("a taky dcera");
    }
}
```

## Skrývání polí a statických metod (hiding)

* **Pole** se **nepřekrývají**, ale **skrývají**: typ reference rozhoduje, které pole čteš.
* **Statické metody** se také **skrývají** (dynamická vazba neplatí).

```java
class A { static void f(){ System.out.println("A"); } int x = 1; }
class B extends A { static void f(){ System.out.println("B"); } int x = 2; }

A a = new B();
a.f();          // vytiskne "A" (statika = podle typu A)
System.out.println(a.x); // 1 (pole = podle typu A)
```

## Upcasting, downcasting a dynamická vazba

* **Upcasting** (potomek → předek) je **automatický** a bezpečný.
* **Downcasting** (předek → potomek) vyžaduje **přetypování** a může selhat za běhu.

```java
Osoba o = new Zamestnanec("Ema", 50000); // upcast OK
// o.pracuj(); // nelze, reference je typu Osoba

if (o instanceof Zamestnanec z) {         // bezpečný „pattern“ od Javy 16+
    z.pracuj();                            // teď už lze
}
```

**Dynamická vazba (late binding):** při volání **instančních** metod se vybírá implementace podle **skutečného** typu objektu za běhu (proto overriding funguje).

## `final` třídy a metody

* `final class` → nelze z ní dědit (např. `String`).
* `final` metoda → nelze ji v potomkovi překrýt.

```java
class A { final void f(){} }
class B extends A {
    // @Override void f(){} // chyba: final metoda nejde překrýt
}
```

## `protected` a přístup v potomcích

* `protected` člen je přístupný v potomcích (i z jiného balíku) přes **referenci na sebe** nebo na instanci **svého typu/potomka**.
* Není to „veřejné“ — mimo hierarchii (a balík) k němu nepřistoupíš.

## Overloading ≠ Overriding

* **Overloading (přetěžování):** stejné jméno, **jiné parametry** (probíhá v **téže** třídě i bez dědičnosti).
* **Overriding (překrytí):** stejné jméno a signatura v **potomkovi** (dynamická vazba).

```java
class Tisk {
    void print(String s) {}        // overloading
    void print(int i) {}           // overloading
}
class BarevnyTisk extends Tisk {
    @Override
    void print(String s) {}        // overriding
}
```

## Praktický mini-příklad: parametry `super(...)` a překrytí

```java
class Osoba {
    private final String jmeno;
    Osoba(String jmeno) { this.jmeno = jmeno; }
    String popis() { return "Osoba: " + jmeno; }
}

class Student extends Osoba {
    private final String trida;
    Student(String jmeno, String trida) {
        super(jmeno);              // předání parametru předkovi
        this.trida = trida;
    }
    @Override
    String popis() {               // překrytí
        return super.popis() + ", třída: " + trida; // využití super.popis()
    }
}
```

## Dědičnost vs. Složení

* **Dědičnost** použij, když opravdu platí vztah **„je to“** (`Square je Rectangle` – pozor na LSP!).
* **Složení** použij, když chceš **znovupoužít chování** bez pevného hierarchického vztahu:

```java
class Logger { void log(String msg){ /*...*/ } }
class Service {
    private final Logger logger = new Logger(); // složení
    void run(){ logger.log("start"); /*...*/ }
}
```

## Hierarchie tříd v JDK

* **Kořen:** každá třída (kromě `Object`) **dědí** z jiné třídy → vzniká **strom** s kořenem `java.lang.Object`.
* **Jediný přímý předek:** Java má **single inheritance** (žádné vícenásobné dědění tříd).
* **Úrovně:** A ← B ← C ← D … Čím níže, tím konkrétnější typ.

Textový příklad:

```
java.lang.Object
  └─ Osoba
      └─ Zamestnanec
          └─ Manazer
```

### Co se v hierarchii propaguje

* **Instanční metody**: dědí se a mohou se **překrýt** v libovolné hloubce.
* **Pole**: existují na své úrovni (mohou být skryta stejnojmenným polem níže).
* **Konstruktory**: **nedědí** se; každý potomek musí volat `super(...)`.

### Řešení metod v hierarchii (method lookup)

1. Při volání `obj.metoda()` JVM hledá **nejspodnější** překrytou implementaci v reálném typu objektu.
2. Pokud ji nenajde, jde **o úroveň výš** atd., až po `Object`.
   → To je **dynamická vazba** – rozhoduje **běhový typ**, ne typ reference.

```java
class A { String who() { return "A"; } }
class B extends A { @Override String who() { return "B"; } }
class C extends B { @Override String who() { return "C"; } }

A x = new C();
System.out.println(x.who()); // "C" (nejnižší dostupná implementace)
```

### Řetězení konstruktorů v hloubce

* V **každém** konstruktoru je první příkaz `super(...)` (implicitně `super();`, pokud existuje).
* Vzniká **řetěz**: nejdřív běží konstruktor předka, až pak potomka.

```java
class A { A() { System.out.println("A"); } }
class B extends A { B() { super(); System.out.println("B"); } }
class C extends B { C() { super(); System.out.println("C"); } }
// new C() → A, potom B, potom C
```

### `super` napříč více úrovněmi

* `super.něco()` volá **nejbližší** předkovu verzi, ne „prapředka“.
* Chceš-li použít logiku `A` v `C`, ale `B` ji překrylo, musíš to řešit uvnitř `B` (např. poskytnout pomocnou metodu).

```java
class A { void f(){ System.out.println("A"); } }
class B extends A { @Override void f(){ System.out.println("B"); } }
class C extends B {
    @Override void f(){
        super.f();              // zavolá B.f(), ne A.f()
    }
}
```

### Skrytí polí vs. překrytí metod

* **Pole**: při přístupu rozhoduje **typ reference** (statické rozhodnutí).
* **Metody**: rozhoduje **běhový typ** (dynamické rozhodnutí).

```java
class A { int x = 1; void g(){ System.out.println("A"); } }
class B extends A { int x = 2; @Override void g(){ System.out.println("B"); } }

A ref = new B();
System.out.println(ref.x); // 1  (pole podle A)
ref.g();                   // "B" (metoda podle B)
```

### Přístup v hierarchii a balících

* `private` – viditelné jen v téže třídě (nedědí se přístup).
* *(package-private)* – viditelné v rámci balíku (potomek mimo balík neuvidí).
* `protected` – potomek uvidí i napříč balíky (přes **sebe** nebo instanci **své hierarchie**).
* `public` – všude.

### `final` v hierarchii

* `final class` – **ukončí** větev (nelze dědit).
* `final` metoda – **uzamkne** implementaci na dané úrovni (nelze překrýt níže).

### Kovariantní návratové typy v hloubce

* Potomek může vracet **konkrétnější** typ než předek (stále kompatibilní signatura).

```java
class A { A self(){ return this; } }
class B extends A { @Override B self(){ return this; } }
```

### Přetížení (overloading) vs. překrytí (overriding) v hierarchii

* **Overriding**: stejná signatura, nižší třída – účastní se ho **dynamická vazba**.
* **Overloading**: jiné parametry – vybírá se **staticky** při překladu podle typu argumentů (a až pak se případně uplatní overriding).

```java
class A { void f(Object o){ System.out.println("A:Object"); } }
class B extends A {
    void f(String s){ System.out.println("B:String"); }        // overloading
    @Override void f(Object o){ System.out.println("B:Object"); } // overriding
}

A a = new B();
a.f("x");  // vybere se signatura A.f(Object) (statika) → běhově B:Object
```

### Přetypování v hluboké hierarchii

* **Upcast** (C→B→A) je automatický.
* **Downcast** (A→B→C) vyžaduje kontrolu:

```java
A a = new C();
if (a instanceof C c) { /* bezpečně pracuji s C */ }
```

### Typické návrhové vzory v hierarchii (bez rozhraní)

* **Šablonová metoda**: předek definuje kostru, potomci překryjí kroky.
* **Specializace**: nižší úroveň přidává pole/metody a překrývá chování.

Krátký příklad „rodokmenu“:

```java
class Zivocich {
    String jmeno;
    Zivocich(String j){ this.jmeno = j; }
    String popis(){ return "Živočich: " + jmeno; }
}

class Savec extends Zivocich {
    Savec(String j){ super(j); }
    @Override String popis(){ return super.popis() + " (savec)"; }
}

class Pes extends Savec {
    Pes(String j){ super(j); }
    @Override String popis(){ return super.popis() + " – pes"; }
}

Zivocich z = new Pes("Rex");
System.out.println(z.popis()); // Živočich: Rex (savec) – pes
```

### Praktické zásady pro zdravou hierarchii

* Dědičnost používej, **když platí „je to“** (is-a). Když je to „má-to“ (has-a), raději složení.
* Drž hierarchie **mělké a srozumitelné** (příliš hluboké stromy znesnadňují údržbu).
* Překrývané metody nech **idempotentní** a **bezpříznakové** vedlejší účinky v konstruktorech (konstrukce probíhá shora dolů).
* Když v hierarchii přepisuješ `equals/hashCode`, dělej to **konzistentně** (pozor na symetrii napříč třídami).

Chceš k tomu „cheat-sheet“ s diagramem typických pravidel (kdy `super`, kdy `final`, co se hledá kde) a pár úloh na rychlé procvičení?

### Metody zděděné z `java.lang.Object`
Třída `java.lang.Object` je kořenem všech tříd v Javě a je přímým předkem všech tříd, pokud není explicitně uvedeno jinak. `Object` definuje několik základních metod, které jsou automaticky dostupné ve všech třídách, a tyto metody mohou být přepsány (overridden) v potomcích podle potřeby.
 Zde jsou nejdůležitější metody, které každá třída dědí z `Object`, spolu s jejich účelem a poznámkami k použití v kontextu dědičnosti:
| Metoda (signatura)                                           | Účel                                | Poznámky k použití                                                                                                                                  |
| ------------------------------------------------------------ | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `public boolean equals(Object obj)`                          | Logická rovnost                     | Výchozí implementace =**identita** (`this == obj`). Pro „hodnotovou“ rovnost **přepiš** spolu s `hashCode()`.                                       |
| `public int hashCode()`                                      | Hash kód pro hashové kolekce        | Musí být v**kontraktu** s `equals`. Přepiš, pokud přepisuješ `equals`.                                                                              |
| `public String toString()`                                   | Textová reprezentace                | Výchozí:`getClass().getName() + '@' + Integer.toHexString(hashCode())`. Prakticky vždy **přepiš**.                                                  |
| `public final Class<?> getClass()`                           | Běhový typ objektu                  | Nelze přepsat. Užitečné pro reflexi, logování.                                                                                                      |
| `protected Object clone() throws CloneNotSupportedException` | Mělká kopie objektu                 | Funguje jen když třída**implementuje `Cloneable`** a obvykle se **přepisuje** na `public`. Často se místo toho volí kopírovací konstruktor/builder. |
| `protected void finalize() throws Throwable`                 | Úklid před GC                       | **Zastaralé (deprecated for removal)** – nepoužívat. Finalizace je v moderních JDK vypínaná a nespolehlivá.                                         |
| `public final void wait() throws InterruptedException`       | Blokující čekání na monitoru        | Lze volat jen když**držíš monitor** (`synchronized(obj) { obj.wait(); }`).                                                                          |
| `public final void wait(long timeoutMillis)`                 | Čekání s timeoutem                  | Stejná podmínka jako výše.                                                                                                                          |
| `public final void wait(long timeoutMillis, int nanos)`      | Jemnější timeout                    | Stejná podmínka jako výše.                                                                                                                          |
| `public final void notify()`                                 | Probuzení jednoho čekajícího vlákna | Volat jen při drženém monitoru.                                                                                                                     |
| `public final void notifyAll()`                              | Probuzení všech čekajících vláken   | Volat jen při drženém monitoru.                                                                                                                     |

> Pozn.: Konstruktory se **nedědí**, ale každý konstruktor potomka **musí** zavolat konstruktor předka (`super(...)` implicitně nebo explicitně).
> Jasně — tady je „all-in“ k metodám zděděným z `java.lang.Object` a jak s nimi správně pracovat v dědičnosti. Ke každé přidám praktické ukázky.

### `equals(Object)` — kontrakt a dědičnost

**Kontrakt:** reflexivní, symetrická, tranzitivní, konzistentní; `x.equals(null) == false`.
**Důsledek v dědičnosti:** pozor na porušení **symetrie** mezi předkem a potomkem.

#### Nešikovné (porušuje symetrii)

```java
class Osoba {
    final String jmeno;
    Osoba(String j) { this.jmeno = j; }

    @Override public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Osoba p)) return false;
        return jmeno.equals(p.jmeno);
    }

    @Override public int hashCode() { return jmeno.hashCode(); }
}

class Student extends Osoba {
    final String trida;
    Student(String j, String t) { super(j); this.trida = t; }

    @Override public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Student s)) return false;        // ← užší test
        return super.equals(o) && trida.equals(s.trida);
    }
}
// Symetrie selže: new Osoba("Ema").equals(new Student("Ema","4E")) == true?
// … ale opačně Student.equals(Osoba) vrátí false → porušení!
```

#### Oprava 1: udělej třídy **final**

Pokud se typ nemá dědit, `final` jednoduše zavírá problém.

#### Oprava 2: porovnávej přes **`getClass()`** místo `instanceof`

Tím řekneš, že různé úrovně nejsou „rovné“.

```java
class Osoba {
    final String jmeno;
    Osoba(String j){ this.jmeno = j; }

    @Override public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false; // ← klíčové
        Osoba p = (Osoba) o;
        return jmeno.equals(p.jmeno);
    }
    @Override public int hashCode() { return jmeno.hashCode(); }
}
```

#### Doporučený vzor pro hodnotové třídy

```java
final class Point {
    final int x, y;
    Point(int x, int y){ this.x = x; this.y = y; }

    @Override public boolean equals(Object o){
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Point p = (Point) o;
        return x == p.x && y == p.y;
    }
    @Override public int hashCode(){ return 31 * x + y; }
}
```

### `hashCode()` — vždy v páru s `equals`

**Kontrakt:** stejné objekty podle `equals` musí mít stejný `hashCode`.
**Důsledek:** přepiš ho vždy, když přepisuješ `equals`.
**Návod**: Používej stejná pole pro výpočet `hashCode`, jaká používáš v `equals`.

Třída `Objects` má užitečnou metodu `hash(...)`- slouží k výpočtu hash kódu z více polí:

```java
@Override public int hashCode(){
    return Objects.hash(pole1, pole2, pole3);
}
```

#### Praktická ukázka + „bug“ s HashSetem

```java
class User {
    final String email;
    User(String email){ this.email = email; }

    @Override public boolean equals(Object o){
        if (this == o) return true;
        if (!(o instanceof User u)) return false;
        return email.equalsIgnoreCase(u.email);
    }
    @Override public int hashCode(){
        return email.toLowerCase().hashCode(); // konzistentní s equals
    }
}

Set<User> s = new HashSet<>();
s.add(new User("A@EXAMPLE.com"));
System.out.println(s.contains(new User("a@example.com"))); // true
```

> Kdybych `hashCode()` nepřepsal, `contains` by často vracelo **false**, i když `equals` je **true**.

### `toString()` — čitelné a užitečné

* Výchozí tvar `Typ@hexHash` je k ničemu.
* Napiš stručné, informativní: ideálně **jméno polí a hodnoty**.

```java
class Order {
    final long id; final String state;
    Order(long id, String st){ this.id = id; this.state = st; }

    @Override public String toString(){
        return "Order{id=" + id + ", state=" + state + "}";
    }
}

// Log: "Processing Order{id=12345, state=CREATED}"
```

> V hierarchii: můžeš **použít `super.toString()`** a doplnit:

```java
class TimedOrder extends Order {
    final long createdAt;
    TimedOrder(long id, String st, long ts){ super(id, st); this.createdAt = ts; }

    @Override public String toString(){
        return super.toString() + ", createdAt=" + createdAt;
    }
}
```

### `getClass()` — final (časté v `equals`)

* Nelze překrýt.
* Použij v `equals` pro „stejný přesný typ“, ne „podtyp“.
* Hodí se pro logování a reflexi.

```java
Object o = new java.util.Date();
System.out.println(o.getClass().getName()); // "java.util.Date"
```

### `clone()` — kdy a jak (a proč spíš ne)

* Funguje, **jen** pokud třída implementuje `Cloneable`.
* `super.clone()` vytvoří **mělkou kopii** (shallow copy).
* V hierarchii dodrž: vždy volat `super.clone()` a případně **zhloubit** mutable pole.

#### Ukázka mělká→hlubší kopie

```java
class Bag implements Cloneable {
    int[] data;

    @Override public Bag clone() {
        try {
            Bag copy = (Bag) super.clone(); // mělká kopie
            copy.data = data.clone();       // zhloubení pole
            return copy;
        } catch (CloneNotSupportedException e) {
            throw new AssertionError(e);
        }
    }
}
```

### V dědičnosti

```java
class A implements Cloneable {
    int a;
    @Override public A clone() throws CloneNotSupportedException {
        return (A) super.clone();
    }
}
class B extends A {
    StringBuilder buf;
    @Override public B clone() {
        try {
            B b = (B) super.clone(); // zavolá A.clone → super.clone
            b.buf = new StringBuilder(buf.toString()); // zhloubení
            return b;
        } catch (CloneNotSupportedException e) {
            throw new AssertionError(e);
        }
    }
}
```

> **Doporučení:** často je lepší **kopírovací konstruktor** nebo **tovární metoda** než `clone()`.

### `finalize()` — zastaralé, nepoužívej

* Finalizace je **deprecated** a v moderních JDK prakticky vypnutá.
* Místo toho používej **`AutoCloseable` + try-with-resources** pro uvolnění zdrojů.

```java
class Resource implements AutoCloseable {
    public void close() { /* uvolni nativní/IO zdroje */ }
}

try (Resource r = new Resource()) {
    // práce se zdrojem
} // auto-close
```

### `wait(...)`, `notify()`, `notifyAll()` — final; nepřekrývají se

* Volají se **jen uvnitř synchronized** bloku/metody, na **témže objektu**.
* Vždy čekej ve **while** s podmínkou (spurious wakeups).

### Minimalistický příklad

```java
class Gate {
    private boolean open;

    public synchronized void open() {
        open = true;
        notifyAll();
    }

    public synchronized void awaitOpen() throws InterruptedException {
        while (!open) wait();
    }
}
```

### Jak to celé skloubit v hierarchii (best-practice)

1. **Rozhodni se**, zda rovnost má být „přesný typ“ (`getClass()`) nebo „je-to“ (`instanceof`).

   * U hodnotových tříd a tam, kde hrozí dědění → preferuj `getClass()` nebo udělej třídu `final`.
2. **Vždy přepiš `hashCode()`**, když přepisuješ `equals`.
3. **`toString()`** udrž stručné a stabilní (dobré do logů).
4. **`clone()`** používej výjimečně; jinak kopírovací konstruktor.
5. **`wait/notify`** používej jen když musíš; jinak vyšší úroveň z `java.util.concurrent`.

## Časté chyby a tipy

* Zapomeneš zavolat správný `super(...)`, když předek nemá bezparametrový konstruktor.
* Přísnější viditelnost u překryté metody (např. z `public` na „package-private“) — **nelze**.
* Spoléhat v konstruktoru předka na metodu, kterou potomek **překrývá** (objekt ještě není plně zkonstruován).
* Plést si overriding a hiding (zejména u `static`).
