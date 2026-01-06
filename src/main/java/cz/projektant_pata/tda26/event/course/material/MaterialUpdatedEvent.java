package cz.projektant_pata.tda26.event.course.material;

import java.util.UUID;

public record MaterialUpdatedEvent(
        UUID courseUuid,
        String oldName,
        String newName,
        String type
        ) {
}
