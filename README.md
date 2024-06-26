# AquaFiles (dotfiles)

> Plain text configs for bootstrapping my (PDE) Personal Development Enviroment.

My primary operating system is macOS, but I do use Linux sometimes... (arch, btw!)

**Feel free to try out my dotfiles or use them as inspiration!** If you have a
suggestion, improvement or question, please open an issue or PR!

## Design Principles

- Open-Source
- [Flow State](<https://en.wikipedia.org/wiki/Flow_(psychology)>)
- Minimalisim
- Keyboard Homerow Centric
- Design & astetics
- Productivity (minimize distractions)
- Form & Function (beauty and action)
- Portable
- Bleeding Edge

## Follow the Journey

Streaming the creation of this repo and any other future projects on youtube.
<br />
<br />
[0xAquaWolf YouTube Channel](https://youtube.com/playlist?list=PLwbt1uBf9iqArccoEXrIB_ZO0d86rECgc&si=GRBhNj0w_ZW4XwIt)

## Screenshots

> Lazyvim Welcome screen

![lazyvim welcome screen](./assets/lazyvim-welcome-aquawolf.jpg)

> Yabai bsp grid with 5 cmatrix running

![yabai demo with cmatrix 5 grid](./assets/yabai-demo-cmatrix-5-grid.jpg)

> Zellij fastfetch, cmatrix, htop

![zellij-in-action](./assets/zellij-in-action.jpg)

> Zellij Neovim htop cmatrix

![zellij-neovim-htop-cmatrix](./assets/zellij-neovim-htop-cmatrix.jpg)

> Zellij welcome screen

![zellij-welcome-screen](./assets/zellij-welcome-screen.jpg)

<table>
  <tr>
    <td>
      <img src="https://github.com/images/icons/emoji/unicode/26a0.png" alt="warning" style="float: left; margin-right: 10px; width: 20px; height: 20px;">
      <b>WARNING</b>
    </td>
  </tr>
  <tr>
    <td colspan="2">
      <b>These dotfiles are for my own personal use and i update them very frequently. If you want to use them: fork the repo, review the code and take what you need from it. Use at your own risk!
      </b>
    </td>
  </tr>
</table>

## Apps i use

### MacOS (Content creation, Writing, Programming)

- [Wezterm](https://wezfurlong.org/wezterm/) - Terminal
- [Raycast](https://www.raycast.com/) - App Launcher
- [Obsidian](https://obsidian.md/) - Sync through iCloud
- [Yabai](https://github.com/koekeishiya/yabai) - Window Manager
- [SKHD](https://github.com/koekeishiya/skhd) - Keyboard Shortcut Manager
- [Karabiner Elements](https://karabiner-elements.pqrs.org/) - Hypermod and sublayers
- [Shortcat](https://shortcatapp.com/) - Vim for the desktop
- [Homebrew](https://brew.sh/) - Package manager
- [KeyCastr](https://github.com/keycastr/keycastr) - For keyboard casting of shortcuts

### Chrome Extensions

- [Wappalyzer](https://www.wappalyzer.com/)
- [Dark Reader](https://darkreader.org/) - with Catppuccin Mocha theme
- [uBlock Origin](https://ublockorigin.com/)
- [Vimium](https://vimium.github.io/)
- [1Password](https://1password.com/)
- [Undistracted](https://undistracted.app/)
- [Bypass Paywalls](https://github.com/iamadamdev/bypass-paywalls-chrome)

### Desktop Apps

- [Ableton Live 11](https://www.ableton.com/en/live/) - DAW
- [Affinity Photo](https://affinity.serif.com/en-us/photo/)
- [Android File Transfer](https://www.android.com/filetransfer/)
- [Binaural](https://apps.apple.com/us/app/binaural-beats-generator/id1487743559) - Binaural beats
- [LuLu](https://objective-see.org/products/lulu.html) - Security and network traffic blocker
- [CleanShot X](https://cleanshot.com/)
- [Pika](https://superhighfives.com/pika) - for designing and color picking
- [Gestimer](http://maddin.io/gestimer/)
- [IINA](https://iina.io/) - Video player
- [KeyboardCleanTool](https://folivora.ai/keyboardcleantool)
- [Audio Hijack](https://rogueamoeba.com/audiohijack/)
- [Memory Clean 3](https://fiplab.com/apps/memory-clean-for-mac)
- [Parallels](https://www.parallels.com/)
- [Rize](https://rize.io/) - Productivity tracker for macOS
- [Screen Studio](https://www.screen.studio/)
- [ScreenFlow](https://www.telestream.net/screenflow/)
- [TablePlus](https://tableplus.com/) - Database manager
- [The Unarchiver](https://theunarchiver.com/)
- [Wondershare Recoverit](https://recoverit.wondershare.com/)
- [xScope](https://xscopeapp.com/) - A set of tools for UI/UX Designers
- [Hidden Bar](https://github.com/dwarvesf/hidden)

## Contents

- Neovim config
- zellij config
- git config
- fish config
- yabai config

### Requirements

- Neovim >= **0.9.0** (needs to be built with **LuaJIT**)
- Git >= **2.19.0** (for partial clones support)
- [LazyVim](https://www.lazyvim.org/)
- a [Nerd Font](https://www.nerdfonts.com/)(v3.0 or greater) **_(optional, but needed to display some icons)_**
- [lazygit](https://github.com/jesseduffield/lazygit) **_(optional)_**
- a **C** compiler for `nvim-treesitter`. See [here](https://github.com/nvim-treesitter/nvim-treesitter#requirements)
- for [telescope.nvim](https://github.com/nvim-telescope/telescope.nvim) **_(optional)_**
  - **live grep**: [ripgrep](https://github.com/BurntSushi/ripgrep)
  - **find files**: [fd](https://github.com/sharkdp/fd)
- a terminal that support true color and *undercurl*:
  - [kitty](https://github.com/kovidgoyal/kitty) **_(Linux & Macos)_**
  - [wezterm](https://github.com/wez/wezterm) **_(Linux, Macos & Windows)_**
  - [alacritty](https://github.com/alacritty/alacritty) **_(Linux, Macos & Windows)_**
  - [iterm2](https://iterm2.com/) **_(Macos)_**
- [Operator Mono](https://github.com/0xAquaWolf/AquaFiles/tree/main/fonts)

### Neovim setup

### yabai Setup

### fish Setup

### neovim Setup

### Zellij Setup

### skhd Setup

### git Setup

### karabiners Setup

## Todo List

- [x] add links for apps i use
- [ ] yabai setup
- [ ] fish setup
- [ ] neovim setup
- [ ] Zellij setup
- [ ] git setup
- [ ] skhd setup
- [ ] karabiners setup
