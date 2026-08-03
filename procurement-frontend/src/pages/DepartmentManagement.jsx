import React, { useEffect, useState } from "react";
import axios from "axios";


function DepartmentManagement() {


    const API = "http://localhost:8080/api/departments";


    const emptyDepartment = {

        departmentName: "",
        departmentCode: "",
        description: ""

    };


    const [department, setDepartment] = useState(emptyDepartment);
    const [departments, setDepartments] = useState([]);
    const [editId, setEditId] = useState(null);



    const loadDepartments = async () => {

        try {

            const response = await axios.get(API);

            setDepartments(response.data);


        } catch(error){

            console.log(error);

        }

    };



    useEffect(()=>{

        loadDepartments();

    },[]);




    const handleChange=(e)=>{

        setDepartment({

            ...department,
            [e.target.name]:e.target.value

        });

    };




    const saveDepartment = async()=>{


        try{


            if(editId){


                await axios.put(

                    `${API}/${editId}`,
                    department

                );


                alert("Department updated successfully");


            }
            else{


                await axios.post(

                    API,
                    department

                );


                alert("Department created successfully");


            }



            setDepartment(emptyDepartment);

            setEditId(null);

            loadDepartments();



        }catch(error){

            console.log(error);

            alert("Operation failed");

        }


    };






    const editDepartment=(d)=>{


        setDepartment({

            departmentName:d.departmentName,

            departmentCode:d.departmentCode,

            description:d.description

        });


        setEditId(d.id);


    };






    const deleteDepartment=async(id)=>{


        try{


            await axios.delete(

                `${API}/${id}`

            );


            alert("Department deleted");


            loadDepartments();



        }catch(error){

            console.log(error);

        }


    };






    return(


        <div className="container mt-5">


            <h2 className="mb-4">

                Department Management

            </h2>





            <div className="card p-4 mb-4">


                <input

                    className="form-control mb-3"

                    placeholder="Department Name"

                    name="departmentName"

                    value={department.departmentName}

                    onChange={handleChange}

                />



                <input

                    className="form-control mb-3"

                    placeholder="Department Code"

                    name="departmentCode"

                    value={department.departmentCode}

                    onChange={handleChange}

                />




                <textarea

                    className="form-control mb-3"

                    placeholder="Description"

                    name="description"

                    value={department.description}

                    onChange={handleChange}

                />




                <button

                    className="btn btn-primary"

                    onClick={saveDepartment}

                >

                    {editId ? "Update Department" : "Add Department"}

                </button>



            </div>







            <table className="table table-bordered">


                <thead>


                    <tr>

                        <th>Name</th>

                        <th>Code</th>

                        <th>Description</th>

                        <th>Action</th>


                    </tr>


                </thead>




                <tbody>


                    {

                        departments.map((d)=>(


                            <tr key={d.id}>


                                <td>

                                    {d.departmentName}

                                </td>



                                <td>

                                    {d.departmentCode}

                                </td>



                                <td>

                                    {d.description}

                                </td>



                                <td>


                                    <button

                                        className="btn btn-warning btn-sm me-2"

                                        onClick={()=>editDepartment(d)}

                                    >

                                        Edit

                                    </button>




                                    <button

                                        className="btn btn-danger btn-sm"

                                        onClick={()=>deleteDepartment(d.id)}

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



export default DepartmentManagement;