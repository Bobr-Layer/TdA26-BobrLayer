package cz.projektant_pata.tda26.service;

import cz.projektant_pata.tda26.exception.file.FileStorageException;
import cz.projektant_pata.tda26.exception.file.FileValidationException;
import cz.projektant_pata.tda26.exception.ResourceNotFoundException;
import cz.projektant_pata.tda26.model.course.StatusEnum;
import cz.projektant_pata.tda26.model.course.module.Module; // ✅ explicitní import přebije java.lang.Module
import cz.projektant_pata.tda26.model.course.material.FileMaterial;
import cz.projektant_pata.tda26.model.course.material.Material;
import cz.projektant_pata.tda26.model.course.material.UrlMaterial;
import cz.projektant_pata.tda26.repository.ModuleRepository;
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
@Transactional(readOnly = true)
public class MaterialServiceImpl implements IMaterialService {

    private final MaterialRepository materialRepository;
    private final ModuleRepository moduleRepository;

    private static final Logger logger = LoggerFactory.getLogger(MaterialServiceImpl.class);

    @Value("${file.upload-dir:/app/uploads}")
    private String uploadDir;
    private Path uploadPath;

    private static final List<String> ALLOWED_MIME_TYPES = Arrays.asList(
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain",
            "image/png",
            "image/jpeg",
            "image/gif",
            "video/mp4",
            "audio/mpeg"
    );
    private static final long MAX_FILE_SIZE = 30 * 1024 * 1024;

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
    public List<Material> find(UUID moduleUuid) {
        return materialRepository.findByModuleUuidOrderByCreatedAtDesc(moduleUuid);
    }

    @Override
    public Material find(UUID moduleUuid, UUID materialUuid) {
        return getMaterialOrThrow(moduleUuid, materialUuid);
    }

    @Override
    @Transactional
    public Material create(UUID moduleUuid, Material material) {
        Module module = getModuleOrThrow(moduleUuid);
        if (module.getCourse().getStatus().equals(StatusEnum.Draft))
            throw new IllegalArgumentException("Kurz není v režimu úprav");

        material.setModule(module);
        return materialRepository.save(material);
    }


    @Override
    @Transactional
    public Material update(UUID moduleUuid, UUID materialUuid, String name, String description, String url) {
        Material existingMaterial = getMaterialOrThrow(moduleUuid, materialUuid);

        if (existingMaterial.getModule().getCourse().getStatus().equals(StatusEnum.Draft))
            throw new IllegalArgumentException("Kurz není v režimu úprav");

        String oldName = existingMaterial.getName();

        if (name != null) existingMaterial.setName(name);
        if (description != null) existingMaterial.setDescription(description);
        if (existingMaterial instanceof UrlMaterial urlMaterial && url != null) {
            urlMaterial.setUrl(url);
        }

        return materialRepository.save(existingMaterial);
    }


    @Override
    @Transactional
    public Material update(UUID moduleUuid, UUID materialUuid, MultipartFile file, String name, String description) {
        Material existingMaterial = getMaterialOrThrow(moduleUuid, materialUuid);
        if (existingMaterial.getModule().getCourse().getStatus().equals(StatusEnum.Draft))
            throw new IllegalArgumentException("Kurz není v režimu úprav");
        if (!(existingMaterial instanceof FileMaterial fileMaterial))
            throw new IllegalArgumentException("Invalid material type");


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

        return materialRepository.save(fileMaterial);
    }

    @Override
    @Transactional
    public Material create(UUID moduleUuid, MultipartFile file, String name, String description) {
        Module module = getModuleOrThrow(moduleUuid);
        String storedFileName = storeFile(file);
        if (module.getCourse().getStatus().equals(StatusEnum.Draft))
            throw new IllegalArgumentException("Kurz není v režimu úprav");
        FileMaterial material = new FileMaterial();
        material.setModule(module);
        material.setName(name);
        material.setDescription(description);
        material.setFileUrl("/uploads/" + storedFileName);
        material.setMimeType(getCleanContentType(file.getContentType()));
        material.setSizeBytes((int) file.getSize());

        return materialRepository.save(material);
    }

    @Override
    @Transactional
    public Material kill(UUID moduleUuid, UUID materialUuid) {
        Material material = getMaterialOrThrow(moduleUuid, materialUuid);

        if (material.getModule().getCourse().getStatus().equals(StatusEnum.Draft))
            throw new IllegalArgumentException("Kurz je není v režimu úprav.");

        String materialName = material.getName();
        String type = material.getTypeLabel();

        if (material instanceof FileMaterial fileMaterial) {
            deletePhysicalFile(fileMaterial.getFileUrl());
        }

        materialRepository.delete(material);
        return material;
    }


    // ── private helpers ───────────────────────────────────────────────────────

    private Module getModuleOrThrow(UUID moduleUuid) {
        return moduleRepository.findById(moduleUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Modul nebyl nalezen"));
    }

    private Material getMaterialOrThrow(UUID moduleUuid, UUID materialUuid) {
        Material material = materialRepository.findById(materialUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Materiál s ID " + materialUuid + " nebyl nalezen"));

        if (!material.getModule().getUuid().equals(moduleUuid))
            throw new IllegalArgumentException("Materiál nepatří k danému modulu.");

        return material;
    }

    private String storeFile(MultipartFile file) {
        if (file == null || file.isEmpty())
            throw new FileValidationException("Soubor nesmí být prázdný.");
        if (file.getSize() > MAX_FILE_SIZE)
            throw new FileValidationException("Soubor je příliš velký (limit 30 MB).");

        String contentType = getCleanContentType(file.getContentType());
        if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType))
            throw new FileValidationException("Nepodporovaný formát souboru: " + file.getContentType());

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
        if (fullContentType != null && fullContentType.contains(";"))
            return fullContentType.split(";")[0].trim();
        return fullContentType;
    }
}
