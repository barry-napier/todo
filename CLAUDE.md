# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Personal Todo Application - a simple, effective todo list management system for individual users. The application is planned to be built with Next.js, TypeScript, Tailwind CSS 4, and shadcn/ui components.

## Tech Stack

- **Frontend Framework:** Next.js (latest) with App Router
- **Language:** TypeScript 5.3.3
- **Styling:** Tailwind CSS 4, shadcn/ui components  
- **Deployment:** Vercel
- **Data Persistence:** localStorage with optional API backup

## Project Setup Commands

Since the project is not yet initialized, use the following to set up:

```bash
# Create Next.js app with TypeScript and Tailwind
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir

# After creation, initialize shadcn/ui
npx shadcn@latest init
```

## Architecture Overview

The application follows a Jamstack architecture with:
- Next.js App Router for both frontend and API routes
- Client-first data strategy using localStorage for instant interactions
- Component-based UI with reusable React components
- Monorepo structure (single Next.js application)

## Core Features (MVP)

1. Add Todo - Quick text entry for new tasks
2. View Todos - Clean list display of all tasks  
3. Mark Complete - Toggle completion status
4. Edit Todo - Modify existing task text
5. Delete Todo - Remove tasks from list
6. Persistence - Save tasks between sessions

## Development Guidelines

- Follow existing code conventions when they exist
- Use shadcn/ui components for UI consistency
- Prioritize simplicity and performance
- Client-side localStorage is primary data store
- API routes provide optional backup/sync

## Key Documentation

- `/docs/project-brief.md` - High-level project requirements and vision
- `/docs/prd.md` - Detailed product requirements
- `/docs/ux-ui-spec.md` - UI/UX specifications
- `/docs/architecture.md` - Full technical architecture details