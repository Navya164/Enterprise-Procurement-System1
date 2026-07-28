import { useState } from "react";
import axios from "axios";

function ApprovalHistory() {

    const [requestId, setRequestId] = useState("");

    const [history, setHistory] = useState([]);

    const loadHistory = async () => {

        if (requestId === "") {

            alert("Please enter Request ID");

            return;

        }

        try {

            const response = await axios.get(
                `http://localhost:8080/api/history/${requestId}`
            );

            setHistory(response.data);

        } catch (error) {

            console.log(error);

            alert("Unable to load approval history");

        }

    };

    return (

        <div className="container mt-5">

            <h2 className="text-center mb-4">
                Approval History
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
                            onClick={loadHistory}
                        >
                            Search
                        </button>

                    </div>

                </div>

            </div>

            {history.length === 0 ? (

                <h5 className="text-center">
                    No Approval History Found
                </h5>

            ) : (

                history.map((item) => (

                    <div
                        key={item.historyId}
                        className="card shadow mb-3"
                    >

                        <div className="card-body">

                            <h5>
                                Approver : {item.approver.name}
                            </h5>

                            <p>
                                <strong>Role :</strong> {item.approverRole}
                            </p>

                            <p>
                                <strong>Action :</strong> {item.actionTaken}
                            </p>

                            <p>
                                <strong>Remarks :</strong> {item.remarks}
                            </p>

                            <p>
                                <strong>Approval Date :</strong> {item.actionDate}
                            </p>

                        </div>

                    </div>

                ))

            )}

        </div>

    );

}

export default ApprovalHistory;