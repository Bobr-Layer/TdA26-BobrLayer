package cz.projektant_pata.tda26.mapper;

import cz.projektant_pata.tda26.dto.course.quiz.QuizRequestDTO;
import cz.projektant_pata.tda26.dto.course.quiz.QuizResponseDTO;
import cz.projektant_pata.tda26.dto.course.quiz.question.MultipleChoiceQuestionResponseDTO;
import cz.projektant_pata.tda26.dto.course.quiz.question.QuestionResponseDTO;
import cz.projektant_pata.tda26.dto.course.quiz.question.SingleChoiceQuestionResponseDTO;
import cz.projektant_pata.tda26.model.course.quiz.MultipleChoiceQuestion;
import cz.projektant_pata.tda26.model.course.quiz.Question;
import cz.projektant_pata.tda26.model.course.quiz.Quiz;
import cz.projektant_pata.tda26.model.course.quiz.SingleChoiceQuestion;
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
        response.setAttemptsCount(quiz.getAttemptsCount()); // Nezapomeň na statistiky

        // Mapování otázek
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
        // Pozor: Questions se zde obvykle neresolvují, to dělá QuizService
        // při vytváření entit z DTO (metoda mapDtoToEntity v service).
        return quiz;
    }

    // --- POMOCNÉ METODY PRO OTÁZKY (Polymorfismus) ---

    private QuestionResponseDTO mapQuestionToResponse(Question q) {
        if (q instanceof SingleChoiceQuestion sq) {
            SingleChoiceQuestionResponseDTO dto = new SingleChoiceQuestionResponseDTO();
            fillCommonFields(dto, sq);
            dto.setCorrectIndex(sq.getCorrectIndex());
            // dto.setType("singleChoice"); // Pokud to Jackson neudělá sám
            return dto;
        } else if (q instanceof MultipleChoiceQuestion mq) {
            MultipleChoiceQuestionResponseDTO dto = new MultipleChoiceQuestionResponseDTO();
            fillCommonFields(dto, mq);
            dto.setCorrectIndices(mq.getCorrectIndices());
            // dto.setType("multipleChoice");
            return dto;
        }
        throw new IllegalArgumentException("Unknown question type: " + q.getClass());
    }

    private void fillCommonFields(QuestionResponseDTO dto, Question q) {
        dto.setUuid(q.getUuid());
        dto.setQuestion(q.getQuestion());
        dto.setOptions(q.getOptions());
        dto.setSuccessRate(q.getSuccessRate());
    }
}
