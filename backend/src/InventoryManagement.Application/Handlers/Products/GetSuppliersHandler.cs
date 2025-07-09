using AutoMapper;
using InventoryManagement.Application.DTOs.Products;
using InventoryManagement.Application.Interfaces;
using InventoryManagement.Application.Queries.Products;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InventoryManagement.Application.Handlers.Products;

public class GetSuppliersHandler : IRequestHandler<GetSuppliersQuery, List<SupplierDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetSuppliersHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<SupplierDto>> Handle(GetSuppliersQuery request, CancellationToken cancellationToken)
    {
        var suppliers = await _context.Suppliers
            .Include(s => s.Products)
            .ToListAsync(cancellationToken);
        return suppliers.Select(s => {
            var dto = _mapper.Map<SupplierDto>(s);
            dto.ProductCount = s.Products.Count(p => !p.IsDeleted);
            return dto;
        }).ToList();
    }
} 