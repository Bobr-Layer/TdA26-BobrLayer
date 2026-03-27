# Složitost algoritmů

„**Složitost**“ u algoritmů obecně znamená, kolik **zdrojů** (resources) algoritmus potřebuje vzhledem k **velikosti vstupu** (n). Sledují se hlavně dvě věci:

1. **Časová složitost (time complexity)**
   – Jak roste **doba běhu** se zvětšujícím se vstupem.
   – Značí se nejčastěji **Big-O** (horní mez), případně **Θ** (přesná řádová velikost) a **Ω** (dolní mez).
   – Vyjadřuje **řád růstu** (ignoruje konstanty a malé členy).
   – Uvádí se pro **nejhorší / průměrný / nejlepší** případ; někdy i **amortizovaně** (průměr na operaci v dlouhé sekvenci).
   - Třídy:
      - $O(1)$ – **konstantní** (např. přístup do pole podle indexu).
         - pro $n=1$ se jedná přibližně o $1$ operaci.
         - pro $n=10$ se jedná přibližně o $1$ operaci.
      - $O(\log n)$ – **logaritmická** (binární vyhledávání).
         - pro $n=1$ se jedná přibližně o $\log 1 = 0$ operací.
         - pro $n=10$ se jedná přibližně o $\log 10 \approx 3$ operací.
      - $O(n)$ – **lineární** (jedno průchodové zpracování pole).
         - pro $n=1$ se jedná přibližně o $n=1$ operací.
         - pro $n=10$ se jedná přibližně o $n=10$ operací.
      - $O(\sqrt n)$ – **sublineární** (např. prohledávání v mřížce).
         - pro $n=1$ se jedná přibližně o $\sqrt 1 = 1$ operací.
         - pro $n=10$ se jedná přibližně o $\sqrt{10} \approx 3$ operací.
      - $O(n \log n)$ – **„lineárně-logaritmická“** (třídění mergesort/quick-sort průměrně).
         - pro $n=1$ se jedná přibližně o $n=1 \cdot \log 1 = 0$ operací.
         - pro $n=10$ se jedná přibližně o $n=10 \cdot \log 10 \approx 33$ operací.
      - $O(n^2)$ – **kvadratická** (bublinkové třídění, dvojité vnořené smyčky).
         - pro $n=1$ se jedná přibližně o $n^2=1^2=1$ operací.
         - pro $n=10$ se jedná přibližně o $n^2=10^2=100$ operací.
      - $O(n^3)$ – **kubická** (naivní násobení matic).
         - pro $n=1$ se jedná přibližně o $n^3=1^3=1$ operací.
         - pro $n=10$ se jedná přibližně o $n^3=10^3=1000$ operací.
      - $O(n^k)$ – **polynomiální** (obecně).
         - pro $n=1$ se jedná přibližně o $n^k=1^k=1$ operací.
         - pro $n=10$ se jedná přibližně o $n^k=10^k=1000$ operací.
      - $O(c^n)$ – **exponenciální** (backtracking bez ořezů).
         - pro $n=1$ se jedná přibližně o $c^1=c$ operací.
         - pro $n=10$ se jedná přibližně o $c^{10}$ (např. pro $c=2$ je to $1024$) operací.
      - $O(n!)$ – **faktoriální** (procházení všech permutací).
         - pro $n=1$ se jedná přibližně o $1!=1$ operací.
         - pro $n=10$ se jedná přibližně o $10! = 3\,628\,800$ operací.

2. **Paměťová složitost (space complexity)**
   – Kolik **paměti navíc** algoritmus potřebuje (často „auxiliary space“), popř. celková paměť včetně vstupu a výstupu.
   – Opět se značí $O(\cdot)$ podle řádu růstu.
   – Důležitý je rozdíl **in-place** (konstantní nebo logaritmická paměť navíc) vs. **out-of-place** (potřebuje další pole/struktury).

   – Třídy a příklady:

   - $O(1)$ – „in-place“ (výběrové třídění; obvykle pár proměnných navíc).
   - $O(\log n)$ – např. rekurzivní dělení (quicksort nebo binární vyhledávání se zásobníkem rekurze).
   - $O(n)$ – pomocná pole/seznamy (mergesort, BFS fronta).
   - $O(n + m)$ – u grafů (vrcholy (n) + hrany (m) pro struktury nebo průchody).
   - $O(n^2)$ – horší třídy (např. memoizace všech podproblémů u DP může být $O(n^2)$ a více).

## Proč to řešíme

- **Porovnání algoritmů**: vybereme takový, který se pro dané $n$ a prostředí (RAM/disk/síť) chová nejlépe.
- **Škálování**: z asymptotiky poznáme, co se stane, když se data znásobí.
- **Limity modelu**: reálný výkon ovlivňují i konstanty, cache, I/O; složitost dává hlavně **asymptotický** obrázek.

## Dominantní člen

Dominantní člen je **ta část časového (nebo paměťového) výrazu, která roste nejrychleji s velikostí vstupu** (n) a proto určuje asymptotickou složitost.

### Formálně

- Řekneme, že $f(n)$ **dominuje** $g(n)$, když $g(n) \in o(f(n))$, tj.

$$
  \lim_{n\to\infty}\frac{g(n)}{f(n)}=0.
$$

