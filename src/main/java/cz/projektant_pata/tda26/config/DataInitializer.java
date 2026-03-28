package cz.projektant_pata.tda26.config;

import cz.projektant_pata.tda26.model.branch.Branch;
import cz.projektant_pata.tda26.model.branch.BranchStatusEnum;
import cz.projektant_pata.tda26.model.branch.BranchTypeEnum;
import cz.projektant_pata.tda26.model.branch.RegionEnum;
import cz.projektant_pata.tda26.model.course.Course;
import cz.projektant_pata.tda26.model.course.StatusEnum;
import cz.projektant_pata.tda26.model.course.module.Module;
import cz.projektant_pata.tda26.model.course.material.Material;
import cz.projektant_pata.tda26.model.course.material.UrlMaterial;
import cz.projektant_pata.tda26.model.course.quiz.MultipleChoiceQuestion;
import cz.projektant_pata.tda26.model.course.quiz.OpenQuestion;
import cz.projektant_pata.tda26.model.course.quiz.Question;
import cz.projektant_pata.tda26.model.course.quiz.Quiz;
import cz.projektant_pata.tda26.model.course.quiz.SingleChoiceQuestion;
import cz.projektant_pata.tda26.model.user.RoleEnum;
import cz.projektant_pata.tda26.model.user.User;
import cz.projektant_pata.tda26.model.course.version.CourseVersion;
import cz.projektant_pata.tda26.repository.BranchRepository;
import cz.projektant_pata.tda26.repository.CourseRepository;
import cz.projektant_pata.tda26.repository.CourseVersionRepository;
import cz.projektant_pata.tda26.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import jakarta.transaction.Transactional;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final CourseVersionRepository courseVersionRepository;
    private final BranchRepository branchRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        // --- Pobočky ---
        Branch hqPraha = branchRepository.findByName("HQ Praha").orElseGet(() -> {
            Branch b = new Branch();
            b.setName("HQ Praha");
            b.setCountry("Czech Republic");
            b.setCity("Praha");
            b.setAddress("Václavské náměstí 1");
            b.setPostalCode("110 00");
            b.setRegion(RegionEnum.CENTRAL_EUROPE);
            b.setType(BranchTypeEnum.HQ);
            b.setStatus(BranchStatusEnum.ACTIVE);
            System.out.println("✅ Pobočka 'HQ Praha' byla vytvořena.");
            return branchRepository.save(b);
        });

        Branch brnoBranch = branchRepository.findByName("Brno Branch").orElseGet(() -> {
            Branch b = new Branch();
            b.setName("Brno Branch");
            b.setCountry("Czech Republic");
            b.setCity("Brno");
            b.setAddress("Náměstí Svobody 8");
            b.setPostalCode("602 00");
            b.setRegion(RegionEnum.CENTRAL_EUROPE);
            b.setType(BranchTypeEnum.BRANCH);
            b.setStatus(BranchStatusEnum.ACTIVE);
            System.out.println("✅ Pobočka 'Brno Branch' byla vytvořena.");
            return branchRepository.save(b);
        });

        Branch pardubiceBranch = branchRepository.findByName("Pardubice Branch").orElseGet(() -> {
            Branch b = new Branch();
            b.setName("Pardubice Branch");
            b.setCountry("Czech Republic");
            b.setCity("Pardubice");
            b.setAddress("Pernštýnské náměstí 1");
            b.setPostalCode("530 02");
            b.setRegion(RegionEnum.CENTRAL_EUROPE);
            b.setType(BranchTypeEnum.BRANCH);
            b.setStatus(BranchStatusEnum.ONBOARDING);
            System.out.println("✅ Pobočka 'Pardubice Branch' byla vytvořena.");
            return branchRepository.save(b);
        });

        // --- Uživatelé ---
        User superAdmin = userRepository.findByUsername("super_admin").orElseGet(() -> {
            User u = new User();
            u.setUsername("super_admin");
            u.setPassword(passwordEncoder.encode("TdA26!"));
            u.setRole(RoleEnum.SUPER_ADMIN);
            u.getManagedBranches().add(hqPraha);
            u.getManagedBranches().add(brnoBranch);
            u.getManagedBranches().add(pardubiceBranch);
            System.out.println("✅ Uživatel 'super_admin' byl vytvořen.");
            return userRepository.save(u);
        });

        User admin = userRepository.findByUsername("admin").orElseGet(() -> {
            User u = new User();
            u.setUsername("admin");
            u.setPassword(passwordEncoder.encode("TdA26!"));
            u.setRole(RoleEnum.ADMIN);
            u.getManagedBranches().add(hqPraha);
            u.getManagedBranches().add(brnoBranch);
            System.out.println("✅ Uživatel 'admin' byl vytvořen.");
            return userRepository.save(u);
        });

        User lecturer = userRepository.findByUsername("lecturer").orElseGet(() -> {
            User u = new User();
            u.setUsername("lecturer");
            u.setPassword(passwordEncoder.encode("TdA26!"));
            u.setRole(RoleEnum.LEKTOR);
            u.setBranch(hqPraha);
            System.out.println("✅ Uživatel 'lecturer' byl vytvořen.");
            return userRepository.save(u);
        });

        User student = userRepository.findByUsername("student").orElseGet(() -> {
            User u = new User();
            u.setUsername("student");
            u.setPassword(passwordEncoder.encode("TdA26!"));
            u.setRole(RoleEnum.STUDENT);
            System.out.println("✅ Uživatel 'student' byl vytvořen.");
            return userRepository.save(u);
        });

        // Seeder pro Kurzy
        if (courseRepository.count() == 0) {
            System.out.println("⏳ Spouštím seeder pro kurzy, moduly a kvízy...");

            // --- Kurzy ---
            Course c1 = new Course();
            c1.setName("Základy programování v Javě");
            c1.setDescription(
                    "Úvodní kurz do Javy. Ideální pro začátečníky, kteří chtějí proniknout do tajů objektového programování.");
            c1.setStatus(StatusEnum.Live);
            c1.setLector(lecturer);

            Course c2 = new Course();
            c2.setName("Vývoj webových aplikací s Reactem");
            c2.setDescription("Naučte se stavět moderní jednostránkové aplikace pomocí knihovny React a TypeScriptu.");
            c2.setStatus(StatusEnum.Live);
            c2.setLector(lecturer);

            Course c3 = new Course();
            c3.setName("Kybernetická bezpečnost 101");
            c3.setDescription(
                    "Pracovní koncept kurzu zabezpečení informačních systémů. Kurz zatím není určen pro veřejnost.");
            c3.setStatus(StatusEnum.Draft);
            c3.setLector(lecturer);

            // --- Moduly Kurz 1 ---
            Module m1 = new Module();
            m1.setName("1. Úvod do Javy a instalace");
            m1.setDescription("Jak nastavit JDK a napsat Hello World.");
            m1.setIndex(1);
            m1.setActivated(true);
            m1.setCourse(c1);
            c1.getModules().add(m1);

            UrlMaterial mat1 = new UrlMaterial();
            mat1.setName("Oficiální dokumentace Javy");
            mat1.setDescription("Odkaz na poslední specifikaci jazyka Java.");
            mat1.setUrl("https://docs.oracle.com/en/java/");
            mat1.setModule(m1);
            m1.getMaterials().add(mat1);

            Module m2 = new Module();
            m2.setName("2. Objektově orientované programování (OOP)");
            m2.setDescription("Základní pilíře OOP - dědičnost, polymorfismus, zapouzdření.");
            m2.setIndex(2);
            m2.setActivated(true);
            m2.setCourse(c1);
            c1.getModules().add(m2);

            // Kvíz Kurz 1 - Modul 2
            Quiz q1 = new Quiz();
            q1.setTitle("Závěrečný test: OOP v Javě");
            q1.setModule(m2);

            SingleChoiceQuestion sq1 = new SingleChoiceQuestion();
            sq1.setQuestion("Které z následujících klíčových slov se používá pro dědičnost v Javě?");
            sq1.setOptions(List.of("implements", "extends", "inherits", "super"));
            sq1.setCorrectIndex(1); // extends
            q1.addQuestion(sq1);

            MultipleChoiceQuestion mq1 = new MultipleChoiceQuestion();
            mq1.setQuestion("Vyberte vlastnosti, které patří ke 4 hlavním pilířům OOP:");
            mq1.setOptions(List.of("Zapouzdření", "Polymorfismus", "Kompilace", "Dědičnost"));
            mq1.setCorrectIndices(List.of(0, 1, 3));
            q1.addQuestion(mq1);

            OpenQuestion oq1 = new OpenQuestion();
            oq1.setQuestion("Vysvětlete vlastními slovy, co je to polymorfismus a uveďte příklad jeho využití v Javě.");
            oq1.setCorrectAnswer("Polymorfismus umožňuje pracovat s objekty různých tříd skrze společné rozhraní nebo nadtřídu. Příklad: metoda draw() volaná na referenci tvaru Shape se chová jinak pro Circle i Rectangle díky přepsání (override).");
            q1.addQuestion(oq1);

            m2.getQuizzes().add(q1);

            // --- Moduly Kurz 2 ---
            Module m3 = new Module();
            m3.setName("1. Komponentový přístup");
            m3.setDescription("Úvod do světa React komponent a JSX.");
            m3.setIndex(1);
            m3.setActivated(true);
            m3.setCourse(c2);
            c2.getModules().add(m3);

            UrlMaterial mat2 = new UrlMaterial();
            mat2.setName("React.dev Dokumentace");
            mat2.setDescription("Základní čtení o Reactu.");
            mat2.setUrl("https://react.dev/");
            mat2.setModule(m3);
            m3.getMaterials().add(mat2);

            // Zápis do Kurzů
            c1.addStudent(student);
            // c2 a c3 si student nezapsal

            // --- Moduly Kurz 3 (Draft — pro demo verzování) ---
            Module c3m1 = new Module();
            c3m1.setName("1. Základy síťové bezpečnosti");
            c3m1.setDescription("Protokoly, firewally, základní principy.");
            c3m1.setIndex(1);
            c3m1.setActivated(false);
            c3m1.setCourse(c3);
            UrlMaterial c3mat1 = new UrlMaterial();
            c3mat1.setName("OWASP Top 10");
            c3mat1.setDescription("Přehled nejčastějších bezpečnostních zranitelností.");
            c3mat1.setUrl("https://owasp.org/www-project-top-ten/");
            c3mat1.setModule(c3m1);
            c3m1.getMaterials().add(c3mat1);
            Quiz c3q1 = new Quiz();
            c3q1.setTitle("Test: Síťová bezpečnost");
            c3q1.setModule(c3m1);
            SingleChoiceQuestion c3sq1 = new SingleChoiceQuestion();
            c3sq1.setQuestion("Co znamená zkratka TLS?");
            c3sq1.setOptions(List.of("Transport Layer Security", "Trusted Login System", "Token Level Security", "Transfer Link Standard"));
            c3sq1.setCorrectIndex(0);
            c3q1.addQuestion(c3sq1);
            c3m1.getQuizzes().add(c3q1);
            c3.getModules().add(c3m1);

            Module c3m2 = new Module();
            c3m2.setName("2. Kryptografie a šifrování");
            c3m2.setDescription("Symetrické a asymetrické šifrování, certifikáty.");
            c3m2.setIndex(2);
            c3m2.setActivated(false);
            c3m2.setCourse(c3);
            UrlMaterial c3mat2 = new UrlMaterial();
            c3mat2.setName("Kryptografie — Khan Academy");
            c3mat2.setDescription("Interaktivní kurz kryptografie.");
            c3mat2.setUrl("https://www.khanacademy.org/computing/computer-science/cryptography");
            c3mat2.setModule(c3m2);
            c3m2.getMaterials().add(c3mat2);
            c3.getModules().add(c3m2);

            courseRepository.save(c1);
            courseRepository.save(c2);
            courseRepository.save(c3);

            // --- Verze kurzu c3 (3 snapshoty simulující vývoj) ---
            seedCourseVersions(c3);

            // --- Kurz 4: Programování v Javě — testové otázky ---
            Course c4 = new Course();
            c4.setName("Programování v Javě — testové otázky");
            c4.setDescription("Kurz obsahuje 100 testových otázek pokrývajících klíčová témata programování v Javě: datové struktury, OOP, kolekce, návrhové vzory, Stream API a další.");
            c4.setStatus(StatusEnum.Draft);
            c4.setLector(lecturer);

            Module m4 = new Module();
            m4.setName("Všechna témata");
            m4.setDescription("Testové otázky ze všech témat");
            m4.setIndex(1);
            m4.setActivated(true);
            m4.setCourse(c4);
            c4.getModules().add(m4);

            Quiz q2 = new Quiz();
            q2.setTitle("100 otázek — Programování v Javě");
            q2.setModule(m4);

            MultipleChoiceQuestion mq2_1 = new MultipleChoiceQuestion();
            mq2_1.setQuestion("Které z následujících tříd složitosti jsou polynomiální?");
            mq2_1.setOptions(List.of("O(n²)", "O(2ⁿ)", "O(n log n)", "O(n³)"));
            mq2_1.setCorrectIndices(List.of(0, 2, 3));
            q2.addQuestion(mq2_1);

            MultipleChoiceQuestion mq2_2 = new MultipleChoiceQuestion();
            mq2_2.setQuestion("Která tvrzení o notaci Big-O jsou správná?");
            mq2_2.setOptions(List.of("O(n) + O(n²) = O(n²)", "O(5n) = O(n)", "O(log n) je rychlejší než O(n)", "O(n!) je polynomiální"));
            mq2_2.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_2);

            MultipleChoiceQuestion mq2_3 = new MultipleChoiceQuestion();
            mq2_3.setQuestion("Které operace mají v dynamickém poli (ArrayList) amortizovanou složitost O(1)?");
            mq2_3.setOptions(List.of("Přidání prvku na konec", "Přidání prvku na začátek", "Přístup k prvku přes index", "Smazání prvku z prostředku"));
            mq2_3.setCorrectIndices(List.of(0, 2));
            q2.addQuestion(mq2_3);

            MultipleChoiceQuestion mq2_4 = new MultipleChoiceQuestion();
            mq2_4.setQuestion("Co platí o zásobníku (Stack, LIFO)?");
            mq2_4.setOptions(List.of("push a pop mají složitost O(1)", "peek vrátí vrchol bez odebrání", "prvky se odebírají z opačného konce než se vkládají", "je optimální pro BFS prohledávání grafů"));
            mq2_4.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_4);

            MultipleChoiceQuestion mq2_5 = new MultipleChoiceQuestion();
            mq2_5.setQuestion("Která tvrzení o frontě (Queue, FIFO) jsou pravdivá?");
            mq2_5.setOptions(List.of("enqueue přidává na konec, dequeue odebírá z čela", "peek nahlédne na čelo bez odebrání", "je vhodná pro plánování úloh a BFS", "poll() vyhodí výjimku na prázdné frontě"));
            mq2_5.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_5);

            MultipleChoiceQuestion mq2_6 = new MultipleChoiceQuestion();
            mq2_6.setQuestion("Které vlastnosti platí pro spojový seznam oproti poli?");
            mq2_6.setOptions(List.of("Vkládání na začátek je O(1)", "Přístup k prvku přes index je O(n)", "Paměťová réžie je vyšší kvůli ukazatelům", "Cache-lokalita je lepší než u pole"));
            mq2_6.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_6);

            MultipleChoiceQuestion mq2_7 = new MultipleChoiceQuestion();
            mq2_7.setQuestion("Které z následujících operací mají v HashMap složitost O(1) amortizovaně?");
            mq2_7.setOptions(List.of("put(key, value)", "get(key)", "containsKey(key)", "iterace přes všechny záznamy"));
            mq2_7.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_7);

            MultipleChoiceQuestion mq2_8 = new MultipleChoiceQuestion();
            mq2_8.setQuestion("Co platí o binárním vyhledávacím stromě (BST)?");
            mq2_8.setOptions(List.of("Vyhledání má složitost O(log n) u vyváženého BST", "Inorder průchod vrátí prvky v seřazeném pořadí", "Vložení může narušit vlastnost BST bez vyvažování", "Mazání kořene je vždy O(1)"));
            mq2_8.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_8);

            MultipleChoiceQuestion mq2_9 = new MultipleChoiceQuestion();
            mq2_9.setQuestion("Která tvrzení o binární haldě (min-heap) jsou správná?");
            mq2_9.setOptions(List.of("Kořen obsahuje nejmenší prvek", "Vložení a odebrání mají složitost O(log n)", "Halda je kompletní binární strom", "Hledání libovolného prvku je O(log n)"));
            mq2_9.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_9);

            MultipleChoiceQuestion mq2_10 = new MultipleChoiceQuestion();
            mq2_10.setQuestion("Které datové struktury jsou vhodné pro implementaci prioritní fronty?");
            mq2_10.setOptions(List.of("Binární halda", "Fibonacciho halda", "Neseřazené pole", "Červeno-černý strom"));
            mq2_10.setCorrectIndices(List.of(0, 1, 3));
            q2.addQuestion(mq2_10);

            MultipleChoiceQuestion mq2_11 = new MultipleChoiceQuestion();
            mq2_11.setQuestion("Co platí o hashovací tabulce s řetězením (chaining)?");
            mq2_11.setOptions(List.of("Kolize jsou řešeny spojovým seznamem v každém bucketu", "Průměrná složitost vyhledávání je O(1)", "Load factor ovlivňuje výkon", "Nejhorší případ vyhledávání je vždy O(1)"));
            mq2_11.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_11);

            MultipleChoiceQuestion mq2_12 = new MultipleChoiceQuestion();
            mq2_12.setQuestion("Která tvrzení o množině (Set) jsou správná?");
            mq2_12.setOptions(List.of("HashSet negarantuje pořadí prvků", "TreeSet uchovává prvky v seřazeném pořadí", "LinkedHashSet zachovává pořadí vložení", "HashSet dovoluje vložení duplicitní hodnoty"));
            mq2_12.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_12);

            MultipleChoiceQuestion mq2_13 = new MultipleChoiceQuestion();
            mq2_13.setQuestion("Které průchody binárním stromem existují?");
            mq2_13.setOptions(List.of("Preorder (kořen, levý, pravý)", "Inorder (levý, kořen, pravý)", "Postorder (levý, pravý, kořen)", "Reverse-order (pravý, kořen, levý) je standardní průchod"));
            mq2_13.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_13);

            MultipleChoiceQuestion mq2_14 = new MultipleChoiceQuestion();
            mq2_14.setQuestion("Co platí o grafových algoritmech DFS a BFS?");
            mq2_14.setOptions(List.of("BFS používá frontu", "DFS používá zásobník (nebo rekurzi)", "BFS najde nejkratší cestu v neohodnoceném grafu", "DFS zaručuje nalezení nejkratší cesty"));
            mq2_14.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_14);

            MultipleChoiceQuestion mq2_15 = new MultipleChoiceQuestion();
            mq2_15.setQuestion("Které reprezentace grafů jsou běžně používány?");
            mq2_15.setOptions(List.of("Seznam sousedů (adjacency list)", "Matice sousednosti (adjacency matrix)", "Incidenční matice", "Kruhový buffer"));
            mq2_15.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_15);

            MultipleChoiceQuestion mq2_16 = new MultipleChoiceQuestion();
            mq2_16.setQuestion("Která tvrzení o OOP v Javě jsou správná?");
            mq2_16.setOptions(List.of("Třída může implementovat více rozhraní", "Třída může dědit z více tříd současně", "Rozhraní mohou mít defaultní metody (od Java 8)", "Konstruktor se dědí automaticky do podtřídy"));
            mq2_16.setCorrectIndices(List.of(0, 2));
            q2.addQuestion(mq2_16);

            MultipleChoiceQuestion mq2_17 = new MultipleChoiceQuestion();
            mq2_17.setQuestion("Co platí o dědičnosti v Javě?");
            mq2_17.setOptions(List.of("Klíčové slovo extends slouží k dědění třídy", "Podtřída dědí všechny public a protected členy nadtřídy", "Přetížení metody (overloading) závisí na typech parametrů", "Podtřída může přistupovat k private členům nadtřídy přímo"));
            mq2_17.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_17);

            MultipleChoiceQuestion mq2_18 = new MultipleChoiceQuestion();
            mq2_18.setQuestion("Která tvrzení o rozhraních (interface) v Javě jsou pravdivá?");
            mq2_18.setOptions(List.of("Rozhraní může mít statické metody", "Rozhraní může mít defaultní metody s tělem", "Třída implementující rozhraní musí implementovat všechny abstraktní metody", "Rozhraní může obsahovat instanční proměnné (fields)"));
            mq2_18.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_18);

            MultipleChoiceQuestion mq2_19 = new MultipleChoiceQuestion();
            mq2_19.setQuestion("Co platí o abstraktních třídách v Javě?");
            mq2_19.setOptions(List.of("Nelze vytvořit instanci abstraktní třídy přímo", "Může obsahovat jak abstraktní, tak konkrétní metody", "Podtřída musí implementovat všechny abstraktní metody (nebo být také abstraktní)", "Abstraktní třída nemůže mít konstruktor"));
            mq2_19.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_19);

            MultipleChoiceQuestion mq2_20 = new MultipleChoiceQuestion();
            mq2_20.setQuestion("Která tvrzení o Java Records (od Java 16) jsou správná?");
            mq2_20.setOptions(List.of("Record je implicitně final", "Record automaticky generuje equals(), hashCode() a toString()", "Komponenty recordu jsou implicitně private final", "Record může rozšiřovat jinou třídu pomocí extends"));
            mq2_20.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_20);

            MultipleChoiceQuestion mq2_21 = new MultipleChoiceQuestion();
            mq2_21.setQuestion("Co platí o sealed types (zapečetěné typy) v Javě 17+?");
            mq2_21.setOptions(List.of("Klíčové slovo sealed omezuje, které třídy mohou sealed třídu rozšiřovat", "Povolené podtřídy musí být final, sealed, nebo non-sealed", "Sealed typy jsou užitečné pro pattern matching v switch", "Sealed třída nesmí mít abstraktní metody"));
            mq2_21.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_21);

            MultipleChoiceQuestion mq2_22 = new MultipleChoiceQuestion();
            mq2_22.setQuestion("Která tvrzení o generice v Javě jsou správná?");
            mq2_22.setOptions(List.of("Type erasure znamená, že generické typy jsou za běhu vymazány", "List<String> a List<Integer> jsou za běhu oba jen List", "Nelze vytvořit pole generického typu: new T[10]", "List<Number> je nadtypem List<Integer>"));
            mq2_22.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_22);

            MultipleChoiceQuestion mq2_23 = new MultipleChoiceQuestion();
            mq2_23.setQuestion("Co vyjadřuje princip PECS (Producer Extends, Consumer Super)?");
            mq2_23.setOptions(List.of("List<? extends T> umožňuje čtení prvků jako T", "List<? super T> umožňuje bezpečné vkládání prvků typu T", "List<? extends T> neumožňuje zápis (kromě null)", "List<? super T> umožňuje čtení prvků jako konkrétní typ T"));
            mq2_23.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_23);

            MultipleChoiceQuestion mq2_24 = new MultipleChoiceQuestion();
            mq2_24.setQuestion("Které z následujících jsou platná ohraničení typového parametru v generice?");
            mq2_24.setOptions(List.of("<T extends Number>", "<T extends Number & Comparable<T>>", "<T super Integer>", "<? extends Serializable>"));
            mq2_24.setCorrectIndices(List.of(0, 1, 3));
            q2.addQuestion(mq2_24);

            MultipleChoiceQuestion mq2_25 = new MultipleChoiceQuestion();
            mq2_25.setQuestion("Co platí o Java Collections Framework (JCF)?");
            mq2_25.setOptions(List.of("Rozhraní Collection rozšiřuje Iterable", "Map není součástí Collection hierarchie", "List, Set a Queue rozšiřují Collection", "ArrayList a HashMap jsou součástí balíčku java.lang"));
            mq2_25.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_25);

            MultipleChoiceQuestion mq2_26 = new MultipleChoiceQuestion();
            mq2_26.setQuestion("Která tvrzení o rozhraní List v Javě jsou pravdivá?");
            mq2_26.setOptions(List.of("List umožňuje duplicitní prvky", "List zachovává pořadí vložení", "ArrayList je implementován jako dynamické pole", "List zakazuje vkládání null hodnot"));
            mq2_26.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_26);

            MultipleChoiceQuestion mq2_27 = new MultipleChoiceQuestion();
            mq2_27.setQuestion("Co platí o iterátorech v Javě?");
            mq2_27.setOptions(List.of("Iterator má metody hasNext() a next()", "Foreach cyklus interně používá Iterator", "ListIterator umožňuje i zpětnou iteraci", "Iterator lze použít souběžně z více vláken bez synchronizace"));
            mq2_27.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_27);

            MultipleChoiceQuestion mq2_28 = new MultipleChoiceQuestion();
            mq2_28.setQuestion("Která tvrzení o Stream API v Javě jsou správná?");
            mq2_28.setOptions(List.of("Stream je lazy — operace se provede až při terminální operaci", "filter() je intermediate operace", "collect() je terminální operace", "Stream lze použít opakovaně po zavolání terminální operace"));
            mq2_28.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_28);

            MultipleChoiceQuestion mq2_29 = new MultipleChoiceQuestion();
            mq2_29.setQuestion("Které z následujících jsou terminální operace Stream API?");
            mq2_29.setOptions(List.of("collect()", "forEach()", "map()", "reduce()"));
            mq2_29.setCorrectIndices(List.of(0, 1, 3));
            q2.addQuestion(mq2_29);

            MultipleChoiceQuestion mq2_30 = new MultipleChoiceQuestion();
            mq2_30.setQuestion("Co platí o výjimkách v Javě?");
            mq2_30.setOptions(List.of("Checked exceptions musí být deklarovány v signatuře metody nebo zachyceny", "RuntimeException je unchecked", "Error je unchecked a typicky se nezachycuje", "NullPointerException je checked exception"));
            mq2_30.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_30);

            MultipleChoiceQuestion mq2_31 = new MultipleChoiceQuestion();
            mq2_31.setQuestion("Která tvrzení o bloku try-catch-finally jsou správná?");
            mq2_31.setOptions(List.of("finally se provede vždy, i po výjimce", "try-with-resources automaticky zavře AutoCloseable zdroje", "Lze zachytit více výjimek v jednom catch bloku (multi-catch)", "finally se provede i po System.exit()"));
            mq2_31.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_31);

            MultipleChoiceQuestion mq2_32 = new MultipleChoiceQuestion();
            mq2_32.setQuestion("Které návrhové vzory patří mezi kreativní (creational) vzory?");
            mq2_32.setOptions(List.of("Singleton", "Factory Method", "Builder", "Observer"));
            mq2_32.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_32);

            MultipleChoiceQuestion mq2_33 = new MultipleChoiceQuestion();
            mq2_33.setQuestion("Co platí o vzoru Singleton?");
            mq2_33.setOptions(List.of("Zajišťuje existenci pouze jedné instance třídy", "Konstruktor je privátní", "Instance je přístupná přes statickou metodu", "Singleton je vždy thread-safe bez synchronizace"));
            mq2_33.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_33);

            MultipleChoiceQuestion mq2_34 = new MultipleChoiceQuestion();
            mq2_34.setQuestion("Která tvrzení o vzoru Builder jsou správná?");
            mq2_34.setOptions(List.of("Odděluje konstrukci objektu od jeho reprezentace", "Umožňuje krok-za-krokem vytvoření složitého objektu", "Vrací výsledný objekt metodou build()", "Je variací vzoru Prototype"));
            mq2_34.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_34);

            MultipleChoiceQuestion mq2_35 = new MultipleChoiceQuestion();
            mq2_35.setQuestion("Které návrhové vzory patří mezi strukturální (structural) vzory?");
            mq2_35.setOptions(List.of("Adapter", "Decorator", "Facade", "Strategy"));
            mq2_35.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_35);

            MultipleChoiceQuestion mq2_36 = new MultipleChoiceQuestion();
            mq2_36.setQuestion("Co platí o vzoru Decorator?");
            mq2_36.setOptions(List.of("Přidává nové chování objektu dynamicky bez dědičnosti", "Implementuje stejné rozhraní jako dekorovaný objekt", "Lze skládat více dekorátorů do vrstev", "Je totožný se vzorem Proxy"));
            mq2_36.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_36);

            MultipleChoiceQuestion mq2_37 = new MultipleChoiceQuestion();
            mq2_37.setQuestion("Která tvrzení o vzoru Adapter jsou správná?");
            mq2_37.setOptions(List.of("Převádí rozhraní třídy na jiné rozhraní", "Umožňuje spolupráci tříd s nekompatibilními rozhraními", "Může být implementován jako třídní nebo objektový adaptér", "Je totožný se vzorem Bridge"));
            mq2_37.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_37);

            MultipleChoiceQuestion mq2_38 = new MultipleChoiceQuestion();
            mq2_38.setQuestion("Které návrhové vzory patří mezi behaviorální (behavioral) vzory?");
            mq2_38.setOptions(List.of("Strategy", "Observer", "Command", "Singleton"));
            mq2_38.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_38);

            MultipleChoiceQuestion mq2_39 = new MultipleChoiceQuestion();
            mq2_39.setQuestion("Co platí o vzoru Strategy?");
            mq2_39.setOptions(List.of("Definuje rodinu algoritmů a umožňuje jejich vzájemnou záměnu", "Algoritmus je zapouzdřen v samostatné třídě", "Klient vybírá konkrétní strategii za běhu", "Je totožný se vzorem Template Method"));
            mq2_39.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_39);

            MultipleChoiceQuestion mq2_40 = new MultipleChoiceQuestion();
            mq2_40.setQuestion("Která tvrzení o vzoru Observer jsou správná?");
            mq2_40.setOptions(List.of("Definuje závislost jeden-k-mnoha mezi objekty", "Při změně subjektu jsou notifikovány všechny závislé objekty", "Pozorovatelé mohou být přidáváni a odebíráni dynamicky", "Subjekt zná konkrétní typy všech svých pozorovatelů"));
            mq2_40.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_40);

            MultipleChoiceQuestion mq2_41 = new MultipleChoiceQuestion();
            mq2_41.setQuestion("Co platí o vzoru Command?");
            mq2_41.setOptions(List.of("Zapouzdřuje požadavek jako objekt", "Umožňuje undoable operace", "Příkazy mohou být řazeny do fronty", "Implementuje rozhraní přímo v klientském kódu bez abstrakce"));
            mq2_41.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_41);

            MultipleChoiceQuestion mq2_42 = new MultipleChoiceQuestion();
            mq2_42.setQuestion("Která tvrzení o architektonickém vzoru MVC jsou správná?");
            mq2_42.setOptions(List.of("Model obsahuje byznys logiku a data", "View zobrazuje data uživateli", "Controller zpracovává uživatelské vstupy", "View přímo modifikuje Model bez Controlleru"));
            mq2_42.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_42);

            MultipleChoiceQuestion mq2_43 = new MultipleChoiceQuestion();
            mq2_43.setQuestion("Jak se liší MVP od MVC?");
            mq2_43.setOptions(List.of("V MVP Presenter přebírá veškerou logiku z View", "View v MVP je pasivní — pouze zobrazuje data", "V MVP View nezná Model přímo", "MVP je totožný s MVC, liší se jen názvem"));
            mq2_43.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_43);

            MultipleChoiceQuestion mq2_44 = new MultipleChoiceQuestion();
            mq2_44.setQuestion("Co platí o vzoru MVVM?");
            mq2_44.setOptions(List.of("ViewModel nabízí data prostřednictvím observable vlastností", "View se váže na ViewModel pomocí data bindingu", "ViewModel nezná View", "MVVM vyžaduje použití Kotlinu"));
            mq2_44.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_44);

            MultipleChoiceQuestion mq2_45 = new MultipleChoiceQuestion();
            mq2_45.setQuestion("Která tvrzení o vzoru Template Method jsou správná?");
            mq2_45.setOptions(List.of("Definuje kostru algoritmu v nadtřídě", "Podtřídy přepisují jen konkrétní kroky algoritmu", "Využívá dědičnost pro variabilitu chování", "Template Method je kreativní vzor"));
            mq2_45.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_45);

            MultipleChoiceQuestion mq2_46 = new MultipleChoiceQuestion();
            mq2_46.setQuestion("Co platí o vzoru Facade?");
            mq2_46.setOptions(List.of("Poskytuje zjednodušené rozhraní ke složitému subsystému", "Snižuje závislosti klienta na vnitřních třídách subsystému", "Subsystém stále existuje a lze jej použít přímo", "Je behaviorální vzor"));
            mq2_46.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_46);

            MultipleChoiceQuestion mq2_47 = new MultipleChoiceQuestion();
            mq2_47.setQuestion("Která tvrzení o vzoru Proxy jsou správná?");
            mq2_47.setOptions(List.of("Proxy řídí přístup k jinému objektu", "Implementuje stejné rozhraní jako skutečný objekt", "Může přidávat lazy loading, caching nebo kontrolu přístupu", "Je totožný se vzorem Decorator"));
            mq2_47.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_47);

            MultipleChoiceQuestion mq2_48 = new MultipleChoiceQuestion();
            mq2_48.setQuestion("Co platí o vzoru Composite?");
            mq2_48.setOptions(List.of("Umožňuje zacházet s jednotlivými objekty a složeninami stejně", "Tvoří stromovou strukturu celku a části", "Každý prvek implementuje společné rozhraní", "Composite je behaviorální vzor"));
            mq2_48.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_48);

            MultipleChoiceQuestion mq2_49 = new MultipleChoiceQuestion();
            mq2_49.setQuestion("Která tvrzení o vzoru Chain of Responsibility jsou správná?");
            mq2_49.setOptions(List.of("Požadavek prochází řetězem handlerů", "Každý handler rozhodne, zda požadavek zpracuje nebo předá dál", "Odesílatel neví, který handler požadavek zpracuje", "Řetěz musí být cyklický"));
            mq2_49.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_49);

            MultipleChoiceQuestion mq2_50 = new MultipleChoiceQuestion();
            mq2_50.setQuestion("Co platí o vzoru Iterator?");
            mq2_50.setOptions(List.of("Poskytuje způsob sekvenčního přístupu k prvkům kolekce", "Skrývá interní strukturu kolekce před klientem", "Java foreach cyklus využívá Iterator interně", "Iterator může být vytvořen jen pro List"));
            mq2_50.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_50);

            MultipleChoiceQuestion mq2_51 = new MultipleChoiceQuestion();
            mq2_51.setQuestion("Která tvrzení o vzoru State jsou správná?");
            mq2_51.setOptions(List.of("Chování objektu se mění v závislosti na jeho vnitřním stavu", "Stav je zapouzdřen v samostatném objektu stavu", "Přechody mezi stavy mohou být v Context nebo State třídách", "State a Strategy jsou identické vzory"));
            mq2_51.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_51);

            MultipleChoiceQuestion mq2_52 = new MultipleChoiceQuestion();
            mq2_52.setQuestion("Co platí o vzoru Flyweight?");
            mq2_52.setOptions(List.of("Sdílí společnou část stavu mezi mnoha objekty", "Redukuje paměťovou náročnost při velkém počtu podobných objektů", "Stav se dělí na intrinsic (sdílený) a extrinsic (kontextový)", "Flyweight objekty jsou vždy immutable"));
            mq2_52.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_52);

            MultipleChoiceQuestion mq2_53 = new MultipleChoiceQuestion();
            mq2_53.setQuestion("Která tvrzení o vzoru Bridge jsou správná?");
            mq2_53.setOptions(List.of("Odděluje abstrakci od implementace", "Umožňuje nezávislé rozšiřování abstrakce i implementace", "Používá kompozici místo dědičnosti", "Je totožný se vzorem Adapter"));
            mq2_53.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_53);

            MultipleChoiceQuestion mq2_54 = new MultipleChoiceQuestion();
            mq2_54.setQuestion("Co platí o vzoru Abstract Factory?");
            mq2_54.setOptions(List.of("Poskytuje rozhraní pro vytváření rodin příbuzných objektů", "Konkrétní factory vytváří konzistentní sadu produktů", "Klient pracuje s produkty přes jejich abstraktní rozhraní", "Je alternativou k Builderu pro jednoduché objekty"));
            mq2_54.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_54);

            MultipleChoiceQuestion mq2_55 = new MultipleChoiceQuestion();
            mq2_55.setQuestion("Která tvrzení o vzoru Prototype jsou správná?");
            mq2_55.setOptions(List.of("Vytváří nové objekty klonováním existujících", "Java poskytuje rozhraní Cloneable pro podporu klonování", "Hluboká kopie (deep copy) kopíruje i odkazované objekty", "Prototype vždy vytváří mělkou kopii (shallow copy)"));
            mq2_55.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_55);

            MultipleChoiceQuestion mq2_56 = new MultipleChoiceQuestion();
            mq2_56.setQuestion("Co platí o vzoru Mediator?");
            mq2_56.setOptions(List.of("Definuje objekt, který zapouzdřuje, jak spolu objekty komunikují", "Snižuje přímé závislosti mezi komunikujícími objekty", "Kolegové komunikují přes Mediator, nikoli přímo", "Mediator a Observer jsou totožné vzory"));
            mq2_56.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_56);

            MultipleChoiceQuestion mq2_57 = new MultipleChoiceQuestion();
            mq2_57.setQuestion("Která tvrzení o vzoru Memento jsou správná?");
            mq2_57.setOptions(List.of("Umožňuje zachovat a obnovit předchozí stav objektu", "Stav je uložen v Memento objektu", "Originator vytváří Memento, Caretaker ho uchovává", "Memento umožňuje přímý přístup k uloženému stavu z libovolného místa"));
            mq2_57.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_57);

            MultipleChoiceQuestion mq2_58 = new MultipleChoiceQuestion();
            mq2_58.setQuestion("Co platí o vzoru Visitor?");
            mq2_58.setOptions(List.of("Odděluje algoritmus od struktury objektů, na které působí", "Umožňuje přidávání nových operací bez změny tříd elementů", "Každý element přijímá Visitor metodou accept()", "Visitor je vzor pro jednoduchý přístup k prvkům"));
            mq2_58.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_58);

            MultipleChoiceQuestion mq2_59 = new MultipleChoiceQuestion();
            mq2_59.setQuestion("Která tvrzení o funkcionálních rozhraních v Javě jsou správná?");
            mq2_59.setOptions(List.of("Funkcionální rozhraní má přesně jednu abstraktní metodu", "Lze je implementovat pomocí lambda výrazů", "Anotace @FunctionalInterface je nepovinná, ale doporučená", "Funkcionální rozhraní nemůže mít default metody"));
            mq2_59.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_59);

            MultipleChoiceQuestion mq2_60 = new MultipleChoiceQuestion();
            mq2_60.setQuestion("Co platí o lambda výrazech v Javě?");
            mq2_60.setOptions(List.of("Lambda výraz implementuje funkcionální rozhraní", "Lambda může zachytit (capture) proměnné z obklopujícího scope", "Zachycené lokální proměnné musí být effectively final", "Lambda může modifikovat lokální proměnné z obklopujícího scope"));
            mq2_60.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_60);

            MultipleChoiceQuestion mq2_61 = new MultipleChoiceQuestion();
            mq2_61.setQuestion("Které z následujících jsou intermediate operace Stream API?");
            mq2_61.setOptions(List.of("filter()", "map()", "sorted()", "findFirst()"));
            mq2_61.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_61);

            MultipleChoiceQuestion mq2_62 = new MultipleChoiceQuestion();
            mq2_62.setQuestion("Co platí o Optional<T> v Javě?");
            mq2_62.setOptions(List.of("Může buď obsahovat hodnotu, nebo být prázdný", "orElse() vrátí hodnotu nebo náhradní hodnotu", "isPresent() vrací true pokud Optional obsahuje hodnotu", "Optional.of(null) nevyhodí výjimku"));
            mq2_62.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_62);

            MultipleChoiceQuestion mq2_63 = new MultipleChoiceQuestion();
            mq2_63.setQuestion("Která tvrzení o TreeMap a TreeSet jsou správná?");
            mq2_63.setOptions(List.of("TreeMap uchovává záznamy seřazené podle klíče", "TreeSet uchovává prvky v přirozeném nebo komparátorovém pořadí", "Složitost operací get, put, remove je O(log n)", "TreeMap ukládá záznamy v pořadí vložení jako LinkedHashMap"));
            mq2_63.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_63);

            MultipleChoiceQuestion mq2_64 = new MultipleChoiceQuestion();
            mq2_64.setQuestion("Co platí o rozhraní Comparable a Comparator?");
            mq2_64.setOptions(List.of("Comparable definuje přirozené řazení třídy (metoda compareTo)", "Comparator je externí strategie porovnání (metoda compare)", "Lze definovat více Comparatorů pro jednu třídu", "Comparable musí být implementováno pro použití v TreeSet"));
            mq2_64.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_64);

            MultipleChoiceQuestion mq2_65 = new MultipleChoiceQuestion();
            mq2_65.setQuestion("Která tvrzení o výjimkách v hierarchii Throwable jsou správná?");
            mq2_65.setOptions(List.of("Error a Exception jsou přímé podtřídy Throwable", "RuntimeException je podtřídou Exception", "Checked exceptions jsou podtřídy Exception (ne RuntimeException)", "Všechny výjimky jsou checked"));
            mq2_65.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_65);

            MultipleChoiceQuestion mq2_66 = new MultipleChoiceQuestion();
            mq2_66.setQuestion("Co platí o polymorfismu v Javě?");
            mq2_66.setOptions(List.of("Přetížení metody (overloading) je statický polymorfismus", "Přepsání metody (overriding) je dynamický polymorfismus", "Volání přepsané metody se rozhoduje za běhu (late binding)", "final metody lze přepisovat v přímých podtřídách"));
            mq2_66.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_66);

            MultipleChoiceQuestion mq2_67 = new MultipleChoiceQuestion();
            mq2_67.setQuestion("Která tvrzení o rozhraní Iterable jsou správná?");
            mq2_67.setOptions(List.of("Rozhraní Iterable je nadřazené Collection", "Implementace Iterable umožňuje použití v foreach cyklu", "Metoda iterator() vrací instanci Iterator", "Pouze ArrayList implementuje Iterable"));
            mq2_67.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_67);

            MultipleChoiceQuestion mq2_68 = new MultipleChoiceQuestion();
            mq2_68.setQuestion("Co platí o složitosti operací v červeno-černém stromě (Red-Black Tree)?");
            mq2_68.setOptions(List.of("Vyhledání má složitost O(log n)", "Vložení má složitost O(log n)", "Smazání má složitost O(log n)", "Přístup přes index je O(1)"));
            mq2_68.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_68);

            MultipleChoiceQuestion mq2_69 = new MultipleChoiceQuestion();
            mq2_69.setQuestion("Která tvrzení o Deque rozhraní v Javě jsou správná?");
            mq2_69.setOptions(List.of("Deque podporuje vkládání a odebírání na obou koncích", "ArrayDeque je preferován před Stack pro LIFO operace", "LinkedList implementuje Deque", "Deque nemůže fungovat jako fronta (FIFO)"));
            mq2_69.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_69);

            MultipleChoiceQuestion mq2_70 = new MultipleChoiceQuestion();
            mq2_70.setQuestion("Co platí o vzoru Factory Method?");
            mq2_70.setOptions(List.of("Definuje rozhraní pro vytváření objektu, ale nechává podtřídy rozhodnout, jaký objekt vytvořit", "Umožňuje zpřístupnit vytváření objektů přes metodu, nikoli přes konstruktor", "Je kreativní návrhový vzor", "Vždy vrací singleton instanci"));
            mq2_70.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_70);

            MultipleChoiceQuestion mq2_71 = new MultipleChoiceQuestion();
            mq2_71.setQuestion("Která tvrzení o zapouzdření (encapsulation) jsou správná?");
            mq2_71.setOptions(List.of("Merge Sort má složitost O(n log n) v nejhorším případě", "Quick Sort má složitost O(n²) v nejhorším případě", "Bubble Sort má složitost O(n²) v průměrném případě", "Selection Sort má složitost O(n log n) průměrně"));
            mq2_71.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_71);

            MultipleChoiceQuestion mq2_72 = new MultipleChoiceQuestion();
            mq2_72.setQuestion("Co platí o konceptu covariance a contravariance v typovém systému?");
            mq2_72.setOptions(List.of("Zachovává pořadí vložení klíčů", "Lze nastavit na LRU (access-order) místo insertion-order", "Složitost get a put je O(1) amortizovaně", "LinkedHashMap je podtřídou TreeMap"));
            mq2_72.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_72);

            MultipleChoiceQuestion mq2_73 = new MultipleChoiceQuestion();
            mq2_73.setQuestion("Která tvrzení o ArrayDeque jsou správná?");
            mq2_73.setOptions(List.of("Java je silně typovaný jazyk", "Autoboxing automaticky převádí mezi primitivními typy a jejich obalovacími třídami", "int a Integer jsou různé typy", "Proměnné primitivního typu lze volně přiřadit do proměnné referenčního typu bez konverze"));
            mq2_73.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_73);

            MultipleChoiceQuestion mq2_74 = new MultipleChoiceQuestion();
            mq2_74.setQuestion("Co platí o asymptotické složitosti třídících algoritmů?");
            mq2_74.setOptions(List.of("Merge Sort má složitost O(n log n) v nejhorším případě", "Quick Sort má složitost O(n²) v nejhorším případě", "Heap Sort má složitost O(n log n) v nejhorším případě", "Bubble Sort má složitost O(n log n) ve všech případech"));
            mq2_74.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_74);

            MultipleChoiceQuestion mq2_75 = new MultipleChoiceQuestion();
            mq2_75.setQuestion("Která tvrzení o LinkedHashMap jsou správná?");
            mq2_75.setOptions(List.of("ArrayDeque je implementován jako resizable circular array", "Operace na obou koncích jsou O(1) amortizovaně", "ArrayDeque je rychlejší než LinkedList pro většinu operací", "ArrayDeque povoluje vkládání null hodnot"));
            mq2_75.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_75);

            MultipleChoiceQuestion mq2_76 = new MultipleChoiceQuestion();
            mq2_76.setQuestion("Co platí o typovém systému Javy?");
            mq2_76.setOptions(List.of("Java je silně typovaný jazyk", "Autoboxing automaticky převádí mezi primitivními typy a jejich obalovacími třídami", "int a Integer jsou různé typy", "Typ proměnné lze změnit za běhu pomocí přetypování"));
            mq2_76.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_76);

            MultipleChoiceQuestion mq2_77 = new MultipleChoiceQuestion();
            mq2_77.setQuestion("Která tvrzení o non-sealed třídách v kontextu sealed typů jsou pravdivá?");
            mq2_77.setOptions(List.of("non-sealed třída může být dále rozšiřována libovolnými třídami", "non-sealed je jednou z povolených modifikací podtřídy sealed třídy", "non-sealed hierarchie obnovuje otevřenost dědičnosti", "non-sealed je ekvivalentní final"));
            mq2_77.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_77);

            MultipleChoiceQuestion mq2_78 = new MultipleChoiceQuestion();
            mq2_78.setQuestion("Co platí o vzoru Object Pool?");
            mq2_78.setOptions(List.of("Předem alokuje a znovupoužívá sadu objektů", "Redukuje náklady na opakované vytváření a ničení objektů", "Je vhodný pro drahé objekty jako databázová připojení", "Object Pool nikdy neuvolní objekty zpět do paměti"));
            mq2_78.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_78);

            MultipleChoiceQuestion mq2_79 = new MultipleChoiceQuestion();
            mq2_79.setQuestion("Která tvrzení o rozhraní Map v Javě jsou správná?");
            mq2_79.setOptions(List.of("Map uchovává páry klíč-hodnota", "Klíče v Map musí být unikátní", "getOrDefault() vrátí hodnotu nebo náhradní hodnotu, pokud klíč neexistuje", "Map rozšiřuje Collection"));
            mq2_79.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_79);

            MultipleChoiceQuestion mq2_80 = new MultipleChoiceQuestion();
            mq2_80.setQuestion("Co platí o vzoru Interpreter?");
            mq2_80.setOptions(List.of("Definuje gramatiku jazyka a způsob interpretace vět", "Je vhodný pro opakující se problémy, které lze vyjádřit gramatikou", "Každý symbol gramatiky má svou třídu", "Interpreter je kreativní vzor"));
            mq2_80.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_80);

            MultipleChoiceQuestion mq2_81 = new MultipleChoiceQuestion();
            mq2_81.setQuestion("Která tvrzení o default metodách v rozhraní jsou pravdivá?");
            mq2_81.setOptions(List.of("Default metody mají tělo přímo v rozhraní", "Třídy implementující rozhraní mohou přepsat default metodu", "Default metody umožňují zpětně kompatibilní rozšíření rozhraní", "Default metody jsou statické"));
            mq2_81.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_81);

            MultipleChoiceQuestion mq2_82 = new MultipleChoiceQuestion();
            mq2_82.setQuestion("Co platí o průchodu stromem v BFS (Breadth-First Search)?");
            mq2_82.setOptions(List.of("BFS prochází strom po vrstvách (level by level)", "BFS používá frontu pro udržení pořadí zpracování", "BFS najde nejkratší cestu v neohodnoceném grafu", "BFS má časovou složitost O(V²)"));
            mq2_82.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_82);

            MultipleChoiceQuestion mq2_83 = new MultipleChoiceQuestion();
            mq2_83.setQuestion("Která tvrzení o trie (prefixovém stromě) jsou správná?");
            mq2_83.setOptions(List.of("Vyhledání slova má složitost O(k) kde k je délka slova", "Trie je vhodný pro autocomplete a prefixové vyhledávání", "Každý uzel reprezentuje jeden znak klíče", "Trie zaručuje O(log n) složitost bez ohledu na délku klíče"));
            mq2_83.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_83);

            MultipleChoiceQuestion mq2_84 = new MultipleChoiceQuestion();
            mq2_84.setQuestion("Co platí o heapify operaci v binární haldě?");
            mq2_84.setOptions(List.of("Heapify transformuje pole na haldu", "Build-heap (heapify celého pole) má složitost O(n)", "Sift-down (probublání dolů) má složitost O(log n)", "Heapify je potřebný po každém vložení prvku"));
            mq2_84.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_84);

            MultipleChoiceQuestion mq2_85 = new MultipleChoiceQuestion();
            mq2_85.setQuestion("Která tvrzení o datové struktuře Deque jsou pravdivá?");
            mq2_85.setOptions(List.of("Deque je zkratka pro Double-Ended Queue", "Lze ho použít jak jako zásobník, tak jako frontu", "Deque podporuje přidávání i odebírání z obou konců v O(1)", "Deque musí být implementován jako pole"));
            mq2_85.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_85);

            MultipleChoiceQuestion mq2_86 = new MultipleChoiceQuestion();
            mq2_86.setQuestion("Co platí o garbage collectoru v Javě?");
            mq2_86.setOptions(List.of("GC automaticky uvolňuje paměť objektů bez referencí", "Programátor nemůže přímo řídit kdy GC poběží", "Generační GC dělí paměť na mladou a starou generaci", "finalize() metoda je spolehlivý způsob pro uvolnění zdrojů"));
            mq2_86.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_86);

            MultipleChoiceQuestion mq2_87 = new MultipleChoiceQuestion();
            mq2_87.setQuestion("Která tvrzení o rozhraní Queue v Javě jsou pravdivá?");
            mq2_87.setOptions(List.of("offer() vrátí false při selhání místo vyhození výjimky", "poll() vrátí null na prázdné frontě místo výjimky", "peek() vrátí null na prázdné frontě místo výjimky", "add() je ekvivalentní offer() vždy bez výjimek"));
            mq2_87.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_87);

            MultipleChoiceQuestion mq2_88 = new MultipleChoiceQuestion();
            mq2_88.setQuestion("Co platí o PriorityQueue v Javě?");
            mq2_88.setOptions(List.of("PriorityQueue je implementována jako binární min-halda", "poll() vrátí prvek s nejmenší hodnotou (nebo dle Comparatoru)", "Složitost vložení a odebrání je O(log n)", "PriorityQueue garantuje FIFO pořadí stejně prioritních prvků"));
            mq2_88.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_88);

            MultipleChoiceQuestion mq2_89 = new MultipleChoiceQuestion();
            mq2_89.setQuestion("Která tvrzení o statických metodách v rozhraní jsou pravdivá?");
            mq2_89.setOptions(List.of("GC automaticky uvolňuje paměť objektů bez referencí", "Programátor nemůže přímo řídit kdy GC poběží", "Generační GC dělí paměť na mladou a starou generaci", "finalize() metoda spolehlivě uvolní zdroje před GC"));
            mq2_89.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_89);

            MultipleChoiceQuestion mq2_90 = new MultipleChoiceQuestion();
            mq2_90.setQuestion("Co platí o amortizované složitosti?");
            mq2_90.setOptions(List.of("Amortizovaná složitost je průměr přes sekvenci operací", "Jednotlivé operace mohou být dražší, průměr zůstává nízký", "Dynamické pole (ArrayList) má amortizovaně O(1) přidání na konec", "Amortizovaná složitost je totožná s průměrnou složitostí (average case)"));
            mq2_90.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_90);

            MultipleChoiceQuestion mq2_91 = new MultipleChoiceQuestion();
            mq2_91.setQuestion("Která tvrzení o record třídách v Javě jsou pravdivá?");
            mq2_91.setOptions(List.of("Record implicitně poskytuje konstruktor se všemi komponentami", "Komponenty recordu jsou automaticky přístupné přes accessor metody", "Record může mít kompaktní konstruktor pro validaci", "Record může rozšiřovat abstraktní třídu"));
            mq2_91.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_91);

            MultipleChoiceQuestion mq2_92 = new MultipleChoiceQuestion();
            mq2_92.setQuestion("Co platí o enumeracích (enum) v Javě?");
            mq2_92.setOptions(List.of("Enum je speciální typ třídy", "Enum může implementovat rozhraní", "Hodnoty enum jsou implicitně public static final", "Enum může rozšiřovat jinou třídu pomocí extends"));
            mq2_92.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_92);

            MultipleChoiceQuestion mq2_93 = new MultipleChoiceQuestion();
            mq2_93.setQuestion("Která tvrzení o vzoru Null Object jsou pravdivá?");
            mq2_93.setOptions(List.of("Null Object nahrazuje null referencí objektem s výchozím chováním", "Zabraňuje NullPointerException tím, že poskytuje bezpečnou implementaci", "Null Object implementuje stejné rozhraní jako reálný objekt", "Null Object je totožný se vzorem Singleton"));
            mq2_93.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_93);

            MultipleChoiceQuestion mq2_94 = new MultipleChoiceQuestion();
            mq2_94.setQuestion("Co platí o B-stromech (B-tree)?");
            mq2_94.setOptions(List.of("Statické metody v rozhraní mají tělo", "Statické metody rozhraní se nezdědí třídami implementujícími rozhraní", "Volají se přes název rozhraní: Interface.staticMethod()", "Statické metody v rozhraní jsou dostupné od Java 6"));
            mq2_94.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_94);

            MultipleChoiceQuestion mq2_95 = new MultipleChoiceQuestion();
            mq2_95.setQuestion("Která tvrzení o patternu matching v Javě (instanceof pattern) jsou pravdivá?");
            mq2_95.setOptions(List.of("Pattern matching for instanceof odstraňuje explicitní přetypování", "Proměnná je dostupná pouze pokud instanceof test projde", "Switch expression může používat pattern matching od Java 21", "Pattern matching je dostupný pouze pro základní datové typy"));
            mq2_95.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_95);

            MultipleChoiceQuestion mq2_96 = new MultipleChoiceQuestion();
            mq2_96.setQuestion("Co platí o Collectors v Stream API?");
            mq2_96.setOptions(List.of("Record implicitně poskytuje konstruktor se všemi komponentami", "Komponenty recordu jsou automaticky přístupné přes accessor metody", "Record může mít kompaktní konstruktor pro validaci", "Record může rozšiřovat abstraktní třídu pomocí extends"));
            mq2_96.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_96);

            MultipleChoiceQuestion mq2_97 = new MultipleChoiceQuestion();
            mq2_97.setQuestion("Která tvrzení o metodách equals() a hashCode() jsou pravdivá?");
            mq2_97.setOptions(List.of("Enum je speciální typ třídy", "Enum může implementovat rozhraní", "Hodnoty enum jsou implicitně public static final", "Enum může rozšiřovat jinou třídu pomocí extends"));
            mq2_97.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_97);

            MultipleChoiceQuestion mq2_98 = new MultipleChoiceQuestion();
            mq2_98.setQuestion("Která tvrzení o vzoru Specification jsou pravdivá?");
            mq2_98.setOptions(List.of("Zapouzdřuje obchodní pravidlo do znovupoužitelného objektu", "Specifikace lze kombinovat pomocí and(), or(), not()", "Je behaviorální vzor", "Specification je totožný se vzorem Strategy"));
            mq2_98.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_98);

            MultipleChoiceQuestion mq2_99 = new MultipleChoiceQuestion();
            mq2_99.setQuestion("Co platí o immutabilních kolekcích v Javě (List.of, Map.of)?");
            mq2_99.setOptions(List.of("List.of() vytvoří neměnný seznam", "Pokus o přidání prvku vyvolá UnsupportedOperationException", "Immutabilní kolekce jsou thread-safe pro čtení", "List.of() dovoluje null hodnoty"));
            mq2_99.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_99);

            MultipleChoiceQuestion mq2_100 = new MultipleChoiceQuestion();
            mq2_100.setQuestion("Která tvrzení o varargs (proměnný počet argumentů) v Javě jsou pravdivá?");
            mq2_100.setOptions(List.of("Varargs parametr je interně pole", "Varargs musí být posledním parametrem metody", "Lze předat pole jako varargs argument", "Jedna metoda může mít více varargs parametrů"));
            mq2_100.setCorrectIndices(List.of(0, 1, 2));
            q2.addQuestion(mq2_100);

            m4.getQuizzes().add(q2);
            courseRepository.save(c4);

            // --- Kurz c5: Složitost algoritmů ---
            Course c5 = new Course();
            c5.setName("Složitost algoritmů");
            c5.setDescription("10 otázek zaměřených na časovou a prostorovou složitost, Big-O notaci a porovnání algoritmů.");
            c5.setStatus(StatusEnum.Draft);
            c5.setLector(lecturer);

            Module m5 = new Module();
            m5.setName("Big-O a analýza složitosti");
            m5.setDescription("Otázky pokrývají třídy složitosti, dominantní člen a asymptotické porovnávání.");
            m5.setIndex(1);
            m5.setActivated(true);
            m5.setCourse(c5);
            c5.getModules().add(m5);

            Quiz q5 = new Quiz();
            q5.setTitle("Kvíz: Složitost algoritmů");
            q5.setModule(m5);

            MultipleChoiceQuestion q5q1 = new MultipleChoiceQuestion();
            q5q1.setQuestion("Která tvrzení o Big-O jsou ŠPATNĚ?");
            q5q1.setOptions(List.of("O(n) = O(n²) pro velká n", "Big-O vyjadřuje dolní mez", "Konstanty nelze ignorovat v Big-O", "O(n log n) je kvadratická složitost"));
            q5q1.setCorrectIndices(List.of());
            q5.addQuestion(q5q1);

            MultipleChoiceQuestion q5q2 = new MultipleChoiceQuestion();
            q5q2.setQuestion("Které z následujících tvrzení jsou CHYBNÉ?");
            q5q2.setOptions(List.of("Bubble Sort má O(n log n) průměrně", "Quick Sort je vždy O(n log n)", "O(2ⁿ) je polynomiální složitost", "Binární vyhledávání funguje na neseřazeném poli"));
            q5q2.setCorrectIndices(List.of());
            q5.addQuestion(q5q2);

            MultipleChoiceQuestion q5q3 = new MultipleChoiceQuestion();
            q5q3.setQuestion("Které jediné tvrzení o složitosti je správné?");
            q5q3.setOptions(List.of("Merge Sort má O(n²) v nejhorším případě", "Přístup k prvku pole přes index je O(1)", "Selection Sort je O(n log n) průměrně", "BFS má O(1) prostorovou složitost"));
            q5q3.setCorrectIndices(List.of(1));
            q5.addQuestion(q5q3);

            MultipleChoiceQuestion q5q4 = new MultipleChoiceQuestion();
            q5q4.setQuestion("Které jediné tvrzení o amortizované složitosti je pravdivé?");
            q5q4.setOptions(List.of("Každá operace má přesně stejnou složitost", "ArrayList.add() je amortizovaně O(1)", "Amortizovaná složitost ignoruje drahé operace", "Je totožná s nejhorším případem"));
            q5q4.setCorrectIndices(List.of(1));
            q5.addQuestion(q5q4);

            MultipleChoiceQuestion q5q5 = new MultipleChoiceQuestion();
            q5q5.setQuestion("Která dvě tvrzení o třídících algoritmech jsou správná?");
            q5q5.setOptions(List.of("Merge Sort má O(n log n) v nejhorším případě", "Heap Sort má O(n log n) v nejhorším případě", "Quick Sort má O(n log n) vždy", "Bubble Sort má O(n log n) průměrně"));
            q5q5.setCorrectIndices(List.of(0, 1));
            q5.addQuestion(q5q5);

            MultipleChoiceQuestion q5q6 = new MultipleChoiceQuestion();
            q5q6.setQuestion("Které dvě třídy složitosti jsou sub-lineární?");
            q5q6.setOptions(List.of("O(1)", "O(log n)", "O(n)", "O(n log n)"));
            q5q6.setCorrectIndices(List.of(0, 1));
            q5.addQuestion(q5q6);

            MultipleChoiceQuestion q5q7 = new MultipleChoiceQuestion();
            q5q7.setQuestion("Která tři tvrzení o Big-O jsou správná?");
            q5q7.setOptions(List.of("O(5n) = O(n)", "O(n) + O(n²) = O(n²)", "O(log n) < O(n)", "O(n!) je polynomiální"));
            q5q7.setCorrectIndices(List.of(0, 1, 2));
            q5.addQuestion(q5q7);

            MultipleChoiceQuestion q5q8 = new MultipleChoiceQuestion();
            q5q8.setQuestion("Která tři tvrzení o prostorové složitosti jsou pravdivá?");
            q5q8.setOptions(List.of("Merge Sort vyžaduje O(n) pomocné paměti", "Bubble Sort je in-place O(1)", "Quicksort potřebuje O(log n) pro zásobník rekurze", "Selection Sort vyžaduje O(n) pomocné paměti"));
            q5q8.setCorrectIndices(List.of(0, 1, 2));
            q5.addQuestion(q5q8);

            MultipleChoiceQuestion q5q9 = new MultipleChoiceQuestion();
            q5q9.setQuestion("Která čtyři tvrzení o hierarchii složitostí jsou správná?");
            q5q9.setOptions(List.of("O(1) < O(log n) pro velká n", "O(log n) < O(n)", "O(n) < O(n log n)", "O(n log n) < O(n²)"));
            q5q9.setCorrectIndices(List.of(0, 1, 2, 3));
            q5.addQuestion(q5q9);

            MultipleChoiceQuestion q5q10 = new MultipleChoiceQuestion();
            q5q10.setQuestion("Která čtyři tvrzení o složitostech jsou správná?");
            q5q10.setOptions(List.of("O(n²) je kvadratická třída", "O(2ⁿ) je exponenciální třída", "O(n!) je faktoriální třída", "O(n³) je kubická třída"));
            q5q10.setCorrectIndices(List.of(0, 1, 2, 3));
            q5.addQuestion(q5q10);

            m5.getQuizzes().add(q5);
            courseRepository.save(c5);

            // --- Kurz c6: OOP a generika v Javě ---
            Course c6 = new Course();
            c6.setName("OOP a generika v Javě");
            c6.setDescription("10 otázek pokrývajících principy OOP, dědičnost, rozhraní a generický typový systém.");
            c6.setStatus(StatusEnum.Draft);
            c6.setLector(lecturer);

            Module m6 = new Module();
            m6.setName("OOP, rozhraní a generika");
            m6.setDescription("Základy OOP, klíčová slova, generika a typová bezpečnost.");
            m6.setIndex(1);
            m6.setActivated(true);
            m6.setCourse(c6);
            c6.getModules().add(m6);

            Quiz q6 = new Quiz();
            q6.setTitle("Kvíz: OOP a generika");
            q6.setModule(m6);

            MultipleChoiceQuestion q6q1 = new MultipleChoiceQuestion();
            q6q1.setQuestion("Která tvrzení o dědičnosti v Javě jsou CHYBNÁ?");
            q6q1.setOptions(List.of("Třída může dědit z více tříd najednou", "Podtřída přistupuje k private členům přímo", "Konstruktor se dědí automaticky do podtřídy", "final třída může být rozšířena"));
            q6q1.setCorrectIndices(List.of());
            q6.addQuestion(q6q1);

            MultipleChoiceQuestion q6q2 = new MultipleChoiceQuestion();
            q6q2.setQuestion("Která tvrzení o generice jsou ŠPATNĚ?");
            q6q2.setOptions(List.of("List<Number> je nadtyp List<Integer>", "Lze vytvořit new T[] v generické třídě", "Generické typy jsou zachovány za běhu (bez type erasure)", "List<int> je platný generický typ"));
            q6q2.setCorrectIndices(List.of());
            q6.addQuestion(q6q2);

            MultipleChoiceQuestion q6q3 = new MultipleChoiceQuestion();
            q6q3.setQuestion("Které jediné tvrzení o Records je správné?");
            q6q3.setOptions(List.of("Record může rozšiřovat jinou třídu pomocí extends", "Record nemůže implementovat rozhraní", "Record je implicitně final", "Record neumí generovat hashCode()"));
            q6q3.setCorrectIndices(List.of(2));
            q6.addQuestion(q6q3);

            MultipleChoiceQuestion q6q4 = new MultipleChoiceQuestion();
            q6q4.setQuestion("Které jediné tvrzení o sealed typech je pravdivé?");
            q6q4.setOptions(List.of("Sealed třída nesmí mít abstraktní metody", "Povolené podtřídy nemusí být final ani sealed", "Sealed typy omezují, které třídy mohou třídu rozšiřovat", "non-sealed je ekvivalentní final"));
            q6q4.setCorrectIndices(List.of(2));
            q6.addQuestion(q6q4);

            MultipleChoiceQuestion q6q5 = new MultipleChoiceQuestion();
            q6q5.setQuestion("Která dvě tvrzení o rozhraních v Javě jsou správná?");
            q6q5.setOptions(List.of("Rozhraní může mít default metody s tělem", "Třída může implementovat více rozhraní", "Rozhraní může mít instanční proměnné", "Rozhraní nemůže mít statické metody"));
            q6q5.setCorrectIndices(List.of(0, 1));
            q6.addQuestion(q6q5);

            MultipleChoiceQuestion q6q6 = new MultipleChoiceQuestion();
            q6q6.setQuestion("Která dvě tvrzení o polymorfismu jsou správná?");
            q6q6.setOptions(List.of("Overloading je statický polymorfismus", "Overriding je dynamický polymorfismus", "final metody lze přepsat v podtřídě", "Polymorfismus nevyžaduje dědičnost ani rozhraní"));
            q6q6.setCorrectIndices(List.of(0, 1));
            q6.addQuestion(q6q6);

            MultipleChoiceQuestion q6q7 = new MultipleChoiceQuestion();
            q6q7.setQuestion("Která tři tvrzení o wildcards v generice jsou správná?");
            q6q7.setOptions(List.of("List<? extends T> umožňuje čtení prvků jako T", "List<? super T> umožňuje vkládání T", "List<? extends T> neumožňuje zápis", "List<? super T> garantuje čtení jako T"));
            q6q7.setCorrectIndices(List.of(0, 1, 2));
            q6.addQuestion(q6q7);

            MultipleChoiceQuestion q6q8 = new MultipleChoiceQuestion();
            q6q8.setQuestion("Která tři tvrzení o abstraktních třídách jsou správná?");
            q6q8.setOptions(List.of("Nelze vytvořit instanci přímo", "Může mít konstruktor", "Může mít konkrétní i abstraktní metody", "Může dědit z více tříd"));
            q6q8.setCorrectIndices(List.of(0, 1, 2));
            q6.addQuestion(q6q8);

            MultipleChoiceQuestion q6q9 = new MultipleChoiceQuestion();
            q6q9.setQuestion("Která čtyři tvrzení o OOP jsou správná?");
            q6q9.setOptions(List.of("Zapouzdření skrývá vnitřní stav objektu", "Dědičnost umožňuje znovupoužití kódu", "Polymorfismus umožňuje různé chování stejné metody", "Abstrakce skrývá implementační detaily"));
            q6q9.setCorrectIndices(List.of(0, 1, 2, 3));
            q6.addQuestion(q6q9);

            MultipleChoiceQuestion q6q10 = new MultipleChoiceQuestion();
            q6q10.setQuestion("Která čtyři tvrzení o enumeracích (enum) jsou správná?");
            q6q10.setOptions(List.of("Enum je speciální typ třídy", "Enum může implementovat rozhraní", "Hodnoty enum jsou implicitně public static final", "Enum má implicitně metody values() a valueOf()"));
            q6q10.setCorrectIndices(List.of(0, 1, 2, 3));
            q6.addQuestion(q6q10);

            m6.getQuizzes().add(q6);
            courseRepository.save(c6);

            // --- Kurz c7: Datové struktury ---
            Course c7 = new Course();
            c7.setName("Datové struktury");
            c7.setDescription("10 otázek zaměřených na základní datové struktury: pole, zásobník, fronta, spojové seznamy, stromy a hashovací tabulky.");
            c7.setStatus(StatusEnum.Draft);
            c7.setLector(lecturer);

            Module m7 = new Module();
            m7.setName("Přehled datových struktur");
            m7.setDescription("Vlastnosti, složitosti a použití jednotlivých datových struktur.");
            m7.setIndex(1);
            m7.setActivated(true);
            m7.setCourse(c7);
            c7.getModules().add(m7);

            Quiz q7 = new Quiz();
            q7.setTitle("Kvíz: Datové struktury");
            q7.setModule(m7);

            MultipleChoiceQuestion q7q1 = new MultipleChoiceQuestion();
            q7q1.setQuestion("Která tvrzení o zásobníku (Stack) jsou CHYBNÁ?");
            q7q1.setOptions(List.of("Zásobník je FIFO struktura", "peek() odebere vrchol zásobníku", "Zásobník je optimální pro BFS", "push() má složitost O(n)"));
            q7q1.setCorrectIndices(List.of());
            q7.addQuestion(q7q1);

            MultipleChoiceQuestion q7q2 = new MultipleChoiceQuestion();
            q7q2.setQuestion("Která tvrzení o HashMap jsou ŠPATNĚ?");
            q7q2.setOptions(List.of("HashMap garantuje pořadí klíčů", "Vyhledání v HashMap je vždy O(1) i v nejhorším případě", "HashMap dovoluje více stejných klíčů", "HashMap je součástí java.lang"));
            q7q2.setCorrectIndices(List.of());
            q7.addQuestion(q7q2);

            MultipleChoiceQuestion q7q3 = new MultipleChoiceQuestion();
            q7q3.setQuestion("Které jediné tvrzení o BST je správné?");
            q7q3.setOptions(List.of("Inorder průchod vrátí prvky sestupně", "Vyhledání je O(1) i u nevyváženého BST", "Inorder průchod vrátí prvky vzestupně", "Mazání kořene je vždy O(1)"));
            q7q3.setCorrectIndices(List.of(2));
            q7.addQuestion(q7q3);

            MultipleChoiceQuestion q7q4 = new MultipleChoiceQuestion();
            q7q4.setQuestion("Které jediné tvrzení o binární haldě je pravdivé?");
            q7q4.setOptions(List.of("Kořen min-heap obsahuje největší prvek", "Hledání libovolného prvku je O(log n)", "Vložení a odebrání mají složitost O(log n)", "Halda je nekompletní binární strom"));
            q7q4.setCorrectIndices(List.of(2));
            q7.addQuestion(q7q4);

            MultipleChoiceQuestion q7q5 = new MultipleChoiceQuestion();
            q7q5.setQuestion("Která dvě tvrzení o frontě (Queue) jsou správná?");
            q7q5.setOptions(List.of("Fronta je FIFO struktura", "BFS využívá frontu", "poll() vyhodí výjimku na prázdné frontě", "Fronta je LIFO struktura"));
            q7q5.setCorrectIndices(List.of(0, 1));
            q7.addQuestion(q7q5);

            MultipleChoiceQuestion q7q6 = new MultipleChoiceQuestion();
            q7q6.setQuestion("Která dvě tvrzení o spojovém seznamu jsou správná?");
            q7q6.setOptions(List.of("Vkládání na začátek je O(1)", "Přístup přes index je O(n)", "Cache-lokalita je lepší než u pole", "Paměťová náročnost je nižší než u pole"));
            q7q6.setCorrectIndices(List.of(0, 1));
            q7.addQuestion(q7q6);

            MultipleChoiceQuestion q7q7 = new MultipleChoiceQuestion();
            q7q7.setQuestion("Která tři tvrzení o grafových algoritmech jsou správná?");
            q7q7.setOptions(List.of("BFS používá frontu", "DFS používá zásobník nebo rekurzi", "BFS najde nejkratší cestu v neohodnoceném grafu", "DFS zaručuje nejkratší cestu"));
            q7q7.setCorrectIndices(List.of(0, 1, 2));
            q7.addQuestion(q7q7);

            MultipleChoiceQuestion q7q8 = new MultipleChoiceQuestion();
            q7q8.setQuestion("Která tři tvrzení o průchodech stromem jsou správná?");
            q7q8.setOptions(List.of("Preorder: kořen, levý, pravý", "Inorder: levý, kořen, pravý", "Postorder: levý, pravý, kořen", "Levelorder prochází hloubkově"));
            q7q8.setCorrectIndices(List.of(0, 1, 2));
            q7.addQuestion(q7q8);

            MultipleChoiceQuestion q7q9 = new MultipleChoiceQuestion();
            q7q9.setQuestion("Která čtyři tvrzení o Deque jsou správná?");
            q7q9.setOptions(List.of("Podporuje vkládání z obou konců", "Podporuje odebírání z obou konců", "Může fungovat jako zásobník", "Může fungovat jako fronta"));
            q7q9.setCorrectIndices(List.of(0, 1, 2, 3));
            q7.addQuestion(q7q9);

            MultipleChoiceQuestion q7q10 = new MultipleChoiceQuestion();
            q7q10.setQuestion("Která čtyři tvrzení o haldě jsou správná?");
            q7q10.setOptions(List.of("Build-heap má složitost O(n)", "Min-heap má nejmenší prvek v kořeni", "Vložení má složitost O(log n)", "Heap Sort využívá haldu"));
            q7q10.setCorrectIndices(List.of(0, 1, 2, 3));
            q7.addQuestion(q7q10);

            m7.getQuizzes().add(q7);
            courseRepository.save(c7);

            // --- Kurz c8: Návrhové vzory ---
            Course c8 = new Course();
            c8.setName("Návrhové vzory");
            c8.setDescription("10 otázek pokrývajících kreativní, strukturální a behaviorální návrhové vzory.");
            c8.setStatus(StatusEnum.Draft);
            c8.setLector(lecturer);

            Module m8 = new Module();
            m8.setName("Kreativní, strukturální a behaviorální vzory");
            m8.setDescription("Přehled nejdůležitějších návrhových vzorů a jejich vlastností.");
            m8.setIndex(1);
            m8.setActivated(true);
            m8.setCourse(c8);
            c8.getModules().add(m8);

            Quiz q8 = new Quiz();
            q8.setTitle("Kvíz: Návrhové vzory");
            q8.setModule(m8);

            MultipleChoiceQuestion q8q1 = new MultipleChoiceQuestion();
            q8q1.setQuestion("Která tvrzení o vzoru Singleton jsou CHYBNÁ?");
            q8q1.setOptions(List.of("Singleton je vždy thread-safe bez synchronizace", "Singleton může mít více instancí najednou", "Konstruktor Singletonu je veřejný", "Singleton se nedá použít jako globální stav"));
            q8q1.setCorrectIndices(List.of());
            q8.addQuestion(q8q1);

            MultipleChoiceQuestion q8q2 = new MultipleChoiceQuestion();
            q8q2.setQuestion("Která tvrzení o vzoru Observer jsou ŠPATNĚ?");
            q8q2.setOptions(List.of("Subjekt zná konkrétní typy všech pozorovatelů", "Observer je kreativní vzor", "Observer nelze použít pro event handling", "Pozorovatelé nemohou být přidáváni dynamicky"));
            q8q2.setCorrectIndices(List.of());
            q8.addQuestion(q8q2);

            MultipleChoiceQuestion q8q3 = new MultipleChoiceQuestion();
            q8q3.setQuestion("Které jediné tvrzení o vzoru Decorator je správné?");
            q8q3.setOptions(List.of("Decorator je kreativní vzor", "Decorator mění rozhraní dekorovaného objektu", "Decorator přidává chování bez změny rozhraní", "Decorator je totožný se vzorem Proxy"));
            q8q3.setCorrectIndices(List.of(2));
            q8.addQuestion(q8q3);

            MultipleChoiceQuestion q8q4 = new MultipleChoiceQuestion();
            q8q4.setQuestion("Které jediné tvrzení o vzoru Strategy je pravdivé?");
            q8q4.setOptions(List.of("Strategy definuje kostru algoritmu v nadtřídě", "Strategy je totožný se vzorem Template Method", "Strategy zapouzdřuje algoritmus v samostatné třídě", "Strategy neumožňuje záměnu algoritmů za běhu"));
            q8q4.setCorrectIndices(List.of(2));
            q8.addQuestion(q8q4);

            MultipleChoiceQuestion q8q5 = new MultipleChoiceQuestion();
            q8q5.setQuestion("Která dvě tvrzení o kreativních vzorech jsou správná?");
            q8q5.setOptions(List.of("Singleton zajišťuje jedinou instanci třídy", "Builder umožňuje krok-za-krokem vytvoření objektu", "Observer je kreativní vzor", "Facade je kreativní vzor"));
            q8q5.setCorrectIndices(List.of(0, 1));
            q8.addQuestion(q8q5);

            MultipleChoiceQuestion q8q6 = new MultipleChoiceQuestion();
            q8q6.setQuestion("Která dvě tvrzení o vzoru Command jsou správná?");
            q8q6.setOptions(List.of("Zapouzdřuje požadavek jako objekt", "Umožňuje undo operace", "Je totožný se vzorem Strategy", "Vždy vyžaduje synchronní provádění"));
            q8q6.setCorrectIndices(List.of(0, 1));
            q8.addQuestion(q8q6);

            MultipleChoiceQuestion q8q7 = new MultipleChoiceQuestion();
            q8q7.setQuestion("Která tři tvrzení o strukturálních vzorech jsou správná?");
            q8q7.setOptions(List.of("Adapter převádí jedno rozhraní na druhé", "Facade zjednodušuje přístup ke složitému subsystému", "Composite tvoří stromovou strukturu", "Observer je strukturální vzor"));
            q8q7.setCorrectIndices(List.of(0, 1, 2));
            q8.addQuestion(q8q7);

            MultipleChoiceQuestion q8q8 = new MultipleChoiceQuestion();
            q8q8.setQuestion("Která tři tvrzení o vzoru Proxy jsou správná?");
            q8q8.setOptions(List.of("Řídí přístup k jinému objektu", "Implementuje stejné rozhraní jako skutečný objekt", "Může přidávat lazy loading nebo caching", "Je totožný se vzorem Decorator"));
            q8q8.setCorrectIndices(List.of(0, 1, 2));
            q8.addQuestion(q8q8);

            MultipleChoiceQuestion q8q9 = new MultipleChoiceQuestion();
            q8q9.setQuestion("Která čtyři tvrzení o vzoru Builder jsou správná?");
            q8q9.setOptions(List.of("Odděluje konstrukci objektu od reprezentace", "Umožňuje krok-za-krokem tvorbu", "Vrací výsledný objekt metodou build()", "Je kreativní návrhový vzor"));
            q8q9.setCorrectIndices(List.of(0, 1, 2, 3));
            q8.addQuestion(q8q9);

            MultipleChoiceQuestion q8q10 = new MultipleChoiceQuestion();
            q8q10.setQuestion("Která čtyři tvrzení o vzoru Observer jsou správná?");
            q8q10.setOptions(List.of("Definuje závislost jeden-k-mnoha", "Subjekt notifikuje pozorovatele při změně", "Pozorovatelé mohou být přidáváni dynamicky", "Je behaviorální návrhový vzor"));
            q8q10.setCorrectIndices(List.of(0, 1, 2, 3));
            q8.addQuestion(q8q10);

            m8.getQuizzes().add(q8);
            courseRepository.save(c8);

            // --- Kurz c9: Kolekce a Stream API ---
            Course c9 = new Course();
            c9.setName("Kolekce a Stream API");
            c9.setDescription("10 otázek o Java Collections Framework, iterátorech a Stream API.");
            c9.setStatus(StatusEnum.Draft);
            c9.setLector(lecturer);

            Module m9 = new Module();
            m9.setName("JCF, iterátory a streamy");
            m9.setDescription("Hierarchie kolekcí, rozhraní a práce se Stream API.");
            m9.setIndex(1);
            m9.setActivated(true);
            m9.setCourse(c9);
            c9.getModules().add(m9);

            Quiz q9 = new Quiz();
            q9.setTitle("Kvíz: Kolekce a Stream API");
            q9.setModule(m9);

            MultipleChoiceQuestion q9q1 = new MultipleChoiceQuestion();
            q9q1.setQuestion("Která tvrzení o Stream API jsou CHYBNÁ?");
            q9q1.setOptions(List.of("Stream lze použít opakovaně po terminální operaci", "map() je terminální operace", "filter() je terminální operace", "Stream.of() vytvoří paralelní stream automaticky"));
            q9q1.setCorrectIndices(List.of());
            q9.addQuestion(q9q1);

            MultipleChoiceQuestion q9q2 = new MultipleChoiceQuestion();
            q9q2.setQuestion("Která tvrzení o kolekcích jsou ŠPATNĚ?");
            q9q2.setOptions(List.of("Map rozšiřuje Collection", "ArrayList je v balíčku java.lang", "LinkedList neumí fungovat jako fronta", "HashSet garantuje pořadí prvků"));
            q9q2.setCorrectIndices(List.of());
            q9.addQuestion(q9q2);

            MultipleChoiceQuestion q9q3 = new MultipleChoiceQuestion();
            q9q3.setQuestion("Které jediné tvrzení o iterátorech je správné?");
            q9q3.setOptions(List.of("Iterator lze sdílet mezi vlákny bez synchronizace", "ListIterator neumí procházet zpětně", "Iterator má metody hasNext() a next()", "Foreach cyklus nepoužívá Iterator interně"));
            q9q3.setCorrectIndices(List.of(2));
            q9.addQuestion(q9q3);

            MultipleChoiceQuestion q9q4 = new MultipleChoiceQuestion();
            q9q4.setQuestion("Které jediné tvrzení o TreeMap je pravdivé?");
            q9q4.setOptions(List.of("TreeMap ukládá záznamy v pořadí vložení", "TreeMap garantuje O(1) pro get a put", "TreeMap rozšiřuje Collection", "TreeMap uchovává záznamy seřazené podle klíče"));
            q9q4.setCorrectIndices(List.of(3));
            q9.addQuestion(q9q4);

            MultipleChoiceQuestion q9q5 = new MultipleChoiceQuestion();
            q9q5.setQuestion("Která dvě tvrzení o terminálních operacích Stream jsou správná?");
            q9q5.setOptions(List.of("collect() je terminální operace", "reduce() je terminální operace", "map() je terminální operace", "sorted() je terminální operace"));
            q9q5.setCorrectIndices(List.of(0, 1));
            q9.addQuestion(q9q5);

            MultipleChoiceQuestion q9q6 = new MultipleChoiceQuestion();
            q9q6.setQuestion("Která dvě tvrzení o funkcionálních rozhraních jsou správná?");
            q9q6.setOptions(List.of("Mají přesně jednu abstraktní metodu", "Lze je implementovat lambda výrazem", "Nemohou mít default metody", "Anotace @FunctionalInterface je povinná"));
            q9q6.setCorrectIndices(List.of(0, 1));
            q9.addQuestion(q9q6);

            MultipleChoiceQuestion q9q7 = new MultipleChoiceQuestion();
            q9q7.setQuestion("Která tři tvrzení o Optional<T> jsou správná?");
            q9q7.setOptions(List.of("Může obsahovat hodnotu nebo být prázdný", "orElse() vrátí náhradní hodnotu", "isPresent() vrací true pokud obsahuje hodnotu", "Optional.of(null) nevyhodí výjimku"));
            q9q7.setCorrectIndices(List.of(0, 1, 2));
            q9.addQuestion(q9q7);

            MultipleChoiceQuestion q9q8 = new MultipleChoiceQuestion();
            q9q8.setQuestion("Která tři tvrzení o immutabilních kolekcích jsou správná?");
            q9q8.setOptions(List.of("List.of() vytvoří neměnný seznam", "Přidání prvku vyvolá UnsupportedOperationException", "Jsou thread-safe pro čtení", "List.of() dovoluje null hodnoty"));
            q9q8.setCorrectIndices(List.of(0, 1, 2));
            q9.addQuestion(q9q8);

            MultipleChoiceQuestion q9q9 = new MultipleChoiceQuestion();
            q9q9.setQuestion("Která čtyři tvrzení o JCF hierarchii jsou správná?");
            q9q9.setOptions(List.of("Collection rozšiřuje Iterable", "List, Set a Queue rozšiřují Collection", "Map není součástí Collection hierarchie", "ArrayList implementuje List"));
            q9q9.setCorrectIndices(List.of(0, 1, 2, 3));
            q9.addQuestion(q9q9);

            MultipleChoiceQuestion q9q10 = new MultipleChoiceQuestion();
            q9q10.setQuestion("Která čtyři tvrzení o intermediate operacích Stream jsou správná?");
            q9q10.setOptions(List.of("filter() filtruje prvky dle Predicate", "map() transformuje každý prvek", "sorted() seřadí prvky", "distinct() odstraní duplicity"));
            q9q10.setCorrectIndices(List.of(0, 1, 2, 3));
            q9.addQuestion(q9q10);

            m9.getQuizzes().add(q9);
            courseRepository.save(c9);

            // --- Kurz c10: Výjimky a funkcionální programování ---
            Course c10 = new Course();
            c10.setName("Výjimky a funkcionální programování");
            c10.setDescription("10 otázek zaměřených na hierarchii výjimek, try-catch-finally a funkcionální přístup v Javě.");
            c10.setStatus(StatusEnum.Draft);
            c10.setLector(lecturer);

            Module m10 = new Module();
            m10.setName("Výjimky, lambdy a funkcionální rozhraní");
            m10.setDescription("Zacházení s výjimkami a funkcionální programování v Javě.");
            m10.setIndex(1);
            m10.setActivated(true);
            m10.setCourse(c10);
            c10.getModules().add(m10);

            Quiz q10 = new Quiz();
            q10.setTitle("Kvíz: Výjimky a funkcionální programování");
            q10.setModule(m10);

            MultipleChoiceQuestion q10q1 = new MultipleChoiceQuestion();
            q10q1.setQuestion("Která tvrzení o výjimkách jsou CHYBNÁ?");
            q10q1.setOptions(List.of("NullPointerException je checked výjimka", "Error se standardně zachycuje v každé aplikaci", "finally se neprovede po výjimce", "ArrayIndexOutOfBoundsException je checked"));
            q10q1.setCorrectIndices(List.of());
            q10.addQuestion(q10q1);

            MultipleChoiceQuestion q10q2 = new MultipleChoiceQuestion();
            q10q2.setQuestion("Která tvrzení o lambda výrazech jsou ŠPATNĚ?");
            q10q2.setOptions(List.of("Lambda může modifikovat lokální proměnné z okolního scope", "Lambda musí mít explicitní návratový typ", "Lambda nemůže zachytit proměnné z obklopujícího scope", "Lambda je ekvivalentní běžné třídě"));
            q10q2.setCorrectIndices(List.of());
            q10.addQuestion(q10q2);

            MultipleChoiceQuestion q10q3 = new MultipleChoiceQuestion();
            q10q3.setQuestion("Které jediné tvrzení o checked výjimkách je správné?");
            q10q3.setOptions(List.of("NullPointerException je checked", "RuntimeException je checked", "IOException je checked výjimka", "ArrayIndexOutOfBoundsException je checked"));
            q10q3.setCorrectIndices(List.of(2));
            q10.addQuestion(q10q3);

            MultipleChoiceQuestion q10q4 = new MultipleChoiceQuestion();
            q10q4.setQuestion("Které jediné tvrzení o Predicate<T> je pravdivé?");
            q10q4.setOptions(List.of("Predicate vrací String", "Predicate má metodu apply()", "Predicate lze kombinovat pomocí and() a or()", "Predicate je terminální operace Streamu"));
            q10q4.setCorrectIndices(List.of(2));
            q10.addQuestion(q10q4);

            MultipleChoiceQuestion q10q5 = new MultipleChoiceQuestion();
            q10q5.setQuestion("Která dvě tvrzení o bloku try-catch-finally jsou správná?");
            q10q5.setOptions(List.of("finally se provede vždy i po výjimce", "try-with-resources zavře AutoCloseable zdroje", "finally se provede i po System.exit()", "Multi-catch nelze použít v Javě"));
            q10q5.setCorrectIndices(List.of(0, 1));
            q10.addQuestion(q10q5);

            MultipleChoiceQuestion q10q6 = new MultipleChoiceQuestion();
            q10q6.setQuestion("Která dvě tvrzení o funkcionálních rozhraních jsou správná?");
            q10q6.setOptions(List.of("Supplier<T> nemá vstup a vrací T", "Consumer<T> přijme T a nic nevrátí", "Function<T,R> přijme T a vrátí void", "Predicate<T> přijme T a vrátí String"));
            q10q6.setCorrectIndices(List.of(0, 1));
            q10.addQuestion(q10q6);

            MultipleChoiceQuestion q10q7 = new MultipleChoiceQuestion();
            q10q7.setQuestion("Která tři tvrzení o hierarchii výjimek jsou správná?");
            q10q7.setOptions(List.of("Error a Exception jsou podtřídy Throwable", "RuntimeException je unchecked", "Checked exceptions musí být deklarovány nebo zachyceny", "Všechny výjimky jsou checked"));
            q10q7.setCorrectIndices(List.of(0, 1, 2));
            q10.addQuestion(q10q7);

            MultipleChoiceQuestion q10q8 = new MultipleChoiceQuestion();
            q10q8.setQuestion("Která tři tvrzení o method reference jsou správná?");
            q10q8.setOptions(List.of("Lze odkazovat na statické metody (Třída::metoda)", "Lze odkazovat na instanční metody (instance::metoda)", "Lze odkazovat na konstruktor (Třída::new)", "Method reference nelze použít jako lambda náhrada"));
            q10q8.setCorrectIndices(List.of(0, 1, 2));
            q10.addQuestion(q10q8);

            MultipleChoiceQuestion q10q9 = new MultipleChoiceQuestion();
            q10q9.setQuestion("Která čtyři tvrzení o Error v Javě jsou správná?");
            q10q9.setOptions(List.of("Error je podtřída Throwable", "Typicky se nezachycuje", "OutOfMemoryError je příklad Error", "StackOverflowError je příklad Error"));
            q10q9.setCorrectIndices(List.of(0, 1, 2, 3));
            q10.addQuestion(q10q9);

            MultipleChoiceQuestion q10q10 = new MultipleChoiceQuestion();
            q10q10.setQuestion("Která čtyři tvrzení o BiFunction<T,U,R> a příbuzných rozhraních jsou správná?");
            q10q10.setOptions(List.of("BiFunction přijímá dva parametry a vrací výsledek", "Function<T,R> přijímá jeden parametr a vrací výsledek", "Supplier<T> nepřijímá parametry", "Consumer<T> nepřijímá parametry"));
            q10q10.setCorrectIndices(List.of(0, 1, 2));
            q10.addQuestion(q10q10);

            m10.getQuizzes().add(q10);
            courseRepository.save(c10);


            System.out.println("✅ Testovací kurzy, moduly a kvízy byly úspěšně vygenerovány.");
        }
    }

    private void seedCourseVersions(Course course) {
        // Verze 1 — kurz jen se jménem, bez modulů
        saveVersion(course,
            shortId(),
            """
            {"name":"Kybernetická bezpečnost 101","description":"Pracovní koncept kurzu zabezpečení informačních systémů.","modules":[]}
            """.strip()
        );

        // Verze 2 — kurz s jedním modulem (bez materiálů a kvízů)
        saveVersion(course,
            shortId(),
            """
            {"name":"Kybernetická bezpečnost 101","description":"Pracovní koncept kurzu zabezpečení informačních systémů. Kurz zatím není určen pro veřejnost.","modules":[{"uuid":null,"index":1,"isActivated":false,"name":"1. Základy síťové bezpečnosti","description":"Protokoly, firewally, základní principy.","materials":[],"quizzes":[]}]}
            """.strip()
        );

        // Verze 3 — aktuální stav (dva moduly, materiály, kvíz)
        saveVersion(course,
            shortId(),
            String.format(
                """
                {"name":"Kybernetická bezpečnost 101","description":"Pracovní koncept kurzu zabezpečení informačních systémů. Kurz zatím není určen pro veřejnost.","modules":[{"uuid":null,"index":1,"isActivated":false,"name":"1. Základy síťové bezpečnosti","description":"Protokoly, firewally, základní principy.","materials":[{"type":"url","uuid":null,"name":"OWASP Top 10","description":"Přehled nejčastějších bezpečnostních zranitelností.","count":0,"createdAt":null,"url":"https://owasp.org/www-project-top-ten/","faviconUrl":null}],"quizzes":[{"uuid":null,"title":"Test: Síťová bezpečnost","questions":[{"type":"singleChoice","uuid":null,"question":"Co znamená zkratka TLS?","options":["Transport Layer Security","Trusted Login System","Token Level Security","Transfer Link Standard"],"correctIndex":0}]}]},{"uuid":null,"index":2,"isActivated":false,"name":"2. Kryptografie a šifrování","description":"Symetrické a asymetrické šifrování, certifikáty.","materials":[{"type":"url","uuid":null,"name":"Kryptografie — Khan Academy","description":"Interaktivní kurz kryptografie.","count":0,"createdAt":null,"url":"https://www.khanacademy.org/computing/computer-science/cryptography","faviconUrl":null}],"quizzes":[]}]}
                """.strip()
            )
        );
    }

    private void saveVersion(Course course, String shortId, String snapshotJson) {
        CourseVersion v = new CourseVersion();
        v.setCourse(course);
        v.setShortId(shortId);
        v.setSnapshotJson(snapshotJson);
        courseVersionRepository.save(v);
    }

    private String shortId() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 7);
    }
}
