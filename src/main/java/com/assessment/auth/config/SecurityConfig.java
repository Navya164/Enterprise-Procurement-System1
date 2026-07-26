package com.assessment.auth.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

import com.assessment.auth.security.CustomUserDetailsService;

@Configuration
public class SecurityConfig {

	@Bean
	public UserDetailsService userDetailsService(
	        CustomUserDetailsService customUserDetailsService) {

	    return customUserDetailsService;
	}

    @Bean
    public DaoAuthenticationProvider authenticationProvider(
            UserDetailsService userDetailsService,
            BCryptPasswordEncoder passwordEncoder) {

        DaoAuthenticationProvider authProvider =
                new DaoAuthenticationProvider();

        authProvider.setUserDetailsService(userDetailsService);

        authProvider.setPasswordEncoder(passwordEncoder);

        return authProvider;
    }

 
    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            DaoAuthenticationProvider authenticationProvider)
            throws Exception {
    	http
        .authenticationProvider(authenticationProvider)

        .csrf(csrf -> csrf.disable())

        .authorizeHttpRequests(auth -> auth
            .requestMatchers(
                    "/",
                    "/register",
                    "/login",
                    "/css/**",
                    "/js/**",
                    "/images/**"
            ).permitAll()
            .anyRequest().authenticated()
        )

        .formLogin(form -> form
                .loginPage("/login")
                .defaultSuccessUrl("/success", true)
                .permitAll()
        )

        .logout(logout -> logout
                .logoutSuccessUrl("/login")
                .permitAll());

        return http.build();
    }
}