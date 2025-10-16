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
using Conduit3D.Common.Infrastructure.Formatters;
using Conduit3D.Common.Infrastructure.Utilities;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers(options =>
{
    options.OutputFormatters.Add(new ProtobufOutputFormatter());
});

// Configure API versioning
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

// Custom error handler to send appropriate response to the user.
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

// Configure Swagger
builder.Services.AddSwaggerGen(config =>
{
    config.SwaggerDoc("v1", new OpenApiInfo { Title = "Conduit3D Poles API", Version = "v1" });

    // Use custom schema IDs to handle pbf and generic types collisions
    config.CustomSchemaIds(type =>
    {
        if (type.IsGenericType)
        {
            var genericTypeName = type.GetGenericTypeDefinition().Name;

            // Remove generic type suffixes like `1, `2, etc.
            var backtickIndex = genericTypeName.IndexOf('`');
            if (backtickIndex > 0)
            {
                genericTypeName = genericTypeName.Substring(0, backtickIndex);
            }

            // Get all generic arguments and build their names recursively
            var genericArgs = type.GetGenericArguments()
                .Select(arg => TypeDisplayName.Get(arg))
                .ToArray();

            return $"{genericTypeName}Of{string.Join("And", genericArgs)}";
        }
        return type.Name;
    });

    // Configure JWT authentication
    config.AddSecurityDefinition("bearerAuth", new OpenApiSecurityScheme
    {
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        Description = "JWT Authorization header using the Bearer scheme."
    });

    config.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "bearerAuth"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Connect to the db if the connection string is valid
builder.Services.AddDbContext<PolesContext>(options =>
{
    // Get PostgreSQL connection string
    string? postgresqlConnectionString = Environment.GetEnvironmentVariable("POSTGRESQL_CONNECTION_STRING");

    // Validate the connection string
    if (string.IsNullOrEmpty(postgresqlConnectionString))
        throw new InvalidOperationException("POSTGRESQL_CONNECTION_STRING environment variable is not set.");

    options.UseNpgsql(postgresqlConnectionString,
    o => o.UseNetTopologySuite()
        );
});

// Inject dependencies
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
                PolesResources.GetString("unauthorizedAccess")));
            return;
        }
    }
    await next();
});

app.UseAuthorization();

app.MapControllers();

await app.RunAsync();

public partial class Program { };