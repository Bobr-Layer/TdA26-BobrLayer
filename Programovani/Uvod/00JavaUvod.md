# Úvod do jazyka Java

## Co je Java

Java je **programovací jazyk** a **platforma** pro vývoj a běh aplikací. Hlavní vlastnosti Javy:

* **Staticky typovaný** jazyk s pevně danými typy proměnných s možností kontroly typů při kompilaci a běhu.
* **Kompilovaný** jazyk překládající zdrojový kód do bytekódu.
* **Vysoce úrovňový** jazyk s bohatou syntaxí a konstrukcemi pro snadný vývoj.
* **Objektově orientovaný** jazyk s třídami, objekty, dědičností a polymorfismem.
* **Platformově nezávislý** díky překladu do **bytekódu** a běhu na **Java Virtual Machine (JVM)**.
* **Bohatá standardní knihovna** pro práci se soubory, sítěmi, GUI, databázemi a dalšími oblastmi.
* **Automatická správa paměti** pomocí **garbage collectoru (GC)**.

## Začínáme s Javou

1. **Nainstalujte JDK (Java Development Kit)** – doporučená verze je JDK 25 nebo novější. Můžete použít [Oracle JDK](https://www.oracle.com/java/technologies/javase-downloads.html).

2. **Do Visual Studio Code nainstalujte rozšíření „Java Extension Pack“** – poskytuje podporu pro vývoj v Javě, včetně IntelliSense (což je automatické doplňování kódu), ladění a správy projektů.

## První program v Javě — Compact Source File

**Compat Source File** je novinka v JDK 25, která umožňuje psát jednoduché programy bez nutnosti definovat třídu a `static` metodu `main`. Umožňuje rychlý start a je ideální pro učení.

Vytvořte nový soubor s názvem `Ahoj.java`. Pojmenování souboru je důležité – musí končit na `.java`. Název souboru může být libovolný (není nutné, aby odpovídal názvu třídy, protože třída není explicitně definována), ale je dobré zvolit výstižný název. Dále názvy souborů v Javě obvykle začínají velkým písmenem a používají CamelCase (např. `AhojSvete.java`).
>Název souboru **nesmí** obsahovat mezery ani speciální znaky (kromě podtržítka `_` a dolaru `$`).

Vložte do něj následující kód:

**Soubor:** `Ahoj.java`

```java
void main() {
    IO.println("Ahoj, světe!");
}
```

## Co tu je a proč

* `void main()`
  „Vstupní brána“ programu. V Java 25 může být **bez `static` a bez parametrů** – Java si na pozadí vytvoří instanci „neviditelné“ třídy a metodu zavolá. Pro vás: pište prostě `void main() { ... }`. *(nové v JDK 25, vyžaduje JDK 25+)* ([Oracle Docs][1])

* `IO.println("Ahoj, světe!");`
  V JDK 25 přibyla třída `java.lang.IO` pro jednoduché čtení/zápis na konzoli: `IO.print(...)`, `IO.println(...)`, `IO.readln(...)`. Chová se podobně jako známé `System.out.println`, ale je kratší a má i pohodlné čtení vstupu. *(nové v JDK 25, vyžaduje JDK 25+)* ([Oracle Docs][2])

### Jak to spustit

* **Ve Visual Studio Code stačí kliknout na „Run“ nad `void main()` (spustí `java Ahoj.java` pod pokličkou).** Nebo

* V terminálu v téže složce:

```bash
java Ahoj.java
```

Java umí zdroják **spustit přímo**, není nutné nejdřív volat `javac`. (Tomuhle se říká „source-code launcher“.) *(přidáno v JDK 11, vyžaduje JDK 11+)* ([dev.java][3])

### Malý program se vstupem

```java
void main() {
    var jmeno = IO.readln("Vaše jméno: ");
    IO.println("Nazdar, " + jmeno + "!");
}
```

* `var` nechá překladač odvodit typ proměnné z pravé strany (tady `String`). *(přidáno v JDK 10, vyžaduje JDK 10+)*
* `IO.readln("...")` vypíše prompt a přečte **celý řádek** ze vstupu. *(nové v JDK 25, vyžaduje JDK 25+)* ([Oracle Docs][2])

> Poznámka: „Compact source file“ je ideální pro učení: **žádná třída, žádné `static`, žádné `String[] args`**, jen minimum nutné kódu. Funkce je v JDK 25 **stabilní** (po sérii preview v JDK 21–24). *(vyžaduje JDK 25+)* ([openjdk.org][4])

# Stejný program jako „standardní“ (klasický) soubor

## ‼️ Vytvoření Java Projectu ve VS Code ‼️

1. Otevřete Visual Studio Code.
2. Nainstalujte rozšíření "Java Extension Pack" z Marketplace, pokud jste to ještě neudělali.
3. Pokud nemáte otevřený žádný adresář, otevřete panel průzkumníka a klikněte na "Create Java Project", nebo pomocí příkazové palety (Ctrl+Shift+P) spusťte "Java: Create Java Project".
4. Vyberte "No Build Tools" pro jednoduchý projekt bez správy závislostí.
5. Zadejte název projektu a vyberte umístění pro jeho uložení.
6. Vytvoří se základní struktura projektu s adresářem "src" pro zdrojové soubory.

# Životní cyklus programu v bodech

1. **Zdrojový kód → `javac` → `.class` (bytekód)** *(u Compact může kompilovat přímo launcher – JDK 11+, vyžaduje JDK 11+).*
2. **`java` spustí JVM** → class loader načte hlavní třídu.
3. **Verifikace/linkování** → bezpečný a připravený bytekód.
4. **Inicializace** → statické bloky/konstanty.
5. **Start `main`** → interpret + JIT optimalizace, běží GC.
6. **Program skončí** → zavřou se zdroje, proces JVM končí.

## Souvislost s výkonem

* **Krátké jednorázové běhy** těží méně z JIT (než se zahřeje).
* **Dlouho běžící služby** (server) výrazně profitují z tiered JIT optimalizací.
* Volbou **GC** a parametrů JVM (`-Xms`, `-Xmx`, `-XX:+UseZGC` apod.) ovlivňujete latence a propustnost. *(ZGC vyžaduje JDK 15+, Shenandoah JDK 15+; G1 jako výchozí od JDK 9+).*

## Struktura Java projektu po složkách

* Typická struktura Java projektu může vypadat takto:
* 📁 **Kořenový adresář projektu** s `pom.xml` (Maven) nebo `build.gradle` (Gradle).
* 📁 **`.vscode/`** pro konfiguraci Visual Studio Code a projektu.
* 📁 **`resources/`** - (složka pro zdroje) pro konfigurační soubory, obrázky atd.
* 📁 **`src/main/java/`**, nebo **`src/`** - (zdrojové soubory) obsahuje `.java` soubory podle balíčků.
* 📁 **`src/test/java/`** - (testovací zdrojové soubory) pro jednotkové testy.
* 📁 **`lib/`** - (knihovny) pro externí JAR soubory.
* 📁 **`out/`** nebo **`bin/`** - (výstupní složka) pro kompilované `.class` soubory.
* 📁 **`docs/`** - (dokumentace) pro dokumentační soubory projektu.
* 📄 **README.md** pro popis projektu.
* 📄 **Dockerfile** pro kontejnerizaci aplikace.
* 📄 **.gitignore** pro ignorování souborů v Git repozitáři.
* 📄 **pom.xml** pro správu závislostí a konfiguraci Maven projektu.
* 📄 **LICENSE** pro licenční informace.
* 📄 **build scripts** jako `build.sh` nebo `build.bat` pro automatizaci sestavení.

**Soubor:** `HelloWorldClassic.java`

```java
public class HelloWorldClassic {
    public static void main(String[] args) {
        System.out.println("Ahoj, světe!");
    }
}
```

## Co tu je a proč

* `public class HelloWorldClassic { ... }`
  V klasické Javě **musí být kód uvnitř třídy**. Název souboru se obvykle shoduje s názvem veřejné třídy.

* `public static void main(String[] args)`, nebo `public static void main(String... args)`
  Tradiční „vstupní brána“ programu.

  * `public` = spustitelný odkudkoli,
  * `static` = metoda patří třídě (ne instanci),
  * `void` = nic nevrací,
  * `String[] args` = pole textových argumentů z příkazové řádky.

* `System.out.println(...)`
  Klasický výstup na konzoli.

### Jak to spustit

**Ve Visual Studio Code klikněte na „Run“ nebo v terminálu:**

```bash
javac HelloWorldClassic.java
java HelloWorldClassic
```

(nejdřív kompilace `javac`, pak běh `java` nad zkompilovanou třídou). ([dev.java][3])

# Vysvětlení

## Text v uvozovkách

```java
"Ahoj, světe!"
```

To je **řetězec** (typ `String`) – prostě text. Tiskneme ho na konzoli.

## Příkazy končí středníkem

```java
IO.println("Ahoj");  // ; ukončuje příkaz
```

Java potřebuje vědět, kde příkaz končí. To řeší `;`.

## Proměnné a typy

```java
var pocet = 3;       // překladač odvodí int
String jmeno = "Eva";// explicitní typ
```

* `var` = pohodlné pro začátek, ale proměnná **má normální pevný typ** (není to dynamika jako v JavaScriptu). *(přidáno v JDK 10, vyžaduje JDK 10+)*
* `String` = řetězec; `int` = celé číslo atd.

## Skládání textu

```java
IO.println("Nazdar, " + jmeno + "!");
```

Operátor `+` u `String` znamená spojení textu.

## Čtení z klávesnice (Compact)

```java
var jmeno = IO.readln("Jméno: "); // vypíše prompt a přečte řádek
```

Klasická varianta je `System.console().readLine()` nebo `Scanner`, ale pro první kroky je `IO.readln` jednodušší. *(nové v JDK 25, vyžaduje JDK 25+)* ([Oracle Docs][2])

## Bloky kódu

```java
void main() {         // začátek bloku
    IO.println("…");
}                     // konec bloku
```

Vše mezi `{` a `}` patří do jednoho bloku (třeba tělo metody).

## Komentáře

Text za `//` nebo mezi `/*` a `*/` je **komentář** – poznámka pro člověka, kterou Java ignoruje.

* Jednořádkový komentář začíná `//` a pokračuje do konce řádku.
* Víceřádkový komentář je mezi `/*` a `*/`.

```java
// Toto je komentář
IO.println("Ahoj");  // Tento příkaz vypíše "Ahoj"
```

```java
/* Toto je
víceřádkový
komentář */
IO.println("Ahoj");
```

# Compact vs. standardní soubor — kdy co použít

| Potřeba                                        | Compact (Java 25)                                                  | Standardní soubor                          |
| ---------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------ |
| **Nejrychlejší start, učení, malé skripty**    | ✅ Nejjednodušší: `void main()`, `IO.println/IO.readln` *(JDK 25+)* | ❌ Víc šablonového kódu                     |
| **Větší projekt, více tříd/balíčků, knihovny** | ⚠️ Lze, ale brzy narazíte na limity implicitní třídy                | ✅ Plná síla OOP, balíčky, testy            |
| **Spouštění**                                  | `java Soubor.java` *(JDK 11+)*                                     | `javac` → `java NázevTřídy`                |
| **Vstup/výstup na konzoli**                    | `IO.print/println/readln` *(JDK 25+)*                              | `System.out.println`, `Scanner`, `Console` |

(„Compact source files“ a „instance main methods“ jsou v JDK 25 **finální** – tedy normální součást Javy, nikoli preview.) *(vyžaduje JDK 25+)* ([openjdk.org][4])

# Časté chyby na začátku (a jak je opravit)

1. **Soubor se nejmenuje jako třída** (u klasické verze)
   Správně: `HelloWorldClassic.java` obsahuje `public class HelloWorldClassic`.

2. **Chybí středník**
   Každý příkaz zakončete `;`.

3. **Pletu `System.out.println` a `IO.println`**
   V **Compact** příkladech používejte `IO.println`. V klasických klidně `System.out.println`. (Obě varianty fungují; `IO` je novinka pro pohodlí.) *(JDK 25+, vyžaduje JDK 25+)* ([Oracle Docs][2])

4. **Spouštím klasickou verzi přímo `java Soubor.java`**
   U klasiky je potřeba nejdřív `javac`, pak `java` (bez `.java`). *(Single-file launcher je až od JDK 11, vyžaduje JDK 11+).*

*Zdroj:* Novinky v JDK 25: **JEP 512 – Compact Source Files & Instance Main Methods**, oficiální kapitola v dokumentaci „Compact source files and instance main methods“, a dokumentace třídy **`java.lang.IO`**. *(vše vyžaduje JDK 25+)* ([openjdk.org][4])

[1]: https://docs.oracle.com/en/java/javase/25/language/compact-source-files-and-instance-main-methods.html?utm_source=chatgpt.com "6 Compact Source Files and Instance main Methods"
[2]: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/IO.html?utm_source=chatgpt.com "IO (Java SE 25 & JDK 25)"
[3]: https://dev.java/learn/launching-single-file-source-code-programs/?utm_source=chatgpt.com "Launching Single-File Source-Code Programs"
[4]: https://openjdk.org/jeps/512?utm_source=chatgpt.com "JEP 512: Compact Source Files and Instance Main Methods"

Super — pojďme **teoreticky** (ale srozumitelně) projít, co se v Javě děje od zápisu zdrojáku až po běh programu. Vezmeme dvě větve startu (klasický soubor a „Compact Source File“ v JDK 25) a pak detailně fáze překladu a běhu uvnitř JVM.

# Start a běh programu v Javě — přehled

## a) Klasický postup (třída + `public static void main`)

1. **Zdrojový kód** (`.java`) – text v Javě s balíčkem/třídami.
2. **`javac` kompilátor** přeloží zdrojový kód na **bytekód** (`.class`) – platformově nezávislá instrukční sada pro JVM.
3. **JVM launcher** (`java …`) vytvoří **proces JVM**, nahraje hlavní třídu a spustí `main`.

## b) „Compact Source File“ (JDK 25)

1. **Zdrojový kód** bez deklarované třídy (jen `void main()` atd.).
2. **Source-code launcher** (`java Soubor.java`) si **nejprve interně aplikuje kompilaci** (jako `javac`), zároveň implicitně „obalí“ kód do generované třídy. *(tato možnost je od JDK 11, vyžaduje JDK 11+)*
3. JVM spustí **instanční** `main` (bez `static`) v implicitní třídě. *(instanční main je novinka JDK 25, vyžaduje JDK 25+)*

> V obou případech tedy **vzniká bytekód** a program běží na **JVM**; liší se jen způsob, jak se k bytkódu dostaneme a jak vypadá vstupní metoda.

# Co dělá kompilátor `javac` (překlad do bytekódu)

Zjednodušený přehled hlavních kroků:

1. **Lexikální analýza** – zdrojový text → tok tokenů (klíčová slova, identifikátory, literály, …).
2. **Syntaktická analýza** – tokeny → **AST** (abstraktní syntaktický strom).
3. **Sémantika a řešení symbolů**

   * vazba jmen na deklarace (proměnné, třídy, metody),
   * dohledávání na **classpath/modulepath** *(modulepath je k dispozici od JDK 9, vyžaduje JDK 9+)*,
   * přístupová práva (`public`/`private`), dědičnost, override/overload.
4. **Kontrola typů** – generika, inferování typů (`var`) *(JDK 10+)*, kompatibilita při přiřazení/volání.
5. **Desugar** (převod jazykových cukrů) – např. **`switch` expresní forma** *(trvale od JDK 14, vyžaduje JDK 14+)*, `record` *(trvale od JDK 16, vyžaduje JDK 16+)*, **lambda → invokedynamic** apod.
6. **Generování bytkódu** – pro každou třídu/rozhraní vzniká **`.class`** v definovaném formátu **Java Class File** (mj. **constant pool**, sekce metod, atributy).
7. (Volitelně) **Tvorba JARu** – zabalí `.class` + zdroje + **Manifest** s `Main-Class`.

**Důsledek:** Výstupem je **platformově nezávislý bytekód**, který nespouští OS přímo, ale **virtuální stroj** (JVM).

# Jak JVM program spouští (běh uvnitř JVM)

Když spustíte `java …`, stane se zhruba toto:

1. **Start JVM procesu**

   * Inicializace paměťových oblastí (**heap**, **metaspace**, **stack** pro každý thread).
   * Nastavení GC, JIT režimů (tzv. **tiered compilation**).

2. **Class loading** (načítání tříd)

   * **Class loader** (bootstrap → platform → application + vaše custom) podle **classpath/modulepath** najde `.class`/JAR, přečte bajty a předá je JVM. *(modulepath od JDK 9, vyžaduje JDK 9+)*

3. **Linking** (pro každou nově načtenou třídu):

   * **Verification** – **bytecode verifier** kontroluje bezpečnost (typy, hranice zásobníku operandů, atd.).
   * **Preparation** – alokace a **implicitní nulová inicializace** statických polí.
   * **Resolution** – „zdrátování“ odkazů z constant poolu na konkrétní třídy/metody/pole (často **líně** až při prvním použití).

4. **Initialization**

   * Spuštění **statických inicializátorů** (`<clinit>`) a při vytváření objektu i **konstruktorů** (`<init>`).

5. **Vyhledání vstupní metody**

   * **Klasika:** `public static void main(String[] args)` v zadané třídě.
   * **Compact (JDK 25):** **instanční** `void main()` v implicitní třídě. *(vyžaduje JDK 25+)*

6. **Interpreter + JIT (HotSpot)**

   * **Interpreter** spouští bytekód instrukci po instrukci a **profiluje** běh.
   * „Horké“ metody přechází do **JIT kompilace** (C1/C2), generuje se strojový kód.
   * **Tiered compilation**: rychlá C1 pro zahřátí, optimalizující C2 pro dlouho běžící části.

7. **Správa paměti a GC**

   * Objektová paměť je na **heapu**. JVM v pravidelných **safepointech** provádí **GC**.
   * Moderní sběrače: **G1** *(výchozí od JDK 9, vyžaduje JDK 9+)*, **ZGC** *(produkčně od JDK 15, vyžaduje JDK 15+)*, **Shenandoah** *(produkčně od JDK 15 ve vydáních s podporou, vyžaduje JDK 15+)*.
   * Každé vlákno má svůj **stack** (aktivní metody = **zásobníkové rámce** s lokálními proměnnými a **operand stack** pro bytekód).

8. **Výjimky a řízení toku**

   * **Exceptions** nesou stack trace, JVM provádí **stack unwinding**, hledá `catch`.
   * `finally` bloky se garantovaně provedou při odchodu z rámce.

9. **Dynamika a pozdní vazba**

   * **Reflexe** (volání metod podle jména), **Class.forName**,
   * **`invokedynamic`** pro dynamické jazyky/lambdy,
   * **ServiceLoader**, **modulový systém** *(JDK 9+, vyžaduje JDK 9+)* pro řízenou viditelnost.

# Classpath, modulepath, balíčky (jak se řeší „kde co najít“)

* **Balíček (`package`)** určuje **jmenný prostor** a očekávané **umístění souboru** (např. `cz.skola.App` ↔ `cz/skola/App.class`).
* **Classpath** je seznam míst (adresáře/JARy), kde classloader hledá třídy.
* **Modulepath** (Jigsaw, JDK 9+) navíc přidává **moduly** s deklarovanými exporty/požadavky; umožňuje menší běhové obrazy (jlink) a přísnější kontrolu závislostí. *(vyžaduje JDK 9+)*

# Bytekód a formát `.class` (Java Class File)

* Instrukce typu `iload`, `invokevirtual`, `if_icmpge`, `new`, `athrow` atd.
* Každá metoda má **max stack** (hloubku operand zásobníku) a **max locals** (počet lokálních proměnných).
* **Constant pool** drží literály a symbolické odkazy (na třídy, metody, pole, signatury).

Tento formát je **stabilní a přenositelný** – proto lze stejný `.class` spustit na libovolném OS/CPU s kompatibilní JVM.
