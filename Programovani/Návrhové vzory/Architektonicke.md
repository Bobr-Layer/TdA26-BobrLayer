# Architektonické vzory

Architektonické vzory řeší **strukturu celých aplikací** a jejich hlavní komponenty a interakce.

## Microservices

**Myšlenka:** Aplikaci rozdělím na **malé, nezávisle nasaditelné služby**. Každá má vlastní data, API a zodpovědnost (bounded context). Služby spolu mluví **síťově** (HTTP, messaging).

### Kdy (a kdy ne)

* **Ano:** doména má přirozené hranice; týmová škálovatelnost; potřeba nezávislého nasazování; různé tech stacky.
* **Ne:** malý tým/jednoduchý produkt; chybí observabilita a CI/CD; nejsou zkušenosti se **síťovou spolehlivostí**.

### Klíče k úspěchu

* **Jasné kontrakty** (versionované API, backward-compatible změny).
* **Vlastnictví dat**: žádná sdílená DB. Každá služba má **svoji databázi**.
* **Resilience**: timeouts, retry s backoffem, circuit breaker, idempotence.
* **Observabilita**: metriky, tracing, centralizované logy.
* **Asynchronie**: pro business tok často lepší eventy než synchronní kaskády.

### Mini-ukázka: volání mezi službami (Java 11+ `HttpClient`)

```java
import java.net.http.*;
import java.net.URI;
import java.time.Duration;

class PricingClient {
    // Sdílený HttpClient s timeoutem připojení
    private final HttpClient http = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(2)).build();

    // Získá cenu produktu
    public int priceCents(String productId, int qty) throws Exception {
        HttpRequest req = HttpRequest.newBuilder(
                URI.create("https://pricing/api/v1/price?product=" + productId + "&qty=" + qty))
            .timeout(Duration.ofSeconds(1))
            .GET().build();

        HttpResponse<String> res = http.send(req, HttpResponse.BodyHandlers.ofString());
        if (res.statusCode() == 200) return Integer.parseInt(res.body());
        throw new IllegalStateException("Pricing error: " + res.statusCode());
    }
}
```

### Idempotence (typický problém)

Síť může **opakovat** požadavky (retry). Zaveďte **idempotency key**:

**Idempotentní operace** vrátí stejný výsledek, i když je volána vícekrát se stejnými parametry.

```java
import java.util.concurrent.ConcurrentHashMap;

// Příklad idempotentní tvorby objednávky
class OrdersService {
    private final ConcurrentHashMap<String, String> processed = new ConcurrentHashMap<>();
    // Vrátí orderId
    public String createOrder(String idempotencyKey, String payload) {
        return processed.computeIfAbsent(idempotencyKey, k -> doCreate(payload));
    }
    private String doCreate(String payload) { /* vlož do DB, vrátí orderId */ return "ORD-123"; }
}
```

**Tipy:** Konsolidujte timeouty, sledujte P99 latence, mějte „bulwark“ (circuit breaker) při výpadcích závislostí.

## CQRS (Command Query Responsibility Segregation)

**Myšlenka:** **Oddělit zápis** (Command) **od čtení** (Query). Čtecí model může být **denormalizovaný a rychlý**, zápisový model hlídá business pravidla. Často jde ruku v ruce s **eventy** (viz níže).

### Kdy

* Čtení a zápis mají **velmi odlišné požadavky** (latence, projekce, pohledy).
* Potřebujete **škálovat čtení** (99 % trafiku) bez přetěžování složité domény.

### Důsledky

* **Eventual consistency** mezi write a read světem (počítejte s tím v UI).
* Dva modely → více kódu, ale jasná separace odpovědností.

### Struktura

```
[API Write] --> [Command Handler] --> [Domain] --> [Events] --> [Read Model Projector] --> [Read Store]
[API Read ] ----------------------------------------------------------> [Query Handler (čte z Read Store)]
```

### Ukázky (bez rámce)

#### Command & handler (zápisová strana)

