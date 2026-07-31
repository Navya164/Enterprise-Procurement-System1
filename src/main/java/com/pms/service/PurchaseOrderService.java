package com.pms.service;

import com.pms.dto.PurchaseOrderRequestDTO;
import com.pms.dto.PurchaseOrderResponseDTO;
import com.pms.dto.PurchaseOrderStatusUpdateDTO;
import com.pms.dto.PurchaseOrderUpdateDTO;

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
