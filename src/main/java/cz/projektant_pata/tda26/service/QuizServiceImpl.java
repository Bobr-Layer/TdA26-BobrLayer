package cz.projektant_pata.tda26.service;


import cz.projektant_pata.tda26.dto.course.quiz.QuizRequestDTO;
import cz.projektant_pata.tda26.dto.course.quiz.question.*;
import cz.projektant_pata.tda26.exception.ResourceNotFoundException;
import cz.projektant_pata.tda26.model.course.Course;
import cz.projektant_pata.tda26.model.course.quiz.MultipleChoiceQuestion;
import cz.projektant_pata.tda26.model.course.quiz.Question;
import cz.projektant_pata.tda26.model.course.quiz.Quiz;
import cz.projektant_pata.tda26.model.course.quiz.SingleChoiceQuestion;
import cz.projektant_pata.tda26.repository.CourseRepository;
import cz.projektant_pata.tda26.repository.QuizRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuizServiceImpl implements IQuizService {

    private final QuizRepository quizRepository;
    private final CourseRepository courseRepository;

    @Override
    @Transactional
    public List<Quiz> find(UUID courseUuid) {
        return quizRepository.findByCourseUuid(courseUuid);
    }

    @Override
    @Transactional
    public Quiz find(UUID courseUuid, UUID quizUuid) {
        return getQuizOrThrow(courseUuid, quizUuid);
    }

    @Override
    @Transactional
    public Quiz update(UUID courseUuid, UUID quizUuid, QuizRequestDTO dto) {
        Quiz existingQuiz = getQuizOrThrow(courseUuid, quizUuid);

        existingQuiz.setTitle(dto.getTitle());

        if (dto.getQuestions() == null || dto.getQuestions().isEmpty()) {
            existingQuiz.getQuestions().clear();
        } else {
            existingQuiz.getQuestions().removeIf(existingQ ->
                    dto.getQuestions().stream()
                            .noneMatch(newQ -> newQ.getUuid() != null && newQ.getUuid().equals(existingQ.getUuid()))
            );

            for (QuestionRequestDTO qDto : dto.getQuestions()) {
                if (qDto.getUuid() == null) {
                    Question newQ = mapDtoToEntity(qDto);
                    existingQuiz.addQuestion(newQ);
                } else {
                    existingQuiz.getQuestions().stream()
                            .filter(eq -> eq.getUuid().equals(qDto.getUuid()))
                            .findFirst()
                            .ifPresent(existingQ -> updateQuestionFromDto(existingQ, qDto));
                }
            }
        }

        return quizRepository.save(existingQuiz);
    }

    @Override
    @Transactional
    public Quiz create(UUID courseUuid, QuizRequestDTO dto) {
        Course course = courseRepository.findById(courseUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Kurz nebyl nalezen"));

        Quiz quiz = new Quiz();
        quiz.setCourse(course);
        quiz.setTitle(dto.getTitle());

        // Mapování a přidání otázek
        if (dto.getQuestions() != null) {
            for (QuestionRequestDTO qDto : dto.getQuestions()) {
                Question questionEntity = mapDtoToEntity(qDto);
                quiz.addQuestion(questionEntity);
            }
        }

        return quizRepository.save(quiz);
    }

    @Override
    @Transactional
    public void kill(UUID courseUuid, UUID quizUuid) {
        Quiz quiz = getQuizOrThrow(courseUuid, quizUuid);
        quizRepository.delete(quiz);
    }

    @Override
    @Transactional
    public Double submitQuiz(UUID courseUuid, UUID quizUuid, SubmitQuizDTO submission) {
        Quiz quiz = getQuizOrThrow(courseUuid, quizUuid);
        quiz.incrementAttempts();

        Map<UUID, SubmitAnswerDTO> userAnswersMap = (submission == null || submission.answers() == null)
                ? Collections.emptyMap()
                : submission.answers().stream()
                .collect(Collectors.toMap(SubmitAnswerDTO::uuid, dto -> dto));

        int totalQuestions = quiz.getQuestions().size();
        int correctlyAnsweredCount = 0;

        for (Question question : quiz.getQuestions()) {
            SubmitAnswerDTO userAnswer = userAnswersMap.get(question.getUuid());
            boolean isCorrect = false;

            if (userAnswer != null) {
                if (question instanceof SingleChoiceQuestion sq) {
                    isCorrect = Objects.equals(userAnswer.selectedIndex(), sq.getCorrectIndex());

                } else if (question instanceof MultipleChoiceQuestion mq) {
                    isCorrect = validateMultipleChoice(mq, userAnswer.selectedIndices());
                }
            }

            if (isCorrect) {
                question.incrementCorrectAttempts();
                correctlyAnsweredCount++;
            }
        }

        quizRepository.save(quiz);

        if (totalQuestions == 0) {
            return 0.0;
        }
        return ((double) correctlyAnsweredCount / totalQuestions) * 100.0;
    }

    private boolean validateMultipleChoice(MultipleChoiceQuestion question, List<Integer> userIndices) {
        List<Integer> effectiveUserIndices = (userIndices == null) ? Collections.emptyList() : userIndices;

        Set<Integer> userSet = new HashSet<>(effectiveUserIndices);
        Set<Integer> correctSet = new HashSet<>(question.getCorrectIndices());

        return userSet.equals(correctSet);
    }

    private Quiz getQuizOrThrow(UUID courseUuid, UUID quizUuid) {
        Quiz quiz = quizRepository.findById(quizUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Kvíz nebyl nalezen"));

        if (!quiz.getCourse().getUuid().equals(courseUuid)) {
            throw new IllegalArgumentException("Kvíz nepatří k danému kurzu");
        }
        return quiz;
    }

    private Question mapDtoToEntity(QuestionRequestDTO dto) {
        if (dto instanceof SingleChoiceQuestionRequestDTO sDto) {
            SingleChoiceQuestion q = new SingleChoiceQuestion();
            q.setQuestion(sDto.getQuestion());
            q.setOptions(sDto.getOptions());
            q.setCorrectIndex(sDto.getCorrectIndex());
            return q;
        } else if (dto instanceof MultipleChoiceQuestionRequestDTO mDto) {
            MultipleChoiceQuestion q = new MultipleChoiceQuestion();
            q.setQuestion(mDto.getQuestion());
            q.setOptions(mDto.getOptions());
            q.setCorrectIndices(mDto.getCorrectIndices());
            return q;
        }
        throw new IllegalArgumentException("Unsupported question type: " + dto.getClass().getSimpleName());
    }

    private void updateQuestionFromDto(Question existing, QuestionRequestDTO dto) {
        existing.setQuestion(dto.getQuestion());
        existing.setOptions(dto.getOptions());

        if (existing instanceof SingleChoiceQuestion sq && dto instanceof SingleChoiceQuestionRequestDTO sDto) {
            sq.setCorrectIndex(sDto.getCorrectIndex());
        } else if (existing instanceof MultipleChoiceQuestion mq && dto instanceof MultipleChoiceQuestionRequestDTO mDto) {
            mq.setCorrectIndices(mDto.getCorrectIndices());
        }
    }
}
