package cz.projektant_pata.tda26.dto.branch;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
public class BranchResponseDTO {
    private UUID uuid;
    private String name;
    private String country;
    private String city;
    private String address;
    private String postalCode;
    private String region;
    private String type;
    private String status;
    private int lectorsCount;
    private int managersCount;
    private Instant createdAt;
}
