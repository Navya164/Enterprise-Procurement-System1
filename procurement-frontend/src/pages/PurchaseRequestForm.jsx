import { useState } from "react";
import { createPurchaseRequest } from "../services/purchaseApi";

function PurchaseRequestForm() {

    const [request, setRequest] = useState({
        title: "",
        description: "",
        amount: "",
        category: "",
        priority: "NORMAL",
        emergencyFlag: false
    });

    const handleChange = (e) => {

        const { name, value, type, checked } = e.target;

        setRequest({
            ...request,
            [name]: type === "checkbox" ? checked : value
        });

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            // Replace with logged-in employee id later
            await createPurchaseRequest(1, request);

            alert("Purchase Request Submitted Successfully!");

            setRequest({
                title: "",
                description: "",
                amount: "",
                category: "",
                priority: "NORMAL",
                emergencyFlag: false
            });

        } catch (error) {

            alert("Failed to submit request");

            console.error(error);

        }

    };

    return (

        <div className="container mt-5">

            <h2>Create Purchase Request</h2>

            <form onSubmit={handleSubmit}>

                <input
                    className="form-control mb-3"
                    placeholder="Title"
                    name="title"
                    value={request.title}
                    onChange={handleChange}
                />

                <textarea
                    className="form-control mb-3"
                    placeholder="Description"
                    name="description"
                    value={request.description}
                    onChange={handleChange}
                />

                <input
                    className="form-control mb-3"
                    type="number"
                    placeholder="Amount"
                    name="amount"
                    value={request.amount}
                    onChange={handleChange}
                />

                <input
                    className="form-control mb-3"
                    placeholder="Category"
                    name="category"
                    value={request.category}
                    onChange={handleChange}
                />

                <select
                    className="form-control mb-3"
                    name="priority"
                    value={request.priority}
                    onChange={handleChange}
                >
                    <option value="NORMAL">Normal</option>
                    <option value="EMERGENCY">Emergency</option>
                </select>

                <div className="form-check mb-3">

                    <input
                        type="checkbox"
                        className="form-check-input"
                        name="emergencyFlag"
                        checked={request.emergencyFlag}
                        onChange={handleChange}
                    />

                    <label className="form-check-label">

                        Emergency Request

                    </label>

                </div>

                <button className="btn btn-primary">

                    Submit Request

                </button>

            </form>

        </div>

    );

}

export default PurchaseRequestForm;