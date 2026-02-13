package cz.projektant_pata.tda26.model.course.quiz;

import com.fasterxml.jackson.annotation.JsonIgnore;
import cz.projektant_pata.tda26.model.course.module.Module;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "quizzes")
@Getter
@Setter
@NoArgsConstructor
public class Quiz {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "uuid")
    private UUID uuid;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private Integer attemptsCount = 0;

    @ManyToOne
    @JoinColumn(name = "module_id")
    @JsonIgnore
    private Module module;


    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderColumn(name = "question_index")
    private List<Question> questions = new ArrayList<>();

    public void incrementAttempts() {
        this.attemptsCount++;
    }

    public void addQuestion(Question question) {
        if (question == null) return;
        this.questions.add(question);
        question.setQuiz(this);
    }

    public void removeQuestion(Question question) {
        if (question == null) return;
        this.questions.remove(question);
        question.setQuiz(null);
    }
}
