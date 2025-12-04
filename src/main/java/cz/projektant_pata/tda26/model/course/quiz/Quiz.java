package cz.projektant_pata.tda26.model.course.quiz;

import cz.projektant_pata.tda26.model.course.quiz.Question;
import cz.projektant_pata.tda26.model.course.Course;
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_uuid", nullable = false)
    private Course course;

    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Question> questions = new ArrayList<>();

    public void addQuestion(Question question) {
        questions.add(question);
        question.setQuiz(this);
    }
}
