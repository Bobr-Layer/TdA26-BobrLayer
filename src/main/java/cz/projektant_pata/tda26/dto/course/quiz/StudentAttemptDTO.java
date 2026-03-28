package cz.projektant_pata.tda26.dto.course.quiz;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class StudentAttemptDTO {
    private UUID attemptUuid;
    private UUID quizUuid;
    private String quizTitle;
    private UUID courseUuid;
    private String courseName;
    private UUID moduleUuid;
    private Double score;
    private Double maxScore;
    private List<Boolean> correctPerQuestion;
    private LocalDateTime submittedAt;
}
