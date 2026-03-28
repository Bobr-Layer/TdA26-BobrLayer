# Zanořené typy

## Rychlý přehled (co je co)

| Druh                                 | Signatura (tvar)                          | Vytvoření instance                                  | Statické členy                    | Přístup k `Outer.this`                        | Zachytává lokální proměnné  |
| ------------------------------------ | ----------------------------------------- | --------------------------------------------------- | --------------------------------- | --------------------------------------------- | --------------------------- |
| **Statická vnořená** (static nested) | `class Outer { static class Helper { } }` | `new Outer.Helper()`                                | **Ano** (plnohodnotná třída)      | **Ne**                                        | Ne                          |
| **Vnitřní** (inner)                  | `class Outer { class Inner { } }`         | `Outer o=new Outer(); Outer.Inner i=o.new Inner();` | Ne (jen `static final` konstanty) | **Ano** (`Outer.this`)                        | Ano (jen „efektivně final“) |
| **Lokální** (local)                  | `void f(){ class Tmp{ } new Tmp(); }`     | Uvnitř metody/bloku                                 | Ne                                | Pokud je uvnitř metody členské třídy, tak ano | Ano (efektivně final)       |
| **Anonymní** (anonymous)             | `new SomeType(){ /* override */ }`        | Inline výrazem `new ... {}`                         | Ne                                | Pokud vzniká v instanci, tak ano              | Ano (efektivně final)       |

## 1) Statická vnořená třída (static nested class)

**Definice:** Třída deklarovaná uvnitř jiné třídy se specifikátorem `static`. Je to normální top-level třída jmenně svázaná s vnější (bez skrytého odkazu na instanci).

**Signatura:**

```java
public class Outer {
    public static class Helper {
        public static void util() { /* ... */ }   // statická metoda OK
    }
}
```

**Vytvoření:**

```java
Outer.Helper h = new Outer.Helper();
Outer.Helper.util();
```

**Kdy použít:** „Čistý namespacing“ – pomocné typy, buildery, hodnotové objekty, které **nepotřebují** instanci `Outer`.

**Pozn.:** Přístup k `private` členům `Outer` je povolen (kompilátor vygeneruje přístupové metody).




## 2) Vnitřní třída (inner class)

**Definice:** Členská třída **bez** `static`. Každá její instance nese **implicitní odkaz** na instanci `Outer`.

**Signatura a použití `Outer.this`:**

```java
public class Outer {
    private final String name = "OUT";

    public class Inner {
        void use() {
            System.out.println(Outer.this.name);  // přístup k vnější instanci
        }
    }
}
```

**Vytvoření:**

```java
Outer o = new Outer();
Outer.Inner i = o.new Inner();
// nebo uvnitř metody Outer: new Inner();
```

**Omezení:**

* **Žádné statické členy**, kromě `static final` **kompil-time** konstant (např. `static final int K = 42;`).
* Může vznikat riziko **úniku paměti**: dlouhožijící `Inner` drží odkaz na `Outer`. Pozor v cache/threadech.

**Typické použití:** Těsně svázané objekty, které logicky patří k instanci `Outer` (iterátory, view nad stavem).

## 3) Lokální třída (local class)

**Definice:** Třída definovaná uvnitř **metody**, **konstruktoru** nebo **bloku**. Je viditelná jen v daném rozsahu.

**Signatura:**

```java
void f() {
    final int base = 10;          // „efektivně final“ stačí (nemusí být explicitně final)
    class Tmp {
        int plus(int x){ return x + base; }
    }
    System.out.println(new Tmp().plus(5));
}
```

**Vlastnosti:**

* Nemůže mít statické členy (jen `static final` konstanty).
* Může přistupovat k `this` vnější třídy (pokud existuje).
* Přistupuje k **lokálním proměnným jen pokud jsou „efektivně final“** (po přiřazení se už nemění).

**Použití:** Jednorázové pomocné typy v algoritmu/testu, když je nechceš povyšovat na samostatný soubor.

## 4) Anonymní třída (anonymous class)

**Definice:** **Bez jména**, jednorázová implementace **třídy nebo rozhraní** vytvořená výrazem `new ... { ... }`.

**Příklady:**

```java
// Implementace rozhraní
Runnable r = new Runnable() {
    @Override public void run() { System.out.println("Run"); }
};

// Rozšíření třídy
JButton b = new JButton("OK") {
    @Override public boolean isDefaultButton() { return true; }
};
```

**Vlastnosti:**

