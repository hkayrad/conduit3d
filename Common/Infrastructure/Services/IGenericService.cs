using System;
using Conduit3D.Common.Domain;

namespace Conduit3D.Common.Infrastructure.Services;

public interface IGenericService<T> where T : class
{
    Task<Response<List<T>>> GetAllAsync(int pageNumber,
                                            int pageSize,
                                            string sortBy,
                                            bool ascending,
                                            Extent? extent,
                                            string? query,
                                            CancellationToken cancellationToken);

    Task<Response<T>> GetByIdAsync(int id, CancellationToken cancellationToken);

    Task<Response<int>> GetCountAsync(Extent? extent, CancellationToken cancellationToken);
}
