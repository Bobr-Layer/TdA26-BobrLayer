# Dělení programovacích jazyků

## Podle úrovně abstrakce

**Definice:** Jak moc je jazyk blízko strojovému kódu (**nízkoúrovňový**) nebo naopak blízko lidskému myšlení (**vysokoúrovňový**).

### 1GL – strojový kód

**Definice:** Nejnižší úroveň – binární instrukce přímo pro CPU. Nečitelné pro člověka, žádná přenositelnost.
**Příklad:** (HEXa dump – ilustrativní)

```
B8 01 00 00 00   ; mov eax,1
83 C0 02          ; add eax,2
```

### 2GL – assembler

**Definice:** Symbolická forma strojových instrukcí; jedna instrukce ~ jedna HW operace.
**Příklad (x86):**

```asm
; sečti 1 + 2 a ulož do EAX
mov eax, 1
add eax, 2
```

### 3GL – vysoká úroveň

**Definice:** Čitelné pro člověka, kompilované/interpretované, přenositelné mezi platformami.
**Příklad (C):**

```c
#include <stdio.h>
int main(){ printf("%d\n", 1+2); }
```

**Příklad (Java):**

```java
public class Main {
    public static void main(String[] args) {
        System.out.println(1 + 2);
    }
}
```

### 4GL – velmi vysoká úroveň (deklarativní)

**Definice:** Popis „co“ chceme, ne „jak to udělat“. Silná doménová orientace.
**Příklad (SQL):**

```sql
SELECT name FROM Students WHERE grade >= 1.5;
```

**Příklad (HTML):**

```html
<h1>Hello, world!</h1>
```

### 5GL – deklarativní/AI/constraint

**Definice:** Problém se formuluje jako fakta/omezení; řešič hledá důkaz/řešení.
**Příklad (Prolog):**

```prolog
parent(jan, eva).
ancestor(X,Y) :- parent(X,Y).
ancestor(X,Y) :- parent(X,Z), ancestor(Z,Y).
```

## Podle způsobu překladu a běhu

**Definice:** Jak je kód překládán a spouštěn na cílovém stroji.

### Kompilované (AOT)

**Definice:** Překlad do nativního kódu před během; rychlý start i výkon.
**Příklad (C):**

```c
int add(int a,int b){ return a+b; }
```

### Interpretované

**Definice:** Zdrojový kód se vyhodnocuje za běhu interpretem; flexibilní, ale často pomalejší start.
**Příklad (Python):**

```python
print(1 + 2)
```

**Příklad (JavaScript):**

```javascript
console.log(1 + 2);
```

### Bytecode + virtuální stroj (JIT = just-in-time)

**Definice:** Kód → bytecode → běh na VM; JIT optimalizace za běhu.
**Příklad (Java):**

```java
class Main { public static void main(String[] a){ System.out.println(1+2); } }
```

### Hybrid (JIT + ahead-of-time)

**Definice:** Kombinují JIT s AOT pro rychlý start i špičkový výkon.
**Příklad (Java/GraalVM Native Image – ilustrativně):**

```bash
native-image -jar app.jar
```

## Podle programovacího paradigmatu

**Definice:** Styl/filozofie psaní kódu, ovlivňuje strukturu a myšlení o problému.

### Naivní

**Definice:** program je tvořen posloupností příkazů, které se vykonávají postupně.

**Příklad:**

```basic
REM Naivní program — sekvence příkazů bez funkcí a větví
LET a = 1
LET b = 2
LET c = 3
LET s = a + b + c
PRINT s  REM vypíše 6
```

### Nestrukturované programování

**Definice:** Program je tvořen lineární sekvencí příkazů, které se vykonávají postupně a skoky jsou realizovány pomocí `goto`.

**Příklad:**

```basic
REM Nestrukturovaný program — sekvence příkazů s goto
LET a = 1
LET b = 2
LET c = 3
LET s = 0
goto sum
LET s = a + b + c
sum:
PRINT s  REM vypíše 6
```

### Imperativní

**Definice:** Popisuje *jak* úlohu provést – sekvence příkazů mění stav.
**Příklad (C):**

```c
int s = 0;
for (int i = 1; i <= 5; i++) {
    s += i; // 1+2+3+4+5
}
```

### Procedurální

**Definice:** Imperativní styl strukturovaný do procedur/funkcí bez objektů.
**Příklad (C):**

```c
// preformatuj kód 
int sum(int* a, int n)
{
    int s = 0;
    for (int i = 0; i < n; i++)
        s += a[i];
    return s;
}
```

