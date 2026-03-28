package cz.projektant_pata.tda26.controller;

import cz.projektant_pata.tda26.dto.course.CourseImportDTO;
import cz.projektant_pata.tda26.dto.course.CourseRequestDTO;
import cz.projektant_pata.tda26.dto.course.CourseResponseDTO;
import cz.projektant_pata.tda26.dto.course.module.ModuleResponseDTO;
import cz.projektant_pata.tda26.dto.course.status.CourseScheduleDTO;
import cz.projektant_pata.tda26.mapper.CourseMapper;
import cz.projektant_pata.tda26.mapper.ModuleMapper;
import cz.projektant_pata.tda26.model.course.Course;
import cz.projektant_pata.tda26.model.course.module.Module;
import cz.projektant_pata.tda26.model.user.RoleEnum;
import cz.projektant_pata.tda26.model.user.User;
import cz.projektant_pata.tda26.service.ICourseService;
import cz.projektant_pata.tda26.service.SseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {
    private final ICourseService service;
    private final CourseMapper mapper;
    private final ModuleMapper moduleMapper;
    private final SseService sseService;

    @GetMapping
    public ResponseEntity<List<CourseResponseDTO>> find(@AuthenticationPrincipal User user) {
        List<Course> courses;
        if (user != null && (user.getRole() == RoleEnum.LEKTOR || user.getRole() == RoleEnum.ADMIN))
            courses = service.find();
        else
            courses = service.findForStudent();

        courses.size();

        List<CourseResponseDTO> response = courses.stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    // @GetMapping
    // public ResponseEntity<List<CourseResponseDTO>> find() {
    // List<Course> courses = service.find();
    //
    // List<CourseResponseDTO> response = courses.stream()
    // .map(mapper::toResponse)
    // .collect(Collectors.toList());
    //
    // return ResponseEntity.ok(response);
    // }

    // //Jen pro studenty
    // @GetMapping("/for-students")
    // public ResponseEntity<List<CourseResponseDTO>> findForStudent() {
    // List<Course> courses = service.findForStudent();
    //
    // List<CourseResponseDTO> response = courses.stream()
    // .map(mapper::toResponse)
    // .collect(Collectors.toList());
    //
    // return ResponseEntity.ok(response);
    // }

    @GetMapping("/{uuid}")
    public ResponseEntity<CourseResponseDTO> find(@PathVariable UUID uuid) {
        Course course = service.find(uuid);
        return ResponseEntity.ok(mapper.toResponse(course));
    }

    @PutMapping("/{uuid}")
    public ResponseEntity<CourseResponseDTO> update(@PathVariable UUID uuid, @RequestBody CourseRequestDTO request) {
        Course courseUpdateData = mapper.toEntity(request);
        Course updatedCourse = service.update(uuid, courseUpdateData);

        return ResponseEntity.ok(mapper.toResponse(updatedCourse));
    }

    @PostMapping
    public ResponseEntity<CourseResponseDTO> create(@RequestBody CourseRequestDTO request) {
        Course newCourse = mapper.toEntity(request);
        Course savedCourse = service.create(newCourse);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(mapper.toResponse(savedCourse));
    }

    @PostMapping("/import")
    public ResponseEntity<List<CourseResponseDTO>> importCourses(
            @RequestBody List<CourseImportDTO> courses,
            @AuthenticationPrincipal User user) {
        List<Course> imported = service.importCourses(courses, user);
        List<CourseResponseDTO> response = imported.stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/{uuid}")
    public ResponseEntity<Void> kill(@PathVariable UUID uuid) {
        service.kill(uuid);
        return ResponseEntity.noContent().build();
    }

    @GetMapping(value = "/{uuid}/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(@PathVariable UUID uuid) {
        return sseService.subscribe(uuid);
    }

    // zmeny statusu

    @PutMapping("/{uuid}/schedule")
    public ResponseEntity<CourseResponseDTO> schedule(@PathVariable UUID uuid, @RequestBody CourseScheduleDTO request) {
        Course c = service.schedule(uuid, request.getScheduledAt());

        return ResponseEntity
                .ok()
                .body(mapper.toResponse(c));
    }

    @PutMapping("/{uuid}/back-to-draft")
    public ResponseEntity<CourseResponseDTO> backToDraft(@PathVariable UUID uuid) {
        Course c = service.backToDraft(uuid);

        return ResponseEntity
                .ok()
                .body(mapper.toResponse(c));
    }

    @PutMapping("/{uuid}/start")
    public ResponseEntity<CourseResponseDTO> start(@PathVariable UUID uuid) {
        Course c = service.start(uuid);

        return ResponseEntity
                .ok()
                .body(mapper.toResponse(c));
    }

    @PutMapping("/{uuid}/pause")
    public ResponseEntity<CourseResponseDTO> pause(@PathVariable UUID uuid) {
        Course c = service.pause(uuid);

        return ResponseEntity
                .ok()
                .body(mapper.toResponse(c));
    }

    @PutMapping("/{uuid}/archive")
    public ResponseEntity<CourseResponseDTO> archive(@PathVariable UUID uuid) {
        Course c = service.archive(uuid);

        return ResponseEntity
                .ok()
                .body(mapper.toResponse(c));
    }

    @PutMapping("/{courseUuid}/modules/activate")
    public ResponseEntity<ModuleResponseDTO> activateNext(
            @PathVariable UUID courseUuid) {
        Module module = service.activateNextModule(courseUuid);
        return ResponseEntity.ok(moduleMapper.toResponse(module));
    }

    @PutMapping("/{courseUuid}/modules/deactivate")
    public ResponseEntity<ModuleResponseDTO> deactivatePrevious(
            @PathVariable UUID courseUuid) {
        Module module = service.deactivatePreviousModule(courseUuid);
        return ResponseEntity.ok(moduleMapper.toResponse(module));
    }

    @GetMapping("/test")
    public List<Course> test() {
        return service.findForStudent();
    }

    // ADMIN only — anonymita studentů
    @GetMapping("/{uuid}/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> findUsers(@PathVariable UUID uuid) {
        Course course = service.find(uuid);
        return ResponseEntity.ok(course.getStudents());
    }

    @PostMapping("/{uuid}/users")
    @PreAuthorize("hasRole('ADMIN') " +
            "or #userUuid.toString() == authentication.principal.uuid.toString()")
    public ResponseEntity<Course> addUser(
            @PathVariable UUID uuid,
            @RequestBody UUID userUuid) {
        Course updatedCourse = service.addStudent(uuid, userUuid);
        return ResponseEntity.ok(updatedCourse);
    }

    @DeleteMapping("/{uuid}/users/{userUuid}")
    @PreAuthorize("hasRole('ADMIN') " +
            "or @courseSecurity.isLector(#uuid, authentication.name) " +
            "or #userUuid.toString() == authentication.principal.uuid.toString()")
    public ResponseEntity<Course> removeUser(
            @PathVariable UUID uuid,
            @PathVariable UUID userUuid) {
        Course updatedCourse = service.removeStudent(uuid, userUuid);
        return ResponseEntity.ok(updatedCourse);
    }

    // Student self-enrollment
    @PostMapping("/{uuid}/enroll")
    public ResponseEntity<?> enrollSelf(@PathVariable UUID uuid) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User student = (User) authentication.getPrincipal();
        Course updatedCourse = service.addStudent(uuid, student.getUuid());
        return ResponseEntity.ok(Map.of("enrolled", true));
    }

    @DeleteMapping("/{uuid}/enroll")
    public ResponseEntity<?> unenrollSelf(@PathVariable UUID uuid) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User student = (User) authentication.getPrincipal();
        Course updatedCourse = service.removeStudent(uuid, student.getUuid());
        return ResponseEntity.ok(Map.of("enrolled", false));
    }

    @GetMapping("/{uuid}/enrolled")
    public ResponseEntity<?> isEnrolled(@PathVariable UUID uuid) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            return ResponseEntity.ok(Map.of("enrolled", false));
        }
        User student = (User) authentication.getPrincipal();
        User freshUser = service.findStudents(uuid).stream()
                .filter(s -> s.getUuid().equals(student.getUuid()))
                .findFirst()
                .orElse(null);
        return ResponseEntity.ok(Map.of("enrolled", freshUser != null));
    }

}
