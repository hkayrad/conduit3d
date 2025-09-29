FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

WORKDIR /src

COPY ["Services/UserService/UserService.csproj", "Services/UserService/"]
COPY ["Common/Common.csproj", "Common/"]

RUN dotnet restore "Services/UserService/UserService.csproj"

COPY ["Services/UserService/", "Services/UserService/"]
COPY ["Common/", "Common/"]

WORKDIR "/src/Services/UserService"

RUN dotnet publish "UserService.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
 
WORKDIR /app

COPY --from=build /app/publish .

EXPOSE 8080

ENTRYPOINT ["dotnet", "UserService.dll"]