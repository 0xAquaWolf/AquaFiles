#!/bin/bash

# Get the IDs of the 3 current windows in the space
windows=$(yabai -m query --windows --space)

ids=($(echo $windows | jq -r '.[] | select(.id) | .id' | head -n 3))

# Calculate the screen width and the width of each column
display_width=$(yabai -m query --displays --display | jq '.frame.w')

column_width=$(($display_width / 3))

# Set the positions and sizes of the 3 windows
for i in "${!ids[@]}"; do
	x=$(($i * $column_width))
	y=0
	width=$column_width
	height=$(yabai -m query --window --window "${ids[$i]}" | jq '.frame.h')
	yabai -m window "${ids[$i]}" --move "$x:$y" --resize "$width:$height"
done

# Set the layout to bsp
yabai -m space --layout bsp
