# Behavioralní návrhové vzory

Behaviorální vzory řeší **spolupráci objektů**, toky událostí a odpovědností.

## Strategy

**Idea:** Zabalím algoritmus do objektu se společným rozhraním a **zaměňuji** ho za běhu.

**Kdy použít**

* máte více variant výpočtu/heuristiky;
* rozhoduje konfigurace, data či prostředí.

**Pozor**

* rozhraní držte malé;
* často stačí i **lambda** (funkční rozhraní).

**Ukázka**

```java
interface PricingStrategy { int priceCents(int base, int qty); }

class Regular implements PricingStrategy {
    public int priceCents(int base, int qty){ return base * qty; }
}
class BulkDiscount implements PricingStrategy {
    public int priceCents(int base, int qty){ return (int)(base * qty * (qty>=10?0.9:1.0)); }
}

class Cart {
    private PricingStrategy s;
    Cart(PricingStrategy s){ this.s = s; }
    void setStrategy(PricingStrategy s){ this.s = s; }
    int total(int base, int qty){ return s.priceCents(base, qty); }
}
```

## State

**Idea:** Chování objektu se **mění výměnou** objektu „stavu“, ne `switch`em.

**Kdy:** konečné automaty (objednávka, přehrávač, workflow).

**Pozor:**

* stavové třídy dělejte **neměnné**;
* kontext si předávají skrz `this`.

```java
interface PlayerState { void play(Player ctx); void pause(Player ctx); }

class Playing implements PlayerState {
    public void play(Player c)  { /* no-op */ }
    public void pause(Player c) { c.setState(new Paused()); }
}
class Paused implements PlayerState {
    public void play(Player c)  { c.setState(new Playing()); }
    public void pause(Player c) { /* no-op */ }
}

class Player {
    private PlayerState state = new Paused();
    void setState(PlayerState s){ state = s; }
    void play(){ state.play(this); }
    void pause(){ state.pause(this); }
}
```

## Template Method

**Idea:** Nadřazená třída definuje **kostru** algoritmu, podtřídy doplní **kroky**.

**Kdy:**

* stejná sekvence kroků, liší se detaily (import, export, build pipeline).

**Pozor:**

* šablonu často označte `final`;
* volitelné kroky dejte s výchozí implementací.

```java
abstract class DataImporter {
    public final void importAll(){ open(); read(); transform(); save(); close(); }
    protected abstract void open();
    protected abstract void read();
    protected void transform(){}       // volitelný krok
    protected abstract void save();
    protected void close(){ /* default */ }
}

class CsvImporter extends DataImporter {
    protected void open(){ /* ... */ }
    protected void read(){ /* ... */ }
    protected void save(){ /* ... */ }
}
```

## Observer (Pub/Sub)

**Idea:** Subjekt **notifikací** oznamuje změny více odběratelům (volně vázané).

**Kdy:**

* GUI eventy,
* doménové události,
* reaktivní scénáře.

**Pozor:**

* ošetřete výjimky posluchačů a reentranci;
* případně „slabé“ odběry.

```java
interface Observer { void onChange(int value); }

class Subject {
    private final java.util.List<Observer> obs = new java.util.ArrayList<>();
    private int v;
    void subscribe(Observer o){ obs.add(o); }
    void unsubscribe(Observer o){ obs.remove(o); }
    void set(int nv){
        v = nv;
        for (Observer o : new java.util.ArrayList<>(obs)) o.onChange(v);
    }
}
```

## Command

**Idea:** Akci zabalím do objektu **Command** → fronty, logování, **undo/redo**.

**Kdy:**

* GUI akce, skriptování, vzdálené spouštění, audit.

**Pozor:**

* ukládejte **jen to minimum stavu** potřebné pro `undo`.

