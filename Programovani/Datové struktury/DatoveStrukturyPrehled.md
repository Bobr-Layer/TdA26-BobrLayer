# Datové struktury

**Datová struktura** je způsob, jak organizovat a ukládat data v paměti počítače tak, aby se s nimi efektivně pracovalo. Různé datové struktury jsou optimalizovány pro různé operace, jako je přidávání, mazání, vyhledávání a iterace.

* **Základní datové struktury**: Vyskytují se ve všecbech programovacích jazycích a za běhu programu nemění svůj rozsah. Jsou základem pro složitější datové struktury a algoritmy.
  * Proměnná - pojmenovaná paměťová buňka pro uložení hodnoty.  
    * Lokální proměnná - deklarovaná uvnitř funkce/metody, dostupná pouze v jejím rozsahu.
    * Globální proměnná - deklarovaná mimo všechny funkce, dostupná v celém programu.
    * Dynamická proměnná - alokovaná na haldě, může být přístupná přes ukazatel/referenci, životnost řízena ručně (např. v C) nebo garbage collectorem (např. v Javě).
  * Pole (Array) - pevně velikostní kolekce stejného typu.
  * Struktura (Struct) - kolekce různých typů dat, často používaná v jazycích jako C.
  * Objekt (Object) - základní jednotka v objektově orientovaném programování, může obsahovat data (vlastnosti) a chování (metody).
* **Odvozené datové struktury**: Vytvořeny na základě základních struktur, často kombinací více struktur pro dosažení specifických vlastností nebo optimalizací. Za běhu programu mohou měnit svůj rozsah a strukturu.
  * Seznam (List) - dynamická kolekce, která může růst a zmenšovat se, často implementována jako pole nebo propojený seznam.
  * Strom (Tree) - hierarchická struktura, kde každý prvek (uzel) může mít více potomků, často používaná pro organizaci dat pro rychlé vyhledávání.
  * Zásobník (Stack) - kolekce, která funguje na principu LIFO (Last In, First Out), často implementována jako pole nebo propojený seznam.
  * Fronta (Queue) - kolekce, která funguje na principu FIFO (First In, First Out), často implementována jako pole nebo propojený seznam.
  * Priority Queue - kolekce, kde každý prvek má přiřazenou prioritu, a prvky jsou vybírány podle priority, často implementována jako halda.
  * Hashovací tabulka (Hash Table) - struktura pro ukládání klíč-hodnota párů, umožňuje rychlé vyhledávání na základě klíče, často implementována jako pole s hashovací funkcí pro rozptyl klíčů.
  * Množina (Set) - kolekce unikátních prvků, často implementována jako hashovací tabulka nebo strom.

## Rozdělení datových struktur podle charakteru uspořádání a implementace:

1. **Lineární struktury**: Data jsou uspořádána v sekvenčním pořadí (např. pole, seznamy, fronty, zásobníky).
2. **Množiny a mapy**: Umožňují rychlé vyhledávání a ukládání klíč-hodnota (např. hash sety, hash mapy, stromové množiny).
3. **Stromy, haldy, trie**: Hierarchické struktury pro uspořádání dat (např. binární vyhledávací stromy, haldy, B-stromy, trie).
4. **Grafy**: Složitější struktury pro reprezentaci vztahů mezi objekty (např. seznamy sousedů, matice sousednosti).
5. **Imutabilní kolekce**: Struktury, které nelze měnit po vytvoření (např. `List.of`, `Map.of` v Javě).
6. **Specializované struktury**: Pro specifické účely, jako jsou Bloomovy filtry, skip listy, segmentové stromy atd.
7. **Datové struktury pro paralelní a distribuované systémy**: Například ConcurrentHashMap, CopyOnWriteArrayList, distribuované hashovací tabulky (DHT) jako Apache Cassandra.
8. **Persistentní datové struktury**: Struktury, které zachovávají předchozí verze po modifikaci (např. persistentní stromové struktury používané v funkcionálních jazycích).



## Přehled datových struktur

## Lineární struktury

