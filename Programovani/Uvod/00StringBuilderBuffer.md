
# StringBuilder a StringBuffer v Javě

## Rodokmen a účel

* `java.lang.AbstractStringBuilder` – **neveřejný** (package-private) abstraktní předek; drží interní pole znaků, kapacitu a implementuje většinu operací.
* `java.lang.StringBuilder` – **nesynchronizovaný**, rychlý pro **single-thread** (JDK 5+).
* `java.lang.StringBuffer` – **synchronizovaný** (každá veřejná metoda je `synchronized`) pro **multi-thread** sdílení.

Všechny tři (resp. veřejné dvě) implementují:

* `CharSequence` (má `length()`, `charAt()`, `subSequence()`),
* `Appendable` (metody `append(…)` pro řetězení),
* `Serializable`.

Obě jsou **mutable** (na rozdíl od `String`) – mění svůj vnitřní buffer na místě.

## Signatury tříd

```java
// předek (neveřejný)
abstract class AbstractStringBuilder implements Appendable, CharSequence { ... }

public final class StringBuilder
  extends AbstractStringBuilder
  implements java.io.Serializable, CharSequence, Appendable { ... }

public final class StringBuffer
  extends AbstractStringBuilder
  implements java.io.Serializable, CharSequence, Appendable { ... }
```

## Konstruktory

### StringBuilder

```java
public StringBuilder();
public StringBuilder(int capacity);
public StringBuilder(CharSequence seq);
public StringBuilder(String str);
```

### StringBuffer

```java
public StringBuffer();
public StringBuffer(int capacity);
public StringBuffer(String str);
public StringBuffer(CharSequence seq);
```

> Pozn.: Bez parametru je **počáteční kapacita 16** znaků. Při růstu se zvětšuje zhruba na `newCap = oldCap * 2 + 2`.

## Společné veřejné metody (pro obě třídy)

Níže jsou metody, které (díky `AbstractStringBuilder`) sdílejí **stejné chování i signatury**. U `StringBuffer` jsou navíc **synchronizované**.

### Kapacita, délka, znaky

```java
public int length();
public int capacity();
public void ensureCapacity(int minimumCapacity);
public void trimToSize();
public void setLength(int newLength);

public char charAt(int index);
public int codePointAt(int index);
public int codePointBefore(int index);
public int offsetByCodePoints(int index, int codePointOffset);
public void getChars(int srcBegin, int srcEnd, char[] dst, int dstBegin);
public void setCharAt(int index, char ch);
```

**Popis**

* `capacity()` = velikost interního pole; `length()` = počet skutečných znaků.
* `ensureCapacity(n)` předejde re-alokacím (výkon).
* `setLength(n)` případně doplní `\u0000` (NUL) nebo zkrátí.
* `codePoint*` pracují s celými Unicode body (emoji).

### Přidávání (append)

```java
public StringBuilder|StringBuffer append(Object obj);
public StringBuilder|StringBuffer append(String str);
public StringBuilder|StringBuffer append(StringBuffer sb);     // (u SBuilderu přijímá Buffer)
public StringBuilder|StringBuffer append(CharSequence s);
public StringBuilder|StringBuffer append(CharSequence s, int start, int end);
public StringBuilder|StringBuffer append(char[] str);
public StringBuilder|StringBuffer append(char[] str, int offset, int len);
public StringBuilder|StringBuffer append(boolean b);
public StringBuilder|StringBuffer append(char c);
public StringBuilder|StringBuffer append(int i);
public StringBuilder|StringBuffer append(long lng);
public StringBuilder|StringBuffer append(float f);
public StringBuilder|StringBuffer append(double d);
public StringBuilder|StringBuffer appendCodePoint(int codePoint);
```

**Popis**

* Všechny `append` vrací **`this`** → **řetězení** volání.
* `appendCodePoint(cp)` přidá znak podle Unicode kódového bodu.

### Vkládání (insert)

```java
public StringBuilder|StringBuffer insert(int dstOffset, Object obj);
public StringBuilder|StringBuffer insert(int dstOffset, String str);
public StringBuilder|StringBuffer insert(int dstOffset, char[] str);
public StringBuilder|StringBuffer insert(int index, char[] str, int offset, int len);
public StringBuilder|StringBuffer insert(int dstOffset, CharSequence s);
public StringBuilder|StringBuffer insert(int dstOffset, CharSequence s, int start, int end);
public StringBuilder|StringBuffer insert(int dstOffset, boolean b);
public StringBuilder|StringBuffer insert(int dstOffset, char c);
public StringBuilder|StringBuffer insert(int dstOffset, int i);
public StringBuilder|StringBuffer insert(int dstOffset, long l);
public StringBuilder|StringBuffer insert(int dstOffset, float f);
public StringBuilder|StringBuffer insert(int dstOffset, double d);
```

