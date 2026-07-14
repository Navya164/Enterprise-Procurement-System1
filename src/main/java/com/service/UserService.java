package com.service;

import com.entity.User;

public interface UserService {

    User registerUser(User user);

    String loginUser(String email, String password);

}

