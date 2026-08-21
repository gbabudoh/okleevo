import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';
import { Task, SubTask, TaskStatus, TaskPriority } from '@/lib/prisma-client';

function serialize(t: Task & { subtasks?: SubTask[]; dependsOn?: Task[] }) {
  return {
    ...t,
    status: t.status.toLowerCase(),
    priority: t.priority.toLowerCase(),
    startDate: t.startDate ? t.startDate.toISOString().split('T')[0] : '',
    dueDate: t.dueDate ? t.dueDate.toISOString().split('T')[0] : '',
    completedAt: t.completedAt ? t.completedAt.toISOString() : null,
    completedBy: t.completedBy || null,
    isDailyTask: Boolean(t.isDailyTask),
    createdAt: t.createdAt.toISOString().split('T')[0],
  };
}

interface TaskUpdateBody {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  startDate?: string;
  dueDate?: string;
  assignedTo?: string;
  tags?: string[];
  subtasks?: { id?: string; title: string; completed?: boolean }[];
  projectId?: string;
  dependsOnIds?: string[];
  isDailyTask?: boolean;
  completedBy?: string;
  completedAt?: string;
}

export const PATCH = withMultiTenancy(async (req, { user, params }) => {
  try {
    const { id } = await params;
    const body: TaskUpdateBody = await req.json();
    const { title, description, status, priority, startDate, dueDate, assignedTo, tags, subtasks, projectId, dependsOnIds, isDailyTask, completedBy, completedAt } = body;

    const existing = await prisma.task.findFirst({ where: { id: id as string, businessId: user.businessId } });
    if (!existing) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

    // Diff against existing subtasks instead of deleting and recreating
    if (subtasks && Array.isArray(subtasks)) {
      const existingSubtasks = await prisma.subTask.findMany({ where: { taskId: id as string }, select: { id: true } });
      const existingIds = new Set(existingSubtasks.map((s) => s.id));
      const keepIds = new Set(subtasks.filter((s) => s.id && existingIds.has(s.id)).map((s) => s.id as string));

      const idsToDelete = existingSubtasks.map((s) => s.id).filter((eid) => !keepIds.has(eid));
      if (idsToDelete.length > 0) {
        await prisma.subTask.deleteMany({ where: { id: { in: idsToDelete } } });
      }

      await Promise.all(subtasks.map((s) =>
        s.id && existingIds.has(s.id)
          ? prisma.subTask.update({ where: { id: s.id }, data: { title: s.title, completed: !!s.completed } })
          : prisma.subTask.create({ data: { taskId: id as string, title: s.title, completed: !!s.completed } })
      ));
    }

    const userFullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Team Member';
    const isMovingToDone = status?.toLowerCase() === 'done';
    const isMovingFromDone = status !== undefined && status?.toLowerCase() !== 'done';

    let resolvedCompletedAt = existing.completedAt;
    let resolvedCompletedBy = existing.completedBy;

    if (isMovingToDone) {
      resolvedCompletedAt = completedAt ? new Date(completedAt) : (existing.completedAt || new Date());
      resolvedCompletedBy = completedBy || existing.completedBy || userFullName;
    } else if (isMovingFromDone) {
      resolvedCompletedAt = null;
      resolvedCompletedBy = null;
    }

    const task = await prisma.task.update({
      where: { id: id as string },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(status !== undefined && { status: status.toUpperCase() as TaskStatus }),
        ...(priority !== undefined && { priority: priority.toUpperCase() as TaskPriority }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(assignedTo !== undefined && { assignedTo }),
        ...(tags !== undefined && { tags: Array.isArray(tags) ? tags : [] }),
        ...(projectId !== undefined && { projectId: projectId || null }),
        ...(dependsOnIds !== undefined && { dependsOn: { set: dependsOnIds.map((depId) => ({ id: depId })) } }),
        ...(isDailyTask !== undefined && { isDailyTask: Boolean(isDailyTask) }),
        completedAt: resolvedCompletedAt,
        completedBy: resolvedCompletedBy,
      },
      include: { subtasks: true }
    });

    return NextResponse.json(serialize(task));
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
});

export const DELETE = withMultiTenancy(async (_req, { user, params }) => {
  try {
    const { id } = await params;
    const existing = await prisma.task.findFirst({ where: { id: id as string, businessId: user.businessId } });
    if (!existing) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

    await prisma.task.delete({ where: { id: id as string } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
});
