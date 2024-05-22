# Enable Powerlevel10k instant prompt. Should stay close to the top of ~/.zshrc.
# Initialization code that may require console input (password prompts, [y/n]
# confirmations, etc.) must go above this block; everything else may go below.
if [[ -r "${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-${(%):-%n}.zsh" ]]; then
  source "${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-${(%):-%n}.zsh"
fi

# Created by Zap installer
[ -f "${XDG_DATA_HOME:-$HOME/.local/share}/zap/zap.zsh" ] && source "${XDG_DATA_HOME:-$HOME/.local/share}/zap/zap.zsh"
plug "zsh-users/zsh-autosuggestions"
# plug "zap-zsh/zap-prompt"
plug "zsh-users/zsh-syntax-highlighting"
plug "zsh-users/zsh-history-substring-search"
plug "hlissner/zsh-autopair"
plug "jeffreytse/zsh-vi-mode"
plug "kutsan/zsh-system-clipboard"
plug "romkatv/powerlevel10k"

export LS_COLORS="$(vivid generate catppuccin-mocha)"
export EDITOR='nvim'
export VISUAL='nvim'
export ESPANSO_CONFIG=~/.config/espanso

# Load and initialise completion system
autoload -Uz compinit && compinit

zstyle ':completion:*' matcher-list 'm:{a-z}={A-Za-z}'
zstyle ':completion:*' list-colors "${(s.:.)LS_COLORS}"

# Fig pre block. Keep at the top of this file.

# |====== PATH EXPORTS  ======|
export PATH=$HOME/Library/Python/3.8/bin:$PATH
export PATH=$HOME/.local/bin:$PATH
export PATH=$HOME/.composer/vendor/bin:$PATH #set up for PHP composer
export PATH=$HOME/usr/local/bin:$PATH
export PATH=$HOME/bin:$PATH
export PATH=$HOME/scripts:$PATH
export PATH=$HOME/go/bin:$PATH

# export BAT_THEME="Catppuccin Mocha"

# |====== PNPM  ======|
export PNPM_HOME="/Users/no1/Library/pnpm"
export PATH="$PNPM_HOME:$PATH"

# |====== Yarn  ======|
export YARN_GLOBAL_FOLDER="$FNM_MULTISHELL_PATH/yarn-global"
export YARN_PREFIX="$FNM_MULTISHELL_PATH"

# |====== Bun Config  ======|
[ -s "/Users/no1/.bun/_bun" ] && source "/Users/no1/.bun/_bun"
export BUN_INSTALL="/Users/no1/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"

# |====== Bat Man Page  ======|
export MANPAGER="sh -c 'col -bx | bat -l man -p'"

# |====== ZSH Config  ======|
# ZSH_AUTOSUGGEST_HIGHLIGHT_STYLE='fg=white'
# VI_MODE_SET_CURSOR=true

# |======  Options  ======|

unsetopt BEEP

# |======  History  ======|

HISTFILE="${ZDOTDIR:-$HOME}/.zsh_history"
HISTSIZE=50000
SAVEHIST=50000

setopt AUTO_CD
setopt GLOB_DOTS
setopt NOMATCH
setopt MENU_COMPLETE
setopt EXTENDED_GLOB
setopt INTERACTIVE_COMMENTS
setopt APPEND_HISTORY
setopt BANG_HIST                 # Treat the '!' character specially during expansion.
setopt EXTENDED_HISTORY          # Write the history file in the ":start:elapsed;command" format.
setopt INC_APPEND_HISTORY        # Write to the history file immediately, not when the shell exits.
setopt SHARE_HISTORY             # Share history between all sessions.
setopt HIST_EXPIRE_DUPS_FIRST    # Expire duplicate entries first when trimming history.
setopt HIST_IGNORE_DUPS          # Don't record an entry that was just recorded again.
setopt HIST_IGNORE_ALL_DUPS      # Delete old recorded entry if new entry is a duplicate.
setopt HIST_FIND_NO_DUPS         # Do not display a line previously found.
setopt HIST_IGNORE_SPACE         # Don't record an entry starting with a space.
setopt HIST_SAVE_NO_DUPS         # Don't write duplicate entries in the history file.
setopt HIST_REDUCE_BLANKS        # Remove superfluous blanks before recording entry.
setopt HIST_VERIFY               # Don't execute immediately upon history expansion.

bindkey "^[[A" history-search-backward
bindkey "^[[B" history-search-forward

# |======  Aliases  ======|
#
# Set personal aliases, overriding those provided by oh-my-zsh libs,
# plugins, and themes. Aliases can be placed here, though oh-my-zsh
# users are encouraged to define aliases within the ZSH_CUSTOM folder.
# For a full list of active aliases, run `alias`.
#
alias hl="history 0 | awk '{print $2}' | sort | uniq -c | sort -nr | head -10" # show leaderboard of top commands

alias py="python3"
alias gl="gorilla"
alias esprc="nvim /Users/no1/Library/Application\ Support/espanso/match/base.yml"
alias esr="espanso restart"
alias ubd="open /Users/no1/Library/Application\ Support/Übersicht"

alias vim="nvim" #set default VIM to Neovim
alias lvim="vim"

alias erc="vim ~/.config/espanso"

export STREAM_BG="~/.config/assets/bg/green-screen-bg.jpg"
alias streamOn='osascript -e "tell application \"System Events\" to set picture of every desktop to \"$STREAM_BG\""'

