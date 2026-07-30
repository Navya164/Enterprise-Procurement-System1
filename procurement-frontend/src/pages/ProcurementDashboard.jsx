import { useState } from "react";

function ProcurementDashboard() {

    const [requests, setRequests] = useState([
        {
            id: 101,
            title: "Dell Latitude Laptop",
            amount: 75000,
            category: "IT Equipment",
            priority: "HIGH"
        },
        {
            id: 102,
            title: "Office Chairs",
            amount: 30000,
            category: "Furniture",
            priority: "MEDIUM"
        }
    ]);

    const [purchaseOrder, setPurchaseOrder] = useState(null);

    const createPurchaseOrder = (request) => {

        setPurchaseOrder({
            poNumber: "PO-2026-001",
            supplier: "Dell Technologies",
            item: request.title,
            quantity: 1,
            amount: request.amount,
            orderDate: "30-Jul-2026",
            expectedDelivery: "10-Aug-2026",
            status: "ORDERED"
        });

    };

    const markDelivered = () => {

        setPurchaseOrder({
            ...purchaseOrder,
            status: "DELIVERED"
        });

    };

    const completeProcurement = () => {

        alert("Procurement Completed Successfully!");

        setPurchaseOrder({
            ...purchaseOrder,
            status: "COMPLETED"
        });

    };

    return (

        <div className="container mt-4">

            <h2 className="text-center mb-4">
                Procurement Dashboard
            </h2>

            <table className="table table-bordered table-striped">

                <thead className="table-dark">

                    <tr>

                        <th>Request ID</th>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Amount</th>
                        <th>Priority</th>
                        <th>Action</th>

                    </tr>

                </thead>

                <tbody>

                    {requests.map((req) => (

                        <tr key={req.id}>

                            <td>{req.id}</td>
                            <td>{req.title}</td>
                            <td>{req.category}</td>
                            <td>₹{req.amount}</td>
                            <td>{req.priority}</td>

                            <td>

                                <button
                                    className="btn btn-primary"
                                    onClick={() => createPurchaseOrder(req)}
                                >
                                    Create Purchase Order
                                </button>

                            </td>

                        </tr>

                    ))}

                </tbody>

            </table>

            {purchaseOrder && (

                <div className="card mt-5">

                    <div className="card-header bg-success text-white">

                        <h4>Purchase Order</h4>

                    </div>

                    <div className="card-body">

                        <p><b>PO Number:</b> {purchaseOrder.poNumber}</p>

                        <p><b>Supplier:</b> {purchaseOrder.supplier}</p>

                        <p><b>Item:</b> {purchaseOrder.item}</p>

                        <p><b>Quantity:</b> {purchaseOrder.quantity}</p>

                        <p><b>Amount:</b> ₹{purchaseOrder.amount}</p>

                        <p><b>Order Date:</b> {purchaseOrder.orderDate}</p>

                        <p><b>Expected Delivery:</b> {purchaseOrder.expectedDelivery}</p>

                        <p>

                            <b>Status:</b>

                            <span className="badge bg-warning text-dark ms-2">
                                {purchaseOrder.status}
                            </span>

                        </p>

                        {purchaseOrder.status === "ORDERED" && (

                            <button
                                className="btn btn-warning me-3"
                                onClick={markDelivered}
                            >
                                Mark Delivered
                            </button>

                        )}

                        {purchaseOrder.status === "DELIVERED" && (

                            <button
                                className="btn btn-success"
                                onClick={completeProcurement}
                            >
                                Complete Procurement
                            </button>

                        )}

                    </div>

                </div>

            )}

        </div>

    );

}

export default ProcurementDashboard;