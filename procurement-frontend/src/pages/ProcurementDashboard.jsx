import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:8080/api/purchase";
const PURCHASE_ORDER_API = "http://localhost:8080/api/purchase-orders";

function ProcurementDashboard() {

    const navigate = useNavigate();

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [poData, setPoData] = useState({});
    const [deliveryData, setDeliveryData] = useState({});

    // UI-only navigation state. Does not touch any backend call, workflow, or data.
    const [activeTab, setActiveTab] = useState("dashboard");

    useEffect(() => {
        loadRequests();
        loadPurchaseOrders();
    }, []);

    const loadRequests = async () => {

        try {

            const response = await axios.get(
                `${API}/procurement`
            );

            setRequests(response.data);

        } catch (error) {

            console.error(error);
            alert("Unable to load procurement requests.");

        }

    };

    const loadPurchaseOrders = async () => {

        try {

            const response = await axios.get(PURCHASE_ORDER_API);

            setPurchaseOrders(response.data);

        } catch (error) {

            console.error(error);

        }

    };

    const generatePurchaseOrder = async (request) => {

        try {

            setLoading(true);

            const data = poData[request.requestId];

            await axios.post(PURCHASE_ORDER_API, {

                purchaseRequestId: request.requestId,
                vendorName: data.vendorName,
                vendorEmail: data.vendorEmail,
                itemName: request.title,
                quantity: request.quantity,
                unitPrice: Number(data.unitPrice),
                expectedDeliveryDate: data.expectedDeliveryDate

            });

            await loadRequests();
            await loadPurchaseOrders();

            alert("Purchase Order Generated Successfully!");

        } catch (error) {

            console.error(error);

            alert(
                error.response?.data?.messages?.join("\n") ||
                "Unable to generate Purchase Order."
            );

        } finally {

            setLoading(false);

        }

    };

    const updateStatus = async (id, status, deliveredQuantity = null) => {

        try {

            const body = {
                status: status
            };

            if (deliveredQuantity !== null) {
                body.deliveredQuantity = deliveredQuantity;
            }

            await axios.patch(
                `${PURCHASE_ORDER_API}/${id}/status`,
                body
            );

            await loadPurchaseOrders();
            await loadRequests();

            alert("Status Updated Successfully");

        } catch (error) {

            console.error(error);

            alert(
                error.response?.data?.messages?.join("\n") ||
                error.response?.data?.message ||
                error.message
            );

        }

    };

    const completeProcurement = async (requestId) => {

        try {

            setLoading(true);

            await axios.put(
                `${API}/procurement/complete/${requestId}`
            );

            alert("Procurement Completed Successfully!");

            loadRequests();

        } catch (error) {

            console.error(error);
            alert("Unable to complete procurement.");

        } finally {

            setLoading(false);

        }

    };

    const getPriorityBadge = (priority) => {

        switch (priority) {

            case "LOW":
                return "secondary";

            case "MEDIUM":
                return "primary";

            case "HIGH":
                return "warning";

            case "EMERGENCY":
                return "danger";

            default:
                return "dark";

        }

    };

    const getStatusBadge = (status) => {

        switch (status) {

            case "PENDING_PROCUREMENT":
                return "warning";

            case "PROCUREMENT_IN_PROGRESS":
                return "info";

            case "COMPLETED":
                return "success";

            default:
                return "secondary";

        }

    };

    // Purely cosmetic helper for Purchase Order status badges / progress fill color.
    // Reads existing po.status values only — introduces no new status, no new logic.
    const getPoStatusColor = (status) => {

        switch (status) {

            case "CREATED":
                return "secondary";

            case "SENT":
                return "primary";

            case "ACCEPTED":
                return "info";

            case "SHIPPED":
                return "warning";

            case "PARTIALLY_DELIVERED":
                return "warning";

            case "DELIVERED":
                return "success";

            case "CLOSED":
                return "success";

            default:
                return "secondary";

        }

    };

    const getPoProgress = (status) => {

        switch (status) {

            case "CREATED":
                return 10;

            case "SENT":
                return 25;

            case "ACCEPTED":
                return 45;

            case "SHIPPED":
                return 65;

            case "PARTIALLY_DELIVERED":
                return 80;

            case "DELIVERED":
                return 95;

            case "CLOSED":
                return 100;

            case "CANCELLED":
                return 100;

            default:
                return 0;
        }

    };

    const pendingCount = requests.filter(
        r => r.status === "PENDING_PROCUREMENT"
    ).length;

    const progressCount = requests.filter(
        r => r.status === "PROCUREMENT_IN_PROGRESS"
    ).length;

    const completedCount = requests.filter(
        r => r.status === "COMPLETED"
    ).length;

    // Display-only groupings used to organize the same `requests` array into
    // separate views (Active vs History). No data is fetched, changed, or discarded.
    const activeRequests = requests.filter(
        r => r.status !== "COMPLETED"
    );

    const completedRequests = requests.filter(
        r => r.status === "COMPLETED"
    );

    const cardShadow = "0 10px 28px rgba(15,23,42,.07)";
    const cardRadius = "18px";

    const todayLabel = new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    });

    const navItems = [
        { key: "dashboard", label: "Dashboard", icon: "🏠" },
        { key: "requests", label: "Procurement Requests", icon: "📋", count: activeRequests.length },
        { key: "orders", label: "Purchase Orders", icon: "🧾", count: purchaseOrders.length },
        { key: "history", label: "Procurement History", icon: "🗂️", count: completedRequests.length }
    ];

    return (
        <>
            <div
                className="container-fluid py-4 px-3 px-md-4"
                style={{
                    minHeight: "100vh",
                    background: "linear-gradient(135deg,#eef5ff 0%,#f8fbff 50%,#ffffff 100%)"
                }}
            >
                <div className="container" style={{ maxWidth: "1240px" }}>

                    {/* Hero header - matches Employee / Manager dashboard theme */}
                    <div
                        className="mb-4"
                        style={{
                            borderRadius: "24px",
                            background: "linear-gradient(135deg,#0d6efd,#2563eb,#60a5fa)",
                            color: "white",
                            boxShadow: "0 20px 45px rgba(13,110,253,.25)"
                        }}
                    >
                        <div className="row align-items-center gy-3 p-4 p-lg-5">

                            <div className="col-lg-8">
                                <div
                                    style={{
                                        letterSpacing: "2px",
                                        opacity: .8,
                                        fontSize: "13px",
                                        fontWeight: "600"
                                    }}
                                >
                                    ENTERPRISE PROCUREMENT SYSTEM
                                </div>

                                <h1 className="fw-bold mt-2 mb-0" style={{ fontSize: "clamp(1.5rem,3vw,2.25rem)" }}>
                                    Welcome, Procurement Officer
                                </h1>

                                <p
                                    className="mt-3 mb-0"
                                    style={{
                                        opacity: .9,
                                        maxWidth: "650px",
                                        fontSize: "15px"
                                    }}
                                >
                                    {todayLabel} — track requests, manage vendors, and keep purchase orders moving.
                                </p>
                            </div>

                            <div className="col-lg-4 text-lg-end">
                                <button
                                    className="btn btn-light"
                                    style={{
                                        borderRadius: "50px",
                                        padding: "10px 30px",
                                        fontWeight: "600"
                                    }}
                                    onClick={() => navigate("/")}
                                >
                                    Logout
                                </button>
                            </div>

                        </div>
                    </div>

                    {/* Primary navigation between dashboard sections */}
                    <div
                        className="d-flex gap-2 mb-4 flex-wrap"
                        style={{
                            background: "#ffffff",
                            borderRadius: "16px",
                            padding: "8px",
                            boxShadow: cardShadow
                        }}
                    >
                        {navItems.map(item => (
                            <button
                                key={item.key}
                                className={`btn ${activeTab === item.key ? "btn-primary" : "btn-light"}`}
                                style={{
                                    borderRadius: "12px",
                                    fontWeight: "600",
                                    padding: "10px 20px",
                                    border: "none",
                                    fontSize: "14px"
                                }}
                                onClick={() => setActiveTab(item.key)}
                            >
                                <span className="me-2">{item.icon}</span>
                                {item.label}
                                {typeof item.count === "number" && (
                                    <span
                                        className={`badge rounded-pill ms-2 ${activeTab === item.key ? "bg-light text-primary" : "bg-secondary-subtle text-secondary"}`}
                                    >
                                        {item.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* ==================== DASHBOARD (LANDING) VIEW ==================== */}
                    {activeTab === "dashboard" && (

                        <div>

                            <h5 className="fw-bold text-muted mb-3" style={{ letterSpacing: "0.5px" }}>
                                Today's Summary
                            </h5>

                            <div className="row g-3 g-md-4 mb-4">

                                <div className="col-6 col-md-3">
                                    <div
                                        className="card border-0 h-100"
                                        style={{ borderRadius: cardRadius, boxShadow: cardShadow, cursor: "pointer" }}
                                        onClick={() => setActiveTab("requests")}
                                    >
                                        <div className="card-body d-flex align-items-center justify-content-between p-3 p-md-4">
                                            <div>
                                                <small className="text-muted fw-bold" style={{ letterSpacing: "1px", fontSize: "12px" }}>
                                                    PENDING
                                                </small>
                                                <h2 className="fw-bold text-warning mb-0 mt-1">
                                                    {pendingCount}
                                                </h2>
                                            </div>
                                            <div
                                                className="d-none d-sm-flex align-items-center justify-content-center"
                                                style={{ width: "48px", height: "48px", borderRadius: "14px", background: "rgba(255,193,7,.15)", fontSize: "22px" }}
                                            >
                                                ⏳
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-6 col-md-3">
                                    <div
                                        className="card border-0 h-100"
                                        style={{ borderRadius: cardRadius, boxShadow: cardShadow, cursor: "pointer" }}
                                        onClick={() => setActiveTab("requests")}
                                    >
                                        <div className="card-body d-flex align-items-center justify-content-between p-3 p-md-4">
                                            <div>
                                                <small className="text-muted fw-bold" style={{ letterSpacing: "1px", fontSize: "12px" }}>
                                                    IN PROGRESS
                                                </small>
                                                <h2 className="fw-bold text-info mb-0 mt-1">
                                                    {progressCount}
                                                </h2>
                                            </div>
                                            <div
                                                className="d-none d-sm-flex align-items-center justify-content-center"
                                                style={{ width: "48px", height: "48px", borderRadius: "14px", background: "rgba(13,202,240,.15)", fontSize: "22px" }}
                                            >
                                                🔄
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-6 col-md-3">
                                    <div
                                        className="card border-0 h-100"
                                        style={{ borderRadius: cardRadius, boxShadow: cardShadow, cursor: "pointer" }}
                                        onClick={() => setActiveTab("history")}
                                    >
                                        <div className="card-body d-flex align-items-center justify-content-between p-3 p-md-4">
                                            <div>
                                                <small className="text-muted fw-bold" style={{ letterSpacing: "1px", fontSize: "12px" }}>
                                                    COMPLETED
                                                </small>
                                                <h2 className="fw-bold text-success mb-0 mt-1">
                                                    {completedCount}
                                                </h2>
                                            </div>
                                            <div
                                                className="d-none d-sm-flex align-items-center justify-content-center"
                                                style={{ width: "48px", height: "48px", borderRadius: "14px", background: "rgba(25,135,84,.15)", fontSize: "22px" }}
                                            >
                                                ✅
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-6 col-md-3">
                                    <div
                                        className="card border-0 h-100"
                                        style={{ borderRadius: cardRadius, boxShadow: cardShadow, cursor: "pointer" }}
                                        onClick={() => setActiveTab("orders")}
                                    >
                                        <div className="card-body d-flex align-items-center justify-content-between p-3 p-md-4">
                                            <div>
                                                <small className="text-muted fw-bold" style={{ letterSpacing: "1px", fontSize: "12px" }}>
                                                    PURCHASE ORDERS
                                                </small>
                                                <h2 className="fw-bold text-primary mb-0 mt-1">
                                                    {purchaseOrders.length}
                                                </h2>
                                            </div>
                                            <div
                                                className="d-none d-sm-flex align-items-center justify-content-center"
                                                style={{ width: "48px", height: "48px", borderRadius: "14px", background: "rgba(13,110,253,.12)", fontSize: "22px" }}
                                            >
                                                🧾
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>

                            <div className="row g-3 g-md-4">

                                <div className="col-12 col-lg-6">
                                    <div
                                        className="card border-0 h-100"
                                        style={{ borderRadius: "20px", boxShadow: cardShadow }}
                                    >
                                        <div className="card-body p-4">
                                            <h5 className="fw-bold mb-2">📋 Procurement Requests</h5>
                                            <p className="text-muted mb-3" style={{ fontSize: "14px" }}>
                                                {activeRequests.length === 0
                                                    ? "No active procurement requests right now."
                                                    : `${activeRequests.length} active request(s) awaiting action.`}
                                            </p>
                                            <button
                                                className="btn btn-outline-primary btn-sm"
                                                style={{ borderRadius: "50px", padding: "8px 20px", fontWeight: "600" }}
                                                onClick={() => setActiveTab("requests")}
                                            >
                                                Go to Requests →
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-12 col-lg-6">
                                    <div
                                        className="card border-0 h-100"
                                        style={{ borderRadius: "20px", boxShadow: cardShadow }}
                                    >
                                        <div className="card-body p-4">
                                            <h5 className="fw-bold mb-2">🧾 Purchase Orders</h5>
                                            <p className="text-muted mb-3" style={{ fontSize: "14px" }}>
                                                {purchaseOrders.length === 0
                                                    ? "No purchase orders have been generated yet."
                                                    : `${purchaseOrders.length} purchase order(s) in the pipeline.`}
                                            </p>
                                            <button
                                                className="btn btn-outline-primary btn-sm"
                                                style={{ borderRadius: "50px", padding: "8px 20px", fontWeight: "600" }}
                                                onClick={() => setActiveTab("orders")}
                                            >
                                                Go to Purchase Orders →
                                            </button>
                                        </div>
                                    </div>
                                </div>

                            </div>

                        </div>

                    )}

                    {/* ==================== PROCUREMENT REQUESTS VIEW ==================== */}
                    {activeTab === "requests" && (

                        <div
                            className="card border-0 mb-4"
                            style={{ borderRadius: "22px", boxShadow: "0 18px 40px rgba(0,0,0,.08)" }}
                        >
                            <div
                                className="card-header border-0"
                                style={{
                                    background: "linear-gradient(90deg,#111827,#1f2937)",
                                    color: "white",
                                    borderTopLeftRadius: "22px",
                                    borderTopRightRadius: "22px",
                                    padding: "20px 24px"
                                }}
                            >
                                <h4 className="mb-0 fw-bold">Procurement Requests</h4>
                                <div style={{ fontSize: "13px", opacity: .8 }}>Active requests requiring procurement action</div>
                            </div>

                            <div className="card-body p-3 p-md-4">

                                {activeRequests.length === 0 ? (

                                    <div
                                        className="alert alert-success text-center mb-0"
                                        style={{ borderRadius: "16px", fontWeight: "600" }}
                                    >
                                        No Pending Procurement Requests 🎉
                                    </div>

                                ) : (

                                    <div className="row g-3 g-md-4">
                                        {activeRequests.map((request) => (

                                            <div className="col-12" key={request.requestId}>
                                                <div
                                                    className="card border-0 h-100"
                                                    style={{
                                                        borderRadius: "18px",
                                                        boxShadow: cardShadow,
                                                        borderLeft: `5px solid var(--bs-${getPriorityBadge(request.priority)})`
                                                    }}
                                                >
                                                    <div className="card-body p-3 p-md-4">

                                                        <div className="row g-3">

                                                            <div className="col-lg-8">
                                                                <h5 className="fw-bold text-primary mb-2">
                                                                    {request.title}
                                                                </h5>

                                                                <p className="mb-2 text-break">
                                                                    <strong>Description:</strong>{" "}
                                                                    {request.description}
                                                                </p>

                                                                <div className="d-flex flex-wrap gap-3">
                                                                    <span className="text-muted" style={{ fontSize: "14px" }}>
                                                                        <strong>Category:</strong> {request.category}
                                                                    </span>
                                                                    <span className="text-muted" style={{ fontSize: "14px" }}>
                                                                        <strong>Quantity:</strong> {request.quantity}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <div className="col-lg-4">
                                                                <div className="d-flex d-lg-flex flex-row flex-lg-column gap-2 justify-content-lg-end align-items-start align-items-lg-end">
                                                                    <span
                                                                        className={`badge rounded-pill bg-${getPriorityBadge(request.priority)}`}
                                                                        style={{ padding: "8px 16px", fontSize: "13px" }}
                                                                    >
                                                                        {request.priority}
                                                                    </span>

                                                                    <span
                                                                        className={`badge rounded-pill bg-${getStatusBadge(request.status)}`}
                                                                        style={{ padding: "8px 16px", fontSize: "13px" }}
                                                                    >
                                                                        {request.status.replaceAll("_", " ")}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                        </div>

                                                        <hr className="my-3" />

                                                        <div>

                                                            {request.status === "PENDING_PROCUREMENT" && (

                                                                <div>

                                                                    <div className="fw-bold text-muted mb-2" style={{ fontSize: "13px", letterSpacing: "0.5px" }}>
                                                                        VENDOR INFORMATION
                                                                    </div>

                                                                    <div className="row g-3 mb-3">

                                                                        <div className="col-12 col-md-6">
                                                                            <label className="form-label small text-muted fw-bold mb-1">
                                                                                Vendor Name
                                                                            </label>
                                                                            <input
                                                                                type="text"
                                                                                className="form-control"
                                                                                placeholder="Vendor Name"
                                                                                style={{ borderRadius: "10px" }}
                                                                                value={poData[request.requestId]?.vendorName || ""}
                                                                                onChange={(e) =>
                                                                                    setPoData({
                                                                                        ...poData,
                                                                                        [request.requestId]: {
                                                                                            ...poData[request.requestId],
                                                                                            vendorName: e.target.value
                                                                                        }
                                                                                    })
                                                                                }
                                                                            />
                                                                        </div>

                                                                        <div className="col-12 col-md-6">
                                                                            <label className="form-label small text-muted fw-bold mb-1">
                                                                                Vendor Email
                                                                            </label>
                                                                            <input
                                                                                type="email"
                                                                                className="form-control"
                                                                                placeholder="Vendor Email"
                                                                                style={{ borderRadius: "10px" }}
                                                                                value={poData[request.requestId]?.vendorEmail || ""}
                                                                                onChange={(e) =>
                                                                                    setPoData({
                                                                                        ...poData,
                                                                                        [request.requestId]: {
                                                                                            ...poData[request.requestId],
                                                                                            vendorEmail: e.target.value
                                                                                        }
                                                                                    })
                                                                                }
                                                                            />
                                                                        </div>

                                                                        <div className="col-12 col-md-6">
                                                                            <label className="form-label small text-muted fw-bold mb-1">
                                                                                Unit Price
                                                                            </label>
                                                                            <input
                                                                                type="number"
                                                                                className="form-control"
                                                                                placeholder="Unit Price"
                                                                                style={{ borderRadius: "10px" }}
                                                                                value={poData[request.requestId]?.unitPrice || ""}
                                                                                onChange={(e) =>
                                                                                    setPoData({
                                                                                        ...poData,
                                                                                        [request.requestId]: {
                                                                                            ...poData[request.requestId],
                                                                                            unitPrice: e.target.value
                                                                                        }
                                                                                    })
                                                                                }
                                                                            />
                                                                        </div>

                                                                        <div className="col-12 col-md-6">
                                                                            <label className="form-label small text-muted fw-bold mb-1">
                                                                                Expected Delivery Date
                                                                            </label>
                                                                            <input
                                                                                type="date"
                                                                                className="form-control"
                                                                                style={{ borderRadius: "10px" }}
                                                                                value={poData[request.requestId]?.expectedDeliveryDate || ""}
                                                                                onChange={(e) =>
                                                                                    setPoData({
                                                                                        ...poData,
                                                                                        [request.requestId]: {
                                                                                            ...poData[request.requestId],
                                                                                            expectedDeliveryDate: e.target.value
                                                                                        }
                                                                                    })
                                                                                }
                                                                            />
                                                                        </div>

                                                                    </div>

                                                                    <button
                                                                        className="btn btn-primary w-100 w-md-auto"
                                                                        style={{
                                                                            borderRadius: "50px",
                                                                            padding: "10px 28px",
                                                                            fontWeight: "600"
                                                                        }}
                                                                        disabled={loading}
                                                                        onClick={() => generatePurchaseOrder(request)}
                                                                    >
                                                                        Generate Purchase Order
                                                                    </button>
                                                                </div>

                                                            )}

                                                            {request.status === "PROCUREMENT_IN_PROGRESS" && (

                                                                <button
                                                                    className="btn btn-success"
                                                                    style={{
                                                                        borderRadius: "50px",
                                                                        padding: "10px 26px",
                                                                        fontWeight: "600"
                                                                    }}
                                                                    disabled={loading}
                                                                    onClick={() => completeProcurement(request.requestId)}
                                                                >
                                                                    ✅ Complete Procurement
                                                                </button>

                                                            )}

                                                        </div>

                                                    </div>
                                                </div>
                                            </div>

                                        ))}
                                    </div>

                                )}

                            </div>
                        </div>

                    )}

                    {/* ==================== PURCHASE ORDERS VIEW ==================== */}
                    {activeTab === "orders" && (

                        <div
                            className="card border-0 mb-4"
                            style={{ borderRadius: "22px", boxShadow: "0 18px 40px rgba(0,0,0,.08)" }}
                        >
                            <div
                                className="card-header border-0"
                                style={{
                                    background: "linear-gradient(90deg,#198754,#157347)",
                                    color: "white",
                                    borderTopLeftRadius: "22px",
                                    borderTopRightRadius: "22px",
                                    padding: "20px 24px"
                                }}
                            >
                                <h4 className="mb-0 fw-bold">Purchase Orders</h4>
                                <div style={{ fontSize: "13px", opacity: .85 }}>Vendor orders, delivery tracking &amp; status workflow</div>
                            </div>

                            <div className="card-body p-3 p-md-4">

                                {purchaseOrders.length === 0 ? (

                                    <div
                                        className="alert alert-secondary text-center mb-0"
                                        style={{ borderRadius: "16px", fontWeight: "600" }}
                                    >
                                        No Purchase Orders Found
                                    </div>

                                ) : (

                                    <div className="row g-3 g-md-4">
                                        {purchaseOrders
                                            .filter(po => po.status !== "CLOSED")
                                            .map(po => {

                                            const workflowProgress = getPoProgress(po.status);

                                            const statusColor = getPoStatusColor(po.status);

                                            return (
                                                <div className="col-12 col-lg-6" key={po.id}>
                                                    <div
                                                        className="card border-0 h-100"
                                                        style={{ borderRadius: "18px", boxShadow: cardShadow }}
                                                    >
                                                        <div className="card-body p-3 p-md-4">

                                                            <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
                                                                <h5 className="fw-bold mb-0">{po.poNumber}</h5>
                                                                <span
                                                                    className={`badge rounded-pill bg-${statusColor}`}
                                                                    style={{ padding: "8px 16px", fontSize: "12px" }}
                                                                >
                                                                    {po.status.replaceAll("_", " ")}
                                                                </span>
                                                            </div>

                                                            <div className="row row-cols-2 g-2 mb-3" style={{ fontSize: "14px" }}>
                                                                <div className="col">
                                                                    <div className="text-muted small">Vendor</div>
                                                                    <div className="fw-semibold text-break">{po.vendorName}</div>
                                                                </div>
                                                                {po.vendorEmail && (
                                                                    <div className="col">
                                                                        <div className="text-muted small">Vendor Email</div>
                                                                        <div className="fw-semibold text-break">{po.vendorEmail}</div>
                                                                    </div>
                                                                )}
                                                                <div className="col">
                                                                    <div className="text-muted small">Item</div>
                                                                    <div className="fw-semibold text-break">{po.itemName}</div>
                                                                </div>
                                                                <div className="col">
                                                                    <div className="text-muted small">Quantity</div>
                                                                    <div className="fw-semibold">{po.quantity}</div>
                                                                </div>
                                                                <div className="col">
                                                                    <div className="text-muted small">Total Amount</div>
                                                                    <div className="fw-semibold">₹{po.totalAmount}</div>
                                                                </div>
                                                                {po.expectedDeliveryDate && (
                                                                    <div className="col">
                                                                        <div className="text-muted small">Expected Delivery</div>
                                                                        <div className="fw-semibold">{po.expectedDeliveryDate}</div>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Delivery Progress highlight */}
                                                            <div
                                                                className="p-3 mb-3"
                                                                style={{
                                                                    borderRadius: "14px",
                                                                    background: "linear-gradient(135deg,#f8fbff,#eef5ff)",
                                                                    border: "1px solid rgba(13,110,253,.08)"
                                                                }}
                                                            >
                                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                                    <span className="fw-bold text-muted" style={{ fontSize: "12px", letterSpacing: "1px" }}>
                                                                        DELIVERY PROGRESS
                                                                    </span>
                                                                    <span className={`fw-bold text-${statusColor}`} style={{ fontSize: "16px" }}>
                                                                       {workflowProgress}%
                                                                    </span>
                                                                </div>

                                                                <div
                                                                    className="mb-2"
                                                                    style={{
                                                                        height: "10px",
                                                                        borderRadius: "50px",
                                                                        background: "rgba(0,0,0,.06)",
                                                                        overflow: "hidden"
                                                                    }}
                                                                >
                                                                    <div
                                                                        style={{
                                                                            width: `${workflowProgress}%`,
                                                                            height: "100%",
                                                                            borderRadius: "50px",
                                                                            background: "linear-gradient(90deg,#0d6efd,#60a5fa)",
                                                                            transition: "width .3s ease"
                                                                        }}
                                                                    />
                                                                </div>

                                                                <div className="d-flex justify-content-between flex-wrap gap-2" style={{ fontSize: "13px" }}>
                                                                    <span className="text-muted">
                                                                        Delivered <strong className="text-dark">{po.deliveredQuantity} / {po.quantity}</strong> Items
                                                                    </span>
                                                                    <span className={`fw-bold text-${statusColor}`}>
                                                                        {po.status.replaceAll("_", " ")}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <div className="d-flex flex-wrap gap-2">

                                                                {po.status === "CREATED" && (
                                                                    <button
                                                                        className="btn btn-primary btn-sm"
                                                                        style={{ borderRadius: "50px", padding: "8px 20px", fontWeight: "600" }}
                                                                        onClick={() => updateStatus(po.id, "SENT")}
                                                                    >
                                                                        Send to Vendor
                                                                    </button>
                                                                )}

                                                                {po.status === "SENT" && (
                                                                    <button
                                                                        className="btn btn-success btn-sm"
                                                                        style={{ borderRadius: "50px", padding: "8px 20px", fontWeight: "600" }}
                                                                        onClick={() => updateStatus(po.id, "ACCEPTED")}
                                                                    >
                                                                        Accept
                                                                    </button>
                                                                )}

                                                                {po.status === "ACCEPTED" && (
                                                                    <button
                                                                        className="btn btn-warning btn-sm"
                                                                        style={{ borderRadius: "50px", padding: "8px 20px", fontWeight: "600" }}
                                                                        onClick={() => updateStatus(po.id, "SHIPPED")}
                                                                    >
                                                                        Ship
                                                                    </button>
                                                                )}

                                                                {po.status === "SHIPPED" && (

                                                                    <div className="w-100">
                                                                        <div className="row g-2 align-items-center">

                                                                            <div className="col-7 col-sm-8">
                                                                                <input
                                                                                    type="number"
                                                                                    min="1"
                                                                                    max={po.quantity}
                                                                                    className="form-control form-control-sm"
                                                                                    placeholder="Delivered Quantity"
                                                                                    style={{ borderRadius: "10px" }}
                                                                                    value={deliveryData[po.id] || ""}
                                                                                    onChange={(e) =>
                                                                                        setDeliveryData({
                                                                                            ...deliveryData,
                                                                                            [po.id]: e.target.value
                                                                                        })
                                                                                    }
                                                                                />
                                                                            </div>

                                                                            <div className="col-5 col-sm-4">
                                                                                <button
                                                                                    className="btn btn-info btn-sm w-100"
                                                                                    style={{ borderRadius: "10px", fontWeight: "600" }}
                                                                                    onClick={() => {

                                                                                        const qty = Number(deliveryData[po.id]);

                                                                                        if (!qty || qty <= 0) {
                                                                                            alert("Enter a valid quantity");
                                                                                            return;
                                                                                        }

                                                                                        updateStatus(
                                                                                            po.id,
                                                                                            qty < po.quantity
                                                                                                ? "PARTIALLY_DELIVERED"
                                                                                                : "DELIVERED",
                                                                                            qty
                                                                                        );

                                                                                    }}
                                                                                >
                                                                                    Deliver
                                                                                </button>
                                                                            </div>

                                                                        </div>
                                                                    </div>

                                                                )}

                                                               {po.status === "DELIVERED"  && (

                                                                    <button
                                                                        className="btn btn-success btn-sm"
                                                                        style={{
                                                                            borderRadius: "50px",
                                                                            padding: "8px 20px",
                                                                            fontWeight: "600"
                                                                        }}
                                                                        onClick={() => updateStatus(po.id, "CLOSED")}
                                                                    >
                                                                        ✔ Close Purchase Order
                                                                    </button>

                                                                )}

                                                                {po.status === "CLOSED" && (
                                                                    <span
                                                                        className="badge bg-success"
                                                                        style={{ padding: "8px 16px", fontSize: "13px" }}
                                                                    >
                                                                        ✔ Purchase Order Closed
                                                                    </span>
                                                                )}

                                                                

                                                            </div>

                                                        </div>
                                                    </div>
                                                </div>
                                            );

                                        })}
                                    </div>

                                )}

                            </div>
                        </div>

                    )}

                    {/* ==================== PROCUREMENT HISTORY VIEW ==================== */}
                    {activeTab === "history" && (

                        <div
                            className="card border-0 mb-4"
                            style={{ borderRadius: "22px", boxShadow: "0 18px 40px rgba(0,0,0,.08)" }}
                        >
                            <div
                                className="card-header border-0"
                                style={{
                                    background: "linear-gradient(90deg,#4b5563,#374151)",
                                    color: "white",
                                    borderTopLeftRadius: "22px",
                                    borderTopRightRadius: "22px",
                                    padding: "20px 24px"
                                }}
                            >
                                <h4 className="mb-0 fw-bold">Procurement History</h4>
                                <div style={{ fontSize: "13px", opacity: .8 }}>Archive of completed procurement</div>
                            </div>

                            <div className="card-body p-3 p-md-4">

                                {completedRequests.length === 0 ? (

                                    <div
                                        className="alert alert-secondary text-center mb-0"
                                        style={{ borderRadius: "16px", fontWeight: "600" }}
                                    >
                                        No completed procurement yet.
                                    </div>

                                ) : (

                                    <div className="row g-3 g-md-4">
                                        {completedRequests.map((request) => {

                                            // Best-effort match to the related Purchase Order for extra
                                            // archive detail (PO number, vendor, amount). Purely a lookup
                                            // over data already loaded — no new API calls.
                                            const relatedPo = purchaseOrders.find(
                                                po => po.purchaseRequestId === request.requestId
                                            );

                                            return (
                                                <div className="col-12 col-lg-6" key={request.requestId}>
                                                    <div
                                                        className="card border-0 h-100"
                                                        style={{
                                                            borderRadius: "18px",
                                                            boxShadow: cardShadow,
                                                            opacity: .95
                                                        }}
                                                    >
                                                        <div className="card-body p-3 p-md-4">

                                                            <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2">
                                                                <h5 className="fw-bold mb-0">{request.title}</h5>
                                                                <span
                                                                    className={`badge rounded-pill bg-${getStatusBadge(request.status)}`}
                                                                    style={{ padding: "8px 16px", fontSize: "12px" }}
                                                                >
                                                                    {request.status.replaceAll("_", " ")}
                                                                </span>
                                                            </div>

                                                            <div className="row row-cols-2 g-2" style={{ fontSize: "14px" }}>

                                                                {relatedPo && (
                                                                    <div className="col">
                                                                        <div className="text-muted small">Purchase Order</div>
                                                                        <div className="fw-semibold">{relatedPo.poNumber}</div>
                                                                    </div>
                                                                )}

                                                                <div className="col">
                                                                    <div className="text-muted small">Vendor</div>
                                                                    <div className="fw-semibold text-break">
                                                                        {relatedPo?.vendorName || "—"}
                                                                    </div>
                                                                </div>

                                                                <div className="col">
                                                                    <div className="text-muted small">Category</div>
                                                                    <div className="fw-semibold">{request.category}</div>
                                                                </div>

                                                                <div className="col">
                                                                    <div className="text-muted small">Quantity</div>
                                                                    <div className="fw-semibold">{request.quantity}</div>
                                                                </div>

                                                                <div className="col">
                                                                    <div className="text-muted small">Amount</div>
                                                                    <div className="fw-semibold">
                                                                        {relatedPo ? `₹${relatedPo.totalAmount}` : "—"}
                                                                    </div>
                                                                </div>

                                                            </div>

                                                        </div>
                                                    </div>
                                                </div>
                                            );

                                        })}
                                    </div>

                                )}

                            </div>
                        </div>

                    )}

                </div>
            </div>
        </>
    );

}

export default ProcurementDashboard;
