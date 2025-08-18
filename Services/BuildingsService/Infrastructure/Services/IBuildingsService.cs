using System;
using BuildingsService.Domain;
using Conduit3D.Common.Domain;

namespace BuildingsService.Infrastructure.Services;

public interface IBuildingsService: IGenericRepository<Building>
{
    
}
