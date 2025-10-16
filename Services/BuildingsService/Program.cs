using System.Net;
using Asp.Versioning;
using BuildingsService.Infrastructure;
using BuildingsService.Infrastructure.Data;
using BuildingsService.Infrastructure.Services;
using Conduit3D.Common.Infrastructure.Formatters;
using BuildingsService.Resources;
using Conduit3D.Common.Domain;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using Conduit3D.Common.Infrastructure.Utilities;
using Conduit3D.Common.Helpers;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers(OutputFormatterConfiguration.AddOutputFormatters);

// Configure API versioning
builder.Services
    .AddApiVersioning(VersioningConfiguration.AddVersioning)
    .AddApiExplorer(VersioningConfiguration.AddExplorer);

// Custom error handler to send appropriate response to the user.
builder.Services.Configure<ApiBehaviorOptions>(BehaviourConfiguration.Configure);

// Configure Swagger
builder.Services.AddSwaggerGen(
    config => SwaggerConfiguration.Configure(config, 1, "Buildings")
);

// Connect to the sdb if the connection string is valid
builder.Services.AddDbContext<BuildingsContext>(
    options => DbContextConfiguration.Configure(options, true)
);

// Inject dependencies
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<IBuildingsService, PostgresqlBuildingsService>();
builder.Services.AddScoped<IAdrBinaService, PostgresqlAdrBinaService>();
builder.Services.AddScoped<ITrafoBinaService, PostgresqlTrafoBinaService>();
builder.Services.AddScoped<IAdrYolService, PostgresqlAdrYolService>();

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

    if (path != null && !path.Contains("/swagger"))
    {
        var userRole = context.Request.Headers["Role"].FirstOrDefault();
        if (string.IsNullOrEmpty(userRole) || !Roles.AllowedRoles.Contains(userRole))
        {
            context.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
            await context.Response.WriteAsJsonAsync(Response<object>.Unauthorized(
                BuildingsResources.GetString("unauthorizedAccess")));
            return;
        }
    }
    await next();
});

app.UseAuthorization();

app.MapControllers();

await app.RunAsync();

public partial class Program { };