using AutoMapper;
using InventoryManagement.Application.DTOs.Products;
using InventoryManagement.Application.Interfaces;
using InventoryManagement.Application.Queries.Products;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InventoryManagement.Application.Handlers.Products;

public class GetSupplierByIdHandler : IRequestHandler<GetSupplierByIdQuery, SupplierDto?>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetSupplierByIdHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<SupplierDto?> Handle(GetSupplierByIdQuery request, CancellationToken cancellationToken)
    {
        var supplier = await _context.Suppliers
            .Include(s => s.Products)
            .FirstOrDefaultAsync(s => s.Id == request.Id, cancellationToken);
        if (supplier == null) return null;
        var dto = _mapper.Map<SupplierDto>(supplier);
        dto.ProductCount = supplier.Products.Count(p => !p.IsDeleted);
        return dto;
    }
} 