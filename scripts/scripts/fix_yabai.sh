#!/bin/bash

pkill Dock
sudo nvram boot-args=-arm64e_preview_abi
# reboot
sudo yabai --uninstall-service
sudo yabai --install-service
sudo yabai --load-sa
