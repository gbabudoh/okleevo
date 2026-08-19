import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';

export const GET = withMultiTenancy(async (_req, { user, params }) => {
  try {
    const { id } = await params;

    const project = await prisma.project.findFirst({ where: { id: id as string, businessId: user.businessId } });
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    const notes = await prisma.projectNote.findMany({
      where: { projectId: id as string },
      include: { author: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(notes);
  } catch (error) {
    console.error('Project Notes GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
  }
});

export const POST = withMultiTenancy(async (req, { user, params }) => {
  try {
    const { id } = await params;
    const body = await req.json();
    const { body: text } = body;

    if (!text?.trim()) {
      return NextResponse.json({ error: 'Note text is required' }, { status: 400 });
    }

    const project = await prisma.project.findFirst({ where: { id: id as string, businessId: user.businessId } });
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    const note = await prisma.projectNote.create({
      data: {
        body: text.trim(),
        projectId: id as string,
        businessId: user.businessId,
        authorId: user.id,
      },
      include: { author: { select: { id: true, firstName: true, lastName: true } } },
    });

    return NextResponse.json(note);
  } catch (error) {
    console.error('Project Notes POST Error:', error);
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
  }
});
