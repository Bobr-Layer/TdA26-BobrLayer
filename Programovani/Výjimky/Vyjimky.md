## Výjimky (exceptions)

* **Mechanismus pro hlášení a zpracování mimořádných stavů** (I/O chyby, neplatné argumenty, nepřípustný stav atd.).
* **Oddělují běžnou („šťastnou“) cestu od chybové logiky**; kód je čitelnější.
* Výjimka je **objekt**, dědí z `Throwable`, nese **zprávu**, **příčinu** (`cause`) a **stack trace**; může mít i **potlačené** výjimky (suppressed) z úklidu zdrojů.

## Druhy výjimek

### Kontrolované (checked)

* Kompilátor **vynucuje** ošetření (`try-catch`) nebo **deklaraci** (`throws`).
* Typicky obnovitelné situace: I/O (`IOException`), databáze (`SQLException`), parsování (`ParseException`).

```java
String read(Path p) throws IOException {
    return Files.readString(p);   // může hodit IOException
}
```

### Nekontrolované (unchecked, runtime)

* Dědí z `RuntimeException`. **Není povinné** je deklarovat/odchytávat.
* Obvykle programátorské chyby / porušení kontraktů (`NullPointerException`, `IllegalArgumentException`, `IndexOutOfBoundsException`, `IllegalStateException`).

```java
int get(int[] a, int i) {
    Objects.requireNonNull(a, "a nesmí být null");
    if (i < 0 || i >= a.length) throw new IndexOutOfBoundsException(i);
    return a[i];
}
```

### Errors

* Dědí z `Error` (např. `OutOfMemoryError`, `StackOverflowError`). Jde o **závažné stavy JVM** – typicky se **nezachytávají**.

## Hierarchie (zkráceně)

```
java.lang.Throwable
├─ java.lang.Exception
│  ├─ (checked) IOException, SQLException, ...
│  └─ (unchecked) RuntimeException
│       ├─ NullPointerException, IllegalArgumentException, ...
│       └─ ...
└─ java.lang.Error
   ├─ OutOfMemoryError, StackOverflowError, ...
   └─ ...
```

## `try`–`catch`–`finally` a správa zdrojů

### Základ

```java
try {
    risky();
} catch (SpecificException e) {
    log(e.getMessage());
} catch (Exception e) {            // širší síť až za konkrétní
    log(e);
} finally {
    cleanup();                     // běží vždy (i při return/throw)
}
```

### Multi-catch (JDK 7+)

* Pro zkrácení kódu, pokud se s různými výjimkami zachází stejně.

```java
try {
    risky();
} catch (IOException | SQLException e) {
    log(e);
}
```

### Try-with-resources (JDK 7+)

* Pro zdroje implementující `AutoCloseable`. Zavře se **automaticky** i při výjimce.

```java
try (BufferedReader br = Files.newBufferedReader(Path.of("in.txt"))) {
    System.out.println(br.readLine());
}
```

### Použití existující proměnné **[JDK 9+]**

```java
BufferedReader br = Files.newBufferedReader(Path.of("in.txt"));
try (br) {                         // ✅ od JDK 9
    System.out.println(br.readLine());
}
```

> Potlačené výjimky z `close()` najdeš přes `Throwable#getSuppressed()` (už od JDK 7).

## Vyvolání a deklarace výjimek

* `throw` — **vyvolání** instance výjimky.
* `throws` — **deklarace** checked výjimek v signatuře metody - klient je musí ošetřit. Povinné jen u checked výjimek, které metoda může vyvolat a nejsou zachyceny uvnitř metody.

```java
static int sqrtInt(int x) {
    if (x < 0) throw new IllegalArgumentException("x musí být ≥ 0");
    // ...
}

void load(Path p) throws IOException {
    Files.newInputStream(p);       // metoda deklaruje IOException
}
```

### „Přebalení“ (wrapping) a zachování příčiny

```java
try {
    doIo();
} catch (IOException e) {
    throw new UncheckedIOException("IO selhalo", e); // cause zachován
}
```

## Standardní výjimky – kdy kterou použít

* `IllegalArgumentException` – **neplatný vstupní parametr**.
* `IllegalStateException` – **neplatný stav** objektu pro danou operaci.
* `NullPointerException` – neočekávané `null` (zvaž `Objects.requireNonNull`).
* `UnsupportedOperationException` – operace není podporována (např. neměnné kolekce).
* `NoSuchElementException` – prvek neexistuje (iterátor, volitelná hodnota).
* `ArithmeticException` – aritmetické chyby (dělení nulou…).
* I/O specialitky: `FileNotFoundException`, `EOFException` atd.

## Stack trace a diagnostika

### `printStackTrace()`

* Rychlý způsob, jak **vypsat zásobník volání** do `System.err` (nebo na jiný `PrintStream`/`PrintWriter`).

```java
try {
    risky();
} catch (Exception e) {
    e.printStackTrace();           // výpis zásobníku volání
}
```

### `StackWalker` **[JDK 9+]**

* Moderní, efektivní API pro průchod zásobníkem (filtrace, mapování, bez vytváření celého stack trace).

