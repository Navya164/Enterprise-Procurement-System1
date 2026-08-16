import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:8080/api/purchase";

function ManagerDashboard() {

    const navigate = useNavigate();

      const user = JSON.parse(localStorage.getItem("user"));
    const managerId = user?.id;
    const [available, setAvailable] = useState(user?.available ?? true);

    const [requests, setRequests] = useState([]);
    const [remarks, setRemarks] = useState({});
    const [loading, setLoading] = useState(false);
    const [undoRequest, setUndoRequest] = useState(null);
    const [undoSeconds, setUndoSeconds] = useState(0);

  const updateAvailability = async () => {

    try {

        const newAvailability = !available;

        console.log("Current availability:", available);
        console.log("Sending availability:", newAvailability);

        const response = await axios.put(
            `${API}/availability/${managerId}?available=${newAvailability}`
        );

        console.log("Backend response:", response.data);

        setAvailable(newAvailability);

        const updatedUser = {
            ...user,
            available: newAvailability
        };

        localStorage.setItem("user", JSON.stringify(updatedUser));

    } catch (error) {

        console.error("Availability update failed:", error);
        alert("Unable to update availability.");

    }
};
    useEffect(() => {
        loadPendingRequests();
    }, []);

          useEffect(() => {

          if (!undoRequest || undoSeconds <= 0) {
              return;
          }

          const timer = setInterval(() => {

              setUndoSeconds(prev => {

                  if (prev <= 1) {
                      clearInterval(timer);
                      setUndoRequest(null);
                      return 0;
                  }

                  return prev - 1;
              });

          }, 1000);

          return () => clearInterval(timer);

      }, [undoRequest, undoSeconds]);

    const loadPendingRequests = async () => {

        try {

            const response = await axios.get(
              `${API}/pending/${managerId}`
          );

            setRequests(response.data);

        } catch (error) {

            console.error(error);
            alert("Unable to load pending requests.");

        }

    };

    const updateRequest = async (requestId, approved) => {

      
        try {

            setLoading(true);

            await axios.post(
                `${API}/approve/${requestId}`,
                {
                    approved,
                    remarks:
                        remarks[requestId] ||
                        (approved
                            ? `Approved by ${user?.role === "SENIOR_MANAGER" ? "Senior Manager" : "Manager"}`
    : `Rejected by ${user?.role === "SENIOR_MANAGER" ? "Senior Manager" : "Manager"}`),
                    managerId
                }
            );

            alert(
        approved
            ? "Request Approved Successfully!"
            : "Request Rejected Successfully!"
    );

            // Start 3-minute undo window
            setUndoRequest({
                requestId,
                approved
            });

            setUndoSeconds(180);

            loadPendingRequests();

        } catch (error) {

            console.error(error);
            alert("Unable to update request.");

        } finally {

            setLoading(false);

        }

    };

    const undoDecision = async () => {

    if (!undoRequest) {
        return;
    }

    try {

        setLoading(true);

       await axios.post(
    `${API}/undo/${undoRequest.requestId}/${managerId}`
);

        alert("Decision undone successfully.");

        setUndoRequest(null);
        setUndoSeconds(0);

        loadPendingRequests();

    } catch (error) {

        console.error(error);

        alert(
            error.response?.data?.message ||
            "Unable to undo decision."
        );

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


            default:
                return "dark";

        }

    };


    const highCount = requests.filter(
        r => r.priority === "HIGH"
    ).length;
return (
  <>
    <div
      className="container-fluid py-4"
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg,#eef5ff 0%,#f8fbff 50%,#ffffff 100%)",
      }}
    >
      <div className="container">

        {/* Header */}
        <div
          className="mb-4"
          style={{
            borderRadius: "24px",
            background:
              "linear-gradient(135deg,#0d6efd,#2563eb,#60a5fa)",
            color: "white",
            boxShadow: "0 20px 45px rgba(13,110,253,.25)",
          }}
        >
          <div className="row align-items-center p-5">
            <div className="col-lg-8">
              <div
                style={{
                  letterSpacing: "2px",
                  opacity: 0.8,
                  fontSize: "14px",
                }}
              >
                ENTERPRISE PROCUREMENT SYSTEM
              </div>

              <h1 className="fw-bold mt-2">Manager Dashboard</h1>

              <p
                className="mt-3 mb-0"
                style={{
                  opacity: 0.9,
                  maxWidth: "650px",
                }}
              >
                Review employee purchase requests, approve or reject them,
                and forward approved requests for procurement.
              </p>
            </div>



            <div className="col-lg-4 text-lg-end mt-4 mt-lg-0">
                      <button
              className={`btn ${
                  available ? "btn-success" : "btn-danger"
              } btn-lg me-2`}
              style={{
                  borderRadius: "50px",
                  padding: "12px 25px",
                  fontWeight: "600",
              }}
              onClick={updateAvailability}
          >
                {available
                    ? "🟢 Available"
                    : "🔴 Unavailable"}
            </button>
                          <button
                className="btn btn-light btn-lg"
                style={{
                  borderRadius: "50px",
                  padding: "12px 35px",
                  fontWeight: "600",
                }}
                onClick={() => navigate("/")}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
              

