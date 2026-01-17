import { User } from "./columns"
import { DataTable } from "./data-table"
import {useEffect, useState} from "react";
import {createColumnHelper} from "@tanstack/react-table";
import axios from "axios";
import {Checkbox} from "@/components/ui/checkbox";



const columnHelper = createColumnHelper<User>();
const columns = [
    columnHelper.display({
        id:"action",
        header: ({table}) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")}
                onCheckedChange={(value: any) => table.toggleAllPageRowsSelected(!!value)}
                arial-label="Select All" className={undefined}            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value: any) => row.toggleSelected(!!value)}
                aria-label="Select row" className={undefined}
            />
        ),
    }),
    columnHelper.accessor("username",{
        header: () => <p>Username</p>,
        cell:(info) => info.getValue(),
    }),
    columnHelper.accessor("email",{
        header: () => <p>Email</p>,
        cell: (info) => info.getValue()
    }),
    columnHelper.accessor("role",{
        header: () => <p>Role</p>,
        cell:(info) => info.getValue(),
    }),
    columnHelper.accessor("created_at",{
        header: () => <p>Create At</p>,
        cell: (info) => info.getValue()
    })
]

export default function DemoPage() {

    const [Users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const getAllUsers = async () => {
            try {
                setLoading(true)
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/Users`);
                setUsers(response.data);
            } catch (error) {
                console.error('Failed to fetch users:', error);
                // Handle error appropriately (show toast, set error state, etc.)
            }finally {
                setLoading(false)
            }
        }
        getAllUsers();

    }, [])

    if (loading) {
        return <div>Loading...</div>
    }


    return (
        <div className="flex flex-col items-center justify-center w-full h-full px-6 py-4">
            <DataTable columns={columns} data={Users} />
        </div>
    )
}