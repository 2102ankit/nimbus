import { Button } from "@/components/ui/button";
import { getColumnConfig } from "../../src/columnConfigSystem";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

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

const BOOLEAN_OPERATORS = [
  { value: "isTrue", label: "Is True" },
  { value: "isFalse", label: "Is False" },
  { value: "isEmpty", label: "Is null" },
  { value: "isNotEmpty", label: "Is not null" },
];

// Filter function implementations - FIXED
export const filterFunctions = {
  text: {
    contains: (value, filterValue) => {
      if (!filterValue) return true;
      return String(value || "")
        .toLowerCase()
        .includes(String(filterValue).toLowerCase());
    },
    notContains: (value, filterValue) => {
      if (!filterValue) return true;
      return !String(value || "")
        .toLowerCase()
        .includes(String(filterValue).toLowerCase());
    },
    equals: (value, filterValue) => {
      if (!filterValue) return true;
      return (
        String(value || "").toLowerCase() === String(filterValue).toLowerCase()
      );
    },
    notEquals: (value, filterValue) => {
      if (!filterValue) return true;
      return (
        String(value || "").toLowerCase() !== String(filterValue).toLowerCase()
      );
    },
    startsWith: (value, filterValue) => {
      if (!filterValue) return true;
      return String(value || "")
        .toLowerCase()
        .startsWith(String(filterValue).toLowerCase());
    },
    endsWith: (value, filterValue) => {
      if (!filterValue) return true;
      return String(value || "")
        .toLowerCase()
        .endsWith(String(filterValue).toLowerCase());
    },
    isEmpty: (value) => !value || String(value).trim() === "",
    isNotEmpty: (value) => value && String(value).trim() !== "",
  },
  number: {
    equals: (value, filterValue) => {
      if (
        filterValue === "" ||
        filterValue === null ||
        filterValue === undefined
      )
        return true;
      return Number(value) === Number(filterValue);
    },
    notEquals: (value, filterValue) => {
      if (
        filterValue === "" ||
        filterValue === null ||
        filterValue === undefined
      )
        return true;
      return Number(value) !== Number(filterValue);
    },
    greaterThan: (value, filterValue) => {
      if (
        filterValue === "" ||
        filterValue === null ||
        filterValue === undefined
      )
        return true;
      return Number(value) > Number(filterValue);
    },
    greaterThanOrEqual: (value, filterValue) => {
      if (
        filterValue === "" ||
        filterValue === null ||
        filterValue === undefined
      )
        return true;
      return Number(value) >= Number(filterValue);
    },
    lessThan: (value, filterValue) => {
      if (
        filterValue === "" ||
        filterValue === null ||
        filterValue === undefined
      )
        return true;
      return Number(value) < Number(filterValue);
    },
    lessThanOrEqual: (value, filterValue) => {
      if (
        filterValue === "" ||
        filterValue === null ||
        filterValue === undefined
      )
        return true;
      return Number(value) <= Number(filterValue);
    },
    between: (value, filterValue) => {
      if (!filterValue || (!filterValue.min && !filterValue.max)) return true;
      const num = Number(value);
      const min = filterValue.min ? Number(filterValue.min) : -Infinity;
      const max = filterValue.max ? Number(filterValue.max) : Infinity;
      return num >= min && num <= max;
    },
    isEmpty: (value) => value === null || value === undefined || value === "",
    isNotEmpty: (value) =>
      value !== null && value !== undefined && value !== "",
  },
  date: {
    equals: (value, filterValue) => {
      if (!filterValue) return true;
      return (
        new Date(value).toDateString() === new Date(filterValue).toDateString()
      );
    },
    notEquals: (value, filterValue) => {
      if (!filterValue) return true;
      return (
        new Date(value).toDateString() !== new Date(filterValue).toDateString()
      );
    },
    before: (value, filterValue) => {
      if (!filterValue) return true;
      return new Date(value) < new Date(filterValue);
    },
    after: (value, filterValue) => {
      if (!filterValue) return true;
      return new Date(value) > new Date(filterValue);
    },
    between: (value, filterValue) => {
      if (!filterValue || (!filterValue.from && !filterValue.to)) return true;
      const date = new Date(value);
      const from = filterValue.from
        ? new Date(filterValue.from)
        : new Date(-8640000000000000);
      const to = filterValue.to
        ? new Date(filterValue.to)
        : new Date(8640000000000000);
      return date >= from && date <= to;
    },
    isEmpty: (value) => !value,
    isNotEmpty: (value) => !!value,
  },
};

