package cz.projektant_pata.tda26.service;

import cz.projektant_pata.tda26.dto.sse.AuthenticatedSseEmitter;
import cz.projektant_pata.tda26.dto.sse.SseEventDTO;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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
    // Mapa uchovává náš nový wrapper
    private final Map<UUID, List<AuthenticatedSseEmitter>> emitters = new ConcurrentHashMap<>();

    public SseEmitter subscribe(UUID courseId) {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);

        // Zjištění stavu přihlášení BĚHEM HTTP REQUESTU (zde ThreadLocal funguje)
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAuthenticated = auth != null && auth.isAuthenticated() &&
                !"anonymousUser".equals(auth.getPrincipal());
        String username = isAuthenticated ? auth.getName() : null;

        // Obalíme emiter a uložíme ho
        AuthenticatedSseEmitter authEmitter = new AuthenticatedSseEmitter(emitter, isAuthenticated);
        emitters.computeIfAbsent(courseId, k -> new CopyOnWriteArrayList<>()).add(authEmitter);

        Runnable cleanup = () -> {
            List<AuthenticatedSseEmitter> courseEmitters = emitters.get(courseId);
            if (courseEmitters != null) {
                courseEmitters.remove(authEmitter);
            }
        };

        emitter.onCompletion(cleanup);
        emitter.onTimeout(cleanup);

        try {
            emitter.send(SseEmitter.event()
                    .name("CONNECTED")
                    .data(new SseEventDTO<>("CONNECTED", "connected")));
        } catch (IOException e) {
            emitter.completeWithError(e);
            cleanup.run();
        }

        return emitter;
    }

    // Metoda pro odeslání POUZE přihlášeným uživatelům
    public void sendToAuthenticated(UUID courseId, SseEventDTO<?> event) {
        List<AuthenticatedSseEmitter> courseEmitters = emitters.get(courseId);
        if (courseEmitters == null) return;

        courseEmitters.forEach(authEmitter -> {
            // Kontrola uloženého stavu - posíláme jen přihlášeným
            if (authEmitter.isAuthenticated()) {
                try {
                    authEmitter.emitter().send(SseEmitter.event()
                            .name(event.type())
                            .data(event));
                } catch (IOException e) {
                    courseEmitters.remove(authEmitter);
                    authEmitter.emitter().completeWithError(e);
                }
            }
        });
    }

    // Zachovaná původní metoda pro odeslání úplně všem (i anonymům)
    public void sendToAll(UUID courseId, SseEventDTO<?> event) {
        List<AuthenticatedSseEmitter> courseEmitters = emitters.get(courseId);
        if (courseEmitters == null) return;

        courseEmitters.forEach(authEmitter -> {
            try {
                authEmitter.emitter().send(SseEmitter.event()
                        .name(event.type())
                        .data(event));
            } catch (IOException e) {
                courseEmitters.remove(authEmitter);
                authEmitter.emitter().completeWithError(e);
            }
        });
    }
}
