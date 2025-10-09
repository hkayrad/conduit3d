using System;
using BuildingsService.Domain;
using Conduit3D.Common.Domain;
using Conduit3D.Common.Infrastructure.Services;

namespace BuildingsService.Infrastructure.Services;

public interface IAdrYolService : IGenericService<AdrYol>
{
    public Task<Response<List<string>>> GetTipListAsync(CancellationToken cancellationToken);
    Task<AdrYolResponse> GetAllAsProtobufAsync(int pageNumber,
                                                int pageSize,
                                                string sortBy,
                                                bool ascending,
                                                Extent? extent,
                                                string? query,
                                                CancellationToken cancellationToken);
}
