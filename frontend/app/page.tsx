import Link from "next/link";

export default function Home() {
  const cards = [
    {
      title: "Employees",
      description: "Manage employees and view leave balances",
      href: "/employees",
    },
    {
      title: "Leave Request",
      description: "Submit a new leave request",
      href: "/leave-request",
    },
    {
      title: "Manager Dashboard",
      description: "Review and manage leave requests",
      href: "/manager-dashboard",
    },
    {
      title: "Calendar",
      description: "View upcoming approved leaves",
      href: "/calendar",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Employee Leave Tracking System
        </h1>
        <p className="mt-2 text-muted">
          Manage employee leave requests, approvals, and balances.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="block p-6 bg-card rounded-lg border border-border hover:border-primary hover:shadow-md transition-all"
          >
            <h2 className="text-lg font-semibold text-foreground">
              {card.title}
            </h2>
            <p className="mt-2 text-sm text-muted">{card.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
