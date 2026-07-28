import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import "bootstrap/dist/css/bootstrap.min.css";

function Login() {

    const navigate = useNavigate();

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

                default:
                    navigate("/");
            }

        }
        catch (err) {

            alert("Invalid Email or Password");

        }

    };

    return (

        <div className="container mt-5">

            <div className="row justify-content-center">

                <div className="col-md-5">

                    <div className="card shadow">

                        <div className="card-body">

                            <h2 className="text-center mb-4">
                                Enterprise Procurement System
                            </h2>

                            <form onSubmit={handleSubmit}>

                                <div className="mb-3">

                                    <label>Email</label>

                                    <input
                                        type="email"
                                        className="form-control"
                                        name="email"
                                        onChange={handleChange}
                                        required
                                    />

                                </div>

                                <div className="mb-3">

                                    <label>Password</label>

                                    <input
                                        type="password"
                                        className="form-control"
                                        name="password"
                                        onChange={handleChange}
                                        required
                                    />

                                </div>

                                <button
                                    className="btn btn-primary w-100"
                                >
                                    Login
                                </button>

                            </form>

                            <div className="text-center mt-3">

                                Don't have an account?

                                <br />

                                <Link to="/register">

                                    Register Here

                                </Link>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );

}

export default Login;