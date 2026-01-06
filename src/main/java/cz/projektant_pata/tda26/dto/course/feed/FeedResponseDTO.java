package cz.projektant_pata.tda26.dto.course.feed;

import cz.projektant_pata.tda26.dto.user.UserResponseDTO;
import cz.projektant_pata.tda26.model.user.User;

import java.time.Instant;
import java.util.UUID;

public record FeedResponseDTO(
        UUID uuid,
        UUID courseId,
        UserResponseDTO author,
        String type,
        String message,
        boolean edited,
        Instant createdAt,
        Instant updatedAt
) implements IFeedEventPayload{
}
