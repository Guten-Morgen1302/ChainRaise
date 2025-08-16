# Overview

CryptoFund is a full-stack Web3 crowdfunding platform that combines the features of Kickstarter, GoFundMe, and AngelList with blockchain transparency and a cyberpunk-styled glassmorphism UI. The platform enables creators to launch fundraising campaigns after KYC verification and allows backers to contribute using both cryptocurrency and fiat payments, with all transactions recorded on-chain for transparency.

## Migration Status
**COMPLETED** - Successfully migrated from Replit Agent to standard Replit environment (August 16, 2025)

## Smart Contract Integration (August 15, 2025)
**COMPLETED** - Full Avalanche Fuji blockchain integration implemented
- **Contract Address**: 0xd98bCbD04e6653960c29b8FEACDB30Da91122999 (Avalanche Fuji Testnet)
- **Network**: Avalanche Fuji (Chain ID: 43113) with auto-switching functionality
- **Backend Integration**: ethers.js v6 with HTTP/WebSocket RPC providers for real-time data
- **Frontend Integration**: MetaMask wallet connection with automatic network configuration
- **Real-time Events**: Server-Sent Events (SSE) streaming for live contract interactions
- **Contract Functions**: fund(), completeMilestone(), refund() with full UI integration
- **Demo Interface**: Comprehensive /contract-demo page with wallet connection and live updates
- **Navigation**: Added "Blockchain Demo" to main navigation for easy access
- Fixed all critical errors identified in the analysis
- Database seeded with sample campaigns and users
- Authentication system working properly
- Images loading correctly with Unsplash integration
- Fixed Three.js shader errors (renamed color attribute to particleColor)
- Added CORS middleware for proper API communication
- Fixed login redirect issue (buttons now go to /auth instead of /api/login)
- Added placeholder image endpoint and updated campaign images
- Enhanced KYC document upload system with proper file handling
- Improved admin KYC review system with document preview and approval workflow
- Fixed authentication route consistency (/api/user vs /api/auth/user)
- Fixed file upload payload size limits (increased server limit to 10MB, added 5MB client validation)
- **AI Explorer Integration** (August 16, 2025): Removed standalone AI Explorer page and integrated AI analysis features into Live Transactions page
- Enhanced Live Tx page with AI Transaction Analysis tab including network health monitoring, anomaly detection, and real-time insights
- Updated navigation to reflect combined "Live Tx + AI" functionality while preserving all original Live Tx features

## Real-Time Admin Portal Implementation (August 15, 2025)
**COMPLETED** - Fully functional real-time admin dashboard with WebSocket integration
- **WebSocket Server**: Implemented real-time communication with admin clients
- **Live User Management**: Instant updates for user creation, flagging/unflagging, deletion, and KYC status changes
- **Real-Time Campaign Management**: Live campaign approval/rejection with instant notifications
- **Live KYC Processing**: Real-time updates when applications are submitted and reviewed
- **Connection Status Indicator**: Visual live/offline status in admin dashboard
- **Instant Database Sync**: All changes broadcast to connected admin sessions without refresh
- **Admin Actions**: Flag/unflag users, approve/reject KYC, manage campaigns with real-time feedback
- **Auto-Refresh Tables**: User lists, campaign counters, and KYC queues update automatically
- **Authentication Fixed**: Resolved password hashing issues, admin login now works with johntech/password and admin/password

## Security Enhancements (August 15, 2025)
**COMPLETED** - Implemented robust role-based authentication and authorization
- **Admin Role System**: Added role field to user schema with 'user' and 'admin' roles
- **Admin Authorization**: Created requireAdmin middleware for proper role verification
- **Secured Admin Endpoints**: All admin routes now require admin privileges (KYC management, user management, campaign approval)
- **Admin User Created**: Default admin account established for platform management
- **Client/Server Separation**: Proper authorization checks prevent unauthorized access to admin functions
- **Authentication Updates**: User responses now include role and flagged status for frontend security

## KYC System Enhancement (August 14, 2025)
**COMPLETED** - Comprehensive KYC verification system integrated
- Multi-step KYC form with document upload functionality and step-by-step validation
- Database schema updated with KYC applications and admin management
- Admin portal with real-time KYC application review and approval
- API endpoints for KYC submission, status checking, and admin workflow
- Campaign creation restricted until KYC verification is approved
- Live admin dashboard for managing user verification applications
- Fixed form validation issues for smooth user experience
- Navigation updated to include KYC and Admin access links

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