package cz.projektant_pata.tda26.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import cz.projektant_pata.tda26.model.User;
import cz.projektant_pata.tda26.model.Role;
import cz.projektant_pata.tda26.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User registerUser(String email, String firstname, String lastname, String rawPassword) {
        User user = new User();
        user.setEmail(email);
        user.setFirstname(firstname);
        user.setLastname(lastname);

        // DŮLEŽITÉ: Hashujeme heslo před uložením
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setRole(Role.ROLE_USER);
        user.setEnabled(true);

        return userRepository.save(user);
    }

    public boolean validatePassword(String rawPassword, String hashedPassword) {
        // Porovnáme surové heslo s uloženým hashem
        return passwordEncoder.matches(rawPassword, hashedPassword);
    }
}
