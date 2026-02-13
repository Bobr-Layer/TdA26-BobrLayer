package cz.projektant_pata.tda26.repository;

import cz.projektant_pata.tda26.model.course.quiz.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, UUID> {
    List<Quiz> findByModuleUuid(UUID moduleUuid);
}
