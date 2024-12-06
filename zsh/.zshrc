# If you come from bash you might have to change your $PATH.
# export PATH=$HOME/bin:$HOME/.local/bin:/usr/local/bin:$PATH

# Path to your Oh My Zsh installation.
export ZSH="$HOME/.oh-my-zsh"

# Set name of the theme to load --- if set to "random", it will
# load a random theme each time Oh My Zsh is loaded, in which case,
# to know which specific one was loaded, run: echo $RANDOM_THEME
# See https://github.com/ohmyzsh/ohmyzsh/wiki/Themes
ZSH_THEME="robbyrussell"

plugins=(
  git
  zsh-autosuggestions
  history-substring-search
  zsh-syntax-highlighting
)

source $ZSH/oh-my-zsh.sh

# Zsh Configuration

# SSH Agent Setup
if [ -z "$SSH_AUTH_SOCK" ]; then
    eval "$(ssh-agent -s)"
    export SSH_AUTH_SOCK
    export SSH_AGENT_PID
fi

# Homebrew
eval "$(/opt/homebrew/bin/brew shellenv)"

# Starship Prompt
eval "$(starship init zsh)"

# Zoxide
eval "$(zoxide init zsh)"

# Bun
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"

# Vim key bindings
bindkey -v

export PATH="/bin:$HOME/.local/bin:$HOME/scripts:$HOME/go/bin:$HOME/.bun/bin:$HOME/.deno/bin:/opt/homebrew/postgresql@16/bin:/opt/homebrew/opt/llvm/bin:/opt/homebrew/bin/conda:/opt/homebrew/bin/mamba:$HOME/Library/Application Support/Herd/bin/:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$HOME/.config/composer/vendor/bin:/Users/0xaquawolf/.codeium/windsurf/bin:$PATH"

# PNPM
export PNPM_HOME="/Users/0xaquawolf/Library/pnpm"
if [[ ":$PATH:" != *":$PNPM_HOME:"* ]]; then
    export PATH="$PNPM_HOME:$PATH"
fi

# Global Variables
export LS_COLORS="$(vivid generate catppuccin-mocha)"
export TERM=xterm-256color
export EDITOR=nvim
export VISUAL=nvim
export ESPANSO_CONFIG=~/.config/espanso/
export MANPAGER="sh -c 'col -bx | bat -l man -p'"
export XDG_CONFIG_HOME=~/.config
export BAT_THEME="Catppuccin Mocha"
export BASE_PATH="/Users/aquawolf/Library/Mobile Documents/iCloud~md~obsidian/Documents/vaults/SecondBrain"
export LDFLAGS="-L/opt/homebrew/opt/llvm/lib"
export CPPFLAGS="-I/opt/homebrew/opt/llvm/include"
export JAVA_HOME="/Library/Java/JavaVirtualMachines/zulu-17.jdk/Contents/Home"
export NVM_DIR="$(brew --prefix nvm)"
export ANDROID_HOME="$HOME/Library/Android/sdk"
export CONDA_SUBDIR=osx-arm64
# export C_INCLUDE_PATH="$HOME/.local/share/nvm/v22.11.0/include/node:$C_INCLUDE_PATH"

# FZF Config
export FZF_DEFAULT_COMMAND="fd -H -E '.git'"
export FZF_PREVIEW_FILE_CMD='bat --style=numbers --color=always --line-range :500'

# Aliases
alias vim=nvim
alias c=clear
alias e=exit

# Utils
alias sf='fzf | xargs nvim'
alias rm='rm -i'
alias cp='cp -i'
alias mkdir='mkdir -p'
alias hf='history | fzf'
alias pp='echo $PATH | tr ":" "\n" | fzf'
alias skv='skhd --stop-service && skhd -V'
alias awi='yabai -m query --windows | fx'
alias yt-mp3='yt-dlp -x --audio-format mp3 --audio-quality 0'
alias dlbeat='cd ~/Music/yt-dls/instrumentals/ && yt-dlp -x --audio-format mp3 --audio-quality 0'
alias yt-1080p='yt-dlp -f "bestvideo[height=1080]+bestaudio/best"'
alias create-evm-fish='fish ~/scripts/create-evm-project.fish'
alias create-evm='sh ~/scripts/create-evm-project.sh'

