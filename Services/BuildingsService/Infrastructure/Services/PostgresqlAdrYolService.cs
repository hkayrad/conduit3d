using System;
using System.Net;
using BuildingsService.Domain;
using BuildingsService.Resources;
using Conduit3D.Common.Domain;
using Npgsql;

namespace BuildingsService.Infrastructure.Services;

public class PostgresqlAdrYolService(IUnitOfWork unitOfWork) : IAdrYolService
{
    private readonly IUnitOfWork _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));

    public async Task<Response<List<AdrYol>>> GetAllAsync(int pageNumber,
                                                    int pageSize,
                                                    string sortBy,
                                                    bool ascending,
                                                    Extent? extent,
                                                    string? query,
                                                    CancellationToken cancellationToken)
    {
        if (pageSize < 1 || pageSize > 200000)
            return Response<List<AdrYol>>.ValidationError(BuildingsResources.GetString("invalidPageSize"));

        if (pageNumber < 1)
            return Response<List<AdrYol>>.ValidationError(BuildingsResources.GetString("invalidPageNumber"));

        if (!AllowedSortingColumns.AdrYolColumns.Contains(sortBy))
            return Response<List<AdrYol>>.ValidationError(BuildingsResources.GetString("invalidSortBy"));

        extent ??= new Extent { MinX = -180, MaxX = 180, MinY = -90, MaxY = 90 };

        if (!extent.IsValid())
            return Response<List<AdrYol>>.ValidationError(BuildingsResources.GetString("invalidExtent"));

        try
        {
            var roads = await _unitOfWork.AdrYolRepository.GetAllAsync(pageNumber,
                                                                    pageSize,
                                                                    sortBy,
                                                                    ascending,
                                                                    extent,
                                                                    query,
                                                                    cancellationToken);

            if (roads == null || roads.Count == 0)
                return Response<List<AdrYol>>.NotFound(BuildingsResources.GetString("noRoadFound"));

            return Response<List<AdrYol>>.Success(roads, BuildingsResources.GetString("roadsRetrieved"));
        }
        catch (NpgsqlException ex)
        {
            return Response<List<AdrYol>>.DatabaseError(BuildingsResources.GetString("roadRetrievalFailed", ex.Message));
        }
        catch (Exception ex)
        {
            return Response<List<AdrYol>>.UnhandledError(BuildingsResources.GetString("roadRetrievalFailed", ex.Message));
        }
    }

    public async Task<Response<AdrYol>> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        if (id <= 0)
            return Response<AdrYol>.ValidationError(BuildingsResources.GetString("invalidRoadId"));

        try
        {
            var road = await _unitOfWork.AdrYolRepository.GetByIdAsync(id, cancellationToken);

            if (road == null)
                return Response<AdrYol>.NotFound(BuildingsResources.GetString("noRoadFound", id));

            return Response<AdrYol>.Success(road, BuildingsResources.GetString("roadRetrieved"));
        }
        catch (NpgsqlException ex)
        {
            return Response<AdrYol>.DatabaseError(BuildingsResources.GetString("roadRetrievalFailed", ex.Message));
        }
        catch (Exception ex)
        {
            return Response<AdrYol>.UnhandledError(BuildingsResources.GetString("roadsRetrievalFailed", ex.Message));
        }
    }

    public async Task<Response<List<string>>> GetTipListAsync(CancellationToken cancellationToken)
    {
        try
        {
            var tipList = await _unitOfWork.AdrYolRepository.GetTipListAsync(cancellationToken);
            if (tipList == null || tipList.Count == 0)
                return Response<List<string>>.NotFound(BuildingsResources.GetString("noTipFound"));

            return Response<List<string>>.Success(tipList, BuildingsResources.GetString("tipListRetrieved"));
        }
        catch (NpgsqlException ex)
        {
            return Response<List<string>>.DatabaseError(BuildingsResources.GetString("tipListRetrievalFailed", ex.Message));
        }
        catch (Exception ex)
        {
            return Response<List<string>>.UnhandledError(BuildingsResources.GetString("tipListRetrievalFailed", ex.Message));
        }
    }


    public async Task<Response<int>> GetCountAsync(Extent? extent, string? query, CancellationToken cancellationToken)
    {
        extent ??= new Extent { MinX = -180, MaxX = 180, MinY = -90, MaxY = 90 };

        if (!extent.IsValid())
            return Response<int>.ValidationError(BuildingsResources.GetString("invalidExtent"));

        try
        {
            var count = await _unitOfWork.AdrYolRepository.GetCountAsync(extent, query, cancellationToken);
            return Response<int>.Success(count, BuildingsResources.GetString("roadCountRetrieved"));
        }
        catch (NpgsqlException ex)
        {
            return Response<int>.DatabaseError(BuildingsResources.GetString("roadCountRetrievalFailed", ex.Message));
        }
        catch (Exception ex)
        {
            return Response<int>.UnhandledError(BuildingsResources.GetString("roadCountRetrievalFailed", ex.Message));
        }
    }

    public async Task<AdrYolResponse> GetAllAsProtobufAsync(int pageNumber,
                                                    int pageSize,
                                                    string sortBy,
                                                    bool ascending,
                                                    Extent? extent,
                                                    string? query,
                                                    CancellationToken cancellationToken)
    {
        if (pageSize < 1 || pageSize > 200000)
            return new AdrYolResponse
            {
                IsSuccess = false,
                Message = BuildingsResources.GetString("invalidPageSize"),
                StatusCode = (int)HttpStatusCode.BadRequest,
                Data = { }
            };

        if (pageNumber < 1)
            return new AdrYolResponse
            {
                IsSuccess = false,
                Message = BuildingsResources.GetString("invalidPageNumber"),
                StatusCode = (int)HttpStatusCode.BadRequest,
                Data = { }
            };

        if (!AllowedSortingColumns.AdrYolColumns.Contains(sortBy))
            return new AdrYolResponse
            {
                IsSuccess = false,
                Message = BuildingsResources.GetString("invalidSortBy"),
                StatusCode = (int)HttpStatusCode.BadRequest,
                Data = { }
            };

        extent ??= new Extent { MinX = -180, MaxX = 180, MinY = -90, MaxY = 90 };

        if (!extent.IsValid())
            return new AdrYolResponse
            {
                IsSuccess = false,
                Message = BuildingsResources.GetString("invalidExtent"),
                StatusCode = (int)HttpStatusCode.BadRequest,
                Data = { }
            };

        try
        {
            var roads = await _unitOfWork.AdrYolRepository.GetAllAsync(pageNumber,
                                                                    pageSize,
                                                                    sortBy,
                                                                    ascending,
                                                                    extent,
                                                                    query,
                                                                    cancellationToken);

            if (roads == null || roads.Count == 0)
                return new AdrYolResponse
                {
                    IsSuccess = false,
                    Message = BuildingsResources.GetString("noRoadFound"),
                    StatusCode = (int)HttpStatusCode.NotFound,
                    Data = { }
                };

            var roadsResponse = new AdrYolResponse
            {
                IsSuccess = true,
                Message = BuildingsResources.GetString("roadsRetrieved"),
                StatusCode = (int)HttpStatusCode.OK,
            };

            foreach (var road in roads)
            {
                roadsResponse.Data.Add(new AdrYolProto
                {
                    Id = road.Id,
                    Genislik = road.Genislik,
                    SeritSayisi = road.SeritSayisi,
                    Yapisi = road.Yapisi,
                    Tipi = road.Tipi,
                    Kodu = road.Kodu,
                    Adi = road.Adi,
                    Wkb = Convert.ToBase64String(road.Wkb)
                });
            }

            return roadsResponse;
        }
        catch (NpgsqlException ex)
        {
            return new AdrYolResponse
            {
                IsSuccess = false,
                Message = BuildingsResources.GetString("roadRetrievalFailed", ex.Message),
                StatusCode = (int)HttpStatusCode.InternalServerError,
                Data = { }
            };
        }
        catch (Exception ex)
        {
            return new AdrYolResponse
            {
                IsSuccess = false,
                Message = BuildingsResources.GetString("roadRetrievalFailed", ex.Message),
                StatusCode = (int)HttpStatusCode.InternalServerError,
                Data = { }
            };
        }
    }
}
