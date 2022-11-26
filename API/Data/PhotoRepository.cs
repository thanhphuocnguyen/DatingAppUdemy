using API.Helpers;
using AutoMapper.QueryableExtensions;

namespace API.Data;

public class PhotoRepository : IPhotoRepository
{
    private readonly DataContext _context;
    private readonly IMapper _mapper;
    public PhotoRepository()
    {
    }
    public PhotoRepository(DataContext context, IMapper mapper)
    {
        _mapper = mapper;
        _context = context;
    }

    public async Task<Photo> GetPhotoById(long photoId)
    {
        return await _context.Photos
            .Where(x => x.Id == photoId)
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync();
    }

    public Task<PagedList<PhotoForApprovalDto>> GetUnapprovedPhotos(PaginationParams paginationParams)
    {
        var query = _context.Photos
            .Where(x => x.IsApproved == false)
            .IgnoreQueryFilters()
            .ProjectTo<PhotoForApprovalDto>(_mapper.ConfigurationProvider);
        return PagedList<PhotoForApprovalDto>
            .CreateAsync(query.AsNoTracking(), paginationParams.PageSize, paginationParams.PageNumber);
    }

    public void RemovePhoto(Photo photo)
    {
        _context.Photos.Remove(photo);
    }
}
