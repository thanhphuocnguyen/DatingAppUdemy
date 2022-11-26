namespace API.Controllers;

public class BuggyController : BaseAPIController
{
    private readonly DataContext context;

    public BuggyController(DataContext context)
    {
        this.context = context;
    }
    [Authorize]
    [HttpGet("auth")]
    public ActionResult<string> GetSecret()
    {
        return "secret";
    }
    [HttpGet("not-found")]
    public ActionResult<AppUser> GetNotFound()
    {
        var thing = this.context.Users.Find(-1);
        if (thing != null)
        {
            return Ok(thing);
        }
        return NotFound();
    }
    [HttpGet("server-error")]
    public ActionResult<string> GetServerError()
    {
        var thing = this.context.Users.Find(-1);
        var thingToReturn = thing!.ToString();
        return thingToReturn;
    }
    [HttpGet("bad-request")]
    public ActionResult<string> GetBadRequest()
    {
        return BadRequest("This is not a good request");
    }
    // [HttpGet("auth")]
    // public ActionResult<string> GetSecret()
    // {
    //     return "secret";
    // }
}
