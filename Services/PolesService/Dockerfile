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

ENV \
    # Unprivileged user and group that will run the app
    APP_UID=1654 \
    APP_USER=app

WORKDIR /app

COPY --from=build --chown=root:root --chmod=755 /app/publish .

EXPOSE 8080

# Switch to the unprivileged user
USER $APP_USER

ENTRYPOINT ["dotnet", "PolesService.dll"]