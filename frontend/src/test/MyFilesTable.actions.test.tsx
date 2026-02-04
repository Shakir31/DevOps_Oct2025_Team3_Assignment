// src/test/MyFilesTable.actions.test.tsx
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";

// ✅ Mock Header so the test doesn't depend on it
vi.mock("@/components/Header.jsx", () => ({
    default: () => <div data-testid="header">Header</div>,
}));

// ✅ Mock axios
vi.mock("axios", () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        delete: vi.fn(),
    },
}));

const mockedAxios = axios as unknown as {
    get: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
};

// ✅ Import AFTER mocks
import MyFilesTable from "@/pages/DashboardPage"; // <-- CHANGE PATH if needed

describe("MyFilesTable (download + delete)", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(window.localStorage.__proto__, "getItem").mockReturnValue("fake-token");
        vi.spyOn(window, "alert").mockImplementation(() => {});
        vi.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    function mockDownloadPlumbing() {
        // Mock URL blob helpers
        const createObjectURL = vi.fn(() => "blob:mock-url");
        const revokeObjectURL = vi.fn();

        // @ts-expect-error
        global.URL.createObjectURL = createObjectURL;
        // @ts-expect-error
        global.URL.revokeObjectURL = revokeObjectURL;

        // Prepare a fake <a> element
        const click = vi.fn();
        const anchor = {
            href: "",
            download: "",
            click,
        } as unknown as HTMLAnchorElement;

        // ✅ Prevent recursion: keep real createElement
        const realCreateElement = document.createElement.bind(document);

        const createElementSpy = vi
            .spyOn(document, "createElement")
            .mockImplementation((tagName: any) => {
                if (String(tagName).toLowerCase() === "a") return anchor as any;
                return realCreateElement(tagName);
            });

        return { createObjectURL, revokeObjectURL, click, anchor, createElementSpy };
    }

    it("downloads file (calls axios.get blob, creates link, clicks)", async () => {
        const user = userEvent.setup();

        // 1) initial fetch
        mockedAxios.get.mockResolvedValueOnce({
            data: {
                files: [
                    {
                        fileid: 5,
                        originalname: "hello.pdf",
                        filename: "hello-5.pdf",
                        filesize: 1000,
                        mimetype: "application/pdf",
                        uploaded_at: "2026-02-01T00:00:00.000Z",
                    },
                ],
            },
        });

        // 2) download endpoint returns blob
        mockedAxios.get.mockResolvedValueOnce({
            data: new Blob(["PDFDATA"], { type: "application/pdf" }),
        });

        const { createObjectURL, revokeObjectURL, click, anchor } = mockDownloadPlumbing();

        render(<MyFilesTable />);

        expect(await screen.findByText("hello.pdf")).toBeInTheDocument();

        // ✅ Click the specific download button using your aria-label
        await user.click(screen.getByRole("button", { name: /download hello\.pdf/i }));

        await waitFor(() => {
            expect(mockedAxios.get).toHaveBeenCalledTimes(2);
        });

        const secondCall = mockedAxios.get.mock.calls[1];
        expect(String(secondCall[0])).toMatch(/\/dashboard\/download\/5$/);

        // config check
        expect(secondCall[1]?.responseType).toBe("blob");
        expect(secondCall[1]?.headers?.Authorization).toBe("Bearer fake-token");

        // blob plumbing check
        expect(createObjectURL).toHaveBeenCalledTimes(1);
        expect(anchor.download).toBe("hello.pdf");
        expect(click).toHaveBeenCalledTimes(1);
        expect(revokeObjectURL).toHaveBeenCalledTimes(1);
    });

    it("does NOT delete when confirm is false", async () => {
        const user = userEvent.setup();

        mockedAxios.get.mockResolvedValueOnce({
            data: {
                files: [
                    {
                        fileid: 7,
                        originalname: "keep.txt",
                        filename: "keep-7.txt",
                        filesize: 10,
                        mimetype: "text/plain",
                        uploaded_at: "2026-02-01T00:00:00.000Z",
                    },
                ],
            },
        });

        vi.spyOn(window, "confirm").mockReturnValue(false);

        render(<MyFilesTable />);

        expect(await screen.findByText("keep.txt")).toBeInTheDocument();

        // ✅ Click the specific delete button using your aria-label
        await user.click(screen.getByRole("button", { name: /delete keep\.txt/i }));

        expect(mockedAxios.delete).not.toHaveBeenCalled();
        expect(screen.getByText("keep.txt")).toBeInTheDocument();
    });

    it("deletes file when confirm is true and removes row", async () => {
        const user = userEvent.setup();

        mockedAxios.get.mockResolvedValueOnce({
            data: {
                files: [
                    {
                        fileid: 9,
                        originalname: "remove.zip",
                        filename: "remove-9.zip",
                        filesize: 999,
                        mimetype: "application/zip",
                        uploaded_at: "2026-02-01T00:00:00.000Z",
                    },
                ],
            },
        });

        vi.spyOn(window, "confirm").mockReturnValue(true);
        mockedAxios.delete.mockResolvedValueOnce({ data: { ok: true } });

        render(<MyFilesTable />);

        expect(await screen.findByText("remove.zip")).toBeInTheDocument();

        // ✅ Click the specific delete button using your aria-label
        await user.click(screen.getByRole("button", { name: /delete remove\.zip/i }));

        await waitFor(() => {
            expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
        });

        const [url, config] = mockedAxios.delete.mock.calls[0];
        expect(String(url)).toMatch(/\/dashboard\/delete\/9$/);
        expect(config?.headers?.Authorization).toBe("Bearer fake-token");

        await waitFor(() => {
            expect(screen.queryByText("remove.zip")).not.toBeInTheDocument();
        });
    });
});
