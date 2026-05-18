# --- STAGE 1: Build stage ---
# Sử dụng image Maven để build source code
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml ./pom.xml
COPY core-services/cinema-management-service/pom.xml ./core-services/cinema-management-service/pom.xml
COPY core-services/cinema-management-service/src ./core-services/cinema-management-service/src
RUN mvn -f core-services/cinema-management-service/pom.xml dependency:go-offline -B
RUN mvn -f core-services/cinema-management-service/pom.xml clean package -DskipTests

FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app
COPY --from=build /app/core-services/cinema-management-service/target/*.jar app.jar
ENTRYPOINT ["java", "-Xmx512m", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]