# Rekurze

**Rekurze** je základní programovací technika, která umožňuje řešit problémy rozdělením na menší podproblémy stejného typu.

**Rekurentní vztahy** se často vyskytují v přírodě (fraktály, Fibonacciho posloupnost, stromové struktury) i v informatice (třídění, vyhledávání, grafy, parsování).

> **Poznámka:** Rekurze není totéž co iterace (cykly). Iterace opakuje blok kódu, rekurze volá funkci/metodu znovu.

**Definice:** Metoda (funkce) **volá sama sebe** (přímo či nepřímo). Rekurze se skládá z:

* **ukončovací podmínky rekurze** (bázového případu ukončení) a
* **rekurzivního kroku** (zmenšení problému).

> Pozor: V Javě se běžně **neprovádí optimalizace koncové rekurze (TCO)** → hluboká rekurze může skončit `StackOverflowError`.

**Druhy rekurze podle struktury volání:**

* **Přímá rekurze:** metoda volá sama sebe.
* **Nepřímá rekurze:** metoda A volá B, ta volá A (mutuální rekurze).
* **Lineární rekurze:** v každém kroku je právě jedno rekurzivní volání.
* **Stromová rekurze:** v každém kroku je více rekurzivních volání (větvení jako strom).
* **Koncová rekurze (tail recursion):** rekurzivní volání je poslední operace metody (usnadňuje převod na cyklus).
* **Nekonečná rekurze:** chybí ukončovací podmínka (bázový případ ukončení) nebo se k ní nikdy neblížíme (chyba).

## Přímá rekurze

Metoda volá **sama sebe**.

**Příklad – faktoriál `n!`:**

```java
static long fact(int n) {
    if (n < 0) throw new IllegalArgumentException("n >= 0");
    if (n <= 1) return 1;                // ukončovací podmínka
    return n * fact(n - 1);              // rekurzivní krok
}
```

**Volání:**

* `fact(5)` →
  * `5 * fact(4)` →
    * `4 * fact(3)` →
      * `3 * fact(2)` →
        * `2 * fact(1)` →
          * `1` (ukončovací podmínka)
          * → návrat `1`
        * → návrat `2 * 1 = 2`
      * → návrat `3 * 2 = 6`
    * → návrat `4 * 6 = 24`
  * → návrat `5 * 24 = 120`

**Složitost:** čas `O(n)`, paměť `O(n)` (hloubka volání je `n`).

## Nepřímá rekurze

Metoda **A** volá **B**, ta volá zpět **A** (mutuální rekurze).

**Příklad – sudost/lichost:**

```java
static boolean jeSudé(int n) {
    if (n == 0) return true;             // ukončovací podmínka
    if (n < 0) return jeSudé(-n);
    return jeLiché(n - 1);               // A → B
}
static boolean jeLiché(int n) {
    if (n == 0) return false;            // ukončovací podmínka
    if (n < 0) return jeLiché(-n);
    return jeSudé(n - 1);                // B → A
}
```

**Volání:** `jeSudé(4)` → `jeLiché(3)` → `jeSudé(2)` → `jeLiché(1)` → `jeSudé(0)` → `true`.

**Složitost:** `O(n)` času, `O(n)` paměti.

## Lineární rekurze

V každém kroku je **právě jedno** rekurzivní volání.

**Příklad – součet pole:**

```java
static int sum(int[] a, int i) {
    if (i == a.length) return 0;         // ukončovací podmínka
    return a[i] + sum(a, i + 1);         // jedno rekurzivní volání
}
// volání: sum(arr, 0)
```

**Volání:** `sum([1,2,3],0)` → `1 + sum([1,2,3],1)` → `1 + (2 + sum([1,2,3],2))` → `1 + (2 + (3 + sum([1,2,3],3)))` → `1 + (2 + (3 + 0))` = `6`.

**Složitost:** `O(n)` času, `O(n)` paměti (hloubka = velikost pole).

## Stromová rekurze

Každý krok spouští **více** rekurzivních volání (větví se jako strom).

**Příklad – Fibonacciho čísla (naivně):**

```java
static long fib(int n) {
    if (n < 0) throw new IllegalArgumentException();
    if (n <= 1) return n;                // fib(0)=0, fib(1)=1
    return fib(n - 1) + fib(n - 2);      // dvě volání → větvení
}
```

**Volání:** `fib(5)` → `fib(4) + fib(3)` → `(fib(3) + fib(2)) + (fib(2) + fib(1))` → ...

**Složitost:** čas exponenciální `O(φ^n)` (zhruba), paměť `O(n)` (hloubka).

> V praxi použij **iteraci**, **memoizaci** nebo **dinamické programování**.

**„Prakticky stromově“ – průchod stromem:**

```java
static int sumTree(Node n) {
    if (n == null) return 0;
    return n.value + sumTree(n.left) + sumTree(n.right);
}
```

**Složitost:** `O(N)` nad uzly, paměť = `O(h)` (výška stromu).

# Konečná rekurze (tail recursion)

Rekurzivní volání je **poslední operace** metody (výsledek volání se už dále nezpracovává). Usnadňuje převod na cyklus.

**Příklad – faktoriál s akumulátorem:**

```java
static long factTail(int n) { 
    if (n < 0) throw new IllegalArgumentException();
    return factAcc(n, 1);
}
private static long factAcc(int n, long acc) {
    if (n <= 1) return acc;              // ukončovací podmínka
    return factAcc(n - 1, acc * n);      // TAIL CALL (poslední operace)
}
```

**Volání:** `factTail(5)` → `factAcc(5,1)` → `factAcc(4,5)` → `factAcc(3,20)` → `factAcc(2,60)` → `factAcc(1,120)` → `120`.

**Složitost:** čas `O(n)`, paměť `O(n)` v Javě (bez TCO).

**Ekvivalentní iterace (bez rizika stacku):**

```java
static long factIter(int n) {
    long acc = 1;
    for (int k = 2; k <= n; k++) acc *= k;
    return acc;
}
```

## Nekonečná rekurze (chyba)

Chybí **ukončovací podmínka** (bázový případ ukončení), nebo se k ní nikdy **neblížíme**.

**Protipříklad – chyba:**

```java
static void boom() {
    boom();        // bez ukončení → StackOverflowError
}
```

**Skrytější chyba (špatný krok):**

```java
static int wrong(int n) {
    if (n == 0) return 0;
    return wrong(n + 1);  // vzdaluje se od 0 → nikdy nekončí
}
```

## Převod rekurze na iteraci

* **Tail recursion → cyklus** (viz `factIter`).
* U **stromové** rekurze použij stack/queue struktury (vlastní zásobník, BFS/DFS).