# Directory Navigation
alias ..='cd ..'
alias ...='cd ../..'
alias ....='cd ../../..'

# LS Aliases
alias l='eza --icons=always --git'
alias ls='eza --icons=always --git --git-ignore --ignore-glob="node_modules"'
alias lla='eza -la'
alias ll='ls -l'
alias lt='eza -lAh --icons=always --git --tree --level=4 --long --ignore-glob="node_modules|.git"'

# Config App Aliases
alias nrc='vim ~/.config/nvim/lua/'
alias orc='vim $BASE_PATH/.obsidian.vimrc'
alias zrc='vim ~/.zshrc'
alias erc='vim ~/.config/espanso/'
alias sfs='source ~/.zshrc'
alias nrc='vim ~/.config/nvim/init.lua'
alias arc='vim ~/.alacritty.yml'
alias wrc='vim ~/.config/wezterm/wezterm.lua'
alias skrc='vim ~/.skhdrc'
alias trc='vim ~/.tmux.conf'
alias zelrc='vim ~/.config/zellij/config.kdl'
alias yrc='vim ~/.yabairc'
alias krc='vim ~/AquaFiles/gen-karabiner-config/rules.ts'

# Application Aliases
alias gl=gorilla
alias btop=bpytop
alias nf=neofetch
alias ff=fastfetch
alias cat=bat
alias lg=lazygit
alias ct=cointop
alias top=htop
alias logk='tail -f ~/.local/share/karabiner/log/console_user_server.log'

# Zellij Aliases
alias zel='zellij --layout ~/.config/zellij/layouts/dev.kdl'
alias zls='zellij ls'
alias za='zellij attach'

# GitHub Aliases
alias ghrw='gh repo view --web'

# JavaScript Aliases
alias cap='cat package.json'
alias bd='bun dev'
alias bp='bun run build && bun run preview'
alias bb='bun run build'

# Obsidian Aliases
alias sb='cd "$BASE_PATH" && vim .'

# Homebrew Aliases
alias bi='brew install'
alias bs='brew search'
alias binfo='brew info'

# Python Aliases
alias plf='pip list | fzf'
alias clf='conda list | fzf'
alias pfz='pip freeze > requirements.txt'
alias zelalgo='conda activate algo-trading && zellij --layout ~/Projects/algo-trading/moondev-bootcamp/code/day-2/data-streams/crypto-data-streams.kdl'

# VS Code Aliases
alias surf=windsurf

# Functions
mcd() {
    mkdir -p "$1" && cd "$1"
}

unstow_all() {
    for pkg in */; do
        stow -D "$(basename "$pkg")"
    done
}

stow_all() {
    for pkg in */; do
        stow --adopt "$(basename "$pkg")"
    done
}

toggle_wezterm_font() {
    local CONFIG_FILE="$HOME/AquaFiles/wezterm/.wezterm.lua"
    local FONT_SIZE_18=18
    local FONT_SIZE_20=20

    if [[ -f "$CONFIG_FILE" ]]; then
        local CURRENT_FONT_SIZE=$(awk -F' = ' '/font_size/ {print $2}' "$CONFIG_FILE" | tr -d ',')

        local NEW_FONT_SIZE
        if [[ "$CURRENT_FONT_SIZE" == "$FONT_SIZE_18" ]]; then
            NEW_FONT_SIZE=$FONT_SIZE_20
        elif [[ "$CURRENT_FONT_SIZE" == "$FONT_SIZE_20" ]]; then
            NEW_FONT_SIZE=$FONT_SIZE_18
        else
            echo "Current font size is not 18 or 20. No changes made"
            return
        fi

        sed -i.bak "s/font_size = $CURRENT_FONT_SIZE/font_size = $NEW_FONT_SIZE/" "$CONFIG_FILE"
        echo "Font size updated from $CURRENT_FONT_SIZE to $NEW_FONT_SIZE in $CONFIG_FILE"
    else
        echo "Configuration file $CONFIG_FILE not found"
    fi
}

h() {
    "$@" -h 2>&1 | bat --language=help --style=plain
}

help() {
    "$@" --help 2>&1 | bat --language=help --style=plain
}

where() {
    for cmd in "$@"; do
        if command -v "$cmd" > /dev/null; then
            command -v "$cmd"
        else
            echo "$cmd: command not found"
        fi
    done
}

