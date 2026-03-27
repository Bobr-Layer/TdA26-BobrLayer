
# Regulární výrazy

**Regulární výrazy** (regex, regexp, RE) jsou speciální řetězce znaků, které popisují vzory v textu.

* **Množiny**: `[abc]`, `[a-z]`, negace `[^0-9]`
* **Třídy znaků**: `\d \D \w \W \s \S` (+ Unicode: `\p{L}`, `\p{N}`, …)
* **Kvantifikátory**: `? * + {m,n}` (+ líné `?` a posesivní `+`)
* **Skupiny**: `(...)`, nezachytávací `(?:...)`, pojmenované `(?<jmeno>...)`
* **Alternativa**: `A|B`
* **Kotvy**: `^ $ \A \z \b \B`
* **Lookaround**: `(?=...) (?!...) (?<=...) (?<!...)` (lookbehind má fixní délku)

## Regulární výrazy v Javě - API `java.util.regex`

## Třída `Pattern`

**Signatura**:

```java
public final class Pattern implements java.io.Serializable
```

Třída reprezentující předkompilovaný regulární výraz.

### Statické metody

#### `compile(String regex)`

Zkompiluje regex s výchozími flagy.

```java
Pattern p = Pattern.compile("\\d{3}-\\d{2}-\\d{4}");
```

#### `compile(String regex, int flags)`

Zkompiluje regex s danými přepínači (OR kombinace konstant `Pattern.*`).

```java
Pattern p = Pattern.compile("^error: (.+)$", Pattern.CASE_INSENSITIVE | Pattern.MULTILINE);
```

#### `matches(String regex, CharSequence input)`

Otestuje, zda **celý** vstup odpovídá regexu (syntaktický cukr).

```java
boolean ok = Pattern.matches("\\p{L}+(?:\\s\\p{L}+)*", "Čestmír Bárta");
```

#### `quote(String s)`

Vrátí regex-literál (escapuje všechny metaznaky).

```java
String rx = Pattern.quote("1.5*(a+b)?"); // \Q1.5*(a+b)?\E
```

#### `asPredicate()`

Predicate vracející true, pokud vstup **obsahuje shodu** s patternem.

```java
Predicate<String> containsDate = Pattern.compile("\\b\\d{4}-\\d{2}-\\d{2}\\b").asPredicate();
containsDate.test("Dnes: 2025-10-15"); // true
```

#### `asMatchPredicate()`

Predicate vracející true, pokud se shoduje **celý řetězec**.

```java
Predicate<String> fullDigits = Pattern.compile("\\d+").asMatchPredicate();
fullDigits.test("123");   // true
fullDigits.test("a123");  // false
```

### Instanční metody

#### `matcher(CharSequence input)`

Vytvoří `Matcher` nad zadaným vstupem.

```java
Matcher m = Pattern.compile("\\w+").matcher("foo bar");
```

#### `flags()`

Vrátí integer s aktivními přepínači.

```java
int f = Pattern.compile(".", Pattern.DOTALL).flags();
```

#### `pattern()`

Vrátí původní text regexu.

```java
String src = Pattern.compile("\\d+").pattern(); // "\\d+"
```

#### `split(CharSequence input)` / `split(CharSequence input, int limit)`

Rozdělí řetězec podle REGEXU (regex je „oddělovač“).

```java
String[] parts = Pattern.compile("\\s*,\\s*").split("a, b, c"); // ["a","b","c"]
```

#### `splitAsStream(CharSequence input)`

Totéž jako `split`, ale jako `Stream<String>`.

```java
List<String> ids = Pattern.compile(":").splitAsStream("A:B:C").toList(); // ["A","B","C"]
```

## Třída `Matcher`

**Signatura**:

```java
public final class Matcher implements MatchResult
```

Objekt stavu pro prohledávání vstupu patternem.

### Vytvoření

`Matcher` se vytváří přes `Pattern.matcher(...)` (konstruktor je balíčkový).

