#!/usr/bin/env bash
# AquaFiles Bootstrap Script
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

update_command_line_tools() {
  echo "Updating Command Line Tools..."
  sudo softwareupdate -i "Command Line Tools for Xcode" --verbose
  echo "Command Line Tools update completed."
}

is_app_installed() {
  local app_name="$1"
  local app_path="/Applications/${app_name}.app"

  [[ -d "$app_path" ]] && return 0

  local found_app=$(find /Applications -maxdepth 1 -iname "${app_name}.app" -print -quit)
  [[ -n "$found_app" ]] && return 0

  return 1
}

install_app() {
  local display_name="$1"
  local cask_name="$2"
  if is_app_installed "$display_name"; then
    echo "$display_name is already installed."
  elif brew list --cask "$cask_name" &>/dev/null; then
    echo "$display_name is already installed via Homebrew."
  else
    echo "Installing $display_name..."
    if brew install --cask "$cask_name"; then
      echo "$display_name was successfully installed!"
    else
      echo "Failed to install $display_name. It might not be available as a cask."
      echo "Please check https://formulae.brew.sh/cask/ for the correct cask name or install it manually."
    fi
  fi
}

get_display_name() {
  case "$1" in
  "onepassword") echo "1Password" ;;
  "cleanshot") echo "CleanShot X" ;;
  *) echo "$1" | awk '{print toupper(substr($0,1,1)) tolower(substr($0,2))}' ;;
  esac
}

stow_configs() {
  local configs=("$@")

  cd "$AQUAFILES_DIR" || error "Failed to change to AquaFiles directory"

  for config in "${configs[@]}"; do
    local config_path="$HOME/.config/$config"
    local stow_source="$AQUAFILES_DIR/$config/.config/$config"

    # Remove old backup if it exists
    if [ -e "${config_path}.bak" ]; then
      echo "Removing old backup of $config configuration..."
      rm -rf "${config_path}.bak"
    fi

    if [ -e "$config_path" ]; then
      if [ -L "$config_path" ]; then
        # It's a symlink, check if it's pointing to the correct location
        if [ "$(readlink "$config_path")" = "$stow_source" ]; then
          echo "$config configuration is already correctly stowed."
          continue
        fi
      fi

      # Existing configuration is different, back it up
      echo "Backing up existing $config configuration..."
      mv "$config_path" "${config_path}.bak"
    fi

    echo "Stowing $config configuration..."
    if stow "$config"; then
      echo "$config configuration successfully stowed."
    else
      error "Failed to stow $config configuration"
    fi
  done

  cd "$SCRIPT_DIR" || error "Failed to change back to the original directory"
}

setup_neovim() {
  echo "Setting up Neovim configuration..."
  nvim_config_dir="$HOME/.config/nvim"
  # Backup existing Neovim files
  if [ -d "$nvim_config_dir" ]; then
    echo "Backing up existing Neovim configuration..."
    mv "$nvim_config_dir" "${nvim_config_dir}.bak"
  fi
  if [ -d "$HOME/.local/share/nvim" ]; then
    mv "$HOME/.local/share/nvim" "$HOME/.local/share/nvim.bak"
  fi
  if [ -d "$HOME/.local/state/nvim" ]; then
    mv "$HOME/.local/state/nvim" "$HOME/.local/state/nvim.bak"
  fi
  if [ -d "$HOME/.cache/nvim" ]; then
    mv "$HOME/.cache/nvim" "$HOME/.cache/nvim.bak"
  fi
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

install_rust() {
  if command -v rustc &>/dev/null; then
    echo "Rust is already installed."
  else
    echo "Installing Rust..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source "$HOME/.cargo/env"
  fi
}

update_fish_config() {
  local fish_config="$HOME/.config/fish/config.fish"
  echo "Updating Fish configuration..."
  cat <<EOF >>"$fish_config"

# Source Rust environment if it exists
if test -f "$HOME/.cargo/env"
    source "$HOME/.cargo/env"
end

EOF
  echo "Fish configuration updated."
}

echo "Welcome to the AquaFiles bootstrap script!"
confirm "This script will set up your macOS environment. Do you want to continue?"

# Update Command Line Tools
echo "Checking Command Line Tools..."
if ! pkgutil --pkg-info=com.apple.pkg.CLTools_Executables | grep -q "version: 16."; then
  echo "Command Line Tools are outdated or not installed. Updating..."
  update_command_line_tools
else
  echo "Command Line Tools are up to date."
fi

# Verify Git is installed
if command -v git &>/dev/null; then
  echo "Git is already installed."
else
  error "Git is not installed. Please install Command Line Tools and try again."
fi

# Install Homebrew
if command -v brew &>/dev/null; then
  echo "Homebrew is already installed."
else
  echo "Installing Homebrew..."
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)" || error "Failed to install Homebrew"
fi