```java
var walker = StackWalker.getInstance(StackWalker.Option.RETAIN_CLASS_REFERENCE); // [JDK 9+]
walker.forEach(f -> System.out.println(f.getClassName() + "." + f.getMethodName() + ":" + f.getLineNumber()));
```

### „Helpful NPE messages“ **[JDK 14+]**

* Detailní zprávy u `NullPointerException` (který operand byl `null`). Aktivuje se JVM volbou:

```
-XX:+ShowCodeDetailsInExceptionMessages   // [JDK 14+]
```

### Sealed hierarchie výjimek **[JDK 17+]**

* Sealed třídy usnadní **řiditelnou hierarchii** vlastních výjimek:

```java
public sealed class AppException extends Exception
        permits ValidationException, StorageException {}        // [JDK 17+]

public final class ValidationException extends AppException { ... }
public final class StorageException    extends AppException { ... }
```

## Vytváření vlastních výjimek

### Checked (klient MUSÍ řešit)

* Typicky pro obnovitelné chyby (I/O, parsování, síť…).
* Vytváří se jako podtřída třídy `Exception`.

```java
public class DataFormatException extends Exception {
    public DataFormatException() {}
    public DataFormatException(String msg) { super(msg); }
    public DataFormatException(String msg, Throwable cause) { super(msg, cause); }
}
```

### Unchecked (programátorská/kontraktní porušení)

* Typicky pro chyby v kódu (neplatné argumenty, stav objektu…).
* Vytváří se jako podtřída třídy `RuntimeException`.

```java
public class DomainRuleViolationException extends RuntimeException {
    public DomainRuleViolationException(String msg) { super(msg); }
    public DomainRuleViolationException(String msg, Throwable cause) { super(msg, cause); }
}
```

### Použití s „cause“
* Pro přebalení jiné výjimky a zachování původní příčiny.
* Konstruktor s `Throwable cause` předá `cause` rodiči (`super(...)`).
* DataFormatException je metoda, která parsuje vstup a může vyhodit `NumberFormatException`, pokud je číslo neplatné. V takovém případě chceme přebalit tuto výjimku do naší vlastní `DataFormatException`, aby klienti naší metody mohli lépe pochopit kontext chyby.

```java
try {
    parse(input);
} catch (NumberFormatException e) {
    throw new DataFormatException("Neplatné číslo v: " + input, e);
}
```

## Potlačené výjimky (suppressed) a příčina (cause)

* **`cause`**: primární příčina řetězená přes konstruktor `Throwable(String, Throwable)`.
* **`suppressed`**: další výjimky (např. z `close()`), které **nepřebijí** tu primární.

```java
try (var in = Files.newInputStream(src);
     var out = Files.newOutputStream(dst)) {
    in.transferTo(out);
} catch (IOException e) {
    for (Throwable s : e.getSuppressed()) log("suppressed: " + s);
    throw e;
}
```

## Best practices (stručně)

* **Nechytej `Throwable`/`Error`** (až na specifické, velmi řízené případy).
* **Chytej co nejkonkrétnější typy**, nejširší dej až nakonec.
* **Nemlč v `catch`**: loguj, přidej kontext, zachovej `cause`.
* **Nepoužívej výjimky pro běžné řízení toku** (výkon i čitelnost).
* **U API pečlivě zvaž `checked` vs `unchecked`** (I/O typicky checked; doménová porušení spíše unchecked).
* **Try-with-resources** používej všude, kde jde (i s formou **[JDK 9+]** „`try (res)`“).
* **Slaď `equals`/`hashCode` s porovnáváním** u kolekcí chyb; výjimky mají být výjimečné, ne běžný signál.

## Minirecepty

### Validace vstupu

```java
public static Path mustExist(Path p) throws FileNotFoundException {
    if (p == null) throw new NullPointerException("path is null");
    if (!Files.exists(p)) throw new FileNotFoundException(p.toString());
    return p;
}
```

### API „bez checked výjimek“

```java
public String readUnchecked(Path p) {
    try {
        return Files.readString(p);
    } catch (IOException e) {
        throw new UncheckedIOException("read failed: " + p, e);
    }
}
```

### Doménová výjimka (DDD styl)

```java
public void withdraw(BigDecimal amount) {
    if (amount.signum() <= 0) throw new IllegalArgumentException("amount <= 0");
    if (balance.compareTo(amount) < 0) {
        throw new DomainRuleViolationException("Insufficient funds");
    }
    balance = balance.subtract(amount);
}
```

### Novinky a užitečné změny od **JDK 9+** (souhrn)

* **Try-with-resources** nad **existující proměnnou** (`try (res)`) — **[JDK 9+]**.
* **`StackWalker` API** pro efektivní práci se zásobníkem a filtrování stack frames — **[JDK 9+]**.
* **Helpful NPE messages** – detailní texty `NullPointerException` (aktivace JVM volbou) — **[JDK 14+]**.
* **Sealed classes** – elegantnější návrh **uzavřených hierarchií výjimek** — **[JDK 17+]**.
* (Doplňkově) **Virtuální vlákna** mění charakter stack-trace u masivní paralelizace (diagnostika je přehlednější; výjimky se propagují jako obvykle) — **[JDK 21+]**.
