import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';

export const PATCH = withMultiTenancy(async (req, { user, params }) => {
  try {
    const { id } = await params;
    const body = await req.json();
    const { title, content, type, date, tags, isPinned, isStarred, isPrivate, aiSummary, actionItems, participants, duration } = body;

    const existing = await prisma.aINote.findFirst({
      where: { id: id as string, businessId: user.businessId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    if (existing.isPrivate && existing.userId !== user.id) {
      return NextResponse.json({ error: 'You do not have permission to edit this private note' }, { status: 403 });
    }

    const editorFullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Team Member';

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
        ...(isPrivate !== undefined && { isPrivate }),
        ...(aiSummary !== undefined && { aiSummary }),
        ...(actionItems !== undefined && { actionItems }),
        ...(participants !== undefined && { participants }),
        ...(duration !== undefined && { duration }),
        lastEditedBy: editorFullName,
        lastEditedAt: new Date(),
      },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
      },
    });

    return NextResponse.json({
      ...updated,
      authorName: updated.authorName || (updated.user ? `${updated.user.firstName} ${updated.user.lastName}`.trim() : 'Team Member'),
    });
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