```java
interface Command { void execute(); void undo(); }

class AddItem implements Command {
    private final java.util.List<String> list; private final String item;
    AddItem(java.util.List<String> list, String item){ this.list=list; this.item=item; }
    public void execute(){ list.add(item); }
    public void undo(){ list.remove(list.size()-1); }
}

class Invoker {
    private final java.util.Deque<Command> history = new java.util.ArrayDeque<>();
    void run(Command c){ c.execute(); history.push(c); }
    void undo(){ if(!history.isEmpty()) history.pop().undo(); }
}
```

## Iterator

**Idea:** Jednotné rozhraní pro **průchod** kolekcí bez znalosti jejich vnitřků. V Java je to `Iterator<T>` s `hasNext()` a `next()` metodami. Průchod často implementujete jako vnitřní třídu nebo anonymní třídu.
Procházení kolekcí v Java často využívá **for-each** smyčku.

**Kdy:** vlastní kontejner; speciální pořadí/filtrace.

**Pozor:** implementujte `Iterable<T>` kvůli `for-each`.

```java
class Range implements Iterable<Integer> {
    private final int start, endIncl;
    Range(int start, int endIncl){ this.start=start; this.endIncl=endIncl; }

    public java.util.Iterator<Integer> iterator() {
        return new java.util.Iterator<>() {
            private int cur = start;
            public boolean hasNext(){ return cur <= endIncl; }
            public Integer next(){ return cur++; }
        };
    }
}

for (int i : new Range(3,7)) System.out.print(i+" "); // 3 4 5 6 7
```

## Mediator

**Idea:** Místo aby komponenty komunikovaly **každý s každým**, mluví přes **mediátora** → méně vazeb.

**Kdy:** formuláře, chat místnosti, dialogy – mnoho interakcí mezi prvky.

**Pozor:** ať se z mediátora nestane „god object“; držte jej modulární.

```java
interface Mediator { void event(UIComponent from, String type); }
abstract class UIComponent { protected final Mediator m; UIComponent(Mediator m){ this.m = m; } }

class TextBox extends UIComponent {
    String text="";
    TextBox(Mediator m){ super(m); }
    void setText(String t){ text=t; m.event(this,"change"); }
}
class Button extends UIComponent {
    Button(Mediator m){ super(m); }
    void click(){ m.event(this,"click"); }
}

class LoginMediator implements Mediator {
    final TextBox user = new TextBox(this);
    final TextBox pass = new TextBox(this);
    final Button  submit = new Button(this);

    public void event(UIComponent from, String type) {
        if (from==submit && type.equals("click")) {
            if (user.text.isBlank() || pass.text.isBlank()) System.out.println("Missing data");
            else System.out.println("Logging in "+user.text);
        }
    }
}
```

## Memento

**Idea:** Uložím **snapshot stavu** objektu tak, aby ho bylo možné později **obnovit** (undo), ale neporušil se encapsulation.

**Kdy:** undo/redo; transakční změny modelu.

**Pozor:** memento může být paměťově náročné → zvažte **delta**/kompresi.

```java
class TextEditor {
    private StringBuilder buf = new StringBuilder();

    // Memento (vnitřní třída – zvenku nevidíme detaily)
    public static final class Memento {
        private final String snapshot;
        private Memento(String s){ this.snapshot=s; }
    }

    public void type(String s){ buf.append(s); }
    public String text(){ return buf.toString(); }
    public Memento save(){ return new Memento(buf.toString()); }
    public void restore(Memento m){ buf.setLength(0); buf.append(m.snapshot); }
}

class DemoMem {
    public static void main(String[] args) {
        TextEditor e = new TextEditor();
        e.type("Ahoj "); var m1 = e.save();
        e.type("světe"); var m2 = e.save();
        e.type("!!!");
        e.restore(m2); System.out.println(e.text()); // Ahoj světe
        e.restore(m1); System.out.println(e.text()); // Ahoj 
    }
}
```

## Chain of Responsibility

**Idea:** Požadavek prochází **řetězem** handlerů; první, kdo umí, ho odbaví.

**Kdy:** validační/povolovací pravidla, logování, filtry.

