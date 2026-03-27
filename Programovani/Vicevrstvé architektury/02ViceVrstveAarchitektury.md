# Vícevrstvá architektura (Layered Architecture)

**Vícevrstvá architektura** dělí aplikaci do **jasně oddělených vrstev** s jednoznačnou zodpovědností a **směrem závislostí pouze „dolů“**:

```
UI/CLI  →  Application(Service)  →  Domain  →  Persistence/Infrastructure
           (use-cases)              (model)    (úložiště, I/O)
```

* **UI/CLI**: načítá vstup, tiskne výstup.
* **Application (Service)**: koordinuje **use-cases** (scénáře), drží transakční hranice, volá doménu a perzistenci.
* **Domain**: čistá obchodní logika, **bez** I/O.
* **Persistence/Infrastructure**: přístup k DB/souborům/síti, implementace rozhraní definovaných výše.

> Cíl: **nízká vazba (loose coupling)** a **vysoká soudržnost** uvnitř vrstev.

## Směr závislostí a kontrakty

* **Závislosti tečou shora dolů** (UI → Service → Repo).
* Vyšší vrstva závisí na **rozhraní** nižší vrstvy, ne na konkrétní třídě.
* Doména **nezná** UI ani konkrétní DB knihovny.

**[JDK 9+ Moduly (JPMS)]** pomáhají tyto hranice vynutit (viz níže).

## Datové objekty: Domain vs. DTO

* **Domain**: bohaté modely s pravidly (invarianty).
* **DTO**: „tupé“ přenosové objekty pro UI/CLI (a případně pro síť).
* Mapování: ručně nebo mapperem (u konzole často stačí přímo domain).

**[JDK 16+ `record`**] je skvělý pro DTO i neměnné doménové hodnoty (viz ukázky).

## Ukázkový projekt (konzolová app)

```
cz.firma.app
├─ cli/               (UI)
├─ application/       (use-cases / služby)
├─ domain/            (model + pravidla)
└─ persistence/       (repozitory rozhraní + implementace)
```

### Doména (čistá logika)

```java
// domain/User.java
package cz.firma.app.domain;

// [JDK 16+ record] neměnný hodnotový objekt
public record User(long id, String name, boolean active) {
    public User {
        if (name == null || name.isBlank()) throw new IllegalArgumentException("Name required");
    }
}

// domain/Result.java
package cz.firma.app.domain;

// [JDK 17+ sealed] objektový výsledek use-casu bez výjimek
public sealed interface Result permits Ok, NotFound, Locked { }

public record Ok(User user) implements Result { }
public record NotFound(long id) implements Result { }
public record Locked(long id) implements Result { }
```

> **Proč `sealed`?** Dovolí uzavřít hierarchii výsledků → kompilátor vás donutí vyřešit všechny varianty ve `switch`.
> **[JDK 17+ switch na `sealed` typy]** + **[JDK 14+ switch expressions]** pomáhá psát totální (úplné) větvení.

### Persistence (rozhraní + 1 implementace)

```java
// persistence/UserRepository.java
package cz.firma.app.persistence;

import cz.firma.app.domain.User;
import java.util.*;

public interface UserRepository {
    Optional<User> findById(long id);
    List<User> findAll();
    User save(User u); // create/update
}
```

```java
// persistence/InMemoryUserRepository.java
package cz.firma.app.persistence;

import cz.firma.app.domain.User;
import java.util.*;

public final class InMemoryUserRepository implements UserRepository {
    private final Map<Long, User> db = new HashMap<>();
    private long seq = 0;

    @Override public Optional<User> findById(long id) { return Optional.ofNullable(db.get(id)); }
    @Override public List<User> findAll() { return new ArrayList<>(db.values()); }

    @Override public User save(User u) {
        if (u.id() == 0) {
            long id = ++seq;
            u = new User(id, u.name(), u.active());
        }
        db.put(u.id(), u);
        return u;
    }
}
```

### Aplikační vrstva (use-cases / služby)

```java
// application/UserService.java
package cz.firma.app.application;

import cz.firma.app.domain.*;

import java.util.List;

public interface UserService {
    Result getUser(long id);
    Ok createUser(String name);
    List<User> listUsers();
    Result lockUser(long id);
}
```

```java
// application/UserServiceImpl.java
package cz.firma.app.application;

import cz.firma.app.domain.*;
import cz.firma.app.persistence.UserRepository;

import java.util.List;

public final class UserServiceImpl implements UserService {
    private final UserRepository repo;
    public UserServiceImpl(UserRepository repo) { this.repo = repo; }

    @Override public Result getUser(long id) {
        return repo.findById(id)
                   .<Result>map(u -> u.active() ? new Ok(u) : new Locked(id))
                   .orElse(new NotFound(id));
    }

    @Override public Ok createUser(String name) {
        User saved = repo.save(new User(0, name, true));
        return new Ok(saved);
    }

    @Override public List<User> listUsers() { return repo.findAll(); }

    @Override public Result lockUser(long id) {
        return repo.findById(id)
                   .map(u -> new Ok(repo.save(new User(u.id(), u.name(), false))))
                   .orElse(new NotFound(id));
    }
}
```

### UI/CLI (tenký, jen orchestruje)

