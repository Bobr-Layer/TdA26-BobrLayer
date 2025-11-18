package cz.projektant_pata.tda26.mapper;

import cz.projektant_pata.tda26.dto.course.CourseRequest;
import cz.projektant_pata.tda26.dto.course.CourseResponse;
import cz.projektant_pata.tda26.dto.course.material.MaterialResponse;
import cz.projektant_pata.tda26.model.course.Course;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class CourseMapper {

    private final MaterialMapper materialMapper;

    public Course toEntity(CourseRequest dto) {
        Course course = new Course();
        course.setName(dto.getName());
        course.setDescription(dto.getDescription());
        return course;
    }

    public CourseResponse toResponse(Course entity) {
        CourseResponse response = new CourseResponse();
        response.setUuid(entity.getUuid());
        response.setName(entity.getName());
        response.setDescription(entity.getDescription());
        response.setLectorId(entity.getLector().getUuid());
        response.setLectorName(entity.getLector().getUsername());

        if (entity.getMaterials() != null) {
            List<MaterialResponse> materials = entity.getMaterials().stream()
                    .map(materialMapper::toResponse)
                    .collect(Collectors.toList());
            response.setMaterials(materials);
        } else {
            response.setMaterials(Collections.emptyList());
        }

        return response;
    }
}
