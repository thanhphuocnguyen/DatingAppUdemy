using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;
[Authorize]
public class UsersController : BaseAPIController
{
    private readonly IUserRepository userRepository;
    private readonly IMapper _mapper;

    public UsersController(IUserRepository userRepository, IMapper mapper)
    {
        _mapper = mapper;
        this.userRepository = userRepository;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<MemberDto>>> GetUsers()
    {
        var users = await userRepository.GetMembersAsync();
        return Ok(users);
    }
    [HttpGet("{username}")]
    public async Task<ActionResult<MemberDto>> GetUser(string username)
    {
        var user = await userRepository.GetMemberByUserNameAsync(username);
        return user;
    }
    // [HttpGet("{id}")]
    // public async Task<ActionResult<AppUser>> GetUser(int id)
    // {
    //     return await userRepository.GetUserByIdAsync(id);
    // }
    [HttpPut]
    public async Task<ActionResult> UpdateUser(MemberUpdateDto updateDto)
    {
        var username = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var user = await userRepository.GetUserByUserNameAsync(username);

        _mapper.Map(updateDto, user);
        userRepository.Update(user);
        if (await userRepository.SaveAllAsync()) return NoContent();
        return BadRequest("Failed to update user");
    }
}
