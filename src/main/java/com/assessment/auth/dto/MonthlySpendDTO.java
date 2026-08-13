package com.assessment.auth.dto;

import java.math.BigDecimal;

public class MonthlySpendDTO {

    private String month;
    private BigDecimal spend;

    public MonthlySpendDTO() {
    }

    public MonthlySpendDTO(String month, BigDecimal spend) {
        this.month = month;
        this.spend = spend;
    }

    public String getMonth() {
        return month;
    }

    public void setMonth(String month) {
        this.month = month;
    }

    public BigDecimal getSpend() {
        return spend;
    }

    public void setSpend(BigDecimal spend) {
        this.spend = spend;
    }
}