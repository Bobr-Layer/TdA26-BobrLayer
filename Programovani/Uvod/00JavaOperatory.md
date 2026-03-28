# Operátory v Javě

## Dělení

* **Podle počtu operandů**
  * **unární** = vyžaduje jeden operand (např. `-x`, `!b`, `++i`, `--j`)
  * **binární** = vyžaduje dva operandy (např. `a + b`, `x * y`, `p && q`)
  * **ternární** = vyžaduje tři operandy (v Javě jen `? :`)
* **Podle typu operandu**
  * **aritmetické** = pracují s čísly (např. `+`, `-`, `*`, `/`, `%`)
  * **relační** = porovnávají hodnoty (např. `<`, `<=`, `>`, `>=`, `==`, `!=`)
  * **logické** = pracují s booleovskými hodnotami (např. `&&`, `||`, `!`)
  * **bitové** = pracují na úrovni jednotlivých bitů (např. `&`, `|`, `^`, `~`, `<<`, `>>`, `>>>`)
* **Přiřazovací** = přiřazují hodnoty (např. `=`, `+=`, `-=`, `*=`, `/=`, `%=`)
* **Ostatní** = speciální operátory (např. `instanceof`, `?:`)  


## Unární operátory

* `+x` (unární plus) – beze změny hodnoty.
* `-x` (negace) – otočí znaménko (pozor na přetečení u `Integer.MIN_VALUE`).
* `++x / x++`, `--x / x--` – prefix vrací novou hodnotu, postfix původní.
* `!b` (logická negace) – `true` → `false`, `false` → `true`.
* `~x` (bitový NOT) – invertuje bity (`int/long/...`).

```java
int x = 5;
+x;            // + :  +5 → 5 (beze změny)
-x;            // - :  -5

int a = 5;
int b = a++;   // postfix ++ : b=5, a=6
int c = ++a;   // prefix  ++ : a=7, c=7

int d = 5;
int e = d--;   // postfix -- : e=5, d=4
int f = --d;   // prefix  -- : d=3, f=3

boolean ok = true;
!ok;           // ! :  negace → false

int mask = 0b0000_1111;
~mask;         // ~ :  bitový NOT → ...1111_0000 (int)
```

## Aritmetické a řetězcová konkatenace

* `* / % + -`

  * Celá čísla: dělení nulou → `ArithmeticException`.
  * Plovoucí: `1.0/0.0` je `Infinity`, `0.0/0.0` je `NaN`.
  * `+` s `String` provádí konkatenaci.

### Násobení, dělení, modulo

```java
5 * 3;         // 15
7 / 2;         // 3 (celé dělení)
7 % 2;         // 1 (zbytek)

7 / 2.0;       // 3.5 (double)
1.0 / 0.0;     // Infinity
0.0 / 0.0;     // NaN

-5 % 2;        // -1 (znaménko má dělenec)
5 % -2;        // 1  (znaménko má dělitel)
-5 % -2;       // -1 (znaménko má dělenec)
```

### Sčítání, odčítání, konkatenace

```java
10 + 3;        // 13
10 - 3;        // 7

"A" + 1 + 2;   // "A12" (konkatenace)
1 + 2 + "A";   // "3A"
```

## Posunové operátory

* `<<` (vlevo), `>>` (vpravo aritmetický), `>>>` (vpravo logický).
* Posun modulo 32 (pro `int`) / 64 (pro `long`).

```java
int v = 0b0001_0010;   // 18
v << 1;                // 0b0010_0100 = 36  (<< posun vlevo, doplní nuly)

int s = -8;            // ...1111_1000
s >> 1;                // aritm. >>  → ...1111_1100 = -4 (doplní bit znaménka)
s >>> 1;               // logický >>> → 0b0111...1100 = 2147483644
```

## Relační a rovnostní

* `< <= > >=` pro čísla a `char`.
* `== !=` – pro primitiva hodnoty, pro objekty **identity** (obsah porovnávej `equals()`).

```java
int a1 = 5, a2 = 8;
boolean lt  = a1 < a2;     // true
boolean ge  = a1 >= a2;    // false

double d1 = Double.NaN;
boolean eqNan = (d1 == d1);             // false
boolean cmp   = Double.isNaN(d1);       // true

String A = new String("x");
String B = new String("x");
boolean refEq  = (A == B);              // false (jiné reference)
boolean valEq  = A.equals(B);           // true  (obsah)
boolean nullEq = (A == null);           // false
```

## `instanceof` (vč. pattern matchingu)

```java
if (o instanceof String s) { System.out.println(s.length()); } // Java 16+
```

## Logické operátory (booleovské) + tabulky pravdy

### Krátké vyhodnocení (doporučené): `&&` a `||`

* `a && b` vyhodnotí `b` jen když `a` je `true`.
* `a || b` vyhodnotí `b` jen když `a` je `false`.
* Bezpečný idiom proti NPE: `if (obj != null && obj.isReady()) ...`

### Pravdivostní tabulka — `&&` (logické AND)

