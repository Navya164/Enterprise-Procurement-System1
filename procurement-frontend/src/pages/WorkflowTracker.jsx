import { useState } from "react";
import axios from "axios";

function WorkflowTracker() {

    const [requestId, setRequestId] = useState("");

    const [request, setRequest] = useState(null);

    const loadWorkflow = async () => {

        if (requestId === "") {

            alert("Please enter Request ID");

            return;

        }

        try {

            const response = await axios.get(
                `http://localhost:8080/api/purchase/workflow/${requestId}`
            );

            setRequest(response.data);

        } catch (error) {

            console.log(error);

            alert("Request not found");

            setRequest(null);

        }

    };

    return (

        <div className="container mt-5">

            <h2 className="text-center mb-4">
                Workflow Tracker
            </h2>

            <div className="row justify-content-center">

                <div className="col-md-6">

                    <div className="input-group mb-4">

                        <input
                            type="number"
                            className="form-control"
                            placeholder="Enter Request ID"
                            value={requestId}
                            onChange={(e) => setRequestId(e.target.value)}
                        />

                        <button
                            className="btn btn-primary"
                            onClick={loadWorkflow}
                        >
                            Track
                        </button>

                    </div>

                </div>

            </div>

            {request && (

                <div className="card shadow">

                    <div className="card-body">

                        <h3>{request.title}</h3>

                        <hr />

                        <p>
                            <strong>Description:</strong> {request.description}
                        </p>

                        <p>
                            <strong>Category:</strong> {request.category}
                        </p>

                        <p>
                            <strong>Amount:</strong> ₹{request.amount}
                        </p>

                        <p>
                            <strong>Priority:</strong> {request.priority}
                        </p>

                        <p>
                            <strong>Status:</strong> {request.status}
                        </p>

                        <p>
                            <strong>Current Level:</strong> {request.currentLevel}
                        </p>

                        <p>
                            <strong>Created Date:</strong> {request.createdDate}
                        </p>

                        <p>
                            <strong>Approval Date:</strong>{" "}
                            {request.approvalDate || "Not Approved Yet"}
                        </p>

                        <p>
                            <strong>Expiry Date:</strong>{" "}
                            {request.expiryDate || "Not Available"}
                        </p>

                        <p>
                            <strong>Remarks:</strong>{" "}
                            {request.remarks || "No Remarks"}
                        </p>

                    </div>

                </div>

            )}

        </div>

    );

}

export default WorkflowTracker;