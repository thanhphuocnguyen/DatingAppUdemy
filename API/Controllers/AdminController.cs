
using API.Helpers;

namespace API.Controllers;

public class AdminController : BaseAPIController
{
    private readonly UserManager<AppUser> _userManager;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPhotoService _photoService;
    public AdminController(UserManager<AppUser> userManager, IUnitOfWork unitOfWork, IPhotoService photoService)
    {
        _photoService = photoService;
        _unitOfWork = unitOfWork;
        _userManager = userManager;

    }

    [Authorize(Policy = "RequireAdminRole")]
    [HttpGet("users-with-roles")]
    public async Task<ActionResult> GetUsersWithRoles()
    {
        var users = await _userManager.Users
        .Include(r => r.UserRoles)
        .ThenInclude(r => r.Role)
        .OrderBy(u => u.UserName)
        .Select(
            u => new
            {
                u.Id,
                Username = u.UserName,
                Roles = u.UserRoles
                .Select(r => r.Role.Name)
                .ToList()
            })
        .ToListAsync();
        return Ok(users);
    }

    [HttpPost("edit-roles/{username}")]
    public async Task<ActionResult> EditRoles(string username, [FromQuery] string roles)
    {
        var selectedRoles = roles.Split(",").ToArray();

        var user = await _userManager.FindByNameAsync(username);

        if (user == null) return NotFound("Could not find user");

        var userRoles = await _userManager.GetRolesAsync(user);

        var result = await _userManager.AddToRolesAsync(user, selectedRoles.Except(userRoles));
        if (!result.Succeeded)
        {
            return BadRequest("Failed to add to roles");
        }
        result = await _userManager.RemoveFromRolesAsync(user, userRoles.Except(selectedRoles));

        if (!result.Succeeded) return BadRequest("Failed to remove from roles");
        return Ok(await _userManager.GetRolesAsync(user));
    }


    [Authorize(Policy = "ModeratePhotoRole")]
    [HttpGet("photos-to-moderate")]
    public async Task<ActionResult> GetPhotosForApproval([FromQuery] PaginationParams paginationParams)
    {
        var photos = await _unitOfWork.PhotoRepository.GetUnapprovedPhotos(paginationParams);
        Response.AddPaginationHeader(photos.CurrentPage, photos.PageSize, photos.TotalPages, photos.TotalCount);
        return Ok(photos);
    }

    [HttpPost("approve-photo/{photoId}")]
    public async Task<ActionResult> ApprovePhoto(long photoId)
    {
        var existedPhoto = await _unitOfWork.PhotoRepository.GetPhotoById(photoId);
        if (existedPhoto == null) return NotFound("There is no photo");
        var userByPhoto = await _unitOfWork.UserRepository.GetUserByPhotoId(photoId);
        if (userByPhoto == null) return NotFound("There is no user with this photo");
        if (!userByPhoto.Photos.Any(p => p.IsMain)) existedPhoto.IsMain = true;
        existedPhoto.IsApproved = true;
        if (await _unitOfWork.Complete())
        {
            return Ok();
        }
        else
        {
            return BadRequest("Failed to approve photo");
        }
    }
    [HttpPost("reject-photo/{photoId}")]
    public async Task<ActionResult> Rejecthoto(long photoId)
    {
        var existedPhoto = await _unitOfWork.PhotoRepository.GetPhotoById(photoId);
        if (existedPhoto != null)
        {
            if (existedPhoto.PublicId != null)
            {
                var result = await _photoService.DeletePhotoAsync(existedPhoto.PublicId);
                if (result.Error != null)
                {
                    return BadRequest(result.Error.Message);
                }
            }
            _unitOfWork.PhotoRepository.RemovePhoto(existedPhoto);
            if (await _unitOfWork.Complete())
            {
                return Ok();
            }
            return BadRequest("Failed to delete photo");
        }
        else
        {
            return NotFound("Photo is not existed");
        }
    }
}
