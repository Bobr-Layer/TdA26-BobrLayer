package cz.projektant_pata.tda26.controller;

import cz.projektant_pata.tda26.dto.course.material.MaterialRequest;
import cz.projektant_pata.tda26.model.Material;
import cz.projektant_pata.tda26.service.IMaterialService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/courses/{course-uuid}/materials")
public class MaterialController {
    private final IMaterialService service;

    public MaterialController(IMaterialService service) {
        this.service = service;
    }

    @GetMapping
    public List<Material> find(@PathVariable UUID courseUuid){
        return service.find(courseUuid);
    }

    @GetMapping("/{material-uuid}")
    public Material find(@PathVariable UUID courseUuid, @PathVariable UUID materialUuid){
        return service.find(courseUuid, materialUuid);
    }

    @PutMapping("/{material-uuid}")
    public Material update(@PathVariable UUID courseUuid, @PathVariable UUID materialUuid, @RequestBody MaterialRequest request){
        return service.update(courseUuid, materialUuid, request);
    }

    @PostMapping
    public Material create(@PathVariable UUID courseUuid, @RequestBody MaterialRequest request){
        return null;
    }

    @DeleteMapping("/{material-uuid}")
    public Material kill(@PathVariable UUID courseUuid, @PathVariable UUID materialUuid){
        return service.kill(courseUuid, materialUuid);
    }
}
