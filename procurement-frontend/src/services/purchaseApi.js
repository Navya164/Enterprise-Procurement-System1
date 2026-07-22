import axios from "axios";

const BASE_URL = "http://localhost:8080/api/purchase";

export const createPurchaseRequest = (employeeId, request) => {
    return axios.post(`${BASE_URL}/create/${employeeId}`, request);
};

export const getEmployeeRequests = (employeeId) => {
    return axios.get(`${BASE_URL}/employee/${employeeId}`);
};