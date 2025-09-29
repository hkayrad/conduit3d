using System;
using System.Diagnostics;
using System.Net;
using BuildingsService.Domain;
using BuildingsService.Resources;
using Conduit3D.Common.Domain;
using Npgsql;

namespace BuildingsService.Infrastructure.Services;

/// <summary>
/// PostgreSQL implementation of <see cref="IAdrBinaService"/> for managing ADR_BINA entities.
/// </summary>
/// <param name="unitOfWork">Unit of Work for buildings service.</param>
public class PostgresqlAdrBinaService(IUnitOfWork unitOfWork) : IAdrBinaService
{
    /// <summary>
    /// Unit of Work for buildings service.
    /// </summary>
    private readonly IUnitOfWork _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));

    /// <inheritdoc />
    public async Task<Response<List<AdrBina>>> GetAllAsync(int pageNumber,
                                            int pageSize,
                                            string sortBy,
                                            bool ascending,
                                            Extent? extent,
                                            string? query,
                                            CancellationToken cancellationToken)
    {
        if (pageSize < 1 || pageSize > 200000)
            return Response<List<AdrBina>>.ValidationError(BuildingsResources.GetString("invalidPageSize"));

        if (pageNumber < 1)
            return Response<List<AdrBina>>.ValidationError(BuildingsResources.GetString("invalidPageNumber"));

        string[] allowedSortColumns =
        [
            "Id",
            "Kodu",
            "SiteAdi",
            "Adi",
            "BinaKatSayisi",
            "DaireSayisi",
            "IsyeriSayisi",
            "Yukseklik"
        ];

        if (!allowedSortColumns.Contains(sortBy))
            return Response<List<AdrBina>>.ValidationError(BuildingsResources.GetString("invalidSortBy"));

        extent ??= new Extent { MinX = -180, MaxX = 180, MinY = -90, MaxY = 90 };

        if (extent.MinX == 0 && extent.MinY == 0 && extent.MaxX == 0 && extent.MaxY == 0)
        {
            extent = new Extent { MinX = -180, MaxX = 180, MinY = -90, MaxY = 90 };
        }

        if (!extent.IsValid())
            return Response<List<AdrBina>>.ValidationError(BuildingsResources.GetString("invalidExtent"));

        try
        {
            var buildings = await _unitOfWork.AdrBuildingsRepository.GetAllAsync(pageNumber,
                                                                    pageSize,
                                                                    sortBy,
                                                                    ascending,
                                                                    extent,
                                                                    query,
                                                                    cancellationToken);

            if (buildings == null || buildings.Count == 0)
                return Response<List<AdrBina>>.NotFound(BuildingsResources.GetString("noBuildingFound"));

            return Response<List<AdrBina>>.Success(buildings, BuildingsResources.GetString("buildingsRetrieved"));
        }
        catch (NpgsqlException ex)
        {
            return Response<List<AdrBina>>.DatabaseError(BuildingsResources.GetString("buildingRetrievalFailed", ex.Message));
        }
        catch (Exception ex)
        {
            return Response<List<AdrBina>>.UnhandledError(BuildingsResources.GetString("buildingRetrievalFailed", ex.Message));
        }
    }

    /// <inheritdoc />
    public async Task<Response<AdrBina>> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        if (id <= 0)
            return Response<AdrBina>.ValidationError(BuildingsResources.GetString("invalidId"));

        try
        {
            var building = await _unitOfWork.AdrBuildingsRepository.GetByIdAsync(id, cancellationToken);

            if (building == null)
                return Response<AdrBina>.NotFound(BuildingsResources.GetString("noBuildingFound", id));

            return Response<AdrBina>.Success(building, BuildingsResources.GetString("buildingRetrieved"));
        }
        catch (NpgsqlException ex)
        {
            return Response<AdrBina>.DatabaseError(BuildingsResources.GetString("buildingRetrievalFailed", ex.Message));
        }
        catch (Exception ex)
        {
            return Response<AdrBina>.UnhandledError(BuildingsResources.GetString("buildingRetrievalFailed", ex.Message));
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
            var count = await _unitOfWork.AdrBuildingsRepository.GetCountAsync(extent, query, cancellationToken);
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

    public async Task<AdrBinaResponse> GetAllAsProtobufAsync(int pageNumber, int pageSize, string sortBy, bool ascending, Extent? extent, string? query, CancellationToken cancellationToken)
    {
        if (pageSize < 1 || pageSize > 200000)
            return new AdrBinaResponse
            {
                IsSuccess = false,
                Message = BuildingsResources.GetString("invalidPageSize"),
                StatusCode = (int)HttpStatusCode.BadRequest,
                Data = { }
            };

        if (pageNumber < 1)
            return new AdrBinaResponse
            {
                IsSuccess = false,
                Message = BuildingsResources.GetString("invalidPageNumber"),
                StatusCode = (int)HttpStatusCode.BadRequest,
                Data = { }
            };

        string[] allowedSortColumns =
        [
            "Id",
            "Kodu",
            "SiteAdi",
            "Adi",
            "BinaKatSayisi",
            "DaireSayisi",
            "IsyeriSayisi",
            "Yukseklik"
        ];

        if (!allowedSortColumns.Contains(sortBy))
            return new AdrBinaResponse
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
            return new AdrBinaResponse
            {
                IsSuccess = false,
                Message = BuildingsResources.GetString("invalidExtent"),
                StatusCode = (int)HttpStatusCode.BadRequest,
                Data = { }
            };

        try
        {
            var buildings = await _unitOfWork.AdrBuildingsRepository.GetAllAsync(pageNumber,
                                                                    pageSize,
                                                                    sortBy,
                                                                    ascending,
                                                                    extent,
                                                                    query,
                                                                    cancellationToken);

            if (buildings == null || buildings.Count == 0)
                return new AdrBinaResponse
                {
                    IsSuccess = false,
                    Message = BuildingsResources.GetString("noBuildingFound"),
                    StatusCode = (int)HttpStatusCode.NotFound,
                    Data = { }
                };

            var buildingsResponse = new AdrBinaResponse
            {
                IsSuccess = true,
                Message = BuildingsResources.GetString("buildingsRetrieved"),
                StatusCode = (int)HttpStatusCode.OK,
            };

            foreach (var building in buildings)
            {   
                buildingsResponse.Data.Add(new AdrBinaProto
                {
                    Id = building.Id,
                    Kodu = building.Kodu ?? string.Empty,
                    SiteAdi = building.SiteAdi ?? string.Empty,
                    Adi = building.Adi ?? string.Empty,
                    BinaKatSayisi = building.BinaKatSayisi,
                    DaireSayisi = building.DaireSayisi,
                    IsyeriSayisi = building.IsyeriSayisi,
                    Yukseklik = building.Yukseklik,
                    Wkb = Convert.ToBase64String(building.Wkb)
                });
            }

            return buildingsResponse;
        }
        catch (NpgsqlException ex)
        {
            return new AdrBinaResponse
            {
                IsSuccess = false,
                Message = BuildingsResources.GetString("buildingRetrievalFailed", ex.Message),
                StatusCode = (int)HttpStatusCode.InternalServerError,
                Data = { }
            };
        }
        catch (Exception ex)
        {
            return new AdrBinaResponse
            {
                IsSuccess = false,
                Message = BuildingsResources.GetString("buildingRetrievalFailed", ex.Message),
                StatusCode = (int)HttpStatusCode.InternalServerError,
                Data = { }
            };
        }
    }
}
