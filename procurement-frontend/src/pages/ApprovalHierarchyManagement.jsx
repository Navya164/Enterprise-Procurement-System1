import React, { useEffect, useState } from "react";
import axios from "axios";


function ApprovalHierarchyManagement() {


    const API = "http://localhost:8080/api/approval-hierarchy";


    const emptyHierarchy = {

        department: "",
        approverName: "",
        approverRole: "",
        approvalLevel: ""

    };


    const [hierarchy, setHierarchy] = useState(emptyHierarchy);

    const [hierarchies, setHierarchies] = useState([]);

    const [editId, setEditId] = useState(null);



    const loadHierarchies = async()=>{


        try{


            const response = await axios.get(API);

            setHierarchies(response.data);


        }catch(error){

            console.log(error);

        }


    };



    useEffect(()=>{

        loadHierarchies();

    },[]);




    const handleChange=(e)=>{


        setHierarchy({

            ...hierarchy,

            [e.target.name]:e.target.value

        });


    };





    const saveHierarchy=async()=>{


        try{


            if(editId){


                await axios.put(

                    `${API}/${editId}`,

                    hierarchy

                );


                alert("Approval hierarchy updated");


            }
            else{


                await axios.post(

                    API,

                    hierarchy

                );


                alert("Approval hierarchy created");


            }



            setHierarchy(emptyHierarchy);

            setEditId(null);

            loadHierarchies();



        }catch(error){

            console.log(error);

            alert("Operation failed");

        }


    };






    const editHierarchy=(h)=>{


        setHierarchy({

            department:h.department,

            approverName:h.approverName,

            approverRole:h.approverRole,

            approvalLevel:h.approvalLevel

        });


        setEditId(h.id);


    };







    const deleteHierarchy=async(id)=>{


        try{


            await axios.delete(

                `${API}/${id}`

            );


            alert("Approval hierarchy deleted");


            loadHierarchies();



        }catch(error){

            console.log(error);

        }


    };






    return(


        <div className="container mt-5">


            <h2 className="mb-4">

                Approval Hierarchy Management

            </h2>




            <div className="card p-4 mb-4">



                <input

                    className="form-control mb-3"

                    placeholder="Department"

                    name="department"

                    value={hierarchy.department}

                    onChange={handleChange}

                />





                <input

                    className="form-control mb-3"

                    placeholder="Approver Name"

                    name="approverName"

                    value={hierarchy.approverName}

                    onChange={handleChange}

                />





                <input

                    className="form-control mb-3"

                    placeholder="Approver Role"

                    name="approverRole"

                    value={hierarchy.approverRole}

                    onChange={handleChange}

                />






                <input

                    type="number"

                    className="form-control mb-3"

                    placeholder="Approval Level"

                    name="approvalLevel"

                    value={hierarchy.approvalLevel}

                    onChange={handleChange}

                />





                <button

                    className="btn btn-primary"

                    onClick={saveHierarchy}

                >

                    {editId ? "Update Hierarchy" : "Add Hierarchy"}

                </button>



            </div>








            <table className="table table-bordered">


                <thead>

                    <tr>

                        <th>Department</th>

                        <th>Approver Name</th>

                        <th>Role</th>

                        <th>Level</th>

                        <th>Action</th>


                    </tr>


                </thead>




                <tbody>


                {


                    hierarchies.map((h)=>(


                        <tr key={h.id}>


                            <td>{h.department}</td>


                            <td>{h.approverName}</td>


                            <td>{h.approverRole}</td>


                            <td>{h.approvalLevel}</td>



                            <td>


                                <button

                                    className="btn btn-warning btn-sm me-2"

                                    onClick={()=>editHierarchy(h)}

                                >

                                    Edit

                                </button>





                                <button

                                    className="btn btn-danger btn-sm"

                                    onClick={()=>deleteHierarchy(h.id)}

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


    );


}


export default ApprovalHierarchyManagement;