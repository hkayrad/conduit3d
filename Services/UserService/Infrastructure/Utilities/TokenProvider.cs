using System;
using System.Security.Claims;
using System.Text;
using UserService.Domain;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;

namespace UserService.Infrastructure.Utilities;

internal sealed class TokenProvider
{
    public static string GenerateToken(User user)
    {
        var expirationTimeHrs = int.TryParse(Environment.GetEnvironmentVariable("JWT_EXPIRATION_TIME_HRS"),
            out var hrs) ? hrs :
            throw new InvalidOperationException("JWT_EXPIRATION_TIME_HRS environment variable is not set.");
        var issuer = Environment.GetEnvironmentVariable("JWT_ISSUER") ??
            throw new InvalidOperationException("JWT_ISSUER environment variable is not set.");
        var audience = Environment.GetEnvironmentVariable("JWT_AUDIENCE") ??
            throw new InvalidOperationException("JWT_AUDIENCE environment variable is not set.");
        var secretKey = Environment.GetEnvironmentVariable("JWT_SECRET") ??
            throw new InvalidOperationException("JWT_SECRET environment variable is not set.");
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));

        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity([
                new Claim(JwtRegisteredClaimNames.Sub, user.Username),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim("user_role", user.UserRole),
            ]),
            Expires = DateTime.UtcNow.AddHours(expirationTimeHrs),
            SigningCredentials = credentials,
            Issuer = issuer,
            Audience = audience
        };

        var handler = new JsonWebTokenHandler();

        string token = handler.CreateToken(tokenDescriptor);

        return token;
    }
}