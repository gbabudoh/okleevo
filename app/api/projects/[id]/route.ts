import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';
import { ProjectStatus } from '@/lib/prisma-client';

export const GET = withMultiTenancy(async (_req, { user, params }) => {
  try {
    const { id } = await params;

    const project = await prisma.project.findFirst({
      where: { id: id as string, businessId: user.businessId },
      include: {
        contact: { select: { id: true, name: true, company: true, email: true } },
        owner: { select: { id: true, firstName: true, lastName: true } },
        tasks: true,
        invoices: true,
        expenses: true,
        timeEntries: { include: { employee: true } },
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('Project GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });
  }
});

export const PATCH = withMultiTenancy(async (req, { user, params }) => {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, contactId, status, budget, dueDate, ownerId } = body;

    const existing = await prisma.project.findFirst({
      where: { id: id as string, businessId: user.businessId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Project not found or unauthorized' }, { status: 404 });
    }

    const project = await prisma.project.update({
      where: { id: id as string },
      data: {
        name: name?.trim(),
        contactId: contactId !== undefined ? contactId || null : undefined,
        status: status ? (status.toUpperCase() as ProjectStatus) : undefined,
        budget: budget !== undefined ? (budget === null || budget === '' ? null : Number(budget)) : undefined,
        dueDate: dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : undefined,
        ownerId: ownerId !== undefined ? (ownerId || null) : undefined,
      },
      include: { owner: { select: { id: true, firstName: true, lastName: true } } },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error('Project PATCH Error:', error);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
});

export const DELETE = withMultiTenancy(async (_req, { user, params }) => {
  try {
    const { id } = await params;

    const { count } = await prisma.project.deleteMany({
      where: { id: id as string, businessId: user.businessId },
    });

    if (count === 0) {
      return NextResponse.json({ error: 'Project not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Project DELETE Error:', error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
});
