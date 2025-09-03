FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

WORKDIR /src

COPY ["Services/LinesService/LinesService.csproj", "Services/LinesService/"]
COPY ["Common/Common.csproj", "Common/"]

RUN dotnet restore "Services/LinesService/LinesService.csproj"

COPY ["Services/LinesService/", "Services/LinesService/"]
COPY ["Common/", "Common/"]

WORKDIR "/src/Services/LinesService"

RUN dotnet publish "LinesService.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final

WORKDIR /app

COPY --from=build /app/publish .

EXPOSE 8080

ENTRYPOINT ["dotnet", "LinesService.dll"]