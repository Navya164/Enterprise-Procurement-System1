# Purchase Order Management Module

This is a complete, standalone-runnable Spring Boot module for **Purchase Order
Management**, built to plug into your existing Enterprise Procurement System
(`PurchaseManagementSystem`, package `com`, DB `purchase_management`, port `8080`).

## ⚠️ Before you run this — 2 things to check

Your project already has a **Purchase Request module**. This zip includes
**PLACEHOLDER** versions of:
- `com.entity.PurchaseRequest`
- `com.entity.PurchaseRequestStatus`
- `com.repository.PurchaseRequestRepository`

They are clearly marked `PLACEHOLDER` in a comment at the top of each file.

**If you already have real versions of these files in your project:**
1. **Delete** the placeholder files listed above from this zip before copying it in.
2. Copy in only: `PurchaseOrder.java`, `PurchaseOrderStatus.java`, the `dto/`
   folder, `exception/` folder, `repository/PurchaseOrderRepository.java`,
   `service/` folder, `controller/PurchaseOrderController.java`.
3. Open `PurchaseOrderServiceImpl.java` and make sure these two lines match
   your real `PurchaseRequest` entity:
   ```java
   import com.entity.PurchaseRequestStatus;
   ...
   if (purchaseRequest.getStatus() != PurchaseRequestStatus.APPROVED) {
   ```
   If your enum/field names differ (e.g. `getApprovalStatus()`, or the value
   is `ApprovalStatus.APPROVED` instead of `PurchaseRequestStatus.APPROVED`),
   update this line accordingly.

**If you don't have a Purchase Request module yet**, just use the placeholder
files as-is — they're a minimal working version so you can test end-to-end.

## Folder structure

```
src/main/java/com/
├── PurchaseManagementSystemApplication.java   (main class)
├── entity/
│   ├── PurchaseOrder.java
│   ├── PurchaseOrderStatus.java
│   ├── PurchaseRequest.java            (placeholder - see above)
│   └── PurchaseRequestStatus.java      (placeholder - see above)
├── dto/
│   ├── PurchaseOrderRequestDTO.java
│   ├── PurchaseOrderUpdateDTO.java
│   ├── PurchaseOrderStatusUpdateDTO.java
│   └── PurchaseOrderResponseDTO.java
├── repository/
│   ├── PurchaseOrderRepository.java
│   └── PurchaseRequestRepository.java  (placeholder - see above)
├── service/
│   ├── PurchaseOrderService.java
│   └── impl/PurchaseOrderServiceImpl.java
├── controller/
│   └── PurchaseOrderController.java
└── exception/
    ├── ResourceNotFoundException.java
    ├── InvalidPurchaseOrderStateException.java
    ├── PurchaseRequestNotApprovedException.java
    ├── ErrorResponse.java
    └── GlobalExceptionHandler.java

src/main/resources/application.properties
pom.xml
```

## Setup

1. Create the database (if not already created):
   ```sql
   CREATE DATABASE IF NOT EXISTS purchase_management;
   ```
2. `application.properties` is already configured to match your working setup
   (`localhost:3306/purchase_management`, user `root`, password `3333`, port `8080`).
   Update the password if it changes.
3. Build and run:
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```
4. `spring.jpa.hibernate.ddl-auto=update` will auto-create the `purchase_orders`
   table (and `purchase_requests` if using the placeholder) on startup.

## API Reference — Test with Postman

Base URL: `http://localhost:8080/api/purchase-orders`

### 1. Create a Purchase Request first (only needed if using placeholder PR module)
Since there's no PR controller in this zip, insert one directly in MySQL to get an APPROVED PR to test against:
```sql
INSERT INTO purchase_requests (requested_item, requested_by, status, created_at)
VALUES ('Dell Laptop', 'John Doe', 'APPROVED', NOW());
```
Note the generated `id` (e.g. `1`) — you'll use it as `purchaseRequestId` below.

### 2. Create Purchase Order
`POST http://localhost:8080/api/purchase-orders`

Request body:
```json
{
  "purchaseRequestId": 1,
  "vendorName": "Tech Supplies Pvt Ltd",
  "vendorEmail": "sales@techsupplies.com",
  "itemName": "Dell Laptop",
  "quantity": 10,
  "unitPrice": 55000.00,
  "expectedDeliveryDate": "2026-09-15"
}
```

