using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Interfaces;
using API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    public class AccountController : BaseAPIController
    {
        private readonly DataContext _context;
        private readonly ITokenService _tokenService;
        public AccountController(DataContext context, ITokenService tokenService)
        {
            _tokenService = tokenService;
            _context = context;
        }

        [HttpPost("register")]
        public async Task<ActionResult<UserDto>> Register(RegisterDto registerDto)
        {
            if (await IsUserRegistered(registerDto.UserName))
            {
                return BadRequest("UserName is already registered");
            }

            using var hmac = new HMACSHA512();
            var newUser = new AppUser()
            {
                UserName = registerDto.UserName.ToLower(),
                Password = hmac.ComputeHash(Encoding.UTF8.GetBytes(registerDto.Password)),
                PasswordSalt = hmac.Key
            };
            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();
            return new UserDto
            {
                UserName = newUser.UserName,
                Token = _tokenService.CreateToken(newUser),
            };
        }

        [HttpPost("login")]
        public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
        {
            var user = await _context.Users.Include(p => p.Photos).SingleOrDefaultAsync(x => x.UserName == loginDto.UserName);

            if (user == null)
            {
                return BadRequest("User not found");
            }
            using var hmac = new HMACSHA512(user.PasswordSalt);
            var computedHashed = hmac.ComputeHash(Encoding.UTF8.GetBytes(loginDto.Password));
            for (int i = 0; i < computedHashed.Length; i++)
            {
                if (computedHashed[i] != user.Password[i])
                {
                    return BadRequest("Invalid password");
                }
            }
            var token = _tokenService.CreateToken(user);
            var photoUrl = user.Photos.FirstOrDefault(x => x.IsMain)?.Url;
            return new UserDto
            {
                UserName = user.UserName,
                Token = token,
                PhotoUrl = photoUrl
            };
        }
        private async Task<bool> IsUserRegistered(string username)
        {
            return await _context.Users.AnyAsync(x => x.UserName == username.ToLower());
        }

    }
}