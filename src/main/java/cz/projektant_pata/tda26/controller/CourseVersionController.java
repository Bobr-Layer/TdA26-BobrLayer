package cz.projektant_pata.tda26.controller;

import cz.projektant_pata.tda26.dto.course.CourseResponseDTO;
import cz.projektant_pata.tda26.dto.course.version.CourseVersionContentDTO;
import cz.projektant_pata.tda26.dto.course.version.CourseVersionMetaDTO;
import cz.projektant_pata.tda26.mapper.CourseMapper;
import cz.projektant_pata.tda26.mapper.CourseVersionMapper;
import cz.projektant_pata.tda26.model.course.Course;
import cz.projektant_pata.tda26.model.course.version.CourseVersion;
import cz.projektant_pata.tda26.model.course.version.snapshot.CourseSnapshot;
import cz.projektant_pata.tda26.service.ICourseVersionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/courses/{courseUuid}/versions")
@RequiredArgsConstructor
public class CourseVersionController {

    private final ICourseVersionService versionService;
    private final CourseVersionMapper mapper;
    private final CourseMapper courseMapper;

    @GetMapping
    public ResponseEntity<List<CourseVersionMetaDTO>> list(@PathVariable UUID courseUuid) {
        List<CourseVersionMetaDTO> versions = versionService.listVersions(courseUuid)
                .stream()
                .map(mapper::toMeta)
                .toList();
        return ResponseEntity.ok(versions);
    }

    @PostMapping
    public ResponseEntity<CourseVersionMetaDTO> create(@PathVariable UUID courseUuid) {
        CourseVersion version = versionService.createSnapshot(courseUuid);
        return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toMeta(version));
    }

    @GetMapping("/{shortId}")
    public ResponseEntity<CourseVersionContentDTO> get(
            @PathVariable UUID courseUuid,
            @PathVariable String shortId) {
        CourseVersion version = versionService.getVersion(courseUuid, shortId);
        CourseSnapshot snapshot = versionService.deserializeSnapshot(version);
        return ResponseEntity.ok(mapper.toContent(version, snapshot));
    }

    @PostMapping("/{shortId}/rollback")
    public ResponseEntity<CourseResponseDTO> rollback(
            @PathVariable UUID courseUuid,
            @PathVariable String shortId) {
        Course updated = versionService.rollback(courseUuid, shortId);
        return ResponseEntity.ok(courseMapper.toResponse(updated));
    }
}
