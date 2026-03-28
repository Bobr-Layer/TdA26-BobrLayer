package cz.projektant_pata.tda26.dto.course.module;

import cz.projektant_pata.tda26.dto.course.material.UrlMaterialImportDTO;
import cz.projektant_pata.tda26.dto.course.quiz.QuizRequestDTO;
import lombok.Data;

import java.util.List;

@Data
public class ModuleImportDTO {
    private String name;
    private String description;
    private int index;
    private List<UrlMaterialImportDTO> materials;
    private List<QuizRequestDTO> quizzes;
}
