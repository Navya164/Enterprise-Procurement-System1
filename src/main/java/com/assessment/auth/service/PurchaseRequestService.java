package com.assessment.auth.service;

import com.assessment.auth.dto.ApprovalDTO;
import com.assessment.auth.dto.PurchaseRequestDTO;
import com.assessment.auth.entity.*;
import com.assessment.auth.repository.PurchaseRequestRepository;
import com.assessment.auth.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class PurchaseRequestService {

    private final PurchaseRequestRepository purchaseRequestRepository;
    private final UserRepository userRepository;


    public PurchaseRequestService(PurchaseRequestRepository purchaseRequestRepository,
                                  UserRepository userRepository) {
        this.purchaseRequestRepository = purchaseRequestRepository;
        this.userRepository = userRepository;
    }


    // Employee creates purchase request
    public PurchaseRequest createRequest(Long employeeId,
                                         PurchaseRequestDTO dto) {


        User employee = userRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));


        // Check maximum 2 active requests
        long activeCount = purchaseRequestRepository.countByEmployeeIdAndStatusIn(
                employeeId,
                List.of(
                        Status.PENDING_MANAGER,
                        Status.PENDING_PROCUREMENT,
                        Status.PROCUREMENT_IN_PROGRESS
                )
        );


        if (activeCount >= 2) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "You already have 2 pending purchase requests. Please wait until one request is approved, rejected, or completed before submitting a new request."
            );
        }


        PurchaseRequest request = new PurchaseRequest();

        request.setEmployee(employee);
        request.setTitle(dto.getTitle());
        request.setDescription(dto.getDescription());
        request.setQuantity(dto.getQuantity());
        request.setCategory(dto.getCategory());
        request.setAmount(dto.getAmount());
        request.setPriority(
                Priority.valueOf(dto.getPriority())
        );



        request.setStatus(Status.PENDING_MANAGER);
        request.setCurrentLevel("MANAGER");

        return purchaseRequestRepository.save(request);
    }

    // Manager Approval
    public PurchaseRequest approveRequest(Long requestId,
                                          ApprovalDTO dto) {


        PurchaseRequest request = purchaseRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException(
                        "Purchase Request not found"
                ));


        if(dto.isApproved()) {


            request.setStatus(Status.PENDING_PROCUREMENT);
            request.setCurrentLevel("PROCUREMENT");


        } else {


            request.setStatus(Status.REJECTED);
            request.setCurrentLevel("REJECTED");

        }


        request.setRemarks(dto.getRemarks());
        request.setApprovalDate(LocalDateTime.now());
        request.setExpiryDate(
                LocalDateTime.now().plusDays(15)
        );


        return purchaseRequestRepository.save(request);
    }




    // Employee Dashboard
    public List<PurchaseRequest> getEmployeeRequests(Long employeeId) {


        User employee = userRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException(
                        "Employee not found"
                ));


        return purchaseRequestRepository.findByEmployee(employee);
    }





    // Manager Dashboard
    public List<PurchaseRequest> getPendingRequests() {

        return purchaseRequestRepository.findByStatus(
                Status.PENDING_MANAGER
        );
    }
  // Procurement Dashboard
   
    public List<PurchaseRequest> getProcurementRequests() {


        List<PurchaseRequest> pending =
                purchaseRequestRepository.findByStatus(
                        Status.PENDING_PROCUREMENT
                );


        List<PurchaseRequest> progress =
                purchaseRequestRepository.findByStatus(
                        Status.PROCUREMENT_IN_PROGRESS
                );


        List<PurchaseRequest> completed =
                purchaseRequestRepository.findByStatus(
                        Status.COMPLETED
                );


        System.out.println("PENDING = " + pending.size());
        System.out.println("PROGRESS = " + progress.size());
        System.out.println("COMPLETED = " + completed.size());


        completed.forEach(r ->
            System.out.println(
                "Completed ID = " + r.getRequestId()
            )
        );


        List<PurchaseRequest> requests = new ArrayList<>();

        requests.addAll(pending);
        requests.addAll(progress);
        requests.addAll(completed);


        return requests;
    }

    // Start Procurement
    public PurchaseRequest startProcurement(Long requestId) {


        PurchaseRequest request = purchaseRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException(
                        "Request not found"
                ));


        request.setStatus(
                Status.PROCUREMENT_IN_PROGRESS
        );

        request.setCurrentLevel(
                "PROCUREMENT"
        );


        return purchaseRequestRepository.save(request);
    }





    // Complete Procurement
    public PurchaseRequest completeProcurement(Long requestId) {


        PurchaseRequest request = purchaseRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException(
                        "Request not found"
                ));


        request.setStatus(
                Status.COMPLETED
        );

        request.setCurrentLevel(
                "COMPLETED"
        );


        return purchaseRequestRepository.save(request);
    }


    // Workflow Tracker
    public PurchaseRequest getRequestById(Long requestId) {


        return purchaseRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException(
                        "Purchase Request not found"
                ));
    }

}