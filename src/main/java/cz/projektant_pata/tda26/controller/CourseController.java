package cz.projektant_pata.tda26.controller;

import cz.projektant_pata.tda26.dto.course.CourseRequest;
import cz.projektant_pata.tda26.dto.course.CourseResponse;
import cz.projektant_pata.tda26.mapper.CourseMapper;
import cz.projektant_pata.tda26.model.course.Course;
import cz.projektant_pata.tda26.model.user.User;
import cz.projektant_pata.tda26.service.ICourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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

    @GetMapping("/{uuid}/users")
    public ResponseEntity<List<User>> findUsers(@PathVariable UUID uuid) {
        Course course = service.find(uuid);
        return ResponseEntity.ok(course.getStudents());
    }

    @PostMapping("/{uuid}/users")
    @PreAuthorize("hasRole('ADMIN') " +
            "or #userUuid.toString() == authentication.principal.uuid.toString()")
    public ResponseEntity<Course> addUser(
            @PathVariable UUID uuid,
            @RequestBody UUID userUuid
    ) {
        Course updatedCourse = service.addStudent(uuid, userUuid);
        return ResponseEntity.ok(updatedCourse);
    }

    @DeleteMapping("/{uuid}/users/{userUuid}")
    @PreAuthorize("hasRole('ADMIN') " +
            "or @courseSecurity.isLector(#uuid, authentication.name) " +
            "or #userUuid.toString() == authentication.principal.uuid.toString()")    public ResponseEntity<Course> removeUser(
            @PathVariable UUID uuid,
            @PathVariable UUID userUuid
    ) {
        Course updatedCourse = service.removeStudent(uuid, userUuid);
        return ResponseEntity.ok(updatedCourse);
    }
}

