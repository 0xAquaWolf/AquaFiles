#!/bin/bash
# this script is going to be used to update karabiners json
# CD into karabiners repo dir
pushd ~/repos/karabiner/
# this script will build the file
echo "Building Karabiners.json config file"
yarn run build
# then it will delete an old file
pushd ~/.config/karabiner/
echo "Deleting old karabiner.json config file"
rm -rf karabiner.json
# stow the new files
pushd ~/.dotfiles/
echo "Stowing Karabiners"
stow karabiner

echo "Removing all directories from stack popd"
# Pop all directories off of the stack
popd
popd
popd

echo "Restarting karabiner service"
# restart the karabiners service
launchctl kickstart -k gui/$(id -u)/org.pqrs.karabiner.karabiner_console_user_server
