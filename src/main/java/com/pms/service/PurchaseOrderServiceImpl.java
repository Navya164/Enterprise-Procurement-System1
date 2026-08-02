package com.pms.service;

import java.math.BigDecimal;
import java.time.Year;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.assessment.auth.dto.PurchaseOrderRequestDTO;
import com.assessment.auth.dto.PurchaseOrderResponseDTO;
import com.assessment.auth.dto.PurchaseOrderStatusUpdateDTO;
import com.assessment.auth.dto.PurchaseOrderUpdateDTO;
import com.assessment.auth.entity.PurchaseRequest;
import com.assessment.auth.entity.Status;
import com.assessment.auth.repository.PurchaseRequestRepository;
import com.pms.entity.PurchaseOrder;
import com.pms.entity.PurchaseOrderStatus;
import com.pms.exception.InvalidPurchaseOrderStateException;
import com.pms.exception.PurchaseRequestNotApprovedException;
import com.pms.exception.ResourceNotFoundException;
import com.pms.repository.PurchaseOrderRepository;

@Service
public class PurchaseOrderServiceImpl implements PurchaseOrderService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final PurchaseRequestRepository purchaseRequestRepository;

    // Constructor injection - explicit, immutable, easy to unit test
    public PurchaseOrderServiceImpl(PurchaseOrderRepository purchaseOrderRepository,
                                     PurchaseRequestRepository purchaseRequestRepository) {
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.purchaseRequestRepository = purchaseRequestRepository;
    }

    // Defines legal lifecycle transitions: current status -> allowed next statuses
    private static final Map<PurchaseOrderStatus, Set<PurchaseOrderStatus>> ALLOWED_TRANSITIONS = Map.of(
            PurchaseOrderStatus.CREATED, Set.of(PurchaseOrderStatus.SENT, PurchaseOrderStatus.CANCELLED),
            PurchaseOrderStatus.SENT, Set.of(PurchaseOrderStatus.ACCEPTED, PurchaseOrderStatus.CANCELLED),
            PurchaseOrderStatus.ACCEPTED, Set.of(PurchaseOrderStatus.SHIPPED, PurchaseOrderStatus.CANCELLED),
            PurchaseOrderStatus.SHIPPED, Set.of(PurchaseOrderStatus.DELIVERED),
            PurchaseOrderStatus.DELIVERED, Set.of(PurchaseOrderStatus.CLOSED),
            PurchaseOrderStatus.CLOSED, Set.of(),
            PurchaseOrderStatus.CANCELLED, Set.of()
    );

    @Override
    @Transactional
    public PurchaseOrderResponseDTO createPurchaseOrder(PurchaseOrderRequestDTO requestDTO) {

        // 1. Fetch the Purchase Request - fail fast if it doesn't exist
        PurchaseRequest purchaseRequest = purchaseRequestRepository.findById(requestDTO.getPurchaseRequestId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "PurchaseRequest not found with id: " + requestDTO.getPurchaseRequestId()));

        // 2. Business rule: PO can only be generated from an APPROVED PR
        if (purchaseRequest.getStatus() != Status.APPROVED) {
            throw new PurchaseRequestNotApprovedException(
                    "Cannot create a Purchase Order: PurchaseRequest with id "
                            + requestDTO.getPurchaseRequestId() + " is not APPROVED");
        }

        // 3. Build the entity from the DTO
        PurchaseOrder po = new PurchaseOrder();
        po.setPurchaseRequest(purchaseRequest);
        po.setPoNumber(generatePoNumber());
        po.setVendorName(requestDTO.getVendorName());
        po.setVendorEmail(requestDTO.getVendorEmail());
        po.setItemName(requestDTO.getItemName());
        po.setQuantity(requestDTO.getQuantity());
        po.setUnitPrice(requestDTO.getUnitPrice());
        po.setTotalAmount(requestDTO.getUnitPrice().multiply(BigDecimal.valueOf(requestDTO.getQuantity())));
        po.setExpectedDeliveryDate(requestDTO.getExpectedDeliveryDate());
        po.setStatus(PurchaseOrderStatus.CREATED);

        PurchaseOrder saved = purchaseOrderRepository.save(po);
        return toResponseDTO(saved);
    }

    @Override
    public List<PurchaseOrderResponseDTO> getAllPurchaseOrders() {
        return purchaseOrderRepository.findAll().stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public PurchaseOrderResponseDTO getPurchaseOrderById(Long id) {
        PurchaseOrder po = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PurchaseOrder not found with id: " + id));
        return toResponseDTO(po);
    }

    @Override
    @Transactional
    public PurchaseOrderResponseDTO updatePurchaseOrder(Long id, PurchaseOrderUpdateDTO updateDTO) {
        PurchaseOrder po = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PurchaseOrder not found with id: " + id));

        if (po.getStatus() == PurchaseOrderStatus.CLOSED || po.getStatus() == PurchaseOrderStatus.CANCELLED) {
            throw new InvalidPurchaseOrderStateException(
                    "Cannot update a PurchaseOrder that is already " + po.getStatus());
        }

        po.setVendorName(updateDTO.getVendorName());
        po.setVendorEmail(updateDTO.getVendorEmail());
        po.setItemName(updateDTO.getItemName());
        po.setQuantity(updateDTO.getQuantity());
        po.setUnitPrice(updateDTO.getUnitPrice());
        po.setTotalAmount(updateDTO.getUnitPrice().multiply(BigDecimal.valueOf(updateDTO.getQuantity())));
        po.setExpectedDeliveryDate(updateDTO.getExpectedDeliveryDate());

        PurchaseOrder updated = purchaseOrderRepository.save(po);
        return toResponseDTO(updated);
    }

    @Override
    @Transactional
    public PurchaseOrderResponseDTO updateStatus(Long id, PurchaseOrderStatusUpdateDTO statusUpdateDTO) {
        PurchaseOrder po = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PurchaseOrder not found with id: " + id));

        PurchaseOrderStatus current = po.getStatus();
        PurchaseOrderStatus target = statusUpdateDTO.getStatus();

        Set<PurchaseOrderStatus> allowedNext = ALLOWED_TRANSITIONS.getOrDefault(current, Set.of());

        if (!allowedNext.contains(target)) {
            throw new InvalidPurchaseOrderStateException(
                    "Invalid status transition from " + current + " to " + target);
        }

        po.setStatus(target);
        PurchaseOrder updated = purchaseOrderRepository.save(po);
        return toResponseDTO(updated);
    }

    @Override
    @Transactional
    public void deletePurchaseOrder(Long id) {
        PurchaseOrder po = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PurchaseOrder not found with id: " + id));

        if (po.getStatus() != PurchaseOrderStatus.CREATED) {
            throw new InvalidPurchaseOrderStateException(
                    "Cannot delete a PurchaseOrder once it has moved past CREATED status. Consider CANCELLED instead.");
        }

        purchaseOrderRepository.delete(po);
    }

    // ---------- HELPERS ----------

    private String generatePoNumber() {
        String year = String.valueOf(Year.now().getValue());
        String uniquePart = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        return "PO-" + year + "-" + uniquePart;
    }

    private PurchaseOrderResponseDTO toResponseDTO(PurchaseOrder po) {
        PurchaseOrderResponseDTO dto = new PurchaseOrderResponseDTO();
        dto.setId(po.getId());
        dto.setPoNumber(po.getPoNumber());
        dto.setPurchaseRequestId(po.getPurchaseRequest().getRequestId());
        dto.setVendorName(po.getVendorName());
        dto.setVendorEmail(po.getVendorEmail());
        dto.setItemName(po.getItemName());
        dto.setQuantity(po.getQuantity());
        dto.setUnitPrice(po.getUnitPrice());
        dto.setTotalAmount(po.getTotalAmount());
        dto.setStatus(po.getStatus());
        dto.setExpectedDeliveryDate(po.getExpectedDeliveryDate());
        dto.setCreatedAt(po.getCreatedAt());
        dto.setUpdatedAt(po.getUpdatedAt());
        return dto;
    }
}
