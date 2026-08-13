package com.assessment.auth.dto;

import java.math.BigDecimal;

public class SpendBreakdownDTO {

    private String name;
    private BigDecimal spend;

    public SpendBreakdownDTO() {
    }

    public SpendBreakdownDTO(String name, BigDecimal spend) {
        this.name = name;
        this.spend = spend;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public BigDecimal getSpend() {
        return spend;
    }

    public void setSpend(BigDecimal spend) {
        this.spend = spend;
    }
}