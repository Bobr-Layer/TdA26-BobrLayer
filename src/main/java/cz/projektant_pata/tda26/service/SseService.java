package cz.projektant_pata.tda26.service;

import cz.projektant_pata.tda26.dto.course.feed.FeedResponseDTO;
import cz.projektant_pata.tda26.dto.course.feed.IFeedEventPayload;
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
            if (emitters.containsKey(courseId)) {
                emitters.get(courseId).remove(emitter);
            }
        };

        emitter.onCompletion(cleanup);
        emitter.onTimeout(cleanup);

        try {
            emitter.send(SseEmitter.event().comment("connected"));

        } catch (IOException e) {
            emitter.completeWithError(e);
            cleanup.run();
        }

        return emitter;
    }

    private void broadcast(UUID courseId, String eventName, IFeedEventPayload payload) {
        List<SseEmitter> courseEmitters = emitters.get(courseId);
        if (courseEmitters != null) {
            courseEmitters.forEach(emitter -> {
                try {
                    emitter.send(SseEmitter.event()
                            .name(eventName)
                            .data(payload));
                } catch (IOException e) {
                }
            });
        }
    }

    public void update(UUID courseId, IFeedEventPayload feedItemDto) {
        broadcast(courseId, "feed-message", feedItemDto);
    }

    public void kill(UUID courseId, UUID deletedItemId) {
        broadcast(courseId, "feed-message", new DeleteEventDto(deletedItemId));
    }

    public record DeleteEventDto(UUID deletedId, String type) implements IFeedEventPayload {
        public DeleteEventDto(UUID deletedId) {
            this(deletedId, "DELETE_EVENT");
        }
    }
}
