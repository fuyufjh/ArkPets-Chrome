#!/bin/bash
set -eu

# Default target is chrome
TARGET="chrome"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -t|--target)
            TARGET="$2"
            shift 2
            ;;
        *)
            echo "Unknown argument: $1"
            echo "Usage: $0 [-t|--target chrome|edge|firefox]"
            exit 1
            ;;
    esac
done

# Validate target
if [[ "$TARGET" != "chrome" && "$TARGET" != "edge" && "$TARGET" != "firefox" ]]; then
    echo "Invalid target: $TARGET"
    echo "Target must be either 'chrome', 'edge', or 'firefox'"
    exit 1
fi

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
npm install
npm run build
popd

# Build the project
echo "Building version $MANIFEST_VERSION..."
npm install
npm run build

# Function to perform portable sed in-place replacement
sed_in_place() {
    local pattern="$1"
    local file="$2"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS/BSD sed requires an extension argument
        sed -i '' "$pattern" "$file"
    else
        # GNU sed (Linux) works without an extension
        sed -i "$pattern" "$file"
    fi
}

# Modify manifest for Edge/Firefox if needed
if [ "$TARGET" = "edge" ]; then
    echo "Modifying manifest.json for Edge..."
    sed_in_place 's/Chrome/Edge/g' dist/manifest.json
elif [ "$TARGET" = "firefox" ]; then
    echo "Modifying manifest.json for Firefox..."
    # Add-on names cannot contain the Mozilla or Firefox trademarks :D
    sed_in_place 's/ Chrome//g' dist/manifest.json
fi

# Create zip file with version number
echo "Creating zip archive..."
pushd dist
zip -r "../arkpets-${TARGET}-${MANIFEST_VERSION}.zip" .
popd

echo "Build complete: arkpets-${TARGET}-${MANIFEST_VERSION}.zip"
