using InventoryManagement.Application.DTOs.Products;
using InventoryManagement.Application.Interfaces;
using InventoryManagement.Application.Queries.Products;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InventoryManagement.Application.Handlers.Products;

public class GetLowStockAlertsHandler : IRequestHandler<GetLowStockAlertsQuery, List<LowStockAlertDto>>
{
    private readonly IApplicationDbContext _context;

    public GetLowStockAlertsHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<LowStockAlertDto>> Handle(GetLowStockAlertsQuery request, CancellationToken cancellationToken)
    {
        var alerts = await _context.LowStockAlerts.ToListAsync(cancellationToken);
        var products = await _context.Products.ToListAsync(cancellationToken);
        return alerts.Select(a => new LowStockAlertDto
        {
            Id = a.Id,
            ProductId = a.ProductId,
            ProductName = products.FirstOrDefault(p => p.Id == a.ProductId)?.Name ?? string.Empty,
            CurrentStock = a.CurrentStock,
            ReorderLevel = a.ReorderLevel,
            Severity = a.Severity.ToString(),
            CreatedAt = a.CreatedAt,
            IsRead = a.IsRead
        }).ToList();
    }
} 