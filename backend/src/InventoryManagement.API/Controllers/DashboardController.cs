using InventoryManagement.Application.Commands.Products;
using InventoryManagement.Application.DTOs.Products;
using InventoryManagement.Application.Queries.Products;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InventoryManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IMediator _mediator;

    public DashboardController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("stats")]
    public async Task<ActionResult<DashboardStatsDto>> GetDashboardStats()
    {
        var stats = await _mediator.Send(new GetDashboardStatsQuery());
        return Ok(stats);
    }

    [HttpGet("alerts")]
    public async Task<ActionResult<List<LowStockAlertDto>>> GetLowStockAlerts()
    {
        var alerts = await _mediator.Send(new GetLowStockAlertsQuery());
        return Ok(alerts);
    }

    [HttpPatch("alerts/{id}/read")]
    public async Task<IActionResult> MarkAlertAsRead(Guid id)
    {
        await _mediator.Send(new MarkAlertAsReadCommand(id));
        return NoContent();
    }
}