import { useEffect, useState } from "react";
import axios from "axios";

function ProcurementDashboard() {

    const [requests, setRequests] = useState([]);

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {

        try {

            const response = await axios.get(
                "http://localhost:8080/api/purchase/procurement"
            );

            setRequests(response.data);

        } catch (error) {

            console.log(error);

            alert("Unable to load procurement requests");

        }

    };

    const startProcurement = async (requestId) => {

        try {

            await axios.put(
                `http://localhost:8080/api/purchase/procurement/start/${requestId}`
            );

            alert("Procurement Started");

            loadRequests();

        } catch (error) {

            alert("Unable to start procurement");

        }

    };

    const completeProcurement = async (requestId) => {

        try {

            await axios.put(
                `http://localhost:8080/api/purchase/procurement/complete/${requestId}`
            );

            alert("Procurement Completed");

            loadRequests();

        } catch (error) {

            alert("Unable to complete procurement");

        }

    };

    return (

        <div className="container mt-4">

            <h2 className="text-center mb-4">
                Procurement Dashboard
            </h2>

            {requests.length === 0 ? (

                <h4 className="text-center">
                    No Pending Procurement Requests
                </h4>

            ) : (

                requests.map((request) => (

                    <div
                        key={request.requestId}
                        className="card shadow mb-4"
                    >

                        <div className="card-body">

                            <h4>{request.title}</h4>

                            <p>
                                <b>Description:</b> {request.description}
                            </p>

                            <p>
                                <b>Amount:</b> ₹{request.amount}
                            </p>

                            <p>
                                <b>Category:</b> {request.category}
                            </p>

                            <p>
                                <b>Status:</b> {request.status}
                            </p>

                            {request.status === "PENDING_PROCUREMENT" && (

                                <button
                                    className="btn btn-primary"
                                    onClick={() =>
                                        startProcurement(request.requestId)
                                    }
                                >
                                    Start Procurement
                                </button>

                            )}

                            {request.status === "PROCUREMENT_IN_PROGRESS" && (

                                <button
                                    className="btn btn-success"
                                    onClick={() =>
                                        completeProcurement(request.requestId)
                                    }
                                >
                                    Complete Procurement
                                </button>

                            )}

                        </div>

                    </div>

                ))

            )}

        </div>

    );

}

export default ProcurementDashboard;