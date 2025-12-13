package cz.projektant_pata.tda26.mapper;

import cz.projektant_pata.tda26.dto.course.material.*;
import cz.projektant_pata.tda26.model.course.Course;
import cz.projektant_pata.tda26.model.course.material.FileMaterial;
import cz.projektant_pata.tda26.model.course.material.Material;
import cz.projektant_pata.tda26.model.course.material.UrlMaterial;
import org.springframework.stereotype.Component;

@Component
public class MaterialMapper {
    public MaterialResponseDTO toResponse(Material entity) {
        if (entity instanceof FileMaterial) {
            return toFileResponse((FileMaterial) entity);
        } else if (entity instanceof UrlMaterial) {
            return toUrlResponse((UrlMaterial) entity);
        }
        throw new IllegalArgumentException("Neznámý typ materiálu: " + entity.getClass());
    }

    private FileMaterialResponseDTO toFileResponse(FileMaterial entity) {
        FileMaterialResponseDTO dto = new FileMaterialResponseDTO();
        mapCommonFields(entity, dto);
        dto.setFileUrl(entity.getFileUrl());
        dto.setMimeType(entity.getMimeType());
        dto.setSizeBytes(entity.getSizeBytes());
        return dto;
    }

    private UrlMaterialResponseDTO toUrlResponse(UrlMaterial entity) {
        UrlMaterialResponseDTO dto = new UrlMaterialResponseDTO();
        mapCommonFields(entity, dto);
        dto.setUrl(entity.getUrl());
        dto.setFaviconUrl(entity.getFaviconUrl());
        return dto;
    }

    private void mapCommonFields(Material entity, MaterialResponseDTO dto) {
        dto.setUuid(entity.getUuid());
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
    }

    public Material toEntity(MaterialRequestDTO request) {
        if (request instanceof FileMaterialRequestDTO) {
            return toFileEntity((FileMaterialRequestDTO) request);
        } else if (request instanceof UrlMaterialRequestDTO) {
            return toUrlEntity((UrlMaterialRequestDTO) request);
        }
        throw new IllegalArgumentException("Neznámý typ requestu: " + request.getClass());
    }

    private FileMaterial toFileEntity(FileMaterialRequestDTO request) {
        FileMaterial entity = new FileMaterial();
        mapCommonEntityFields(request, entity);
        entity.setFileUrl(request.getFileUrl());
        entity.setMimeType(request.getMimeType());
        entity.setSizeBytes(request.getSizeBytes());
        return entity;
    }

    private UrlMaterial toUrlEntity(UrlMaterialRequestDTO request) {
        UrlMaterial entity = new UrlMaterial();
        mapCommonEntityFields(request, entity);
        entity.setUrl(request.getUrl());
        entity.setFaviconUrl(request.getFaviconUrl());
        return entity;
    }

    private void mapCommonEntityFields(MaterialRequestDTO request, Material entity) {
        entity.setName(request.getName());
        entity.setDescription(request.getDescription());

        if (request.getCourseId() != null) {
            Course c = new Course();
            c.setUuid(request.getCourseId());
            entity.setCourse(c);
        }
    }
}
