package cz.projektant_pata.tda26.dto.course.quiz.question;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class SingleChoiceQuestionRequestDTO extends QuestionRequestDTO {

    @NotNull(message = "Musí být vybrána správná odpověď")
    private Integer correctIndex;
}
