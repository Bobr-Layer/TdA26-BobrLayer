package cz.projektant_pata.tda26.listener;

import cz.projektant_pata.tda26.dto.course.feed.FeedResponseDTO;
import cz.projektant_pata.tda26.event.course.material.MaterialCreatedEvent;
import cz.projektant_pata.tda26.event.course.material.MaterialKilledEvent;
import cz.projektant_pata.tda26.event.course.material.MaterialUpdatedEvent;
import cz.projektant_pata.tda26.event.course.quiz.QuizCreatedEvent;
import cz.projektant_pata.tda26.event.course.quiz.QuizKilledEvent;
import cz.projektant_pata.tda26.event.course.quiz.QuizUpdatedEvent;
import cz.projektant_pata.tda26.mapper.FeedMapper;
import cz.projektant_pata.tda26.model.course.feed.FeedItem;
import cz.projektant_pata.tda26.service.IFeedItemService;
import cz.projektant_pata.tda26.service.SseService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
public class FeedEventListener {

    private final IFeedItemService feedService;
    private final SseService sseService;
    private final FeedMapper feedMapper;

    // --- MATERIALS ---

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleMaterialCreated(MaterialCreatedEvent event) {
        createAndBroadcast(
                event.courseUuid(),
                "Do kurzu byl přidán nový studijní materiál: " + event.materialName()
        );
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleMaterialUpdated(MaterialUpdatedEvent event) {
        if (event.oldName().equals(event.newName())) {
            createAndBroadcast(
                    event.courseUuid(),
                    "Materiál '" + event.oldName() + "' byl aktualizován."
            );
        } else {
            createAndBroadcast(
                    event.courseUuid(),
                    "Materiál '" + event.oldName() + "' byl aktualizován na '" + event.newName() + "'."
            );
        }
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleMaterialKilled(MaterialKilledEvent event) {
        createAndBroadcast(
                event.courseUuid(),
                "Materiál '" + event.name() + "' byl z kurzu odebrán."
        );
    }

    // --- QUIZZES ---

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleQuizCreated(QuizCreatedEvent event) {
        createAndBroadcast(
                event.courseUuid(),
                "Do kurzu byl přidán nový kvíz: " + event.quizTitle()
        );
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleQuizUpdated(QuizUpdatedEvent event) {
        if (event.oldTitle().equals(event.newTitle())) {
            createAndBroadcast(
                    event.courseUuid(),
                    "Kvíz '" + event.oldTitle() + "' byl aktualizován."
            );
        } else {
            createAndBroadcast(
                    event.courseUuid(),
                    "Kvíz '" + event.oldTitle() + "' byl přejmenován na '" + event.newTitle() + "'."
            );
        }
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleQuizKilled(QuizKilledEvent event) {
        createAndBroadcast(
                event.courseUuid(),
                "Kvíz '" + event.quizTitle() + "' byl z kurzu odebrán."
        );
    }

    // --- HELPER ---

    private void createAndBroadcast(java.util.UUID courseId, String message) {
        try {
            FeedItem item = feedService.create(courseId, message);
            FeedResponseDTO dto = feedMapper.toDto(item);
            sseService.update(courseId, dto);
        } catch (Exception e) {
            System.err.println("Chyba při vytváření feed itemu v listeneru: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
