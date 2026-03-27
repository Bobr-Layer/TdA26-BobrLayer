# `java.lang.String`

## Signatura třídy

```java
package java.lang;

public final class String
  implements java.io.Serializable,
             Comparable<String>,
             CharSequence,
             Constable,    // JDK 12+
             ConstantDesc  // JDK 12+
```

* **Imutabilní** (bezpečná pro více vláken).
* Uvnitř UTF-16 kódové jednotky; některé znaky (emoji) zabírají 2× `char`.

## Veřejná pole

* `public static final Comparator<String> CASE_INSENSITIVE_ORDER`
  Komparátor bez ohledu na velikost písmen (Unicode case folding, nikoli locale-specifický).

## Konstruktory

* `String()` – prázdný řetězec `""`.
* `String(String original)` – kopie (většinou zbytečná).
* `String(char[] value)` / `String(char[] value, int off, int len)` – z pole znaků.
* `String(int[] codePoints, int off, int len)` – z **Unicode kódových bodů** (umí i emoji).
* `String(byte[] bytes)` / `String(byte[], int off, int len)` – v **defaultní** znakové sadě JVM (nedoporučeno).
* `String(byte[] bytes, String charsetName)` / s `Charset` – dekódování s určeným charsetem (preferujte `Charset`).
* `String(StringBuffer sb)` / `String(StringBuilder sb)` – kopie obsahu builderu/bufferu.

> ⚠️ **Best practice:** pro bajty používejte `new String(bytes, StandardCharsets.UTF_8)`.

## Instanční metody

#### 1) Délka, znaky, kódové body

* `int length()` – počet **UTF-16 jednotek** (ne počet „písmen“). *O(1)*
  * Počet kódových bodů (písmen) zjistíte `codePointCount(0, length())`. *O(n)*
  * Příklad
    ```java
    String s = "A🚀B";
    System.out.println(s.length());                      // 4
    System.out.println(s.codePointCount(0, s.length())); // 3
    ``` 
* `boolean isEmpty()` – `length() == 0`. *O(1)*
* `char charAt(int index)` – 16bit jednotka na indexu. *O(1)*; **může rozdělit emoji**.
* `int codePointAt(int index)` / `codePointBefore(int index)` – celý kódový bod. *O(1)*
* `int codePointCount(int begin, int end)` – počet kódových bodů v intervalu. *O(n)*
* `int offsetByCodePoints(int index, int cpOffset)` – posun o kódové body. *O(n)*
* `char[] toCharArray()` – kopie obsahu jako `char[]`. *O(n)*
* `void getChars(int srcBegin, int srcEnd, char[] dst, int dstBegin)` – rychlé kopírování části. *O(n)*
* `byte[] getBytes()` – do **defaultního** charsetu (pozor!). *O(n)*
* `byte[] getBytes(String charsetName)` / `getBytes(Charset)` – do daného charsetu. *O(n)*
* `IntStream chars()` – stream 16bit jednotek. *O(1) start, lazy*
* `IntStream codePoints()` – stream kódových bodů. *O(1) start, lazy*

**Příklad**

```java
String s = "A🚀B";
System.out.println(s.length());                      // 4
System.out.println(s.codePointCount(0, s.length())); // 3
s.codePoints().forEach(cp -> System.out.printf("U+%X ", cp)); // U+41 U+1F680 U+42
```

#### 2) Porovnání a rovnost

* `boolean equals(Object o)` – rovnost obsahu.
* `boolean equalsIgnoreCase(String s)` – ignoruje case (Unicode folding).
* `int compareTo(String s)` – lexikograficky (kódové body).
* `int compareToIgnoreCase(String s)` – lexikograficky, bez ohledu na case.
* `boolean contentEquals(CharSequence cs)` / `contentEquals(StringBuffer sb)` – přesná shoda obsahu.
* `int hashCode()` – dle obsahu, stabilní s `equals`.

> 💡 Pro **jazykově správné** řazení/vyhledávání použijte `java.text.Collator`.

**Příklad**

```java
"straße".equalsIgnoreCase("STRASSE"); // true
```

#### 3) Hledání, prefix/sufix

