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

ENV \
    # Unprivileged user and group that will run the app
    APP_UID=1654 \
    APP_USER=app

WORKDIR /app

COPY --from=build --chown=root:root --chmod=755 /app/publish .

EXPOSE 8080

# Switch to the unprivileged user
USER $APP_USER

ENTRYPOINT ["dotnet", "BuildingsService.dll"]