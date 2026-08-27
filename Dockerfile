# Stage 1: Build the React frontend
FROM node:20 AS frontend-build
WORKDIR /app
COPY frontend ./frontend
WORKDIR /app/frontend
RUN npm install
# Vite is configured to build into ../backend/src/main/resources/static
RUN mkdir -p ../backend/src/main/resources/static
RUN npm run build

# Stage 2: Build the Spring Boot backend
FROM maven:3.9.6-eclipse-temurin-21 AS backend-build
WORKDIR /app
COPY backend ./backend
# Bring in the built React files from the previous stage
COPY --from=frontend-build /app/backend/src/main/resources/static ./backend/src/main/resources/static
WORKDIR /app/backend
RUN mvn clean package -DskipTests

# Stage 3: Run the application
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=backend-build /app/backend/target/*.jar app.jar
# Render assigns a dynamic port via the PORT env variable, but defaults to 8080 if EXPOSE is used
EXPOSE 8080
# Spring Boot automatically respects the PORT environment variable passed by Render
ENTRYPOINT ["java", "-jar", "app.jar"]
