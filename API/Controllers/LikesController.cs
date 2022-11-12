using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;
[Authorize]
public class LikesController : BaseAPIController
{
    private readonly ILikeRepository _likeRepository;
    private readonly IUserRepository _userRepository;
    public LikesController(IUserRepository userRepository, ILikeRepository likeRepository)
    {
        _userRepository = userRepository;
        _likeRepository = likeRepository;
    }
    [HttpPost("{username}")]
    public async Task<ActionResult> AddLike(string username)
    {
        var sourceUserId = User.GetUserId();
        var likedUser = await _userRepository.GetUserByUserNameAsync(username);
        var sourceUser = await _likeRepository.GetUserWithLikes(sourceUserId);

        if (likedUser == null) return NotFound();

        if (sourceUser.UserName == username) return BadRequest("You cannot like yourself");

        var userLike = await _likeRepository.GetUserLike(sourceUserId, likedUser.Id);

        if (userLike != null) return BadRequest("You already like this user");

        userLike = new UserLike { SourceUserId = sourceUserId, LikedUserId = likedUser.Id };

        sourceUser.LikedUsers.Add(userLike);

        if (await _userRepository.SaveAllAsync())
        {
            return Ok();
        }
        return BadRequest("Failed to like user");
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<LikeDto>>> GetUserLikes([FromQuery] LikesParams likesParams)
    {
        likesParams.UserId = User.GetUserId();
        var userLikes = await _likeRepository.GetUserLikes(likesParams);
        Response.AddPaginationHeader(userLikes.CurrentPage, userLikes.PageSize, userLikes.TotalPages, userLikes.TotalCount);
        return Ok(userLikes);
    }
}
