import { useEffect, useState } from "react";
import axios from "axios";


const API = "http://localhost:8080/api/vendor/orders";


function VendorDashboard(){

    const [orders,setOrders] = useState([]);


    useEffect(()=>{
        loadOrders();
    },[]);



    const loadOrders = async()=>{

        try{

            const response = await axios.get(API);

            setOrders(response.data);

        }catch(error){

            console.error(error);

        }

    };
        const updateStatus = async(id, status)=>{

    try{

        await axios.patch(
            `http://localhost:8080/api/purchase-orders/${id}/status`,
            {
                status: status
            }
        );

        alert("Order Updated");

        loadOrders();

    }
    catch(error){

        console.error(error);

        alert(
    JSON.stringify(error.response?.data)
);

    }

};


    return (
    <div
        className="container py-5"
        style={{
            minHeight: "100vh",
            background: "linear-gradient(to right,#eef6ff,#ffffff)"
        }}
    >

        <div
            className="text-center mb-5"
            style={{
                background: "linear-gradient(135deg,#0d6efd,#4dabf7)",
                color: "white",
                padding: "30px",
                borderRadius: "20px"
            }}
        >
            <h1>Vendor Dashboard</h1>
            <p className="mb-0">
                Manage Purchase Orders and Track Deliveries
            </p>
        </div>

        {/* NEW ORDERS */}

        <h3 className="text-primary mb-3">
            📦 New Purchase Orders
        </h3>

        {
            orders.filter(o => o.status === "SENT").length === 0 ?

            <div className="alert alert-light">
                No New Purchase Orders
            </div>

            :

            orders
                .filter(o => o.status === "SENT")
                .map(order => (

                    <div
                        key={order.id}
                        className="card shadow border-0 mb-4"
                        style={{borderRadius:"18px"}}
                    >

                        <div className="card-body">

                            <h4 className="text-primary">
                                {order.poNumber}
                            </h4>

                            <hr/>

                            <p><b>Vendor :</b> {order.vendorName}</p>

                            <p><b>Email :</b> {order.vendorEmail}</p>

                            <p><b>Item :</b> {order.itemName}</p>

                            <p><b>Quantity :</b> {order.quantity}</p>

                            <p><b>Total :</b> ₹{order.totalAmount}</p>

                            <p><b>Expected Delivery :</b> {order.expectedDeliveryDate}</p>

                            <span className="badge bg-warning text-dark">
                                {order.status}
                            </span>

                            <div className="mt-4">

                                <button
                                    className="btn btn-success me-2"
                                    onClick={() => updateStatus(order.id,"ACCEPTED")}
                                >
                                    ✔ Accept
                                </button>

                                <button
                                    className="btn btn-danger"
                                    onClick={() => updateStatus(order.id,"REJECTED")}
                                >
                                    ✖ Reject
                                </button>

                            </div>

                        </div>

                    </div>

                ))
        }

        <hr className="my-5"/>

        {/* ACTIVE ORDERS */}

        <h3 className="text-success mb-3">
            🚚 Active Orders
        </h3>

        {
            orders
                .filter(o =>
                    o.status==="ACCEPTED" ||
                    o.status==="SHIPPED" ||
                    o.status==="PARTIALLY_DELIVERED"
                )
                .map(order=>(

                    <div
                        key={order.id}
                        className="card shadow-sm mb-3"
                        style={{borderRadius:"18px"}}
                    >

                        <div className="card-body">

                            <div className="row">

                                <div className="col-md-8">

                                    <h5>{order.poNumber}</h5>

                                    <p><b>Item:</b> {order.itemName}</p>

                                    <p><b>Vendor:</b> {order.vendorName}</p>

                                    <p><b>Quantity:</b> {order.quantity}</p>

                                    <p>
                                        <b>Delivered:</b>
                                        {" "}
                                        {order.deliveredQuantity}/{order.quantity}
                                    </p>

                                </div>

                                <div className="col-md-4 text-end">

                                    <span className="badge bg-info fs-6">
                                        {order.status}
                                    </span>

                                </div>

                            </div>

                        </div>

                    </div>

                ))
        }

        <hr className="my-5"/>

        {/* COMPLETED */}

        <h3 className="text-success mb-3">
            ✅ Completed Orders
        </h3>

        {
            orders
                .filter(o =>
                    o.status==="DELIVERED" ||
                    o.status==="CLOSED"
                )
                .map(order=>(

                    <div
                        key={order.id}
                        className="card border-success shadow-sm mb-3"
                        style={{borderRadius:"18px"}}
                    >

                        <div className="card-body">

                            <h5>{order.poNumber}</h5>

                            <p><b>Item:</b> {order.itemName}</p>

                            <p><b>Total:</b> ₹{order.totalAmount}</p>

                            <p><b>Vendor:</b> {order.vendorName}</p>

                            <span className="badge bg-success">
                                {order.status}
                            </span>

                        </div>

                    </div>

                ))
        }

        <hr className="my-5"/>

        {/* REJECTED */}

        <h3 className="text-danger mb-3">
            ❌ Rejected / Cancelled
        </h3>

        {
            orders
                .filter(o =>
                    o.status==="REJECTED" ||
                    o.status==="CANCELLED"
                )
                .map(order=>(

                    <div
                        key={order.id}
                        className="card border-danger mb-3"
                        style={{borderRadius:"18px"}}
                    >

                        <div className="card-body">

                            <h5>{order.poNumber}</h5>

                            <p>{order.itemName}</p>

                            <span className="badge bg-danger">
                                {order.status}
                            </span>

                        </div>

                    </div>

                ))
        }

    </div>
);

}


export default VendorDashboard;