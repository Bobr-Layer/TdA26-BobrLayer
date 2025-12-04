package cz.projektant_pata.tda26.service;

import cz.projektant_pata.tda26.exception.ResourceNotFoundException;
import cz.projektant_pata.tda26.model.course.Course;
import cz.projektant_pata.tda26.model.user.User;
import cz.projektant_pata.tda26.repository.CourseRepository;
import cz.projektant_pata.tda26.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CourseServiceImpl implements ICourseService{
    private final CourseRepository repository;
    private final UserRepository userRepository;

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
//        String username = SecurityContextHolder.getContext().getAuthentication().getName();
//        User lektor = userRepository.findByUsername(username)
//                .orElseThrow(() -> new ResourceNotFoundException("Uživatel s uživatelským jménem " + username + " nebyl nalezen"));
        User lektor = new User();
        lektor.setUsername("pepa");
        lektor.setPassword("pepa");
        userRepository.save(lektor);

        course.setLector(lektor);

        return repository.save(course);
    }

    @Override
    @Transactional
    public Course kill(UUID uuid) {
        Course course = repository.findById(uuid).orElseThrow(() -> new RuntimeException("Kurz nebyl nalezen"));
        repository.delete(course);
        return course;
    }

    @Override
    public List<User> findStudents(UUID uuid) {
        Course course = repository.findById(uuid).orElseThrow(() -> new RuntimeException("Kurz nebyl nalezen"));
        return course.getStudents();
    }


    @Transactional
    public Course addStudent(UUID courseUuid, UUID studentUuid) {
        Course course = repository.findById(courseUuid).orElseThrow(() -> new RuntimeException("Kurz nebyl nalezen"));
        User student = userRepository.findById(studentUuid)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        course.addStudent(student);
        return repository.save(course);
    }

    @Transactional
    public Course removeStudent(UUID courseUuid, UUID studentUuid) {
        Course course = repository.findById(courseUuid).orElseThrow(() -> new RuntimeException("Kurz nebyl nalezen"));
        User student = userRepository.findById(studentUuid)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        course.removeStudent(student);
        return repository.save(course);
    }
}
