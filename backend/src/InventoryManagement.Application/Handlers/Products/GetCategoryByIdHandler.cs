using AutoMapper;
using InventoryManagement.Application.DTOs.Products;
using InventoryManagement.Application.Interfaces;
using InventoryManagement.Application.Queries.Products;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InventoryManagement.Application.Handlers.Products;

public class GetCategoryByIdHandler : IRequestHandler<GetCategoryByIdQuery, CategoryDto?>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetCategoryByIdHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<CategoryDto?> Handle(GetCategoryByIdQuery request, CancellationToken cancellationToken)
    {
        var category = await _context.Categories
            .Include(c => c.Products)
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);
        if (category == null) return null;
        var dto = _mapper.Map<CategoryDto>(category);
        dto.ProductCount = category.Products.Count(p => !p.IsDeleted);
        return dto;
    }
} 