# Grafická uživatelská rozhraní (GUI)

**Grafická uživatelská rozhraní** (GUI) jsou určena pro interakci uživatele s aplikací pomocí oken, tlačítek, formulářů a dalších vizuálních prvků.
V Javě jsou nejpoužívanější dvě hlavní GUI knihovny: **Swing** a **JavaFX**.

**Swing (javax.swing)**

* **Co je**: Historicky „klasické“ GUI API přímo v JDK.
* **K čemu je**: Tvorba desktopových aplikací; široká sada komponent (tlačítka, vstupy, tabulky, stromy).
* **Klíčové objekty**:

  * `JFrame` (hlavní okno), `JDialog` (dialogové okno), `JPanel` (kontejner), komponenty `JButton`, `JLabel`, `JTextField`, …
  * **Layout managery** (např. `BorderLayout`, `GridBagLayout`) řídí rozložení prvků uvnitř kontejnerů.
* **Stylování**: Look & Feel (`UIManager`), např. Nimbus, FlatLaf (3rd party).

**JavaFX (org.openjfx)**

* **Co je**: Moderní „scene graph“ GUI framework.
* **K čemu je**: Snadná práce s **vlastnostmi (Property)** a **vazbami (Binding)**, **CSS** stylování, **FXML** (deklarativní popis UI).
* **Klíčové objekty**:

  * `Stage` (okno), `Scene` (scéna), **uzly** (`Node`) jako `Button`, `Label`; **layout panely** `VBox`, `HBox`, `BorderPane`, `GridPane`.
* **Distribuce**: Od JDK 11 **není součástí JDK**; používá se **OpenJFX** (moduly `javafx.*`). **[JDK 11+]**

## „Hello Window“ – nejmenší příklady

### Swing – první okno

```java
import javax.swing.*;
import java.awt.*;

public class HelloSwing {
    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> { // spustit na EDT
            JFrame f = new JFrame("Ahoj, Swing"); // titulek okna (String title)
            f.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE); // chování při zavření
            f.add(new JLabel("Dobrý den!"), BorderLayout.CENTER); // přidání komponenty + pozice v BorderLayout
            f.setSize(300, 150);              // šířka, výška v pixelech
            f.setLocationRelativeTo(null);    // vystředění vůči obrazovce
            f.setVisible(true);               // zviditelnění okna
        });
    }
}
```

**Parametry / objekty, k čemu jsou**

* `SwingUtilities.invokeLater(Runnable)`: zajistí, že kód uvnitř běží na **EDT** (Event Dispatch Thread), kde musí probíhat všechny Swing operace s UI.
* `JFrame(String title)`: hlavní okno s titulkem.
* `setDefaultCloseOperation(int op)`: např. `EXIT_ON_CLOSE`, `DISPOSE_ON_CLOSE`.
* `add(Component comp, Object constraints)`: přidá komponentu do daného layoutu (zde `BorderLayout.CENTER`).
* `setSize(int w, int h)`: velikost okna.
* `setLocationRelativeTo(Component c)`: zarovnání; `null` = vystředit na obrazovce.

### JavaFX – první okno

```java
import javafx.application.Application;
import javafx.scene.Scene;
import javafx.scene.control.Label;
import javafx.scene.layout.StackPane;
import javafx.stage.Stage;

public class HelloFX extends Application {
    @Override
    public void start(Stage stage) { // Stage = okno
        Label label = new Label("Dobrý den!");
        StackPane root = new StackPane(label); // kořenový layout (střed)
        Scene scene = new Scene(root, 300, 150); // šířka, výška
        stage.setTitle("Ahoj, JavaFX"); // titulek okna
        stage.setScene(scene);          // přiřazení scény oknu
        stage.show();                   // zobrazení
    }
    public static void main(String[] args) { launch(args); } // start JavaFX runtime
}
```

**Parametry / objekty, k čemu jsou**

* `Application.start(Stage)`: vstupní bod JavaFX aplikace, dostanete hlavní okno (`Stage`).
* `Scene(Parent root, double width, double height)`: scéna s kořenem (layout/uzel) a počáteční velikostí.
* `StackPane(Node... children)`: jednoduchý layout, který vrství uzly na sebe a středí je.

