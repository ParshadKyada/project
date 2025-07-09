using InventoryManagement.Application.Commands.Products;
using InventoryManagement.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InventoryManagement.Application.Handlers.Products;

public class MarkAlertAsReadHandler : IRequestHandler<MarkAlertAsReadCommand, Unit>
{
    private readonly IApplicationDbContext _context;

    public MarkAlertAsReadHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Unit> Handle(MarkAlertAsReadCommand request, CancellationToken cancellationToken)
    {
        var alert = await _context.LowStockAlerts.FirstOrDefaultAsync(a => a.Id == request.AlertId, cancellationToken);
        if (alert == null)
            throw new InvalidOperationException("Alert not found");
        alert.IsRead = true;
        await _context.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }
} 