package cz.projektant_pata.tda26.controller;

import cz.projektant_pata.tda26.dto.course.CourseRequestDTO;
import cz.projektant_pata.tda26.dto.course.CourseResponseDTO;
import cz.projektant_pata.tda26.dto.course.module.ModuleResponseDTO;
import cz.projektant_pata.tda26.dto.course.status.CourseScheduleDTO;
import cz.projektant_pata.tda26.mapper.CourseMapper;
import cz.projektant_pata.tda26.mapper.ModuleMapper;
import cz.projektant_pata.tda26.model.course.Course;
import cz.projektant_pata.tda26.model.course.module.Module;
import cz.projektant_pata.tda26.model.user.User;
import cz.projektant_pata.tda26.service.ICourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
    private final ModuleMapper moduleMapper;


    @GetMapping
    public ResponseEntity<List<CourseResponseDTO>> find(@AuthenticationPrincipal User user) {
        List<Course> courses;
        if(user != null)
            courses = service.find();
        else
            courses = service.findForStudent();

        courses.size();


        List<CourseResponseDTO> response = courses.stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }


    //    @GetMapping
//    public ResponseEntity<List<CourseResponseDTO>> find() {
//        List<Course> courses = service.find();
//
//        List<CourseResponseDTO> response = courses.stream()
//                .map(mapper::toResponse)
//                .collect(Collectors.toList());
//
//        return ResponseEntity.ok(response);
//    }

//    //Jen pro studenty
//    @GetMapping("/for-students")
//    public ResponseEntity<List<CourseResponseDTO>> findForStudent() {
//        List<Course> courses = service.findForStudent();
//
//        List<CourseResponseDTO> response = courses.stream()
//                .map(mapper::toResponse)
//                .collect(Collectors.toList());
//
//        return ResponseEntity.ok(response);
//    }



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

    @DeleteMapping("/{uuid}")
    public ResponseEntity<Void> kill(@PathVariable UUID uuid) {
        service.kill(uuid);
        return ResponseEntity.noContent().build();
    }

//zmeny statusu

    @PutMapping("/{uuid}/schedule")
    public ResponseEntity<CourseResponseDTO> schedule(@PathVariable UUID uuid, @RequestBody CourseScheduleDTO request){
        Course c = service.schedule(uuid, request.getScheduledAt());

        return ResponseEntity
                .ok()
                .body(mapper.toResponse(c));
    }

    @PutMapping("/{uuid}/back-to-draft")
    public ResponseEntity<CourseResponseDTO> backToDraft(@PathVariable UUID uuid){
        Course c = service.backToDraft(uuid);

        return ResponseEntity
                .ok()
                .body(mapper.toResponse(c));
    }

    @PutMapping("/{uuid}/start")
    public ResponseEntity<CourseResponseDTO> start(@PathVariable UUID uuid){
        Course c = service.start(uuid);

        return ResponseEntity
                .ok()
                .body(mapper.toResponse(c));
    }

    @PutMapping("/{uuid}/pause")
    public ResponseEntity<CourseResponseDTO> pause(@PathVariable UUID uuid){
        Course c = service.pause(uuid);

        return ResponseEntity
                .ok()
                .body(mapper.toResponse(c));
    }

    @PutMapping("/{uuid}/archive")
    public ResponseEntity<CourseResponseDTO> archive(@PathVariable UUID uuid){
        Course c = service.archive(uuid);

        return ResponseEntity
                .ok()
                .body(mapper.toResponse(c));
    }


    @PostMapping("/{courseUuid}/modules/activate")
    public ResponseEntity<ModuleResponseDTO> activateNext(
            @PathVariable UUID courseUuid
    ) {
        Module module = service.activateNextModule(courseUuid);
        return ResponseEntity.ok(moduleMapper.toResponse(module));
    }

    @PostMapping("/{courseUuid}/modules/deactivate")
    public ResponseEntity<ModuleResponseDTO> deactivatePrevious(
            @PathVariable UUID courseUuid
    ) {
        Module module = service.deactivatePreviousModule(courseUuid);
        return ResponseEntity.ok(moduleMapper.toResponse(module));
    }



    @GetMapping("/test")
    public List<Course> test(){
        return service.findForStudent();
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

