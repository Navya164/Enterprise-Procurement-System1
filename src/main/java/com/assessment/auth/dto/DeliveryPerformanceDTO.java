package com.assessment.auth.dto;

public class DeliveryPerformanceDTO {

    private long totalDeliveredOrders;
    private long onTimeDeliveries;
    private long delayedDeliveries;
    private double onTimeDeliveryRate;

    public DeliveryPerformanceDTO() {
    }

    public long getTotalDeliveredOrders() {
        return totalDeliveredOrders;
    }

    public void setTotalDeliveredOrders(long totalDeliveredOrders) {
        this.totalDeliveredOrders = totalDeliveredOrders;
    }

    public long getOnTimeDeliveries() {
        return onTimeDeliveries;
    }

    public void setOnTimeDeliveries(long onTimeDeliveries) {
        this.onTimeDeliveries = onTimeDeliveries;
    }

    public long getDelayedDeliveries() {
        return delayedDeliveries;
    }

    public void setDelayedDeliveries(long delayedDeliveries) {
        this.delayedDeliveries = delayedDeliveries;
    }

    public double getOnTimeDeliveryRate() {
        return onTimeDeliveryRate;
    }

    public void setOnTimeDeliveryRate(double onTimeDeliveryRate) {
        this.onTimeDeliveryRate = onTimeDeliveryRate;
    }
}