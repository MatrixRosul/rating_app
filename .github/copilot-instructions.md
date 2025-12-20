# Billiard Rating System - Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

This is a Next.js TypeScript application for tracking billiard player ratings and match history.

## Project Overview
- **Technology Stack**: Next.js 15, React, TypeScript, Tailwind CSS
- **Purpose**: Rating system for billiard players with Codeforces-like rating system
- **Key Features**: Player leaderboard, match simulation, rating calculations, player profiles

## Rating System
- Based on Codeforces rating system with color coding:
  - Newbie: Gray (0-1199)
  - Pupil: Green (1200-1399)  
  - Specialist: Cyan (1400-1599)
  - Expert: Blue (1600-1899)
  - Candidate Master: Purple (1900-2099)
  - Master: Orange (2100-2299)
  - International Master: Orange (2300-2399)
  - Grandmaster: Red (2400+)

## Code Conventions
- Use TypeScript for all components and utilities
- Follow React best practices with hooks and functional components
- Use Tailwind CSS for styling
- Implement proper error handling and loading states
- Use proper TypeScript interfaces for data structures

## Key Components to Create
- Player list with ratings and colors
- Player profile pages with match history
- Match input/simulation system
- Rating calculation algorithms
- Responsive design for mobile and desktop

## Data Structures
- Player: { id, name, rating, matches[], createdAt }
- Match: { id, player1Id, player2Id, winner, date, ratingChange }
- Rating calculation should follow ELO-like system adapted for billiards

Please ensure all code follows modern React/Next.js patterns and includes proper TypeScript typing.
