package cz.projektant_pata.tda26.controller;

import cz.projektant_pata.tda26.dto.course.CourseRequest;
import cz.projektant_pata.tda26.dto.course.CourseResponse;
import cz.projektant_pata.tda26.mapper.CourseMapper;
import cz.projektant_pata.tda26.model.Course;
import cz.projektant_pata.tda26.service.ICourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {
    private final ICourseService service;
    private final CourseMapper mapper;

    @GetMapping
    public ResponseEntity<List<CourseResponse>> find() {
        List<Course> courses = service.find();

        List<CourseResponse> response = courses.stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{uuid}")
    public ResponseEntity<CourseResponse> find(@PathVariable UUID uuid) {
        Course course = service.find(uuid);
        return ResponseEntity.ok(mapper.toResponse(course));
    }

    @PutMapping("/{uuid}")
    public ResponseEntity<CourseResponse> update(@PathVariable UUID uuid, @RequestBody CourseRequest request) {
        Course courseUpdateData = mapper.toEntity(request);
        Course updatedCourse = service.update(uuid, courseUpdateData);

        return ResponseEntity.ok(mapper.toResponse(updatedCourse));
    }

    @PostMapping
    public ResponseEntity<CourseResponse> create(@RequestBody CourseRequest request) {
        Course newCourse = mapper.toEntity(request);
        Course savedCourse = service.create(newCourse);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(mapper.toResponse(savedCourse));
    }

    @DeleteMapping("/{uuid}")
    public ResponseEntity<Void> kill(@PathVariable UUID uuid) {
        service.kill(uuid);
        return ResponseEntity.noContent().build();
    }
}
