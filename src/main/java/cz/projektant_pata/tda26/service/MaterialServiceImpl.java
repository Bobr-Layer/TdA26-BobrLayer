package cz.projektant_pata.tda26.service;

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
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MaterialServiceImpl implements IMaterialService {

    private final MaterialRepository materialRepository;
    private final CourseRepository courseRepository;

    private static final String UPLOAD_DIR = "/app/uploads";

    @Override
    public List<Material> find(UUID courseUuid) {
        return materialRepository.findByCourseUuid(courseUuid);
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

    @Override
    @Transactional
    public Material create(UUID courseUuid, MultipartFile file, String name, String description) {
        Course course = courseRepository.findById(courseUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Kurz nebyl nalezen"));

        if (file.isEmpty()) {
            throw new ResourceNotFoundException("Soubor je prázdný");
        }

        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalFilename = file.getOriginalFilename();
            String storedFileName = UUID.randomUUID() + "_" + originalFilename;
            Path targetLocation = uploadPath.resolve(storedFileName);

            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            FileMaterial material = new FileMaterial();
            material.setCourse(course);
            material.setName(name);
            material.setDescription(description);
            material.setFileUrl("/uploads/" + storedFileName);
            material.setMimeType(file.getContentType());
            material.setSizeBytes((int) file.getSize());

            return materialRepository.save(material);

        } catch (IOException e) {
            throw new RuntimeException("Nepodařilo se uložit soubor " + file.getOriginalFilename(), e);
        }
    }

    @Override
    @Transactional
    public Material create(UUID courseUuid, Material material) {
        Course course = courseRepository.findById(courseUuid)
                .orElseThrow(() -> new RuntimeException("Kurz nebyl nalezen"));

        material.setCourse(course);

        if (material instanceof UrlMaterial) {
        }

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
                Path filePath = Paths.get(UPLOAD_DIR).resolve(filename);

                Files.deleteIfExists(filePath);
            } catch (IOException e) {
                System.err.println("Nepodařilo se smazat fyzický soubor: " + e.getMessage());
            }
        }

        materialRepository.delete(material);
        return material;
    }
}
