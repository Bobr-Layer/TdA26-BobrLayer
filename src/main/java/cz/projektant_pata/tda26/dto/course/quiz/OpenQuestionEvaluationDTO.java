package cz.projektant_pata.tda26.dto.course.quiz;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OpenQuestionEvaluationDTO {
    private Boolean isCorrect;
    private String comment;
}
