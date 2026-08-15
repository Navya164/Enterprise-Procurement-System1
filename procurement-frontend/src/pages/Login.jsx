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
        } catch (err) {
            alert("Invalid Email or Password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>
                {`
                    * {
                        box-sizing: border-box;
                    }

                    .login-page {
                        min-height: 100vh;
                        background: linear-gradient(
                            135deg,
                            #0b1930 0%,
                            #14336b 45%,
                            #2354c9 100%
                        );
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        padding: 48px 20px;
                    }

                    .page-container {
                        width: 100%;
                        max-width: 1120px;
                        display: flex;
                        align-items: center;
                        gap: 64px;
                    }

                    /* ===== Entrance animation ===== */

                    @keyframes fadeSlideIn {
                        from {
                            opacity: 0;
                            transform: translateY(14px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }

                    /* ===== Brand column (left, on gradient) ===== */

                    .brand-column {
                        flex: 0 0 52%;
                        max-width: 52%;
                        color: #ffffff;
                        animation: fadeSlideIn 0.7s ease-out both;
                    }

                    .brand-top {
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        margin-bottom: 30px;
                    }

                    .brand-mark {
                        width: 38px;
                        height: 38px;
                        border-radius: 9px;
                        background: rgba(255, 255, 255, 0.10);
                        border: 1px solid rgba(255, 255, 255, 0.22);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 13px;
                        font-weight: 700;
                        letter-spacing: 0.5px;
                        color: #bfdbfe;
                        flex-shrink: 0;
                    }

                    .brand-eyebrow {
                        font-size: 12px;
                        font-weight: 600;
                        letter-spacing: 1.6px;
                        text-transform: uppercase;
                        color: #9dc0f7;
                    }

                    .brand-title {
                        font-size: 38px;
                        line-height: 1.32;
                        font-weight: 700;
                        letter-spacing: -0.2px;
                        max-width: 520px;
                        margin-bottom: 18px;
                        text-wrap: balance;
                    }

                    .brand-subtitle {
                        font-size: 16px;
                        line-height: 1.65;
                        color: rgba(255, 255, 255, 0.78);
                        max-width: 460px;
                        margin-bottom: 38px;
                    }

                    /* ===== Workflow strip (signature element) ===== */

                    .workflow {
                        margin-bottom: 30px;
                        padding-top: 26px;
                        border-top: 1px solid rgba(255, 255, 255, 0.20);
                    }

                    .workflow-label {
                        display: block;
                        font-size: 11.5px;
                        font-weight: 600;
                        letter-spacing: 1.3px;
                        text-transform: uppercase;
                        color: rgba(255, 255, 255, 0.55);
                        margin-bottom: 18px;
                    }

                    .workflow-steps {
                        display: flex;
                        align-items: flex-start;
                    }

                    .workflow-step {
                        display: flex;
                        flex-direction: column;
                        gap: 6px;
                        min-width: 0;
                    }

                    .step-index {
                        font-size: 11px;
                        font-weight: 700;
                        color: #93c5fd;
                        letter-spacing: 0.5px;
                    }

                    .step-name {
                        font-size: 14px;
                        font-weight: 600;
                        color: #ffffff;
                        white-space: nowrap;
                    }

                    .workflow-connector {
                        position: relative;
                        flex: 1 1 auto;
                        height: 1px;
                        background: rgba(255, 255, 255, 0.24);
                        margin: 8px 10px 0;
                        min-width: 12px;
                        overflow: hidden;
                    }

                    .workflow-connector::after {
                        content: "";
                        position: absolute;
                        top: 0;
                        left: 0;
                        height: 100%;
                        width: 36%;
                        background: linear-gradient(
                            90deg,
                            rgba(147, 197, 253, 0) 0%,
                            rgba(147, 197, 253, 0.9) 50%,
                            rgba(147, 197, 253, 0) 100%
                        );
                        animation: workflowFlow 3.6s ease-in-out infinite;
                    }

                    .workflow-steps .workflow-connector:nth-child(2)::after {
                        animation-delay: 0s;
                    }

                    .workflow-steps .workflow-connector:nth-child(4)::after {
                        animation-delay: 0.9s;
                    }

                    .workflow-steps .workflow-connector:nth-child(6)::after {
                        animation-delay: 1.8s;
                    }

                    @keyframes workflowFlow {
                        0% {
                            transform: translateX(-120%);
                            opacity: 0;
                        }
                        12% {
                            opacity: 1;
                        }
                        45% {
                            opacity: 1;
                        }
                        60% {
                            transform: translateX(220%);
                            opacity: 0;
                        }
                        100% {
                            transform: translateX(220%);
                            opacity: 0;
                        }
                    }

                    /* ===== Role note ===== */

                    .role-note {
                        padding-top: 24px;
                        border-top: 1px solid rgba(255, 255, 255, 0.20);
                    }

                    .role-note-title {
                        font-size: 14px;
                        font-weight: 600;
                        color: #ffffff;
                        margin-bottom: 5px;
                    }

                    .role-note-text {
                        font-size: 13px;
                        line-height: 1.6;
                        color: rgba(255, 255, 255, 0.68);
                        margin: 0;
                        max-width: 440px;
                    }

                    /* ===== Auth card (right, elevated on gradient) ===== */

                    .auth-card {
                        flex: 0 0 42%;
                        max-width: 42%;
                        background: #ffffff;
                        border-radius: 16px;
                        box-shadow: 0 30px 70px rgba(4, 12, 34, 0.35);
                        padding: 40px 38px 34px;
                        animation: fadeSlideIn 0.7s ease-out 0.15s both;
                    }

                    .login-label {
                        display: inline-block;
                        font-size: 11.5px;
                        font-weight: 700;
                        letter-spacing: 1.2px;
                        text-transform: uppercase;
                        color: #2354c9;
                        margin-bottom: 10px;
                    }

                    .login-title {
                        color: #101828;
                        font-size: 26px;
                        font-weight: 700;
                        margin-bottom: 8px;
                    }

                    .login-description {
                        color: #667085;
                        font-size: 13.5px;
                        line-height: 1.6;
                        margin-bottom: 26px;
                    }

                    .form-label {
                        color: #374151;
                        font-size: 13.5px;
                        font-weight: 600;
                        margin-bottom: 7px;
                    }

                    .form-control {
                        height: 46px;
                        border: 1px solid #d1d5db;
                        border-radius: 8px;
                        font-size: 14px;
                        padding: 10px 13px;
                        transition: border-color 0.15s ease, box-shadow 0.15s ease;
                    }

                    .form-control:focus {
                        border-color: #2354c9;
                        box-shadow: 0 0 0 3px rgba(35, 84, 201, 0.14);
                        outline: none;
                    }

                    .password-wrapper {
                        position: relative;
                    }

                    .password-wrapper .form-control {
                        padding-right: 74px;
                    }

                    .password-toggle {
                        position: absolute;
                        right: 8px;
                        top: 50%;
                        transform: translateY(-50%);
                        border: none;
                        background: transparent;
                        color: #2354c9;
                        font-size: 12px;
                        font-weight: 600;
                        cursor: pointer;
                        padding: 6px 8px;
                        border-radius: 6px;
                    }

                    .password-toggle:hover {
                        color: #14336b;
                        background: #eef3fd;
                    }

                    .password-toggle:focus-visible,
                    .form-control:focus-visible,
                    .login-button:focus-visible,
                    .register-link:focus-visible {
                        outline: 2px solid #2354c9;
                        outline-offset: 2px;
                    }

                    .login-button {
                        width: 100%;
                        height: 46px;
                        border: none;
                        border-radius: 8px;
                        background: #1d4ed8;
                        color: #ffffff;
                        font-size: 14.5px;
                        font-weight: 600;
                        transition: background 0.15s ease, box-shadow 0.15s ease;
                    }

                    .login-button:hover:not(:disabled) {
                        background: #1e40af;
                        box-shadow: 0 6px 16px rgba(29, 78, 216, 0.28);
                    }

                    .login-button:disabled {
                        opacity: 0.7;
                        cursor: not-allowed;
                    }

                    .support-text {
                        text-align: center;
                        color: #667085;
                        font-size: 12.5px;
                        line-height: 1.6;
                        margin-top: 18px;
                    }

                    .register-section {
                        border-top: 1px solid #e5e7eb;
                        margin-top: 24px;
                        padding-top: 20px;
                        text-align: center;
                    }

                    .register-text {
                        color: #667085;
                        font-size: 12.5px;
                        margin-bottom: 10px;
                    }

                    .register-link {
                        display: inline-block;
                        color: #2354c9;
                        font-size: 13.5px;
                        font-weight: 600;
                        text-decoration: none;
                        border: 1px solid #bfdbfe;
                        border-radius: 7px;
                        padding: 8px 18px;
                        transition: all 0.15s ease;
                    }

                    .register-link:hover {
                        background: #eef3fd;
                        border-color: #2354c9;
                        color: #14336b;
                    }

                    .security-note {
                        margin-top: 20px;
                        padding: 12px 14px;
                        background: #f8fafc;
                        border: 1px solid #e5e7eb;
                        border-radius: 8px;
                    }

                    .security-title {
                        color: #374151;
                        font-size: 12.5px;
                        font-weight: 600;
                        margin-bottom: 3px;
                    }

                    .security-text {
                        color: #667085;
                        font-size: 11.5px;
                        line-height: 1.5;
                        margin: 0;
                    }

                    .footer-text {
                        text-align: center;
                        color: rgba(255, 255, 255, 0.55);
                        font-size: 11px;
                        line-height: 1.6;
                        margin-top: 26px;
                    }

                    /* ===== Responsive ===== */

                    @media (max-width: 991px) {
                        .page-container {
                            flex-direction: column;
                            gap: 36px;
                        }

                        .brand-column,
                        .auth-card {
                            flex: 1 1 auto;
                            max-width: 560px;
                            width: 100%;
                        }

                        .brand-column {
                            text-align: center;
                        }

                        .brand-top {
                            justify-content: center;
                        }

                        .brand-title,
                        .brand-subtitle,
                        .role-note-text {
                            max-width: none;
                            margin-left: auto;
                            margin-right: auto;
                        }

                        .workflow-label {
                            text-align: left;
                        }
                    }

                    @media (max-width: 575px) {
                        .login-page {
                            padding: 28px 16px;
                        }

                        .brand-title {
                            font-size: 28px;
                        }

                        .auth-card {
                            padding: 30px 24px 26px;
                        }

                        .login-title {
                            font-size: 23px;
                        }

                        .workflow-steps {
                            flex-wrap: wrap;
                            row-gap: 14px;
                        }

                        .workflow-connector {
                            display: none;
                        }

                        .workflow-step {
                            flex: 0 0 46%;
                        }
                    }

                    /* ===== Reduced motion ===== */

                    @media (prefers-reduced-motion: reduce) {
                        .brand-column,
                        .auth-card {
                            animation: none;
                            opacity: 1;
                            transform: none;
                        }

                        .workflow-connector::after {
                            animation: none;
                            opacity: 0;
                        }
                    }
                `}
            </style>

            <div className="login-page">
                <div className="page-container">

                    {/* Project Identity */}
                    <div className="brand-column">

                        <div className="brand-top">
                            <div className="brand-mark">SP</div>
                            <span className="brand-eyebrow">
                                Smart Procurement Platform
                            </span>
                        </div>

                        <h1 className="brand-title">
                            Smart Procurement &amp; Purchase Order
                            Management System
                        </h1>

                        <p className="brand-subtitle">
                            Centralized procurement management for
                            purchase requests, approvals, purchase
                            orders, suppliers, and deliveries.
                        </p>

                        <div className="workflow">
                            <span className="workflow-label">
                                Procurement Workflow
                            </span>

                            <div className="workflow-steps">
                                <div className="workflow-step">
                                    <span className="step-index">01</span>
                                    <span className="step-name">Request</span>
                                </div>

                                <div className="workflow-connector"></div>

                                <div className="workflow-step">
                                    <span className="step-index">02</span>
                                    <span className="step-name">Approval</span>
                                </div>

                                <div className="workflow-connector"></div>

                                <div className="workflow-step">
                                    <span className="step-index">03</span>
                                    <span className="step-name">Purchase Order</span>
                                </div>

                                <div className="workflow-connector"></div>

                                <div className="workflow-step">
                                    <span className="step-index">04</span>
                                    <span className="step-name">Delivery</span>
                                </div>
                            </div>
                        </div>

                        <div className="role-note">
                            <div className="role-note-title">
                                Role-Based Access
                            </div>
                            <p className="role-note-text">
                                Each user sees only the modules
                                relevant to their role — Employee,
                                Manager, Procurement Officer, Admin,
                                or Vendor.
                            </p>
                        </div>

                    </div>

                    {/* Login Form */}
                    <div className="auth-card">

                        <span className="login-label">
                            Secure Access
                        </span>

                        <h2 className="login-title">
                            Sign in
                        </h2>

                        <p className="login-description">
                            Enter your credentials to access the
                            procurement management system.
                        </p>

                        <form onSubmit={handleSubmit}>

                            {/* Email */}
                            <div className="mb-4">

                                <label
                                    htmlFor="email"
                                    className="form-label"
                                >
                                    Email Address
                                </label>

                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    className="form-control"
                                    placeholder="Enter your email address"
                                    value={login.email}
                                    onChange={handleChange}
                                    required
                                    autoComplete="email"
                                />

                            </div>

                            {/* Password */}
                            <div className="mb-4">

                                <label
                                    htmlFor="password"
                                    className="form-label"
                                >
                                    Password
                                </label>

                                <div className="password-wrapper">

                                    <input
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        id="password"
                                        name="password"
                                        className="form-control"
                                        placeholder="Enter your password"
                                        value={login.password}
                                        onChange={handleChange}
                                        required
                                        autoComplete="current-password"
                                    />

                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() =>
                                            setShowPassword(
                                                !showPassword
                                            )
                                        }
                                    >
                                        {showPassword
                                            ? "Hide"
                                            : "Show"}
                                    </button>

                                </div>

                            </div>

                            {/* Login Button */}
                            <div>

                                <button
                                    type="submit"
                                    className="login-button"
                                    disabled={loading}
                                >

                                    {loading ? (
                                        <>
                                            <span
                                                className="spinner-border spinner-border-sm me-2"
                                                role="status"
                                                aria-hidden="true"
                                            ></span>

                                            Signing in...
                                        </>
                                    ) : (
                                        "Sign in to Dashboard"
                                    )}

                                </button>

                            </div>

                            {/* Support */}
                            <div className="support-text">

                                Need help accessing your account?

                                <br />

                                Contact your system administrator.

                            </div>

                            {/* Register */}
                            <div className="register-section">

                                <p className="register-text">
                                    New to the procurement system?
                                </p>

                                <Link
                                    to="/register"
                                    className="register-link"
                                >
                                    Create an Account
                                </Link>

                            </div>

                            {/* Security */}
                            <div className="security-note">

                                <div className="security-title">
                                    Secure Role-Based Authentication
                                </div>

                                <p className="security-text">
                                    Your credentials are processed
                                    securely, and access to system
                                    modules is determined by your
                                    assigned role.
                                </p>

                            </div>

                        </form>

                    </div>

                </div>

                <div className="footer-text">

                    © {new Date().getFullYear()} Smart Procurement
                    &amp; Purchase Order Management System

                    <br />

                    React · Spring Boot · MySQL

                </div>

            </div>
        </>
    );
}

export default Login;