
using API.Helpers;
using API.Services;

namespace API.Extensions;

public static class ApplicationServiceExtensions
{
    public static IServiceCollection AddApplicationService(this IServiceCollection services, IConfiguration config)
    {
        services.AddDbContext<DataContext>(options =>
            {
                options.UseNpgsql(config.GetConnectionString("DefaultConnection"));
            });
        services.AddSingleton<PresenceTracker>();
        services.Configure<CloudinarySettings>(config.GetSection("CloudinarySettings"));
        services.AddScoped<ITokenService, TokenService>();
        services.AddScoped<IPhotoService, PhotoService>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<ILikeRepository, LikesRepository>();
        services.AddScoped<IMessageRepository, MessageRepository>();
        services.AddScoped<IPhotoRepository, PhotoRepository>();
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<LogUserActivity>();
        services.AddAutoMapper(typeof(AutoMapperProfiles).Assembly);
        var serviceProvider = services.BuildServiceProvider();
        var logger = serviceProvider.GetService<ILogger<DataContext>>();
        services.AddSingleton(typeof(ILogger), logger);

        return services;
    }
}
