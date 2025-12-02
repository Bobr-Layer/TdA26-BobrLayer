package cz.projektant_pata.tda26.service;

import cz.projektant_pata.tda26.model.Question;
import cz.projektant_pata.tda26.model.course.quiz.Quiz;

import java.util.List;
import java.util.UUID;

public interface IQuizService {
    List<Quiz> find(UUID courseUuid);
    Quiz find(UUID courseUuid, UUID quizUuid);
    Quiz update(UUID courseUuid, UUID quizUuid, Quiz quiz);
    Quiz create(UUID courseUuid, Quiz quiz);
    void kill(UUID courseUuid, UUID quizUuid);

//    Quiz addQuestion(UUID courseUuid, UUID quizUuid, Question question);
}
