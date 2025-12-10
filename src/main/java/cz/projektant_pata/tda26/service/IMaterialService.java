package cz.projektant_pata.tda26.service;

import cz.projektant_pata.tda26.model.course.material.Material;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface IMaterialService {
    List<Material> find(UUID courseUuid);
    Material find(UUID courseUuid, UUID materialUuid);

    Material update(UUID courseUuid, UUID materialUuid, Material material);
    Material updateFile(UUID courseUuid, UUID materialUuid, MultipartFile file, String name, String description);

    Material create(UUID courseUuid, MultipartFile file, String name, String description);
    Material create(UUID courseUuid, Material material);

    Material kill(UUID courseUuid, UUID materialUuid);
}