* `boolean startsWith(String prefix)` / `startsWith(String prefix, int offset)` – prefix (volitelný posun).
* `boolean endsWith(String suffix)` – sufix.
* `int indexOf(int ch)` / `indexOf(int ch, int fromIdx)` – hledání znaku (16bit).
* `int indexOf(String str)` / s `fromIndex` – hledání podřetězce.
* `int lastIndexOf(int ch/ String str [, fromIndex])` – poslední výskyt.
* `boolean contains(CharSequence s)` – `indexOf(s.toString()) >= 0`.

*Vše typicky **O(n)**; pro malé vzory specializované interní optimalizace.*

**Příklad**

```java
String t = "abc-123-abc";
t.indexOf("abc");        // 0
t.lastIndexOf("abc");    // 8
t.startsWith("abc", 8);  // true
```

#### 4) Výřezy a spojování

* `String substring(int begin)` / `(int begin, int end)` – [begin, end). *O(n)*
* `CharSequence subSequence(int begin, int end)` – totéž z `CharSequence`.
* `String concat(String s)` – rychlá konkatenace 2 řetězců. *O(n)*

**Příklad**

```java
"HelloWorld".substring(0, 5); // "Hello"
"Hello".concat(" ").concat("you"); // "Hello you"
```

> 🧠 **Ve smyčkách** nepoužívejte řetězové `+` – použijte `StringBuilder`.

#### 5) Nahrazování, regulární výrazy

* `String replace(char oldCh, char newCh)` – **doslovná** náhrada znaku.
* `String replace(CharSequence target, CharSequence replacement)` – **doslovná** náhrada textu (bez regexu).
* `String replaceFirst(String regex, String replacement)` – regex, první shoda.
* `String replaceAll(String regex, String replacement)` – regex, všechny shody.
* `boolean matches(String regex)` – regexová shoda na **celý** řetězec.
* `String[] split(String regex)` / `split(String regex, int limit)` – rozdělení podle regexu.

**Příklad**

```java
"1.2.3".split("\\.");             // ["1","2","3"] — tečka je regex meta, nutné escapovat
"abc123def".replaceAll("\\d+", "-"); // "abc-def"

// Doslovná náhrada vzoru, který může obsahovat regex metaznaky:
String pat = "a.b";
"xxa.byy".replace(pat, "!");      // jednodušší než Pattern.quote + replaceAll
```

#### 6) Změna velikosti písmen (casing)

* `String toLowerCase()` / `toUpperCase()` – podle **defaultního locale** (pozor!).
* `String toLowerCase(Locale l)` / `toUpperCase(Locale l)` – explicitní locale.

> ✅ Pro technické porovnávání použijte `Locale.ROOT` (nezávislé na uživateli/OS).

**Příklad**

```java
"ß".toUpperCase(Locale.ROOT); // "SS" (změní délku)
```

#### 7) Whitespace, řádky, opakování, formátování textu

* `String trim()` – odstraní ASCII whitespace `<= U+0020` z kraje/konce.
* `boolean isBlank()` — **JDK 11+**.
* `String strip()` / `stripLeading()` / `stripTrailing()` — **JDK 11+** (Unicode whitespace).
* `Stream<String> lines()` - Převede text na proud řádků, kde každý řádek je samostatným prvkem — **JDK 11+**.
* `String repeat(int count)` - Vytvoří nový řetězec, který se skládá z opakování původního řetězce — **JDK 11+**.
* `String indent(int n)` - Přidá odsazení na začátek každého řádku — **JDK 12+**.
* `String stripIndent()` - Odstraní odsazení na začátku každého řádku — **JDK 15+**.
* `String translateEscapes()` - Přeloží escape sekvence — **JDK 15+**.

**Příklady**

```java
"\u00A0X\u00A0".trim().length();   // 3 — NBSP se netrimuje
"\u00A0X\u00A0".strip().length();  // 1 — strip ho odstraní

"Hello".repeat(3);               // "HelloHelloHello"
"Hello\nWorld".indent(4);      // "    Hello\n    World\n"

" a \n b ".lines().toList();       // [" a ", " b "]
"-".repeat(5);                     // "--"
"  A\nB".indent(2);                // "  A\n  B\n"
"\\u0041\\n".translateEscapes();   // "A\n"
```

