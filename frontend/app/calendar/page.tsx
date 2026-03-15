"use client";

import { useState, useEffect } from "react";
import { calendarApi, LeaveRequest } from "@/lib/api";

export default function CalendarPage() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUpcoming = async () => {
      try {
        const data = await calendarApi.getUpcoming();
        setLeaves(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load upcoming leaves"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchUpcoming();
  }, []);

  // Group leaves by month
  const grouped = leaves.reduce<Record<string, LeaveRequest[]>>(
    (acc, leave) => {
      const date = new Date(leave.startDate);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(leave);
      return acc;
    },
    {}
  );

  const formatMonthKey = (key: string) => {
    const [year, month] = key.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  const getDayCount = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    return Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Upcoming Leave</h1>
      <p className="text-muted mb-6">
        Approved leave requests sorted by date
      </p>

      {loading ? (
        <div className="text-muted">Loading upcoming leaves...</div>
      ) : error ? (
        <div className="text-danger">{error}</div>
      ) : leaves.length === 0 ? (
        <div className="bg-card rounded-lg border border-border p-8 text-center text-muted">
          No upcoming approved leaves.
        </div>
      ) : (
        <div className="space-y-8">
          {Object.keys(grouped)
            .sort()
            .map((monthKey) => (
              <div key={monthKey}>
                <h2 className="text-lg font-semibold mb-3 text-foreground">
                  {formatMonthKey(monthKey)}
                </h2>
                <div className="space-y-3">
                  {grouped[monthKey].map((leave) => (
                    <div
                      key={leave.leaveRequestId}
                      className="bg-card rounded-lg border border-border p-4 flex items-center justify-between hover:border-primary transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                          {leave.employee.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {leave.employee.name}
                          </p>
                          <p className="text-sm text-muted">
                            {leave.employee.department}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {new Date(leave.startDate).toLocaleDateString()} &ndash;{" "}
                          {new Date(leave.endDate).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted">
                          {getDayCount(leave.startDate, leave.endDate)} day
                          {getDayCount(leave.startDate, leave.endDate) !== 1
                            ? "s"
                            : ""}{" "}
                          &middot;{" "}
                          {leave.leaveType.charAt(0) +
                            leave.leaveType.slice(1).toLowerCase()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
