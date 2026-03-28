package cz.projektant_pata.tda26.model.course.quiz;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@DiscriminatorValue("openQuestion")
@Getter
@Setter
@NoArgsConstructor
public class OpenQuestion extends Question {
    private String correctAnswer;
}