**Popis**

* Vloží text na pozici `index` (posune následující obsah doprava).

#### Mazání / nahrazování

```java
public StringBuilder|StringBuffer delete(int start, int end);      // [start, end)
public StringBuilder|StringBuffer deleteCharAt(int index);
public StringBuilder|StringBuffer replace(int start, int end, String str);
```

**Popis**

* `replace` nahradí úsek [start, end) doslovně novým textem (bez regexů).

#### Hledání

```java
public int indexOf(String str);
public int indexOf(String str, int fromIndex);
public int lastIndexOf(String str);
public int lastIndexOf(String str, int fromIndex);
```

**Popis**

* Hledá **podřetězec** (ne regex). Vrací první/poslední výskyt.

### Podřetězce a pohledy

```java
public String substring(int start);
public String substring(int start, int end);
public CharSequence subSequence(int start, int end);
```

**Popis**

* Vždy vrací **nový `String`** (kopii aktuálního úseku).

### Ostatní užitečné

```java
public StringBuilder|StringBuffer reverse(); // in-place
public String toString();
```

**Popis**

* `reverse()` obrací pořadí znaků **na místě**.
* `toString()` vytvoří **nový `String`** (kopie aktuálního obsahu).


## Rozdíly mezi StringBuilder a StringBuffer

| Vlastnost             | StringBuilder                        | StringBuffer                            |
| --------------------- | ------------------------------------ | --------------------------------------- |
| Thread-safety         | ❌ nesynchronizovaný                  | ✅ všechny veřejné metody `synchronized` |
| Výkon (single-thread) | ⚡ rychlejší                          | 🐢 pomalejší (synchronizace)            |
| Využití               | běžné budování textu v jednom vlákně | sdílení instance mezi vlákny            |
| API                   | téměř stejné                         | téměř stejné                            |

> **Doporučení:** Používejte **`StringBuilder`** vždy, pokud **nemusíte** sdílet jednu instanci mezi vlákny. V multithread scénáři raději **nesdílejte** instanci vůbec; pokud musíte, použijte `StringBuffer` nebo vlastní synchronizaci.

## Praktické ukázky

### 1) Rychlé skládání řetězce

```java
StringBuilder sb = new StringBuilder(128); // předejdu reallokacím
for (int i = 1; i <= 3; i++) sb.append("Item ").append(i).append(", ");
String out = sb.toString(); // "Item 1, Item 2, Item 3, "
```

### 2) Vkládání, mazání, nahrazování

```java
StringBuilder sb = new StringBuilder("Hello ___!");
sb.insert(6, "world");             // "Hello world___!"
sb.replace(11, 14, "!!!");         // "Hello world!!!"
sb.deleteCharAt(5);                // "Helloworld!!!"
sb.reverse();                      // "!!!dlrowolleH"
```

### 3) Práce s kódovými body (emoji)

```java
StringBuilder sb = new StringBuilder();
sb.append('A').appendCodePoint(0x1F680).append('B'); // A🚀B
System.out.println(sb.length());            // 4 (UTF-16 jednotky)
```

### 4) Kapacita a setLength

```java
StringBuilder sb = new StringBuilder();
sb.ensureCapacity(1000); // rezervuj dopředu
sb.append("abc");
sb.setLength(6);         // "abc\u0000\u0000\u0000"
sb.trimToSize();         // kapacita == délka
```

### 5) Jednoduché sdílení mezi vlákny (StringBuffer)

```java
StringBuffer buf = new StringBuffer();
Runnable r = () -> {
  for (int i = 0; i < 1000; i++) buf.append('x'); // safe: synchronized
};
new Thread(r).start(); new Thread(r).start();
```

## Výkonové a bezpečnostní poznámky

* **Reallokace** bolí: pokud víte, kolik přibližně přidáte, použijte **`new StringBuilder(expected)`** nebo `ensureCapacity`.
* **`toString()` kopíruje** data – další změny builderu už `String` neovlivní (a naopak).
* **`substring()`/`subSequence()`** **vždy kopírují** do nového `String` (žádné sdílení bufferu).
* **`reverse()`** je in-place (pozor při sdílení `StringBuffer` mezi vlákny – i když je synchronized, logika může vyžadovat vyšší úroveň zamykání).
* **`StringBuffer` ≠ záruka vyšší propustnosti** v multi-thread – často je lepší **nesdílet** a sloučit až výsledky (např. `ThreadLocal` buildery).


