import { NextRequest, NextResponse } from 'next/server';

// Get all contacts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // TODO: Fetch from database
    const mockContacts = {
      data: [
        {
          id: '1',
          name: 'John Smith',
          email: 'john@example.com',
          phone: '07123456789',
          company: 'ABC Ltd',
          status: 'active',
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Jane Doe',
          email: 'jane@example.com',
          phone: '07987654321',
          company: 'XYZ Corp',
          status: 'lead',
          createdAt: new Date().toISOString(),
        },
      ],
      pagination: {
        page,
        limit,
        total: 2,
        totalPages: 1,
      },
    };

    return NextResponse.json(mockContacts);
  } catch (error) {
    console.error('CRM GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    );
  }
}

// Create new contact
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, company } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // TODO: Save to database
    const newContact = {
      id: Date.now().toString(),
      name,
      email,
      phone: phone || '',
      company: company || '',
      status: 'lead',
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(newContact, { status: 201 });
  } catch (error) {
    console.error('CRM POST Error:', error);
    return NextResponse.json(
      { error: 'Failed to create contact' },
      { status: 500 }
    );
  }
}

// Update contact
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Contact ID is required' },
        { status: 400 }
      );
    }

    // TODO: Update in database
    const updatedContact = {
      id,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(updatedContact);
  } catch (error) {
    console.error('CRM PUT Error:', error);
    return NextResponse.json(
      { error: 'Failed to update contact' },
      { status: 500 }
    );
  }
}

// Delete contact
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Contact ID is required' },
        { status: 400 }
      );
    }

    // TODO: Delete from database
    return NextResponse.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('CRM DELETE Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete contact' },
      { status: 500 }
    );
  }
}
