using MediatR;
using System;

namespace InventoryManagement.Application.Commands.Products
{
    public class DeleteProductCommand : IRequest<Unit>
    {
        public Guid Id { get; set; }
    }
} 