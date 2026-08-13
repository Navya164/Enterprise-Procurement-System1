import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid
} from "recharts";


const REQUEST_API = "http://localhost:8080/api/purchase";
const PURCHASE_ORDER_API = "http://localhost:8080/api/purchase-orders";
const SUPPLIER_API = "http://localhost:8080/suppliers";
const ANALYTICS_API = "http://localhost:8080/api/analytics/procurement";


function ProcurementDashboard() {

    const navigate = useNavigate();

    /* =========================================================
       STATE
    ========================================================= */

    const [activeTab, setActiveTab] = useState("overview");

    const [requests, setRequests] = useState([]);
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [suppliers, setSuppliers] = useState([]);

    const [poData, setPoData] = useState({});
    const [deliveryData, setDeliveryData] = useState({});
    const [analytics, setAnalytics] = useState(null);

    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);

    const [selectedPO, setSelectedPO] = useState(null);

    /* Tracking filters */

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [vendorFilter, setVendorFilter] = useState("ALL");


    /* =========================================================
       LOAD ALL DATA
    ========================================================= */

    useEffect(() => {

        loadAllData();

        /*
         * Automatically refresh dashboard every 10 seconds.
         * This allows procurement officer to see when vendor
         * accepts or ships an order.
         */

        const interval = setInterval(() => {
            loadAllData();
        }, 10000);

        return () => clearInterval(interval);

        }, []); // eslint-disable-line react-hooks/exhaustive-deps


    const loadAllData = async () => {

        try {

            setLoadingData(true);

            await Promise.all([
                loadRequests(),
                loadPurchaseOrders(),
                loadSuppliers(),
                loadAnalytics()
            ]);

        } catch (error) {

            console.error("Dashboard refresh error:", error);

        } finally {

            setLoadingData(false);

        }

    };


    /* =========================================================
       LOAD PROCUREMENT REQUESTS
    ========================================================= */

    const loadRequests = async () => {

        try {

            const response = await axios.get(
                `${REQUEST_API}/procurement`
            );

            console.log("PROCUREMENT REQUESTS:", response.data);

            setRequests(response.data || []);

        } catch (error) {

            console.error("Unable to load procurement requests:", error);

        }

    };


    /* =========================================================
       LOAD PURCHASE ORDERS
    ========================================================= */

    const loadPurchaseOrders = async () => {

        try {

            const response = await axios.get(
                PURCHASE_ORDER_API
            );

            console.log("PURCHASE ORDERS:", response.data);

            setPurchaseOrders(response.data || []);

        } catch (error) {

            console.error("Unable to load purchase orders:", error);

        }

    };


    /* =========================================================
       LOAD SUPPLIERS
    ========================================================= */

    const loadSuppliers = async () => {

        try {

            const response = await axios.get(
                SUPPLIER_API
            );

            setSuppliers(response.data || []);

        } catch (error) {

            console.error("Unable to load suppliers:", error);

        }

    };


    /* =========================================================
       LOAD PROCUREMENT ANALYTICS

       Task 2 analytics are calculated by the Spring Boot backend
       from the live database. This keeps spend/performance rules
       in the backend instead of duplicating business logic here.
    ========================================================= */

    const loadAnalytics = async () => {

        try {

            const response = await axios.get(
                ANALYTICS_API
            );

            console.log("PROCUREMENT ANALYTICS:", response.data);

            setAnalytics(response.data || null);

        } catch (error) {

            console.error(
                "Unable to load procurement analytics:",
                error
            );

        }

    };


    /* =========================================================
       START PROCUREMENT
    ========================================================= */

    const startProcurement = async (requestId) => {

        try {

            await axios.put(
                `${REQUEST_API}/procurement/start/${requestId}`
            );

            alert("Procurement Started Successfully");

            await loadRequests();

        } catch (error) {

            console.error(error);

            alert(
                error.response?.data?.message ||
                "Unable to start procurement"
            );

        }

    };


    /* =========================================================
       GENERATE PURCHASE ORDER
    ========================================================= */

    const generatePurchaseOrder = async (request) => {

        try {

            setLoading(true);

            const data = poData[request.requestId];

            if (!data || !data.supplierId) {

                alert("Please select a vendor.");

                return;

            }


            if (!data.unitPrice || Number(data.unitPrice) <= 0) {

                alert("Please enter a valid unit price.");

                return;

            }


            if (!data.expectedDeliveryDate) {

                alert("Please select expected delivery date.");

                return;

            }


            const today = new Date();

            const selectedDate = new Date(
                data.expectedDeliveryDate
            );

            if (selectedDate <= today) {

                alert(
                    "Expected delivery date must be a future date."
                );

                return;

            }


            await axios.post(
                PURCHASE_ORDER_API,
                {

                    purchaseRequestId:
                        request.requestId,

                    vendorName:
                        data.vendorName,

                    vendorEmail:
                        data.vendorEmail,

                    itemName:
                        request.title,

                    quantity:
                        request.quantity,

                    unitPrice:
                        Number(data.unitPrice),

                    expectedDeliveryDate:
                        data.expectedDeliveryDate

                }
            );


            alert(
                "Purchase Order Created Successfully!\n\n" +
                "The order is now waiting for the vendor to accept."
            );


            setPoData({
                ...poData,
                [request.requestId]: {}
            });


            await loadPurchaseOrders();
            await loadRequests();


        } catch (error) {

            console.error(error);

            alert(
                error.response?.data?.messages?.join("\n") ||
                error.response?.data?.message ||
                "Unable to generate Purchase Order."
            );

        } finally {

            setLoading(false);

        }

    };


    /* =========================================================
       DELIVERY STATUS UPDATE
       
       PROCUREMENT OFFICER CAN ONLY:
       
       SHIPPED
           ↓
       DELIVERED / PARTIALLY_DELIVERED
           ↓
       DELIVERED
           ↓
       CLOSED
       
       Procurement officer CANNOT SHIP.
       Vendor handles SHIPPED status.
    ========================================================= */

    const updateDeliveryStatus = async (
        po,
        newStatus
    ) => {

        try {

            let deliveredQuantity = null;


            /*
             * For SHIPPED or PARTIALLY_DELIVERED,
             * procurement officer enters quantity received.
             */

            if (
                newStatus === "DELIVERED" ||
                newStatus === "PARTIALLY_DELIVERED"
            ) {

                const enteredQuantity =
                    Number(deliveryData[po.id] || 0);


                if (
                    !enteredQuantity ||
                    enteredQuantity <= 0
                ) {

                    alert(
                        "Please enter a valid delivered quantity."
                    );

                    return;

                }


                const remainingQuantity =
                    Number(po.quantity) -
                    Number(po.deliveredQuantity || 0);


                if (
                    enteredQuantity >
                    remainingQuantity
                ) {

                    alert(
                        `You can receive a maximum of ${remainingQuantity} units.`
                    );

                    return;

                }


                deliveredQuantity =
                    enteredQuantity;

            }


            /*
             * Closing an order does not require quantity.
             */

            await axios.patch(

                `${PURCHASE_ORDER_API}/${po.id}/status`,

                {
                    status: newStatus,

                    ...(deliveredQuantity !== null
                        ? {
                            deliveredQuantity:
                                deliveredQuantity
                        }
                        : {})
                }

            );


            alert(
                newStatus === "PARTIALLY_DELIVERED"
                    ? "Partial delivery recorded successfully."
                    : newStatus === "DELIVERED"
                    ? "Delivery completed successfully."
                    : "Purchase Order closed successfully."
            );


            setDeliveryData({
                ...deliveryData,
                [po.id]: ""
            });


            await loadPurchaseOrders();
            await loadRequests();


            /*
             * Update selected PO details if modal is open.
             */

            setSelectedPO(null);


        } catch (error) {

            console.error(error);

            alert(
                error.response?.data?.messages?.join("\n") ||
                error.response?.data?.message ||
                error.message ||
                "Unable to update delivery status."
            );

        }

    };


    /* =========================================================
       PURCHASE ORDER STATUS HELPERS
    ========================================================= */

    const getStatusColor = (status) => {

        switch (status) {

            case "CREATED":
                return "primary";

            case "SENT":
                return "warning";

            case "ACCEPTED":
                return "info";

            case "SHIPPED":
                return "warning";

            case "PARTIALLY_DELIVERED":
                return "secondary";

            case "DELIVERED":
                return "success";

            case "CLOSED":
                return "success";

            case "REJECTED":
                return "danger";

            case "CANCELLED":
                return "dark";

            default:
                return "secondary";

        }

    };


    const getStatusText = (status) => {

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


    /* =========================================================
       REQUEST STATUS HELPERS
    ========================================================= */

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


    const getRequestStatusBadge = (status) => {

        switch (status) {

            case "PENDING_PROCUREMENT":
                return "warning";

            case "PROCUREMENT_IN_PROGRESS":
                return "info";

            case "COMPLETED":
                return "success";

            case "REJECTED":
                return "danger";

            default:
                return "secondary";

        }

    };


    /* =========================================================
       OVERVIEW COUNTS

       Performance counts come from the backend analytics API.
       Local purchase-order counts are used only as a fallback
       while analytics data is loading.
    ========================================================= */

    const analyticsPerformance =
        analytics?.performance || {};


    const totalPOs =
        Number.isFinite(Number(analyticsPerformance.totalPurchaseOrders))
            ? Number(analyticsPerformance.totalPurchaseOrders)
            : purchaseOrders.length;


    const pendingPOs =
        Number.isFinite(Number(analyticsPerformance.pendingPurchaseOrders))
            ? Number(analyticsPerformance.pendingPurchaseOrders)
            : purchaseOrders.filter(
                po =>
                    po.status === "CREATED" ||
                    po.status === "SENT"
            ).length;


    const inProgressPOs =
        Number.isFinite(Number(analyticsPerformance.inProgressPurchaseOrders))
            ? Number(analyticsPerformance.inProgressPurchaseOrders)
            : purchaseOrders.filter(
                po =>
                    po.status === "ACCEPTED" ||
                    po.status === "SHIPPED" ||
                    po.status === "PARTIALLY_DELIVERED"
            ).length;


    const completedPOs =
        Number.isFinite(Number(analyticsPerformance.completedPurchaseOrders))
            ? Number(analyticsPerformance.completedPurchaseOrders)
            : purchaseOrders.filter(
                po =>
                    po.status === "DELIVERED" ||
                    po.status === "CLOSED"
            ).length;


    const rejectedPOs =
        Number.isFinite(Number(analyticsPerformance.rejectedPurchaseOrders))
            ? Number(analyticsPerformance.rejectedPurchaseOrders)
            : purchaseOrders.filter(
                po =>
                    po.status === "REJECTED" ||
                    po.status === "CANCELLED"
            ).length;


    const totalVendors =
        suppliers.length;


    /* =========================================================
       TASK 2 - TOTAL PROCUREMENT SPEND

       The backend calculates this using the required
       completed/valid Purchase Order condition.
       Do not recalculate it from all purchaseOrders here.
    ========================================================= */

    const totalProcurementSpend =
        Number(
            analytics?.totalProcurementSpend || 0
        );


    /* =========================================================
       TASK 2 - PERFORMANCE
    ========================================================= */

    const completedPurchaseOrders =
        Number(
            analyticsPerformance.completedPurchaseOrders || 0
        );


    const rejectedPurchaseOrders =
        Number(
            analyticsPerformance.rejectedPurchaseOrders || 0
        );


    const completionRate =
        Number(
            analyticsPerformance.completionRate || 0
        );


    const rejectionRate =
        Number(
            analyticsPerformance.rejectionRate || 0
        );


    /* =========================================================
       TASK 2 - COST OPTIMIZATION INSIGHTS
    ========================================================= */

    const costOptimization =
        analytics?.costOptimization || {};


    /* =========================================================
       DELIVERY ANALYTICS
    ========================================================= */

    const totalOrderedQuantity =
        purchaseOrders.reduce(
            (total, po) =>
                total + Number(po.quantity || 0),
            0
        );


    const totalDeliveredQuantity =
        purchaseOrders.reduce(
            (total, po) =>
                total +
                Number(po.deliveredQuantity || 0),
            0
        );


    const deliveryPercentage =
        totalOrderedQuantity > 0
            ? Math.round(
                (totalDeliveredQuantity /
                    totalOrderedQuantity) *
                100
            )
            : 0;


    /* =========================================================
       REQUEST WORKFLOW COUNTS
    ========================================================= */

    const pendingRequests =
        requests.filter(
            r =>
                r.status ===
                "PENDING_PROCUREMENT"
        ).length;


    const requestsInProgress =
        requests.filter(
            r =>
                r.status ===
                "PROCUREMENT_IN_PROGRESS"
        ).length;


    const completedRequests =
        requests.filter(
            r =>
                r.status ===
                "COMPLETED"
        ).length;


    /* =========================================================
       ANALYTICS DATA

       Spend and performance analytics come directly from the
       backend analytics response. Vendor-wise PO count remains
       based on the existing PO data because that chart measures
       order count rather than spend.
    ========================================================= */

    const statusChartData = [

        {
            name: "Completed",
            value: completedPurchaseOrders
        },

        {
            name: "In Progress",
            value: Number(
                analyticsPerformance.inProgressPurchaseOrders || 0
            )
        },

        {
            name: "Pending",
            value: Number(
                analyticsPerformance.pendingPurchaseOrders || 0
            )
        },

        {
            name: "Rejected",
            value: rejectedPurchaseOrders
        }

    ];


    const STATUS_COLORS = [

        "#198754",
        "#0dcaf0",
        "#ffc107",
        "#dc3545"

    ];


    const vendorOrderMap = {};


    purchaseOrders.forEach(po => {

        const vendor =
            po.vendorName || "Unknown Vendor";

        if (!vendorOrderMap[vendor]) {

            vendorOrderMap[vendor] = 0;

        }

        vendorOrderMap[vendor]++;

    });


    const vendorChartData =
        Object.keys(vendorOrderMap).map(
            vendor => ({

                vendor: vendor,

                orders:
                    vendorOrderMap[vendor]

            })
        );


    /* =========================================================
       VENDOR-WISE PROCUREMENT SPEND
    ========================================================= */

    const vendorSpendChartData =
        (analytics?.vendorWiseSpend || []).map(
            item => ({

                vendor:
                    item.name || "Unknown Vendor",

                spend:
                    Number(item.spend || 0)

            })
        );


    /* =========================================================
       CATEGORY-WISE PROCUREMENT SPEND
    ========================================================= */

    const categorySpendChartData =
        (analytics?.categoryWiseSpend || []).map(
            item => ({

                category:
                    item.name || "Unknown Category",

                spend:
                    Number(item.spend || 0)

            })
        );


    /* =========================================================
       MONTHLY PROCUREMENT SPEND
    ========================================================= */

    const monthlySpendChartData =
        (analytics?.monthlySpend || []).map(
            item => ({

                month:
                    item.month || "Unknown Month",

                spend:
                    Number(item.spend || 0)

            })
        );


    /* =========================================================
       PROCUREMENT REQUESTS AVAILABLE
    ========================================================= */

    const availableRequests =
        requests.filter(

            request =>

                (
                    request.status ===
                    "PENDING_PROCUREMENT"

                    ||

                    request.status ===
                    "PROCUREMENT_IN_PROGRESS"
                )

                &&

                !purchaseOrders.some(

                    po =>
                        po.purchaseRequestId ===
                        request.requestId

                )

        );


    /* =========================================================
       TRACKING FILTER
    ========================================================= */

    const filteredPurchaseOrders =
        purchaseOrders.filter(po => {

            const search =
                searchTerm
                    .toLowerCase()
                    .trim();


            const matchesSearch =
                !search ||

                String(
                    po.poNumber || ""
                )
                    .toLowerCase()
                    .includes(search)

                ||

                String(
                    po.vendorName || ""
                )
                    .toLowerCase()
                    .includes(search)

                ||

                String(
                    po.itemName || ""
                )
                    .toLowerCase()
                    .includes(search);


            const matchesStatus =
                statusFilter === "ALL" ||
                po.status === statusFilter;


            const matchesVendor =
                vendorFilter === "ALL" ||
                po.vendorName === vendorFilter;


            return (
                matchesSearch &&
                matchesStatus &&
                matchesVendor
            );

        });


    /* =========================================================
       CARD STYLE
    ========================================================= */

    const cardStyle = {

        borderRadius: "18px",

        border: "none",

        boxShadow:
            "0 8px 25px rgba(0,0,0,.08)"

    };


    /* =========================================================
       RENDER
    ========================================================= */

    return (

        <div
            className="container-fluid py-4"
            style={{
                minHeight: "100vh",
                background:
                    "linear-gradient(135deg,#eef5ff 0%,#f8fbff 50%,#ffffff 100%)"
            }}
        >

            <div className="container">


                {/* =================================================
                    HEADER
                ================================================= */}

                <div
                    className="mb-4"
                    style={{
                        borderRadius: "24px",
                        background:
                            "linear-gradient(135deg,#0d6efd,#2563eb,#60a5fa)",
                        color: "white",
                        boxShadow:
                            "0 20px 45px rgba(13,110,253,.25)"
                    }}
                >

                    <div className="p-4 p-md-5">

                        <div className="d-flex justify-content-between align-items-center">

                            <div>

                                <div
                                    style={{
                                        letterSpacing: "2px",
                                        fontSize: "12px",
                                        opacity: ".8"
                                    }}
                                >
                                    ENTERPRISE PROCUREMENT SYSTEM
                                </div>

                                <h1 className="fw-bold mt-2 mb-2">
                                    Procurement Dashboard
                                </h1>

                                <p
                                    className="mb-0"
                                    style={{
                                        opacity: ".9"
                                    }}
                                >
                                    Monitor procurement analytics,
                                    track purchase orders,
                                    manage requests and monitor
                                    delivery progress.
                                </p>

                            </div>


                            <div className="text-end">

                                <small
                                    className="d-block mb-2"
                                    style={{
                                        opacity: ".8"
                                    }}
                                >
                                    {loadingData
                                        ? "Updating..."
                                        : "Live Dashboard"}
                                </small>

                                <button
                                    className="btn btn-light"
                                    style={{
                                        borderRadius: "50px",
                                        padding:
                                            "10px 28px",
                                        fontWeight: "600"
                                    }}
                                    onClick={() =>
                                        navigate("/")
                                    }
                                >
                                    Logout
                                </button>

                            </div>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    SUMMARY CARDS
                ================================================= */}

                <div className="row g-3 mb-4">


                    <div className="col-md-6 col-lg-2">

                        <div
                            className="card h-100"
                            style={cardStyle}
                        >

                            <div className="card-body">

                                <small className="text-muted">
                                    TOTAL POs
                                </small>

                                <h2 className="text-primary fw-bold mt-2">
                                    {totalPOs}
                                </h2>

                            </div>

                        </div>

                    </div>


                    <div className="col-md-6 col-lg-2">

                        <div
                            className="card h-100"
                            style={cardStyle}
                        >

                            <div className="card-body">

                                <small className="text-muted">
                                    PENDING
                                </small>

                                <h2 className="text-warning fw-bold mt-2">
                                    {pendingPOs}
                                </h2>

                            </div>

                        </div>

                    </div>


                    <div className="col-md-6 col-lg-2">

                        <div
                            className="card h-100"
                            style={cardStyle}
                        >

                            <div className="card-body">

                                <small className="text-muted">
                                    IN PROGRESS
                                </small>

                                <h2 className="text-info fw-bold mt-2">
                                    {inProgressPOs}
                                </h2>

                            </div>

                        </div>

                    </div>


                    <div className="col-md-6 col-lg-2">

                        <div
                            className="card h-100"
                            style={cardStyle}
                        >

                            <div className="card-body">

                                <small className="text-muted">
                                    COMPLETED
                                </small>

                                <h2 className="text-success fw-bold mt-2">
                                    {completedPOs}
                                </h2>

                            </div>

                        </div>

                    </div>


                    <div className="col-md-6 col-lg-2">

                        <div
                            className="card h-100"
                            style={cardStyle}
                        >

                            <div className="card-body">

                                <small className="text-muted">
                                    REJECTED
                                </small>

                                <h2 className="text-danger fw-bold mt-2">
                                    {rejectedPOs}
                                </h2>

                            </div>

                        </div>

                    </div>


                    <div className="col-md-6 col-lg-2">

                        <div
                            className="card h-100"
                            style={cardStyle}
                        >

                            <div className="card-body">

                                <small className="text-muted">
                                    TOTAL VENDORS
                                </small>

                                <h2 className="text-dark fw-bold mt-2">
                                    {totalVendors}
                                </h2>

                            </div>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    TAB NAVIGATION
                ================================================= */}

                <div
                    className="card border-0 mb-4"
                    style={cardStyle}
                >

                    <div className="card-body p-2">

                        <div className="row g-2">


                            <div className="col-md-3">

                                <button
                                    className={
                                        activeTab === "overview"
                                            ? "btn btn-primary w-100"
                                            : "btn btn-outline-primary w-100"
                                    }
                                    onClick={() =>
                                        setActiveTab("overview")
                                    }
                                >
                                    📊 Overview
                                </button>

                            </div>


                            <div className="col-md-3">

                                <button
                                    className={
                                        activeTab === "tracking"
                                            ? "btn btn-primary w-100"
                                            : "btn btn-outline-primary w-100"
                                    }
                                    onClick={() =>
                                        setActiveTab("tracking")
                                    }
                                >
                                    📍 PO Tracking
                                </button>

                            </div>


                            <div className="col-md-3">

                                <button
                                    className={
                                        activeTab === "requests"
                                            ? "btn btn-primary w-100"
                                            : "btn btn-outline-primary w-100"
                                    }
                                    onClick={() =>
                                        setActiveTab("requests")
                                    }
                                >
                                    📋 Procurement Requests
                                </button>

                            </div>


                            <div className="col-md-3">

                                <button
                                    className={
                                        activeTab === "orders"
                                            ? "btn btn-success w-100"
                                            : "btn btn-outline-success w-100"
                                    }
                                    onClick={() =>
                                        setActiveTab("orders")
                                    }
                                >
                                    📦 Purchase Orders
                                </button>

                            </div>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    OVERVIEW TAB
                ================================================= */}

                {activeTab === "overview" && (

                    <>

                        <h3 className="fw-bold mb-4">
                            Procurement Analytics
                        </h3>


                        {/* =================================================
                            ANALYTICS SUMMARY CARDS
                        ================================================= */}

                        <div className="row g-4 mb-4">

                            {/* TOTAL PROCUREMENT SPEND */}

                            <div className="col-md-6 col-lg-4">

                                <div
                                    className="card h-100"
                                    style={cardStyle}
                                >

                                    <div className="card-body p-4">

                                        <small className="text-muted fw-semibold">
                                            TOTAL PROCUREMENT SPEND
                                        </small>

                                        <h2 className="text-success fw-bold mt-2 mb-0">
                                            ₹
                                            {totalProcurementSpend.toLocaleString(
                                                "en-IN",
                                                {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                }
                                            )}
                                        </h2>

                                        <p className="text-muted small mb-0 mt-2">
                                            Spend from completed/valid Purchase Orders
                                        </p>

                                    </div>

                                </div>

                            </div>


                            {/* COMPLETION RATE */}

                            <div className="col-md-6 col-lg-4">

                                <div
                                    className="card h-100"
                                    style={cardStyle}
                                >

                                    <div className="card-body p-4">

                                        <small className="text-muted fw-semibold">
                                            ✓ ORDER COMPLETION RATE
                                        </small>

                                        <h2 className="text-primary fw-bold mt-2 mb-0">
                                            {completionRate.toFixed(2)}%
                                        </h2>

                                        <p className="text-muted small mb-0 mt-2">
                                            {completedPurchaseOrders} completed / {totalPOs} total Purchase Orders
                                        </p>

                                    </div>

                                </div>

                            </div>


                            {/* REJECTION RATE */}

                            <div className="col-md-6 col-lg-4">

                                <div
                                    className="card h-100"
                                    style={cardStyle}
                                >

                                    <div className="card-body p-4">

                                        <small className="text-muted fw-semibold">
                                            ❌ REJECTION RATE
                                        </small>

                                        <h2 className="text-danger fw-bold mt-2 mb-0">
                                            {rejectionRate.toFixed(2)}%
                                        </h2>

                                        <p className="text-muted small mb-0 mt-2">
                                            {rejectedPurchaseOrders} rejected / {totalPOs} total Purchase Orders
                                        </p>

                                    </div>

                                </div>

                            </div>

                        </div>


                        {/* =================================================
                            PERFORMANCE & COST OPTIMIZATION INSIGHTS
                        ================================================= */}

                        <div className="row g-4 mb-4">

                            <div className="col-lg-6">

                                <div
                                    className="card h-100"
                                    style={cardStyle}
                                >

                                    <div className="card-body p-4">

                                        <h5 className="fw-bold mb-3">
                                            📈 Procurement Performance Insights
                                        </h5>

                                        <div className="row g-3">

                                            <div className="col-6">

                                                <div className="border rounded-3 p-3 h-100">

                                                    <small className="text-muted d-block">
                                                        COMPLETED
                                                    </small>

                                                    <h4 className="text-success fw-bold mb-0 mt-1">
                                                        {completedPurchaseOrders}
                                                    </h4>

                                                </div>

                                            </div>


                                            <div className="col-6">

                                                <div className="border rounded-3 p-3 h-100">

                                                    <small className="text-muted d-block">
                                                        IN PROGRESS
                                                    </small>

                                                    <h4 className="text-info fw-bold mb-0 mt-1">
                                                        {Number(
                                                            analyticsPerformance.inProgressPurchaseOrders || 0
                                                        )}
                                                    </h4>

                                                </div>

                                            </div>


                                            <div className="col-6">

                                                <div className="border rounded-3 p-3 h-100">

                                                    <small className="text-muted d-block">
                                                        PENDING
                                                    </small>

                                                    <h4 className="text-warning fw-bold mb-0 mt-1">
                                                        {Number(
                                                            analyticsPerformance.pendingPurchaseOrders || 0
                                                        )}
                                                    </h4>

                                                </div>

                                            </div>


                                            <div className="col-6">

                                                <div className="border rounded-3 p-3 h-100">

                                                    <small className="text-muted d-block">
                                                        COMPLETION RATE
                                                    </small>

                                                    <h4 className="text-primary fw-bold mb-0 mt-1">
                                                        {completionRate.toFixed(2)}%
                                                    </h4>

                                                </div>

                                            </div>

                                        </div>

                                        <p className="text-muted small mt-3 mb-0">
                                            {Number(
                                                analyticsPerformance.inProgressPurchaseOrders || 0
                                            ) > 0
                                                ? "There are Purchase Orders still in progress. Follow up with vendors to complete the remaining procurement cycle."
                                                : "All current Purchase Orders have completed the procurement cycle."}
                                        </p>

                                    </div>

                                </div>

                            </div>


                            <div className="col-lg-6">

                                <div
                                    className="card h-100"
                                    style={cardStyle}
                                >

                                    <div className="card-body p-4">

                                        <h5 className="fw-bold mb-3">
                                            💡 Cost Optimization Insights
                                        </h5>

                                        <div className="mb-3">

                                            <small className="text-muted d-block">
                                                HIGHEST-SPEND VENDOR
                                            </small>

                                            <strong>
                                                {costOptimization.highestSpendVendor || "N/A"}
                                            </strong>

                                            <span className="ms-2 text-success fw-semibold">
                                                ₹
                                                {Number(
                                                    costOptimization.highestVendorSpend || 0
                                                ).toLocaleString(
                                                    "en-IN",
                                                    {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2
                                                    }
                                                )}
                                            </span>

                                        </div>


                                        <div className="mb-3">

                                            <small className="text-muted d-block">
                                                HIGHEST-SPEND CATEGORY
                                            </small>

                                            <strong>
                                                {costOptimization.highestSpendCategory || "N/A"}
                                            </strong>

                                            <span className="ms-2 text-success fw-semibold">
                                                ₹
                                                {Number(
                                                    costOptimization.highestCategorySpend || 0
                                                ).toLocaleString(
                                                    "en-IN",
                                                    {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2
                                                    }
                                                )}
                                            </span>

                                        </div>


                                        <div>

                                            <small className="text-muted d-block">
                                                HIGHEST-SPEND MONTH
                                            </small>

                                            <strong>
                                                {costOptimization.highestSpendMonth || "N/A"}
                                            </strong>

                                            <span className="ms-2 text-success fw-semibold">
                                                ₹
                                                {Number(
                                                    costOptimization.highestMonthlySpend || 0
                                                ).toLocaleString(
                                                    "en-IN",
                                                    {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2
                                                    }
                                                )}
                                            </span>

                                        </div>


                                        <p className="text-muted small mt-3 mb-0">
                                            Review high-spend vendors and categories for
                                            negotiated pricing, volume discounts and
                                            alternative supplier opportunities.
                                        </p>

                                    </div>

                                </div>

                            </div>

                        </div>


                        {/* =================================================
                            ANALYTICS CHART GRID

                            Four equal-width cards are arranged in a clean
                            2 × 2 layout so the analytics do not wrap into
                            uneven columns.
                        ================================================= */}

                        <div className="row g-4 mb-4">

                            {/* PURCHASE ORDER STATUS */}

                            <div className="col-lg-6">

                                <div
                                    className="card h-100"
                                    style={cardStyle}
                                >

                                    <div className="card-body p-4">

                                        <h5 className="fw-bold mb-1">
                                            Purchase Order Status
                                        </h5>

                                        <p className="text-muted small mb-3">
                                            Current purchase order distribution
                                        </p>

                                        <ResponsiveContainer
                                            width="100%"
                                            height={320}
                                        >

                                            <PieChart>

                                                <Pie
                                                    data={statusChartData}
                                                    dataKey="value"
                                                    nameKey="name"
                                                    outerRadius={105}
                                                    label
                                                >

                                                    {statusChartData.map(
                                                        (entry, index) => (

                                                            <Cell
                                                                key={index}
                                                                fill={
                                                                    STATUS_COLORS[
                                                                        index %
                                                                            STATUS_COLORS.length
                                                                    ]
                                                                }
                                                            />

                                                        )
                                                    )}

                                                </Pie>

                                                <Tooltip />
                                                <Legend />

                                            </PieChart>

                                        </ResponsiveContainer>

                                    </div>

                                </div>

                            </div>


                            {/* VENDOR-WISE PURCHASE ORDERS */}

                            <div className="col-lg-6">

                                <div
                                    className="card h-100"
                                    style={cardStyle}
                                >

                                    <div className="card-body p-4">

                                        <h5 className="fw-bold mb-1">
                                            Vendor-wise Purchase Orders
                                        </h5>

                                        <p className="text-muted small mb-3">
                                            Number of orders handled by each vendor
                                        </p>

                                        <ResponsiveContainer
                                            width="100%"
                                            height={330}
                                        >

                                            <BarChart
                                                layout="vertical"
                                                data={vendorChartData}
                                                margin={{
                                                    top: 10,
                                                    right: 25,
                                                    left: 15,
                                                    bottom: 10
                                                }}
                                            >

                                                <CartesianGrid
                                                    strokeDasharray="3 3"
                                                />

                                                <XAxis
                                                    type="number"
                                                    allowDecimals={false}
                                                    tick={{ fontSize: 12 }}
                                                />

                                                <YAxis
                                                    type="category"
                                                    dataKey="vendor"
                                                    width={135}
                                                    tick={{ fontSize: 12 }}
                                                />

                                                <Tooltip />

                                                <Legend />

                                                <Bar
                                                    dataKey="orders"
                                                    name="Orders"
                                                    fill="#0d6efd"
                                                    radius={[0, 5, 5, 0]}
                                                />

                                            </BarChart>

                                        </ResponsiveContainer>

                                    </div>

                                </div>

                            </div>


                            {/* VENDOR-WISE PROCUREMENT SPEND */}

                            <div className="col-lg-6">

                                <div
                                    className="card h-100"
                                    style={cardStyle}
                                >

                                    <div className="card-body p-4">

                                        <h5 className="fw-bold mb-1">
                                            Vendor-wise Procurement Spend
                                        </h5>

                                        <p className="text-muted small mb-3">
                                            Total procurement spend by each vendor
                                        </p>

                                        <ResponsiveContainer
                                            width="100%"
                                            height={330}
                                        >

                                            <BarChart
                                                layout="vertical"
                                                data={vendorSpendChartData}
                                                margin={{
                                                    top: 10,
                                                    right: 25,
                                                    left: 15,
                                                    bottom: 10
                                                }}
                                            >

                                                <CartesianGrid
                                                    strokeDasharray="3 3"
                                                />

                                                <XAxis
                                                    type="number"
                                                    tickFormatter={
                                                        value =>
                                                            `₹${Number(value).toLocaleString("en-IN")}`
                                                    }
                                                    tick={{ fontSize: 12 }}
                                                />

                                                <YAxis
                                                    type="category"
                                                    dataKey="vendor"
                                                    width={135}
                                                    tick={{ fontSize: 12 }}
                                                />

                                                <Tooltip
                                                    formatter={
                                                        value => [
                                                            `₹${Number(value).toLocaleString(
                                                                "en-IN",
                                                                {
                                                                    minimumFractionDigits: 2,
                                                                    maximumFractionDigits: 2
                                                                }
                                                            )}`,
                                                            "Spend"
                                                        ]
                                                    }
                                                />

                                                <Legend />

                                                <Bar
                                                    dataKey="spend"
                                                    name="Procurement Spend"
                                                    fill="#198754"
                                                    radius={[0, 5, 5, 0]}
                                                />

                                            </BarChart>

                                        </ResponsiveContainer>

                                    </div>

                                </div>

                            </div>


                            {/* CATEGORY-WISE PROCUREMENT SPEND */}

                            <div className="col-lg-6">

                                <div
                                    className="card h-100"
                                    style={cardStyle}
                                >

                                    <div className="card-body p-4">

                                        <h5 className="fw-bold mb-1">
                                            Category-wise Procurement Spend
                                        </h5>

                                        <p className="text-muted small mb-3">
                                            Total procurement spend by each category
                                        </p>

                                        <ResponsiveContainer
                                            width="100%"
                                            height={330}
                                        >

                                            <BarChart
                                                layout="vertical"
                                                data={categorySpendChartData}
                                                margin={{
                                                    top: 10,
                                                    right: 25,
                                                    left: 15,
                                                    bottom: 10
                                                }}
                                            >

                                                <CartesianGrid
                                                    strokeDasharray="3 3"
                                                />

                                                <XAxis
                                                    type="number"
                                                    tickFormatter={
                                                        value =>
                                                            `₹${Number(value).toLocaleString("en-IN")}`
                                                    }
                                                    tick={{ fontSize: 12 }}
                                                />

                                                <YAxis
                                                    type="category"
                                                    dataKey="category"
                                                    width={190}
                                                    tick={{ fontSize: 12 }}
                                                />

                                                <Tooltip
                                                    formatter={
                                                        value => [
                                                            `₹${Number(value).toLocaleString(
                                                                "en-IN",
                                                                {
                                                                    minimumFractionDigits: 2,
                                                                    maximumFractionDigits: 2
                                                                }
                                                            )}`,
                                                            "Spend"
                                                        ]
                                                    }
                                                />

                                                <Legend />

                                                <Bar
                                                    dataKey="spend"
                                                    name="Procurement Spend"
                                                    fill="#6f42c1"
                                                    radius={[0, 5, 5, 0]}
                                                />

                                            </BarChart>

                                        </ResponsiveContainer>

                                    </div>

                                </div>

                            </div>

                        </div>


                        {/* =================================================
                            MONTHLY PROCUREMENT SPEND
                        ================================================= */}

                        <div className="row g-4 mb-4">

                            <div className="col-12">

                                <div
                                    className="card"
                                    style={cardStyle}
                                >

                                    <div className="card-body p-4">

                                        <h5 className="fw-bold mb-1">
                                            Monthly Procurement Spend
                                        </h5>

                                        <p className="text-muted small mb-3">
                                            Completed/valid procurement spend grouped by month
                                        </p>

                                        {monthlySpendChartData.length === 0 ? (

                                            <div className="text-center text-muted py-5">
                                                No monthly procurement spend data available.
                                            </div>

                                        ) : (

                                            <ResponsiveContainer
                                                width="100%"
                                                height={360}
                                            >

                                                <LineChart
                                                    data={monthlySpendChartData}
                                                    margin={{
                                                        top: 15,
                                                        right: 25,
                                                        left: 10,
                                                        bottom: 30
                                                    }}
                                                >

                                                    <CartesianGrid
                                                        strokeDasharray="3 3"
                                                    />

                                                    <XAxis
                                                        dataKey="month"
                                                        interval="preserveStartEnd"
                                                        angle={0}
                                                        textAnchor="middle"
                                                        height={35}
                                                        tickMargin={8}
                                                        tick={{ fontSize: 12 }}
                                                    />

                                                    <YAxis
                                                        tickFormatter={
                                                            value =>
                                                                `₹${Number(value).toLocaleString("en-IN")}`
                                                        }
                                                    />

                                                    <Tooltip
                                                        formatter={
                                                            value => [
                                                                `₹${Number(value).toLocaleString(
                                                                    "en-IN",
                                                                    {
                                                                        minimumFractionDigits: 2,
                                                                        maximumFractionDigits: 2
                                                                    }
                                                                )}`,
                                                                "Procurement Spend"
                                                            ]
                                                        }
                                                    />

                                                    <Legend />

                                                    <Line
                                                        type="monotone"
                                                        dataKey="spend"
                                                        name="Procurement Spend"
                                                        stroke="#0d6efd"
                                                        strokeWidth={3}
                                                        activeDot={{
                                                            r: 6
                                                        }}
                                                    />

                                                </LineChart>

                                            </ResponsiveContainer>

                                        )}

                                    </div>

                                </div>

                            </div>

                        </div>


                        {/* DELIVERY PROGRESS */}

                        <div
                            className="card mb-4"
                            style={cardStyle}
                        >

                            <div className="card-body">

                                <div className="d-flex justify-content-between align-items-center">

                                    <div>

                                        <h5 className="fw-bold">
                                            🚚 Overall Delivery Progress
                                        </h5>

                                        <p className="text-muted mb-0">
                                            Total quantity delivered
                                            across all purchase orders.
                                        </p>

                                    </div>


                                    <div className="text-end">

                                        <h2 className="fw-bold text-success mb-0">

                                            {totalDeliveredQuantity}
                                            /
                                            {totalOrderedQuantity}

                                        </h2>

                                        <small className="text-muted">
                                            Units Delivered
                                        </small>

                                    </div>

                                </div>


                                <div
                                    className="progress mt-3"
                                    style={{
                                        height: "25px"
                                    }}
                                >

                                    <div
                                        className="progress-bar bg-success"
                                        style={{
                                            width:
                                                `${deliveryPercentage}%`
                                        }}
                                    >

                                        {deliveryPercentage}%

                                    </div>

                                </div>

                            </div>

                        </div>


                        {/* REQUEST WORKFLOW */}

                        <h4 className="fw-bold mb-3">
                            Request Workflow Summary
                        </h4>


                        <div className="row g-4 mb-4">


                            <div className="col-md-4">

                                <div
                                    className="card"
                                    style={cardStyle}
                                >

                                    <div className="card-body">

                                        <small className="text-muted">
                                            PENDING REQUESTS
                                        </small>

                                        <h2 className="text-warning fw-bold">
                                            {pendingRequests}
                                        </h2>

                                    </div>

                                </div>

                            </div>


                            <div className="col-md-4">

                                <div
                                    className="card"
                                    style={cardStyle}
                                >

                                    <div className="card-body">

                                        <small className="text-muted">
                                            REQUESTS IN PROGRESS
                                        </small>

                                        <h2 className="text-info fw-bold">
                                            {requestsInProgress}
                                        </h2>

                                    </div>

                                </div>

                            </div>


                            <div className="col-md-4">

                                <div
                                    className="card"
                                    style={cardStyle}
                                >

                                    <div className="card-body">

                                        <small className="text-muted">
                                            COMPLETED REQUESTS
                                        </small>

                                        <h2 className="text-success fw-bold">
                                            {completedRequests}
                                        </h2>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </>

                )}


                {/* =================================================
                    PO TRACKING TAB
                ================================================= */}

                {activeTab === "tracking" && (

                    <>

                        <h3 className="fw-bold mb-4">
                            📍 Purchase Order Tracking
                        </h3>


                        {/* FILTERS */}

                        <div
                            className="card mb-4"
                            style={cardStyle}
                        >

                            <div className="card-body">

                                <div className="row g-3">


                                    <div className="col-md-4">

                                        <label
                                            className="form-label fw-bold"
                                            style={{
                                                fontSize: "16px"
                                            }}
                                        >
                                            Search
                                        </label>

                                        <input
                                            type="text"
                                            className="form-control"
                                            style={{
                                                fontSize: "16px",
                                                padding: "10px"
                                            }}
                                            placeholder="PO number, vendor or item"
                                            value={
                                                searchTerm
                                            }
                                            onChange={
                                                e =>
                                                    setSearchTerm(
                                                        e.target.value
                                                    )
                                            }
                                        />

                                    </div>


                                    <div className="col-md-4">

                                        <label
                                            className="form-label fw-bold"
                                            style={{
                                                fontSize: "16px"
                                            }}
                                        >
                                            Status
                                        </label>

                                        <select
                                            className="form-select"
                                            style={{
                                                fontSize: "16px",
                                                padding: "10px"
                                            }}
                                            value={
                                                statusFilter
                                            }
                                            onChange={
                                                e =>
                                                    setStatusFilter(
                                                        e.target.value
                                                    )
                                            }
                                        >

                                            <option value="ALL">
                                                All Statuses
                                            </option>

                                            <option value="CREATED">
                                                Waiting for Vendor
                                            </option>

                                            <option value="SENT">
                                                Sent to Vendor
                                            </option>

                                            <option value="ACCEPTED">
                                                Accepted by Vendor
                                            </option>

                                            <option value="SHIPPED">
                                                Shipped by Vendor
                                            </option>

                                            <option value="PARTIALLY_DELIVERED">
                                                Partially Delivered
                                            </option>

                                            <option value="DELIVERED">
                                                Delivered
                                            </option>

                                            <option value="CLOSED">
                                                Closed
                                            </option>

                                            <option value="REJECTED">
                                                Rejected
                                            </option>

                                        </select>

                                    </div>


                                    <div className="col-md-4">

                                        <label
                                            className="form-label fw-bold"
                                            style={{
                                                fontSize: "16px"
                                            }}
                                        >
                                            Vendor
                                        </label>

                                        <select
                                            className="form-select"
                                            style={{
                                                fontSize: "16px",
                                                padding: "10px"
                                            }}
                                            value={
                                                vendorFilter
                                            }
                                            onChange={
                                                e =>
                                                    setVendorFilter(
                                                        e.target.value
                                                    )
                                            }
                                        >

                                            <option value="ALL">
                                                All Vendors
                                            </option>

                                            {suppliers.map(
                                                supplier => (

                                                    <option
                                                        key={
                                                            supplier.id
                                                        }
                                                        value={
                                                            supplier.supplierName
                                                        }
                                                    >
                                                        {
                                                            supplier.supplierName
                                                        }
                                                    </option>

                                                )
                                            )}

                                        </select>

                                    </div>


                                    <div className="col-12">

                                        <button
                                            className="btn btn-outline-secondary"
                                            style={{
                                                fontSize: "16px"
                                            }}
                                            onClick={() => {

                                                setSearchTerm("");
                                                setStatusFilter("ALL");
                                                setVendorFilter("ALL");

                                            }}
                                        >
                                            Clear Filters
                                        </button>

                                    </div>

                                </div>

                            </div>

                        </div>


                        {/* TRACKING TABLE */}

                        <div
                            className="card"
                            style={cardStyle}
                        >

                            <div
                                className="card-header bg-dark text-white"
                            >

                                <h5 className="mb-0">
                                    Purchase Order Tracking
                                </h5>

                            </div>


                            <div className="table-responsive">

                                <table className="table table-hover mb-0 align-middle">

                                    <thead>

                                        <tr>

                                            <th>
                                                PO Number
                                            </th>

                                            <th>
                                                Vendor
                                            </th>

                                            <th>
                                                Item
                                            </th>

                                            <th>
                                                Quantity
                                            </th>

                                            <th>
                                                Delivered
                                            </th>

                                            <th>
                                                Status
                                            </th>

                                            <th>
                                                Action
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {filteredPurchaseOrders.length === 0 ? (

                                            <tr>

                                                <td
                                                    colSpan="7"
                                                    className="text-center py-4"
                                                >
                                                    No purchase orders
                                                    match the selected
                                                    filters.
                                                </td>

                                            </tr>

                                        ) : (

                                            filteredPurchaseOrders.map(
                                                po => (

                                                    <tr
                                                        key={
                                                            po.id
                                                        }
                                                    >

                                                        <td className="fw-bold">
                                                            {
                                                                po.poNumber
                                                            }
                                                        </td>

                                                        <td>
                                                            {
                                                                po.vendorName
                                                            }
                                                        </td>

                                                        <td>
                                                            {
                                                                po.itemName
                                                            }
                                                        </td>

                                                        <td>
                                                            {
                                                                po.quantity
                                                            }
                                                        </td>

                                                        <td>
                                                            {
                                                                po.deliveredQuantity ||
                                                                0
                                                            }
                                                            /
                                                            {
                                                                po.quantity
                                                            }
                                                        </td>

                                                        <td>

                                                            <span
                                                                className={`badge bg-${getStatusColor(
                                                                    po.status
                                                                )}`}
                                                            >
                                                                {
                                                                    getStatusText(
                                                                        po.status
                                                                    )
                                                                }
                                                            </span>

                                                        </td>

                                                        <td>

                                                            <button
                                                                className="btn btn-sm btn-outline-primary"
                                                                onClick={() =>
                                                                    setSelectedPO(
                                                                        po
                                                                    )
                                                                }
                                                            >
                                                                👁 View
                                                            </button>

                                                        </td>

                                                    </tr>

                                                )
                                            )

                                        )}

                                    </tbody>

                                </table>

                            </div>

                        </div>

                    </>

                )}


                {/* =================================================
                    PROCUREMENT REQUESTS TAB
                ================================================= */}

                {activeTab === "requests" && (

                    <>

                        <h3 className="fw-bold mb-4">
                            📋 Procurement Requests
                        </h3>


                        {availableRequests.length === 0 ? (

                            <div
                                className="alert alert-success"
                                style={{
                                    borderRadius: "15px"
                                }}
                            >
                                No pending procurement requests
                                available.
                            </div>

                        ) : (

                            availableRequests.map(
                                request => (

                                    <div
                                        key={
                                            request.requestId
                                        }
                                        className="card mb-4"
                                        style={cardStyle}
                                    >

                                        <div className="card-body p-4">

                                            <div className="row">


                                                <div className="col-lg-8">

                                                    <h4 className="text-primary fw-bold">
                                                        {
                                                            request.title
                                                        }
                                                    </h4>

                                                    <p>
                                                        <strong>
                                                            Description:
                                                        </strong>{" "}
                                                        {
                                                            request.description
                                                        }
                                                    </p>

                                                    <p>
                                                        <strong>
                                                            Category:
                                                        </strong>{" "}
                                                        {
                                                            request.category
                                                        }
                                                    </p>

                                                    <p>
                                                        <strong>
                                                            Quantity:
                                                        </strong>{" "}
                                                        {
                                                            request.quantity
                                                        }
                                                    </p>

                                                    <p>
                                                        <strong>
                                                            Priority:
                                                        </strong>{" "}

                                                        <span
                                                            className={`badge bg-${getPriorityBadge(
                                                                request.priority
                                                            )}`}
                                                        >
                                                            {
                                                                request.priority
                                                            }
                                                        </span>

                                                    </p>

                                                </div>


                                                <div className="col-lg-4 text-lg-end">

                                                    <span
                                                        className={`badge bg-${getRequestStatusBadge(
                                                            request.status
                                                        )} mb-3`}
                                                    >
                                                        {
                                                            request.status
                                                        }
                                                    </span>


                                                    {request.status ===
                                                        "PENDING_PROCUREMENT" && (

                                                            <button
                                                                className="btn btn-primary d-block ms-lg-auto"
                                                                onClick={() =>
                                                                    startProcurement(
                                                                        request.requestId
                                                                    )
                                                                }
                                                            >
                                                                Start Procurement
                                                            </button>

                                                        )}

                                                </div>

                                            </div>


                                            {/* PO FORM */}

                                            {request.status ===
                                                "PROCUREMENT_IN_PROGRESS" && (

                                                    <div className="border-top pt-4 mt-4">

                                                        <h5 className="fw-bold mb-3">
                                                            Generate Purchase Order
                                                        </h5>


                                                        <div className="row g-3">


                                                            <div className="col-md-6">

                                                                <label className="form-label fw-bold">
                                                                    Select Vendor
                                                                </label>

                                                                <select
                                                                    className="form-select"
                                                                    value={
                                                                        poData[
                                                                            request.requestId
                                                                        ]?.supplierId ||
                                                                        ""
                                                                    }
                                                                    onChange={
                                                                        e => {

                                                                            const supplier =
                                                                                suppliers.find(
                                                                                    s =>
                                                                                        s.id ===
                                                                                        Number(
                                                                                            e.target
                                                                                                .value
                                                                                        )
                                                                                );


                                                                            if (
                                                                                !supplier
                                                                            )
                                                                                return;


                                                                            setPoData(
                                                                                {
                                                                                    ...poData,

                                                                                    [request.requestId]:
                                                                                    {

                                                                                        ...poData[
                                                                                            request
                                                                                                .requestId
                                                                                        ],

                                                                                        supplierId:
                                                                                            supplier.id,

                                                                                        vendorName:
                                                                                            supplier.supplierName,

                                                                                        vendorEmail:
                                                                                            supplier.email

                                                                                    }

                                                                                }
                                                                            );

                                                                        }
                                                                    }
                                                                >

                                                                    <option value="">
                                                                        Select Vendor
                                                                    </option>

                                                                    {suppliers.map(
                                                                        supplier => (

                                                                            <option
                                                                                key={
                                                                                    supplier.id
                                                                                }
                                                                                value={
                                                                                    supplier.id
                                                                                }
                                                                            >
                                                                                {
                                                                                    supplier.supplierName
                                                                                }
                                                                            </option>

                                                                        )
                                                                    )}

                                                                </select>

                                                            </div>


                                                            <div className="col-md-6">

                                                                <label className="form-label fw-bold">
                                                                    Unit Price
                                                                </label>

                                                                <input
                                                                    type="number"
                                                                    className="form-control"
                                                                    placeholder="Enter unit price"
                                                                    value={
                                                                        poData[
                                                                            request.requestId
                                                                        ]?.unitPrice ||
                                                                        ""
                                                                    }
                                                                    onChange={
                                                                        e =>
                                                                            setPoData(
                                                                                {
                                                                                    ...poData,

                                                                                    [request.requestId]:
                                                                                    {

                                                                                        ...poData[
                                                                                            request
                                                                                                .requestId
                                                                                        ],

                                                                                        unitPrice:
                                                                                            e.target
                                                                                                .value

                                                                                    }

                                                                                }
                                                                            )
                                                                    }
                                                                />


                                                                <div className="mt-2">

                                                                    <strong>
                                                                        Total Amount:
                                                                    </strong>{" "}

                                                                    ₹
                                                                    {(
                                                                        Number(
                                                                            poData[
                                                                                request.requestId
                                                                            ]?.unitPrice ||
                                                                            0
                                                                        ) *
                                                                        Number(
                                                                            request.quantity ||
                                                                            0
                                                                        )
                                                                    ).toFixed(
                                                                        2
                                                                    )}

                                                                </div>

                                                            </div>


                                                            <div className="col-md-6">

                                                                <label className="form-label fw-bold">
                                                                    Expected Delivery Date
                                                                </label>

                                                                <input
                                                                    type="date"
                                                                    className="form-control"
                                                                    value={
                                                                        poData[
                                                                            request.requestId
                                                                        ]?.expectedDeliveryDate ||
                                                                        ""
                                                                    }
                                                                    onChange={
                                                                        e =>
                                                                            setPoData(
                                                                                {
                                                                                    ...poData,

                                                                                    [request.requestId]:
                                                                                    {

                                                                                        ...poData[
                                                                                            request
                                                                                                .requestId
                                                                                        ],

                                                                                        expectedDeliveryDate:
                                                                                            e.target
                                                                                                .value

                                                                                    }

                                                                                }
                                                                            )
                                                                    }
                                                                />

                                                            </div>

                                                        </div>


                                                        <button
                                                            className="btn btn-primary mt-4"
                                                            disabled={
                                                                loading
                                                            }
                                                            onClick={() =>
                                                                generatePurchaseOrder(
                                                                    request
                                                                )
                                                            }
                                                        >
                                                            {loading
                                                                ? "Creating..."
                                                                : "Generate Purchase Order"}
                                                        </button>

                                                    </div>

                                                )}

                                        </div>

                                    </div>

                                )
                            )

                        )}

                    </>

                )}


                {/* =================================================
                    PURCHASE ORDERS TAB
                ================================================= */}

                {activeTab === "orders" && (

                    <>

                        <h3 className="fw-bold mb-4">
                            📦 Purchase Orders
                        </h3>


                        {purchaseOrders.length === 0 ? (

                            <div className="alert alert-info">
                                No Purchase Orders Found.
                            </div>

                        ) : (

                            purchaseOrders.map(
                                po => (

                                    <div
                                        key={
                                            po.id
                                        }
                                        className="card mb-4"
                                        style={cardStyle}
                                    >

                                        <div className="card-body p-4">

                                            <div className="row">


                                                <div className="col-lg-8">

                                                    <h4 className="text-primary fw-bold">
                                                        {
                                                            po.poNumber
                                                        }
                                                    </h4>

                                                    <p>
                                                        <strong>
                                                            Vendor:
                                                        </strong>{" "}
                                                        {
                                                            po.vendorName
                                                        }
                                                    </p>

                                                    <p>
                                                        <strong>
                                                            Item:
                                                        </strong>{" "}
                                                        {
                                                            po.itemName
                                                        }
                                                    </p>

                                                    <p>
                                                        <strong>
                                                            Quantity:
                                                        </strong>{" "}
                                                        {
                                                            po.quantity
                                                        }
                                                    </p>

                                                    <p>
                                                        <strong>
                                                            Delivered:
                                                        </strong>{" "}
                                                        {
                                                            po.deliveredQuantity ||
                                                            0
                                                        }
                                                        /
                                                        {
                                                            po.quantity
                                                        }
                                                    </p>

                                                    <p>
                                                        <strong>
                                                            Total:
                                                        </strong>{" "}
                                                        ₹
                                                        {
                                                            po.totalAmount
                                                        }
                                                    </p>

                                                    <p>
                                                        <strong>
                                                            Expected Delivery:
                                                        </strong>{" "}
                                                        {
                                                            po.expectedDeliveryDate
                                                        }
                                                    </p>

                                                </div>


                                                <div className="col-lg-4 text-lg-end">

                                                    <span
                                                        className={`badge bg-${getStatusColor(
                                                            po.status
                                                        )} mb-3`}
                                                        style={{
                                                            fontSize:
                                                                "14px",
                                                            padding:
                                                                "9px 14px"
                                                        }}
                                                    >
                                                        {
                                                            getStatusText(
                                                                po.status
                                                            )
                                                        }
                                                    </span>


                                                    <div>

                                                        <button
                                                            className="btn btn-outline-primary"
                                                            onClick={() =>
                                                                setSelectedPO(
                                                                    po
                                                                )
                                                            }
                                                        >
                                                            👁 View Details
                                                        </button>

                                                    </div>

                                                </div>

                                            </div>


                                            {/* =================================
                                                STATUS INFORMATION
                                            ================================= */}

                                            {po.status === "CREATED" && (

                                                <div className="alert alert-primary mt-4 mb-0">

                                                    <strong>
                                                        Purchase Order Created
                                                    </strong>

                                                    <br />

                                                    Waiting for vendor
                                                    to accept the order.

                                                </div>

                                            )}


                                            {po.status === "SENT" && (

                                                <div className="alert alert-warning mt-4 mb-0">

                                                    <strong>
                                                        Waiting for Vendor
                                                    </strong>

                                                    <br />

                                                    The purchase order
                                                    has been sent to the
                                                    vendor and is waiting
                                                    for acceptance.

                                                </div>

                                            )}


                                            {po.status === "ACCEPTED" && (

                                                <div className="alert alert-info mt-4 mb-0">

                                                    <strong>
                                                        ✓ Accepted by Vendor
                                                    </strong>

                                                    <br />

                                                    Waiting for the vendor
                                                    to ship the order.

                                                </div>

                                            )}


                                            {po.status === "SHIPPED" && (

                                                <div className="alert alert-warning mt-4">

                                                    <strong>
                                                        🚚 Shipped by Vendor
                                                    </strong>

                                                    <br />

                                                    The vendor has shipped
                                                    this order.

                                                    <hr />

                                                    <strong>
                                                        Procurement Action:
                                                    </strong>

                                                    <div className="row g-2 mt-2">

                                                        <div className="col-md-4">

                                                            <input
                                                                type="number"
                                                                min="1"
                                                                max={
                                                                    Number(
                                                                        po.quantity
                                                                    ) -
                                                                    Number(
                                                                        po.deliveredQuantity ||
                                                                        0
                                                                    )
                                                                }
                                                                className="form-control"
                                                                placeholder="Quantity received"
                                                                value={
                                                                    deliveryData[
                                                                        po.id
                                                                    ] ||
                                                                    ""
                                                                }
                                                                onChange={
                                                                    e =>
                                                                        setDeliveryData(
                                                                            {
                                                                                ...deliveryData,

                                                                                [po.id]:
                                                                                    e.target
                                                                                        .value
                                                                            }
                                                                        )
                                                                }
                                                            />

                                                        </div>


                                                        <div className="col-md-auto">

                                                            <button
                                                                className="btn btn-warning"
                                                                onClick={() =>
                                                                    updateDeliveryStatus(
                                                                        po,
                                                                        "PARTIALLY_DELIVERED"
                                                                    )
                                                                }
                                                            >
                                                                Partially Delivered
                                                            </button>

                                                        </div>


                                                        <div className="col-md-auto">

                                                            <button
                                                                className="btn btn-success"
                                                                onClick={() =>
                                                                    updateDeliveryStatus(
                                                                        po,
                                                                        "DELIVERED"
                                                                    )
                                                                }
                                                            >
                                                                Mark Delivered
                                                            </button>

                                                        </div>

                                                    </div>

                                                </div>

                                            )}


                                            {po.status ===
                                                "PARTIALLY_DELIVERED" && (

                                                    <div className="alert alert-secondary mt-4">

                                                        <strong>
                                                            📦 Partially Delivered
                                                        </strong>

                                                        <br />

                                                        Delivered:

                                                        {" "}

                                                        {
                                                            po.deliveredQuantity ||
                                                            0
                                                        }

                                                        /

                                                        {
                                                            po.quantity
                                                        }

                                                        <hr />

                                                        <strong>
                                                            Remaining Quantity:
                                                        </strong>{" "}

                                                        {
                                                            Number(
                                                                po.quantity
                                                            ) -
                                                            Number(
                                                                po.deliveredQuantity ||
                                                                0
                                                            )
                                                        }


                                                        <div className="row g-2 mt-3">

                                                            <div className="col-md-4">

                                                                <input
                                                                    type="number"
                                                                    min="1"
                                                                    max={
                                                                        Number(
                                                                            po.quantity
                                                                        ) -
                                                                        Number(
                                                                            po.deliveredQuantity ||
                                                                            0
                                                                        )
                                                                    }
                                                                    className="form-control"
                                                                    placeholder="Additional quantity"
                                                                    value={
                                                                        deliveryData[
                                                                            po.id
                                                                        ] ||
                                                                        ""
                                                                    }
                                                                    onChange={
                                                                        e =>
                                                                            setDeliveryData(
                                                                                {
                                                                                    ...deliveryData,

                                                                                    [po.id]:
                                                                                        e.target
                                                                                            .value
                                                                                }
                                                                            )
                                                                    }
                                                                />

                                                            </div>


                                                            <div className="col-md-auto">

                                                                <button
                                                                    className="btn btn-success"
                                                                    onClick={() =>
                                                                        updateDeliveryStatus(
                                                                            po,
                                                                            Number(
                                                                                po.deliveredQuantity ||
                                                                                0
                                                                            ) +
                                                                            Number(
                                                                                deliveryData[
                                                                                    po.id
                                                                                ] ||
                                                                                0
                                                                            ) >=
                                                                            Number(
                                                                                po.quantity
                                                                            )
                                                                                ? "DELIVERED"
                                                                                : "PARTIALLY_DELIVERED"
                                                                        )
                                                                    }
                                                                >
                                                                    Update Delivery
                                                                </button>

                                                            </div>

                                                        </div>

                                                    </div>

                                                )}


                                            {po.status ===
                                                "DELIVERED" && (

                                                    <div className="alert alert-success mt-4">

                                                        <strong>
                                                            ✓ Delivery Completed
                                                        </strong>

                                                        <br />

                                                        All ordered items
                                                        have been received.

                                                        <div className="mt-3">

                                                            <button
                                                                className="btn btn-success"
                                                                onClick={() =>
                                                                    updateDeliveryStatus(
                                                                        po,
                                                                        "CLOSED"
                                                                    )
                                                                }
                                                            >
                                                                Close Purchase Order
                                                            </button>

                                                        </div>

                                                    </div>

                                                )}


                                            {po.status === "CLOSED" && (

                                                <div className="alert alert-success mt-4 mb-0">

                                                    <strong>
                                                        ✓ Purchase Order Closed
                                                    </strong>

                                                    <br />

                                                    Procurement process
                                                    completed successfully.

                                                </div>

                                            )}


                                            {po.status === "REJECTED" && (

                                                <div className="alert alert-danger mt-4 mb-0">

                                                    <strong>
                                                        ✖ Rejected by Vendor
                                                    </strong>

                                                    <br />

                                                    This purchase order
                                                    was rejected by the
                                                    vendor.

                                                </div>

                                            )}

                                        </div>

                                    </div>

                                )
                            )

                        )}

                    </>

                )}

            </div>


            {/* =====================================================
                PURCHASE ORDER DETAILS MODAL
            ===================================================== */}

            {selectedPO && (

                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background:
                            "rgba(0,0,0,.55)",
                        zIndex: 9999,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: "20px"
                    }}
                    onClick={() =>
                        setSelectedPO(null)
                    }
                >

                    <div
                        className="card"
                        style={{
                            width: "100%",
                            maxWidth: "850px",
                            maxHeight: "90vh",
                            overflowY: "auto",
                            borderRadius: "18px"
                        }}
                        onClick={e =>
                            e.stopPropagation()
                        }
                    >

                        <div
                            className="card-header text-white d-flex justify-content-between align-items-center"
                            style={{
                                background:
                                    "#0d6efd"
                            }}
                        >

                            <h5 className="mb-0">
                                Purchase Order Details
                            </h5>


                            <button
                                className="btn btn-light btn-sm"
                                onClick={() =>
                                    setSelectedPO(null)
                                }
                            >
                                ✕ Close
                            </button>

                        </div>


                        <div className="card-body">

                            <h3 className="text-primary fw-bold mb-3">
                                {
                                    selectedPO.poNumber
                                }
                            </h3>


                            <div className="row g-4">


                                <div className="col-md-4">

                                    <strong>
                                        Vendor
                                    </strong>

                                    <p>
                                        {
                                            selectedPO.vendorName
                                        }
                                    </p>

                                </div>


                                <div className="col-md-4">

                                    <strong>
                                        Vendor Email
                                    </strong>

                                    <p>
                                        {
                                            selectedPO.vendorEmail ||
                                            "N/A"
                                        }
                                    </p>

                                </div>


                                <div className="col-md-4">

                                    <strong>
                                        Item
                                    </strong>

                                    <p>
                                        {
                                            selectedPO.itemName
                                        }
                                    </p>

                                </div>


                                <div className="col-md-4">

                                    <strong>
                                        Quantity
                                    </strong>

                                    <p>
                                        {
                                            selectedPO.quantity
                                        }
                                    </p>

                                </div>


                                <div className="col-md-4">

                                    <strong>
                                        Delivered Quantity
                                    </strong>

                                    <p>
                                        {
                                            selectedPO.deliveredQuantity ||
                                            0
                                        }
                                    </p>

                                </div>


                                <div className="col-md-4">

                                    <strong>
                                        Unit Price
                                    </strong>

                                    <p>
                                        ₹
                                        {
                                            selectedPO.unitPrice
                                        }
                                    </p>

                                </div>


                                <div className="col-md-4">

                                    <strong>
                                        Total Amount
                                    </strong>

                                    <p>
                                        ₹
                                        {
                                            selectedPO.totalAmount
                                        }
                                    </p>

                                </div>


                                <div className="col-md-4">

                                    <strong>
                                        Expected Delivery
                                    </strong>

                                    <p>
                                        {
                                            selectedPO.expectedDeliveryDate
                                        }
                                    </p>

                                </div>


                                <div className="col-md-4">

                                    <strong>
                                        Current Status
                                    </strong>

                                    <p>

                                        <span
                                            className={`badge bg-${getStatusColor(
                                                selectedPO.status
                                            )}`}
                                        >
                                            {
                                                getStatusText(
                                                    selectedPO.status
                                                )
                                            }
                                        </span>

                                    </p>

                                </div>

                            </div>


                            <hr />


                            {/* MODAL ACTIONS */}

                            {selectedPO.status ===
                                "SHIPPED" && (

                                    <div className="alert alert-warning">

                                        <strong>
                                            🚚 Vendor has shipped this order.
                                        </strong>

                                        <p className="mb-3">
                                            Procurement officer must now
                                            record the received quantity.
                                        </p>


                                        <div className="row g-2">

                                            <div className="col-md-4">

                                                <input
                                                    type="number"
                                                    min="1"
                                                    max={
                                                        Number(
                                                            selectedPO.quantity
                                                        ) -
                                                        Number(
                                                            selectedPO.deliveredQuantity ||
                                                            0
                                                        )
                                                    }
                                                    className="form-control"
                                                    placeholder="Received quantity"
                                                    value={
                                                        deliveryData[
                                                            selectedPO.id
                                                        ] ||
                                                        ""
                                                    }
                                                    onChange={
                                                        e =>
                                                            setDeliveryData(
                                                                {
                                                                    ...deliveryData,

                                                                    [selectedPO.id]:
                                                                        e.target
                                                                            .value
                                                                }
                                                            )
                                                    }
                                                />

                                            </div>


                                            <div className="col-md-auto">

                                                <button
                                                    className="btn btn-warning"
                                                    onClick={() => {

                                                        updateDeliveryStatus(
                                                            selectedPO,
                                                            "PARTIALLY_DELIVERED"
                                                        );

                                                    }}
                                                >
                                                    Partially Delivered
                                                </button>

                                            </div>


                                            <div className="col-md-auto">

                                                <button
                                                    className="btn btn-success"
                                                    onClick={() => {

                                                        updateDeliveryStatus(
                                                            selectedPO,
                                                            "DELIVERED"
                                                        );

                                                    }}
                                                >
                                                    Mark Delivered
                                                </button>

                                            </div>

                                        </div>

                                    </div>

                                )}


                            {selectedPO.status ===
                                "PARTIALLY_DELIVERED" && (

                                    <div className="alert alert-secondary">

                                        <strong>
                                            📦 Partial Delivery
                                        </strong>

                                        <p>
                                            Delivered:
                                            {" "}
                                            {
                                                selectedPO.deliveredQuantity ||
                                                0
                                            }
                                            /
                                            {
                                                selectedPO.quantity
                                            }
                                        </p>

                                        <p>
                                            Remaining:
                                            {" "}
                                            {
                                                Number(
                                                    selectedPO.quantity
                                                ) -
                                                Number(
                                                    selectedPO.deliveredQuantity ||
                                                    0
                                                )
                                            }
                                        </p>


                                        <div className="row g-2">

                                            <div className="col-md-4">

                                                <input
                                                    type="number"
                                                    min="1"
                                                    max={
                                                        Number(
                                                            selectedPO.quantity
                                                        ) -
                                                        Number(
                                                            selectedPO.deliveredQuantity ||
                                                            0
                                                        )
                                                    }
                                                    className="form-control"
                                                    placeholder="Additional quantity"
                                                    value={
                                                        deliveryData[
                                                            selectedPO.id
                                                        ] ||
                                                        ""
                                                    }
                                                    onChange={
                                                        e =>
                                                            setDeliveryData(
                                                                {
                                                                    ...deliveryData,

                                                                    [selectedPO.id]:
                                                                        e.target
                                                                            .value
                                                                }
                                                            )
                                                    }
                                                />

                                            </div>


                                            <div className="col-md-auto">

                                                <button
                                                    className="btn btn-success"
                                                    onClick={() =>
                                                        updateDeliveryStatus(
                                                            selectedPO,

                                                            Number(
                                                                selectedPO.deliveredQuantity ||
                                                                0
                                                            ) +
                                                            Number(
                                                                deliveryData[
                                                                    selectedPO.id
                                                                ] ||
                                                                0
                                                            ) >=
                                                            Number(
                                                                selectedPO.quantity
                                                            )
                                                                ? "DELIVERED"
                                                                : "PARTIALLY_DELIVERED"
                                                        )
                                                    }
                                                >
                                                    Update Delivery
                                                </button>

                                            </div>

                                        </div>

                                    </div>

                                )}


                            {selectedPO.status ===
                                "DELIVERED" && (

                                    <div className="alert alert-success">

                                        <strong>
                                            ✓ All Items Delivered
                                        </strong>

                                        <br />

                                        Procurement officer can now
                                        close this purchase order.


                                        <div className="mt-3">

                                            <button
                                                className="btn btn-success"
                                                onClick={() => {

                                                    updateDeliveryStatus(
                                                        selectedPO,
                                                        "CLOSED"
                                                    );

                                                }}
                                            >
                                                Close Purchase Order
                                            </button>

                                        </div>

                                    </div>

                                )}


                            {(
                                selectedPO.status ===
                                    "CREATED" ||

                                selectedPO.status ===
                                    "SENT"
                            ) && (

                                    <div className="alert alert-primary">

                                        <strong>
                                            Waiting for Vendor
                                        </strong>

                                        <br />

                                        The vendor must accept this
                                        purchase order.

                                    </div>

                                )}


                            {selectedPO.status ===
                                "ACCEPTED" && (

                                    <div className="alert alert-info">

                                        <strong>
                                            ✓ Accepted by Vendor
                                        </strong>

                                        <br />

                                        Waiting for the vendor to
                                        mark the order as shipped.

                                    </div>

                                )}


                            {selectedPO.status ===
                                "REJECTED" && (

                                    <div className="alert alert-danger">

                                        <strong>
                                            ✖ Rejected by Vendor
                                        </strong>

                                        <br />

                                        No further procurement action
                                        is available for this order.

                                    </div>

                                )}


                            {selectedPO.status ===
                                "CLOSED" && (

                                    <div className="alert alert-success">

                                        <strong>
                                            ✓ Purchase Order Closed
                                        </strong>

                                        <br />

                                        This procurement cycle has
                                        been completed.

                                    </div>

                                )}

                        </div>

                    </div>

                </div>

            )}

        </div>

    );

}


export default ProcurementDashboard;