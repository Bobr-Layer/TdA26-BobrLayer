package cz.projektant_pata.tda26.dto.course.quiz.Question;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@JsonTypeInfo(
        use = JsonTypeInfo.Id.NAME,
        property = "type",
        visible = true
)
@JsonSubTypes({
        @JsonSubTypes.Type(value = SingleChoiceQuestionRequest.class, name = "singleChoice"),
        @JsonSubTypes.Type(value = MultipleChoiceQuestionRequest.class, name = "multipleChoice")
})
@Data
public abstract class QuestionRequest {

    @NotBlank
    private String question;

    @NotEmpty
    private List<String> options;

    @NotBlank
    private String type;
}
