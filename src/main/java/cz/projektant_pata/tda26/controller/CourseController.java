package cz.projektant_pata.tda26.controller;

import cz.projektant_pata.tda26.model.Course;
import cz.projektant_pata.tda26.service.CourseServiceImpl;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/courses")
public class CourseController {
    private final CourseServiceImpl service;
    public CourseController(CourseServiceImpl service) {
        this.service = service;
    }

    @GetMapping
    public List<Course> find(){
        return service.find();
    }

    @GetMapping("/{uuid}")
    public Course find(@PathVariable UUID uuid){
        return service.find(uuid);
    }

    @PutMapping("/{uuid}")
    public Course update(@PathVariable UUID uuid, @RequestBody Course course){
        return service.update(uuid, course);
    }

    @PostMapping()
    public Course create(@RequestBody Course course){
        return service.create(course);
    }

    @DeleteMapping("/{uuid}")
    public Course kill(@PathVariable UUID uuid){
        return service.kill(uuid);
    }

}