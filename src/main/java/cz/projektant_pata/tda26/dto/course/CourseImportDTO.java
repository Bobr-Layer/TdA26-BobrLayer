package cz.projektant_pata.tda26.dto.course;

import cz.projektant_pata.tda26.dto.course.module.ModuleImportDTO;
import lombok.Data;

import java.util.List;

@Data
public class CourseImportDTO {
    private String name;
    private String description;
    private List<ModuleImportDTO> modules;
}
