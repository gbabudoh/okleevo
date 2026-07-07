import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';

export const GET = withMultiTenancy(async (_req, { dataFilter }) => {
  try {
    const employees = await prisma.employee.findMany({
      where: { businessId: dataFilter.businessId },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(employees);
  } catch (error) {
    console.error('Error fetching HR employees:', error);
    return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 });
  }
});

export const POST = withMultiTenancy(async (req, { dataFilter }) => {
  try {
    const data = await req.json();
    const { firstName, lastName, email, phone, department, position, startDate, salary, employmentType, reportingManager } = data;

    if (!firstName || !lastName || !email || !department || !position || !startDate) {
      return NextResponse.json(
        { error: 'First name, last name, email, department, job title, and start date are required' },
        { status: 400 }
      );
    }

    const employee = await prisma.employee.create({
      data: {
        businessId: dataFilter.businessId,
        firstName,
        lastName,
        email,
        phone: phone || null,
        department,
        position,
        startDate: new Date(startDate),
        salary: salary !== undefined && salary !== '' ? Number(salary) : null,
        employmentType: employmentType || 'FULL_TIME',
        reportingManager: reportingManager || null,
      },
    });

    return NextResponse.json(employee, { status: 201 });
  } catch (error) {
    console.error('Error creating HR employee:', error);
    return NextResponse.json({ error: 'Failed to create employee' }, { status: 500 });
  }
});
