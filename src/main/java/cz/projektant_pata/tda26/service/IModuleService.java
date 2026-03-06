package cz.projektant_pata.tda26.service;

import cz.projektant_pata.tda26.dto.course.module.ModuleRequestDTO;
import cz.projektant_pata.tda26.model.course.module.Module;

import java.util.List;
import java.util.UUID;

public interface IModuleService {
    List<Module> find(UUID courseUuid);

    Module find(UUID courseUuid, UUID moduleUuid);

    Module update(UUID courseUuid, UUID moduleUuid, ModuleRequestDTO dto);

    Module create(UUID courseUuid, ModuleRequestDTO dto);

    Module kill(UUID courseUuid, UUID moduleUuid);

    boolean hasNext(UUID courseUuid);

    boolean hasPrevious(UUID courseUuid);

    Module activate(UUID courseUuid); // bez moduleUuid

    Module deactivate(UUID courseUuid);

    void reorder(UUID courseUuid, List<UUID> orderedModuleUuids);
}