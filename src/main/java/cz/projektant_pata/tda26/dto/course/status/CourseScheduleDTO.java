package cz.projektant_pata.tda26.dto.course.status;

import lombok.Getter;
import lombok.Setter;
import java.time.Instant;

@Getter
@Setter
public class CourseScheduleDTO {
    private Instant scheduledAt;
}
