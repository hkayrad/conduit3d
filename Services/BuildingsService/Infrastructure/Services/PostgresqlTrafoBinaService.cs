using System;
using BuildingsService.Domain;
using BuildingsService.Resources;
using Conduit3D.Common.Domain;
using Npgsql;

namespace BuildingsService.Infrastructure.Services;

public class PostgresqlTrafoBinaService(IUnitOfWork unitOfWork) : ITrafoBinaService
{
private readonly IUnitOfWork _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));

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

        var allowedSortColumns = new[] { "Id", "Name", "Kodu", "GeoJson" };
        if (!allowedSortColumns.Contains(sortBy))
            return Response<List<TrafoBina>>.ValidationError(BuildingsResources.GetString("invalidSortBy"));

        extent ??= new Extent { MinX = -180, MaxX = 180, MinY = -90, MaxY = 90 };

        if (extent.MinX == 0 && extent.MinY == 0 && extent.MaxX == 0 && extent.MaxY == 0)
        {
            extent = new Extent { MinX = -180, MaxX = 180, MinY = -90, MaxY = 90 };
        }

        if (!extent.IsValid())
            return Response<List<TrafoBina>>.ValidationError(BuildingsResources.GetString("invalidExtent"));

        try
        {
            var trafo = await _unitOfWork.TrafoBuildingsRepository.GetAllAsync(pageNumber,
                                                                    pageSize,
                                                                    sortBy,
                                                                    ascending,
                                                                    extent,
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
            var count = await _unitOfWork.TrafoBuildingsRepository.GetCountAsync(extent, cancellationToken);
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
