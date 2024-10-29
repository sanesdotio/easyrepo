#!/bin/sh

# Configuration
REPO_OWNER="sanesdotio"
REPO_NAME="easyrepo"
EXECUTABLE_NAME="easyrepo-pkg"
INSTALL_DIR="/usr/local/bin"

# Fetch the latest release information
echo "Fetching latest release information..."
LATEST_RELEASE=$(curl -s "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/releases/latest")
DOWNLOAD_URL=$(echo "$LATEST_RELEASE" | grep "browser_download_url.*$EXECUTABLE_NAME" | cut -d '"' -f 4)

if [ -z "$DOWNLOAD_URL" ]; then
    echo "Error: Unable to find the download URL for $EXECUTABLE_NAME"
    exit 1
fi

# Download the executable
echo "Downloading $EXECUTABLE_NAME..."
curl -L "$DOWNLOAD_URL" -o "/tmp/$EXECUTABLE_NAME"

# Make the file executable
chmod +x "/tmp/$EXECUTABLE_NAME"

# Move the executable to the installation directory
echo "Installing $EXECUTABLE_NAME to $INSTALL_DIR..."
sudo mv "/tmp/$EXECUTABLE_NAME" "$INSTALL_DIR/$EXECUTABLE_NAME"

# Verify installation
if [ -f "$INSTALL_DIR/$EXECUTABLE_NAME" ]; then
    echo "Installation successful! You can now use '$EXECUTABLE_NAME' from anywhere."
else
    echo "Error: Installation failed."
    exit 1
fi