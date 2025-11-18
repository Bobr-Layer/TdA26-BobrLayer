package cz.projektant_pata.tda26.mapper;

import cz.projektant_pata.tda26.dto.course.material.*;
import cz.projektant_pata.tda26.model.course.Course;
import cz.projektant_pata.tda26.model.course.material.FileMaterial;
import cz.projektant_pata.tda26.model.course.material.Material;
import cz.projektant_pata.tda26.model.course.material.UrlMaterial;
import org.springframework.stereotype.Component;

@Component
public class MaterialMapper {
    public MaterialResponse toResponse(Material entity) {
        if (entity instanceof FileMaterial) {
            return toFileResponse((FileMaterial) entity);
        } else if (entity instanceof UrlMaterial) {
            return toUrlResponse((UrlMaterial) entity);
        }
        throw new IllegalArgumentException("Neznámý typ materiálu: " + entity.getClass());
    }

    private FileMaterialResponse toFileResponse(FileMaterial entity) {
        FileMaterialResponse dto = new FileMaterialResponse();
        mapCommonFields(entity, dto);
        dto.setFileUrl(entity.getFileUrl());
        dto.setMimeType(entity.getMimeType());
        dto.setSizeBytes(entity.getSizeBytes());
        return dto;
    }

    private UrlMaterialResponse toUrlResponse(UrlMaterial entity) {
        UrlMaterialResponse dto = new UrlMaterialResponse();
        mapCommonFields(entity, dto);
        dto.setUrl(entity.getUrl());
        dto.setFaviconUrl(entity.getFaviconUrl());
        return dto;
    }

    private void mapCommonFields(Material entity, MaterialResponse dto) {
        dto.setUuid(entity.getUuid());
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
    }

    public Material toEntity(MaterialRequest request) {
        if (request instanceof FileMaterialRequest) {
            return toFileEntity((FileMaterialRequest) request);
        } else if (request instanceof UrlMaterialRequest) {
            return toUrlEntity((UrlMaterialRequest) request);
        }
        throw new IllegalArgumentException("Neznámý typ requestu: " + request.getClass());
    }

    private FileMaterial toFileEntity(FileMaterialRequest request) {
        FileMaterial entity = new FileMaterial();
        mapCommonEntityFields(request, entity);
        entity.setFileUrl(request.getFileUrl());
        entity.setMimeType(request.getMimeType());
        entity.setSizeBytes(request.getSizeBytes());
        return entity;
    }

    private UrlMaterial toUrlEntity(UrlMaterialRequest request) {
        UrlMaterial entity = new UrlMaterial();
        mapCommonEntityFields(request, entity);
        entity.setUrl(request.getUrl());
        entity.setFaviconUrl(request.getFaviconUrl());
        return entity;
    }

    private void mapCommonEntityFields(MaterialRequest request, Material entity) {
        entity.setName(request.getName());
        entity.setDescription(request.getDescription());

        if (request.getCourseId() != null) {
            Course c = new Course();
            c.setUuid(request.getCourseId());
            entity.setCourse(c);
        }
    }
}
