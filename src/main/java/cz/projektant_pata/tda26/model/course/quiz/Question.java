package cz.projektant_pata.tda26.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import cz.projektant_pata.tda26.model.course.quiz.MultipleChoiceQuestion;
import cz.projektant_pata.tda26.model.course.quiz.Quiz;
import cz.projektant_pata.tda26.model.course.quiz.SingleChoiceQuestion;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "questions")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE) // Všechny typy otázek v jedné tabulce
@DiscriminatorColumn(name = "question_type", discriminatorType = DiscriminatorType.STRING)
@Getter
@Setter
@NoArgsConstructor
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
@JsonSubTypes({
        @JsonSubTypes.Type(value = SingleChoiceQuestion.class, name = "singleChoice"),
        @JsonSubTypes.Type(value = MultipleChoiceQuestion.class, name = "multipleChoice")
})
public abstract class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "uuid")
    private UUID uuid;

    @Column(nullable = false)
    private String question;

    @ElementCollection
    @CollectionTable(name = "question_options", joinColumns = @JoinColumn(name = "question_uuid"))
    @Column(name = "option_text")
    private List<String> options;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_uuid", nullable = false)
    @JsonIgnore
    private Quiz quiz;

    @Column(name = "question_type", insertable = false, updatable = false)
    private String type;
}
