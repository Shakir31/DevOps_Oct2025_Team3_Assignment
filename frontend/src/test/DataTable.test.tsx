import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table/data-table"

// ✅ Mock CreateUserForm so DataTable tests don't depend on dialog internals
vi.mock("./CreateUserForm", () => {
    return {
        default: ({ isDialogOpen }: { isDialogOpen: boolean }) =>
            isDialogOpen ? <div role="dialog">CreateUserForm Dialog</div> : null,
    };
});

type User = {
    id: number;
    email: string;
};

// ✅ Minimal columns for this component to work
const columns: ColumnDef<User, any>[] = [
    {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => row.getValue("email"),
    },
];

const sampleData: User[] = [
    { id: 1, email: "alice@test.com" },
    { id: 2, email: "bob@test.com" },
];

describe("DataTable", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders rows", () => {
        const setData = vi.fn();

        render(<DataTable<User> columns={columns} data={sampleData} setData={setData} />);

        expect(screen.getByText("alice@test.com")).toBeInTheDocument();
        expect(screen.getByText("bob@test.com")).toBeInTheDocument();
    });

    it("filters rows by email search", async () => {
        const user = userEvent.setup();
        const setData = vi.fn();

        render(<DataTable<User> columns={columns} data={sampleData} setData={setData} />);

        const input = screen.getByPlaceholderText(/search email/i);
        await user.type(input, "alice");

        expect(screen.getByText("alice@test.com")).toBeInTheDocument();
        expect(screen.queryByText("bob@test.com")).not.toBeInTheDocument();
    });

    it('shows "No results." when filter matches nothing', async () => {
        const user = userEvent.setup();
        const setData = vi.fn();

        render(<DataTable<User> columns={columns} data={sampleData} setData={setData} />);

        await user.type(screen.getByPlaceholderText(/search email/i), "zzz");

        expect(screen.getByText(/no results\./i)).toBeInTheDocument();
        expect(screen.queryByText("alice@test.com")).not.toBeInTheDocument();
        expect(screen.queryByText("bob@test.com")).not.toBeInTheDocument();
    });

    it("opens CreateUserForm dialog when Create User is clicked", async () => {
        const user = userEvent.setup();
        const setData = vi.fn();

        render(<DataTable<User> columns={columns} data={sampleData} setData={setData} />);

        await user.click(screen.getByRole("button", { name: /create user/i }));

        // because we mocked CreateUserForm to render role="dialog" when open
        expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
});
