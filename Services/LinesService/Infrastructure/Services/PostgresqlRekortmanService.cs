using System;
using Conduit3D.Common.Domain;
using LinesService.Domain;
using LinesService.Resources;
using Npgsql;

namespace LinesService.Infrastructure.Services;

public class PostgresqlRekortmanService(IUnitOfWork unitOfWork) : IRekortmanService
{
    private readonly IUnitOfWork _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));

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

        var allowedSortColumns = new[] { "Id", "Tipi", "Kesit", "GeoJson" };
        if (!allowedSortColumns.Contains(sortBy))
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
            var count = await _unitOfWork.RekortmanRepository.GetCountAsync(extent, cancellationToken);
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
