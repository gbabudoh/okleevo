import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';

export const PUT = withMultiTenancy(async (req, { dataFilter, params }) => {
  const { id } = await params;
  try {
    const data = await req.json();
    const { firstName, lastName, email, phone, department, position, startDate, salary, employmentType, reportingManager, status } = data;

    const existing = await prisma.employee.findFirst({
      where: { id: id as string, businessId: dataFilter.businessId },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (department !== undefined) updateData.department = department;
    if (position !== undefined) updateData.position = position;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (salary !== undefined) updateData.salary = salary === '' ? null : Number(salary);
    if (employmentType !== undefined) updateData.employmentType = employmentType;
    if (reportingManager !== undefined) updateData.reportingManager = reportingManager;
    if (status !== undefined) updateData.status = status;

    const employee = await prisma.employee.update({
      where: { id: id as string, businessId: dataFilter.businessId },
      data: updateData,
    });

    return NextResponse.json(employee);
  } catch (error) {
    console.error('Error updating HR employee:', error);
    return NextResponse.json({ error: 'Failed to update employee' }, { status: 500 });
  }
});

export const DELETE = withMultiTenancy(async (_req, { dataFilter, params }) => {
  const { id } = await params;
  try {
    await prisma.employee.delete({
      where: { id: id as string, businessId: dataFilter.businessId },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting HR employee:', error);
    return NextResponse.json({ error: 'Failed to delete employee' }, { status: 500 });
  }
});
