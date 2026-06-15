#!/bin/bash
set -e

# Define directories and stack details
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
KEY_NAME="personality-key"
KEY_PATH="$SCRIPT_DIR/$KEY_NAME.pem"
STACK_NAME="PersonalityTestStack"
TEMPLATE_PATH="$SCRIPT_DIR/template.yaml"

echo "=================================================="
echo "      PersonalityTest AWS Deployment Script       "
echo "=================================================="

# 1. Verify AWS CLI is installed and configured
if ! command -v aws &> /dev/null; then
    echo "ERROR: aws-cli is not installed. Please install it first."
    exit 1
fi

echo "✓ AWS CLI detected."

# 2. Check and generate KeyPair if necessary
echo "Checking EC2 KeyPair..."
if ! aws ec2 describe-key-pairs --key-names "$KEY_NAME" &> /dev/null; then
    echo "KeyPair '$KEY_NAME' does not exist in AWS. Generating one..."
    # Generate and save locally
    aws ec2 create-key-pair --key-name "$KEY_NAME" --query "KeyMaterial" --output text > "$KEY_PATH"
    chmod 400 "$KEY_PATH"
    echo "✓ KeyPair generated and saved to: $KEY_PATH"
else
    echo "✓ KeyPair '$KEY_NAME' already exists in AWS."
    if [ ! -f "$KEY_PATH" ]; then
        echo "WARNING: KeyPair exists in AWS but the private key file '$KEY_PATH' is missing locally!"
        echo "You will not be able to SSH into the EC2 instance unless you have the existing key."
    else
        echo "✓ Private key file found locally."
    fi
fi

# 3. Deploy CloudFormation Stack
echo "Starting CloudFormation deployment for stack '$STACK_NAME'..."
echo "This may take 2-4 minutes to provision all VPC and EC2 resources..."

aws cloudformation deploy \
    --template-file "$TEMPLATE_PATH" \
    --stack-name "$STACK_NAME" \
    --parameter-overrides KeyName="$KEY_NAME" \
    --capabilities CAPABILITY_IAM

echo "✓ CloudFormation stack deployed successfully!"

# 4. Retrieve Outputs
echo "Retrieving stack outputs..."
PUBLIC_IP=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --query "Stacks[0].Outputs[?OutputKey=='PublicIP'].OutputValue" \
    --output text)

PUBLIC_DNS=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --query "Stacks[0].Outputs[?OutputKey=='PublicDNS'].OutputValue" \
    --output text)

echo "=================================================="
echo "🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!"
echo "=================================================="
echo "Server Public IP:  $PUBLIC_IP"
echo "Server Public DNS: $PUBLIC_DNS"
echo "=================================================="
echo ""
echo "👉 STEP 1: SSH into your new server to check status:"
echo "   ssh -i \"$KEY_PATH\" ec2-user@$PUBLIC_IP"
echo ""
echo "👉 STEP 2: Check if Docker is ready:"
echo "   ssh -i \"$KEY_PATH\" ec2-user@$PUBLIC_IP \"docker --version && docker compose version\""
echo ""
echo "👉 STEP 3: Copy your project files to the EC2 server (run from project root):"
echo "   # Create target folder on server"
echo "   ssh -i \"$KEY_PATH\" ec2-user@$PUBLIC_IP \"mkdir -p /home/ec2-user/app\""
echo "   # Copy files (excluding node_modules and .git via rsync, or zip it up)"
echo "   rsync -avz -e \"ssh -i $KEY_PATH\" --exclude='node_modules' --exclude='.git' --exclude='.turbo' --exclude='aws/*.pem' ./ ec2-user@$PUBLIC_IP:/home/ec2-user/app/"
echo ""
echo "👉 STEP 4: Build and run the app on the EC2 server:"
echo "   ssh -i \"$KEY_PATH\" ec2-user@$PUBLIC_IP \"cd /home/ec2-user/app && docker compose up -d --build\""
echo "=================================================="
