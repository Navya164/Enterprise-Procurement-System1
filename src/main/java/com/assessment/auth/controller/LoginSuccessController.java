package com.assessment.auth.controller;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;


@Controller
public class LoginSuccessController {


    @GetMapping("/success")
    public String loginSuccess(Authentication authentication){


        String role =
            authentication.getAuthorities()
            .iterator()
            .next()
            .getAuthority();



        switch(role){


            case "ROLE_ADMIN":
                return "redirect:/admin";


            case "ROLE_MANAGER":
                return "redirect:/manager";


            case "ROLE_EMPLOYEE":
                return "redirect:/employee";


            case "ROLE_PROCUREMENT_OFFICER":
                return "redirect:/procurement";


            case "ROLE_VENDOR":
                return "redirect:/vendor";


            default:
                return "redirect:/login";
        }

    }

}