using InventoryManagement.Application.Commands.Products;
using InventoryManagement.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InventoryManagement.Application.Handlers.Products;

public class DeleteCategoryHandler : IRequestHandler<DeleteCategoryCommand, Unit>
{
    private readonly IApplicationDbContext _context;

    public DeleteCategoryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Unit> Handle(DeleteCategoryCommand request, CancellationToken cancellationToken)
    {
        var category = await _context.Categories.FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);
        if (category == null)
            throw new InvalidOperationException("Category not found");
        _context.Categories.Remove(category);
        await _context.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }
} 