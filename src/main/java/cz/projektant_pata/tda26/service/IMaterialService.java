package cz.projektant_pata.tda26.service;

import cz.projektant_pata.tda26.model.course.material.Material;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface IMaterialService {
    List<Material> find(UUID moduleUuid);
    Material find(UUID moduleUuid, UUID materialUuid);

    // Změň nebo přidej:
    Material update(UUID moduleUuid, UUID materialUuid, String name, String description, String url);
    Material update(UUID moduleUuid, UUID materialUuid, MultipartFile file, String name, String description);

    Material create(UUID moduleUuid, MultipartFile file, String name, String description);
    Material create(UUID moduleUuid, Material material);

    Material kill(UUID moduleUuid, UUID materialUuid);
}
