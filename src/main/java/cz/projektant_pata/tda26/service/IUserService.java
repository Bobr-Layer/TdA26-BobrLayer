package cz.projektant_pata.tda26.service;

import cz.projektant_pata.tda26.model.User;

import java.util.List;
import java.util.UUID;

public interface IUserService {
    List<User> find();
    User find(UUID uuid);
    User find(String username);
    User update(UUID uuid, User user);
    User update(UUID uuid, String pass);

    User create(User user);
    User kill(UUID uuid);

    boolean exists(String username);
}
