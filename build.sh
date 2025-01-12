#!/bin/bash

# Extract version from manifest.json
MANIFEST_VERSION=$(cat src/manifest.json | grep '"version"' | head -1 | awk -F: '{ print $2 }' | sed 's/[",]//g' | tr -d '[:space:]')

# Extract version from package.json
PACKAGE_VERSION=$(cat package.json | grep '"version"' | head -1 | awk -F: '{ print $2 }' | sed 's/[",]//g' | tr -d '[:space:]')

# Check if versions match
if [ "$MANIFEST_VERSION" != "$PACKAGE_VERSION" ]; then
    echo "Error: Version mismatch!"
    echo "manifest.json version: $MANIFEST_VERSION"
    echo "package.json version: $PACKAGE_VERSION"
    exit 1
fi

# Build the ArkPets-Web
echo "Building ArkPets-Web..."
pushd ArkPets-Web
npm run build
popd

# Build the project
echo "Building version $MANIFEST_VERSION..."
npm run build

# Create zip file with version number
echo "Creating zip archive..."
pushd dist
zip -r "../arkpets-chrome-${MANIFEST_VERSION}.zip" .
popd

echo "Build complete: arkpets-chrome-${MANIFEST_VERSION}.zip"
