using InventoryManagement.Application.Commands.Products;
using InventoryManagement.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InventoryManagement.Application.Handlers.Products;

public class DeleteSupplierHandler : IRequestHandler<DeleteSupplierCommand, Unit>
{
    private readonly IApplicationDbContext _context;

    public DeleteSupplierHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Unit> Handle(DeleteSupplierCommand request, CancellationToken cancellationToken)
    {
        var supplier = await _context.Suppliers.FirstOrDefaultAsync(s => s.Id == request.Id, cancellationToken);
        if (supplier == null)
            throw new InvalidOperationException("Supplier not found");
        _context.Suppliers.Remove(supplier);
        await _context.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }
} 