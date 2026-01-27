import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "@/components/Header.jsx";
import { Upload, Download, Trash2, File, FileText, Image as ImageIcon, Music, Video, Archive } from "lucide-react";

const API = import.meta.env.VITE_API_URL;

export default function MyFilesTable() {
    const [files, setFiles] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const token = localStorage.getItem("accessToken");

    const headers = {
        Authorization: `Bearer ${token}`,
    };

    const fetchFiles = async () => {
        const res = await axios.get(`${API}/dashboard`, { headers });
        setFiles(res.data.files || []);
    };

    useEffect(() => {
        fetchFiles();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleFileChange = (e) => {
        setSelectedFiles(Array.from(e.target.files || []));
    };

    const handleUpload = async () => {
        if (!selectedFiles.length) return alert("Please select at least 1 file.");

        setIsUploading(true);
        try {
            // since backend is upload.single("file"), upload each file in a loop
            for (const f of selectedFiles) {
                const formData = new FormData();
                formData.append("file", f);

                await axios.post(`${API}/dashboard/upload`, formData, {
                    headers, // DON'T set Content-Type manually
                });
            }

            alert("Upload successful!");
            setSelectedFiles([]);
            // Reset file input
            const fileInput = document.querySelector('input[type="file"]');
            if (fileInput) fileInput.value = '';
            await fetchFiles(); // refresh list
        } catch (err) {
            console.error(err.response || err);
            alert("Upload failed.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDownload = async (fileid, originalname) => {
        const res = await axios.get(`${API}/dashboard/download/${fileid}`, {
            headers,
            responseType: "blob",
        });

        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement("a");
        link.href = url;
        link.download = originalname || "download";
        link.click();
        window.URL.revokeObjectURL(url);
    };

    const handleDelete = async (fileid) => {
        if (!confirm("Are you sure you want to delete this file?")) return;

        try {
            await axios.delete(`${API}/dashboard/delete/${fileid}`, { headers });
            setFiles((prev) => prev.filter((f) => f.fileid !== fileid));
        } catch (err) {
            console.error(err.response || err);
            alert("Failed to delete file");
        }
    };

    const formatBytes = (bytes) => {
        if (!bytes && bytes !== 0) return "-";
        const units = ["B", "KB", "MB", "GB"];
        let i = 0;
        let n = bytes;
        while (n >= 1024 && i < units.length - 1) {
            n /= 1024;
            i++;
        }
        return `${n.toFixed(i === 0 ? 0 : 2)} ${units[i]}`;
    };

    const getFileIcon = (mimetype) => {
        if (!mimetype) return <File className="w-5 h-5 text-gray-400" />;

        if (mimetype.startsWith('image/')) return <ImageIcon className="w-5 h-5 text-blue-500" />;
        if (mimetype.startsWith('video/')) return <Video className="w-5 h-5 text-purple-500" />;
        if (mimetype.startsWith('audio/')) return <Music className="w-5 h-5 text-pink-500" />;
        if (mimetype.includes('pdf') || mimetype.includes('document') || mimetype.includes('text'))
            return <FileText className="w-5 h-5 text-orange-500" />;
        if (mimetype.includes('zip') || mimetype.includes('compressed'))
            return <Archive className="w-5 h-5 text-yellow-500" />;

        return <File className="w-5 h-5 text-gray-400" />;
    };

    const getFileTypeLabel = (mimetype) => {
        if (!mimetype) return "Unknown";

        const parts = mimetype.split('/');
        if (parts.length === 2) {
            const type = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
            const subtype = parts[1].toUpperCase();
            return `${type} (${subtype})`;
        }
        return mimetype;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <Header />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">My Files</h1>
                    <p className="text-gray-600">Manage and organize your uploaded documents</p>
                </div>

                {/* Upload Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Files to Upload
                            </label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="file"
                                    multiple
                                    onChange={handleFileChange}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer cursor-pointer"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleUpload}
                            disabled={isUploading || selectedFiles.length === 0}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-sm"
                        >
                            <Upload className="w-4 h-4" />
                            {isUploading ? "Uploading..." : "Upload Files"}
                        </button>
                    </div>
                </div>

                {/* Stats Card */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Files</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{files.length}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <File className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Size</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {formatBytes(files.reduce((acc, f) => acc + (f.filesize || 0), 0))}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <Archive className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">File Types</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {new Set(files.map(f => f.mimetype?.split('/')[0])).size}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <FileText className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Files Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    File Name
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Type
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Size
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Uploaded
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                            </thead>

                            <tbody className="bg-white divide-y divide-gray-200">
                            {files.map((f) => (
                                <tr key={f.fileid} className="hover:bg-gray-50 transition-colors duration-150">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {getFileIcon(f.mimetype)}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {f.originalname}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate mt-0.5">
                                                    {f.filename}
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                {getFileTypeLabel(f.mimetype)}
                                            </span>
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                                        {formatBytes(f.filesize)}
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {f.uploaded_at
                                            ? new Date(f.uploaded_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })
                                            : "-"}
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleDownload(f.fileid, f.originalname)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors duration-150 text-sm font-medium"
                                                title="Download file"
                                            >
                                                <Download className="w-4 h-4" />
                                                Download
                                            </button>

                                            <button
                                                onClick={() => handleDelete(f.fileid)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 transition-colors duration-150 text-sm font-medium"
                                                title="Delete file"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {files.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                <File className="w-8 h-8 text-gray-400" />
                                            </div>
                                            <h3 className="text-sm font-medium text-gray-900 mb-1">No files yet</h3>
                                            <p className="text-sm text-gray-500">Upload your first file to get started</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}