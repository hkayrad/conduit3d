using System;
using System.Net;
using Conduit3D.Common.Domain;
using Npgsql;
using PolesService.Domain;
using PolesService.Resources;

namespace PolesService.Infrastructure.Services;

/// <summary>
/// PostgreSQL implementation of <see cref="IOgMusDirekService"/> for managing Og_Mus_Direk entities.
/// </summary>
/// <param name="unitOfWork"></param>
public class PostgresqlOgMusDirekService(IUnitOfWork unitOfWork) : IOgMusDirekService
{
    /// <summary>
    /// Unit of work for managing database operations.
    /// </summary>
    private readonly IUnitOfWork _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));

    /// <inheritdoc />
    public async Task<Response<List<OgMusDirek>>> GetAllAsync(int pageNumber,
                                                            int pageSize,
                                                            string sortBy,
                                                            bool ascending,
                                                            Extent? extent,
                                                            string? query,
                                                            CancellationToken cancellationToken)
    {
        if (pageSize < 1 || pageSize > 200000)
            return Response<List<OgMusDirek>>.ValidationError(PolesResources.GetString("invalidPageSize"));

        if (pageNumber < 1)
            return Response<List<OgMusDirek>>.ValidationError(PolesResources.GetString("invalidPageNumber"));

        if (!AllowedSortingColumns.PoleColumns.Contains(sortBy))
            return Response<List<OgMusDirek>>.ValidationError(PolesResources.GetString("invalidSortBy"));

        extent ??= new Extent { MinX = -180, MaxX = 180, MinY = -90, MaxY = 90 };

        if (!extent.IsValid())
            return Response<List<OgMusDirek>>.ValidationError(PolesResources.GetString("invalidExtent"));

        try
        {
            var ogMusDirekler = await _unitOfWork.OgMusDirekRepository.GetAllAsync(pageNumber,
                                                                            pageSize,
                                                                            sortBy,
                                                                            ascending,
                                                                            extent,
                                                                            query,
                                                                            cancellationToken);

            if (ogMusDirekler == null || ogMusDirekler.Count == 0)
                return Response<List<OgMusDirek>>.NotFound(PolesResources.GetString("noPoleFound"));

            return Response<List<OgMusDirek>>.Success(ogMusDirekler, PolesResources.GetString("polesRetrieved"));
        }
        catch (NpgsqlException ex)
        {
            return Response<List<OgMusDirek>>.DatabaseError(PolesResources.GetString("poleRetrievalFailed", ex.Message));
        }
        catch (Exception ex)
        {
            return Response<List<OgMusDirek>>.UnhandledError(PolesResources.GetString("poleRetrievalFailed", ex.Message));
        }
    }

    /// <inheritdoc />
    public async Task<Response<OgMusDirek>> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        if (id <= 0)
            return Response<OgMusDirek>.ValidationError(PolesResources.GetString("invalidId"));

        try
        {
            var ogMusDirek = await _unitOfWork.OgMusDirekRepository.GetByIdAsync(id, cancellationToken);

            if (ogMusDirek == null)
                return Response<OgMusDirek>.NotFound(PolesResources.GetString("poleNotFound", id));

            return Response<OgMusDirek>.Success(ogMusDirek, PolesResources.GetString("poleRetrieved"));
        }
        catch (NpgsqlException ex)
        {
            return Response<OgMusDirek>.DatabaseError(PolesResources.GetString("poleRetrievalFailed", ex.Message));
        }
        catch (Exception ex)
        {
            return Response<OgMusDirek>.UnhandledError(PolesResources.GetString("poleRetrievalFailed", ex.Message));
        }
    }

    /// <inheritdoc />
    public async Task<Response<int>> GetCountAsync(Extent? extent, string? query, CancellationToken cancellationToken)
    {
        extent ??= new Extent { MinX = -180, MaxX = 180, MinY = -90, MaxY = 90 };

        if (!extent.IsValid())
            return Response<int>.ValidationError(PolesResources.GetString("invalidExtent"));

        try
        {
            var count = await _unitOfWork.OgMusDirekRepository.GetCountAsync(extent, query, cancellationToken);
            return Response<int>.Success(count, PolesResources.GetString("poleCountRetrieved"));
        }
        catch (NpgsqlException ex)
        {
            return Response<int>.DatabaseError(PolesResources.GetString("poleCountRetrievalFailed", ex.Message));
        }
        catch (Exception ex)
        {
            return Response<int>.UnhandledError(PolesResources.GetString("poleCountRetrievalFailed", ex.Message));
        }
    }

    /// <inheritdoc />
    public async Task<Response<List<string>>> GetTipListAsync(CancellationToken cancellationToken)
    {
        try
        {
            var tipList = await _unitOfWork.OgMusDirekRepository.GetTipListAsync(cancellationToken);
            if (tipList == null || tipList.Count == 0)
                return Response<List<string>>.NotFound(PolesResources.GetString("noTipFound"));

            return Response<List<string>>.Success(tipList, PolesResources.GetString("tipListRetrieved"));
        }
        catch (NpgsqlException ex)
        {
            return Response<List<string>>.DatabaseError(PolesResources.GetString("tipListRetrievalFailed", ex.Message));
        }
        catch (Exception ex)
        {
            return Response<List<string>>.UnhandledError(PolesResources.GetString("tipListRetrievalFailed", ex.Message));
        }
    }

    public async Task<OgMusDirekResponse> GetAllAsProtobufAsync(int pageNumber, int pageSize, string sortBy, bool ascending, Extent? extent, string? query, CancellationToken cancellationToken)
    {
        if (pageSize < 1 || pageSize > 200000)
            return new OgMusDirekResponse
            {
                IsSuccess = false,
                Message = PolesResources.GetString("invalidPageSize"),
                StatusCode = (int)HttpStatusCode.BadRequest,
                Data = { }
            };

        if (pageNumber < 1)
            return new OgMusDirekResponse
            {
                IsSuccess = false,
                Message = PolesResources.GetString("invalidPageNumber"),
                StatusCode = (int)HttpStatusCode.BadRequest,
                Data = { }
            };

        if (!AllowedSortingColumns.PoleColumns.Contains(sortBy))
            return new OgMusDirekResponse
            {
                IsSuccess = false,
                Message = PolesResources.GetString("invalidSortBy"),
                StatusCode = (int)HttpStatusCode.BadRequest,
                Data = { }
            };

        extent ??= new Extent { MinX = -180, MaxX = 180, MinY = -90, MaxY = 90 };

        if (!extent.IsValid())
            return new OgMusDirekResponse
            {
                IsSuccess = false,
                Message = PolesResources.GetString("invalidExtent"),
                StatusCode = (int)HttpStatusCode.BadRequest,
                Data = { }
            };

        try
        {
            var buildings = await _unitOfWork.OgMusDirekRepository.GetAllAsync(pageNumber,
                                                                    pageSize,
                                                                    sortBy,
                                                                    ascending,
                                                                    extent,
                                                                    query,
                                                                    cancellationToken);

            if (buildings == null || buildings.Count == 0)
                return new OgMusDirekResponse
                {
                    IsSuccess = false,
                    Message = PolesResources.GetString("noPoleFound"),
                    StatusCode = (int)HttpStatusCode.NotFound,
                    Data = { }
                };

            var buildingsResponse = new OgMusDirekResponse
            {
                IsSuccess = true,
                Message = PolesResources.GetString("polesRetrieved"),
                StatusCode = (int)HttpStatusCode.OK,
            };

            foreach (var building in buildings)
            {
                buildingsResponse.Data.Add(new OgMusDirekProto
                {
                    Id = building.Id,
                    Kodu = building.Kodu ?? string.Empty,
                    Adi = building.Adi ?? string.Empty,
                    Cinsi = building.Cinsi ?? string.Empty,
                    Tipi = building.Tipi ?? string.Empty,
                    DirekNo = building.DirekNo ?? string.Empty,
                    BoyOzellik = building.BoyOzellik ?? string.Empty,
                    DirekBoyId = building.DirekBoyId,
                    Wkb = Convert.ToBase64String(building.Wkb)
                });
            }

            return buildingsResponse;
        }
        catch (NpgsqlException ex)
        {
            return new OgMusDirekResponse
            {
                IsSuccess = false,
                Message = PolesResources.GetString("poleRetrievalFailed", ex.Message),
                StatusCode = (int)HttpStatusCode.InternalServerError,
                Data = { }
            };
        }
        catch (Exception ex)
        {
            return new OgMusDirekResponse
            {
                IsSuccess = false,
                Message = PolesResources.GetString("poleRetrievalFailed", ex.Message),
                StatusCode = (int)HttpStatusCode.InternalServerError,
                Data = { }
            };
        }
    }
}
