package cz.projektant_pata.tda26.mapper;

import cz.projektant_pata.tda26.dto.course.feed.FeedResponseDTO;
import cz.projektant_pata.tda26.dto.user.UserResponseDTO;
import cz.projektant_pata.tda26.model.course.feed.FeedItem;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor // 1. Lombok vygeneruje konstruktor pro final fieldy
public class FeedMapper {

    private final UserMapper userMapper; // 2. Injektujeme UserMapper (místo 'new')

    public FeedResponseDTO toDto(FeedItem entity) {
        if (entity == null) {
            return null;
        }

        // 3. Ošetření NULL autora (pro systémové zprávy)
        UserResponseDTO authorDto = null;
        if (entity.getAuthor() != null) {
            authorDto = userMapper.toResponse(entity.getAuthor());
        }

        return new FeedResponseDTO(
                entity.getUuid(),
                entity.getCourse().getUuid(),
                authorDto, // Zde bude null, pokud autor neexistuje
                entity.getType().name().toLowerCase(),
                entity.getMessage(),
                entity.isEdited(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}
