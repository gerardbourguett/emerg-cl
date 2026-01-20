# Agent Architecture Guide

## Overview
This repository contains the full stack application for Emergencias Chile.

## Subagents
We define "Subagents" as specialized contexts for different parts of the application.

### Backend Agent
- location: `packages/backend`
- context: `packages/backend/AGENT_CONTEXT.md`
- focus: Hono API, Database migrations, PostGIS.

### Frontend Agent
- location: `packages/frontend`
- context: `packages/frontend/AGENT_CONTEXT.md`
- focus: React components, Tailwind styling, Mapbox/Leaflet integrations.

## Workflows
- **Running Dev**: `bun install` root, then `bun run dev` in respective packages.
