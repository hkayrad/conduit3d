using System;
using PolesService.Domain;
using Conduit3D.Common.Domain;

namespace PolesService.Infrastructure.Repositories;

public interface IGenericRepository<T> where T : class
{
    public Task<List<T>> GetAllAsync(int pageNumber,
                                            int pageSize,
                                            string sortBy,
                                            bool ascending,
                                            Extent extent,
                                            CancellationToken cancellationToken);

    public Task<T?> GetByIdAsync(int id, CancellationToken cancellationToken);
    public Task<int> GetCountAsync(Extent extent, CancellationToken cancellationToken);
}