```java
// Command (DTO)
// Vytvoří nový účet
record CreateAccount(String accountId, String owner, int initialCents) {}

// Doména
// Agregát účtu s rozhodováním 
// (otevření účtu) a generováním eventu 
final class Account {
    private final String id; private final String owner; private int balance;
    Account(String id, String owner){ this.id=id; this.owner=owner; this.balance=0; }
    DomainEvent open(int initial){
        if (initial < 0) throw new IllegalArgumentException("Negative init");
        this.balance += initial;
        return new AccountOpened(id, owner, initial);
    }
}

// Handler
// Zpracuje CreateAccount command a publikuje event 
// na EventBus 
class CreateAccountHandler {
    private final EventBus bus;
    CreateAccountHandler(EventBus bus){ this.bus = bus; }
    public void handle(CreateAccount cmd){
        Account a = new Account(cmd.accountId(), cmd.owner());
        DomainEvent ev = a.open(cmd.initialCents());
        bus.publish(ev);
    }
}

// Event kontrakt
// Událost otevření účtu
sealed interface DomainEvent permits AccountOpened {}
record AccountOpened(String accountId, String owner, int initialCents) implements DomainEvent {}
interface EventBus { void publish(DomainEvent e); }
```

#### Projekce do read modelu (čtecí strana)

```java
import java.util.concurrent.ConcurrentHashMap;

// Projekce událostí do čtecího modelu
class AccountsReadModel {
    // Jednoduchý in-memory store viewů 
    private final ConcurrentHashMap<String, AccountView> views = new ConcurrentHashMap<>();
    void apply(AccountOpened e){
        views.put(e.accountId(), new AccountView(e.accountId(), e.owner(), e.initialCents()));
    }
    AccountView get(String id){ return views.get(id); }
}
record AccountView(String id, String owner, int balance) {}
```

#### Query handler

```java
record GetAccount(String id) {}
class GetAccountHandler {
    // Čtecí model pro získání view účtu 
    private final AccountsReadModel read;
    GetAccountHandler(AccountsReadModel read){ this.read = read; }
    public AccountView handle(GetAccount q){ return read.get(q.id()); }
}
```

**Tipy:** Čtecí model klidně držte v jiné technologii (např. key-value store). Při nasazení počítejte s **rebuild projekcí** (např. při změně schématu view).

## Event Sourcing

**Myšlenka:** Namísto přepisování stavu ukládám **nezměnitelný log událostí** (append-only). **Aktuální stav** se získá **replayem** událostí (nebo snapshot + replay). Čtecí modely jsou **projekce** z těchto událostí.

### Kdy

* Potřeba **auditovatelnosti** (kdo, co, kdy, proč se stalo).
* Komplexní invariants, které je snazší odvodit z **sekvence změn**.
* Lehké vytváření **alternativních pohledů** (nová projekce = re-play).

### Důsledky

* Zápis: `Command -> rozhodnutí v doméně -> Eventy -> append to event store`.
* Čtení: projekce eventů do **read modelů** (eventual consistency).
* Migrace = transformace eventů / rebuild projekcí.

### Ukázky (naivní event store v paměti)

#### Event store a stream

```java
import java.util.*;

record StoredEvent(String aggregateId, long seq, DomainEvent payload) {}

class InMemoryEventStore {
    private final Map<String, List<StoredEvent>> streams = new HashMap<>();

    public synchronized void append(String id, long expectedVersion, List<DomainEvent> newEvents) {
        var stream = streams.computeIfAbsent(id, k -> new ArrayList<>());
        long current = stream.size();
        if (current != expectedVersion) throw new IllegalStateException("Concurrency conflict");
        long seq = current;
        for (DomainEvent e : newEvents) stream.add(new StoredEvent(id, ++seq, e));
    }

    public synchronized List<StoredEvent> load(String id) {
        return List.copyOf(streams.getOrDefault(id, List.of()));
    }
}
```

#### Agregát, rozhodování a aplikace událostí

