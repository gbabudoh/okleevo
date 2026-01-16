# Delete Modal Implementation Guide

A reusable `DeleteConfirmationModal` component has been created at `components/DeleteConfirmationModal.tsx`.

## How to Use

### 1. Import the Component
```typescript
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
```

### 2. Add State Variables
```typescript
const [showDeleteModal, setShowDeleteModal] = useState(false);
const [deletingItem, setDeletingItem] = useState<YourItemType | null>(null);
```

### 3. Replace confirm() with Modal Trigger
**Before:**
```typescript
onClick={() => {
  if (confirm('Are you sure?')) {
    // delete logic
  }
}}
```

**After:**
```typescript
onClick={() => {
  setDeletingItem(item);
  setShowDeleteModal(true);
}}
```

### 4. Add Modal Component
```typescript
<DeleteConfirmationModal
  isOpen={showDeleteModal}
  onClose={() => {
    setShowDeleteModal(false);
    setDeletingItem(null);
  }}
  onConfirm={() => {
    // Your delete logic here
    setItems(items.filter(i => i.id !== deletingItem.id));
    alert('✓ Item deleted successfully');
  }}
  title="Delete Item"
  itemName={deletingItem?.name || ''}
  itemDetails={deletingItem?.description}
  warningMessage="This will permanently remove all associated data."
/>
```

## Files to Update

### ✅ Completed
- [x] `app/dashboard/crm/page.tsx` - Client deletion

### 🔄 Pending Updates

1. **app/dashboard/expenses/page.tsx**
   - Line 108: `handleDeleteExpense` function
   - Item: Expense
   - Details: `${expense.title} - £${expense.amount}`

2. **app/dashboard/tasks/page.tsx**
   - Line 81: `handleDeleteTask` function
   - Item: Task
   - Details: Task title and status

3. **app/dashboard/invoicing/page.tsx**
   - Line 641: Invoice deletion in menu
   - Item: Invoice
   - Details: `${invoice.id} - £${invoice.amount}`

4. **app/dashboard/forms/page.tsx**
   - Line 64: `handleDeleteForm` function
   - Item: Form
   - Details: Form name and response count

5. **app/dashboard/campaigns/page.tsx**
   - Line 138: `handleDeleteCampaign` function
   - Item: Campaign
   - Details: Campaign name and status

6. **app/dashboard/booking/page.tsx**
   - Line 63: `handleDeleteBooking` function
   - Item: Booking
   - Details: Client name and date

7. **app/dashboard/helpdesk/page.tsx**
   - Line 99: `handleDeleteTicket` function
   - Item: Ticket
   - Details: Ticket title and priority

8. **app/dashboard/hr-records/page.tsx**
   - Lines 707, 858: Employee deletion
   - Item: Employee
   - Details: `${employee.firstName} ${employee.lastName} - ${employee.position}`

9. **app/dashboard/micro-pages/page.tsx**
   - Lines 511, 671: Page deletion
   - Item: Page
   - Details: Page title and URL

10. **app/dashboard/compliance/page.tsx**
    - Line 460: `handleDelete` function
    - Item: Compliance Item
    - Details: Item title and category

11. **app/dashboard/cashflow/page.tsx**
    - Line 425: Transaction deletion
    - Item: Transaction
    - Details: `${transaction.description} - £${transaction.amount}`

## Benefits

✅ **Consistent UX** - Same delete experience across all pages
✅ **Safety** - Requires typing "DELETE" to confirm
✅ **Professional** - Modern, polished UI
✅ **Informative** - Shows what's being deleted with details
✅ **Accessible** - Keyboard support (Enter to confirm)
✅ **Maintainable** - Single component to update

## Example Implementation

See `app/dashboard/crm/page.tsx` for a complete working example.