```java
Matcher m = Pattern.compile("\\d+").matcher("a1 b22 c333");
```

### Metody pro hledání shod

#### `boolean matches()`

Testuje **celý vstup**.

```java
Pattern p = Pattern.compile("\\d+");
p.matcher("123").matches();   // true
p.matcher("a123").matches();  // false
```

#### `boolean lookingAt()`

Testuje shodu **od začátku** vstupu (nemusí pokrýt vše).

```java
Matcher m = Pattern.compile("\\d+").matcher("123abc");
m.lookingAt(); // true
```

#### `boolean find()` / `boolean find(int start)`

Najde **další** výskyt (případně od zadaného indexu).

```java
Matcher m = Pattern.compile("\\d+").matcher("a1 b22 c333");
while (m.find()) System.out.println(m.group()); // 1, 22, 333
```

### Skupiny a pozice

#### `int groupCount()`

Počet zachytávacích skupin.

```java
int n = Pattern.compile("(\\w+)-(\\d+)").matcher("id-42").groupCount(); // 2
```

#### `String group()` / `group(int i)` / `group(String name)`

Vrátí celý match, nebo obsah skupiny.

```java
Matcher m = Pattern.compile("(?<k>\\w+)=(?<v>\\w+)").matcher("x=10");
m.find();
m.group();           // "x=10"
m.group(1);          // "x"
m.group("v");        // "10"
```

#### `int start()` / `start(int i)` / `start(String name)`

#### `int end()` / `end(int i)` / `end(String name)`

Začátky/konce shody a skupin.

```java
Matcher m = Pattern.compile("cat").matcher("my cat!");
m.find(); m.start(); // 3, m.end() == 6
```

### Nahrazování

#### `String replaceAll(String replacement)`

Nahradí všechny výskyty (používá skupiny `$1`, `$2`, …).

```java
String out = Pattern.compile("(\\p{L}+),\\s*(\\p{L}+)")
    .matcher("Novák, Jan; Dvořák, Petra")
    .replaceAll("$2 $1"); // "Jan Novák; Petra Dvořák"
```

#### `String replaceFirst(String replacement)`

Nahradí jen první výskyt.

```java
String out = Pattern.compile("\\d+")
    .matcher("cena 120 a 250")
    .replaceFirst("X"); // "cena X a 250"
```

#### `String replaceAll(Function<MatchResult,String> replacer)` *(Java 9+)*

Dynamická náhrada podle obsahu shody.

```java
String out = Pattern.compile("(\\d+)")
    .matcher("120 Kč a 250 Kč")
    .replaceAll(mr -> String.valueOf(Integer.parseInt(mr.group(1)) * 2));
// "240 Kč a 500 Kč"
```

#### `String replaceFirst(Function<MatchResult,String> replacer)` *(Java 9+)*

Totéž, ale jen první shoda.

```java
String out = Pattern.compile("\\d+")
    .matcher("10 20 30")
    .replaceFirst(mr -> "[" + mr.group() + "]"); // "[10] 20 30"
```

#### `static String quoteReplacement(String s)`

Escapuje `\` a `$` v **náhradním** textu.

```java
String safe = Matcher.quoteReplacement("$HOME\\tmp");
String out = Pattern.compile("X").matcher("X").replaceAll(safe); // "$HOME\tmp"
```

#### `Stream<MatchResult> results()` *(Java 9+)*

Stream všech shod (bez měnění interního stavu během iterace).

```java
List<String> words = Pattern.compile("\\w+").matcher("Ala ma kocku")
    .results().map(MatchResult::group).toList();
