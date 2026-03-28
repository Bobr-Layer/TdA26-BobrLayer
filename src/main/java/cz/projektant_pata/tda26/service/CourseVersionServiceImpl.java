package cz.projektant_pata.tda26.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import cz.projektant_pata.tda26.exception.InvalidResourceStateException;
import cz.projektant_pata.tda26.exception.ResourceNotFoundException;
import cz.projektant_pata.tda26.model.course.Course;
import cz.projektant_pata.tda26.model.course.StatusEnum;
import cz.projektant_pata.tda26.model.course.material.FileMaterial;
import cz.projektant_pata.tda26.model.course.material.Material;
import cz.projektant_pata.tda26.model.course.material.UrlMaterial;
import cz.projektant_pata.tda26.model.course.module.Module;
import cz.projektant_pata.tda26.model.course.quiz.MultipleChoiceQuestion;
import cz.projektant_pata.tda26.model.course.quiz.Question;
import cz.projektant_pata.tda26.model.course.quiz.Quiz;
import cz.projektant_pata.tda26.model.course.quiz.SingleChoiceQuestion;
import cz.projektant_pata.tda26.model.course.version.CourseVersion;
import cz.projektant_pata.tda26.model.course.version.snapshot.*;
import cz.projektant_pata.tda26.repository.CourseRepository;
import cz.projektant_pata.tda26.repository.CourseVersionRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

import com.fasterxml.jackson.databind.JsonNode;

@Service
@RequiredArgsConstructor
public class CourseVersionServiceImpl implements ICourseVersionService {

    private static final int MAX_VERSIONS = 5;

    private final CourseRepository courseRepository;
    private final CourseVersionRepository versionRepository;
    private final ObjectMapper objectMapper;

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    @Transactional(readOnly = true)
    public List<CourseVersion> listVersions(UUID courseUuid) {
        Course course = getCourseOrThrow(courseUuid);
        if (course.getStatus() != StatusEnum.Draft && course.getStatus() != StatusEnum.Archived) {
            return List.of();
        }
        return versionRepository.findByCourseUuidOrderByIdDesc(courseUuid);
    }