> Spuštění s moduly (Maven/Gradle) obvykle vyžaduje `--module-path ... --add-modules javafx.controls` **[JDK 11+]**.

## Komponenty a kontejnery

### Swing – základní komponenty a jejich klíčové vlastnosti

* **Zobrazení**:

  * `JLabel(String text, Icon icon, int horizontalAlignment)` – popisek; `setText(String)`, `setIcon(Icon)`.
* **Vstup**:

  * `JTextField(int columns)` – jednorádkový vstup; `getText()/setText()`, `setColumns(int)`.
  * `JPasswordField(int columns)` – hesla.
  * `JTextArea(int rows, int columns)` – vícerádkový vstup; `setLineWrap(true)`, `setWrapStyleWord(true)`.
  * `JCheckBox(String text, boolean selected)`, `JRadioButton(String text, boolean selected)` - zaškrtávací políčko, přepínač.
    * `ButtonGroup` - pro vzájemnou výlučnost.  
  * `JComboBox<E>(E[] items)` – rozbalovací seznam; `getSelectedItem()/setSelectedItem()`.
* **Akce**:

  * `JButton(String text)` – tlačítko; `addActionListener(ActionListener)`.
* **Kontejnery**:

  * `JPanel(LayoutManager layout)` – panel; často jako „řádek“ nebo sekce.
  * `JScrollPane(Component view)` – posuvník pro velký obsah.
  * `JSplitPane(int orientation, Component left, Component right)` – rozdělí prostor.
  * `JTabbedPane()` – záložky; `addTab(String title, Component comp)`.

**Miniukázka – formulářový řádek (FlowLayout):**

```java
JPanel row = new JPanel(new FlowLayout(FlowLayout.LEFT, 8, 4)); // zarovnání, mezery
row.add(new JLabel("Jméno:"));
JTextField tf = new JTextField(20);
row.add(tf);
```

**HiDPI [JDK 9+]**

* `java.awt.image.MultiResolutionImage`: umožňuje poskytnout více variant jedné ikony (1x, 2x) – AWT si vybere dle DPI.

### Layout managery (Swing) – „parametry“ rozvržení

* `BorderLayout(int hgap, int vgap)`: oblasti `NORTH`, `SOUTH`, `EAST`, `WEST`, `CENTER` - základní a často používaný, rozdělí prostor na 5 částí.

**Miniukázka – BorderLayout:**

```java
JFrame f = new JFrame();
f.setLayout(new BorderLayout(5,5)); // mezery mezi oblastmi 
f.add(new JButton("Nahoře"), BorderLayout.NORTH);
f.add(new JButton("Dole"), BorderLayout.SOUTH);
f.add(new JButton("Vlevo"), BorderLayout.WEST);
f.add(new JButton("Vpravo"), BorderLayout.EAST);
f.add(new JButton("Střed"), BorderLayout.CENTER);
```

* `FlowLayout(int align, int hgap, int vgap)`: proudění zleva doprava; `align` může být `FlowLayout.LEFT` ap - jednoduché řazení prvků za sebe.

**Miniukázka – FlowLayout:**

```java
JPanel p = new JPanel(new FlowLayout(FlowLayout.CENTER, 10, 5)); // zarovnání, mezery
p.add(new JButton("Ano"));
p.add(new JButton("Ne"));
p.add(new JButton("Možná"));
```

* `BoxLayout(Container target, int axis)`: `BoxLayout.X_AXIS` / `Y_AXIS` - vertikální/horizontální řazení.

**Miniukázka – BoxLayout:**

```java
JPanel p = new JPanel();
p.setLayout(new BoxLayout(p, BoxLayout.Y_AXIS)); // vertikální
p.add(new JButton("První"));
p.add(Box.createVerticalStrut(8)); // mezera
p.add(new JButton("Druhý"));
p.add(Box.createVerticalStrut(8)); // mezera
p.add(new JButton("Třetí"));
```

* `GridLayout(int rows, int cols, int hgap, int vgap)` - mřížka se stejnými buňkami.

**Miniukázka – GridLayout:**

```java
JPanel p = new JPanel(new GridLayout(2, 3, 4, 4)); // 2 řady, 3 sloupce, mezery
for (int i = 1; i <= 6; i++) {
    p.add(new JButton("Tlačítko " + i));
}
```

