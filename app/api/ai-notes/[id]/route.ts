import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';

export const PATCH = withMultiTenancy(async (req, { user, params }) => {
  try {
    const { id } = await params;
    const body = await req.json();
    const { title, content, type, date, tags, isPinned, isStarred, aiSummary, actionItems, participants, duration } = body;

    const existing = await prisma.aINote.findFirst({
      where: { id: id as string, businessId: user.businessId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    const updated = await prisma.aINote.update({
      where: { id: id as string },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(content !== undefined && { content: content.trim() }),
        ...(type !== undefined && { type }),
        ...(date !== undefined && { date: new Date(date) }),
        ...(tags !== undefined && { tags }),
        ...(isPinned !== undefined && { isPinned }),
        ...(isStarred !== undefined && { isStarred }),
        ...(aiSummary !== undefined && { aiSummary }),
        ...(actionItems !== undefined && { actionItems }),
        ...(participants !== undefined && { participants }),
        ...(duration !== undefined && { duration }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating AI note:', error);
    return NextResponse.json({ error: 'Failed to update note' }, { status: 500 });
  }
});

export const DELETE = withMultiTenancy(async (_req, { user, params }) => {
  try {
    const { id } = await params;
    
    const existing = await prisma.aINote.findFirst({
      where: { id: id as string, businessId: user.businessId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    await prisma.aINote.delete({
      where: { id: id as string },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting AI note:', error);
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
  }
});