| Struktura                      | Přístup (index) | Vyhledání |                                        Vložení |                  Smazání | Typické použití                              |
| ------------------------------ | --------------: | --------: | ---------------------------------------------: | -----------------------: | -------------------------------------------- |
| Pole (fixed array)             |        **O(1)** |      O(n) |                                      – (fixní) |                – (fixní) | Statická data, nízké náklady, práce s indexy |
| Dynamické pole (ArrayList)     | **O(1)** amort. |      O(n) | Amort. **O(1)** (na konec) / O(n) (doprostřed) |                     O(n) | Většina sekvenčních kolekcí, push na konec   |
| Jednosměrný seznam             |            O(n) |      O(n) |                 **O(1)** (na zač./za ukazatel) |   **O(1)** (za ukazatel) | Časté vkládání/mazání uprostřed známé pozice |
| Dvousměrný seznam (LinkedList) |            O(n) |      O(n) |                    **O(1)** (známý uzel/okraj) |                 **O(1)** | Deque, fronty, časté operace na okrajích     |
| Stack (LIFO)                   |               – |         – |                                  **O(1)** push |             **O(1)** pop | Reverzování, backtracking, volání funkcí     |
| Queue (FIFO)                   |               – |         – |                               **O(1)** enqueue |         **O(1)** dequeue | Plánování, BFS, fronty událostí              |
| Deque                          |               – |         – |                       **O(1)** na obou koncích | **O(1)** na obou koncích | Obecná oboustranná fronta/stack              |

## Množiny a mapy

| Struktura                                        |         Test členství / get |         Vložení |         Smazání | Poznámka                                       |
| ------------------------------------------------ | --------------------------: | --------------: | --------------: | ---------------------------------------------- |
| Hash set / hash map                              | Amort. **O(1)**, worst O(n) | Amort. **O(1)** | Amort. **O(1)** | Neuspořádané; skvělé pro rychlé lookupy        |
| Stromová množina/mapa (vyvážený BST – Red-Black) |                **O(log n)** |    **O(log n)** |    **O(log n)** | Uspořádané podle klíče, rozsahové dotazy       |
| Ordered hash (LinkedHash*)                       |             Amort. **O(1)** | Amort. **O(1)** | Amort. **O(1)** | Zachovává pořadí vložení/LRU (order by access) |

## Stromy, haldy, trie

| Struktura              |              Vyhledání | Vložení/Smazání | Typické použití                     |
| ---------------------- | ---------------------: | --------------: | ----------------------------------- |
| BST (vyvážené: AVL/RB) = Binární vyhledávací strom |           **O(log n)** |    **O(log n)** | Uspořádaná data, min/max, rozsahy   |
| Heap (min/max)         |       min/max **O(1)** |    **O(log n)** | Priority queue, plánování, Dijkstra |
| B-strom (B-tree)       |           **O(log n)** |    **O(log n)** | Disk/DB indexy, velká bloková data  |
| Trie - prefixový strom                | O(k) (k = délka klíče) |            O(k) | Autocomplete, prefixové vyhledávání |

## Grafy

| Reprezentace       |  Paměť |     Sousedé vrcholu | Pro řídké vs. husté |
| ------------------ | -----: | ------------------: | ------------------- |
| Seznamy sousedů    | O(V+E) |    Rychlé (iterace) | Řídké grafy (běžné) |
| Matice sousednosti |  O(V²) | Test hrany **O(1)** | Husté grafy, malé V |

## Kdy co použít (rychlá navigace)

* **Rychlý náhodný přístup a přidávání na konec:** `ArrayList`
* **Časté operace na začátku/koncích:** `ArrayDeque` (doporučeno) nebo `LinkedList`
* **Rychlé „je v množině?“ / „dej hodnotu pro klíč“:** `HashSet` / `HashMap`
* **Potřebuji řazení podle klíčů (min/max, range query):** `TreeSet` / `TreeMap`
* **Priority (vždy nejmenší/největší první):** `PriorityQueue` (binární halda)
* **Zachovat pořadí vložení / LRU pořadí přístupu:** `LinkedHashMap` / `LinkedHashSet`
* **Prefixy/slovníky slov:** trie (v Javě vlastní implementace)
* **Grafové algoritmy:** seznamy sousedů (`Map<V, List<V>>`), u malých hustých grafů matice `boolean[][]`

## Poznámky & tipy

* **Amortizace:** Dynamická pole a hash-struktury mají průměrně O(1) díky reallocaci/rehash pouze občas.
* **Iterační pořadí:** `HashMap/HashSet` negarantují pořadí; `LinkedHash*` ano; `Tree*` řadí podle komparátoru.
* **Velikost tabulky/Load factor:** U hashů ovlivňuje výkon; defaulty JDK bývají rozumné (např. 0.75).
* **`Stack` je legacy:** preferuj `Deque` (`ArrayDeque`) pro LIFO.
* **Imutabilní kolekce:** Pro bezpečné sdílení stavu použij `List.copyOf`, `Map.of` apod. (od Javy 9).
