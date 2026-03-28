
# Strom – Tree

## Co je strom

**Strom** je acyklický orientovaný graf s jedním **kořenem** (*root*), kde každá hrana vede od rodiče k dítěti a každý uzel má nanejvýš jednoho rodiče. Strom definuje **hierarchii**.

### Základní pojmy

* **Uzel (node)** – prvek stromu; může nést **klíč/hodnotu**.
* **Kořen (root)** – uzel bez rodiče.
* **List (leaf)** – uzel bez dětí.
* **Hloubka (depth)** uzlu – počet hran od kořene k uzlu.
* **Výška (height)** stromu – max. hloubka libovolného uzlu (počet hran v nejdelší cestě od kořene k listu).
* **Podstrom** – strom tvořený uzlem a všemi jeho potomky.
* **Stupeň (degree)** uzlu – počet dětí (v **binárním** stromu max. 2: `left`, `right`).

## Proč stromy?

* Reprezentují **hierarchii** (DOM, souborové systémy, AST).
* Umožňují **rychlé vyhledávání** podle klíče (BST, B-stromy, Trie).
* Základ pro priority (`Heap`), indexy databází (B+/B-stromy), autocompletion (Trie).

## Procházky stromem (traversals)

* **DFS** (hloubkově):

  * **Preorder**: `root → left → right` (např. budování prefixových výrazů).
  * **Inorder**: `left → root → right` (u **BST** dává **seřazené** klíče).
  * **Postorder**: `left → right → root` (mazání/poskládání).
* **BFS (level-order)**: po vrstvách (fronta).

## Binární vyhledávací strom (BST)

**Vlastnost BST:** pro každý uzel `x` platí:

* všechno v `left(x)` < `x.key`
* všechno v `right(x)` > `x.key`
  (bez duplicit, nebo duplicity řešíme konvencí – např. ignorovat, nebo držet počitadlo)

### Složitosti

* **Průměrně (náhodná data):** výška ~ O(log n) → `search/insert/delete` ≈ **O(log n)**.
* **Nejhorší případ (degenerace do „linky“):** výška **O(n)** → operace **O(n)**.
* **Vyvážené stromy** (AVL, Red–Black, B-stromy) drží výšku **O(log n)** vždy.

### Mazání v BST (3 případy)

1. **Uzel je list** → prostě odstraníme.
2. **Uzel má jedno dítě** → dítě „vytáhneme nahoru“.
3. **Uzel má dvě děti** → nahradíme **in-order nástupcem** (nejmenší v pravém podstromu) nebo **předchůdcem** (největší v levém), a ten následně smažeme v jeho původní pozici.

## Implementace po krocích – BST (Java)

> Třída `MyBST<E extends Comparable<? super E>>`: vnitřní uzel `Node<E> {E key; Node<E> left,right;}`, kořen `root`, velikost `size`.
> Bez vyvažování (učebnicový BST), duplicity **ignorujeme** (nepřidáme).

### 1) Uzel, stav, metriky

```java
private static final class Node<E> {
  E key;
  Node<E> left, right;
  Node(E key) { this.key = key; }
}

private Node<E> root;
private int size;

public int size() { return size; }
public boolean isEmpty() { return size == 0; }
```

### 2) Vyhledání (contains)

```java
public boolean contains(E key) {
  Node<E> cur = root;
  while (cur != null) {
    int cmp = key.compareTo(cur.key);
    if (cmp == 0) return true;
    cur = (cmp < 0) ? cur.left : cur.right;
  }
  return false;
}
```

### 3) Vložení (add) – iterativně

```java
public boolean add(E key) {
  if (root == null) { root = new Node<>(key); size = 1; return true; }
  Node<E> cur = root, parent = null;
  int cmp = 0;
  while (cur != null) {
    cmp = key.compareTo(cur.key);
    if (cmp == 0) return false;      // ignoruj duplicity
    parent = cur;
    cur = (cmp < 0) ? cur.left : cur.right;
  }
  Node<E> n = new Node<>(key);
  if (cmp < 0) parent.left = n; else parent.right = n;
  size++;
  return true;
}
```

### 4) Minimum, maximum, in-order pořadí

```java
private Node<E> minNode(Node<E> x) {
  if (x == null) return null;
  while (x.left != null) x = x.left;
  return x;
}
private Node<E> maxNode(Node<E> x) {
  if (x == null) return null;
  while (x.right != null) x = x.right;
  return x;
}

public E min() { Node<E> m = minNode(root); return m == null ? null : m.key; }
public E max() { Node<E> m = maxNode(root); return m == null ? null : m.key; }
```

### 5) Mazání (remove) – rekurzivní varianta

```java
public boolean remove(E key) {
  int old = size;
  root = removeRec(root, key);
  return size != old;
}

private Node<E> removeRec(Node<E> x, E key) {
  if (x == null) return null;
  int cmp = key.compareTo(x.key);
  if (cmp < 0) x.left  = removeRec(x.left, key);
  else if (cmp > 0) x.right = removeRec(x.right, key);
  else {
    // našli jsme x
    if (x.left == null) { size--; return x.right; }
    if (x.right == null){ size--; return x.left;  }
    // 2 děti: nahraď in-order nástupcem (min v pravém podstromu)
    Node<E> succ = minNode(x.right);
    x.key = succ.key;                 // přepíšeme klíč
    x.right = removeRec(x.right, succ.key); // smažeme nástupce
    // size se snížila uvnitř větve, ne tady
  }
  return x;
}
```

### 6) Procházky (DFS,in-order; BFS volitelně)

