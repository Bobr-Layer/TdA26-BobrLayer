package cz.projektant_pata.tda26.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ResetPasswordDTO {

    @NotBlank(message = "Nové heslo je povinné")
    @Size(min = 6, message = "Nové heslo musí mít alespoň 6 znaků")
    private String password;
}
