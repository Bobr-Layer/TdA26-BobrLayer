# Vícevrstvé architektury v Javě (MVC, MVP, MVVM a další)

## Klasická 3-vrstvá (Presentation / Business / Data)

* **Co:** UI/CLI → Business (use-cases) → Data (repo/DB).
* **Kdy:** většina menších a středních aplikací; jasné hranice, snadné testy.
* **Java:** rozhraní `UserRepository` a služba `UserService`.
* **[JDK 9+]** moduly pomůžou skrýt `persistence` (neexportovat).

* **Java:** `record` pro DTO **[JDK 16+]**, sealed výsledky operací **[JDK 17+]**.

## 4-vrstvá (UI / Application / Domain / Infrastructure)

* **Co:** 3-vrstvou rozštípne „Business“ na **Application** (orchestrace use-cases) a **Domain** (pravidla, model).
* **Kdy:** když chcete čistou doménu bez I/O.
* **Java:** `record` pro Value Objects **[JDK 16+]**, sealed výsledky operací **[JDK 17+]**.

## Layered monolit

* **Co:** jedna spustitelná jednotka (JAR), uvnitř poctivé vrstvy.
* **Kdy:** ideální výchozí volba; jednoduché nasazení, čistý kód.
* **Java:** projekt rozdělený na moduly `cli`, `application`, `domain`, `persistence` (**[JDK 9+] JPMS**).

## N-tier (2-tier, 3-tier…)

* **Co:** vrstvy rozdělené i **provozně** (např. klient → aplikační server → DB).
* **Kdy:** když potřebujete škálovat části zvlášť, oddělenou bezpečnost.
* **Pozn.:** „Tier“ je o *nasazení*; vrstvy v kódu držte stejně.

## Hexagonální (Ports & Adapters)

* **Co:** jádro (domain+use-cases) komunikuje přes **porty**; konkrétní I/O jsou **adaptéry** (DB, soubor, CLI).
* **Kdy:** chcete snadno střídat DB, UI, integrační kanály.
* **Java:**

  ```java
  // port
  interface NotificationPort { void send(String to, String text); }
  // use-case závisí na portu
  final class RegisterUser {
    private final NotificationPort notifier;
    RegisterUser(NotificationPort n){ this.notifier = n; }
    void handle(String email){ /* ... */ notifier.send(email, "Welcome"); }
  }
  // adaptér (např. e-mail, log…)
  final class ConsoleNotifier implements NotificationPort {
    public void send(String to, String text){ System.out.println(to + ": " + text); }
  }
  ```

* **[JDK 9+]**: porty/exporty v samostatném modulu, adaptéry jako neexportované.

## Onion architecture

* **Co:** soustředné vrstvy – uprostřed **Domain**, kolem **Application**, až po **Infrastructure**. Závislosti *směrem dovnitř*.
* **Kdy:** chcete přísně vynutit, že doména nevidí vnější svět.
* **Java:** sealed doménové hierarchie **[JDK 17+]** + moduly **[JDK 9+]**.

## Clean Architecture (Uncle Bob)

* **Co:** podobné Hex/Onion; důraz na **use-cases** a **entity**. Frameworky jsou „details“.
* **Kdy:** střední a větší systémy, dlouhá životnost, více UI kanálů.
* **Java:** `record` pro DTO **[JDK 16+]**, `switch` nad sealed výsledky **[JDK 17+]**.

## Microkernel (Plug-in architektura)

* **Co:** malý „jádrový“ systém + rozšiřující **pluginy** (příkazy, konektory).
* **Kdy:** nástroje, platformy, kde často přidáváte funkce.
* **Java:**

  ```java
  interface Command { String name(); void exec(String[] args); }
  final class Shell { private final Map<String,Command> cmds = new HashMap<>();
    void register(Command c){ cmds.put(c.name(), c); } }
  ```

