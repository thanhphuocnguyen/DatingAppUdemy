using API.Helpers;
using AutoMapper.QueryableExtensions;

namespace API.Data;

public class UserRepository : IUserRepository
{
    private readonly DataContext _context;
    private readonly IMapper _mapper;

    public UserRepository()
    {
    }

    public UserRepository(DataContext context, IMapper mapper)
    {
        _mapper = mapper;
        _context = context;
    }

    public async Task<MemberDto> GetMemberByUserNameAsync(string username, bool isCurrentUser)
    {
        var query = _context.Users.Where(
            x => x.UserName == username
            ).ProjectTo<MemberDto>(
                _mapper.ConfigurationProvider
                ).AsQueryable();
        if (isCurrentUser) query = query.IgnoreQueryFilters();
        return await query.FirstOrDefaultAsync();
    }

    public async Task<PagedList<MemberDto>> GetMembersAsync(UserParams userParams)
    {
        var query = _context.Users.AsQueryable();
        query = query.Where(u => u.UserName != userParams.CurrentUsername);
        query = query.Where(u => u.Gender == userParams.Gender);
        var minDob = DateTime.Today.AddYears(-userParams.MaxAge - 1);
        var maxDob = DateTime.Today.AddYears(-userParams.MinAge);
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
        return await _context.Users.Include(p => p.Photos).SingleOrDefaultAsync(p => p.Id == id);
    }

    public async Task<AppUser> GetUserByPhotoId(long photoId)
    {
        return await _context.Users
                .Include(p => p.Photos)
                .IgnoreQueryFilters()
                .SingleOrDefaultAsync(p => p.Photos.Any(p => p.Id == photoId));
    }

    public async Task<AppUser> GetUserByUserNameAsync(string username)
    {
        return await _context.Users.Include(p => p.Photos).SingleOrDefaultAsync(x => x.UserName == username);
    }

    public async Task<string> GetUserGender(string username)
    {
        return await _context.Users.Where(x => x.UserName == username).Select(x => x.Gender).FirstOrDefaultAsync();
    }

    public async Task<PagedList<AppUser>> GetUsersAsync(UserParams userParams)
    {
        var query = _context.Users.Include(p => p.Photos).AsTracking();
        return await PagedList<AppUser>.CreateAsync(query, userParams.PageSize, userParams.PageNumber);
    }

    public void Update(AppUser user)
    {
        _context.Entry(user).State = EntityState.Modified;
    }
}
