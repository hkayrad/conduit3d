using System;
using System.Net;

namespace Conduit3D.Common.Domain;

/// <summary>
/// Represents a response from an API call.
/// </summary>
/// <typeparam name="T"></typeparam>
public class Response<T>
{
    /// <summary>
    /// Indicates whether the API call was successful.
    /// </summary>
    public required bool IsSuccess { get; set; }

    /// <summary>
    /// Message providing additional information about the API call result.
    /// </summary>
    public required string Message { get; set; }

    /// <summary>
    /// HTTP status code indicating the result of the API call.
    /// </summary>
    public required HttpStatusCode StatusCode { get; set; }

    /// <summary>
    /// The data returned from the API call.
    /// </summary>
    public required T Data { get; set; }

    /// <summary>
    /// Creates a successful API response.
    /// </summary>
    /// <param name="data">The data to include in the response.</param>
    /// <param name="message">A message providing additional information about the response.</param>
    /// <param name="statusCode">The HTTP status code for the response.</param>
    /// <returns>A successful API response.</returns>
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

    /// <summary>
    /// Creates a failed API response.
    /// </summary>
    /// <param name="message">A message providing additional information about the response.</param>
    /// <param name="statusCode">The HTTP status code for the response.</param>
    /// <returns>A failed API response.</returns>
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

    /// <summary>
    /// Creates a failed API response indicating a database error.
    /// </summary>
    /// <param name="message">A message providing additional information about the response.</param>
    /// <returns>A failed API response.</returns>
    public static Response<T> DatabaseError(string message) => Failure(message, HttpStatusCode.InternalServerError);

    /// <summary>
    /// Creates a failed API response indicating that the requested resource was not found.
    /// </summary>
    /// <param name="message">A message providing additional information about the response.</param>
    /// <returns>A failed API response.</returns>
    public static Response<T> NotFound(string message) => Failure(message, HttpStatusCode.NotFound);

    /// <summary>
    /// Creates a failed API response indicating that the user is not authorized to access the requested resource.
    /// </summary>
    /// <param name="message">A message providing additional information about the response.</param>
    /// <returns>A failed API response.</returns>
    public static Response<T> Unauthorized(string message) => Failure(message, HttpStatusCode.Unauthorized);

    /// <summary>
    /// Creates a failed API response indicating that the user does not have permission to access the requested resource.
    /// </summary>
    /// <param name="message">A message providing additional information about the response.</param>
    /// <returns>A failed API response.</returns>
    public static Response<T> Forbidden(string message) => Failure(message, HttpStatusCode.Forbidden);

    /// <summary>
    /// Creates a failed API response indicating an unhandled error.
    /// </summary>
    /// <param name="message">A message providing additional information about the response.</param>
    /// <returns>A failed API response.</returns>
    public static Response<T> UnhandledError(string message) => Failure(message, HttpStatusCode.InternalServerError);

    /// <summary>
    /// Creates a failed API response indicating a validation error.
    /// </summary>
    /// <param name="message">A message providing additional information about the response.</param>
    /// <returns>A failed API response.</returns>
    public static Response<T> ValidationError(string message) => Failure(message, HttpStatusCode.BadRequest);
}
