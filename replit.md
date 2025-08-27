# Bonushunter - AI-Powered Gambling Bonus Recommendation Platform

## Overview

Bonushunter is a comprehensive conversational AI platform designed to help users discover the best-value gambling bonuses across multiple operators, verticals, and territories. The system combines natural language processing with complex bonus evaluation algorithms to provide personalized recommendations through a chat-based interface. Built as a full-stack web application, it serves as an intelligent multi-operator bonus aggregator covering major US operators (DraftKings, FanDuel, BetMGM, Caesars), international brands (Bet365, William Hill), crypto casinos (Stake.com), and various product verticals (sportsbook, casino, poker, crypto) across 15+ jurisdictions including US states and international markets.

## User Preferences

Preferred communication style: Simple, everyday language.

## Deployment Strategy

**Current Setup**: Vercel frontend + Replit backend for MVP development
- Previously used Railway but found deployments unreliable
- Staying with current solution until MVP is complete
- Plan to move to more robust deployment (Replit Reserved VM) post-MVP
- Added reliability improvements: health checks, keepalive endpoints, self-ping system

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript, using Vite for build tooling
- **UI Library**: Shadcn/UI components built on top of Radix UI primitives
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **State Management**: React Query (TanStack Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Chat Interface**: Custom conversational UI with real-time message handling

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints with structured error handling
- **Middleware**: Express middleware for JSON parsing, logging, and error handling
- **Development**: Hot reloading with Vite integration in development mode

### Database & ORM
- **Database**: PostgreSQL with connection pooling
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema**: Comprehensive schema covering users, operators, jurisdictions, bonuses, chat sessions, and recommendations
- **Migrations**: Drizzle Kit for database schema management
- **Connection**: Neon Database serverless PostgreSQL integration

### AI Integration
- **LLM Provider**: OpenAI GPT-5 for natural language processing
- **Intent Recognition**: AI-powered extraction of user preferences (budget, location, game types)
- **Explanation Generation**: AI-generated rationales for bonus recommendations
- **Conversational Flow**: Context-aware chat responses with session management

### Data Layer Design
The system uses a relational data model with the following core entities:
- **Users**: Authentication and preference storage
- **Operators**: Gambling site information with trust scores
- **Jurisdictions**: Legal compliance and geographic restrictions
- **Bonuses**: Detailed bonus terms with complex evaluation criteria
- **Chat Sessions**: Conversation history and context preservation
- **Recommendations**: Scored and ranked bonus suggestions

### Bonus Evaluation Engine
- **Value Calculation**: Multi-factor scoring considering expected value, wagering requirements, and game restrictions
- **Compliance Filtering**: Jurisdiction-based legal compliance checking
- **Ranking Algorithm**: Weighted scoring system incorporating RTP, terms complexity, and user preferences
- **Explanation System**: Transparent rationale generation for recommendation decisions

## External Dependencies

### Core Infrastructure
- **Database**: Neon Database (serverless PostgreSQL)
- **AI Service**: OpenAI API for GPT-5 language model
- **Session Storage**: PostgreSQL-based session management via connect-pg-simple

### Frontend Dependencies
- **UI Components**: Radix UI primitives for accessible component foundation
- **Icons**: Lucide React for consistent iconography
- **Date Handling**: date-fns for date manipulation and formatting
- **Form Validation**: React Hook Form with Zod schema validation
- **Carousel**: Embla Carousel for interactive content display

### Development & Build Tools
- **Build System**: Vite with TypeScript support
- **Code Quality**: ESBuild for production bundling
- **Development**: Replit integration for cloud development environment
- **Database Tooling**: Drizzle Kit for schema management and migrations

### Authentication & Security
- **Session Management**: Express sessions with PostgreSQL storage
- **Input Validation**: Zod schemas for runtime type checking
- **CORS & Security**: Express middleware for secure API endpoints

The architecture emphasizes modularity and separation of concerns, with clear boundaries between the chat interface, recommendation engine, compliance system, and data persistence layers. The system is designed to handle complex bonus evaluation logic while maintaining a simple, conversational user experience.