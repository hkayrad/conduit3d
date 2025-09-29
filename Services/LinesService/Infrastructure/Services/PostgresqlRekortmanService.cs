using System;
using System.Net;
using Conduit3D.Common.Domain;
using LinesService.Domain;
using LinesService.Resources;
using Npgsql;

namespace LinesService.Infrastructure.Services;

/// <summary>
/// PostgreSQL implementation of <see cref="IRekortmanService"/> for managing rekortman entities.
/// </summary>
/// <param name="unitOfWork">Unit of work for managing database operations.</param>
public class PostgresqlRekortmanService(IUnitOfWork unitOfWork) : IRekortmanService
{
    /// <summary>
    /// PostgreSQL implementation of <see cref="IRekortmanService"/> for managing rekortman entities.
    /// </summary>
    private readonly IUnitOfWork _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));

    /// <inheritdoc />
    public async Task<Response<List<Rekortman>>> GetAllAsync(int pageNumber,
                                                            int pageSize,
                                                            string sortBy,
                                                            bool ascending,
                                                            Extent? extent,
                                                            string? query,
                                                            CancellationToken cancellationToken)
    {
        if (pageSize < 1 || pageSize > 200000)
            return Response<List<Rekortman>>.ValidationError(LinesResources.GetString("invalidPageSize"));

        if (pageNumber < 1)
            return Response<List<Rekortman>>.ValidationError(LinesResources.GetString("invalidPageNumber"));

        if (!AllowedSortingColumns.RekortmanColumns.Contains(sortBy))
            return Response<List<Rekortman>>.ValidationError(LinesResources.GetString("invalidSortBy"));

        extent ??= new Extent { MinX = -180, MaxX = 180, MinY = -90, MaxY = 90 };

        if (extent.MinX == 0 && extent.MinY == 0 && extent.MaxX == 0 && extent.MaxY == 0)
        {
            extent = new Extent { MinX = -180, MaxX = 180, MinY = -90, MaxY = 90 };
        }

        if (!extent.IsValid())
            return Response<List<Rekortman>>.ValidationError(LinesResources.GetString("invalidExtent"));

        try
        {
            var rekortmanlar = await _unitOfWork.RekortmanRepository.GetAllAsync(pageNumber,
                                                                            pageSize,
                                                                            sortBy,
                                                                            ascending,
                                                                            extent,
                                                                            query,
                                                                            cancellationToken);

            if (rekortmanlar == null || rekortmanlar.Count == 0)
                return Response<List<Rekortman>>.NotFound(LinesResources.GetString("noLineFound"));

            return Response<List<Rekortman>>.Success(rekortmanlar, LinesResources.GetString("linesRetrieved"));
        }
        catch (NpgsqlException ex)
        {
            return Response<List<Rekortman>>.DatabaseError(LinesResources.GetString("lineRetrievalFailed", ex.Message));
        }
        catch (Exception ex)
        {
            return Response<List<Rekortman>>.UnhandledError(LinesResources.GetString("lineRetrievalFailed", ex.Message));
        }
    }

    /// <inheritdoc />
    public async Task<Response<Rekortman>> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        if (id <= 0)
            return Response<Rekortman>.ValidationError(LinesResources.GetString("invalidId"));

        try
        {
            var rekortman = await _unitOfWork.RekortmanRepository.GetByIdAsync(id, cancellationToken);

            if (rekortman == null)
                return Response<Rekortman>.NotFound(LinesResources.GetString("lineNotFound", id));

            return Response<Rekortman>.Success(rekortman, LinesResources.GetString("lineRetrieved"));
        }
        catch (NpgsqlException ex)
        {
            return Response<Rekortman>.DatabaseError(LinesResources.GetString("lineRetrievalFailed", ex.Message));
        }
        catch (Exception ex)
        {
            return Response<Rekortman>.UnhandledError(LinesResources.GetString("lineRetrievalFailed", ex.Message));
        }
    }

    /// <inheritdoc />
    public async Task<Response<int>> GetCountAsync(Extent? extent, string? query, CancellationToken cancellationToken)
    {
        extent ??= new Extent { MinX = -180, MaxX = 180, MinY = -90, MaxY = 90 };

        if (extent.MinX == 0 && extent.MinY == 0 && extent.MaxX == 0 && extent.MaxY == 0)
        {
            extent = new Extent { MinX = -180, MaxX = 180, MinY = -90, MaxY = 90 };
        }

        if (!extent.IsValid())
            return Response<int>.ValidationError(LinesResources.GetString("invalidExtent"));

        try
        {
            var count = await _unitOfWork.RekortmanRepository.GetCountAsync(extent, query, cancellationToken);
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
            var tipList = await _unitOfWork.RekortmanRepository.GetTipListAsync(cancellationToken);
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

    public async Task<RekortmanResponse> GetAllAsProtobufAsync(int pageNumber, int pageSize, string sortBy, bool ascending, Extent? extent, string? query, CancellationToken cancellationToken)
    {
        if (pageSize < 1 || pageSize > 200000)
            return new RekortmanResponse
            {
                IsSuccess = false,
                Message = LinesResources.GetString("invalidPageSize"),
                StatusCode = (int)HttpStatusCode.BadRequest,
                Data = { }
            };

        if (pageNumber < 1)
            return new RekortmanResponse
            {
                IsSuccess = false,
                Message = LinesResources.GetString("invalidPageNumber"),
                StatusCode = (int)HttpStatusCode.BadRequest,
                Data = { }
            };

        if (!AllowedSortingColumns.RekortmanColumns.Contains(sortBy))
            return new RekortmanResponse
            {
                IsSuccess = false,
                Message = LinesResources.GetString("invalidSortBy"),
                StatusCode = (int)HttpStatusCode.BadRequest,
                Data = { }
            };

        extent ??= new Extent { MinX = -180, MaxX = 180, MinY = -90, MaxY = 90 };

        if (extent.MinX == 0 && extent.MinY == 0 && extent.MaxX == 0 && extent.MaxY == 0)
        {
            extent = new Extent { MinX = -180, MaxX = 180, MinY = -90, MaxY = 90 };
        }

        if (!extent.IsValid())
            return new RekortmanResponse
            {
                IsSuccess = false,
                Message = LinesResources.GetString("invalidExtent"),
                StatusCode = (int)HttpStatusCode.BadRequest,
                Data = { }
            };

        try
        {
            var buildings = await _unitOfWork.RekortmanRepository.GetAllAsync(pageNumber,
                                                                    pageSize,
                                                                    sortBy,
                                                                    ascending,
                                                                    extent,
                                                                    query,
                                                                    cancellationToken);

            if (buildings == null || buildings.Count == 0)
                return new RekortmanResponse
                {
                    IsSuccess = false,
                    Message = LinesResources.GetString("noLineFound"),
                    StatusCode = (int)HttpStatusCode.NotFound,
                    Data = { }
                };

            var buildingsResponse = new RekortmanResponse
            {
                IsSuccess = true,
                Message = LinesResources.GetString("linesRetrieved"),
                StatusCode = (int)HttpStatusCode.OK,
            };

            foreach (var building in buildings)
            {
                buildingsResponse.Data.Add(new RekortmanProto
                {
                    Id = building.Id,
                    Kodu = building.Kodu ?? string.Empty,
                    Adi = building.Adi ?? string.Empty,
                    Kesit = building.Kesit ?? string.Empty,
                    Tipi = building.Tipi ?? string.Empty,
                    Wkb = Convert.ToBase64String(building.Wkb)
                });
            }

            return buildingsResponse;
        }
        catch (NpgsqlException ex)
        {
            return new RekortmanResponse
            {
                IsSuccess = false,
                Message = LinesResources.GetString("lineRetrievalFailed", ex.Message),
                StatusCode = (int)HttpStatusCode.InternalServerError,
                Data = { }
            };
        }
        catch (Exception ex)
        {
            return new RekortmanResponse
            {
                IsSuccess = false,
                Message = LinesResources.GetString("lineRetrievalFailed", ex.Message),
                StatusCode = (int)HttpStatusCode.InternalServerError,
                Data = { }
            };
        }
    }
}
