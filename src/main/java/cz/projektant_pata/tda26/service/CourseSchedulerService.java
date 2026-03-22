package cz.projektant_pata.tda26.service;

import cz.projektant_pata.tda26.model.course.Course;
import cz.projektant_pata.tda26.model.course.StatusEnum;
import cz.projektant_pata.tda26.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseSchedulerService {

    private final CourseRepository courseRepository;
    private final ICourseService courseService;

    @Scheduled(fixedRate = 60000)
    @Transactional
    public void activateScheduledCourses() {
        List<Course> due = courseRepository.findByStatusAndScheduledAtBefore(
                StatusEnum.Scheduled, Instant.now());

        for (Course course : due) {
            try {
                courseService.start(course.getUuid());
            } catch (Exception e) {
                // log a pokračuj dál
                System.err.println("Scheduler: nelze spustit kurz " + course.getUuid() + ": " + e.getMessage());
            }
        }
    }
}
