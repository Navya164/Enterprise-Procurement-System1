import axios from "axios";

const BASE_URL = "http://localhost:8080/api/purchase";

export const createPurchaseRequest = (employeeId, request) => {
    return axios.post(`${BASE_URL}/create/${employeeId}`, request);
};

export const getEmployeeRequests = (employeeId) => {
    return axios.get(`${BASE_URL}/employee/${employeeId}`);
};

// Update Purchase Order status
export const updatePurchaseOrderStatus = (poId, status, deliveredQuantity = null) => {
    return axios.patch(
        `http://localhost:8080/api/purchase-orders/${poId}/status`,
        {
            status: status,
            deliveredQuantity: deliveredQuantity
        }
    );
};