* `GridBagLayout` + `GridBagConstraints`: **nejflexibilnější** mřížka (váhy, roztažení, zarovnání) – složitější na nastavení.

**Miniukázka – GridBagLayout:**

```java
JPanel p = new JPanel(new GridBagLayout());
GridBagConstraints c = new GridBagConstraints();
c.insets = new Insets(4,4,4,4); // vnitřní okraje kolem buněk

c.gridx = 0; c.gridy = 0; c.anchor = GridBagConstraints.LINE_END;
p.add(new JLabel("Email:"), c);

c.gridx = 1; c.gridy = 0; c.fill = GridBagConstraints.HORIZONTAL; c.weightx = 1.0;
p.add(new JTextField(20), c);
```

### JavaFX – uzly a panely

* **Kontrolky**:
  * `Label` - textová značka,
  * `Button` - tlačítko,
  * `TextField` - textové pole,
  * `TextArea` - textová oblast,
  * `CheckBox` - zaškrtávací políčko,
  * `RadioButton` - rádiové tlačítko,
  * `ComboBox<T>` - rozbalovací seznam,
  * `Slider` - posuvník,
  * `TableView<T>` - tabulka,
  * `TreeView<T>` - stromový pohled,
  * `ListView<T>` - seznamový pohled…

  * Většina má **property API**: `textProperty()`, `disableProperty()`, …
* **Layouty**:

  * `HBox(double spacing)`, `VBox(double spacing)` – horizontální/vertikální řazení, `setSpacing(double)`, `setPadding(Insets)`.
  * `BorderPane` – regiony `top`, `left`, `center`, `right`, `bottom`.
  * `GridPane` – mřížka; `add(Node child, int colIndex, int rowIndex, int colspan, int rowspan)`, `setHgap/Vgap`, `setAlignment`.
  * `StackPane` – vrstvení, centrování.
  * `AnchorPane` – „ukotvení“ vzdáleností od okrajů.

**Miniukázka – GridPane se štítky a vstupy:**

```java
GridPane g = new GridPane();
g.setHgap(8); g.setVgap(6);
g.setPadding(new Insets(10));

g.add(new Label("Email:"), 0, 0);
TextField email = new TextField();
g.add(email, 1, 0);

g.add(new Label("Heslo:"), 0, 1);
PasswordField pass = new PasswordField();
g.add(pass, 1, 1);
```

**Stylování (CSS)**

* `Scene.getStylesheets().add("/styles/main.css");`
* Na uzlech: `getStyleClass().add("error")`, `setId("mainPane")`.

**FXML**

* `FXMLLoader.load(URL fxml)` načte deklarativní definici UI a vytvoří objektový strom.

## Události a akce
>
> **Událost**: Reakce na uživatelský vstup (klik, stisk klávesy, změna hodnoty…).

### Swing – posluchače (listeners) a EDT

* **ActionListener**: `void actionPerformed(ActionEvent e)` — kliknutí na tlačítko, Enter v poli atd.
* **KeyListener**: `keyPressed/Released/Typed(KeyEvent e)` — klávesnice.
* **MouseListener/MouseMotionListener**: kliky, pohyb myši.
* **ChangeListener**: změny hodnot (např. `JSlider`, modely).

**Miniukázka – tlačítko s akcí:**

```java
JButton btn = new JButton("Klikni");
btn.addActionListener(e -> System.out.println("Klik! " + e.getActionCommand()));
```

**EDT zásady**

* Všechny změny UI provádějte na EDT. Pro dlouhé operace použijte `SwingWorker` (viz níže).

### JavaFX – event handlers, properties a binding

* Handlery: `setOnAction(EventHandler<ActionEvent>)`, `setOnMouseClicked(...)` ap.
* **Properties**: například `IntegerProperty`, `StringProperty` – umožní **binding**.

**Miniukázka – binding počitadla:**

```java
Button b = new Button();
IntegerProperty count = new SimpleIntegerProperty(0);
b.textProperty().bind(count.asString("Počet: %d"));
b.setOnAction(e -> count.set(count.get() + 1));
```

* **Pozn.**: UI upravujte na **JavaFX Application Thread** (obdoba EDT).

## Práce na pozadí (konkurence)

### Swing – `SwingWorker<T,V>`

