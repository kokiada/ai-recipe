# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is "らくらく献立 (RakuRaku Menu)" - a Japanese housewife-focused meal planning app built with Next.js and React. The app aims to solve the daily "What should I cook today?" problem by providing instant meal suggestions in under 3 seconds, with features for ingredient management and shopping list generation.

## Architecture
- **Frontend**: Next.js 15.2.4 with React 19, TypeScript, and Tailwind CSS v4
- **UI Components**: shadcn/ui with Radix UI primitives in "new-york" style
- **Icons**: Lucide React
- **Styling**: Tailwind CSS with CSS variables, neutral base color
- **Working Directory**: All development happens in the `/Src` directory

## Development Commands
Run these commands from the `/Src` directory:

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production bundle  
- `npm start` - Start production server
- `npm run lint` - Run ESLint checks

## Code Structure
- **App Router**: Using Next.js 13+ app directory structure (`app/` folder)
- **Components**: UI components in `components/ui/` following shadcni patterns
- **Utilities**: Helper functions in `lib/utils.ts`
- **Fonts**: Geist Sans and Geist Mono configured in layout
- **Path Aliases**: `@/` maps to the root directory for imports

## UI Design Principles
Based on the requirements document, prioritize:
- Large, finger-friendly buttons (44px+)
- Simple screens (max 3 functions per screen)
- Large, readable text (16px+)
- Focus on speed and simplicity for busy housewives
- Japanese language support

## Key Features to Implement
1. **Instant meal suggestions** (main feature - 3-second response time)
2. **Simple ingredient management** (30 main ingredients with tap toggles)
3. **Auto-generated shopping lists** (organized by store layout)
4. **Family-size meal planning** (configurable family composition)
5. **Seasonal and preference-based recommendations**

## Technical Requirements
- Target: 30-second app startup to meal decision
- Support offline basic functionality  
- Responsive design for mobile-first experience
- Performance optimized for quick interactions