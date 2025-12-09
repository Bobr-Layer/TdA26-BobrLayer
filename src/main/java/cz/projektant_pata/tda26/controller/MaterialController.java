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
@RequestMapping("/api/courses/{courseUuid}/materials")
@RequiredArgsConstructor
public class MaterialController {

    private final IMaterialService service;
    private final MaterialMapper mapper;

    @GetMapping
    public ResponseEntity<List<MaterialResponse>> find(@PathVariable UUID courseUuid) {
        List<MaterialResponse> response = service.find(courseUuid).stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{materialUuid}")
    public ResponseEntity<MaterialResponse> find(
            @PathVariable UUID courseUuid,
            @PathVariable UUID materialUuid
    ) {
        Material material = service.find(courseUuid, materialUuid);
        return ResponseEntity.ok(mapper.toResponse(material));
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<MaterialResponse> createLink(
            @PathVariable UUID courseUuid,
            @Valid @RequestBody MaterialRequest request
    ) {
        Material materialDraft = mapper.toEntity(request);
        Material savedMaterial = service.create(courseUuid, materialDraft);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(mapper.toResponse(savedMaterial));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MaterialResponse> createFile(
            @PathVariable UUID courseUuid,
            @RequestParam("file") MultipartFile file,
            @RequestParam("name") String name,
            @RequestParam(value = "description", required = false) String description
    ) {
        Material savedMaterial = service.create(courseUuid, file, name, description);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(mapper.toResponse(savedMaterial));
    }

    @PutMapping("/{materialUuid}")
    public ResponseEntity<MaterialResponse> update(
            @PathVariable UUID courseUuid,
            @PathVariable UUID materialUuid,
            @Valid @RequestBody MaterialRequest request
    ) {
        Material materialUpdates = mapper.toEntity(request);
        Material updatedMaterial = service.update(courseUuid, materialUuid, materialUpdates);

        return ResponseEntity.ok(mapper.toResponse(updatedMaterial));
    }

    @DeleteMapping("/{materialUuid}")
    public ResponseEntity<Void> kill(
            @PathVariable UUID courseUuid,
            @PathVariable UUID materialUuid
    ) {
        service.kill(courseUuid, materialUuid);
        return ResponseEntity.noContent().build();
    }
}
