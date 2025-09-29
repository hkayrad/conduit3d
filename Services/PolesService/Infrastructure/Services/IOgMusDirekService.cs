using System;
using Conduit3D.Common.Domain;
using Conduit3D.Common.Infrastructure.Services;
using PolesService.Domain;

namespace PolesService.Infrastructure.Services;

/// <summary>
/// Service interface for managing OgMusDirek entities.
/// </summary>
public interface IOgMusDirekService : IGenericService<OgMusDirek>
{
    public Task<Response<List<string>>> GetTipListAsync(CancellationToken cancellationToken);
    public Task<OgMusDirekResponse> GetAllAsProtobufAsync(int pageNumber,
                                            int pageSize,
                                            string sortBy,
                                            bool ascending,
                                            Extent? extent,
                                            string? query,
                                            CancellationToken cancellationToken);
}
