package cz.projektant_pata.tda26.repository;

import cz.projektant_pata.tda26.model.course.quiz.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, UUID> {
    List<QuizAttempt> findByQuizUuid(UUID quizUuid);
    List<QuizAttempt> findByQuizUuidAndStudentUuid(UUID quizUuid, UUID studentUuid);
}
