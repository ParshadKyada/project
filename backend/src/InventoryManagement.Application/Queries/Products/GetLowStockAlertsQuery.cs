using InventoryManagement.Application.DTOs.Products;
using MediatR;
using System.Collections.Generic;

namespace InventoryManagement.Application.Queries.Products;

public class GetLowStockAlertsQuery : IRequest<List<LowStockAlertDto>>
{
} 