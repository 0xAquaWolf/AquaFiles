#!/bin/bash

echo "GitHub SSH Key Generator"
echo "========================"

# Prompt for email
read -p "Enter your GitHub email address: " email

# Prompt for key name
read -p "Enter a name for your SSH key (press Enter for default 'id_ed25519'): " key_name
key_name=${key_name:-id_ed25519}

# Set the key path
key_path="$HOME/.ssh/$key_name"

# Prompt for passphrase (optional)
read -s -p "Enter a passphrase (optional): " passphrase
echo

# Generate the SSH key
ssh-keygen -t ed25519 -C "$email" -f "$key_path" -N "$passphrase"

# Start the ssh-agent in the background
eval "$(ssh-agent -s)"

# Add the SSH key to the ssh-agent
ssh-add "$key_path"

# Copy the public key to clipboard
pbcopy <"$key_path.pub"

echo
echo "Your new SSH key has been generated and the public key has been copied to your clipboard."
echo "You can now add it to your GitHub account."
echo
echo "Public key location: $key_path.pub"
echo "Private key location: $key_path"
echo
echo "To add this key to your GitHub account:"
echo "1. Go to GitHub.com and sign in"
echo "2. Click on your profile photo, then click 'Settings'"
echo "3. In the user settings sidebar, click 'SSH and GPG keys'"
echo "4. Click 'New SSH key' or 'Add SSH key'"
echo "5. In the 'Title' field, add a descriptive label for the new key"
echo "6. Paste your key into the 'Key' field"
echo "7. Click 'Add SSH key'"
echo
echo "Remember to keep your private key safe and secure!"
