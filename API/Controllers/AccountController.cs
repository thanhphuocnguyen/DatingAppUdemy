namespace API.Controllers
{
    public class AccountController : BaseAPIController
    {
        private readonly ITokenService _tokenService;
        private readonly IMapper _mapper;
        private readonly UserManager<AppUser> _userManager;
        private readonly SignInManager<AppUser> _signInManager;
        public AccountController(UserManager<AppUser> userManager, SignInManager<AppUser> signInManager, ITokenService tokenService, IMapper mapper)
        {
            _signInManager = signInManager;
            _userManager = userManager;
            _mapper = mapper;
            _tokenService = tokenService;
        }

        [HttpPost("register")]
        public async Task<ActionResult<UserDto>> Register(RegisterDto registerDto)
        {
            if (await IsUserRegistered(registerDto.UserName))
            {
                return BadRequest("UserName is already registered");
            }

            var newUser = new AppUser()
            {
                UserName = registerDto.UserName.ToLower(),
                City = registerDto.City,
                Country = registerDto.Country,
                DateOfBirth = registerDto.DateOfBirth,
                KnownAs = registerDto.KnownAs,
                Gender = registerDto.Gender
            };


            var result = await _userManager.CreateAsync(newUser, registerDto.Password);
            if (!result.Succeeded) return BadRequest(result.Errors);
            var resultAddRole = await _userManager.AddToRoleAsync(newUser, "Member");
            if (!resultAddRole.Succeeded) return BadRequest(result.Errors);

            return new UserDto
            {
                UserName = newUser.UserName,
                Token = await _tokenService.CreateToken(newUser),
                PhotoUrl = null,
                KnownAs = newUser.KnownAs,
                Gender = newUser.Gender
            };
        }

        [HttpPost("login")]
        public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
        {
            var user = await _userManager.Users
                .Include(p => p.Photos)
                .SingleOrDefaultAsync(x => x.UserName == loginDto.UserName.ToLower());

            if (user == null)
            {
                return BadRequest("User not found");
            }
            var result = await _signInManager.CheckPasswordSignInAsync(user, loginDto.Password, false);
            if (!result.Succeeded) return Unauthorized();
            return new UserDto
            {
                UserName = user.UserName,
                Token = await _tokenService.CreateToken(user),
                PhotoUrl = user.Photos.FirstOrDefault(x => x.IsMain)?.Url,
                Gender = user.Gender,
                KnownAs = user.KnownAs
            };
        }
        private async Task<bool> IsUserRegistered(string username)
        {
            return await _userManager.Users.AnyAsync(x => x.UserName == username.ToLower());
        }

    }
}