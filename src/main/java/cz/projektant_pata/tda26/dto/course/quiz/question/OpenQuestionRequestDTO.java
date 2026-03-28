package cz.projektant_pata.tda26.dto.course.quiz.question;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class OpenQuestionRequestDTO extends QuestionRequestDTO {
    private String correctAnswer;
}
