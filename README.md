# Retail Management System

A generic, single-store retail management system.

## Tech Stack

- Backend: Node.js, Express, PostgreSQL
- Web: React
- Mobile: React Native (iOS & Android)
- Hosting: Render

## ID Generation Strategy

All primary keys are UUIDs generated in application code.
The database does not generate UUID defaults.

Reason:

- Avoid DB extensions
- Cloud-provider agnostic
- Explicit control over identifiers
