package cz.projektant_pata.tda26.controller;

import cz.projektant_pata.tda26.dto.branch.BranchResponseDTO;
import cz.projektant_pata.tda26.dto.branch.BranchUpdateDTO;
import cz.projektant_pata.tda26.dto.branch.CreateBranchUserDTO;
import cz.projektant_pata.tda26.dto.user.UserResponseDTO;
import cz.projektant_pata.tda26.exception.ResourceNotFoundException;
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

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/branches")
@RequiredArgsConstructor
public class BranchController {

    private final BranchRepository branchRepository;
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final IUserService userService;

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<List<BranchResponseDTO>> getBranches(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(403).build();
        }

        User user = (User) auth.getPrincipal();

        if (user.getRole() != RoleEnum.ADMIN && user.getRole() != RoleEnum.SUPER_ADMIN) {
            return ResponseEntity.status(403).build();
        }

        List<Branch> branches = user.getRole() == RoleEnum.SUPER_ADMIN
                ? branchRepository.findAllByOrderByCreatedAtDesc()
                : branchRepository.findByManagerUuid(user.getUuid());

        List<BranchResponseDTO> result = branches.stream()
                .map(this::toDTO)
                .toList();

        return ResponseEntity.ok(result);
    }

    @GetMapping("/{uuid}")
    @Transactional(readOnly = true)
    public ResponseEntity<BranchResponseDTO> getBranch(@PathVariable UUID uuid, Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(403).build();
        }

        User user = (User) auth.getPrincipal();

        if (user.getRole() != RoleEnum.ADMIN && user.getRole() != RoleEnum.SUPER_ADMIN) {
            return ResponseEntity.status(403).build();
        }

        Branch branch = branchRepository.findById(uuid)
                .orElseThrow(() -> new ResourceNotFoundException("Pobočka s ID " + uuid + " nebyla nalezena"));

        if (user.getRole() == RoleEnum.ADMIN) {
            boolean manages = branchRepository.findByManagerUuid(user.getUuid())
                    .stream().anyMatch(b -> b.getUuid().equals(uuid));
            if (!manages) return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(toDTO(branch));
    }

    @PutMapping("/{uuid}")
    @Transactional
    public ResponseEntity<BranchResponseDTO> updateBranch(@PathVariable UUID uuid,
                                                           @RequestBody BranchUpdateDTO body,
                                                           Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(403).build();
        }

        User user = (User) auth.getPrincipal();

        if (user.getRole() != RoleEnum.ADMIN && user.getRole() != RoleEnum.SUPER_ADMIN) {
            return ResponseEntity.status(403).build();
        }

        Branch branch = branchRepository.findById(uuid)
                .orElseThrow(() -> new ResourceNotFoundException("Pobočka s ID " + uuid + " nebyla nalezena"));

        if (user.getRole() == RoleEnum.ADMIN) {
            boolean manages = branchRepository.findByManagerUuid(user.getUuid())
                    .stream().anyMatch(b -> b.getUuid().equals(uuid));
            if (!manages) return ResponseEntity.status(403).build();
        }

        if (body.getName() != null) branch.setName(body.getName());
        if (body.getCountry() != null) branch.setCountry(body.getCountry());
        if (body.getCity() != null) branch.setCity(body.getCity());
        if (body.getAddress() != null) branch.setAddress(body.getAddress());
        if (body.getPostalCode() != null) branch.setPostalCode(body.getPostalCode());
        if (body.getRegion() != null) branch.setRegion(body.getRegion());
        if (body.getType() != null) branch.setType(body.getType());
        if (body.getStatus() != null) branch.setStatus(body.getStatus());

        return ResponseEntity.ok(toDTO(branchRepository.save(branch)));
    }

    @GetMapping("/{uuid}/users")
    @Transactional(readOnly = true)
    public ResponseEntity<List<UserResponseDTO>> getBranchUsers(@PathVariable UUID uuid, Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(403).build();
        }

        User user = (User) auth.getPrincipal();

        if (user.getRole() != RoleEnum.ADMIN && user.getRole() != RoleEnum.SUPER_ADMIN) {
            return ResponseEntity.status(403).build();
        }

        if (!branchRepository.existsById(uuid)) {
            throw new ResourceNotFoundException("Pobočka s ID " + uuid + " nebyla nalezena");
        }

        if (user.getRole() == RoleEnum.ADMIN) {
            boolean manages = branchRepository.findByManagerUuid(user.getUuid())
                    .stream().anyMatch(b -> b.getUuid().equals(uuid));
            if (!manages) return ResponseEntity.status(403).build();
        }

        List<User> lectors = userRepository.findByBranchUuid(uuid);
        List<User> managers = userRepository.findManagersByBranchUuid(uuid);

        List<User> combined = new ArrayList<>(managers);
        for (User l : lectors) {
            if (combined.stream().noneMatch(m -> m.getUuid().equals(l.getUuid()))) {
                combined.add(l);
            }
        }

        List<UserResponseDTO> result = combined.stream().map(userMapper::toResponse).toList();
        return ResponseEntity.ok(result);
    }

    @PostMapping
    @Transactional
    public ResponseEntity<BranchResponseDTO> createBranch(@RequestBody BranchUpdateDTO body, Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) return ResponseEntity.status(403).build();
        User user = (User) auth.getPrincipal();
        if (user.getRole() != RoleEnum.SUPER_ADMIN) return ResponseEntity.status(403).build();

        Branch branch = new Branch();
        branch.setName(body.getName());
        branch.setCountry(body.getCountry());
        branch.setCity(body.getCity());
        branch.setAddress(body.getAddress());
        branch.setPostalCode(body.getPostalCode());
        branch.setRegion(body.getRegion());
        branch.setType(body.getType());
        branch.setStatus(body.getStatus());

        return ResponseEntity.status(201).body(toDTO(branchRepository.save(branch)));
    }

    @PostMapping("/{uuid}/users")
    @Transactional
    public ResponseEntity<UserResponseDTO> createBranchUser(@PathVariable UUID uuid,
                                                              @RequestBody CreateBranchUserDTO body,
                                                              Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) return ResponseEntity.status(403).build();
        User caller = (User) auth.getPrincipal();

        if (caller.getRole() != RoleEnum.ADMIN && caller.getRole() != RoleEnum.SUPER_ADMIN) {
            return ResponseEntity.status(403).build();
        }

        Branch branch = branchRepository.findById(uuid)
                .orElseThrow(() -> new ResourceNotFoundException("Pobočka s ID " + uuid + " nebyla nalezena"));

        if (caller.getRole() == RoleEnum.ADMIN) {
            boolean manages = branchRepository.findByManagerUuid(caller.getUuid())
                    .stream().anyMatch(b -> b.getUuid().equals(uuid));
            if (!manages) return ResponseEntity.status(403).build();
            if (body.getRole() != RoleEnum.LEKTOR) return ResponseEntity.status(403).build();
        }

        User newUser = new User();
        newUser.setUsername(body.getUsername());
        newUser.setPassword(body.getPassword());
        newUser.setRole(body.getRole() != null ? body.getRole() : RoleEnum.LEKTOR);

        if (newUser.getRole() == RoleEnum.LEKTOR) {
            newUser.setBranch(branch);
        }

        User saved = userService.create(newUser);

        if (saved.getRole() == RoleEnum.ADMIN) {
            saved.getManagedBranches().add(branch);
            userRepository.save(saved);
        }

        return ResponseEntity.status(201).body(userMapper.toResponse(saved));
    }

    private BranchResponseDTO toDTO(Branch b) {
        BranchResponseDTO dto = new BranchResponseDTO();
        dto.setUuid(b.getUuid());
        dto.setName(b.getName());
        dto.setCountry(b.getCountry());
        dto.setCity(b.getCity());
        dto.setAddress(b.getAddress());
        dto.setPostalCode(b.getPostalCode());
        dto.setRegion(b.getRegion() != null ? b.getRegion().name() : null);
        dto.setType(b.getType() != null ? b.getType().name() : null);
        dto.setStatus(b.getStatus() != null ? b.getStatus().name() : null);
        dto.setLectorsCount(b.getLectors().size());
        dto.setManagersCount(b.getManagers().size());
        dto.setCreatedAt(b.getCreatedAt());
        return dto;
    }
}
