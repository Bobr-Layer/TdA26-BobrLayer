## 🧠 Java – tvorba vlastních metod (podrobně + teorie)

### 🔹 1. Co je metoda v Javě?

Metoda je **pojmenovaný blok kódu**, který vykonává určitou činnost.
Používá se pro:

* rozdělení programu na menší části (**modularita**)
* opakované použití kódu (**reusability**)
* lepší čitelnost a údržbu (**readability, maintainability**)

👉 V Javě jsou všechny funkce vždy **součástí třídy** (neexistují „globální funkce“ jako v C).


Dělení metod v Javě dle typu:
| Typ metody       | Popis                                      |
| ----------------- | ------------------------------------------ |
| **statická**      | patří třídě, volá se bez objektu           |
| **instanční**     | patří objektu, volá se přes instanci
| **abstraktní**    | deklarována bez těla, musí být implementována v podtřídě |

Dělení metod podle návratového typu:
| Návratový typ | Popis                                      |
| ------------- | ------------------------------------------ |
| `void`        | metoda nevrací žádnou hodnotu (**procedura**)              |
|  typy | metoda vrací datový typ (např. `int`, `double`) (**funkce**) |

---

### 🔹 2. Základní syntaxe metody

```java
modifikátor návratový_typ názevMetody(parametry) {
    // tělo metody
    return hodnota;
}
```

#### 📌 Vysvětlení částí:

* **modifikátor** – určuje přístup (např. `public`, `private`)
* **návratový_typ** – co metoda vrací (`int`, `String`, `void`, …)
* **názevMetody** – identifikátor (camelCase)
* **parametry** – vstupní hodnoty (může být 0 i více)
* **return** – vrací hodnotu (pokud není `void`) + okamžitě ukončuje metodu

**Signatura metody** = název + parametry (důležité pro přetěžování)

---

### 🔹 3. Jednoduchý příklad

```java
public static int soucet(int a, int b) {
    return a + b;
}
```

Použití:

```java
int vysledek = soucet(3, 5);
System.out.println(vysledek); // 8
```

---

### 🔹 4. Metody bez návratové hodnoty (`void`)

```java
public static void pozdrav() {
    System.out.println("Ahoj!");
}
```

👉 Volání:

```java
pozdrav();
```

---

### 🔹 5. Parametry metod

#### 📌 a) Hodnotové předávání (pass by value)

V Javě se **vždy předává kopie hodnoty**.

```java
public static void zmenHodnotu(int x) {
    x = 100;
}
```

```java
int a = 5;
zmenHodnotu(a);
System.out.println(a); // pořád 5
```

---

#### 📌 b) Reference (objekty)

U objektů se kopíruje **reference**, takže lze měnit obsah:

```java
public static void zmenPole(int[] pole) {
    pole[0] = 999;
}
```

---

### 🔹 6. Přetěžování metod (method overloading)

Více metod se stejným názvem, ale jinými parametry:

```java
public static int soucet(int a, int b) {
    return a + b;
}

public static double soucet(double a, double b) {
    return a + b;
}
```

👉 Kompilátor vybírá správnou metodu podle parametrů.

---

### 🔹 7. Rekurze (metoda volá sama sebe)

```java
public static int faktorial(int n) {
    if (n <= 1) return 1;
    return n * faktorial(n - 1);
}
```

👉 Pozor na:

* podmínku ukončení (**base case**)
* přetečení zásobníku (StackOverflowError)

---

### 🔹 8. Lokální vs. globální proměnné

* **lokální proměnná** – existuje jen uvnitř metody
* **instanční proměnná** – patří objektu
* **statická proměnná (`static`)** – sdílená pro celou třídu

---

### 🔹 9. Statické vs. instanční metody

#### 📌 Statická metoda

```java
public static void vypis() {
    System.out.println("Statická metoda");
}
```

* patří třídě
* volání: `Trida.metoda()`

---

#### 📌 Instanční metoda

```java
public void vypis() {
    System.out.println("Instanční metoda");
}
```

* patří objektu
* volání:

```java
MojeTrida obj = new MojeTrida();
obj.vypis();
```

---

### 🔹 10. Viditelnost metod (access modifiers)

| Modifikátor  | Viditelnost             |
| ------------- | ----------------------- |
| `public`    | odkudkoliv              |
| `private`   | jen ve třídě         |
| `protected` | balíček + dědičnost |
| (default)     | jen balíček           |

---

### 🔹 11. Návratové typy

| Typ                 | Popis            |
| ------------------- | ---------------- |
| `void`            | nic nevrací     |
| `int`, `double` | primitivní typy |
| `String`          | text             |
| `Object`          | objekt           |
| `int[]`           | pole             |

---

### 🔹 12. Varargs (proměnný počet parametrů)
Promměnný počet argumentů stejného typu: 

```java
public static int soucet(int... cisla) {
    int sum = 0;
    for (int c : cisla) {
        sum += c;
    }
    return sum;
}
```

👉 Volání:

```java
soucet(1, 2, 3, 4);
```

Podmínky: Vždy poslední parametr, pouze jeden varargs v metodě.

---

### 🔹 13. Návrat více hodnot (triky)

Java neumí vracet více hodnot přímo → řešení:

* pole
* objekt
* `Map`
* vlastní třída

```java
public static int[] vratDveHodnoty() {
    return new int[]{1, 2};
}
```

---

### 🔹 14. Dokumentace metod (JavaDoc)

```java
/**
 * Vrátí součet dvou čísel
 * @param a první číslo
 * @param b druhé číslo
 * @return součet
 */
public static int soucet(int a, int b) {
    return a + b;
}
```

---

### 🔹 15. Best practices

✔ názvy metod:

* `spocitejPrumer()`
* `getName()`, `setName()`

✔ metoda by měla:

* dělat **jednu věc**
* být **krátká**
* mít **srozumitelný název**

❌ špatně:

```java
doEverything()
```

---

### 🔹 16. Časté chyby

❌ zapomenutý `return`
❌ špatný datový typ
❌ záměna `static` vs. instance
❌ nekonečná rekurze
❌ práce s `null`

---

### 🔹 17. Shrnutí

Metody v Javě:

* jsou základní stavební jednotkou programu
* umožňují modularitu a opakované použití kódu
* podporují přetěžování, rekurzi a OOP principy

---

## 🔥 Pokud chceš ještě víc do hloubky:

Můžu ti navázat třeba na:

* 👉 **interní fungování volání metod (stack frame, JVM)**
* 👉 **rozdíl mezi metodou a funkcí**
* 👉 **lambda výrazy a funkcionální přístup**
* 👉 **metody v OOP (override, polymorfismus)**

Stačí říct 👍
