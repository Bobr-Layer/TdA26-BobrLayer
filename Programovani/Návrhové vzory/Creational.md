# Tvořivé (Creational)

Řeší **jak vytvářet objekty**, aby nevznikaly silné vazby na konkrétní třídy.

## Factory Method

**Myšlenka:** Nechť *nadřazená třída* (creator) definuje šablonu práce s produktem, ale **volbu konkrétního typu** produktu přenechá *podtřídě* v metodě „factory method“.

### K čemu to je

* Odstraní `new KonkrétníProdukt()` z univerzálního kódu.
* Umožní plug-in varianty (např. různá UI tlačítka, různé exportéry).

### Struktura (zjednodušeně)

```
Creator
 ├─ operation()  → používá Product
 └─ factoryMethod(): Product   ← přepisuje ConcreteCreator
Product (rozhraní)
 ├─ ConcreteProductA
 └─ ConcreteProductB
```

### Ukázka (Java)

```java
interface Button { void click(); }
class WinButton implements Button { public void click(){ System.out.println("Win click"); } }
class MacButton implements Button { public void click(){ System.out.println("Mac click"); } }

abstract class Dialog {
    // Factory Method (abstraktní, rozhodnutí v podtřídě)
    protected abstract Button createButton();

    // Běžný kód, který používá Product, ale neví jak vznikl
    public void render() {
        Button b = createButton();
        b.click();
    }
}

class WinDialog extends Dialog {
    @Override protected Button createButton() { return new WinButton(); }
}
class MacDialog extends Dialog {
    @Override protected Button createButton() { return new MacButton(); }
}

// Použití
class App {
    static Dialog createDialog(String os) {
        return switch (os) {
            case "win" -> new WinDialog();
            case "mac" -> new MacDialog();
            default -> throw new IllegalArgumentException("Unknown OS");
        };
    }
    public static void main(String[] args) {
        Dialog d = createDialog("win");
        d.render();
    }
}
```

### Kdy použít

* Typ objektu závisí na **kontextu** (OS, konfigurace, feature flag).
* Chci **rozšiřitelnost** – další typ přidám jen novou podtřídou.

### Kdy ne

* Pokud stačí **předat strategii** nebo funkční rozhraní (menší overhead).
* Pokud typ výsledku nijak nekolísá → prostě `new ...`.

### Tipy

* Držte factory method **chráněnou** (`protected`) a používejte ji jen v kostře algoritmu.
* Pro jednoduché větvení někdy stačí **statická továrna** (viz níže Abstract Factory).

## Abstract Factory

**Myšlenka:** Jediným rozhraním vytvoř **rodinu souvisejících objektů**, které k sobě „ladí“ (např. všechno pro Win nebo pro Mac). Klient neřeší konkrétní třídy.

### Struktura

```
AbstractFactory
 ├─ createButton(): Button
 └─ createCheckbox(): Checkbox
ConcreteFactoryWin | ConcreteFactoryMac
Button, Checkbox (abstraktní produkty)
ConcreteButtonWin/Mac, ConcreteCheckboxWin/Mac
```

### Ukázka (Java)

```java
// Produkty
interface Button { void paint(); }
interface Checkbox { void toggle(); }

class WinButton implements Button { public void paint(){ System.out.println("WinButton"); } }
class WinCheckbox implements Checkbox { public void toggle(){ System.out.println("WinCheckbox"); } }
class MacButton implements Button { public void paint(){ System.out.println("MacButton"); } }
class MacCheckbox implements Checkbox { public void toggle(){ System.out.println("MacCheckbox"); } }

// Továrny
interface UIFactory {
    Button createButton();
    Checkbox createCheckbox();
}
class WinFactory implements UIFactory {
    public Button createButton(){ return new WinButton(); }
    public Checkbox createCheckbox(){ return new WinCheckbox(); }
}
class MacFactory implements UIFactory {
    public Button createButton(){ return new MacButton(); }
    public Checkbox createCheckbox(){ return new MacCheckbox(); }
}

// Klient
class Screen {
    private final Button b; private final Checkbox c;
    Screen(UIFactory f){ this.b = f.createButton(); this.c = f.createCheckbox(); }
    void draw(){ b.paint(); c.toggle(); }
}

class Demo {
    public static void main(String[] args) {
        UIFactory factory = System.getProperty("os.name").startsWith("Windows")
                ? new WinFactory() : new MacFactory();
        new Screen(factory).draw();
    }
}
```

### Kdy použít

* Potřebujete **konzistentní rodinu** komponent (viz skin/tema).
* Chcete **snadno přepínat** celé sady (testy, simulace vs. real HW, lokální vs. cloud storage).

### Kdy ne

* Jen **jeden produkt**? Factory Method stačí.
* Potřebujete **přidávat nové typy produktů často** – přibývá metoda do všech továren.

### Tipy

