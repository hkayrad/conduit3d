using System;
using System.Net;

namespace Conduit3D.Common.Domain;

public class Response<T>
{
    public required bool IsSuccess { get; set; }
    public required string Message { get; set; }
    public required HttpStatusCode StatusCode { get; set; }
    public required T Data { get; set; }

    public static Response<T> Success(T data, string message, HttpStatusCode statusCode = HttpStatusCode.OK)
    {
        return new Response<T>
        {
            IsSuccess = true,
            Message = message,
            StatusCode = statusCode,
            Data = data
        };
    }

    public static Response<T> Failure(string message, HttpStatusCode statusCode = HttpStatusCode.BadRequest)
    {
        return new Response<T>
        {
            IsSuccess = false,
            Message = message,
            StatusCode = statusCode,
            Data = default!
        };
    }

    public static Response<T> DatabaseError(string message) => Failure(message, HttpStatusCode.InternalServerError);

    public static Response<T> NotFound(string message) => Failure(message, HttpStatusCode.NotFound);

    public static Response<T> Unauthorized(string message) => Failure(message, HttpStatusCode.Unauthorized);

    public static Response<T> Forbidden(string message) => Failure(message, HttpStatusCode.Forbidden);

    public static Response<T> UnhandledError(string message) => Failure(message, HttpStatusCode.InternalServerError);

    public static Response<T> ValidationError(string message) => Failure(message, HttpStatusCode.BadRequest);
}
