package cz.projektant_pata.tda26.dto.course.version;

import cz.projektant_pata.tda26.dto.course.module.ModuleResponseDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseVersionContentDTO {
    private String shortId;
    private Instant createdAt;
    private String name;
    private String description;
    private List<ModuleResponseDTO> modules;
}
