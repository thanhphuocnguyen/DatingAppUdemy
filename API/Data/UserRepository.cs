using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs;
using API.Entities;
using API.Helpers;
using API.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class UserRepository : IUserRepository
{
    private readonly DataContext context;
    private readonly IMapper _mapper;

    public UserRepository(DataContext context, IMapper mapper)
    {
        _mapper = mapper;
        this.context = context;
    }

    public async Task<MemberDto> GetMemberByUserNameAsync(string userName)
    {
        return await context.Users.Where(
            x => x.UserName == userName
            ).ProjectTo<MemberDto>(
                _mapper.ConfigurationProvider
                ).SingleAsync();
    }

    public async Task<PagedList<MemberDto>> GetMembersAsync(UserParams userParams)
    {
        var query = context.Users.AsQueryable();
        query = query.Where(u => u.UserName != userParams.CurrentUserame);
        query = query.Where(u => u.Gender == userParams.Gender);
        var minDob = DateTime.Today.AddYears(-userParams.MaxAge - 1);
        var maxDob = DateTime.Today.AddYears(-userParams.MinAge);
        Console.WriteLine("================================================");
        Console.WriteLine(userParams.OrderBy);
        Console.WriteLine("================================================");
        query = query.Where(u => u.DateOfBirth >= minDob && u.DateOfBirth <= maxDob);
        query = userParams.OrderBy switch
        {
            "created" => query.OrderByDescending(u => u.CreatedAt),
            _ => query.OrderByDescending(u => u.LastActive)
        };
        return await PagedList<MemberDto>.CreateAsync(
            query.ProjectTo<MemberDto>(
                _mapper.ConfigurationProvider).AsNoTracking(),
            userParams.PageSize,
            userParams.PageNumber);
    }

    public async Task<AppUser> GetUserByIdAsync(int id)
    {
        return await context.Users.Include(p => p.Photos).SingleOrDefaultAsync(p => p.Id == id);
    }

    public async Task<AppUser> GetUserByUserNameAsync(string userName)
    {
        return await context.Users.Include(p => p.Photos).SingleOrDefaultAsync(x => x.UserName == userName);
    }

    public async Task<PagedList<AppUser>> GetUsersAsync(UserParams userParams)
    {
        var query = context.Users.Include(p => p.Photos).AsTracking();
        return await PagedList<AppUser>.CreateAsync(query, userParams.PageSize, userParams.PageNumber);
    }

    public async Task<bool> SaveAllAsync()
    {
        return await context.SaveChangesAsync() > 0;
    }

    public void Update(AppUser user)
    {
        context.Entry(user).State = EntityState.Modified;
    }
}
