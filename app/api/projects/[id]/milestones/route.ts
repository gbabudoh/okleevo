import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';

export const GET = withMultiTenancy(async (_req, { user, params }) => {
  try {
    const { id } = await params;

    const project = await prisma.project.findFirst({ where: { id: id as string, businessId: user.businessId } });
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    const milestones = await prisma.milestone.findMany({
      where: { projectId: id as string },
      orderBy: { dueDate: 'asc' },
    });

    return NextResponse.json(milestones);
  } catch (error) {
    console.error('Milestones GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch milestones' }, { status: 500 });
  }
});

export const POST = withMultiTenancy(async (req, { user, params }) => {
  try {
    const { id } = await params;
    const body = await req.json();
    const { title, dueDate } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Milestone title is required' }, { status: 400 });
    }
    if (!dueDate) {
      return NextResponse.json({ error: 'Milestone due date is required' }, { status: 400 });
    }

    const project = await prisma.project.findFirst({ where: { id: id as string, businessId: user.businessId } });
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    const milestone = await prisma.milestone.create({
      data: {
        title: title.trim(),
        dueDate: new Date(dueDate),
        projectId: id as string,
        businessId: user.businessId,
      },
    });

    return NextResponse.json(milestone);
  } catch (error) {
    console.error('Milestones POST Error:', error);
    return NextResponse.json({ error: 'Failed to create milestone' }, { status: 500 });
  }
});
