package cz.projektant_pata.tda26.dto.course.quiz.question;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class SingleChoiceQuestionResponseDTO extends QuestionResponseDTO {
    private Integer correctIndex;
}
