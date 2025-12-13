package cz.projektant_pata.tda26.dto.course.quiz.question;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
public class MultipleChoiceQuestionRequestDTO extends QuestionRequestDTO {

    @NotEmpty(message = "Musí být vybrána alespoň jedna správná odpověď")
    private List<Integer> correctIndices;
}
