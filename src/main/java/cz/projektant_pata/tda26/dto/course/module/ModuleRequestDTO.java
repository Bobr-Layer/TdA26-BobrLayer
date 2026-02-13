package cz.projektant_pata.tda26.dto.course.module;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
public class ModuleRequestDTO {
    private String name;
    private String description;
    private int index;
}
