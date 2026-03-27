# Generický typ: třídy a metody

**Genericita** je schopnost třídy nebo metody pracovat s různými datovými typy, přičemž typ je určen až při použití (instanciaci). V Javě se genericita používá hlavně u kolekcí a utilitních tříd.

## Proč genericita

* **Typová bezpečnost**: chyba se chytí při překladu, ne až za běhu.
* **Bez přetypování**: žádné `(String)` apod.
* **Znovupoužitelnost**: jeden kód pro různé typy.

## Syntaxe

* Parametrizace typem: `class Box<T> { ... }`, `static <T> T first(List<T> xs) { ... }`
* Vytvoření instance: `Box<String> bs = new Box<>("Ahoj");`
* Více parametrů: `class Pair<A,B> { ... }`
* Více ohraničení: `<T extends Number & Comparable<T>>`
* Wildcards (zástupné znaky): `List<?>`, `List<? extends Number>`, `List<? super Integer>`

## Sémantika

* Generika jsou **kompilátorová kontrola** – za běhu jsou typy vymazány (type erasure).
* `List<String>` a `List<Integer>` jsou za běhu oba jen `List`.
* Nelze vytvářet instance generických typů: `new T()` ani `new T[10]`.
* Nelze použít primitiva: `List<int>` → použij `List<Integer>`.
* Statické členy nejsou „generické“ podle `T` třídy.
* Variance kolekcí je **invariantní**: `List<Number>` **není** nadtyp `List<Integer>`. Řeší se wildcards.

## Jmenná konvence pro typové parametry

* `T` – typ (Type)
* `E` – prvek (Element, např. v kolekci)
* `K`, `V` – klíč, hodnota (Key, Value, např. v mapě)
* `N` – číslo (Number)

## Generická třída

```java
class Box<T> {
    private T value;
    public Box(T value) { this.value = value; }
    public T get() { return value; }
    public void set(T value) { this.value = value; }
}

Box<String> bs = new Box<>("Ahoj");
String s = bs.get();   // žádný cast
```

## Generická metoda (nezávislá na třídě)

```java
class Utils {
    public static <T> T first(List<T> xs) { return xs.get(0); }
}

Integer i = Utils.first(List.of(1,2,3));
```

## Inference + diamond

```java
Map<String, Integer> m = new HashMap<>(); // ◇ „diamond“
```

## Vlastnosti a omezení generiky

* **Vymazání typů (type erasure)**: `List<String>` a `List<Integer>` jsou za běhu oba jen `List`.
* Nelze: `new T()`, `T[] a = new T[10]`, `if (x instanceof List<String>)`.
* Nelze použít primitiva: `List<int>` → použij `List<Integer>`.
* Statické členy nejsou „generické“ podle `T` třídy.
* Parametry mohou mít **horní/dolní ohraničení** (viz níže).

## Ohraničení generického typu

### Horní ohraničení (`extends`)

„`T` musí být potomkem/implementací …“

```java
class Measure<T extends Number> {
    T x;
    double doubleValue() { return x.doubleValue(); }
}
```

Vícenásobné (intersection) ohraničení:

```java
<T extends Number & Comparable<T> & Serializable>
```

### Dolní ohraničení (`super`)

Používá se u **wildcards** (zástupných znaků): „musí být předek“ – viz `? super X` níže.

## Zástupné znaky (wildcards)

### Základ

* `?` = nějaký (neznámý) typ.
* Variance kolekcí v Javě je **invariantní**: `List<Number>` **není** nadtyp `List<Integer>`. Řeší se wildcards.

### Horní ohraničení `? extends T` (producent)

* Číst lze bezpečně jako `T` (resp. jeho předek), **zapisovat nejde** (kromě `null`).
* Mnemotechnika **PECS**: *Producer Extends*.

```java
double sum(List<? extends Number> xs) {
    double s = 0;
    for (Number n : xs) s += n.doubleValue();
    return s;
}
```

### Dolní ohraničení `? super T` (konzument)

* Lze bezpečně **vkládat** hodnoty typu `T` (nebo jeho podtypu), číst jen jako `Object`.
* *Consumer Super*.

```java
void addAllIntegers(List<? super Integer> dst, List<Integer> src) {
    for (Integer i : src) dst.add(i);    // OK
    // Integer x = dst.get(0);           // Ne – typ je jen Object
}
```

### Kdy wildcard a kdy vlastní typový parametr

* Wildcard (`? extends/super`) je skvělý pro **parametry metod** (jen brát/přidávat).
* V **návratových typech** a u **vnitřního stavu tříd** preferuj **pojmenovaný typový parametr** (`<T>`), ať je kód čitelný.

