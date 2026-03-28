package cz.projektant_pata.tda26.mapper;

import cz.projektant_pata.tda26.dto.course.material.FileMaterialResponseDTO;
import cz.projektant_pata.tda26.dto.course.material.MaterialResponseDTO;
import cz.projektant_pata.tda26.dto.course.material.UrlMaterialResponseDTO;
import cz.projektant_pata.tda26.dto.course.module.ModuleResponseDTO;
import cz.projektant_pata.tda26.dto.course.quiz.QuizResponseDTO;
import cz.projektant_pata.tda26.dto.course.quiz.question.MultipleChoiceQuestionResponseDTO;
import cz.projektant_pata.tda26.dto.course.quiz.question.QuestionResponseDTO;
import cz.projektant_pata.tda26.dto.course.quiz.question.SingleChoiceQuestionResponseDTO;
import cz.projektant_pata.tda26.dto.course.version.CourseVersionContentDTO;
import cz.projektant_pata.tda26.dto.course.version.CourseVersionMetaDTO;
import cz.projektant_pata.tda26.model.course.version.CourseVersion;
import cz.projektant_pata.tda26.model.course.version.snapshot.*;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

@Component
public class CourseVersionMapper {

    public CourseVersionMetaDTO toMeta(CourseVersion version) {
        return new CourseVersionMetaDTO(
                version.getShortId(),
                version.getCreatedAt()
        );
    }

    public CourseVersionContentDTO toContent(CourseVersion version, CourseSnapshot snapshot) {
        List<ModuleResponseDTO> modules = snapshot.getModules() == null
                ? Collections.emptyList()
                : snapshot.getModules().stream()
                        .sorted(java.util.Comparator.comparingInt(ModuleSnapshot::getIndex))
                        .map(this::mapModule)
                        .toList();

        return new CourseVersionContentDTO(
                version.getShortId(),
                version.getCreatedAt(),
                snapshot.getName(),
                snapshot.getDescription(),
                modules
        );
    }

    private ModuleResponseDTO mapModule(ModuleSnapshot m) {
        ModuleResponseDTO dto = new ModuleResponseDTO();
        dto.setUuid(m.getUuid());
        dto.setName(m.getName());
        dto.setDescription(m.getDescription());
        dto.setIndex(m.getIndex());
        dto.setActivated(m.isActivated());

        dto.setMaterials(m.getMaterials() == null
                ? Collections.emptyList()
                : m.getMaterials().stream().map(this::mapMaterial).toList());

        dto.setQuizzes(m.getQuizzes() == null
                ? Collections.emptyList()
                : m.getQuizzes().stream().map(this::mapQuiz).toList());

        return dto;
    }

    private MaterialResponseDTO mapMaterial(MaterialSnapshot s) {
        if (s instanceof FileMaterialSnapshot f) {
            FileMaterialResponseDTO dto = new FileMaterialResponseDTO();
            dto.setUuid(f.getUuid());
            dto.setName(f.getName());
            dto.setDescription(f.getDescription());
            dto.setCount(f.getCount());
            dto.setFileUrl(f.getFileUrl());
            dto.setMimeType(f.getMimeType());
            dto.setSizeBytes(f.getSizeBytes());
            return dto;
        } else if (s instanceof UrlMaterialSnapshot u) {
            UrlMaterialResponseDTO dto = new UrlMaterialResponseDTO();
            dto.setUuid(u.getUuid());
            dto.setName(u.getName());
            dto.setDescription(u.getDescription());
            dto.setCount(u.getCount());
            dto.setUrl(u.getUrl());
            dto.setFaviconUrl(u.getFaviconUrl());
            return dto;
        }
        throw new IllegalArgumentException("Unknown material snapshot type: " + s.getClass());
    }

    private QuizResponseDTO mapQuiz(QuizSnapshot q) {
        QuizResponseDTO dto = new QuizResponseDTO();
        dto.setUuid(q.getUuid());
        dto.setTitle(q.getTitle());
        dto.setAttemptsCount(0);

        dto.setQuestions(q.getQuestions() == null
                ? Collections.emptyList()
                : q.getQuestions().stream().map(this::mapQuestion).toList());

        return dto;
    }

    private QuestionResponseDTO mapQuestion(QuestionSnapshot q) {
        if (q instanceof SingleChoiceQuestionSnapshot sc) {
            SingleChoiceQuestionResponseDTO dto = new SingleChoiceQuestionResponseDTO();
            dto.setUuid(sc.getUuid());
            dto.setQuestion(sc.getQuestion());
            dto.setOptions(sc.getOptions());
            dto.setCorrectIndex(sc.getCorrectIndex());
            dto.setType("singleChoice");
            dto.setSuccessRate(0.0);
            return dto;
        } else if (q instanceof MultipleChoiceQuestionSnapshot mc) {
            MultipleChoiceQuestionResponseDTO dto = new MultipleChoiceQuestionResponseDTO();
            dto.setUuid(mc.getUuid());
            dto.setQuestion(mc.getQuestion());
            dto.setOptions(mc.getOptions());
            dto.setCorrectIndices(mc.getCorrectIndices());
            dto.setType("multipleChoice");
            dto.setSuccessRate(0.0);
            return dto;
        }
        throw new IllegalArgumentException("Unknown question snapshot type: " + q.getClass());
    }
}
