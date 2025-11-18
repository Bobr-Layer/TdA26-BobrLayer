package cz.projektant_pata.tda26.controller;

import cz.projektant_pata.tda26.dto.auth.LoginRequest;
import cz.projektant_pata.tda26.dto.auth.RegisterRequest;
import cz.projektant_pata.tda26.dto.auth.ResetPassword;
import cz.projektant_pata.tda26.dto.user.UserResponse;
import cz.projektant_pata.tda26.mapper.UserMapper;
import cz.projektant_pata.tda26.model.user.RoleEnum;
import cz.projektant_pata.tda26.model.user.User;
import cz.projektant_pata.tda26.service.IUserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final IUserService service;
    private final AuthenticationManager authManager;
    private final UserMapper mapper;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        return registerUserWithRole(request, RoleEnum.STUDENT);
    }

    @PostMapping("/registerAdmin")
    public ResponseEntity<?> registerAdmin(@RequestBody RegisterRequest request) {
        return registerUserWithRole(request, RoleEnum.ADMIN);
    }

    @PostMapping("/registerLector")
    public ResponseEntity<?> registerLector(@RequestBody RegisterRequest request) {
        return registerUserWithRole(request, RoleEnum.LEKTOR);
    }

    private ResponseEntity<?> registerUserWithRole(RegisterRequest request, RoleEnum role) {
        if (service.exists(request.getUsername())) {
            return ResponseEntity
                    .badRequest()
                    .body("Username already exists");
        }
        User user = mapper.toEntity(request);
        user.setRole(role);

        user = service.create(user);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(mapper.toResponse(user));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            Authentication authentication = authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);
            User user = (User) authentication.getPrincipal();
            return ResponseEntity.ok(mapper.toResponse(user));
        } catch (Exception e) {
            log.error("Login failed for user: {}", request.getUsername(), e); // Správné logování
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);

        if (session != null) {
            session.invalidate();
        }

        SecurityContextHolder.clearContext();

        return ResponseEntity.ok("Odhlášení proběhlo úspěšně");
    }


    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && authentication.getPrincipal() instanceof User) {
            User user = (User) authentication.getPrincipal();
            return ResponseEntity.ok(mapper.toResponse(user));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    @PutMapping("/reset-password/{uuid}")
    public ResponseEntity<UserResponse> updatePassword(@PathVariable UUID uuid, @RequestBody ResetPassword request){

        User updatedUser = service.update(uuid, request.getPassword());

        return ResponseEntity.ok(mapper.toResponse(updatedUser));
    }
}
