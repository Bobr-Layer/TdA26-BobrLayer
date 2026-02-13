package cz.projektant_pata.tda26.dto.course.module;

import cz.projektant_pata.tda26.dto.course.material.MaterialResponseDTO;
import cz.projektant_pata.tda26.dto.course.quiz.QuizResponseDTO;
import cz.projektant_pata.tda26.model.course.module.Module;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
public class ModuleResponseDTO {

    private UUID uuid;
    private String name;
    private String description;
    private int index;
    private boolean isActivated;

    private List<MaterialResponseDTO> materials;
    private List<QuizResponseDTO> quizzes;
}