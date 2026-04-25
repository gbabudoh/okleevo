import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';
import { Task, SubTask, TaskStatus, TaskPriority } from '@/lib/prisma-client';

function serialize(t: Task & { subtasks?: SubTask[] }) {
  return {
    ...t,
    status: t.status.toLowerCase(),
    priority: t.priority.toLowerCase(),
    dueDate: t.dueDate ? t.dueDate.toISOString().split('T')[0] : '',
    createdAt: t.createdAt.toISOString().split('T')[0],
  };
}

interface TaskUpdateBody {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: string;
  assignedTo?: string;
  tags?: string[];
  subtasks?: { title: string; completed?: boolean }[];
}

export const PATCH = withMultiTenancy(async (req, { user, params }) => {
  try {
    const { id } = await params;
    const body: TaskUpdateBody = await req.json();
    const { title, description, status, priority, dueDate, assignedTo, tags, subtasks } = body;

    const existing = await prisma.task.findFirst({ where: { id: id as string, businessId: user.businessId } });
    if (!existing) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

    // Handle subtasks update: simple way is to delete and recreate or update individually
    // Here we'll do a simple update/create/delete logic for subtasks
    if (subtasks && Array.isArray(subtasks)) {
      // For simplicity in this step, we delete all and recreate
      await prisma.subTask.deleteMany({ where: { taskId: id as string } });
      await prisma.subTask.createMany({
        data: subtasks.map((s) => ({
          taskId: id as string,
          title: s.title,
          completed: !!s.completed
        }))
      });
    }

    const task = await prisma.task.update({
      where: { id: id as string },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(status !== undefined && { status: status.toUpperCase() as TaskStatus }),
        ...(priority !== undefined && { priority: priority.toUpperCase() as TaskPriority }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(assignedTo !== undefined && { assignedTo }),
        ...(tags !== undefined && { tags: Array.isArray(tags) ? tags : [] }),
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
