using System;
using System.Net;
using Conduit3D.Common.Domain;
using Npgsql;
using PolesService.Domain;
using PolesService.Resources;

namespace PolesService.Infrastructure.Services;

/// <summary>
/// PostgreSQL implementation of <see cref="IArmaturService"/> for managing Ag_Direk entities.
/// </summary>
/// <param name="unitOfWork"></param>
public class PostgresqlArmaturService(IUnitOfWork unitOfWork) : IArmaturService
{
    /// <summary>
    /// Unit of work for managing database operations.
    /// </summary>
    private readonly IUnitOfWork _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));

    /// <inheritdoc />
    public async Task<Response<List<Armatur>>> GetAllAsync(int pageNumber,
                                                        int pageSize,
                                                        string sortBy,
                                                        bool ascending,
                                                        Extent? extent,
                                                        string? query,
                                                        CancellationToken cancellationToken)
    {
        if (pageSize < 1 || pageSize > 200000)
            return Response<List<Armatur>>.ValidationError(PolesResources.GetString("invalidPageSize"));

        if (pageNumber < 1)
            return Response<List<Armatur>>.ValidationError(PolesResources.GetString("invalidPageNumber"));

        if (!AllowedSortingColumns.PoleColumns.Contains(sortBy))
            return Response<List<Armatur>>.ValidationError(PolesResources.GetString("invalidSortBy"));

        extent ??= new Extent { MinX = -180, MaxX = 180, MinY = -90, MaxY = 90 };

        if (!extent.IsValid())
            return Response<List<Armatur>>.ValidationError(PolesResources.GetString("invalidExtent"));

        try
        {
            var armaturler = await _unitOfWork.ArmaturRepository.GetAllAsync(pageNumber,
                                                                            pageSize,
                                                                            sortBy,
                                                                            ascending,
                                                                            extent,
                                                                            query,
                                                                            cancellationToken);

            if (armaturler == null || armaturler.Count == 0)
                return Response<List<Armatur>>.NotFound(PolesResources.GetString("noPoleFound"));

            return Response<List<Armatur>>.Success(armaturler, PolesResources.GetString("polesRetrieved"));
        }
        catch (NpgsqlException ex)
        {
            return Response<List<Armatur>>.DatabaseError(PolesResources.GetString("poleRetrievalFailed", ex.Message));
        }
        catch (Exception ex)
        {
            return Response<List<Armatur>>.UnhandledError(PolesResources.GetString("poleRetrievalFailed", ex.Message));
        }
    }

    /// <inheritdoc />
    public async Task<Response<Armatur>> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        if (id <= 0)
            return Response<Armatur>.ValidationError(PolesResources.GetString("invalidId"));

        try
        {
            var armatur = await _unitOfWork.ArmaturRepository.GetByIdAsync(id, cancellationToken);
            if (armatur == null)
                return Response<Armatur>.NotFound(PolesResources.GetString("poleNotFound", id));

            return Response<Armatur>.Success(armatur, PolesResources.GetString("poleRetrieved"));
        }
        catch (NpgsqlException ex)
        {
            return Response<Armatur>.DatabaseError(PolesResources.GetString("poleRetrievalFailed", ex.Message));
        }
        catch (Exception ex)
        {
            return Response<Armatur>.UnhandledError(PolesResources.GetString("poleRetrievalFailed", ex.Message));
        }
    }

    /// <inheritdoc />
    public async Task<Response<int>> GetCountAsync(Extent? extent, string? query, CancellationToken cancellationToken)
    {
        extent ??= new Extent { MinX = -180, MaxX = 180, MinY = -90, MaxY = 90 };

        if (!extent.IsValid())
            return Response<int>.ValidationError(PolesResources.GetString("invalidExtent"));

        try
        {
            var count = await _unitOfWork.ArmaturRepository.GetCountAsync(extent, query, cancellationToken);
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

    public async Task<ArmaturResponse> GetAllAsProtobufAsync(int pageNumber, int pageSize, string sortBy, bool ascending, Extent? extent, string? query, CancellationToken cancellationToken)
    {
        if (pageSize < 1 || pageSize > 200000)
            return new ArmaturResponse
            {
                IsSuccess = false,
                Message = PolesResources.GetString("invalidPageSize"),
                StatusCode = (int)HttpStatusCode.BadRequest,
                Data = { }
            };

        if (pageNumber < 1)
            return new ArmaturResponse
            {
                IsSuccess = false,
                Message = PolesResources.GetString("invalidPageNumber"),
                StatusCode = (int)HttpStatusCode.BadRequest,
                Data = { }
            };

        if (!AllowedSortingColumns.PoleColumns.Contains(sortBy))
            return new ArmaturResponse
            {
                IsSuccess = false,
                Message = PolesResources.GetString("invalidSortBy"),
                StatusCode = (int)HttpStatusCode.BadRequest,
                Data = { }
            };

        extent ??= new Extent { MinX = -180, MaxX = 180, MinY = -90, MaxY = 90 };

        if (!extent.IsValid())
            return new ArmaturResponse
            {
                IsSuccess = false,
                Message = PolesResources.GetString("invalidExtent"),
                StatusCode = (int)HttpStatusCode.BadRequest,
                Data = { }
            };

        try
        {
            var armaturler = await _unitOfWork.ArmaturRepository.GetAllAsync(pageNumber,
                                                                    pageSize,
                                                                    sortBy,
                                                                    ascending,
                                                                    extent,
                                                                    query,
                                                                    cancellationToken);

            if (armaturler == null || armaturler.Count == 0)
                return new ArmaturResponse
                {
                    IsSuccess = false,
                    Message = PolesResources.GetString("noPoleFound"),
                    StatusCode = (int)HttpStatusCode.NotFound,
                    Data = { }
                };

            var polesResponse = new ArmaturResponse
            {
                IsSuccess = true,
                Message = PolesResources.GetString("polesRetrieved"),
                StatusCode = (int)HttpStatusCode.OK,
            };

            foreach (var armatur in armaturler)
            {
                polesResponse.Data.Add(new ArmaturProto
                {
                    Id = armatur.Id,
                    BagliTabloId = armatur.BagliTabloId,
                    BagliTabloKayitId = armatur.BagliTabloKayitId,
                    Wkb = Convert.ToBase64String(armatur.Wkb)
                });
            }

            return polesResponse;
        }
        catch (NpgsqlException ex)
        {
            return new ArmaturResponse
            {
                IsSuccess = false,
                Message = PolesResources.GetString("poleRetrievalFailed", ex.Message),
                StatusCode = (int)HttpStatusCode.InternalServerError,
                Data = { }
            };
        }
        catch (Exception ex)
        {
            return new ArmaturResponse
            {
                IsSuccess = false,
                Message = PolesResources.GetString("poleRetrievalFailed", ex.Message),
                StatusCode = (int)HttpStatusCode.InternalServerError,
                Data = { }
            };
        }
    }
}
