using System;
using Conduit3D.Common.Domain;
using Conduit3D.Common.Infrastructure.Services;
using LinesService.Domain;

namespace LinesService.Infrastructure.Services;

/// <summary>
/// Service interface for managing AgHat entities.
/// </summary>
public interface IAgHatService : IGenericService<AgHat>
{
    public Task<Response<List<string>>> GetTipListAsync(CancellationToken cancellationToken);
    public Task<AgHatResponse> GetAllAsProtobufAsync(int pageNumber,
                                            int pageSize,
                                            string sortBy,
                                            bool ascending,
                                            Extent? extent,
                                            string? query,
                                            CancellationToken cancellationToken);
}