```

### Postupné „lepení“ výstupu

#### `Matcher appendReplacement(StringBuffer sb, String replacement)`

#### `StringBuffer appendTail(StringBuffer sb)`

Manuální nahrazování s vlastním builderem (např. složité šablony).

```java
Matcher m = Pattern.compile("\\$(\\w+)").matcher("Ahoj $name!");
StringBuffer sb = new StringBuffer();
while (m.find()) {
  String repl = "name".equals(m.group(1)) ? "Pepo" : m.group();
  m.appendReplacement(sb, Matcher.quoteReplacement(repl));
}
m.appendTail(sb);
// "Ahoj Pepo!"
```

### Regiony a hranice

#### `Matcher region(int start, int end)` / `regionStart()` / `regionEnd()`

Omezí část vstupu, ve které se hledá.

```java
Matcher m = Pattern.compile("\\w+").matcher("hello world");
m.region(6, 11).find(); // true (match "world")
```

#### `Matcher useTransparentBounds(boolean b)` / `hasTransparentBounds()`

#### `Matcher useAnchoringBounds(boolean b)` / `hasAnchoringBounds()`

Jemné řízení, zda kotvy/lookaround mohou „vidět“ přes hranice regionu.

```java
Matcher m = Pattern.compile("^world$", Pattern.MULTILINE).matcher("hello\nworld");
m.region(6, 11).useAnchoringBounds(true).matches(); // true
```

### Ostatní

#### `Matcher reset()` / `reset(CharSequence input)`

Resetuje pozici / změní vstup.

```java
Matcher m = Pattern.compile("\\d+").matcher("1 2");
m.find();          // najde "1"
m.reset("3 4");    // nový vstup
m.find();          // najde "3"
```

#### `Matcher usePattern(Pattern newPattern)`

Změní vzor při zachování vstupu.

```java
Matcher m = Pattern.compile("\\d+").matcher("a1");
m.usePattern(Pattern.compile("\\w+")).matches(); // true
```

#### `MatchResult toMatchResult()`

Neměnný snapshot aktuální shody.

```java
Matcher m = Pattern.compile("\\d+").matcher("a42");
m.find();
MatchResult r = m.toMatchResult();
r.group(); // "42"
```

#### `boolean hitEnd()` / `boolean requireEnd()`

Užitečné pro streamované/inkrementální parsování – indikují, zda částečný vstup mohl zabránit shodě.

```java
Matcher m = Pattern.compile("\\d+$").matcher("123");
m.find(); m.hitEnd(); // true, pokud jsme na konci
```

## Třída `MatchResult`

**Signatura**:

```java
public interface MatchResult
```

Neměnný snapshot shody (skupiny a pozice).

### Metody

#### `String group()` / `group(int i)`

Celá shoda / i-tá skupina (bez změny stavu) jako text.

```java
MatchResult r = Pattern.compile("(\\w+)-(\\d+)").matcher("id-42").results().findFirst().get();
r.group();   // "id-42"
r.group(2);  // "42"
```

#### `int start()` / `start(int i)`

#### `int end()` / `end(int i)`

Pozice celé shody / skupiny.

```java
int s = r.start(1), e = r.end(1); // rozsah první skupiny
```

#### `int groupCount()`

Počet zachytávacích skupin.

```java
int count = r.groupCount(); // např. 2
```

## Třída `PatternSyntaxException`

**Signatura**:

```java
public class PatternSyntaxException extends IllegalArgumentException
```

Hlášená při syntaktické chybě regexu.

### Metody

#### `String getPattern()`

Vrátí původní regulární výraz.

```java
try { Pattern.compile("[A-"); } 
catch (PatternSyntaxException e) { e.getPattern(); }
```

#### `String getDescription()`

Popis chyby.

```java
e.getDescription(); // "Unclosed character class" apod.
```

#### `int getIndex()`

Index v regexu, kde došlo k chybě (nebo -1).

```java
int idx = e.getIndex();
```

#### `String getMessage()`

Sestavená zpráva (popis + vzor + index).

```java
System.err.println(e.getMessage());
```

## Přepínače (flags) `Pattern`

Použij jako druhý parametr `compile` nebo inline `(?i)(?m)` apod.

* `CASE_INSENSITIVE` / `(?i)` – nerozlišuje velikost

```java
Pattern.compile("error", Pattern.CASE_INSENSITIVE).matcher("Error").find(); // true
```

* `MULTILINE` / `(?m)` – `^`/`$` = zač./konec řádku

```java
Pattern p = Pattern.compile("^ok$", Pattern.MULTILINE);
p.matcher("no\nok\nno").find(); // true
```

* `DOTALL` / `(?s)` – `.` matchuje i newline

```java
Pattern.compile("a.*b", Pattern.DOTALL).matcher("a\nb").matches(); // true
```

* `UNICODE_CASE` / `(?u)` – case podle Unicode (použij s `CASE_INSENSITIVE`)

```java
Pattern.compile("ž", Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE).matcher("Ž").find(); // true
```

* `UNICODE_CHARACTER_CLASS` – `\w`, `\b`, … podle Unicode

```java
Pattern.compile("\\w+", Pattern.UNICODE_CHARACTER_CLASS).matcher("Čestmír").matches(); // true
```

* `COMMENTS` / `(?x)` – ignoruje mezery a `#` komentáře uvnitř regexu

