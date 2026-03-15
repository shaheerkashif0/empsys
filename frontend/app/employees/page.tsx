"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { employeesApi, Employee, CreateEmployeePayload } from "@/lib/api";

const DEPARTMENTS = ["IT", "Sales", "Marketing", "Operations", "HR"];

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState<CreateEmployeePayload>({
    name: "",
    email: "",
    department: "",
    annualLeaveEntitlement: 20,
  });

  const fetchEmployees = async () => {
    try {
      const data = await employeesApi.getAll();
      setEmployees(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    try {
      await employeesApi.create(form);
      setForm({ name: "", email: "", department: "", annualLeaveEntitlement: 20 });
      fetchEmployees();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to create employee");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Employee Management</h1>

      {/* Create Employee Form */}
      <div className="bg-card rounded-lg border border-border p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Add New Employee</h2>
        {formError && (
          <div className="mb-4 p-3 bg-danger-bg text-danger rounded-md text-sm">
            {formError}
          </div>
        )}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Name
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Department
            </label>
            <select
              required
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select a department</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Annual Leave Entitlement
            </label>
            <input
              type="number"
              min={0}
              required
              value={form.annualLeaveEntitlement}
              onChange={(e) =>
                setForm({ ...form, annualLeaveEntitlement: parseInt(e.target.value) || 0 })
              }
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors font-medium"
            >
              Add Employee
            </button>
          </div>
        </form>
      </div>

      {/* Employee List */}
      <div className="bg-card rounded-lg border border-border">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold">All Employees</h2>
        </div>
        {loading ? (
          <div className="p-6 text-muted">Loading employees...</div>
        ) : error ? (
          <div className="p-6 text-danger">{error}</div>
        ) : employees.length === 0 ? (
          <div className="p-6 text-muted">No employees found. Add one above.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                    Leave Entitlement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {employees.map((emp) => (
                  <tr key={emp.employeeId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium">{emp.name}</td>
                    <td className="px-6 py-4 text-sm text-muted">{emp.email}</td>
                    <td className="px-6 py-4 text-sm">{emp.department}</td>
                    <td className="px-6 py-4 text-sm">{emp.annualLeaveEntitlement} days</td>
                    <td className="px-6 py-4 text-sm">
                      <Link
                        href={`/employees/${emp.employeeId}`}
                        className="text-primary hover:underline font-medium"
                      >
                        View Profile
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
