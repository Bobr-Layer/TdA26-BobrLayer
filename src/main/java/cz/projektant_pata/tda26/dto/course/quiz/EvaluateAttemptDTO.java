package cz.projektant_pata.tda26.dto.course.quiz;

import lombok.Data;

import java.util.Map;

@Data
public class EvaluateAttemptDTO {
    private Map<String, OpenQuestionEvaluationDTO> evaluations;
}
