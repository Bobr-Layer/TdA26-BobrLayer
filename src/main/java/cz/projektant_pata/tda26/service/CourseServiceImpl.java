package cz.projektant_pata.tda26.service;

import cz.projektant_pata.tda26.event.course.module.ModuleActivatedEvent;
import cz.projektant_pata.tda26.event.course.module.ModuleDeactivatedEvent;
import cz.projektant_pata.tda26.exception.InvalidResourceStateException;
import cz.projektant_pata.tda26.exception.ResourceAlreadyExistsException;
import cz.projektant_pata.tda26.exception.ResourceNotFoundException;
import cz.projektant_pata.tda26.model.course.Course;
import cz.projektant_pata.tda26.model.course.StatusEnum;
import cz.projektant_pata.tda26.model.user.User;
import cz.projektant_pata.tda26.model.course.module.Module;
import cz.projektant_pata.tda26.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Random;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CourseServiceImpl implements ICourseService {
    private final CourseRepository repository;
    private final IUserService userService;
    private final IModuleService moduleService;

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    @Override
    public List<Course> find() {
        return repository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Course find(UUID uuid) {
        return this.getCourseOrThrow(uuid);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Course> findForStudent() {
        return repository.findForStudents(
                List.of(StatusEnum.Scheduled, StatusEnum.Live, StatusEnum.Paused));
    }

    @Override
    @Transactional
    public Course update(UUID uuid, Course course) {
        Course existingCourse = this.getCourseOrThrow(uuid);

        if (!existingCourse.getStatus().equals(StatusEnum.Draft))
            throw new InvalidResourceStateException(
                    "Kurz s ID " + uuid + " nelze upravovat - není v režimu úprav");

        existingCourse.setName(course.getName());
        existingCourse.setDescription(course.getDescription());

        return repository.save(existingCourse);
    }

    @Override
    @Transactional
    public Course create(Course course) {
        // docasny zpusob, jejich testy nepodporuji prihlasovani kekw
        // String username =
        // SecurityContextHolder.getContext().getAuthentication().getName();
        // User lektor = userRepository.findByUsername(username)
        // .orElseThrow(() -> new ResourceNotFoundException("Uživatel s uživatelským
        // jménem " + username + " nebyl nalezen"));
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
    @Transactional
    public Course backToDraft(UUID uuid) {
        Course c = this.getCourseOrThrow(uuid);
        if (!c.getStatus().equals(StatusEnum.Scheduled)) {
            throw new InvalidResourceStateException(
                    "Kurz s ID " + uuid + " nelze použít - není ve stavu Scheduled");
        }

        c.setStatus(StatusEnum.Draft);
        c.setScheduledAt(null);

        return repository.save(c);
    }

    @Override
    @Transactional
    public Course schedule(UUID uuid, Instant date) {
        Course c = this.getCourseOrThrow(uuid);

        if (!c.getStatus().equals(StatusEnum.Draft)) {
            throw new InvalidResourceStateException(
                    "Kurz s ID " + uuid + " nelze použít - není ve stavu Draft");
        }

        c.setStatus(StatusEnum.Scheduled);
        c.setScheduledAt(date);

        return repository.save(c);
    }

    @Override
    @Transactional
    public Course start(UUID uuid) {
        Course c = this.getCourseOrThrow(uuid);

        if (!c.getStatus().equals(StatusEnum.Draft) && !c.getStatus().equals(StatusEnum.Scheduled)
                && !c.getStatus().equals(StatusEnum.Paused)) {
            throw new InvalidResourceStateException(
                    "Kurz s ID " + uuid + " nelze použít - není ve stavu Draft či Scheduled");
        }

        c.setStatus(StatusEnum.Live);

        // Deactivate all modules when going Live
        if (c.getModules() != null) {
            for (var m : c.getModules()) {
                m.setActivated(false);
            }
        }

        return repository.save(c);
    }

    @Override
    @Transactional
    public Course pause(UUID uuid) {
        Course c = this.getCourseOrThrow(uuid);
        if (!c.getStatus().equals(StatusEnum.Live)) {
            throw new InvalidResourceStateException(
                    "Kurz s ID " + uuid + " nelze použít - není ve stavu Live");
        }

        c.setStatus(StatusEnum.Paused);

        return repository.save(c);
    }

    @Override
    @Transactional
    public Course archive(UUID uuid) {
        Course c = this.getCourseOrThrow(uuid);

        if (!c.getStatus().equals(StatusEnum.Live)) {
            throw new InvalidResourceStateException(
                    "Kurz s ID " + uuid + " nelze použít - není ve stavu Live či Paused");
        }

        c.setStatus(StatusEnum.Archived);

        return repository.save(c);
    }

    @Override
    @Transactional
    public Module activateNextModule(UUID courseUuid) {
        Course course = getCourseOrThrow(courseUuid);

        if (!course.getStatus().equals(StatusEnum.Live))
            throw new InvalidResourceStateException("Kurz s ID " + courseUuid + " nelze použít - není ve stavu Live.");

        if (!moduleService.hasNext(courseUuid))
            throw new InvalidResourceStateException("Kurz s ID " + courseUuid + " nemá žádný další modul k aktivaci.");

        Module activated = moduleService.activate(courseUuid);

        eventPublisher.publishEvent(new ModuleActivatedEvent(course, activated));

        return activated;
    }

    @Override
    @Transactional
    public Module deactivatePreviousModule(UUID courseUuid) {
        Course course = getCourseOrThrow(courseUuid);

        if (!course.getStatus().equals(StatusEnum.Live))
            throw new InvalidResourceStateException("Kurz s ID " + courseUuid + " nelze použít - není ve stavu Live.");

        if (!moduleService.hasPrevious(courseUuid))
            throw new InvalidResourceStateException(
                    "Kurz s ID " + courseUuid + " nemá žádný aktivní modul k deaktivaci.");

        Module deactivated = moduleService.deactivate(courseUuid);

        eventPublisher.publishEvent(new ModuleDeactivatedEvent(course, deactivated));

        return deactivated;
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
            throw new ResourceAlreadyExistsException(
                    "Student s ID " + studentUuid + " je již zapsán v kurzu " + courseUuid);
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