* **[JDK 9+]**: každý plugin jako modul (možné dynamické načítání přes `ServiceLoader`).

## Pipes & Filters (potrubí a filtry)

* **Co:** data procházejí řetězcem **filtrů**; každý transformuje/filtruje.
* **Kdy:** ETL, log processing, streaming.
* **Java:** funkční složení; immutable `record` **[JDK 16+]** pro zprávy.

## CQRS (+ Event Sourcing)

* **Co:** oddělíte **Command** (zápis) a **Query** (čtení) model/vrstvy; eventy jako zdroj pravdy.
* **Kdy:** složitá čtecí zatížení, audity, historie změn.
* **Java:** „port“ pro zápis eventů; „adaptér“ čte projekce. Sealed typy eventů **[JDK 17+]**.

## MVC / MVP / MVVM (prezentační vrstvení)

* **Co:** vzory pro **UI vrstvu** (jak oddělit vykreslení, stav a logiku).
* **Kdy:** desktop/GUI (Swing, JavaFX), ale i CLI lze zjednodušeně strukturovat.
* **Java:** Presenter/ViewModel izoluje UI; domain a application zůstávají stejné.

## Jak si vybrat (rychlé vodítko)

* **Začněte**: 3-/4-vrstvý **layered monolit** (UI→App→Domain→Infra).
* **Potřebuji snadno měnit I/O/UI** → **Hexagonální/Onion/Clean**.
* **Chci pluginy** → **Microkernel**.
* **Datové pipeline** → **Pipes & Filters**.
* **Mnoho čtení, audit historie** → **CQRS (+ES)**.
* **Více serverů/procesů** → zvažte **N-tier** nasazení (architekturu v kódu neměňte).

## Mini-checklist pro vrstvení v Javě

* Rozhraní na hranicích (repo, bus, notifier).
* Závislosti **jen dolů**; doména bez I/O.
* **[JDK 9+]**: oddělit moduly (`domain`, `application`, `infra`, `cli`).
* **[JDK 16+]**: `record` pro DTO/Value Objects.
* **[JDK 17+]**: sealed hierarchie výsledků a eventů (úplný `switch`).

## Třívrstvá architektura (MVC, MVP, MVVM a další)

| Vzor                                       | Myšlenka                                                                  | Kdy sáhnout                                                   |
| ------------------------------------------ | ------------------------------------------------------------------------- | ------------------------------------------------------------- |
| **MVC**                                    | Controller zpracuje vstup, mění Model; View se **pozoruje** na Model      | Jednodušší GUI, Swing, učební projekty                        |
| **MVP (Passive View / Supervising)**       | **Presenter** řídí View (přes rozhraní), View je „hloupá“                 | Testovatelnost UI logiky, Swing/JavaFX bez magického bindingu |
| **MVVM**                                   | **ViewModel** exponuje *bindovatelné* stavové vlastnosti; View se binduje | JavaFX (má binding API), bohaté stavové UI                    |
| **MVI / MVU (unidirectional)**             | Jeden zdroj pravdy (state), akce → redukce → nový state                   | Složitější stav, historie/undo, determinismus                 |
| **Presentation Model**                     | Abstraktní „UI-model“ bez widgetů, podobné VM                             | Čisté oddělení UI od domény; dobré i ve Swingu                |
| **PAC (Presentation–Abstraction–Control)** | Strom prezentačních agentů                                                | Větší, oddělitelné UI moduly                                  |

> **[JDK 9+ Moduly (JPMS)]** doporučuji pro vymezení hranic: `ui`, `presentation`, `domain`, `infra`.
> **[JDK 16+ record]** na DTO/value objekty. **[JDK 17+ sealed]** na uzavřené výsledky/události.

## Společné principy pro všechny

