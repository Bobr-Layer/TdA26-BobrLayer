package cz.projektant_pata.tda26.event.course.quiz;

import cz.projektant_pata.tda26.model.course.Course;
import cz.projektant_pata.tda26.model.course.quiz.Quiz;

import java.util.List;

public record QuizSubmittedEvent(
                Course course,
                Quiz quiz,
                double score,
                double maxScore,
                List<Boolean> correctPerQuestion) {
}
