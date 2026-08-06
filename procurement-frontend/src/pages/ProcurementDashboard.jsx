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
    const [suppliers, setSuppliers] = useState([]);

            useEffect(() => {
            loadRequests();
            loadPurchaseOrders();
            loadSuppliers();
        }, []);

       const loadSuppliers = async () => {

    try {

        const response = await axios.get(
            "http://localhost:8080/suppliers"
        );

        setSuppliers(response.data);

    } catch(error) {

        console.log(
            "Error loading suppliers",
            error
        );

    }

};


    const loadRequests = async () => {

        try {

            const response = await axios.get(
                `${API}/procurement`
            );
               console.log("PROCUREMENT DATA:", response.data);
            setRequests(response.data);

        } catch (error) {

            console.error(error);
            alert("Unable to load procurement requests.");

        }

    };
    const startProcurement = async (requestId)=>{

    try{

        await axios.put(
            `${API}/procurement/start/${requestId}`
        );

        alert("Procurement Started");

        loadRequests();

    }
    catch(error){

        console.error(error);
        alert("Unable to start procurement");

    }

};

        const loadPurchaseOrders = async () => {

    try {

        const response = await axios.get(PURCHASE_ORDER_API);

         console.log(response.data);

        setPurchaseOrders(response.data);

    } catch (error) {

        console.error(error);

    }

};

            const generatePurchaseOrder = async (request) => {

    try {

        setLoading(true);

        const data = poData[request.requestId];


        if(!data || !data.vendorName){
            alert("Please select vendor");
            return;
        }


        if(!data.expectedDeliveryDate){
            alert("Please select expected delivery date");
            return;
        }


        const today = new Date();
        const selectedDate = new Date(data.expectedDeliveryDate);


        if(selectedDate <= today){
            alert("Expected delivery date must be a future date");
            return;
        }


        await axios.post(PURCHASE_ORDER_API, {

            purchaseRequestId: request.requestId,
            vendorName: data.vendorName,
            vendorEmail: data.vendorEmail,
            itemName: request.title,
            quantity: request.quantity,
            unitPrice: Number(data.unitPrice),
            expectedDeliveryDate: data.expectedDeliveryDate

        });

            alert("Purchase Order Generated Successfully!");

            await loadPurchaseOrders();
            await loadRequests();
      


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

                        alert("Status Updated");

                        loadPurchaseOrders();

                    } catch (error) {

                    console.error(error);

                    alert(
                        error.response?.data?.messages?.join("\n") ||
                        error.response?.data?.message ||
                        error.message
                    );

                }
            

                };
                const availableRequests = requests.filter(
    request =>
        (
            request.status === "PENDING_PROCUREMENT" ||
            request.status === "PROCUREMENT_IN_PROGRESS"
        )
        &&
        !purchaseOrders.some(
            po => po.purchaseRequestId === request.requestId
        )
);

    

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

    const pendingCount = requests.filter(
        r => r.status === "PENDING_PROCUREMENT"
    ).length;

    const progressCount = requests.filter(
        r => r.status === "PROCUREMENT_IN_PROGRESS"
    ).length;

    const completedCount = requests.filter(
        r => r.status === "COMPLETED"
    ).length;

    return (

                <>
                <div
                className="container-fluid py-4"
                style={{
                minHeight:"100vh",
                background:"linear-gradient(135deg,#eef5ff 0%,#f8fbff 50%,#ffffff 100%)"
                }}
                >

                <div className="container">

                <div
                className="mb-4"
                style={{
                borderRadius:"24px",
                background:"linear-gradient(135deg,#0d6efd,#2563eb,#60a5fa)",
                color:"white",
                boxShadow:"0 20px 45px rgba(13,110,253,.25)"
                }}
                >

                <div className="row align-items-center p-5">

                <div className="col-lg-8">

                <div
                style={{
                letterSpacing:"2px",
                opacity:.8,
                fontSize:"14px"
                }}
                >
                ENTERPRISE PROCUREMENT SYSTEM
                </div>

                <h1 className="fw-bold mt-2">
                Procurement Dashboard
                </h1>

                <p
                className="mt-3 mb-0"
                style={{
                opacity:.9,
                maxWidth:"650px"
                }}
                >
                Manage procurement workflow,
                track request progress,
                and complete purchasing efficiently.
                </p>

                </div>

                <div className="col-lg-4 text-lg-end mt-4 mt-lg-0">

                <button
                className="btn btn-light btn-lg"
                style={{
                borderRadius:"50px",
                padding:"12px 35px",
                fontWeight:"600"
                }}
                onClick={()=>navigate("/")}
                >
                Logout
                </button>

                </div>

                </div>

                </div><div className="row g-4 mb-5">

                <div className="col-md-4">

                <div
                className="card border-0 h-100"
                style={{
                borderRadius:"22px",
                boxShadow:"0 10px 25px rgba(0,0,0,.08)"
                }}
                >

                <div className="card-body">

                <small className="text-muted fw-bold">
                PENDING
                </small>

                <h1 className="fw-bold text-warning mt-3">
                {pendingCount}
                </h1>

                </div>

                </div>

                </div>

                <div className="col-md-4">

                <div
                className="card border-0 h-100"
                style={{
                borderRadius:"22px",
                boxShadow:"0 10px 25px rgba(0,0,0,.08)"
                }}
                >

                <div className="card-body">

                <small className="text-muted fw-bold">
                IN PROGRESS
                </small>

                <h1 className="fw-bold text-info mt-3">
                {progressCount}
                </h1>

                </div>

                </div>

                </div>

                <div className="col-md-4">

                <div
                className="card border-0 h-100"
                style={{
                borderRadius:"22px",
                boxShadow:"0 10px 25px rgba(0,0,0,.08)"
                }}
                >

                <div className="card-body">

                <small className="text-muted fw-bold">
                COMPLETED
                </small>

                <h1 className="fw-bold text-success mt-3">
                {completedCount}
                </h1>

                </div>

                </div>

                </div>

                </div>

                <div
                className="card border-0"
                style={{
                borderRadius:"24px",
                boxShadow:"0 18px 40px rgba(0,0,0,.08)"
                }}
                >

                <div
                className="card-header border-0"
                style={{
                background:
                "linear-gradient(90deg,#111827,#1f2937)",
                color:"white",
                borderTopLeftRadius:"24px",
                borderTopRightRadius:"24px",
                padding:"22px"
                }}
                >

                <h3 className="mb-0 fw-bold">
                Procurement Requests
                </h3>

                </div>

                <div className="card-body">

                {

                requests.length===0?

                (

                <div
                className="alert alert-success text-center mb-0"
                style={{
                borderRadius:"16px",
                fontWeight:"600"
                }}
                >

                No Pending Procurement Requests 🎉

                </div>

                )

                :

                availableRequests.map((request)=>(
                    

                <div
                key={request.requestId}
                className="card border-0 mb-4"
                style={{
                borderRadius:"20px",
                boxShadow:"0 10px 30px rgba(0,0,0,.08)"
                }}
                >

                <div className="card-body p-4">

                <div className="row">

                <div className="col-lg-8">

                <h3 className="fw-bold text-primary mb-3">
                {request.title}
                </h3>

                {request.status === "PENDING_PROCUREMENT" && (

    <button
        className="btn btn-primary"
        onClick={() => startProcurement(request.requestId)}
    >
        Start Procurement
    </button>

)}

                        <p>
                <strong>Description :</strong>
                {" "}
                {request.description}
                </p>

                <p>
                <strong>Category :</strong>
                {" "}
                {request.category}
                </p>

                <p>
                <strong>Quantity :</strong>
                {" "}
                {request.quantity}
                </p>

                </div>

                <div className="col-lg-4 text-lg-end">

                <div className="mb-3">

                <span
                className={`badge rounded-pill bg-${getPriorityBadge(request.priority)}`}
                style={{
                padding:"10px 18px",
                fontSize:"14px"
                }}
                >
                {request.priority}
                </span>

                </div>

                <div>

                <span
                className={`badge rounded-pill bg-${getStatusBadge(request.status)}`}
                style={{
                padding:"10px 18px",
                fontSize:"14px"
                }}
                >
                {request.status.replaceAll("_"," ")}
                </span>

                </div>

                </div>

                </div>
       {/* Purchase Order Form */}

{request.status === "PROCUREMENT_IN_PROGRESS" && (
    <div className="w-100">

        <div className="row g-3 mb-3">

            {/* Vendor */}
            <div className="col-md-6">

                <select
                    className="form-control"
                    value={poData[request.requestId]?.supplierId || ""}
                    onChange={(e) => {

                        const supplier = suppliers.find(
                            s => s.id === Number(e.target.value)
                        );

                        setPoData({
                            ...poData,
                            [request.requestId]: {
                                ...poData[request.requestId],
                                supplierId: supplier.id,
                                vendorName: supplier.supplierName,
                                vendorEmail: supplier.email
                            }
                        });

                    }}
                >

                    <option value="">
                        Select Vendor
                    </option>

                    {suppliers.map(supplier => (

                        <option
                            key={supplier.id}
                            value={supplier.id}
                        >
                            {supplier.supplierName}
                        </option>

                    ))}

                </select>

            </div>

            {/* Unit Price */}
            <div className="col-md-6">

                <input
                    type="number"
                    className="form-control"
                    placeholder="Unit Price"
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

                <p className="mt-2">
    <strong>Total Amount:</strong> ₹
    {
        (
            Number(poData[request.requestId]?.unitPrice || 0) *
            Number(request.quantity || 0)
        ).toFixed(2)
    }
</p>

            </div>

            {/* Expected Delivery Date */}
            <div className="col-md-6">

                <input
                    type="date"
                    className="form-control"
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
            className="btn btn-primary"
            disabled={loading}
            onClick={() => generatePurchaseOrder(request)}
        >
            Generate Purchase Order
        </button>

    </div>

)}

            {request.status === "COMPLETED" && (

            <button
            className="btn btn-outline-success btn-lg"
            style={{
            borderRadius:"50px",
            padding:"12px 30px",
            fontWeight:"600"
            }}
            disabled
            >
            ✔ Procurement Completed
            </button>

            )}

            </div>

            

            </div>

            ))

            }

            </div>

            </div>

            <div
    className="card border-0 mt-4"
    style={{
        borderRadius: "24px",
        boxShadow: "0 18px 40px rgba(0,0,0,.08)"
    }}
>

    <div
        className="card-header"
        style={{
            background: "linear-gradient(90deg,#198754,#157347)",
            color: "white"
        }}
    >
        <h3 className="mb-0">Purchase Orders</h3>
    </div>

    <div className="card-body">

        {purchaseOrders.length === 0 ? (

            <p>No Purchase Orders Found</p>

        ) : (

            purchaseOrders.map(po => (

                <div
                    key={po.id}
                    className="border rounded p-3 mb-3"
                >

                    <h5>{po.poNumber}</h5>

                    <p><strong>Vendor:</strong> {po.vendorName}</p>

                    <p><strong>Item:</strong> {po.itemName}</p>

                    <p><strong>Quantity:</strong> {po.quantity}</p>

                    <p><strong>Total:</strong> ₹{po.totalAmount}</p>

                    <p><strong>Status:</strong> {po.status}</p>

                    <p>
                    <strong>Delivered:</strong>
                    {" "}
                    {po.deliveredQuantity}/{po.quantity}
                </p>

                

               {po.status === "CREATED" && (
                    <button
                        className="btn btn-primary mt-3 me-2"
                        onClick={() => updateStatus(po.id, "SENT")}
                    >
                        Send to Vendor
                    </button>
                )}

                    {po.status === "SENT" && (
                        <button
                            className="btn btn-secondary mt-3 me-2"
                            disabled
                        >
                            Waiting for Vendor Acceptance
                        </button>
                    )}


                {po.status === "ACCEPTED" && (
                    <button
                        className="btn btn-warning mt-3 me-2"
                        onClick={() => updateStatus(po.id, "SHIPPED")}
                    >
                        Ship Order
                    </button>
                )}
                {(po.status === "SHIPPED" ||
  po.status === "PARTIALLY_DELIVERED") && (

<div className="mt-3">

    <div className="row g-2">

        <div className="col-md-4">

            <input
                type="number"
                min="1"
                max={po.quantity}
                className="form-control"
                placeholder="Delivered Quantity"
                value={deliveryData[po.id] || ""}
                onChange={(e) =>
                    setDeliveryData({
                        ...deliveryData,
                        [po.id]: e.target.value
                    })
                }
            />

        </div>

        <div className="col-md-3">

            <button
                className="btn btn-info"
                onClick={() => {

                    const qty = Number(deliveryData[po.id]);

                    if (!qty || qty <= 0) {
                        alert("Enter a valid quantity");
                        return;
                    }

                        const totalDelivered =
            po.deliveredQuantity + qty;


        if(totalDelivered > po.quantity){

            alert("Delivered quantity exceeds order quantity");
            return;

            }

            updateStatus(
                po.id,
                totalDelivered < po.quantity
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

            {po.status === "DELIVERED" && (
                    <button
                        className="btn btn-success mt-3 me-2"
                        onClick={() => updateStatus(po.id, "CLOSED")}
                    >
                        Close Order
                    </button>
                )}

                {po.status === "CLOSED" && (
    <span className="badge bg-success mt-3">
        ✔ Purchase Order Closed
    </span>
)}

                </div>

            ))

        )}

    </div>

</div>

            </div>

            </div>

            </>

            );

            }

   export default ProcurementDashboard;