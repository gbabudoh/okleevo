// Notification service for in-app notifications
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: Date;
  link?: string;
}

export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: Notification['type'] = 'info',
  link?: string
): Promise<Notification> {
  // TODO: Save to database
  const notification: Notification = {
    id: Date.now().toString(),
    userId,
    title,
    message,
    type,
    read: false,
    createdAt: new Date(),
    link,
  };

  return notification;
}

export async function markAsRead(notificationId: string): Promise<boolean> {
  try {
    // TODO: Update in database
    console.log('Marking notification as read:', notificationId);
    return true;
  } catch (error) {
    console.error('Mark as read error:', error);
    return false;
  }
}

export async function getUserNotifications(userId: string, limit = 20): Promise<Notification[]> {
  try {
    // TODO: Fetch from database
    return [];
  } catch (error) {
    console.error('Get notifications error:', error);
    return [];
  }
}

export async function deleteNotification(notificationId: string): Promise<boolean> {
  try {
    // TODO: Delete from database
    console.log('Deleting notification:', notificationId);
    return true;
  } catch (error) {
    console.error('Delete notification error:', error);
    return false;
  }
}

// Notification templates
export const NotificationTemplates = {
  invoicePaid: (invoiceNumber: string) => ({
    title: 'Invoice Paid',
    message: `Invoice ${invoiceNumber} has been paid successfully.`,
    type: 'success' as const,
  }),
  taskAssigned: (taskTitle: string) => ({
    title: 'New Task Assigned',
    message: `You have been assigned to: ${taskTitle}`,
    type: 'info' as const,
  }),
  paymentFailed: (amount: string) => ({
    title: 'Payment Failed',
    message: `Payment of ${amount} could not be processed.`,
    type: 'error' as const,
  }),
  subscriptionExpiring: (daysLeft: number) => ({
    title: 'Subscription Expiring',
    message: `Your subscription will expire in ${daysLeft} days.`,
    type: 'warning' as const,
  }),
};
