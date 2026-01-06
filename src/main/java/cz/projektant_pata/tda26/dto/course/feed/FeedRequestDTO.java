package cz.projektant_pata.tda26.dto.course.feed;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record FeedRequestDTO(
        @NotBlank(message = "Message cannot be empty")
        @Size(max = 1000, message = "Message is too long (max 1000 characters)")
        String message
) {}
