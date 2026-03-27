# Třídy Scanner a IO

* Třída `Scanner` slouží k načítání vstupu z konzole nebo ze souboru.
* Třída `IO` (z balíčku `lang`) poskytuje jednoduché metody pro čtení a zápis textu na konzoli.
* Pro použití třídy `Scanner` je potřeba je naimportovat, protože není v balíčku `java.lang`:

```java
import java.util.Scanner;
import java.lang.IO;
```

* Pro vytvoření objektu `Scanner` pro čtení z konzole použijeme:

```java
Scanner scanner = new Scanner(System.in);
```

## Metody třídy `Scanner`
* `nextLine()` – načte celý řádek textu jako `String`.
* `nextInt()` – načte celé číslo jako `int`.    
* `nextDouble()` – načte desetinné číslo jako `double`.
* `next()` – načte jeden „token“ (slovo) jako `String`.
* `nextBoolean()` – načte logickou hodnotu jako `boolean` (`true` nebo `false`).
* `close()` – zavře scanner (u konzole obvykle není potřeba).
* Pozor: Po použití `nextInt()`, `nextDouble()` atd. zůstává na vstupu znak nového řádku, který může ovlivnit další čtení pomocí `nextLine()`. Pro odstranění tohoto znaku je potřeba zavolat `nextLine()`.


Příklady použití:

```java
Scanner scanner = new Scanner(System.in);
System.out.print("Zadej celé číslo: ");
int cislo = scanner.nextInt();
scanner.nextLine(); // odstraní znak nového řádku
System.out.print("Zadej text: ");
String text = scanner.nextLine();   
System.out.println("Zadal jsi číslo " + cislo + " a text: " + text);

// Načtení znaku
System.out.print("Zadej jeden znak: ");
char znak = scanner.nextLine().charAt(0);
System.out.println("Zadal jsi znak: " + znak);
```

## Metody třídy `IO`
* `IO.readLn()` – načte celý řádek textu jako `String`. 
* `IO.write(String text)` – vypíše text na konzoli bez nového řádku.
* `IO.writeln(String text)` – vypíše text na konzoli s novým řádkem.
Příklady použití:

```java
System.out.print("Zadej text: ");
String text = IO.readLn();
IO.writeln("Zadal jsi text: " + text);

// Celé číslo
System.out.print("Zadej celé číslo: ");
int cislo = Integer.parseInt(IO.readLn());
IO.writeln("Zadal jsi číslo: " + cislo);

// Načtení znaku
System.out.print("Zadej jeden znak: ");
char znak = IO.readLn().charAt(0);
IO.writeln("Zadal jsi znak: " + znak);

// Desetinné číslo
System.out.print("Zadej desetinné číslo: ");
double desetinne = Double.parseDouble(IO.readLn());
IO.writeln("Zadal jsi desetinné číslo: " + desetinne);  
```

## Časté chyby 
* Zapomenutí importu třídy `Scanner`.
* Použití `nextLine()` po `nextInt()`, `nextDouble()` bez odstranění znaku nového řádku.
* Převod vstupu na číslo pomocí `Integer.parseInt()` nebo `Double.parseDouble()` bez ošetření výjimky pro neplatný vstup.
* Použití `charAt(0)` na prázdný řetězec (může způsobit chybu `StringIndexOutOfBoundsException`).
* Nezavření scanneru (i když u konzole to obvykle není problém).
* Nepoužití `nextLine()` k odstranění zbylého znaku nového řádku po čtení číselných hodnot.
* Nezachycení výjimek při převodu vstupu na čísla (např. `NumberFormatException`).
* Pokus o čtení více hodnot najednou bez správného oddělení (např. čtení dvou čísel na jednom řádku).
* Použití `IO` třídy bez správného importu nebo bez znalosti jejích metod (je potřeba znát, že `IO.readLn()` čte řádek jako `String`).
* Pokus o čtení hodnoty jiného typu, než jaký je očekáván (např. čtení `int` jako `double`).
* Nezohlednění formátu vstupu (např. desetinná čárka vs tečka v různých lokalizacích).