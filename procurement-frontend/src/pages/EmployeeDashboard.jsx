import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:8080/api/purchase";

function EmployeeDashboard() {

    const navigate = useNavigate();

    const employeeId = 1;

    const emptyRequest = {
        title: "",
        description: "",
        quantity: "",
        category: "",
<<<<<<< HEAD
        amount: "",
        priority: "LOW",

    };
    

    const [request, setRequest] = useState(emptyRequest);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");

    const loadRequests = async () => {

        try {

            const response = await axios.get(
                `${API}/myrequests/${employeeId}`
            );

            setRequests(response.data);

        } catch (error) {

            console.error(error);

        }

    };

    useEffect(() => {

        loadRequests();

    }, []);

    const handleChange = (e) => {

        const { name, value, type, checked } = e.target;
=======
        priority: "LOW"
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
>>>>>>> full-stack-version

        setRequest({
            ...request,
            [name]: value
        });

    };

    const submitRequest = async () => {

        try {

            setLoading(true);
                console.log("Sending Request:", request);
            await axios.post(
                `${API}/create/${employeeId}`,
                request
            );

            alert("Purchase Request Submitted Successfully!");

<<<<<<< HEAD
            setRequest(emptyRequest);
=======
            setRequest({
                title: "",
                description: "",
                amount: "",
                category: "",
                priority: "LOW"
            });
>>>>>>> full-stack-version

            loadRequests();

<<<<<<< HEAD
        } catch(error){

    console.log(error);

    if(error.response && error.response.data){

        alert(error.response.data.message || error.response.data);

    } else {

        alert("Unable to submit request");

    }
} finally {

            setLoading(false);
=======
            console.error(error);
            alert("Unable to submit request");
>>>>>>> full-stack-version

        }

    };

    const getBadge = (status) => {

<<<<<<< HEAD
        switch (status) {
=======
        <div style={{ padding: "30px" }}>
>>>>>>> full-stack-version

            case "PENDING_MANAGER":
                return "warning";

            case "PENDING_PROCUREMENT":
                return "primary";

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

    const filteredRequests = useMemo(() => {

        return requests.filter((r) => {

            const text = search.toLowerCase();

            return (

                r.title?.toLowerCase().includes(text) ||

                r.category?.toLowerCase().includes(text) ||

                r.status?.toLowerCase().includes(text)

            );

        });

    }, [requests, search]);

    const totalRequests = requests.length;

    const pendingRequests = requests.filter(

        r =>

            r.status === "PENDING_MANAGER" ||

            r.status === "PENDING_PROCUREMENT" ||

            r.status === "PROCUREMENT_IN_PROGRESS"

    ).length;

    const completedRequests = requests.filter(

        r => r.status === "COMPLETED"

    ).length;

    const rejectedRequests = requests.filter(

        r => r.status === "REJECTED"

    ).length;

    return (<>
    <div
        className="container-fluid py-4"
        style={{
            minHeight: "100vh",
            background:
                "linear-gradient(135deg,#eef5ff 0%,#f8fbff 50%,#ffffff 100%)"
        }}
    >
        <div className="container">

            {/* ================= HERO ================= */}

            <div
                className="mb-4"
                style={{
                    borderRadius: "24px",
                    background:
                        "linear-gradient(135deg,#0d6efd,#3b82f6,#60a5fa)",
                    color: "white",
                    overflow: "hidden",
                    boxShadow: "0 20px 45px rgba(13,110,253,.25)"
                }}
            >
<<<<<<< HEAD

                <div className="row align-items-center p-5">

                    <div className="col-lg-8">
=======
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
            </select>
>>>>>>> full-stack-version

                        <div
                            className="mb-2"
                            style={{
                                letterSpacing: "2px",
                                opacity: .8,
                                fontSize: "14px"
                            }}
                        >
                            ENTERPRISE PROCUREMENT SYSTEM
                        </div>

<<<<<<< HEAD
                        <h1
                            className="fw-bold"
                            style={{
                                fontSize: "42px"
                            }}
                        >
                            Employee Dashboard
                        </h1>

                        <p
                            className="mt-3 mb-0"
                            style={{
                                opacity: .9,
                                maxWidth: "650px",
                                fontSize: "17px"
                            }}
                        >
                            Create purchase requests,
                            monitor approvals,
                            track procurement progress
                            and manage every request
                            from one place.
                        </p>

                    </div>

                    <div className="col-lg-4 text-lg-end mt-4 mt-lg-0">

                        <button
                            className="btn btn-light btn-lg"
                            style={{
                                borderRadius: "50px",
                                padding: "12px 34px",
                                fontWeight: "600"
                            }}
                            onClick={() => navigate("/")}
                        >
                            Logout
                        </button>

                    </div>

                </div>

            </div>

            {/* ================= KPI CARDS ================= */}

            <div className="row g-4 mb-5">

                <div className="col-md-3">

                    <div
                        className="card border-0 h-100"
                        style={{
                            borderRadius: "22px",
                            boxShadow:
                                "0 10px 25px rgba(0,0,0,.08)"
                        }}
                    >

                        <div className="card-body">

                            <div className="d-flex justify-content-between">

                                <div>

                                    <small
                                        className="text-muted fw-bold"
                                    >
                                        TOTAL REQUESTS
                                    </small>

                                    <h1
                                        className="fw-bold mt-3 text-primary"
                                    >
                                        {totalRequests}
                                    </h1>

                                </div>

                                <div
                                    style={{
                                        width:70,
                                        height:70,
                                        borderRadius:18,
                                        background:"#EAF2FF",
                                        display:"flex",
                                        justifyContent:"center",
                                        alignItems:"center",
                                        fontSize:34
                                    }}
                                >
                                    📦
                                </div>

                            </div>

                        </div>

                    </div>

                </div>

                <div className="col-md-3">

                    <div
                        className="card border-0 h-100"
                        style={{
                            borderRadius:"22px",
                            boxShadow:
                                "0 10px 25px rgba(0,0,0,.08)"
                        }}
                    >

                        <div className="card-body">

                            <div className="d-flex justify-content-between">

                                <div>

                                    <small
                                        className="text-muted fw-bold"
                                    >
                                        PENDING
                                    </small>

                                    <h1
                                        className="fw-bold mt-3 text-warning"
                                    >
                                        {pendingRequests}
                                    </h1>

                                </div>

                                <div
                                    style={{
                                        width:70,
                                        height:70,
                                        borderRadius:18,
                                        background:"#FFF6DD",
                                        display:"flex",
                                        justifyContent:"center",
                                        alignItems:"center",
                                        fontSize:34
                                    }}
                                >
                                    ⏳
                                </div>

                            </div>

                        </div>

                    </div>

                </div>

                <div className="col-md-3">

                    <div
                        className="card border-0 h-100"
                        style={{
                            borderRadius:"22px",
                            boxShadow:
                                "0 10px 25px rgba(0,0,0,.08)"
                        }}
                    >

                        <div className="card-body">

                            <div className="d-flex justify-content-between">

                                <div>

                                    <small
                                        className="text-muted fw-bold"
                                    >
                                        COMPLETED
                                    </small>

                                    <h1
                                        className="fw-bold mt-3 text-success"
                                    >
                                        {completedRequests}
                                    </h1>

                                </div>

                                <div
                                    style={{
                                        width:70,
                                        height:70,
                                        borderRadius:18,
                                        background:"#E7FFF2",
                                        display:"flex",
                                        justifyContent:"center",
                                        alignItems:"center",
                                        fontSize:34
                                    }}
                                >
                                    ✅
                                </div>

                            </div>

                        </div>

                    </div>

                </div>

                <div className="col-md-3">

                    <div
                        className="card border-0 h-100"
                        style={{
                            borderRadius:"22px",
                            boxShadow:
                                "0 10px 25px rgba(0,0,0,.08)"
                        }}
                    >

                        <div className="card-body">

                            <div className="d-flex justify-content-between">

                                <div>

                                    <small
                                        className="text-muted fw-bold"
                                    >
                                        REJECTED
                                    </small>

                                    <h1
                                        className="fw-bold mt-3 text-danger"
                                    >
                                        {rejectedRequests}
                                    </h1>

                                </div>

                                <div
                                    style={{
                                        width:70,
                                        height:70,
                                        borderRadius:18,
                                        background:"#FFEAEA",
                                        display:"flex",
                                        justifyContent:"center",
                                        alignItems:"center",
                                        fontSize:34
                                    }}
                                >
                                    ❌
                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

            {/* ================= REQUEST FORM ================= */}

            <div
                className="card border-0 mb-5"
                style={{
                    borderRadius:"24px",
                    background:"rgba(255,255,255,.96)",
                    boxShadow:
                        "0 18px 40px rgba(0,0,0,.08)"
                }}
            >

                <div
                    className="card-header border-0"
                    style={{
                        background:
                        "linear-gradient(90deg,#0d6efd,#2563eb)",
                        color:"white",
                        borderTopLeftRadius:"24px",
                        borderTopRightRadius:"24px",
                        padding:"22px"
                    }}
                >

                    <h3 className="mb-1 fw-bold">
                        Create Purchase Request
                    </h3>

                    <small
                        style={{
                            opacity:.85
                        }}
                    >
                        Fill in the required details below.
                    </small>

                </div>

                <div className="card-body p-4">

                    <div className="row">

                        <div className="col-md-6 mb-4">

                            <label className="form-label fw-semibold">
                                Title
                            </label>

                            <input
                                type="text"
                                className="form-control form-control-lg"
                                style={{
                                    borderRadius:"14px"
                                }}
                                name="title"
                                value={request.title}
                                onChange={handleChange}
                                placeholder="Purchase title"
                            />

                        </div>

                        <div className="col-md-6 mb-4">

                            <label className="form-label fw-semibold">
                                Category
                            </label>

                            <input
                                type="text"
                                className="form-control form-control-lg"
                                style={{
                                    borderRadius:"14px"
                                }}
                                name="category"
                                value={request.category}
                                onChange={handleChange}
                                placeholder="Category"
                            />
                        </div>
                        </div>
                                                <div className="mb-4">

                            <label className="form-label fw-semibold">
                                Description
                            </label>

                            <textarea
                                className="form-control"
                                rows="5"
                                style={{
                                    borderRadius: "14px",
                                    resize: "none"
                                }}
                                name="description"
                                value={request.description}
                                onChange={handleChange}
                                placeholder="Describe your purchase request..."
                            />

                        </div>

                        <div className="row">

                            <div className="col-md-6 mb-4">

                                <label className="form-label fw-semibold">
                                    Quantity
                                </label>

                                <input
                                    type="number"
                                    className="form-control form-control-lg"
                                    style={{
                                        borderRadius: "14px"
                                    }}
                                    name="quantity"
                                    value={request.quantity}
                                    onChange={handleChange}
                                    placeholder="Enter Quantity"
                                />
                               <label className="form-label mt-3">
                                     Estimated Amount
                                </label>
                                    <input
                                        type="number"
                                        className="form-control form-control-lg"
                                        style={{
                                            borderRadius: "14px"
                                        }}
                                        name="amount"
                                        value={request.amount}
                                        onChange={handleChange}
                                        placeholder="Enter Amount"
                                    />
                            </div>
                            


                            <div className="col-md-6 mb-4">

                                <label className="form-label fw-semibold">
                                    Priority
                                </label>

                                <select
                                    className="form-select form-select-lg"
                                    style={{
                                        borderRadius: "14px"
                                    }}
                                    name="priority"
                                    value={request.priority}
                                    onChange={handleChange}
                                >

                                    <option value="LOW">LOW</option>

                                    <option value="MEDIUM">
                                        MEDIUM
                                    </option>

                                    <option value="HIGH">
                                        HIGH
                                    </option>

                                   
                                </select>

                            </div>

                        </div>

                      

                        <div className="d-flex gap-3">

                            <button
                                className="btn btn-primary btn-lg"
                                style={{
                                    borderRadius: "50px",
                                    padding: "12px 35px",
                                    fontWeight: "600"
                                }}
                                disabled={loading}
                                onClick={submitRequest}
                            >

                                {loading
                                    ? "Submitting..."
                                    : "Submit Request"}

                            </button>

                            <button
                                type="button"
                                className="btn btn-outline-secondary btn-lg"
                                style={{
                                    borderRadius: "50px",
                                    padding: "12px 35px"
                                }}
                                onClick={() =>
                                    setRequest(emptyRequest)
                                }
                            >
                                Reset
                            </button>

                        </div>

                    </div>

                </div>

                {/* ================= REQUEST TABLE ================= */}

                <div
                    className="card border-0"
                    style={{
                        borderRadius: "24px",
                        boxShadow:
                            "0 18px 40px rgba(0,0,0,.08)"
                    }}
                >

                    <div
                        className="card-header border-0 p-4"
                        style={{
                            background:
                                "linear-gradient(90deg,#111827,#1f2937)",
                            color: "white",
                            borderTopLeftRadius: "24px",
                            borderTopRightRadius: "24px"
                        }}
                    >

                        <div className="row align-items-center">

                            <div className="col-md-6">

                                <h3 className="mb-0 fw-bold">
                                    My Purchase Requests
                                </h3>

                            </div>

                            <div className="col-md-6">

                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search requests..."
                                    value={search}
                                    onChange={(e) =>
                                        setSearch(
                                            e.target.value
                                        )
                                    }
                                    style={{
                                        borderRadius: "50px",
                                        padding: "12px 20px"
                                    }}
                                />

                            </div>

                        </div>

                    </div>

                    <div className="card-body p-0">

                        <div className="table-responsive">

                            <table
                                className="table align-middle mb-0"
                            >

                                <thead
                                    style={{
                                        background: "#f5f7fb"
                                    }}
                                >

                                    <tr>

                                        <th className="ps-4">
                                            Title
                                        </th>

                                        <th>Category</th>

                                        <th>Quantity</th>

                                        <th>Amount</th>

                                        <th>Priority</th>

                                        <th>Status</th>

                                        <th>Remarks</th>

                                        <th className="pe-4">
                                            Created
                                        </th>

                                    </tr>

                                </thead>
                                <tbody>                                   
                                     {filteredRequests.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan="8"
                                                className="text-center py-5 text-muted"
                                            >
                                                <div
                                                    style={{
                                                        fontSize: "60px"
                                                    }}
                                                >
                                                    📦
                                                </div>
                                                <h5 className="mt-3">
                                                    No Purchase Requests Found
                                                </h5>
                                                <p className="mb-0">
                                                    Create your first purchase request to get started.
                                                </p>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredRequests.map((r) => (
                                            <tr
                                                key={r.requestId}
                                                style={{
                                                    transition: "0.25s"
                                                }}
                                            >
                                                <td className="ps-4 fw-semibold">
                                                    {r.title}
                                                </td>
                                                <td>
                                                    {r.category}
                                                </td>
                                                <td>
                                                <span
                                                        className="badge bg-light text-dark border"
                                                        style={{
                                                            fontSize: "14px",
                                                            padding: "8px 12px"
                                                        }}
                                                    >
                                                        {r.quantity}
                                                    </span>
                                                </td>

                                                <td>
                                                    ₹ {r.amount}
                                                </td> 

                                                <td>

                                                    <span
                                                        className={`badge rounded-pill bg-${
                                                            r.priority === "LOW"
                                                                ? "secondary"
                                                                : r.priority === "MEDIUM"
                                                                ? "primary"
                                                                : r.priority === "HIGH"
                                                                ? "warning"
                                                                : "danger"
                                                        }`}
                                                        style={{
                                                            padding:
                                                                "8px 14px",
                                                            fontSize: "13px"
                                                        }}
                                                    >
                                                        {r.priority}
                                                    </span>

                                                </td>

                                                <td>

                                                    <span
                                                        className={`badge rounded-pill bg-${getBadge(
                                                            r.status
                                                        )}`}
                                                        style={{
                                                            padding:
                                                                "8px 14px",
                                                            fontSize: "13px"
                                                        }}
                                                    >
                                                        {r.status.replaceAll(
                                                            "_",
                                                            " "
                                                        )}
                                                    </span>

                                                </td>

                                                <td>

                                                    {r.remarks ? (

                                                        <span className="text-success fw-semibold">
                                                            {r.remarks}
                                                        </span>

                                                    ) : (

                                                        <span className="text-muted">
                                                            —
                                                        </span>

                                                    )}

                                                </td>

                                                <td className="pe-4">

                                                    {r.createdDate
                                                        ? new Date(
                                                              r.createdDate
                                                          ).toLocaleString()
                                                        : "-"}

                                                </td>

                                            </tr>

                                        ))

                                    )}

                                </tbody>

                            </table>

                        </div>

                    </div>

                </div>

            </div>
=======
            <button onClick={submitRequest}>
                Submit Request
            </button>
>>>>>>> full-stack-version

        </div>

    </>

    );

}

export default EmployeeDashboard;