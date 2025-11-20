package cz.projektant_pata.tda26.service;

import cz.projektant_pata.tda26.model.RoleEnum;
import cz.projektant_pata.tda26.model.User;
import cz.projektant_pata.tda26.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class UserServiceImpl implements IUserService{
    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository repository, PasswordEncoder passwordEncoder){
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }


    @Override
    public List<User> find() {
        return repository.findAll();
    }

    @Override
    public User find(UUID uuid) {
        return repository.findById(uuid).orElseThrow(() -> new RuntimeException("Uzivatel nebyl nalezen"));
    }

    @Override
    public User find(String username) {
        return repository.findByUsername(username).orElseThrow(() -> new RuntimeException("Uzivatel nebyl nalezen"));
    }

    @Override
    public User update(UUID uuid, User user) {
        User existingUser = repository.findById(uuid).orElseThrow(() -> new RuntimeException("Uzivatel nebyl nalezen"));

        user.setUsername(user.getUsername());
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        return repository.save(existingUser);
    }

    @Override
    public User create(User user) {
        return repository.save(user);
    }



    @Override
    public User kill(UUID uuid) {
        User user = repository.findById(uuid).orElseThrow(() -> new RuntimeException("Uzivatel nebyl nalezen"));
        repository.delete(user);
        return user;
    }

    @Override
    public boolean exists(String username){
        return repository.findByUsername(username).isPresent();
    }
}
