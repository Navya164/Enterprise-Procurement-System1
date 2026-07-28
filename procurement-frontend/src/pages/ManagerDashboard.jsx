import { useEffect, useState } from "react";
import axios from "axios";

function ManagerDashboard() {

    const [requests, setRequests] = useState([]);
    const [remarks, setRemarks] = useState({});

    useEffect(() => {
        loadPendingRequests();
    }, []);

    const loadPendingRequests = async () => {
        try {
            const response = await axios.get("http://localhost:8080/api/purchase/pending");
            setRequests(response.data);
        } catch (error) {
            console.log(error);
        }
    };

    const approveRequest = async (requestId, approved) => {

        try {

            await axios.post(
                `http://localhost:8080/api/purchase/approve/${requestId}`,
                {
                    approved: approved,
                 remarks: remarks[requestId] || "Approved by manager",
                    managerId: 2
                }
            );

            alert("Request Updated Successfully");

            loadPendingRequests();

        } catch (error) {
            alert("Unable to update request");
        }

    };

    return (

        <div style={{ padding: "30px" }}>

            <h2>Manager Dashboard</h2>

            {requests.length === 0 ? (
                <h3>No Pending Requests</h3>
            ) : (

                requests.map((request) => (

                    <div
                        key={request.requestId}
                        style={{
                            border: "1px solid gray",
                            padding: "20px",
                            marginBottom: "20px",
                            borderRadius: "8px"
                        }}
                    >

                        <h3>{request.title}</h3>

                        <p><b>Description:</b> {request.description}</p>

                        <p><b>Amount:</b> ₹{request.amount}</p>

                        <p><b>Category:</b> {request.category}</p>

                        <p><b>Priority:</b> {request.priority}</p>

                        <textarea
                            placeholder="Enter Remarks"
                            value={remarks[request.requestId] || ""}
                            onChange={(e) =>
                                setRemarks({
                                    ...remarks,
                                    [request.requestId]: e.target.value
                                })
                            }
                        />

                        <br /><br />

                        <button
                            onClick={() => approveRequest(request.requestId, true)}
                        >
                            Approve
                        </button>

                        <button
                            style={{ marginLeft: "10px" }}
                            onClick={() => approveRequest(request.requestId, false)}
                        >
                            Reject
                        </button>

                    </div>

                ))

            )}

        </div>

    );

}

export default ManagerDashboard;