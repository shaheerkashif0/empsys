import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ||
    'postgresql://postgres:admin@localhost:5432/empsys',
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.leaveRequest.deleteMany();
  await prisma.manager.deleteMany();
  await prisma.employee.deleteMany();

  // Create managers
  const manager1 = await prisma.manager.create({
    data: { name: 'Ahmed Khan', email: 'ahmed.khan@empsys.com' },
  });

  const manager2 = await prisma.manager.create({
    data: { name: 'Sara Ali', email: 'sara.ali@empsys.com' },
  });

  console.log(`Created managers: ${manager1.name}, ${manager2.name}`);

  // Create employees
  const employees = await Promise.all([
    prisma.employee.create({
      data: {
        name: 'Shaheer Kashif',
        email: 'shaheer.kashif@empsys.com',
        department: 'Sales',
        annualLeaveEntitlement: 20,
      },
    }),
    prisma.employee.create({
      data: {
        name: 'Fatima Noor',
        email: 'fatima.noor@empsys.com',
        department: 'IT',
        annualLeaveEntitlement: 22,
      },
    }),
    prisma.employee.create({
      data: {
        name: 'Bilal Hussain',
        email: 'bilal.hussain@empsys.com',
        department: 'Marketing',
        annualLeaveEntitlement: 20,
      },
    }),
    prisma.employee.create({
      data: {
        name: 'Ayesha Tariq',
        email: 'ayesha.tariq@empsys.com',
        department: 'HR',
        annualLeaveEntitlement: 18,
      },
    }),
    prisma.employee.create({
      data: {
        name: 'Omar Raza',
        email: 'omar.raza@empsys.com',
        department: 'Operations',
        annualLeaveEntitlement: 20,
      },
    }),
    prisma.employee.create({
      data: {
        name: 'Zainab Malik',
        email: 'zainab.malik@empsys.com',
        department: 'IT',
        annualLeaveEntitlement: 25,
      },
    }),
  ]);

  console.log(`Created ${employees.length} employees`);

  // Helper: get a future date relative to today
  function futureDate(daysFromNow: number): Date {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  // Create leave requests (all dates are today or in the future)
  const leaveRequests = [
    // Shaheer - pending sick leave
    {
      employeeId: employees[0].employeeId,
      startDate: futureDate(2),
      endDate: futureDate(4),
      leaveType: 'SICK' as const,
      notes: 'Feeling unwell, need rest',
      status: 'PENDING' as const,
    },
    // Shaheer - pending annual leave
    {
      employeeId: employees[0].employeeId,
      startDate: futureDate(20),
      endDate: futureDate(24),
      leaveType: 'ANNUAL' as const,
      notes: 'Family vacation',
      status: 'PENDING' as const,
    },
    // Fatima - approved annual leave (already approved, so decrement entitlement)
    {
      employeeId: employees[1].employeeId,
      managerId: manager1.managerId,
      startDate: futureDate(5),
      endDate: futureDate(9),
      leaveType: 'ANNUAL' as const,
      notes: 'Conference trip',
      status: 'APPROVED' as const,
      decisionDate: new Date(),
    },
    // Fatima - pending personal leave
    {
      employeeId: employees[1].employeeId,
      startDate: futureDate(30),
      endDate: futureDate(31),
      leaveType: 'PERSONAL' as const,
      notes: 'Personal errands',
      status: 'PENDING' as const,
    },
    // Bilal - rejected leave
    {
      employeeId: employees[2].employeeId,
      managerId: manager2.managerId,
      startDate: futureDate(3),
      endDate: futureDate(5),
      leaveType: 'ANNUAL' as const,
      notes: 'Short trip',
      status: 'REJECTED' as const,
      decisionDate: new Date(),
    },
    // Bilal - pending sick leave
    {
      employeeId: employees[2].employeeId,
      startDate: futureDate(10),
      endDate: futureDate(11),
      leaveType: 'SICK' as const,
      notes: 'Dental appointment and recovery',
      status: 'PENDING' as const,
    },
    // Ayesha - approved sick leave
    {
      employeeId: employees[3].employeeId,
      managerId: manager1.managerId,
      startDate: futureDate(1),
      endDate: futureDate(2),
      leaveType: 'SICK' as const,
      notes: 'Doctor visit',
      status: 'APPROVED' as const,
      decisionDate: new Date(),
    },
    // Ayesha - pending annual leave
    {
      employeeId: employees[3].employeeId,
      startDate: futureDate(15),
      endDate: futureDate(19),
      leaveType: 'ANNUAL' as const,
      notes: 'Family wedding',
      status: 'PENDING' as const,
    },
    // Omar - pending unpaid leave
    {
      employeeId: employees[4].employeeId,
      startDate: futureDate(7),
      endDate: futureDate(10),
      leaveType: 'UNPAID' as const,
      notes: 'Visa appointment abroad',
      status: 'PENDING' as const,
    },
    // Omar - approved annual leave
    {
      employeeId: employees[4].employeeId,
      managerId: manager2.managerId,
      startDate: futureDate(25),
      endDate: futureDate(29),
      leaveType: 'ANNUAL' as const,
      notes: 'Vacation',
      status: 'APPROVED' as const,
      decisionDate: new Date(),
    },
    // Zainab - pending personal leave
    {
      employeeId: employees[5].employeeId,
      startDate: futureDate(4),
      endDate: futureDate(4),
      leaveType: 'PERSONAL' as const,
      notes: 'Moving to new apartment',
      status: 'PENDING' as const,
    },
    // Zainab - approved annual leave
    {
      employeeId: employees[5].employeeId,
      managerId: manager1.managerId,
      startDate: futureDate(12),
      endDate: futureDate(14),
      leaveType: 'ANNUAL' as const,
      status: 'APPROVED' as const,
      decisionDate: new Date(),
    },
  ];

  for (const lr of leaveRequests) {
    await prisma.leaveRequest.create({ data: lr });
  }

  console.log(`Created ${leaveRequests.length} leave requests`);

  // Print summary
  const allEmployees = await prisma.employee.findMany();
  console.log('\nEmployee Summary:');
  for (const emp of allEmployees) {
    console.log(
      `  ${emp.name} (${emp.department}) - ${emp.annualLeaveEntitlement} days remaining`,
    );
  }

  console.log('\nSeeding complete!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
