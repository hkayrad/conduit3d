using System;
using System.Net;
using BuildingsService.Domain;
using BuildingsService.Resources;
using Conduit3D.Common.Domain;
using Npgsql;

namespace BuildingsService.Infrastructure.Services;

/// <summary>
/// PostgreSQL implementation of <see cref="IBuildingsService"/> for managing building entities.
/// </summary>
/// <param name="unitOfWork">Unit of Work for buildings service.</param>
public class PostgresqlBuildingsService(IUnitOfWork unitOfWork) : IBuildingsService
{
    /// <summary>
    /// Unit of Work for buildings service.
    /// </summary>
    private readonly IUnitOfWork _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));

    /// <inheritdoc />
    public async Task<Response<List<Building>>> GetAllAsync(int pageNumber,
                                                            int pageSize,
                                                            string sortBy,
                                                            bool ascending,
                                                            Extent? extent,
                                                            string? query,
                                                            CancellationToken cancellationToken)
    {
        if (pageSize < 1 || pageSize > 200000)
            return Response<List<Building>>.ValidationError(BuildingsResources.GetString("invalidPageSize"));

        if (pageNumber < 1)
            return Response<List<Building>>.ValidationError(BuildingsResources.GetString("invalidPageNumber"));

        if (!AllowedSortingColumns.AdrBinaColumns.Contains(sortBy))
            return Response<List<Building>>.ValidationError(BuildingsResources.GetString("invalidSortBy"));

        extent ??= new Extent { MinX = -180, MaxX = 180, MinY = -90, MaxY = 90 };

        if (extent.MinX == 0 && extent.MinY == 0 && extent.MaxX == 0 && extent.MaxY == 0)
        {
            extent = new Extent { MinX = -180, MaxX = 180, MinY = -90, MaxY = 90 };
        }

        if (!extent.IsValid())
            return Response<List<Building>>.ValidationError(BuildingsResources.GetString("invalidExtent"));

        try
        {
            var buildings = await _unitOfWork.BuildingsRepository.GetAllAsync(pageNumber,
                                                                            pageSize,
                                                                            sortBy,
                                                                            ascending,
                                                                            extent,
                                                                            query,
                                                                            cancellationToken);

            if (buildings == null || buildings.Count == 0)
                return Response<List<Building>>.NotFound(BuildingsResources.GetString("noBuildingFound"));

            return Response<List<Building>>.Success(buildings, BuildingsResources.GetString("buildingsRetrieved"));
        }
        catch (NpgsqlException ex)
        {
            return Response<List<Building>>.DatabaseError(BuildingsResources.GetString("buildingRetrievalFailed", ex.Message));
        }
        catch (Exception ex)
        {
            return Response<List<Building>>.UnhandledError(BuildingsResources.GetString("buildingRetrievalFailed", ex.Message));
        }
    }

    /// <inheritdoc />
    public async Task<Response<Building>> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        if (id <= 0)
            return Response<Building>.ValidationError(BuildingsResources.GetString("invalidId"));

        try
        {
            var building = await _unitOfWork.BuildingsRepository.GetByIdAsync(id, cancellationToken);

            if (building == null)
                return Response<Building>.NotFound(BuildingsResources.GetString("buildingNotFound", id));

            return Response<Building>.Success(building, BuildingsResources.GetString("buildingRetrieved"));
        }
        catch (NpgsqlException ex)
        {
            return Response<Building>.DatabaseError(BuildingsResources.GetString("buildingRetrievalFailed", ex.Message));
        }
        catch (Exception ex)
        {
            return Response<Building>.UnhandledError(BuildingsResources.GetString("buildingRetrievalFailed", ex.Message));
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
            return Response<int>.ValidationError(BuildingsResources.GetString("invalidExtent"));

        try
        {
            var count = await _unitOfWork.BuildingsRepository.GetCountAsync(extent, query, cancellationToken);
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

    public async Task<BuildingsResponse> GetAllAsProtobufAsync(
        int pageNumber,
        int pageSize,
        string sortBy,
        bool ascending,
        Extent? extent,
        string? query,
        CancellationToken cancellationToken
    )
    {
        if (pageSize < 1 || pageSize > 200000)
            return new BuildingsResponse
            {
                IsSuccess = false,
                Message = BuildingsResources.GetString("invalidPageSize"),
                StatusCode = (int)HttpStatusCode.BadRequest,
                Data = { }
            };

        if (pageNumber < 1)
            return new BuildingsResponse
            {
                IsSuccess = false,
                Message = BuildingsResources.GetString("invalidPageNumber"),
                StatusCode = (int)HttpStatusCode.BadRequest,
                Data = { }
            };

        if (!AllowedSortingColumns.AdrBinaColumns.Contains(sortBy))
            return new BuildingsResponse
            {
                IsSuccess = false,
                Message = BuildingsResources.GetString("invalidSortBy"),
                StatusCode = (int)HttpStatusCode.BadRequest,
                Data = { }
            };

        extent ??= new Extent { MinX = -180, MaxX = 180, MinY = -90, MaxY = 90 };

        if (extent.MinX == 0 && extent.MinY == 0 && extent.MaxX == 0 && extent.MaxY == 0)
        {
            extent = new Extent { MinX = -180, MaxX = 180, MinY = -90, MaxY = 90 };
        }

        if (!extent.IsValid())
            return new BuildingsResponse
            {
                IsSuccess = false,
                Message = BuildingsResources.GetString("invalidExtent"),
                StatusCode = (int)HttpStatusCode.BadRequest,
                Data = { }
            };

        try
        {
            var buildings = await _unitOfWork.BuildingsRepository.GetAllAsync(pageNumber,
                                                                            pageSize,
                                                                            sortBy,
                                                                            ascending,
                                                                            extent,
                                                                            query,
                                                                            cancellationToken);

            if (buildings == null || buildings.Count == 0)
                return new BuildingsResponse
                {
                    IsSuccess = false,
                    Message = BuildingsResources.GetString("noBuildingFound"),
                    StatusCode = (int)HttpStatusCode.NotFound,
                    Data = { }
                };

            var buildingsResponse = new BuildingsResponse
            {
                IsSuccess = true,
                Message = BuildingsResources.GetString("buildingsRetrieved"),
                StatusCode = (int)HttpStatusCode.OK,
            };

            foreach (var building in buildings)
            {
                buildingsResponse.Data.Add(new BuildingsProto
                {
                    Id = building.Id,
                    Kodu = building.Kodu ?? string.Empty,
                    SiteAdi = building.SiteAdi ?? string.Empty,
                    Adi = building.Adi ?? string.Empty,
                    BinaKatSayisi = building.BinaKatSayisi,
                    DaireSayisi = building.DaireSayisi,
                    IsyeriSayisi = building.IsyeriSayisi,
                    Yukseklik = building.Yukseklik,
                    Wkb = Convert.ToBase64String(building.Wkb),
                });
            }

            return buildingsResponse;
        }
        catch (NpgsqlException ex)
        {
            return new BuildingsResponse
            {
                IsSuccess = false,
                Message = BuildingsResources.GetString("buildingRetrievalFailed", ex.Message),
                StatusCode = (int)HttpStatusCode.InternalServerError,
                Data = { }
            };
        }
        catch (Exception ex)
        {
            return new BuildingsResponse
            {
                IsSuccess = false,
                Message = BuildingsResources.GetString("buildingRetrievalFailed", ex.Message),
                StatusCode = (int)HttpStatusCode.InternalServerError,
                Data = { }
            };
        }
    }
}
