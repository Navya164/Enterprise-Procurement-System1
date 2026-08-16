import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    LineChart,
    Line,
    AreaChart,
    Area,
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    RadialBarChart,
    RadialBar
} from "recharts";

function AdminDashboard() {

    const navigate = useNavigate();

   const [stats, setStats] = useState({
    totalUsers: 0,
    totalRequests: 0,
    pendingManager: 0,
    pendingProcurement: 0,
    procurementInProgress: 0,
    completed: 0,
    rejected: 0,
    totalPOs: 0,
    poPending: 0,
    poInProgress: 0,
    poCompleted: 0,
    poRejected: 0,
    totalVendors: 0
});

    useEffect(() => {
        loadDashboard();
        const interval = setInterval(loadDashboard, 10000); // live update every 10s
        return () => clearInterval(interval);
    }, []);

    const loadDashboard = async () => {

        try {

            const response = await axios.get(
                "http://localhost:8080/api/admin/dashboard"
            );

            setStats(response.data);

        }
        catch (error) {

            console.log(error);

            alert("Unable to load dashboard");

        }

    };

    const orderStatusData = [

        {
            name: "Pending Manager",
            value: stats.pendingManager
        },

        {
            name: "Pending Procurement",
            value: stats.pendingProcurement
        },

        {
            name: "In Progress",
            value: stats.procurementInProgress
        },

        {
            name: "Completed",
            value: stats.completed
        },

        {
            name: "Rejected",
            value: stats.rejected
        }

    ];

    const monthlyData = [

        { month: "Jan", value: 18 },
        { month: "Feb", value: 26 },
        { month: "Mar", value: 33 },
        { month: "Apr", value: 27 },
        { month: "May", value: 39 },
        { month: "Jun", value: stats.totalRequests }

    ];

    const radarData = [

        {
            subject: "Completed",
            A: stats.completed,
            fullMark: stats.totalRequests
        },

        {
            subject: "Rejected",
            A: stats.rejected,
            fullMark: stats.totalRequests
        },

        {
            subject: "Pending",
            A:
                stats.pendingManager +
                stats.pendingProcurement,
            fullMark: stats.totalRequests
        },

        {
            subject: "Progress",
            A: stats.procurementInProgress,
            fullMark: stats.totalRequests
        }

    ];

    const progressData = [

        {
            name: "Completion",

            value:
                stats.totalRequests === 0
                    ? 0
                    :
                    Math.round(
                        stats.completed
                        * 100
                        / stats.totalRequests
                    )
        }

    ];

    const COLORS = [

        "#ff9800",
        "#00BCD4",
        "#6c757d",
        "#4CAF50",
        "#F44336"

    ];

    const cardStyle = {

        borderRadius: "15px",

        padding: "20px",

        marginBottom: "20px",

        textAlign: "center",

        color: "white",

        boxShadow: "0 8px 25px rgba(0,0,0,.2)"

    };
        return (

        <div
            className="container-fluid py-4"
            style={{
                background: "#f4f7fb",
                minHeight: "100vh"
            }}
        >

            <h2
                className="text-center fw-bold mb-5"
                style={{
                    color: "#0d6efd",
                    letterSpacing: "1px"
                }}
            >
                📊 Admin Analytics Dashboard
            </h2>

            {/* KPI CARDS */}

            <div className="row g-4 mb-5">

                <div className="col-lg-3 col-md-6">

                    <div
                        style={{
                            ...cardStyle,
                            background:
                                "linear-gradient(135deg,#0d6efd,#4dabff)"
                        }}
                    >

                        <h1>👥</h1>

                        <h3>{stats.totalUsers}</h3>

                        <p className="mb-0">
                            Total Users
                        </p>

                    </div>

                </div>

                <div className="col-lg-3 col-md-6">

                    <div
                        style={{
                            ...cardStyle,
                            background:
                                "linear-gradient(135deg,#20c997,#38d9a9)"
                        }}
                    >

                        <h1>📦</h1>

                        <h3>{stats.totalRequests}</h3>

                        <p className="mb-0">
                            Purchase Requests
                        </p>

                    </div>

                </div>

                <div className="col-lg-3 col-md-6">

                    <div
                        style={{
                            ...cardStyle,
                            background:
                                "linear-gradient(135deg,#fd7e14,#ffc107)"
                        }}
                    >

                        <h1>⏳</h1>

                        <h3>

                            {stats.pendingManager +
                                stats.pendingProcurement}

                        </h3>

                        <p className="mb-0">

                            Pending Approvals

                        </p>

                    </div>

                </div>

                <div className="col-lg-3 col-md-6">

                    <div
                        style={{
                            ...cardStyle,
                            background:
                                "linear-gradient(135deg,#198754,#51cf66)"
                        }}
                    >

                        <h1>✅</h1>

                        <h3>{stats.completed}</h3>

                        <p className="mb-0">

                            Completed Orders

                        </p>

                    </div>

                </div>

            </div>

            {/* PROCUREMENT ORDER SUMMARY - TASK 1 */}

            <h3 className="text-center mb-4">
                🧾 Procurement Order Tracking
            </h3>

            <div className="row g-4 mb-5">

                <div className="col-lg-2 col-md-4 col-6">
                    <div style={{ ...cardStyle, background: "linear-gradient(135deg,#0d6efd,#4dabff)" }}>
                        <h1>📦</h1>
                        <h3>{stats.totalPOs}</h3>
                        <p className="mb-0">Total POs</p>
                    </div>
                </div>

                <div className="col-lg-2 col-md-4 col-6">
                    <div style={{ ...cardStyle, background: "linear-gradient(135deg,#fd7e14,#ffc107)" }}>
                        <h1>⏳</h1>
                        <h3>{stats.poPending}</h3>
                        <p className="mb-0">Pending</p>
                    </div>
                </div>

                <div className="col-lg-2 col-md-4 col-6">
                    <div style={{ ...cardStyle, background: "linear-gradient(135deg,#6610f2,#a370f7)" }}>
                        <h1>🚚</h1>
                        <h3>{stats.poInProgress}</h3>
                        <p className="mb-0">In Progress</p>
                    </div>
                </div>

                <div className="col-lg-2 col-md-4 col-6">
                    <div style={{ ...cardStyle, background: "linear-gradient(135deg,#198754,#51cf66)" }}>
                        <h1>✅</h1>
                        <h3>{stats.poCompleted}</h3>
                        <p className="mb-0">Completed</p>
                    </div>
                </div>

                <div className="col-lg-2 col-md-4 col-6">
                    <div style={{ ...cardStyle, background: "linear-gradient(135deg,#dc3545,#ff6b6b)" }}>
                        <h1>❌</h1>
                        <h3>{stats.poRejected}</h3>
                        <p className="mb-0">Rejected</p>
                    </div>
                </div>

                <div className="col-lg-2 col-md-4 col-6">
                    <div style={{ ...cardStyle, background: "linear-gradient(135deg,#0891b2,#22d3ee)" }}>
                        <h1>🏭</h1>
                        <h3>{stats.totalVendors}</h3>
                        <p className="mb-0">Total Vendors</p>
                    </div>
                </div>

            </div>

            {/* MASTER DATA */}

            <div className="card shadow-lg border-0 mb-5">

                <div className="card-header bg-dark text-white">

                    <h4>

                        ⚙ Procurement Master Data

                    </h4>

                </div>

                <div className="list-group list-group-flush">

                    <button
                        className="list-group-item list-group-item-action d-flex justify-content-between"
                        onClick={() => navigate("/admin/vendors")}
                    >

                        <span>🏭 Vendor Management</span>

                        <span>➜</span>

                    </button>

                    <button
                        className="list-group-item list-group-item-action d-flex justify-content-between"
                        onClick={() => navigate("/admin/categories")}
                    >

                        <span>📦 Procurement Categories</span>

                        <span>➜</span>

                    </button>

                    <button
                        className="list-group-item list-group-item-action d-flex justify-content-between"
                        onClick={() => navigate("/admin/departments")}
                    >

                        <span>🏢 Department Management</span>

                        <span>➜</span>

                    </button>

                    <button
                        className="list-group-item list-group-item-action d-flex justify-content-between"
                        onClick={() => navigate("/admin/approval-hierarchy")}
                    >

                        <span>👥 Approval Hierarchy</span>

                        <span>➜</span>

                    </button>

                </div>

            </div>

            <h3 className="text-center mb-4">

                📈 Procurement Analytics

            </h3>

            <div className="row">

                <div className="col-lg-6 mb-4">

                    <div className="card shadow border-0">

                        <div className="card-body">

                            <h5 className="text-center">

                                Purchase Status Distribution

                            </h5>

                            <ResponsiveContainer
                                width="100%"
                                height={320}
                            >

                                <PieChart>

                                    <Pie
                                        data={orderStatusData}
                                        dataKey="value"
                                        nameKey="name"
                                        outerRadius={110}
                                        label
                                    >

                                        {

                                            orderStatusData.map(
                                                (entry, index) => (

                                                    <Cell
                                                        key={index}
                                                        fill={
                                                            COLORS[
                                                            index %
                                                            COLORS.length
                                                            ]
                                                        }
                                                    />

                                                )
                                            )

                                        }

                                    </Pie>

                                    <Tooltip />

                                    <Legend />

                                </PieChart>

                            </ResponsiveContainer>

                        </div>

                    </div>

                </div>
                                <div className="col-lg-6 mb-4">

                    <div className="card shadow border-0">

                        <div className="card-body">

                            <h5 className="text-center">

                                Procurement Progress

                            </h5>

                            <ResponsiveContainer
                                width="100%"
                                height={320}
                            >

                                <BarChart
                                    data={orderStatusData}
                                >

                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                    />

                                    <XAxis dataKey="name" />

                                    <YAxis />

                                    <Tooltip />

                                    <Legend />

                                    <Bar
                                        dataKey="value"
                                        fill="#0d6efd"
                                        radius={[8,8,0,0]}
                                    />

                                </BarChart>

                            </ResponsiveContainer>

                        </div>

                    </div>

                </div>

            </div>

            {/* SECOND ROW */}

            <div className="row">

                <div className="col-lg-6 mb-4">

                    <div className="card shadow border-0">

                        <div className="card-body">

                            <h5 className="text-center">

                                Monthly Purchase Requests

                            </h5>

                            <ResponsiveContainer
                                width="100%"
                                height={300}
                            >

                                <LineChart
                                    data={monthlyData}
                                >

                                    <CartesianGrid strokeDasharray="3 3"/>

                                    <XAxis dataKey="month"/>

                                    <YAxis/>

                                    <Tooltip/>

                                    <Legend/>

                                    <Line
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#28a745"
                                        strokeWidth={4}
                                    />

                                </LineChart>

                            </ResponsiveContainer>

                        </div>

                    </div>

                </div>

                <div className="col-lg-6 mb-4">

                    <div className="card shadow border-0">

                        <div className="card-body">

                            <h5 className="text-center">

                                Procurement Trend

                            </h5>

                            <ResponsiveContainer
                                width="100%"
                                height={300}
                            >

                                <AreaChart
                                    data={monthlyData}
                                >

                                    <CartesianGrid strokeDasharray="3 3"/>

                                    <XAxis dataKey="month"/>

                                    <YAxis/>

                                    <Tooltip/>

                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#17a2b8"
                                        fill="#17a2b8"
                                    />

                                </AreaChart>

                            </ResponsiveContainer>

                        </div>

                    </div>

                </div>

            </div>

            {/* THIRD ROW */}

            <div className="row">

                <div className="col-lg-6 mb-4">

                    <div className="card shadow border-0">

                        <div className="card-body">

                            <h5 className="text-center">

                                Procurement Performance Radar

                            </h5>

                            <ResponsiveContainer
                                width="100%"
                                height={320}
                            >

                                <RadarChart
                                    data={radarData}
                                >

                                    <PolarGrid/>

                                    <PolarAngleAxis
                                        dataKey="subject"
                                    />

                                    <PolarRadiusAxis/>

                                    <Radar
                                        dataKey="A"
                                        fill="#6610f2"
                                        stroke="#6610f2"
                                        fillOpacity={0.6}
                                    />

                                    <Legend/>

                                </RadarChart>

                            </ResponsiveContainer>

                        </div>

                    </div>

                </div>

                <div className="col-lg-6 mb-4">

                    <div className="card shadow border-0">

                        <div className="card-body">

                            <h5 className="text-center">

                                Completion Percentage

                            </h5>

                            <ResponsiveContainer
                                width="100%"
                                height={320}
                            >

                                <RadialBarChart
                                    innerRadius="60%"
                                    outerRadius="100%"
                                    data={progressData}
                                    startAngle={180}
                                    endAngle={0}
                                >

                                    <RadialBar
                                        dataKey="value"
                                        fill="#198754"
                                    />

                                    <Legend/>

                                    <Tooltip/>

                                </RadialBarChart>

                            </ResponsiveContainer>

                            <h2 className="text-center text-success mt-3">

                                {progressData[0].value}%

                            </h2>

                        </div>

                    </div>

                </div>

            </div>
                        {/* RECENT ACTIVITY & INSIGHTS */}

            <div className="row">

                <div className="col-lg-6 mb-4">

                    <div className="card shadow border-0">

                        <div className="card-header bg-primary text-white">

                            <h5 className="mb-0">
                                📋 Recent Procurement Activity
                            </h5>

                        </div>

                        <div className="card-body">

                            <ul className="list-group list-group-flush">

                                <li className="list-group-item">
                                    ✅ Purchase Requests Completed :
                                    <span className="float-end fw-bold text-success">
                                        {stats.completed}
                                    </span>
                                </li>

                                <li className="list-group-item">
                                    ⏳ Pending Manager Approvals :
                                    <span className="float-end fw-bold text-warning">
                                        {stats.pendingManager}
                                    </span>
                                </li>

                                <li className="list-group-item">
                                    🏭 Pending Procurement :
                                    <span className="float-end fw-bold text-info">
                                        {stats.pendingProcurement}
                                    </span>
                                </li>

                                <li className="list-group-item">
                                    🚚 Orders In Progress :
                                    <span className="float-end fw-bold text-secondary">
                                        {stats.procurementInProgress}
                                    </span>
                                </li>

                                <li className="list-group-item">
                                    ❌ Rejected Requests :
                                    <span className="float-end fw-bold text-danger">
                                        {stats.rejected}
                                    </span>
                                </li>

                            </ul>

                        </div>

                    </div>

                </div>

                <div className="col-lg-6 mb-4">

                    <div className="card shadow border-0">

                        <div className="card-header bg-success text-white">

                            <h5 className="mb-0">
                                💡 Procurement Insights
                            </h5>

                        </div>

                        <div className="card-body">

                            <div className="alert alert-success">

                                <strong>Completion Rate</strong>

                                <br />

                                {progressData[0].value}% of purchase requests have
                                been successfully completed.

                            </div>

                            <div className="alert alert-warning">

                                <strong>Pending Actions</strong>

                                <br />

                                {
                                    stats.pendingManager +
                                    stats.pendingProcurement
                                }{" "}
                                requests require approval.

                            </div>

                            <div className="alert alert-info">

                                <strong>Operational Efficiency</strong>

                                <br />

                                Procurement workflow is currently handling{" "}
                                {stats.procurementInProgress} active orders.

                            </div>

                        </div>

                    </div>

                </div>

            </div>

            {/* EXECUTIVE SUMMARY */}

            <div className="card shadow-lg border-0 mb-5">

                <div className="card-header bg-dark text-white">

                    <h4 className="mb-0">
                        📊 Executive Summary
                    </h4>

                </div>

                <div className="card-body">

                    <div className="row text-center">

                        <div className="col-md-3">

                            <h2 className="text-primary">
                                {stats.totalUsers}
                            </h2>

                            <p>Total System Users</p>

                        </div>

                        <div className="col-md-3">

                            <h2 className="text-success">
                                {stats.totalRequests}
                            </h2>

                            <p>Purchase Requests</p>

                        </div>

                        <div className="col-md-3">

                            <h2 className="text-warning">

                                {
                                    stats.pendingManager +
                                    stats.pendingProcurement
                                }

                            </h2>

                            <p>Pending Approvals</p>

                        </div>

                        <div className="col-md-3">

                            <h2 className="text-danger">

                                {stats.rejected}

                            </h2>

                            <p>Rejected Requests</p>

                        </div>

                    </div>

                </div>

            </div>

            {/* FOOTER */}

            <div
                className="text-center text-muted mb-4"
                style={{
                    fontSize: "15px"
                }}
            >

                Procurement Management System • Admin Analytics Dashboard

            </div>

        </div>

    );

}

export default AdminDashboard;