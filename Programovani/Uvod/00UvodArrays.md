
# Třída `java.util.Arrays`

```java
package java.util;

public final class Arrays {
  private Arrays() {} // utility třída – neinicializuje se
}
```

* **Final** utility třída se **statickými** metodami pro práci s poli (`T[]` i primitiva).
* Řeší: řazení, vyhledávání, kopírování, plnění, konverze na `List`, streamy, porovnání, hash, hluboké operace u vnořených polí atd.
* Pozn.: některé operace mají **overload** pro každý primitivní typ i pro `Object[]`.

## Rychlá navigace metod (podle témat)

* **Konverze/iterace:** `asList`, `stream`, `spliterator`, `toString`, `deepToString`
* **Porovnání/hash:** `equals`, `deepEquals`, `hashCode`, `deepHashCode`, *(9+)* `compare`, `mismatch`
* **Kopie/řezy:** `copyOf`, `copyOfRange`
* **Plnění/generování:** `fill`, `setAll`, `parallelSetAll`, `parallelPrefix`
* **Řazení:** `sort`, `parallelSort`
* **Vyhledávání:** `binarySearch`

## 1) Konverze a iterace

### `asList`

```java
static <T> List<T> asList(T... a)
```

* Vytvoří **fixně velký** seznam zálohovaný původním polem (změna prvku v listu změní pole a naopak). `add/remove` → `UnsupportedOperationException`.
* Pozor na **primitiva**: `Arrays.asList(new int[]{1,2})` dá `List<int[]>` o jednom prvku. Pro „seznam Integerů“ použij `IntStream.of(arr).boxed().toList()` (J16+) / `collect`.

**Příklad**

```java
String[] a = {"A","B","C"};
List<String> list = Arrays.asList(a);
list.set(1, "X");
System.out.println(Arrays.toString(a)); // [A, X, C]
```

### `stream`

```java
static <T> Stream<T> stream(T[] array)
static <T> Stream<T> stream(T[] array, int startInclusive, int endExclusive)
static IntStream    stream(int[] array)      // obdobně long/double
static IntStream    stream(int[] array, int start, int end)
```

**Příklad**

```java
int sum = Arrays.stream(new int[]{1,2,3,4}).sum(); // 10
```

### `spliterator`

```java
static <T> Spliterator<T> spliterator(T[] array)
static <T> Spliterator<T> spliterator(T[] array, int start, int end)
static Spliterator.OfInt  spliterator(int[] array) // + long/double
```

* Užitečné pro pokročilé iterace / vlastní streamy.

### `toString` / `deepToString`

```java
static String toString(int[] a)      // overloady pro všechna primitiva + Object[]
static String deepToString(Object[] a)
```

* `toString` neřeší hezky **vnořená pole**; `deepToString` ano.

**Příklad**

```java
Object[] nested = { new int[]{1,2}, new String[]{"A","B"} };
System.out.println(Arrays.toString(nested));     // "[[I@..., [Ljava.lang.String;@...]"
System.out.println(Arrays.deepToString(nested)); // "[[1, 2], [A, B]]"
```

## 2) Porovnání a hash

### `equals` / `deepEquals`

```java
static boolean equals(int[] a, int[] b)      // overloady pro primitiva + Object[]
static boolean deepEquals(Object[] a1, Object[] a2)
```

* `equals` srovnává **po prvcích** (mělké).
* `deepEquals` porovnává **rekurzivně** vnořené struktury.

**Příklad**

```java
Object[] x = { new int[]{1,2}, "A" };
Object[] y = { new int[]{1,2}, "A" };
System.out.println(Arrays.equals(x, y));     // false (odlišné odkazy na int[])
System.out.println(Arrays.deepEquals(x, y)); // true (obsah shodný rekurzivně)
```

### `hashCode` / `deepHashCode`

```java
static int hashCode(int[] a)          // overloady pro primitiva + Object[]
static int deepHashCode(Object[] a)
```

* Vytváří hash vhodný do hash struktur; `deepHashCode` odpovídá `deepEquals`.

### *(Java 9+)* `compare` a `mismatch`

