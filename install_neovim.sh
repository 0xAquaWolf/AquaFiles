#!/usr/bin/env bash
# Neovim + LazyVim Installation Script
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"
AQUAFILES_DIR="$HOME/AquaFiles"

error() {
  echo "Error: $1" >&2
  exit 1
}

confirm() {
  read -p "$1 (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    error "Setup cancelled by user"
  fi
}

setup_neovim() {
  echo "Checking Neovim installation and configuration..."

  # Check if Neovim is installed
  if ! command -v nvim &>/dev/null; then
    echo "Neovim is not installed. Installing..."
    brew install neovim || error "Failed to install Neovim"
  fi

  # Check specifically for LazyVim installation
  nvim_config_dir="$HOME/.config/nvim"
  lazy_plugin_dir="$HOME/.local/share/nvim/lazy"

  # Check if LazyVim is installed by looking for the lazy.nvim plugin and LazyVim plugin
  if [ -d "$lazy_plugin_dir/lazy.nvim" ] && [ -d "$lazy_plugin_dir/LazyVim" ]; then
    echo "LazyVim is already installed and configured. Skipping setup..."
    return 0
  fi

  echo "Setting up LazyVim..."

  # Backup existing Neovim files
  for dir in "$nvim_config_dir" "$HOME/.local/share/nvim" "$HOME/.local/state/nvim" "$HOME/.cache/nvim"; do
    if [ -d "$dir" ]; then
      echo "Backing up existing Neovim directory: $dir"
      if [ -d "${dir}.bak" ]; then
        echo "Removing old backup at ${dir}.bak"
        rm -rf "${dir}.bak"
      fi
      mv "$dir" "${dir}.bak"
    fi
  done

  echo "Setting up LazyVim..."
  git clone https://github.com/LazyVim/starter "$nvim_config_dir"
  echo "Running Neovim to install LazyVim dependencies..."
  echo "Please wait for the installation to complete."
  nvim --headless "+lua require('lazy').sync()" "+TSUpdateSync" "+qall"
  echo "LazyVim setup complete."
  echo "Removing default configuration..."
  rm -rf "$nvim_config_dir/.git"
  rm -rf "$nvim_config_dir/lua"
  echo "Stowing custom Neovim configuration..."
  cd "$AQUAFILES_DIR" || error "Failed to change to AquaFiles directory"
  if stow nvim; then
    echo "Neovim configuration successfully stowed."
  else
    error "Failed to stow Neovim configuration"
  fi
  cd "$SCRIPT_DIR" || error "Failed to change back to the original directory"
}

echo "Welcome to the Neovim + LazyVim installation script!"
confirm "This script will set up Neovim with your custom configuration. Do you want to continue?"

# Run the Neovim setup
setup_neovim

echo "Neovim installation and configuration completed successfully!"
echo
echo "Note: Existing Neovim configurations have been backed up with a .bak extension."
echo "If you need to revert any changes, you can find these backups in their respective directories:"
echo "- ~/.config/nvim.bak"
echo "- ~/.local/share/nvim.bak"
echo "- ~/.local/state/nvim.bak"
echo "- ~/.cache/nvim.bak"
echo
echo "Installed plugins can be found in: $HOME/.local/share/nvim/lazy/"
echo
echo "Remember to:"
echo "1. Install a Nerd Font (v3.0 or greater) for proper icon display"
echo "2. Check :checkhealth in Neovim for any additional requirements"
echo
echo "For more detailed setup instructions and customization options, refer to:"
echo "https://www.lazyvim.org"