Expected response — `201 Created`:
```json
{
  "id": 1,
  "poNumber": "PO-2026-4F3A9C21",
  "purchaseRequestId": 1,
  "vendorName": "Tech Supplies Pvt Ltd",
  "vendorEmail": "sales@techsupplies.com",
  "itemName": "Dell Laptop",
  "quantity": 10,
  "unitPrice": 55000.00,
  "totalAmount": 550000.00,
  "status": "CREATED",
  "expectedDeliveryDate": "2026-09-15",
  "createdAt": "2026-07-31T10:15:30",
  "updatedAt": "2026-07-31T10:15:30"
}
```

**Error case** — if `purchaseRequestId` refers to a PR that is not APPROVED,
you'll get `400 Bad Request`:
```json
{
  "timestamp": "2026-07-31T10:16:00",
  "status": 400,
  "error": "Purchase Request Not Approved",
  "messages": ["Cannot create a Purchase Order: PurchaseRequest with id 1 is not APPROVED"],
  "path": "uri=/api/purchase-orders"
}
```

### 3. Get All Purchase Orders
`GET http://localhost:8080/api/purchase-orders`
→ `200 OK`, returns a JSON array of PO objects (same shape as above).

### 4. Get Purchase Order by ID
`GET http://localhost:8080/api/purchase-orders/1`
→ `200 OK` with the PO, or `404 Not Found` if it doesn't exist:
```json
{
  "status": 404,
  "error": "Not Found",
  "messages": ["PurchaseOrder not found with id: 99"]
}
```

### 5. Update Purchase Order details
`PUT http://localhost:8080/api/purchase-orders/1`
```json
{
  "vendorName": "Tech Supplies Pvt Ltd",
  "vendorEmail": "newcontact@techsupplies.com",
  "itemName": "Dell Laptop (Updated Spec)",
  "quantity": 12,
  "unitPrice": 54000.00,
  "expectedDeliveryDate": "2026-09-20"
}
```
→ `200 OK` with updated PO (totalAmount recalculated automatically).

### 6. Update Purchase Order status (lifecycle transition)
`PATCH http://localhost:8080/api/purchase-orders/1/status`
```json
{ "status": "SENT" }
```
→ `200 OK`. Valid transitions:
`CREATED → SENT/CANCELLED`, `SENT → ACCEPTED/CANCELLED`,
`ACCEPTED → SHIPPED/CANCELLED`, `SHIPPED → DELIVERED`, `DELIVERED → CLOSED`.

Invalid transition (e.g. `CREATED → DELIVERED`) → `409 Conflict`:
```json
{
  "status": 409,
  "error": "Invalid State Transition",
  "messages": ["Invalid status transition from CREATED to DELIVERED"]
}
```

### 7. Delete Purchase Order
`DELETE http://localhost:8080/api/purchase-orders/1`
→ `204 No Content` if status is still `CREATED`.
→ `409 Conflict` if the PO has moved past `CREATED` (use CANCELLED status instead).

## Verify in MySQL

```sql
USE purchase_management;
SELECT * FROM purchase_orders;
SELECT * FROM purchase_requests;
```
Check that `purchase_request_id` in `purchase_orders` matches the `id` in
`purchase_requests`, and that `total_amount = quantity * unit_price`.

## How this integrates with the Purchase Request module

- `PurchaseOrder` has a `@ManyToOne` relationship to `PurchaseRequest` via the
  `purchase_request_id` foreign key column.
- A PO can only be created when the referenced PR's status is `APPROVED` —
  enforced in `PurchaseOrderServiceImpl.createPurchaseOrder()`.
- The PR module doesn't need to know about POs at all (one-directional
  dependency), which keeps the two modules loosely coupled — the PR team can
  change PR-internal logic without breaking PO code, as long as the `id` and
  `status` fields stay the same shape.

## Clean architecture notes

- **Controller** → only handles HTTP concerns (status codes, request/response mapping).
- **Service** → all business rules (approval check, lifecycle transitions, totals calculation).
- **Repository** → pure data access, no business logic.
- **DTOs** → decouple the public API contract from internal entity structure.
- **GlobalExceptionHandler** → centralizes error formatting so no controller
  method needs try/catch blocks.
