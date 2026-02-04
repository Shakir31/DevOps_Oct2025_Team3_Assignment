import { User } from "./columns"
import { DataTable } from "./data-table"
import {useEffect, useState} from "react";
import {createColumnHelper} from "@tanstack/react-table";
import axios from "axios";
import {formatDate} from "@/lib/utils";
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

const API = import.meta.env.VITE_API_URL;

export default function DemoPage() {

    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const getAllUsers = async () => {
            try {
                setLoading(true)
                const response = await axios.get(`${API}/admin/`);
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


    const columnHelper = createColumnHelper<User>();
    const columns = [
        // columnHelper.display({
        //     id:"action",
        //     header: ({table}) => (
        //         <Checkbox
        //             checked={table.getIsAllPageRowsSelected() ||
        //                 (table.getIsSomePageRowsSelected() && "indeterminate")}
        //             onCheckedChange={(value: any) => table.toggleAllPageRowsSelected(!!value)}
        //             arial-label="Select All" className={undefined}            />
        //     ),
        //     cell: ({ row }) => (
        //         <Checkbox
        //             checked={row.getIsSelected()}
        //             onCheckedChange={(value: any) => row.toggleSelected(!!value)}
        //             arial-label="Select row" className={undefined}
        //         />
        //     ),
        // }),
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
            cell: (info) => formatDate(info.getValue())
        }),
        columnHelper.display({
            id:"more",
            cell: ({row}) => {

                const user = row.original; // Get the user object for this row

                const handleDelete = async  () => {
                    console.log('Delete clicked for user:', user);
                    try {
                        await axios.delete(`${API}/admin/delete_user/${user.userid}`);

                        setUsers((prev: User[]) => prev.filter((u) => u.userid !== user.userid));
                    } catch (error) {
                        console.error('Failed to delete user:', error);
                    }
                };

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild aria-label>
                            <Button aria-label={`More actions for ${user.email}`} variant={"ghost"} className={undefined}>
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

    if (loading) {
        return <div>Loading...</div>
    }




    return (
        <div className="flex flex-col items-center justify-center w-full h-full px-6 py-4">
            <DataTable columns={columns} data={users} setData={setUsers}/>
        </div>
    )
}