# Podprogramy (metody) v Javě

Podprogramy (funkce, metody, procedury) jsou pojmenované bloky kódu, které vykonávají konkrétní úkol. V Javě jsou podprogramy implementovány jako **metody** uvnitř tříd.

* **Modularita & čitelnost:** rozdělení problému na menší pojmenované části.
* **Znovupoužitelnost (DRY):** jeden kus kódu na více místech.
* **Abstrakce:** skryjí implementační detaily (API).
* **Testovatelnost:** menší jednotky = snazší testy.
* **Údržba:** změna na jednom místě se projeví všude.
* **Výkon/organizace:** lokální proměnné na zásobníku, řízená správa zdrojů (try-with-resources, finally).

## Základní typy podprogramů (s příklady využití)

* **Procedura** (v Javě metoda `void`): provede akci, nic nevrací.
  *Využití:* logování, I/O, kreslení GUI.

  ```java
  void log(String msg){ System.out.println(msg); }
  ```

* **Funkce** (v Javě metoda s návratovou hodnotou): výpočet → návrat.
  *Využití:* matematika, transformace dat.

  ```java
  int abs(int x){ return x < 0 ? -x : x; }
  ```

### Typy metod podle dalších vlastností

* **Instanční metoda:** pracuje se stavem objektu (`this`).
  *Využití:* chování konkrétní instance.
* **Statická metoda (`static`):** nevyžaduje instanci, utilita/továrna.
  *Využití:* `Math.max`, parsery, validátory.
* **Konstruktor:** speciální „podprogram“ pro vytvoření a inicializaci objektu.
  *Využití:* nastavení povinných polí, invarianty.
* **Přetížená metoda:** stejné jméno, jiné parametry.
  *Využití:* pohodlné API (různé vstupy).
* **Rekurzivní metoda:** volá sama sebe.
  *Využití:* stromy, prohledávání, dělení a panuj.
* **Vyššího řádu (předávání funkcí):** v Javě přes **lambda**/**funkční rozhraní**.
  *Využití:* třídění s komparátorem, map/filter/reduce.
* **Generická metoda:** pracuje s typovými parametry.
  *Využití:* kolekce, utilitní funkce bez duplikace kódu.
* **Varargs:** proměnný počet argumentů.
  *Využití:* `printf`, agregace hodnot.

## Vytvoření a volání metod v Javě

```java
public class Utils {
    // 1) Statická „funkce“ – nepotřebuje instanci
    public static int sum(int... nums) {      // varargs
        int s = 0;
        for (int n : nums) s += n;
        return s;
    }

    // 2) Instanční metoda – pracuje se stavem objektu
    private final List<Integer> data = new ArrayList<>();
    public void add(int x) {                  // procedura (void)
        data.add(x);
    }
    public double average() {                 // funkce (vrací hodnotu)
        if (data.isEmpty()) return 0.0;
        return data.stream().mapToInt(i->i).average().orElse(0.0);
    }

    // 3) Přetížení: stejné jméno, jiné parametry
    public static String join(String sep, String... parts) {
        return String.join(sep, parts);
    }
    public static String join(List<String> parts) {
        return String.join(", ", parts);
    }

    // 4) Generická metoda
    public static <T> List<T> repeat(T value, int times) {
        List<T> out = new ArrayList<>(times);
        for (int i = 0; i < times; i++) out.add(value);
        return out;
    }

    // 5) Rekurze: faktoriál
    public static long fact(int n) {
        if (n < 0) throw new IllegalArgumentException("n>=0");
        return (n <= 1) ? 1 : n * fact(n - 1);
    }

    // 6) Vyššího řádu: přijmu „funkci“ (lambda)
    public static <T,R> List<R> map(List<T> xs, java.util.function.Function<T,R> f) {
        List<R> out = new ArrayList<>(xs.size());
        for (T x : xs) out.add(f.apply(x));
        return out;
    }

    // 7) Konstruktor
    public Utils() { /* případná inicializace */ }
}

