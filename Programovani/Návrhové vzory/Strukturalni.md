# Strukturalní návrhové vzory

Strukturalní vzory řeší **jak objekty skládat** do větších struktur.

## Adapter

**Idea:** „Překladač“ mezi **cílovým rozhraním** a **neslučitelným zdrojem**. Umožní použít cizí API bez zásahu do klientského kódu.

**Kdy použít**

* Integrujete knihovnu, která má „jiné“ metody/typy.
* Potřebujete zachovat stávající rozhraní veřejného API.

**Pasti**

* Nedělejte z adapteru „kuchyňský dřez“. Držte **jednoduchý mapovací převod**.

**Ukázka**

```java
// Cílové rozhraní, které klient zná
interface ImageReader { byte[] readPng(String path); }

// Cizí knihovna (nelze měnit)
class LegacyBmpLib {
    public byte[] loadBmp(String file) { /*...*/ return new byte[0]; }
    public byte[] convertBmpToPng(byte[] bmp) { /*...*/ return new byte[0]; }
}

// Adapter
class BmpToPngAdapter implements ImageReader {
    private final LegacyBmpLib lib = new LegacyBmpLib();
    public byte[] readPng(String path) {
        byte[] bmp = lib.loadBmp(path);
        return lib.convertBmpToPng(bmp);
    }
}

// Použití
ImageReader r = new BmpToPngAdapter();
byte[] png = r.readPng("pic.bmp");
```

## Bridge

**Idea:** Odděl **abstrakci** (co dělám) od **implementace** (jak to dělám), aby se obě osa vyvíjela nezávisle (křížově kombinovatelná matice).

**Kdy použít**

* Dvě dimenze variací (např. tvar × renderer, vzdálené storage × lokální storage).
* Nechcete násobit třídy dědičností.

**Pasti**

* Nepřeklopit dědičnost do příliš hluboké kompozice — držte rozhraní **malé a stabilní**.

**Ukázka**

```java
interface Renderer { void drawCircle(int x, int y, int r); }

class VectorRenderer implements Renderer {
    public void drawCircle(int x, int y, int r) { System.out.println("Vector circle"); }
}
class RasterRenderer implements Renderer {
    public void drawCircle(int x, int y, int r) { System.out.println("Raster circle"); }
}

// Abstrakce má referenci na implementaci
abstract class Shape {
    protected final Renderer renderer;
    protected Shape(Renderer r) { this.renderer = r; }
    abstract void draw();
}

class Circle extends Shape {
    private final int x,y,r;
    Circle(Renderer r, int x, int y, int r){ super(r); this.x=x; this.y=y; this.r=r; }
    void draw(){ renderer.drawCircle(x,y,r); }
}

Shape s = new Circle(new RasterRenderer(), 10,10,5);
s.draw();
```

## Composite

**Idea:** Uspořádej objekty do **stromu** a poskytni **sjednocené rozhraní** pro list i uzel. Klient pracuje s „část–celek“ stejně.

**Kdy použít**

* Hierarchie (menu, souborový systém, scény, GUI komponenty).
* Potřebujete rekurzivní operace (sumy, vykreslení, hledání).

**Pasti**

* Jasně definujte, co smí dělat **list** vs. **kompozit** (např. `add` na listu vyhodí `UnsupportedOperationException`).

**Ukázka**

```java
import java.util.*;

interface Node {
    int size();
    default void add(Node n) { throw new UnsupportedOperationException(); }
}

class FileNode implements Node {
    private final int bytes;
    FileNode(int bytes) { this.bytes = bytes; }
    public int size() { return bytes; }
}

class DirNode implements Node {
    private final List<Node> children = new ArrayList<>();
    public void add(Node n) { children.add(n); }
    public int size() { return children.stream().mapToInt(Node::size).sum(); }
}

// Použití
DirNode root = new DirNode();
root.add(new FileNode(10));
DirNode sub = new DirNode();
sub.add(new FileNode(5));
root.add(sub);
System.out.println(root.size()); // 15
```

## Decorator

**Idea:** Přidej **dodatečné chování** objektu **za běhu** tak, že ho zabalíš do objektu se stejným rozhraním. Preferuje **kompozici před dědičností**.

**Kdy použít**

* Chcete skládat featury (logování, cache, komprese, šifrování).
* Variace, které by jinak vedly k výbuchu počtu podtříd.

**Pasti**

* Nedekorujte „slepě“ (může se násobit latence). Dodržujte **Single Responsibility**.

**Mini-ukázka**

