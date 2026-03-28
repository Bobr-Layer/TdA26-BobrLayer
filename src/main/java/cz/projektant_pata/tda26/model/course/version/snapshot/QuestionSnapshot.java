package cz.projektant_pata.tda26.model.course.version.snapshot;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "type")
@JsonSubTypes({
        @JsonSubTypes.Type(value = SingleChoiceQuestionSnapshot.class, name = "singleChoice"),
        @JsonSubTypes.Type(value = MultipleChoiceQuestionSnapshot.class, name = "multipleChoice")
})
@Getter
@Setter
@NoArgsConstructor
public abstract class QuestionSnapshot {
    private UUID uuid;
    private String question;
    private List<String> options;
}
