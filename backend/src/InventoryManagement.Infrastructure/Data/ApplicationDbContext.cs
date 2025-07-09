using InventoryManagement.Application.Interfaces;
using InventoryManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace InventoryManagement.Infrastructure.Data;

public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Supplier> Suppliers => Set<Supplier>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<StockMovement> StockMovements => Set<StockMovement>();
    public DbSet<LowStockAlert> LowStockAlerts => Set<LowStockAlert>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.Email).HasMaxLength(255).IsRequired();
            entity.Property(e => e.FirstName).HasMaxLength(100).IsRequired();
            entity.Property(e => e.LastName).HasMaxLength(100).IsRequired();
            entity.Property(e => e.PasswordHash).HasMaxLength(255).IsRequired();
        });

        // Category configuration
        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(500);
        });

        // Supplier configuration
        modelBuilder.Entity<Supplier>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(200).IsRequired();
            entity.Property(e => e.ContactEmail).HasMaxLength(255).IsRequired();
            entity.Property(e => e.ContactPhone).HasMaxLength(20);
            entity.Property(e => e.Address).HasMaxLength(500);
        });

        // Product configuration
        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.SKU).IsUnique();
            entity.Property(e => e.Name).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.SKU).HasMaxLength(50).IsRequired();
            entity.Property(e => e.Price).HasColumnType("decimal(18,2)");

            entity.HasOne(e => e.Category)
                .WithMany(c => c.Products)
                .HasForeignKey(e => e.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Supplier)
                .WithMany(s => s.Products)
                .HasForeignKey(e => e.SupplierId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Order configuration
        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.OrderNumber).IsUnique();
            entity.Property(e => e.OrderNumber).HasMaxLength(50).IsRequired();
            entity.Property(e => e.TotalAmount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Notes).HasMaxLength(1000);

            entity.HasOne(e => e.Customer)
                .WithMany(u => u.Orders)
                .HasForeignKey(e => e.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // OrderItem configuration
        modelBuilder.Entity<OrderItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.UnitPrice).HasColumnType("decimal(18,2)");
            entity.Property(e => e.TotalPrice).HasColumnType("decimal(18,2)");

            entity.HasOne(e => e.Order)
                .WithMany(o => o.OrderItems)
                .HasForeignKey(e => e.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Product)
                .WithMany(p => p.OrderItems)
                .HasForeignKey(e => e.ProductId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // StockMovement configuration
        modelBuilder.Entity<StockMovement>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Reason).HasMaxLength(500).IsRequired();
            entity.Property(e => e.Reference).HasMaxLength(100);

            entity.HasOne(e => e.Product)
                .WithMany(p => p.StockMovements)
                .HasForeignKey(e => e.ProductId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.User)
                .WithMany(u => u.StockMovements)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // LowStockAlert configuration
        modelBuilder.Entity<LowStockAlert>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.HasOne(e => e.Product)
                .WithMany(p => p.LowStockAlerts)
                .HasForeignKey(e => e.ProductId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Seed data
        SeedData(modelBuilder);
    }

    private static void SeedData(ModelBuilder modelBuilder)
    {
        // Seed Categories
        var categories = new[]
        {
            new Category { Id = Guid.Parse("11111111-1111-1111-1111-111111111111"), Name = "Electronics", Description = "Electronic devices and accessories", IsActive = true },
            new Category { Id = Guid.Parse("22222222-2222-2222-2222-222222222222"), Name = "Office Supplies", Description = "Office equipment and supplies", IsActive = true },
            new Category { Id = Guid.Parse("33333333-3333-3333-3333-333333333333"), Name = "Gaming", Description = "Gaming peripherals and accessories", IsActive = true }
        };

        // Seed Suppliers
        var suppliers = new[]
        {
            new Supplier { Id = Guid.Parse("44444444-4444-4444-4444-444444444444"), Name = "TechCorp Ltd", ContactEmail = "sales@techcorp.com", ContactPhone = "+1-555-0123", Address = "123 Tech St, Silicon Valley, CA", IsActive = true },
            new Supplier { Id = Guid.Parse("55555555-5555-5555-5555-555555555555"), Name = "Office Solutions Inc", ContactEmail = "orders@officesolutions.com", ContactPhone = "+1-555-0456", Address = "456 Business Ave, New York, NY", IsActive = true }
        };

        // Seed Admin User
        var adminUser = new User
        {
            Id = Guid.Parse("66666666-6666-6666-6666-666666666666"),
            Email = "admin@inventory.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
            FirstName = "Admin",
            LastName = "User",
            Role = Domain.Enums.UserRole.Admin,
            IsActive = true
        };

        // Seed Staff User
        var staffUser = new User
        {
            Id = Guid.Parse("77777777-7777-7777-7777-777777777777"),
            Email = "staff@inventory.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("staff123"),
            FirstName = "Staff",
            LastName = "User",
            Role = Domain.Enums.UserRole.Staff,
            IsActive = true
        };

        // Seed Customer User
        var customerUser = new User
        {
            Id = Guid.Parse("88888888-8888-8888-8888-888888888888"),
            Email = "cust@inventory.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("cust123"),
            FirstName = "Customer",
            LastName = "User",
            Role = Domain.Enums.UserRole.Customer,
            IsActive = true
        };

        modelBuilder.Entity<Category>().HasData(categories);
        modelBuilder.Entity<Supplier>().HasData(suppliers);
        //modelBuilder.Entity<User>().HasData(adminUser);
        modelBuilder.Entity<User>().HasData(adminUser, staffUser, customerUser);
    }
}