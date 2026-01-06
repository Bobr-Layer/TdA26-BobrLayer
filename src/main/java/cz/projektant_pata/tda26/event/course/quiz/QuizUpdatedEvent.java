package cz.projektant_pata.tda26.event.course.quiz;

import java.util.UUID;

public record QuizUpdatedEvent(
        UUID courseUuid,
        String oldTitle,
        String newTitle
) {
}
