import { useEffect, useState } from "react";
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
    CartesianGrid
} from "recharts";

function AdminDashboard() {

    const [stats, setStats] = useState({
        totalUsers: 0,
        totalRequests: 0,
        pendingManager: 0,
        pendingProcurement: 0,
        procurementInProgress: 0,
        completed: 0,
        rejected: 0
    });

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {

        try {

            const response = await axios.get(
                "http://localhost:8080/api/admin/dashboard"
            );

            console.log("Dashboard Response:", response.data);

            setStats(response.data);

        } catch (error) {

            console.log(error);
            alert("Unable to load dashboard");

        }

    };

    const orderStatusData = [
        { name: "Pending Manager", value: stats.pendingManager },
        { name: "Pending Procurement", value: stats.pendingProcurement },
        { name: "In Progress", value: stats.procurementInProgress },
        { name: "Completed", value: stats.completed },
        { name: "Rejected", value: stats.rejected }
    ];

    const COLORS = [
        "#FFC107",
        "#17A2B8",
        "#6C757D",
        "#28A745",
        "#DC3545"
    ];

    const cardStyle = {
        borderRadius: "10px",
        padding: "20px",
        marginBottom: "20px",
        textAlign: "center",
        boxShadow: "0px 2px 8px rgba(0,0,0,0.15)"
    };

    return (

        <div className="container mt-4">

            <h2 className="text-center mb-5">
                Admin Dashboard
            </h2>

            <div className="row">

                <div className="col-md-4">
                    <div className="bg-primary text-white" style={cardStyle}>
                        <h5>Total Users</h5>
                        <h2>{stats.totalUsers}</h2>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="bg-success text-white" style={cardStyle}>
                        <h5>Total Requests</h5>
                        <h2>{stats.totalRequests}</h2>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="bg-warning" style={cardStyle}>
                        <h5>Pending Manager</h5>
                        <h2>{stats.pendingManager}</h2>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="bg-info text-white" style={cardStyle}>
                        <h5>Pending Procurement</h5>
                        <h2>{stats.pendingProcurement}</h2>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="bg-secondary text-white" style={cardStyle}>
                        <h5>In Progress</h5>
                        <h2>{stats.procurementInProgress}</h2>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="bg-success text-white" style={cardStyle}>
                        <h5>Completed</h5>
                        <h2>{stats.completed}</h2>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="bg-danger text-white" style={cardStyle}>
                        <h5>Rejected</h5>
                        <h2>{stats.rejected}</h2>
                    </div>
                </div>

            </div>

            <hr className="my-5" />

            <h3 className="text-center mb-4">
                Procurement Analytics
            </h3>

            <div className="row">

                <div className="col-md-6">

                    <div
                        className="p-3"
                        style={{
                            borderRadius: "10px",
                            boxShadow: "0px 2px 8px rgba(0,0,0,0.15)"
                        }}
                    >

                        <h5 className="text-center mb-3">
                            Order Status Distribution
                        </h5>

                        <ResponsiveContainer width="100%" height={300}>

                            <PieChart>

                                <Pie
                                    data={orderStatusData}
                                    dataKey="value"
                                    nameKey="name"
                                    outerRadius={100}
                                    label
                                >

                                    {
                                        orderStatusData.map((entry, index) => (
                                            <Cell
                                                key={index}
                                                fill={COLORS[index % COLORS.length]}
                                            />
                                        ))
                                    }

                                </Pie>

                                <Tooltip />

                                <Legend />

                            </PieChart>

                        </ResponsiveContainer>

                    </div>

                </div>

                <div className="col-md-6">

                    <div
                        className="p-3"
                        style={{
                            borderRadius: "10px",
                            boxShadow: "0px 2px 8px rgba(0,0,0,0.15)"
                        }}
                    >

                        <h5 className="text-center mb-3">
                            Procurement Progress
                        </h5>

                        <ResponsiveContainer width="100%" height={300}>

                            <BarChart data={orderStatusData}>

                                <CartesianGrid strokeDasharray="3 3" />

                                <XAxis dataKey="name" />

                                <YAxis />

                                <Tooltip />

                                <Legend />

                                <Bar
                                    dataKey="value"
                                    fill="#0d6efd"
                                />

                            </BarChart>

                        </ResponsiveContainer>

                    </div>

                </div>

            </div>

        </div>

    );

}

export default AdminDashboard;