package cz.projektant_pata.tda26.mapper;

import cz.projektant_pata.tda26.dto.course.quiz.QuizRequest;
import cz.projektant_pata.tda26.dto.course.quiz.QuizResponse;
import cz.projektant_pata.tda26.model.course.quiz.Quiz;
import org.springframework.stereotype.Component;

@Component
public class QuizMapper {
    public QuizResponse toResponse(Quiz quiz) {
        QuizResponse response = new QuizResponse();
        response.setUuid(quiz.getUuid());
        response.setTitle(quiz.getTitle());

        return response;
    }

    public Quiz toEntity(QuizRequest request) {
        Quiz quiz = new Quiz();
        quiz.setTitle(request.getTitle());

        return quiz;
    }
}
