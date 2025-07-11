using InventoryManagement.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

public class MarkAlertAsReadCommand : IRequest
{
    public Guid AlertId { get; set; }
    public MarkAlertAsReadCommand(Guid alertId) => AlertId = alertId;
}

public class MarkAlertAsReadHandler : IRequestHandler<MarkAlertAsReadCommand>
{
    private readonly IApplicationDbContext _context;

    public MarkAlertAsReadHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(MarkAlertAsReadCommand request, CancellationToken cancellationToken)
    {
        var alert = await _context.LowStockAlerts.FirstOrDefaultAsync(a => a.Id == request.AlertId, cancellationToken);
        if (alert != null && !alert.IsRead)
        {
            alert.IsRead = true;
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}