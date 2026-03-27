# Regulární výrazy (RegExp) – syntaxe a konstrukce

## Běžné znaky a metaznaky

* **Běžné znaky** (např. `A`, `z`, `5`, `@`) odpovídají samy sobě.
* **Metaznaky**: `.^$*+?()[{|\` a v některých enginzích i `]`.
  Chcete-li je brát doslova, **escapujte** zpětným lomítkem: `\.` odpovídá tečce, `\(` levé závorce apod.

**Příklad**
Vzor: `file\.txt`
Text: `file.txt file-txt` → zachytí pouze `file.txt`.

## Tečka

* `.` odpovídá libovolnému znaku **kromě** znaku nového řádku (výchozí chování).
* V režimu **dotall** (viz vlajka `s`) odpovídá i koncům řádků.

**Příklad**
Vzor: `a.b`
Text: `acb a\nb` → zachytí `acb`; druhý výskyt projde jen v režimu dotall.

## Kotvy (ankory)

* `^` začátek řetězce; v režimu **multiline** (vlajka `m`) začátek **řádku**.
* `$` konec řetězce; v `m` režimu konec **řádku**.
* `\A` začátek **celého** vstupu (ignoruje `m`), `\z` konec **celého** vstupu, `\Z` konec vstupu před případným závěrečným `\n`.
* `\G` pozice poslední úspěšné shody (užitečné při postupném skenování; podpora se liší).

**Příklad**
Vzor: `^Hello$`
Text: `Hello\nWorld` → bez `m` nezachytí nic; s `m` zachytí `Hello` na prvním řádku.

## Třídy znaků a zkratky

### Znakové třídy `[...]`

* `[abc]` znamená „jeden znak z množiny `a`, `b` nebo `c`“.
* **Rozsahy**: `[a-z]`, `[0-9]`.
* **Negace**: `[^0-9]` („cokoliv kromě číslice“).
* Uvnitř třídy má `-` význam „rozsah“; chcete-li pomlčku doslova, uveďte ji na okraj třídy nebo escapujte (`\-`). Tečka `.` uvnitř třídy už metaznakem není.
* Pozor na **lokální abecedy** a **Unicode** – rozsahy jsou prosté na kódové body; abecední třídění nemusí odpovídat přirozenému řazení.

**Příklad**
Vzor: `colou?r`
Text: `color colour` → zachytí oba tvary.

### Zkratkové třídy

* `\d` číslice, `\D` ne-číslice
* `\w` „slovní“ znak (typicky písmeno, číslice, `_`), `\W` opak
* `\s` bílé znaky (mezera, tabulátor, konec řádku…), `\S` opak
  V **Unicode režimu** jsou rozsahy `\w` a `\s` širší (zahrnují např. znakové třídy mimo ASCII). Konkrétní vymezení se liší dle enginu a jeho nastavení.

**Příklad**
Vzor: `\w+@\w+\.\w+` (silně zjednodušený e-mail)
Text: `john@example.com` → zachytí celý řetězec.

### Unicode vlastnosti (pojmenované třídy)

* PCRE2, .NET, většina moderních enginů: `\p{L}` (písmena), `\p{Nd}` (desítkové číslice), `\p{Zs}` (oddělovače slov), `\p{Greek}` (blok), aj. Negace: `\P{...}`.
* PCRE nabízí i `\X` (jedna **grafémová** jednotka, tj. písmeno + kombinační diakritika jako celek).

**Příklad**
Vzor: `\p{L}+`
Text: `Čokoláda 123` → zachytí `Čokoláda`.

### POSIX třídy (uvnitř `[]`)

Často v sedových/grepových dialektech: `[:alpha:]`, `[:digit:]`, `[:alnum:]`, `[:space:]`, `[:punct:]` apod. Používají se jako `[[:alpha:]]`. Podpora v různých enginzích kolísá.

## Kvantifikátory a jejich režimy

### Základní kvantifikátory

* `*` … 0 až nekonečno výskytů
* `+` … 1 až nekonečno
* `?` … 0 nebo 1 (volitelné)
* `{m}` … přesně m×
* `{m,}` … alespoň m×
* `{m,n}` … m až n×

### Chamtivý × líný × posedlý (possessive)

* **Chamtivý** (výchozí): bere co nejvíce a podle potřeby „vrací“ (backtracking).
* **Líný** (přidáním `?`): bere co nejméně, aby shoda prošla.
  Příklady: `*?`, `+?`, `??`, `{m,n}?`.
* **Posedlý / possessive** (přidáním `+` k *kvantifikátoru*): „nevrací vůbec“ (uvnitř daného kusu zakáže backtracking).
  Příklady: `*+`, `++`, `?+`, `{m,n}+`. (Ne všechny enginy podporují.)

**Příklad (chamtivý vs. líný)**
Text: `<b>a</b><b>b</b>`
Vzor (chamtivě): `<b>.*</b>` → zachytí `<b>a</b><b>b</b>`
Vzor (líně): `<b>.*?</b>` → postupně `<b>a</b>` a `<b>b</b>`.

## Seskupování, pojmenování a zpětné reference

### Skupiny

* `(...)` vytváří zachycenou skupinu (číslovanou od 1 podle **levé závorky**).
* `(?:...)` **nezachycující** skupina (čistě pro seskupení či kvantifikaci).

### Zpětné reference

* `\1`, `\2`, … (v některých enginzích i `\k<name>` pro pojmenované).
  Umožňují odkázat se na **předtím zachycený obsah**.

**Příklad**
Vzor: `([a-z]+)-\1`
Text: `foo-foo bar-baz` → zachytí `foo-foo`.

### Pojmenované skupiny

* PCRE/.NET: `(?<name>...)`, odkaz `\k<name>`.
* Python též `(?P<name>...)`, odkaz `(?P=name)` nebo `\g<name>`.
  Pojmenování zásadně zvyšuje čitelnost, zejména u delších vzorů.

**Příklad**
Vzor: `(?<user>\w+)@(?<host>[\w.-]+)`
Text: `alice@mail.example.org` → `user=alice`, `host=mail.example.org`.

### Alternace

* `A|B` znamená „A **nebo** B“.
  Dbejte na prioritu: kvantifikátory a zřetězení mají vyšší prioritu než `|`. Často je vhodné alternaci uzavřít do závorek: `(?:A|B)`.

### Hranice a zvláštní pozice

* `\b` hranice slova (přechod mezi `\w` a `\W`), `\B` opak.
* Kotvy `^`, `$`, `\A`, `\z`, `\Z`, viz výše.
* PCRE/PCRE2: `\R` odpovídá **jakékoli** koncovce řádku (CR, LF, CRLF, …), což je praktičtější než spoléhat se na `\n`.

**Příklad**
Vzor: `\bcat\b`
Text: `scatter cat category` → zachytí jen osamocené `cat`.

---

## Pokročilé konstrukce

### Lookaroundy (nulové šířky)

* **Pozitivní lookahead**: `X(?=Y)` … „X, pokud **za ním následuje** Y“.
* **Negativní lookahead**: `X(?!Y)` … „X, pokud **za ním nenásleduje** Y“.
* **Pozitivní lookbehind**: `(?<=Y)X` … „X, pokud **před ním je** Y“.
* **Negativní lookbehind**: `(?<!Y)X` … „X, pokud **před ním není** Y“.

Lookaroundy **nepohlcují** znaky (nezahrnují je do shody).
**Poznámka:** Některé enginy (RE2) lookbehind nepodporují, případně vyžadují **fixní délku** (nelze např. `(?<=a+)`).

**Příklady**

* Slovo před vykřičníkem: `\w+(?=!)` na `Pozor! Ano!` → `Pozor`, `Ano`.
* Číslo **ne**následované `px`: `\d+(?!px)` na `12 14px 20` → `12`, `20`.
* Slovo následující po `ID:`: `(?<=ID:\s*)\w+` na `ID: A42` → `A42`.

### Atomické skupiny a omezení backtrackingu

* **Atomická skupina**: `(?>...)` — po vstupu do ní se engine **nevrací** (žádný backtracking uvnitř).
  Užitečné pro výkon a prevenci „katastrofického“ backtrackingu.

**Příklad**
Vzor: `(?>(a+))b` na `aaaaac` → rychle selže, nezkouší zkracovat `a+`.

### Podmíněné větve

* PCRE/.NET/Python: `(?(podmínka)ano|ne)`
  `podmínka` může být lookahead, existence skupiny apod.

**Příklad**
Vzor: `(?(?=https://)https://|http://)\w+`
Smysl: pokud začíná `https://`, ber `https://`, jinak `http://`.

### Rekurze a podprogramy (PCRE/PCRE2)

* `(?R)` rekurze celého vzoru; `(?1)` rekurze obsahu první skupiny.
  Typické pro aproximaci vyvážených závorek.

**Příklad (PCRE)**
Vyvážené kulaté závorky: `^\((?:[^()]+|(?R))*\)$`

---

## Režimy (vlajky) a inline přepínače

### Běžné vlajky

* `i` bez rozlišení velikosti písmen (case-insensitive).
* `m` multiline: `^`/`$` pracují po řádcích.
* `s` dotall: tečka odpovídá i konci řádku.
* `x` free-spacing: ignoruje mezery a komentáře (mimo `[]` a escapů).
* `u` Unicode: aktivuje Unicode chování tříd a hranic (detaily dle enginu).
* `U` ungreedy (PCRE): obrátí výchozí chamtivost (vše je „líné“, dokud nepřidáte `?`).

### Inline nastavení

* `(?i)` zapne, `(?-i)` vypne v rámci vzoru; totéž pro `m`, `s`, `x` atd.
* **Volitelné skupiny s rozsahem vlajek**: `(?im:...)` aplikuje vlajky jen na obsah závorky.

**Příklad (free-spacing + pojmenování)**

```
(?xi)
^
  (?<scheme>https?) ://
  (?<host> [\w.-]+ )
  (?: : (?<port>\d+) )?
  (?<path> / \S* )?
$
```

Přehledné, snadno udržovatelné, vhodné pro delší vzory.
## Nahrazování (stručně k syntaxi náhrady)

V **náhradní části** se používají zpětné reference na zachycené skupiny, avšak **syntaxe se liší**:

* **PCRE/Perl/Ruby**: `$1`, `$2`, `${name}`.
* **.NET**: `$1`, `${name}`.
* **Python**: `\1`, `\g<1>`, `\g<name>`.

Běžné únikové sekvence: `\n` (nový řádek), `\t` (tabulátor) apod., ale i to se řídí daným prostředím.

**Příklad**
Vzor: `(\d{4})-(\d{2})-(\d{2})`
Náhrada (Perl/.NET/PCRE): `${3}.${2}.${1}` → `YYYY-MM-DD` → `DD.MM.YYYY`.

## Praktické vzory („kuchařka“)

1. **Telefon (hrubé schéma)**

```
(?x)
^\+?\d{1,3}          # kód země (volitelně)
[ .-]? \d{3}
[ .-]? \d{3}
[ .-]? \d{3,4}$
```

2. **URL (zjednodušené, ale čitelné)**

```
(?xi)
^(https?)://
([\w.-]+)             # host
(?::(\d+))?           # port
(/[^\s?#]*)?          # path
(\?[^\s#]*)?          # query
(#[^\s]*)?$
```

3. **CSV pole podle RFC4180 (jedno pole)**

```
(?x)
(?:
  "[^"]*(?:""[^"]*)*"   # uvozovky a zdvojené uvozovky uvnitř
| [^",\r\n]*            # bez čárek a konců řádků
)
```

4. **Hex barva**
   `^#(?:[0-9A-Fa-f]{3}){1,2}$`

5. **Duplicitní slovo vedle sebe**
   `\b(\w+)\s+\1\b`

6. **„Všechna slova kromě foo“ (PCRE trik)**
   `foo(*SKIP)(*F)|\w+`

7. **IP v4 (bez ověření 0–255)**
   `\b(?:\d{1,3}\.){3}\d{1,3}\b`

8. **Celé číslo se znaménkem (volitelně)**
   `[+-]?\d+`

9. **Desetinné číslo (tečka jako separátor)**
   `[+-]?\d+(?:\.\d+)?`

10. **Nejbližší úsek mezi `<tag>` a `</tag>`**
    `<tag>.*?</tag>`

## Čitelnost, údržba a testování

* **Preferujte free-spacing režim** (`x`): vzor pak formátujte jako kód, s komentáři.
* **Pojmenované skupiny** výrazně zlepšují srozumitelnost.
* **Specifičnost před univerzalitou**: místo `.*` raději přesné třídy (např. `[^"]*` nebo `\S+`).
* **Kotvy používejte vědomě**: `^`/`$` vs. `\A`/`\z` – zvlášť v multiline režimu.
* **Testujte na vzorcích**, ideálně s vizualizérem (existují online nástroje, které vykreslují stavový průchod).

## Výkon a prevence „katastrofického“ backtrackingu

* Vyhýbejte se „spouštěčům“ jako `(.+)+`, `(.*a){n}` apod., zejména na dlouhých nevyhovujících vstupech.
* Preferujte **líné** kvantifikátory, **přesné třídy**, **lookaroundy** a podle možnosti **atomické skupiny** `(?>...)` nebo **possessive** kvantifikátory `*+`, `++`.
* U složitějších struktur zvažte **rekurzi** (PCRE) nebo rozumné rozdělení na více kroků.

## Záludnosti a okrajové případy

* **Konce řádků** nejsou všude `\n`: existují `\r`, `\r\n`, dokonce unicode separátory. PCRE má `\R`.
* **Unicode a `\b`**: hranice slova závisí na definici „slovní znak“ (`\w`) a aktivním režimu.
* **Lookbehind s proměnlivou délkou**: bývá omezený (některé enginy jej zcela zakazují).
* **Alternace a priorita**: dávejte pozor, aby „kratší“ varianta neudusila delší (např. řaďte od specifičtějších k obecným).

## Krátké shrnutí

* Regulární výraz tvoříte z **literálů**, **tříd znaků**, **kvantifikátorů**, **skupin** a **alternací**, ukotvených **ankorami** a zpřesněných **lookaroundy**.
* **Čitelnost** zvyšujte free-spacingem a pojmenovanými skupinami.
* **Výkon** držte pod kontrolou omezením backtrackingu (líné/possessive, atomické skupiny, specifičtější vzory).
* Vždy berte v potaz **Unicode** a rozdíly mezi enginy.