* **K čemu**: Dlouhá operace na pozadí (`doInBackground()`), průběžné výsledky (`publish()` → `process(List<V>)`), dokončení (`done()`), vše bezpečně propojeno s EDT.
* **Typové parametry**: `T` návratový typ `doInBackground`, `V` typ mezivýsledků.

**Miniukázka:**

```java
SwingWorker<Integer, String> worker = new SwingWorker<>() {
    @Override protected Integer doInBackground() throws Exception {
        for (int i = 1; i <= 3; i++) {
            Thread.sleep(500);
            publish("Krok " + i);
        }
        return 42;
    }
    @Override protected void process(java.util.List<String> chunks) {
        chunks.forEach(System.out::println); // běží na EDT
    }
    @Override protected void done() {
        try { System.out.println("Hotovo: " + get()); } catch (Exception ex) { ex.printStackTrace(); }
    }
};
worker.execute();
```

### JavaFX – `Task<V>` a `Service<V>`

* **Task**: spustitelná jednotka práce s vlastnostmi: `messageProperty()`, `progressProperty()` atd.
* **Service**: opakované spouštění úloh s jednotnou konfigurací.

**Miniukázka – Task s progress bindingem:**

```java
Task<Integer> task = new Task<>() {
    @Override protected Integer call() throws Exception {
        int sum = 0;
        for (int i = 1; i <= 100; i++) {
            Thread.sleep(20);
            sum += i;
            updateProgress(i, 100);
            updateMessage("i=" + i);
        }
        return sum;
    }
};
ProgressBar bar = new ProgressBar();
bar.progressProperty().bind(task.progressProperty());
new Thread(task).start(); // spustit mimo FX thread
```

## Deklarativní návrh UI (FXML) a Scene Builder (JavaFX)

* **FXML**: XML popis scény; **odděluje vzhled** od logiky.
* `FXMLLoader.load(URL)` načte FXML a vrátí kořenový `Parent`.
* **Controller**: třída s anotacemi `@FXML` pro napojení na prvky.

**Miniukázka – načtení FXML:**

```java
Parent root = FXMLLoader.load(getClass().getResource("/view/main.fxml")); // URL k FXML
Stage stage = new Stage();
stage.setScene(new Scene(root));
stage.show();
```

* **Scene Builder**: vizuální editor FXML (drag & drop).
* **Modulární běh OpenJFX**: nutné přidat moduly (`javafx.controls`, `javafx.fxml` …) **[JDK 11+]**.

## Stylování a vzhled

### Swing – Look & Feel (L&F)

* `UIManager.setLookAndFeel(String className)` nastaví globální L&F.
* **Nimbus** (součást JDK), moderní **FlatLaf** (3rd party).

**Miniukázka – nastavení Nimbus L&F:**

```java
for (UIManager.LookAndFeelInfo info : UIManager.getInstalledLookAndFeels()) {
    if ("Nimbus".equals(info.getName())) {
        UIManager.setLookAndFeel(info.getClassName());
        break;
    }
}
SwingUtilities.invokeLater(() -> { /* vytvořte a ukažte okno */ });
```

### JavaFX – CSS

* **Kde**: Připojte CSS ke scéně: `scene.getStylesheets().add("/styles/app.css");`
* **Na uzlech**: `node.getStyleClass().add("error");`, `node.setId("mainPane");`
* **Výhoda**: oddělení logiky od prezentace, snadná změna tématu.

## Struktura aplikace a architektura

* **MVC/MVP/MVVM**: oddělení **modelu** (data), **view** (UI), **controller/view-model** (logika, vazby).
* **JavaFX** nahrává MVVM díky `Property` a `Binding`.
* **Swing**: udržujte **model** (např. `TableModel`), **view** (komponenty) a **controller** (posluchače) separovaně.

**Poznámky k jazykovým prvkům (užitečné, ne GUI-specifické):**

* `var` pro lokální inference **[JDK 10+]**.
* `record` pro neměnné nosiče dat (DTO) **[JDK 16+]**.

## Balíčkování a distribuce

