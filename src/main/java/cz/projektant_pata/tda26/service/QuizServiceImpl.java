package cz.projektant_pata.tda26.service;

import cz.projektant_pata.tda26.exception.ResourceNotFoundException;
import cz.projektant_pata.tda26.model.course.quiz.Question;
import cz.projektant_pata.tda26.model.course.Course;
import cz.projektant_pata.tda26.model.course.material.Material;
import cz.projektant_pata.tda26.model.course.quiz.Quiz;
import cz.projektant_pata.tda26.repository.QuizRepository;
import cz.projektant_pata.tda26.repository.CourseRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class QuizServiceImpl implements IQuizService {

    private final QuizRepository quizRepository;
    private final CourseRepository courseRepository;

    @Override
    public List<Quiz> find(UUID courseUuid) {
        return quizRepository.findByCourseUuid(courseUuid);
    }

    @Override
    public Quiz find(UUID courseUuid, UUID quizUuid) {
        Quiz quiz = quizRepository.findById(quizUuid)
                .orElseThrow(() -> new RuntimeException("Kvíz nebyl nalezen"));

        if (!quiz.getCourse().getUuid().equals(courseUuid))
            throw new RuntimeException("Kvíz nepatří k danému kurzu");

        return quiz;
    }

    @Override
    public Quiz update(UUID courseUuid, UUID quizUuid, Quiz updatedQuiz) {
        Quiz existingQuiz = this.find(courseUuid, quizUuid);

        if (!existingQuiz.getCourse().getUuid().equals(courseUuid)){
            throw new IllegalArgumentException("Změna typu materiálu není povolena.");
        }

        existingQuiz.setTitle(updatedQuiz.getTitle());

        return quizRepository.save(existingQuiz);
    }

    @Override
    public Quiz create(UUID courseUuid, Quiz quiz) {
        Course course = courseRepository.findById(courseUuid)
                .orElseThrow(() -> new RuntimeException("Kurz nebyl nalezen"));

        quiz.setCourse(course);
        return quizRepository.save(quiz);
    }

    @Override
    public void kill(UUID courseUuid, UUID quizUuid) {
        Quiz quiz = find(courseUuid, quizUuid);
        quizRepository.delete(quiz);
    }
}