* **Jednosměrné závislosti:** `UI → (Presenter/Controller/ViewModel) → Domain/Services`.
* **Rozhraní pro UI vrstvu:** snadné testování presenteru/vm bez reálných widgetů.
* **Eventy a data-bindings:** View **pozoruje** stav, akce se propagují „dolů“.
* **Žádný SQL/HTTP v UI:** I/O skrze rozhraní (Repository/Port).
* **Modularita [JDK 9+]**: `exports` jen nutné balíčky, ostatní skryté.

## MVC (Model–View–Controller)

**Struktura:**

* `Model` = stav + notifikace změn,
* `View` = kreslení + posluchači,
* `Controller` = překládá vstup (klik, text) na operace nad Modelem.

### Minimal MVC: počítadlo (Swing)

```java
// domain/Counter.java  (Model)
package domain;
import java.beans.PropertyChangeListener;
import java.beans.PropertyChangeSupport;

public class Counter {
    private int value = 0;
    private final PropertyChangeSupport pcs = new PropertyChangeSupport(this);
    public int getValue(){ return value; }
    public void inc(){ setValue(value + 1); }
    public void dec(){ setValue(value - 1); }
    public void setValue(int v){
        int old = this.value; this.value = v;
        pcs.firePropertyChange("value", old, v);
    }
    public void onChange(PropertyChangeListener l){ pcs.addPropertyChangeListener(l); }
}
```

```java
// ui/CounterView.java  (View)
package ui;
import domain.Counter;
import javax.swing.*;
public class CounterView extends JPanel {
    public final JButton plus = new JButton("+");
    public final JButton minus = new JButton("-");
    public final JLabel label = new JLabel("0");
    public CounterView(Counter model){
        setLayout(new java.awt.FlowLayout());
        add(minus); add(label); add(plus);
        // View pozoruje Model
        model.onChange(evt -> label.setText(String.valueOf((int)evt.getNewValue())));
    }
}
```

```java
// presentation/CounterController.java  (Controller)
package presentation;
import domain.Counter;
import ui.CounterView;

public class CounterController {
    public CounterController(Counter model, CounterView view){
        view.plus.addActionListener(e -> model.inc());
        view.minus.addActionListener(e -> model.dec());
    }
}
```

```java
// app/Main.java (spuštění)
package app;
import domain.Counter;
import presentation.CounterController;
import ui.CounterView;
import javax.swing.*;

public class Main {
    public static void main(String[] args){
        Counter model = new Counter();
        CounterView view = new CounterView(model);
        new CounterController(model, view);
        SwingUtilities.invokeLater(() -> {
            JFrame f = new JFrame("MVC Counter");
            f.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
            f.setContentPane(view); f.pack(); f.setVisible(true);
        });
    }
}
```

**Poznámky**

* View **nevolá přímo doménu** – vstupy zpracuje Controller.
* Notifikace přes `PropertyChangeSupport` je jednoduché a nezávislé na frameworku.
* **[JDK 9+ JPMS]**: `ui` modul exportuje pouze balíček s View; `presentation` exportuje Controller; `domain` exportuje Model.

## MVP (Model–View–Presenter) – Swing ukázka

**Struktura:**

* **MVP** zvyšuje testovatelnost UI logiky:
* **Model** zůstává stejný jako v MVC.
* **View** je pasivní a neobsahuje žádnou logiku.
* **Presenter** komunikuje s View přes **rozhraní**. View je pasivní („Passive View“) – jen vykresluje a přeposílá události.

### MVP: formulář uživatele se službou

```java
// presentation/UserView.java  (View kontrakt)
package presentation;
public interface UserView {
    String getInputName();
    void setError(String msg);
    void setOk(String msg);
    void clear();
    void onSave(Runnable action); // presenter zaregistruje callback
}
```

