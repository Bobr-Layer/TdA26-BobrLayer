package cz.projektant_pata.tda26.dto.course.quiz;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
public class QuizAttemptResponseDTO {
    private UUID uuid;
    private String studentUsername;
    private Double score;
    private Double maxScore;
    private List<Boolean> correctPerQuestion;
    private Map<String, String> textAnswers;
    private LocalDateTime submittedAt;
}
