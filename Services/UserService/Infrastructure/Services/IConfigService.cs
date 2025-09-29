using System;
using Conduit3D.Common.Domain;
using UserService.Domain;
using UserService.Infrastructure.DTOs;

namespace UserService.Infrastructure.Services;

public interface IConfigService
{
    public Task<Response<List<Config>>> GetAllConfigsAsync();
    public Task<Response<string>> GetConfigValueAsync(string key);
    public Task<Response<string>> SetConfigValueAsync(ConfigDto configDto);
    public Task<Response<string>> DeleteConfigValueAsync(string key);
}
