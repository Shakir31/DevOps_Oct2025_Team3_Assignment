// src/test/DemoPage.test.tsx
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";

// ✅ Mock axios
vi.mock("axios", () => {
    return {
        default: {
            get: vi.fn(),
            delete: vi.fn(),
        },
    };
});

const mockedAxios = axios as unknown as {
    get: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
};

// ✅ Import AFTER mocks
import DemoPage from "@/components/data-table/page"; // <-- CHANGE THIS PATH

describe("DemoPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // optional: silence console noise in tests
        vi.spyOn(console, "error").mockImplementation(() => {});
    });

    it("shows loading then renders users after fetch", async () => {
        mockedAxios.get.mockResolvedValueOnce({
            data: [
                {
                    userid: 1,
                    username: "alice",
                    email: "alice@test.com",
                    role: "user",
                    created_at: "2026-01-01T00:00:00.000Z",
                },
                {
                    userid: 2,
                    username: "bob",
                    email: "bob@test.com",
                    role: "admin",
                    created_at: "2026-01-02T00:00:00.000Z",
                },
            ],
        });

        render(<DemoPage />);

        // Loading state first
        expect(screen.getByText(/loading/i)).toBeInTheDocument();

        // Then table rows appear
        expect(await screen.findByText("alice@test.com")).toBeInTheDocument();
        expect(screen.getByText("bob@test.com")).toBeInTheDocument();

        // axios.get called
        expect(mockedAxios.get).toHaveBeenCalledTimes(1);

        // Don't assert full URL strictly (env varies), just ensure endpoint path is correct
        expect(String(mockedAxios.get.mock.calls[0][0])).toMatch(/\/admin\/$/);
    });

    it("deletes a user and removes row from UI", async () => {
        const user = userEvent.setup();

        mockedAxios.get.mockResolvedValueOnce({
            data: [
                {
                    userid: 1,
                    username: "alice",
                    email: "alice@test.com",
                    role: "user",
                    created_at: "2026-01-01T00:00:00.000Z",
                },
                {
                    userid: 2,
                    username: "bob",
                    email: "bob@test.com",
                    role: "admin",
                    created_at: "2026-01-02T00:00:00.000Z",
                },
            ],
        });

        mockedAxios.delete.mockResolvedValueOnce({ data: { ok: true } });

        render(<DemoPage />);

        // wait for users loaded
        expect(await screen.findByText("alice@test.com")).toBeInTheDocument();
        expect(screen.getByText("bob@test.com")).toBeInTheDocument();

        // ✅ Click the action menu trigger for Bob
        // This depends on you adding:
        // aria-label={`More actions for ${user.email}`}
        await user.click(
            screen.getByRole("button", { name: /more actions for bob@test\.com/i })
        );

        // Click Delete
        await user.click(await screen.findByText(/^delete$/i));

        // axios.delete called with correct endpoint
        await waitFor(() => {
            expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
        });

        expect(String(mockedAxios.delete.mock.calls[0][0])).toMatch(
            /\/admin\/delete_user\/2$/
        );

        // UI updates: Bob removed
        await waitFor(() => {
            expect(screen.queryByText("bob@test.com")).not.toBeInTheDocument();
        });

        // Alice still there
        expect(screen.getByText("alice@test.com")).toBeInTheDocument();
    });

    it("handles fetch error: stops loading (and logs error)", async () => {
        mockedAxios.get.mockRejectedValueOnce(new Error("fetch failed"));

        render(<DemoPage />);

        expect(screen.getByText(/loading/i)).toBeInTheDocument();

        // After error, loading should disappear
        await waitFor(() => {
            expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
        });

        expect(console.error).toHaveBeenCalled();
    });
});
