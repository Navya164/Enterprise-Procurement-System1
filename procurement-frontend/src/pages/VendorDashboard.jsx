import { useEffect, useState } from "react";
import axios from "axios";


const API = "http://localhost:8080/api/vendor/orders";


function VendorDashboard(){

    const [orders,setOrders] = useState([]);


    useEffect(()=>{
        loadOrders();
    },[]);



    const loadOrders = async()=>{

        try{

            const response = await axios.get(API);

            setOrders(response.data);

        }catch(error){

            console.error(error);

        }

    };
        const updateStatus = async(id, status)=>{

    try{

        await axios.patch(
            `http://localhost:8080/api/purchase-orders/${id}/status`,
            {
                status: status
            }
        );

        alert("Order Updated");

        loadOrders();

    }
    catch(error){

        console.error(error);

        alert(
            error.response?.data?.message ||
            "Unable to update status"
        );

    }

};


    return(

        <div className="container mt-4">

            <h2>
                Vendor Dashboard
            </h2>


            {
                orders.map(order=>(

                    <div
                        key={order.id}
                        className="border rounded p-3 mb-3"
                    >

                        <h5>
                            {order.poNumber}
                        </h5>


                        <p>
                            <b>Item:</b> {order.itemName}
                        </p>


                        <p>
                            <b>Quantity:</b> {order.quantity}
                        </p>


                        <p>
                            <b>Total:</b> ₹{order.totalAmount}
                        </p>


                        <p>
                            <b>Status:</b> {order.status}
                        </p>


                        <button
                            className="btn btn-success me-2"
                            onClick={() => updateStatus(order.id,"ACCEPTED")}
                        >
                            Accept
                        </button>

                        <button
                            className="btn btn-danger"
                            onClick={() => updateStatus(order.id,"REJECTED")}
                        >
                            Reject
                        </button>


                    </div>

                ))
            }


        </div>

    );

}


export default VendorDashboard;