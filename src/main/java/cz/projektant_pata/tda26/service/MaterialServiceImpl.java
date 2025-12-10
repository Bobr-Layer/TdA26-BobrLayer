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
        // Doporučuji přidat řazení (např. OrderByCreatedAtDesc v repository)
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
    public Material update(UUID courseUuid, UUID materialUuid, Material updatedMaterial) {
        Material existingMaterial = this.find(courseUuid, materialUuid);

        existingMaterial.setName(updatedMaterial.getName());
        existingMaterial.setDescription(updatedMaterial.getDescription());

        if (existingMaterial instanceof FileMaterial existingFile && updatedMaterial instanceof FileMaterial updatedFile) {
            if (updatedFile.getMimeType() != null) existingFile.setMimeType(updatedFile.getMimeType());
        }
        else if (existingMaterial instanceof UrlMaterial existingUrl && updatedMaterial instanceof UrlMaterial updatedUrl) {
            if (updatedUrl.getUrl() != null) existingUrl.setUrl(updatedUrl.getUrl());
            if (updatedUrl.getFaviconUrl() != null) existingUrl.setFaviconUrl(updatedUrl.getFaviconUrl());
        }
        else {
            throw new IllegalArgumentException("Nelze měnit typ materiálu (File <-> URL).");
        }

        return materialRepository.save(existingMaterial);
    }

    @Transactional
    @Override
    public Material updateFile(UUID courseUuid, UUID materialUuid, MultipartFile file, String name, String description) {
        Material existingMaterial = this.find(courseUuid, materialUuid);

        // Validace typu - musí to být FileMaterial
        if (!(existingMaterial instanceof FileMaterial)) {
            throw new IllegalArgumentException("Tento endpoint slouží jen pro aktualizaci souborových materiálů.");
        }

        FileMaterial fileMaterial = (FileMaterial) existingMaterial;

        // 1. Aktualizace metadat (pokud jsou poslána)
        if (name != null && !name.isBlank()) {
            fileMaterial.setName(name);
        }
        if (description != null) { // Description může být prázdná
            fileMaterial.setDescription(description);
        }

        // 2. Aktualizace souboru (pokud je poslán nový)
        if (file != null && !file.isEmpty()) {
            // Validace nového souboru
            if (file.getSize() > MAX_FILE_SIZE) {
                throw new FileValidationException("Soubor je příliš velký (limit 30 MB).");
            }
            // Zde by měla být i validace MIME type jako v create()
            String contentType = file.getContentType();
            if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType)) {
                throw new FileValidationException("Nepodporovaný formát souboru: " + contentType);
            }

            try {
                // Smazat STARÝ soubor z disku
                String oldFilename = fileMaterial.getFileUrl().replace("/uploads/", "");
                Path oldPath = Paths.get(UPLOAD_DIR).resolve(oldFilename);
                Files.deleteIfExists(oldPath);

                // Získání přípony z NOVÉHO souboru
                String originalFilename = file.getOriginalFilename();
                String extension = "";
                if (originalFilename != null && originalFilename.contains(".")) {
                    extension = originalFilename.substring(originalFilename.lastIndexOf("."));
                }

                // Uložit NOVÝ soubor s příponou
                String storedFileName = UUID.randomUUID().toString() + extension;
                Path targetLocation = Paths.get(UPLOAD_DIR).resolve(storedFileName);
                Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

                // Aktualizovat entitu
                fileMaterial.setFileUrl("/uploads/" + storedFileName);
                fileMaterial.setMimeType(contentType);
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
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType)) {
            throw new FileValidationException("Nepodporovaný formát souboru: " + contentType);
        }

        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename.substring(originalFilename.lastIndexOf("."));


            String storedFileName = UUID.randomUUID().toString() + extension;

            Path targetLocation = uploadPath.resolve(storedFileName);

            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            FileMaterial material = new FileMaterial();
            material.setCourse(course);
            material.setName(name);
            material.setDescription(description);
            material.setFileUrl("/uploads/" + storedFileName);
            material.setMimeType(contentType);
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
                .orElseThrow(() -> new RuntimeException("Kurz nebyl nalezen"));

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
                // Ošetření cesty
                String filename = relativePath.replace("/uploads/", "");
                // Pro jistotu mažeme jen pokud název neobsahuje ".." (path traversal)
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
