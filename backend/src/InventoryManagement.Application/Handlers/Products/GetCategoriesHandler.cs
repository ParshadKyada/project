using AutoMapper;
using InventoryManagement.Application.DTOs.Products;
using InventoryManagement.Application.Interfaces;
using InventoryManagement.Application.Queries.Products;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InventoryManagement.Application.Handlers.Products;

public class GetCategoriesHandler : IRequestHandler<GetCategoriesQuery, List<CategoryDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetCategoriesHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<CategoryDto>> Handle(GetCategoriesQuery request, CancellationToken cancellationToken)
    {
        var categories = await _context.Categories
            .Include(c => c.Products)
            .ToListAsync(cancellationToken);
        return categories.Select(c => {
            var dto = _mapper.Map<CategoryDto>(c);
            dto.ProductCount = c.Products.Count(p => !p.IsDeleted);
            return dto;
        }).ToList();
    }
} 