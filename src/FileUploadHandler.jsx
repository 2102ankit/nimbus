import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Upload, X } from "lucide-react";
import { motion } from "motion/react";
import Papa from "papaparse";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import * as XLSX from "xlsx";

export function FileUploadHandler({ onDataLoaded, onClose }) {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const onDrop = useCallback((acceptedFiles) => {
        const selectedFile = acceptedFiles[0];
        if (selectedFile) {
            const ext = selectedFile.name.split(".").pop()?.toLowerCase();
            if (["csv", "xlsx", "xls", "json"].includes(ext || "")) {
                setFile(selectedFile);
            } else {
                alert("Please upload a CSV, Excel, or JSON file (.csv, .xlsx, .xls, .json)");
            }
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "text/csv": [".csv"],
            "application/vnd.ms-excel": [".xls"],
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
            "application/json": [".json"],
        },
        maxFiles: 1,
    });

    const removeFile = () => setFile(null);

    const parseCSV = (file) => {
        return new Promise((resolve, reject) => {
            Papa.parse(file, {
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true,
                transformHeader: (h) => h.trim(),
                complete: (results) => resolve(results.data),
                error: (err) => reject(err),
            });
        });
    };

    const parseExcel = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const result = e.target?.result;
                    if (!result) throw new Error("No data");

                    const data = new Uint8Array(result);
                    const workbook = XLSX.read(data, { type: "array" });
                    const sheet = workbook.Sheets[workbook.SheetNames[0]];

                    if (!sheet) throw new Error("Empty workbook");

                    const json = XLSX.utils.sheet_to_json(sheet, {
                        raw: false,
                        defval: null,
                    });
                    resolve(json);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = () => reject(new Error("File reading failed"));
            reader.readAsArrayBuffer(file);
        });
    };

    const parseJSON = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const result = e.target?.result;
                    if (!result) throw new Error("No data");

                    const parsed = JSON.parse(result);

                    // Handle if it's an array of objects
                    if (Array.isArray(parsed)) {
                        resolve(parsed);
                    }
                    // Handle if it's a single object with data array
                    else if (parsed.data && Array.isArray(parsed.data)) {
                        resolve(parsed.data);
                    }
                    // Handle if it's an object with other structure
                    else if (typeof parsed === 'object') {
                        resolve([parsed]);
                    } else {
                        throw new Error("JSON must be an array of objects or contain a 'data' array");
                    }
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = () => reject(new Error("File reading failed"));
            reader.readAsText(file);
        });
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        try {
            const ext = file.name.split(".").pop()?.toLowerCase();
            let data;

            if (ext === "csv") {
                data = await parseCSV(file);
            } else if (ext === "json") {
                data = await parseJSON(file);
            } else {
                data = await parseExcel(file);
            }

            onDataLoaded(data);
        } catch (error) {
            console.error("Parse error:", error);
            alert("Failed to parse file. Please ensure it's a valid CSV/Excel/JSON file.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-card rounded-xl shadow-2xl p-6 max-w-lg w-full border"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-Bold text-foreground">Upload Data File</h2>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Dropzone Area */}
                <div
                    {...getRootProps()}
                    className={`
                        border-2 border-dashed rounded-xl p-10 text-center cursor-pointer
                        transition-all duration-200
                        ${isDragActive
                            ? "border-primary bg-primary/5 scale-[1.02]"
                            : "border-muted-foreground/30 hover:border-primary/50"
                        }
                    `}
                >
                    <input {...getInputProps()} />

                    {!file ? (
                        <div className="space-y-4">
                            <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                            <div>
                                <p className="text-lg font-medium text-foreground">
                                    {isDragActive ? "Drop your file here" : "Drag & drop your file here"}
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    or <span className="text-primary underline">click to browse</span>
                                </p>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Supported: CSV, XLSX, XLS, JSON
                            </p>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <FileSpreadsheet className="h-10 w-10 text-primary" />
                                <div className="text-left">
                                    <p className="font-medium text-foreground truncate max-w-[200px]">
                                        {file.name}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {((file.size || 0) / 1024).toFixed(1)} KB
                                    </p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={(e) => {
                                e.stopPropagation();
                                removeFile();
                            }}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                {file && (
                    <div className="flex gap-3 mt-6">
                        <Button onClick={handleUpload} disabled={uploading} className="flex-1">
                            {uploading ? (
                                <>Processing...</>
                            ) : (
                                <>
                                    <Upload className="h-4 w-4 mr-2" />
                                    Upload & Analyze
                                </>
                            )}
                        </Button>
                        <Button variant="outline" onClick={onClose} disabled={uploading}>
                            Cancel
                        </Button>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}

export default FileUploadHandler;