import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';
import { Task, SubTask, TaskPriority } from '@/lib/prisma-client';

function serialize(t: Task & { subtasks?: SubTask[] }) {
  return {
    ...t,
    status: t.status.toLowerCase(),
    priority: t.priority.toLowerCase(),
    dueDate: t.dueDate ? t.dueDate.toISOString().split('T')[0] : '',
    createdAt: t.createdAt.toISOString().split('T')[0],
  };
}

export const GET = withMultiTenancy(async (_req, { dataFilter }) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { businessId: dataFilter.businessId },
      include: { subtasks: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(tasks.map(serialize));
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
});

interface TaskBody {
  title: string;
  description?: string;
  priority?: string;
  dueDate?: string;
  assignedTo?: string;
  tags?: string | string[];
  subtasks?: { title: string; completed?: boolean }[];
}

export const POST = withMultiTenancy(async (req, { user }) => {
  try {
    const body: TaskBody = await req.json();
    const { title, description, priority, dueDate, assignedTo, tags, subtasks } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Task title is required' }, { status: 400 });
    }

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        priority: (priority?.toUpperCase() || 'MEDIUM') as TaskPriority,
        dueDate: dueDate ? new Date(dueDate) : null,
        assignedTo: assignedTo || null,
        tags: Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map((s: string) => s.trim()) : []),
        businessId: user.businessId,
        userId: user.id,
        subtasks: {
          create: Array.isArray(subtasks) ? subtasks.map((s) => ({
            title: s.title,
            completed: !!s.completed
          })) : []
        }
      },
      include: { subtasks: true }
    });

    return NextResponse.json(serialize(task));
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
});
