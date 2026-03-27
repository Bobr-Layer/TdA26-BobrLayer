# Balíček (package)

* **Logické seskupení typů** (tříd, rozhraní, záznamů, výčtů) pod jedinečným jmenným prostorem.
* **Řeší kolize jmen** (můžete mít `com.acme.List` i `com.example.List`).
* **Vliv na přístupová práva**: „package-private“ (bez modifikátoru) je viditelné jen **v rámci stejného balíčku**.

> Konvence: reverzní doménové jméno, vše malými písmeny, bez diakritiky, např. `cz.skolaprojekt.app`.

## Struktura projektu vs. `package`

* **První nekomentovaný řádek zdrojáku**: `package cz.skolaprojekt.app;`
* **Adresářová struktura** musí odpovídat balíčku:

```
src/
  cz/
    skolaprojekt/
      app/
        Main.java        // obsahuje: package cz.skolaprojekt.app;
```

## Vytvoření vlastního balíčku (od kompilace po spuštění)

### 1) Zdrojový kód

```java
// soubor: src/cz/skolaprojekt/app/Main.java
package cz.skolaprojekt.app;

public class Main {
    public static void main(String[] args) {
        System.out.println("Ahoj z balíčku!");
    }
}
```

### 2) Kompilace na classpath
>
> **Classpath** je seznam adresářů a JAR souborů, kde Java hledá třídy.

```bash
javac -d out src/cz/skolaprojekt/app/Main.java
# vytvoří out/cz/skolaprojekt/app/Main.class
```

### 3) Spuštění

```bash
java -cp out cz.skolaprojekt.app.Main
```

### 4) Zabaleno jako JAR

```bash
jar --create --file app.jar -C out .
java -cp app.jar cz.skolaprojekt.app.Main
```

## Import

### Základ

* **FQN** (plně kvalifikované jméno): bez `importu`:

  ```java
  java.util.List<String> xs = new java.util.ArrayList<>();
  ```

* **Jednotlivý import**:

  ```java
  import java.util.List;
  List<String> xs = List.of("a","b");
  ```

* **Hromadný import** (on-demand):

  ```java
  import java.util.*;     // List, Map, Set, ...
  ```

  Nedoporučuje se v knihovnách (může maskovat kolize), v malých programech je to OK.

### Statické importy

* **Jeden člen**:

  ```java
  import static java.lang.Math.PI;
  import static java.lang.Math.cos;
  double y = cos(2*PI);
  ```

* **Hromadný statický**:

  ```java
  import static java.lang.Math.*;
  double z = sin(1) + sqrt(2);
  ```

## Pravidla rozlišení jmen (zkráceně)

1. Typy ve **stejném balíčku** mají přednost.
2. **Jednotlivý import** má přednost před `*`.
3. Při kolizi (např. `java.util.List` vs. `java.awt.List`) použijte **FQN** aspoň pro jeden z nich.

## Automatické importy

* **Dostupné vždy**:

  * `java.lang.*` (např. `String`, `System`, `Math`)
  * **Aktuální balíček** zdrojového souboru
* **Neexistuje** implicitní `import java.util.*` – často to dělá jen IDE při „auto-import“.

> IDE (IntelliJ/VS Code/Eclipse) umí:
>
> * **Auto-import** při psaní (doplní správný `import`).
> * **Organize imports** (smaže nepoužité, sjednotí styl).
> * Nastavit **preferované balíčky** (např. vždy `java.time` místo starého `java.util.Date`).

## Viditelnost a balíček (přehled)

* Bez modifikátoru: **package-private** – přístupné jen v rámci stejného balíčku.
* `public`: viditelné odkudkoli (pokud je balíček přístupný — viz moduly níže).
* `protected`: navíc přístupné **v podtřídách** (i z jiného balíčku).
* `private`: jen v rámci stejné třídy/top-level deklarace (u top-level typů nelze).

> V jednom `.java` souboru může být více top-level typů, ale **max. jeden `public`** a jméno souboru musí souhlasit s jeho jménem.

