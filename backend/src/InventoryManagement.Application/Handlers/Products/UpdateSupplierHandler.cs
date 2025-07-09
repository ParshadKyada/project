using AutoMapper;
using InventoryManagement.Application.Commands.Products;
using InventoryManagement.Application.DTOs.Products;
using InventoryManagement.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InventoryManagement.Application.Handlers.Products;

public class UpdateSupplierHandler : IRequestHandler<UpdateSupplierCommand, SupplierDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public UpdateSupplierHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<SupplierDto> Handle(UpdateSupplierCommand request, CancellationToken cancellationToken)
    {
        var supplier = await _context.Suppliers.FirstOrDefaultAsync(s => s.Id == request.Id, cancellationToken);
        if (supplier == null)
            throw new InvalidOperationException("Supplier not found");
        supplier.Name = request.Name;
        supplier.ContactEmail = request.ContactEmail;
        supplier.ContactPhone = request.ContactPhone;
        supplier.Address = request.Address;
        supplier.IsActive = request.IsActive;
        await _context.SaveChangesAsync(cancellationToken);
        return _mapper.Map<SupplierDto>(supplier);
    }
} 