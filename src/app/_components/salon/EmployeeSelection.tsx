"use client";

type Employee = {
  id: number;
  name: string;
};

type Props = {
  employees: Employee[];
  selectedEmployeeId: number | null;
  onEmployeeSelect: (employeeId: number | null) => void;
};

export function EmployeeSelection({
  employees,
  selectedEmployeeId,
  onEmployeeSelect,
}: Props) {
  if (employees.length === 0) {
    return (
      <div className="rounded-2xl bg-white/80 backdrop-blur shadow-md p-4 border border-white/60">
        <p className="text-sm text-gray-600">No employees available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900">Select Employee</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {employees.map((employee) => {
          const isSelected = selectedEmployeeId === employee.id;
          return (
            <button
              key={employee.id}
              onClick={() => onEmployeeSelect(isSelected ? null : employee.id)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                isSelected
                  ? "bg-pink-100 border-pink-500 shadow-md"
                  : "bg-white/80 border-gray-200 hover:border-pink-300 hover:bg-pink-50/60"
              }`}
            >
              <p className={`font-medium ${isSelected ? "text-pink-900" : "text-gray-900"}`}>
                {employee.name}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

