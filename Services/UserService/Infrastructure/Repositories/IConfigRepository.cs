using System;
using UserService.Domain;
using UserService.Infrastructure.DTOs;

namespace UserService.Infrastructure.Repositories;

public interface IConfigRepository
{
    public Task<List<Config>> GetAllAsync();
    public Task<string> GetConfigValueAsync(string key);
    public Task<string> SetConfigValueAsync(ConfigDto configDto);
    public Task<string> DeleteConfigValueAsync(string key);
}
