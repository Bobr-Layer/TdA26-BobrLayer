# Deklarace a datové typy

## Datové typy

V Javě jsou dva hlavní druhy datových typů:

* **Primitivní typy**: základní datové typy jako celá čísla, desetinná čísla, znaky, logické hodnoty.
* **Referenční typy**: objekty, řetězce, pole, vlastní třídy.

Každý datový typ má svou velikost, rozsah hodnot, způsob zápisu (literály) a výchozí hodnotu (pro pole a fieldy).
Proměnné musí mít deklarovaný datový typ (nebo `var` pro lokální proměnné, kde typ určí překladač).

## Primitivní datové typy

Primitivní datové typy jsou základní stavební kameny pro práci s daty v Javě. Jsou rozděleny do čtyř kategorií: celočíselné, desetinné, znakový a logický.
V paměti zabírají pevně daný počet bitů a jsou uloženy přímo v proměnné (na rozdíl od referenčních typů, které ukládají odkaz na objekt v paměti).

### Celočíselné (primitivní)

| Typ       | Velikost | Rozsah (přibližně) | Literál (příklad)          | Výchozí hodnota |
| --------- | -------- | --------------------- | ----------------------------- | ----------------- |
| `byte`  | 8 bit    | −128 … 127          | `127`, `0b0110`, `0x7F` | `0`             |
| `short` | 16 bit   | −32 768 … 32 767    | `12345`                     | `0`             |
| `int`   | 32 bit   | −2^31 … 2^31−1     | `42`, `1_000_000`         | `0`             |
| `long`  | 64 bit   | −2^63 … 2^63−1     | `123L`, `10_000L`         | `0L`            |

> Pozn.: `char` je také 16bitové **celé** číslo (kódová jednotka UTF-16), ale používá se pro znaky – je níže v „Znakový“.

> Pozn.: Pro velká čísla používejte třídy z balíčku `java.math` jako `BigInteger` (referenční typ; výchozí hodnota u polí/fieldů je `null`).

> Pozn.: Literály v binárním (`0b`/`0B`) a osmičkovém (`0` prefix) formátu jsou dostupné od Javy 7+ a při výstupu jsou zobrazeny v desítkovém formátu.

> Pozn.: Velikost typu je určena právě velikostí paměti, kterou zabírá (nikoli rozsahem hodnot). Např. `int` je vždy 32 bit, i když by se do něj vešel menší rozsah.

### Desetinné (plovoucí řádová čárka)

| Typ        | Velikost | Přibližná přesnost   | Literál (příklad) | Výchozí hodnota                 |
| ---------- | -------- | ------------------------ | -------------------- | --------------------------------- |
| `float`  | 32 bit   | ~7 desetinných číslic | `3.14f`, `1e-3f` | `0.0f`                          |
| `double` | 64 bit   | ~15–16 číslic         | `3.14`, `1e-9`   | `0.0d` (zapisujeme jen `0.0`) |

> Pozn.: `double` je výchozí typ pro desetinná čísla (např. `3.14` je `double`, ne `float`).

> Pozn.: Pro finanční a přesné výpočty používejte spíš `BigDecimal` (referenční typ; výchozí hodnota u polí/fieldů je `null`).

### Znakový

Je číslo reprezentující jednu kódovou jednotku UTF-16. Tedy znak (písmeno, číslici, symbol, řídicí znak) a technicky je **číselným** datovým typem.

| Typ      | Velikost | Co reprezentuje            | Literál (příklad)            | Výchozí hodnota  |
| -------- | -------- | -------------------------- | ------------------------------- | ------------------ |
| `char` | 16 bit   | 1 kódovou jednotku UTF-16 | `'A'`, `'\n'`, `'\u03C0'` | `'\u0000'` (NUL) |

> Pozor: `char` není totéž co `String` (řetězec). Pro řetězce používejte typ `String`.

> Pozor také na implicitní převody mezi `char` a `int` (číslo kódové jednotky).

### Logický

| Typ         | Velikost          | Hodnoty              | Literál (příklad) | Výchozí hodnota |
| ----------- | ----------------- | -------------------- | -------------------- | ----------------- |
| `boolean` | (implementační) | `true` / `false` | `true`             | `false`         |

## Referenční typy (objekty, řetězce, pole, vlastní třídy)

Referenční typy reprezentují objekty v paměti. Proměnná referenčního typu neobsahuje přímo hodnotu, ale odkaz (referenci) na místo v paměti, kde je objekt uložen. Referenční typy zahrnují řetězce, pole, kolekce a vlastní třídy.

| Příklady             | Co to je                         | Literál / vytvoření                      | Výchozí hodnota             |
| ---------------------- | -------------------------------- | ------------------------------------------- | ----------------------------- |
| `String`             | neměnný řetězec              | `"Ahoj"`, `"""více řádků"""`        | `null`                      |
| Pole (`int[]`, …)   | sekvence prvků stejného typu   | `new int[]{1,2,3}`, `new int[5]`        | `null` (pro referenci pole) |
| `List<String>` apod. | kolekce (rozhraní/implementace) | `List.of("A","B")`, `new ArrayList<>()` | `null`                      |
| Vlastní typy          | instance tříd                  | `new Student(...)`                        | `null`                      |

> U *prvků* pole je výchozí hodnota podle typu prvku (např. `new int[3]` → `{0,0,0}`; `new String[2]` → `{null, null}`).

### Deklarace proměnných

**Název proměnné** by měl začínat písmenem, podtržítkem `_` nebo znakem `$`, následovat mohou písmena, číslice, podtržítka nebo `$`. Nesmí být shodný s klíčovým slovem Javy.

