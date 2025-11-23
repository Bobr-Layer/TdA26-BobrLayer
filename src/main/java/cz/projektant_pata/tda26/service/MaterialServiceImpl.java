package cz.projektant_pata.tda26.service;

import cz.projektant_pata.tda26.model.Course;
import cz.projektant_pata.tda26.model.Material;
import cz.projektant_pata.tda26.model.FileMaterial;
import cz.projektant_pata.tda26.model.UrlMaterial;
import cz.projektant_pata.tda26.repository.MaterialRepository;
import cz.projektant_pata.tda26.repository.CourseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class MaterialServiceImpl implements IMaterialService {

    private final MaterialRepository materialRepository;
    private final CourseRepository courseRepository;

    public MaterialServiceImpl(MaterialRepository materialRepository,
                               CourseRepository courseRepository) {
        this.materialRepository = materialRepository;
        this.courseRepository = courseRepository;
    }

    @Override
    public List<Material> find(UUID courseUuid) {
        return materialRepository.findByCourseUuid(courseUuid);
    }

    @Override
    public Material find(UUID courseUuid, UUID materialUuid) {
        Material material = materialRepository.findById(materialUuid)
                .orElseThrow(() -> new RuntimeException("Materiál nebyl nalezen"));

        if (!material.getCourse().getUuid().equals(courseUuid)) {
            throw new RuntimeException("Materiál nepatří k danému kurzu");
        }

        return material;
    }

    @Override
    @Transactional
    public Material update(UUID courseUuid, UUID materialUuid, Material updatedMaterial) {
        Material existingMaterial = find(courseUuid, materialUuid);

        existingMaterial.setName(updatedMaterial.getName());
        existingMaterial.setDescription(updatedMaterial.getDescription());

        if (existingMaterial instanceof FileMaterial && updatedMaterial instanceof FileMaterial) {
            FileMaterial existingFile = (FileMaterial) existingMaterial;
            FileMaterial updatedFile = (FileMaterial) updatedMaterial;

            if (updatedFile.getFileUrl() != null) {
                existingFile.setFileUrl(updatedFile.getFileUrl());
            }
            if (updatedFile.getMimeType() != null) {
                existingFile.setMimeType(updatedFile.getMimeType());
            }
            if (updatedFile.getSizeBytes() != null) {
                existingFile.setSizeBytes(updatedFile.getSizeBytes());
            }
        } else if (existingMaterial instanceof UrlMaterial && updatedMaterial instanceof UrlMaterial) {
            UrlMaterial existingUrl = (UrlMaterial) existingMaterial;
            UrlMaterial updatedUrl = (UrlMaterial) updatedMaterial;

            if (updatedUrl.getUrl() != null) {
                existingUrl.setUrl(updatedUrl.getUrl());
            }
            if (updatedUrl.getFaviconUrl() != null) {
                existingUrl.setFaviconUrl(updatedUrl.getFaviconUrl());
            }
        }else{
//            throw new Exception("Bad boi");
//            return "kys";
        }

        return materialRepository.save(existingMaterial);
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
        materialRepository.delete(material);
        return material;
    }
}
