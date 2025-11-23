package cz.projektant_pata.tda26.dto.course;

import cz.projektant_pata.tda26.dto.course.material.MaterialResponse;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseResponse {
    private UUID uuid;
    private String name;
    private String description;

    private List<MaterialResponse> materials;
}