```java
interface Text { String render(); }

class PlainText implements Text { public String render(){ return "Hello"; } }

abstract class TextDecorator implements Text {
    protected final Text inner;
    protected TextDecorator(Text inner){ this.inner = inner; }
}

class Bold extends TextDecorator {
    Bold(Text t){ super(t); }
    public String render(){ return "<b>" + inner.render() + "</b>"; }
}

class Italic extends TextDecorator {
    Italic(Text t){ super(t); }
    public String render(){ return "<i>" + inner.render() + "</i>"; }
}

// Skládání za běhu
Text t = new Italic(new Bold(new PlainText()));
System.out.println(t.render()); // <i><b>Hello</b></i>
```

## Facade

**Idea:** Vytvoř **jednoduché jednotné API** nad **komplexním subsystémem**. Zákazník vidí pár metod; uvnitř se orchestrace postará o zbytek.

**Kdy použít**

* Modul má „příliš mnoho pák“—chcete **happy-path** operace.
* Snižujete **vazbu** mezi klientem a vnitřkem (lepší testovatelnost i evoluce).

**Pasti**

* Nepřekrývejte chyby; facade má **propagovat výjimky smysluplně**.
* Facade není „god object“—necpěte tam vše.

**Ukázka**

```java
class AuthService { boolean checkToken(String t){ return true; } }
class BillingService { void charge(int cents){ /*...*/ } }
class ShippingService { void ship(String addr){ /*...*/ } }

class OrderFacade {
    private final AuthService auth = new AuthService();
    private final BillingService bill = new BillingService();
    private final ShippingService ship = new ShippingService();

    public void placeOrder(String token, int priceCents, String address) {
        if (!auth.checkToken(token)) throw new SecurityException("Bad token");
        bill.charge(priceCents);
        ship.ship(address);
    }
}

// Použití
new OrderFacade().placeOrder("abc", 1999, "Hlavní 1, Praha");
```

## Flyweight

**Idea:** **Sdílej vnitřní (intrinsic) stav** mezi mnoha objekty a ulož pouze **vnější (extrinsic)** stav per-objekt → dramaticky šetří **paměť**.

**Kdy použít**

* Masivní počet téměř identických objektů (znaky, dlaždice mapy, styly).
* Vysoké paměťové nároky kvůli duplicitám.

**Pasti**

* Rozlišujte, co je **sdílitelný** vs. **nesdílitelný** stav.
* Sdílené objekty musí být **neměnné / thread-safe**.

**Ukázka**

```java
import java.util.*;

final class Glyph {
    private final char ch;   // intrinsic (sdílený)
    private final String font;
    private Glyph(char ch, String font){ this.ch=ch; this.font=font; }
    // Factory se stará o sdílení
    private static final Map<String, Glyph> cache = new HashMap<>();
    public static Glyph of(char ch, String font){
        String key = ch + "@" + font;
        return cache.computeIfAbsent(key, k -> new Glyph(ch, font));
    }
    // extrinsic stav (x,y) se předává při použití:
    public void draw(int x, int y){ /* kresli ch/font na x,y */ }
}
```

## Proxy

**Idea:** „Zástupný“ objekt se **stejným rozhraním** jako reálný předmět, ale přidává **nefunkční chování**: lazy načítání, ochrana, vzdálené volání, cache, logování…

**Varianty**

* **Virtual Proxy** (odložené vytvoření/načtení těžkého objektu).
* **Protection Proxy** (kontrola přístupu).
* **Remote Proxy** (síťová komunikace za lokálním rozhraním).
* **Caching Proxy** (memoizace, TTL).

**Pasti**

* Dávejte pozor na **reentranci** a **invalidaci cache**.
* Proxy by měla být **transparentní** — zachovat očekávané chování.

**Ukázka (Virtual + Caching)**

```java
interface Report { String data(); }

// Těžká implementace
class HeavyReport implements Report {
    private final String payload;
    public HeavyReport() {
        // předstírané drahé načtení
        payload = "REPORT:" + "x".repeat(1_000_000);
    }
    public String data(){ return payload; }
}

// Proxy
class ReportProxy implements Report {
    private HeavyReport real;      // lazy
    private String cached;         // jednoduchá cache
    public String data() {
        if (cached != null) return cached;
        if (real == null) real = new HeavyReport();
        return cached = real.data();
    }
}

// Použití
Report r = new ReportProxy();
System.out.println(r.data().length());
System.out.println(r.data().length()); // druhé volání z cache
```

## Jak vybírat (stručná mapa)

* **Nestandardní API vs. očekávané API?** → Adapter
* **Dvě ortogonální osy variací?** → Bridge
* **Hierarchie část–celek?** → Composite
* **Přidat chování bez dědičnosti a skládat featury?** → Decorator
* **Zjednodušit komplexní subsystém?** → Facade
* **Paměťová úspora sdílením stavu?** → Flyweight
* **Ochrana/lazy/cache/remote za stejné rozhraní?** → Proxy
