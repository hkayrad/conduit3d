using System;
using BuildingsService.Domain;
using Conduit3D.Common.Infrastructure.Repositories;

namespace BuildingsService.Infrastructure.Repositories;

public interface IBuildingsRepository : IGenericRepository<Building>
{

}
