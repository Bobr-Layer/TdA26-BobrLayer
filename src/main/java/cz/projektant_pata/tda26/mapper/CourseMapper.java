package cz.projektant_pata.tda26.mapper;

import cz.projektant_pata.tda26.dto.course.CourseRequestDTO;
import cz.projektant_pata.tda26.dto.course.CourseResponseDTO;
import cz.projektant_pata.tda26.dto.course.feed.FeedResponseDTO;
import cz.projektant_pata.tda26.dto.course.module.ModuleResponseDTO;
import cz.projektant_pata.tda26.model.course.Course;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class CourseMapper {

    private final ModuleMapper moduleMapper;  // ✅ materialMapper + quizMapper odstraněny
    private final FeedMapper feedMapper;

    public Course toEntity(CourseRequestDTO dto) {
        Course course = new Course();
        course.setName(dto.getName());
        course.setDescription(dto.getDescription());
        return course;
    }

    public CourseResponseDTO toResponse(Course entity) {
        CourseResponseDTO response = new CourseResponseDTO();
        response.setUuid(entity.getUuid());
        response.setName(entity.getName());
        response.setDescription(entity.getDescription());
        response.setStatus(entity.getStatus());
        response.setScheduledAt(entity.getScheduledAt());
        response.setCreatedAt(entity.getCreatedAt());
        response.setUpdatedAt(entity.getUpdatedAt());

        if (entity.getLector() != null) {
            response.setLectorId(entity.getLector().getUuid());
            response.setLectorName(entity.getLector().getUsername());
        }

        response.setModules(entity.getModules() != null
                ? entity.getModules().stream()
                .map(moduleMapper::toResponse)
                .collect(Collectors.toList())
                : Collections.emptyList());

        response.setFeed(entity.getFeed() != null
                ? entity.getFeed().stream()
                .map(feedMapper::toDto)
                .collect(Collectors.toList())
                : Collections.emptyList());

        return response;
    }
}
