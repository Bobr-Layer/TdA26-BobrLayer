package cz.projektant_pata.tda26.controller;

import cz.projektant_pata.tda26.dto.auth.LoginRequest;
import cz.projektant_pata.tda26.dto.auth.RegisterRequest;
import cz.projektant_pata.tda26.dto.auth.ResetPassword;
import cz.projektant_pata.tda26.dto.auth.ResetUsername;
import cz.projektant_pata.tda26.dto.user.UserResponse;
import cz.projektant_pata.tda26.model.RoleEnum;
import cz.projektant_pata.tda26.model.User;
import cz.projektant_pata.tda26.service.IUserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final IUserService service;
    private final AuthenticationManager authManager;
    private final PasswordEncoder encoder;

    public AuthController(IUserService service,
                          AuthenticationManager authManager,
                          PasswordEncoder encoder) {
        this.service = service;
        this.authManager = authManager;
        this.encoder = encoder;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        if (service.exists(request.getUsername())) {
            return ResponseEntity
                    .badRequest()
                    .body("Username already exists");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(encoder.encode(request.getPassword()));

        User savedUser = service.create(user);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(mapToResponse(savedUser));
    }

    @PostMapping("/registerAdmin")
    public ResponseEntity<?> registerAdmin(@RequestBody RegisterRequest request) {
        if (service.exists(request.getUsername())) {
            return ResponseEntity
                    .badRequest()
                    .body("Email already exists");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(request.getPassword());
        user.setRole(RoleEnum.ADMIN);

        User savedUser = service.create(user);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(mapToResponse(savedUser));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            Authentication authentication = authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()
                    )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            User user = (User) authentication.getPrincipal();

            return ResponseEntity.ok(mapToResponse(user));

        } catch (Exception e) {
            e.printStackTrace();  // Nebo použij logger
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid credentials: " + e.getMessage());
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null && authentication.isAuthenticated()) {
            User user = (User) authentication.getPrincipal();
            return ResponseEntity.ok(mapToResponse(user));
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    @GetMapping("/test")
    public String test() {
        return "penis";
    }

    @PutMapping
    @RequestMapping("/reset-password/{uuid}")
    public User updatePassword(@PathVariable UUID uuid, @RequestBody ResetPassword request){
        User user = service.find(uuid);
        user.setPassword(request.getPassword());
        return service.update(uuid, user);
    }

    @PutMapping
    @RequestMapping("/reset-username/{uuid}")
    public User updateUsername(@PathVariable UUID uuid, @RequestBody ResetUsername request){
        User user = service.find(uuid);
        user.setUsername(request.getUsername());
        return service.update(uuid, user);
    }

    private UserResponse mapToResponse(User user) {
        UserResponse response = new UserResponse();
        response.setUuid(user.getUuid().toString());
        response.setUsername(user.getUsername());
        response.setRole(user.getRole().name());
        response.setEnabled(user.getEnabled());
        return response;
    }
}
