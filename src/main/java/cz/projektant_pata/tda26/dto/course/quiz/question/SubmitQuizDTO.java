package cz.projektant_pata.tda26.dto.course.quiz.question;

import java.util.List;

public record SubmitQuizDTO(List<SubmitAnswerDTO> answers) {
}