# Add Homebrew to PATH for the current session
eval "$(/opt/homebrew/bin/brew shellenv)"

# Set Homebrew environment variables
export HOMEBREW_NO_AUTO_UPDATE=1
export HOMEBREW_NO_ENV_HINTS=1

# Install applications
echo "Installing applications..."
cask_apps="onepassword obsidian raycast arc cleanshot discord telegram whatsapp figma chromium keycastr obs elgato-stream-deck"

for cask in $cask_apps; do
  display_name=$(get_display_name "$cask")
  install_app "$display_name" "$cask"
done

# Install Rust
install_rust

# Install essential tools
echo "Installing essential tools..."
tools="neovim zellij stow wezterm lazygit ripgrep fd pipx go  vivid fx bpytop fastfetch eza bat delta fnm oven-sh/bun/bun"
for tool in $tools; do
  if brew list "$tool" &>/dev/null; then
    echo "$tool is already installed."
  else
    brew install "$tool" || error "Failed to install $tool"
  fi
done

# Check if borders is installed
if ! brew list borders &>/dev/null; then
  brew tap FelixKratz/formulae
  brew install borders
else
  echo "borders is already installed."
fi

# Check if fnm is installed and if version 20.18 is available
if command -v fnm &>/dev/null; then
  if ! fnm list | grep -q "v20.18"; then
    fnm install 20.18
  else
    echo "Node.js version 20.18 is already installed."
  fi
else
  echo "fnm is not installed. Please install fnm first."
fi

# Install zoxide and starship with Cargo
for tool in zoxide starship; do
  if command -v "$tool" &>/dev/null; then
    echo "$tool is already installed."
  else
    echo "Installing $tool with Cargo..."
    cargo install "$tool" || error "Failed to install $tool"
  fi
done

# Install yabai and skhd
for tool in yabai skhd; do
  if brew list "$tool" &>/dev/null; then
    echo "$tool is already installed."
  else
    echo "Installing $tool..."
    brew install koekeishiya/formulae/$tool || error "Failed to install $tool"
  fi
done

# Install Deno
if command -v deno &>/dev/null; then
  echo "Deno is already installed."
else
  echo "Installing Deno..."
  curl -fsSL https://deno.land/install.sh | sh || error "Failed to install Deno"
fi

# Set up fish as the default shell
fish_path=$(which fish)
if [ "$SHELL" = "$fish_path" ]; then
  echo "Fish is already the default shell."
else
  if ! grep -q "$fish_path" /etc/shells; then
    echo "Adding Fish to /etc/shells..."
    echo "$fish_path" | sudo tee -a /etc/shells
  fi
  echo "Setting Fish as the default shell..."
  chsh -s "$fish_path" || error "Failed to set Fish as default shell"
fi

# Call the Neovim setup function
setup_neovim

# Stow other configurations
echo "Stowing other configurations..."
stow_configs "fish" "git" "zellij" "yabai" "skhd" "wezterm" "bat"

bat cache --clear
bat cache --build

# Update Fish configuration
update_fish_config

echo "Starting services..."
if command -v yabai &>/dev/null; then
  if yabai --start-service; then
    echo "yabai service started successfully."
  else
    error "Failed to start yabai service"
  fi
else
  echo "yabai is not installed. Skipping service start."
fi

if command -v skhd &>/dev/null; then
  if skhd --start-service; then
    echo "skhd service started successfully."
  else
    error "Failed to start skhd service"
  fi
else
  echo "skhd is not installed. Skipping service start."
fi

echo "Bootstrap process completed successfully!"
echo
echo "Note: Existing configurations have been backed up with a .bak extension in their respective directories."
echo "If you need to revert any changes, you can find these backups in your .config directory."
echo
echo "Remember to complete the following steps:"
echo "1. Set up Neovim (LazyVim)"
echo "2. Configure Yabai's scripting additions (see README for instructions)"
echo "3. Install and configure additional tools mentioned in the README"
echo "4. Set up WezTerm (configuration already stowed)"
echo "5. Consider installing recommended apps and Chrome extensions"
echo "6. Install a Nerd Font (v3.0 or greater) for proper icon display"
echo "7. Install a C compiler for nvim-treesitter (Xcode should provide this)"
echo "8. Set up Obsidian (sync through iCloud)"
echo "9. Consider setting up Karabiner Elements for key remapping"
echo "10. Install the Patched Operator Mono font if desired"
echo
echo "Please restart your terminal or run 'source ~/.config/fish/config.fish' to apply the new fish configuration."
echo "For more detailed setup instructions and customization options, refer to the README in your AquaFiles repository."
