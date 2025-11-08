#!/usr/bin/env bash
set -euo pipefail

# --- Configuration ---
REPO_URL="https://github.com/BitCraftToolBox/bitcraft-nodeindex.git"
TARGET_DIR="nodeindex"
DOCKERFILE_SRC="./Dockerfile"
IMAGE_NAME="bitcraftmap-api"

# --- Remove and Clone ---
rm -rf "$TARGET_DIR"
git clone "$REPO_URL" "$TARGET_DIR"
cp "$DOCKERFILE_SRC" "$TARGET_DIR/Dockerfile"
cd "$TARGET_DIR"

# --- Calculate build hash ---
HASH_REV=$(git rev-parse --short HEAD)

# --- Build 2 images ---
docker build -t "${IMAGE_NAME}:${HASH_REV}" -t "${IMAGE_NAME}:latest" .
echo "Built ${IMAGE_NAME}:${HASH_REV} and ${IMAGE_NAME}:latest"
