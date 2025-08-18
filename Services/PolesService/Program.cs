using System.Net;
using Asp.Versioning;
using PolesService.Infrastructure;
using PolesService.Infrastructure.Data;
using PolesService.Infrastructure.Services;
using PolesService.Resources;
using Conduit3D.Common.Domain;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddApiVersioning(options =>
{
    options.DefaultApiVersion = new ApiVersion(1, 0);
    options.AssumeDefaultVersionWhenUnspecified = true;
    options.ReportApiVersions = true;
    options.ApiVersionReader = ApiVersionReader.Combine(
        new UrlSegmentApiVersionReader(),
        new HeaderApiVersionReader("x-api-version")
    );
}).AddApiExplorer(options =>
{
    options.GroupNameFormat = "'v'VVV";
    options.SubstituteApiVersionInUrl = true;
});

builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.InvalidModelStateResponseFactory = context =>
    {
        var errors = context.ModelState
            .Where(x => x.Value?.Errors.Count > 0)
            .ToDictionary(
                x => x.Key,
                x => x.Value!.Errors.Select(e => e.ErrorMessage).ToArray()
            );

        var response = new Response<object>
        {
            IsSuccess = false,
            Message = PolesResources.GetString("oneOrMoreValidationError"),
            Data = errors,
            StatusCode = HttpStatusCode.BadRequest
        };

        return new BadRequestObjectResult(response);
    };
});

// builder.Services.AddCors();

builder.Services.AddSwaggerGen(config =>
{
    config.SwaggerDoc("v1", new OpenApiInfo { Title = "Conduit3D Auth API", Version = "v1" });
});

string? postgresqlConnectionString = Environment.GetEnvironmentVariable("POSTGRESQL_CONNECTION_STRING");

if (string.IsNullOrEmpty(postgresqlConnectionString))
    throw new InvalidOperationException("POSTGRESQL_CONNECTION_STRING environment variable is not set.");

builder.Services.AddDbContext<PolesContext>(options =>
{
    options.UseNpgsql(postgresqlConnectionString);
});
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<IAgDirekService, PostgresqlAgDirekService>();
builder.Services.AddScoped<IAydDirekService, PostgresqlAydDirekService>();
builder.Services.AddScoped<IOgMusDirekService, PostgresqlOgMusDirekService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// app.UseCors(x => x.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());

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
                PolesResources.GetString("unauthorizedAccess")));
            return;
        }
    }
    await next();
});

app.UseAuthorization();

app.MapControllers();

app.Run();