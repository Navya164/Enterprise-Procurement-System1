package com.service;

import com.dto.PurchaseOrderRequestDTO;
import com.dto.PurchaseOrderResponseDTO;
import com.dto.PurchaseOrderStatusUpdateDTO;
import com.dto.PurchaseOrderUpdateDTO;

import java.util.List;

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
