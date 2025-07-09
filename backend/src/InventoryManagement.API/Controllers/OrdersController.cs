using InventoryManagement.Application.Commands.Orders;
using InventoryManagement.Application.DTOs.Orders;
using InventoryManagement.Application.Queries.Orders;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace InventoryManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly IMediator _mediator;

    public OrdersController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<List<OrderDto>>> GetOrders([FromQuery] GetOrdersQuery query)
    {
        var user = HttpContext.User;
        var userIdStr = user.FindFirstValue(ClaimTypes.NameIdentifier);
        var role = user.FindFirstValue(ClaimTypes.Role);
        if (Guid.TryParse(userIdStr, out var userId))
        {
            if (role == "Customer")
            {
                query.CustomerId = userId;
                query.IsForCurrentUserOnly = true;
            }
            else if (role == "Staff")
            {
                query.AssignedStaffId = userId;
            }
            // Admin: no filter
        }
        var orders = await _mediator.Send(query);
        return Ok(orders);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<OrderDto>> GetOrder(Guid id)
    {
        var order = await _mediator.Send(new GetOrderByIdQuery { Id = id });
        if (order == null)
            return NotFound();
        return Ok(order);
    }

    [HttpGet("summary")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<ActionResult<OrderSummaryDto>> GetOrderSummary()
    {
        var summary = await _mediator.Send(new GetOrderSummaryQuery());
        return Ok(summary);
    }

    [HttpPost]
    public async Task<ActionResult<OrderDto>> CreateOrder([FromBody] CreateOrderCommand command)
    {
        try
        {
            var order = await _mediator.Send(command);
            return CreatedAtAction(nameof(GetOrders), new { id = order.Id }, order);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPatch("{id}/status")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<ActionResult<OrderDto>> UpdateOrderStatus(Guid id, [FromBody] UpdateOrderStatusCommand command)
    {
        if (id != command.OrderId)
            return BadRequest("ID mismatch");

        try
        {
            var order = await _mediator.Send(command);
            return Ok(order);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}