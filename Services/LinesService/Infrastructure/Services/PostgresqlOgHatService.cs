using System;
using Conduit3D.Common.Domain;
using LinesService.Domain;
using LinesService.Resources;
using Npgsql;

namespace LinesService.Infrastructure.Services;

public class PostgresqlOgHatService(IUnitOfWork unitOfWork) : IOgHatService
{
    private readonly IUnitOfWork _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));

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

        var allowedSortColumns = new[] { "Id", "Cinsi", "Tipi", "Kesit", "GeoJson" };
        if (!allowedSortColumns.Contains(sortBy))
            return Response<List<OgHat>>.ValidationError(LinesResources.GetString("invalidSortBy"));

        extent ??= new Extent { MinX = -180, MaxX = 180, MinY = -90, MaxY = 90 };

        if (extent.MinX == 0 && extent.MinY == 0 && extent.MaxX == 0 && extent.MaxY == 0)
        {
            extent = new Extent { MinX = -180, MaxX = 180, MinY = -90, MaxY = 90 };
        }

        if (!extent.IsValid())
            return Response<List<OgHat>>.ValidationError(LinesResources.GetString("invalidExtent"));

        try
        {
            var ogHatlar = await _unitOfWork.OgHatRepository.GetAllAsync(pageNumber,
                                                                            pageSize,
                                                                            sortBy,
                                                                            ascending,
                                                                            extent,
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
            var count = await _unitOfWork.OgHatRepository.GetCountAsync(extent, cancellationToken);
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
