package cz.projektant_pata.tda26.mapper;

import cz.projektant_pata.tda26.dto.course.quiz.QuizRequestDTO;
import cz.projektant_pata.tda26.dto.course.quiz.QuizResponseDTO;
import cz.projektant_pata.tda26.model.course.quiz.Quiz;
import org.springframework.stereotype.Component;

@Component
public class QuizMapper {
    public QuizResponseDTO toResponse(Quiz quiz) {
        QuizResponseDTO response = new QuizResponseDTO();
        response.setUuid(quiz.getUuid());
        response.setTitle(quiz.getTitle());

        return response;
    }

    public Quiz toEntity(QuizRequestDTO request) {
        Quiz quiz = new Quiz();
        quiz.setTitle(request.getTitle());

        return quiz;
    }
}
