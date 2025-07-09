# Development Guide - Smart Inventory Management System

This guide provides step-by-step instructions for setting up and developing the Smart Inventory Management System backend on Windows using Visual Studio 2022.

## 🎯 Prerequisites

### Required Software
1. **Visual Studio 2022** (Community, Professional, or Enterprise)
   - Download from: https://visualstudio.microsoft.com/downloads/
   - Required workloads:
     - ASP.NET and web development
     - .NET desktop development

2. **.NET 8 SDK**
   - Usually included with Visual Studio 2022
   - Verify installation: `dotnet --version`

3. **SQL Server**
   - **Option 1**: SQL Server LocalDB (recommended for development)
     - Included with Visual Studio
   - **Option 2**: SQL Server Express
     - Download from: https://www.microsoft.com/en-us/sql-server/sql-server-downloads
   - **Option 3**: SQL Server Developer Edition (free)

4. **Git for Windows**
   - Download from: https://git-scm.com/download/win

### Optional Tools
- **SQL Server Management Studio (SSMS)** - For database management
- **Postman** - For API testing
- **Docker Desktop** - For containerized development

## 🚀 Step-by-Step Setup

### Step 1: Clone and Open Project

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd smart-inventory-system/backend
   ```

2. **Open in Visual Studio 2022**
   - Launch Visual Studio 2022
   - Click "Open a project or solution"
   - Navigate to `backend/InventoryManagement.sln`
   - Click "Open"

### Step 2: Configure Database Connection

1. **Check SQL Server LocalDB**
   ```bash
   # Open Command Prompt or PowerShell
   sqllocaldb info
   ```
   
   If LocalDB is not available, install SQL Server Express.

2. **Update Connection String**
   - Open `src/InventoryManagement.API/appsettings.json`
   - Update the connection string:
   
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=InventoryManagementDB;Trusted_Connection=true;MultipleActiveResultSets=true"
     }
   }
   ```

   **Alternative connection strings:**
   
   For SQL Server Express:
   ```json
   "DefaultConnection": "Server=.\\SQLEXPRESS;Database=InventoryManagementDB;Trusted_Connection=true;MultipleActiveResultSets=true"
   ```
   
   For SQL Server with authentication:
   ```json
   "DefaultConnection": "Server=localhost;Database=InventoryManagementDB;User Id=sa;Password=YourPassword;TrustServerCertificate=true"
   ```

### Step 3: Install NuGet Packages

1. **Restore packages automatically**
   - Visual Studio should automatically restore packages when you open the solution
   - If not, right-click the solution → "Restore NuGet Packages"

2. **Manual restore (if needed)**
   ```bash
   # In Package Manager Console or terminal
   dotnet restore
   ```

### Step 4: Create and Seed Database

1. **Using Package Manager Console in Visual Studio**
   - Go to Tools → NuGet Package Manager → Package Manager Console
   - Set Default Project to "InventoryManagement.Infrastructure"
   - Run:
   ```powershell
   Add-Migration InitialCreate
   Update-Database
   ```

2. **Using Command Line**
   ```bash
   cd src/InventoryManagement.API
   dotnet ef migrations add InitialCreate
   dotnet ef database update
   ```

3. **Run SQL Scripts (Optional)**
   - The database will be created automatically with seed data
   - For additional data, run scripts in `Database/` folder using SSMS

### Step 5: Configure JWT Settings

1. **Update JWT configuration in appsettings.json**
   ```json
   {
     "Jwt": {
       "Key": "your-super-secret-key-that-is-at-least-32-characters-long",
       "Issuer": "InventoryManagement.API",
       "Audience": "InventoryManagement.Client"
     }
   }
   ```

2. **For production, use secure key generation**
   ```csharp
   // Generate a secure key
   var key = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
   ```

### Step 6: Run the Application

1. **Set Startup Project**
   - Right-click "InventoryManagement.API" in Solution Explorer
   - Select "Set as Startup Project"

2. **Run the application**
   - Press F5 or click the "Run" button
   - The API should start and open Swagger UI in your browser
   - Default URLs:
     - HTTPS: `https://localhost:7000`
     - HTTP: `http://localhost:5000`
     - Swagger: `https://localhost:7000/swagger`

### Step 7: Test the API

1. **Using Swagger UI**
   - Navigate to `https://localhost:7000/swagger`
   - Test the `/api/auth/login` endpoint with default credentials:
     ```json
     {
       "email": "admin@inventory.com",
       "password": "admin123"
     }
     ```

2. **Using Postman**
   - Import the API collection (if available)
   - Set base URL to `https://localhost:7000`
   - Test authentication and other endpoints

## 🏗️ Project Structure Deep Dive

### Solution Structure
```
InventoryManagement.sln
├── src/
│   ├── InventoryManagement.API/          # Web API Layer
│   ├── InventoryManagement.Application/  # Application Layer
│   ├── InventoryManagement.Domain/       # Domain Layer
│   └── InventoryManagement.Infrastructure/ # Infrastructure Layer
├── Database/                             # SQL Scripts
└── README.md
```

### Key Files and Their Purpose

#### API Layer (`InventoryManagement.API`)
- `Program.cs` - Application startup and configuration
- `Controllers/` - HTTP endpoints
- `appsettings.json` - Configuration settings

