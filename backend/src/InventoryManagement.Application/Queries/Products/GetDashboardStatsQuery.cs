using InventoryManagement.Application.DTOs.Products;
using MediatR;

namespace InventoryManagement.Application.Queries.Products;

public class GetDashboardStatsQuery : IRequest<DashboardStatsDto>
{
} 