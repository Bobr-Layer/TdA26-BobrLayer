package cz.projektant_pata.tda26.model.course.quiz;

import cz.projektant_pata.tda26.model.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "quiz_attempts")
@Getter
@Setter
@NoArgsConstructor
public class QuizAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID uuid;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_uuid", nullable = false)
    private Quiz quiz;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_uuid", nullable = true)
    private User student;

    @Column(nullable = false)
    private Double score;

    @Column(nullable = false)
    private Double maxScore;

    @ElementCollection
    @CollectionTable(name = "quiz_attempt_results", joinColumns = @JoinColumn(name = "attempt_uuid"))
    @Column(name = "is_correct")
    @OrderColumn(name = "result_index")
    private List<Boolean> correctPerQuestion;

    @Column(columnDefinition = "TEXT")
    private String textAnswersJson;

    @Column(nullable = false)
    private LocalDateTime submittedAt;
}
