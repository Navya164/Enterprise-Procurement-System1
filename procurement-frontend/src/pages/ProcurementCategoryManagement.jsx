import React, { useEffect, useState } from "react";
import axios from "axios";

function ProcurementCategoryManagement() {

    const API = "http://localhost:8080/api/categories";

    const emptyCategory = {
        categoryName: "",
        categoryCode: "",
        description: ""
    };

    const [category, setCategory] = useState(emptyCategory);
    const [categories, setCategories] = useState([]);
    const [editId, setEditId] = useState(null);


    // Load categories
    const loadCategories = async () => {

        try {

            const response = await axios.get(API);

            setCategories(response.data);

        } catch(error) {

            console.log(error);

        }

    };


    useEffect(() => {

        loadCategories();

    }, []);



    const handleChange = (e) => {

        setCategory({
            ...category,
            [e.target.name]: e.target.value
        });

    };



    const saveCategory = async () => {

        try {

            if(editId){

                await axios.put(
                    `${API}/${editId}`,
                    category
                );

                alert("Category updated successfully");

            }
            else{

                await axios.post(
                    API,
                    category
                );

                alert("Category created successfully");

            }


            setCategory(emptyCategory);
            setEditId(null);

            loadCategories();


        } catch(error){

            console.log(error);

            alert("Operation failed");

        }

    };



    const editCategory = (c) => {

        setCategory({

            categoryName: c.categoryName,
            categoryCode: c.categoryCode,
            description: c.description

        });

        setEditId(c.id);

    };



    const deleteCategory = async(id)=>{

        try{

            await axios.delete(
                `${API}/${id}`
            );

            alert("Category deleted");

            loadCategories();


        }catch(error){

            console.log(error);

        }

    };



    return (

        <div className="container mt-5">

            <h2 className="mb-4">
                Procurement Category Management
            </h2>


            <div className="card p-4 mb-4">

                <input
                    className="form-control mb-3"
                    placeholder="Category Name"
                    name="categoryName"
                    value={category.categoryName}
                    onChange={handleChange}
                />


                <input
                    className="form-control mb-3"
                    placeholder="Category Code"
                    name="categoryCode"
                    value={category.categoryCode}
                    onChange={handleChange}
                />


                <textarea
                    className="form-control mb-3"
                    placeholder="Description"
                    name="description"
                    value={category.description}
                    onChange={handleChange}
                />


                <button
                    className="btn btn-primary"
                    onClick={saveCategory}
                >

                    {editId ? "Update Category" : "Add Category"}

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
                    categories.map((c)=>(

                        <tr key={c.id}>

                            <td>{c.categoryName}</td>

                            <td>{c.categoryCode}</td>

                            <td>{c.description}</td>

                            <td>

                                <button
                                    className="btn btn-warning btn-sm me-2"
                                    onClick={()=>editCategory(c)}
                                >
                                    Edit
                                </button>


                                <button
                                    className="btn btn-danger btn-sm"
                                    onClick={()=>deleteCategory(c.id)}
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


export default ProcurementCategoryManagement;