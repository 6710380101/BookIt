# Security Specification: BookIt School

## Data Invariants
1. A booking cannot be created without a valid `userId` matching `request.auth.uid`.
2. A new user document created via registration must default to `role == 'student'` unless created/promoted by an existing admin.
3. Ordinary users (students, teachers) can only read their own bookings or view approved bookings schedule; they can only cancel (`status: 'cancelled'`) their own pending/approved bookings.
4. Only administrators (`role == 'admin'`) can approve (`status: 'approved'`), reject (`status: 'rejected'`), or modify other users' bookings and user roles.
5. Double booking constraint: A booking cannot overlap in time with another approved booking for the same room on the same date.
6. Rooms can only be modified (create, update, delete) by administrators. All authenticated users can read active rooms.

## The Dirty Dozen Payloads
1. **Privilege Escalation on Register**: Non-admin user sets `role: 'admin'` during registration. (BLOCKED: user creation restricts role to 'student' unless caller is admin).
2. **Ghost Field Shadow Update**: Updating booking with arbitrary unauthorized fields like `overridePermission: true`. (BLOCKED: strict affectedKeys checks).
3. **Impersonated Booking Creation**: User A creates a booking with `userId: 'user_B'`. (BLOCKED: `request.resource.data.userId == request.auth.uid`).
4. **Unauthorized Status Change**: Student approves their own booking `status: 'approved'`. (BLOCKED: status modification to approved/rejected restricted to admin).
5. **Role Modification by Self**: Student changes their role in `/users/{userId}` to 'teacher' or 'admin'. (BLOCKED: role field modifications restricted to admin).
6. **Denial of Wallet - Giant String**: Inserting a 500KB string into `purpose` or `name`. (BLOCKED: string size limits enforced).
7. **Cross-User Booking Deletion**: Student A deletes or cancels Student B's booking. (BLOCKED: ownership check `resource.data.userId == request.auth.uid`).
8. **Malicious Room Deletion**: Non-admin deletes a room record. (BLOCKED: admin check required for room writes).
9. **Unauthenticated Query Scrape**: Anonymous client attempts `get` or `list` on users or bookings. (BLOCKED: `request.auth != null`).
10. **Forged Email Identity**: User sets email to admin email without corresponding auth. (BLOCKED: email must match auth token).
11. **Altering Immutable Booking Date/Room**: User tries to change `roomId` or `date` of an already approved booking without admin rights. (BLOCKED: affectedKeys on update).
12. **Double Booking Bypass**: Booking creation over an existing approved slot. (Checked via application transaction query and status enforcement).
