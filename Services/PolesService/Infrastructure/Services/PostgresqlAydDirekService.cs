using System;
using System.Net;
using Conduit3D.Common.Domain;
using Npgsql;
using PolesService.Domain;
using PolesService.Resources;

namespace PolesService.Infrastructure.Services;

/// <summary>
/// PostgreSQL implementation of <see cref="IAydDirekService"/> for managing Ayd_Direk entities.
/// </summary>
/// <param name="unitOfWork"></param>
public class PostgresqlAydDirekService(IUnitOfWork unitOfWork) : IAydDirekService
{
    /// <summary>
    /// Unit of work for managing database operations.
    /// </summary>
    private readonly IUnitOfWork _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));

    /// <inheritdoc />
    public async Task<Response<List<AydDirek>>> GetAllAsync(int pageNumber,
                                                            int pageSize,
                                                            string sortBy,
                                                            bool ascending,
                                                            Extent? extent,
                                                            string? query,
                                                            CancellationToken cancellationToken)
    {
        if (pageSize < 1 || pageSize > 200000)
            return Response<List<AydDirek>>.ValidationError(PolesResources.GetString("invalidPageSize"));

        if (pageNumber < 1)
            return Response<List<AydDirek>>.ValidationError(PolesResources.GetString("invalidPageNumber"));

        string[] allowedSortColumns = [
            "Id",
            "Kodu",
            "Adi",
            "Cinsi",
            "Tipi",
            "DirekNo",
            "BoyOzellik",
            "DirekBoyId"
        ];

        if (!allowedSortColumns.Contains(sortBy))
            return Response<List<AydDirek>>.ValidationError(PolesResources.GetString("invalidSortBy"));

        extent ??= new Extent { MinX = -180, MaxX = 180, MinY = -90, MaxY = 90 };

        if (!extent.IsValid())
            return Response<List<AydDirek>>.ValidationError(PolesResources.GetString("invalidExtent"));

        try
        {
            var aydDirekler = await _unitOfWork.AydDirekRepository.GetAllAsync(pageNumber,
                                                                            pageSize,
                                                                            sortBy,
                                                                            ascending,
                                                                            extent,
                                                                            query,
                                                                            cancellationToken);

            if (aydDirekler == null || aydDirekler.Count == 0)
                return Response<List<AydDirek>>.NotFound(PolesResources.GetString("noPoleFound"));

            return Response<List<AydDirek>>.Success(aydDirekler, PolesResources.GetString("polesRetrieved"));
        }
        catch (NpgsqlException ex)
        {
            return Response<List<AydDirek>>.DatabaseError(PolesResources.GetString("poleRetrievalFailed", ex.Message));
        }
        catch (Exception ex)
        {
            return Response<List<AydDirek>>.UnhandledError(PolesResources.GetString("poleRetrievalFailed", ex.Message));
        }
    }

    /// <inheritdoc />
    public async Task<Response<AydDirek>> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        if (id <= 0)
            return Response<AydDirek>.ValidationError(PolesResources.GetString("invalidId"));

        try
        {
            var aydDirek = await _unitOfWork.AydDirekRepository.GetByIdAsync(id, cancellationToken);

            if (aydDirek == null)
                return Response<AydDirek>.NotFound(PolesResources.GetString("poleNotFound", id));

            return Response<AydDirek>.Success(aydDirek, PolesResources.GetString("poleRetrieved"));
        }
        catch (NpgsqlException ex)
        {
            return Response<AydDirek>.DatabaseError(PolesResources.GetString("poleRetrievalFailed", ex.Message));
        }
        catch (Exception ex)
        {
            return Response<AydDirek>.UnhandledError(PolesResources.GetString("poleRetrievalFailed", ex.Message));
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
            var count = await _unitOfWork.AydDirekRepository.GetCountAsync(extent, query, cancellationToken);
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
            var tipList = await _unitOfWork.AydDirekRepository.GetTipListAsync(cancellationToken);
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

    public async Task<AydDirekResponse> GetAllAsProtobufAsync(int pageNumber, int pageSize, string sortBy, bool ascending, Extent? extent, string? query, CancellationToken cancellationToken)
    {
        if (pageSize < 1 || pageSize > 200000)
            return new AydDirekResponse
            {
                IsSuccess = false,
                Message = PolesResources.GetString("invalidPageSize"),
                StatusCode = (int)HttpStatusCode.BadRequest,
                Data = { }
            };

        if (pageNumber < 1)
            return new AydDirekResponse
            {
                IsSuccess = false,
                Message = PolesResources.GetString("invalidPageNumber"),
                StatusCode = (int)HttpStatusCode.BadRequest,
                Data = { }
            };

        string[] allowedSortColumns =
        [
            "Id",
            "Kodu",
            "Adi",
            "Cinsi",
            "Tipi",
            "DirekNo",
            "BoyOzellik",
            "DirekBoyId"
        ];

        if (!allowedSortColumns.Contains(sortBy))
            return new AydDirekResponse
            {
                IsSuccess = false,
                Message = PolesResources.GetString("invalidSortBy"),
                StatusCode = (int)HttpStatusCode.BadRequest,
                Data = { }
            };

        extent ??= new Extent { MinX = -180, MaxX = 180, MinY = -90, MaxY = 90 };

        if (!extent.IsValid())
            return new AydDirekResponse
            {
                IsSuccess = false,
                Message = PolesResources.GetString("invalidExtent"),
                StatusCode = (int)HttpStatusCode.BadRequest,
                Data = { }
            };

        try
        {
            var buildings = await _unitOfWork.AydDirekRepository.GetAllAsync(pageNumber,
                                                                    pageSize,
                                                                    sortBy,
                                                                    ascending,
                                                                    extent,
                                                                    query,
                                                                    cancellationToken);

            if (buildings == null || buildings.Count == 0)
                return new AydDirekResponse
                {
                    IsSuccess = false,
                    Message = PolesResources.GetString("noPoleFound"),
                    StatusCode = (int)HttpStatusCode.NotFound,
                    Data = { }
                };

            var buildingsResponse = new AydDirekResponse
            {
                IsSuccess = true,
                Message = PolesResources.GetString("polesRetrieved"),
                StatusCode = (int)HttpStatusCode.OK,
            };

            foreach (var building in buildings)
            {
                buildingsResponse.Data.Add(new AydDirekProto
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
            return new AydDirekResponse
            {
                IsSuccess = false,
                Message = PolesResources.GetString("poleRetrievalFailed", ex.Message),
                StatusCode = (int)HttpStatusCode.InternalServerError,
                Data = { }
            };
        }
        catch (Exception ex)
        {
            return new AydDirekResponse
            {
                IsSuccess = false,
                Message = PolesResources.GetString("poleRetrievalFailed", ex.Message),
                StatusCode = (int)HttpStatusCode.InternalServerError,
                Data = { }
            };
        }
    }
}
