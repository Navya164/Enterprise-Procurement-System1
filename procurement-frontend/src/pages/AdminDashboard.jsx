import { useEffect, useState } from "react";
import axios from "axios";

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

        console.log("Dashboard Response:", response);
        console.log("Dashboard Data:", response.data);

        setStats(response.data);

    } catch (error) {

        console.log("ERROR:", error);

        if (error.response) {
            console.log("Status:", error.response.status);
            console.log("Data:", error.response.data);
        }

        alert("Unable to load dashboard");

    }

};
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

        </div>

    );

}

export default AdminDashboard;