export DESKTOP_BG="~/.config/assets/bg/desktop-bg.jpg"
alias streamOff='osascript -e "tell application \"System Events\" to set picture of every desktop to \"$DESKTOP_BG\""'

# |======  LS replaement  ======|


alias ll="ls -l "
alias ls="eza --icons=always --git-ignore --ignore-glob='node_modules'"
alias la="ls -la"
alias lla="ls -la"
alias lt="ls -lTa"

alias c="clear"
alias e="exit"

# |======  Folder Aliases  ======|
alias btop="bpytop"

# |======  Zellij  ======|
alias zel="zellij --layout ~/.config/zellij/configs/layouts/dev.kdl"
alias zeldc="vim ~/.config/zellij/config/layouts/dev.kdl"

# |======  Kitty  ======|
alias krc="vim ~/.config/kitty/kitty.conf"

# |======  TMUX  ======|
alias tl="tmux ls"
alias tad="tmux attach -d -t"
alias ta="tmux attach -d"
alias ts="tmux new-session -s"
alias tksv="tmux kill-server"
alias tkss="tmux kill-session -t"
alias tmd="tmux detach"
alias stx="tmux source ~/.tmux.conf"

# |======  Misc  ======|
alias nf="neofetch"
alias ff="fastfetch"
alias cat="bat"
alias st="speedtest"
alias lg="lazygit"
alias ct="cointop"

# |======  NPM Commands  ======|
alias nrd="npm run dev -- --open"

# |======  PNPM Commands  ======|
alias pup="pnpm i -g pnpm"
alias pms="pnpm start"
alias pmd="pnpm dev"
alias pmb="pnpm build"
alias pmp="pnpm preview"

# |======  Edit Config  ======|
alias srcz="source ~/.zshrc"
alias zrc="vim ~/.zshrc"
alias nrc="vim ~/.config/nvim/init.lua" # init.lua
alias arc="vim ~/.alacritty.yml" # alacritty
alias wrc="vim ~/.wezterm.lua" # wezterm
alias skrc="vim ~/.skhdrc" # skhdrc
alias trc="vim ~/.tmux.conf" # tmux rc
alias zelrc="vim ~/.config/zellij/config.kdl"
alias yrc="vim ~/.yabairc"

# |======  Karabiners Config ======|
alias krc="vim ~/.config/karabiner/karabiner.json" # karabiner elements
alias logk="tail -f ~/.local/share/karabiner/log/console_user_server.log"

# |====== Laravel Aliases  ======|
alias art="php artisan"
alias artr="php artisan route:list"
alias artm="php artisan migrate"
alias artmf="php artisan migrate:fresh"
alias artmrf="php artisan migrate:refresh"
alias briv="php artisan breeze:install vue --typescript --ssr --pest --dark"

# |======  Bat for man pages  ======|
alias -g -- -h='-h 2>&1 | bat --language=help --style=plain'
alias -g -- --help='--help 2>&1 | bat --language=help --style=plain'

# |======  Github Aliases  ======|
alias ghrw="gh repo view --web"

# |======  Serverless CLI  ======|
# alias ps="pscale"
# alias pcs="pscale connect my-rpg-quest main --port 3309"

alias lpj="vim package.json"
# |======  JS Aliases  ======|
alias cap="cat package.json"
alias bd="bun dev"
alias bp="bun run build && bun run preview"
alias bb="bun run build"

# |======  Edit Config Files  ======|
alias skrc="vim ~/.skhdrc"

# |======  Second Brain Notes  ======|
alias sb="cd /Users/no1/Library/Mobile\ Documents/iCloud~md~obsidian/Documents/NeoDocs/SecondBrain && vim ."

# |======  Python  ======|
alias py="python3"
alias sdapi="./webui.sh --precision full --no-half --api --no-download-sd-model"

# |======  Pocketbase  ======|
alias pb="./pocketbase"
alias pbs="./pocketbase serve"

# |====== Prisma  ======|
alias ps="prisma studio"

# |====== SQL  ======|
alias sql="sqlite3"

alias pam="php artisan migrate:refresh --seed"

alias cd="z"

alias krs="launchctl kickstart -k gui/`id -u`/org.pqrs.karabiner.karabiner_console_user_server"

alias sf="fd --type f --hidden --exclude .git | fzf | xargs nvim"

# |====== Eval ======|
# eval "$(/opt/homebrew/bin/brew shellenv)"

eval "$(fnm env --use-on-cd)"
eval "$(zoxide init zsh)"
eval "$(fzf --zsh)"
# eval "$(starship init zsh)"

# |====== Functions  ======|

mcd() {
  mkdir -p "$1" && cd "$1"
}
# Run zellij at the start of the shell

# eval "$(zellij setup --generate-auto-start zsh)"


# # Herd injected NVM configuration
# export NVM_DIR="/Users/no1/Library/Application Support/Herd/config/nvm"
# [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
#
# [[ -f "/Applications/Herd.app/Contents/Resources/config/shell/zshrc.zsh" ]] && builtin source "/Applications/Herd.app/Contents/Resources/config/shell/zshrc.zsh"
#
# # Herd injected PHP binary.
# export PATH="/Users/no1/Library/Application Support/Herd/bin/":$PATH
#
#
# # Herd injected PHP 8.2 configuration.
# export HERD_PHP_82_INI_SCAN_DIR="/Users/no1/Library/Application Support/Herd/config/php/82/"

# To customize prompt, run `p10k configure` or edit ~/.p10k.zsh.
[[ ! -f ~/.p10k.zsh ]] || source ~/.p10k.zsh
