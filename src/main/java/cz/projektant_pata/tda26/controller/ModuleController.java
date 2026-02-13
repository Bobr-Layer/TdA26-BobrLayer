package cz.projektant_pata.tda26.controller;

import cz.projektant_pata.tda26.dto.course.module.ModuleRequestDTO;
import cz.projektant_pata.tda26.dto.course.module.ModuleResponseDTO;
import cz.projektant_pata.tda26.mapper.ModuleMapper;
import cz.projektant_pata.tda26.model.course.module.Module;
import cz.projektant_pata.tda26.service.IModuleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/courses/{courseUuid}/modules")
@RequiredArgsConstructor
public class ModuleController {

    private final IModuleService moduleService;
    private final ModuleMapper moduleMapper;

    @GetMapping
    public ResponseEntity<List<ModuleResponseDTO>> find(
            @PathVariable UUID courseUuid
    ) {
        List<ModuleResponseDTO> response = moduleService.find(courseUuid).stream()
                .map(moduleMapper::toResponse)
                .toList();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{moduleUuid}")
    public ResponseEntity<ModuleResponseDTO> find(
            @PathVariable UUID courseUuid,
            @PathVariable UUID moduleUuid
    ) {
        Module module = moduleService.find(courseUuid, moduleUuid);
        return ResponseEntity.ok(moduleMapper.toResponse(module));
    }

    @PostMapping
    public ResponseEntity<ModuleResponseDTO> create(
            @PathVariable UUID courseUuid,
            @RequestBody @Valid ModuleRequestDTO request
    ) {
        Module created = moduleService.create(courseUuid, request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(moduleMapper.toResponse(created));
    }

    @PutMapping("/{moduleUuid}")
    public ResponseEntity<ModuleResponseDTO> update(
            @PathVariable UUID courseUuid,
            @PathVariable UUID moduleUuid,
            @RequestBody @Valid ModuleRequestDTO request
    ) {
        Module updated = moduleService.update(courseUuid, moduleUuid, request);
        return ResponseEntity.ok(moduleMapper.toResponse(updated));
    }

    @DeleteMapping("/{moduleUuid}")
    public ResponseEntity<Void> kill(
            @PathVariable UUID courseUuid,
            @PathVariable UUID moduleUuid
    ) {
        moduleService.kill(courseUuid, moduleUuid);
        return ResponseEntity.noContent().build();
    }
}
