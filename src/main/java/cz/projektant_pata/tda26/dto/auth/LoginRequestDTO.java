package cz.projektant_pata.tda26.dto.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequestDTO {

    @NotBlank(message = "Zadejte uživatelské jméno")
    private String username;

    @NotBlank(message = "Zadejte heslo")
    private String password;
}
