import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';

export const GET = withMultiTenancy(async (req, { dataFilter }) => {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    const employeeId = searchParams.get('employeeId');

    const timeEntries = await prisma.timeEntry.findMany({
      where: {
        businessId: dataFilter.businessId,
        ...(projectId && { projectId }),
        ...(employeeId && { employeeId }),
      },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, hourlyRate: true } },
        project: { select: { id: true, name: true } },
      },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(timeEntries);
  } catch (error) {
    console.error('Time Entries GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch time entries' }, { status: 500 });
  }
});

export const POST = withMultiTenancy(async (req, { user }) => {
  try {
    const body = await req.json();
    const { employeeId, projectId, taskId, hoursLogged, date, notes } = body;

    if (!employeeId || !projectId || !hoursLogged || !date) {
      return NextResponse.json(
        { error: 'employeeId, projectId, hoursLogged, and date are required' },
        { status: 400 }
      );
    }

    const [employee, project] = await Promise.all([
      prisma.employee.findFirst({ where: { id: employeeId, businessId: user.businessId } }),
      prisma.project.findFirst({ where: { id: projectId, businessId: user.businessId } }),
    ]);

    if (!employee || !project) {
      return NextResponse.json({ error: 'Employee or project not found' }, { status: 404 });
    }

    const timeEntry = await prisma.timeEntry.create({
      data: {
        employeeId,
        projectId,
        taskId: taskId || null,
        hoursLogged: parseFloat(hoursLogged),
        date: new Date(date),
        notes: notes || null,
        businessId: user.businessId,
      },
    });

    return NextResponse.json(timeEntry);
  } catch (error) {
    console.error('Time Entries POST Error:', error);
    return NextResponse.json({ error: 'Failed to log time entry' }, { status: 500 });
  }
});
