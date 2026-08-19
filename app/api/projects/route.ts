import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';
import { ProjectStatus } from '@/lib/prisma-client';

export const GET = withMultiTenancy(async (_req, { dataFilter }) => {
  try {
    const projects = await prisma.project.findMany({
      where: { businessId: dataFilter.businessId },
      include: {
        contact: { select: { id: true, name: true, company: true } },
        owner: { select: { id: true, firstName: true, lastName: true } },
        tasks: { select: { status: true } },
        _count: { select: { tasks: true, invoices: true, expenses: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Projects GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
});

export const POST = withMultiTenancy(async (req, { user }) => {
  try {
    const body = await req.json();
    const { name, contactId, status, budget, startDate, dueDate, ownerId } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        contactId: contactId || null,
        ownerId: ownerId || null,
        status: (status?.toUpperCase() as ProjectStatus) || 'ACTIVE',
        budget: budget !== undefined && budget !== null && budget !== '' ? Number(budget) : null,
        startDate: startDate ? new Date(startDate) : null,
        dueDate: dueDate ? new Date(dueDate) : null,
        businessId: user.businessId,
      },
      include: { owner: { select: { id: true, firstName: true, lastName: true } } },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error('Projects POST Error:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
});
