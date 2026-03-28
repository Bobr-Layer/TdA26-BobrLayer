# Monolit vs. více vrstev (layered) v aplikacích

* **Monolit**: jedna aplikace (jeden proces/artefakt), všechny části (UI/CLI, business logika, přístup k datům) běží společně.
* **Více vrstev (layered)**: struktura kódu na vrstvy (např. CLI → Service → Repository). Pořád to může být *monolitický deployment*, ale kód má *disciplinované rozhraní mezi vrstvami*.


## Hlavní rozdíly (stručně)

| Oblast         | Monolit (bez striktních vrstev)             | Více vrstev (layered)                          |
| -------------- | ------------------------------------------- | ---------------------------------------------- |
| Struktura kódu | Volnější, rychlejší start, méně boilerplate | Jasná API mezi vrstvami, lepší udržovatelnost  |
| Coupling       | Vyšší riziko provázanosti                   | Nižší (závislosti směrem dolů)                 |
| Testování      | Jednoduché end-to-end, hůř izolované        | Snadné unit testy vrstev                       |
| Změny          | Rychlé na začátku, časem křehké             | Predikovatelné, „kam kód patří“ je jasné       |
| Výkon          | Minimum mezivrstev → nízká režie            | Tenká režie za čistotu (většinou zanedbatelná) |
| Týmová práce   | Hůř rozdělujitelné, riziko kolizí           | Tým si může „adoptovat“ vrstvu/feature         |
| Refaktor       | Těžší po čase                               | Snazší díky hranicím vrstev                    |

## Výhody a nevýhody

### Monolit (volnější)

**Výhody**

* Rychlý vývoj MVP, méně souborů a rozhraní.
* Snadné lokální spuštění a debugging.
* Nižší kognitivní zátěž na začátku.

**Nevýhody**

* Tendence k „god classes“ a cyklickým závislostem.
* Obtížnější izolované testy a refaktor po narůstání kódu.
* Změny mohou nechtěně ovlivnit vzdálená místa.

### Více vrstev (layered)

**Výhody**

* Čitelná architektura: **CLI/UI → Service → Repository**.
* Lepší testovatelnost (mock repository, service apod.).
* Snazší náhrada implementací (např. jiná storage, cache).
* Přirozené místo pro validace, mapování, transakční hranice (pokud by byly).

**Nevýhody**

* Víc „lepidla“ (interface, DTO, mapování).
* Potřeba disciplíny (neporušovat směr závislostí).
* Over-engineering u malých projektů.

### Kdy co zvolit

* **Monolit (volnější)**: malý školní projekt, utilita, krátkodobé MVP, proof-of-concept.
* **Layered monolit**: většina firemních/aplikačních projektů s očekávaným růstem kódu a týmu.

### Příklad: „rychlý“ monolit (bez striktního vrstvení)

Jednoduchá **konzolová** aplikace, kde je **CLI, business i data** v jedné třídě. Rychlé, ale hůř škáluje.

```java
import java.util.*;

public class AppQuickMonolith {
    // „Databáze“ přímo tady
    private final Map<Long, User> db = new HashMap<>();
    private long seq = 0;

    public static void main(String[] args) {
        new AppQuickMonolith().run();
    }

    void run() {
        Scanner sc = new Scanner(System.in);
        System.out.println("Příkazy: add <jméno> | get <id> | list | lock <id> | exit");
        while (true) {
            System.out.print("> ");
            String cmd = sc.next();
            if (cmd.equals("add")) {
                String name = sc.nextLine().trim();
                if (name.isBlank()) { System.out.println("Jméno je povinné"); continue; }
                User u = new User(++seq, name, true);
                db.put(u.id(), u);
                System.out.println("Vytvořen: " + u);
            } else if (cmd.equals("get")) {
                long id = sc.nextLong();
                User u = db.get(id);
                if (u == null) { System.out.println("Nenalezeno"); }
                else if (!u.active()) { System.out.println("Zamčeno (423)"); }
                else System.out.println("User: " + u.id() + " " + u.name());
            } else if (cmd.equals("list")) {
                db.values().forEach(System.out::println);
            } else if (cmd.equals("lock")) {
                long id = sc.nextLong();
                User u = db.get(id);
                if (u == null) System.out.println("Nenalezeno");
                else { db.put(id, new User(u.id(), u.name(), false)); System.out.println("Zamčeno"); }
            } else if (cmd.equals("exit")) {
                break;
            } else {
                System.out.println("Neznámý příkaz");
            }
        }
    }

    record User(long id, String name, boolean active) {
        @Override public String toString(){ return "User{id=%d, name='%s', active=%s}".formatted(id, name, active); }
    }
}
```

**Pozn.:** Na pár řádcích je vše — super pro demo, ale *UI/CLI ví o „DB“*, míchá validace, business i perzistenci.

### Příklad: stejná věc ve **vrstveném monolitu**

Rozdělíme kód do vrstev a zavedeme rozhraní. Deployment je pořád **jeden JAR**, ale kód je čistší.

