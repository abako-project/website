# Polkatalent (Work3Spaces)

A web platform connecting clients with developers through a project-based marketplace. Features include project proposals, milestone management, skills matching, voting systems, and blockchain-based payments via Virto Network SDK integration.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Available Scripts](#available-scripts)
- [Testing Flows](#testing-flows)
  - [User Registration & Login Flow](#1-user-registration--login-flow)
  - [Project Creation Flow](#2-project-creation-flow-client)
  - [Developer Milestone Flow](#3-developer-milestone-flow)
  - [Blockchain Integration Flow](#4-blockchain-integration-flow)
- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [Database](#database)
- [API Documentation](#api-documentation)
- [Testing Strategy](#testing-strategy)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements
- **Operating System**: macOS Sequoia 15.5+ or macOS Tahoe 16.0.1+
- **Node.js**: Version 22 or 24
- **Database**: SQLite (included)

### Recommended Tools
- A modern web browser (Chrome, Firefox, Safari, or Edge)
- Terminal/Command line interface
- Git (for version control)

---

## Installation

1. **Clone the repository** (if not already cloned):
   ```bash
   git clone <repository-url>
   cd website
   ```

2. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Set up the database**:
   
   The application uses SQLite with Sequelize ORM. Database setup commands are configured via `sequelize-cli`.
   
   ```bash
   # Run database migrations
   npx sequelize-cli db:migrate
   
   # Seed the database with initial data (test users, reference data, etc.)
   npx sequelize-cli db:seed:all
   ```

---

## Running the Application

### Development Mode (with auto-restart)

```bash
cd backend
npm start
```

This starts the server using `supervisor`, which automatically restarts the application when file changes are detected.

### Standard Mode (without auto-restart)

```bash
cd backend
npm run start2
```

### Access the Application

Once the server is running, open your browser and navigate to:

```
http://localhost:3001
```

The application will be accessible on **port 3001** by default.

---

## Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| **start** | `npm start` | Start server with supervisor (auto-restart on changes) |
| **start2** | `npm run start2` | Start server without supervisor (manual restart) |
| **sass** | `npm run sass` | Compile SASS stylesheets |
| **migrate** | `npx sequelize-cli db:migrate` | Run pending database migrations |
| **seed** | `npx sequelize-cli db:seed:all` | Populate database with seed data |
| **migrate:undo** | `npx sequelize-cli db:migrate:undo` | Revert last migration |

---

## Testing Flows

The following flows demonstrate the main features of the platform. After seeding the database, you'll have test users available.

### Test User Credentials

After running the seed command, the following test users are available:

- **Client**: `client@test.com` / Password: `testpassword`
- **Developer**: `dev@test.com` / Password: `testpassword`
- **Admin**: `admin@test.com` / Password: `adminpassword`

---

### 1. User Registration & Login Flow

#### **A. Register a New User**

1. Navigate to `http://localhost:3001/auth/register`
2. Choose user type: **Client** or **Developer**
3. Fill in the registration form:
   - Email
   - Name
   - Password
   - Additional profile information
4. Submit the form
5. User is created and redirected to login

#### **B. Login**

1. Navigate to `http://localhost:3001/auth/login`
2. Enter credentials:
   - Email: `client@test.com`
   - Password: `testpassword`
3. Submit login form
4. Upon successful authentication, user is redirected to their dashboard

#### **C. Session Management**

- Sessions are stored in the database using `SequelizeStore`
- Session expiration: **4 hours**
- Session data includes: `id`, `email`, `name`, `isAdmin`, `developerId` (if developer), `clientId` (if client)

---

### 2. Project Creation Flow (Client)

**Prerequisite**: Logged in as a Client

1. **Navigate to Projects**:
   - Go to `http://localhost:3001/projects`
   - Click "Create New Project"

2. **Fill Project Details**:
   - **Title**: Project name
   - **Description**: Detailed project description
   - **Project Type**: Select from available types (e.g., Web Development, Mobile App)
   - **Budget Range**: Select budget range
   - **Delivery Time**: Estimated timeframe
   - **Objectives**: Define project goals
   - **Constraints**: Any limitations or requirements

3. **Define Milestones**:
   - Add milestones with:
     - Milestone title
     - Description
     - Required skills
     - Estimated hours
     - Deliverables

4. **Submit Project**:
   - Review project details
   - Submit for developer proposals

5. **Project States**:
   - `draft`: Initial state
   - `open`: Accepting proposals
   - `in_progress`: Work has begun
   - `completed`: Project finished
   - `cancelled`: Project cancelled

---

### 3. Developer Milestone Flow

**Prerequisite**: Logged in as a Developer

1. **Browse Available Projects**:
   - Navigate to `http://localhost:3001/projects`
   - Filter by skills, budget, or project type

2. **View Project Details**:
   - Click on a project to see full details
   - Review milestones and requirements
   - Check required skills match

3. **Apply to Project**:
   - Submit a proposal with:
     - Estimated timeline
     - Proposed approach
     - Relevant experience

4. **Work on Assigned Milestone**:
   - Once assigned, navigate to `http://localhost:3001/milestones`
   - Update milestone status:
     - `pending`
     - `in_progress`
     - `completed`
     - `approved`

5. **Submit Milestone**:
   - Upload deliverables
   - Add completion notes
   - Request client review

6. **Milestone Approval**:
   - Client reviews deliverables
   - Client approves or requests changes
   - Payment processed upon approval (via Virto Network)

---

### 4. Blockchain Integration Flow

**Note**: Full blockchain operations require the backend API with Virto SDK support.

#### **A. User Authentication with Blockchain**

1. **Registration**:
   - User registers using WebAuthn (accountless authentication)
   - `navigator.credentials.create()` generates key pair
   - Public key stored on blockchain

2. **Connection**:
   - User authenticates via WebAuthn
   - `navigator.credentials.get()` retrieves credential
   - Backend validates and issues JWT token

3. **Transaction Signing**:
   - All blockchain operations require signed transactions
   - SDK handles signing through WebAuthn

#### **B. Project & Payment Workflow**

1. **Deploy Calendar Contract**:
   ```
   POST /calendar/deploy/v5
   Authorization: Bearer <token>
   ```

2. **Register as Worker**:
   ```
   POST /calendar/{address}/register_worker
   Authorization: Bearer <token>
   ```

3. **Set Availability**:
   ```
   POST /calendar/{address}/set_availability
   Authorization: Bearer <token>
   Body: { availability: { WeeklyHours: 40 } }
   ```

4. **Deploy Project Contract**:
   ```
   POST /projects/deploy/v5
   Authorization: Bearer <token>
   Body: { title, budget, calendarContract, ... }
   ```

5. **Propose Scope**:
   ```
   POST /projects/{address}/propose_scope
   Authorization: Bearer <token>
   Body: { milestones, advance_payment_percentage, document_hash }
   ```

6. **Approve Scope**:
   ```
   POST /projects/{address}/approve_scope
   Authorization: Bearer <token>
   Body: { approved_task_ids: [1, 2, 3] }
   ```

7. **Assign Team**:
   ```
   POST /projects/{address}/assign_team
   Authorization: Bearer <token>
   Body: { ideal_team_size: 2 }
   ```

---

## Architecture Overview

### Tech Stack

- **Backend Framework**: Express.js (Node.js)
- **View Engine**: EJS with express-partials
- **Database**: SQLite with Sequelize ORM
- **Session Management**: express-session + SequelizeStore
- **Authentication**: Passport.js (local strategy) + Virto SDK (blockchain)
- **File Uploads**: Multer
- **Blockchain Integration**: @virtonetwork/sdk

### Architectural Patterns

**MVC with Service Layer (SEDA)**:

```
Routes → Controllers → Services (SEDA) → Models → Database
                    ↓
                  Views (EJS)
```

- **Routes**: Define endpoints and attach middleware
- **Controllers**: Handle HTTP requests/responses
- **Services (SEDA)**: Business logic and data operations
- **Models**: Sequelize ORM definitions
- **Views**: EJS templates

### Permission System

Role-based authorization middleware (`controllers/permission.js`):

- `isAuthenticated` - Requires user login
- `adminRequired` - Admin users only
- `clientRequired` - Client users only
- `developerRequired` - Developer users only
- `projectClientRequired` - Project owner verification
- `projectConsultantRequired` - Project consultant verification
- `milestoneDeveloperRequired` - Milestone assignee verification
- `userTypesRequired({client: true, developer: true})` - Flexible multi-role checker

**Example**:
```javascript
router.post('/projects',
  permissionController.isAuthenticated,
  permissionController.clientRequired,
  projectController.create
);
```

---

## Project Structure

```
backend/
├── app.js                  # Express app configuration
├── bin/www                 # HTTP server entry point
├── config/
│   └── config.json         # Database configuration
├── models/                 # Sequelize models (20+ entities)
│   └── index.js           # Model definitions and relationships
├── routes/                 # Express route definitions
│   └── index.js           # Route aggregator
├── controllers/           # Business logic handlers
│   ├── auth/              # Authentication controllers
│   ├── permission.js      # Authorization middleware
│   └── [entity].js        # Domain-specific controllers
├── services/
│   └── seda/              # Service layer (SEDA system)
│       └── index.js       # Centralized service exports
├── views/                 # EJS templates
│   ├── layouts/           # Layout templates
│   ├── components/        # Reusable view components
│   └── [domain]/          # Domain-specific views
├── migrations/            # Database migration files
├── seeders/               # Seed data files
├── public/               # Static assets (CSS, JS, images)
├── helpers/              # Utility functions
└── utils/                # Additional utilities
```

---

## Database

### Database File
- **Location**: `backend/database.sqlite`
- **Type**: SQLite
- **ORM**: Sequelize

### Core Models

**User Management**:
- `User` - Base user entity
- `Client` - Client profile (1:1 with User)
- `Developer` - Developer profile (1:1 with User)
- `Role` - Developer roles
- `Skill` - Technical skills
- `Language` - Spoken languages

**Project System**:
- `Project` - Main project entity
- `ProjectType` - Project categorization
- `Budget` - Budget ranges
- `DeliveryTime` - Delivery timeframes
- `Milestone` - Project deliverables
- `MilestoneLog` - Milestone history

**Social Features**:
- `Comment` - Project comments
- `Vote` - User voting system
- `Attachment` - File uploads

### Key Relationships

- User → Client (1:1)
- User → Developer (1:1)
- Client → Projects (1:N)
- Developer → Milestones (1:N)
- Project → Milestones (1:N)
- Developer ↔ Skills (N:M)
- Milestone ↔ Skills (N:M)

---

## API Documentation

For detailed API documentation, see:
- `backend/API-CLIENT-README.md` - API client usage
- `backend/INTEGRATION_STATUS.md` - Integration details

### Main API Endpoints

**Authentication**:
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/custom-register` - Blockchain registration
- `POST /auth/custom-connect` - Blockchain authentication

**Projects**:
- `GET /projects` - List all projects
- `POST /projects` - Create new project
- `GET /projects/:id` - Get project details
- `PUT /projects/:id` - Update project
- `DELETE /projects/:id` - Delete project

**Milestones**:
- `GET /milestones` - List milestones
- `POST /milestones` - Create milestone
- `PUT /milestones/:id` - Update milestone
- `POST /milestones/:id/complete` - Mark as complete

**Blockchain (Virto Network)**:
- `POST /calendar/deploy/v5` - Deploy calendar contract
- `POST /calendar/:address/register_worker` - Register as worker
- `POST /projects/deploy/v5` - Deploy project contract
- `POST /projects/:address/propose_scope` - Propose project scope
- `POST /projects/:address/approve_scope` - Approve scope

---

## Testing Strategy

For comprehensive testing documentation, see `backend/TESTING_STRATEGY.md`.

### Test Environments

**Backend Tests** (Full E2E with blockchain):
- **Location**: `backend/packages/adapter-api/test/`
- **Framework**: NestJS + Jest + Virto SDK
- **Capabilities**: Complete workflow including blockchain operations

**Frontend Tests** (Structure validation):
- **Location**: `backend/tests/`
- **Framework**: Node.js + Plain JavaScript
- **Capabilities**: API structure, database operations (no blockchain)

### Running Tests

**Backend E2E Tests** (Recommended):
```bash
cd backend/packages/adapter-api
npm test
```

**Frontend Structure Tests**:
```bash
cd backend
node tests/api-client.test.js
```

**Login Flow Test**:
```bash
cd backend
./test-login.sh
```

### Test Coverage

- ✅ Authentication flow (registration, login, logout)
- ✅ Project CRUD operations
- ✅ Milestone management
- ✅ User management (clients, developers)
- ✅ Calendar contract operations
- ✅ Complete blockchain integration workflow
- ✅ Permission and authorization checks

---

## Troubleshooting

### Common Issues

#### Port Already in Use

**Error**: `EADDRINUSE: address already in use :::3001`

**Solution**:
```bash
# Find process using port 3001
lsof -i :3001

# Kill the process
kill -9 <PID>

# Or use a different port
PORT=3002 npm start
```

#### Database Locked

**Error**: `SQLITE_BUSY: database is locked`

**Solution**:
```bash
# Stop the server
# Delete the database and recreate
rm backend/database.sqlite
cd backend
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

#### Module Not Found

**Error**: `Cannot find module 'xyz'`

**Solution**:
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

#### Migration Errors

**Error**: Migration fails or throws errors

**Solution**:
```bash
# Undo last migration
npx sequelize-cli db:migrate:undo

# Or undo all migrations
npx sequelize-cli db:migrate:undo:all

# Run migrations again
npx sequelize-cli db:migrate
```

#### Session Issues

**Error**: User logged out unexpectedly

**Solution**:
- Check session expiration (4 hours default)
- Clear browser cookies
- Check database `Session` table

### Getting Help

For additional support:
1. Check the documentation in `backend/` directory
2. Review the `TESTING_STRATEGY.md` for testing guidance
3. Check `INTEGRATION_STATUS.md` for integration details
4. Review application logs for error details

---

## Development Workflow

### Making Code Changes

1. **Start in development mode**:
   ```bash
   npm start  # Uses supervisor for auto-reload
   ```

2. **File watching is enabled for**:
   - `views/` directory (EJS templates)
   - `public/` directory (static assets)
   - Auto-refresh via `livereload`

3. **Make your changes** to:
   - Controllers: `backend/controllers/`
   - Services: `backend/services/seda/`
   - Views: `backend/views/`
   - Routes: `backend/routes/`

4. **Test your changes**:
   - Browser auto-refreshes in development mode
   - Check console for errors
   - Run relevant tests

### Adding New Features

1. **Add Model** (if needed):
   ```bash
   npx sequelize-cli model:generate --name ModelName --attributes field1:string,field2:integer
   npx sequelize-cli db:migrate
   ```

2. **Create Service** in `services/seda/[domain].js`

3. **Create Controller** in `controllers/[domain].js`

4. **Define Routes** in `routes/[domain].js`

5. **Add Permission Middleware** as needed

6. **Create Views** in `views/[domain]/`

7. **Test** the feature

---

## License

[Add license information here]

## Contributors

[Add contributor information here]

---

**Last Updated**: January 2026  
**Version**: 1.0.0  
**Maintained By**: Development Team
