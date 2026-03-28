package cz.projektant_pata.tda26.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import cz.projektant_pata.tda26.dto.course.quiz.QuizRequestDTO;
import cz.projektant_pata.tda26.dto.course.quiz.question.*;
import cz.projektant_pata.tda26.event.course.quiz.QuizSubmittedEvent;
import cz.projektant_pata.tda26.exception.ResourceNotFoundException;
import cz.projektant_pata.tda26.model.course.StatusEnum;
import cz.projektant_pata.tda26.model.course.module.Module;
import cz.projektant_pata.tda26.model.course.quiz.*;
import cz.projektant_pata.tda26.model.user.User;
import cz.projektant_pata.tda26.repository.ModuleRepository;
import cz.projektant_pata.tda26.repository.QuizAttemptRepository;
import cz.projektant_pata.tda26.repository.QuizRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class QuizServiceImpl implements IQuizService {

    private final QuizRepository quizRepository;
    private final ModuleRepository moduleRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final QuizAttemptRepository quizAttemptRepository;
    private final ObjectMapper objectMapper;

    @Override
    public List<Quiz> find(UUID moduleUuid) {
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
        existingQuiz.setTitle(dto.getTitle());

        if (dto.getQuestions() == null || dto.getQuestions().isEmpty()) {
            existingQuiz.getQuestions().clear();
        } else {
            existingQuiz.getQuestions().removeIf(existingQ -> dto.getQuestions().stream()
                    .noneMatch(newQ -> newQ.getUuid() != null && newQ.getUuid().equals(existingQ.getUuid())));

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

        return quizRepository.save(quiz);
    }

    @Override
    @Transactional
    public void kill(UUID moduleUuid, UUID quizUuid) {
        Quiz quiz = getQuizOrThrow(moduleUuid, quizUuid);
        if (!quiz.getModule().getCourse().getStatus().equals(StatusEnum.Draft))
            throw new IllegalArgumentException("Kurz není v režimu úprav");
        quizRepository.delete(quiz);
    }

    @Override
    @Transactional
    public SubmitQuizResultDTO submitQuiz(UUID moduleUuid, UUID quizUuid, SubmitQuizDTO submission) {
        Quiz quiz = getQuizOrThrow(moduleUuid, quizUuid);
        quiz.incrementAttempts();

        Map<UUID, SubmitAnswerDTO> userAnswersMap = (submission == null || submission.answers() == null)
                ? Collections.emptyMap()
                : submission.answers().stream()
                        .collect(Collectors.toMap(SubmitAnswerDTO::uuid, dto -> dto));

        int totalGradable = 0;
        int correctCount = 0;
        List<Boolean> correctPerQuestion = new ArrayList<>();
        Map<String, String> textAnswers = new HashMap<>();

        for (Question question : quiz.getQuestions()) {
            SubmitAnswerDTO userAnswer = userAnswersMap.get(question.getUuid());

            if (question instanceof OpenQuestion) {
                // Open questions are not auto-graded, stored separately
                correctPerQuestion.add(null);
                if (userAnswer != null && userAnswer.textAnswer() != null) {
                    textAnswers.put(question.getUuid().toString(), userAnswer.textAnswer());
                }
            } else {
                totalGradable++;
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
        }

        quizRepository.save(quiz);

        // Get current user from security context
        User student = null;
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof User u) {
            student = u;
        }

        // Serialize text answers
        String textAnswersJson = null;
        if (!textAnswers.isEmpty()) {
            try {
                textAnswersJson = objectMapper.writeValueAsString(textAnswers);
            } catch (Exception ignored) {
            }
        }

        // Save attempt
        QuizAttempt attempt = new QuizAttempt();
        attempt.setQuiz(quiz);
        attempt.setStudent(student);
        attempt.setScore((double) correctCount);
        attempt.setMaxScore((double) totalGradable);
        attempt.setCorrectPerQuestion(correctPerQuestion);
        attempt.setTextAnswersJson(textAnswersJson);
        attempt.setSubmittedAt(LocalDateTime.now());
        quizAttemptRepository.save(attempt);

        eventPublisher.publishEvent(new QuizSubmittedEvent(
                quiz.getModule().getCourse(), quiz,
                (double) correctCount, (double) totalGradable,
                correctPerQuestion));

        return new SubmitQuizResultDTO(
                quiz.getUuid(),
                (double) correctCount,
                (double) totalGradable,
                correctPerQuestion,
                attempt.getSubmittedAt());
    }

    @Override
    public List<QuizAttempt> getAttempts(UUID moduleUuid, UUID quizUuid) {
        getQuizOrThrow(moduleUuid, quizUuid);
        return quizAttemptRepository.findByQuizUuid(quizUuid);
    }

    // ── private helpers ───────────────────────────────────────────────────────

    private Quiz getQuizOrThrow(UUID moduleUuid, UUID quizUuid) {
        Quiz quiz = quizRepository.findById(quizUuid)
                .orElseThrow(() -> new ResourceNotFoundException("Kvíz nebyl nalezen"));
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
        } else if (dto instanceof OpenQuestionRequestDTO oDto) {
            OpenQuestion q = new OpenQuestion();
            q.setQuestion(oDto.getQuestion());
            q.setOptions(null);
            q.setCorrectAnswer(oDto.getCorrectAnswer());
            return q;
        }
        throw new IllegalArgumentException("Unsupported question type: " + dto.getClass().getSimpleName());
    }

    private void updateQuestionFromDto(Question existing, QuestionRequestDTO dto) {
        existing.setQuestion(dto.getQuestion());

        if (existing instanceof SingleChoiceQuestion sq && dto instanceof SingleChoiceQuestionRequestDTO sDto) {
            sq.setOptions(sDto.getOptions());
            sq.setCorrectIndex(sDto.getCorrectIndex());
        } else if (existing instanceof MultipleChoiceQuestion mq && dto instanceof MultipleChoiceQuestionRequestDTO mDto) {
            mq.setOptions(mDto.getOptions());
            mq.setCorrectIndices(mDto.getCorrectIndices());
        } else if (existing instanceof OpenQuestion oq && dto instanceof OpenQuestionRequestDTO oDto) {
            oq.setOptions(null);
            oq.setCorrectAnswer(oDto.getCorrectAnswer());
        }
    }
}
