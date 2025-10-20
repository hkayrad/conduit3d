using System.Net;
using Asp.Versioning;
using UserService.Infrastructure;
using UserService.Infrastructure.Data;
using UserService.Infrastructure.Services;
using UserService.Resources;
using Conduit3D.Common.Domain;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Conduit3D.Common.Helpers;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Configure API versioning
builder.Services
    .AddApiVersioning(VersioningConfiguration.AddVersioning)
    .AddApiExplorer(VersioningConfiguration.AddExplorer);

// Custom error handler to send appropriate response to the user.
builder.Services.Configure<ApiBehaviorOptions>(BehaviourConfiguration.Configure);

// Configure Swagger
builder.Services.AddSwaggerGen(
    config => SwaggerConfiguration.Configure(config, 1, "Users")
);

// Connect to the sdb if the connection string is valid
builder.Services.AddDbContext<UsersContext>(
    options => DbContextConfiguration.Configure(options, false)
);

// Inject dependencies
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<IUserService, PostgresqlUserService>();
builder.Services.AddScoped<IConfigService, PostgresqlConfigService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Custom middleware for request logging & authorization
app.Use(async (context, next) =>
{
    var path = context.Request.Path.Value?.ToLower();

    if (app.Environment.IsDevelopment())
    {
        Console.WriteLine($"--- HEADERS ---");
        foreach (var header in context.Request.Headers)
        {
            Console.WriteLine($"{header.Key}: {header.Value}");
        }
        Console.WriteLine($"--- END HEADERS ---");
    }

    if (path != null)
    {
        if (path.Contains("/login") || path.Contains("/swagger"))
        {
            await next();
            return;
        }

        if (path.Contains("/users"))
        {
            var userRole = context.Request.Headers["Role"].FirstOrDefault();
            if (string.IsNullOrEmpty(userRole) || userRole != Roles.Admin)
            {
                context.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
                await context.Response.WriteAsJsonAsync(Response<object>.Unauthorized(
                    UserResources.GetString("unauthorizedAccess")));
                return;
            }
        }

        if (path.Contains("/config"))
        {
            var userRole = context.Request.Headers["Role"].FirstOrDefault();
            if (string.IsNullOrEmpty(userRole) || !Roles.AllowedRoles.Contains(userRole))
            {
                context.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
                await context.Response.WriteAsJsonAsync(Response<object>.Unauthorized(
                    UserResources.GetString("unauthorizedAccess")));
                return;
            }
        }
    }
    await next();
});

app.UseAuthorization();

app.MapControllers();

await app.RunAsync();

public partial class Program { };