| a     | b     | a && b |
| ----- | ----- | ------ |
| true  | true  | true   |
| true  | false | false  |
| false | true  | false  |
| false | false | false  |

### Pravdivostní tabulka — `||` (logické OR)

| a     | b     | a \|\| b |
| ----- | ----- | -------- |
| true  | true  | true     |
| true  | false | true     |
| false | true  | true     |
| false | false | false    |

## Nezkrácené booleovské: `&` a `|`

* Vyhodnotí **obě** strany vždy (může zavolat metodu i když levá strana už určuje výsledek).
* Na typech `boolean` dávají stejné výsledky jako `&&`/`||`, liší se **vyhodnocováním**.
* Na **celých číslech** `&`/`|` dělají bitové operace (viz níže).

### Pravdivostní tabulka — `&` (booleovské AND bez zkracování)

| a     | b     | a & b |
| ----- | ----- | ----- |
| true  | true  | true  |
| true  | false | false |
| false | true  | false |
| false | false | false |

### Pravdivostní tabulka — `|` (booleovské OR bez zkracování)

| a     | b     | a \| b |
| ----- | ----- | ----- |
| true  | true  | true  |
| true  | false | true  |
| false | true  | true  |
| false | false | false |

## XOR: `^` (exkluzivní OR)

* `true` právě když se **liší**.

### Pravdivostní tabulka — `^` (XOR)

| a     | b     | a ^ b |
| ----- | ----- | ----- |
| true  | true  | false |
| true  | false | true  |
| false | true  | true  |
| false | false | false |

## Negace: `!`

| a     | !a    |
| ----- | ----- |
| true  | false |
| false | true  |

> **Shrnutí rozdílů:**
>
> * `&&`/`||` = krátké vyhodnocení (pravá část se může nevyhodnotit).
> * `&`/`|` na `boolean` = vždy vyhodnotí obě strany; na `int/long` = bitové operace.
> * `^` = liší se? pak `true`.

### Mini-pasti a tipy

* Potřebuješ vynechat volání metody, když je `obj == null`? Použij `&&`, ne `&`.
* Potřebuješ, aby se volala **vždy** (např. logování)? Použij `&` nebo rozděl do dvou řádků.

## Bitové operátory (`int/long`)

* `&` (AND), `|` (OR), `^` (XOR), `~` (NOT), `<<`, `>>`, `>>>`.

```java
final int READ = 0b001, WRITE = 0b010, EXEC = 0b100;

int flags = READ | WRITE;                   // OR: nastavení bitů
boolean canWrite = (flags & WRITE) != 0;    // AND: test bitu
int toggled = flags ^ EXEC;                 // XOR: přepnutí bitu
int none = flags & ~flags;                  // NOT: vynulování

int shl = 1 << 3;                           // 8
int sar = (-16) >> 2;                       // -4
int shr = (-16) >>> 2;                      // velké kladné číslo
```

## Ternární operátor `?:`

```java
String label = ok ? "OK" : "FAIL"; // výraz vracející hodnotu
```

* Kompilátor najde společný typ obou větví (numeric promotion/boxing).

```java
int score = 72;
String grade = (score >= 90) ? "A" :
               (score >= 80) ? "B" :
               (score >= 70) ? "C" : "D";
double price = vip ? base * 0.8 : base;
Number n = flag ? Integer.valueOf(1) : Double.valueOf(2.0); // společný nadtyp Number
```

## Přiřazovací operátory

* `=, +=, -=, *=, /=, %=, <<=, >>=, >>>=, &=, ^=, |=`

```java
int x1 = 10;        // =
x1 += 5;            // 15
x1 -= 3;            // 12
x1 *= 2;            // 24
x1 /= 4;            // 6
x1 %= 5;            // 1

int x2 = 0b0010;
x2 <<= 2;           // 0b1000 (8)
x2 >>= 1;           // 0b0100 (4)
x2 >>>= 1;          // 0b0010 (2)

int f2 = READ | WRITE;
f2 &= ~WRITE;       // odeber WRITE
f2 ^= EXEC;         // přepni EXEC
f2 |= WRITE;        // přidej WRITE
```

* Složené přiřazení provádí implicitní úzké přetypování na typ levé strany
  (`byte b=1; b+=1; // OK`, ale `b=b+1; // chyba`).

```java
byte bb = 1;
// bb = bb + 1;     // chyba: výsledek je int
bb += 1;             // OK: implicitně zúží zpět na byte
```

## Precedence (zkráceně)

1. postfix: `[] () . :: expr++ expr--`
2. prefix: `++ -- + - ! ~ (cast) new`
3. `* / %` → `+ -` → `<< >> >>>` → `< <= > >= instanceof` → `== !=` → `&` → `^` → `|` → `&&` → `||` → `?:` → přiřazení

## Krátké, praktické ukázky

```java
// Bezpečný guard s krátkým vyhodnocením
if (user != null && user.isActive()) sendMail(user);

// XOR: přesně jedna podmínka musí platit
if (isAdmin ^ isGuest) { /* ... */ }

// Bitová maska práv
int flags = READ | WRITE;
if ((flags & READ) != 0) { /* ... */ }
```
