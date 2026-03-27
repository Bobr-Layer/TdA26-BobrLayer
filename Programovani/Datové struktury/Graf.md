# Graf – Graph

## Co je graf

**Graf** $G = (V, E)$ je množina **vrcholů** $V$ a **hran** $E$.

* **Orientovaný graf (digraf):** hrany jsou uspořené dvojice $(u,v)$ – šipky.
* **Neorientovaný graf:** hrany jsou dvojice $\{u,v\}$ – bez směru.
* **Ohodnocený graf:** každá hrana má **váhu** (např. délku, cenu).

## Základní pojmy

* **Stupeň** vrcholu: počet incidentních hran (u digrafu **in-degree** / **out-degree**).
* **Cesta, délka cesty** (součet vah nebo počet hran).
* **Souvislost / silná souvislost**.
* **Cyklus** – cesta začíná i končí ve stejném vrcholu (bez opakování hran/vrcholů, dle definice).
* **DAG** – orientovaný acyklický graf (žádné orientované cykly).

## Reprezentace grafu

* **Seznamy sousedů (adjacency list)**
  `Map<V, List<Edge<V>>>` – paměťově úsporné pro řídké grafy, průchod sousedů v **O(stupeň)**.
* **Maticová reprezentace (adjacency matrix)**
  `n×n` matice – vhodné pro husté grafy; test hrany v **O(1)**, ale paměť **O(n²)**.
* **Hrany v seznamu** `List<Edge>` – užitečné pro algoritmy jako Kruskal.

V této implementaci použijeme **seznamy sousedů** s volitelnou orientovaností a váhami `double`.

## Typické operace a složitost (adjacency list)

| Operace                       |            Složitost |
| ----------------------------- | -------------------: |
| Přidání vrcholu               |      amort. **O(1)** |
| Přidání hrany (u, v)          |             **O(1)** |
| Odstranění hrany              |     **O(stupeň(u))** |
| Výpis sousedů(u)              |     **O(stupeň(u))** |
| BFS/DFS                       |         **O(V + E)** |
| Dijkstra (binary heap)        | **O((V + E) log V)** |
| Topologické řazení (Kahn/DFS) |         **O(V + E)** |

## Vybrané algoritmy (intuice)

* **BFS** (fronta): nejkratší počet hran v neohodnoceném grafu, vrstvy.
* **DFS** (zásobník/rekurze): průzkum do hloubky, detekce cyklů, komponenty.
* **Dijkstra**: nejkratší cesty s **ne-zápornými** vahami.
* **Topologické řazení**: pořadí vrcholů v **DAGu** tak, aby všechny hrany šly „zleva doprava“. Neexistuje-li (cyklus) → chyba.

## Implementace po krocích (Java, adjacency list)

> Vše patří do třídy `Graph<V>`.
> Uvnitř: `Map<V, List<Edge<V>>> adj; boolean directed;`
> `Edge<V>`: cílový vrchol `to`, váha `w`.

### 1) Stav, pomocné třídy, konstrukce

```java
private static final class Edge<V> {
  final V to;
  final double w;
  Edge(V to, double w) { this.to = to; this.w = w; }
}

private final java.util.Map<V, java.util.List<Edge<V>>> adj = new java.util.HashMap<>();
private final boolean directed;

public Graph(boolean directed) { this.directed = directed; }

public boolean isDirected() { return directed; }
public int vertexCount() { return adj.size(); }
public int edgeCount() {
  int m = adj.values().stream().mapToInt(java.util.List::size).sum();
  return directed ? m : m / 2;
}
```

### 2) Přidání vrcholu a hrany

```java
public void addVertex(V v) { adj.computeIfAbsent(v, k -> new java.util.ArrayList<>()); }

public void addEdge(V u, V v, double w) {
  addVertex(u); addVertex(v);
  adj.get(u).add(new Edge<>(v, w));
  if (!directed) adj.get(v).add(new Edge<>(u, w));
}

// zkráceně pro neohodnocené grafy (váha = 1)
public void addEdge(V u, V v) { addEdge(u, v, 1.0); }
```

### 3) Odstranění hrany/vrcholu

