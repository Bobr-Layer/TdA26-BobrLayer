package cz.projektant_pata.tda26.dto.sse;

import java.util.UUID;

public record QuizSubmittedPayload(
        UUID quizUuid,
        String quizTitle,
        double score,
        double maxScore,
        int totalAttempts) {
}
