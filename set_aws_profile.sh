#!/bin/bash
# Script to set AWS profile as environment variable

# Set AWS_PROFILE environment variable
export AWS_PROFILE=personal

# Verify the setting
echo "AWS profile set to: $AWS_PROFILE"
echo "Testing AWS credentials..."
aws sts get-caller-identity