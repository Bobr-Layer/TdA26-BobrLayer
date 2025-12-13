package cz.projektant_pata.tda26.dto.course.quiz.question;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record SubmitQuizResultDTO(
        UUID quizUuid,
        Double score,
        Double maxScore,
        List<Boolean> correctPerQuestion,
        LocalDateTime submittedAt
) {}