```java
// cli/Main.java
package cz.firma.app.cli;

import cz.firma.app.application.*;
import cz.firma.app.domain.*;
import cz.firma.app.persistence.InMemoryUserRepository;

import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        UserService svc = new UserServiceImpl(new InMemoryUserRepository());
        Scanner sc = new Scanner(System.in);
        System.out.println("cmd: add <name> | get <id> | list | lock <id> | exit");
        while (true) {
            System.out.print("> ");
            String cmd = sc.next();
            switch (cmd) {
                case "add" -> {
                    String name = sc.nextLine().trim();
                    Ok ok = svc.createUser(name);
                    System.out.println("Created: " + ok.user());
                }
                case "get" -> {
                    long id = sc.nextLong();
                    printResult(svc.getUser(id));
                }
                case "list" -> svc.listUsers().forEach(System.out::println);
                case "lock" -> {
                    long id = sc.nextLong();
                    printResult(svc.lockUser(id));
                }
                case "exit" -> { return; }
                default -> System.out.println("Unknown");
            }
        }
    }

    static void printResult(Result r) {
        // [JDK 17+ switch na sealed] + [JDK 14+ switch expressions]
        String txt = switch (r) {
            case Ok ok -> "OK: " + ok.user();
            case NotFound nf -> "Not found: " + nf.id();
            case Locked l -> "Locked: " + l.id();
        };
        System.out.println(txt);
    }
}
```

> Všimněte si, že **CLI nezná repozitář** ani DB — komunikuje jen se `UserService`.

## Modulární hranice (JPMS)

**[JDK 9+ Moduly]** dovolují ještě výrazněji oddělit vrstvy a schovat interní balíčky.

Příklad rozdělení do 3 modulů:

```
cz.firma.app.domain        (exportuje pouze domain)
cz.firma.app.application   (vyžaduje domain; exportuje application)
cz.firma.app.cli           (vyžaduje application; spustitelný modul)
```

**`cz.firma.app.domain/module-info.java`**

```java
module cz.firma.app.domain {
    exports cz.firma.app.domain; // ven jde jen doména
}
```

**`cz.firma.app.application/module-info.java`**

```java
module cz.firma.app.application {
    requires cz.firma.app.domain;     // [JDK 9+]
    exports cz.firma.app.application; // ven jde jen API aplikace
    // persistence je interní — neexportovat, nebo dát do zvláštního modulu
}
```

**`cz.firma.app.cli/module-info.java`**

```java
module cz.firma.app.cli {
    requires cz.firma.app.application; // [JDK 9+]
    requires cz.firma.app.domain;
}
```

**Přínos**: modul **neexportuje** interní balíčky → překladač/nástroje zabrání „prošlapům“ hranic (nižší coupling).

## Transakční hranice a práce s I/O

* **Aplikační vrstva** je místem pro „jednotku práce“ (begin/commit/rollback), pokud I/O potřebujete.
* V čisté konzolové ukázce jsme drželi jednoduchost; v praxi by se sem vložila transakční fasáda.

## Testování vrstev (rychlé a izolované)

* **Unit testy domény**: bez I/O, rychlé.
* **Unit testy application**: s **fake**/mock `UserRepository`.
* **Integrační test persistence**: na dočasném souboru/DB (H2 apod.).
* **End-to-end**: pár scénářů přes CLI vrstvičku.

> Použití `record` **[JDK 16+]** pomáhá s neměnností a srovnáváním v testech (auto `equals/hashCode/toString`).

## Evoluce API mezi vrstvami

* Přidání nové varianty výsledku? Rozšiřte **sealed hierarchii** **[JDK 17+]** a nechte kompilátor zkontrolovat `switch`.
* Menší rozšíření rozhraní? **`default` metody** v interface **[JDK 8+]**.
* Větší změna? Vytvořte **nové rozhraní** (v2) a udržujte adapter.

## Praktická pravidla

* **Jednosměrné závislosti**: vyšší → nižší. Nikdy opačně.
* **Úzká rozhraní** (Interface Segregation).
* **Kompozice před dědičností** (strategie, policy objekty).
* **Doména bez I/O** (nepouštět `java.sql.*` ani HTTP klienta do `domain/`).
* **Mapování na hranicích** (UI ↔ Application ↔ Domain).
* **Balíčkování by-feature** u větších projektů: `users/cli`, `users/application`, `users/domain`, `users/persistence`.

## Anti-patterny

* **Anemická doména**: veškerá logika v service, model jen „get/set“. Přesuňte pravidla do domény.
* **Vrstevní „short-circuit“**: UI volá repo napřímo. Obcházení vrstev zvyšuje coupling.
* **Příliš tlusté DTO**: UI tahá všechno, i co nepotřebuje; udržujte minimální kontrakty.

## Co z JDK 9+ se vyplatí v praxi

* **Moduly (JPMS)** **[JDK 9+]** – vynucení hranic, menší útokový povrch, lepší start.
* **`var`** **[JDK 10+]** – čitelnější lokální proměnné (nepřehánět).
* **Text blocks `"""`** **[JDK 15+]** – hezké multiline stringy (např. pro CLI help).
* **Pattern matching pro `instanceof`** **[JDK 16+]** – méně šablonového kódu v doméně.
* **`record`** **[JDK 16+]** – neměnná data (DTO, value objects).
* **Sealed classes/interfaces** **[JDK 17+]** – uzavřené hierarchie, totální `switch`.

## Shrnutí

Vícevrstvá architektura **odděluje starosti**: UI jen prezentuje, Application řídí use-cases, Domain drží pravidla, Persistence obstarává I/O.
Díky **rozhraním** a **směru závislostí dolů** získáte **nízkou vazbu**, snadné testy a předvídatelný vývoj.
Zapojením **JPMS [JDK 9+]**, **recordů [JDK 16+]** a **sealed typů [JDK 17+]** posunete čitelnost a odolnost hranic o úroveň výš.