```java
// ui/SwingUserView.java  (konkrétní View - Swing, ale klidně JavaFX)
package ui;
import presentation.UserView;
import javax.swing.*;
public class SwingUserView extends JPanel implements UserView {
    private final JTextField name = new JTextField(15);
    private final JButton save = new JButton("Uložit");
    private final JLabel status = new JLabel(" ");
    public SwingUserView(){
        setLayout(new java.awt.FlowLayout());
        add(new JLabel("Jméno:")); add(name); add(save); add(status);
    }
    public String getInputName(){ return name.getText(); }
    public void setError(String msg){ status.setText("❌ " + msg); }
    public void setOk(String msg){ status.setText("✅ " + msg); }
    public void clear(){ name.setText(""); }
    public void onSave(Runnable action){ save.addActionListener(e -> action.run()); }
}
```

```java
// domain/User.java  (record – [JDK 16+])
package domain;
public record User(long id, String name) { }
```

```java
// domain/UserRepository.java
package domain;
import java.util.Optional;
public interface UserRepository {
    User save(User u);
    Optional<User> findByName(String name);
}
```

```java
// infra/InMemoryUserRepository.java
package infra;
import domain.*;
import java.util.*;
public class InMemoryUserRepository implements UserRepository {
    private final Map<String,User> byName = new HashMap<>();
    private long seq=0;
    public User save(User u){
        User nu = (u.id()==0) ? new User(++seq, u.name()) : u;
        byName.put(nu.name(), nu); return nu;
    }
    public Optional<User> findByName(String n){ return Optional.ofNullable(byName.get(n)); }
}
```

```java
// presentation/UserPresenter.java
package presentation;
import domain.*;

public class UserPresenter {
    private final UserView view;
    private final UserRepository repo;

    public UserPresenter(UserView view, UserRepository repo){
        this.view = view; this.repo = repo;
        view.onSave(this::handleSave);
    }

    private void handleSave(){
        String name = view.getInputName();
        if (name == null || name.isBlank()){ view.setError("Jméno je povinné"); return; }
        if (repo.findByName(name).isPresent()){ view.setError("Uživatel již existuje"); return; }
        User saved = repo.save(new User(0, name.trim()));
        view.setOk("Uloženo: #" + saved.id());
        view.clear();
    }
}
```

```java
// app/MainMVP.java
package app;
import infra.InMemoryUserRepository;
import presentation.UserPresenter;
import ui.SwingUserView;
import javax.swing.*;

public class MainMVP {
    public static void main(String[] args){
        SwingUserView view = new SwingUserView();
        new UserPresenter(view, new InMemoryUserRepository());
        SwingUtilities.invokeLater(() -> {
            JFrame f = new JFrame("MVP User");
            f.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
            f.setContentPane(view); f.pack(); f.setVisible(true);
        });
    }
}
```

**Výhody MVP**

* Oddělení zodpovědností: UI logika (Presenter) je oddělena od vykreslování (View).
* Presenter je **snadno testovatelný** (nahradíte `UserView` testovací implementací).
* View **je hloupé** – žádná logika kromě vykreslení a vyčtení vstupů.

## MVVM (Model–View–ViewModel) – JavaFX ukázka

**MVVM** sází na **datové vazby (binding)**: View se binduje na vlastnosti ViewModelu; ViewModel transformuje doménu na prezentační stav.

**Struktura:**

* **Model** zůstává stejný jako v MVC/MVP.
* **View** je pasivní a neobsahuje žádnou logiku.
* **ViewModel** je zodpovědný za veškerou logiku a stav aplikace.

> JavaFX má výborné `Property` API (binding, validace), takže MVVM se dělá přirozeně.

### MVVM: formulář uživatele (JavaFX)

```java
// presentation/UserViewModel.java
package presentation;
import javafx.beans.property.*;

public class UserViewModel {
    // bindovatelné vlastnosti
    public final StringProperty name = new SimpleStringProperty("");
    public final BooleanProperty canSave = new SimpleBooleanProperty(false);
    public final StringProperty status = new SimpleStringProperty("");

    public UserViewModel(){
        // canSave je true, když name není prázdné
        canSave.bind(name.isNotEmpty());
    }
}
```

