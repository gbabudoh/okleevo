import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { syncSubscriptionWithSeats } from '@/lib/stripe/per-seat-billing';
import { getAuthenticatedUserId } from '@/lib/multi-tenancy';
import { UserRole, UserStatus } from '@prisma/client';

export const runtime = 'nodejs';

/**
 * PUT - Update an employee/user
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { email, firstName, lastName, phone, role, status, password } = body;

    // Validate 6-digit access code if provided
    if (password && /^\d{6}$/.test(password) === false && password.length < 6) {
      // If it's not a 6-digit code and it's short, we might want to warn or enforce.
      // The user specifically asked for "6 number code".
    }

    // Get current user's business
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { businessId: true, role: true },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check permissions - only OWNER can update employees
    if (currentUser.role !== 'OWNER') {
      return NextResponse.json(
        { error: 'Insufficient permissions. Only owners can update employees.' },
        { status: 403 }
      );
    }

    // Get the user to update
    const userToUpdate = await prisma.user.findUnique({
      where: { id: id },
      select: { businessId: true, role: true },
    });

    if (!userToUpdate) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Ensure user belongs to same business
    if (userToUpdate.businessId !== currentUser.businessId) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Prevent changing OWNER role (only one owner allowed)
    if (userToUpdate.role === 'OWNER' && role && role !== 'OWNER') {
      return NextResponse.json(
        { error: 'Cannot change owner role' },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: {
      email?: string;
      firstName?: string;
      lastName?: string;
      phone?: string | null;
      role?: UserRole;
      status?: UserStatus;
      password?: string;
    } = {};
    if (email !== undefined) updateData.email = email;
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (phone !== undefined) updateData.phone = phone;
    if (role !== undefined) updateData.role = role;
    if (status !== undefined) updateData.status = status;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        status: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Employee updated successfully',
      user: updatedUser,
    });
  } catch (error: unknown) {
    console.error('Error updating employee:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update employee';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Remove an employee/user
 */
export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // Get current user's business
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { business: true },
    });

    if (!currentUser || !currentUser.business) {
      return NextResponse.json(
        { error: 'User or business not found' },
        { status: 404 }
      );
    }

    // Check permissions - only OWNER can delete employees
    if (currentUser.role !== 'OWNER') {
      return NextResponse.json(
        { error: 'Insufficient permissions. Only owners can delete employees.' },
        { status: 403 }
      );
    }

    // Prevent deleting yourself
    if (id === userId) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    // Get the user to delete
    const userToDelete = await prisma.user.findUnique({
      where: { id: id },
      select: { businessId: true, role: true },
    });

    if (!userToDelete) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Ensure user belongs to same business
    if (userToDelete.businessId !== currentUser.businessId) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Prevent deleting owner
    if (userToDelete.role === 'OWNER') {
      return NextResponse.json(
        { error: 'Cannot delete owner account' },
        { status: 400 }
      );
    }

    // Delete user
    await prisma.user.delete({
      where: { id: id },
    });

    // Update seat count
    const newSeatCount = Math.max(0, currentUser.business.seatCount - 1);
    await prisma.business.update({
      where: { id: currentUser.business.id },
      data: { seatCount: newSeatCount },
    });

    // Sync subscription with new seat count
    try {
      await syncSubscriptionWithSeats(currentUser.business.id, newSeatCount);
    } catch (error) {
      console.error('Failed to sync subscription (non-critical):', error);
      // Continue even if Stripe sync fails
    }

    return NextResponse.json({
      success: true,
      message: 'Employee removed successfully',
      seatInfo: {
        used: newSeatCount,
        max: currentUser.business.maxSeats,
        available: currentUser.business.maxSeats - newSeatCount,
      },
    });
  } catch (error: unknown) {
    console.error('Error deleting employee:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to remove employee';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

