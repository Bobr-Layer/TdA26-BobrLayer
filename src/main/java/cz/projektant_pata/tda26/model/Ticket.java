package cz.projektant_pata.tda26.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "tickets")
@Getter
@Setter
@NoArgsConstructor
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "uuid")
    private UUID uuid;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String branch;

    @Column(nullable = false)
    private String url;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "screenshot_path")
    private String screenshotPath;

    @Column(name = "screenshot_path_2")
    private String screenshotPath2;

    @Column(name = "screenshot_path_3")
    private String screenshotPath3;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
}
