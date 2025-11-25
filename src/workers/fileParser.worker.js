/* eslint-disable no-restricted-globals */
import Papa from "papaparse";
import * as XLSX from "xlsx";

self.onmessage = async (e) => {
    const { file, type } = e.data;

    try {
        let data;
        if (type === "csv") {
            data = await parseCSV(file);
        } else if (type === "json") {
            data = await parseJSON(file);
        } else {
            data = await parseExcel(file);
        }
        self.postMessage({ type: "success", data, fileName: file.name });
    } catch (error) {
        self.postMessage({ type: "error", error: error.message });
    }
};

const parseCSV = (file) => {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            dynamicTyping: false,
            skipEmptyLines: true,
            transformHeader: (h) => h.trim(),
            complete: (results) => {
                const processed = results.data.map(row => {
                    const newRow = {};
                    for (const [key, value] of Object.entries(row)) {
                        if (typeof value === 'string') {
                            const trimmed = value.trim();
                            if (/^(\+?\d{1,3}[\s-]?)?\d{10,}$/.test(trimmed)) {
                                newRow[key] = trimmed;
                            } else if (/^\d{16,}$/.test(trimmed)) {
                                newRow[key] = trimmed;
                            } else if (/^-?\d+\.?\d*$/.test(trimmed) && trimmed.length < 16) {
                                const num = parseFloat(trimmed);
                                newRow[key] = isNaN(num) ? value : num;
                            } else {
                                newRow[key] = value;
                            }
                        } else {
                            newRow[key] = value;
                        }
                    }
                    return newRow;
                });
                resolve(processed);
            },
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
                const workbook = XLSX.read(data, {
                    type: "array",
                    cellText: false,
                    cellDates: false,
                    raw: false,
                });
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                if (!sheet) throw new Error("Empty workbook");

                const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
                const headers = [];
                for (let C = range.s.c; C <= range.e.c; ++C) {
                    const address = XLSX.utils.encode_cell({ r: range.s.r, c: C });
                    const cell = sheet[address];
                    headers[C] = cell ? String(cell.v) : `Column${C}`;
                }

                const rows = [];
                for (let R = range.s.r + 1; R <= range.e.r; ++R) {
                    const row = {};
                    for (let C = range.s.c; C <= range.e.c; ++C) {
                        const address = XLSX.utils.encode_cell({ r: R, c: C });
                        const cell = sheet[address];
                        const header = headers[C];

                        if (!cell) {
                            row[header] = null;
                            continue;
                        }

                        if (cell.t === 'n') {
                            if (Math.abs(cell.v) >= 1e15) {
                                row[header] = cell.w || String(Math.round(cell.v));
                            } else {
                                row[header] = cell.v;
                            }
                        } else if (cell.t === 's') {
                            const strVal = String(cell.v).trim();
                            if (/^(\+?\d{1,3}[\s-]?)?\d{10,}$/.test(strVal)) {
                                row[header] = strVal;
                            } else {
                                row[header] = cell.v;
                            }
                        } else {
                            row[header] = cell.w || cell.v;
                        }
                    }
                    if (Object.values(row).some(v => v !== null && v !== undefined && v !== '')) {
                        rows.push(row);
                    }
                }
                resolve(rows);
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
                if (Array.isArray(parsed)) {
                    resolve(parsed);
                } else if (parsed.data && Array.isArray(parsed.data)) {
                    resolve(parsed.data);
                } else if (typeof parsed === 'object') {
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
