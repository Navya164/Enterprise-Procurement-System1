package com.pms.repository;

import com.pms.entity.PurchaseOrder;
import com.pms.entity.PurchaseOrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
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

    @Query("""
            SELECT COALESCE(SUM(po.totalAmount), 0)
            FROM PurchaseOrder po
            WHERE po.status = :status
            """)
    BigDecimal getTotalSpendByStatus(
            @Param("status") PurchaseOrderStatus status
    );

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

    @Query("""
            SELECT COUNT(po)
            FROM PurchaseOrder po
            """)
    long countAllPurchaseOrders();

    @Query("""
            SELECT COUNT(po)
            FROM PurchaseOrder po
            WHERE po.status = :status
            """)
    long countPurchaseOrdersByStatus(
            @Param("status") PurchaseOrderStatus status
    );


    /*
     * ============================================================
     * DASHBOARD QUERIES (NEW)
     * ============================================================
     */

    /*
     * Counts POs whose status falls in a given group
     * (e.g. IN_PROGRESS = SENT + ACCEPTED + SHIPPED + PARTIALLY_DELIVERED)
     */
    @Query("""
            SELECT COUNT(po)
            FROM PurchaseOrder po
            WHERE po.status IN :statuses
            """)
    long countByStatusIn(
            @Param("statuses") List<PurchaseOrderStatus> statuses
    );

    /*
     * Distinct vendor count across all Purchase Orders.
     */
    @Query("""
            SELECT COUNT(DISTINCT po.vendorName)
            FROM PurchaseOrder po
            """)
    long countDistinctVendors();
}