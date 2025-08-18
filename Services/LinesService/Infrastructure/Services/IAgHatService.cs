using System;
using Conduit3D.Common.Domain;
using LinesService.Domain;

namespace LinesService.Infrastructure.Services;

public interface IAgHatService
{
    Task<Response<List<AgHat>>> GetAllAsync(int pageNumber,
                                            int pageSize,
                                            string sortBy,
                                            bool ascending,
                                            Extent? extent,
                                            CancellationToken cancellationToken);

    Task<Response<AgHat>> GetByIdAsync(int id, CancellationToken cancellationToken);

    Task<Response<int>> GetCountAsync(Extent? extent, CancellationToken cancellationToken);
}

