using InventoryManagement.Application.DTOs.Auth;
using MediatR;
using InventoryManagement.Domain.Enums;

namespace InventoryManagement.Application.Commands.Users
{
    public class CreateUserCommand : IRequest<UserDto>
    {
        public string Email { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public UserRole Role { get; set; }
        public string Password { get; set; } = string.Empty;
    }
} 