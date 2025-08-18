using System;
using Conduit3D.Common.Domain;
using Npgsql;
using PolesService.Domain;
using PolesService.Resources;

namespace PolesService.Infrastructure.Services;

public class PostgresqlAydDirekService(IUnitOfWork unitOfWork) : IAydDirekService
{
    private readonly IUnitOfWork _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));

    public async Task<Response<List<AydDirek>>> GetAllAsync(int pageNumber, int pageSize, string sortBy, bool ascending, Extent? extent, CancellationToken cancellationToken)
    {
        if (pageSize < 1 || pageSize > 200000)
            return Response<List<AydDirek>>.ValidationError(PolesResources.GetString("invalidPageSize"));

        if (pageNumber < 1)
            return Response<List<AydDirek>>.ValidationError(PolesResources.GetString("invalidPageNumber"));

        var allowedSortColumns = new[] { "Id", "Cinsi", "Tipi", "BoyOzellik", "DirekNo", "GeoJson" };
        if (!allowedSortColumns.Contains(sortBy))
            return Response<List<AydDirek>>.ValidationError(PolesResources.GetString("invalidSortBy"));

        extent ??= new Extent { MinX = -180, MaxX = 180, MinY = -90, MaxY = 90 };

        if (extent.MinX == 0 && extent.MinY == 0 && extent.MaxX == 0 && extent.MaxY == 0)
        {
            extent = new Extent { MinX = -180, MaxX = 180, MinY = -90, MaxY = 90 };
        }

        if (!extent.IsValid())
            return Response<List<AydDirek>>.ValidationError(PolesResources.GetString("invalidExtent"));

        try
        {
            var aydDirekler = await _unitOfWork.AydDirekRepository.GetAllAsync(pageNumber,
                                                                            pageSize,
                                                                            sortBy,
                                                                            ascending,
                                                                            extent,
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

    public async Task<Response<int>> GetCountAsync(Extent? extent, CancellationToken cancellationToken)
    {
        extent ??= new Extent { MinX = -180, MaxX = 180, MinY = -90, MaxY = 90 };

        if (extent.MinX == 0 && extent.MinY == 0 && extent.MaxX == 0 && extent.MaxY == 0)
        {
            extent = new Extent { MinX = -180, MaxX = 180, MinY = -90, MaxY = 90 };
        }

        if (!extent.IsValid())
            return Response<int>.ValidationError(PolesResources.GetString("invalidExtent"));

        try
        {
            var count = await _unitOfWork.AydDirekRepository.GetCountAsync(extent, cancellationToken);
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
}
