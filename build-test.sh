#!/bin/bash

# Install dependencies
echo "Installing dependencies..."
npm install

# Create .npmrc file if it doesn't exist
if [ ! -f .npmrc ]; then
  echo "Creating .npmrc file..."
  echo "# Make optional dependencies truly optional" > .npmrc
  echo "ignore-optional=true" >> .npmrc
fi

# Test the build
echo "Testing build..."
NEXT_TELEMETRY_DISABLED=1 npm run build

# If build succeeds, try running the app
if [ $? -eq 0 ]; then
  echo "Build successful! Starting dev server..."
  npm run dev
else
  echo "Build failed. Please check the error messages above."
fi