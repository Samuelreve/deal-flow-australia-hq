
# Progress Nudging System

This system automatically monitors deals and milestones for inactivity or missed deadlines and sends notifications to the relevant users to keep the deal moving forward.

## How It Works

The progress nudging system:

1. **Checks for overdue milestones**:
   - Finds milestones with a due date in the past and status not "completed"
   - Sends notifications to assigned users or all deal participants

2. **Identifies stalled deals**:
   - Finds deals with no updates for more than 7 days
   - Sends notifications to all participants (seller, buyer, etc.)

3. **Performs detailed activity checks**:
   - Examines recent document uploads, comments, and milestone updates
   - Sends notifications when there's been no activity across all aspects of a deal

## Notification Types

The system creates notifications with different types:

- `warning` - For stalled deals
- `error` - For overdue milestones
- `info` - For general activity reminders

## Configuration

The progress nudging function runs on a schedule (typically daily) using pg_cron. The schedule can be adjusted by modifying the cron expression in the SQL script.

To adjust the sensitivity of the system:
- Change the `inactiveDays` parameter (default: 7 days) in the function calls
- Modify notification recipients based on user roles
- Customize notification messages as needed

## Manual Execution

You can manually trigger the progress nudging check by invoking the edge function directly:

```
curl -X POST https://[PROJECT_REF].supabase.co/functions/v1/progress-nudging \
  -H "Authorization: Bearer [ANON_KEY]"
```

## Troubleshooting

If notifications are not being generated:

1. Check the edge function logs for any errors
2. Verify that the cron job is properly scheduled
3. Ensure there are actually deals/milestones that meet the criteria for notifications

## Development Notes

- The function uses the Supabase service role key to access the database
- Notifications are created in the `notifications` table
- Each notification includes a link to the relevant deal
