using InventoryManagement.Application.DTOs.Auth;
using MediatR;
using System.Collections.Generic;

namespace InventoryManagement.Application.Queries.Users
{
    public class GetUsersQuery : IRequest<List<UserDto>>
    {
        public string? Role { get; set; } // For filtering by role
    }
} 