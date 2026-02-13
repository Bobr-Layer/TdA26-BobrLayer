package cz.projektant_pata.tda26.mapper;

import cz.projektant_pata.tda26.dto.course.module.ModuleRequestDTO;
import cz.projektant_pata.tda26.dto.course.module.ModuleResponseDTO;
import cz.projektant_pata.tda26.model.course.module.Module;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ModuleMapper {

    private final MaterialMapper materialMapper;
    private final QuizMapper quizMapper;

    public ModuleResponseDTO toResponse(Module module) {
        if (module == null) return null;

        ModuleResponseDTO dto = new ModuleResponseDTO();
        dto.setUuid(module.getUuid());
        dto.setName(module.getName());
        dto.setDescription(module.getDescription());
        dto.setIndex(module.getIndex());
        dto.setActivated(module.isActivated());

        dto.setMaterials(module.getMaterials().stream()
                .map(materialMapper::toResponse)
                .toList());

        dto.setQuizzes(module.getQuizzes().stream()
                .map(quizMapper::toResponse)
                .toList());

        return dto;
    }

    public Module toEntity(ModuleRequestDTO dto) {
        if (dto == null) return null;

        Module module = new Module();
        module.setName(dto.getName());
        module.setDescription(dto.getDescription());
        module.setIndex(dto.getIndex());
        module.setActivated(false);
        return module;
    }
}
