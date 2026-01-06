package cz.projektant_pata.tda26.event.course.quiz;

import java.util.UUID;

public record QuizKilledEvent(
        UUID courseUuid,
        String quizTitle
) {
}