- Pokud $f(n)$ a $g(n)$ mají stejný řád růstu, tj. $f(n)\in\Theta(g(n))$, pak žádná z nich nedominuje.
- Pro více funkcí je **dominantní** ta, která dominuje všechny ostatní.
- **Dominantní člen** součtu $T(n)=f_1(n)+f_2(n)+\dots+f_k(n)$ je ten $f_i$, pro který všechny ostatní splňují $f_j(n)\in o(f_i(n))$. Pak $T(n)=\Theta(f_i(n))$.

### Prakticky

- Z výrazu **zahodíš konstanty a pomalejší členy**.

  - $3n^2 + 7n\log n + 100 \Rightarrow \text{dominantní } n^2 \Rightarrow O(n^2)$.
- U **polynomů** je dominantní člen ten s **nejvyšší mocninou**:
  $5n^3 + 2n^2 + 9 \Rightarrow n^3$.
- U různých typů funkcí použij **hierarchii růstu**:
  $1 \ll \log n \ll n \ll n\log n \ll n^2 \ll n^3 \ll 2^n \ll n!$

### Rychlý test přes limitní poměr

- Pokud $\displaystyle \lim_{n\to\infty}\frac{f(n)}{g(n)}=\infty$, pak $f$ dominuje $g$.
- Pokud limitní poměr je konečná nenulová konstanta, mají **stejný řád** ($\Theta$).

### Poznámky

- Dominantní člen se zpravidla udává pro **nejhorší případ**, pokud není řečeno jinak.
- U více proměnných (např. $(n,m)$) posuzujeme dominanci podle toho, jak rostou **všechny** proměnné:
  $T(n,m)=n m + n^2 \Rightarrow$ pro velké $n$ a pevné $m$ dominuje $n^2$; pokud rostou oba, záleží na jejich vztahu.

## Praktické výpočty složitosti a dominantního členu

### 1) Jednoduchá smyčka

```pseudo
for i = 1..n:
    x = x + 1
```

* Počet průchodů: `n`
* Čas: `T(n) = a·n + b`  (a,b jsou konstanty)
* **Dominantní člen:** `n` ⇒ **O(n)**

### 2) Dvě nezávislé vnořené smyčky

```pseudo
for i = 1..n:
    for j = 1..n:
        doSomething()
```

* Vnitřek se provede `n·n = n²` krát
* `T(n) = a·n² + b·n + c`
* **Dominantní člen:** `n²` ⇒ **O(n²)**

### 3) Vnořená smyčka s délkou závislou na i

```pseudo
for i = 1..n:
    for j = 1..i:
        doSomething()
```

* Počty průchodů: `1 + 2 + … + n = n(n+1)/2`
* `T(n) = a·(n(n+1)/2) + … = (a/2)·n² + (a/2)·n + …`
* **Dominantní člen:** `n²` ⇒ **O(n²)**

### 4) Logaritmická smyčka (půlení intervalu)

```pseudo
while n > 1:
    n = n / 2
```

* Kolikrát lze dělit 2, než klesneme pod 1? ≈ `log₂ N`
* **O(log n)**

### 5) Kombinace částí

```pseudo
partA: běží n² kroků
partB: běží 50·n·log n kroků
partC: běží 1000 kroků
```

* Celkem: `n² + 50 n log n + 1000`
* **Dominantní člen:** nejrychleji rostoucí je `n²`
* **O(n²)**

**Pravidlo pro součty:** u `f(n) + g(n)` dominuje funkce, která roste rychleji.
**Pořadí růstu (často užitečné):**
`1  <  log n  <  n  <  n log n  <  n²  <  n³  <  2^n  <  n!`

### 6) Rozhodování (větvení)

```pseudo
if (podmínka):
    běž O(n)
else:
    běž O(n²)
```

* **Nejhorší případ:** O(n²)
* **Průměrný případ:** jen pokud máte rozložení pravděpodobností; jinak se uvádí nejhorší.

### 7) Rekurze (rychlé třídění – příklad)

```pseudo
quickSort(A):
    zvol pivot
    rozděl na menší/větší (O(n))
    rekurze na dvě poloviny
```

Relace: `T(n) = T(k) + T(n-k-1) + c·n`

* **Průměrně:** vyvážené dělení ⇒ `T(n) = 2T(n/2) + c·n` ⇒ **O(n log n)** (Master theorem).
* **Nejhorší:** `T(n) = T(n-1) + c·n` ⇒ **O(n²)**.

### Jak určit dominantní člen (mini-checklist)

1. **Spočítej iterace smyček.**

   * Počet průchodů × cena těla.
2. **U vnoření násob.**

   * `n` venku × `n` uvnitř ⇒ `n²`; když je uvnitř `1..i`, použij součet.
3. **U větvení ber nejhorší případ**, pokud není výslovně požadován průměr/nejlepší.
4. **U rekurzí napiš rekurentní rovnici** a použij známé vzorce (Master theorem) nebo odhad.
5. **Zahoď konstanty a pomalejší členy.**

   * Z výrazu `3n² + 7n log n + 100` zůstává `n²`.

### Malý „pracovní“ příklad od A do Z

Spočítej složitost:

```pseudo
sum = 0
for i = 1..n:
    for j = 1..i:
        sum += j          // O(1)
for k = 1..n:
    while k < n:
        k = 2*k           // kolikrát? ≈ log₂(n/k_start) = O(log n)
```

* První blok: `∑_{i=1}^n i = n(n+1)/2 = Θ(n²)`
* Druhý blok: vnější `n` krát, vnitřní **pro každý k** běží `O(log n)` ⇒ `n · log n`
* Celkem: `n² + n log n` ⇒ **dominantní člen `n²` ⇒ O(n²)**
