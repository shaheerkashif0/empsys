"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { employeesApi, EmployeeWithBalance } from "@/lib/api";

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

export default function EmployeeProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [employee, setEmployee] = useState<EmployeeWithBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const data = await employeesApi.getById(parseInt(id));
        setEmployee(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load employee"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [id]);

  if (loading) {
    return <div className="text-muted">Loading employee profile...</div>;
  }

  if (error || !employee) {
    return <div className="text-danger">{error || "Employee not found"}</div>;
  }

  return (
    <div>
      <Link
        href="/employees"
        className="text-primary hover:underline text-sm mb-4 inline-block"
      >
        &larr; Back to Employees
      </Link>

      <div className="bg-card rounded-lg border border-border p-6 mb-6">
        <h1 className="text-2xl font-bold mb-1">{employee.name}</h1>
        <p className="text-muted mb-4">{employee.email}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-muted">Department</span>
            <p className="font-medium">{employee.department}</p>
          </div>
          <div>
            <span className="text-sm text-muted">Member Since</span>
            <p className="font-medium">
              {new Date(employee.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Leave Balance */}
      <h2 className="text-lg font-semibold mb-4">Leave Balance</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-card rounded-lg border border-border p-6 text-center">
          <p className="text-sm text-muted mb-1">Used Leave</p>
          <p className="text-3xl font-bold text-warning">
            {employee.usedLeaveDays}
          </p>
          <p className="text-xs text-muted mt-1">days taken</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-6 text-center">
          <p className="text-sm text-muted mb-1">Remaining Leave</p>
          <p
            className={`text-3xl font-bold ${
              employee.remainingLeaveDays > 5
                ? "text-success"
                : employee.remainingLeaveDays > 0
                ? "text-warning"
                : "text-danger"
            }`}
          >
            {employee.remainingLeaveDays}
          </p>
          <p className="text-xs text-muted mt-1">days available</p>
        </div>
      </div>

      {/* Leave Request History */}
      <div className="bg-card rounded-lg border border-border">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold">Leave Request History</h2>
        </div>
        {!employee.leaveRequests || employee.leaveRequests.length === 0 ? (
          <div className="p-6 text-muted">No leave requests found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-gray-50">
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
                    Days
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                    Reviewed By
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {employee.leaveRequests.map((req) => {
                  const start = new Date(req.startDate);
                  const end = new Date(req.endDate);
                  const days =
                    Math.ceil(
                      (end.getTime() - start.getTime()) /
                        (1000 * 60 * 60 * 24)
                    ) + 1;
                  return (
                    <tr key={req.leaveRequestId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm">
                        {req.leaveType.charAt(0) +
                          req.leaveType.slice(1).toLowerCase()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {start.toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {end.toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">{days}</td>
                      <td className="px-6 py-4 text-sm">
                        <StatusBadge status={req.status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-muted">
                        {req.manager?.name || "\u2014"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