* **Spustitelný JAR**: manifest `Main-Class`, knihovny na classpath.
* **jlink** – sestaví **vlastní běhový obraz** Javy jen s potřebnými moduly (menší velikost, rychlejší start) **[JDK 9+]**.

  * Základní parametry:

    * `--module-path` (kde hledat moduly),
    * `--add-modules` (jaké moduly zahrnout),
    * `--output` (kam vytvořit runtime).
* **jpackage** – vytvoří **nativní instalátor** (msi/exe, pkg/dmg, deb/rpm) **[JDK 16+]**.

  * Základní parametry:

    * `--input` (adresář s JARy),
    * `--main-jar` (hlavní JAR),
    * `--name` (jméno aplikace),
    * `--type` (msi, dmg, deb…),
    * `--app-version`, `--icon`, `--win-menu` (Windows) apod.

**Miniukázka – jlink (koncept):**

```bash
jlink \
  --module-path %JAVA_HOME%/jmods;target/mods \
  --add-modules java.base,java.desktop \
  --output runtime
```

**Miniukázka – jpackage (koncept) [JDK 16+]:**

```bash
jpackage \
  --name MojeAplikace \
  --input target/dist \
  --main-jar moje-aplikace.jar \
  --type msi
```

> U JavaFX projektů: přidat OpenJFX moduly a použít `jlink/jpackage` pro „self-contained“ instalátor **[JDK 11+ / JDK 16+]**.

## Co z GUI vývoje je „novější než 8“ (shrnutí)

* **JavaFX jako samostatné moduly (OpenJFX), spouštění s `--module-path`** … **[JDK 11+]**
* **JPMS + `jlink` (modulární runtime)** … **[JDK 9+]**
* **`jpackage` – nativní instalátory** … **[JDK 16+]**
* **AWT `MultiResolutionImage` (HiDPI)** … **[JDK 9+]**
* **`var` (lokální inference)** … **[JDK 10+]**
* **`record` (DTO)** … **[JDK 16+]**

## Mini-recepty (Swing i JavaFX)

**Swing – potvrzovací dialog:**

```java
int volba = JOptionPane.showConfirmDialog(
    null,                         // parent (null = střed obrazovky)
    "Uložit změny?",              // zpráva
    "Potvrzení",                  // titulek
    JOptionPane.YES_NO_CANCEL_OPTION, // typ možností
    JOptionPane.QUESTION_MESSAGE      // typ ikony
);
if (volba == JOptionPane.YES_OPTION) { /* uložit */ }
```

**Swing – tabulka s jednoduchým modelem:**

```java
String[] columns = {"Jméno", "Věk"};
Object[][] data = { {"Anna", 24}, {"Pavel", 27} };
JTable table = new JTable(data, columns);
JScrollPane scroll = new JScrollPane(table);
```

**JavaFX – načtení FXML:**

```java
Parent root = FXMLLoader.load(getClass().getResource("/view/main.fxml"));
Stage stage = new Stage();
stage.setScene(new Scene(root));
stage.show();
```

**JavaFX – validace přes binding (prázdné pole):**

```java
TextField tf = new TextField();
Label err = new Label();
BooleanBinding empty = tf.textProperty().isEmpty();
err.textProperty().bind(Bindings.when(empty)
    .then("Vyplňte prosím")
    .otherwise(""));
```

## Doporučení pro praxi

* **Layout plánujte**:

  * Swing: `BorderLayout` (+ `GridBagLayout` pro složitosti) je „bezpečná kombinace“.
  * JavaFX: `BorderPane`, `GridPane`, `VBox/HBox` pokryjí většinu případů.
* **Nikdy neblokujte GUI vlákno**: používejte `SwingWorker` (Swing) a `Task/Service` (JavaFX).
* **HiDPI a fonty**: testujte na různých DPI; využijte `MultiResolutionImage` **[JDK 9+]**.
* **Distribuce**: zvažte `jlink` **[JDK 9+]** a `jpackage` **[JDK 16+]**; u JavaFX **OpenJFX** **[JDK 11+]**.

## Závěr

Swing poskytuje stabilní základ a širokou kompatibilitu; JavaFX přináší moderní **scene graph**, **vazby vlastností**, **CSS** a **FXML**. Pro „novou Javu“ sledujte **JPMS (`jlink`) [JDK 9+]**, **OpenJFX moduly [JDK 11+]** a **`jpackage` [JDK 16+]** — usnadní to běh i distribuci.
