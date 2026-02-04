
"use client"
import React, { useState } from "react"
import CreateUserForm from "./CreateUserForm"
import {User} from "./columns"

import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"



import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

interface DataTableProps<TData> {
    columns: ColumnDef<TData, any>[]
    data: TData[]
    setData: React.Dispatch<React.SetStateAction<User[]>>
}

export function DataTable<TData>({columns, data,setData}: DataTableProps<TData>) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = useState({})
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        // onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        // getSortedRowModel: getSortedRowModel(),
        // getPaginationRowModel: getPaginationRowModel(),
    })



    return (
        <div className="flex flex-col w-[1200px] h-[80vh]">
            <div className="flex justify-between items-center py-4">
                <Input
                    placeholder="Search email..."
                    value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
                    onChange={(event: {
                        target: { value: string }
                    }) => table.getColumn("email")?.setFilterValue(event.target.value)}
                    className="max-w-sm bg-background shadow-sm" type={undefined}                />
                <Button
                    variant="outline"
                    className="ml-2"
                    onClick={() => setIsDialogOpen(true)}
                >
                    Create User
                </Button>
            </div>

            <CreateUserForm isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} setUsers={setData}/>

            <div className="bg-background flex-2/3 flex col overflow-hidden rounded-md border border-gray-300 shadow-sm">
                <Table className={undefined}>
                    <TableHeader className="sticky top-0 z-10 bg-background shadow-md">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className={undefined}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} className={undefined}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody className={undefined}>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"} className={undefined}                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className={undefined}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow className={undefined}>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}