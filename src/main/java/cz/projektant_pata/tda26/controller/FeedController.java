package cz.projektant_pata.tda26.controller;

import cz.projektant_pata.tda26.dto.course.feed.FeedRequestDTO;
import cz.projektant_pata.tda26.dto.course.feed.FeedResponseDTO;
import cz.projektant_pata.tda26.dto.sse.SseEventDTO;
import cz.projektant_pata.tda26.mapper.FeedMapper;
import cz.projektant_pata.tda26.model.course.feed.FeedItem;
import cz.projektant_pata.tda26.model.course.feed.FeedType;
import cz.projektant_pata.tda26.service.IFeedItemService;
import cz.projektant_pata.tda26.service.SseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/courses/{courseId}/feed")
@RequiredArgsConstructor
public class FeedController {

    private final IFeedItemService feedService;
    private final SseService sseService;
    private final FeedMapper feedMapper;

    @GetMapping
    public ResponseEntity<List<FeedResponseDTO>> find(@PathVariable UUID courseId) {
        List<FeedItem> items = feedService.find(courseId);

        List<FeedResponseDTO> dtos = items.stream()
                .map(feedMapper::toDto)
                .toList();

        return ResponseEntity.ok(dtos);
    }

    @PostMapping
    public ResponseEntity<FeedResponseDTO> create(
            @PathVariable UUID courseId,
            @RequestBody FeedRequestDTO request
    ) {
        FeedItem createdItem = feedService.create(courseId, FeedType.MANUAL, request.message());
        FeedResponseDTO dto = feedMapper.toDto(createdItem);

        sseService.sendToAll(courseId, new SseEventDTO<>("FEED_CREATED", dto));

        return ResponseEntity.ok(dto);
    }

    @PutMapping("/{itemId}")
    public ResponseEntity<FeedResponseDTO> update(
            @PathVariable UUID courseId,
            @PathVariable UUID itemId,
            @RequestBody FeedRequestDTO request
    ) {
        FeedItem updatedItem = feedService.update(itemId, request.message());
        FeedResponseDTO dto = feedMapper.toDto(updatedItem);

        sseService.sendToAll(courseId, new SseEventDTO<>("FEED_UPDATED", dto));

        return ResponseEntity.ok(dto);
    }

    @DeleteMapping("/{itemId}")
    public ResponseEntity<Void> kill(
            @PathVariable UUID courseId,
            @PathVariable UUID itemId
    ) {
        feedService.delete(itemId);

        sseService.sendToAll(courseId, new SseEventDTO<>("FEED_DELETED", Map.of("deletedId", itemId)));

        return ResponseEntity.noContent().build();
    }
}
