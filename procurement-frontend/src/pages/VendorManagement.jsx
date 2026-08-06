import { useEffect, useState } from "react";
import axios from "axios";

function VendorManagement() {

    const emptyVendor = {
        supplierName: "",
        companyName: "",
        contactPerson: "",
        email: "",
        phone: "",
        address: "",
        gstNumber: "",
        businessType: "",
        supplierStatus: "ACTIVE",
        remarks: "",
        qualityScore: 0,
        deliveryScore: 0,
        communicationScore: 0,
        totalOrders: 0,
        gstVerified: true,
        isoCertified: false,
        licenseValid: true,
        complianceStatus: "COMPLIANT"
    };

    const [vendors, setVendors] = useState([]);
    const [formData, setFormData] = useState(emptyVendor);
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        loadVendors();
    }, []);

    const loadVendors = async () => {

        try {

            const response = await axios.get(
                "http://localhost:8080/suppliers"
            );

            setVendors(response.data);

        } catch (error) {

            console.error(error);
            alert("Unable to load vendors");

        }

    };

    const handleChange = (e) => {

        const { name, value, type, checked } = e.target;

        setFormData({

            ...formData,

            [name]:
                type === "checkbox"
                    ? checked
                    : value

        });

    };

    const addVendor = async () => {

        try {

            await axios.post(
                "http://localhost:8080/suppliers",
                formData
            );

            alert("Vendor Added Successfully");

            setShowForm(false);

            setFormData(emptyVendor);

            loadVendors();

        } catch (error) {

            console.error(error);

            alert("Unable to add vendor");

        }

    };

    const updateVendor = async () => {

        try {

            await axios.put(

                `http://localhost:8080/suppliers/${editingId}`,

                formData

            );

            alert("Vendor Updated Successfully");

            setShowForm(false);

            setEditingId(null);

            setFormData(emptyVendor);

            loadVendors();

        } catch (error) {

            console.error(error);

            alert("Unable to update vendor");

        }

    };

    const deleteVendor = async (id) => {

        if (!window.confirm("Delete this vendor?")) {

            return;

        }

        try {

            await axios.delete(

                `http://localhost:8080/suppliers/${id}`

            );

            alert("Vendor Deleted Successfully");

            loadVendors();

        } catch (error) {

            console.error(error);

            alert("Unable to delete vendor");

        }

    };

    const editVendor = (vendor) => {

        setEditingId(vendor.id);

        setFormData({

            supplierName: vendor.supplierName,
            companyName: vendor.companyName,
            contactPerson: vendor.contactPerson,
            email: vendor.email,
            phone: vendor.phone,
            address: vendor.address,
            gstNumber: vendor.gstNumber,
            businessType: vendor.businessType,
            supplierStatus: vendor.supplierStatus,
            remarks: vendor.remarks || "",
            qualityScore: vendor.qualityScore || 0,
            deliveryScore: vendor.deliveryScore || 0,
            communicationScore: vendor.communicationScore || 0,
            totalOrders: vendor.totalOrders || 0,
            gstVerified: vendor.gstVerified,
            isoCertified: vendor.isoCertified,
            licenseValid: vendor.licenseValid,
            complianceStatus: vendor.complianceStatus

        });

        setShowForm(true);

    };
        return (

        <div className="container mt-4">

            <div className="d-flex justify-content-between align-items-center mb-4">

                <h2>Vendor Management</h2>

                <button
                    className="btn btn-success"
                    onClick={() => {
                        setEditingId(null);
                        setFormData(emptyVendor);
                        setShowForm(true);
                    }}
                >
                    + Add Vendor
                </button>

            </div>

            {showForm && (

                <div className="card shadow mb-4">

                    <div className="card-header bg-primary text-white">

                        <h5 className="mb-0">

                            {editingId ? "Edit Vendor" : "Add Vendor"}

                        </h5>

                    </div>

                    <div className="card-body">

                        <div className="row">

                            <div className="col-md-6 mb-3">
                                <label>Supplier Name</label>
                                <input
                                    className="form-control"
                                    name="supplierName"
                                    value={formData.supplierName}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label>Company Name</label>
                                <input
                                    className="form-control"
                                    name="companyName"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label>Contact Person</label>
                                <input
                                    className="form-control"
                                    name="contactPerson"
                                    value={formData.contactPerson}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label>Email</label>
                                <input
                                    className="form-control"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label>Phone</label>
                                <input
                                    className="form-control"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label>Address</label>
                                <input
                                    className="form-control"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label>GST Number</label>
                                <input
                                    className="form-control"
                                    name="gstNumber"
                                    value={formData.gstNumber}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label>Business Type</label>
                                <input
                                    className="form-control"
                                    name="businessType"
                                    value={formData.businessType}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label>Status</label>

                                <select
                                    className="form-control"
                                    name="supplierStatus"
                                    value={formData.supplierStatus}
                                    onChange={handleChange}
                                >
                                    <option value="ACTIVE">ACTIVE</option>
                                    <option value="INACTIVE">INACTIVE</option>
                                    <option value="BLOCKED">BLOCKED</option>
                                </select>

                            </div>

                            <div className="col-md-6 mb-3">
                                <label>Remarks</label>
                                <input
                                    className="form-control"
                                    name="remarks"
                                    value={formData.remarks}
                                    onChange={handleChange}
                                />
                            </div>

                        </div>

                        <button
                            className="btn btn-primary me-2"
                            onClick={() => {

                                if (editingId) {

                                    updateVendor();

                                } else {

                                    addVendor();

                                }

                            }}
                        >
                            {editingId ? "Update Vendor" : "Save Vendor"}
                        </button>

                        <button
                            className="btn btn-secondary"
                            onClick={() => {

                                setShowForm(false);
                                setEditingId(null);
                                setFormData(emptyVendor);

                            }}
                        >
                            Cancel
                        </button>

                    </div>

                </div>

            )}

            <div className="table-responsive">

                <table className="table table-bordered table-hover">

                    <thead className="table-dark">

                        <tr>

                            <th>ID</th>
                            <th>Supplier</th>
                            <th>Company</th>
                            <th>Contact</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Business Type</th>
                            <th>Status</th>
                            <th>Actions</th>

                        </tr>

                    </thead>

                    <tbody>

                        {

                            vendors.map((vendor) => (

                                <tr key={vendor.id}>

                                    <td>{vendor.id}</td>

                                    <td>{vendor.supplierName}</td>

                                    <td>{vendor.companyName}</td>

                                    <td>{vendor.contactPerson}</td>

                                    <td>{vendor.email}</td>

                                    <td>{vendor.phone}</td>

                                    <td>{vendor.businessType}</td>

                                    <td>

                                        <span
                                            className={
                                                vendor.supplierStatus === "ACTIVE"
                                                    ? "badge bg-success"
                                                    : vendor.supplierStatus === "INACTIVE"
                                                    ? "badge bg-secondary"
                                                    : "badge bg-danger"
                                            }
                                        >
                                            {vendor.supplierStatus}
                                        </span>

                                    </td>

                                    <td>

                                        <button
                                            className="btn btn-warning btn-sm me-2"
                                            onClick={() => editVendor(vendor)}
                                        >
                                            Edit
                                        </button>

                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => deleteVendor(vendor.id)}
                                        >
                                            Delete
                                        </button>

                                    </td>

                                </tr>

                            ))

                        }

                    </tbody>

                </table>

            </div>

        </div>

    );

}

export default VendorManagement;