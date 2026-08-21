import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';
import { TaskPriority } from '@/lib/prisma-client';

export const GET = withMultiTenancy(async (_req, { dataFilter }) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const completedTasksToday = await prisma.task.findMany({
      where: {
        businessId: dataFilter.businessId,
        status: 'DONE',
        OR: [
          { completedAt: { gte: todayStart } },
          { updatedAt: { gte: todayStart } },
        ],
      },
      include: {
        user: { select: { firstName: true, lastName: true, email: true, avatar: true } },
      },
      orderBy: { completedAt: 'desc' },
    });

    const recentCompletedTasks = await prisma.task.findMany({
      where: {
        businessId: dataFilter.businessId,
        status: 'DONE',
      },
      include: {
        user: { select: { firstName: true, lastName: true, email: true, avatar: true } },
      },
      orderBy: { completedAt: 'desc' },
      take: 15,
    });

    const teamMembers = await prisma.user.findMany({
      where: { businessId: dataFilter.businessId, status: 'ACTIVE' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        avatar: true,
      },
      orderBy: { firstName: 'asc' },
    });

    const formattedToday = completedTasksToday.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      completedBy: t.completedBy || (t.user ? `${t.user.firstName} ${t.user.lastName}`.trim() : 'Team Member'),
      completedAt: t.completedAt || t.updatedAt,
      priority: t.priority.toLowerCase(),
      isDailyTask: t.isDailyTask,
    }));

    const formattedRecent = recentCompletedTasks.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      completedBy: t.completedBy || (t.user ? `${t.user.firstName} ${t.user.lastName}`.trim() : 'Team Member'),
      completedAt: t.completedAt || t.updatedAt,
      priority: t.priority.toLowerCase(),
      isDailyTask: t.isDailyTask,
    }));

    return NextResponse.json({
      todayCount: formattedToday.length,
      todayCompletions: formattedToday,
      recentCompletions: formattedRecent,
      teamMembers: teamMembers.map((m) => ({
        id: m.id,
        name: `${m.firstName || ''} ${m.lastName || ''}`.trim() || m.email,
        email: m.email,
        role: m.role,
        avatar: m.avatar,
      })),
    });
  } catch (error) {
    console.error('Error fetching DTC data:', error);
    return NextResponse.json({ error: 'Failed to fetch DTC data' }, { status: 500 });
  }
});

export const POST = withMultiTenancy(async (req, { user }) => {
  try {
    const body = await req.json();
    const { title, description, priority, tags, teamMemberName, teamMemberUserId, completedDate, completedTime } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Daily deliverable title is required' }, { status: 400 });
    }

    const defaultUserName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Team Member';
    const signerName = (teamMemberName && teamMemberName.trim()) ? teamMemberName.trim() : defaultUserName;
    const assignedUserId = teamMemberUserId || user.id;

    // Parse custom completion timestamp (date + time)
    let completionDateTime = new Date();
    if (completedDate) {
      const parts = completedDate.split('-').map(Number);
      if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
        let hours = completionDateTime.getHours();
        let minutes = completionDateTime.getMinutes();
        if (completedTime) {
          const tParts = completedTime.split(':').map(Number);
          if (tParts.length >= 2 && !isNaN(tParts[0]) && !isNaN(tParts[1])) {
            hours = tParts[0];
            minutes = tParts[1];
          }
        }
        completionDateTime = new Date(parts[0], parts[1] - 1, parts[2], hours, minutes, 0);
      }
    }

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        status: 'DONE',
        priority: (priority?.toUpperCase() || 'MEDIUM') as TaskPriority,
        isDailyTask: true,
        completedAt: completionDateTime,
        completedBy: signerName,
        assignedTo: signerName,
        tags: Array.isArray(tags) ? tags : ['daily-signoff'],
        businessId: user.businessId,
        userId: assignedUserId,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: task.id,
        title: task.title,
        description: task.description,
        completedBy: task.completedBy,
        completedAt: task.completedAt,
        priority: task.priority.toLowerCase(),
        isDailyTask: task.isDailyTask,
      },
    });
  } catch (error) {
    console.error('Error logging daily task completion:', error);
    return NextResponse.json({ error: 'Failed to record daily completion' }, { status: 500 });
  }
});