```java
public boolean removeEdge(V u, V v) {
  java.util.List<Edge<V>> lu = adj.get(u);
  if (lu == null) return false;
  boolean changed = lu.removeIf(e -> java.util.Objects.equals(e.to, v));
  if (!directed) {
    java.util.List<Edge<V>> lv = adj.get(v);
    if (lv != null) changed |= lv.removeIf(e -> java.util.Objects.equals(e.to, u));
  }
  return changed;
}

public boolean removeVertex(V v) {
  if (!adj.containsKey(v)) return false;
  // odstranit v z cizích seznamů
  for (var list : adj.values()) list.removeIf(e -> java.util.Objects.equals(e.to, v));
  adj.remove(v);
  return true;
}
```

### 4) Sousedé a stupeň

```java
public java.util.List<V> neighbors(V v) {
  var list = adj.getOrDefault(v, java.util.List.of());
  java.util.List<V> out = new java.util.ArrayList<>(list.size());
  for (var e : list) out.add(e.to);
  return out;
}

public int degree(V v) {
  if (directed) throw new UnsupportedOperationException("Use in/out degree in directed graphs");
  return adj.getOrDefault(v, java.util.List.of()).size();
}
public int outDegree(V v) { return adj.getOrDefault(v, java.util.List.of()).size(); }
public int inDegree(V v) {
  int d = 0;
  for (var es : adj.values()) for (var e : es) if (java.util.Objects.equals(e.to, v)) d++;
  return d;
}
```

### 5) BFS (vrací pořadí průchodu a vzdálenosti v hranách)

```java
public java.util.List<V> bfs(V start, java.util.Map<V, Integer> distOut) {
  java.util.List<V> order = new java.util.ArrayList<>();
  java.util.Queue<V> q = new java.util.ArrayDeque<>();
  java.util.Set<V> vis = new java.util.HashSet<>();
  q.add(start); vis.add(start);
  if (distOut != null) distOut.put(start, 0);

  while (!q.isEmpty()) {
    V u = q.poll();
    order.add(u);
    for (var e : adj.getOrDefault(u, java.util.List.of())) {
      V v = e.to;
      if (!vis.contains(v)) {
        vis.add(v); q.add(v);
        if (distOut != null) distOut.put(v, distOut.get(u) + 1);
      }
    }
  }
  return order;
}
```

### 6) DFS (iterativně přes zásobník; lze i rekurzivně)

```java
public java.util.List<V> dfs(V start) {
  java.util.List<V> order = new java.util.ArrayList<>();
  java.util.Set<V> vis = new java.util.HashSet<>();
  java.util.Deque<V> st = new java.util.ArrayDeque<>();
  st.push(start);
  while (!st.isEmpty()) {
    V u = st.pop();
    if (vis.add(u)) {
      order.add(u);
      // přidáme sousedy v opačném pořadí, aby se první procházel „levější“
      var list = adj.getOrDefault(u, java.util.List.of());
      for (int i = list.size() - 1; i >= 0; i--) st.push(list.get(i).to);
    }
  }
  return order;
}
```

### 7) Dijkstra (nejkratší cesty od `source`, nezáporné váhy)

```java
public java.util.Map<V, Double> dijkstra(V source, java.util.Map<V, V> parentOut) {
  java.util.Map<V, Double> dist = new java.util.HashMap<>();
  java.util.PriorityQueue<java.util.Map.Entry<V, Double>> pq =
      new java.util.PriorityQueue<>(java.util.Map.Entry.comparingByValue());

  for (V v : adj.keySet()) dist.put(v, Double.POSITIVE_INFINITY);
  dist.put(source, 0.0);
  pq.add(Map.entry(source, 0.0));

  while (!pq.isEmpty()) {
    var cur = pq.poll();
    V u = cur.getKey();
    double du = cur.getValue();
    if (du != dist.get(u)) continue; // zastaralý záznam

    for (var e : adj.getOrDefault(u, java.util.List.of())) {
      V v = e.to;
      double nd = du + e.w;
      if (nd < dist.getOrDefault(v, Double.POSITIVE_INFINITY)) {
        dist.put(v, nd);
        if (parentOut != null) parentOut.put(v, u);
        pq.add(Map.entry(v, nd));
      }
    }
  }
  return dist;
}
```

