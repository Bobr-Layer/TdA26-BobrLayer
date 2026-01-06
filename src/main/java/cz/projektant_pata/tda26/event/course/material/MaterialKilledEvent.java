package cz.projektant_pata.tda26.event.course.material;

import java.util.UUID;

public record MaterialKilledEvent(
        UUID courseUuid,
        String name,
        String type
        ) {
}
