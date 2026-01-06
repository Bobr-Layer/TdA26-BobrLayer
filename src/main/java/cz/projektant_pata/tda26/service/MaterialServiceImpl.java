package cz.projektant_pata.tda26.service;

import cz.projektant_pata.tda26.event.course.material.MaterialCreatedEvent;
import cz.projektant_pata.tda26.event.course.material.MaterialKilledEvent;
import cz.projektant_pata.tda26.event.course.material.MaterialUpdatedEvent;
import cz.projektant_pata.tda26.exception.file.FileStorageException;
import cz.projektant_pata.tda26.exception.file.FileValidationException;
import cz.projektant_pata.tda26.exception.ResourceNotFoundException;
import cz.projektant_pata.tda26.model.course.Course;
import cz.projektant_pata.tda26.model.course.material.FileMaterial;
import cz.projektant_pata.tda26.model.course.material.Material;
import cz.projektant_pata.tda26.model.course.material.UrlMaterial;
import cz.projektant_pata.tda26.repository.MaterialRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MaterialServiceImpl implements IMaterialService {

    private final MaterialRepository materialRepository;
    private final ApplicationEventPublisher eventPublisher;

    private final ICourseService courseService;
    private static final Logger logger = LoggerFactory.getLogger(MaterialServiceImpl.class);

    @Value("${file.upload-dir:/app/uploads}")
    private String uploadDir;
    private Path uploadPath;

    private static final List<String> ALLOWED_MIME_TYPES = Arrays.asList(
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
            "text/plain",
            "image/png",
            "image/jpeg",
            "image/gif",
            "video/mp4",
            "audio/mpeg" // .mp3
    );
    private static final long MAX_FILE_SIZE = 30 * 1024 * 1024; // 30 MB

    @PostConstruct
    public void init() {
        this.uploadPath = Paths.get(uploadDir);
        try {
            Files.createDirectories(uploadPath);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory!", e);
        }
    }

    @Override
    public List<Material> find(UUID courseUuid) {
        return materialRepository.findByCourseUuidOrderByCreatedAtDesc(courseUuid);
    }

    @Override
    public Material find(UUID courseUuid, UUID materialUuid) {
        return getMaterialOrThrow(courseUuid, materialUuid);
    }

    @Override
    @Transactional
    public Material create(UUID courseUuid, Material material) {
        Course course = courseService.find(courseUuid);
        material.setCourse(course);
        eventPublisher.publishEvent(new MaterialCreatedEvent(courseUuid, material.getName(), material.getTypeLabel()));
        return materialRepository.save(material);
    }

    @Override
    @Transactional
    public Material update(UUID courseUuid, UUID materialUuid, String name, String description, String url) {
        Material existingMaterial = getMaterialOrThrow(courseUuid, materialUuid);
        String oldName = existingMaterial.getName(); // Uložíme původní jméno

        if (name != null) existingMaterial.setName(name);
        if (description != null) existingMaterial.setDescription(description);
        if (existingMaterial instanceof UrlMaterial urlMaterial && url != null) {
            urlMaterial.setUrl(url);
        }

        Material saved = materialRepository.save(existingMaterial);

        // EVENT: Updated (jen pokud se změnilo jméno, volitelně i jindy)
        if (!oldName.equals(saved.getName())) {
            eventPublisher.publishEvent(new MaterialUpdatedEvent(courseUuid, oldName, saved.getName(), saved.getTypeLabel()));
        }

        return saved;
    }

    @Override
    @Transactional
    public Material update(UUID courseUuid, UUID materialUuid, MultipartFile file, String name, String description) {
        Material existingMaterial = getMaterialOrThrow(courseUuid, materialUuid);
        if (!(existingMaterial instanceof FileMaterial fileMaterial)) {
            throw new IllegalArgumentException("Invalid material type");
        }

        String oldName = existingMaterial.getName();

        if (name != null && !name.isBlank()) fileMaterial.setName(name);
        if (description != null) fileMaterial.setDescription(description);

        if (file != null && !file.isEmpty()) {
            deletePhysicalFile(fileMaterial.getFileUrl());
            String newStoredFileName = storeFile(file);
            fileMaterial.setFileUrl("/uploads/" + newStoredFileName);
            fileMaterial.setMimeType(getCleanContentType(file.getContentType()));
            fileMaterial.setSizeBytes((int) file.getSize());
        }

        Material saved = materialRepository.save(fileMaterial);

        eventPublisher.publishEvent(new MaterialUpdatedEvent(courseUuid, oldName, saved.getName(), saved.getTypeLabel()));


        return saved;
    }

    @Override
    @Transactional
    public Material create(UUID courseUuid, MultipartFile file, String name, String description) {
        Course course = courseService.find(courseUuid);

        String storedFileName = storeFile(file);

        FileMaterial material = new FileMaterial();
        material.setCourse(course);
        material.setName(name);
        material.setDescription(description);
        material.setFileUrl("/uploads/" + storedFileName);
        material.setMimeType(getCleanContentType(file.getContentType()));
        material.setSizeBytes((int) file.getSize());
        eventPublisher.publishEvent(new MaterialCreatedEvent(courseUuid, material.getName(), material.getTypeLabel()));

        return materialRepository.save(material);
    }


    @Override
    @Transactional
    public Material kill(UUID courseUuid, UUID materialUuid) {
        Material material = getMaterialOrThrow(courseUuid, materialUuid);
        String materialName = material.getName();
        String type = material.getTypeLabel();

        if (material instanceof FileMaterial fileMaterial) {
            deletePhysicalFile(fileMaterial.getFileUrl());
        }

        materialRepository.delete(material);

        // EVENT: Deleted
        eventPublisher.publishEvent(new MaterialKilledEvent(courseUuid, materialName, type));

        return material;
    }

    private Material getMaterialOrThrow(UUID courseUuid, UUID materialUuid) {
        Material material = materialRepository.findById(materialUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Materiál s ID " + materialUuid + " nebyl nalezen"));

        if (!material.getCourse().getUuid().equals(courseUuid))
            throw new IllegalArgumentException("Materiál nepatří k danému kurzu.");

        return material;
    }

    private String storeFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new FileValidationException("Soubor nesmí být prázdný.");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new FileValidationException("Soubor je příliš velký (limit 30 MB).");
        }

        String contentType = getCleanContentType(file.getContentType());
        if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType)) {
            throw new FileValidationException("Nepodporovaný formát souboru: " + file.getContentType());
        }

        try {
            String originalFilename = file.getOriginalFilename();
            String extension = (originalFilename != null && originalFilename.contains("."))
                    ? originalFilename.substring(originalFilename.lastIndexOf(".")) : "";

            String storedFileName = UUID.randomUUID() + extension;
            Path targetLocation = this.uploadPath.resolve(storedFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            return storedFileName;

        } catch (IOException e) {
            throw new FileStorageException("Nepodařilo se uložit soubor " + file.getOriginalFilename(), e);
        }
    }

    private void deletePhysicalFile(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) return;
        try {
            String filename = fileUrl.replace("/uploads/", "");
            if (!filename.contains("..")) {
                Path filePath = this.uploadPath.resolve(filename);
                Files.deleteIfExists(filePath);
            }
        } catch (IOException e) {
            logger.error("Nepodařilo se smazat fyzický soubor: {}", fileUrl, e);
        }
    }

    private String getCleanContentType(String fullContentType) {
        if (fullContentType != null && fullContentType.contains(";")) {
            return fullContentType.split(";")[0].trim();
        }
        return fullContentType;
    }
}
