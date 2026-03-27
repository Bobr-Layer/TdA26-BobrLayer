
# Pole – datová struktura

**Pole** je souvislý (kontinuální) blok paměti obsahující **pevný počet** prvků stejného typu. Prvky jsou uloženy **za sebou** a přístupné **indexem od 0**. Díky tomu má náhodný přístup **O(1)**.

## Klíčové vlastnosti

* **Pevná velikost:** počet prvků se určuje při vytvoření a nejde změnit (v Javě `new int[10]`).
* **Homogennost typů:** všechny prvky mají stejný typ (v Javě buď primitivní, nebo odkazy).
* **Kontinuální uložení:** v paměti jsou za sebou → skvělá **cache lokalita** a rychlé sekvenční průchody.
* **Indexovaný přístup O(1):** `a[i]` se přepočítá na adresu `base + i * sizeof(T)`.
* **Kopírování je nákladné:** změna velikosti znamená vytvořit nové pole a data **zkopírovat**.
* **Bezpečnost indexů:** v Javě probíhá **kontrola mezí** (vyhodí `ArrayIndexOutOfBoundsException`).
* **Defaultní hodnoty (Java):** `0`, `false`, `\u0000` nebo `null` pro referenční typy.
* **Délka v poli (Java):** dostupná přes **`a.length`** (konstanta pro danou instanci).

## Časové a paměťové složitosti (Big-O)

| Operace                  | Složitost | Poznámka                                       |
| ------------------------ | --------: | ---------------------------------------------- |
| Přístup `a[i]`           |  **O(1)** | Přímý výpočet adresy                           |
| Změna `a[i]=x`           |  **O(1)** | Přímý zápis                                    |
| Lineární vyhledávání     |      O(n) | Bez řazení jinak nelze                         |
| Vložení/mazání uprostřed |      O(n) | Nutné přesouvat prvky                          |
| Rozšíření kapacity       |      O(n) | Kopie do nového většího pole                   |
| Paměť                    |      O(n) | Kontinuální blok + overhead objektu pole v JVM |

## Pole v Javě – specifika a idiomy

* **Deklarace a vytvoření**

  ```java
  int[] a = new int[5];           // [0,0,0,0,0]
  String[] names = {"Ada","Linus"};
  ```
* **Délka a průchod**

  ```java
  for (int i = 0; i < a.length; i++) { /* ... */ }
  for (String s : names) { /* enhanced for */ }
  ```
* **Kopírování a vyplnění**

  ```java
  int[] b = Arrays.copyOf(a, 10);                     // změna „velikosti“ = nové pole
  System.arraycopy(a, 0, b, 2, a.length);             // rychlé blokové kopírování
  Arrays.fill(a, 42);                                  // hromadné vyplnění
  ```
* **Multidimenzionální vs. „zubatá“ pole**

  ```java
  int[][] m = new int[3][4];       // 3 řádky × 4 sloupce
  int[][] jag = { {1,2}, {3,4,5} }; // zubaté: řádky různých délek
  ```
* **Primitiva vs. reference:** `int[]` drží hodnoty, `String[]` drží **reference** (může obsahovat `null`).
* **Kovariance polí:** `Number[] x = new Integer[3];` je **povoleno**, ale může vést ke **`ArrayStoreException`** při zápisu jiného typu (`Double`). U generik (`List<Number>`) by to neprošlo – pozor na to.
* **Porovnávání:** `a.equals(b)` porovná **identitu** pole, ne obsah; pro obsah použij:

  ```java
  Arrays.equals(a, b);         // 1D
  Arrays.deepEquals(a2d, b2d); // vícerozměrná/reference
  ```

## Kdy je pole správná volba

* Potřebujete **maximální výkon** při náhodném přístupu a sekvenčním průchodu.
* Znáte **velikost předem** (nebo je malá a fixní).
* Záleží na **paměťové efektivitě** (menší režie než dynamické struktury).
* Implementujete nízkoúrovňové struktury (např. vlastní **haldu**, **hash tabulku**).

## Kdy zvolit raději kolekce (např. `ArrayList`)

* Když se **velikost mění** a nechcete řešit kopírování a správu kapacity.
* Potřebujete pohodlné metody (`add`, `remove`, `contains`, iterátory…).
* Pracujete s API, které očekává **`List`**/**`Collection`**.

## Časté vzory a tipy

* **Imutabilní „snapshot“:** vytvořte kopii pole a dál ji neměňte (`Arrays.copyOf`).
* **Řazení:** `Arrays.sort(a)`; s komparátorem pro reference `Arrays.sort(arr, Comparator.comparing(...))`.
* **Binární hledání:** `Arrays.binarySearch(a, key)` – pouze na **seřazeném** poli.
* **Balík utility `java.util.Arrays`:** `fill`, `copyOf`, `setAll`, `stream`, `toString`/`deepToString`.
* **Výkon:** preferujte **sekvenční průchody** a **blokové operace** (`arraycopy`); minimalizujte náhodné přesuny.

## Mini-příklady

```java
// 1) Zvětšení pole (idiom)
int[] a = {1,2,3};
a = Arrays.copyOf(a, a.length * 2); // [1,2,3,0,0,0]

// 2) Rychlé počítání frekvencí 0..k (počítací pole)
int k = 10;
int[] cnt = new int[k+1];
for (int v : new int[]{1,3,3,10}) cnt[v]++;

// 3) „Zubaté“ pole – trojúhelník
int n = 4;
int[][] tri = new int[n][];
for (int i = 0; i < n; i++) {
  tri[i] = new int[i+1];
}
```

## Shrnutí

* **Pole = nejjednodušší a nejrychlejší sekvenční kontejner** s pevným rozměrem a O(1) přístupem indexem.
* V Javě má bezpečné hlídání mezí, výchozí hodnoty a bohaté utility v `Arrays`.
* Pokud potřebujete **měnit velikost** a komfortní API, sahněte po **`ArrayList`**; pokud chcete **max výkon** a **fixní velikost**, zůstaňte u polí.

