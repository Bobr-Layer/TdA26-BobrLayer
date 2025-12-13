package cz.projektant_pata.tda26.service;

import cz.projektant_pata.tda26.exception.ResourceAlreadyExistsException;
import cz.projektant_pata.tda26.exception.ResourceNotFoundException;
import cz.projektant_pata.tda26.model.course.Course;
import cz.projektant_pata.tda26.model.user.User;
import cz.projektant_pata.tda26.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Random;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CourseServiceImpl implements ICourseService {
    private final CourseRepository repository;
    private final IUserService userService;

    @Override
    public List<Course> find() {
        return repository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Course find(UUID uuid) {
        Course course = this.getCourseOrThrow(uuid);
        course.getMaterials().size();
        return course;
    }

    @Override
    @Transactional
    public Course update(UUID uuid, Course course) {
        Course existingCourse = this.getCourseOrThrow(uuid);

        existingCourse.setName(course.getName());
        existingCourse.setDescription(course.getDescription());

        return repository.save(existingCourse);
    }

    @Override
    @Transactional
    public Course create(Course course) {
//docasny zpusob, jejich testy nepodporuji prihlasovani kekw
//        String username = SecurityContextHolder.getContext().getAuthentication().getName();
//        User lektor = userRepository.findByUsername(username)
//                .orElseThrow(() -> new ResourceNotFoundException("Uživatel s uživatelským jménem " + username + " nebyl nalezen"));
        User lektor = new User();
        Random rand = new Random();

        int nahodneCislo = rand.nextInt(1000);

        lektor.setUsername("pepa" + nahodneCislo);
        lektor.setPassword("pepa");
        userService.create(lektor);

        course.setLector(lektor);

        return repository.save(course);
    }

    @Override
    @Transactional
    public Course kill(UUID uuid) {
        Course course = this.find(uuid);
        repository.delete(course);
        return course;
    }

    @Override
    @Transactional()
    public List<User> findStudents(UUID uuid) {
        Course course = this.find(uuid);
        return course.getStudents();
    }

    @Override
    @Transactional
    public Course addStudent(UUID courseUuid, UUID studentUuid) {
        Course course = this.find(courseUuid);
        User student = userService.find(studentUuid);

        if (course.getStudents().contains(student)) {
            throw new ResourceAlreadyExistsException("Student s ID " + studentUuid + " je již zapsán v kurzu " + courseUuid);
        }

        course.addStudent(student);
        return repository.save(course);
    }


    @Override
    @Transactional
    public Course removeStudent(UUID courseUuid, UUID studentUuid) {
        Course course = repository.findById(courseUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Kurz s ID " + courseUuid + " nebyl nalezen"));
        User student = userService.find(studentUuid);

        course.removeStudent(student);
        return repository.save(course);
    }

    private Course getCourseOrThrow(UUID uuid) {
        return repository.findById(uuid)
                .orElseThrow(() -> new ResourceNotFoundException("Kurz s ID " + uuid + " nebyl nalezen"));
    }

}
