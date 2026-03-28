package cz.projektant_pata.tda26.model.course.version.snapshot;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class CourseSnapshot {
    private String name;
    private String description;
    private List<ModuleSnapshot> modules;
}
