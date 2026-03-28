package cz.projektant_pata.tda26.dto.course.version;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseVersionMetaDTO {
    private String shortId;
    private Instant createdAt;
}
