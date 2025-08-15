using System;
using BuildingsService.Domain;
using Conduit3D.Common.Domain;

namespace BuildingsService.Infrastructure.Services;

public class PostgresqlBuildingsService(IUnitOfWork unitOfWork) : IBuildingsService
{
    private readonly IUnitOfWork _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));

    public async Task<Response<List<Building>>> GetAllAsync(int pageNumber,
                                            int pageSize,
                                            string sortBy,
                                            bool ascending,
                                            Extent extent,
                                            CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }

    public async Task<Response<Building?>> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }

    public async Task<Response<int>> GetCountAsync(Extent extent, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
