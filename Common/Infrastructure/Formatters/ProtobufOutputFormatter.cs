using System;
using Google.Protobuf;
using Microsoft.AspNetCore.Mvc.Formatters;

namespace Conduit3D.Common.Infrastructure.Formatters;

public class ProtobufOutputFormatter : OutputFormatter
{
    public ProtobufOutputFormatter()
    {
        SupportedMediaTypes.Add("application/x-protobuf");
        SupportedMediaTypes.Add("application/protobuf");
    }

    public override bool CanWriteResult(OutputFormatterCanWriteContext context)
    {
        return context.Object is IMessage;
    }

    public override async Task WriteResponseBodyAsync(OutputFormatterWriteContext context)
    {
        var response = context.HttpContext.Response;
        
        if (context.Object is IMessage message)
        {
            response.ContentType = "application/x-protobuf";
            var bytes = message.ToByteArray();
            await response.Body.WriteAsync(bytes);
        }
    }
}