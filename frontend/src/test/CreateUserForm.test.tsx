// src/test/CreateUserForm.test.tsx
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";

/**
 * ✅ Mock shadcn/Radix Select to a simple, test-friendly version.
 * Reason: Radix Select can be flaky in jsdom; we want to unit-test OUR form logic,
 * not Radix internals.
 *
 * This mock keeps the same public component API your CreateUserForm uses:
 * Select, SelectTrigger, SelectValue, SelectContent, SelectItem
 */
vi.mock("@/components/ui/select", () => {
    // const React = require("react");

    const Ctx = React.createContext<{
        value: string;
        onValueChange: (v: string) => void;
        open: boolean;
        setOpen: (v: boolean) => void;
        disabled?: boolean;
    } | null>(null);

    function Select({ value, onValueChange, disabled, children }: any) {
        const [open, setOpen] = React.useState(false);
        return (
            <Ctx.Provider value={{ value, onValueChange, open, setOpen, disabled }}>
                <div data-testid="select-root">{children}</div>
            </Ctx.Provider>
        );
    }

    function SelectTrigger({ children, ...props }: any) {
        const ctx = React.useContext(Ctx)!;
        const label = props["aria-label"] || "Role";
        return (
            <button
                type="button"
                aria-label={label}
                disabled={!!ctx.disabled}
                onClick={() => ctx.setOpen(!ctx.open)}
            >
                {children}
            </button>
        );
    }

    function SelectValue({ placeholder }: any) {
        const ctx = React.useContext(Ctx)!;
        return <span>{ctx.value ? ctx.value : placeholder}</span>;
    }

    function SelectContent({ children }: any) {
        const ctx = React.useContext(Ctx)!;
        if (!ctx.open) return null;
        return <div data-testid="select-content">{children}</div>;
    }

    function SelectItem({ value, children }: any) {
        const ctx = React.useContext(Ctx)!;
        return (
            <button
                type="button"
                onClick={() => {
                    ctx.onValueChange(value);
                    ctx.setOpen(false);
                }}
            >
                {children}
            </button>
        );
    }

    return {
        Select,
        SelectTrigger,
        SelectValue,
        SelectContent,
        SelectItem,
    };
});

// ✅ Mock axios
vi.mock("axios", () => {
    return {
        default: {
            post: vi.fn(),
            get: vi.fn(),
        },
    };
});

const mockedAxios = axios as unknown as {
    post: ReturnType<typeof vi.fn>;
    get: ReturnType<typeof vi.fn>;
};

// IMPORTANT: import AFTER mocks
import CreateUserForm from "@/components/data-table/CreateUserForm"; // <-- adjust path if needed

type User = {
    id: number;
    username: string;
    email: string;
    role: string;
};

describe("CreateUserForm", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(window, "alert").mockImplementation(() => {});
    });

    function renderOpenForm(overrides?: Partial<React.ComponentProps<typeof CreateUserForm>>) {
        const setIsDialogOpen = vi.fn();
        const setUsers = vi.fn();

        render(
            <CreateUserForm
                isDialogOpen={true}
                setIsDialogOpen={setIsDialogOpen}
                setUsers={setUsers}
                {...overrides}
            />
        );

        return { setIsDialogOpen, setUsers };
    }

    it("renders dialog content when open", () => {
        renderOpenForm();

        expect(screen.getByText(/create new user/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByText(/^role$/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
    });

    it("submits form successfully, refreshes users, closes dialog", async () => {
        const user = userEvent.setup();
        const { setIsDialogOpen, setUsers } = renderOpenForm();

        const returnedUsers: User[] = [
            { id: 1, username: "alice", email: "alice@test.com", role: "user" },
            { id: 2, username: "bob", email: "bob@test.com", role: "admin" },
        ];

        mockedAxios.post.mockResolvedValueOnce({ data: { ok: true } });
        mockedAxios.get.mockResolvedValueOnce({ data: returnedUsers });

        // Fill inputs
        await user.type(screen.getByLabelText(/username/i), "charlie");
        await user.type(screen.getByLabelText(/email/i), "charlie@test.com");
        await user.type(screen.getByLabelText(/password/i), "pass1234");

        // Select role using mocked Select (trigger is a "Role" button)
        await user.click(screen.getByRole("button", { name: /role/i }));
        await user.click(screen.getByRole("button", { name: /^admin$/i }));

        // Confirm UI changed (SelectValue now shows "admin")
        expect(screen.getByRole("button", { name: /role/i })).toHaveTextContent(/admin/i);

        // Submit
        await user.click(screen.getByRole("button", { name: /submit/i }));

        await waitFor(() => {
            expect(mockedAxios.post).toHaveBeenCalledTimes(1);
        });

        const postCall = mockedAxios.post.mock.calls[0];
        expect(String(postCall[0])).toMatch(/\/admin\/create_user$/);
        expect(postCall[1]).toEqual({
            username: "charlie",
            email: "charlie@test.com",
            role: "admin",
            password: "pass1234",
        });

        await waitFor(() => {
            expect(mockedAxios.get).toHaveBeenCalledTimes(1);
        });

        const getCall = mockedAxios.get.mock.calls[0];
        expect(String(getCall[0])).toMatch(/\/admin\/$/);

        expect(setUsers).toHaveBeenCalledWith(returnedUsers);
        expect(window.alert).toHaveBeenCalledWith("User created successfully!");
        expect(setIsDialogOpen).toHaveBeenCalledWith(false);
    });

    it("shows error alert when create fails and does NOT close dialog", async () => {
        const user = userEvent.setup();
        const { setIsDialogOpen, setUsers } = renderOpenForm();

        mockedAxios.post.mockRejectedValueOnce(new Error("boom"));

        await user.type(screen.getByLabelText(/username/i), "charlie");
        await user.type(screen.getByLabelText(/email/i), "charlie@test.com");
        await user.type(screen.getByLabelText(/password/i), "pass1234");

        await user.click(screen.getByRole("button", { name: /role/i }));
        await user.click(screen.getByRole("button", { name: /^user$/i }));

        await user.click(screen.getByRole("button", { name: /submit/i }));

        await waitFor(() => {
            expect(mockedAxios.post).toHaveBeenCalledTimes(1);
        });

        expect(mockedAxios.get).not.toHaveBeenCalled();
        expect(setUsers).not.toHaveBeenCalled();

        expect(window.alert).toHaveBeenCalledWith("Failed to create user. Please try again.");
        expect(setIsDialogOpen).not.toHaveBeenCalledWith(false);
    });

    it("cancel closes dialog", async () => {
        const user = userEvent.setup();
        const { setIsDialogOpen } = renderOpenForm();

        await user.type(screen.getByLabelText(/username/i), "temp");
        await user.click(screen.getByRole("button", { name: /cancel/i }));

        expect(setIsDialogOpen).toHaveBeenCalledWith(false);
    });
});
