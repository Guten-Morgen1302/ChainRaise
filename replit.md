# Overview

CryptoFund is a full-stack Web3 crowdfunding platform that combines the features of Kickstarter, GoFundMe, and AngelList with blockchain transparency and a cyberpunk-styled glassmorphism UI. The platform enables creators to launch fundraising campaigns after KYC verification and allows backers to contribute using both cryptocurrency and fiat payments, with all transactions recorded on-chain for transparency.

## Migration Status
**COMPLETED** - Successfully migrated from Replit Agent to standard Replit environment (August 14, 2025)
- Fixed all critical errors identified in the analysis
- Database seeded with sample campaigns and users
- Authentication system working properly
- Images loading correctly with Unsplash integration
- Fixed Three.js shader errors (removed color attribute conflict)
- Added CORS middleware for proper API communication
- Fixed login redirect issue (buttons now go to /auth instead of /api/login)
- Added placeholder image endpoint and updated campaign images

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Radix UI primitives with custom components following the shadcn/ui design system
- **Styling**: Tailwind CSS with custom cyberpunk and glassmorphism themes, CSS variables for theming
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Forms**: React Hook Form with Zod validation
- **Animations**: Framer Motion for smooth transitions and effects

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API endpoints under `/api` prefix
- **Development**: Hot module replacement with Vite integration in development mode
- **Error Handling**: Centralized error middleware with proper HTTP status codes

## Authentication & Authorization
- **Provider**: Manual username/password authentication system
- **Session Management**: Express sessions with PostgreSQL storage using connect-pg-simple
- **Strategy**: Passport.js with Local Strategy for username/password authentication
- **Password Security**: Scrypt hashing with salt for secure password storage
- **User Management**: Manual user registration and login with form validation

## Database & ORM
- **Database**: PostgreSQL with connection via environment variable
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema**: Strongly typed schema definitions with Zod validation
- **Migrations**: Drizzle Kit for database schema management

## Key Data Models
- **Users**: Profile management with KYC status and wallet integration
- **Campaigns**: Full campaign lifecycle with funding types (donation/reward/equity)
- **Contributions**: Transaction tracking with multiple payment methods
- **Transactions**: Blockchain transaction logging
- **AI Interactions**: Campaign optimization and suggestions

## Blockchain Integration
- **Network**: Polygon Mumbai testnet for development
- **Web3 Provider**: Mock blockchain utilities simulating real Web3 interactions
- **Smart Contracts**: Campaign contract addresses for different funding types
- **Payment Methods**: Support for ETH, MATIC, USDC, and fiat payments

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm & drizzle-zod**: Database ORM and validation
- **express & passport**: Web framework and authentication
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI component primitives

### Development Tools
- **Vite**: Build tool and dev server with HMR
- **TypeScript**: Type safety across the stack
- **Tailwind CSS**: Utility-first CSS framework
- **@replit/vite-plugin-***: Replit-specific development plugins

### Payment Integration
- Mock implementations for:
- **Stripe/Razorpay**: Fiat payment processing
- **MetaMask**: Crypto wallet integration
- **Polygon Mumbai**: Testnet blockchain interactions

### AI Features
- **OpenAI API**: Campaign optimization and content enhancement
- GPT-4o model for title suggestions and funding predictions
- AI-powered credibility scoring and market analysis

### UI/UX Libraries
- **Framer Motion**: Animation and transitions
- **Lucide React**: Icon library
- **date-fns**: Date manipulation and formatting
- **class-variance-authority**: Component variant management