### „Capture helper“ (řešení PECS patové situace)

Někdy je třeba pomocná generická metoda, aby se „zachytil“ konkrétní typ `?`.

```java
static void swapFirstTwo(List<?> list) {
    swapHelper(list);
}
private static <T> void swapHelper(List<T> list) {
    T a = list.get(0);
    list.set(0, list.get(1));
    list.set(1, a);
}
```

## `Comparable<E>` vs `Comparator<E>`

### Comparable (přirozené řazení)

* Rozhraní na **třídě samotné**.
* Signatura: `interface Comparable<T> { int compareTo(T o); }`
* **Kontrakt**: antisymetrie, tranzitivita, konzistence s `equals` (doporučeno).
* Používají ho `Collections.sort`, `TreeSet`, `TreeMap` jako „natural order“.

```java
class Person implements Comparable<Person> {
    String last, first;
    @Override public int compareTo(Person o) {
        int c = last.compareTo(o.last);
        return (c != 0) ? c : first.compareTo(o.first);
    }
}

List<Person> people = new ArrayList<>(List.of(
    new Person("Novák", "Adam"),
    new Person("Novák", "Berta")
));
Collections.sort(people); // podle compareTo
```

### Comparator (externí strategie porovnání)

* **Odděleně od třídy**, můžeš jich mít víc (různá kritéria).
* Signatura: `interface Comparator<T> { int compare(T a, T b); }`
* **Funkční rozhraní** – snadno tvoříš lambdou, method reference.
* Kombinátory: `thenComparing`, `reversed`, `nullsFirst`, `comparingInt`…

```java
record Car(String brand, int year) {}

Comparator<Car> byYearDesc = Comparator.comparingInt(Car::year).reversed();
Comparator<Car> byBrandThenYear =
    Comparator.comparing(Car::brand).thenComparingInt(Car::year);

var cars = new ArrayList<>(List.of(
    new Car("Škoda", 2020), new Car("Audi", 2018), new Car("Škoda", 2015)
));
cars.sort(byBrandThenYear);
```

### Kdy co použít

* **`Comparable`**: přirozené, jediné výchozí řazení (např. `String`, `Integer`, datum).
* **`Comparator`**: více různých řazení, tříd třetích stran, nebo když **nemůžeš/nesmíš** měnit modelovou třídu.

### `TreeSet` / `TreeMap`

* Pokud třída **není `Comparable`**, musíš dodat `Comparator`.
* **Pozor**: rovnost v setu/mapě je dána „=0“ v porovnání (ne `equals`).

```java
TreeSet<Car> set = new TreeSet<>(byBrandThenYear);
set.addAll(cars);
```

## Praktické vzory s generikou

### Kopírování s PECS

```java
static <T> void copy(List<? super T> dst, List<? extends T> src) {
    for (T x : src) dst.add(x);
}

copy(new ArrayList<Number>(), List.of(1,2,3)); // OK: dst super Number, src extends Number
```

### Maximum s horním ohraničením

```java
static <T extends Comparable<? super T>> T max(Collection<? extends T> xs) {
    Iterator<? extends T> it = xs.iterator();
    T best = it.next();
    while (it.hasNext()) {
        T x = it.next();
        if (x.compareTo(best) > 0) best = x;
    }
    return best;
}
```

> Vzor `Comparable<? super T>` zajišťuje, že porovnání jde i přes nadtyp.

### Generické továrny a static helpers

```java
class Pair<A,B> {
    final A a; final B b;
    private Pair(A a, B b) { this.a = a; this.b = b; }
    public static <A,B> Pair<A,B> of(A a, B b) { return new Pair<>(a,b); }
}
var p = Pair.of(1, "x");
```

### Bezpečné čtení vs. zápis

```java
// čtu Number → extends
double avg(List<? extends Number> xs) { /* ... */ }

// zapisuji Integer → super
void fillZeros(List<? super Integer> xs, int n) {
    for (int i=0; i<n; i++) xs.add(0);
}
```

## Časté chyby a jak se jim vyhnout

* **Raw typy**: `List l = new ArrayList();` → ztrácí se typová kontrola, používej vždy `List<?>` nebo `List<T>`.
* **Arrays vs. generics**: pole jsou **kovariantní** (nebezpečné), generika **invariantní**. Vyhýbej se `T[]` – raději `List<T>`.
* **Erasure pasti**: přetížení metod, které se liší jen typovým parametrem, může kolidovat po vymazání. Přidej různé signatury.
* **`equals` vs `compareTo`**: drž je v **souladu**, jinak `TreeSet`/`TreeMap` budou působit „ztrátu“ prvků.
