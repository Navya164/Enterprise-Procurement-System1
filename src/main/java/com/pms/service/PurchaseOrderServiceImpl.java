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

    public PurchaseOrderServiceImpl(
            PurchaseOrderRepository purchaseOrderRepository,
            PurchaseRequestRepository purchaseRequestRepository) {

        this.purchaseOrderRepository = purchaseOrderRepository;
        this.purchaseRequestRepository = purchaseRequestRepository;
    }

    /*
     * ============================================================
     * PURCHASE ORDER STATUS WORKFLOW
     * ============================================================
     *
     * CREATED
     *    ↓
     * SENT
     *    ↓
     * ACCEPTED
     *    ↓
     * SHIPPED
     *    ↓
     * PARTIALLY_DELIVERED
     *    ↓
     * DELIVERED
     *    ↓
     * CLOSED
     *
     * Other possible endings:
     *
     * SENT → REJECTED
     * CREATED → CANCELLED
     * SENT → CANCELLED
     * ACCEPTED → CANCELLED
     *
     */

    private static final Map<PurchaseOrderStatus, Set<PurchaseOrderStatus>> ALLOWED_TRANSITIONS =
            Map.of(

                PurchaseOrderStatus.CREATED,
                Set.of(
                    PurchaseOrderStatus.SENT,
                    PurchaseOrderStatus.CANCELLED
                ),

                PurchaseOrderStatus.SENT,
                Set.of(
                    PurchaseOrderStatus.ACCEPTED,
                    PurchaseOrderStatus.REJECTED,
                    PurchaseOrderStatus.CANCELLED
                ),

                PurchaseOrderStatus.ACCEPTED,
                Set.of(
                    PurchaseOrderStatus.SHIPPED,
                    PurchaseOrderStatus.CANCELLED
                ),

                PurchaseOrderStatus.SHIPPED,
                Set.of(
                    PurchaseOrderStatus.PARTIALLY_DELIVERED,
                    PurchaseOrderStatus.DELIVERED
                ),

                PurchaseOrderStatus.PARTIALLY_DELIVERED,
                Set.of(
                    PurchaseOrderStatus.PARTIALLY_DELIVERED,
                    PurchaseOrderStatus.DELIVERED
                ),

                PurchaseOrderStatus.DELIVERED,
                Set.of(
                    PurchaseOrderStatus.CLOSED
                ),

                PurchaseOrderStatus.CLOSED,
                Set.of(),

                PurchaseOrderStatus.REJECTED,
                Set.of(),

                PurchaseOrderStatus.CANCELLED,
                Set.of()
            );


    // ============================================================
    // CREATE PURCHASE ORDER
    // ============================================================

    @Override
    @Transactional
    public PurchaseOrderResponseDTO createPurchaseOrder(
            PurchaseOrderRequestDTO requestDTO) {

        PurchaseRequest request =
                purchaseRequestRepository.findById(
                        requestDTO.getPurchaseRequestId()
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Purchase Request not found"
                        )
                );

        /*
         * Prevent duplicate PO for the same Purchase Request.
         */
        boolean exists =
                purchaseOrderRepository
                        .existsByPurchaseRequest_RequestId(
                                requestDTO.getPurchaseRequestId()
                        );

        if (exists) {

            throw new InvalidPurchaseOrderStateException(
                    "Purchase Order already exists for this Purchase Request"
            );
        }


        /*
         * Purchase Request must be in procurement progress
         * before Procurement can create a PO.
         */
        if (request.getStatus() != Status.PROCUREMENT_IN_PROGRESS) {

            throw new PurchaseRequestNotApprovedException(
                    "Purchase request is not ready for purchase order generation"
            );
        }


        PurchaseOrder po = new PurchaseOrder();

        po.setPurchaseRequest(request);

        po.setPoNumber(generatePoNumber());

        po.setVendorName(
                requestDTO.getVendorName()
        );

        po.setVendorEmail(
                requestDTO.getVendorEmail()
        );

        po.setItemName(
                requestDTO.getItemName()
        );

        po.setQuantity(
                requestDTO.getQuantity()
        );

        /*
         * No delivery has happened when PO is created.
         */
        po.setDeliveredQuantity(0);

        po.setUnitPrice(
                requestDTO.getUnitPrice()
        );

        po.setTotalAmount(
                requestDTO.getUnitPrice()
                        .multiply(
                                BigDecimal.valueOf(
                                        requestDTO.getQuantity()
                                )
                        )
        );

        po.setExpectedDeliveryDate(
                requestDTO.getExpectedDeliveryDate()
        );


        /*
         * IMPORTANT
         *
         * The PO is immediately sent to the vendor after
         * Procurement creates it.
         *
         * Therefore the initial status is SENT, not CREATED.
         *
         * This allows VendorController to return the PO
         * to the Vendor Dashboard.
         */
        po.setStatus(
                PurchaseOrderStatus.SENT
        );


        PurchaseOrder saved =
                purchaseOrderRepository.save(po);


        return toResponseDTO(saved);
    }


    // ============================================================
    // GET ALL PURCHASE ORDERS
    // ============================================================

    @Override
    public List<PurchaseOrderResponseDTO> getAllPurchaseOrders() {

        return purchaseOrderRepository.findAll()
                .stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }


    // ============================================================
    // GET PURCHASE ORDER BY ID
    // ============================================================

    @Override
    public PurchaseOrderResponseDTO getPurchaseOrderById(Long id) {

        PurchaseOrder po =
                purchaseOrderRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "PO not found"
                                )
                        );

        return toResponseDTO(po);
    }


    // ============================================================
    // UPDATE PURCHASE ORDER
    // ============================================================

    @Override
    @Transactional
    public PurchaseOrderResponseDTO updatePurchaseOrder(
            Long id,
            PurchaseOrderUpdateDTO dto) {

        PurchaseOrder po =
                purchaseOrderRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "PO not found"
                                )
                        );


        /*
         * Update vendor details.
         */
        po.setVendorName(
                dto.getVendorName()
        );

        po.setVendorEmail(
                dto.getVendorEmail()
        );


        /*
         * Update item details.
         */
        po.setItemName(
                dto.getItemName()
        );

        po.setQuantity(
                dto.getQuantity()
        );

        po.setUnitPrice(
                dto.getUnitPrice()
        );


        /*
         * Recalculate total amount.
         */
        po.setTotalAmount(
                dto.getUnitPrice()
                        .multiply(
                                BigDecimal.valueOf(
                                        dto.getQuantity()
                                )
                        )
        );


        /*
         * Update expected delivery date.
         */
        po.setExpectedDeliveryDate(
                dto.getExpectedDeliveryDate()
        );


        return toResponseDTO(
                purchaseOrderRepository.save(po)
        );
    }


    // ============================================================
    // UPDATE PURCHASE ORDER STATUS
    // ============================================================

    @Override
    @Transactional
    public PurchaseOrderResponseDTO updateStatus(
            Long id,
            PurchaseOrderStatusUpdateDTO dto) {

        PurchaseOrder po =
                purchaseOrderRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "PO not found"
                                )
                        );


        PurchaseOrderStatus currentStatus =
                po.getStatus();

        PurchaseOrderStatus targetStatus =
                dto.getStatus();


        /*
         * Make sure target status is not null.
         */
        if (targetStatus == null) {

            throw new InvalidPurchaseOrderStateException(
                    "Purchase Order status cannot be null"
            );
        }


        /*
         * Check whether the requested status change
         * is allowed.
         */
        Set<PurchaseOrderStatus> allowedStatuses =
                ALLOWED_TRANSITIONS
                        .getOrDefault(
                                currentStatus,
                                Set.of()
                        );


        if (!allowedStatuses.contains(targetStatus)) {

            throw new InvalidPurchaseOrderStateException(
                    "Invalid transition "
                            + currentStatus
                            + " -> "
                            + targetStatus
            );
        }


        // ========================================================
        // PARTIALLY DELIVERED
        // ========================================================

        if (targetStatus ==
                PurchaseOrderStatus.PARTIALLY_DELIVERED) {


            /*
             * Procurement must provide the quantity
             * delivered in this shipment.
             */
            if (dto.getDeliveredQuantity() == null) {

                throw new InvalidPurchaseOrderStateException(
                        "Delivered quantity required"
                );
            }


            if (dto.getDeliveredQuantity() <= 0) {

                throw new InvalidPurchaseOrderStateException(
                        "Delivered quantity must be greater than zero"
                );
            }


            int currentDelivered =
                    po.getDeliveredQuantity() == null
                            ? 0
                            : po.getDeliveredQuantity();


            int newDeliveredQuantity =
                    currentDelivered
                            + dto.getDeliveredQuantity();


            /*
             * Delivered quantity cannot exceed
             * ordered quantity.
             */
            if (newDeliveredQuantity > po.getQuantity()) {

                throw new InvalidPurchaseOrderStateException(
                        "Delivered quantity exceeds order quantity"
                );
            }


            /*
             * If the delivered quantity is exactly the
             * order quantity, it should be DELIVERED,
             * not PARTIALLY_DELIVERED.
             */
            if (newDeliveredQuantity == po.getQuantity()) {

                po.setDeliveredQuantity(
                        po.getQuantity()
                );

                po.setStatus(
                        PurchaseOrderStatus.DELIVERED
                );


                PurchaseOrder saved =
                        purchaseOrderRepository.save(po);


                return toResponseDTO(saved);
            }


            /*
             * Otherwise keep it partially delivered.
             */
            po.setDeliveredQuantity(
                    newDeliveredQuantity
            );

            po.setStatus(
                    PurchaseOrderStatus.PARTIALLY_DELIVERED
            );
        }


        // ========================================================
        // DELIVERED
        // ========================================================

        else if (targetStatus ==
                PurchaseOrderStatus.DELIVERED) {

            /*
             * Mark the complete quantity as delivered.
             */
            po.setDeliveredQuantity(
                    po.getQuantity()
            );

            po.setStatus(
                    PurchaseOrderStatus.DELIVERED
            );
        }


        // ========================================================
        // ALL OTHER STATUS CHANGES
        // ========================================================

        else {

            po.setStatus(
                    targetStatus
            );
        }


        // ========================================================
        // VENDOR REJECTS PO
        // ========================================================

        if (targetStatus ==
                PurchaseOrderStatus.REJECTED) {

            PurchaseRequest request =
                    po.getPurchaseRequest();

            /*
             * Send the Purchase Request back to
             * Procurement so it can be handled again.
             */
            request.setStatus(
                    Status.PENDING_PROCUREMENT
            );

            purchaseRequestRepository.save(request);
        }


        // ========================================================
        // PO CLOSED
        // ========================================================

        if (targetStatus ==
                PurchaseOrderStatus.CLOSED) {

            /*
             * Once Procurement closes the PO,
             * the original Purchase Request is completed.
             */
            PurchaseRequest request =
                    po.getPurchaseRequest();

            request.setStatus(
                    Status.COMPLETED
            );

            purchaseRequestRepository.save(request);
        }


        PurchaseOrder updated =
                purchaseOrderRepository.save(po);


        return toResponseDTO(updated);
    }


    // ============================================================
    // DELETE PURCHASE ORDER
    // ============================================================

    @Override
    @Transactional
    public void deletePurchaseOrder(Long id) {

        PurchaseOrder po =
                purchaseOrderRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "PO not found"
                                )
                        );


        purchaseOrderRepository.delete(po);
    }


    // ============================================================
    // GENERATE PO NUMBER
    // ============================================================

    private String generatePoNumber() {

        return "PO-"
                + Year.now().getValue()
                + "-"
                + UUID.randomUUID()
                        .toString()
                        .substring(0, 8)
                        .toUpperCase();
    }


    // ============================================================
    // CONVERT ENTITY -> RESPONSE DTO
    // ============================================================

    private PurchaseOrderResponseDTO toResponseDTO(
            PurchaseOrder po) {

        PurchaseOrderResponseDTO dto =
                new PurchaseOrderResponseDTO();


        dto.setId(
                po.getId()
        );

        dto.setPoNumber(
                po.getPoNumber()
        );

        dto.setPurchaseRequestId(
                po.getPurchaseRequest()
                        .getRequestId()
        );


        dto.setVendorName(
                po.getVendorName()
        );

        dto.setVendorEmail(
                po.getVendorEmail()
        );


        dto.setItemName(
                po.getItemName()
        );

        dto.setQuantity(
                po.getQuantity()
        );


        dto.setDeliveredQuantity(
                po.getDeliveredQuantity()
        );


        dto.setUnitPrice(
                po.getUnitPrice()
        );

        dto.setTotalAmount(
                po.getTotalAmount()
        );


        dto.setStatus(
                po.getStatus()
        );


        dto.setExpectedDeliveryDate(
                po.getExpectedDeliveryDate()
        );


        dto.setCreatedAt(
                po.getCreatedAt()
        );

        dto.setUpdatedAt(
                po.getUpdatedAt()
        );


        return dto;
    }
}