```java
// application/UserAppService.java (use-case rozhraní)
package application;
public interface UserAppService {
    boolean createUser(String name); // true = ok, false = duplicitní jméno
}
```

```java
// application/UserAppServiceImpl.java
package application;
import domain.*;
public class UserAppServiceImpl implements UserAppService {
    private final UserRepository repo;
    public UserAppServiceImpl(UserRepository repo){ this.repo = repo; }
    public boolean createUser(String name){
        if (name == null || name.isBlank()) return false;
        if (repo.findByName(name).isPresent()) return false;
        repo.save(new User(0, name.trim()));
        return true;
    }
}
```

```java
// ui/UserView.java (JavaFX View)
package ui;
import application.UserAppService;
import javafx.geometry.Insets;
import javafx.scene.control.*;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;
import presentation.UserViewModel;

public class UserView extends VBox {
    public UserView(UserViewModel vm, UserAppService app){
        setSpacing(8); setPadding(new Insets(10));

        TextField name = new TextField();
        name.setPromptText("Jméno");
        Button save = new Button("Uložit");
        Label status = new Label();

        // BINDINGS (MVVM kouzlo)
        name.textProperty().bindBidirectional(vm.name);
        save.disableProperty().bind(vm.canSave.not());
        status.textProperty().bind(vm.status);

        save.setOnAction(e -> {
            boolean ok = app.createUser(vm.name.get());
            vm.status.set(ok ? "✅ Uloženo" : "❌ Nelze uložit");
            if (ok) vm.name.set("");
        });

        getChildren().addAll(new HBox(6, new Label("Jméno:"), name), save, status);
    }
}
```

```java
// app/MainMVVM.java (JavaFX start)
package app;
import application.*;
import domain.*;
import infra.InMemoryUserRepository;
import javafx.application.Application;
import javafx.scene.Scene;
import javafx.stage.Stage;
import presentation.UserViewModel;
import ui.UserView;

public class MainMVVM extends Application {
    @Override public void start(Stage stage){
        var vm = new UserViewModel();
        var appSvc = new UserAppServiceImpl(new InMemoryUserRepository());
        var view = new UserView(vm, appSvc);
        stage.setScene(new Scene(view)); stage.setTitle("MVVM User"); stage.show();
    }
    public static void main(String[] args){ launch(); }
}
```

**Výhody MVVM**

* Minimum UI kódu – hodně práce udělají **bindingy**.
* Snadná validace (např. `canSave`), deklarativní stav UI.
* ViewModel je testovatelný bez JavaFX scény.

> **Tip:** U JavaFX lze používat i **text blocks `"""` [JDK 15+]** pro šablony/skin, a **records [JDK 16+]** pro DTO.

## MVI / MVU (unidirectional) – funkční směr

**MVI/MVU** (Model–View–Intent / Unidirectional) je moderní vzor z webu (Redux, Elm), který klade důraz na **jednosměrný tok dat** a **čisté funkce**.

**Struktura:**

* **Model** je neměnný a reprezentuje aktuální stav aplikace.
* **View** je funkce, která renderuje UI ze stavu.
* **Intent/Akce** reprezentují uživatelské vstupy (klik, text).
* **Reducer** je čistá funkce, která vezme aktuální stav a akci a vrátí nový stav.
* **Unidirectional**: View generuje Intenty → Reducer zpracuje Intenty + aktuální stav → nový stav → View se znovu renderuje.

**Myšlenka:** Jediný neměnný `State`, na vstupu **Intent/Akce**, čistá **redukce** → nový `State`. View se renderuje ze `State`.

### MVU kostra (konzolové jádro + GUI adaptér)

```java
// state/AppState.java  (record – [JDK 16+])
package state;
public record AppState(int counter, boolean locked) { }
```

