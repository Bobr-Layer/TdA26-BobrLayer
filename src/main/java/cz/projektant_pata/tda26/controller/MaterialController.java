package cz.projektant_pata.tda26.controller;

import cz.projektant_pata.tda26.dto.course.material.*;
import cz.projektant_pata.tda26.mapper.MaterialMapper;
import cz.projektant_pata.tda26.model.course.material.Material;
import cz.projektant_pata.tda26.service.IMaterialService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/courses/{courseUuid}/modules/{moduleUuid}/materials") // ✅ opravena URL
@RequiredArgsConstructor
public class MaterialController {

    private final IMaterialService service;
    private final MaterialMapper mapper;

    @GetMapping
    public ResponseEntity<List<MaterialResponseDTO>> find(
            @PathVariable UUID courseUuid,  // zatím nevyužito, ale v URL být musí
            @PathVariable UUID moduleUuid   // ✅ bylo: ignorováno
    ) {
        List<MaterialResponseDTO> response = service.find(moduleUuid).stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{materialUuid}")
    public ResponseEntity<MaterialResponseDTO> find(
            @PathVariable UUID courseUuid,
            @PathVariable UUID moduleUuid,  // ✅ přidáno
            @PathVariable UUID materialUuid
    ) {
        Material material = service.find(moduleUuid, materialUuid); // ✅ bylo: courseUuid
        return ResponseEntity.ok(mapper.toResponse(material));
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<MaterialResponseDTO> create(
            @PathVariable UUID courseUuid,
            @PathVariable UUID moduleUuid,  // ✅ přidáno
            @Valid @RequestBody MaterialRequestDTO request
    ) {
        Material materialDraft = mapper.toEntity(request);
        Material saved = service.create(moduleUuid, materialDraft); // ✅ bylo: courseUuid
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(mapper.toResponse(saved));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MaterialResponseDTO> create(
            @PathVariable UUID courseUuid,
            @PathVariable UUID moduleUuid,  // ✅ přidáno
            @RequestParam("file") MultipartFile file,
            @RequestParam("name") String name,
            @RequestParam(value = "description", required = false) String description
    ) {
        Material saved = service.create(moduleUuid, file, name, description); // ✅ bylo: courseUuid
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(mapper.toResponse(saved));
    }

    @PutMapping(path = "/{materialUuid}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<MaterialResponseDTO> update(
            @PathVariable UUID courseUuid,
            @PathVariable UUID moduleUuid,  // ✅ přidáno
            @PathVariable UUID materialUuid,
            @RequestBody MaterialUpdateRequestDTO request
    ) {
        Material updated = service.update(moduleUuid, materialUuid, // ✅ bylo: courseUuid
                request.getName(), request.getDescription(), request.getUrl());
        return ResponseEntity.ok(mapper.toResponse(updated));
    }

    @PutMapping(path = "/{materialUuid}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MaterialResponseDTO> update(
            @PathVariable UUID courseUuid,
            @PathVariable UUID moduleUuid,  // ✅ přidáno
            @PathVariable UUID materialUuid,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "description", required = false) String description
    ) {
        Material updated = service.update(moduleUuid, materialUuid, file, name, description); // ✅ bylo: courseUuid
        return ResponseEntity.ok(mapper.toResponse(updated));
    }

    @DeleteMapping("/{materialUuid}")
    public ResponseEntity<Void> kill(
            @PathVariable UUID courseUuid,
            @PathVariable UUID moduleUuid,  // ✅ přidáno
            @PathVariable UUID materialUuid
    ) {
        service.kill(moduleUuid, materialUuid); // ✅ bylo: courseUuid
        return ResponseEntity.noContent().build();
    }
}
