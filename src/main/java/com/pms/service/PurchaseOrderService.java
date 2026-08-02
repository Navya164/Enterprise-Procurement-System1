package com.pms.service;

import java.util.List;

import com.assessment.auth.dto.PurchaseOrderRequestDTO;
import com.assessment.auth.dto.PurchaseOrderResponseDTO;
import com.assessment.auth.dto.PurchaseOrderStatusUpdateDTO;
import com.assessment.auth.dto.PurchaseOrderUpdateDTO;

/**
 * Interface defines WHAT the service does, not HOW.
 * Controllers depend on this interface (Dependency Inversion Principle).
 */
public interface PurchaseOrderService {

    PurchaseOrderResponseDTO createPurchaseOrder(PurchaseOrderRequestDTO requestDTO);

    List<PurchaseOrderResponseDTO> getAllPurchaseOrders();

    PurchaseOrderResponseDTO getPurchaseOrderById(Long id);

    PurchaseOrderResponseDTO updatePurchaseOrder(Long id, PurchaseOrderUpdateDTO updateDTO);

    PurchaseOrderResponseDTO updateStatus(Long id, PurchaseOrderStatusUpdateDTO statusUpdateDTO);

    void deletePurchaseOrder(Long id);
}
