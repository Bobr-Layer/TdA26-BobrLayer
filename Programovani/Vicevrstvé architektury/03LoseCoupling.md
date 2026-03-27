# Loose Coupling – role rozhraní pro návrh škálovatelných aplikací

**„Loose coupling“** (volné vazby) znamená, že části systému o sobě vědí co nejméně — komunikují přes **stabilní kontrakty** (rozhraní), ne přes konkrétní implementace. To zvyšuje udržovatelnost, testovatelnost i škálovatelnost (lidskou i technickou).

## Proč rozhraní (interface) pomáhají škálovat

* **Izolace změn:** měníte implementaci, kontrakt zůstává → minimální dopad na zbytek.
* **Paralelní práce týmů:** tým A definuje kontrakt, týmy B/C dodají implementace nezávisle.
* **Diversifikace infrastruktury:** stejné rozhraní může mít paměťovou/DB/remote implementaci.
* **Testovatelnost:** snadné nahradit „těžké“ vrstvy (DB, síť) „fake“/mock implementací.
* **Výkon/odolnost:** můžete přepnout na cache/async implementaci bez změny klientů.
* **Evoluce:** přidáváte metody „vedle“ (nové rozhraní, default metody) bez rozbití klientů.


## Základní princip: záviset na abstrakcích, ne na konkrétních třídách

**Dependency Inversion** - high-level moduly (business logika) by neměly záviset na low-level modulech (DB, messaging) - oboje by mělo záviset na abstrakcích (rozhraních).

```plaintext
high-level module (business logic)
   ↓
   abstraction (interface)
   ↑
low-level module (DB, messaging)
```


```java
// Kontrakt (stabilní API)
public interface MessageBus {
    void publish(String topic, byte[] payload);
}

// Klient (závisí na rozhraní, ne na třídě)
public class OrderService {
    private final MessageBus bus;
    public OrderService(MessageBus bus) { this.bus = bus; }

    public void placeOrder(String itemId) {
        // ... doménová logika ...
        bus.publish("orders.created", itemId.getBytes());
    }
}

// Implementace 1: in-memory (rychlé testy)
public class InMemoryBus implements MessageBus {
    private final java.util.List<String> history = new java.util.ArrayList<>();
    @Override public void publish(String topic, byte[] payload) {
        history.add(topic + ":" + new String(payload));
    }
    public java.util.List<String> history() { return history; }
}

// Implementace 2: Kafka/RabbitMQ/HTTP (produkce)
public class KafkaBus implements MessageBus {
    @Override public void publish(String topic, byte[] payload) {
        // ... odeslání do externího systému ...
    }
}
```

**Výhoda:** `OrderService` nezajímá „jak“ se zpráva posílá. V testech použijete `InMemoryBus`, v produkci `KafkaBus`.

## Strategy / Policy injection
Design pattern **Strategy** umožňuje měnit chování objektu za běhu pomocí různých implementací rozhraní.


```java
public interface PricingStrategy {
    long computeCents(long basePriceCents);
}

public class NoDiscount implements PricingStrategy {
    public long computeCents(long base) { return base; }
}

public class PercentOff implements PricingStrategy {
    private final int percent; // např. 15 = -15 %
    public PercentOff(int percent) { this.percent = percent; }
    public long computeCents(long base) { return base - base * percent / 100; }
}

public class Cart {
    private PricingStrategy pricing;
    public Cart(PricingStrategy pricing) { this.pricing = pricing; }
    public void setPricing(PricingStrategy p) { this.pricing = p; }

    public long total(long base) { return pricing.computeCents(base); }
}
```

**Škálování:** přidáte novou strategii (např. „happy-hour“, „tiered“) bez změny `Cart`.

## Repository kontrakty
Repository pattern definuje abstrakci pro přístup k datům (uložiště), oddělující doménovou logiku od konkrétní persistence.
```java
public record User(long id, String name, boolean active) {}

public interface UserRepository {
    java.util.Optional<User> findById(long id);
    java.util.List<User> findAll();
    User save(User u);
}

// In-memory varianta (testy, malý nástroj)
public class InMemoryUserRepository implements UserRepository {
    private final java.util.Map<Long, User> db = new java.util.HashMap<>();
    private long seq = 0;
    public java.util.Optional<User> findById(long id) { return java.util.Optional.ofNullable(db.get(id)); }
    public java.util.List<User> findAll() { return new java.util.ArrayList<>(db.values()); }
    public User save(User u) {
        if (u.id() == 0) u = new User(++seq, u.name(), u.active());
        db.put(u.id(), u);
        return u;
    }
}

// File/DB varianta (produkční/persistentní)
public class FileUserRepository implements UserRepository {
    public java.util.Optional<User> findById(long id) { /* načtení ze souboru/DB */ return java.util.Optional.empty(); }
    public java.util.List<User> findAll() { /* ... */ return java.util.List.of(); }
    public User save(User u) { /* ... */ return u; }
}
```

**Klient (Service) zůstává stejný**, mění se jen drátování konkrétní implementace.

## Testování díky rozhraním (rychlé, izolované)


