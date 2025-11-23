package cz.projektant_pata.tda26.mapper;

import cz.projektant_pata.tda26.dto.auth.RegisterRequest;
import cz.projektant_pata.tda26.dto.user.UserResponse;
import cz.projektant_pata.tda26.model.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {
    public User toEntity(RegisterRequest req){
        User user = new User();

        user.setUsername(req.getUsername());
        user.setPassword(req.getPassword());

        return user;
    }

    public UserResponse toResponse(User user){
        UserResponse res = new UserResponse();

        res.setUuid(user.getUuid().toString());
        res.setUsername(user.getUsername());
        res.setRole(user.getRole().toString());
        res.setEnabled(user.getEnabled());

        return res;
    }
}
