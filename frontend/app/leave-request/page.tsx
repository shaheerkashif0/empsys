"use client";

import { useState, useEffect } from "react";
import {
  employeesApi,
  leaveRequestsApi,
  Employee,
  LeaveRequest,
  CreateLeaveRequestPayload,
} from "@/lib/api";

const LEAVE_TYPES = ["ANNUAL", "SICK", "UNPAID", "PERSONAL"];

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: "bg-warning-bg text-warning",
    APPROVED: "bg-success-bg text-success",
    REJECTED: "bg-danger-bg text-danger",
  };

  return (
    <span
      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${styles[status] || "bg-gray-100 text-gray-600"}`}
    >
      {status}
    </span>
  );
}

export default function LeaveRequestPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [form, setForm] = useState<CreateLeaveRequestPayload>({
    employeeId: 0,
    startDate: "",
    endDate: "",
    leaveType: "ANNUAL",
    notes: "",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [emps, reqs] = await Promise.all([
          employeesApi.getAll(),
          leaveRequestsApi.getAll(),
        ]);
        setEmployees(emps);
        setRequests(reqs);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSuccessMsg("");

    if (!form.employeeId) {
      setFormError("Please select an employee");
      return;
    }

    try {
      await leaveRequestsApi.create(form);
      setSuccessMsg("Leave request submitted successfully!");
      setForm({
        employeeId: 0,
        startDate: "",
        endDate: "",
        leaveType: "ANNUAL",
        notes: "",
      });
      const updatedRequests = await leaveRequestsApi.getAll();
      setRequests(updatedRequests);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Failed to submit leave request"
      );
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Leave Request</h1>

      {/* Submit Leave Request Form */}
      <div className="bg-card rounded-lg border border-border p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Submit New Request</h2>
        {formError && (
          <div className="mb-4 p-3 bg-danger-bg text-danger rounded-md text-sm">
            {formError}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 bg-success-bg text-success rounded-md text-sm">
            {successMsg}
          </div>
        )}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Employee
            </label>
            <select
              required
              value={form.employeeId}
              onChange={(e) =>
                setForm({ ...form, employeeId: parseInt(e.target.value) || 0 })
              }
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value={0}>Select an employee</option>
              {employees.map((emp) => (
                <option key={emp.employeeId} value={emp.employeeId}>
                  {emp.name} ({emp.department})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Leave Type
            </label>
            <select
              required
              value={form.leaveType}
              onChange={(e) => setForm({ ...form, leaveType: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {LEAVE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0) + type.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Start Date
            </label>
            <input
              type="date"
              required
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              End Date
            </label>
            <input
              type="date"
              required
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-1">
              Notes (optional)
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Add any additional notes..."
            />
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors font-medium"
            >
              Submit Request
            </button>
          </div>
        </form>
      </div>

      {/* Recent Leave Requests */}
      <div className="bg-card rounded-lg border border-border">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold">Recent Requests</h2>
        </div>
        {loading ? (
          <div className="p-6 text-muted">Loading requests...</div>
        ) : error ? (
          <div className="p-6 text-danger">{error}</div>
        ) : requests.length === 0 ? (
          <div className="p-6 text-muted">No leave requests found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                    Start Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                    End Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {requests.map((req) => (
                  <tr key={req.leaveRequestId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium">
                      {req.employee.name}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {req.leaveType.charAt(0) +
                        req.leaveType.slice(1).toLowerCase()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {new Date(req.startDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {new Date(req.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <StatusBadge status={req.status} />
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
