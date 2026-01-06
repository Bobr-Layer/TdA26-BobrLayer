package cz.projektant_pata.tda26.event.course.quiz;

import java.util.UUID;

public record QuizCreatedEvent(
        UUID courseUuid,
        String quizTitle
) {
}
