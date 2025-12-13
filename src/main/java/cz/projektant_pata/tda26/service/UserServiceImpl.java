package cz.projektant_pata.tda26.service;

import cz.projektant_pata.tda26.exception.ResourceAlreadyExistsException;
import cz.projektant_pata.tda26.exception.ResourceNotFoundException;
import cz.projektant_pata.tda26.model.user.User;
import cz.projektant_pata.tda26.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements IUserService, UserDetailsService {

    private final UserRepository repository;
    private final PasswordEncoder encoder;

    @Override
    @Transactional(readOnly = true)
    public List<User> find() {
        return repository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public User find(UUID uuid) {
        return getUserOrThrow(uuid);
    }

    @Override
    @Transactional(readOnly = true)
    public User find(String username) {
        return repository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Uživatel s uživatelským jménem " + username + " nebyl nalezen"));
    }

    @Override
    @Transactional
    public User update(UUID uuid, User userUpdates) {
        User existingUser = getUserOrThrow(uuid);

        if (userUpdates.getUsername() != null
                && !userUpdates.getUsername().equals(existingUser.getUsername())) {

            if (repository.existsByUsername(userUpdates.getUsername())) {
                throw new ResourceAlreadyExistsException("Uživatel se jménem '" + userUpdates.getUsername() + "' již existuje.");
            }
            existingUser.setUsername(userUpdates.getUsername());
        }

        if (userUpdates.getPassword() != null && !userUpdates.getPassword().isEmpty()) {
            existingUser.setPassword(encoder.encode(userUpdates.getPassword()));
        }

        if (userUpdates.getRole() != null) {
            existingUser.setRole(userUpdates.getRole());
        }
        if (userUpdates.getEnabled() != null) {
            existingUser.setEnabled(userUpdates.getEnabled());
        }

        return repository.save(existingUser);
    }

    @Override
    @Transactional
    public User update(UUID uuid, String pass) {
        User user = getUserOrThrow(uuid);
        if (pass == null || pass.isBlank()) {
            throw new IllegalArgumentException("Heslo nesmí být prázdné");
        }
        user.setPassword(encoder.encode(pass));
        return repository.save(user);
    }

    @Override
    @Transactional
    public User create(User user) {
        if (repository.existsByUsername(user.getUsername())) {
            throw new ResourceAlreadyExistsException("Uživatel se jménem '" + user.getUsername() + "' již existuje.");
        }

        if (user.getPassword() == null || user.getPassword().isBlank()) {
            throw new IllegalArgumentException("Heslo je povinné.");
        }

        user.setPassword(encoder.encode(user.getPassword()));
        return repository.save(user);
    }

    @Override
    @Transactional
    public User kill(UUID uuid) {
        User user = getUserOrThrow(uuid);
        repository.delete(user);
        return user;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean exists(String username) {
        return repository.existsByUsername(username);
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return repository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));
    }


    private User getUserOrThrow(UUID uuid) {
        return repository.findById(uuid)
                .orElseThrow(() -> new ResourceNotFoundException("Uživatel s ID " + uuid + " nebyl nalezen"));
    }
}
