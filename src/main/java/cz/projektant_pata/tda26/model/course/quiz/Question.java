package cz.projektant_pata.tda26.model.course.quiz;

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
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
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
    @OrderColumn(name = "option_order") // DOPORUČENÍ: Aby se možnosti A, B, C nepřeházely
    @Column(name = "option_text")
    private List<String> options;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_uuid", nullable = false)
    @JsonIgnore
    private Quiz quiz;

    @Column(nullable = false)
    private Integer correctAttempts = 0;

    @Column(name = "question_type", insertable = false, updatable = false)
    private String type;

    public void incrementCorrectAttempts() {
        this.correctAttempts++;
    }

    @Transient
    public Double getSuccessRate() {
        if (quiz == null || quiz.getAttemptsCount() == null || quiz.getAttemptsCount() == 0) {
            return 0.0;
        }
        return (double) correctAttempts / quiz.getAttemptsCount() * 100;
    }
}