* Pro přepínání rodiny používejte **injekci závislosti**.
* V testech nahrazujte `UIFactory` **fake** implementací.

## Builder

**Myšlenka:** Sestav složitý objekt krok po kroku s přehledným fluent API. Cíl: **immutabilita** a čitelnost bez „telescoping constructors“.

### Problém

„Třída s 12 volitelnými parametry“ → konstruktory s 12 kombinacemi → nečitelné.

### Ukázka (immutable objekt + validace)

```java
import java.util.*;

final class HttpRequest {
    private final String url;
    private final int timeoutMs;
    private final boolean gzip;
    private final Map<String, String> headers;

    private HttpRequest(Builder b) {
        this.url = Objects.requireNonNull(b.url, "url");
        this.timeoutMs = b.timeoutMs;
        this.gzip = b.gzip;
        this.headers = Collections.unmodifiableMap(new LinkedHashMap<>(b.headers));
    }

    public String url(){ return url; }
    public int timeoutMs(){ return timeoutMs; }
    public boolean gzip(){ return gzip; }
    public Map<String,String> headers(){ return headers; }

    public static class Builder {
        private String url;
        private int timeoutMs = 5000;
        private boolean gzip = true;
        private final Map<String,String> headers = new LinkedHashMap<>();

        public Builder url(String u){ this.url = u; return this; }
        public Builder timeoutMs(int t){ this.timeoutMs = t; return this; }
        public Builder gzip(boolean g){ this.gzip = g; return this; }
        public Builder header(String k, String v){ this.headers.put(k, v); return this; }

        public HttpRequest build() {
            if (!url.startsWith("http")) throw new IllegalStateException("Bad URL");
            return new HttpRequest(this);
        }
    }
}

class Demo {
    public static void main(String[] args) {
        HttpRequest req = new HttpRequest.Builder()
                .url("https://api.example.com/data")
                .timeoutMs(3000)
                .header("Accept", "application/json")
                .build();
        System.out.println(req.url() + " " + req.headers());
    }
}
```

### Kdy použít

* Mnoho **volitelných** parametrů, závislosti mezi nimi, požadavek na **immutabilitu**.
* Opakovaná výroba „podobných“ konfigurací (možný **director** – přednastavené presety).

### Kdy ne

* Dva parametry? Zbytečné – použijte běžný konstruktor/setter.

### Tipy

* V `build()` proveďte **validaci invariantu**.
* Vytvářejte **přednastavené buildery** (factory metoda `forJsonApi()`…).

## Prototype

**Myšlenka:** Vytvářej novou instanci **naklonováním existující**. Užitečné, když inicializace je drahá/komplexní a chceme mít „výchozí šablony“.

### Dvě cesty v Javě

1. `Cloneable` + `clone()` – historické, ošemetné (mělké kopie, checked/unchecked výjimky).
2. **Kopírovací konstruktor / copy factory** – preferovaná, čitelná a bezpečná.

### Ukázka (copy constructor, hluboká kopie)

```java
import java.util.*;

final class Diagram {
    private final String name;
    private final List<String> layers;

    public Diagram(String name, List<String> layers) {
        this.name = name;
        this.layers = new ArrayList<>(layers); // kopie
    }

    // Prototype: kopírovací konstruktor
    public Diagram(Diagram other) {
        this(other.name, other.layers); // List se zkopíruje v konstruktoru výše
    }

    public Diagram withName(String newName) { return new Diagram(newName, this.layers); }
    public List<String> layers() { return Collections.unmodifiableList(layers); }
}

class Registry {
    private final Map<String, Diagram> prototypes = new HashMap<>();
    public void register(String key, Diagram proto){ prototypes.put(key, proto); }
    public Diagram create(String key){ return new Diagram(prototypes.get(key)); }
}

class Demo {
    public static void main(String[] args) {
        Registry r = new Registry();
        r.register("net", new Diagram("Network", List.of("L1","L2","L3")));
        Diagram copy = r.create("net").withName("Network-Copy");
        System.out.println(copy.layers());
    }
}
```

### Kdy použít

* Vytváření objektů je **drahé** (výpočet/IO), ale kopie z prototypu je levná.
* Potřebujete **„šablony“** objektů a drobné úpravy.

### Kdy ne

* Když objekty mají složité grafy s cykly → u clone/hlubokých kopií je to snadno chybové.

### Tipy

* Preferujte **copy constructor** nebo **statickou `copyOf(...)`** metodu.
* Uveďte jasně, zda je kopie **mělká** nebo **hluboká** (dokumentujte!).

## Singleton

**Myšlenka:** Zajistit **jedinou instanci** třídy v aplikaci a globálně k ní přistupovat.

> Pozor: snadno sklouzne k anti-patternu („globální stav“). Většinou je lepší **DI** (předávat závislost jako parametr).

### Bezpečné idiomy v Javě