### 8) Topologické řazení (Kahn) – pouze pro **DAG**

```java
public java.util.List<V> topoSort() {
  if (!directed) throw new IllegalStateException("Topological sort is for directed graphs");
  java.util.Map<V, Integer> indeg = new java.util.HashMap<>();
  for (V v : adj.keySet()) indeg.put(v, 0);
  for (var es : adj.values()) for (var e : es) indeg.put(e.to, indeg.getOrDefault(e.to, 0) + 1);

  java.util.ArrayDeque<V> q = new java.util.ArrayDeque<>();
  for (var en : indeg.entrySet()) if (en.getValue() == 0) q.add(en.getKey());

  java.util.List<V> order = new java.util.ArrayList<>(adj.size());
  while (!q.isEmpty()) {
    V u = q.poll();
    order.add(u);
    for (var e : adj.getOrDefault(u, java.util.List.of())) {
      int d = indeg.merge(e.to, -1, Integer::sum);
      if (d == 0) q.add(e.to);
    }
  }
  if (order.size() != adj.size())
    throw new IllegalStateException("Graph has a cycle (not a DAG)");
  return order;
}
```

---

## Mini-ukázky použití

```java
Graph<String> g = new Graph<>(true);       // orientovaný
g.addEdge("A", "B", 2);
g.addEdge("A", "C", 1);
g.addEdge("B", "D", 4);
g.addEdge("C", "D", 1);

System.out.println(g.bfs("A", new java.util.HashMap<>())); // [A, B, C, D]
System.out.println(g.dfs("A"));                             // např. [A, C, D, B]

var parent = new java.util.HashMap<String, String>();
var dist = g.dijkstra("A", parent);                         // {A=0, C=1, D=2, B=2}
System.out.println(dist);

var topo = g.topoSort();                                    // např. [A, C, B, D]
System.out.println(topo);
```

## Úplná „kapesní“ implementace (vcelku)

