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
                PurchaseOrderStatus.DELIVERED
            ),

            PurchaseOrderStatus.DELIVERED,
            Set.of(
                PurchaseOrderStatus.CLOSED
            ),

            PurchaseOrderStatus.CLOSED,
            Set.of(),

            PurchaseOrderStatus.CANCELLED,
            Set.of()
    );



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
                    "Purchase Request not found")
                );
        
     // Prevent duplicate Purchase Orders for same Purchase Request
        if (purchaseOrderRepository
                .existsByPurchaseRequest_RequestId(
                        requestDTO.getPurchaseRequestId())) {

            throw new InvalidPurchaseOrderStateException(
                    "Purchase Order already exists for this Purchase Request"
            );
        }



        if(request.getStatus()!=Status.PENDING_PROCUREMENT){

            throw new PurchaseRequestNotApprovedException(
            		"Purchase Order already exists or procurement is already in progress"
            );
        }



        PurchaseOrder po = new PurchaseOrder();


        po.setPurchaseRequest(request);

        po.setPoNumber(generatePoNumber());

        po.setVendorName(requestDTO.getVendorName());

        po.setVendorEmail(requestDTO.getVendorEmail());

        po.setItemName(requestDTO.getItemName());

        po.setQuantity(requestDTO.getQuantity());

        po.setDeliveredQuantity(0);

        po.setUnitPrice(requestDTO.getUnitPrice());


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


        po.setStatus(
                PurchaseOrderStatus.CREATED
        );

        PurchaseOrder saved =
                purchaseOrderRepository.save(po);

        // Move the Purchase Request to Procurement In Progress
        request.setStatus(Status.PROCUREMENT_IN_PROGRESS);
        purchaseRequestRepository.save(request);

        return toResponseDTO(saved);

    }
   @Override
    public List<PurchaseOrderResponseDTO> getAllPurchaseOrders(){

        return purchaseOrderRepository.findAll()
                .stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());

    }

    @Override
    public PurchaseOrderResponseDTO getPurchaseOrderById(Long id){


        PurchaseOrder po =
                purchaseOrderRepository.findById(id)
                .orElseThrow(() ->
                    new ResourceNotFoundException(
                    "PO not found")
                );


        return toResponseDTO(po);

    }
  @Override
    @Transactional
    public PurchaseOrderResponseDTO updatePurchaseOrder(
            Long id,
            PurchaseOrderUpdateDTO dto){


        PurchaseOrder po =
                purchaseOrderRepository.findById(id)
                .orElseThrow(() ->
                    new ResourceNotFoundException(
                    "PO not found")
                );

        po.setVendorName(dto.getVendorName());
        po.setVendorEmail(dto.getVendorEmail());
        po.setItemName(dto.getItemName());
        po.setQuantity(dto.getQuantity());
        po.setUnitPrice(dto.getUnitPrice());

        po.setTotalAmount(
                dto.getUnitPrice()
                .multiply(
                    BigDecimal.valueOf(
                        dto.getQuantity()
                    )
                )
        );


        po.setExpectedDeliveryDate(
                dto.getExpectedDeliveryDate()
        );


        return toResponseDTO(
                purchaseOrderRepository.save(po)
        );

    }

    @Override
    @Transactional
    public PurchaseOrderResponseDTO updateStatus(
            Long id,
            PurchaseOrderStatusUpdateDTO dto){



        PurchaseOrder po =
                purchaseOrderRepository.findById(id)
                .orElseThrow(() ->
                    new ResourceNotFoundException(
                    "PO not found")
                );

        PurchaseOrderStatus current =
                po.getStatus();


        PurchaseOrderStatus target =
                dto.getStatus();

        if(!ALLOWED_TRANSITIONS
                .getOrDefault(current,Set.of())
                .contains(target)){


            throw new InvalidPurchaseOrderStateException(
                    "Invalid transition "
                    + current+" -> "+target
            );

        }

        if(target ==
            PurchaseOrderStatus.PARTIALLY_DELIVERED){


            if(dto.getDeliveredQuantity()==null){

                throw new InvalidPurchaseOrderStateException(
                "Delivered quantity required");

            }

            int delivered =
                    po.getDeliveredQuantity()
                    +
                    dto.getDeliveredQuantity();



            if(delivered > po.getQuantity()){

                throw new InvalidPurchaseOrderStateException(
                "Delivered quantity exceeds order");

            }


            po.setDeliveredQuantity(delivered);

        }

        if(target == PurchaseOrderStatus.DELIVERED){

            po.setDeliveredQuantity(po.getQuantity());

            po.setStatus(PurchaseOrderStatus.CLOSED);

            return toResponseDTO(
                    purchaseOrderRepository.save(po)
            );
        }



        po.setStatus(target);
        PurchaseOrder updated =
                purchaseOrderRepository.save(po);


        // If PO is closed, complete the Purchase Request
        if(target == PurchaseOrderStatus.CLOSED){

            PurchaseRequest request =
                    po.getPurchaseRequest();

            request.setStatus(Status.COMPLETED);

            purchaseRequestRepository.save(request);
        }


        return toResponseDTO(updated);
        

    }

    @Override
    @Transactional
    public void deletePurchaseOrder(Long id){


        PurchaseOrder po =
                purchaseOrderRepository.findById(id)
                .orElseThrow(() ->
                new ResourceNotFoundException(
                "PO not found")
                );


        purchaseOrderRepository.delete(po);

    }

    private String generatePoNumber(){


        return "PO-"
                +Year.now().getValue()
                +"-"
                +UUID.randomUUID()
                .toString()
                .substring(0,8)
                .toUpperCase();

    }


    private PurchaseOrderResponseDTO toResponseDTO(
            PurchaseOrder po){


        PurchaseOrderResponseDTO dto =
                new PurchaseOrderResponseDTO();


        dto.setId(po.getId());

        dto.setPoNumber(po.getPoNumber());

        dto.setPurchaseRequestId(
                po.getPurchaseRequest()
                .getRequestId()
        );


        dto.setVendorName(po.getVendorName());

        dto.setVendorEmail(po.getVendorEmail());

        dto.setItemName(po.getItemName());

        dto.setQuantity(po.getQuantity());

        dto.setDeliveredQuantity(
                po.getDeliveredQuantity()
        );

        dto.setUnitPrice(po.getUnitPrice());

        dto.setTotalAmount(po.getTotalAmount());

        dto.setStatus(po.getStatus());

        dto.setExpectedDeliveryDate(
                po.getExpectedDeliveryDate()
        );

        dto.setCreatedAt(po.getCreatedAt());

        dto.setUpdatedAt(po.getUpdatedAt());


        return dto;

    }


}