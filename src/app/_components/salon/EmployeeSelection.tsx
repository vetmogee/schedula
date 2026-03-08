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
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-foreground">Select Employee</h2>
        <div className="rounded-2xl bg-white/80 dark:bg-card/80 backdrop-blur shadow-md p-6 border border-white/60 dark:border-border">
          <p className="text-sm text-gray-600 dark:text-muted-foreground">No employees available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-foreground">Select Employee</h2>
      <div className="rounded-2xl bg-white/80 dark:bg-card/80 backdrop-blur shadow-md p-6 border border-white/60 dark:border-border">
        <div className="grid gap-3 sm:grid-cols-2">
          {employees.map((employee) => {
            const isSelected = selectedEmployeeId === employee.id;
            return (
              <button
                key={employee.id}
                onClick={() => onEmployeeSelect(isSelected ? null : employee.id)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${isSelected
                  ? "bg-pink-100 dark:bg-pink-900/40 border-pink-500 dark:border-pink-700 shadow-md"
                  : "bg-white/80 dark:bg-card/80 border-gray-200 dark:border-border hover:border-pink-300 dark:hover:border-border hover:bg-pink-50/60 dark:hover:bg-accent/50"
                  }`}
              >
                <p className={`font-medium ${isSelected ? "text-pink-900 dark:text-pink-100" : "text-gray-900 dark:text-foreground"}`}>
                  {employee.name}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

