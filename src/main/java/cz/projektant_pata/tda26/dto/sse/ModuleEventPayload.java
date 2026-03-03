package cz.projektant_pata.tda26.dto.sse;

import java.util.UUID;

public record ModuleEventPayload(UUID moduleUuid, String moduleName, int moduleIndex) {}