```java
// objektová pole
static <T> int compare(T[] a, T[] b, Comparator<? super T> cmp)
static <T> int compare(T[] a, T[] b) // přirozené pořadí (T musí být Comparable)

// primitivní pole – pro každý typ
static int compare(int[] a, int[] b)     // lexikograficky

// mismatch – první index, kde se pole liší; -1 pokud shodná
static <T> int mismatch(T[] a, T[] b, Comparator<? super T> cmp)
static <T> int mismatch(T[] a, T[] b)
static int mismatch(int[] a, int[] b)    // + long/double/byte/...
```

* **`compare`**: lexikografické porovnání (délka rozhoduje, když prefix shodný).
* **`mismatch`**: rychlý způsob zjistit **první rozdíl**.

**Příklad**

```java
int r = Arrays.compare(new int[]{1,2,3}, new int[]{1,2,4}); // < 0
int i = Arrays.mismatch(new int[]{1,2,3}, new int[]{1,2,9}); // 2
```

## 3) Kopie a řezy

### `copyOf` / `copyOfRange`

```java
static int[] copyOf(int[] original, int newLength)  // + všechny typy + <T> T[] copyOf(T[], int)
static int[] copyOfRange(int[] original, int from, int to)
```

* `copyOf` umí **zkrátit/rozšířit** (nová místa vyplní defaultem typu).
* `copyOfRange` kopíruje **[from, to)**.

**Příklad**

```java
int[] a = {1,2,3};
int[] b = Arrays.copyOf(a, 5);         // [1,2,3,0,0]
int[] c = Arrays.copyOfRange(a, 1, 3); // [2,3]
```

## 4) Plnění a generování hodnot

### `fill`

```java
static void fill(int[] a, int val)              // + Object[] i ostatní primitiva
static void fill(int[] a, int from, int to, int val)
```

**Příklad**

```java
int[] a = new int[4];
Arrays.fill(a, 7);                // [7,7,7,7]
Arrays.fill(a, 1, 3, 9);          // [7,9,9,7]
```

### `setAll` / `parallelSetAll`

```java
static <T>   void setAll(T[] array, IntFunction<? extends T> generator)
static       void setAll(int[] array, IntUnaryOperator generator)     // + long/double
static <T>   void parallelSetAll(T[] array, IntFunction<? extends T> generator)
static       void parallelSetAll(int[] array, IntUnaryOperator generator)
```

* Naplní pole hodnotami z funkce podle **indexu**; `parallelSetAll` může využít paralelizaci.

**Příklad**

```java
int n = 6;
int[] fib = new int[n];
Arrays.setAll(fib, i -> (i < 2) ? i : fib[i-1] + fib[i-2]); // závislost na předchozích ok
System.out.println(Arrays.toString(fib)); // [0,1,1,2,3,5]
```

### `parallelPrefix`

```java
static void parallelPrefix(int[] array, IntBinaryOperator op)               // + long/double
static <T> void parallelPrefix(T[] array, BinaryOperator<T> op)
```

* Aplikuje **skládání (prefix scan)**: `a[i] = op(a[i-1], a[i])` (paralelně).

**Příklad (běžící součet)**

```java
int[] a = {1,2,3,4};
Arrays.parallelPrefix(a, Integer::sum);
System.out.println(Arrays.toString(a)); // [1,3,6,10]
```

## 5) Řazení

### `sort`

```java
static void sort(int[] a)                          // + long/double/… a Object[]
static void sort(int[] a, int from, int to)
static <T> void sort(T[] a)                        // přirozené pořadí (Comparable)
static <T> void sort(T[] a, Comparator<? super T> c)
static <T> void sort(T[] a, int from, int to, Comparator<? super T> c)
```

* `Object[]` používá **stabilní** TimSort.
* Primitiva používají vysoce optimalizované nestabilní algoritmy (dual-pivot quicksort apod.).
* Řaď vždy v **tom samém pořadí**, které použiješ pro `binarySearch`.

**Příklad**

```java
String[] names = {"Eva","Adam","Bára"};
Arrays.sort(names);                     // [Adam, Bára, Eva]

record P(String jmeno, int vek) {}
P[] ps = { new P("A", 30), new P("B", 20) };
Arrays.sort(ps, Comparator.comparingInt(P::vek)); // podle věku
```

### `parallelSort`

