package com.pms.repository;

import com.pms.entity.PurchaseOrder;
import com.pms.entity.PurchaseOrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {

    Optional<PurchaseOrder> findByPoNumber(String poNumber);

    List<PurchaseOrder> findByStatus(PurchaseOrderStatus status);

    List<PurchaseOrder> findByPurchaseRequest_Id(Long purchaseRequestId);

    boolean existsByPurchaseRequest_Id(Long purchaseRequestId);
}
