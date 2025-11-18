package cz.projektant_pata.tda26.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "Uživatelské jméno je povinné")
    @Size(min = 3, max = 50, message = "Jméno musí mít 3 až 50 znaků")
    private String username;

    @NotBlank(message = "Heslo je povinné")
    @Size(min = 6, message = "Heslo musí mít alespoň 6 znaků")
    private String password;
}