**Jmenný styl**: `camelCase` (malé písmeno na začátku, velké na začátku dalších slov).

> Jméno by mělo být výstižné a popisné (např. `pocetStudentu`, `jmenoUzivatele`).

### Standardní deklarace

```java
int vek = 18;        // typ + jméno + inicializace
double prumer;       // lokální proměnnou je nutné před použitím přiřadit
String jmeno = "Eva";
int[] body = {10, 9, 8};
```

### `var` (odvození typu překladačem, Java 10+)

* Pouze **lokálně** (uvnitř metod, `for`, `try-with-resources`).
* Typ se určí z **pravé strany** při kompilaci.

```java
var x = 5;                       // int
var y = 3.14;                    // double
var jmena = new ArrayList<String>(); // ArrayList<String>
var pole = new int[]{1,2,3};     // int[]
// var a; // nelze: není z čeho odvodit typ
```

Kde var smí / nesmí:

* ✅ Lokální proměnné: ano.
* ✅ Parametry lambda výrazů (od Java 11): list.stream().map((var s) -> s.length())
* ❌ Pole třídy, parametry metod, návratové typy – ne (použijte normální typ).
* ❌ Bez inicializace: var a; nelze – chybí z čeho odvodit typ.

### Konstanty (`final`, „pravé“ konstanty jako `static final`)

**Konstanty** jsou hodnoty, které se nemění a deklarují se pomocí `final`.

* `final` u **primitivních typů** znamená, že hodnota se po prvním přiřazení už nemění:

```java
final int MAX = 100;           // po prvním přiřazení už nelze změnit
final var PI = 3.14159;        // s var to jde také – typ se odvodí jednou

public static final String APP_NAME = "MojeApp"; // idiomatická konstanta na třídě
```

* `final` u **referencí** brání změně *odkazu*, ne obsahu objektu:

```java
final List<String> names = new ArrayList<>();
names.add("Eva");   // OK (mění se obsah)
/// names = new ArrayList<>(); // NE (změna odkazu)
```

### Literály – drobné tipy

* Odděluj čitelnost `_`: `1_000_000`.
* `long` končete `L`: `10_000L`.
* `float` končete `f`: `3.14f`.
* Textové bloky pro vícerádkové řetězce:

```java
String html = """
    <h1>Ahoj</h1>
    <p>Multi-line</p>
    """;
```

## Načítání výchozích hodnot

* Lokální proměnné **nemají** výchozí hodnotu → musíš je inicializovat před použitím.
* Fieldy (členské proměnné třídy) a prvky pole **mají** výchozí hodnotu podle typu (viz tabulky výše).

## Načítání datových typů z textu nebo vstupu

* Pro převod z textu na číslo používejte metody
  * `Integer.parseInt()` - pro převod na `int`,
  * `Long.parseLong()` - pro převod na `long`,
  * `Double.parseDouble()` - pro převod na `double`, atd.
* Pro převod z textu na znak používejte `charAt(0)`.
* Pro převod z textu na logickou hodnotu používejte `Boolean.parseBoolean()`.
* Pro převod z čísla na text používejte `String.valueOf()`, `Integer.toString()`,
  `Double.toString()`, atd.
* Pro čtení z konzole používejte třídu `java.lang.IO` a metody jako `readLn()`.

### ❗Nejčastější začátečnické pasti

* Lokální proměnná **nemá** výchozí hodnotu → při použití bez přiřazení chyba kompilace.
* Záměna `0.0` (double) vs `0.0f` (float).
* `char` není malý „String“ – je to 16bitové číslo se znakem.
* U referencí si pohlídej `null` (NPE); používej inicializaci nebo typy jako `Optional` v API návrhu.

## Převody mezi datovými typy

* **Implicitní** (automatické) převody mezi kompatibilními typy (např. `int` → `long`, `float` → `double`). Můžeme říct, že jde o „bezpečné“ převody bez ztráty dat.
  **Pravidlo**: menší typ → větší typ (větší rozsah/přesnost).
  Mezi primitivními typy jsou povoleny tyto implicitní převody:

| Zdrojový typ | Cílový typ                                        |
| ------------- | --------------------------------------------------- |
| `byte`      | `short`, `int`, `long`, `float`, `double` |
| `short`     | `int`, `long`, `float`, `double`            |
| `char`      | `int`, `long`, `float`, `double`            |
| `int`       | `long`, `float`, `double`                     |
| `long`      | `float`, `double`                               |
| `float`     | `double`                                          |

Příklad implicitního převodu:

```java
int i = 42;
long l = i;        // int → long (implicitní)
double d = l;     // long → double (implicitní)
```

* **Explicitní** (ruční) převody pomocí castingu (např. `(int) 3.14`, `(byte) 300`).
  **Pravidlo**: větší typ → menší typ (menší rozsah/přesnost) – může dojít ke ztrátě dat.
  **Operátor castingu**: `(typ) hodnota`.

Příklad explicitního převodu:

```java
int i = (int) 3.14;   // i bude 3
byte b = (byte) 300;  // b bude 44 (přetečení)
```

### Tipy pro převody

* Pozor na ztrátu dat při převodech (např. z `double` na `int` se ztrátou desetinné části, z `long` na `int` při překročení rozsahu).
* Při převodech mezi `char` a `int` si uvědom, že `char` je číslo kódové jednotky.
* Pro převody mezi referenčními typy používej dědičnost a rozhraní (např. `Object` → `String` pomocí castingu, pokud jsi si jistý typem objektu).