rds() {
    local directory="${1:-.}"
    echo "Removing .DS_STORE files from $directory"
    find "$directory" -type f -name .DS_STORE -exec rm -f {} +
    echo "ALL .DS_STORE files have been removed from $directory"
}

secure_delete() {
    if [[ $# -ne 1 ]]; then
        echo "Usage: secure_delete <path_to_file>"
        return 1
    fi

    local file_path="$1"

    if [[ ! -f "$file_path" ]]; then
        echo "Error: File not found: $file_path"
        return 1
    fi

    gshred -v -n 3 -z "$file_path"

    if [[ $? -eq 0 ]]; then
        echo "File successfully overwritten and deleted: $file_path"
    else
        echo "Error: Failed to overwrite the file: $file_path"
        return 1
    fi
}

extract_word() {
    echo "$1" | sed -n 's/^[0-9]*) *"\([^"]*\)"/\1/p'
}

yy() {
    local tmp
    tmp=$(mktemp -t "yazi-cwd.XXXXXX")
    yazi "$@" --cwd-file="$tmp"
    if [[ -f "$tmp" ]]; then
        local cwd
        cwd=$(cat "$tmp")
        if [[ -n "$cwd" ]] && [[ "$cwd" != "$PWD" ]]; then
            cd "$cwd"
        fi
        rm -f "$tmp"
    fi
}

killport() {
    if [[ $# -eq 0 ]]; then
        echo "Usage: killport <port_number>"
        return 1
    fi

    local port="$1"
    local pid
    pid=$(lsof -ti :"$port")

    if [[ -z "$pid" ]]; then
        echo "No process found running on port $port"
        return 1
    else
        kill -9 "$pid"
        echo "Process $pid running on port $port has been killed"
    fi
}

heic2jpg() {
    if ! command -v sips &> /dev/null; then
        echo "Error: sips command not found. This function requires macOS."
        return 1
    fi

    if [[ $# -eq 0 ]]; then
        echo "Usage: heic2jpg <file.HEIC> [more files...]"
        return 1
    fi

    for file in "$@"; do
        if [[ ! -f "$file" ]]; then
            echo "Error: File '$file' not found"
            continue
        fi

        if [[ ! "$file" =~ \.HEIC$ ]]; then
            echo "Error: '$file' is not a HEIC file"
            continue
        fi

        local output_file
        output_file="${file%.HEIC}.jpg"

        if sips -s format jpeg "$file" --out "$output_file"; then
            echo "Successfully converted '$file' to '$output_file'"
        else
            echo "Error converting '$file'"
        fi
    done
}

ghinit() {
    if [[ $# -ne 1 ]]; then
        echo "Usage: github-init REPO_NAME"
        return 1
    fi

    local repo_name="$1"
    local github_username
    github_username=$(git config user.name)

    git init
    gh repo create --private "$repo_name"
    git remote add origin "git@github.com:$github_username/$repo_name.git"
    git add .
    git commit -m init
    git push -u origin main
}

# Conda Initialize
if [[ -f /opt/homebrew/Caskroom/miniforge/base/bin/conda ]]; then
    __conda_setup="$('/opt/homebrew/Caskroom/miniforge/base/bin/conda' 'shell.zsh' 'hook' 2> /dev/null)"
    if [ $? -eq 0 ]; then
        eval "$__conda_setup"
    else
        if [ -f "/opt/homebrew/Caskroom/miniforge/base/etc/profile.d/conda.sh" ]; then
            . "/opt/homebrew/Caskroom/miniforge/base/etc/profile.d/conda.sh"
        else
            export PATH="/opt/homebrew/Caskroom/miniforge/base/bin:$PATH"
        fi
    fi
fi

# Rust Environment
if [[ -d "$HOME/.cargo" ]]; then
    export PATH="$HOME/.cargo/bin:$PATH"
fi

export NVM_DIR="$HOME/.nvm"
export PATH="$NVM_DIR/bin:$PATH"
[ -s "$(brew --prefix nvm)/nvm.sh" ] && \. "$(brew --prefix nvm)/nvm.sh"
[ -s "$(brew --prefix nvm)/etc/bash_completion.d/nvm" ] && \. "$(brew --prefix nvm)/etc/bash_completion.d/nvm"