### Objektově orientované (OOP)

**Definice:** Program jako kolekce objektů s daty a chováním; zapouzdření, dědičnost, polymorfismus.
**Příklad (Java):**

```java
interface Shape {
    double area();
}

record Circle(double r) implements Shape {
    @Override
    public double area() {
        return Math.PI * r * r;
    }
}
```

### Funkcionální

**Definice:** Důraz na čisté funkce, neměnnost a vyšší řády; žádné vedlejší efekty.
**Příklad (Haskell):**

```haskell
sumSquares = sum . map (^2) . filter even $ [1..10]
```

### Logické (deklarativní)

**Definice:** Popisuje fakta a pravidla; řešič hledá řešení pomocí inference.
**Příklad (Prolog):**

```prolog
even(0).
even(N) :- N>0, N1 is N-2, even(N1).
```

### Událostně řízené / reaktivní

**Definice:** Reakce na události/streamy; tok řízení vyvolávají události.
**Příklad (JavaScript):**

```javascript
btn.addEventListener('click', () => console.log('Klik'));
```

### Paralelní/konkurenční (aktorový model)

**Definice:** Jednotky (aktory) komunikují zprávami; bez sdílené paměti.
**Příklad (Erlang):**

```erlang
loop() ->
  receive {From, ping} -> From ! pong, loop() end.
```

## Podle typového systému

**Definice:** Jak programovací jazyk nakládá s typy dat a kontrolou typů.

### Statická typizace

**Definice:** Typy se kontrolují při překladu; chyby dříve, optimalizace snadnější. Typ proměnné je pevně daný při deklaraci.
**Příklad (Java):**

```java
int n = 42;
// n = "text"; // chyba při překladu
```

### Dynamická typizace

**Definice:** Typ se určuje za běhu; flexibilní, ale chyby později. Typ proměnné může měnit hodnoty různých typů a je určen až přiřazenou hodnotou.
**Příklad (JavaScript):**

```javascript
let x = 42;
x = "text";  // OK za běhu
```

### Silná vs. slabá typizace

**Definice:** Silná brání skrytým konverzím; slabá je dovoluje/automatizuje.
**Příklad (JavaScript – volnější/„slabší“):**

```javascript
"2" * 3   // 6 (koercí se string -> číslo)
"2" + 3   // "23" (konkatenace)
```

**Příklad (Java – přísnější/„silnější“):**

```java
int n = Integer.parseInt("2") * 3; // nutná explicitní konverze
String s = "2" + 3;                 // OK, ale jiný význam než *
```

### Inferovaná typizace

**Definice:** Kompilátor odvodí typy (staticky), nemusíš je psát.
**Příklad (Java 10+):**

```java
var list = List.of(1,2,3); // typ je List<Integer>
```

### Postupná typizace (gradual)

**Definice:** Volitelná statická analýza nad dynamickým jazykem.
**Příklad (TypeScript):**

```typescript
function sum(a: number, b: number): number {
    return a + b;
}
```

## Podle správy paměti

**Definice:** Jak jazyk/nástroje nakládají s alokací a uvolňováním paměti.

### Ruční správa

**Definice:** Programátor explicitně alokuje a uvolňuje paměť.
**Příklad (C):**

```c
int* p = malloc(sizeof(int)*10);
/* ... */
free(p);
```

### Automatický odpad (Garbage Collection - GC)

**Definice:** Běhové prostředí uvolňuje nepřístupné objekty.
**Příklad (Java):**

```java
List<String> xs = new ArrayList<>();
xs.add("A"); // o uvolnění se postará GC
```

### Vlastnictví a vypůjčky

**Definice:** Statická pravidla zajišťují bezpečné uvolnění bez GC.
**Příklad (Rust):**

```rust
let s = String::from("hi");
let t = s; // move: s už není platné
```

## Podle modelu konkurence

**Definice:** Jak jazyk/nástroje řeší paralelismus a souběžnost.
**Konkurence** = více úloh (vláken) probíhá současně.
**Paralelismus** = úlohy běží zároveň na více jádrech CPU.

### Vlákna + zámky

**Definice:** Sdílená paměť mezi vlákny, synchronizace zámky/monitory.
**Příklad (Java):**

```java
synchronized(lock){ counter++; }
```

### Async/await (kooperativní)

**Definice:** Asynchronní I/O, nenutně vlákna na každou úlohu.
**Příklad (JavaScript):**

