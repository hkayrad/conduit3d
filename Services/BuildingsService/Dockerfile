FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

WORKDIR /src

COPY ["Services/BuildingsService/BuildingsService.csproj", "Services/BuildingsService/"]
COPY ["Common/Common.csproj", "Common/"]

RUN dotnet restore "Services/BuildingsService/BuildingsService.csproj"

COPY ["Services/BuildingsService/", "Services/BuildingsService/"]
COPY ["Common/", "Common/"]

WORKDIR "/src/Services/BuildingsService"

RUN dotnet publish "BuildingsService.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final

WORKDIR /app

COPY --from=build /app/publish .

EXPOSE 8080

ENTRYPOINT ["dotnet", "BuildingsService.dll"]