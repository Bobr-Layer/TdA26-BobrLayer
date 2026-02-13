package cz.projektant_pata.tda26.service;

import cz.projektant_pata.tda26.dto.course.quiz.QuizRequestDTO;
import cz.projektant_pata.tda26.dto.course.quiz.question.*;
import cz.projektant_pata.tda26.event.course.quiz.QuizCreatedEvent;
import cz.projektant_pata.tda26.event.course.quiz.QuizKilledEvent;
import cz.projektant_pata.tda26.event.course.quiz.QuizUpdatedEvent;
import cz.projektant_pata.tda26.exception.ResourceNotFoundException;
import cz.projektant_pata.tda26.model.course.StatusEnum;
import cz.projektant_pata.tda26.model.course.module.Module;
import cz.projektant_pata.tda26.model.course.quiz.MultipleChoiceQuestion;
import cz.projektant_pata.tda26.model.course.quiz.Question;
import cz.projektant_pata.tda26.model.course.quiz.Quiz;
import cz.projektant_pata.tda26.model.course.quiz.SingleChoiceQuestion;
import cz.projektant_pata.tda26.repository.ModuleRepository;
import cz.projektant_pata.tda26.repository.QuizRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional // ✅ výchozí pro všechny read metody
public class QuizServiceImpl implements IQuizService {

    private final QuizRepository quizRepository;
    private final ModuleRepository moduleRepository; // ✅ odstraněn CourseRepository (nepoužíval se)
    private final ApplicationEventPublisher eventPublisher;


    @Override
    public List<Quiz> find(UUID moduleUuid) { // ✅ přejmenován parametr m → moduleUuid
        return quizRepository.findByModuleUuid(moduleUuid);
    }

    @Override
    public Quiz find(UUID moduleUuid, UUID quizUuid) {
        return getQuizOrThrow(moduleUuid, quizUuid);
    }

    @Override
    @Transactional
    public Quiz update(UUID moduleUuid, UUID quizUuid, QuizRequestDTO dto) {
        Quiz existingQuiz = getQuizOrThrow(moduleUuid, quizUuid);
        if (!existingQuiz.getModule().getCourse().getStatus().equals(StatusEnum.Draft))
            throw new IllegalArgumentException("Kurz není v režimu úprav");
        String oldTitle = existingQuiz.getTitle();
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
    public Quiz create(UUID moduleUuid, QuizRequestDTO dto) {
        Module module = moduleRepository.findById(moduleUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Modul nebyl nalezen"));
        if (!module.getCourse().getStatus().equals(StatusEnum.Draft))
            throw new IllegalArgumentException("Kurz není v režimu úprav");
        Quiz quiz = new Quiz();
        quiz.setModule(module);
        quiz.setTitle(dto.getTitle());

        if (dto.getQuestions() != null) {
            for (QuestionRequestDTO qDto : dto.getQuestions()) {
                Question questionEntity = mapDtoToEntity(qDto);
                quiz.addQuestion(questionEntity);
            }
        }

        Quiz saved = quizRepository.save(quiz);
        if (module.getCourse().getStatus().equals(StatusEnum.Draft))
            eventPublisher.publishEvent(new QuizCreatedEvent(moduleUuid, saved.getTitle()));
        return saved;
    }

    @Override
    @Transactional
    public void kill(UUID moduleUuid, UUID quizUuid) { // ✅ přejmenován parametr courseUuid → moduleUuid

        Quiz quiz = getQuizOrThrow(moduleUuid, quizUuid);
        if (!quiz.getModule().getCourse().getStatus().equals(StatusEnum.Draft))
            throw new IllegalArgumentException("Kurz není v režimu úprav");
        String quizTitle = quiz.getTitle();

        quizRepository.delete(quiz);
        eventPublisher.publishEvent(new QuizKilledEvent(moduleUuid, quizTitle));
    }

    @Override
    @Transactional
    public SubmitQuizResultDTO submitQuiz(UUID moduleUuid, UUID quizUuid, SubmitQuizDTO submission) { // ✅ přejmenován parametr
        Quiz quiz = getQuizOrThrow(moduleUuid, quizUuid);
        if (!quiz.getModule().getCourse().getStatus().equals(StatusEnum.Draft))
            throw new IllegalArgumentException("Kurz není v režimu úprav");

        quiz.incrementAttempts();

        Map<UUID, SubmitAnswerDTO> userAnswersMap = (submission == null || submission.answers() == null)
                ? Collections.emptyMap()
                : submission.answers().stream()
                .collect(Collectors.toMap(SubmitAnswerDTO::uuid, dto -> dto));

        int totalQuestions = quiz.getQuestions().size();
        int correctCount = 0;
        List<Boolean> correctPerQuestion = new ArrayList<>();

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
                correctCount++;
            }
            correctPerQuestion.add(isCorrect);
        }

        quizRepository.save(quiz);

        return new SubmitQuizResultDTO(
                quiz.getUuid(),
                (double) correctCount,
                (double) totalQuestions,
                correctPerQuestion,
                java.time.LocalDateTime.now()
        );
    }


    // ── private helpers ───────────────────────────────────────────────────────

    private Quiz getQuizOrThrow(UUID moduleUuid, UUID quizUuid) {
        Quiz quiz = quizRepository.findById(quizUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Kvíz nebyl nalezen"));

        // ✅ bylo: quiz.getCourse() — Course na Quiz neexistuje, Quiz patří pod Module
        if (!quiz.getModule().getUuid().equals(moduleUuid)) {
            throw new IllegalArgumentException("Kvíz nepatří k danému modulu");
        }
        return quiz;
    }

    private boolean validateMultipleChoice(MultipleChoiceQuestion question, List<Integer> userIndices) {
        List<Integer> effectiveUserIndices = (userIndices == null) ? Collections.emptyList() : userIndices;
        Set<Integer> userSet = new HashSet<>(effectiveUserIndices);
        Set<Integer> correctSet = new HashSet<>(question.getCorrectIndices());
        return userSet.equals(correctSet);
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
