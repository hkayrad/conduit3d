using System;
using Microsoft.EntityFrameworkCore;
using UserService.Domain;
using UserService.Infrastructure.Data;
using UserService.Infrastructure.DTOs;

namespace UserService.Infrastructure.Repositories;

public class ConfigRepository(UsersContext context) : IConfigRepository
{
    private readonly UsersContext _context = context ?? throw new ArgumentNullException(nameof(context));
    public async Task<List<Config>> GetAllAsync()
    {
        return await _context.Configs.ToListAsync();
    }

    public async Task<string> GetConfigValueAsync(string key)
    {
        return await _context.Configs
            .Where(c => c.Key == key)
            .Select(c => c.Value)
            .FirstOrDefaultAsync() ?? string.Empty;
    }

    public async Task<string> SetConfigValueAsync(ConfigDto configDto)
    {
        var config = await _context.Configs
            .FirstOrDefaultAsync(c => c.Key == configDto.Key);

        if (config != null)
        {
            config.Value = configDto.Value;
            _context.Configs.Update(config);
        }
        else
        {
            config = new Config
            {
                Key = configDto.Key,
                Value = configDto.Value
            };
            await _context.Configs.AddAsync(config);
        }

        await _context.SaveChangesAsync();
        return config.Key;
    }

    public async Task<string> DeleteConfigValueAsync(string key)
    {
        var config = await _context.Configs
            .FirstOrDefaultAsync(c => c.Key == key);

        if (config != null)
        {
            _context.Configs.Remove(config);
            await _context.SaveChangesAsync();
            return config.Key;
        }

        return string.Empty;
    }
}
