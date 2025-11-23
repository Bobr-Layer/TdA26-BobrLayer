package cz.projektant_pata.tda26.mapper;

import cz.projektant_pata.tda26.dto.course.CourseRequest;
import cz.projektant_pata.tda26.dto.course.CourseResponse;
import cz.projektant_pata.tda26.model.Course;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.stream.Collectors;

@Component
public class CourseMapper {
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

        return response;
    }
}
