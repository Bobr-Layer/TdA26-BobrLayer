package cz.projektant_pata.tda26.dto.course.quiz;

import cz.projektant_pata.tda26.dto.course.quiz.question.QuestionRequestDTO;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class QuizRequestDTO {

    @NotBlank
    private String title;

    private Integer attemptsCount;

    @Valid
    private List<QuestionRequestDTO> questions;
}
