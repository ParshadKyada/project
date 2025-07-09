using InventoryManagement.Application.Commands.Products;
using InventoryManagement.Application.Interfaces;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace InventoryManagement.Application.Handlers.Products
{
    public class DeleteProductHandler : IRequestHandler<DeleteProductCommand, Unit>
    {
        private readonly IApplicationDbContext _context;

        public DeleteProductHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Unit> Handle(DeleteProductCommand request, CancellationToken cancellationToken)
        {
            var product = await _context.Products.FindAsync(new object[] { request.Id }, cancellationToken);
            if (product == null)
                throw new InvalidOperationException("Product not found");

            // Soft delete if IsDeleted exists, else hard delete
            var isDeletedProp = product.GetType().GetProperty("IsDeleted");
            if (isDeletedProp != null)
            {
                isDeletedProp.SetValue(product, true);
            }
            else
            {
                _context.Products.Remove(product);
            }

            await _context.SaveChangesAsync(cancellationToken);
            return Unit.Value;
        }
    }
} 