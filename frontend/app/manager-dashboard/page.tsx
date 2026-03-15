"use client";

import { useState, useEffect } from "react";
import {
  managersApi,
  leaveRequestsApi,
  Manager,
  LeaveRequest,
} from "@/lib/api";

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

function LoginGate({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    if (username === "empsysadmin" && password === "empsys123") {
      onLogin();
    } else {
      setLoginError("Invalid username or password");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="bg-card rounded-lg border border-border p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2 text-center">Manager Login</h1>
        <p className="text-muted text-sm text-center mb-6">
          Enter your credentials to access the dashboard
        </p>
        {loginError && (
          <div className="mb-4 p-3 bg-danger-bg text-danger rounded-md text-sm">
            {loginError}
          </div>
        )}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter password"
            />
          </div>
          <button
            type="submit"
            className="w-full px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors font-medium"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ManagerDashboardPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [selectedManager, setSelectedManager] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [managerForm, setManagerForm] = useState({ name: "", email: "" });
  const [showManagerForm, setShowManagerForm] = useState(false);

  const fetchData = async () => {
    try {
      const [mgrs, reqs] = await Promise.all([
        managersApi.getAll(),
        leaveRequestsApi.getAll(),
      ]);
      setManagers(mgrs);
      setRequests(reqs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authenticated) {
      fetchData();
    }
  }, [authenticated]);

  const handleAction = async (
    requestId: number,
    action: "approve" | "reject"
  ) => {
    setActionError("");
    if (!selectedManager) {
      setActionError("Please select a manager first");
      return;
    }
    try {
      if (action === "approve") {
        await leaveRequestsApi.approve(requestId, selectedManager);
      } else {
        await leaveRequestsApi.reject(requestId, selectedManager);
      }
      fetchData();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : `Failed to ${action} request`
      );
    }
  };

  const handleCreateManager = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await managersApi.create(managerForm);
      setManagerForm({ name: "", email: "" });
      setShowManagerForm(false);
      fetchData();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to create manager"
      );
    }
  };

  if (!authenticated) {
    return <LoginGate onLogin={() => setAuthenticated(true)} />;
  }

  const pendingRequests = requests.filter((r) => r.status === "PENDING");
  const processedRequests = requests.filter((r) => r.status !== "PENDING");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Manager Dashboard</h1>
        <button
          onClick={() => setShowManagerForm(!showManagerForm)}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors text-sm font-medium"
        >
          {showManagerForm ? "Cancel" : "+ Add Manager"}
        </button>
      </div>

      {/* Add Manager Form */}
      {showManagerForm && (
        <div className="bg-card rounded-lg border border-border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Add New Manager</h2>
          <form
            onSubmit={handleCreateManager}
            className="flex gap-4 items-end"
          >
            <div className="flex-1">
              <label className="block text-sm font-medium text-foreground mb-1">
                Name
              </label>
              <input
                type="text"
                required
                value={managerForm.name}
                onChange={(e) =>
                  setManagerForm({ ...managerForm, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-foreground mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={managerForm.email}
                onChange={(e) =>
                  setManagerForm({ ...managerForm, email: e.target.value })
                }
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors font-medium"
            >
              Add
            </button>
          </form>
        </div>
      )}

      {/* Manager Selector */}
      <div className="bg-card rounded-lg border border-border p-4 mb-6">
        <label className="block text-sm font-medium text-foreground mb-2">
          Acting as Manager
        </label>
        <select
          value={selectedManager}
          onChange={(e) => setSelectedManager(parseInt(e.target.value) || 0)}
          className="w-full md:w-auto px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value={0}>Select a manager</option>
          {managers.map((mgr) => (
            <option key={mgr.managerId} value={mgr.managerId}>
              {mgr.name}
            </option>
          ))}
        </select>
      </div>

      {actionError && (
        <div className="mb-4 p-3 bg-danger-bg text-danger rounded-md text-sm">
          {actionError}
        </div>
      )}

      {loading ? (
        <div className="text-muted">Loading dashboard...</div>
      ) : error ? (
        <div className="text-danger">{error}</div>
      ) : (
        <>
          {/* Pending Requests */}
          <div className="bg-card rounded-lg border border-border mb-8">
            <div className="p-6 border-b border-border">
              <h2 className="text-lg font-semibold">
                Pending Requests ({pendingRequests.length})
              </h2>
            </div>
            {pendingRequests.length === 0 ? (
              <div className="p-6 text-muted">
                No pending requests to review.
              </div>
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
                        Dates
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                        Notes
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {pendingRequests.map((req) => (
                      <tr key={req.leaveRequestId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium">
                          {req.employee.name}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {req.leaveType.charAt(0) +
                            req.leaveType.slice(1).toLowerCase()}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {new Date(req.startDate).toLocaleDateString()} &ndash;{" "}
                          {new Date(req.endDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted">
                          {req.notes || "\u2014"}
                        </td>
                        <td className="px-6 py-4 text-sm space-x-2">
                          <button
                            onClick={() =>
                              handleAction(req.leaveRequestId, "approve")
                            }
                            className="px-3 py-1 bg-success text-white rounded-md hover:opacity-90 transition-opacity text-xs font-medium"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              handleAction(req.leaveRequestId, "reject")
                            }
                            className="px-3 py-1 bg-danger text-white rounded-md hover:opacity-90 transition-opacity text-xs font-medium"
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Processed Requests */}
          <div className="bg-card rounded-lg border border-border">
            <div className="p-6 border-b border-border">
              <h2 className="text-lg font-semibold">
                Processed Requests ({processedRequests.length})
              </h2>
            </div>
            {processedRequests.length === 0 ? (
              <div className="p-6 text-muted">No processed requests yet.</div>
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
                        Dates
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
                    {processedRequests.map((req) => (
                      <tr key={req.leaveRequestId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium">
                          {req.employee.name}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {req.leaveType.charAt(0) +
                            req.leaveType.slice(1).toLowerCase()}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {new Date(req.startDate).toLocaleDateString()} &ndash;{" "}
                          {new Date(req.endDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <StatusBadge status={req.status} />
                        </td>
                        <td className="px-6 py-4 text-sm text-muted">
                          {req.manager?.name || "\u2014"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
