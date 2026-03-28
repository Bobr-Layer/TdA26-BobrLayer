package cz.projektant_pata.tda26.controller;

import cz.projektant_pata.tda26.dto.user.UserResponseDTO;
import cz.projektant_pata.tda26.mapper.UserMapper;
import cz.projektant_pata.tda26.model.branch.Branch;
import cz.projektant_pata.tda26.model.user.RoleEnum;
import cz.projektant_pata.tda26.model.user.User;
import cz.projektant_pata.tda26.repository.BranchRepository;
import cz.projektant_pata.tda26.repository.UserRepository;
import cz.projektant_pata.tda26.service.IUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final IUserService service;
    private final UserMapper mapper;
    private final BranchRepository branchRepository;
    private final UserRepository userRepository;

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<List<UserResponseDTO>> find(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(403).build();
        }
        User currentUser = (User) auth.getPrincipal();

        List<User> users;
        if (currentUser.getRole() == RoleEnum.SUPER_ADMIN) {
            users = service.find();
        } else if (currentUser.getRole() == RoleEnum.ADMIN) {
            List<UUID> branchIds = branchRepository.findByManagerUuid(currentUser.getUuid())
                    .stream().map(Branch::getUuid).toList();
            users = branchIds.isEmpty() ? List.of() : userRepository.findByBranchUuidIn(branchIds);
        } else {
            return ResponseEntity.status(403).build();
        }

        List<UserResponseDTO> result = users.stream().map(mapper::toResponse).toList();
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{uuid}")
    public ResponseEntity<UserResponseDTO> find(@PathVariable UUID uuid) {
        User user = service.find(uuid);
        return ResponseEntity.ok(mapper.toResponse(user));
    }

    @PutMapping("/{uuid}/role")
    public ResponseEntity<UserResponseDTO> updateRole(@PathVariable UUID uuid,
                                                       @RequestBody Map<String, String> body,
                                                       Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(403).build();
        }
        User currentUser = (User) auth.getPrincipal();
        RoleEnum role = RoleEnum.valueOf(body.get("role"));

        if (currentUser.getRole() == RoleEnum.ADMIN) {
            if (role != RoleEnum.LEKTOR && role != RoleEnum.STUDENT) {
                return ResponseEntity.status(403).build();
            }
        } else if (currentUser.getRole() != RoleEnum.SUPER_ADMIN) {
            return ResponseEntity.status(403).build();
        }

        User updates = new User();
        updates.setRole(role);
        User updated = service.update(uuid, updates);
        return ResponseEntity.ok(mapper.toResponse(updated));
    }

    @DeleteMapping("/{uuid}")
    public ResponseEntity<Void> kill(@PathVariable UUID uuid) {
        service.kill(uuid);
        return ResponseEntity.noContent().build();
    }
}