**Pozor:** jasně definujte **kdy** se má řetězec **zastavit**.

```java
abstract class Handler {
    private Handler next;
    public Handler linkWith(Handler h){ this.next=h; return h; }
    public void handle(String req){
        if (process(req) && next!=null) next.handle(req);
    }
    protected abstract boolean process(String req);
}

class AuthHandler extends Handler {
    protected boolean process(String req){ boolean ok=req.startsWith("user:"); 
        if(!ok) System.out.println("Auth failed"); return ok; }
}
class RightsHandler extends Handler {
    protected boolean process(String req){ boolean ok=req.contains(":admin"); 
        if(!ok) System.out.println("No admin"); return ok; }
}

Handler h = new AuthHandler().linkWith(new RightsHandler());
h.handle("user:pepa:admin");   // projde oběma
h.handle("guest");             // skončí na Auth
```

## Visitor

**Idea:** Přidávám nové **operace** nad **stabilní strukturou** objektů bez úprav jejich tříd.

**Kdy:** AST, souborové stromy, výrazové stromy – struktura se nemění často, ale operací přibývá.

**Pozor:** přidání **nového typu uzlu** vyžaduje změny ve všech visitorech.

```java
interface Node { <R> R accept(Visitor<R> v); }
interface Visitor<R> {
    R visit(NumberNode n);
    R visit(AddNode n);
}

class NumberNode implements Node {
    final int v; NumberNode(int v){ this.v=v; }
    public <R> R accept(Visitor<R> v){ return v.visit(this); }
}
class AddNode implements Node {
    final Node a,b; AddNode(Node a, Node b){ this.a=a; this.b=b; }
    public <R> R accept(Visitor<R> v){ return v.visit(this); }
}

// Operace 1: vyhodnocení
class Eval implements Visitor<Integer> {
    public Integer visit(NumberNode n){ return n.v; }
    public Integer visit(AddNode n){ return n.a.accept(this) + n.b.accept(this); }
}

// Operace 2: tisk
class Print implements Visitor<String> {
    public String visit(NumberNode n){ return Integer.toString(n.v); }
    public String visit(AddNode n){ return "(" + n.a.accept(this) + " + " + n.b.accept(this) + ")"; }
}
```
## Interpreter

**Idea:** Definuji **gramatiku** mini-jazyka a pro každý symbol třídu. Vyhodnocení probíhá rekurzivně nad stromem výrazů.

**Kdy:** jednoduché doménové jazyky (filtry, pravidla, dotazy), kde plnohodnotný parser je „kanón na vrabce“.

**Pozor:** roste-li gramatika, roste i počet tříd → zvažte parser/kompilátor.

```java
interface Expr { int eval(); }

class Num implements Expr { final int v; Num(int v){ this.v=v; } public int eval(){ return v; } }
class Add implements Expr { final Expr a,b; Add(Expr a, Expr b){ this.a=a; this.b=b; } public int eval(){ return a.eval()+b.eval(); } }
class Mul implements Expr { final Expr a,b; Mul(Expr a, Expr b){ this.a=a; this.b=b; } public int eval(){ return a.eval()*b.eval(); } }

Expr e = new Mul(new Add(new Num(2), new Num(3)), new Num(4)); // (2+3)*4
System.out.println(e.eval()); // 20
```

## Rychlá mapa „co kdy“

* **Více algoritmů?** → Strategy
* **Stavová logika?** → State
* **Stejné kroky, různé detaily?** → Template Method
* **Eventy a odběry?** → Observer
* **Undo/redo, fronty?** → Command
* **Vlastní kontejner/průchod?** → Iterator
* **Mnoho vzájemných závislostí?** → Mediator
* **Snapshot stavu?** → Memento
* **Sekvence filtrů/pravidel?** → Chain of Responsibility
* **Nové operace nad stabilní strukturou?** → Visitor
* **Mini DSL?** → Interpreter
