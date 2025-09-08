using System;
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

        var allowedSortColumns = new[] { "Id", "Name", "FloorCount", "Type", "GeoJson" };
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
}
