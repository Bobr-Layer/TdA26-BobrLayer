package cz.projektant_pata.tda26.dto.course.quiz;

import cz.projektant_pata.tda26.dto.course.quiz.Question.QuestionResponse;
import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
public class QuizResponse {
    private UUID uuid;
    private String title;
    private Integer attemptsCount;
    private List<QuestionResponse> questions;
}