1. **Enum Singleton** – nejjednodušší a odolný vůči serializaci i reflexi.

```java
public enum Config {
    INSTANCE;
    private int level = 1;
    public int level(){ return level; }
    public void setLevel(int l){ level = l; }
}
```

2. **Initialization-on-demand holder** – lazy, thread-safe bez synchronized nákladů.

```java
public final class Logger {
    private Logger() {}
    private static class Holder { static final Logger INSTANCE = new Logger(); }
    public static Logger getInstance(){ return Holder.INSTANCE; }
}
```

3. **Double-checked locking** (správně s `volatile`) – dnes méně potřeba:

```java
public final class Cache {
    private static volatile Cache instance;
    private Cache() {}
    public static Cache getInstance(){
        if (instance == null) {
            synchronized (Cache.class) {
                if (instance == null) instance = new Cache();
            }
        }
        return instance;
    }
}
```

### Kdy použít

* Opravdu existuje **jeden sdílený zdroj** (konfigurace procesu, registr metrik, logovací backend).

### Kdy ne

* V testech dělá potíže (sdílený stav). Pokud můžete, preferujte **injekci**.

### Tipy

* Ujistěte se, že je **thread-safe** a bezpečný vůči **serializaci** (enum to řeší elegantně).
* Nevystavujte zbytečně **mutátory** – pokud to jde, udělejte ho **immutable**.

## Object Pool

**Myšlenka:** Místo vytváření a ničení drahých objektů je **recykluj** v „bazénu“. Klient si **půjčí** (borrow), použije, **vrátí** (release).

> V praxi dnes poolují hlavně **spojení do DB**, vlákna, velké buffery apod. Pro obyčejné objekty je GC v Javě velmi dobrý – vlastní pool může **zhoršit** výkon, pokud není potřeba.

### Struktura

* `ObjectPool<T>` uvnitř drží kolekci volných instancí (`BlockingQueue`).
* `borrow()`… získá instanci (blokující/neblo kující), `release(T)`… vrátí.

### Jednoduchá ukázka (pool StringBuilderů)

```java
import java.util.concurrent.*;
import java.util.function.Supplier;

class ObjectPool<T> {
    private final BlockingQueue<T> pool;
    private final Supplier<T> creator;

    public ObjectPool(int size, Supplier<T> creator) {
        this.pool = new ArrayBlockingQueue<>(size);
        this.creator = creator;
        for (int i = 0; i < size; i++) pool.add(creator.get());
    }

    public T borrow() throws InterruptedException {
        T obj = pool.poll();
        return (obj != null) ? obj : creator.get(); // fail-soft: vytvoř dočasný
    }

    public void release(T obj) {
        // nepodaří-li se vrátit, necháme GC (typicky při dočasném přelivu)
        pool.offer(obj);
    }
}

class Demo {
    public static void main(String[] args) throws Exception {
        ObjectPool<StringBuilder> sbPool = new ObjectPool<>(4, StringBuilder::new);

        String result;
        StringBuilder sb = sbPool.borrow();
        try {
            sb.setLength(0);
            sb.append("Hello, pooled ");
            sb.append("StringBuilder!");
            result = sb.toString();
        } finally {
            sb.setLength(0);        // vyčistit!
            sbPool.release(sb);     // vrátit do poolu
        }
        System.out.println(result);
    }
}
```

> Pozn.: Pro databázi nepíšeme vlastní pool – použijte zavedené knihovny (HikariCP apod.).

### Kdy použít

* Vytváření/likvidace je **drahá** (síťová spojení, sockety, vlákna, velké byte[]).
* Latence musí být **stabilní** (vyhnete se opakovanému alokování).

### Kdy ne

* Běžné objekty → JVM/GC je rychlejší, vlastní pool může škodit.
* Pokud objekt nese **stav** – vždy ho **resetujte** před vrácením!

### Tipy

* Zvažte **AutoCloseable wrapper** pro bezpečné vracení (try-with-resources).

```java
class Pooled<T> implements AutoCloseable {
    private final ObjectPool<T> pool; private final T value;
    Pooled(ObjectPool<T> pool, T value){ this.pool=pool; this.value=value; }
    public T get(){ return value; }
    public void close(){ pool.release(value); }
}
```

## Rychlá rozhodovací mapa (pro tyto vzory)

* **Máte rodiny kompatibilních produktů?** → **Abstract Factory**
* **Potřebujete zvolit konkrétní podtyp až v podtřídě?** → **Factory Method**
* **Složitá konfigurace objektu, chcete immutabilitu?** → **Builder**
* **Chcete kopírovat „šablonu“ objektu?** → **Prototype** (kop. konstruktor)
* **Opravdu jen jedna instance?** → **Singleton** (enum/holder)
* **Drahé vytváření, chcete recyklovat?** → **Object Pool** (jen pokud dává smysl)