    @Override
    @Transactional
    public CourseVersion createSnapshot(UUID courseUuid) {
        Course course = getCourseOrThrow(courseUuid);

        if (course.getStatus() != StatusEnum.Draft) {
            throw new InvalidResourceStateException("Verze lze ukládat pouze u kurzu ve stavu Draft");
        }

        CourseSnapshot snapshot = buildSnapshot(course);
        String json;
        try {
            json = objectMapper.writeValueAsString(snapshot);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Nepodařilo se serializovat stav kurzu", e);
        }

        // Reject if nothing changed since last version
        List<CourseVersion> existing = versionRepository.findByCourseUuidOrderByIdDesc(courseUuid);
        if (!existing.isEmpty()) {
            try {
                JsonNode currentTree = objectMapper.readTree(json);
                JsonNode lastTree = objectMapper.readTree(existing.get(0).getSnapshotJson());
                if (currentTree.equals(lastTree)) {
                    throw new InvalidResourceStateException("Kurz nebyl od poslední verze změněn");
                }
            } catch (JsonProcessingException e) {
                // If comparison fails, allow saving
            }
        }

        String shortId = UUID.randomUUID().toString().replace("-", "").substring(0, 7);

        CourseVersion version = new CourseVersion();
        version.setCourse(course);
        version.setShortId(shortId);
        version.setSnapshotJson(json);

        CourseVersion saved = versionRepository.save(version);

        trimVersions(courseUuid);

        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public CourseVersion getVersion(UUID courseUuid, String shortId) {
        return versionRepository.findByShortIdAndCourseUuid(shortId, courseUuid)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Verze kurzu s ID " + shortId + " nebyla nalezena"));
    }

    @Override
    public CourseSnapshot deserializeSnapshot(CourseVersion version) {
        try {
            return objectMapper.readValue(version.getSnapshotJson(), CourseSnapshot.class);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Nepodařilo se načíst verzi kurzu", e);
        }
    }

    @Override
    @Transactional
    public Course rollback(UUID courseUuid, String shortId) {
        Course course = getCourseOrThrow(courseUuid);

        if (!course.getStatus().equals(StatusEnum.Draft)) {
            throw new InvalidResourceStateException(
                    "Rollback je možný pouze v Draft stavu");
        }

        CourseVersion version = versionRepository.findByShortIdAndCourseUuid(shortId, courseUuid)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Verze kurzu s ID " + shortId + " nebyla nalezena"));

        CourseSnapshot snapshot = deserializeSnapshot(version);

        // Delete all existing modules (cascade removes materials + quizzes)
        course.getModules().clear();
        entityManager.flush();

        // Rebuild from snapshot with original UUIDs
        course.setName(snapshot.getName());
        course.setDescription(snapshot.getDescription());

        if (snapshot.getModules() != null) {
            List<ModuleSnapshot> sorted = snapshot.getModules().stream()
                    .sorted(Comparator.comparingInt(ModuleSnapshot::getIndex))
                    .toList();

            for (ModuleSnapshot ms : sorted) {
                Module module = new Module();
                module.setIndex(ms.getIndex());
                module.setActivated(ms.isActivated());
                module.setName(ms.getName());
                module.setDescription(ms.getDescription());
                module.setCourse(course);

                if (ms.getMaterials() != null) {
                    for (MaterialSnapshot mat : ms.getMaterials()) {
                        Material material = buildMaterial(mat);
                        material.setModule(module);
                        module.getMaterials().add(material);
                    }
                }

                if (ms.getQuizzes() != null) {
                    for (QuizSnapshot qs : ms.getQuizzes()) {
                        Quiz quiz = new Quiz();
                        quiz.setTitle(qs.getTitle());
                        quiz.setModule(module);

                        if (qs.getQuestions() != null) {
                            for (QuestionSnapshot qsn : qs.getQuestions()) {
                                quiz.addQuestion(buildQuestion(qsn));
                            }
                        }

                        module.getQuizzes().add(quiz);
                    }
                }

                course.getModules().add(module);
            }
        }

        return courseRepository.save(course);
    }

    private CourseSnapshot buildSnapshot(Course course) {
        CourseSnapshot snapshot = new CourseSnapshot();
        snapshot.setName(course.getName());
        snapshot.setDescription(course.getDescription());

        List<ModuleSnapshot> moduleSnapshots = new ArrayList<>();
        if (course.getModules() != null) {
            for (Module module : course.getModules()) {
                ModuleSnapshot ms = new ModuleSnapshot();
                ms.setUuid(module.getUuid());
                ms.setIndex(module.getIndex());
                ms.setActivated(module.isActivated());
                ms.setName(module.getName());
                ms.setDescription(module.getDescription());

                List<MaterialSnapshot> materials = new ArrayList<>();
                if (module.getMaterials() != null) {
                    for (Material mat : module.getMaterials()) {
                        materials.add(snapshotMaterial(mat));
                    }
                }
                ms.setMaterials(materials);

                List<QuizSnapshot> quizzes = new ArrayList<>();
                if (module.getQuizzes() != null) {
                    for (Quiz quiz : module.getQuizzes()) {
                        QuizSnapshot qs = new QuizSnapshot();
                        qs.setUuid(quiz.getUuid());
                        qs.setTitle(quiz.getTitle());

                        List<QuestionSnapshot> questions = new ArrayList<>();
                        if (quiz.getQuestions() != null) {
                            for (var q : quiz.getQuestions()) {
                                questions.add(snapshotQuestion(q));
                            }
                        }
                        qs.setQuestions(questions);
                        quizzes.add(qs);
                    }
                }
                ms.setQuizzes(quizzes);
                moduleSnapshots.add(ms);
            }
        }

        snapshot.setModules(moduleSnapshots);
        return snapshot;
    }

    private MaterialSnapshot snapshotMaterial(Material mat) {
        if (mat instanceof FileMaterial f) {
            FileMaterialSnapshot s = new FileMaterialSnapshot();
            s.setUuid(f.getUuid());
            s.setName(f.getName());
            s.setDescription(f.getDescription());
            s.setCount(f.getCount());
            s.setCreatedAt(f.getCreatedAt());
            s.setFileUrl(f.getFileUrl());
            s.setMimeType(f.getMimeType());
            s.setSizeBytes(f.getSizeBytes());
            return s;
        } else if (mat instanceof UrlMaterial u) {
            UrlMaterialSnapshot s = new UrlMaterialSnapshot();
            s.setUuid(u.getUuid());
            s.setName(u.getName());
            s.setDescription(u.getDescription());
            s.setCount(u.getCount());
            s.setCreatedAt(u.getCreatedAt());
            s.setUrl(u.getUrl());
            s.setFaviconUrl(u.getFaviconUrl());
            return s;
        }
        throw new IllegalArgumentException("Unknown material type: " + mat.getClass());
    }

    private QuestionSnapshot snapshotQuestion(Question q) {
        if (q instanceof cz.projektant_pata.tda26.model.course.quiz.SingleChoiceQuestion sc) {
            SingleChoiceQuestionSnapshot s = new SingleChoiceQuestionSnapshot();
            s.setUuid(sc.getUuid());
            s.setQuestion(sc.getQuestion());
            s.setOptions(sc.getOptions());
            s.setCorrectIndex(sc.getCorrectIndex());
            return s;
        } else if (q instanceof cz.projektant_pata.tda26.model.course.quiz.MultipleChoiceQuestion mc) {
            MultipleChoiceQuestionSnapshot s = new MultipleChoiceQuestionSnapshot();
            s.setUuid(mc.getUuid());
            s.setQuestion(mc.getQuestion());
            s.setOptions(mc.getOptions());
            s.setCorrectIndices(mc.getCorrectIndices());
            return s;
        }
        throw new IllegalArgumentException("Unknown question type: " + q.getClass());
    }

    private Material buildMaterial(MaterialSnapshot mat) {
        if (mat instanceof FileMaterialSnapshot f) {
            FileMaterial m = new FileMaterial();
            m.setName(f.getName());
            m.setDescription(f.getDescription());
            m.setCount(f.getCount());
            m.setFileUrl(f.getFileUrl());
            m.setMimeType(f.getMimeType());
            m.setSizeBytes(f.getSizeBytes());
            return m;
        } else if (mat instanceof UrlMaterialSnapshot u) {
            UrlMaterial m = new UrlMaterial();
            m.setName(u.getName());
            m.setDescription(u.getDescription());
            m.setCount(u.getCount());
            m.setUrl(u.getUrl());
            m.setFaviconUrl(u.getFaviconUrl());
            return m;
        }
        throw new IllegalArgumentException("Unknown material snapshot type: " + mat.getClass());
    }

    private Question buildQuestion(QuestionSnapshot qsn) {
        if (qsn instanceof SingleChoiceQuestionSnapshot sc) {
            SingleChoiceQuestion q = new SingleChoiceQuestion();
            q.setQuestion(sc.getQuestion());
            q.setOptions(sc.getOptions());
            q.setCorrectIndex(sc.getCorrectIndex());
            return q;
        } else if (qsn instanceof MultipleChoiceQuestionSnapshot mc) {
            MultipleChoiceQuestion q = new MultipleChoiceQuestion();
            q.setQuestion(mc.getQuestion());
            q.setOptions(mc.getOptions());
            q.setCorrectIndices(mc.getCorrectIndices());
            return q;
        }
        throw new IllegalArgumentException("Unknown question snapshot type: " + qsn.getClass());
    }

    private void trimVersions(UUID courseUuid) {
        List<Long> allIds = versionRepository.findIdsByCourseUuidOrderByIdDesc(courseUuid);
        if (allIds.size() > MAX_VERSIONS) {
            List<Long> keepIds = allIds.subList(0, MAX_VERSIONS);
            versionRepository.deleteByIdNotInAndCourseUuid(keepIds, courseUuid);
        }
    }

    private Course getCourseOrThrow(UUID uuid) {
        return courseRepository.findById(uuid)
                .orElseThrow(() -> new ResourceNotFoundException("Kurz s ID " + uuid + " nebyl nalezen"));
    }
}
