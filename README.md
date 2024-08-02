# AquaFiles (dotfiles)

> Plain text configs for bootstrapping my (PDE) Personal Development Enviroment.

My primary operating system is macOS, but I do use Linux sometimes... (arch, btw!)

**Feel free to try out my dotfiles or use them as inspiration!** If you have a
suggestion, improvement or question, please open an issue or PR!

<!-- ## Demo Video (coming soon) -->

## Design Principles

- [Open-Source](https://opensource.org/osd)
- [Flow State](<https://en.wikipedia.org/wiki/Flow_(psychology)>)
- [Minimalism](https://en.wikipedia.org/wiki/Minimalism)
- [Keyboard Home Row Centric](https://en.wikipedia.org/wiki/Touch_typing#Home_row)
- [Design & Aesthetics](https://en.wikipedia.org/wiki/Design)
- [Productivity (minimize distractions)](https://en.wikipedia.org/wiki/Productivity#Productivity_improving_technologies)
- [Form & Function (beauty and action)](https://en.wikipedia.org/wiki/Form_follows_function)
- [Portable](https://en.wikipedia.org/wiki/Portable_computing)
- [Bleeding Edge](https://en.wikipedia.org/wiki/Bleeding_edge_technology)

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

### Requirements

- [Deno](https://deno.land)
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

<!-- ### macOS setup -->

### Fish Shell Setup

- install fish shell through homebrew

```bash
brew install fish
```

- delete config folder

```bash
rm -rf ~/.config/fish
```

- `cd` into AquaFiles

```bash
cd ~/AquaFiles/
```

- stow the config

```bash
stow wezterm
```

### WezTerm Setup

install wezterm through homebrew

```bash
brew install --cask wezterm
```

- `cd` into AquaFiles

```bash
cd ~/AquaFiles/
```

- stow the config

```bash
stow wezterm
```

### Neovim setup

- install deno for (peek.nvim)

```bash
curl -fsSL https://deno.land/install.sh | sh
```

- Backup previous config

```bash
mv ~/.config/nvim ~/.config/nvim.bak
mv ~/.local/share/nvim ~/.local/share/nvim.bak
```

- Install LazyVim

```
git clone https://github.com/LazyVim/starter ~/.config/nvim
```

- Remove the .git folder, so you can add it to your own repo later

```bash
rm -rf ~/.config/nvim/.git
```

- install deno for peek.nvim

```bash
curl -fsSL https://deno.land/install.sh | sh
```

- clone dotfiles _(needs to be cloned in root directory for GNU Stow work)_

```bash
git clone https://github.com/0xAquaWolf/AquaFiles ~/
```

- delete lua directory in nvim

```bash
rm -rf ~/.config/nvim/lua/*
```

- `cd` into AquaFiles

```bash
cd ~/AquaFiles/
```

- if on macOS (you might need to delete DS_Store files)

```bash
dir="${1:-.}" && echo "Removing .DS_STORE files from $dir" && find "$dir" -type f -name .DS_STORE -delete && echo "ALL .DS_STORE files have been removed from $dir"
```

- stow lazyvim

```bash
stow nvim
```

- startup neovim

```bash
nvim
```

- sit back and enjoy the installation
  <!---->
  <!-- ### Zellij setup -->
  <!---->
  <!-- ### yabai setup -->
  <!---->
  <!-- ### skhd setup -->
  <!---->
  <!-- ### git setup -->
  <!-- ### karabiner elements setup -->

## Streaming Live Daily on YouTube

Chronicling my journey of continuous learning and exploration in cutting-edge technologies including:

- Web3
- AI/ML
- Cybersecurity
- Algo Trading

Join me as I document my growth, share insights, and delve into the ever-evolving world of tech innovation.
<br />
<br />
[0xAquaWolf YouTube Channel](https://youtube.com/playlist?list=PLwbt1uBf9iqArccoEXrIB_ZO0d86rECgc&si=GRBhNj0w_ZW4XwIt)

<!-- Add an image that is clickable that links to my channel -->

## Apps i use

### MacOS (Content creation, Writing, Programming)

- [Wezterm](https://wezfurlong.org/wezterm/) - Terminal
- [Homebrew](https://brew.sh/) - Package manager
- [Raycast](https://www.raycast.com/) - App Launcher
- [Obsidian](https://obsidian.md/) - Sync through iCloud
- [Yabai](https://github.com/koekeishiya/yabai) - Window Manager
- [SKHD](https://github.com/koekeishiya/skhd) - Keyboard Shortcut Manager
- [Karabiner Elements](https://karabiner-elements.pqrs.org/) - Hypermod and sublayers
- [Shortcat](https://shortcatapp.com/) - Vim for the desktop
- [KeyCastr](https://github.com/keycastr/keycastr) - For keyboard casting of shortcuts
- Visual Studio code (with vim link settings)
  - Vim (Vim motions FTW!!!!)
  - Catppuccin for VSCode
  - Catppuccin Icons for VSCode
  - Clock (Hide ENV Variables on stream)
  - Code Runner
  - DotENV
  - Python
  - Python Debugger
  - Ruff (NextGen Python Linter & Formatter)
  - TODO Highlight

### Chrome Extensions

- [Vimium](https://vimium.github.io/)
- [Wappalyzer](https://www.wappalyzer.com/)
- [Dark Reader](https://darkreader.org/) - with Catppuccin Mocha theme
- [uBlock Origin](https://ublockorigin.com/)
- [1Password](https://1password.com/)
- [Undistracted](https://undistracted.app/)
- [Bypass Paywalls](https://github.com/iamadamdev/bypass-paywalls-chrome)

### Desktop Apps

- [Ableton Live 12](https://www.ableton.com/en/live/) - DAW
- [Affinity Photo](https://affinity.serif.com/en-us/photo/)
- [Android File Transfer](https://www.android.com/filetransfer/)
- [Binaural](https://apps.apple.com/us/app/binaural-beats-generator/id1487743559) - Binaural beats
- [LuLu](https://objective-see.org/products/lulu.html) - Security and network traffic blocker
- [CleanShot X](https://cleanshot.com/)
- [Gestimer](http://maddin.io/gestimer/)
- [IINA](https://iina.io/) - Video player
- [KeyboardCleanTool](https://folivora.ai/keyboardcleantool)
- [Audio Hijack](https://rogueamoeba.com/audiohijack/)
- [Memory Clean 3](https://fiplab.com/apps/memory-clean-for-mac)
- [Parallels](https://www.parallels.com/)
- CrossOver
- [Rize](https://rize.io/) - Productivity tracker for macOS
- [Screen Studio](https://www.screen.studio/)
- [ScreenFlow](https://www.telestream.net/screenflow/)
- [TablePlus](https://tableplus.com/) - Database manager
- [The Unarchiver](https://theunarchiver.com/)
- [xScope](https://xscopeapp.com/) - A set of tools for UI/UX Designers
- Bartender 5 (macOS Menubar management)
- Keka (compression and uncompression)
- Voicemod
- OBS
- Kaleidoscope (File Diff)
- AlDente (macOS Batter Manager)
- Dynamic Wallpaper
- ColorSlurp (Color Picker)
- Elgato Stream Deck
- Farrago (Soundboard)
- iTubeGo (YouTube Downloader)

## Join the Community on Discord

AquaWolf Academy: https://discord.gg/wzPBjEcn87

## Todo List

- [x] add links for apps i use
- [x] neovim setup
- [ ] fish setup
- [ ] git setup
- [ ] Zellij setup
- [ ] yabai setup
- [ ] skhd setup
- [ ] karabiners setup
- [ ] add a quick start guide (use this for video)
- [ ] add a video showing how to bootstrap the install and using the config
