using InventoryManagement.Application.DTOs.Auth;
using InventoryManagement.Application.Interfaces;
using InventoryManagement.Application.Queries.Users;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using InventoryManagement.Domain.Enums;

namespace InventoryManagement.Application.Handlers.Users
{
    public class GetUsersHandler : IRequestHandler<GetUsersQuery, List<UserDto>>
    {
        private readonly IApplicationDbContext _context;

        public GetUsersHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<UserDto>> Handle(GetUsersQuery request, CancellationToken cancellationToken)
        {
            var usersQuery = _context.Users.AsQueryable();
            if (!string.IsNullOrEmpty(request.Role) && Enum.TryParse<UserRole>(request.Role, out var roleEnum))
            {
                usersQuery = usersQuery.Where(u => u.Role == roleEnum);
            }
            var users = await usersQuery.ToListAsync(cancellationToken);
            return users.Select(u => new UserDto
            {
                Id = u.Id,
                Email = u.Email,
                FirstName = u.FirstName,
                LastName = u.LastName,
                Role = u.Role,
                Permissions = new List<string>() // TODO: Map real permissions if needed
            }).ToList();
        }
    }
} 