using InventoryManagement.Application.Commands.Users;
using InventoryManagement.Application.DTOs.Auth;
using InventoryManagement.Application.Interfaces;
using InventoryManagement.Domain.Entities;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace InventoryManagement.Application.Handlers.Users
{
    public class CreateUserHandler : IRequestHandler<CreateUserCommand, UserDto>
    {
        private readonly IApplicationDbContext _context;

        public CreateUserHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<UserDto> Handle(CreateUserCommand request, CancellationToken cancellationToken)
        {
            // TODO: Add password hashing and validation as needed
            var user = new User
            {
                Id = Guid.NewGuid(),
                Email = request.Email,
                FirstName = request.FirstName,
                LastName = request.LastName,
                Role = request.Role,
                PasswordHash = request.Password // Replace with hash in production
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync(cancellationToken);
            return new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Role = user.Role,
                Permissions = new System.Collections.Generic.List<string>()
            };
        }
    }
} 