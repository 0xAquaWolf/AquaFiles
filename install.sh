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
    if stow --adopt "$config"; then
      echo "$config configuration successfully stowed."
    else
      error "Failed to stow $config configuration"
    fi
  done

  cd "$SCRIPT_DIR" || error "Failed to change back to the original directory"
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

# Install cask applications
echo "Installing applications..."
cask_apps="onepassword keyboardcleantool obsidian raycast arc cleanshot iina stremio discord telegram whatsapp figma marta chromium keycastr obs elgato-stream-deck"

for cask in $cask_apps; do
  display_name=$(get_display_name "$cask")
  install_app "$display_name" "$cask"
done

# Install Rust
install_rust

# Install cli tools
echo "Installing essential tools..."
tools="neovim zellij stow fzf wezterm lazygit ripgrep fd pipx go espanso ffmpeg yt-dlp vivid blackhole-16ch fx bpytop fastfetch eza bat delta oven-sh/bun/bun"
for tool in $tools; do
  if brew list "$tool" &>/dev/null; then
    echo "$tool is already installed."
  else
    brew install "$tool" || error "Failed to install $tool"
  fi
done

setup_nvm() {
  echo "Checking NVM setup..."

  # Function to check if fish plugin is installed
  check_fish_plugin() {
    local plugin_name="$1"
    local plugin_path="$2"
    if [ -d "$plugin_path" ]; then
      echo "$plugin_name is already installed"
      return 0
    fi
    return 1
  }

  # Check NVM installation
  if [ -d "$HOME/.nvm" ] && command -v nvm &>/dev/null; then
    echo "NVM is already installed and configured"
  else
    echo "Installing NVM..."
    brew install nvm || error "Failed to install NVM"
  fi

  # Check Oh-My-Fish installation
  if [ -d "$HOME/.local/share/omf" ]; then
    echo "Oh-My-Fish is already installed"
  else
    echo "Installing Oh-My-Fish..."
    curl -L https://get.oh-my.fish | fish || error "Failed to install Oh-My-Fish"
  fi

  # Check Fisher installation
  if command -v fisher &>/dev/null; then
    echo "Fisher is already installed"
  else
    echo "Installing Fisher..."
    brew install fisher || error "Failed to install Fisher"
  fi

  # Check NVM plugins
  echo "Checking NVM plugins for Fish..."

  # Check Oh-My-Fish NVM plugin
  if ! check_fish_plugin "Oh-My-Fish NVM plugin" "$HOME/.local/share/omf/pkg/nvm"; then
    echo "Installing NVM plugin for Oh-My-Fish..."
    fish -c "omf install nvm"
  fi

  # Check Fisher NVM plugin
  if ! check_fish_plugin "Fisher NVM plugin" "$HOME/.config/fish/conf.d/nvm.fish"; then
    echo "Installing NVM plugin for Fisher..."
    fish -c "fisher install jorgebucaran/nvm.fish"
  fi

  # Check NVM directory configuration in Fish config
  local fish_config="$HOME/.config/fish/config.fish"
  if grep -q "set -gx NVM_DIR" "$fish_config"; then
    echo "NVM configuration already exists in Fish config"
  else
    echo "Adding NVM configuration to Fish config..."
    echo "
# NVM configuration
set -gx NVM_DIR (brew --prefix nvm)
" >>"$fish_config"
  fi

  echo "NVM setup check completed"
}

# Check if borders is installed
if ! brew list borders &>/dev/null; then
  brew tap FelixKratz/formulae
  brew install borders
else
  echo "borders is already installed."
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

setup_nvm

# Stow other configurations
echo "Stowing other configurations..."
stow_configs "fish" "git" "zellij" "yabai" "skhd" "wezterm" "bat" "espanso"

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
echo "10. Set up Node.js version using 'nvm install <version>' and 'nvm use <version>'"
echo
echo "Please restart your terminal or run 'source ~/.config/fish/config.fish' to apply the new fish configuration."
echo "For more detailed setup instructions and customization options, refer to the README in your AquaFiles repository."