# Dceřiné balíčky nejsou „speciální“

`cz.skolaprojekt` a `cz.skolaprojekt.app` jsou **nezávislé** balíčky. Neexistuje dědičnost práv mezi nimi.

## Java 9+ (JPMS – modulový systém): co se změnilo

Od Javy 9 jsou balíčky **seskupovány do modulů**. Moduly přidávají další vrstvu zapouzdření.

### `module-info.java` (v kořeni modulu)

```java
module cz.skolaprojekt.app {
    requires java.sql;             // závislost na jiném modulu
    exports cz.skolaprojekt.api;   // balíčky, které jsou VIDITELNÉ pro jiné moduly
    opens cz.skolaprojekt.model;   // (Java 9+) otevře balíček pro reflexi (např. JAXB/JPA)
    uses cz.skolaprojekt.spi.Formatter;                 // služby (Service Loader)
    provides cz.skolaprojekt.spi.Formatter with cz.skolaprojekt.impl.JsonFormatter;
}
```

### Důsledky a doporučení (Java 9+)

* **Přístup přes moduly**: i když je třída `public`, z **jiného modulu** je dostupná **jen pokud je její balíček `exports`** v `module-info.java`.
* **Reflexe**: pro knihovny používající reflexi (frameworky) použijte `opens`/`open module`.
* **Split packages**: **stejné jméno balíčku nesmí být ve více modulech** na module-path (na classpath to sice projde, ale je to křehké).
* **module-path vs classpath**: moderní projekty by měly používat module-path; starší kompatibilně jedou na classpath (tzv. „unnamed module“).
* **Automatické moduly**: JAR bez `module-info.java` na module-path dostane **automatický modul** (název odvozený ze JARu) – dobré pro migraci, ale plánujte plnohodnotný modul.

> Prakticky: ve větších aplikacích dávejte **API** do exportovaných balíčků, **interní kód** neexportujte. Získáte silnější zapouzdření, než nabízel samotný `public`.

---

## Příklady a mini-recepty

### Import dvou „List“ bez kolize

```java
import java.util.List;
// neimportujeme java.awt.List, použijeme FQN v jednom místě
java.awt.List legacy = new java.awt.List();
List<String> modern = java.util.List.of("A","B");
```

### Statické utility elegantně

```java
import static java.util.Collections.unmodifiableList;
var xs = unmodifiableList(new ArrayList<>());
```

### Když framework padá na reflexi (Java 9+)

```java
// module-info.java
module my.app {
    requires spring.core;
    opens my.app.entity to spring.core;  // povolí reflexi konkrétnímu modulu
}
```

## Best practices

* **Srozumitelná hierarchie** balíčků: `…​.api`, `…​.impl`, `…​.model`, `…​.util`, `…​.spi`.
* **Neexportujte interní balíčky** v modulech (Java 9+).
* **Vyhněte se `*` importům** v knihovním kódu; u testů a malých utilit je to na zvážení.
* **Jedna zodpovědnost na balíček** – usnadní přístupová práva (package-private) a testování.
* **Nemíchejte stejné balíčky napříč moduly** (split-package anti-pattern).
* **IDE auto-import** nasměrujte na moderní API (`java.time` místo `Date`).

## Rychlá „cheat-tabulka“ importů

| Typ importu           | Syntaxe                       | Poznámka                    |
| --------------------- | ----------------------------- | --------------------------- |
| Jednotlivý typ        | `import a.b.C;`               | Preferovaný, nejméně kolizí |
| Hromadný (typy)       | `import a.b.*;`               | Pozor na kolize             |
| Statický – jeden člen | `import static a.b.C.MEMBER;` | Pro konstanty/metody utilit |
| Statický – hromadný   | `import static a.b.C.*;`      | Úsporné, ale méně čitelné   |
| Bez importu (FQN)     | `a.b.C`                       | Jednoznačné, ale ukecané    |