```java
Pattern p = Pattern.compile("""
 (?x)
 ^           # začátek
 (\\d{4})    # rok
 - (\\d{2})  # měsíc
 - (\\d{2})  # den
 $
 """);
p.matcher("2025-10-15").matches(); // true
```

* `LITERAL` – bere celý vzor jako literál (alternativa k `Pattern.quote`)

```java
Pattern.compile("a.b", Pattern.LITERAL).matcher("a.b").matches(); // true
```

* `UNIX_LINES` / `(?d)` – řádky ukončené jen `\n`

### Metody na `String`, které používají REGEX (pro úplnost)

#### `boolean matches(String regex)`

Celý řetězec musí odpovídat.

```java
"123".matches("\\d+"); // true
```

#### `String replaceAll(String regex, String replacement)`

Nahradí všechny výskyty.

```java
"cena 120 a 250".replaceAll("\\d+", "X"); // "cena X a X"
```

#### `String replaceFirst(String regex, String replacement)`

Nahradí první výskyt.

```java
"1 2 3".replaceFirst("\\d", "X"); // "X 2 3"
```

#### `String[] split(String regex)` / `split(String regex, int limit)`

Rozdělí podle regexu.

```java
" a , b , c ".trim().split("\\s*,\\s*"); // ["a","b","c"]
```

> Pozn.: `String.matches` ≠ „obsahuje“. Pro „obsahuje“ použij `Pattern/Matcher.find()`.

### Praktické vzory (Unicode-friendly) s ukázkami

#### Jméno a příjmení

```java
Pattern p = Pattern.compile("\\p{L}+(?:[ '-]\\p{L}+)*");
p.matcher("Čestmír Bárta").matches(); // true
```

#### ISO datum yyyy-mm-dd (jako podřetězec)

```java
Matcher m = Pattern.compile("\\b\\d{4}-\\d{2}-\\d{2}\\b").matcher("Dnes: 2025-10-15");
m.find(); m.group(); // "2025-10-15"
```

#### Jednoduchý e-mail (didaktický, ne RFC)

```java
Pattern email = Pattern.compile("(?<u>[\\w.+-]+)@(?<h>[\\w.-]+\\.[A-Za-z]{2,})");
Matcher mm = email.matcher("kontakt: a.b-c@firma.cz");
if (mm.find()) { mm.group("u"); mm.group("h"); }
```

#### Lookbehind fixní délky

```java
Pattern p = Pattern.compile("(?<=ID-)\\d+"); // OK (fixní "ID-")
p.matcher("ID-123").find(); // true
```

### Tipy a triky

* **Předkompilace** (opakované použití):

```java
static final Pattern PHONE = Pattern.compile("\\+?\\d(?:[ -]?\\d){6,}");
```

* **Kotvy** a omezení prostoru hledání:

```java
Matcher m = Pattern.compile("^ERROR: (.+)$", Pattern.MULTILINE).matcher(logText);
```

* **Bezpečné náhrady**:

```java
m.appendReplacement(sb, Matcher.quoteReplacement(userInput));
```
