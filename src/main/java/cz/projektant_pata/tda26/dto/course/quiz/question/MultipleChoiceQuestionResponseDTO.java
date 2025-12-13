package cz.projektant_pata.tda26.dto.course.quiz.question;

import lombok.Data;
import lombok.EqualsAndHashCode;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
public class MultipleChoiceQuestionResponseDTO extends QuestionResponseDTO {
    private List<Integer> correctIndices;
}
