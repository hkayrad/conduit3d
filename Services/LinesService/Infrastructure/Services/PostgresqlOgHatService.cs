using System;
using System.Net;
using Conduit3D.Common.Domain;
using LinesService.Domain;
using LinesService.Resources;
using Npgsql;

namespace LinesService.Infrastructure.Services;

/// <summary>
/// PostgreSQL implementation of <see cref="IOgHatService"/> for managing OG_HAT entities.
/// </summary>
/// <param name="unitOfWork">Unit of work for managing database operations.</param>
public class PostgresqlOgHatService(IUnitOfWork unitOfWork) : IOgHatService
{
    /// <summary>
    /// Unit of work for managing database operations.
    /// </summary>
    private readonly IUnitOfWork _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));

    /// <inheritdoc />
    public async Task<Response<List<OgHat>>> GetAllAsync(int pageNumber,
                                                        int pageSize,
                                                        string sortBy,
                                                        bool ascending,
                                                        Extent? extent,
                                                        string? query,
                                                        CancellationToken cancellationToken)
    {
        if (pageSize < 1 || pageSize > 200000)
            return Response<List<OgHat>>.ValidationError(LinesResources.GetString("invalidPageSize"));

        if (pageNumber < 1)
            return Response<List<OgHat>>.ValidationError(LinesResources.GetString("invalidPageNumber"));

        if (!AllowedSortingColumns.LineColumns.Contains(sortBy))
            return Response<List<OgHat>>.ValidationError(LinesResources.GetString("invalidSortBy"));

        extent ??= new Extent { MinX = -180, MaxX = 180, MinY = -90, MaxY = 90 };

        if (!extent.IsValid())
            return Response<List<OgHat>>.ValidationError(LinesResources.GetString("invalidExtent"));

        try
        {
            var ogHatlar = await _unitOfWork.OgHatRepository.GetAllAsync(pageNumber,
                                                                            pageSize,
                                                                            sortBy,
                                                                            ascending,
                                                                            extent,
                                                                            query,
                                                                            cancellationToken);

            if (ogHatlar == null || ogHatlar.Count == 0)
                return Response<List<OgHat>>.NotFound(LinesResources.GetString("noLineFound"));

            return Response<List<OgHat>>.Success(ogHatlar, LinesResources.GetString("linesRetrieved"));
        }
        catch (NpgsqlException ex)
        {
            return Response<List<OgHat>>.DatabaseError(LinesResources.GetString("lineRetrievalFailed", ex.Message));
        }
        catch (Exception ex)
        {
            return Response<List<OgHat>>.UnhandledError(LinesResources.GetString("lineRetrievalFailed", ex.Message));
        }
    }

    /// <inheritdoc />
    public async Task<Response<OgHat>> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        if (id <= 0)
            return Response<OgHat>.ValidationError(LinesResources.GetString("invalidId"));

        try
        {
            var ogHat = await _unitOfWork.OgHatRepository.GetByIdAsync(id, cancellationToken);

            if (ogHat == null)
                return Response<OgHat>.NotFound(LinesResources.GetString("lineNotFound", id));

            return Response<OgHat>.Success(ogHat, LinesResources.GetString("lineRetrieved"));
        }
        catch (NpgsqlException ex)
        {
            return Response<OgHat>.DatabaseError(LinesResources.GetString("lineRetrievalFailed", ex.Message));
        }
        catch (Exception ex)
        {
            return Response<OgHat>.UnhandledError(LinesResources.GetString("lineRetrievalFailed", ex.Message));
        }
    }

    /// <inheritdoc />
    public async Task<Response<int>> GetCountAsync(Extent? extent, string? query, CancellationToken cancellationToken)
    {
        extent ??= new Extent { MinX = -180, MaxX = 180, MinY = -90, MaxY = 90 };

        if (!extent.IsValid())
            return Response<int>.ValidationError(LinesResources.GetString("invalidExtent"));

        try
        {
            var count = await _unitOfWork.OgHatRepository.GetCountAsync(extent, query, cancellationToken);
            return Response<int>.Success(count, LinesResources.GetString("lineCountRetrieved"));
        }
        catch (NpgsqlException ex)
        {
            return Response<int>.DatabaseError(LinesResources.GetString("lineCountRetrievalFailed", ex.Message));
        }
        catch (Exception ex)
        {
            return Response<int>.UnhandledError(LinesResources.GetString("lineCountRetrievalFailed", ex.Message));
        }
    }

    /// <inheritdoc />
    public async Task<Response<List<string>>> GetTipListAsync(CancellationToken cancellationToken)
    {
        try
        {
            var tipList = await _unitOfWork.OgHatRepository.GetTipListAsync(cancellationToken);
            if (tipList == null || tipList.Count == 0)
                return Response<List<string>>.NotFound(LinesResources.GetString("noTipFound"));

            return Response<List<string>>.Success(tipList, LinesResources.GetString("tipListRetrieved"));
        }
        catch (NpgsqlException ex)
        {
            return Response<List<string>>.DatabaseError(LinesResources.GetString("tipListRetrievalFailed", ex.Message));
        }
        catch (Exception ex)
        {
            return Response<List<string>>.UnhandledError(LinesResources.GetString("tipListRetrievalFailed", ex.Message));
        }
    }

    public async Task<OgHatResponse> GetAllAsProtobufAsync(int pageNumber, int pageSize, string sortBy, bool ascending, Extent? extent, string? query, CancellationToken cancellationToken)
    {
        if (pageSize < 1 || pageSize > 200000)
            return new OgHatResponse
            {
                IsSuccess = false,
                Message = LinesResources.GetString("invalidPageSize"),
                StatusCode = (int)HttpStatusCode.BadRequest,
                Data = { }
            };

        if (pageNumber < 1)
            return new OgHatResponse
            {
                IsSuccess = false,
                Message = LinesResources.GetString("invalidPageNumber"),
                StatusCode = (int)HttpStatusCode.BadRequest,
                Data = { }
            };

        if (!AllowedSortingColumns.LineColumns.Contains(sortBy))
            return new OgHatResponse
            {
                IsSuccess = false,
                Message = LinesResources.GetString("invalidSortBy"),
                StatusCode = (int)HttpStatusCode.BadRequest,
                Data = { }
            };

        extent ??= new Extent { MinX = -180, MaxX = 180, MinY = -90, MaxY = 90 };

        if (!extent.IsValid())
            return new OgHatResponse
            {
                IsSuccess = false,
                Message = LinesResources.GetString("invalidExtent"),
                StatusCode = (int)HttpStatusCode.BadRequest,
                Data = { }
            };

        try
        {
            var buildings = await _unitOfWork.OgHatRepository.GetAllAsync(pageNumber,
                                                                    pageSize,
                                                                    sortBy,
                                                                    ascending,
                                                                    extent,
                                                                    query,
                                                                    cancellationToken);

            if (buildings == null || buildings.Count == 0)
                return new OgHatResponse
                {
                    IsSuccess = false,
                    Message = LinesResources.GetString("noLineFound"),
                    StatusCode = (int)HttpStatusCode.NotFound,
                    Data = { }
                };

            var buildingsResponse = new OgHatResponse
            {
                IsSuccess = true,
                Message = LinesResources.GetString("linesRetrieved"),
                StatusCode = (int)HttpStatusCode.OK,
            };

            foreach (var building in buildings)
            {
                buildingsResponse.Data.Add(new OgHatProto
                {
                    Id = building.Id,
                    Kodu = building.Kodu ?? string.Empty,
                    Adi = building.Adi ?? string.Empty,
                    Cinsi = building.Cinsi ?? string.Empty,
                    Kesit = building.Kesit ?? string.Empty,
                    Tipi = building.Tipi ?? string.Empty,
                    Wkb = Convert.ToBase64String(building.Wkb)
                });
            }

            return buildingsResponse;
        }
        catch (NpgsqlException ex)
        {
            return new OgHatResponse
            {
                IsSuccess = false,
                Message = LinesResources.GetString("lineRetrievalFailed", ex.Message),
                StatusCode = (int)HttpStatusCode.InternalServerError,
                Data = { }
            };
        }
        catch (Exception ex)
        {
            return new OgHatResponse
            {
                IsSuccess = false,
                Message = LinesResources.GetString("lineRetrievalFailed", ex.Message),
                StatusCode = (int)HttpStatusCode.InternalServerError,
                Data = { }
            };
        }
    }

    public async Task<Response<OgHat>> CreateAsync(OgHat entity, CancellationToken cancellationToken)
    {
        try
        {
            var createdEntity = await _unitOfWork.OgHatRepository.AddAsync(entity, cancellationToken);
            return Response<OgHat>.Success(createdEntity, LinesResources.GetString("lineCreated"));
        }
        catch (NpgsqlException ex)
        {
            return Response<OgHat>.DatabaseError(LinesResources.GetString("lineCreationFailed", ex.Message));
        }
        catch (Exception ex)
        {
            return Response<OgHat>.UnhandledError(LinesResources.GetString("lineCreationFailed", ex.Message));
        }
    }

    public async Task<Response<bool>> DeleteAsync(int id, CancellationToken cancellationToken)
    {
        try
        {
            var result = await _unitOfWork.OgHatRepository.DeleteAsync(id, cancellationToken);
            if (!result)
                return Response<bool>.NotFound(LinesResources.GetString("lineNotFound", id));

            return Response<bool>.Success(true, LinesResources.GetString("lineDeleted"));
        }
        catch (NpgsqlException ex)
        {
            return Response<bool>.DatabaseError(LinesResources.GetString("lineDeletionFailed", ex.Message));
        }
        catch (Exception ex)
        {
            return Response<bool>.UnhandledError(LinesResources.GetString("lineDeletionFailed", ex.Message));
        }
    }

    public async Task<Response<OgHat>> UpdateAsync(OgHat entity, CancellationToken cancellationToken)
    {
        if (entity.Id <= 0)
            return Response<OgHat>.ValidationError(LinesResources.GetString("invalidId"));

        try
        {
            var updatedEntity = await _unitOfWork.OgHatRepository.UpdateAsync(entity, cancellationToken);
            return Response<OgHat>.Success(updatedEntity, LinesResources.GetString("lineUpdated"));
        }
        catch (KeyNotFoundException)
        {
            return Response<OgHat>.NotFound(LinesResources.GetString("lineNotFound", entity.Id));
        }
        catch (NpgsqlException ex)
        {
            return Response<OgHat>.DatabaseError(LinesResources.GetString("lineUpdateFailed", ex.Message));
        }
        catch (Exception ex)
        {
            return Response<OgHat>.UnhandledError(LinesResources.GetString("lineUpdateFailed", ex.Message));
        }
    }
}
