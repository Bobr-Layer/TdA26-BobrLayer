package cz.projektant_pata.tda26.dto.sse;

import java.util.UUID;

public record MaterialAccessedPayload(
        UUID materialUuid,
        String materialName,
        String materialType,
        int accessCount) {
}
