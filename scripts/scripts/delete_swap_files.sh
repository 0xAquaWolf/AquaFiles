#!/bin/bash
# delete_swap_files.sh: Script to delete Vim swap files

NVIM_SWAP_DIR="${HOME}/.local/state/nvim/swap"

# Check if a directory is provided as an argument

if [ -z "$1" ]; then
	TARGET_DIR=$NVIM_SWAP_DIR
else
	TARGET_DIR="$1"
fi

# Ensure the target directory exists
if [ ! -d "$TARGET_DIR" ]; then
	echo "ERROR: Directory $TARGET_DIR does not exist."
	exit 1
fi

find "$TARGET_DIR" -type f -name "*.swp" -delete

echo "All neovim swap files have been deleted from $TARGET_DIR"
