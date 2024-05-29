#!/bin/zsh

# Install xCode cli tools
echo "Installing commandline tools..."
xcode-select --install

# Homebrew
## Install
echo "Installing Brew..."
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew analytics off

## Taps
echo "Tapping Brew..."
brew tap homebrew/cask-fonts
brew tap FelixKratz/formulae
brew tap koekeishiya/formulae

# check the current nvram boot arms are corrent
# if not set and reboot
# if corrent continue the script
# i want to set it up so that i can run this script twice

# Display a message to the users asking permission to reboot machine and telling them about the process that is envolved in using the install script

# add arm64 to boot flags
nvram boot-arg '-arm64e_preview_abi' # reboot computer afterwards
reboot now

# install homebrew
# make sure brew is being installed in the correct directory
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

echo "Installing Brew Formulae..."

brew install stow \
fish \
neovim \
starship \
zoxide \
fnm \
vivid \
eza \
fzf \
rg \
bat \
fastfetch \
fd \
lazygit \
wget \
zellij \
gh \
httpie \
espanso \
speedtest-cli \
htop \
bpytop \
mailhog \
gorilla-cli \
git-delta


# add fish to /etc/shells -> /usr/local/bin/fish
sudo echo "/opt/homebrew/bin/fish" | sudo tee -a /etc/shells

chsh -s /usr/local/bin/fish # change default terminal shell

# create a dir name repos on user root
mkdir ~/repos # Create repos dir
cd ~/repos    # cd into repos

git clone https://github.com/0xAquaWolf/AquaFiles.git $HOME # ~/
# clone AquaFiles into repo directory
# make sure to install your dotfile in the root of the user ~/
# if not GNU Stow will not work corrently

# Run this before Stowing Dotfiles
rm -rf ~/.config/fish/config.fish
rm -rf ~/.config/fish/fish_variables

cd ~/AquaFiles
stow fish

source ~/.config/fish/config.fish

cd ~/AquaFiles
stow git
stow wezterm

# Install lazyvim
git clone https://github.com/LazyVim/starter ~/.config/nvim

# remove default lua files to make room for symlinks
rm -rf ~/.config/nvim/lua/*

cd ~/AquaFiles # dotfiles

stow nvim

# install chrome extension
git clone git@github.com:iamadamdev/bypass-paywalls-chrome.git

# Stow
stow bat
bat cache --clear
bat cache --build

# Installing Yabai
brew install koekeishiya/formulae/yabai

cd ~/AquaFiles
stow yabai

# VERY IMPORTANT if not the next command wont register
# prepare to add yabai to sudoers and include the dir in the sudoers path
echo '#includedir /private/etc/sudoers.d' | sudo tee -a /etc/sudoers

# add yabai to the sudoers file
# make sure that if you uninstall yabai at any moment then you need to rehash the binary
# learn more here https://github.com/koekeishiya/yabai/wiki/Installing-yabai-(latest-release)#configure-scripting-addition
echo "$(whoami) ALL=(root) NOPASSWD: sha256:$(shasum -a 256 $(which yabai) | cut -d " " -f 1) $(which yabai) --load-sa" | sudo tee /private/etc/sudoers.d/yabai

yabai --install-service
yabai --start-service
sudo yabai --load-sa

# reboot to confrim everything is working correctly

brew install koekeishiya/formulae/skhd
cd ~/AquaFiles
stow skhd
skhd --install-service
skhd --start-service

# Install Sketchy Bar
./install_sketchybar.sh
