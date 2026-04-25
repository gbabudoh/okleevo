import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const form = await prisma.form.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        status: true,
        fieldList: true,
      },
    });

    if (!form || form.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Form not found or inactive' }, { status: 404 });
    }

    return NextResponse.json(form);
  } catch (error) {
    console.error('Error fetching public form:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
