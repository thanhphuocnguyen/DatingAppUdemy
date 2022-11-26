using API.Helpers;

namespace API.Interfaces;

public interface IPhotoRepository
{
    Task<PagedList<PhotoForApprovalDto>> GetUnapprovedPhotos(PaginationParams paginationParams);
    Task<Photo> GetPhotoById(long photoId);
    void RemovePhoto(Photo photo);
}
