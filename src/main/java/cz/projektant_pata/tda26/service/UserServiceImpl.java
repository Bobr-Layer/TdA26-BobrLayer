package cz.projektant_pata.tda26.service;

import cz.projektant_pata.tda26.model.User;
import cz.projektant_pata.tda26.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements IUserService {
    private final UserRepository repository;
    private final PasswordEncoder encoder;

    @Override
    public List<User> find() {
        return repository.findAll();
    }

    @Override
    public User find(UUID uuid) {
        return repository.findById(uuid)
                .orElseThrow(() -> new RuntimeException("Uživatel s ID " + uuid + " nebyl nalezen"));
    }

    @Override
    public User find(String username) {
        return repository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Uživatel " + username + " nebyl nalezen"));
    }

    @Override
    @Transactional
    public User update(UUID uuid, User userUpdates) {
        User existingUser = find(uuid);

        if (!existingUser.getUsername().equals(userUpdates.getUsername()) &&
                repository.findByUsername(userUpdates.getUsername()).isPresent()) {
            throw new IllegalArgumentException("Uživatelské jméno již existuje");
        }

        existingUser.setUsername(userUpdates.getUsername());
        existingUser.setPassword(encoder.encode(userUpdates.getPassword()));
        existingUser.setRole(userUpdates.getRole());
        existingUser.setEnabled(userUpdates.getEnabled());

        return repository.save(existingUser);
    }

    @Override
    @Transactional
    public User update(UUID uuid, String pass) {
        User user = find(uuid);

        user.setPassword(encoder.encode(pass));

        return repository.save(user);
    }

    @Override
    @Transactional
    public User create(User user) {
        if (repository.findByUsername(user.getUsername()).isPresent()) {
            throw new IllegalArgumentException("Uživatelské jméno již existuje");
        }

        user.setPassword(encoder.encode(user.getPassword()));
        return repository.save(user);
    }

    @Override
    @Transactional
    public User kill(UUID uuid) {
        User user = find(uuid);
        repository.delete(user);
        return user;
    }

    @Override
    public boolean exists(String username) {
        return repository.findByUsername(username).isPresent();
    }
}
