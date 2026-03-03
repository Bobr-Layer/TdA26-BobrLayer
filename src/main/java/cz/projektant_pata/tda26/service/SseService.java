package cz.projektant_pata.tda26.service;

import cz.projektant_pata.tda26.dto.sse.SseEventDTO;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class SseService {
    private final Map<UUID, List<SseEmitter>> emitters = new ConcurrentHashMap<>();

    public SseEmitter subscribe(UUID courseId) {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        emitters.computeIfAbsent(courseId, k -> new CopyOnWriteArrayList<>()).add(emitter);

        Runnable cleanup = () -> {
            List<SseEmitter> courseEmitters = emitters.get(courseId);
            if (courseEmitters != null) {
                courseEmitters.remove(emitter);
            }
        };

        emitter.onCompletion(cleanup);
        emitter.onTimeout(cleanup);

        try {
            // Úvodní spojovací event (typ i název je "CONNECTED")
            emitter.send(SseEmitter.event()
                    .name("CONNECTED")
                    .data(new SseEventDTO<>("CONNECTED", "connected")));
        } catch (IOException e) {
            emitter.completeWithError(e);
            cleanup.run();
        }

        return emitter;
    }

    public void send(UUID courseId, SseEventDTO<?> event) {
        List<SseEmitter> courseEmitters = emitters.get(courseId);
        if (courseEmitters == null) return;

        courseEmitters.forEach(emitter -> {
            try {
                // Event získá název z DTO (např. MODULE_ACTIVATED) a payload je celé DTO
                emitter.send(SseEmitter.event()
                        .name(event.type())
                        .data(event));
            } catch (IOException e) {
                courseEmitters.remove(emitter);
                emitter.completeWithError(e);
            }
        });
    }
}
