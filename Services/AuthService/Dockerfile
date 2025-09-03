FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

WORKDIR /src

COPY ["Services/AuthService/AuthService.csproj", "Services/AuthService/"]
COPY ["Common/Common.csproj", "Common/"]

RUN dotnet restore "Services/AuthService/AuthService.csproj"

COPY ["Services/AuthService/", "Services/AuthService/"]
COPY ["Common/", "Common/"]

WORKDIR "/src/Services/AuthService"

RUN dotnet publish "AuthService.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
 
WORKDIR /app

COPY --from=build /app/publish .

EXPOSE 8080

ENTRYPOINT ["dotnet", "AuthService.dll"]