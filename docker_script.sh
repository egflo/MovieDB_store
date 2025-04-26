#!/usr/bin/env bash

# Define the services and their respective Dockerfile paths
declare -A services
services["eureka"]="eureka_server/"
services["gateway"]="api_gateway/"
services["movie-service"]="movie_service/"
services["order-service"]="order_service/"
services["inventory-service"]="inventory_service/"
services["user-service"]="user_service/"
declare -p services

# Define the Docker registry and repository


# Loop through each service and build, tag, and push the Docker image
for service in "${!services[@]}"; do

  DOCKERFILE_PATH=${services[$service]}
  IMAGE_TAG="$DOCKER_REGISTRY/$DOCKER_REPOSITORY/$service:latest"

  echo "Building project for $service..."
  cd $DOCKERFILE_PATH && mvn clean package -DskipTests

  echo "Building Docker image for $service using Dockerfile at $DOCKERFILE_PATH..."
  echo "Building Docker image for $service..."
  docker buildx build -t $DOCKER_REPOSITORY/$service --platform=linux/amd64 .

  echo "Tagging Docker image for $service..."
  echo "tag $DOCKER_REPOSITORY/$service:latest $IMAGE_TAG"
  docker tag $DOCKER_REPOSITORY/$service:latest $IMAGE_TAG

  echo "Pushing Docker image for $service..."
  docker push $IMAGE_TAG

  echo "Docker image for $service pushed successfully."
  #Navigate back to the root directory
  echo "Current directory: $(pwd)"
  cd ..

done

echo "All services have been built and pushed successfully."