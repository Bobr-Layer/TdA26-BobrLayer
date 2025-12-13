package cz.projektant_pata.tda26.controller;

import cz.projektant_pata.tda26.dto.user.UserResponseDTO;
import cz.projektant_pata.tda26.mapper.UserMapper;
import cz.projektant_pata.tda26.model.user.User;
import cz.projektant_pata.tda26.service.IUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final IUserService service;
    private final UserMapper mapper;

    @GetMapping
    public ResponseEntity<List<UserResponseDTO>> find() {
        List<UserResponseDTO> users = service.find()
                .stream()
                .map(mapper::toResponse)
                .toList();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{uuid}")
    public ResponseEntity<UserResponseDTO> find(@PathVariable UUID uuid) {
        User user = service.find(uuid);
        return ResponseEntity.ok(mapper.toResponse(user));
    }

    @DeleteMapping("/{uuid}")
    public ResponseEntity<Void> kill(@PathVariable UUID uuid) {
        service.kill(uuid);
        return ResponseEntity.noContent().build();
    }
}
