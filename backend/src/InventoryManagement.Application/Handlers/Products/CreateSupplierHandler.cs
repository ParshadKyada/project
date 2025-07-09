using AutoMapper;
using InventoryManagement.Application.Commands.Products;
using InventoryManagement.Application.DTOs.Products;
using InventoryManagement.Application.Interfaces;
using InventoryManagement.Domain.Entities;
using MediatR;

namespace InventoryManagement.Application.Handlers.Products;

public class CreateSupplierHandler : IRequestHandler<CreateSupplierCommand, SupplierDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public CreateSupplierHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<SupplierDto> Handle(CreateSupplierCommand request, CancellationToken cancellationToken)
    {
        var supplier = new Supplier
        {
            Name = request.Name,
            ContactEmail = request.ContactEmail,
            ContactPhone = request.ContactPhone,
            Address = request.Address,
            IsActive = request.IsActive
        };
        _context.Suppliers.Add(supplier);
        await _context.SaveChangesAsync(cancellationToken);
        return _mapper.Map<SupplierDto>(supplier);
    }
} 