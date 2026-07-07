# Messaging Privacy & Deletion

Knight Market gives students control over their chats while keeping safety moderation possible.

## User controls

| Action | What it does | Scope |
|--------|--------------|-------|
| **Delete message** | Soft-deletes a message you sent. The bubble becomes "Message deleted" for everyone. | Only the sender can delete their own message. |
| **Delete conversation** | Removes a conversation from *your* inbox. | Current user only — the other person still sees it. |

### Delete message (soft delete for everyone)

- Only the **sender** can delete their own message (enforced by RLS: `sender_id = auth.uid()`).
- The row is **never hard-deleted** from the client. `deleted_at` / `deleted_by` are set and the app renders "Message deleted".
- The other participant sees "Message deleted" live (realtime listens to message `UPDATE` events).
- Deleted messages do **not** count toward unread and do not show a Report button.
- The original body is retained in the database so a reported message can still be reviewed for safety.

### Delete / hide conversation (delete for me)

- Sets the current user's per-participant timestamp (`buyer_deleted_at` or `seller_deleted_at`).
- The conversation disappears from that user's inbox only.
- It **reappears** if the other participant sends a newer message (activity after the hide timestamp).
- The conversation row and its messages are never hard-deleted.

## Admin / moderation privacy

- The admin dashboard does **not** display raw message bodies. It shows the report target id, reporter context, and readable target labels.
- Admins should **only inspect message content when reviewing a safety report**, and only remove content that violates safety or beta rules.
- Admin moderation (`is_hidden` / hide-for-moderation from `003`) is separate from user deletion and still works.

## Database owner note (plaintext storage)

- Message bodies are stored in **plaintext** in `public.messages.body` for delivery and safety moderation.
- A database owner can technically read these rows in the Supabase table editor.
- **Policy:** Knight Market does not inspect private messages except when reviewing a safety report.
- **Future option:** end-to-end encryption would prevent the server (and moderators) from reading content. Because that also removes the ability to review reported messages, it is intentionally **out of scope for the private beta**.

## SQL

Apply [`supabase/sql/012_message_deletion_privacy.sql`](../supabase/sql/012_message_deletion_privacy.sql):

- Adds `deleted_at`, `deleted_by`, `deletion_reason` to `messages` (+ index).
- Adds `buyer_deleted_at`, `seller_deleted_at` to `conversations` (+ indexes).
- Adds a `messages_update_own_sender` RLS policy so a sender can set deletion fields on their own rows only.
- Conversation hide uses the existing participant `UPDATE` policy (from `002`); the app only writes the current user's own hide column.

The patch is idempotent and safe to re-run.
