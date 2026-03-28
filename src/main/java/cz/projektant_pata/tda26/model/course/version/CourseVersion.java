package cz.projektant_pata.tda26.model.course.version;

import com.fasterxml.jackson.annotation.JsonIgnore;
import cz.projektant_pata.tda26.model.course.Course;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "course_versions")
@Getter
@Setter
@NoArgsConstructor
public class CourseVersion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 7)
    private String shortId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_uuid", nullable = false)
    @JsonIgnore
    private Course course;

    @Column(nullable = false, updatable = false)
    @CreationTimestamp
    private Instant createdAt;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String snapshotJson;
}
