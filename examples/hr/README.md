# HR Module Example

Shell mode: `dashboard`

Surfaces:
- board
- route
- team
- business
- settings
- marketplace

Permissions:
- team-data: required, high risk, stores employee and team records.
- documents: optional, high risk, manages HR files.
- notifications: optional, medium risk, reminders and approvals.

Navigation:
- `/module/hr`
- employees, time-off, documents, reviews, and settings routes.

Actions:
- create employee
- request time off
- approve request
- export report

Data collections:
- employees
- time-off-requests
- documents
- reviews
- audit-events

UI contract shape:
- dashboard with policy-aware status cards.
- approval lists.
- employee detail views.

Security risks:
- Sensitive employment records.
- Role-based access is required before public marketplace release.
- Audit trails must be immutable.
