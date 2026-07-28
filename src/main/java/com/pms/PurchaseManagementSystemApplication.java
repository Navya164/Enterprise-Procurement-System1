package com.pms;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = "com")
@EnableJpaRepositories(basePackages = {
    "com.assessment.auth.repository",
    "com.pms.repository"
})
@EntityScan(basePackages = {
    "com.assessment.auth.entity",
    "com.pms.entity"
})
public class PurchaseManagementSystemApplication {

    public static void main(String[] args) {
        SpringApplication.run(PurchaseManagementSystemApplication.class, args);
    }
}