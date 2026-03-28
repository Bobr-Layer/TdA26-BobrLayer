package cz.projektant_pata.tda26.dto.course.quiz.question;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class OpenQuestionResponseDTO extends QuestionResponseDTO {
    private String correctAnswer;
}
