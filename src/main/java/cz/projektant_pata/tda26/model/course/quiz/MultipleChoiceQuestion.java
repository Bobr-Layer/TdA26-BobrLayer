package cz.projektant_pata.tda26.model.course.quiz;

import cz.projektant_pata.tda26.model.course.quiz.Question;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.util.List;

@Entity
@DiscriminatorValue("multipleChoice")
@Getter
@Setter
@NoArgsConstructor
public class MultipleChoiceQuestion extends Question {

    @ElementCollection
    @CollectionTable(name = "question_correct_indices", joinColumns = @JoinColumn(name = "question_uuid"))
    @Column(name = "correct_index")
    private List<Integer> correctIndices;
}
