package cz.projektant_pata.tda26.dto.course.quiz.Question;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class SingleChoiceQuestionResponse extends QuestionResponse {
    private Integer correctIndex;
}