```java
// state/Intent.java  (sealed – [JDK 17+])
package state;
public sealed interface Intent permits Inc, Dec, ToggleLock { }
public record Inc() implements Intent { }
public record Dec() implements Intent { }
public record ToggleLock() implements Intent { }
```

```java
// state/Reducer.java
package state;
public final class Reducer {
    public static AppState reduce(AppState s, Intent i){
        return switch (i) { // [JDK 17+] switch nad sealed
            case Inc __ -> s.locked() ? s : new AppState(s.counter()+1, s.locked());
            case Dec __ -> s.locked() ? s : new AppState(s.counter()-1, s.locked());
            case ToggleLock __ -> new AppState(s.counter(), !s.locked());
        };
    }
}
```

Toto „čisté jádro“ můžete ovládat ze Swing/JavaFX: UI jen posílá `Intent`, renderuje `AppState`. Výhoda: snadné logování, time-travel, undo/redo.

## Deriváty a související vzory (stručně + tipy)

* **Presentation Model** (Fowler): jako MVVM bez závislosti na konkrétním bindovacím frameworku. V Javě prostě třída s vlastnostmi + `PropertyChangeSupport`.
* **Supervising Controller** (varianta MVP): část jednoduchého bindingu necháte ve View, složitější logiku v Presenter/Controlleru.
* **PAC**: skládání UI ze samostatných „agentů“ (miniaplikací). Hodí se pro velká modulární GUI.
* **CQRS na prezentační vrstvě**: oddělte zápisové akce (commands) od čtení (queries) i v rámci VM/Presenteru.

## Testování (pattern-by-pattern)

* **MVC**: testujte Model izolovaně; Controller přes simulaci akcí; View minimálně (snapshoty/robot).
* **MVP**: Presenter → *mockované* `UserView` a `UserRepository` (čistý unit test).
* **MVVM**: ViewModel je čistý (testuje se přímo), View testovat integračně (JavaFX Thread).
* **MVI/MVU**: Reducer je čistá funkce → tabulkové testy (input state + intent → expected state).

> **[JDK 9+ JPMS]**: vytvořte testy, které závisí pouze na modulech `presentation` a `domain`. `ui` může mít jen integrační testy.

## Jak si vybrat (praktická vodítka)

* **Swing bez bindingu** → **MVP (Passive View)**.
* **JavaFX** (bindingy, properties) → **MVVM**.
* **Učební/menší projekt** → **MVC** (přímočaře pochopitelné).
* **Složitý stav, potřeba determinismu** → **MVI/MVU** (čistý reducer).
* **Dlouhodobý projekt** → držte **4 vrstvy** (UI / Presentation / Domain / Infra) + **JPMS [JDK 9+]**.

## Co z JDK 9+ využít napříč

* **Moduly (JPMS) [JDK 9+]** – vynucení hranic (`exports`, `requires`).
* **`var` [JDK 10+]** – čitelnější lokální proměnné ve View/Presenteru (s rozumem).
* **Text Blocks `"""` [JDK 15+]** – např. help, šablony UI textů.
* **`record` [JDK 16+]** – DTO, immutable state (MVU).
* **Pattern matching/`switch` na sealed [JDK 16+/17+]** – čisté větvení podle výsledků/intentů.

## Shrnutí

* **MVC**: jednoduché a názorné; Controller řídí vstup, View pozoruje Model.
* **MVP**: View je „hloupé“, Presenter vše řídí přes rozhraní → **největší testovatelnost** ve Swingu.
* **MVVM**: s JavaFX **nejpohodlnější** díky bindingům; ViewModel drží stav a pravidla zobrazení.
* **MVI/MVU**: čistý, jednosměrný tok dat, skvělé pro komplexní stav a debug.
* **Vrstvy**: vždy oddělte UI, prezentační logiku, doménu a I/O (repo, DB).
* **[JDK 9+]** moduly pro vymezení hranic, **[JDK 16+]** `record` pro DTO, **[JDK 17+]** sealed pro výsledky a eventy.
