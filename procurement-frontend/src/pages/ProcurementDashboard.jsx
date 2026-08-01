import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:8080/api/purchase";

function ProcurementDashboard() {

    const navigate = useNavigate();

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {

        try {

            const response = await axios.get(
                `${API}/procurement`
            );

            setRequests(response.data);

        } catch (error) {

            console.error(error);
            alert("Unable to load procurement requests.");

        }

    };

    const startProcurement = async (requestId) => {

        try {

            setLoading(true);

            await axios.put(
                `${API}/procurement/start/${requestId}`
            );

            alert("Procurement Started Successfully!");

            loadRequests();

        } catch (error) {

            console.error(error);
            alert("Unable to start procurement.");

        } finally {

            setLoading(false);

        }

    };

    const completeProcurement = async (requestId) => {

        try {

            setLoading(true);

            await axios.put(
                `${API}/procurement/complete/${requestId}`
            );

            alert("Procurement Completed Successfully!");

            loadRequests();

        } catch (error) {

            console.error(error);
            alert("Unable to complete procurement.");

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

requests.map((request)=>(

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

<div className="d-flex gap-3 mt-4">{request.status === "PENDING_PROCUREMENT" && (

<button
className="btn btn-primary btn-lg"
style={{
borderRadius:"50px",
padding:"12px 30px",
fontWeight:"600"
}}
disabled={loading}
onClick={()=>
startProcurement(
request.requestId
)
}
>
🚀 Start Procurement
</button>

)}

{request.status === "PROCUREMENT_IN_PROGRESS" && (

<button
className="btn btn-success btn-lg"
style={{
borderRadius:"50px",
padding:"12px 30px",
fontWeight:"600"
}}
disabled={loading}
onClick={()=>
completeProcurement(
request.requestId
)
}
>
✅ Complete Procurement
</button>

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

</div>

))

}

</div>

</div>

</div>

</div>

</>

);

}

export default ProcurementDashboard;