#!/bin/bash

pkill Dock
sudo nvram boot-args=-arm64e_preview_abi
# reboot
sudo yabai --uninstall-sa
sudo yabai --install-sa
sudo yabai --load-sa
