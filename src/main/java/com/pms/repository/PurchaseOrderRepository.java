package com.pms.repository;

import com.pms.entity.PurchaseOrder;
import com.pms.entity.PurchaseOrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface PurchaseOrderRepository
        extends JpaRepository<PurchaseOrder, Long> {

    Optional<PurchaseOrder> findByPoNumber(String poNumber);

    List<PurchaseOrder> findByStatus(PurchaseOrderStatus status);

    List<PurchaseOrder> findByPurchaseRequest_RequestId(Long purchaseRequestId);

    boolean existsByPurchaseRequest_RequestId(Long purchaseRequestId);


    /*
     * ============================================================
     * ANALYTICS QUERIES
     * ============================================================
     */


    /*
     * Total procurement spend from completed Purchase Orders only.
     *
     * CLOSED is the completed state in the existing PO lifecycle.
     */
    @Query("""
            SELECT COALESCE(SUM(po.totalAmount), 0)
            FROM PurchaseOrder po
            WHERE po.status = :status
            """)
    BigDecimal getTotalSpendByStatus(
            @Param("status") PurchaseOrderStatus status
    );


    /*
     * Vendor-wise procurement spend.
     */
    @Query("""
            SELECT po.vendorName, COALESCE(SUM(po.totalAmount), 0)
            FROM PurchaseOrder po
            WHERE po.status = :status
            GROUP BY po.vendorName
            ORDER BY SUM(po.totalAmount) DESC
            """)
    List<Object[]> getVendorWiseSpend(
            @Param("status") PurchaseOrderStatus status
    );


    /*
     * Category-wise procurement spend.
     *
     * Category belongs to PurchaseRequest, which is related
     * to PurchaseOrder through po.purchaseRequest.
     */
    @Query("""
            SELECT po.purchaseRequest.category,
                   COALESCE(SUM(po.totalAmount), 0)
            FROM PurchaseOrder po
            WHERE po.status = :status
            GROUP BY po.purchaseRequest.category
            ORDER BY SUM(po.totalAmount) DESC
            """)
    List<Object[]> getCategoryWiseSpend(
            @Param("status") PurchaseOrderStatus status
    );


    /*
     * Monthly procurement spend from completed Purchase Orders.
     *
     * YEAR and MONTH are used so that data from different years
     * does not get mixed together.
     */
    @Query("""
            SELECT YEAR(po.createdAt),
                   MONTH(po.createdAt),
                   COALESCE(SUM(po.totalAmount), 0)
            FROM PurchaseOrder po
            WHERE po.status = :status
            GROUP BY YEAR(po.createdAt), MONTH(po.createdAt)
            ORDER BY YEAR(po.createdAt), MONTH(po.createdAt)
            """)
    List<Object[]> getMonthlySpend(
            @Param("status") PurchaseOrderStatus status
    );


    /*
     * Total number of Purchase Orders.
     */
    @Query("""
            SELECT COUNT(po)
            FROM PurchaseOrder po
            """)
    long countAllPurchaseOrders();


    /*
     * Count Purchase Orders by status.
     */
    @Query("""
            SELECT COUNT(po)
            FROM PurchaseOrder po
            WHERE po.status = :status
            """)
    long countPurchaseOrdersByStatus(
            @Param("status") PurchaseOrderStatus status
    );
}