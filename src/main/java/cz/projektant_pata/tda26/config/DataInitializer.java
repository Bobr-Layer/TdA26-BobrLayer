package cz.projektant_pata.tda26.config;

import cz.projektant_pata.tda26.model.user.RoleEnum;
import cz.projektant_pata.tda26.model.user.User;
import cz.projektant_pata.tda26.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder; // Pokud používáš Security
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.findByUsername("lecturer").isEmpty()) {
            User lecturer = new User();
            lecturer.setUsername("lecturer");
            lecturer.setPassword(passwordEncoder.encode("TdA26!"));
            lecturer.setRole(RoleEnum.LEKTOR);

            userRepository.save(lecturer);
            System.out.println("✅ Uživatel 'lecturer' byl vytvořen.");
        }
    }
}