export function AdvancedColumnFilter({ column, dataType: propDataType = "text" }) {
  // Check if user has overridden the data type in column config
  const columnConfig = getColumnConfig(column.id);
  const dataType = columnConfig?.dataType || propDataType;
  const [operator, setOperator] = useState(
    dataType === "text" ? "contains" : "equals"
  );
  const [value, setValue] = useState("");
  const [value2, setValue2] = useState("");

  const operators =
    dataType === "number"
      ? NUMBER_OPERATORS
      : dataType === "date"
        ? DATE_OPERATORS
        : dataType === "boolean"
          ? BOOLEAN_OPERATORS
          : TEXT_OPERATORS;

  useEffect(() => {
    const currentFilter = column.getFilterValue();
    if (currentFilter) {
      setOperator(
        currentFilter.operator || (dataType === "text" ? "contains" : "equals")
      );
      if (currentFilter.value !== undefined && currentFilter.value !== null) {
        if (typeof currentFilter.value === "object") {
          setValue(currentFilter.value.min || currentFilter.value.from || "");
          setValue2(currentFilter.value.max || currentFilter.value.to || "");
        } else {
          setValue(currentFilter.value);
        }
      }
    }
  }, [column, dataType]);

  const applyFilter = () => {
    if (operator === "isEmpty" || operator === "isNotEmpty") {
      column.setFilterValue({ operator, value: null, dataType });
    } else if (operator === "between") {
      if (dataType === "number") {
        column.setFilterValue({
          operator,
          value: { min: value, max: value2 },
          dataType,
        });
      } else if (dataType === "date") {
        column.setFilterValue({
          operator,
          value: { from: value, to: value2 },
          dataType,
        });
      }
    } else {
      column.setFilterValue({ operator, value, dataType });
    }
  };

  const clearFilter = () => {
    column.setFilterValue(undefined);
    setValue("");
    setValue2("");
    setOperator(dataType === "text" ? "contains" : "equals");
  };

  const hasFilter = column.getFilterValue() !== undefined;
  const needsSecondInput = operator === "between";
  const needsNoInput = operator === "isEmpty" || operator === "isNotEmpty" || operator === "isTrue" || operator === "isFalse";
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant={hasFilter ? "default" : "ghost"}
          size="icon"
          className={`h-7 w-7 ${hasFilter ? "bg-blue-600 hover:bg-blue-700" : ""
            }`}
        >
          <Filter className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        <div className="p-3 space-y-3">
          <div>
            <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--color-foreground)" }}>
              Operator
            </label>
            <Select value={operator} onValueChange={setOperator}>
              <SelectTrigger
                className="mt-1 w-full h-9 border-2 shadow-sm"
                style={{
                  backgroundColor: "var(--color-card)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-foreground)",
                }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {operators.map((op) => (
                  <SelectItem key={op.value} value={op.value}>
                    {op.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!needsNoInput && (
            <div>
              <label
                className="text-xs font-semibold mb-1 block"
                style={{ color: "var(--color-foreground)" }}
              >
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
                placeholder={`Enter ${dataType}...`}
                className="mt-1"
                style={{
                  backgroundColor: "var(--color-card)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-foreground)",
                }}
              />
            </div>
          )}

          {needsSecondInput && (
            <div>
              <label
                className="text-xs font-semibold mb-1 block"
                style={{ color: "var(--color-foreground)" }}
              >
                {dataType === "date" ? "To" : "Max"}
              </label>
              <Input
                type={dataType === "date" ? "date" : "number"}
                value={value2}
                onChange={(e) => setValue2(e.target.value)}
                placeholder={`Enter ${dataType}...`}
                className="mt-1"
                style={{
                  backgroundColor: "var(--color-card)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-foreground)",
                }}
              />
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => {
                applyFilter();
                setOpen(false); // Close the menu
              }}
              size="sm"
              className="flex-1"
              disabled={!needsNoInput && !value && operator !== "between"}
            >
              Apply Filter
            </Button>
            <Button
              onClick={() => {
                clearFilter();
                setOpen(false); // Close the menu
              }}
              variant="outline"
              size="sm"
              className="flex-1"
              style={{
                borderColor: "var(--color-border)",
                color: "var(--color-foreground)",
              }}
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
      <span className="text-xs font-semibold flex items-center"
        style={{
          color: "var(--color-muted-foreground)"
        }}
      >
        Active filters:
      </span>
      <AnimatePresence>
        {columnFilters.map((filter) => {
          const column = columns.find((c) => c.id === filter.id);
          const filterValue = filter.value;

          let displayValue = "";
          if (filterValue?.operator === "isEmpty") {
            displayValue = "is empty";
          } else if (filterValue?.operator === "isNotEmpty") {
            displayValue = "is not empty";
          } else if (filterValue?.operator === "between") {
            if (filterValue.value?.min && filterValue.value?.max) {
              displayValue = `${filterValue.value.min} - ${filterValue.value.max}`;
            } else if (filterValue.value?.from && filterValue.value?.to) {
              displayValue = `${filterValue.value.from} - ${filterValue.value.to}`;
            }
          } else if (filterValue?.value) {
            const opLabel =
              TEXT_OPERATORS.concat(NUMBER_OPERATORS, DATE_OPERATORS).find(
                (o) => o.value === filterValue.operator
              )?.label || filterValue.operator;
            displayValue = `${opLabel}: ${filterValue.value}`;
          }

          return (
            <motion.div
              key={filter.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border"
              style={{
                backgroundColor:
                  "color-mix(in oklch, var(--color-primary), transparent 50%)",
                color: "var(--color-primary-foreground)",
                borderColor: "var(--color-primary)",
                opacity: 0.8,
              }}
            >
              <span className="font-semibold">
                {column?.header || filter.id}:
              </span>
              <span className="max-w-[150px] truncate">{displayValue}</span>
              <button
                onClick={() =>
                  table.getColumn(filter.id)?.setFilterValue(undefined)
                }
                className="ml-1 hover:opacity-70"
                style={{ color: "var(--color-primary-foreground)" }}
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
