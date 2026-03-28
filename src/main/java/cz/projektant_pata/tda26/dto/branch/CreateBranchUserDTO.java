package cz.projektant_pata.tda26.dto.branch;

import cz.projektant_pata.tda26.model.user.RoleEnum;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateBranchUserDTO {
    private String username;
    private String password;
    private RoleEnum role;
}
