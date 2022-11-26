using API.Helpers;

namespace API.Interfaces;

public interface IUserRepository
{
    void Update(AppUser user);
    Task<PagedList<AppUser>> GetUsersAsync(UserParams userParams);
    Task<PagedList<MemberDto>> GetMembersAsync(UserParams userParams);
    Task<AppUser> GetUserByIdAsync(int id);
    Task<AppUser> GetUserByUserNameAsync(string userName);
    Task<MemberDto> GetMemberByUserNameAsync(string userName, bool isCurrentUser);
    Task<string> GetUserGender(string username);
    Task<AppUser> GetUserByPhotoId(long photoId);
}
