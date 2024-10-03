#!/bin/bash

# List of VS Code extensions to install
extensions=(
  "bradlc.vscode-tailwindcss"
  "catppuccin.catppuccin-vsc"
  "catppuccin.catppuccin-vsc-icons"
  "christian-kohler.path-intellisense"
  "csstools.postcss"
  "dbaeumer.vscode-eslint"
  "esbenp.prettier-vscode"
  "formulahendry.auto-rename-tag"
  "johnpapa.vscode-cloak"
  "mikestead.dotenv"
  "rangav.vscode-thunder-client"
  "vscodevim.vim"
  "yoavbls.pretty-ts-errors"
)

# Install each extension
for extension in "${extensions[@]}"; do
  echo "Installing $extension..."
  code --install-extension "$extension" --force
done

echo "All extensions installed."
