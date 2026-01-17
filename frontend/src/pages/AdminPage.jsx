import React, {useEffect, useState} from 'react'
import {useAuth} from "../contexts/AuthContext.jsx";
import axios from "axios";
import Header from "../components/Header.jsx";
import {DataTable} from "@/components/data-table/data-table.tsx";
import DemoPage from "@/components/data-table/page.tsx";



const AdminPage = () => {
    const { user, isAdmin } = useAuth();

    // const [Users, setUsers] = useState([])
    //
    //
    // useEffect(() => {
    //     const getAllUsers = async () => {
    //         try {
    //             const response = await axios.get(`${import.meta.env.VITE_API_URL}/Users`);
    //             setUsers(response.data);
    //         } catch (error) {
    //             console.error('Failed to fetch users:', error);
    //             // Handle error appropriately (show toast, set error state, etc.)
    //         }
    //     }
    //     getAllUsers();
    // }, [])


    return (
        <>
            <Header/>

            <DemoPage></DemoPage>


            {/*<div className="simple-dashboard">*/}
            {/*    <div className="simple-content">*/}
            {/*        <div className="simple-welcome-card">*/}
            {/*            <h2>Welcome, {user?.username}</h2>*/}
            {/*            <p>You have logged in.</p>*/}

            {/*            <div className="simple-info-box">*/}
            {/*                <div className="simple-info-item">*/}
            {/*                    <span className="simple-info-label">Email:</span>*/}
            {/*                    <span className="simple-info-value">{user?.email}</span>*/}
            {/*                </div>*/}
            {/*                <div className="simple-info-item">*/}
            {/*                    <span className="simple-info-label">Role:</span>*/}
            {/*                    <span className="simple-info-value">{user?.role}</span>*/}
            {/*                </div>*/}
            {/*            </div>*/}
            {/*        </div>*/}
            {/*    </div>*/}

            {/*    {Users && isAdmin && (Users.map((user) => (*/}
            {/*        <div key={user.userid}>*/}
            {/*            <h2>{user.username}</h2>*/}
            {/*            <p>{user.email}</p>*/}
            {/*        </div>*/}
            {/*    )))}*/}


            {/*</div>*/}
        </>
    );
}
export default AdminPage