```java
public java.util.List<E> inorder() {
  java.util.List<E> out = new java.util.ArrayList<>(size);
  inorderRec(root, out);
  return out;
}
private void inorderRec(Node<E> x, java.util.List<E> out) {
  if (x == null) return;
  inorderRec(x.left, out);
  out.add(x.key);
  inorderRec(x.right, out);
}

public java.util.List<E> preorder() {
  java.util.List<E> out = new java.util.ArrayList<>(size);
  preorderRec(root, out);
  return out;
}
private void preorderRec(Node<E> x, java.util.List<E> out) {
  if (x == null) return;
  out.add(x.key);
  preorderRec(x.left, out);
  preorderRec(x.right, out);
}

public java.util.List<E> postorder() {
  java.util.List<E> out = new java.util.ArrayList<>(size);
  postorderRec(root, out);
  return out;
}
private void postorderRec(Node<E> x, java.util.List<E> out) {
  if (x == null) return;
  postorderRec(x.left, out);
  postorderRec(x.right, out);
  out.add(x.key);
}
```

### 7) Výška, čistění

```java
public int height() { return heightRec(root); }
private int heightRec(Node<E> x) {
  if (x == null) return -1; // výška prázdna = -1 (počet hran)
  return 1 + Math.max(heightRec(x.left), heightRec(x.right));
}

public void clear() { root = null; size = 0; }
```

> Pozn.: Tohle je **nevývažovaný** BST. Na setříděných vstupech se může snadno zdegenerovat na výšku **O(n)**. Pro garantované **O(log n)** používej **AVL** nebo **Red–Black** strom (s rotacemi).

## Mini-ukázka použití

```java
MyBST<Integer> t = new MyBST<>();
t.add(5); t.add(2); t.add(8); t.add(1); t.add(3);
System.out.println(t.contains(3));    // true
System.out.println(t.inorder());      // [1,2,3,5,8] (seřazeno)
t.remove(2);
System.out.println(t.inorder());      // [1,3,5,8]
System.out.println(t.min() + "..." + t.max()); // 1...8
System.out.println(t.height());       // závisí na tvaru stromu
```

# Úplná „kapesní“ implementace (vcelku)

```java
import java.util.ArrayList;
import java.util.List;

public class MyBST<E extends Comparable<? super E>> {
  private static final class Node<E> {
    E key;
    Node<E> left, right;
    Node(E key) { this.key = key; }
  }

  private Node<E> root;
  private int size;

  public int size() { return size; }
  public boolean isEmpty() { return size == 0; }

  // --- search/contains ---
  public boolean contains(E key) {
    Node<E> cur = root;
    while (cur != null) {
      int cmp = key.compareTo(cur.key);
      if (cmp == 0) return true;
      cur = (cmp < 0) ? cur.left : cur.right;
    }
    return false;
  }

  // --- insert ---
  public boolean add(E key) {
    if (root == null) { root = new Node<>(key); size = 1; return true; }
    Node<E> cur = root, parent = null; int cmp = 0;
    while (cur != null) {
      cmp = key.compareTo(cur.key);
      if (cmp == 0) return false; // no duplicates
      parent = cur;
      cur = (cmp < 0) ? cur.left : cur.right;
    }
    Node<E> n = new Node<>(key);
    if (cmp < 0) parent.left = n; else parent.right = n;
    size++;
    return true;
  }

  // --- min/max ---
  private Node<E> minNode(Node<E> x) {
    if (x == null) return null;
    while (x.left != null) x = x.left;
    return x;
  }
  private Node<E> maxNode(Node<E> x) {
    if (x == null) return null;
    while (x.right != null) x = x.right;
    return x;
  }
  public E min() { Node<E> m = minNode(root); return m == null ? null : m.key; }
  public E max() { Node<E> m = maxNode(root); return m == null ? null : m.key; }

  // --- delete ---
  public boolean remove(E key) {
    int old = size;
    root = removeRec(root, key);
    return size != old;
  }
  private Node<E> removeRec(Node<E> x, E key) {
    if (x == null) return null;
    int cmp = key.compareTo(x.key);
    if (cmp < 0) x.left = removeRec(x.left, key);
    else if (cmp > 0) x.right = removeRec(x.right, key);
    else {
      if (x.left == null) { size--; return x.right; }
      if (x.right == null){ size--; return x.left;  }
      Node<E> succ = minNode(x.right);
      x.key = succ.key;
      x.right = removeRec(x.right, succ.key);
    }
    return x;
  }

  // --- traversals ---
  public List<E> inorder() {
    List<E> out = new ArrayList<>(size);
    inorderRec(root, out); return out;
  }
  private void inorderRec(Node<E> x, List<E> out) {
    if (x == null) return;
    inorderRec(x.left, out);
    out.add(x.key);
    inorderRec(x.right, out);
  }

  public List<E> preorder() {
    List<E> out = new ArrayList<>(size);
    preorderRec(root, out); return out;
  }
  private void preorderRec(Node<E> x, List<E> out) {
    if (x == null) return;
    out.add(x.key);
    preorderRec(x.left, out);
    preorderRec(x.right, out);
  }

  public List<E> postorder() {
    List<E> out = new ArrayList<>(size);
    postorderRec(root, out); return out;
  }
  private void postorderRec(Node<E> x, List<E> out) {
    if (x == null) return;
    postorderRec(x.left, out);
    postorderRec(x.right, out);
    out.add(x.key);
  }

  // --- height & maintenance ---
  public int height() { return heightRec(root); }
  private int heightRec(Node<E> x) {
    if (x == null) return -1; // height by edges
    return 1 + Math.max(heightRec(x.left), heightRec(x.right));
  }

  public void clear() { root = null; size = 0; }
}
```
