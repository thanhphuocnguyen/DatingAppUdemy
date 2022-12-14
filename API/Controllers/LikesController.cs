using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Helpers;
namespace API.Controllers;
[Authorize]
public class LikesController : BaseAPIController
{
    private readonly IUnitOfWork _unitOfWork;

    public LikesController(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;

    }
    [HttpPost("{username}")]
    public async Task<ActionResult> AddLike(string username)
    {
        var sourceUserId = User.GetUserId();
        var likedUser = await _unitOfWork.UserRepository.GetUserByUserNameAsync(username);
        var sourceUser = await _unitOfWork.LikeRepository.GetUserWithLikes(sourceUserId);

        if (likedUser == null) return NotFound();

        if (sourceUser.UserName == username) return BadRequest("You cannot like yourself");

        var userLike = await _unitOfWork.LikeRepository.GetUserLike(sourceUserId, likedUser.Id);

        if (userLike != null) return BadRequest("You already like this user");

        userLike = new UserLike { SourceUserId = sourceUserId, LikedUserId = likedUser.Id };

        sourceUser.LikedUsers.Add(userLike);

        if (await _unitOfWork.Complete())
        {
            return Ok();
        }
        return BadRequest("Failed to like user");
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<LikeDto>>> GetUserLikes([FromQuery] LikesParams likesParams)
    {
        likesParams.UserId = User.GetUserId();
        var userLikes = await _unitOfWork.LikeRepository.GetUserLikes(likesParams);
        Response.AddPaginationHeader(userLikes.CurrentPage, userLikes.PageSize, userLikes.TotalPages, userLikes.TotalCount);
        return Ok(userLikes);
    }
}
