package cz.projektant_pata.tda26.controller;

import cz.projektant_pata.tda26.dto.ticket.TicketResponseDTO;
import cz.projektant_pata.tda26.exception.file.FileStorageException;
import cz.projektant_pata.tda26.exception.file.FileValidationException;
import cz.projektant_pata.tda26.model.Ticket;
import cz.projektant_pata.tda26.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
            "image/png", "image/jpeg", "image/gif", "image/webp"
    );
    private static final long MAX_SCREENSHOT_SIZE = 10L * 1024 * 1024; // 10 MB

    private final TicketRepository ticketRepository;

    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<TicketResponseDTO> createTicket(
            @RequestParam("title") String title,
            @RequestParam("branch") String branch,
            @RequestParam("url") String url,
            @RequestParam("description") String description,
            @RequestParam(value = "screenshot", required = false) MultipartFile screenshot
    ) {
        if (title == null || title.isBlank()) return ResponseEntity.badRequest().build();
        if (branch == null || branch.isBlank()) return ResponseEntity.badRequest().build();
        if (url == null || url.isBlank()) return ResponseEntity.badRequest().build();
        if (description == null || description.isBlank()) return ResponseEntity.badRequest().build();

        String screenshotPath = null;
        if (screenshot != null && !screenshot.isEmpty()) {
            screenshotPath = storeScreenshot(screenshot);
        }

        Ticket ticket = new Ticket();
        ticket.setTitle(title);
        ticket.setBranch(branch);
        ticket.setUrl(url);
        ticket.setDescription(description);
        ticket.setScreenshotPath(screenshotPath);

        Ticket saved = ticketRepository.save(ticket);
        return ResponseEntity.status(201).body(toDTO(saved));
    }

    private String storeScreenshot(MultipartFile file) {
        if (file.getSize() > MAX_SCREENSHOT_SIZE)
            throw new FileValidationException("Screenshot je příliš velký (limit 10 MB).");

        String contentType = file.getContentType();
        if (contentType != null && contentType.contains(";"))
            contentType = contentType.split(";")[0].trim();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType))
            throw new FileValidationException("Nepodporovaný formát screenshotu: " + file.getContentType());

        try {
            Path uploadPath = Paths.get(uploadDir);
            Files.createDirectories(uploadPath);

            String originalFilename = file.getOriginalFilename();
            String extension = (originalFilename != null && originalFilename.contains("."))
                    ? originalFilename.substring(originalFilename.lastIndexOf("."))
                    : ".png";

            String storedFileName = UUID.randomUUID() + extension;
            Path targetLocation = uploadPath.resolve(storedFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/" + storedFileName;
        } catch (IOException e) {
            throw new FileStorageException("Nepodařilo se uložit screenshot.", e);
        }
    }

    private TicketResponseDTO toDTO(Ticket t) {
        TicketResponseDTO dto = new TicketResponseDTO();
        dto.setUuid(t.getUuid());
        dto.setTitle(t.getTitle());
        dto.setBranch(t.getBranch());
        dto.setUrl(t.getUrl());
        dto.setDescription(t.getDescription());
        dto.setScreenshotPath(t.getScreenshotPath());
        dto.setCreatedAt(t.getCreatedAt());
        return dto;
    }
}
