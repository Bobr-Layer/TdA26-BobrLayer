package cz.projektant_pata.tda26.model.course.version.snapshot;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
public class ModuleSnapshot {
    private UUID uuid;
    private int index;
    private boolean isActivated;
    private String name;
    private String description;
    private List<MaterialSnapshot> materials;
    private List<QuizSnapshot> quizzes;
}
