package cz.projektant_pata.tda26.dto.ticket;

import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class TicketResponseDTO {
    private UUID uuid;
    private String title;
    private String branch;
    private String url;
    private String description;
    private String screenshotPath;
    private Instant createdAt;
}
