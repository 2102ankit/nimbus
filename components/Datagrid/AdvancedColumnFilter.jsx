import { Filter, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "../ui/dropdown-menu";
import { Input } from "../ui/input";

// Filter operators by data type
const TEXT_OPERATORS = [
  { value: "contains", label: "Contains" },
  { value: "notContains", label: "Does not contain" },
  { value: "equals", label: "Equals" },
  { value: "notEquals", label: "Does not equal" },
  { value: "startsWith", label: "Starts with" },
  { value: "endsWith", label: "Ends with" },
  { value: "isEmpty", label: "Is empty" },
  { value: "isNotEmpty", label: "Is not empty" },
];

const NUMBER_OPERATORS = [
  { value: "equals", label: "Equals" },
  { value: "notEquals", label: "Does not equal" },
  { value: "greaterThan", label: "Greater than" },
  { value: "greaterThanOrEqual", label: "Greater than or equal" },
  { value: "lessThan", label: "Less than" },
  { value: "lessThanOrEqual", label: "Less than or equal" },
  { value: "between", label: "Between" },
  { value: "isEmpty", label: "Is empty" },
  { value: "isNotEmpty", label: "Is not empty" },
];

const DATE_OPERATORS = [
  { value: "equals", label: "Equals" },
  { value: "notEquals", label: "Does not equal" },
  { value: "before", label: "Before" },
  { value: "after", label: "After" },
  { value: "between", label: "Between" },
  { value: "isEmpty", label: "Is empty" },
  { value: "isNotEmpty", label: "Is not empty" },
];

// Filter function implementations
export const filterFunctions = {
  text: {
    contains: (value, filterValue) =>
      String(value).toLowerCase().includes(String(filterValue).toLowerCase()),
    notContains: (value, filterValue) =>
      !String(value).toLowerCase().includes(String(filterValue).toLowerCase()),
    equals: (value, filterValue) =>
      String(value).toLowerCase() === String(filterValue).toLowerCase(),
    notEquals: (value, filterValue) =>
      String(value).toLowerCase() !== String(filterValue).toLowerCase(),
    startsWith: (value, filterValue) =>
      String(value).toLowerCase().startsWith(String(filterValue).toLowerCase()),
    endsWith: (value, filterValue) =>
      String(value).toLowerCase().endsWith(String(filterValue).toLowerCase()),
    isEmpty: (value) => !value || String(value).trim() === "",
    isNotEmpty: (value) => value && String(value).trim() !== "",
  },
  number: {
    equals: (value, filterValue) => Number(value) === Number(filterValue),
    notEquals: (value, filterValue) => Number(value) !== Number(filterValue),
    greaterThan: (value, filterValue) => Number(value) > Number(filterValue),
    greaterThanOrEqual: (value, filterValue) =>
      Number(value) >= Number(filterValue),
    lessThan: (value, filterValue) => Number(value) < Number(filterValue),
    lessThanOrEqual: (value, filterValue) =>
      Number(value) <= Number(filterValue),
    between: (value, filterValue) => {
      const num = Number(value);
      return num >= Number(filterValue.min) && num <= Number(filterValue.max);
    },
    isEmpty: (value) => value === null || value === undefined || value === "",
    isNotEmpty: (value) =>
      value !== null && value !== undefined && value !== "",
  },
  date: {
    equals: (value, filterValue) =>
      new Date(value).toDateString() === new Date(filterValue).toDateString(),
    notEquals: (value, filterValue) =>
      new Date(value).toDateString() !== new Date(filterValue).toDateString(),
    before: (value, filterValue) => new Date(value) < new Date(filterValue),
    after: (value, filterValue) => new Date(value) > new Date(filterValue),
    between: (value, filterValue) => {
      const date = new Date(value);
      return (
        date >= new Date(filterValue.from) && date <= new Date(filterValue.to)
      );
    },
    isEmpty: (value) => !value,
    isNotEmpty: (value) => !!value,
  },
};

export function AdvancedColumnFilter({ column, dataType = "text" }) {
  const [operator, setOperator] = useState("contains");
  const [value, setValue] = useState("");
  const [value2, setValue2] = useState(""); // For "between" operator
  const [isOpen, setIsOpen] = useState(false);

  const operators =
    dataType === "number"
      ? NUMBER_OPERATORS
      : dataType === "date"
      ? DATE_OPERATORS
      : TEXT_OPERATORS;

  useEffect(() => {
    const currentFilter = column.getFilterValue();
    if (currentFilter) {
      setOperator(currentFilter.operator || "contains");
      if (currentFilter.value !== undefined) {
        if (typeof currentFilter.value === "object") {
          setValue(currentFilter.value.min || currentFilter.value.from || "");
          setValue2(currentFilter.value.max || currentFilter.value.to || "");
        } else {
          setValue(currentFilter.value);
        }
      }
    }
  }, [column]);

  const applyFilter = () => {
    if (operator === "isEmpty" || operator === "isNotEmpty") {
      column.setFilterValue({ operator, value: null });
    } else if (operator === "between") {
      if (dataType === "number") {
        column.setFilterValue({
          operator,
          value: { min: value, max: value2 },
        });
      } else if (dataType === "date") {
        column.setFilterValue({
          operator,
          value: { from: value, to: value2 },
        });
      }
    } else {
      column.setFilterValue({ operator, value });
    }
    setIsOpen(false);
  };

  const clearFilter = () => {
    column.setFilterValue(undefined);
    setValue("");
    setValue2("");
    setOperator(dataType === "text" ? "contains" : "equals");
    setIsOpen(false);
  };

  const hasFilter = column.getFilterValue() !== undefined;
  const needsSecondInput = operator === "between";
  const needsNoInput = operator === "isEmpty" || operator === "isNotEmpty";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={hasFilter ? "default" : "ghost"}
          size="sm"
          className={`h-7 w-7 p-0 ${
            hasFilter ? "bg-blue-600 hover:bg-blue-700" : ""
          }`}
        >
          <Filter className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        <div className="p-2 space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Operator
            </label>
            <select
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
              className="mt-1 w-full h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-sm dark:border-slate-700 dark:bg-slate-950"
            >
              {operators.map((op) => (
                <option key={op.value} value={op.value}>
                  {op.label}
                </option>
              ))}
            </select>
          </div>

          {!needsNoInput && (
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                {needsSecondInput
                  ? dataType === "date"
                    ? "From"
                    : "Min"
                  : "Value"}
              </label>
              <Input
                type={
                  dataType === "date"
                    ? "date"
                    : dataType === "number"
                    ? "number"
                    : "text"
                }
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={`Enter ${
                  dataType === "date"
                    ? "date"
                    : dataType === "number"
                    ? "number"
                    : "text"
                }...`}
                className="mt-1"
              />
            </div>
          )}

          {needsSecondInput && (
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                {dataType === "date" ? "To" : "Max"}
              </label>
              <Input
                type={dataType === "date" ? "date" : "number"}
                value={value2}
                onChange={(e) => setValue2(e.target.value)}
                placeholder={`Enter ${
                  dataType === "date" ? "date" : "number"
                }...`}
                className="mt-1"
              />
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={applyFilter}
              size="sm"
              className="flex-1"
              disabled={!needsNoInput && !value}
            >
              Apply
            </Button>
            <Button
              onClick={clearFilter}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              Clear
            </Button>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Active filters display component
export function ActiveFilters({ table, columns }) {
  const columnFilters = table.getState().columnFilters;

  if (columnFilters.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 px-4 pb-3">
      <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center">
        Active filters:
      </span>
      <AnimatePresence>
        {columnFilters.map((filter) => {
          const column = columns.find((c) => c.id === filter.id);
          const filterValue = filter.value;

          let displayValue = "";
          if (
            filterValue.operator === "isEmpty" ||
            filterValue.operator === "isNotEmpty"
          ) {
            displayValue =
              filterValue.operator === "isEmpty" ? "is empty" : "is not empty";
          } else if (filterValue.operator === "between") {
            if (filterValue.value?.min && filterValue.value?.max) {
              displayValue = `${filterValue.value.min} - ${filterValue.value.max}`;
            } else if (filterValue.value?.from && filterValue.value?.to) {
              displayValue = `${filterValue.value.from} - ${filterValue.value.to}`;
            }
          } else {
            displayValue = `${filterValue.operator}: ${filterValue.value}`;
          }

          return (
            <motion.div
              key={filter.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded-full text-xs font-medium"
            >
              <span className="font-semibold">
                {column?.header || filter.id}:
              </span>
              <span className="max-w-[150px] truncate">{displayValue}</span>
              <button
                onClick={() =>
                  table.getColumn(filter.id)?.setFilterValue(undefined)
                }
                className="ml-1 hover:text-blue-900 dark:hover:text-blue-100"
              >
                <X className="h-3 w-3" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export default AdvancedColumnFilter;
