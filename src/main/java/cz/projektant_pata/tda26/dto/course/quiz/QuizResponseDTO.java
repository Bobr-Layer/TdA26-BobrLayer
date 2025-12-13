package cz.projektant_pata.tda26.dto.course.quiz;

import cz.projektant_pata.tda26.dto.course.quiz.question.QuestionResponseDTO;
import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
public class QuizResponseDTO {
    private UUID uuid;
    private String title;
    private Integer attemptsCount;
    private List<QuestionResponseDTO> questions;
}
