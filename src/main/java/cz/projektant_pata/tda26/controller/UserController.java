package cz.projektant_pata.tda26.controller;

import cz.projektant_pata.tda26.model.User;
import cz.projektant_pata.tda26.service.IUserService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
@RestController
@RequestMapping("/api/user")
public class UserController {
    private final IUserService service;
    private final AuthenticationManager authManager;

    public UserController(IUserService service,
                          AuthenticationManager authManager) {
        this.service = service;
        this.authManager = authManager;
    }

    @GetMapping
    public List<User> find() {
        return service.find();
    }

    @GetMapping("/{uuid}")
    public User find(@PathVariable UUID uuid) {
        return service.find(uuid);
    }

    @DeleteMapping("/{uuid}")
    public User kill(@PathVariable UUID uuid) {
        return service.kill(uuid);
    }
}
