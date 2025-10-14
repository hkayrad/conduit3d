using System.IO;
using System.Text;
using System.Threading.Tasks;
using FluentAssertions;
using Google.Protobuf;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Formatters;
using Xunit;
using Conduit3D.Common.Infrastructure.Formatters;
using Google.Protobuf.Reflection;

namespace Common.UnitTests.Infrastructure.Formatters
{
    public class ProtobufOutputFormatterTests
    {
        private readonly ProtobufOutputFormatter _formatter = new();

        // Use a properly generated protobuf message for testing
        private class TestMessage : IMessage<TestMessage>
        {
            private int _value;
            private int _calculatedSize = -1;

            public int Value
            {
                get => _value;
                set
                {
                    _value = value;
                    _calculatedSize = -1; // Reset calculated size when value changes
                }
            }

            public MessageDescriptor Descriptor => null!;

            public int CalculateSize()
            {
                if (_calculatedSize >= 0)
                    return _calculatedSize;

                int size = 0;
                if (Value != 0)
                {
                    // Field number 1, wire type varint
                    size += 1 + CodedOutputStream.ComputeInt32Size(Value);
                }
                _calculatedSize = size;
                return size;
            }

            public TestMessage Clone() => new() { Value = Value };

            public bool Equals(TestMessage? other) => other?.Value == Value;

            public void MergeFrom(TestMessage message) => Value = message.Value;

            public void MergeFrom(CodedInputStream input)
            {
                uint tag;
                while ((tag = input.ReadTag()) != 0)
                {
                    if (tag == 8) // Field 1, wire type varint
                    {
                        Value = input.ReadInt32();
                    }
                    else
                    {
                        input.SkipLastField();
                    }
                }
            }

            public void WriteTo(CodedOutputStream output)
            {
                if (Value != 0)
                {
                    output.WriteTag(1, WireFormat.WireType.Varint);
                    output.WriteInt32(Value);
                }
            }
        }

        [Fact]
        public void CanWriteResult_ShouldReturnTrue_WhenObjectIsIMessage()
        {
            // Arrange
            var context = new OutputFormatterWriteContext(
                new DefaultHttpContext(),
                (stream, encoding) => new StreamWriter(stream, encoding),
                typeof(TestMessage),
                new TestMessage()
            );

            // Act
            var result = _formatter.CanWriteResult(context);

            // Assert
            result.Should().BeTrue();
        }

        [Fact]
        public void CanWriteResult_ShouldReturnFalse_WhenObjectIsNotIMessage()
        {
            // Arrange
            var context = new OutputFormatterWriteContext(
                new DefaultHttpContext(),
                (stream, encoding) => new StreamWriter(stream, encoding),
                typeof(object),
                new object()
            );

            // Act
            var result = _formatter.CanWriteResult(context);

            // Assert
            result.Should().BeFalse();
        }

        [Fact]
        public void CanWriteResult_ShouldReturnFalse_WhenObjectIsNull()
        {
            // Arrange
            var context = new OutputFormatterWriteContext(
                new DefaultHttpContext(),
                (stream, encoding) => new StreamWriter(stream, encoding),
                typeof(object),
                null!
            );

            // Act
            var result = _formatter.CanWriteResult(context);

            // Assert
            result.Should().BeFalse();
        }

        [Fact]
        public async Task WriteResponseBodyAsync_ShouldWriteProtobufBytesToResponse()
        {
            // Arrange
            var testMessage = new TestMessage { Value = 123 };
            var httpContext = new DefaultHttpContext();
            var responseStream = new MemoryStream();
            httpContext.Response.Body = responseStream;
            
            var context = new OutputFormatterWriteContext(
                httpContext,
                (stream, encoding) => new StreamWriter(stream, encoding),
                testMessage.GetType(),
                testMessage
            );

            // Act
            await _formatter.WriteResponseBodyAsync(context);

            // Assert
            httpContext.Response.ContentType.Should().Be("application/x-protobuf");
            responseStream.Position = 0;

            var resultBytes = responseStream.ToArray();
            var expectedBytes = testMessage.ToByteArray();

            resultBytes.Should().BeEquivalentTo(expectedBytes);
        }

        [Fact]
        public async Task WriteResponseBodyAsync_WithZeroValue_ShouldWriteEmptyMessage()
        {
            // Arrange
            var testMessage = new TestMessage { Value = 0 };
            var httpContext = new DefaultHttpContext();
            var responseStream = new MemoryStream();
            httpContext.Response.Body = responseStream;
            
            var context = new OutputFormatterWriteContext(
                httpContext,
                (stream, encoding) => new StreamWriter(stream, encoding),
                testMessage.GetType(),
                testMessage
            );

            // Act
            await _formatter.WriteResponseBodyAsync(context);

            // Assert
            responseStream.Position = 0;
            var resultBytes = responseStream.ToArray();
            
            // Empty message (zero value fields are not serialized in protobuf)
            resultBytes.Should().BeEmpty();
        }

        [Fact]
        public async Task WriteResponseBodyAsync_WithLargeValue_ShouldSerializeCorrectly()
        {
            // Arrange
            var testMessage = new TestMessage { Value = int.MaxValue };
            var httpContext = new DefaultHttpContext();
            var responseStream = new MemoryStream();
            httpContext.Response.Body = responseStream;
            
            var context = new OutputFormatterWriteContext(
                httpContext,
                (stream, encoding) => new StreamWriter(stream, encoding),
                testMessage.GetType(),
                testMessage
            );

            // Act
            await _formatter.WriteResponseBodyAsync(context);

            // Assert
            responseStream.Position = 0;
            var resultBytes = responseStream.ToArray();
            var expectedBytes = testMessage.ToByteArray();

            resultBytes.Should().BeEquivalentTo(expectedBytes);
            
            // Verify we can deserialize it back
            var deserializedMessage = new TestMessage();
            deserializedMessage.MergeFrom(resultBytes);
            deserializedMessage.Value.Should().Be(int.MaxValue);
        }
    }
}