#### 8) Formátování a reprezentace

* `String toString()` – vrací **tento** řetězec (identita).
* `String formatted(Object... args)` — **JDK 15+**; ekvivalent `String.format(this, args)`.

**Příklad**

```java
"%-10s | %04d".formatted("ID", 7); // "ID         | 0007"
```

#### 9) Regionální porovnávání podřetězců

* `boolean regionMatches(int toffset, String other, int ooffset, int len)` – doslovné porovnání úseků.
* `boolean regionMatches(boolean ignoreCase, int toffset, String other, int ooffset, int len)` – case-insensitive.

**Příklad**

```java
"HelloWorld".regionMatches(true, 5, "woR", 0, 3); // true
```

#### 10) Intern (pool konstant)

* `native String intern()` – vrátí kanonickou instanci z poolu.
  **Pozor na paměť**; používejte střídmě (typicky jen pro tabulky klíčových slov ap.).

**Příklad**

```java
String a = new String("x");
String b = "x";
a == b;           // false
a.intern() == b;  // true
```

#### 11) Konstanty/`condesc` (JDK 12+)

* `Optional<ConstantDesc> describeConstable()` — **JDK 12+**.
* `ConstantDesc resolveConstantDesc(MethodHandles.Lookup lookup)` — **JDK 12+** (může vyhodit výjimku).

## Statické metody

#### Továrny a převody na text

* `static String valueOf(Object obj)` – `null` → `"null"`, jinak `obj.toString()`.
* `static String valueOf(char[] data)` / `(char[] data, int off, int len)` – z pole znaků.
* `static String valueOf(boolean/char/int/long/float/double)` – konverze primitiv.
* `static String copyValueOf(char[] data)` / `(char[] data, int off, int len)` – alias k `valueOf(char[])`.

**Příklad**

```java
String.valueOf(42);         // "42"
String.copyValueOf(new char[]{'O','K'}); // "OK"
```

#### Formátování a skládání

* `static String format(String fmt, Object... args)` / s `Locale` – printf-styl.
* `static String join(CharSequence delimiter, CharSequence... elements)` / s `Iterable` – bezpečné spojování. *(JDK 8+ — uvedeno pro kontext; nic novějšího netřeba)*

**Příklad**

```java
String.format(Locale.GERMANY, "%,.2f", 12345.6); // "12.345,60"
String.join(", ", List.of("A","B","C"));         // "A, B, C"
```

## Důležité poznámky a best practices

* **Imutabilita:** všechny „měnící“ metody vracejí **nový** `String`.
* **Výkon:** pro iterativní skládání použijte `StringBuilder`.
* **Regex vs. doslovně:** pro **doslovnou** náhradu používejte `replace`, ne `replaceAll`.
* **Locale:** pro algoritmické operace (`toUpperCase`/`toLowerCase`) používejte `Locale.ROOT`.
* **Unicode normalizace:** `String` **neprovádí** NFC/NFD — použijte `java.text.Normalizer`.

#### Mini-ukázky „co to vrátí?“ (rychlé procvičení)

```java
"".isBlank()                 // true (JDK 11+)
" \u00A0 ".trim().length()  // 3  (NBSP zůstává)
" \u00A0 ".strip().length() // 0  (Unicode whitespace pryč, JDK 11+)

"i".toUpperCase(Locale.ROOT)           // "I"
"i".toUpperCase(new Locale("tr"))      // "İ" (jiné!)

"1,2,3,".split(",", -1).length         // 4
"1,2,3,".split(",").length             // 3  (trail prázdné cut)

"A\uD83D\uDE80B".length()              // 4 (A, high, low, B)
"A\uD83D\uDE80B".codePointCount(0,4)   // 3 (A, 🚀, B)

"abc".matches("a.*")                   // true (regex přes **celý** řetězec)
"abc-123".replaceAll("\\d", "#")       // "abc-###"
"abc-123".replace("#", "!")            // "abc-123" (nenajde znak '#')
```
