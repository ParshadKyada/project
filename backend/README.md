# Smart Inventory & Order Management System - Backend

A comprehensive .NET 8 Web API backend built with Clean Architecture, MediatR, Entity Framework Core, and SQL Server.

## 🏗️ Architecture

This project follows Clean Architecture principles with the following layers:

```
├── InventoryManagement.API          # Presentation Layer
├── InventoryManagement.Application  # Application Layer
├── InventoryManagement.Domain       # Domain Layer
└── InventoryManagement.Infrastructure # Infrastructure Layer
```

## 🛠️ Tech Stack

- **.NET 8** - Latest .NET framework
- **ASP.NET Core Web API** - RESTful API framework
- **Entity Framework Core** - ORM with Code-First approach
- **SQL Server** - Database with advanced features
- **MediatR** - CQRS and Mediator pattern implementation
- **AutoMapper** - Object-to-object mapping
- **FluentValidation** - Input validation
- **JWT Authentication** - Secure token-based authentication
- **Serilog** - Structured logging
- **Swagger/OpenAPI** - API documentation

## 🚀 Getting Started

### Prerequisites

- Visual Studio 2022 or VS Code
- .NET 8 SDK
- SQL Server (LocalDB, Express, or Full)
- Git

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Restore NuGet packages**
   ```bash
   dotnet restore
   ```

3. **Update connection string**
   - Open `src/InventoryManagement.API/appsettings.json`
   - Update the `DefaultConnection` string to match your SQL Server instance

4. **Create and seed the database**
   ```bash
   cd src/InventoryManagement.API
   dotnet ef database update
   ```

5. **Run the application**
   ```bash
   dotnet run
   ```

6. **Access the API**
   - API: `https://localhost:7000` or `http://localhost:5000`
   - Swagger UI: `https://localhost:7000/swagger`

## 📊 Database Schema

### Core Entities

- **Users** - System users with role-based access (Admin, Staff, Customer)
- **Categories** - Product categories for organization
- **Suppliers** - Product suppliers and vendors
- **Products** - Main product catalog with stock tracking
- **Orders** - Customer orders with status tracking
- **OrderItems** - Individual line items within orders
- **StockMovements** - Complete audit trail of stock changes
- **LowStockAlerts** - Automated low stock notifications

### Advanced SQL Features

- **Views** - Pre-built reporting views for common queries
- **Stored Procedures** - Complex business operations
- **Functions** - Reusable calculations and lookups
- **Triggers** - Automatic business rule enforcement
- **Indexes** - Optimized for performance

## 🔐 Authentication & Authorization

### JWT Token Authentication
- Secure token-based authentication
- Role-based authorization (Admin, Staff, Customer)
- Permission-based access control

### Default Users
```
Admin:    admin@inventory.com    / admin123
Staff:    staff@inventory.com    / staff123
Customer: customer@inventory.com / customer123
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/validate` - Token validation

### Products
- `GET /api/products` - Get all products (with filtering)
- `GET /api/products/{id}` - Get product by ID
- `POST /api/products` - Create new product
- `PUT /api/products/{id}` - Update product
- `PATCH /api/products/{id}/stock` - Update stock quantity

### Orders
- `GET /api/orders` - Get all orders (with filtering)
- `POST /api/orders` - Create new order
- `PATCH /api/orders/{id}/status` - Update order status

### Categories & Suppliers
- Similar CRUD operations for categories and suppliers

## 🏛️ Clean Architecture Implementation

### Domain Layer
- **Entities** - Core business entities
- **Enums** - Domain-specific enumerations
- **Value Objects** - Immutable domain objects

### Application Layer
- **Commands** - Write operations (Create, Update, Delete)
- **Queries** - Read operations
- **Handlers** - MediatR request handlers
- **DTOs** - Data transfer objects
- **Interfaces** - Application contracts
- **Validators** - Input validation rules

### Infrastructure Layer
- **Data** - Entity Framework DbContext
- **Services** - External service implementations
- **Authentication** - JWT token management

### API Layer
- **Controllers** - HTTP endpoints
- **Middleware** - Cross-cutting concerns
- **Configuration** - Dependency injection setup

## 🔄 CQRS with MediatR

### Commands (Write Operations)
```csharp
public class CreateProductCommand : IRequest<ProductDto>
{
    public string Name { get; set; }
    public decimal Price { get; set; }
    // ... other properties
}
```

### Queries (Read Operations)
```csharp
public class GetProductsQuery : IRequest<List<ProductDto>>
{
    public string? SearchTerm { get; set; }
    public Guid? CategoryId { get; set; }
    // ... filter properties
}
```

### Handlers
```csharp
public class CreateProductHandler : IRequestHandler<CreateProductCommand, ProductDto>
{
    public async Task<ProductDto> Handle(CreateProductCommand request, CancellationToken cancellationToken)
    {
        // Implementation
    }
}
```

## 📈 Business Features

### Inventory Management
- Real-time stock tracking
- Automatic low stock alerts
- Stock movement history
- Reorder level management

### Order Processing
- Complete order lifecycle management
- Automatic stock deduction
- Order status tracking
- Customer order history

### Reporting & Analytics
- Dashboard statistics
- Sales performance reports
- Inventory status reports
- Low stock alerts

## 🔧 Configuration

### Database Configuration
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=InventoryManagementDB;Trusted_Connection=true"
  }
}
```

### JWT Configuration
```json
{
  "Jwt": {
    "Key": "your-super-secret-key-that-is-at-least-32-characters-long",
    "Issuer": "InventoryManagement.API",
    "Audience": "InventoryManagement.Client"
  }
}
```

## 🧪 Testing

### Unit Tests
- Domain logic testing
- Handler testing
- Service testing

### Integration Tests
- API endpoint testing
- Database integration testing

## 📝 Logging

Structured logging with Serilog:
- Console output for development
- File logging for production
- Structured JSON format
- Log levels: Information, Warning, Error

## 🚀 Deployment

### Development
```bash
dotnet run --environment Development
```

### Production
```bash
dotnet publish -c Release
dotnet run --environment Production
```

## 🔮 Future Enhancements

### RabbitMQ Integration
The system is designed to easily integrate RabbitMQ for:
- Low stock alert notifications
- Order processing events
- Inventory update events

### Additional Features
- Multi-warehouse support
- Barcode scanning integration
- Advanced reporting dashboard
- Mobile app support
- Third-party integrations

## 📚 Documentation

- **API Documentation** - Available via Swagger UI
- **Database Schema** - ERD and table documentation
- **Architecture Decisions** - ADR documents
- **Deployment Guide** - Step-by-step deployment instructions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.