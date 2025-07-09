using AutoMapper;
using InventoryManagement.Application.DTOs.Auth;
using InventoryManagement.Application.DTOs.Orders;
using InventoryManagement.Application.DTOs.Products;
//using InventoryManagement.Application.DTOs.Suppliers;
using InventoryManagement.Domain.Entities;
using InventoryManagement.Domain.Enums;

namespace InventoryManagement.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // User mappings
        CreateMap<User, UserDto>()
            .ForMember(dest => dest.Permissions, opt => opt.MapFrom(src => GetUserPermissions(src.Role)));

        // Product mappings
        CreateMap<Product, ProductDto>()
            .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category.Name))
            .ForMember(dest => dest.SupplierName, opt => opt.MapFrom(src => src.Supplier.Name));

        // Category mappings
        CreateMap<Category, CategoryDto>()
            .ForMember(dest => dest.ProductCount, opt => opt.MapFrom(src => src.Products.Count(p => !p.IsDeleted)));
        CreateMap<CategoryDto, Category>();

        // Supplier mappings
        CreateMap<Supplier, SupplierDto>()
            .ForMember(dest => dest.ProductCount, opt => opt.MapFrom(src => src.Products.Count(p => !p.IsDeleted)));
        CreateMap<SupplierDto, Supplier>();

        // Order mappings
        CreateMap<Order, OrderDto>()
            .ForMember(dest => dest.CustomerName, opt => opt.MapFrom(src => $"{src.Customer.FirstName} {src.Customer.LastName}"))
            .ForMember(dest => dest.Items, opt => opt.MapFrom(src => src.OrderItems));

        CreateMap<OrderItem, OrderItemDto>()
            .ForMember(dest => dest.ProductName, opt => opt.MapFrom(src => src.Product.Name));
    }

    private static List<string> GetUserPermissions(UserRole role)
    {
        return role switch
        {
            UserRole.Admin => new List<string>
            {
                "read:products", "write:products", "delete:products",
                "read:orders", "write:orders", "delete:orders",
                "read:users", "write:users", "delete:users",
                "read:categories", "write:categories", "delete:categories",
                "read:suppliers", "write:suppliers", "delete:suppliers",
                "read:reports", "write:reports"
            },
            UserRole.Staff => new List<string>
            {
                "read:products", "write:products",
                "read:orders", "write:orders",
                "read:categories", "write:categories",
                "read:suppliers", "write:suppliers"
            },
            UserRole.Customer => new List<string>
            {
                "read:products",
                "read:orders", "write:orders"
            },
            _ => new List<string>()
        };
    }
}