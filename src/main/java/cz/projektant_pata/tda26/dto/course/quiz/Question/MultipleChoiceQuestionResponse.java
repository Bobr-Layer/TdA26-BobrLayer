package cz.projektant_pata.tda26.dto.course.quiz.Question;

import lombok.Data;
import lombok.EqualsAndHashCode;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
public class MultipleChoiceQuestionResponse extends QuestionResponse {
    private List<Integer> correctIndices;
}