* Má **implicitní odkaz** na `Outer.this` (pokud vzniká v instanci).
* Může zachytávat **efektivně final** lokální proměnné.
* Nelze deklarovat konstruktory (řeší se inicializačním blokem či parametry nadtřídy).

**Použití:** Jednorázové listenery/strategické objekty.
**Pozn.:** Pro funkční rozhraní často místo anonymní třídy preferuj **lambda výraz** (viz níže rozdíly).

## Efektivně final – pravidlo zachytávání

Lokální/inner/anonymní třídy mohou používat lokální proměnné obklopujícího bloku **jen když se po přiřazení nemění**:

```java
void g() {
    int n = 5;                // efektivně final
    class A { int v(){ return n; } }  // OK
    // n++;                   // Tohle by už A rozbilo
}
```

Důvod: kompilátor proměnnou **zachytí (kopie)**, nikoli referencí na zásobník.

## Rozdíly: anonymní třída vs. lambda

| Vlastnost       | Anonymní třída                          | Lambda                                      |
| --------------- | --------------------------------------- | ------------------------------------------- |
| Typ             | Vytvoří **nový podtyp**                 | Pouze hodnota funkčního typu (SAM)          |
| `this`          | Odkazuje na **instanci anonymní třídy** | Odkazuje na **okolí (enclosing) instanci** |
| Stínění jmen    | Může deklarovat vlastní metody/pole     | Nemůže (jen tělo funkce)                    |
| Výkon/čitelnost | Těžší, upovídané                        | Lehké, preferované pro SAM                  |
| Přetěžování     | Rozhoduje se podle cílového typu        | Taky, ale méně překvapení                   |

```java
interface Op { int apply(int x); }

Op a = new Op(){ public int apply(int x){ return x+1; } }; // anonymní třída
Op b = x -> x + 1;                                         // lambda (preferováno)
```

## Doporučení

1. **Únik vnější instance:** Dlouho žijící `Inner` (např. uložený ve statickém poli) drží `Outer.this` → možný leak. Kde není potřeba přístup k `Outer`, použij **statickou vnořenou** třídu.
2. **Statika v `Inner`:** Nesmí mít statické členy (mimo konstant). Potřebuješ statiku? → udělej třídu `static`.
3. **Efektivně final:** Přepočítávané lokální proměnné raději vlož do **mutable wrapperu** (např. `AtomicInteger`, jednoprvkové pole).
4. **Čitelnost:** Lokální/anonymní třídy používej střídmě. Když rostou, dej jim jméno (vyjmi je do `static` nested).
5. **`Outer.this` a stínění:** K `Outer` členům přistupuj přes `Outer.this.x`, když dojde ke stínění názvů.
6. **Serializace:** Anonymní/lokální třídy mají nestálé jména (`Outer$1`), nejsou vhodné jako stabilní součást API.

## Mini-ukázky (komplet)

### Statická vnořená: Builder

```java
public class Url {
    private final String scheme, host;
    private Url(String scheme, String host){ this.scheme=scheme; this.host=host; }

    public static class Builder {
        private String scheme="https", host="example.com";
        public Builder scheme(String s){ this.scheme=s; return this; }
        public Builder host(String h){ this.host=h; return this; }
        public Url build(){ return new Url(scheme, host); }
    }
}

Url u = new Url.Builder().host("acme.dev").build();
```

### Vnitřní: Iterator přes stav `Outer`

```java
public class IntRange implements Iterable<Integer> {
    private final int from, to;
    public IntRange(int from, int to){ this.from=from; this.to=to; }

    public class It implements Iterator<Integer> {
        private int cur = from;                       // přímý přístup
        public boolean hasNext(){ return cur <= to; }
        public Integer next(){ return cur++; }
    }
    @Override public Iterator<Integer> iterator(){ return new It(); }
}
```

### Lokální: pomocná třída v metodě

```java
void parseLines(List<String> lines){
    class Acc { int ok, err; void addOk(){ok++;} void addErr(){err++;} }
    Acc acc = new Acc();
    for (var s: lines) { if (s.matches("\\d+")) acc.addOk(); else acc.addErr(); }
    System.out.printf("OK=%d ERR=%d%n", acc.ok, acc.err);
}
```

### Anonymní: listener v GUI

```java
button.addActionListener(new ActionListener() {
    @Override public void actionPerformed(ActionEvent e) {
        System.out.println("Klik!");
    }
});
```

*(Pro `ActionListener` lze dnes použít i lambda: `button.addActionListener(e -> System.out.println("Klik!"));`)*