```java
public class UserService {
    private final UserRepository repo;
    public UserService(UserRepository repo) { this.repo = repo; }

    public User register(String name) {
        if (name == null || name.isBlank()) throw new IllegalArgumentException("Name required");
        return repo.save(new User(0, name.trim(), true));
    }
}

// „Fake“ implementace pro test
class FakeRepo implements UserRepository {
    private final java.util.List<User> saved = new java.util.ArrayList<>();
    public java.util.Optional<User> findById(long id){ return java.util.Optional.empty(); }
    public java.util.List<User> findAll(){ return saved; }
    public User save(User u){ saved.add(u); return u; }
}

class UserServiceTest {
    public static void main(String[] args) {
        UserService svc = new UserService(new FakeRepo());
        User u = svc.register("  Alice  ");
        assert u.name().equals("Alice");
        System.out.println("OK");
    }
}
```

**Rychlé unit testy** bez DB/sítě → škáluje vývoj (víc testů, kratší zpětná vazba).

## Plugin architektura přes rozhraní (rozšiřitelnost)

```java
public interface Command {
    String name();
    void execute(String[] args);
}

public class Echo implements Command {
    public String name() { return "echo"; }
    public void execute(String[] args) { System.out.println(String.join(" ", args)); }
}

public class Upper implements Command {
    public String name() { return "upper"; }
    public void execute(String[] args) { System.out.println(String.join(" ", args).toUpperCase()); }
}

public class Shell {
    private final java.util.Map<String, Command> cmds = new java.util.HashMap<>();
    public void register(Command c) { cmds.put(c.name(), c); }
    public void run() throws java.io.IOException {
        var br = new java.io.BufferedReader(new java.io.InputStreamReader(System.in));
        String line;
        while ((line = br.readLine()) != null) {
            var parts = line.split("\\s+");
            if (parts.length == 0) continue;
            var c = cmds.get(parts[0]);
            if (c == null) System.out.println("Unknown");
            else c.execute(java.util.Arrays.copyOfRange(parts, 1, parts.length));
        }
    }
    public static void main(String[] a) throws Exception {
        var sh = new Shell();
        sh.register(new Echo());
        sh.register(new Upper());
        sh.run();
    }
}
```

**Škálování funkcionality:** nové příkazy přidáte jako nové třídy implementující `Command`, bez změny `Shell`.

## Praktické zásady pro „loose coupling“

* **Malá, soustředěná rozhraní** (Interface Segregation): raději víc užších kontraktů než jeden „tlustý“.
* **Neunikat konkrétními typy** směrem k volajícím (např. vracet `List<T>`/`Collection<T>` místo konkrétní `ArrayList<T>`).
* **Vstřikovat závislosti v konstruktoru**: objekt je po vytvoření „hotový“ (snadné testy).
* **Používat kompozici před dědičností**: variovat chování přes rozhraní (strategie) místo subclassing.
* **Oddělit IO od domény**: doména závisí na kontraktech (repo, bus), ne na `java.sql.*` či `HttpClient`.
* **Stabilní kontrakty, evoluce verzemi**: přidávejte nové metody rozumně (viz níže).

## Evoluce rozhraní (zpětná kompatibilita)

* **`default` metody** v rozhraních umožní přidat chování bez rozbití stávajících implementací.
  *Pozn.: `default` je od Javy 8; používejte střídmě — ať se z interface nestane „třída“.*
* **Nové rozhraní/adapter**: když je změna větší, vytvořte nové rozhraní a dočasný adapter.
* **Sealed rozhraní – JDK 17+**: omezení množiny implementací (užitečné u doménových variant).

  ```java
  public sealed interface PaymentResult permits Ok, Declined { }
  public record Ok(String id) implements PaymentResult { }
  public record Declined(String reason) implements PaymentResult { }
  ```
* **Java Platform Module System – JDK 9+**: moduly `exports`/`requires` (lepším řízením viditelnosti snižujete nechtěné vazby).

*(JDK 9+: moduly; JDK 17+: sealed; oboje pomáhá držet hranice a omezovat coupling.)*

## Kdy rozhraní nepřehánět

* Když existuje **jediná realistická implementace** a **neplánujete variovat** (např. malá utilita), interface může být zbytečné lepidlo. Místo toho zvažte **abstraktní třídu** nebo prostou třídu — rozhraní přidejte později při prvním signálu potřeby.

## Mini „checklist“ pro volné vazby v kódu

* [ ] Závisíte v high-level kódu na **rozhraních**?
* [ ] Má každé rozhraní **jednu odpovědnost**?
* [ ] Jsou závislosti **vstřikovány** (konstruktor) a ne vytvářené uvnitř?
* [ ] Můžete **spustit unit testy bez sítě/DB**?
* [ ] Můžete vyměnit implementaci (např. repo) **bez změny klientů**?
* [ ] Neunikají vám do API detaily infrastruktury (SQL, HTTP, vendor třídy)?

## Shrnutí

Rozhraní jsou hlavní nástroj k dosažení **loose coupling**: stabilní kontrakty oddělují **co** od **jak**. Díky nim škálujete:

* **kódově** (snazší změny, refaktor, variace implementací),
* **týmově** (paralelní práce, méně kolizí),
* **provozně** (možnost záměny úložišť, messagingu, cache).
