import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import "bootstrap/dist/css/bootstrap.min.css";

function Login() {

    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);

    const [login, setLogin] = useState({
        email: "",
        password: ""
    });

    const handleChange = (e) => {

        setLogin({
            ...login,
            [e.target.name]: e.target.value
        });

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        setLoading(true);

        try {

            const response = await api.post("/auth/login", login);

            const user = response.data;

            alert("Login Successful");

            localStorage.setItem("user", JSON.stringify(user));

            switch (user.role) {

                case "EMPLOYEE":
                    navigate("/employee");
                    break;

                case "MANAGER":
                    navigate("/manager");
                    break;

                case "PROCUREMENT_OFFICER":
                    navigate("/procurement");
                    break;

                case "ADMIN":
                    navigate("/admin");
                    break;


                case "VENDOR":
                    navigate("/vendor");
                    break;

                default:
                    navigate("/");

            }

        }

        catch (err) {

            alert("Invalid Email or Password");

        }

        finally {

            setLoading(false);

        }

    };

    return (

<>
<div
style={{
minHeight: "100vh",
background:
"linear-gradient(135deg,#0f172a 0%,#1d4ed8 45%,#60a5fa 100%)",
display: "flex",
alignItems: "center",
justifyContent: "center",
padding: "40px",
position: "relative",
overflow: "hidden"
}}
>

<div
style={{
position: "absolute",
width: "420px",
height: "420px",
borderRadius: "50%",
background: "rgba(255,255,255,0.08)",
top: "-120px",
left: "-120px"
}}
></div>

<div
style={{
position: "absolute",
width: "300px",
height: "300px",
borderRadius: "50%",
background: "rgba(255,255,255,0.06)",
bottom: "-100px",
right: "-80px"
}}
></div>

<div className="container">

<div className="row align-items-center g-5">

<div className="col-lg-6 text-white">

<div
style={{
fontSize: "65px"
}}
>
🏢
</div>

<h1
style={{
fontSize: "52px",
fontWeight: "800",
lineHeight: "1.2"
}}
>
Enterprise Procurement
System
</h1>

<p
style={{
fontSize: "20px",
opacity: "0.9",
marginTop: "20px",
marginBottom: "35px"
}}
>
A modern enterprise platform that streamlines
purchase requests, approvals, and procurement
operations with security, speed, and efficiency.
</p>

<div className="mb-4">

<div
className="d-flex align-items-center mb-3"
style={{fontSize:"18px"}}
>
<div
style={{
width:"42px",
height:"42px",
borderRadius:"50%",
background:"rgba(255,255,255,0.15)",
display:"flex",
alignItems:"center",
justifyContent:"center",
marginRight:"15px"
}}
>
📋
</div>

Employee Purchase Requests

</div>

<div
className="d-flex align-items-center mb-3"
style={{fontSize:"18px"}}
>

<div
style={{
width:"42px",
height:"42px",
borderRadius:"50%",
background:"rgba(255,255,255,0.15)",
display:"flex",
alignItems:"center",
justifyContent:"center",
marginRight:"15px"
}}
>
✔
</div>

Manager Approval Workflow

</div>

<div
className="d-flex align-items-center mb-3"
style={{fontSize:"18px"}}
>

<div
style={{
width:"42px",
height:"42px",
borderRadius:"50%",
background:"rgba(255,255,255,0.15)",
display:"flex",
alignItems:"center",
justifyContent:"center",
marginRight:"15px"
}}
>
📦
</div>

Procurement Tracking

</div>

<div
className="d-flex align-items-center"
style={{fontSize:"18px"}}
>

<div
style={{
width:"42px",
height:"42px",
borderRadius:"50%",
background:"rgba(255,255,255,0.15)",
display:"flex",
alignItems:"center",
justifyContent:"center",
marginRight:"15px"
}}
>
🔒
</div>

Secure Role-Based Authentication

</div>

</div>

<div
style={{
marginTop:"40px",
padding:"20px",
borderRadius:"20px",
background:"rgba(255,255,255,0.10)",
backdropFilter:"blur(10px)"
}}
>

<h5 style={{fontWeight:"700"}}>

Why Choose Our System?

</h5>

<p
style={{
marginBottom:0,
opacity:0.9
}}
>

Manage procurement efficiently with centralized
requests, transparent approvals, secure access,
and real-time procurement updates.

</p>

</div>

</div>

<div className="col-lg-6">
<div
className="card border-0 shadow-lg"
style={{
borderRadius: "30px",
background: "rgba(255,255,255,0.18)",
backdropFilter: "blur(18px)",
WebkitBackdropFilter: "blur(18px)",
boxShadow: "0 20px 60px rgba(0,0,0,0.25)"
}}
>

<div className="card-body p-5">

<div className="text-center mb-4">

<div
style={{
fontSize: "55px"
}}
>
🔐
</div>

<h2
style={{
fontWeight: "800",
color: "#ffffff",
marginTop: "10px"
}}
>
Welcome Back
</h2>

<p
style={{
color: "rgba(255,255,255,0.85)",
marginBottom: 0
}}
>
Sign in to continue to your dashboard
</p>

</div>

<form onSubmit={handleSubmit}>

<div className="mb-4">

<label
className="form-label"
style={{
color: "#ffffff",
fontWeight: "600"
}}
>
Email Address
</label>

<div className="input-group">

<span
className="input-group-text"
style={{
borderRadius: "15px 0 0 15px",
border: "none",
background: "#ffffff"
}}
>
📧
</span>

<input
type="email"
name="email"
className="form-control"
placeholder="Enter your email"
value={login.email}
onChange={handleChange}
required
style={{
border: "none",
padding: "14px",
borderRadius: "0 15px 15px 0",
boxShadow: "none"
}}
/>

</div>

</div>

<div className="mb-4">

<label
className="form-label"
style={{
color: "#ffffff",
fontWeight: "600"
}}
>
Password
</label>

<div className="input-group">

<span
className="input-group-text"
style={{
borderRadius: "15px 0 0 15px",
border: "none",
background: "#ffffff"
}}
>
🔒
</span>

<input
type={showPassword ? "text" : "password"}
name="password"
className="form-control"
placeholder="Enter your password"
value={login.password}
onChange={handleChange}
required
style={{
border: "none",
padding: "14px",
boxShadow: "none"
}}
/>

<button
type="button"
className="btn"
onClick={() => setShowPassword(!showPassword)}
style={{
background: "#ffffff",
border: "none",
borderRadius: "0 15px 15px 0",
fontSize: "20px",
width: "60px"
}}
>
{showPassword ? "🙈" : "👁"}
</button>

</div>

</div>

<div className="d-grid mb-4">

<button
type="submit"
className="btn btn-lg"
disabled={loading}
style={{
background:
"linear-gradient(90deg,#2563eb,#1d4ed8)",
color: "#ffffff",
fontWeight: "700",
border: "none",
borderRadius: "16px",
padding: "15px",
transition: "0.3s"
}}
>

{loading ? (

<>
<span
className="spinner-border spinner-border-sm me-2"
></span>

Signing In...

</>

) : (

<>
🚀 Login to Dashboard
</>

)}

</button>

</div>

<div
className="text-center"
style={{
color: "#ffffff",
fontSize: "15px"
}}
>

Need help accessing your account?

<br />

<span
style={{
opacity: 0.85
}}
>
Contact your system administrator.
</span>

</div>

<hr
style={{
borderColor: "rgba(255,255,255,0.25)",
margin: "30px 0"
}}
/>
</form>
<div className="text-center">

<p
style={{
color: "#ffffff",
marginBottom: "10px"
}}
>
New to Enterprise Procurement?
</p>

<Link
to="/register"
className="btn btn-outline-light btn-lg"
style={{
borderRadius: "15px",
padding: "12px 35px",
fontWeight: "600",
textDecoration: "none"
}}
>
✨ Create New Account
</Link>

</div>

<div
className="mt-5"
style={{
background: "rgba(255,255,255,0.10)",
borderRadius: "18px",
padding: "18px",
textAlign: "center"
}}
>

<h6
style={{
color: "#ffffff",
fontWeight: "700",
marginBottom: "10px"
}}
>
🛡 Secure Authentication
</h6>

<p
style={{
color: "rgba(255,255,255,0.85)",
marginBottom: 0,
fontSize: "14px",
lineHeight: "1.6"
}}
>
Your credentials are securely processed and
role-based authentication ensures that every
user can access only their authorized modules.
</p>

</div>

<div
className="text-center mt-4"
style={{
color: "rgba(255,255,255,0.75)",
fontSize: "13px"
}}
>
© {new Date().getFullYear()} Enterprise Procurement System
<br />
Built with React • Spring Boot • MySQL
</div>

</div>   {/* card-body */}

</div>   {/* card */}

</div>   {/* col-lg-6 */}

</div>   {/* row */}

</div>   {/* container */}

</div>   {/* background */}

</>

);

}

export default Login;