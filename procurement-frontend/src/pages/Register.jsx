import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Register() {

    const navigate = useNavigate();

    const [user, setUser] = useState({
        name: "",
        email: "",
        password: "",
        role: ""
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {

        setUser({
            ...user,
            [e.target.name]: e.target.value
        });

        setErrors({
            ...errors,
            [e.target.name]: ""
        });

    };

    const validateForm = () => {

        let validationErrors = {};

        // Name Validation
        if (!user.name.trim()) {
            validationErrors.name = "Full Name is required";
        }

        // Email Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!user.email.trim()) {
            validationErrors.email = "Email is required";
        } else if (!emailRegex.test(user.email)) {
            validationErrors.email = "Please enter a valid email address";
        }

        // Password Validation
        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#()_+=-])[A-Za-z\d@$!%*?&^#()_+=-]{8,}$/;

        if (!user.password) {
            validationErrors.password = "Password is required";
        } else if (!passwordRegex.test(user.password)) {
            validationErrors.password =
                "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character.";
        }

        // Role Validation
        if (!user.role) {
            validationErrors.role = "Please select a role";
        }

        setErrors(validationErrors);

        return Object.keys(validationErrors).length === 0;
    };

    const register = async (e) => {

        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {

            await api.post("/auth/register", user);

            alert("Registration Successful");

            navigate("/");

        } catch (err) {

            if (err.response) {

                if (typeof err.response.data === "string") {

                    alert(err.response.data);

                } else {

                    setErrors(err.response.data);

                }

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

                                    <label className="form-label">Full Name</label>

                                    <input
                                        type="text"
                                        className="form-control"
                                        name="name"
                                        value={user.name}
                                        onChange={handleChange}
                                    />

                                    <small className="text-danger">
                                        {errors.name}
                                    </small>

                                </div>

                                <div className="mb-3">

                                    <label className="form-label">Email</label>

                                    <input
                                        type="email"
                                        className="form-control"
                                        name="email"
                                        value={user.email}
                                        onChange={handleChange}
                                    />

                                    <small className="text-danger">
                                        {errors.email}
                                    </small>

                                </div>

                                <div className="mb-3">

                                    <label className="form-label">Password</label>

                                    <input
                                        type="password"
                                        className="form-control"
                                        name="password"
                                        value={user.password}
                                        onChange={handleChange}
                                    />

                                    <small className="text-danger">
                                        {errors.password}
                                    </small>

                                </div>

                                <div className="mb-3">

                                    <label className="form-label">Role</label>

                                    <select
                                        className="form-control"
                                        name="role"
                                        value={user.role}
                                        onChange={handleChange}
                                    >

                                        <option value="">
                                            -- Select Role --
                                        </option>

                                        <option value="EMPLOYEE">
                                            Employee
                                        </option>

                                        <option value="MANAGER">
                                            Manager
                                        </option>

                                        <option value="SENIOR_MANAGER">
                                            Senior Manager
                                        </option>

                                        <option value="PROCUREMENT_OFFICER">
                                            Procurement Officer
                                        </option>

                                        <option value="ADMIN">
                                            Admin
                                        </option>

                                            <option value="VENDOR">
                                                    Vendor
                                                </option>


                                    </select>

                                    <small className="text-danger">
                                        {errors.role}
                                    </small>

                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-success w-100"
                                >
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