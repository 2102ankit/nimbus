import React from "react";
import DataGrid from "@/components/DataGrid/DataGrid";
import { generateData } from "@/data";

export default function App() {
  const data = generateData(50);

  const columns = [
    { header: "ID", accessorKey: "id" },
    { header: "Name", accessorKey: "name", enableColumnFilter: true },
    { header: "Email", accessorKey: "email", enableColumnFilter: true },
    {
      header: "Role",
      accessorKey: "role",
      enableColumnFilter: true,
      filterVariant: "select",
      options: ["Admin", "User", "Manager", "Editor"],
    },
    {
      header: "Status",
      accessorKey: "status",
      enableColumnFilter: true,
      filterVariant: "select",
      options: ["Active", "Inactive", "Pending"],
    },
    { header: "Age", accessorKey: "age", enableColumnFilter: true },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 p-6 transition-colors">
      <h1 className="text-2xl font-bold mb-4 text-center text-neutral-900 dark:text-neutral-100">
        Advanced DataGrid
      </h1>
      <DataGrid data={data} columns={columns} />
    </div>
  );
}
