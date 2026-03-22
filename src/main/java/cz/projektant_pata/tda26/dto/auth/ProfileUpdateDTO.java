package cz.projektant_pata.tda26.dto.auth;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ProfileUpdateDTO {

    @Size(min = 3, max = 50, message = "Jméno musí mít 3 až 50 znaků")
    private String username;

    @Size(min = 6, message = "Heslo musí mít alespoň 6 znaků")
    private String password;
}
