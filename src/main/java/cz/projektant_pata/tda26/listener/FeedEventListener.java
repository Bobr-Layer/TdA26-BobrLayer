package cz.projektant_pata.tda26.listener;

import cz.projektant_pata.tda26.dto.course.feed.FeedResponseDTO;
import cz.projektant_pata.tda26.dto.sse.ModuleEventPayload;
import cz.projektant_pata.tda26.dto.sse.SseEventDTO;
import cz.projektant_pata.tda26.event.course.module.ModuleActivatedEvent;
import cz.projektant_pata.tda26.event.course.module.ModuleDeactivatedEvent;
import cz.projektant_pata.tda26.event.course.material.MaterialAccessedEvent;
import cz.projektant_pata.tda26.event.course.quiz.QuizSubmittedEvent;
import cz.projektant_pata.tda26.mapper.FeedMapper;
import cz.projektant_pata.tda26.model.course.feed.FeedItem;
import cz.projektant_pata.tda26.model.course.feed.FeedType;
import cz.projektant_pata.tda26.service.IFeedItemService;
import cz.projektant_pata.tda26.service.SseService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.Map;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class FeedEventListener {
        private final IFeedItemService feedService;
        private final SseService sseService;
        private final FeedMapper feedMapper;

        // --- MODULES ---

        @Async
        @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
        public void handleModuleActivated(ModuleActivatedEvent event) {
                createAndBroadcast(
                                event.course().getUuid(),
                                "Byl aktivován modul č. " + event.module().getIndex() + ": "
                                                + event.module().getName());
                sseService.sendToAll(
                                event.course().getUuid(),
                                new SseEventDTO<>("MODULE_ACTIVATED", new ModuleEventPayload(
                                                event.module().getUuid(),
                                                event.module().getName(),
                                                event.module().getIndex())));
        }

        @Async
        @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
        public void handleModuleDeactivated(ModuleDeactivatedEvent event) {
                createAndBroadcast(
                                event.course().getUuid(),
                                "Modul č. " + event.module().getIndex() + " '" + event.module().getName()
                                                + "' byl deaktivován.");
                sseService.sendToAll(
                                event.course().getUuid(),
                                new SseEventDTO<>("MODULE_DEACTIVATED", new ModuleEventPayload(
                                                event.module().getUuid(),
                                                event.module().getName(),
                                                event.module().getIndex())));
        }

        // --- MATERIALS ---

        @Async
        @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
        public void handleMaterialAccessed(MaterialAccessedEvent event) {
                sseService.sendToAuthenticated(
                                event.course().getUuid(),
                                new SseEventDTO<>("MATERIAL_ACCESSED", Map.of(
                                                "materialUuid", event.material().getUuid(),
                                                "materialName", event.material().getName(),
                                                "newCount", event.material().getCount())));
        }

        // --- QUIZZES ---

        @Async
        @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
        public void handleQuizSubmitted(QuizSubmittedEvent event) {
                sseService.sendToAll(
                                event.course().getUuid(),
                                new SseEventDTO<>("QUIZ_SUBMITTED", Map.of(
                                                "quizUuid", event.quiz().getUuid(),
                                                "quizTitle", event.quiz().getTitle(),
                                                "score", event.score(),
                                                "maxScore", event.maxScore(),
                                                "totalAttempts", event.quiz().getAttemptsCount(),
                                                "correctPerQuestion", event.correctPerQuestion())));
        }

        // --- HELPER ---

        private void createAndBroadcast(UUID courseId, String message) {
                try {
                        FeedItem item = feedService.create(courseId, FeedType.SYSTEM, message);
                        FeedResponseDTO dto = feedMapper.toDto(item);
                        sseService.sendToAll(courseId, new SseEventDTO<>("FEED_CREATED", dto));
                } catch (Exception e) {
                        System.err.println("Chyba při vytváření feed itemu v listeneru: " + e.getMessage());
                        e.printStackTrace();
                }
        }
}
