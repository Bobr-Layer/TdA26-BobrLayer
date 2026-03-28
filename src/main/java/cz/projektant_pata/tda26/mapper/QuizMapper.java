package cz.projektant_pata.tda26.mapper;

import cz.projektant_pata.tda26.dto.course.quiz.QuizRequestDTO;
import cz.projektant_pata.tda26.dto.course.quiz.QuizResponseDTO;
import cz.projektant_pata.tda26.dto.course.quiz.question.*;
import cz.projektant_pata.tda26.model.course.quiz.*;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class QuizMapper {

    public QuizResponseDTO toResponse(Quiz quiz) {
        QuizResponseDTO response = new QuizResponseDTO();
        response.setUuid(quiz.getUuid());
        response.setTitle(quiz.getTitle());
        response.setAttemptsCount(quiz.getAttemptsCount());

        if (quiz.getQuestions() != null) {
            List<QuestionResponseDTO> questionDtos = quiz.getQuestions().stream()
                    .map(this::mapQuestionToResponse)
                    .collect(Collectors.toList());
            response.setQuestions(questionDtos);
        } else {
            response.setQuestions(Collections.emptyList());
        }

        return response;
    }

    public Quiz toEntity(QuizRequestDTO request) {
        Quiz quiz = new Quiz();
        quiz.setTitle(request.getTitle());
        return quiz;
    }

    private QuestionResponseDTO mapQuestionToResponse(Question q) {
        if (q instanceof SingleChoiceQuestion sq) {
            SingleChoiceQuestionResponseDTO dto = new SingleChoiceQuestionResponseDTO();
            fillCommonFields(dto, sq);
            dto.setCorrectIndex(sq.getCorrectIndex());
            dto.setType("singleChoice");
            return dto;
        } else if (q instanceof MultipleChoiceQuestion mq) {
            MultipleChoiceQuestionResponseDTO dto = new MultipleChoiceQuestionResponseDTO();
            fillCommonFields(dto, mq);
            dto.setCorrectIndices(mq.getCorrectIndices());
            dto.setType("multipleChoice");
            return dto;
        } else if (q instanceof OpenQuestion oq) {
            OpenQuestionResponseDTO dto = new OpenQuestionResponseDTO();
            fillCommonFields(dto, oq);
            dto.setCorrectAnswer(oq.getCorrectAnswer());
            dto.setType("openQuestion");
            return dto;
        }
        throw new IllegalArgumentException("Unknown question type: " + q.getClass());
    }

    private void fillCommonFields(QuestionResponseDTO dto, Question q) {
        dto.setUuid(q.getUuid());
        dto.setQuestion(q.getQuestion());
        dto.setOptions(q.getOptions() != null ? q.getOptions() : Collections.emptyList());
        dto.setSuccessRate(q.getSuccessRate());
    }
}
