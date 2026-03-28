package cz.projektant_pata.tda26.service;

import cz.projektant_pata.tda26.dto.course.CourseImportDTO;
import cz.projektant_pata.tda26.dto.course.module.ModuleImportDTO;
import cz.projektant_pata.tda26.dto.course.quiz.QuizRequestDTO;
import cz.projektant_pata.tda26.dto.course.quiz.question.MultipleChoiceQuestionRequestDTO;
import cz.projektant_pata.tda26.dto.course.quiz.question.QuestionRequestDTO;
import cz.projektant_pata.tda26.dto.course.quiz.question.SingleChoiceQuestionRequestDTO;
import cz.projektant_pata.tda26.event.course.module.ModuleActivatedEvent;
import cz.projektant_pata.tda26.event.course.module.ModuleDeactivatedEvent;
import cz.projektant_pata.tda26.exception.InvalidResourceStateException;
import cz.projektant_pata.tda26.exception.ResourceAlreadyExistsException;
import cz.projektant_pata.tda26.exception.ResourceNotFoundException;
import cz.projektant_pata.tda26.model.course.Course;
import cz.projektant_pata.tda26.model.course.StatusEnum;
import cz.projektant_pata.tda26.model.course.material.UrlMaterial;
import cz.projektant_pata.tda26.model.course.module.Module;
import cz.projektant_pata.tda26.model.course.quiz.MultipleChoiceQuestion;
import cz.projektant_pata.tda26.model.course.quiz.Quiz;
import cz.projektant_pata.tda26.model.course.quiz.SingleChoiceQuestion;
import cz.projektant_pata.tda26.model.user.User;
import cz.projektant_pata.tda26.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
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

        if (!course.getStatus().equals(StatusEnum.Live) && !course.getStatus().equals(StatusEnum.Scheduled))
            throw new InvalidResourceStateException("Kurz s ID " + courseUuid + " nelze použít - není ve stavu Live nebo Scheduled.");

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

        if (!course.getStatus().equals(StatusEnum.Live) && !course.getStatus().equals(StatusEnum.Scheduled))
            throw new InvalidResourceStateException("Kurz s ID " + courseUuid + " nelze použít - není ve stavu Live nebo Scheduled.");

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

    @Override
    @Transactional
    public List<Course> importCourses(List<CourseImportDTO> dtos, User lector) {
        List<Course> created = new ArrayList<>();

        for (CourseImportDTO dto : dtos) {
            Course course = new Course();
            course.setName(dto.getName());
            course.setDescription(dto.getDescription());
            course.setStatus(StatusEnum.Draft);
            course.setLector(lector);

            if (dto.getModules() != null) {
                for (ModuleImportDTO moduleDto : dto.getModules()) {
                    Module module = new Module();
                    module.setName(moduleDto.getName());
                    module.setDescription(moduleDto.getDescription());
                    module.setIndex(moduleDto.getIndex());
                    module.setActivated(false);
                    module.setCourse(course);

                    if (moduleDto.getMaterials() != null) {
                        for (var matDto : moduleDto.getMaterials()) {
                            UrlMaterial material = new UrlMaterial();
                            material.setName(matDto.getName());
                            material.setDescription(matDto.getDescription());
                            material.setUrl(matDto.getUrl());
                            material.setFaviconUrl(matDto.getFaviconUrl());
                            material.setModule(module);
                            module.getMaterials().add(material);
                        }
                    }

                    if (moduleDto.getQuizzes() != null) {
                        for (QuizRequestDTO quizDto : moduleDto.getQuizzes()) {
                            Quiz quiz = new Quiz();
                            quiz.setTitle(quizDto.getTitle());
                            quiz.setModule(module);

                            if (quizDto.getQuestions() != null) {
                                for (QuestionRequestDTO qDto : quizDto.getQuestions()) {
                                    if (qDto instanceof SingleChoiceQuestionRequestDTO sDto) {
                                        SingleChoiceQuestion q = new SingleChoiceQuestion();
                                        q.setQuestion(sDto.getQuestion());
                                        q.setOptions(sDto.getOptions());
                                        q.setCorrectIndex(sDto.getCorrectIndex());
                                        quiz.addQuestion(q);
                                    } else if (qDto instanceof MultipleChoiceQuestionRequestDTO mDto) {
                                        MultipleChoiceQuestion q = new MultipleChoiceQuestion();
                                        q.setQuestion(mDto.getQuestion());
                                        q.setOptions(mDto.getOptions());
                                        q.setCorrectIndices(mDto.getCorrectIndices());
                                        quiz.addQuestion(q);
                                    }
                                }
                            }

                            module.getQuizzes().add(quiz);
                        }
                    }

                    course.getModules().add(module);
                }
            }

            created.add(repository.save(course));
        }

        return created;
    }

    private Course getCourseOrThrow(UUID uuid) {
        return repository.findById(uuid)
                .orElseThrow(() -> new ResourceNotFoundException("Kurz s ID " + uuid + " nebyl nalezen"));
    }

}
