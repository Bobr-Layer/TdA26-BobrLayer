package cz.projektant_pata.tda26.dto.course.quiz.question;

import java.util.List;
import java.util.UUID;

public record SubmitAnswerDTO(
        UUID uuid,
        Integer selectedIndex,
        List<Integer> selectedIndices,
        String textAnswer
) {}