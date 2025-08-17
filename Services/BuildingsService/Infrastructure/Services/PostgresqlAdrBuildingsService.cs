using System;
using BuildingsService.Domain;
using BuildingsService.Resources;
using Conduit3D.Common.Domain;
using Npgsql;

namespace BuildingsService.Infrastructure.Services;

public class PostgresqlAdrBuildingsService(IUnitOfWork unitOfWork) : IAdrBuildingsService
{
    private readonly IUnitOfWork _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));

    public async Task<Response<List<AdrBuilding>>> GetAllAsync(int pageNumber,
                                            int pageSize,
                                            string sortBy,
                                            bool ascending,
                                            Extent? extent,
                                            CancellationToken cancellationToken)
    {
        if (pageSize < 1 || pageSize > 100000)
            return Response<List<AdrBuilding>>.ValidationError(BuildingsResources.GetString("invalidPageSize"));

        if (pageNumber < 1)
            return Response<List<AdrBuilding>>.ValidationError(BuildingsResources.GetString("invalidPageNumber"));

        var allowedSortColumns = new[] { "Id", "Name", "FloorCount", "Type", "GeoJson" };
        if (!allowedSortColumns.Contains(sortBy))
            return Response<List<AdrBuilding>>.ValidationError(BuildingsResources.GetString("invalidSortBy"));

        extent ??= new Extent { MinX = -180, MaxX = 180, MinY = -90, MaxY = 90 };

        if (extent.MinX == 0 && extent.MinY == 0 && extent.MaxX == 0 && extent.MaxY == 0)
        {
            extent = new Extent { MinX = -180, MaxX = 180, MinY = -90, MaxY = 90 };
        }

        if (!extent.IsValid())
            return Response<List<AdrBuilding>>.ValidationError(BuildingsResources.GetString("invalidExtent"));

        try
        {
            var buildings = await _unitOfWork.AdrBuildingsRepository.GetAllAsync(pageNumber,
                                                                    pageSize,
                                                                    sortBy,
                                                                    ascending,
                                                                    extent,
                                                                    cancellationToken);

            if (buildings == null || buildings.Count == 0)
                return Response<List<AdrBuilding>>.NotFound(BuildingsResources.GetString("noBuildingFound"));

            return Response<List<AdrBuilding>>.Success(buildings, BuildingsResources.GetString("buildingsRetrieved"));
        }
        catch (NpgsqlException ex)
        {
            return Response<List<AdrBuilding>>.DatabaseError(BuildingsResources.GetString("buildingRetrievalFailed", ex.Message));
        }
        catch (Exception ex)
        {
            return Response<List<AdrBuilding>>.UnhandledError(BuildingsResources.GetString("buildingRetrievalFailed", ex.Message));
        }
    }

    public async Task<Response<AdrBuilding>> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        if (id <= 0)
            return Response<AdrBuilding>.ValidationError(BuildingsResources.GetString("invalidId"));

        try
        {
            var building = await _unitOfWork.AdrBuildingsRepository.GetByIdAsync(id, cancellationToken);

            if (building == null)
                return Response<AdrBuilding>.NotFound(BuildingsResources.GetString("noBuildingFound", id));

            return Response<AdrBuilding>.Success(building, BuildingsResources.GetString("buildingRetrieved"));
        }
        catch (NpgsqlException ex)
        {
            return Response<AdrBuilding>.DatabaseError(BuildingsResources.GetString("buildingRetrievalFailed", ex.Message));
        }
        catch (Exception ex)
        {
            return Response<AdrBuilding>.UnhandledError(BuildingsResources.GetString("buildingRetrievalFailed", ex.Message));
        }
    }

    public async Task<Response<int>> GetCountAsync(Extent? extent, CancellationToken cancellationToken)
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
            var count = await _unitOfWork.AdrBuildingsRepository.GetCountAsync(extent, cancellationToken);
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
