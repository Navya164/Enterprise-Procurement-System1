import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:8080/api/audit-logs";

function ActivityMonitoring() {

    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");


    // ============================================================
    // LOAD AUDIT ACTIVITIES
    // ============================================================

    useEffect(() => {

        loadActivities();

        const interval = setInterval(
            loadActivities,
            10000
        );

        return () => clearInterval(interval);

    }, []);


    const loadActivities = async () => {

        try {

            const response =
                await axios.get(API);

            setActivities(
                response.data || []
            );

        } catch (error) {

            console.error(
                "Unable to load audit activities:",
                error
            );

        } finally {

            setLoading(false);

        }
    };


    // ============================================================
    // SEARCH + STATUS FILTER
    // ============================================================

    const filteredActivities =
        activities.filter(activity => {

            const searchText =
                search.toLowerCase();

            const matchesSearch =
                !search ||
                String(activity.username || "")
                    .toLowerCase()
                    .includes(searchText) ||

                String(activity.action || "")
                    .toLowerCase()
                    .includes(searchText) ||

                String(activity.module || "")
                    .toLowerCase()
                    .includes(searchText) ||

                String(activity.apiEndpoint || "")
                    .toLowerCase()
                    .includes(searchText) ||

                String(activity.httpMethod || "")
                    .toLowerCase()
                    .includes(searchText);


            // IMPORTANT:
            // Backend field is "result", NOT "status"

            const matchesStatus =
                statusFilter === "ALL" ||
                activity.result === statusFilter;


            return (
                matchesSearch &&
                matchesStatus
            );

        });


    // ============================================================
    // DATE FORMAT
    // ============================================================

    const formatDate = (value) => {

        if (!value) {
            return "-";
        }

        try {

            return new Date(value)
                .toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit"
                });

        } catch (error) {

            return value;

        }
    };


    // ============================================================
    // SUCCESS / FAILED COUNTS
    // ============================================================

    const successfulActivities =
        activities.filter(
            activity =>
                activity.result === "SUCCESS"
        ).length;


    const failedActivities =
        activities.filter(
            activity =>
                activity.result === "FAILED"
        ).length;


    // ============================================================
    // UI
    // ============================================================

    return (

        <div
            className="container-fluid py-4"
            style={{
                minHeight: "100vh",
                background:
                    "linear-gradient(to right,#eef6ff,#ffffff)"
            }}
        >

            {/* =====================================================
                HEADER
            ====================================================== */}

            <div
                className="mb-4"
                style={{
                    background:
                        "linear-gradient(135deg,#0d6efd,#4dabf7)",
                    color: "white",
                    padding: "28px",
                    borderRadius: "18px"
                }}
            >

                <h1 className="fw-bold">
                    🔐 Activity Monitoring
                </h1>

                <p className="mb-0">
                    Monitor user activities and system operations
                </p>

            </div>


            {/* =====================================================
                SUMMARY CARDS
            ====================================================== */}

            <div className="row g-3 mb-4">


                {/* TOTAL */}

                <div className="col-md-4">

                    <div className="card shadow-sm border-0 h-100">

                        <div className="card-body">

                            <small className="text-muted">
                                TOTAL ACTIVITIES
                            </small>

                            <h2 className="fw-bold text-primary">

                                {
                                    activities.length
                                }

                            </h2>

                        </div>

                    </div>

                </div>


                {/* SUCCESS */}

                <div className="col-md-4">

                    <div className="card shadow-sm border-0 h-100">

                        <div className="card-body">

                            <small className="text-muted">
                                SUCCESSFUL ACTIVITIES
                            </small>

                            <h2 className="fw-bold text-success">

                                {
                                    successfulActivities
                                }

                            </h2>

                        </div>

                    </div>

                </div>


                {/* FAILED */}

                <div className="col-md-4">

                    <div className="card shadow-sm border-0 h-100">

                        <div className="card-body">

                            <small className="text-muted">
                                FAILED ACTIVITIES
                            </small>

                            <h2 className="fw-bold text-danger">

                                {
                                    failedActivities
                                }

                            </h2>

                        </div>

                    </div>

                </div>

            </div>


            {/* =====================================================
                SEARCH + FILTER
            ====================================================== */}

            <div className="card shadow-sm border-0 mb-4">

                <div className="card-body">

                    <div className="row g-3">


                        {/* SEARCH */}

                        <div className="col-md-8">

                            <label className="fw-bold mb-2">
                                Search Activity
                            </label>

                            <input
                                type="text"
                                className="form-control"
                                style={{
                                    fontSize: "16px"
                                }}
                                placeholder="Search user, action, module or API..."
                                value={search}
                                onChange={
                                    e =>
                                        setSearch(
                                            e.target.value
                                        )
                                }
                            />

                        </div>


                        {/* RESULT FILTER */}

                        <div className="col-md-4">

                            <label className="fw-bold mb-2">
                                Result
                            </label>

                            <select
                                className="form-select"
                                style={{
                                    fontSize: "16px"
                                }}
                                value={statusFilter}
                                onChange={
                                    e =>
                                        setStatusFilter(
                                            e.target.value
                                        )
                                }
                            >

                                <option value="ALL">
                                    All Activities
                                </option>

                                <option value="SUCCESS">
                                    Successful
                                </option>

                                <option value="FAILED">
                                    Failed
                                </option>

                            </select>

                        </div>

                    </div>

                </div>

            </div>


            {/* =====================================================
                AUDIT LOG TABLE
            ====================================================== */}

            <div className="card shadow-sm border-0">

                <div className="card-header bg-dark text-white">

                    <h5 className="mb-0">
                        📋 Audit Log
                    </h5>

                </div>


                <div className="card-body p-0">

                    {loading ? (

                        /* LOADING */

                        <div className="text-center p-5">

                            <div
                                className="spinner-border text-primary"
                            />

                            <p className="mt-3">
                                Loading activities...
                            </p>

                        </div>

                    ) : filteredActivities.length === 0 ? (

                        /* NO DATA */

                        <div className="alert alert-light m-3">

                            No audit activities found.

                        </div>

                    ) : (

                        <div
                            className="table-responsive"
                            style={{
                                maxHeight: "600px"
                            }}
                        >

                            <table
                                className="table table-hover mb-0"
                            >

                                <thead
                                    className="table-light"
                                    style={{
                                        position: "sticky",
                                        top: 0,
                                        zIndex: 1
                                    }}
                                >

                                    <tr>

                                        <th>#</th>

                                        <th>User</th>

                                        <th>Action</th>

                                        <th>Module</th>

                                        <th>Method</th>

                                        <th>API Endpoint</th>

                                        <th>Result</th>

                                        <th>IP Address</th>

                                        <th>Date & Time</th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {
                                        filteredActivities.map(
                                            (activity, index) => (

                                                <tr
                                                    key={
                                                        activity.id ||
                                                        index
                                                    }
                                                >

                                                    {/* NUMBER */}

                                                    <td>
                                                        {index + 1}
                                                    </td>


                                                    {/* USER */}

                                                    <td>

                                                        <strong>

                                                            {
                                                                activity.username ||
                                                                "SYSTEM"
                                                            }

                                                        </strong>

                                                    </td>


                                                    {/* ACTION */}

                                                    <td>

                                                        <span className="badge bg-primary">

                                                            {
                                                                activity.action ||
                                                                "-"
                                                            }

                                                        </span>

                                                    </td>


                                                    {/* MODULE */}

                                                    <td>

                                                        {
                                                            activity.module ||
                                                            "-"
                                                        }

                                                    </td>


                                                    {/* METHOD */}

                                                    <td>

                                                        <span className="badge bg-secondary">

                                                            {
                                                                activity.httpMethod ||
                                                                "-"
                                                            }

                                                        </span>

                                                    </td>


                                                    {/* API */}

                                                    <td
                                                        style={{
                                                            maxWidth:
                                                                "300px",
                                                            wordBreak:
                                                                "break-word"
                                                        }}
                                                    >

                                                        {
                                                            activity.apiEndpoint ||
                                                            "-"
                                                        }

                                                    </td>


                                                    {/* RESULT */}

                                                    <td>

                                                        {
                                                            activity.result ===
                                                            "SUCCESS"
                                                                ? (

                                                                    <span className="badge bg-success">

                                                                        SUCCESS

                                                                    </span>

                                                                )
                                                                : (

                                                                    <span className="badge bg-danger">

                                                                        FAILED

                                                                    </span>

                                                                )
                                                        }

                                                    </td>


                                                    {/* IP ADDRESS */}

                                                    <td>

                                                        {
                                                            activity.ipAddress
                                                                ? activity.ipAddress ===
                                                                  "0:0:0:0:0:0:0:1"
                                                                    ? "127.0.0.1"
                                                                    : activity.ipAddress
                                                                : "-"
                                                        }

                                                    </td>


                                                    {/* DATE */}

                                                    <td>

                                                        {
                                                            formatDate(
                                                                activity.timestamp
                                                            )
                                                        }

                                                    </td>

                                                </tr>

                                            )
                                        )
                                    }

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>

            </div>

        </div>
    );
}

export default ActivityMonitoring;