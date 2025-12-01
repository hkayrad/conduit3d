using System;
using System.Net;
using BuildingsService.Domain;
using BuildingsService.Resources;
using Conduit3D.Common.Domain;
using Npgsql;

namespace BuildingsService.Infrastructure.Services;

/// <summary>
/// PostgreSQL implementation of <see cref="ITrafoBinaService"/> for managing TRAFO_BINA entities.
/// </summary>
/// <param name="unitOfWork">Unit of Work for buildings service.</param>
public class PostgresqlTrafoBinaService(IUnitOfWork unitOfWork) : ITrafoBinaService
{
    /// <summary>
    /// Unit of Work for buildings service.
    /// </summary>
    private readonly IUnitOfWork _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));

    /// <inheritdoc />
    public async Task<Response<List<TrafoBina>>> GetAllAsync(int pageNumber,
                                            int pageSize,
                                            string sortBy,
                                            bool ascending,
                                            Extent? extent,
                                            string? query,
                                            CancellationToken cancellationToken)
    {
        if (pageSize < 1 || pageSize > 200000)
            return Response<List<TrafoBina>>.ValidationError(BuildingsResources.GetString("invalidPageSize"));

        if (pageNumber < 1)
            return Response<List<TrafoBina>>.ValidationError(BuildingsResources.GetString("invalidPageNumber"));

        if (!AllowedSortingColumns.TrafoBinaColumns.Contains(sortBy))
            return Response<List<TrafoBina>>.ValidationError(BuildingsResources.GetString("invalidSortBy"));

        extent ??= new Extent { MinX = -180, MaxX = 180, MinY = -90, MaxY = 90 };

        if (!extent.IsValid())
            return Response<List<TrafoBina>>.ValidationError(BuildingsResources.GetString("invalidExtent"));

        try
        {
            var trafo = await _unitOfWork.TrafoBuildingsRepository.GetAllAsync(pageNumber,
                                                                    pageSize,
                                                                    sortBy,
                                                                    ascending,
                                                                    extent,
                                                                    query,
                                                                    cancellationToken);

            if (trafo == null || trafo.Count == 0)
                return Response<List<TrafoBina>>.NotFound(BuildingsResources.GetString("noBuildingFound"));

            return Response<List<TrafoBina>>.Success(trafo, BuildingsResources.GetString("buildingsRetrieved"));
        }
        catch (NpgsqlException ex)
        {
            return Response<List<TrafoBina>>.DatabaseError(BuildingsResources.GetString("buildingRetrievalFailed", ex.Message));
        }
        catch (Exception ex)
        {
            return Response<List<TrafoBina>>.UnhandledError(BuildingsResources.GetString("buildingRetrievalFailed", ex.Message));
        }
    }

    /// <inheritdoc />
    public async Task<Response<TrafoBina>> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        if (id <= 0)
            return Response<TrafoBina>.ValidationError(BuildingsResources.GetString("invalidId"));

        try
        {
            var trafo = await _unitOfWork.TrafoBuildingsRepository.GetByIdAsync(id, cancellationToken);

            if (trafo == null)
                return Response<TrafoBina>.NotFound(BuildingsResources.GetString("noBuildingFound", id));

            return Response<TrafoBina>.Success(trafo, BuildingsResources.GetString("buildingRetrieved"));
        }
        catch (NpgsqlException ex)
        {
            return Response<TrafoBina>.DatabaseError(BuildingsResources.GetString("buildingRetrievalFailed", ex.Message));
        }
        catch (Exception ex)
        {
            return Response<TrafoBina>.UnhandledError(BuildingsResources.GetString("buildingRetrievalFailed", ex.Message));
        }
    }

    /// <inheritdoc />
    public async Task<Response<int>> GetCountAsync(Extent? extent, string? query, CancellationToken cancellationToken)
    {
        extent ??= new Extent { MinX = -180, MaxX = 180, MinY = -90, MaxY = 90 };

        if (!extent.IsValid())
            return Response<int>.ValidationError(BuildingsResources.GetString("invalidExtent"));

        try
        {
            var count = await _unitOfWork.TrafoBuildingsRepository.GetCountAsync(extent, query, cancellationToken);
            return Response<int>.Success(count, BuildingsResources.GetString("buildingCountRetrieved"));
        }
        catch (NpgsqlException ex)
        {
            return Response<int>.DatabaseError(BuildingsResources.GetString("buildingCountRetrievalFailed", ex.Message));
        }
        catch (Exception ex)
        {
            return Response<int>.UnhandledError(BuildingsResources.GetString("buildingCountRetrievalFailed", ex.Message));
        }
    }

    public async Task<TrafoBinaResponse> GetAllAsProtobufAsync(int pageNumber, int pageSize, string sortBy, bool ascending, Extent? extent, string? query, CancellationToken cancellationToken)
    {
        if (pageSize < 1 || pageSize > 200000)
            return new TrafoBinaResponse
            {
                IsSuccess = false,
                Message = BuildingsResources.GetString("invalidPageSize"),
                StatusCode = (int)HttpStatusCode.BadRequest,
                Data = { }
            };

        if (pageNumber < 1)
            return new TrafoBinaResponse
            {
                IsSuccess = false,
                Message = BuildingsResources.GetString("invalidPageNumber"),
                StatusCode = (int)HttpStatusCode.BadRequest,
                Data = { }
            };

        if (!AllowedSortingColumns.TrafoBinaColumns.Contains(sortBy))
            return new TrafoBinaResponse
            {
                IsSuccess = false,
                Message = BuildingsResources.GetString("invalidSortBy"),
                StatusCode = (int)HttpStatusCode.BadRequest,
                Data = { }
            };

        extent ??= new Extent { MinX = -180, MaxX = 180, MinY = -90, MaxY = 90 };

        if (!extent.IsValid())
            return new TrafoBinaResponse
            {
                IsSuccess = false,
                Message = BuildingsResources.GetString("invalidExtent"),
                StatusCode = (int)HttpStatusCode.BadRequest,
                Data = { }
            };

        try
        {
            var buildings = await _unitOfWork.TrafoBuildingsRepository.GetAllAsync(pageNumber,
                                                                    pageSize,
                                                                    sortBy,
                                                                    ascending,
                                                                    extent,
                                                                    query,
                                                                    cancellationToken);

            if (buildings == null || buildings.Count == 0)
                return new TrafoBinaResponse
                {
                    IsSuccess = false,
                    Message = BuildingsResources.GetString("noBuildingFound"),
                    StatusCode = (int)HttpStatusCode.NotFound,
                    Data = { }
                };

            var buildingsResponse = new TrafoBinaResponse
            {
                IsSuccess = true,
                Message = BuildingsResources.GetString("buildingsRetrieved"),
                StatusCode = (int)HttpStatusCode.OK,
            };

            foreach (var building in buildings)
            {
                buildingsResponse.Data.Add(new TrafoBinaProto
                {
                    Id = building.Id,
                    Kodu = building.Kodu ?? string.Empty,
                    Adi = building.Adi ?? string.Empty,
                    Wkb = Convert.ToBase64String(building.Wkb)
                });
            }

            return buildingsResponse;
        }
        catch (NpgsqlException ex)
        {
            return new TrafoBinaResponse
            {
                IsSuccess = false,
                Message = BuildingsResources.GetString("buildingRetrievalFailed", ex.Message),
                StatusCode = (int)HttpStatusCode.InternalServerError,
                Data = { }
            };
        }
        catch (Exception ex)
        {
            return new TrafoBinaResponse
            {
                IsSuccess = false,
                Message = BuildingsResources.GetString("buildingRetrievalFailed", ex.Message),
                StatusCode = (int)HttpStatusCode.InternalServerError,
                Data = { }
            };
        }
    }

    public async Task<Response<TrafoBina>> CreateAsync(TrafoBina entity, CancellationToken cancellationToken)
    {
        try
        {
            var createdEntity = await _unitOfWork.TrafoBuildingsRepository.AddAsync(entity, cancellationToken);
            return Response<TrafoBina>.Success(createdEntity, BuildingsResources.GetString("buildingCreated"));
        }
        catch (NpgsqlException ex)
        {
            return Response<TrafoBina>.DatabaseError(BuildingsResources.GetString("buildingCreationFailed", ex.Message));
        }
        catch (Exception ex)
        {
            return Response<TrafoBina>.UnhandledError(BuildingsResources.GetString("buildingCreationFailed", ex.Message));
        }
    }

    public async Task<Response<bool>> DeleteAsync(int id, CancellationToken cancellationToken)
    {
        try
        {
            var result = await _unitOfWork.TrafoBuildingsRepository.DeleteAsync(id, cancellationToken);
            if (!result)
                return Response<bool>.NotFound(BuildingsResources.GetString("noBuildingFound", id));

            return Response<bool>.Success(true, BuildingsResources.GetString("buildingDeleted"));
        }
        catch (NpgsqlException ex)
        {
            return Response<bool>.DatabaseError(BuildingsResources.GetString("buildingDeletionFailed", ex.Message));
        }
        catch (Exception ex)
        {
            return Response<bool>.UnhandledError(BuildingsResources.GetString("buildingDeletionFailed", ex.Message));
        }
    }

    public async Task<Response<TrafoBina>> UpdateAsync(TrafoBina entity, CancellationToken cancellationToken)
    {
        if (entity.Id <= 0)
            return Response<TrafoBina>.ValidationError(BuildingsResources.GetString("invalidId"));

        try
        {
            var updatedEntity = await _unitOfWork.TrafoBuildingsRepository.UpdateAsync(entity, cancellationToken);
            return Response<TrafoBina>.Success(updatedEntity, BuildingsResources.GetString("buildingUpdated"));
        }
        catch (KeyNotFoundException)
        {
            return Response<TrafoBina>.NotFound(BuildingsResources.GetString("noBuildingFound", entity.Id));
        }
        catch (NpgsqlException ex)
        {
            return Response<TrafoBina>.DatabaseError(BuildingsResources.GetString("buildingUpdateFailed", ex.Message));
        }
        catch (Exception ex)
        {
            return Response<TrafoBina>.UnhandledError(BuildingsResources.GetString("buildingUpdateFailed", ex.Message));
        }
    }
}
