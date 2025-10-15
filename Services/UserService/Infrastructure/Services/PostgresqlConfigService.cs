using System;
using Conduit3D.Common.Domain;
using UserService.Domain;
using UserService.Infrastructure.DTOs;
using UserService.Resources;

namespace UserService.Infrastructure.Services;

public class PostgresqlConfigService(IUnitOfWork unitOfWork) : IConfigService
{
    private readonly IUnitOfWork _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));

    public async Task<Response<List<Config>>> GetAllConfigsAsync()
    {
        try
        {
            var configs = await _unitOfWork.ConfigRepository.GetAllAsync();
            return Response<List<Config>>.Success(configs, UserResources.GetString("configsRetrieved"));
        }
        catch (Exception ex)
        {
            return Response<List<Config>>.Failure(UserResources.GetString("configsRetrievalFailed", ex.Message));
        }
    }

    public async Task<Response<string>> GetConfigValueAsync(string key)
    {
        try
        {
            var value = await _unitOfWork.ConfigRepository.GetConfigValueAsync(key);
            return Response<string>.Success(value, UserResources.GetString("configValueRetrieved"));
        }
        catch (Exception ex)
        {
            return Response<string>.Failure(UserResources.GetString("configValueRetrievalFailed", ex.Message));
        }
    }

    public async Task<Response<string>> SetConfigValueAsync(ConfigDto configDto)
    {
        try
        {
            await _unitOfWork.ConfigRepository.SetConfigValueAsync(configDto);
            return Response<string>.Success(configDto.Key, UserResources.GetString("configValueSet"));
        }
        catch (Exception ex)
        {
            return Response<string>.Failure(UserResources.GetString("configValueSettingFailed", ex.Message));
        }
    }

    public async Task<Response<string>> DeleteConfigValueAsync(string key)
    {
        try
        {
            var config = await _unitOfWork.ConfigRepository.GetAllAsync();
            var configToDelete = config.FirstOrDefault(c => c.Key == key);
            if (configToDelete == null)
            {
                return Response<string>.NotFound(UserResources.GetString("noConfigFound"));
            }

            var result = await _unitOfWork.ConfigRepository.DeleteConfigValueAsync(key);
            return Response<string>.Success(key, UserResources.GetString("configValueDeleted"));
        }
        catch (Exception ex)
        {
            return Response<string>.Failure(UserResources.GetString("configDeletionFailed", ex.Message));
        }
    }
}
