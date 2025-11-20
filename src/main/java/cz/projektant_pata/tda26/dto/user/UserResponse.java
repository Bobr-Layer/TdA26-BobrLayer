package cz.projektant_pata.tda26.dto.user;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserResponse {
    private String uuid;
    private String username;
    private String role;
    private Boolean enabled;
}