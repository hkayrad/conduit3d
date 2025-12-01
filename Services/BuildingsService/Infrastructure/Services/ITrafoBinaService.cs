using System;
using BuildingsService.Domain;
using Conduit3D.Common.Domain;
using Conduit3D.Common.Infrastructure.Services;

namespace BuildingsService.Infrastructure.Services;

/// <summary>
/// Service interface for managing TrafoBina entities.
/// </summary>
public interface ITrafoBinaService : IGenericService<TrafoBina>
{
    Task<TrafoBinaResponse> GetAllAsProtobufAsync(int pageNumber,
                                            int pageSize,
                                            string sortBy,
                                            bool ascending,
                                            Extent? extent,
                                            string? query,
                                            CancellationToken cancellationToken);
    Task<Response<TrafoBina>> CreateAsync(TrafoBina entity, CancellationToken cancellationToken);
    Task<Response<bool>> DeleteAsync(int id, CancellationToken cancellationToken);
    Task<Response<TrafoBina>> UpdateAsync(TrafoBina entity, CancellationToken cancellationToken);
}
