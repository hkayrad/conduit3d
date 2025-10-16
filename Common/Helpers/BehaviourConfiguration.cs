using System;
using System.Net;
using Conduit3D.Common.Domain;
using Microsoft.AspNetCore.Mvc;

namespace Conduit3D.Common.Helpers;

public static class BehaviourConfiguration
{
    public static void Configure(ApiBehaviorOptions options)
    {
        options.InvalidModelStateResponseFactory = context =>
    {
        var errors = context.ModelState
            .Where(x => x.Value?.Errors.Count > 0)
        .ToDictionary(
                x => x.Key,
                x => x.Value!.Errors.Select(e => e.ErrorMessage).ToArray()
            );

        var response = new Response<object>
        {
            IsSuccess = false,
            Message = "One or more validation errors occurred.",
            Data = errors,
            StatusCode = HttpStatusCode.BadRequest
        };

        return new BadRequestObjectResult(response);
    };
    }
}
