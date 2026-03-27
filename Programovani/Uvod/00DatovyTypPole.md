# Datový typ pole

## 1) Co je pole (array) v Javě

**Pole** je struktura, která drží **víc hodnot stejného typu** v jedné proměnné.

* prvky mají **stejný typ** (`int`, `double`, `String`, `Student`, …)
* má **pevnou délku** → jakmile pole vytvoříš, **nejde zvětšit ani zmenšit**
* prvky jsou **uložené vedle sebe v paměti**  (to je důležité pro rychlost)
* prvky jsou **očíslované indexem** od `0` - protože je to běžné v programování a usnadňuje to výpočty (1. prvek je `a[0]`, 2. prvek `a[1]`, …)
* přístup na `a[i]` je rychlý (přímo na index)

Příklad významu:

* místo `int a1, a2, a3...` máš `int[] a`

---

## 2) Pole je objekt (důležité!)

V Javě je pole  **objekt** . To znamená:

* proměnná `int[] a` obsahuje **referenci** (odkaz) na pole v paměti
* pole vzniká až pomocí `new` nebo literálu `{...}`

```java
int[] a = new int[3]; // vytvoří objekt pole délky 3
```

Proto taky platí:

* `a == b` porovnává **jestli je to stejné pole** (stejný odkaz), ne obsah

---

## 3) Indexování a `length`

Každé pole má:

* **indexy** : `0` až `length - 1`
* vlastnost  **`length`** : počet prvků v poli
  (není to metoda, nepíšou se závorky)

```java
int[] a = new int[5];
System.out.println(a.length); // 5
```

⚠️ Chyba:

```java
a[5] = 10; // špatně, poslední index je 4
// ArrayIndexOutOfBoundsException
```

---

## 4) Jak se pole vytváří

### A) Deklarace (zatím nic nevzniká)

```java
int[] a;      // existuje jen proměnná
```

### B) Vytvoření (alokace paměti)

```java
a = new int[4]; // vznikne pole délky 4
```

### C) Inicializace literálem

```java
int[] b = {10, 20, 30}; // vytvoří pole délky 3 a naplní ho
```

### D) Literál mimo deklaraci (musí být `new`)

```java
int[] c;
c = new int[]{1, 2, 3}; // správně
```

---

## 5) Default hodnoty (co je v poli po `new`)

Když uděláš `new int[5]`, Java prvky automaticky naplní  **default hodnotami** :

* `int, long, short, byte` → `0`
* `double, float` → `0.0`
* `boolean` → `false`
* `char` → `'\u0000'` (neviditelný znak)
* reference typy (`String`, objekty) → `null`

```java
String[] s = new String[3];
System.out.println(s[0]); // null
```

⚠️ Pozor na `null`:

```java
System.out.println(s[0].length()); // NullPointerException
```

---

## 6) Přístup k prvku a změna prvku

Přístup:

```java
int[] a = {5, 6, 7};
int x = a[1]; // 6
```

Změna:

```java
a[1] = 60; // pole je teď {5, 60, 7}
```

---

## 7) Procházení pole (nejběžnější práce s polem)

### Klasický `for` (máš index)

```java
for (int i = 0; i < a.length; i++) {
    System.out.println("i=" + i + " hodnota=" + a[i]);
}
```

### `foreach` (bez indexu)

```java
for (int hodnota : a) {
    System.out.println(hodnota);
}
```

⚠️ Důležité: `foreach`  **nemění pole** , když změníš proměnnou `hodnota`

```java
for (int hodnota : a) {
    hodnota = 0; // mění se jen lokální proměnná, ne pole
}
```

---

## 8) Kopie vs. druhá reference (nejčastější záludnost)

```java
int[] a = {1, 2, 3};
int[] b = a;     // b není kopie, jen další odkaz na stejné pole
b[0] = 99;

System.out.println(a[0]); // 99 (změnilo se i a)
```

**Skutečná kopie** se bez `Arrays` dělá cyklem:

```java
int[] a = {1, 2, 3};
int[] b = new int[a.length];

for (int i = 0; i < a.length; i++) {
    b[i] = a[i];
}
```

---

## 9) Pole referencí (např. `String[]`)

U primitiv (`int[]`) jsou uvnitř přímo čísla.
U `String[]` jsou uvnitř  **reference na Stringy** .

```java
String[] names = {"Eva", "Petr"};
names[0] = "Karel"; // přepíšeš referenci na jiný String
```

---

## 10) Dvourozměrné pole `int[][]` (2D)

V Javě není “pravá matice” jako v C — je to  **pole polí** :

* `m` je pole řádků
* každý `m[i]` je 1D pole (řádek)

```java
int[][] m = new int[3][4]; // 3 řádky, 4 sloupce
m[0][0] = 10;
```

### Délky:

* počet řádků: `m.length`
* počet sloupců v řádku i: `m[i].length`

### Procházení 2D:

```java
for (int i = 0; i < m.length; i++) {          // řádky
    for (int j = 0; j < m[i].length; j++) {   // sloupce
        System.out.print(m[i][j] + " ");
    }
    System.out.println();
}
```

---

## 11) “Zubaté” (jagged) 2D pole

Protože je to pole polí, řádky mohou mít různou délku:

```java
int[][] jag = new int[3][];
jag[0] = new int[2];
jag[1] = new int[5];
jag[2] = new int[1];
```

⚠️ Dokud řádek nevytvoříš, je `null`:

```java
int[][] a = new int[2][];
System.out.println(a[0]); // null
```

---

## 12) Shrnutí (co si pamatovat)

* pole je **pevně dlouhé**
* indexy jsou **od 0**
* `length` je **vlastnost**
* pole je **objekt** → proměnná drží **referenci**
* `b = a` není kopie
* `int[][]` je  **pole polí** , může být “zubaté”
