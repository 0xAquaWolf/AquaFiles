# paths
set fish_greeting ""
set fish_key_bindings fish_vi_key_bindings

# paths
fish_add_path /bin
fish_add_path ~/.local/bin
fish_add_path ~/scripts
fish_add_path ~/go/bin

# global variables
# set -gx TERM xterm-256color
set -Ux EDITOR nvim
set -gx VISUAL nvim
set -g ESPANSO_CONFIG ~/.config/espanso/
set -x LS_COLORS (vivid generate catppuccin-mocha)
set -Ux MANPAGER "sh -c 'col -bx | bat -l man -p'"

# FZF Config
set -g FZF_DEFAULT_COMMAND 'ag -g "" --hidden --ignore .git'
set -g FZF_PREVIEW_FILE_CMD 'Bat --style=numbers --color=always --line-rage :500'
set -g FZF_LEGACY_KEYBINDINGS 0
# theme

set -g theme_color_scheme "Catppuccin Mocha"
set -g fish_prompt_pwd_dir_length 1
set -g theme_display_user yes
set -g theme_hide_hostname no
set -g theme_hostname always

# |====== Aliases  ======|
alias vim nvim
alias c clear
alias e exit

# |====== Utils  ======|
alias pp "string split ':' $PATH | fzf" # print path
alias sf "fd --type f --hidden --exclude .git | fzf | xargs nvim"
alias rm "rm -i"
alias cp "cp -i"
alias mkdir "mkdir -p"
alias h history
alias which "type -a"

alias .. "cd .."
alias ... "cd ../.."

# |======  LS  ======|
alias ls "eza --icons=always --git-ignore --ignore-glob='node_modules'"
alias lla "ls -la"
alias ll "ls -l"
alias lt "ls -lTa"

# |======  Config App  ======|
alias nrc "vim ~/.dotfiles/nvim/.config/nvim/init.lua"
alias frc "vim ~/.config/fish/config.fish" # fish shell rc
alias erc "vim ~/.config/espanso/"
alias sfs "source ~/.config/fish/config.fish" # source fish shell
alias nrc "vim ~/.config/nvim/init.lua"
alias arc "vim ~/.alacritty.yml"
alias wrc "vim ~/.wezterm.lua"
alias skrd "vim ~/.skhdrc"
alias trc "vim ~/.tmux.conf"
alias zelrc "vim ~/.config/zellij/config.kdl"
alias yrc "vim ~/.yabairc"
alias krc "vim ~/.config/karabiner/karabiner.json"
alias zshrc "vim ~/.config/.zshrc"

# |======  Applications  ======|
alias gl gorilla
alias btop bpytop
alias nf neofetch
alias ff fastfetch
alias cat bat
alias lg lazygit
alias ct cointop
alias top htop
alias zel "zellij --layout ~/.config/zellij/configs/layouts/dev.kdl"
alias logk "tail -f ~/.local/share/karabiner/log/console_user_server.log"

# |======  Github ======|
alias ghrw "gh repo view --web"

# |======  JavaScrip ======|
alias cap "cat package.json"
alias bd "bun dev"
alias bp "bun run build && bun run preview"
alias bb "bun run build"


# |======  Folders ======|
alias sb "cd /Users/no1/Library/Mobile\ Documents/iCloud~md~obsidian/Documents/NeoDocs/SecondBrain && vim ."

# |======  Folders ======|


# |======  Functions ======|

function mcd
    set dir $argv[1]
    mkdir -p $dir
    cd $dir
end

function unstow_all
    for pkg in */
        stow -D (basename $pkg)
    end
end

function stow_all
    for pkg in */
        stow --adopt (basename $pkg)
    end
end

# Function for intercepting the -h option on most prograjms
function h
    command $argv -h 2>&1 | bat --language=help --style=plain
end

function help
    command $argv --help 2>&1 | bat --language=help --style=plain
end

eval (/opt/homebrew/bin/brew shellenv)

fzf --fish | source
zoxide init fish | source
starship init fish | source

# switch statement that figures out your os and uses the correct config 
# switch (uname)
#   case Darwin
#     source (dirname (status --current-filename))/config-osx.fish
#   case Linux
#     source (dirname (status --current-filename))/config-linux.fish
#   case '*'
#     source (dirname (status --current-filename))/config-windows.fish
# end
#
# set LOCAL_CONFIG (dirname (status --current-filename))/config-local.fish
# if test -f $LOCAL_CONFIG
# end
#   source $LOCAL_CONFIG
