package cz.projektant_pata.tda26.controller.view;

import cz.projektant_pata.tda26.dto.course.quiz.QuizRequestDTO;
import cz.projektant_pata.tda26.model.course.quiz.Quiz;
import cz.projektant_pata.tda26.service.IQuizService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.UUID;

@Controller
@RequestMapping("/courses/{courseUuid}/quizzes")
@RequiredArgsConstructor
public class QuizViewController {

    private final IQuizService quizService;

    // Formálář pro NOVÝ kvíz
    @GetMapping("/new")
    public String showCreateForm(@PathVariable UUID courseUuid, Model model) {
        QuizRequestDTO quizDto = new QuizRequestDTO();
        // Inicializujeme prázdný list otázek, aby formulář nepadal
        quizDto.setQuestions(new ArrayList<>());

        model.addAttribute("quiz", quizDto);
        model.addAttribute("courseUuid", courseUuid);
        return "quiz_form"; // Název šablony
    }

    // Zpracování vytvoření (Submit formuláře)
    @PostMapping("/new")
    public String createQuiz(@PathVariable UUID courseUuid, @ModelAttribute("quiz") QuizRequestDTO quizDto) {
        // Zde by normálně byla validace BindingResult, pro stručnost vynechávám
        quizService.create(courseUuid, quizDto);
        return "redirect:/courses/" + courseUuid;
    }

    // Formulář pro EDITACI
    @GetMapping("/{quizUuid}/edit")
    public String showEditForm(@PathVariable UUID courseUuid, @PathVariable UUID quizUuid, Model model) {
        Quiz quiz = quizService.find(courseUuid, quizUuid);

        QuizRequestDTO dto = new QuizRequestDTO();
        dto.setUuid(quiz.getUuid());
        dto.setTitle(quiz.getTitle());

        model.addAttribute("quiz", dto); // Nebo pošli přímo entitu, pokud šablona umí číst obojí
        model.addAttribute("courseUuid", courseUuid);
        return "quiz_form";
    }

    // Zpracování smazání
    @PostMapping("/{quizUuid}/delete")
    public String deleteQuiz(@PathVariable UUID courseUuid, @PathVariable UUID quizUuid) {
        quizService.kill(courseUuid, quizUuid);
        return "redirect:/courses/" + courseUuid;
    }

    // Stránka pro HRANÍ kvízu (Play)
    @GetMapping("/{quizUuid}/play")
    public String playQuiz(@PathVariable UUID courseUuid, @PathVariable UUID quizUuid, Model model) {
        Quiz quiz = quizService.find(courseUuid, quizUuid);
        model.addAttribute("quiz", quiz);
        model.addAttribute("courseUuid", courseUuid);
        return "quiz_play";
    }
}
