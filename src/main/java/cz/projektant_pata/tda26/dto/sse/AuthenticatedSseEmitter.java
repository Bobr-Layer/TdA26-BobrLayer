package cz.projektant_pata.tda26.dto.sse;

import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

public record AuthenticatedSseEmitter(
        SseEmitter emitter,
        boolean isAuthenticated
) {}
