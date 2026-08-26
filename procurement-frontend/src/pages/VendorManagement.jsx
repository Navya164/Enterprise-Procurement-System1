import { useEffect, useState } from "react";
import axios from "axios";

const SUPPLIER_API = "http://localhost:8080/suppliers";

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
    const [updatingStatusId, setUpdatingStatusId] = useState(null);

    useEffect(() => {
        loadVendors();
    }, []);

    // ============================================================
    // LOAD VENDORS
    // ============================================================

    const loadVendors = async () => {

        try {

            const response = await axios.get(
                SUPPLIER_API
            );

            setVendors(response.data || []);

        } catch (error) {

            console.error("Unable to load vendors:", error);

            alert("Unable to load vendors");

        }
    };


    // ============================================================
    // HANDLE FORM CHANGE
    // ============================================================

    const handleChange = (e) => {

        const {
            name,
            value,
            type,
            checked
        } = e.target;

        setFormData({
            ...formData,
            [name]:
                type === "checkbox"
                    ? checked
                    : value
        });
    };


    // ============================================================
    // ADD VENDOR
    // ============================================================

    const addVendor = async () => {

        try {

            await axios.post(
                SUPPLIER_API,
                formData
            );

            alert("Vendor Added Successfully");

            setShowForm(false);

            setFormData({
                ...emptyVendor
            });

            loadVendors();

        } catch (error) {

            console.error("Unable to add vendor:", error);

            alert("Unable to add vendor");
        }
    };


    // ============================================================
    // UPDATE VENDOR
    // ============================================================

    const updateVendor = async () => {

        try {

            await axios.put(
                `${SUPPLIER_API}/${editingId}`,
                formData
            );

            alert("Vendor Updated Successfully");

            setShowForm(false);

            setEditingId(null);

            setFormData({
                ...emptyVendor
            });

            loadVendors();

        } catch (error) {

            console.error("Unable to update vendor:", error);

            alert("Unable to update vendor");
        }
    };


    // ============================================================
    // ACTIVATE / DEACTIVATE VENDOR
    // ============================================================

    const updateVendorStatus = async (
        vendor
    ) => {

        const isCurrentlyActive =
            vendor.supplierStatus === "ACTIVE";

        const newStatus =
            isCurrentlyActive
                ? "INACTIVE"
                : "ACTIVE";

        const actionText =
            newStatus === "ACTIVE"
                ? "activate"
                : "deactivate";

        const confirmed = window.confirm(
            `Are you sure you want to ${actionText} ${vendor.supplierName}?`
        );

        if (!confirmed) {
            return;
        }

        try {

            setUpdatingStatusId(
                vendor.id
            );

            await axios.patch(
                `${SUPPLIER_API}/${vendor.id}/status`,
                {
                    supplierStatus: newStatus
                }
            );

            alert(
                `${vendor.supplierName} is now ${newStatus}.`
            );

            await loadVendors();

        } catch (error) {

            console.error(
                "Unable to update vendor status:",
                error
            );

            if (
                error.response &&
                error.response.data
            ) {

                console.error(
                    "Server response:",
                    error.response.data
                );
            }

            alert(
                `Unable to ${actionText} vendor`
            );

        } finally {

            setUpdatingStatusId(null);
        }
    };


    // ============================================================
    // DELETE VENDOR
    // ============================================================

    const deleteVendor = async (id) => {

        const confirmed = window.confirm(
            "Delete this vendor?"
        );

        if (!confirmed) {

            return;
        }

        try {

            await axios.delete(
                `${SUPPLIER_API}/${id}`
            );

            alert(
                "Vendor Deleted Successfully"
            );

            loadVendors();

        } catch (error) {

            console.error(
                "Unable to delete vendor:",
                error
            );

            alert(
                "Unable to delete vendor"
            );
        }
    };


    // ============================================================
    // EDIT VENDOR
    // ============================================================

    const editVendor = (vendor) => {

        setEditingId(
            vendor.id
        );

        setFormData({

            supplierName:
                vendor.supplierName || "",

            companyName:
                vendor.companyName || "",

            contactPerson:
                vendor.contactPerson || "",

            email:
                vendor.email || "",

            phone:
                vendor.phone || "",

            address:
                vendor.address || "",

            gstNumber:
                vendor.gstNumber || "",

            businessType:
                vendor.businessType || "",

            supplierStatus:
                vendor.supplierStatus || "ACTIVE",

            remarks:
                vendor.remarks || "",

            qualityScore:
                vendor.qualityScore || 0,

            deliveryScore:
                vendor.deliveryScore || 0,

            communicationScore:
                vendor.communicationScore || 0,

            totalOrders:
                vendor.totalOrders || 0,

            gstVerified:
                vendor.gstVerified ?? false,

            isoCertified:
                vendor.isoCertified ?? false,

            licenseValid:
                vendor.licenseValid ?? false,

            complianceStatus:
                vendor.complianceStatus || "PENDING"
        });

        setShowForm(true);
    };


    // ============================================================
    // RENDER
    // ============================================================

    return (

        <div className="container mt-4">

            {/* =====================================================
                HEADER
            ===================================================== */}

            <div className="d-flex justify-content-between align-items-center mb-4">

                <h2>
                    Vendor Management
                </h2>

                <button
                    className="btn btn-success"
                    onClick={() => {

                        setEditingId(null);

                        setFormData({
                            ...emptyVendor
                        });

                        setShowForm(true);
                    }}
                >
                    + Add Vendor
                </button>

            </div>


            {/* =====================================================
                ADD / EDIT FORM
            ===================================================== */}

            {showForm && (

                <div className="card shadow mb-4">

                    <div className="card-header bg-primary text-white">

                        <h5 className="mb-0">

                            {
                                editingId
                                    ? "Edit Vendor"
                                    : "Add Vendor"
                            }

                        </h5>

                    </div>


                    <div className="card-body">

                        <div className="row">

                            {/* Supplier Name */}

                            <div className="col-md-6 mb-3">

                                <label>
                                    Supplier Name
                                </label>

                                <input
                                    className="form-control"
                                    name="supplierName"
                                    value={
                                        formData.supplierName
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />

                            </div>


                            {/* Company Name */}

                            <div className="col-md-6 mb-3">

                                <label>
                                    Company Name
                                </label>

                                <input
                                    className="form-control"
                                    name="companyName"
                                    value={
                                        formData.companyName
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />

                            </div>


                            {/* Contact Person */}

                            <div className="col-md-6 mb-3">

                                <label>
                                    Contact Person
                                </label>

                                <input
                                    className="form-control"
                                    name="contactPerson"
                                    value={
                                        formData.contactPerson
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />

                            </div>


                            {/* Email */}

                            <div className="col-md-6 mb-3">

                                <label>
                                    Email
                                </label>

                                <input
                                    className="form-control"
                                    name="email"
                                    value={
                                        formData.email
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />

                            </div>


                            {/* Phone */}

                            <div className="col-md-6 mb-3">

                                <label>
                                    Phone
                                </label>

                                <input
                                    className="form-control"
                                    name="phone"
                                    value={
                                        formData.phone
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />

                            </div>


                            {/* Address */}

                            <div className="col-md-6 mb-3">

                                <label>
                                    Address
                                </label>

                                <input
                                    className="form-control"
                                    name="address"
                                    value={
                                        formData.address
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />

                            </div>


                            {/* GST */}

                            <div className="col-md-6 mb-3">

                                <label>
                                    GST Number
                                </label>

                                <input
                                    className="form-control"
                                    name="gstNumber"
                                    value={
                                        formData.gstNumber
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />

                            </div>


                            {/* Business Type */}

                            <div className="col-md-6 mb-3">

                                <label>
                                    Business Type
                                </label>

                                <input
                                    className="form-control"
                                    name="businessType"
                                    value={
                                        formData.businessType
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />

                            </div>


                            {/* Status */}

                            <div className="col-md-6 mb-3">

                                <label>
                                    Status
                                </label>

                                <select
                                    className="form-control"
                                    name="supplierStatus"
                                    value={
                                        formData.supplierStatus
                                    }
                                    onChange={
                                        handleChange
                                    }
                                >

                                    <option value="ACTIVE">
                                        ACTIVE
                                    </option>

                                    <option value="INACTIVE">
                                        INACTIVE
                                    </option>

                                    <option value="BLOCKED">
                                        BLOCKED
                                    </option>

                                </select>

                            </div>


                            {/* Remarks */}

                            <div className="col-md-6 mb-3">

                                <label>
                                    Remarks
                                </label>

                                <input
                                    className="form-control"
                                    name="remarks"
                                    value={
                                        formData.remarks
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />

                            </div>

                        </div>


                        {/* FORM BUTTONS */}

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

                            {
                                editingId
                                    ? "Update Vendor"
                                    : "Save Vendor"
                            }

                        </button>


                        <button
                            className="btn btn-secondary"
                            onClick={() => {

                                setShowForm(false);

                                setEditingId(null);

                                setFormData({
                                    ...emptyVendor
                                });

                            }}
                        >
                            Cancel
                        </button>

                    </div>

                </div>

            )}


            {/* =====================================================
                VENDOR TABLE
            ===================================================== */}

            <div className="table-responsive">

                <table className="table table-bordered table-hover">

                    <thead className="table-dark">

                        <tr>

                            <th>
                                ID
                            </th>

                            <th>
                                Supplier
                            </th>

                            <th>
                                Company
                            </th>

                            <th>
                                Contact
                            </th>

                            <th>
                                Email
                            </th>

                            <th>
                                Phone
                            </th>

                            <th>
                                Business Type
                            </th>

                            <th>
                                Status
                            </th>

                            <th>
                                Actions
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        {vendors.length === 0 ? (

                            <tr>

                                <td
                                    colSpan="9"
                                    className="text-center text-muted py-4"
                                >
                                    No vendors found.
                                </td>

                            </tr>

                        ) : (

                            vendors.map(
                                (vendor) => (

                                    <tr
                                        key={vendor.id}
                                    >

                                        <td>
                                            {vendor.id}
                                        </td>

                                        <td>
                                            {vendor.supplierName}
                                        </td>

                                        <td>
                                            {vendor.companyName}
                                        </td>

                                        <td>
                                            {vendor.contactPerson}
                                        </td>

                                        <td>
                                            {vendor.email}
                                        </td>

                                        <td>
                                            {vendor.phone}
                                        </td>

                                        <td>
                                            {vendor.businessType}
                                        </td>


                                        {/* STATUS */}

                                        <td>

                                            <span
                                                className={
                                                    vendor.supplierStatus ===
                                                    "ACTIVE"
                                                        ? "badge bg-success"
                                                        : vendor.supplierStatus ===
                                                          "INACTIVE"
                                                        ? "badge bg-secondary"
                                                        : "badge bg-danger"
                                                }
                                            >

                                                {
                                                    vendor.supplierStatus
                                                }

                                            </span>

                                        </td>


                                        {/* ACTIONS */}

                                        <td>

                                            <button
                                                className="btn btn-warning btn-sm me-2"
                                                onClick={() =>
                                                    editVendor(
                                                        vendor
                                                    )
                                                }
                                            >
                                                Edit
                                            </button>


                                            {/* ACTIVATE / DEACTIVATE */}

                                            {
                                                vendor.supplierStatus ===
                                                "ACTIVE" ? (

                                                    <button
                                                        className="btn btn-outline-secondary btn-sm me-2"
                                                        onClick={() =>
                                                            updateVendorStatus(
                                                                vendor
                                                            )
                                                        }
                                                        disabled={
                                                            updatingStatusId ===
                                                            vendor.id
                                                        }
                                                    >

                                                        {
                                                            updatingStatusId ===
                                                            vendor.id
                                                                ? "Updating..."
                                                                : "Deactivate"
                                                        }

                                                    </button>

                                                ) : vendor.supplierStatus ===
                                                  "INACTIVE" ? (

                                                    <button
                                                        className="btn btn-outline-success btn-sm me-2"
                                                        onClick={() =>
                                                            updateVendorStatus(
                                                                vendor
                                                            )
                                                        }
                                                        disabled={
                                                            updatingStatusId ===
                                                            vendor.id
                                                        }
                                                    >

                                                        {
                                                            updatingStatusId ===
                                                            vendor.id
                                                                ? "Updating..."
                                                                : "Activate"
                                                        }

                                                    </button>

                                                ) : null
                                            }


                                            {/* DELETE */}

                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() =>
                                                    deleteVendor(
                                                        vendor.id
                                                    )
                                                }
                                            >
                                                Delete
                                            </button>

                                        </td>

                                    </tr>

                                )
                            )

                        )}

                    </tbody>

                </table>

            </div>

        </div>
    );
}

export default VendorManagement;