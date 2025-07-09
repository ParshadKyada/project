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
public class SuppliersController : ControllerBase
{
    private readonly IMediator _mediator;

    public SuppliersController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<List<SupplierDto>>> GetSuppliers()
    {
        var suppliers = await _mediator.Send(new GetSuppliersQuery());
        return Ok(suppliers);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<SupplierDto>> GetSupplier(Guid id)
    {
        var supplier = await _mediator.Send(new GetSupplierByIdQuery { Id = id });
        if (supplier == null)
            return NotFound();
        return Ok(supplier);
    }

    [HttpPost]
    public async Task<ActionResult<SupplierDto>> CreateSupplier([FromBody] CreateSupplierCommand command)
    {
        var supplier = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetSupplier), new { id = supplier.Id }, supplier);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<SupplierDto>> UpdateSupplier(Guid id, [FromBody] UpdateSupplierCommand command)
    {
        if (id != command.Id)
            return BadRequest("ID mismatch");
        var supplier = await _mediator.Send(command);
        return Ok(supplier);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSupplier(Guid id)
    {
        await _mediator.Send(new DeleteSupplierCommand { Id = id });
        return NoContent();
    }
} 