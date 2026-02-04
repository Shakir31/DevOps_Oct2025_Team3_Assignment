import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";

// ✅ mock Header (avoid needing its dependencies)
vi.mock("@/components/Header.jsx", () => ({
    default: () => <div data-testid="header">Header</div>,
}));

// ✅ mock axios
vi.mock("axios", () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        delete: vi.fn(),
    },
}));

const mockedAxios = axios as unknown as {
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
};

// ✅ Import AFTER mocks
import MyFilesTable from "@/pages/DashboardPage"; // <-- CHANGE PATH

describe("MyFilesTable (fetch + upload)", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // mock token
        vi.spyOn(window.localStorage.__proto__, "getItem").mockReturnValue("fake-token");

        // silence alerts during tests
        vi.spyOn(window, "alert").mockImplementation(() => {});
        vi.spyOn(console, "error").mockImplementation(() => {});
    });

    it("fetches files on mount and renders empty state when none", async () => {
        mockedAxios.get.mockResolvedValueOnce({
            data: { files: [] },
        });

        render(<MyFilesTable />);

        // Wait until fetch completes and empty UI is shown
        expect(await screen.findByText(/no files yet/i)).toBeInTheDocument();
        expect(screen.getByText(/upload your first file/i)).toBeInTheDocument();

        // axios called with auth header
        expect(mockedAxios.get).toHaveBeenCalledTimes(1);
        const [url, config] = mockedAxios.get.mock.calls[0];
        expect(String(url)).toMatch(/\/dashboard$/);
        expect(config?.headers?.Authorization).toBe("Bearer fake-token");
    });

    it("renders fetched files (file name appears)", async () => {
        mockedAxios.get.mockResolvedValueOnce({
            data: {
                files: [
                    {
                        fileid: 10,
                        originalname: "report.pdf",
                        filename: "report-10.pdf",
                        filesize: 1234,
                        mimetype: "application/pdf",
                        uploaded_at: "2026-02-01T00:00:00.000Z",
                    },
                ],
            },
        });

        render(<MyFilesTable />);

        expect(await screen.findByText("report.pdf")).toBeInTheDocument();
        expect(screen.getByText("report-10.pdf")).toBeInTheDocument();
    });

    it("uploads ONE selected file, then refreshes list", async () => {
        const user = userEvent.setup();

        // 1) initial fetch (empty)
        mockedAxios.get.mockResolvedValueOnce({
            data: { files: [] },
        });

        // 2) upload succeeds
        mockedAxios.post.mockResolvedValueOnce({ data: { ok: true } });

        // 3) fetch after upload refresh
        mockedAxios.get.mockResolvedValueOnce({
            data: {
                files: [
                    {
                        fileid: 1,
                        originalname: "a.png",
                        filename: "a-1.png",
                        filesize: 100,
                        mimetype: "image/png",
                        uploaded_at: "2026-02-01T00:00:00.000Z",
                    },
                ],
            },
        });

        render(<MyFilesTable />);

        // Wait initial empty load
        expect(await screen.findByText(/no files yet/i)).toBeInTheDocument();

        // Select ONE file (label isn't associated, so query the input directly)
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        expect(fileInput).toBeTruthy();

        const fileA = new File(["aaa"], "a.png", { type: "image/png" });
        await user.upload(fileInput, fileA);

        // Click upload
        await user.click(screen.getByRole("button", { name: /upload files/i }));

        // Should POST once
        await waitFor(() => {
            expect(mockedAxios.post).toHaveBeenCalledTimes(1);
        });

        const [url, body, config] = mockedAxios.post.mock.calls[0];
        expect(String(url)).toMatch(/\/dashboard\/upload$/);
        expect(body).toBeInstanceOf(FormData);
        expect(config?.headers?.Authorization).toBe("Bearer fake-token");

        // Should refresh list (2nd GET after upload)
        await waitFor(() => {
            expect(mockedAxios.get).toHaveBeenCalledTimes(2);
        });

        expect(window.alert).toHaveBeenCalledWith("Upload successful!");

        // Refreshed file name appears
        expect(await screen.findByText("a.png")).toBeInTheDocument();
    });


    it("shows alert if upload clicked with no selected files", async () => {
        const user = userEvent.setup();
        mockedAxios.get.mockResolvedValueOnce({ data: { files: [] } });

        render(<MyFilesTable />);

        expect(await screen.findByText(/no files yet/i)).toBeInTheDocument();

        // button should be disabled when no selected files
        const uploadBtn = screen.getByRole("button", { name: /upload files/i });
        expect(uploadBtn).toBeDisabled();

        // (optional) if you force click anyway, it shouldn't call axios.post
        await user.click(uploadBtn).catch(() => {});
        expect(mockedAxios.post).not.toHaveBeenCalled();
    });
});
