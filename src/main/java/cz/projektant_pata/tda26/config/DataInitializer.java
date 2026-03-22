package cz.projektant_pata.tda26.config;

import cz.projektant_pata.tda26.model.course.Course;
import cz.projektant_pata.tda26.model.course.StatusEnum;
import cz.projektant_pata.tda26.model.course.module.Module;
import cz.projektant_pata.tda26.model.course.material.Material;
import cz.projektant_pata.tda26.model.course.material.UrlMaterial;
import cz.projektant_pata.tda26.model.course.quiz.MultipleChoiceQuestion;
import cz.projektant_pata.tda26.model.course.quiz.Question;
import cz.projektant_pata.tda26.model.course.quiz.Quiz;
import cz.projektant_pata.tda26.model.course.quiz.SingleChoiceQuestion;
import cz.projektant_pata.tda26.model.user.RoleEnum;
import cz.projektant_pata.tda26.model.user.User;
import cz.projektant_pata.tda26.repository.CourseRepository;
import cz.projektant_pata.tda26.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import jakarta.transaction.Transactional;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        // Vytvoření uživatelů
        User admin = userRepository.findByUsername("admin").orElseGet(() -> {
            User u = new User();
            u.setUsername("admin");
            u.setPassword(passwordEncoder.encode("TdA26!"));
            u.setRole(RoleEnum.ADMIN);
            System.out.println("✅ Uživatel 'admin' byl vytvořen.");
            return userRepository.save(u);
        });

        User lecturer = userRepository.findByUsername("lecturer").orElseGet(() -> {
            User u = new User();
            u.setUsername("lecturer");
            u.setPassword(passwordEncoder.encode("TdA26!"));
            u.setRole(RoleEnum.LEKTOR);
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

            courseRepository.save(c1);
            courseRepository.save(c2);
            courseRepository.save(c3);

            System.out.println("✅ Testovací kurzy, moduly a kvízy byly úspěšně vygenerovány.");
        }
    }
}
