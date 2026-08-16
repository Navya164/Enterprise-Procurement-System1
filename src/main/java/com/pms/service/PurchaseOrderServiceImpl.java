package com.pms.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Year;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.assessment.auth.dto.PurchaseOrderItemResponseDTO;
import com.assessment.auth.dto.PurchaseOrderRequestDTO;
import com.assessment.auth.dto.PurchaseOrderResponseDTO;
import com.assessment.auth.dto.PurchaseOrderStatusUpdateDTO;
import com.assessment.auth.dto.PurchaseOrderUpdateDTO;
import com.assessment.auth.entity.PurchaseRequest;
import com.assessment.auth.entity.Status;
import com.assessment.auth.repository.PurchaseRequestRepository;

import com.pms.entity.PurchaseOrder;
import com.pms.entity.PurchaseOrderItem;
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


    // ============================================================
    // ALLOWED STATUS TRANSITIONS
    // ============================================================

    private static final Map<PurchaseOrderStatus, Set<PurchaseOrderStatus>>
            ALLOWED_TRANSITIONS = Map.of(

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


        // Prevent duplicate PO
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


        // Purchase Request must be ready
        if (request.getStatus() != Status.PROCUREMENT_IN_PROGRESS) {

            throw new PurchaseRequestNotApprovedException(
                    "Purchase request is not ready for purchase order generation"
            );
        }


        // ========================================================
        // CREATE PO
        // ========================================================

        PurchaseOrder po = new PurchaseOrder();

        po.setPurchaseRequest(request);

        po.setPoNumber(generatePoNumber());

        po.setVendorName(
                requestDTO.getVendorName()
        );

        po.setVendorEmail(
                requestDTO.getVendorEmail()
        );


        // ========================================================
        // MULTI ITEM CREATION
        // ========================================================

        if (requestDTO.getItems() == null ||
                requestDTO.getItems().isEmpty()) {

            throw new InvalidPurchaseOrderStateException(
                    "At least one purchase order item is required"
            );
        }


        BigDecimal totalAmount = BigDecimal.ZERO;


        for (var itemDTO : requestDTO.getItems()) {

            PurchaseOrderItem item =
                    new PurchaseOrderItem();


            item.setItemName(
                    itemDTO.getItemName()
            );


            item.setQuantity(
                    itemDTO.getQuantity()
            );


            // No delivery at creation
            item.setDeliveredQuantity(0);


            item.setUnitPrice(
                    itemDTO.getUnitPrice()
            );


            BigDecimal amount =
                    itemDTO.getUnitPrice()
                            .multiply(
                                    BigDecimal.valueOf(
                                            itemDTO.getQuantity()
                                    )
                            );


            item.setAmount(amount);


            // Connect item -> PO
            po.addItem(item);


            totalAmount =
                    totalAmount.add(amount);
        }


        po.setTotalAmount(totalAmount);


        // PO goes directly to vendor
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
    @Transactional(readOnly = true)
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
    @Transactional(readOnly = true)
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


        // ========================================================
        // UPDATE VENDOR
        // ========================================================

        po.setVendorName(
                dto.getVendorName()
        );

        po.setVendorEmail(
                dto.getVendorEmail()
        );


        // ========================================================
        // UPDATE ITEMS
        // ========================================================

        if (dto.getItems() == null ||
                dto.getItems().isEmpty()) {

            throw new InvalidPurchaseOrderStateException(
                    "At least one purchase order item is required"
            );
        }


        po.getItems().clear();


        BigDecimal totalAmount =
                BigDecimal.ZERO;


        for (var itemDTO : dto.getItems()) {

            PurchaseOrderItem item =
                    new PurchaseOrderItem();


            item.setItemName(
                    itemDTO.getItemName()
            );


            item.setQuantity(
                    itemDTO.getQuantity()
            );


            item.setDeliveredQuantity(0);


            item.setUnitPrice(
                    itemDTO.getUnitPrice()
            );


            BigDecimal amount =
                    itemDTO.getUnitPrice()
                            .multiply(
                                    BigDecimal.valueOf(
                                            itemDTO.getQuantity()
                                    )
                            );


            item.setAmount(amount);


            po.addItem(item);


            totalAmount =
                    totalAmount.add(amount);
        }


        po.setTotalAmount(totalAmount);


        // ========================================================
        // EXPECTED DELIVERY DATE
        // ========================================================

        po.setExpectedDeliveryDate(
                dto.getExpectedDeliveryDate()
        );


        PurchaseOrder saved =
                purchaseOrderRepository.save(po);


        return toResponseDTO(saved);
    }


    // ============================================================
    // UPDATE STATUS + ITEM-WISE PARTIAL DELIVERY
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


        if (targetStatus == null) {

            throw new InvalidPurchaseOrderStateException(
                    "Purchase Order status cannot be null"
            );
        }


        // ========================================================
        // CHECK STATUS TRANSITION
        // ========================================================

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


            Map<Long, Integer> deliveredQuantities =
                    dto.getDeliveredQuantities();


            if (deliveredQuantities == null ||
                    deliveredQuantities.isEmpty()) {

                throw new InvalidPurchaseOrderStateException(
                        "Item-wise delivered quantities are required"
                );
            }


            /*
             * Update each item separately.
             *
             * Example:
             *
             * Item 101 -> deliver 5
             * Item 102 -> deliver 10
             */

            for (Map.Entry<Long, Integer> entry :
                    deliveredQuantities.entrySet()) {


                Long itemId =
                        entry.getKey();

                Integer deliveredInThisUpdate =
                        entry.getValue();


                if (deliveredInThisUpdate == null ||
                        deliveredInThisUpdate <= 0) {

                    throw new InvalidPurchaseOrderStateException(
                            "Delivered quantity must be greater than zero for item "
                                    + itemId
                    );
                }


                PurchaseOrderItem item =
                        po.getItems()
                                .stream()
                                .filter(i ->
                                        i.getId()
                                                .equals(itemId)
                                )
                                .findFirst()
                                .orElseThrow(() ->
                                        new InvalidPurchaseOrderStateException(
                                                "Item "
                                                        + itemId
                                                        + " does not belong to this Purchase Order"
                                        )
                                );


                int currentDelivered =
                        item.getDeliveredQuantity() == null
                                ? 0
                                : item.getDeliveredQuantity();


                int newDelivered =
                        currentDelivered
                                + deliveredInThisUpdate;


                // Cannot exceed ordered quantity
                if (newDelivered >
                        item.getQuantity()) {

                    throw new InvalidPurchaseOrderStateException(
                            "Delivered quantity exceeds ordered quantity for item "
                                    + item.getItemName()
                    );
                }


                item.setDeliveredQuantity(
                        newDelivered
                );
            }


            // ====================================================
            // CHECK WHETHER ALL ITEMS ARE COMPLETELY DELIVERED
            // ====================================================

            boolean allDelivered =
                    po.getItems()
                            .stream()
                            .allMatch(item -> {

                                int delivered =
                                        item.getDeliveredQuantity() == null
                                                ? 0
                                                : item.getDeliveredQuantity();

                                return delivered >=
                                        item.getQuantity();
                            });


            if (allDelivered) {

                po.setStatus(
                        PurchaseOrderStatus.DELIVERED
                );

                po.setDeliveryDate(
                        LocalDate.now()
                );

            } else {

                po.setStatus(
                        PurchaseOrderStatus.PARTIALLY_DELIVERED
                );
            }
        }


        // ========================================================
        // DELIVERED
        // ========================================================

        else if (targetStatus ==
                PurchaseOrderStatus.DELIVERED) {


            /*
             * Mark every item as completely delivered.
             */

            for (PurchaseOrderItem item :
                    po.getItems()) {

                item.setDeliveredQuantity(
                        item.getQuantity()
                );
            }


            po.setStatus(
                    PurchaseOrderStatus.DELIVERED
            );


            po.setDeliveryDate(
                    LocalDate.now()
            );
        }


        // ========================================================
        // REJECTED
        // ========================================================

        else if (targetStatus ==
                PurchaseOrderStatus.REJECTED) {

            po.setStatus(
                    PurchaseOrderStatus.REJECTED
            );


            PurchaseRequest request =
                    po.getPurchaseRequest();


            request.setStatus(
                    Status.PENDING_PROCUREMENT
            );


            purchaseRequestRepository.save(
                    request
            );
        }


        // ========================================================
        // CLOSED
        // ========================================================

        else if (targetStatus ==
                PurchaseOrderStatus.CLOSED) {

            po.setStatus(
                    PurchaseOrderStatus.CLOSED
            );


            PurchaseRequest request =
                    po.getPurchaseRequest();


            request.setStatus(
                    Status.COMPLETED
            );


            purchaseRequestRepository.save(
                    request
            );
        }


        // ========================================================
        // OTHER STATUS
        // ========================================================

        else {

            po.setStatus(
                    targetStatus
            );
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
    // ENTITY -> RESPONSE DTO
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


        if (po.getPurchaseRequest() != null) {

            dto.setPurchaseRequestId(
                    po.getPurchaseRequest()
                            .getRequestId()
            );
        }


        dto.setVendorName(
                po.getVendorName()
        );


        dto.setVendorEmail(
                po.getVendorEmail()
        );


        // ========================================================
        // MULTI ITEM RESPONSE
        // ========================================================

        List<PurchaseOrderItemResponseDTO> itemResponses =
                po.getItems()
                        .stream()
                        .map(item -> {

                            PurchaseOrderItemResponseDTO itemDTO =
                                    new PurchaseOrderItemResponseDTO();


                            itemDTO.setId(
                                    item.getId()
                            );


                            itemDTO.setItemName(
                                    item.getItemName()
                            );


                            itemDTO.setQuantity(
                                    item.getQuantity()
                            );


                            itemDTO.setDeliveredQuantity(
                                    item.getDeliveredQuantity()
                            );


                            itemDTO.setUnitPrice(
                                    item.getUnitPrice()
                            );


                            itemDTO.setAmount(
                                    item.getAmount()
                            );


                            return itemDTO;

                        })
                        .collect(
                                Collectors.toList()
                        );


        dto.setItems(
                itemResponses
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


        dto.setDeliveryDate(
                po.getDeliveryDate()
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