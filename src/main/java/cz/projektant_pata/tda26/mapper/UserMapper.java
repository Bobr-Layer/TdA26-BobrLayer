package cz.projektant_pata.tda26.mapper;

import cz.projektant_pata.tda26.dto.auth.RegisterRequestDTO;
import cz.projektant_pata.tda26.dto.user.UserResponseDTO;
import cz.projektant_pata.tda26.model.user.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {
    public User toEntity(RegisterRequestDTO req){
        User user = new User();

        user.setUsername(req.getUsername());
        user.setPassword(req.getPassword());

        return user;
    }

    public UserResponseDTO toResponse(User user){
        UserResponseDTO res = new UserResponseDTO();

        res.setUuid(user.getUuid());
        res.setUsername(user.getUsername());
        res.setRole(user.getRole().toString());
        res.setEnabled(user.getEnabled());

        return res;
    }
}