```java
import java.util.*;
import java.util.Map.Entry;

public class Graph<V> {
  private static final class Edge<V> {
    final V to;
    final double w;
    Edge(V to, double w) { this.to = to; this.w = w; }
    @Override public String toString() { return "(" + to + ", w=" + w + ")"; }
  }

  private final Map<V, List<Edge<V>>> adj = new HashMap<>();
  private final boolean directed;

  public Graph(boolean directed) { this.directed = directed; }
  public boolean isDirected() { return directed; }

  public int vertexCount() { return adj.size(); }
  public int edgeCount() {
    int m = adj.values().stream().mapToInt(List::size).sum();
    return directed ? m : m / 2;
  }

  // --- modifikace ---
  public void addVertex(V v) { adj.computeIfAbsent(v, k -> new ArrayList<>()); }

  public void addEdge(V u, V v) { addEdge(u, v, 1.0); }
  public void addEdge(V u, V v, double w) {
    addVertex(u); addVertex(v);
    adj.get(u).add(new Edge<>(v, w));
    if (!directed) adj.get(v).add(new Edge<>(u, w));
  }

  public boolean removeEdge(V u, V v) {
    List<Edge<V>> lu = adj.get(u);
    if (lu == null) return false;
    boolean changed = lu.removeIf(e -> Objects.equals(e.to, v));
    if (!directed) {
      List<Edge<V>> lv = adj.get(v);
      if (lv != null) changed |= lv.removeIf(e -> Objects.equals(e.to, u));
    }
    return changed;
  }

  public boolean removeVertex(V v) {
    if (!adj.containsKey(v)) return false;
    for (var list : adj.values()) list.removeIf(e -> Objects.equals(e.to, v));
    adj.remove(v);
    return true;
  }

  // --- dotazy ---
  public List<V> vertices() { return new ArrayList<>(adj.keySet()); }

  public List<V> neighbors(V v) {
    var list = adj.getOrDefault(v, List.of());
    List<V> out = new ArrayList<>(list.size());
    for (var e : list) out.add(e.to);
    return out;
  }

  public int degree(V v) {
    if (directed) throw new UnsupportedOperationException("Use inDegree/outDegree in directed graphs");
    return adj.getOrDefault(v, List.of()).size();
  }
  public int outDegree(V v) { return adj.getOrDefault(v, List.of()).size(); }
  public int inDegree(V v) {
    int d = 0;
    for (var es : adj.values()) for (var e : es) if (Objects.equals(e.to, v)) d++;
    return d;
  }

  // --- BFS ---
  public List<V> bfs(V start, Map<V, Integer> distOut) {
    List<V> order = new ArrayList<>();
    Queue<V> q = new ArrayDeque<>();
    Set<V> vis = new HashSet<>();
    if (!adj.containsKey(start)) return order;
    q.add(start); vis.add(start);
    if (distOut != null) distOut.put(start, 0);

    while (!q.isEmpty()) {
      V u = q.poll();
      order.add(u);
      for (var e : adj.getOrDefault(u, List.of())) {
        V v = e.to;
        if (!vis.contains(v)) {
          vis.add(v); q.add(v);
          if (distOut != null) distOut.put(v, distOut.get(u) + 1);
        }
      }
    }
    return order;
  }

  // --- DFS (iterativně) ---
  public List<V> dfs(V start) {
    List<V> order = new ArrayList<>();
    if (!adj.containsKey(start)) return order;
    Set<V> vis = new HashSet<>();
    Deque<V> st = new ArrayDeque<>();
    st.push(start);
    while (!st.isEmpty()) {
      V u = st.pop();
      if (vis.add(u)) {
        order.add(u);
        var list = adj.getOrDefault(u, List.of());
        for (int i = list.size() - 1; i >= 0; i--) st.push(list.get(i).to);
      }
    }
    return order;
  }

  // --- Dijkstra (nezáporné váhy) ---
  public Map<V, Double> dijkstra(V source, Map<V, V> parentOut) {
    Map<V, Double> dist = new HashMap<>();
    for (V v : adj.keySet()) dist.put(v, Double.POSITIVE_INFINITY);
    if (!adj.containsKey(source)) return dist;

    dist.put(source, 0.0);
    PriorityQueue<Entry<V, Double>> pq =
        new PriorityQueue<>(Map.Entry.comparingByValue());
    pq.add(Map.entry(source, 0.0));

    while (!pq.isEmpty()) {
      var cur = pq.poll();
      V u = cur.getKey();
      double du = cur.getValue();
      if (du != dist.get(u)) continue; // zastaralý

      for (var e : adj.getOrDefault(u, List.of())) {
        V v = e.to;
        double nd = du + e.w;
        if (nd < dist.getOrDefault(v, Double.POSITIVE_INFINITY)) {
          dist.put(v, nd);
          if (parentOut != null) parentOut.put(v, u);
          pq.add(Map.entry(v, nd));
        }
      }
    }
    return dist;
  }

  // --- rekonstrukce cesty z parent mapy (volitelné) ---
  public List<V> reconstructPath(V source, V target, Map<V, V> parent) {
    List<V> path = new ArrayList<>();
    if (Objects.equals(source, target)) { path.add(source); return path; }
    V cur = target;
    while (cur != null && !Objects.equals(cur, source)) {
      path.add(cur);
      cur = parent.get(cur);
    }
    if (cur == null) return List.of(); // nedosažitelné
    path.add(source);
    java.util.Collections.reverse(path);
    return path;
  }

  // --- Topologické řazení (Kahn) ---
  public List<V> topoSort() {
    if (!directed) throw new IllegalStateException("Topological sort: directed graphs only");
    Map<V, Integer> indeg = new HashMap<>();
    for (V v : adj.keySet()) indeg.put(v, 0);
    for (var es : adj.values()) for (var e : es) indeg.put(e.to, indeg.getOrDefault(e.to, 0) + 1);

    ArrayDeque<V> q = new ArrayDeque<>();
    for (var en : indeg.entrySet()) if (en.getValue() == 0) q.add(en.getKey());

    List<V> order = new ArrayList<>(adj.size());
    while (!q.isEmpty()) {
      V u = q.poll();
      order.add(u);
      for (var e : adj.getOrDefault(u, List.of())) {
        int d = indeg.merge(e.to, -1, Integer::sum);
        if (d == 0) q.add(e.to);
      }
    }
    if (order.size() != adj.size())
      throw new IllegalStateException("Graph has a cycle (not a DAG)");
    return order;
  }
}
```
