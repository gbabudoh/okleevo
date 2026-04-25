import { NextResponse } from 'next/server';
import { withMultiTenancy } from '@/lib/api/with-multi-tenancy';
import { prisma } from '@/lib/prisma';
import { ContactStatus } from '@/lib/prisma-client';

export const GET = withMultiTenancy(async (req, { dataFilter }) => {
  try {
    const contacts = await prisma.contact.findMany({
      where: {
        businessId: dataFilter.businessId,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json(contacts);
  } catch (error: unknown) {
    console.error('CRM GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 });
  }
});

export const POST = withMultiTenancy(async (req, { user }) => {
  try {
    const body = await req.json();
    const { 
      name, email, phone, company, position, address, 
      status, clientType, pipelineStage, revenue, tags, notes 
    } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const contact = await prisma.contact.create({
      data: {
        name,
        email,
        phone,
        company,
        position,
        address,
        status: (status?.toUpperCase() as ContactStatus) || 'LEAD',
        clientType: clientType || 'business',
        pipelineStage: pipelineStage || 'new',
        revenue: parseFloat(revenue) || 0,
        tags: tags || [],
        notes,
        businessId: user.businessId,
        userId: user.id,
      },
    });

    return NextResponse.json(contact);
  } catch (error: unknown) {
    console.error('CRM POST Error:', error);
    return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 });
  }
});

export const PUT = withMultiTenancy(async (req, { user }) => {
  try {
    const body = await req.json();
    const { 
      id, name, email, phone, company, position, address, 
      status, clientType, pipelineStage, revenue, tags, notes 
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'Contact ID is required' }, { status: 400 });
    }

    // Check ownership
    const existing = await prisma.contact.findFirst({
      where: { id, businessId: user.businessId }
    });

    if (!existing) {
      return NextResponse.json({ error: 'Contact not found or unauthorized' }, { status: 404 });
    }

    const contact = await prisma.contact.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        company,
        position,
        address,
        status: (status?.toUpperCase() as ContactStatus),
        clientType,
        pipelineStage,
        revenue: revenue !== undefined ? parseFloat(revenue) : undefined,
        tags,
        notes,
        lastContact: new Date(),
      },
    });

    return NextResponse.json(contact);
  } catch (error: unknown) {
    console.error('CRM PUT Error:', error);
    return NextResponse.json({ error: 'Failed to update contact' }, { status: 500 });
  }
});

export const DELETE = withMultiTenancy(async (req, { user }) => {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Contact ID is required' }, { status: 400 });
    }

    const { count } = await prisma.contact.deleteMany({
      where: {
        id,
        businessId: user.businessId,
      },
    });

    if (count === 0) {
      return NextResponse.json({ error: 'Contact not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('CRM DELETE Error:', error);
    return NextResponse.json({ error: 'Failed to delete contact' }, { status: 500 });
  }
});
