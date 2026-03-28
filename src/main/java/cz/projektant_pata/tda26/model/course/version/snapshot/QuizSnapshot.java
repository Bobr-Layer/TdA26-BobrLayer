package cz.projektant_pata.tda26.model.course.version.snapshot;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
public class QuizSnapshot {
    private UUID uuid;
    private String title;
    private List<QuestionSnapshot> questions;
}
