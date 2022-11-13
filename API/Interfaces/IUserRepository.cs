using System.Threading.Tasks;
using API.DTOs;
using API.Entities;
using API.Helpers;

namespace API.Interfaces;

public interface IUserRepository
{
    void Update(AppUser user);
    Task<bool> SaveAllAsync();
    Task<PagedList<AppUser>> GetUsersAsync(UserParams userParams);
    Task<PagedList<MemberDto>> GetMembersAsync(UserParams userParams);
    Task<AppUser> GetUserByIdAsync(int id);
    Task<AppUser> GetUserByUserNameAsync(string userName);
    Task<MemberDto> GetMemberByUserNameAsync(string userName);
}
