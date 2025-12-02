package cz.projektant_pata.tda26.dto.course.quiz;

import cz.projektant_pata.tda26.dto.course.quiz.Question.QuestionRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class QuizRequest {
    @NotBlank
    private String title;

    private Integer attemptsCount;

    @Valid
    private List<QuestionRequest> questions;
}
