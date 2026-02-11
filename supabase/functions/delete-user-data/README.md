# Delete User Data Edge Function

## Overview
This Supabase Edge Function handles the complete deletion of user financial data, including:
- Disconnecting all Pluggy bank connections
- Deleting all connection items from the database
- Cascade deletion of related accounts and transactions

## Deployment

### Prerequisites
- Supabase CLI installed
- Supabase project configured
- Environment variables set in Supabase dashboard

### Required Environment Variables
Make sure these are set in your Supabase project:
- `PLUGGY_CLIENT_ID`
- `PLUGGY_CLIENT_SECRET`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### Deploy Command
```bash
# Navigate to the project root
cd /path/to/finance-app

# Deploy the function
supabase functions deploy delete-user-data
```

## Usage

### From the App
The function is automatically called when a user confirms data deletion in the Settings screen.

### Manual Testing
```bash
# Get your user's auth token first
curl -X POST 'https://your-project.supabase.co/functions/v1/delete-user-data' \
  -H 'Authorization: Bearer YOUR_USER_TOKEN' \
  -H 'Content-Type: application/json'
```

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "All data deleted successfully",
  "pluggy_deletions": [
    {
      "pluggy_item_id": "item_123",
      "status": "deleted"
    }
  ],
  "items_deleted": 2
}
```

### Error Response
```json
{
  "error": "Error message",
  "details": "Detailed error information"
}
```

## Security
- Function requires valid user authentication
- Only deletes data for the authenticated user
- Uses RLS policies to ensure data isolation
- Cascade deletion ensures all related data is removed

## Database Impact
When this function runs, it will:
1. Delete all rows from `connection_items` for the user
2. Automatically cascade delete all related `accounts`
3. Automatically cascade delete all related `transactions`

This is handled by the `ON DELETE CASCADE` constraints in the database schema.