#### Application Layer (`InventoryManagement.Application`)
- `Commands/` - Write operations (CQRS)
- `Queries/` - Read operations (CQRS)
- `Handlers/` - MediatR request handlers
- `DTOs/` - Data transfer objects
- `Interfaces/` - Application contracts

#### Domain Layer (`InventoryManagement.Domain`)
- `Entities/` - Core business entities
- `Enums/` - Domain enumerations
- `ValueObjects/` - Immutable domain objects

#### Infrastructure Layer (`InventoryManagement.Infrastructure`)
- `Data/` - Entity Framework DbContext
- `Services/` - External service implementations

## 🔧 Development Workflow

### Adding New Features

1. **Create Domain Entity** (if needed)
   ```csharp
   // In Domain/Entities/
   public class NewEntity : BaseEntity
   {
       public string Name { get; set; }
       // ... properties
   }
   ```

2. **Add to DbContext**
   ```csharp
   // In Infrastructure/Data/ApplicationDbContext.cs
   public DbSet<NewEntity> NewEntities => Set<NewEntity>();
   ```

3. **Create DTOs**
   ```csharp
   // In Application/DTOs/
   public class NewEntityDto
   {
       public Guid Id { get; set; }
       public string Name { get; set; }
   }
   ```

4. **Create Commands/Queries**
   ```csharp
   // In Application/Commands/
   public class CreateNewEntityCommand : IRequest<NewEntityDto>
   {
       public string Name { get; set; }
   }
   ```

5. **Create Handlers**
   ```csharp
   // In Application/Handlers/
   public class CreateNewEntityHandler : IRequestHandler<CreateNewEntityCommand, NewEntityDto>
   {
       // Implementation
   }
   ```

6. **Add Controller**
   ```csharp
   // In API/Controllers/
   [ApiController]
   [Route("api/[controller]")]
   public class NewEntitiesController : ControllerBase
   {
       // Endpoints
   }
   ```

7. **Create Migration**
   ```bash
   dotnet ef migrations add AddNewEntity
   dotnet ef database update
   ```

### Database Migrations

1. **Add Migration**
   ```bash
   dotnet ef migrations add MigrationName
   ```

2. **Update Database**
   ```bash
   dotnet ef database update
   ```

3. **Remove Last Migration** (if not applied)
   ```bash
   dotnet ef migrations remove
   ```

4. **Generate SQL Script**
   ```bash
   dotnet ef migrations script
   ```

### Testing

1. **Unit Tests**
   - Test handlers in isolation
   - Mock dependencies
   - Test business logic

2. **Integration Tests**
   - Test API endpoints
   - Test database operations
   - Test authentication

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Issues**
   ```
   Error: Cannot connect to SQL Server
   ```
   **Solution:**
   - Verify SQL Server is running
   - Check connection string
   - Ensure database exists

2. **Migration Issues**
   ```
   Error: Unable to create migration
   ```
   **Solution:**
   - Ensure EF Tools are installed
   - Check DbContext configuration
   - Verify entity configurations

3. **JWT Token Issues**
   ```
   Error: 401 Unauthorized
   ```
   **Solution:**
   - Check JWT configuration
   - Verify token format
   - Ensure proper authentication

4. **Package Restore Issues**
   ```
   Error: Package not found
   ```
   **Solution:**
   - Clear NuGet cache: `dotnet nuget locals all --clear`
   - Restore packages: `dotnet restore`
   - Check package sources

### Performance Optimization

1. **Database Indexing**
   - Add indexes for frequently queried columns
   - Monitor query performance
   - Use execution plans

2. **Caching**
   - Implement response caching
   - Use memory caching for static data
   - Consider distributed caching

3. **Async Operations**
   - Use async/await consistently
   - Avoid blocking calls
   - Configure thread pool appropriately

## 📚 Learning Resources

### .NET 8 & ASP.NET Core
- [Official .NET Documentation](https://docs.microsoft.com/en-us/dotnet/)
- [ASP.NET Core Documentation](https://docs.microsoft.com/en-us/aspnet/core/)

### Clean Architecture
- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [.NET Clean Architecture Template](https://github.com/jasontaylordev/CleanArchitecture)

### Entity Framework Core
- [EF Core Documentation](https://docs.microsoft.com/en-us/ef/core/)
- [EF Core Migrations](https://docs.microsoft.com/en-us/ef/core/managing-schemas/migrations/)

### MediatR
- [MediatR Documentation](https://github.com/jbogard/MediatR)
- [CQRS with MediatR](https://code-maze.com/cqrs-mediatr-in-aspnet-core/)

## 🚀 Next Steps

1. **Set up the React frontend** (see frontend documentation)
2. **Configure CORS** for frontend integration
3. **Implement additional features** as needed
4. **Set up CI/CD pipeline** for deployment
5. **Add comprehensive testing** suite
6. **Implement RabbitMQ** for messaging (future enhancement)

## 💡 Tips for Success

1. **Follow naming conventions** consistently
2. **Write meaningful commit messages**
3. **Keep controllers thin** - business logic in handlers
4. **Use dependency injection** properly
5. **Handle exceptions** gracefully
6. **Document your API** with XML comments
7. **Test early and often**
8. **Monitor performance** regularly

This guide should get you up and running with the Smart Inventory Management System backend. For specific questions or issues, refer to the troubleshooting section or consult the official documentation for the technologies used.