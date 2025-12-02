package cz.projektant_pata.tda26.dto.course.quiz.Question;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
public class MultipleChoiceQuestionRequest extends QuestionRequest {

    @NotEmpty
    private List<Integer> correctIndices;
}