```
cz.firma.app
├─ cli/         (UI/CLI)
├─ service/     (Business logika)
├─ domain/      (Doménové typy)
└─ persistence/ (Repository)
```

**Doména a perzistence:**

```java
// domain/User.java
package cz.firma.app.domain;

public record User(long id, String name, boolean active) {}

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

public class InMemoryUserRepository implements UserRepository {
    private final Map<Long, User> db = new HashMap<>();
    private long seq = 0;

    @Override public Optional<User> findById(long id) { return Optional.ofNullable(db.get(id)); }
    @Override public List<User> findAll() { return new ArrayList<>(db.values()); }

    @Override public User save(User u) {
        if (u.id() == 0) { // create
            long id = ++seq;
            User nu = new User(id, u.name(), u.active());
            db.put(id, nu);
            return nu;
        } else {           // update
            db.put(u.id(), u);
            return u;
        }
    }
}
```

**Business vrstva:**

```java
// service/UserService.java
package cz.firma.app.service;

import cz.firma.app.domain.User;
import java.util.List;

public interface UserService {
    User getUser(long id);            // vyhodí výjimku, když není
    User createUser(String name);
    List<User> listUsers();
    User lockUser(long id);           // doménové pravidlo: „zamkni uživatele“
}
```

```java
// service/UserServiceImpl.java
package cz.firma.app.service;

import cz.firma.app.domain.User;
import cz.firma.app.persistence.UserRepository;
import java.util.List;
import java.util.NoSuchElementException;

public class UserServiceImpl implements UserService {
    private final UserRepository repo;
    public UserServiceImpl(UserRepository repo) { this.repo = repo; }

    @Override public User getUser(long id) {
        User u = repo.findById(id).orElseThrow(() -> new NoSuchElementException("User not found"));
        if (!u.active()) throw new IllegalStateException("Locked");
        return u;
    }

    @Override public User createUser(String name) {
        if (name == null || name.isBlank()) throw new IllegalArgumentException("Name required");
        return repo.save(new User(0, name.trim(), true));
    }

    @Override public List<User> listUsers() { return repo.findAll(); }

    @Override public User lockUser(long id) {
        User u = repo.findById(id).orElseThrow(() -> new NoSuchElementException("User not found"));
        return repo.save(new User(u.id(), u.name(), false));
    }
}
```

**CLI vrstva:**

```java
// cli/Main.java
package cz.firma.app.cli;

import cz.firma.app.persistence.InMemoryUserRepository;
import cz.firma.app.service.UserService;
import cz.firma.app.service.UserServiceImpl;
import cz.firma.app.domain.User;

import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        UserService service = new UserServiceImpl(new InMemoryUserRepository());
        Scanner sc = new Scanner(System.in);
        System.out.println("Příkazy: add <jméno> | get <id> | list | lock <id> | exit");
        while (true) {
            System.out.print("> ");
            String cmd = sc.next();
            try {
                switch (cmd) {
                    case "add" -> {
                        String name = sc.nextLine().trim();
                        User u = service.createUser(name);
                        System.out.println("Vytvořen: " + u);
                    }
                    case "get" -> {
                        long id = sc.nextLong();
                        System.out.println(service.getUser(id));
                    }
                    case "list" -> service.listUsers().forEach(System.out::println);
                    case "lock" -> {
                        long id = sc.nextLong();
                        System.out.println("Zamčeno: " + service.lockUser(id));
                    }
                    case "exit" -> { return; }
                    default -> System.out.println("Neznámý příkaz");
                }
            } catch (IllegalArgumentException e) {
                System.out.println("Chybný vstup: " + e.getMessage());
            } catch (IllegalStateException e) {
                System.out.println("Stav: " + e.getMessage());
            } catch (Exception e) {
                System.out.println("Chyba: " + e.getMessage());
            }
        }
    }
}
```

**Co to přineslo:**

* CLI nezná detaily perzistence — volá jen `UserService`.
* Doménová pravidla (validace, „locked“) jsou soustředěna v **service**.
* Repository je zaměnitelné (in-memory vs. soubor/DB) bez zásahu do CLI a service.
* Snadné unit testy `UserService` s „fake“/mock repository.

## Tipy z praxe (stručně)

* **Směr závislostí**: CLI/UI → Service → Repository → (úložiště). Doména by neměla záviset na UI.
* **Validace**: vstupní v UI (syntaktická), doménová v service (pravidla).
* **DTO vs. doména**: v CLI často stačí doména; pro větší projekty zvažte DTO mapery.
* **Balíčkování**: by-layer (cli/service/…) nebo by-feature (users/orders/…), podle velikosti týmu a kódu.
* **Testy**: unit testy service (mock repo), integrační testy persistence (např. proti dočasnému souboru), pár end-to-end.

## Shrnutí

* **Monolit bez vrstev**: nejrychlejší start, ale technický dluh roste.
* **Více vrstev**: malý overhead navíc, zato **čitelný a testovatelný** kód, lepší pro střední a větší projekty.
* Pro běžné aplikace v Javě je nejlepší kompromis **vrstvený monolit**: jeden artefakt, jasné vrstvy, čisté hranice.