class Demo {
    public static void main(String[] args) {
        // Volání statických metod
        System.out.println(Utils.sum(1,2,3));                    // 6
        System.out.println(Utils.join(" / ", "A","B","C"));      // "A / B / C"
        System.out.println(Utils.repeat("X", 3));                // [X, X, X]
        System.out.println(Utils.fact(5));                       // 120

        // Volání instančních metod
        Utils u = new Utils();         // konstruktor
        u.add(10); u.add(20);          // volání procedury
        System.out.println(u.average());                       // 15.0

        // Vyššího řádu (lambda)
        var squared = Utils.map(List.of(1,2,3), x -> x*x);
        System.out.println(squared);                           // [1, 4, 9]
    }
}
```

## Signature (hlavička) metody

```java
[modifikátory] návratový_typ jméno([parametry]) [throws výjimky]
```

* **Modifikátory přístupu:** Určují viditelnost a chování metody.
  * `public` - viditelná všude,
  * `private` - viditelná pouze v rámci třídy,
  * `protected` - viditelná v rámci balíčku a podtříd,
* **Další modifikátory:** Ovlivňují vlastnosti metody.
  * `static` - metoda patří třídě, ne instanci,
  * `final` - metoda nemůže být přepsána,
  * `abstract` - metoda bez implementace (pouze v abstraktní třídě).
* **Návratový typ:** typ vrácené hodnoty, nebo `void` (žádná hodnota).
* **Jméno:** identifikátor metody (konvence: camelCase).
* **Parametry:** seznam `typ jméno`, oddělených čárkou (může být prázdný).
* **`throws`** (volitelné): výjimky, které metoda může vyvolat.

## Parametry v Javě (co se opravdu děje)

> **Java vždy předává parametry hodnotou** („pass-by-value“). U objektů se hodnotou předává **reference** na objekt.

* **Primitiva** (`int`, `double`…): kopie hodnoty → změny uvnitř metody se **neprojeví** venku.
* **Objekty**: kopie *reference* → změna **stavu objektu** uvnitř metody je **viditelná**, ale přesměrování reference **není**.

```java
class Box { int v; Box(int v){ this.v=v; } }

static void setToZero(int x) { x = 0; }                // primitivum
static void mutate(Box b)       { b.v = 0; }           // změna stavu objektu
static void reassign(Box b)     { b = new Box(999); }  // přepsání reference (jen lokálně)

public static void main(String[] a){
    int n = 42;
    setToZero(n);
    System.out.println(n);          // 42 (beze změny)

    Box b = new Box(5);
    mutate(b);
    System.out.println(b.v);        // 0 (stav změněn)

    reassign(b);
    System.out.println(b.v);        // 0 (stále původní objekt; reassign se ven nepropsal)
}
```

Tady je rychlé, ale přesné vysvětlení pojmů **formální** vs. **skutečné** parametry – s ukázkami v Javě.

## Formální vs. skutečné parametry

* **Formální parametry (parameters)**
  Jména a typy uvedené **v definici metody**. Jsou to „proměnné“ platné **uvnitř** metody.

  ```java
  // a, b jsou FORMÁLNÍ parametry
  static int add(int a, int b) { 
      return a + b; 
  }
  ```

* **Skutečné parametry** = argumenty (arguments)
  **Konkrétní hodnoty/výrazy** použité **při volání** metody. Musí odpovídat počtem, pořadím a kompatibilními typy.

  ```java
  int s = add(2, 3);       // 2 a 3 jsou SKUTEČNÉ parametry (argumenty)
  int x = add(1+1, s*2);   // i výrazy mohou být argumenty
  ```

## Jak se párují v Javě

1. **Pořadím** (Java nemá pojmenované argumenty).
2. **Typovou kompatibilitou** (případně konverze: widening, boxing/unboxing, až pak varargs).
3. **Přetížení (overload resolution)** vybírá nejvhodnější signaturu.

```java
static void f(long x) {}
static void f(Integer x) {}
static void f(int... xs) {}

f(5);        // preferuje f(int->long) před boxingem a před varargs
```

## Varargs (proměnný počet argumentů)

Formální parametr má tvar `T...`. Při volání můžeš předat 0..N argumentů nebo pole `T[]`.

```java
static int sum(int... xs){
    int s=0; for(int x: xs) s+=x; return s;
}
sum();            // 0
sum(1,2,3);       // 6
sum(new int[]{4,5});
```

## Nejčastější chyby a tipy

* **Záměna pojmů:** „parametr“ (formální) vs. „argument“ (skutečný).
* **Nečekané změny stavu:** u objektů se mění **obsah**, i když se předává „hodnotou“ (reference). Používej **neměnné** typy nebo kopie, když nechceš side-effects.
* **Pořadí a arita:** Java nepodporuje **pojmenované** ani **defaultní argumenty** → používej **přetížení** nebo **builder**.
* **Overload pasti:** výraz `null` je nejednoznačný mezi referenčními typy; někdy pomůže přetypování.

## Mini-příklad komplet

```java
class MathUtil {
    // formální parametry: a, b
    static int pow(int a, int b) {           // a^b
        int r = 1;
        for (int i = 0; i < b; i++) r *= a;
        return r;
    }

