import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:8080/api/vendor/orders";

const STATUS_API = "http://localhost:8080/api/purchase-orders";

function VendorDashboard() {

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadOrders();
    }, []);

    // ============================================================
    // LOAD ORDERS
    // ============================================================

    const loadOrders = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await axios.get(API);

            console.log("VENDOR ORDERS:", response.data);

            setOrders(response.data || []);

        } catch (error) {

            console.error(
                "Error loading vendor orders:",
                error
            );

            setError(
                error.response?.data ||
                "Unable to load purchase orders"
            );

        } finally {

            setLoading(false);
        }
    };

    // ============================================================
    // UPDATE STATUS
    // ============================================================

    const updateStatus = async (
        id,
        status,
        deliveredQuantity = null
    ) => {

        try {

            const requestBody = {
                status: status
            };

            if (deliveredQuantity !== null) {
                requestBody.deliveredQuantity =
                    deliveredQuantity;
            }

            await axios.patch(
                `${STATUS_API}/${id}/status`,
                requestBody
            );

            alert(
                status === "ACCEPTED"
                    ? "Purchase Order Accepted"
                    : "Purchase Order Marked as Shipped"
            );

            await loadOrders();

        } catch (error) {

            console.error(
                "Status update error:",
                error
            );

            alert(
                typeof error.response?.data === "string"
                    ? error.response.data
                    : JSON.stringify(
                        error.response?.data ||
                        "Unable to update purchase order"
                    )
            );
        }
    };

    // ============================================================
    // STATUS DISPLAY
    // ============================================================

    const getStatusLabel = (status) => {

        switch (status) {

            case "CREATED":
                return "Waiting for Vendor";

            case "SENT":
                return "Waiting for Vendor";

            case "ACCEPTED":
                return "Accepted by Vendor";

            case "SHIPPED":
                return "Shipped by Vendor";

            case "PARTIALLY_DELIVERED":
                return "Partially Delivered";

            case "DELIVERED":
                return "Delivered";

            case "CLOSED":
                return "Closed";

            case "REJECTED":
                return "Rejected";

            case "CANCELLED":
                return "Cancelled";

            default:
                return status;
        }
    };

    // ============================================================
    // STATUS BADGE
    // ============================================================

    const getStatusClass = (status) => {

        switch (status) {

            case "CREATED":
            case "SENT":
                return "bg-warning text-dark";

            case "ACCEPTED":
                return "bg-success";

            case "SHIPPED":
                return "bg-info text-dark";

            case "PARTIALLY_DELIVERED":
                return "bg-primary";

            case "DELIVERED":
            case "CLOSED":
                return "bg-success";

            case "REJECTED":
            case "CANCELLED":
                return "bg-danger";

            default:
                return "bg-secondary";
        }
    };

    // ============================================================
    // NEW PURCHASE ORDERS
    // ============================================================

    const newOrders = orders.filter(
        o =>
            o.status === "CREATED" ||
            o.status === "SENT"
    );

    // ============================================================
    // ACCEPTED ORDERS
    // ============================================================

    const acceptedOrders = orders.filter(
        o => o.status === "ACCEPTED"
    );

    // ============================================================
    // SHIPPED ORDERS
    // ============================================================

    const shippedOrders = orders.filter(
        o =>
            o.status === "SHIPPED" ||
            o.status === "PARTIALLY_DELIVERED"
    );

    // ============================================================
    // COMPLETED ORDERS
    // ============================================================

    const completedOrders = orders.filter(
        o =>
            o.status === "DELIVERED" ||
            o.status === "CLOSED"
    );

    // ============================================================
    // REJECTED ORDERS
    // ============================================================

    const rejectedOrders = orders.filter(
        o =>
            o.status === "REJECTED" ||
            o.status === "CANCELLED"
    );

    // ============================================================
    // RENDER
    // ============================================================

    return (
        <div
            className="container-fluid py-5"
            style={{
                minHeight: "100vh",
                background:
                    "linear-gradient(to right,#eef6ff,#ffffff)"
            }}
        >

            {/* ================================================== */}
            {/* HEADER */}
            {/* ================================================== */}

            <div
                className="container"
            >

                <div
                    className="text-center mb-5"
                    style={{
                        background:
                            "linear-gradient(135deg,#0d6efd,#4dabf7)",
                        color: "white",
                        padding: "30px",
                        borderRadius: "20px"
                    }}
                >

                    <h1>
                        Vendor Dashboard
                    </h1>

                    <p className="mb-0">
                        Manage Purchase Orders and Track Deliveries
                    </p>

                </div>

                {/* ================================================== */}
                {/* LOADING */}
                {/* ================================================== */}

                {loading && (

                    <div className="alert alert-info">
                        Loading purchase orders...
                    </div>

                )}

                {/* ================================================== */}
                {/* ERROR */}
                {/* ================================================== */}

                {error && (

                    <div className="alert alert-danger">

                        <strong>
                            Error:
                        </strong>

                        <div>
                            {error}
                        </div>

                    </div>

                )}

                {/* ================================================== */}
                {/* NEW PURCHASE ORDERS */}
                {/* ================================================== */}

                <div className="mb-5">

                    <h3 className="text-primary mb-3">
                        📦 New Purchase Orders
                    </h3>

                    <p className="text-muted">
                        Purchase orders created by Procurement
                        are shown here. Accept the order to
                        continue the workflow.
                    </p>

                    {newOrders.length === 0 ? (

                        <div
                            className="alert alert-light border"
                        >
                            No new purchase orders waiting
                            for your response.
                        </div>

                    ) : (

                        newOrders.map(order => (

                            <div
                                key={order.id}
                                className="card shadow border-0 mb-4"
                                style={{
                                    borderRadius: "18px"
                                }}
                            >

                                <div className="card-body">

                                    <div
                                        className="d-flex justify-content-between align-items-center"
                                    >

                                        <div>

                                            <h4 className="text-primary mb-1">
                                                {order.poNumber}
                                            </h4>

                                            <small className="text-muted">
                                                New Purchase Order
                                            </small>

                                        </div>

                                        <span
                                            className={`badge ${getStatusClass(order.status)}`}
                                        >
                                            {getStatusLabel(order.status)}
                                        </span>

                                    </div>

                                    <hr />

                                    <div className="row">

                                        <div className="col-md-4 mb-3">

                                            <strong>
                                                Vendor
                                            </strong>

                                            <div>
                                                {order.vendorName}
                                            </div>

                                        </div>

                                        <div className="col-md-4 mb-3">

                                            <strong>
                                                Vendor Email
                                            </strong>

                                            <div>
                                                {order.vendorEmail}
                                            </div>

                                        </div>

                                        <div className="col-md-4 mb-3">

                                            <strong>
                                                Item
                                            </strong>

                                            <div>
                                                {order.itemName}
                                            </div>

                                        </div>

                                        <div className="col-md-4 mb-3">

                                            <strong>
                                                Quantity
                                            </strong>

                                            <div>
                                                {order.quantity}
                                            </div>

                                        </div>

                                        <div className="col-md-4 mb-3">

                                            <strong>
                                                Unit Price
                                            </strong>

                                            <div>
                                                ₹{order.unitPrice}
                                            </div>

                                        </div>

                                        <div className="col-md-4 mb-3">

                                            <strong>
                                                Total Amount
                                            </strong>

                                            <div>
                                                ₹{order.totalAmount}
                                            </div>

                                        </div>

                                        <div className="col-md-4 mb-3">

                                            <strong>
                                                Expected Delivery
                                            </strong>

                                            <div>
                                                {order.expectedDeliveryDate}
                                            </div>

                                        </div>

                                    </div>

                                    <hr />

                                    <div className="mt-3">

                                        <button
                                            className="btn btn-success me-2 px-4"
                                            onClick={() =>
                                                updateStatus(
                                                    order.id,
                                                    "ACCEPTED"
                                                )
                                            }
                                        >
                                            ✔ Accept Purchase Order
                                        </button>

                                        <button
                                            className="btn btn-danger px-4"
                                            onClick={() =>
                                                updateStatus(
                                                    order.id,
                                                    "REJECTED"
                                                )
                                            }
                                        >
                                            ✖ Reject
                                        </button>

                                    </div>

                                </div>

                            </div>

                        ))

                    )}

                </div>

                {/* ================================================== */}
                {/* ACCEPTED ORDERS */}
                {/* ================================================== */}

                <div className="mb-5">

                    <h3 className="text-success mb-3">
                        🤝 Accepted Orders
                    </h3>

                    <p className="text-muted">
                        These purchase orders have been accepted.
                        You can now mark them as shipped.
                    </p>

                    {acceptedOrders.length === 0 ? (

                        <div className="alert alert-light border">
                            No accepted orders waiting to be shipped.
                        </div>

                    ) : (

                        acceptedOrders.map(order => (

                            <div
                                key={order.id}
                                className="card shadow-sm border-success mb-3"
                                style={{
                                    borderRadius: "18px"
                                }}
                            >

                                <div className="card-body">

                                    <div className="row align-items-center">

                                        <div className="col-md-8">

                                            <h5 className="text-success">
                                                {order.poNumber}
                                            </h5>

                                            <p className="mb-1">
                                                <b>Item:</b>{" "}
                                                {order.itemName}
                                            </p>

                                            <p className="mb-1">
                                                <b>Quantity:</b>{" "}
                                                {order.quantity}
                                            </p>

                                            <p className="mb-1">
                                                <b>Total:</b>{" "}
                                                ₹{order.totalAmount}
                                            </p>

                                        </div>

                                        <div className="col-md-4 text-end">

                                            <span
                                                className="badge bg-success mb-3"
                                            >
                                                Accepted by Vendor
                                            </span>

                                            <br />

                                            <button
                                                className="btn btn-primary"
                                                onClick={() =>
                                                    updateStatus(
                                                        order.id,
                                                        "SHIPPED"
                                                    )
                                                }
                                            >
                                                🚚 Mark as Shipped
                                            </button>

                                        </div>

                                    </div>

                                </div>

                            </div>

                        ))

                    )}

                </div>

                {/* ================================================== */}
                {/* SHIPPED ORDERS */}
                {/* ================================================== */}

                <div className="mb-5">

                    <h3 className="text-info mb-3">
                        🚚 Shipped Orders
                    </h3>

                    <p className="text-muted">
                        These orders have been shipped. Procurement
                        will update the delivery status.
                    </p>

                    {shippedOrders.length === 0 ? (

                        <div className="alert alert-light border">
                            No shipped orders.
                        </div>

                    ) : (

                        shippedOrders.map(order => (

                            <div
                                key={order.id}
                                className="card shadow-sm mb-3"
                                style={{
                                    borderRadius: "18px"
                                }}
                            >

                                <div className="card-body">

                                    <div className="row">

                                        <div className="col-md-8">

                                            <h5>
                                                {order.poNumber}
                                            </h5>

                                            <p>
                                                <b>Item:</b>{" "}
                                                {order.itemName}
                                            </p>

                                            <p>
                                                <b>Quantity:</b>{" "}
                                                {order.quantity}
                                            </p>

                                            <p>
                                                <b>Delivered:</b>{" "}
                                                {order.deliveredQuantity || 0}
                                                /
                                                {order.quantity}
                                            </p>

                                        </div>

                                        <div className="col-md-4 text-end">

                                            <span
                                                className={`badge ${getStatusClass(order.status)} fs-6`}
                                            >
                                                {getStatusLabel(
                                                    order.status
                                                )}
                                            </span>

                                            <p className="text-muted mt-3">
                                                Procurement will update
                                                delivery status.
                                            </p>

                                        </div>

                                    </div>

                                </div>

                            </div>

                        ))

                    )}

                </div>

                {/* ================================================== */}
                {/* COMPLETED */}
                {/* ================================================== */}

                <div className="mb-5">

                    <h3 className="text-success mb-3">
                        ✅ Completed Orders
                    </h3>

                    {completedOrders.length === 0 ? (

                        <div className="alert alert-light border">
                            No completed orders.
                        </div>

                    ) : (

                        completedOrders.map(order => (

                            <div
                                key={order.id}
                                className="card border-success shadow-sm mb-3"
                                style={{
                                    borderRadius: "18px"
                                }}
                            >

                                <div className="card-body">

                                    <div className="d-flex justify-content-between">

                                        <div>

                                            <h5>
                                                {order.poNumber}
                                            </h5>

                                            <p>
                                                <b>Item:</b>{" "}
                                                {order.itemName}
                                            </p>

                                            <p>
                                                <b>Total:</b>{" "}
                                                ₹{order.totalAmount}
                                            </p>

                                        </div>

                                        <span
                                            className="badge bg-success align-self-start"
                                        >
                                            {getStatusLabel(
                                                order.status
                                            )}
                                        </span>

                                    </div>

                                </div>

                            </div>

                        ))

                    )}

                </div>

                {/* ================================================== */}
                {/* REJECTED */}
                {/* ================================================== */}

                <div className="mb-5">

                    <h3 className="text-danger mb-3">
                        ❌ Rejected / Cancelled
                    </h3>

                    {rejectedOrders.length === 0 ? (

                        <div className="alert alert-light border">
                            No rejected or cancelled orders.
                        </div>

                    ) : (

                        rejectedOrders.map(order => (

                            <div
                                key={order.id}
                                className="card border-danger mb-3"
                                style={{
                                    borderRadius: "18px"
                                }}
                            >

                                <div className="card-body">

                                    <div className="d-flex justify-content-between">

                                        <div>

                                            <h5>
                                                {order.poNumber}
                                            </h5>

                                            <p>
                                                {order.itemName}
                                            </p>

                                        </div>

                                        <span className="badge bg-danger align-self-start">
                                            {getStatusLabel(
                                                order.status
                                            )}
                                        </span>

                                    </div>

                                </div>

                            </div>

                        ))

                    )}

                </div>

            </div>

        </div>
    );
}

export default VendorDashboard;