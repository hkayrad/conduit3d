FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

WORKDIR /src

COPY ["Services/PolesService/PolesService.csproj", "Services/PolesService/"]
COPY ["Common/Common.csproj", "Common/"]

RUN dotnet restore "Services/PolesService/PolesService.csproj"

COPY ["Services/PolesService/", "Services/PolesService/"]
COPY ["Common/", "Common/"]

WORKDIR "/src/Services/PolesService"

RUN dotnet publish "PolesService.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final

WORKDIR /app

COPY --from=build /app/publish .

EXPOSE 8080

ENTRYPOINT ["dotnet", "PolesService.dll"]