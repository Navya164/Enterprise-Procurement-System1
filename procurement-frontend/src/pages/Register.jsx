import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Register() {

    const navigate = useNavigate();

    const [user, setUser] = useState({
        name: "",
        email: "",
        password: "",
        role: "EMPLOYEE"
    });

    const handleChange = (e) => {
        setUser({
            ...user,
            [e.target.name]: e.target.value
        });
    };

    const register = async (e) => {

        e.preventDefault();

        try {

            await api.post("/auth/register", user);

            alert("Registration Successful");

            navigate("/");

        } catch (err) {

            if (err.response) {

                alert(err.response.data);

            } else {

                alert("Server Error");

            }

        }

    };

    return (

        <div className="container mt-5">

            <div className="row justify-content-center">

                <div className="col-md-6">

                    <div className="card shadow">

                        <div className="card-body">

                            <h2 className="text-center mb-4">
                                User Registration
                            </h2>

                            <form onSubmit={register}>

                                <div className="mb-3">

                                    <label>Full Name</label>

                                    <input
                                        type="text"
                                        className="form-control"
                                        name="name"
                                        onChange={handleChange}
                                        required
                                    />

                                </div>

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

                                <div className="mb-3">

                                    <label>Role</label>

                                    <select
                                        className="form-control"
                                        name="role"
                                        onChange={handleChange}
                                    >

                                        <option value="EMPLOYEE">
                                            Employee
                                        </option>

                                        <option value="MANAGER">
                                            Manager
                                        </option>

                                        <option value="PROCUREMENT_OFFICER">
                                            Procurement Officer
                                        </option>

                                        <option value="ADMIN">
                                            Admin
                                        </option>

                                    </select>

                                </div>

                                <button className="btn btn-success w-100">

                                    Register

                                </button>

                            </form>

                            <div className="text-center mt-3">

                                Already Registered?

                                <br />

                                <Link to="/">

                                    Login Here

                                </Link>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );

}

export default Register;