{/* ADD UNDO BOX HERE */}

{undoRequest && undoSeconds > 0 && (
    <div
        className="alert alert-warning d-flex justify-content-between align-items-center mb-4"
        style={{
            borderRadius: "16px",
            border: "none",
            boxShadow: "0 8px 20px rgba(0,0,0,.08)"
        }}
    >
        <div>
            <strong>
                {undoRequest.approved
                    ? "Request approved."
                    : "Request rejected."}
            </strong>

            <div className="small mt-1">
                You can undo this decision for{" "}
                <strong>
                    {Math.floor(undoSeconds / 60)}:
                    {String(undoSeconds % 60).padStart(2, "0")}
                </strong>
            </div>
        </div>

        <button
            className="btn btn-warning fw-bold"
            onClick={undoDecision}
            disabled={loading}
            style={{
                borderRadius: "10px",
                padding: "10px 22px"
            }}
        >
            Undo Decision
        </button>
    </div>
)}



        {/* Dashboard Cards */}
        <div className="row g-4 mb-5">
          <div className="col-md-6">
            <div
              className="card border-0 h-100"
              style={{
                borderRadius: "22px",
                boxShadow: "0 10px 25px rgba(0,0,0,.08)",
              }}
            >
              <div className="card-body text-center">
                <small className="text-muted fw-bold">
                  PENDING REQUESTS
                </small>

                <h1 className="fw-bold text-primary mt-3">
                  {requests.length}
                </h1>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div
              className="card border-0 h-100"
              style={{
                borderRadius: "22px",
                boxShadow: "0 10px 25px rgba(0,0,0,.08)",
              }}
            >
              <div className="card-body text-center">
                <small className="text-muted fw-bold">
                  HIGH PRIORITY
                </small>

                <h1 className="fw-bold text-warning mt-3">
                  {highCount}
                </h1>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Requests */}
        <div
          className="card border-0"
          style={{
            borderRadius: "24px",
            boxShadow: "0 18px 40px rgba(0,0,0,.08)",
          }}
        >
          <div
            className="card-header border-0"
            style={{
              background:
                "linear-gradient(90deg,#111827,#1f2937)",
              color: "white",
              borderTopLeftRadius: "24px",
              borderTopRightRadius: "24px",
              padding: "22px",
            }}
          >
            <h3 className="mb-0 fw-bold">
              Pending Purchase Requests
            </h3>
          </div>

          <div className="card-body">
            {requests.length === 0 ? (
              <div
                className="alert alert-success text-center mb-0"
                style={{
                  borderRadius: "16px",
                  fontWeight: "600",
                }}
              >
                No Pending Purchase Requests 🎉
              </div>
            ) : (
              requests.map((request) => (
                <div
                  key={request.requestId}
                  className="card border-0 mb-4"
                  style={{
                    borderRadius: "20px",
                    boxShadow: "0 10px 30px rgba(0,0,0,.08)",
                  }}
                >
                  <div className="card-body p-4">

                    <div className="row">

                      <div className="col-lg-8">
                        <h3 className="fw-bold text-primary mb-3">
                          {request.title}
                        </h3>

                        <p>
                          <strong>Description:</strong>{" "}
                          {request.description}
                        </p>

                        <p>
                          <strong>Category:</strong>{" "}
                          {request.category}
                        </p>

                        <p>
                          <strong>Quantity:</strong>{" "}
                          {request.quantity}
                        </p>
                      </div>

                      <div className="col-lg-4 text-lg-end">
                        <span
                          className={`badge rounded-pill bg-${getPriorityBadge(
                            request.priority
                          )}`}
                          style={{
                            padding: "10px 18px",
                            fontSize: "14px",
                          }}
                        >
                          {request.priority}
                        </span>
                      </div>

                    </div>

                    <div className="mt-4">
                      <label className="form-label fw-semibold">
                        Manager Remarks
                      </label>

                      <textarea
                        className="form-control"
                        rows="4"
                        style={{
                          borderRadius: "14px",
                          resize: "none",
                        }}
                        placeholder="Enter remarks..."
                        value={remarks[request.requestId] || ""}
                        onChange={(e) =>
                          setRemarks({
                            ...remarks,
                            [request.requestId]: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="d-flex gap-3 mt-4">
                      <button
                        className="btn btn-success btn-lg"
                        style={{
                          borderRadius: "50px",
                          padding: "12px 30px",
                          fontWeight: "600",
                        }}
                        disabled={loading}
                        onClick={() =>
                          updateRequest(request.requestId, true)
                        }
                                  
                        
                      >
                        ✅ Approve
                      </button>

                      <button
                        className="btn btn-danger btn-lg"
                        style={{
                          borderRadius: "50px",
                          padding: "12px 30px",
                          fontWeight: "600",
                        }}
                        disabled={loading}
                        onClick={() =>
                          updateRequest(request.requestId, false)
                        }

                        
                      >
                        ❌ Reject
                      </button>
                    </div>

                  </div>
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

export default ManagerDashboard;

