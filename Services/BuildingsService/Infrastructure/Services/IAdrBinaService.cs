using System;
using BuildingsService.Domain;
using Conduit3D.Common.Domain;

namespace BuildingsService.Infrastructure.Services;

public interface IAdrBinaService
{
    Task<Response<List<AdrBina>>> GetAllAsync(int pageNumber,
                                                int pageSize,
                                                string sortBy,
                                                bool ascending,
                                                Extent? extent,
                                                CancellationToken cancellationToken);

    Task<Response<AdrBina>> GetByIdAsync(int id, CancellationToken cancellationToken);

    Task<Response<int>> GetCountAsync(Extent? extent, CancellationToken cancellationToken);
}
