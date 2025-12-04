package cz.projektant_pata.tda26.model.course.quiz;

import cz.projektant_pata.tda26.model.course.quiz.Question;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Entity
@DiscriminatorValue("singleChoice")
@Getter
@Setter
@NoArgsConstructor
public class SingleChoiceQuestion extends Question {
    private Integer correctIndex;
}
