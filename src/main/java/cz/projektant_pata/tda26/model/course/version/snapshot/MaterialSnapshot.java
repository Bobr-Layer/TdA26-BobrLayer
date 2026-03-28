package cz.projektant_pata.tda26.model.course.version.snapshot;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "type")
@JsonSubTypes({
        @JsonSubTypes.Type(value = FileMaterialSnapshot.class, name = "file"),
        @JsonSubTypes.Type(value = UrlMaterialSnapshot.class, name = "url")
})
@Getter
@Setter
@NoArgsConstructor
public abstract class MaterialSnapshot {
    private UUID uuid;
    private String name;
    private String description;
    private int count;
    private Instant createdAt;
}
