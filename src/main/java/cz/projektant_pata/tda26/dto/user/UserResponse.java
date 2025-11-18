package cz.projektant_pata.tda26.dto.user;

import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class UserResponse {
    private UUID uuid;
    private String username;
    private String role;
    private Boolean enabled;
}