package cz.projektant_pata.tda26.service;

import cz.projektant_pata.tda26.dto.course.module.ModuleRequestDTO;
import cz.projektant_pata.tda26.exception.ResourceNotFoundException;
import cz.projektant_pata.tda26.model.course.Course;
import cz.projektant_pata.tda26.model.course.StatusEnum;
import cz.projektant_pata.tda26.model.course.module.Module;
import cz.projektant_pata.tda26.repository.CourseRepository;
import cz.projektant_pata.tda26.repository.ModuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ModuleServiceImpl implements IModuleService {

    private final ModuleRepository moduleRepository;
    private final CourseRepository courseRepository;

    @Override
    public List<Module> find(UUID courseUuid) {
        return moduleRepository.findByCourseUuidOrderByIndexAsc(courseUuid);
    }

    @Override
    public Module find(UUID courseUuid, UUID moduleUuid) {
        return getModuleOrThrow(courseUuid, moduleUuid);
    }

    @Override
    @Transactional
    public Module create(UUID courseUuid, ModuleRequestDTO dto) {
        Course course = courseRepository.findById(courseUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Kurz nebyl nalezen"));
        if (!course.getStatus().equals(StatusEnum.Draft))
            throw new IllegalArgumentException("Kurz je není v režimu úprav.");

        Module module = new Module();
        module.setCourse(course);
        module.setName(dto.getName());
        module.setDescription(dto.getDescription());
        module.setIndex(dto.getIndex());
        module.setActivated(false);

        return moduleRepository.save(module);
    }

    @Override
    @Transactional
    public Module update(UUID courseUuid, UUID moduleUuid, ModuleRequestDTO dto) {
        Module module = getModuleOrThrow(courseUuid, moduleUuid);

        if (!module.getCourse().getStatus().equals(StatusEnum.Draft))
            throw new IllegalArgumentException("Kurz je není v režimu úprav.");

        if (dto.getName() != null)
            module.setName(dto.getName());
        if (dto.getDescription() != null)
            module.setDescription(dto.getDescription());
        module.setIndex(dto.getIndex());

        return moduleRepository.save(module);
    }

    @Override
    @Transactional
    public Module kill(UUID courseUuid, UUID moduleUuid) {
        Module module = getModuleOrThrow(courseUuid, moduleUuid);
        if (!module.getCourse().getStatus().equals(StatusEnum.Draft))
            throw new IllegalArgumentException("Kurz je není v režimu úprav.");

        moduleRepository.delete(module);
        return module;
    }

    @Override
    public boolean hasNext(UUID courseUuid) {
        List<Module> modules = moduleRepository.findByCourseUuidOrderByIndexAsc(courseUuid);

        int totalLength = modules.size();
        long activeCount = modules.stream()
                .filter(Module::isActivated)
                .count();

        // Existuje další neaktivní modul → true
        return activeCount < totalLength;
    }

    @Override
    public boolean hasPrevious(UUID courseUuid) {
        List<Module> modules = moduleRepository.findByCourseUuidOrderByIndexAsc(courseUuid);

        long activeCount = modules.stream()
                .filter(Module::isActivated)
                .count();

        // Existuje alespoň jeden aktivní modul → lze deaktivovat = hasPrevious true
        return activeCount > 0;
    }

    @Override
    @Transactional
    public Module activate(UUID courseUuid) {
        List<Module> modules = moduleRepository.findByCourseUuidOrderByIndexAsc(courseUuid);

        Module toActivate = modules.stream()
                .filter(m -> !m.isActivated())
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Žádný další modul k aktivaci."));

        toActivate.setActivated(true);

        return moduleRepository.save(toActivate);
    }

    @Override
    @Transactional
    public Module deactivate(UUID courseUuid) {
        List<Module> modules = moduleRepository.findByCourseUuidOrderByIndexAsc(courseUuid);

        Module toDeactivate = modules.stream()
                .filter(Module::isActivated)
                .max(Comparator.comparingInt(Module::getIndex))
                .orElseThrow(() -> new IllegalStateException("Žádný modul k deaktivaci."));

        toDeactivate.setActivated(false);
        return moduleRepository.save(toDeactivate);
    }

    @Override
    @Transactional
    public void reorder(UUID courseUuid, List<UUID> orderedModuleUuids) {
        Course course = courseRepository.findById(courseUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Kurz nebyl nalezen"));

        if (!course.getStatus().equals(StatusEnum.Draft))
            throw new IllegalArgumentException("Kurz není v režimu úprav.");

        List<Module> modules = moduleRepository.findByCourseUuidOrderByIndexAsc(courseUuid);

        for (int i = 0; i < orderedModuleUuids.size(); i++) {
            UUID targetUuid = orderedModuleUuids.get(i);
            Module module = modules.stream()
                    .filter(m -> m.getUuid().equals(targetUuid))
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("Modul nebyl nalezen: " + targetUuid));
            module.setIndex(i);
        }

        moduleRepository.saveAll(modules);
    }

    // ── private helpers ───────────────────────────────────────────────────────

    private Module getModuleOrThrow(UUID courseUuid, UUID moduleUuid) {
        Module module = moduleRepository.findById(moduleUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Modul nebyl nalezen"));

        if (!module.getCourse().getUuid().equals(courseUuid))
            throw new IllegalArgumentException("Modul nepatří k danému kurzu.");

        return module;
    }

    private int getLength(UUID courseUuid) {
        return moduleRepository.findByCourseUuidOrderByIndexAsc(courseUuid).size();
    }
}
