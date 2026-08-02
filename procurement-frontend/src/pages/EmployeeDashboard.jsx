import { useState } from "react";
import axios from "axios";

function EmployeeDashboard() {

    const [request, setRequest] = useState({
        title: "",
        description: "",
        amount: "",
        category: "",
        priority: "LOW"
    });

    const handleChange = (e) => {
        const { name, value } = e.target;

        setRequest({
            ...request,
            [name]: value
        });
    };

    const submitRequest = async () => {

        try {

            await axios.post(
                "http://localhost:8080/api/purchase/create/1",
                request
            );

            alert("Purchase Request Submitted Successfully!");

            setRequest({
                title: "",
                description: "",
                amount: "",
                category: "",
                priority: "LOW"
            });

        } catch (error) {

            console.error(error);
            alert("Unable to submit request");

        }

    };

    return (

        <div style={{ padding: "30px" }}>

            <h2>Employee Dashboard</h2>

            <h3>Create Purchase Request</h3>

            <input
                type="text"
                placeholder="Title"
                name="title"
                value={request.title}
                onChange={handleChange}
            />

            <br /><br />

            <textarea
                placeholder="Description"
                name="description"
                value={request.description}
                onChange={handleChange}
            />

            <br /><br />

            <input
                type="number"
                placeholder="Amount"
                name="amount"
                value={request.amount}
                onChange={handleChange}
            />

            <br /><br />

            <input
                type="text"
                placeholder="Category"
                name="category"
                value={request.category}
                onChange={handleChange}
            />

            <br /><br />

            <select
                name="priority"
                value={request.priority}
                onChange={handleChange}
            >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
            </select>

            <br /><br />

            <button onClick={submitRequest}>
                Submit Request
            </button>

        </div>

    );

}

export default EmployeeDashboard;