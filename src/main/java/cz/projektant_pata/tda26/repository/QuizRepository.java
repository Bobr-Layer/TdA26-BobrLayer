package cz.projektant_pata.tda26.repository;

import cz.projektant_pata.tda26.model.Question;
import cz.projektant_pata.tda26.model.course.quiz.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface QuizRepository extends JpaRepository<Quiz, UUID> {
    Quiz addQuestion(UUID uuid, Question question);
    Quiz removeQuestion(UUID uuid, Question question);
}
