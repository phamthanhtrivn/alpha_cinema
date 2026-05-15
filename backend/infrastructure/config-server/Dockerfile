# --- STAGE 1: Build stage ---
# Sử dụng image Maven để build source code
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml ./pom.xml
COPY infrastructure/config-server/pom.xml ./infrastructure/config-server/pom.xml
COPY infrastructure/config-server/src ./infrastructure/config-server/src
RUN mvn -f infrastructure/config-server/pom.xml dependency:go-offline -B
RUN mvn -f infrastructure/config-server/pom.xml clean package -DskipTests

FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app
COPY --from=build /app/infrastructure/config-server/target/*.jar app.jar
ENTRYPOINT ["java", "-Xmx512m", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]