```java
static void parallelSort(int[] a)           // + long/double/… a Object[]
static void parallelSort(int[] a, int from, int to)
static <T> void parallelSort(T[] a)
static <T> void parallelSort(T[] a, Comparator<? super T> c)
```

* Paralelní varianta pro **velká pole** (využívá fork-join pool).

## 6) Vyhledávání

### `binarySearch`

```java
static int binarySearch(int[] a, int key)                     // + long/double/… a Object[]
static int binarySearch(int[] a, int from, int to, int key)
static <T> int binarySearch(T[] a, T key)                     // Comparable
static <T> int binarySearch(T[] a, T key, Comparator<? super T> c)
static <T> int binarySearch(T[] a, int from, int to, T key, Comparator<? super T> c)
```

* Požaduje **seřazené** pole dle stejného porovnání.
* Vrací index nalezeného prvku, nebo **`-(insertionPoint) - 1`**, když není.

**Příklad**

```java
int[] a = {1,3,5,9};
int i1 = Arrays.binarySearch(a, 5); // 2
int i2 = Arrays.binarySearch(a, 4); // -3  (insertionPoint = 2)
```

## 7) Metody třídy System
### `arraycopy`
```java
public static native void arraycopy(Object src, int srcPos, Object dest, int destPos, int length);
```

* Nativní metoda pro **kopírování bloků** mezi poli (i různých typů, pokud je to kompatibilní).
* Velmi rychlá, často využívaná v implementacích jiných metod (např. `copyOf`). O((log n) režie).
* Pozor na **překrytí** (zdroj a cíl jsou stejný objekt) – v tom případě se chová jako by se nejdříve zkopírovalo do dočasného bufferu.

**Příklad**

```java
int[] src = {1, 2, 3, 4, 5};
int[] dest = new int[5];
System.arraycopy(src, 0, dest, 0, src.length);
System.out.println(Arrays.toString(dest)); // [1, 2, 3, 4, 5]
```

## Praktické poznámky a časté záludnosti

* **`asList` není `ArrayList`:** měnit velikost nelze; pro měnitelný list udělej např. `new ArrayList<>(Arrays.asList(a))`.
* **Primitiva vs. objektová pole:** spousta metod má separátní overloady. `asList` s primitivy často překvapí.
* **Stabilita řazení:** u `Object[]` je `sort` **stabilní**, u primitiv **není**.
* **`deep*` metody** používej pro vnořená pole (`Object[]`, které obsahuje další pole).
* **`compare`/`mismatch` (J9+):** super pro lexikografii a rychlou detekci rozdílu.
* **Výkon:** pro velká pole zvaž `parallelSort`, `parallelSetAll`, `parallelPrefix`. Měj ale na paměti režii paralelizace.

## Mini-ukázka „od všeho trochu“

```java
import java.util.*;
import java.util.stream.*;

public class ArraysDemo {
  public static void main(String[] args) {
    // 1) Kopie/řezy
    int[] a = {3,1,4,1,5,9};
    int[] b = Arrays.copyOfRange(a, 2, 5);           // [4,1,5]

    // 2) Řazení + binarySearch
    Arrays.sort(a);                                   // [1,1,3,4,5,9]
    int idx = Arrays.binarySearch(a, 4);              // 3

    // 3) Plnění/generování
    int[] ones = new int[5];
    Arrays.fill(ones, 1);                             // [1,1,1,1,1]
    int[] squares = new int[6];
    Arrays.setAll(squares, i -> i*i);                 // [0,1,4,9,16,25]

    // 4) Streamy
    int sumSquares = Arrays.stream(squares).sum();    // 55

    // 5) Porovnání/mismatch (J9+)
    int pos = Arrays.mismatch(a, new int[]{1,1,3,4,0,9}); // 4

    // 6) Deep operace
    Object[] nested = { new int[]{1,2}, new String[]{"A","B"} };
    System.out.println(Arrays.deepToString(nested));  // [[1, 2], [A, B]]

    System.out.println("a=" + Arrays.toString(a));
    System.out.println("b=" + Arrays.toString(b));
    System.out.println("idx=" + idx + ", sumSquares=" + sumSquares + ", mismatch=" + pos);
  }
}
```