    static int max(int... xs) {              // formální param: xs (varargs)
        int m = Integer.MIN_VALUE;
        for (int x : xs) m = Math.max(m, x);
        return m;
    }
}

class Demo {
    public static void main(String[] args) {
        int base = 2, exp = 3;
        int r1 = MathUtil.pow(base, exp);       // skutečné: base, exp
        int r2 = MathUtil.pow(3, 4);            // skutečné: 3, 4
        int m  = MathUtil.max(5, 9, -1, 7);     // skutečné: 5, 9, -1, 7
        System.out.println(r1 + " " + r2 + " " + m);
    }
}
```

## Praktické tipy k parametrům

* Chceš „vrátit víc hodnot“? Vrať **objekt/record** nebo použij **out** kolekci.
* „Volitelné parametry“ v Javě: **přetížení**, **builder pattern** nebo **`Optional`** pro návrat.
* U rozhraní API preferuj **neměnné objekty** (nižší riziko vedlejších efektů).
* Zvaž **`varargs`** pro pohodlné předávání mnoha položek.

## Typické případy použití

* **Utility** (formátování, validace, parsování): statické metody.
* **Doménová logika**: instanční metody na entitách/value objektech.
* **Algoritmy**: čisté funkce (bez vedlejších efektů), snadno testovatelné.
* **Kolekce/práce s daty**: map/filter/reduce (Streams), komparátory, predikáty.
* **Rekurze**: průchod stromy (AST, DOM), DFS/BFS (s vlastní zásobníkem).

## Přetížení (overloading)

**Přetěžování (overloading)** = v **téže třídě** existují **více metod stejného jména**, ale **liší se jejich signatura parametrů**
(počtem, pořadím nebo typy parametrů). Návratový typ a výjimky se **do signatury nepočítají**.

```java
class Mathx {
    // stejné jméno, jiné parametry
    static int    max(int a, int b)       { return a > b ? a : b; }
    static long   max(long a, long b)     { return a > b ? a : b; }
    static double max(double a, double b) { return a > b ? a : b; }
}
```

* ❌ **Jiný návratový typ s totožnými parametry** → neprojde.
* ❌ **Jiný seznam vyhazovaných výjimek** → stále stejná signatura.
* ❌ **Jiné `static`/`final`/`public`** → nemění signaturu.

```java
// NEJDE:
// int   parse(String s);
// long  parse(String s);   // ❌ kolize – liší se jen návratový typ
```

## Rozlišení (overload resolution) – jak kompilátor vybírá

Zjednodušené pořadí preferencí při volání (od „nejtěsnější“ po „nejvolnější“):

1. **Přesná shoda typu** (exact match)
2. **Widening primitiv** (např. `int` → `long` → `float` → `double`)
3. **Boxing/unboxing** (např. `int` ↔ `Integer`)
4. **Varargs** (rozbalení na `T...`)

```java
static void f(long x)   { System.out.println("long"); }
static void f(Integer x){ System.out.println("Integer"); }
static void f(int... x) { System.out.println("varargs"); }

f(5); // "long"  (int->long je widening; preferováno před boxing a varargs)
```

## Zádrhele a nejednoznačnosti

* **`null`** může být nejednoznačné mezi referenčními typy:

  ```java
  static void g(String s) {}
  static void g(StringBuilder sb) {}
  // g(null); // ❌ ambiguous
  g((String) null); // ✔ odlišení přetypováním
  ```

* **Vícenásobná konverze** (boxing + widening) se **nedělá** v jednom kroku:

  * `short` → (boxing) `Short` → (widening ref) `Object` je OK, ale
  * `short` → (widening prim) `int` → (boxing) `Integer` už **není** povoleno.
* **Varargs vs. pole**: existují-li obě verze, přesná shoda s polem vyhraje.
* **Generika + type erasure** mohou skrýt rozdíl (viz níže).

## Praktické příklady

### 1) Počet a typy parametrů

```java
class Joiner {
    static String join(String a, String b)          { return a + b; }
    static String join(String a, String b, String c){ return a + b + c; }
    static String join(Object a, Object b)          { return String.valueOf(a)+b; }

