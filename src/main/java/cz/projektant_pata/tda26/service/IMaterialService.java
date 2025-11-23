package cz.projektant_pata.tda26.service;

import cz.projektant_pata.tda26.model.Material;

import java.util.List;
import java.util.UUID;

public interface IMaterialService {
    List<Material> find(UUID courseUuid);
    Material find(UUID courseUuid, UUID materialUuid);
    Material create(UUID courseUuid, Material material);
    Material update(UUID courseUuid, UUID materialUuid, Material material);
    Material kill(UUID courseUuid, UUID materialUuid);
}
