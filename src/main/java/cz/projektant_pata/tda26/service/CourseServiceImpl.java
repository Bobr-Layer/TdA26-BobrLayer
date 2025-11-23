package cz.projektant_pata.tda26.service;

import cz.projektant_pata.tda26.model.Course;
import cz.projektant_pata.tda26.repository.CourseRepository;
import org.springframework.transaction.annotation.Transactional;import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class CourseServiceImpl implements ICourseService{
    private final CourseRepository repository;

    public CourseServiceImpl(CourseRepository repository){
        this.repository = repository;
    }

    @Override
    public List<Course> find() {
        return repository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Course find(UUID uuid) {
        Course course = repository.findById(uuid).orElseThrow(() -> new RuntimeException("Kurz nebyl nalezen"));
        course.getMaterials().size();
        return course;
    }

    @Override
    @Transactional
    public Course update(UUID uuid, Course course) {
        Course existingCourse = repository.findById(uuid).orElseThrow(() -> new RuntimeException("Kurz nebyl nalezen"));

        existingCourse.setName(course.getName());
        existingCourse.setDescription(course.getDescription());

        return repository.save(existingCourse);
}

    @Override
    @Transactional
    public Course create(Course course) {
        return repository.save(course);
    }

    @Override
    @Transactional
    public Course kill(UUID uuid) {
        Course course = repository.findById(uuid).orElseThrow(() -> new RuntimeException("Kurz nebyl nalezen"));
        repository.delete(course);
        return course;
    }
}
