#!/bin/bash
# Bash Menu Script Example

echo "                     _       _ _   _____     _ "
echo "  ___ ___  _ __   __| |_   _(_) |_|___ /  __| |"
echo " / __/ _ \| '_ \ / _\` | | | | | __| |_ \ / _\` |"
echo "| (_| (_) | | | | (_| | |_| | | |_ ___) | (_| |"
echo " \___\___/|_| |_|\__,_|\__,_|_|\__|____/ \__,_|"
echo "                                               "

PS3='Please enter your choice: '
options=("Client Analysis" "Server Analysis" "Complete Analysis" "Quit")
select opt in "${options[@]}"
do
    case $opt in
        "Client Analysis")
            echo "Client Analysis is beginning..."
            sleep 1
            cd <project_path>/Client
            npm run test
            sonar -Dsonar.token=<your_sonarqube_token>
            break
            ;;
        "Server Analysis")
            echo "Server Analysis is beginning..."
            sleep 1

            cd <project_path>

            # Run unit tests
            dotnet test Tests/UserService.UnitTests/UserService.UnitTests.csproj --no-build /p:CollectCoverage=true /p:CoverletOutputFormat=opencover /p:CoverletOutput=../../Coverage/UsersService.UnitTest.xml
            dotnet test Tests/PolesService.UnitTests/PolesService.UnitTests.csproj --no-build /p:CollectCoverage=true /p:CoverletOutputFormat=opencover /p:CoverletOutput=../../Coverage/PolesService.UnitTest.xml
            dotnet test Tests/LinesService.UnitTests/LinesService.UnitTests.csproj --no-build /p:CollectCoverage=true /p:CoverletOutputFormat=opencover /p:CoverletOutput=../../Coverage/LinesService.UnitTest.xml
            dotnet test Tests/BuildingsService.UnitTests/BuildingsService.UnitTests.csproj --no-build /p:CollectCoverage=true /p:CoverletOutputFormat=opencover /p:CoverletOutput=../../Coverage/BuildingsService.UnitTest.xml
            dotnet test Tests/Common.UnitTests/Common.UnitTests.csproj --no-build /p:CollectCoverage=true /p:CoverletOutputFormat=opencover /p:CoverletOutput=../../Coverage/Common.UnitTest.xml

            # Run integration tests
            dotnet test Tests/UserService.IntegrationTests/UserService.IntegrationTests.csproj --no-build /p:CollectCoverage=true /p:CoverletOutputFormat=opencover /p:CoverletOutput=../../Coverage/UsersService.IntegrationTest.xml
            dotnet test Tests/BuildingsService.IntegrationTests/BuildingsService.IntegrationTests.csproj --no-build /p:CollectCoverage=true /p:CoverletOutputFormat=opencover /p:CoverletOutput=../../Coverage/BuildingsService.IntegrationTest.xml
            dotnet test Tests/LinesService.IntegrationTests/LinesService.IntegrationTests.csproj --no-build /p:CollectCoverage=true /p:CoverletOutputFormat=opencover /p:CoverletOutput=../../Coverage/LinesService.IntegrationTest.xml
            dotnet test Tests/PolesService.IntegrationTests/PolesService.IntegrationTests.csproj --no-build /p:CollectCoverage=true /p:CoverletOutputFormat=opencover /p:CoverletOutput=../../Coverage/PolesService.IntegrationTest.xml

            dotnet sonarscanner begin /k:"c3d-server" /d:sonar.host.url="http://localhost:9000"  /d:sonar.token="<your_sonarqube_token>" /d:sonar.exclusions="**/Client/**" /d:sonar.cs.opencover.reportsPaths=./Coverage/**/*.xml
            dotnet build
            dotnet sonarscanner end /d:sonar.token="<your_sonarqube_token>"
            break
            ;;
        "Complete Analysis")
            echo "Complete Analysis is beginning..."
            sleep 1
            cd <project_path>/Client
            npm run test
            sonar -Dsonar.token=<your_sonarqube_token>

            cd ../

            # Run unit tests
            dotnet test Tests/UserService.UnitTests/UserService.UnitTests.csproj --no-build /p:CollectCoverage=true /p:CoverletOutputFormat=opencover /p:CoverletOutput=../../Coverage/UsersService.UnitTest.xml
            dotnet test Tests/PolesService.UnitTests/PolesService.UnitTests.csproj --no-build /p:CollectCoverage=true /p:CoverletOutputFormat=opencover /p:CoverletOutput=../../Coverage/PolesService.UnitTest.xml
            dotnet test Tests/LinesService.UnitTests/LinesService.UnitTests.csproj --no-build /p:CollectCoverage=true /p:CoverletOutputFormat=opencover /p:CoverletOutput=../../Coverage/LinesService.UnitTest.xml
            dotnet test Tests/BuildingsService.UnitTests/BuildingsService.UnitTests.csproj --no-build /p:CollectCoverage=true /p:CoverletOutputFormat=opencover /p:CoverletOutput=../../Coverage/BuildingsService.UnitTest.xml
            dotnet test Tests/Common.UnitTests/Common.UnitTests.csproj --no-build /p:CollectCoverage=true /p:CoverletOutputFormat=opencover /p:CoverletOutput=../../Coverage/Common.UnitTest.xml

            # Run integration tests
            dotnet test Tests/UserService.IntegrationTests/UserService.IntegrationTests.csproj --no-build /p:CollectCoverage=true /p:CoverletOutputFormat=opencover /p:CoverletOutput=../../Coverage/UsersService.IntegrationTest.xml
            dotnet test Tests/BuildingsService.IntegrationTests/BuildingsService.IntegrationTests.csproj --no-build /p:CollectCoverage=true /p:CoverletOutputFormat=opencover /p:CoverletOutput=../../Coverage/BuildingsService.IntegrationTest.xml
            dotnet test Tests/LinesService.IntegrationTests/LinesService.IntegrationTests.csproj --no-build /p:CollectCoverage=true /p:CoverletOutputFormat=opencover /p:CoverletOutput=../../Coverage/LinesService.IntegrationTest.xml
            dotnet test Tests/PolesService.IntegrationTests/PolesService.IntegrationTests.csproj --no-build /p:CollectCoverage=true /p:CoverletOutputFormat=opencover /p:CoverletOutput=../../Coverage/PolesService.IntegrationTest.xml

            dotnet sonarscanner begin /k:"c3d-server" /d:sonar.host.url="http://localhost:9000"  /d:sonar.token="<your_sonarqube_token>" /d:sonar.exclusions="**/Client/**" /d:sonar.cs.opencover.reportsPaths=./Coverage/**/*.xml
            dotnet build
            dotnet sonarscanner end /d:sonar.token="<your_sonarqube_token>"
            break
            ;;
        "Quit")
            break
            ;;
        *) echo "invalid option $REPLY";;
    esac
done
