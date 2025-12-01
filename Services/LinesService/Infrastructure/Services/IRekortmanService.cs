using System;
using Conduit3D.Common.Domain;
using Conduit3D.Common.Infrastructure.Services;
using LinesService.Domain;

namespace LinesService.Infrastructure.Services;

/// <summary>
/// Service interface for managing Rekortman entities.
/// </summary>
public interface IRekortmanService : IGenericService<Rekortman>
{
    public Task<Response<List<string>>> GetTipListAsync(CancellationToken cancellationToken);
    public Task<RekortmanResponse> GetAllAsProtobufAsync(int pageNumber,
                                            int pageSize,
                                            string sortBy,
                                            bool ascending,
                                            Extent? extent,
                                            string? query,
                                            CancellationToken cancellationToken);
    Task<Response<Rekortman>> CreateAsync(Rekortman entity, CancellationToken cancellationToken);
    Task<Response<bool>> DeleteAsync(int id, CancellationToken cancellationToken);
    Task<Response<Rekortman>> UpdateAsync(Rekortman entity, CancellationToken cancellationToken);
}
