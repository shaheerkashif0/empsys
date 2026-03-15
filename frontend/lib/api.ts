const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function request<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || 'API request failed');
  }

  return res.json() as Promise<T>;
}

// Employee types
export interface Employee {
  employeeId: number;
  name: string;
  email: string;
  department: string;
  annualLeaveEntitlement: number;
  createdAt: string;
}

export interface EmployeeWithBalance extends Employee {
  usedLeaveDays: number;
  remainingLeaveDays: number;
  leaveRequests: LeaveRequest[];
}

export interface CreateEmployeePayload {
  name: string;
  email: string;
  department: string;
  annualLeaveEntitlement?: number;
}

// Manager types
export interface Manager {
  managerId: number;
  name: string;
  email: string;
  createdAt: string;
}

// Leave Request types
export interface LeaveRequest {
  leaveRequestId: number;
  employeeId: number;
  managerId: number | null;
  startDate: string;
  endDate: string;
  leaveType: string;
  notes: string | null;
  status: string;
  createdAt: string;
  decisionDate: string | null;
  employee: Employee;
  manager: Manager | null;
}

export interface CreateLeaveRequestPayload {
  employeeId: number;
  startDate: string;
  endDate: string;
  leaveType: string;
  notes?: string;
}

// Employee API
export const employeesApi = {
  getAll: () => request<Employee[]>('/employees'),
  getById: (id: number) => request<EmployeeWithBalance>(`/employees/${id}`),
  create: (data: CreateEmployeePayload) =>
    request<Employee>('/employees', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Manager API
export const managersApi = {
  getAll: () => request<Manager[]>('/managers'),
  create: (data: { name: string; email: string }) =>
    request<Manager>('/managers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Leave Request API
export const leaveRequestsApi = {
  getAll: (params?: Record<string, string>) => {
    const query = params
      ? '?' + new URLSearchParams(params).toString()
      : '';
    return request<LeaveRequest[]>(`/leave-requests${query}`);
  },
  create: (data: CreateLeaveRequestPayload) =>
    request<LeaveRequest>('/leave-requests', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  approve: (id: number, managerId: number) =>
    request<LeaveRequest>(`/leave-requests/${id}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({ managerId }),
    }),
  reject: (id: number, managerId: number) =>
    request<LeaveRequest>(`/leave-requests/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ managerId }),
    }),
};

// Calendar API
export const calendarApi = {
  getUpcoming: () => request<LeaveRequest[]>('/calendar/upcoming'),
};