    public static void main(String[] args) {
        System.out.println(join("A","B"));      // -> join(String,String)
        System.out.println(join("A","B","C"));  // -> join(String,String,String)
        System.out.println(join(1, 2));         // -> join(Object,Object)
    }
}
```

### 2) Widening vs. boxing vs. varargs

```java
static void h(long x)   { System.out.println("long"); }
static void h(Integer x){ System.out.println("Integer"); }
static void h(int... x) { System.out.println("varargs"); }

h(10);          // long  (widening)
h(Integer.valueOf(10)); // Integer (přesná shoda)
h();            // varargs (0 argumentů)
```

### 3) Přetížení a `null`

```java
static void show(CharSequence s)  { System.out.println("CS"); }
static void show(String s)        { System.out.println("String"); }

show("hi");   // String (specifičtější typ vyhrává)
show((CharSequence) null); // CS
// show(null); // ❌ ambiguous mezi CharSequence a String? Ne: String je specifičtější → "String"
```

*Pozn.: Když jsou dvě kandidátní signatury ve vztahu „přesnější“ (subtyp), vybere se ta přesnější; pokud není vztah podtypu a obě jsou stejně dobré, volání je nejednoznačné.*

### 4) Varargs vs. přesná shoda

```java
static void m(int[] xs) {}
static void m(int... xs) {}
int[] arr = {1,2};
m(arr);    // m(int[]) – přesná shoda s polem před varargs
m(1,2,3);  // m(int...) – varargs
```

### 5) Přetížení konstruktorů + řetězení `this(...)`

```java
class Point {
    final int x, y;

    Point(int x, int y) { this.x=x; this.y=y; }
    Point(int v)        { this(v, v); }       // delegace na hlavní konstruktor
    Point()             { this(0, 0); }
}
```

### 6) Přetížení vs. přepisování (overriding)

* **Přetěžování** = v **téže třídě**, různé parametry. **Statické rozlišení** při překladu.
* **Přepisování** = v **potomkovi**, stejná signatura, jiné chování. **Dynamická vazba** za běhu (polymorfismus).

```java
class A { void ping(Number n) { System.out.println("A:Number"); } }
class B extends A {
    void ping(Integer n){ System.out.println("B:Integer"); } // overload
    @Override
    void ping(Number n) { System.out.println("B:Number"); }  // override
}

A ref = new B();
ref.ping(1); // Overload se vybírá podle statického typu argumentu a dostupných metod v A:
             // vybere A.ping(Number) (compile-time), ale runtime override: "B:Number"
```

### 7) Generika a type erasure

Po **type erasure** se generické typy smažou → některá přetížení by se slila a jsou **nepovolená**.

```java
// NEJDE mít oboje – po erasure obě vypadají jako f(List):
// void f(List<String> x) {}
// void f(List<Integer> x) {}   // ❌ kolize po erasure

// Jde odlišit třeba takto:
void f(List<String> x, String tag) {}
void f(List<Integer> x, int tag) {}
```

### 8) Lambda výrazy a funkční rozhraní

Lambda se přiřadí k **cílovému typu** (funkční rozhraní). Pokud je více přetížení a cílový typ není jednoznačný, je potřeba přetypovat.

```java
interface F1 { void run(String s); }
interface F2 { void run(Object o); }

static void call(F1 f){ f.run("x"); }
static void call(F2 f){ f.run("x"); }

// call(s -> System.out.println(s)); // ❌ ambiguous
call((F1) (s -> System.out.println(s)));       // ✔ jednoznačné
```

### Best practices

* Přetěžuj, když dává **smysl stejná operace** pro různé „tvary“ dat (typy/počty).
* Preferuj „**hlavní**“ metodu a ostatní přetížené jako **delegující** (méně duplicit).
* U veřejného API se vyhni kolizím **boxing vs. varargs** – snadno vedou k překvapením.
* Při nejednoznačnosti pomůže **přetypování** argumentu volání nebo **přejmenování** metod.
* Pro „volitelné parametry“ raději **builder** / **record s konfigurací** než mnoho přetížení.

### Mini-shrnutí

* Rozhoduje **signatura parametrů** (ne návratový typ).
* Pořadí preferencí: **exact** → **widening** → **boxing/unboxing** → **varargs**.
* Pozor na **`null`**, **lambdy**, **generika** a **erasure** → snadno vznikne **ambiguity**.
