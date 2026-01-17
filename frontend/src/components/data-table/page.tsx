import { User } from "./columns"
import { DataTable } from "./data-table"
import {useEffect, useState} from "react";
import {createColumnHelper} from "@tanstack/react-table";
import axios from "axios";
import {Checkbox} from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {Button} from "@/components/ui/button";
import {MoreVertical} from "lucide-react";



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
        header: () => <p>Created At</p>,
        cell: (info) => info.getValue()
    }),
    columnHelper.display({
        id:"more",
        cell: ({row}) => {

            const user = row.original; // Get the user object for this row

            const handleDelete = async  () => {
                console.log('Delete clicked for user:', user);
                try {
                    await axios.delete(`${import.meta.env.VITE_API_URL}/delete_user/${user.userid}`);
                    // Refresh the users list or remove from state
                    // setUsers(Users.filter(u => u.id !== user.id));
                } catch (error) {
                    console.error('Failed to delete user:', error);
                }
            };

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant={"ghost"} className={undefined}>
                            <MoreVertical/>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent onCloseAutoFocus={(e: { preventDefault: () => any; })=> e.preventDefault()} className={undefined}>
                        <DropdownMenuLabel className={undefined} inset={undefined}>
                            Actions
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className={undefined}/>
                        <DropdownMenuItem
                            onClick={handleDelete}

                            className={undefined}
                            inset={undefined}

                        >Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
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