```java
sealed interface DomainEvent permits AccountOpened, MoneyDeposited, MoneyWithdrawn {}
record AccountOpened(String accountId, String owner) implements DomainEvent {}
record MoneyDeposited(String accountId, int cents) implements DomainEvent {}
record MoneyWithdrawn(String accountId, int cents) implements DomainEvent {}

final class BankAccount {
    private String id; private String owner; private int balance; private long version;

    // Rekonstrukce z eventů (replay)
    static BankAccount rehydrate(List<StoredEvent> history){
        BankAccount a = new BankAccount();
        history.forEach(e -> a.apply(e.payload()));
        a.version = history.size();
        return a;
    }
    long version(){ return version; }

    // Decider (business logika -> nové eventy)
    List<DomainEvent> open(String id, String owner){
        if (this.id != null) throw new IllegalStateException("Already opened");
        return List.of(new AccountOpened(id, owner));
    }
    List<DomainEvent> deposit(int cents){
        if (cents <= 0) throw new IllegalArgumentException("<=0");
        return List.of(new MoneyDeposited(id, cents));
    }
    List<DomainEvent> withdraw(int cents){
        if (cents <= 0) throw new IllegalArgumentException("<=0");
        if (balance < cents) throw new IllegalStateException("Insufficient funds");
        return List.of(new MoneyWithdrawn(id, cents));
    }

    // Mutátor stavu z eventu (aplikace)
    private void apply(DomainEvent e){
        if (e instanceof AccountOpened ao) { this.id = ao.accountId(); this.owner = ao.owner(); this.balance = 0; }
        else if (e instanceof MoneyDeposited md) { this.balance += md.cents(); }
        else if (e instanceof MoneyWithdrawn mw) { this.balance -= mw.cents(); }
    }
}
```

#### Command handler s optimistic lockingem

```java
class AccountCommandService {
    private final InMemoryEventStore store;
    AccountCommandService(InMemoryEventStore store){ this.store = store; }

    public void open(String id, String owner){
        var history = store.load(id);
        var acc = BankAccount.rehydrate(history);
        var newEvents = acc.open(id, owner);
        store.append(id, acc.version(), newEvents);
    }

    public void deposit(String id, int cents){
        var history = store.load(id);
        var acc = BankAccount.rehydrate(history);
        var newEvents = acc.deposit(cents);
        store.append(id, acc.version(), newEvents);
    }
}
```

#### Projekce (read model)

```java
class BalanceProjection {
    private final Map<String, Integer> balances = new HashMap<>();
    void on(DomainEvent e){
        if (e instanceof AccountOpened ao) balances.put(ao.accountId(), 0);
        else if (e instanceof MoneyDeposited md) balances.merge(md.accountId(), md.cents(), Integer::sum);
        else if (e instanceof MoneyWithdrawn mw) balances.merge(mw.accountId(), -mw.cents(), Integer::sum);
    }
    Integer balance(String id){ return balances.getOrDefault(id, 0); }
}
```

## Tipy pro Event Sourcing

* **Idempotentní projekce**: každá projekce by měla snést re-play (např. kontrola sekvence).
* **Snapshoty**: pro velmi dlouhé streamy (např. každých 1000 eventů uložit snapshot stavu + pozici).
* **Versioning eventů**: nikdy nemažte staré typy bez migrace; používejte upcast/transformaci při čtení.
* **Testy**: given [historie eventů] → when [command] → then [nové eventy].

## Jak se to skládá dohromady (častý obraz)

* **Microservices** definují hranice a nasazování.
* **Uvnitř služby** používáte **CQRS** k oddělení write/read.
* **Write model** je často **Event-Sourced**; **Read modely** jsou projekce pro rychlé dotazy.
* **Mezislužbová integrace** probíhá přes **doménové eventy** (asynchronně), složitější transakce přes **Sagy** (kompenzační akce místo 2PC).

## Rychlá rozhodovací mapa

* **Potřebuji nezávisle škálovat a nasazovat části systému?** → Microservices
* **Čtení >> zápis, chci rychlé dotazy a jednoduché denormalizované pohledy?** → CQRS
* **Chci audit stopu, historii a snadné derivace stavů?** → Event Sourcing (+ CQRS)
