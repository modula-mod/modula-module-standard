# CRM Module Example

Shell mode: `dashboard`

Surfaces:
- board
- route
- team
- business
- profile
- marketplace

Permissions:
- contacts: required, medium risk, stores lead/contact records.
- team-data: optional, medium risk, shared pipeline ownership.
- notifications: optional, medium risk, reminders and follow-ups.

Navigation:
- `/module/crm`
- routes for leads, pipeline, contacts, tasks, analytics, and settings.

Actions:
- create lead
- update deal
- assign owner
- complete follow-up
- export contacts

Data collections:
- leads
- contacts
- deals
- activities
- tasks

UI contract shape:
- dashboard screen with compact metrics.
- list/detail pipeline screens.
- team/business owner scope.

Security risks:
- Personal/business contact data.
- Export actions.
- Team permission boundaries.

