package cz.projektant_pata.tda26.service;

import cz.projektant_pata.tda26.exception.FileStorageException;
import cz.projektant_pata.tda26.exception.FileValidationException;
import cz.projektant_pata.tda26.exception.ResourceNotFoundException;
import cz.projektant_pata.tda26.model.course.Course;
import cz.projektant_pata.tda26.model.course.material.FileMaterial;
import cz.projektant_pata.tda26.model.course.material.Material;
import cz.projektant_pata.tda26.model.course.material.UrlMaterial;
import cz.projektant_pata.tda26.repository.CourseRepository;
import cz.projektant_pata.tda26.repository.MaterialRepository;
import lombok.RequiredArgsConstructor;
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
    private final CourseRepository courseRepository;

    private static final String UPLOAD_DIR = "/app/uploads";

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
    // 30 MB
    private static final long MAX_FILE_SIZE = 30 * 1024 * 1024;

    @Override
    public List<Material> find(UUID courseUuid) {
        return materialRepository.findByCourseUuidOrderByCreatedAtDesc(courseUuid);
    }

    @Override
    public Material find(UUID courseUuid, UUID materialUuid) {
        Material material = materialRepository.findById(materialUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Materiál nebyl nalezen"));

        if (!material.getCourse().getUuid().equals(courseUuid)) {
            throw new RuntimeException("Materiál nepatří k danému kurzu");
        }

        return material;
    }

    @Override
    @Transactional
    public Material update(UUID courseUuid, UUID materialUuid, String name, String description, String url) {
        Material existingMaterial = this.find(courseUuid, materialUuid);

        if (name != null) existingMaterial.setName(name);
        if (description != null) existingMaterial.setDescription(description);

        if (existingMaterial instanceof UrlMaterial urlMaterial) {
            if (url != null) {
                urlMaterial.setUrl(url);
            }
        }
        else if (existingMaterial instanceof FileMaterial) {
            // Jen update metadat
        }

        return materialRepository.save(existingMaterial);
    }

    @Transactional
    @Override
    public Material updateFile(UUID courseUuid, UUID materialUuid, MultipartFile file, String name, String description) {
        Material existingMaterial = this.find(courseUuid, materialUuid);

        if (!(existingMaterial instanceof FileMaterial)) {
            throw new IllegalArgumentException("Tento endpoint slouží jen pro aktualizaci souborových materiálů.");
        }

        FileMaterial fileMaterial = (FileMaterial) existingMaterial;

        if (name != null && !name.isBlank()) {
            fileMaterial.setName(name);
        }
        if (description != null) {
            fileMaterial.setDescription(description);
        }

        if (file != null && !file.isEmpty()) {
            if (file.getSize() > MAX_FILE_SIZE) {
                throw new FileValidationException("Soubor je příliš velký (limit 30 MB).");
            }

            // OPRAVA: Získání čistého MIME typu (bez charsetu)
            String contentType = file.getContentType();
            if (contentType != null && contentType.contains(";")) {
                contentType = contentType.split(";")[0];
            }

            if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType)) {
                throw new FileValidationException("Nepodporovaný formát souboru: " + file.getContentType());
            }

            try {
                String oldFilename = fileMaterial.getFileUrl().replace("/uploads/", "");
                Path oldPath = Paths.get(UPLOAD_DIR).resolve(oldFilename);
                Files.deleteIfExists(oldPath);

                String originalFilename = file.getOriginalFilename();
                String extension = "";
                if (originalFilename != null && originalFilename.contains(".")) {
                    extension = originalFilename.substring(originalFilename.lastIndexOf("."));
                }

                String storedFileName = UUID.randomUUID().toString() + extension;
                Path targetLocation = Paths.get(UPLOAD_DIR).resolve(storedFileName);
                Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

                fileMaterial.setFileUrl("/uploads/" + storedFileName);
                fileMaterial.setMimeType(contentType); // Ukládáme ten čistý typ
                fileMaterial.setSizeBytes((int) file.getSize());

            } catch (IOException e) {
                throw new FileStorageException("Chyba při aktualizaci souboru", e);
            }
        }

        return materialRepository.save(fileMaterial);
    }


    @Override
    @Transactional
    public Material create(UUID courseUuid, MultipartFile file, String name, String description) {
        Course course = courseRepository.findById(courseUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Kurz nebyl nalezen"));

        if (file.isEmpty()) {
            throw new FileValidationException("Soubor je prázdný");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new FileValidationException("Soubor je příliš velký (limit 30 MB).");
        }

        // OPRAVA: Získání čistého MIME typu (bez charsetu)
        String contentType = file.getContentType();
        if (contentType != null && contentType.contains(";")) {
            contentType = contentType.split(";")[0];
        }

        if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType)) {
            throw new FileValidationException("Nepodporovaný formát souboru: " + file.getContentType());
        }

        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            String storedFileName = UUID.randomUUID().toString() + extension;

            Path targetLocation = uploadPath.resolve(storedFileName);

            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            FileMaterial material = new FileMaterial();
            material.setCourse(course);
            material.setName(name);
            material.setDescription(description);
            material.setFileUrl("/uploads/" + storedFileName);
            material.setMimeType(contentType); // Ukládáme ten čistý typ
            material.setSizeBytes((int) file.getSize());

            return materialRepository.save(material);

        } catch (IOException e) {
            throw new FileStorageException("Nepodařilo se uložit soubor " + file.getOriginalFilename(), e);
        }
    }

    @Override
    @Transactional
    public Material create(UUID courseUuid, Material material) {
        Course course = courseRepository.findById(courseUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Kurz nebyl nalezen"));

        material.setCourse(course);
        return materialRepository.save(material);
    }

    @Override
    @Transactional
    public Material kill(UUID courseUuid, UUID materialUuid) {
        Material material = find(courseUuid, materialUuid);

        if (material instanceof FileMaterial fileMaterial) {
            try {
                String relativePath = fileMaterial.getFileUrl();
                String filename = relativePath.replace("/uploads/", "");
                if (!filename.contains("..")) {
                    Path filePath = Paths.get(UPLOAD_DIR).resolve(filename);
                    Files.deleteIfExists(filePath);
                }
            } catch (IOException e) {
                System.err.println("Nepodařilo se smazat fyzický soubor: " + e.getMessage());
            }
        }

        materialRepository.delete(material);
        return material;
    }
}
