using System;
using Conduit3D.Common.Domain;
using LinesService.Domain;
using LinesService.Resources;
using Npgsql;

namespace LinesService.Infrastructure.Services;

public class PostgresqlAgHatService(IUnitOfWork unitOfWork) : IAgHatService
{
    private readonly IUnitOfWork _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));

    public async Task<Response<List<AgHat>>> GetAllAsync(int pageNumber,
                                                        int pageSize,
                                                        string sortBy,
                                                        bool ascending,
                                                        Extent? extent,
                                                        string? query,
                                                        CancellationToken cancellationToken)
    {
        if (pageSize < 1 || pageSize > 200000)
            return Response<List<AgHat>>.ValidationError(LinesResources.GetString("invalidPageSize"));

        if (pageNumber < 1)
            return Response<List<AgHat>>.ValidationError(LinesResources.GetString("invalidPageNumber"));

        var allowedSortColumns = new[] { "Id", "Cinsi", "Tipi", "Kesit", "GeoJson" };
        if (!allowedSortColumns.Contains(sortBy))
            return Response<List<AgHat>>.ValidationError(LinesResources.GetString("invalidSortBy"));

        extent ??= new Extent { MinX = -180, MaxX = 180, MinY = -90, MaxY = 90 };

        if (extent.MinX == 0 && extent.MinY == 0 && extent.MaxX == 0 && extent.MaxY == 0)
        {
            extent = new Extent { MinX = -180, MaxX = 180, MinY = -90, MaxY = 90 };
        }

        if (!extent.IsValid())
            return Response<List<AgHat>>.ValidationError(LinesResources.GetString("invalidExtent"));

        try
        {
            var agHatlar = await _unitOfWork.AgHatRepository.GetAllAsync(pageNumber,
                                                                            pageSize,
                                                                            sortBy,
                                                                            ascending,
                                                                            extent,
                                                                            query,
                                                                            cancellationToken);

            if (agHatlar == null || agHatlar.Count == 0)
                return Response<List<AgHat>>.NotFound(LinesResources.GetString("noLineFound"));

            return Response<List<AgHat>>.Success(agHatlar, LinesResources.GetString("linesRetrieved"));
        }
        catch (NpgsqlException ex)
        {
            return Response<List<AgHat>>.DatabaseError(LinesResources.GetString("lineRetrievalFailed", ex.Message));
        }
        catch (Exception ex)
        {
            return Response<List<AgHat>>.UnhandledError(LinesResources.GetString("lineRetrievalFailed", ex.Message));
        }
    }

    public async Task<Response<AgHat>> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        if (id <= 0)
            return Response<AgHat>.ValidationError(LinesResources.GetString("invalidId"));

        try
        {
            var agHat = await _unitOfWork.AgHatRepository.GetByIdAsync(id, cancellationToken);

            if (agHat == null)
                return Response<AgHat>.NotFound(LinesResources.GetString("lineNotFound", id));

            return Response<AgHat>.Success(agHat, LinesResources.GetString("lineRetrieved"));
        }
        catch (NpgsqlException ex)
        {
            return Response<AgHat>.DatabaseError(LinesResources.GetString("lineRetrievalFailed", ex.Message));
        }
        catch (Exception ex)
        {
            return Response<AgHat>.UnhandledError(LinesResources.GetString("lineRetrievalFailed", ex.Message));
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
            return Response<int>.ValidationError(LinesResources.GetString("invalidExtent"));

        try
        {
            var count = await _unitOfWork.AgHatRepository.GetCountAsync(extent, cancellationToken);
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
}