```javascript
const data = await fetch('/api').then(r=>r.json());
```

### Kanály a lehká vlákna

**Definice:** Lehká vlákna (goroutiny) a komunikace kanály.
**Příklad (Go):**

```go
ch := make(chan int)
go func(){ ch <- 42 }()
fmt.Println(<-ch)
```

### Aktorový model

**Definice:** Jednotky (aktory) nekolidují o sdílený stav; komunikace zprávami.
**Příklad (Akka/Scala – koncept):**

```scala
actor ! Message(value = 42)
```

## Podle domény použití

**Definice:** Pro jaký typ úloh je jazyk primárně určen.

### GPL – obecného použití

**Definice:** Vhodné pro širokou škálu úloh.
**Příklad (Java – server):**

```java
System.out.println("Obecný účel");
```

### DSL – doménově specifické

**Definice:** Jazyk šitý na míru jedné oblasti; vyšší produktivita v dané doméně.
**Příklad (Regulární výrazy):**

```regex
^\d{3}-\d{2}-\d{4}$
```

**Příklad (CSS):**

```css
.card { display: grid; gap: .5rem; }
```

## Podle syntaxe/rodiny

**Definice:** Společné rysy syntaxe a struktury kódu.

### C-like

**Definice:** Blízká rodina jazyků s `{}` bloky a `;` – C, C++, Java, C#, JS, Go.
**Příklad (Java):**

```java
for (int i = 0; i < 3; i++) {
    System.out.println(i);
}
```

### Lisp/ML

**Definice:** Výrazová/functional rodina; S-výrazy (Lisp) či výrazové typované ML.
**Příklad (Clojure):**

```clojure
(reduce + (map #(* % %) (filter even? (range 10))))
```

### Haskell/FP

**Definice:** Silně typované, lazy, čisté funkce.
**Příklad (Haskell):**

```haskell
main = print $ sum $ take 5 (repeat 1) -- 5
```

### Prolog (logické)

**Definice:** Fakta a pravidla, backtracking.
**Příklad:** viz výše.

### Smalltalk/Ruby (čisté OOP)

**Definice:** „Všechno je objekt“, zprávy mezi objekty.
**Příklad (Ruby):**

```ruby
3.times { |i| puts i }
```

## Podle bezpečnosti/nízkoúrovňovosti

### Nízkoúrovňové jazyky

**Definice:** Přístup k paměti/adresám, minimální abstrakce.
**Příklad (C – ukazatel):**

```c
int x=7; int* p=&x; *p=8;
```

### Vysokoúrovňové jazyky

**Definice:** Zabraňují třídám chyb (přetečení, use-after-free) typovým systémem/VM.
**Příklad (Java):**

```java
int[] a = {1,2};
System.out.println(a[5]); // vyvolá výjimku místo UB
```

## Podle distribuce a nasazení

**Definice:** Jak je kód distribuován a nasazován na cílové systémy.

### Skriptovací

**Definice:** Spouští se přímo interpretem, často bez build kroku.
**Příklad (Python):**

```python
#!/usr/bin/env python3
print("skript")
```

### Kompilované binární soubory, nebo kontejnery

**Definice:** Výsledkem kompilace je samostatný binární soubor nebo kontejnerový obraz, který lze snadno nasadit bez závislosti na externím runtime.

**Příklad (Go):**

```bash
go build -o app
./app
```

**Definice:** Výstupem je obraz; snadné nasazení bez runtime závislostí.
**Příklad (Go):**

```bash
go build -o app
./app
```

## Stejný problém různými styly („součet čtverců sudých 0..9“)

* **Imperativně (Java):**

```java
int s = 0;
for (int i = 0; i < 10; i++) {
    if (i % 2 == 0) {
        s += i * i;
    }
}
System.out.println(s);
```

* **Funkcionálně (Java Streams):**

```java
int s = IntStream
    .range(0, 10)
    .filter(i -> i % 2 == 0)
    .map(i -> i * i)
    .sum();
System.out.println(s);
```

* **Deklarativně (SQL):**

```sql
SELECT SUM(x * x) AS soucet_ctvercu
FROM numbers
WHERE MOD(x, 2) = 0;
```

* **Logicky (Prolog):**

```prolog
even(X) :- 0 is X mod 2.
square(X, Y) :- Y is X * X.
sum_squares(EvenSquares) :-
    findall(Square, (between(0, 9, X), even(X), square(X, Square)), EvenSquares).
?- sum_squares(L), sum_list(L, S).
```
