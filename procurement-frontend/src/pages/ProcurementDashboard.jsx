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

    /* PO Tracking filters */

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [vendorFilter, setVendorFilter] = useState("ALL");

    /* Reporting filters */

    const [reportFromDate, setReportFromDate] = useState("");
    const [reportToDate, setReportToDate] = useState("");
    const [reportVendor, setReportVendor] = useState("ALL");
    const [reportStatus, setReportStatus] = useState("ALL");
    const [reportCategory, setReportCategory] = useState("ALL");


    /* =========================================================
       LOAD DATA
    ========================================================= */

    useEffect(() => {

        loadAllData();

        const interval = setInterval(() => {
            loadAllData();
        }, 10000);

        return () => clearInterval(interval);

    }, []);


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

            console.error(
                "Dashboard refresh error:",
                error
            );

        } finally {

            setLoadingData(false);

        }

    };


    /* =========================================================
       LOAD REQUESTS
    ========================================================= */

    const loadRequests = async () => {

        try {

            const response = await axios.get(
                `${REQUEST_API}/procurement`
            );

            setRequests(response.data || []);

        } catch (error) {

            console.error(
                "Unable to load procurement requests:",
                error
            );

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

            setPurchaseOrders(
                response.data || []
            );

        } catch (error) {

            console.error(
                "Unable to load purchase orders:",
                error
            );

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

            /*
             * Procurement should only work with ACTIVE suppliers.
             *
             * The /suppliers endpoint intentionally returns all suppliers
             * because Admin Vendor Management must be able to view both
             * ACTIVE and INACTIVE vendors.
             *
             * Here we keep only ACTIVE suppliers for procurement operations.
             * This means an INACTIVE or BLOCKED supplier will no longer
             * appear in the Procurement Dashboard vendor list.
             */
            const activeSuppliers = (response.data || []).filter(
    supplier =>
        String(supplier.supplierStatus || "").toUpperCase() ===
        "ACTIVE"
            );

            setSuppliers(activeSuppliers);

            } catch (error) {

            console.error(
                "Unable to load suppliers:",
                error
            );

        }

    };


    /* =========================================================
       LOAD ANALYTICS
    ========================================================= */

    const loadAnalytics = async () => {

        try {

            const response = await axios.get(
                ANALYTICS_API
            );

            setAnalytics(
                response.data || null
            );

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

            alert(
                "Procurement Started Successfully"
            );

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

            const data =
                poData[request.requestId];

            if (!data || !data.supplierId) {

                alert(
                    "Please select a vendor."
                );

                return;

            }

            if (
                !data.unitPrice ||
                Number(data.unitPrice) <= 0
            ) {

                alert(
                    "Please enter a valid unit price."
                );

                return;

            }

            if (!data.expectedDeliveryDate) {

                alert(
                    "Please select expected delivery date."
                );

                return;

            }

            const today = new Date();

            const selectedDate =
                new Date(
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

       PROCUREMENT OFFICER:

       Vendor accepts
              ↓
       Vendor ships
              ↓
       Procurement records delivery
              ↓
       Partially Delivered / Delivered
              ↓
       Closed

       Procurement officer DOES NOT ship.
    ========================================================= */

    const updateDeliveryStatus = async (
        po,
        newStatus
    ) => {

        try {

            let deliveredQuantity = null;

            if (
                newStatus === "DELIVERED" ||
                newStatus === "PARTIALLY_DELIVERED"
            ) {

                const enteredQuantity =
                    Number(
                        deliveryData[po.id] || 0
                    );

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
                    Number(
                        po.deliveredQuantity || 0
                    );

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
                newStatus ===
                    "PARTIALLY_DELIVERED"

                    ? "Partial delivery recorded successfully."

                    : newStatus ===
                        "DELIVERED"

                    ? "Delivery completed successfully."

                    : "Purchase Order closed successfully."
            );


            setDeliveryData({
                ...deliveryData,
                [po.id]: ""
            });


            await loadPurchaseOrders();
            await loadRequests();
            await loadAnalytics();

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
       STATUS HELPERS
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
    ========================================================= */

    const analyticsPerformance =
        analytics?.performance || {};


    const totalPOs =
        Number.isFinite(
            Number(
                analyticsPerformance
                    .totalPurchaseOrders
            )
        )
            ? Number(
                analyticsPerformance
                    .totalPurchaseOrders
            )
            : purchaseOrders.length;


    const pendingPOs =
        Number.isFinite(
            Number(
                analyticsPerformance
                    .pendingPurchaseOrders
            )
        )
            ? Number(
                analyticsPerformance
                    .pendingPurchaseOrders
            )
            : purchaseOrders.filter(
                po =>
                    po.status === "CREATED" ||
                    po.status === "SENT"
            ).length;


    const inProgressPOs =
        Number.isFinite(
            Number(
                analyticsPerformance
                    .inProgressPurchaseOrders
            )
        )
            ? Number(
                analyticsPerformance
                    .inProgressPurchaseOrders
            )
            : purchaseOrders.filter(
                po =>
                    po.status === "ACCEPTED" ||
                    po.status === "SHIPPED" ||
                    po.status === "PARTIALLY_DELIVERED"
            ).length;


    const completedPOs =
        Number.isFinite(
            Number(
                analyticsPerformance
                    .completedPurchaseOrders
            )
        )
            ? Number(
                analyticsPerformance
                    .completedPurchaseOrders
            )
            : purchaseOrders.filter(
                po =>
                    po.status === "DELIVERED" ||
                    po.status === "CLOSED"
            ).length;


    const rejectedPOs =
        Number.isFinite(
            Number(
                analyticsPerformance
                    .rejectedPurchaseOrders
            )
        )
            ? Number(
                analyticsPerformance
                    .rejectedPurchaseOrders
            )
            : purchaseOrders.filter(
                po =>
                    po.status === "REJECTED" ||
                    po.status === "CANCELLED"
            ).length;


    const totalVendors =
        suppliers.length;


    /* =========================================================
       TASK 2 ANALYTICS
    ========================================================= */

    const totalProcurementSpend =
        Number(
            analytics?.totalProcurementSpend || 0
        );


    const completedPurchaseOrders =
        Number(
            analyticsPerformance
                .completedPurchaseOrders || 0
        );


    const rejectedPurchaseOrders =
        Number(
            analyticsPerformance
                .rejectedPurchaseOrders || 0
        );


    const completionRate =
        Number(
            analyticsPerformance
                .completionRate || 0
        );


    const rejectionRate =
        Number(
            analyticsPerformance
                .rejectionRate || 0
        );


    const costOptimization =
        analytics?.costOptimization || {};


    /* =========================================================
       DELIVERY ANALYTICS
    ========================================================= */

    const totalOrderedQuantity =
        purchaseOrders.reduce(
            (total, po) =>
                total +
                Number(
                    po.quantity || 0
                ),
            0
        );


    const totalDeliveredQuantity =
        purchaseOrders.reduce(
            (total, po) =>
                total +
                Number(
                    po.deliveredQuantity || 0
                ),
            0
        );


    const deliveryPercentage =
        totalOrderedQuantity > 0
            ? Math.round(
                (
                    totalDeliveredQuantity /
                    totalOrderedQuantity
                ) * 100
            )
            : 0;


    /* =========================================================
       REQUEST WORKFLOW
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
       CHART DATA
    ========================================================= */

    const statusChartData = [

        {
            name: "Completed",
            value:
                completedPurchaseOrders
        },

        {
            name: "In Progress",
            value:
                Number(
                    analyticsPerformance
                        .inProgressPurchaseOrders || 0
                )
        },

        {
            name: "Pending",
            value:
                Number(
                    analyticsPerformance
                        .pendingPurchaseOrders || 0
                )
        },

        {
            name: "Rejected",
            value:
                rejectedPurchaseOrders
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
            po.vendorName ||
            "Unknown Vendor";

        if (!vendorOrderMap[vendor]) {
            vendorOrderMap[vendor] = 0;
        }

        vendorOrderMap[vendor]++;

    });


    const vendorChartData =
        Object.keys(
            vendorOrderMap
        ).map(
            vendor => ({
                vendor,
                orders:
                    vendorOrderMap[vendor]
            })
        );


    const vendorSpendChartData =
        (
            analytics?.vendorWiseSpend ||
            []
        ).map(
            item => ({
                vendor:
                    item.name ||
                    "Unknown Vendor",

                spend:
                    Number(
                        item.spend || 0
                    )
            })
        );


    const categorySpendChartData =
        (
            analytics?.categoryWiseSpend ||
            []
        ).map(
            item => ({
                category:
                    item.name ||
                    "Unknown Category",

                spend:
                    Number(
                        item.spend || 0
                    )
            })
        );


    const monthlySpendChartData =
        (
            analytics?.monthlySpend ||
            []
        ).map(
            item => ({
                month:
                    item.month ||
                    "Unknown Month",

                spend:
                    Number(
                        item.spend || 0
                    )
            })
        );


    /* =========================================================
       AVAILABLE PROCUREMENT REQUESTS
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
       PO TRACKING FILTER
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
       REPORTING

       Category is obtained from the corresponding
       Purchase Request because PurchaseOrder itself
       does not directly store category.
    ========================================================= */

    const getRequestForPO = (po) => {

        return requests.find(
            request =>
                request.requestId ===
                po.purchaseRequestId
        );

    };


    const getPOCategory = (po) => {

        const request =
            getRequestForPO(po);

        return (
            request?.category ||
            po.category ||
            "N/A"
        );

    };


    const getPODate = (po) => {

        if (!po.createdAt) {
            return "";
        }

        return String(
            po.createdAt
        ).substring(0, 10);

    };


    const reportCategories =
        [
            ...new Set(
                purchaseOrders
                    .map(
                        po =>
                            getPOCategory(po)
                    )
                    .filter(
                        category =>
                            category &&
                            category !== "N/A"
                    )
            )
        ];


    const reportRows =
        purchaseOrders.filter(po => {

            const poDate =
                getPODate(po);

            const category =
                getPOCategory(po);


            const matchesFromDate =
                !reportFromDate ||
                poDate >= reportFromDate;


            const matchesToDate =
                !reportToDate ||
                poDate <= reportToDate;


            const matchesVendor =
                reportVendor === "ALL" ||
                po.vendorName ===
                    reportVendor;


            const matchesStatus =
                reportStatus === "ALL" ||
                po.status ===
                    reportStatus;


            const matchesCategory =
                reportCategory === "ALL" ||
                category ===
                    reportCategory;


            return (
                matchesFromDate &&
                matchesToDate &&
                matchesVendor &&
                matchesStatus &&
                matchesCategory
            );

        });


    const reportTotalSpend =
        reportRows.reduce(
            (sum, po) =>
                sum +
                Number(
                    po.totalAmount || 0
                ),
            0
        );


    const reportCompleted =
        reportRows.filter(
            po =>
                po.status ===
                    "DELIVERED" ||
                po.status ===
                    "CLOSED"
        ).length;


    const reportPending =
        reportRows.filter(
            po =>
                po.status ===
                    "CREATED" ||
                po.status ===
                    "SENT"
        ).length;


    const reportInProgress =
        reportRows.filter(
            po =>
                po.status ===
                    "ACCEPTED" ||
                po.status ===
                    "SHIPPED" ||
                po.status ===
                    "PARTIALLY_DELIVERED"
        ).length;


    const reportRejected =
        reportRows.filter(
            po =>
                po.status ===
                    "REJECTED" ||
                po.status ===
                    "CANCELLED"
        ).length;


    /* =========================================================
       REPORT FILTER CLEAR
    ========================================================= */

    const clearReportFilters = () => {

        setReportFromDate("");
        setReportToDate("");
        setReportVendor("ALL");
        setReportStatus("ALL");
        setReportCategory("ALL");

    };


    /* =========================================================
       EXCEL EXPORT

       Generates Excel-compatible HTML file.
    ========================================================= */

    const exportExcel = () => {

        if (reportRows.length === 0) {

            alert(
                "There is no report data to export."
            );

            return;

        }


        let html = `
        <html>
        <head>
        <meta charset="UTF-8">
        </head>
        <body>

        <h2>Procurement Operational Report</h2>

        <p>
        From:
        ${reportFromDate || "All Dates"}
        </p>

        <p>
        To:
        ${reportToDate || "All Dates"}
        </p>

        <p>
        Vendor:
        ${
            reportVendor === "ALL"
                ? "All Vendors"
                : reportVendor
        }
        </p>

        <p>
        Status:
        ${
            reportStatus === "ALL"
                ? "All Statuses"
                : getStatusText(reportStatus)
        }
        </p>

        <p>
        Category:
        ${
            reportCategory === "ALL"
                ? "All Categories"
                : reportCategory
        }
        </p>

        <br>

        <table border="1">

        <tr>
            <th>PO Number</th>
            <th>Vendor</th>
            <th>Item</th>
            <th>Category</th>
            <th>Quantity</th>
            <th>Delivered</th>
            <th>Unit Price</th>
            <th>Total Amount</th>
            <th>Status</th>
            <th>Expected Delivery</th>
            <th>Created Date</th>
        </tr>
        `;


        reportRows.forEach(po => {

            html += `
            <tr>

                <td>${po.poNumber || ""}</td>

                <td>${po.vendorName || ""}</td>

                <td>${po.itemName || ""}</td>

                <td>${getPOCategory(po)}</td>

                <td>${po.quantity || 0}</td>

                <td>${po.deliveredQuantity || 0}</td>

                <td>${po.unitPrice || 0}</td>

                <td>${po.totalAmount || 0}</td>

                <td>${getStatusText(po.status)}</td>

                <td>${po.expectedDeliveryDate || ""}</td>

                <td>${getPODate(po)}</td>

            </tr>
            `;

        });


        html += `
        </table>

        <br>

        <h3>Summary</h3>

        <p>Total Purchase Orders: ${reportRows.length}</p>

        <p>Total Spend: ₹${reportTotalSpend.toFixed(2)}</p>

        <p>Pending: ${reportPending}</p>

        <p>In Progress: ${reportInProgress}</p>

        <p>Completed: ${reportCompleted}</p>

        <p>Rejected: ${reportRejected}</p>

        </body>
        </html>
        `;


        const blob =
            new Blob(
                [html],
                {
                    type:
                        "application/vnd.ms-excel"
                }
            );


        const url =
            URL.createObjectURL(blob);


        const link =
            document.createElement("a");


        link.href = url;

        link.download =
            "Procurement_Report.xls";


        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        URL.revokeObjectURL(url);

    };


    /* =========================================================
       PDF EXPORT

       Opens a print-friendly report.
       Browser Print -> Save as PDF.
    ========================================================= */

    const exportPDF = () => {

        if (reportRows.length === 0) {

            alert(
                "There is no report data to export."
            );

            return;

        }


        const printWindow =
            window.open(
                "",
                "_blank",
                "width=1200,height=800"
            );


        if (!printWindow) {

            alert(
                "Please allow pop-ups to export the PDF."
            );

            return;

        }


        let rowsHTML = "";


        reportRows.forEach(po => {

            rowsHTML += `
            <tr>

                <td>${po.poNumber || ""}</td>

                <td>${po.vendorName || ""}</td>

                <td>${po.itemName || ""}</td>

                <td>${getPOCategory(po)}</td>

                <td>${po.quantity || 0}</td>

                <td>${po.deliveredQuantity || 0}</td>

                <td>₹${Number(
                    po.totalAmount || 0
                ).toLocaleString("en-IN")}</td>

                <td>${getStatusText(po.status)}</td>

                <td>${po.expectedDeliveryDate || ""}</td>

            </tr>
            `;

        });


        printWindow.document.write(`

            <html>

            <head>

                <title>
                    Procurement Operational Report
                </title>

                <style>

                    body {
                        font-family: Arial, sans-serif;
                        padding: 30px;
                        color: #222;
                    }

                    h1 {
                        color: #0d6efd;
                    }

                    .summary {
                        display: flex;
                        gap: 20px;
                        margin: 20px 0;
                    }

                    .box {
                        border: 1px solid #ddd;
                        padding: 15px;
                        border-radius: 8px;
                        min-width: 130px;
                    }

                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 25px;
                        font-size: 12px;
                    }

                    th,
                    td {
                        border: 1px solid #ccc;
                        padding: 8px;
                        text-align: left;
                    }

                    th {
                        background: #0d6efd;
                        color: white;
                    }

                    @media print {

                        button {
                            display: none;
                        }

                    }

                </style>

            </head>

            <body>

                <h1>
                    Procurement Operational Report
                </h1>

                <p>
                    Generated from Enterprise Procurement System
                </p>

                <hr>

                <p>
                    <strong>Date From:</strong>
                    ${reportFromDate || "All"}
                </p>

                <p>
                    <strong>Date To:</strong>
                    ${reportToDate || "All"}
                </p>

                <p>
                    <strong>Vendor:</strong>
                    ${
                        reportVendor === "ALL"
                            ? "All Vendors"
                            : reportVendor
                    }
                </p>

                <p>
                    <strong>Status:</strong>
                    ${
                        reportStatus === "ALL"
                            ? "All Statuses"
                            : getStatusText(
                                reportStatus
                            )
                    }
                </p>

                <p>
                    <strong>Category:</strong>
                    ${
                        reportCategory === "ALL"
                            ? "All Categories"
                            : reportCategory
                    }
                </p>

                <div class="summary">

                    <div class="box">
                        <strong>Total POs</strong>
                        <br>
                        ${reportRows.length}
                    </div>

                    <div class="box">
                        <strong>Total Spend</strong>
                        <br>
                        ₹${reportTotalSpend.toLocaleString(
                            "en-IN"
                        )}
                    </div>

                    <div class="box">
                        <strong>Pending</strong>
                        <br>
                        ${reportPending}
                    </div>

                    <div class="box">
                        <strong>In Progress</strong>
                        <br>
                        ${reportInProgress}
                    </div>

                    <div class="box">
                        <strong>Completed</strong>
                        <br>
                        ${reportCompleted}
                    </div>

                    <div class="box">
                        <strong>Rejected</strong>
                        <br>
                        ${reportRejected}
                    </div>

                </div>

                <table>

                    <thead>

                        <tr>

                            <th>PO Number</th>
                            <th>Vendor</th>
                            <th>Item</th>
                            <th>Category</th>
                            <th>Qty</th>
                            <th>Delivered</th>
                            <th>Total Amount</th>
                            <th>Status</th>
                            <th>Expected Delivery</th>

                        </tr>

                    </thead>

                    <tbody>

                        ${rowsHTML}

                    </tbody>

                </table>

                <br>

                <button
                    onclick="window.print()"
                    style="
                        padding:10px 20px;
                        background:#0d6efd;
                        color:white;
                        border:none;
                        border-radius:6px;
                    "
                >
                    Print / Save as PDF
                </button>

            </body>

            </html>

        `);


        printWindow.document.close();

        printWindow.focus();

        setTimeout(() => {

            printWindow.print();

        }, 500);

    };


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
                                    manage requests,
                                    generate reports and monitor
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

                    {[
                        {
                            title: "TOTAL POs",
                            value: totalPOs,
                            color: "primary"
                        },
                        {
                            title: "PENDING",
                            value: pendingPOs,
                            color: "warning"
                        },
                        {
                            title: "IN PROGRESS",
                            value: inProgressPOs,
                            color: "info"
                        },
                        {
                            title: "COMPLETED",
                            value: completedPOs,
                            color: "success"
                        },
                        {
                            title: "REJECTED",
                            value: rejectedPOs,
                            color: "danger"
                        },
                        {
                            title: "TOTAL VENDORS",
                            value: totalVendors,
                            color: "dark"
                        }
                    ].map(
                        item => (

                            <div
                                className="col-md-6 col-lg-2"
                                key={item.title}
                            >

                                <div
                                    className="card h-100"
                                    style={cardStyle}
                                >

                                    <div className="card-body">

                                        <small className="text-muted">
                                            {item.title}
                                        </small>

                                        <h2
                                            className={`text-${item.color} fw-bold mt-2`}
                                        >
                                            {item.value}
                                        </h2>

                                    </div>

                                </div>

                            </div>

                        )
                    )}

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
                                        setActiveTab(
                                            "overview"
                                        )
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
                                        setActiveTab(
                                            "tracking"
                                        )
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
                                        setActiveTab(
                                            "requests"
                                        )
                                    }
                                >
                                    📋 Procurement Requests
                                </button>

                            </div>


                            <div className="col-md-3">

                                <button
                                    className={
                                        activeTab === "reports"
                                            ? "btn btn-success w-100"
                                            : "btn btn-outline-success w-100"
                                    }
                                    onClick={() =>
                                        setActiveTab(
                                            "reports"
                                        )
                                    }
                                >
                                    📄 Reports & Export
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


                        {/* ANALYTICS SUMMARY */}

                        <div className="row g-4 mb-4">

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
                                            {completedPurchaseOrders}
                                            {" "}completed /
                                            {" "}{totalPOs}
                                            {" "}total Purchase Orders
                                        </p>

                                    </div>

                                </div>

                            </div>


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
                                            {rejectedPurchaseOrders}
                                            {" "}rejected /
                                            {" "}{totalPOs}
                                            {" "}total Purchase Orders
                                        </p>

                                    </div>

                                </div>

                            </div>

                        </div>


                        {/* PERFORMANCE + COST */}

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
                                                <div className="border rounded-3 p-3">
                                                    <small className="text-muted">
                                                        COMPLETED
                                                    </small>
                                                    <h4 className="text-success fw-bold">
                                                        {completedPurchaseOrders}
                                                    </h4>
                                                </div>
                                            </div>

                                            <div className="col-6">
                                                <div className="border rounded-3 p-3">
                                                    <small className="text-muted">
                                                        IN PROGRESS
                                                    </small>
                                                    <h4 className="text-info fw-bold">
                                                        {inProgressPOs}
                                                    </h4>
                                                </div>
                                            </div>

                                            <div className="col-6">
                                                <div className="border rounded-3 p-3">
                                                    <small className="text-muted">
                                                        PENDING
                                                    </small>
                                                    <h4 className="text-warning fw-bold">
                                                        {pendingPOs}
                                                    </h4>
                                                </div>
                                            </div>

                                            <div className="col-6">
                                                <div className="border rounded-3 p-3">
                                                    <small className="text-muted">
                                                        COMPLETION RATE
                                                    </small>
                                                    <h4 className="text-primary fw-bold">
                                                        {completionRate.toFixed(2)}%
                                                    </h4>
                                                </div>
                                            </div>

                                        </div>

                                        <p className="text-muted small mt-3 mb-0">

                                            {inProgressPOs > 0

                                                ? "There are Purchase Orders still in progress. Follow up with vendors to complete the remaining procurement cycle."

                                                : "All current Purchase Orders have completed the procurement cycle."
                                            }

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

                                        <p>
                                            <small className="text-muted d-block">
                                                HIGHEST-SPEND VENDOR
                                            </small>

                                            <strong>
                                                {costOptimization.highestSpendVendor || "N/A"}
                                            </strong>

                                            {" "}

                                            ₹
                                            {Number(
                                                costOptimization.highestVendorSpend || 0
                                            ).toLocaleString(
                                                "en-IN"
                                            )}

                                        </p>


                                        <p>
                                            <small className="text-muted d-block">
                                                HIGHEST-SPEND CATEGORY
                                            </small>

                                            <strong>
                                                {costOptimization.highestSpendCategory || "N/A"}
                                            </strong>

                                            {" "}

                                            ₹
                                            {Number(
                                                costOptimization.highestCategorySpend || 0
                                            ).toLocaleString(
                                                "en-IN"
                                            )}

                                        </p>


                                        <p>
                                            <small className="text-muted d-block">
                                                HIGHEST-SPEND MONTH
                                            </small>

                                            <strong>
                                                {costOptimization.highestSpendMonth || "N/A"}
                                            </strong>

                                            {" "}

                                            ₹
                                            {Number(
                                                costOptimization.highestMonthlySpend || 0
                                            ).toLocaleString(
                                                "en-IN"
                                            )}

                                        </p>


                                        <p className="text-muted small mb-0">
                                            Review high-spend vendors and categories
                                            for negotiated pricing, volume discounts
                                            and alternative supplier opportunities.
                                        </p>

                                    </div>

                                </div>

                            </div>

                        </div>


                        {/* CHARTS */}

                        <div className="row g-4 mb-4">

                            <div className="col-lg-6">

                                <div
                                    className="card h-100"
                                    style={cardStyle}
                                >

                                    <div className="card-body">

                                        <h5 className="fw-bold">
                                            Purchase Order Status
                                        </h5>

                                        <p className="text-muted small">
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


                            <div className="col-lg-6">

                                <div
                                    className="card h-100"
                                    style={cardStyle}
                                >

                                    <div className="card-body">

                                        <h5 className="fw-bold">
                                            Vendor-wise Purchase Orders
                                        </h5>

                                        <p className="text-muted small">
                                            Number of orders handled by each vendor
                                        </p>

                                        <ResponsiveContainer
                                            width="100%"
                                            height={330}
                                        >

                                            <BarChart
                                                layout="vertical"
                                                data={vendorChartData}
                                            >

                                                <CartesianGrid
                                                    strokeDasharray="3 3"
                                                />

                                                <XAxis
                                                    type="number"
                                                    allowDecimals={false}
                                                />

                                                <YAxis
                                                    type="category"
                                                    dataKey="vendor"
                                                    width={135}
                                                />

                                                <Tooltip />

                                                <Bar
                                                    dataKey="orders"
                                                    name="Orders"
                                                    fill="#0d6efd"
                                                />

                                            </BarChart>

                                        </ResponsiveContainer>

                                    </div>

                                </div>

                            </div>


                            <div className="col-lg-6">

                                <div
                                    className="card h-100"
                                    style={cardStyle}
                                >

                                    <div className="card-body">

                                        <h5 className="fw-bold">
                                            Vendor-wise Procurement Spend
                                        </h5>

                                        <p className="text-muted small">
                                            Total procurement spend by vendor
                                        </p>

                                        <ResponsiveContainer
                                            width="100%"
                                            height={330}
                                        >

                                            <BarChart
                                                layout="vertical"
                                                data={vendorSpendChartData}
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
                                                />

                                                <YAxis
                                                    type="category"
                                                    dataKey="vendor"
                                                    width={135}
                                                />

                                                <Tooltip
                                                    formatter={
                                                        value =>
                                                            [
                                                                `₹${Number(value).toLocaleString(
                                                                    "en-IN"
                                                                )}`,
                                                                "Spend"
                                                            ]
                                                    }
                                                />

                                                <Bar
                                                    dataKey="spend"
                                                    name="Procurement Spend"
                                                    fill="#198754"
                                                />

                                            </BarChart>

                                        </ResponsiveContainer>

                                    </div>

                                </div>

                            </div>


                            <div className="col-lg-6">

                                <div
                                    className="card h-100"
                                    style={cardStyle}
                                >

                                    <div className="card-body">

                                        <h5 className="fw-bold">
                                            Category-wise Procurement Spend
                                        </h5>

                                        <p className="text-muted small">
                                            Total procurement spend by category
                                        </p>

                                        <ResponsiveContainer
                                            width="100%"
                                            height={330}
                                        >

                                            <BarChart
                                                layout="vertical"
                                                data={categorySpendChartData}
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
                                                />

                                                <YAxis
                                                    type="category"
                                                    dataKey="category"
                                                    width={180}
                                                />

                                                <Tooltip
                                                    formatter={
                                                        value =>
                                                            [
                                                                `₹${Number(value).toLocaleString(
                                                                    "en-IN"
                                                                )}`,
                                                                "Spend"
                                                            ]
                                                    }
                                                />

                                                <Bar
                                                    dataKey="spend"
                                                    name="Procurement Spend"
                                                    fill="#6f42c1"
                                                />

                                            </BarChart>

                                        </ResponsiveContainer>

                                    </div>

                                </div>

                            </div>

                        </div>


                        {/* MONTHLY LINE GRAPH */}

                        <div
                            className="card mb-4"
                            style={cardStyle}
                        >

                            <div className="card-body">

                                <h5 className="fw-bold">
                                    Monthly Procurement Spend
                                </h5>

                                <p className="text-muted small">
                                    Procurement spend trend by month
                                </p>

                                {monthlySpendChartData.length === 0

                                    ?

                                    <div className="text-center text-muted py-5">
                                        No monthly procurement spend data available.
                                    </div>

                                    :

                                    <ResponsiveContainer
                                        width="100%"
                                        height={360}
                                    >

                                        <LineChart
                                            data={monthlySpendChartData}
                                        >

                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                            />

                                            <XAxis
                                                dataKey="month"
                                            />

                                            <YAxis
                                                tickFormatter={
                                                    value =>
                                                        `₹${Number(value).toLocaleString("en-IN")}`
                                                }
                                            />

                                            <Tooltip
                                                formatter={
                                                    value =>
                                                        [
                                                            `₹${Number(value).toLocaleString(
                                                                "en-IN"
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
                                            />

                                        </LineChart>

                                    </ResponsiveContainer>

                                }

                            </div>

                        </div>


                        {/* DELIVERY */}

                        <div
                            className="card mb-4"
                            style={cardStyle}
                        >

                            <div className="card-body">

                                <div className="d-flex justify-content-between">

                                    <div>

                                        <h5 className="fw-bold">
                                            🚚 Overall Delivery Progress
                                        </h5>

                                        <p className="text-muted">
                                            Total quantity delivered across all purchase orders.
                                        </p>

                                    </div>

                                    <div className="text-end">

                                        <h2 className="text-success fw-bold">
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


                        {/* =================================================
                            DELIVERY PERFORMANCE

                            These metrics come directly from the backend
                            procurement analytics API.
                        ================================================= */}

                        <div
                            className="card mb-4"
                            style={cardStyle}
                        >

                            <div className="card-body p-4">

                                <div className="d-flex justify-content-between align-items-center mb-4">

                                    <div>

                                        <h5 className="fw-bold mb-1">
                                            🚚 Delivery Performance
                                        </h5>

                                        <p className="text-muted small mb-0">
                                            On-time and delayed delivery performance
                                            based on completed deliveries.
                                        </p>

                                    </div>

                                    <div className="text-end">

                                        <small className="text-muted d-block">
                                            ON-TIME DELIVERY RATE
                                        </small>

                                        <h3 className="text-success fw-bold mb-0">
                                            {Number(
                                                analytics?.deliveryPerformance
                                                    ?.onTimeDeliveryRate || 0
                                            ).toFixed(2)}%
                                        </h3>

                                    </div>

                                </div>

                                <div className="row g-3">

                                    <div className="col-md-4">
                                        <div className="border rounded-3 p-3 h-100">
                                            <small className="text-muted d-block">
                                                TOTAL DELIVERED ORDERS
                                            </small>
                                            <h3 className="text-primary fw-bold mb-0 mt-2">
                                                {Number(
                                                    analytics?.deliveryPerformance
                                                        ?.totalDeliveredOrders || 0
                                                )}
                                            </h3>
                                        </div>
                                    </div>

                                    <div className="col-md-4">
                                        <div className="border rounded-3 p-3 h-100">
                                            <small className="text-muted d-block">
                                                ON-TIME DELIVERIES
                                            </small>
                                            <h3 className="text-success fw-bold mb-0 mt-2">
                                                {Number(
                                                    analytics?.deliveryPerformance
                                                        ?.onTimeDeliveries || 0
                                                )}
                                            </h3>
                                        </div>
                                    </div>

                                    <div className="col-md-4">
                                        <div className="border rounded-3 p-3 h-100">
                                            <small className="text-muted d-block">
                                                DELAYED DELIVERIES
                                            </small>
                                            <h3 className="text-danger fw-bold mb-0 mt-2">
                                                {Number(
                                                    analytics?.deliveryPerformance
                                                        ?.delayedDeliveries || 0
                                                )}
                                            </h3>
                                        </div>
                                    </div>

                                </div>

                                <div className="mt-4">

                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="text-muted small">
                                            On-time delivery performance
                                        </span>

                                        <span className="fw-semibold small">
                                            {Number(
                                                analytics?.deliveryPerformance
                                                    ?.onTimeDeliveryRate || 0
                                            ).toFixed(2)}%
                                        </span>
                                    </div>

                                    <div
                                        className="progress"
                                        style={{
                                            height: "20px"
                                        }}
                                    >
                                        <div
                                            className="progress-bar bg-success"
                                            role="progressbar"
                                            style={{
                                                width: `${Math.min(
                                                    Math.max(
                                                        Number(
                                                            analytics?.deliveryPerformance
                                                                ?.onTimeDeliveryRate || 0
                                                        ),
                                                        0
                                                    ),
                                                    100
                                                )}%`
                                            }}
                                            aria-valuenow={
                                                Number(
                                                    analytics?.deliveryPerformance
                                                        ?.onTimeDeliveryRate || 0
                                                )
                                            }
                                            aria-valuemin="0"
                                            aria-valuemax="100"
                                        >
                                            {Number(
                                                analytics?.deliveryPerformance
                                                    ?.onTimeDeliveryRate || 0
                                            ).toFixed(2)}%
                                        </div>
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
                                            value={searchTerm}
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
                                            value={statusFilter}
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
                                            value={vendorFilter}
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


                        <div
                            className="card"
                            style={cardStyle}
                        >

                            <div className="card-header bg-dark text-white">

                                <h5 className="mb-0">
                                    Purchase Order Tracking
                                </h5>

                            </div>


                            <div className="table-responsive">

                                <table className="table table-hover mb-0 align-middle">

                                    <thead>

                                        <tr>

                                            <th>PO Number</th>
                                            <th>Vendor</th>
                                            <th>Item</th>
                                            <th>Quantity</th>
                                            <th>Delivered</th>
                                            <th>Status</th>
                                            <th>Action</th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {filteredPurchaseOrders.length === 0

                                            ?

                                            <tr>

                                                <td
                                                    colSpan="7"
                                                    className="text-center py-4"
                                                >
                                                    No purchase orders match the selected filters.
                                                </td>

                                            </tr>

                                            :

                                            filteredPurchaseOrders.map(
                                                po => (

                                                    <tr key={po.id}>

                                                        <td className="fw-bold">
                                                            {po.poNumber}
                                                        </td>

                                                        <td>
                                                            {po.vendorName}
                                                        </td>

                                                        <td>
                                                            {po.itemName}
                                                        </td>

                                                        <td>
                                                            {po.quantity}
                                                        </td>

                                                        <td>
                                                            {po.deliveredQuantity || 0}
                                                            /
                                                            {po.quantity}
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

                                        }

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


                        {availableRequests.length === 0

                            ?

                            <div
                                className="alert alert-success"
                                style={{
                                    borderRadius: "15px"
                                }}
                            >
                                No pending procurement requests available.
                            </div>

                            :

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
                                                        {request.title}
                                                    </h4>

                                                    <p>
                                                        <strong>
                                                            Description:
                                                        </strong>
                                                        {" "}
                                                        {request.description}
                                                    </p>

                                                    <p>
                                                        <strong>
                                                            Category:
                                                        </strong>
                                                        {" "}
                                                        {request.category}
                                                    </p>

                                                    <p>
                                                        <strong>
                                                            Quantity:
                                                        </strong>
                                                        {" "}
                                                        {request.quantity}
                                                    </p>

                                                    <p>
                                                        <strong>
                                                            Priority:
                                                        </strong>
                                                        {" "}

                                                        <span
                                                            className={`badge bg-${getPriorityBadge(
                                                                request.priority
                                                            )}`}
                                                        >
                                                            {request.priority}
                                                        </span>

                                                    </p>

                                                </div>


                                                <div className="col-lg-4 text-lg-end">

                                                    <span
                                                        className={`badge bg-${getRequestStatusBadge(
                                                            request.status
                                                        )} mb-3`}
                                                    >
                                                        {request.status}
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


                                            {/* GENERATE PO */}

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
                                                                                        e.target.value
                                                                                    )
                                                                            );

                                                                        if (!supplier)
                                                                            return;

                                                                        setPoData(
                                                                            {
                                                                                ...poData,

                                                                                [request.requestId]:
                                                                                {
                                                                                    ...poData[
                                                                                        request.requestId
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
                                                                                        request.requestId
                                                                                    ],

                                                                                    unitPrice:
                                                                                        e.target.value
                                                                                }
                                                                            }
                                                                        )
                                                                }
                                                            />

                                                            <div className="mt-2">

                                                                <strong>
                                                                    Total Amount:
                                                                </strong>

                                                                {" "}₹

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
                                                                ).toFixed(2)}

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
                                                                                        request.requestId
                                                                                    ],

                                                                                    expectedDeliveryDate:
                                                                                        e.target.value
                                                                                }
                                                                            }
                                                                        )
                                                                }
                                                            />

                                                        </div>

                                                    </div>


                                                    <button
                                                        className="btn btn-primary mt-4"
                                                        disabled={loading}
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

                        }

                    </>

                )}


                {/* =================================================
                    REPORTS & EXPORT TAB
                ================================================= */}

                {activeTab === "reports" && (

                    <>

                        <div className="d-flex justify-content-between align-items-center mb-4">

                            <div>

                                <h3 className="fw-bold mb-1">
                                    📄 Procurement Reports & Export
                                </h3>

                                <p className="text-muted mb-0">
                                    Generate operational reports using filters
                                    and export the selected data.
                                </p>

                            </div>

                        </div>


                        {/* REPORT FILTERS */}

                        <div
                            className="card mb-4"
                            style={cardStyle}
                        >

                            <div className="card-header bg-dark text-white">

                                <h5 className="mb-0">
                                    🔎 Report Filters
                                </h5>

                            </div>


                            <div className="card-body">

                                <div className="row g-3">

                                    <div className="col-md-6 col-lg-3">

                                        <label className="form-label fw-bold">
                                            Date From
                                        </label>

                                        <input
                                            type="date"
                                            className="form-control"
                                            value={
                                                reportFromDate
                                            }
                                            onChange={
                                                e =>
                                                    setReportFromDate(
                                                        e.target.value
                                                    )
                                            }
                                        />

                                    </div>


                                    <div className="col-md-6 col-lg-3">

                                        <label className="form-label fw-bold">
                                            Date To
                                        </label>

                                        <input
                                            type="date"
                                            className="form-control"
                                            value={
                                                reportToDate
                                            }
                                            onChange={
                                                e =>
                                                    setReportToDate(
                                                        e.target.value
                                                    )
                                            }
                                        />

                                    </div>


                                    <div className="col-md-6 col-lg-3">

                                        <label className="form-label fw-bold">
                                            Vendor
                                        </label>

                                        <select
                                            className="form-select"
                                            value={
                                                reportVendor
                                            }
                                            onChange={
                                                e =>
                                                    setReportVendor(
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


                                    <div className="col-md-6 col-lg-3">

                                        <label className="form-label fw-bold">
                                            Status
                                        </label>

                                        <select
                                            className="form-select"
                                            value={
                                                reportStatus
                                            }
                                            onChange={
                                                e =>
                                                    setReportStatus(
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
                                                Accepted
                                            </option>

                                            <option value="SHIPPED">
                                                Shipped
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


                                    <div className="col-md-6 col-lg-3">

                                        <label className="form-label fw-bold">
                                            Category
                                        </label>

                                        <select
                                            className="form-select"
                                            value={
                                                reportCategory
                                            }
                                            onChange={
                                                e =>
                                                    setReportCategory(
                                                        e.target.value
                                                    )
                                            }
                                        >

                                            <option value="ALL">
                                                All Categories
                                            </option>

                                            {reportCategories.map(
                                                category => (

                                                    <option
                                                        key={
                                                            category
                                                        }
                                                        value={
                                                            category
                                                        }
                                                    >
                                                        {category}
                                                    </option>

                                                )
                                            )}

                                        </select>

                                    </div>


                                    <div className="col-md-6 col-lg-9 d-flex align-items-end gap-2">

                                        <button
                                            className="btn btn-outline-secondary"
                                            onClick={
                                                clearReportFilters
                                            }
                                        >
                                            Clear Filters
                                        </button>

                                        <button
                                            className="btn btn-success"
                                            onClick={
                                                exportExcel
                                            }
                                        >
                                            📊 Export Excel
                                        </button>

                                        <button
                                            className="btn btn-danger"
                                            onClick={
                                                exportPDF
                                            }
                                        >
                                            📄 Export PDF
                                        </button>

                                    </div>

                                </div>

                            </div>

                        </div>


                        {/* REPORT SUMMARY CARDS */}

                        <div className="row g-3 mb-4">

                            <div className="col-md-6 col-lg">

                                <div
                                    className="card h-100"
                                    style={cardStyle}
                                >

                                    <div className="card-body">

                                        <small className="text-muted">
                                            FILTERED POs
                                        </small>

                                        <h2 className="text-primary fw-bold">
                                            {reportRows.length}
                                        </h2>

                                    </div>

                                </div>

                            </div>


                            <div className="col-md-6 col-lg">

                                <div
                                    className="card h-100"
                                    style={cardStyle}
                                >

                                    <div className="card-body">

                                        <small className="text-muted">
                                            TOTAL SPEND
                                        </small>

                                        <h2 className="text-success fw-bold">
                                            ₹
                                            {reportTotalSpend.toLocaleString(
                                                "en-IN",
                                                {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                }
                                            )}
                                        </h2>

                                    </div>

                                </div>

                            </div>


                            <div className="col-md-6 col-lg">

                                <div
                                    className="card h-100"
                                    style={cardStyle}
                                >

                                    <div className="card-body">

                                        <small className="text-muted">
                                            PENDING
                                        </small>

                                        <h2 className="text-warning fw-bold">
                                            {reportPending}
                                        </h2>

                                    </div>

                                </div>

                            </div>


                            <div className="col-md-6 col-lg">

                                <div
                                    className="card h-100"
                                    style={cardStyle}
                                >

                                    <div className="card-body">

                                        <small className="text-muted">
                                            IN PROGRESS
                                        </small>

                                        <h2 className="text-info fw-bold">
                                            {reportInProgress}
                                        </h2>

                                    </div>

                                </div>

                            </div>


                            <div className="col-md-6 col-lg">

                                <div
                                    className="card h-100"
                                    style={cardStyle}
                                >

                                    <div className="card-body">

                                        <small className="text-muted">
                                            COMPLETED
                                        </small>

                                        <h2 className="text-success fw-bold">
                                            {reportCompleted}
                                        </h2>

                                    </div>

                                </div>

                            </div>


                            <div className="col-md-6 col-lg">

                                <div
                                    className="card h-100"
                                    style={cardStyle}
                                >

                                    <div className="card-body">

                                        <small className="text-muted">
                                            REJECTED
                                        </small>

                                        <h2 className="text-danger fw-bold">
                                            {reportRejected}
                                        </h2>

                                    </div>

                                </div>

                            </div>

                        </div>


                        {/* REPORT TABLE */}

                        <div
                            className="card"
                            style={cardStyle}
                        >

                            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">

                                <h5 className="mb-0">
                                    Procurement Operational Report
                                </h5>

                                <span>
                                    {reportRows.length}
                                    {" "}records
                                </span>

                            </div>


                            <div className="table-responsive">

                                <table className="table table-hover align-middle mb-0">

                                    <thead>

                                        <tr>

                                            <th>PO Number</th>
                                            <th>Vendor</th>
                                            <th>Item</th>
                                            <th>Category</th>
                                            <th>Amount</th>
                                            <th>Status</th>
                                            <th>Expected Delivery</th>
                                            <th>Created Date</th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {reportRows.length === 0

                                            ?

                                            <tr>

                                                <td
                                                    colSpan="8"
                                                    className="text-center py-5"
                                                >
                                                    No purchase orders match
                                                    the selected report filters.

                                                </td>

                                            </tr>

                                            :

                                            reportRows.map(
                                                po => (

                                                    <tr key={po.id}>

                                                        <td className="fw-bold">
                                                            {po.poNumber}
                                                        </td>

                                                        <td>
                                                            {po.vendorName}
                                                        </td>

                                                        <td>
                                                            {po.itemName}
                                                        </td>

                                                        <td>
                                                            {getPOCategory(po)}
                                                        </td>

                                                        <td>
                                                            ₹
                                                            {Number(
                                                                po.totalAmount || 0
                                                            ).toLocaleString(
                                                                "en-IN",
                                                                {
                                                                    minimumFractionDigits: 2
                                                                }
                                                            )}
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
                                                            {
                                                                po.expectedDeliveryDate ||
                                                                "N/A"
                                                            }
                                                        </td>

                                                        <td>
                                                            {getPODate(po) ||
                                                                "N/A"}
                                                        </td>

                                                    </tr>

                                                )
                                            )

                                        }

                                    </tbody>

                                </table>

                            </div>

                        </div>


                        {/* REPORT INFORMATION */}

                        <div
                            className="alert alert-info mt-4"
                            style={{
                                borderRadius: "15px"
                            }}
                        >

                            <strong>
                                📌 Report Information
                            </strong>

                            <ul className="mb-0 mt-2">

                                <li>
                                    Filters are applied to the Purchase Orders currently
                                    loaded from the backend.
                                </li>

                                <li>
                                    Category is obtained from the related Purchase Request.
                                </li>

                                <li>
                                    Excel export downloads the filtered report as an
                                    Excel-compatible file.
                                </li>

                                <li>
                                    PDF export opens a print-ready report. Choose
                                    <strong> Save as PDF </strong>
                                    in the browser print window.
                                </li>

                            </ul>

                        </div>

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
                        onClick={
                            e =>
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
                                {selectedPO.poNumber}
                            </h3>


                            <div className="row g-4">

                                <div className="col-md-4">

                                    <strong>
                                        Vendor
                                    </strong>

                                    <p>
                                        {selectedPO.vendorName}
                                    </p>

                                </div>


                                <div className="col-md-4">

                                    <strong>
                                        Vendor Email
                                    </strong>

                                    <p>
                                        {selectedPO.vendorEmail ||
                                            "N/A"}
                                    </p>

                                </div>


                                <div className="col-md-4">

                                    <strong>
                                        Item
                                    </strong>

                                    <p>
                                        {selectedPO.itemName}
                                    </p>

                                </div>


                                <div className="col-md-4">

                                    <strong>
                                        Category
                                    </strong>

                                    <p>
                                        {getPOCategory(
                                            selectedPO
                                        )}
                                    </p>

                                </div>


                                <div className="col-md-4">

                                    <strong>
                                        Quantity
                                    </strong>

                                    <p>
                                        {selectedPO.quantity}
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
                                        {selectedPO.unitPrice}
                                    </p>

                                </div>


                                <div className="col-md-4">

                                    <strong>
                                        Total Amount
                                    </strong>

                                    <p>
                                        ₹
                                        {selectedPO.totalAmount}
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


                            {/* WAITING FOR VENDOR */}

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


                            {/* ACCEPTED */}

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


                            {/* SHIPPED */}

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
                                                                    e.target.value
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
                                                        selectedPO,
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
                                                        selectedPO,
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


                            {/* PARTIAL DELIVERY */}

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
                                        {selectedPO.quantity}
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
                                                                    e.target.value
                                                            }
                                                        )
                                                }
                                            />

                                        </div>


                                        <div className="col-md-auto">

                                            <button
                                                className="btn btn-success"
                                                onClick={() => {

                                                    const additional =
                                                        Number(
                                                            deliveryData[
                                                                selectedPO.id
                                                            ] || 0
                                                        );

                                                    const total =
                                                        Number(
                                                            selectedPO.deliveredQuantity ||
                                                            0
                                                        ) +
                                                        additional;


                                                    updateDeliveryStatus(
                                                        selectedPO,

                                                        total >=
                                                            Number(
                                                                selectedPO.quantity
                                                            )
                                                            ? "DELIVERED"
                                                            : "PARTIALLY_DELIVERED"
                                                    );

                                                }}
                                            >
                                                Update Delivery
                                            </button>

                                        </div>

                                    </div>

                                </div>

                            )}


                            {/* DELIVERED */}

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
                                            onClick={() =>
                                                updateDeliveryStatus(
                                                    selectedPO,
                                                    "CLOSED"
                                                )
                                            }
                                        >
                                            Close Purchase Order
                                        </button>

                                    </div>

                                </div>

                            )}


                            {/* REJECTED */}

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


                            {/* CLOSED */}

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