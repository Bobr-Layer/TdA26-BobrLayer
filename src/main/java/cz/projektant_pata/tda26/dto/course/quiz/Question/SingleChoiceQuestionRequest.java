package cz.projektant_pata.tda26.dto.course.quiz.Question;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class SingleChoiceQuestionRequest extends QuestionRequest {

    @NotNull
    private Integer correctIndex;
}
