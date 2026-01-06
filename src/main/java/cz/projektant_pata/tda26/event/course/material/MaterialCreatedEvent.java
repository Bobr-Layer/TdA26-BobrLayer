package cz.projektant_pata.tda26.event.course.material;

import java.util.UUID;

public record MaterialCreatedEvent(
        UUID courseUuid,
        String materialName,
        String type
        ) {}