## Kdy co použít (rychlé pravidlo)

* **Skládám text v jednom vlákně** → **`StringBuilder`**.
* **Musím sdílet jednu instanci napříč vlákny** → **`StringBuffer`**.
* **Jen slepuji pár literálů** → neřeším, kompilátor stejně vytvoří `StringBuilder` za mě.

## Mini-tahák (společné API)

* **Kapacita/délka**: `capacity`, `ensureCapacity`, `trimToSize`, `length`, `setLength`
* **Znaky/kódové body**: `charAt`, `setCharAt`, `codePointAt/Before`, `offsetByCodePoints`, `getChars`
* **Append**: `append(…)` pro `Object`, `String`, `CharSequence`, `char[]`, `boolean/char/int/long/float/double`, `appendCodePoint`
* **Insert**: `insert(index, …)` se stejnými typy
* **Editace**: `replace(start,end,str)`, `delete(start,end)`, `deleteCharAt`
* **Hledání**: `indexOf`, `lastIndexOf`
* **Výřezy**: `substring`, `subSequence`
* **Další**: `reverse`, `toString`


### Odstranění diakritiky z textu (ASCII folding) v Javě

Nejjednodušší a rychlý způsob v čisté Javě je použít `java.text.Normalizer`: převést text do formy NFD (písmeno + kombinační znaménka) a ta pak odstranit.

#### 1) Krátká a rychlá varianta (regex)

```java
import java.text.Normalizer;
import java.util.regex.Pattern;

public final class AsciiFold {
    private static final Pattern DIACRITICS = Pattern.compile("\\p{M}+");

    /** Odstraní diakritiku z latinky (č, ř, ů, á … -> c, r, u, a). */
    public static String stripAccents(String s) {
        if (s == null || s.isEmpty()) return s;
        String normalized = Normalizer.normalize(s, Normalizer.Form.NFD);
        String withoutMarks = DIACRITICS.matcher(normalized).replaceAll("");
        // Volitelné: ruční mapování znaků, které se nerozloží na kombinující znaménka
        // (např. ß, æ, ø…). Přidejte jen pokud je potřebujete.
        return withoutMarks
                .replace("ß", "ss")
                .replace("Æ", "AE").replace("æ", "ae")
                .replace("Ø", "O").replace("ø", "o")
                .replace("Ð", "D").replace("ð", "d")
                .replace("Þ", "TH").replace("þ", "th");
    }

    public static void main(String[] args) {
        String in = "Příliš žluťoučký kůň úpěl ďábelské ódy — Straße, Æsir, smørrebrød";
        System.out.println(stripAccents(in));
        // Výtup: "Prilis zlutoucky kun upel dabelske ody — Strasse, AEsir, smorrebrod"
    }
}
```

#### 2) Varianta bez regexu (po znacích, výkon pro velké řetězce)

```java
import java.text.Normalizer;

public static String stripAccentsNoRegex(String s) {
    if (s == null || s.isEmpty()) return s;
    String nfd = Normalizer.normalize(s, Normalizer.Form.NFD);
    StringBuilder out = new StringBuilder(nfd.length());
    for (int i = 0; i < nfd.length(); ) {
        int cp = nfd.codePointAt(i);
        int type = Character.getType(cp);
        // přeskočit kombinační znaménka
        if (type != Character.NON_SPACING_MARK
         && type != Character.COMBINING_SPACING_MARK
         && type != Character.ENCLOSING_MARK) {
            out.appendCodePoint(cp);
        }
        i += Character.charCount(cp);
    }
    String res = out.toString();
    // případné doplnění speciálních mapování
    res = res.replace("ß","ss").replace("Æ","AE").replace("æ","ae");
    return res;
}
```

#### Poznámky

* Tohle řešení skvěle funguje pro „klasickou“ diakritiku latinky (čeština/slovenština/polština ap.).
* Některé znaky nejsou tvořené kombinujícími znaménky (např. `ß`, `Æ`, `Ø`, `Ł`), proto je případně namapujte ručně, nebo použijte knihovnu **ICU4J** (transformační pravidlo „Any-Latin; Latin-ASCII“), pokud chcete opravdu „ASCII folding“ napříč jazyky.
* Výkon: obě varianty jsou O(n); pro hodně dlouhé texty bývá po-znaková verze bez regexu o chlup rychlejší a bez alokací od regex enginu.
