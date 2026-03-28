## Návrhové vzory (Design Patterns)

Opakovaně ověřené řešení typického návrhového problému v softwaru. Není to kód ke zkopírování, ale **šablona myšlení** – pojmenovaný způsob, jak strukturovat třídy, objekty a jejich spolupráci.

## Proč vzory používat

* **Sdílený slovník** („dej sem adapter“, „obalte to dekorátorem“) - rychlá komunikace v týmu.
* **Snížení vazeb** (loose coupling), lepší testovatelnost, rozšiřitelnost.
* **Zrychlení návrhu** – nevymýšlím kolo.

## Kdy je nepoužívat

* Když problém je triviální – vzor by byl „over-engineering“.
* Když jazyk/framework už řešení dává (např. `enum` místo Singletonu).
* Když by se složitost zvýšila víc než užitek.

## Kategorie a vzory

### Tvořivé (Creational)

Řeší **jak vytvářet objekty**, aby nevznikaly silné vazby na konkrétní třídy.

* **Factory Method** – deleguje vytvoření objektu do metody podtřídy.

  * *Kdy:* když typ výsledku závisí na kontextu.

* **Abstract Factory** – vytváří **rodiny souvisejících objektů**.

  * *Kdy:* konzistence „tematických“ komponent (např. Win/Mac).
* **Builder** – skládání složitého objektu krok za krokem.

  * *Kdy:* mnoho volitelných parametrů, neměnný (immutable) výsledek.

* **Prototype** – klonování existujících objektů (např. hluboká kopie).
* **Singleton** – jedna sdílená instance (opatrně, může být anti-pattern).
* **Object Pool** – recyklace krátkožijících drahých objektů (např. spojení).

### Strukturální (Structural)

Řeší **jak objekty skládat** do větších struktur.

* **Adapter** – převod jednoho rozhraní na druhé (kompatibilita).

  * *Kdy:* integrace cizí knihovny bez úprav zbytku kódu.
* **Bridge** – oddělení abstrakce od implementace pro nezávislý vývoj obou.
* **Composite** – stromová struktura, sjednocené rozhraní list/uzel.
* **Decorator** – přidávání chování **za běhu** obalením.

  * *Mini-ukázka:*

* **Facade** – zjednodušené jednotné API nad komplexním subsystémem.
* **Flyweight** – sdílení vnitřního stavu, úspora paměti (např. znaky).
* **Proxy** – zástupný objekt (lazy, vzdálený, ochranný, caching).

### Chování (Behavioral)

Řeší **spolupráci objektů**, toky událostí a odpovědností.

* **Strategy** – zaměnitelné algoritmy skrz společné rozhraní.

* **State** – objekt mění chování podle vnitřního stavu (bez `switch` pekla).
* **Template Method** – kostra algoritmu v nadtřídě, kroky v podtřídách.
* **Observer (Pub/Sub)** – notifikace o změnách více odběratelům.

* **Command** – příkaz jako objekt (queue, undo/redo, logování).
* **Iterator** – jednotný průchod kolekcí.
* **Mediator** – centralizace komunikace mnoha objektů (méně vazeb).
* **Memento** – snapshot stavu (undo).
* **Chain of Responsibility** – předávání požadavku řetězem handlerů.
* **Visitor** – přidání operací nad stabilní strukturou (AST, soubory).
* **Interpreter** – mini-jazyk, vyhodnocení výrazů.

### Architektonické

Větší „makro“ vzory – struktura celých aplikací.

* **Layered (vícevrstvá)** – UI | aplikační | doménová | data.
* **MVC / MVP / MVVM** – oddělení prezentace, logiky a stavu.
* **Hexagonal/Ports & Adapters** – doména uprostřed, rozhraní ven.
* **Microservices** – malé autonomní služby, síťová komunikace.
* **CQRS** – oddělit model čtení a zápisu (read model vs. write model).
* **Event Sourcing** – zdroj pravdy = log událostí, stav = projekce.

### Konkurentní a reaktivní

Řeší vlákna, asynchronii, zátěž a latenci.

* **Producer–Consumer** (fronty), **Thread Pool**, **Work Stealing**.
* **Future/Promise/CompletableFuture**, **Reactor/Observer (async)**.
* **Active Object** – asynchronní volání metod přes frontu zpráv.
* **Half-Sync/Half-Async**, **Leader–Followers**.

### Integrace a spolehlivost (EIP a cloud)

* **Message Channel, Pub/Sub, Routing Slip** – směrování zpráv.
* **Saga** – distribuované transakce s kompenzacemi.
* **Circuit Breaker** – odpoj „porouchanou“ závislost, fallback.
* **Retry/Backoff**, **Bulkhead** – izolace zdrojů, prevence kaskádových pádů.
* **Gateway/Aggregator** – sjednocení přístupů, skládání odpovědí.

### Datové a inicializační

* **Repository** – přístup k entitám jako kolekci (oddělení od DB).
* **Unit of Work** – sled změn a atomický commit.
* **Lazy Initialization**, **Virtual Proxy**, **Value Object**, **Null Object**.

### Anti-vzory (na co si dát pozor)

Populární špatné praktiky, kterým je lepší se vyhnout.

* **God Object** (všechno v jednom) - přetížená třída s příliš mnoha odpovědnostmi.

* **Spaghetti Code** - neuspořádaná a těžko udržovatelná struktura.
* **Golden Hammer** (všude stejný vzor) - nedostatek modularity.
* **Singletonitis** (přestřelené singletons) - nadměrné používání singletonů.
* **Lava Flow** (mrtvý kód) - neodstraněný nepotřebný kód.
* **Copy-Paste Inheritance** - nevhodné opakování kódu skrz dědičnost.

## Jak vybírat vzor (rychlá mapa)

* **Tvorba objektů "bolí"?** → *Factory/Abstract Factory/Builder/Prototype*
* **Chci přidat chování bez dědičnosti?** → *Decorator/Strategy/Command*
* **Potřebuju sjednotit rozhraní/skrýt komplexitu?** → *Adapter/Facade*
* **Měním chování podle stavu?** → *State*
* **Události a notifikace?** → *Observer / Pub/Sub*
* **Procházení struktur?** → *Iterator/Visitor/Composite*
* **Oddělení domény od infrastruktury?** → *Hexagonal*
* **Asynchronie a odolnost?** → *Future/Reactor/Circuit Breaker/Saga*

## Praktické tipy

* Začni **problémem**, ne vzorem. Ptej se: „co mi vadí?“ (těsná vazba, duplikace, změna požadavků, testování).
* Preferuj **kompozici** před dědičností (Decorator, Strategy, State).
* Zvaž **testovatelnost** – vzory často usnadní unit testy (inverze závislostí).
* Udržuj **jednoduchost** – nejmenší vzor, který stačí.
