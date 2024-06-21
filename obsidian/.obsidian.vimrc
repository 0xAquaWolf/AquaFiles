""""""""""""""""""""""
" Leader
""""""""""""""""""""""
" let mapleader=,
" can't set leaders in Obsidian vim, so the key just has to be used consistently.
" However, it needs to be unmapped, to not trigger default behavior: https://github.com/esm7/obsidian-vimrc-support#some-help-with-binding-space-chords-doom-and-spacemacs-fans
unmap ,

" map ; to : in normal mode, so that I don’t rely on the shift key
" nmap ; :

" no modifier key for jumping to next word
nmap + *

" Have j and k navigate visual lines rather than logical ones
" nmap j gj
" nmap k gk
"
" I like using H and L for beginning/end of line
nmap H ^
nmap L $
" nmap J 5j
" nmap K 5k

" Moving to next/prev paragraph
nmap [ {
nmap ] }

" Yank to system clipboard
set clipboard=unnamed

" Surround
exmap surround_wiki surround [[ ]]
exmap surround_double_quotes surround " "
exmap surround_single_quotes surround ' '
exmap surround_brackets surround ( )
exmap surround_square_brackets surround [ ]
exmap surround_curly_brackets surround { }
exmap surround_chinese_double_quotes surround “ ”
exmap surround_chinese_brackets surround 「 」

" NOTE: must use 'map' and not 'nmap'
map [[ :surround_wiki
nunmap s
vunmap s
map s" :surround_double_quotes
map s' :surround_single_quotes
map s( :surround_brackets
map s) :surround_brackets
map s[ :surround_square_brackets
map s{ :surround_curly_brackets
map s} :surround_curly_brackets
" Surround 中文双引号
map s] :surround_chinese_brackets
map s\ :surround_chinese_brackets
map ss :surround_chinese_double_quotes
map sy :surround_chinese_double_quotes

" Surround Admonition https://github.com/esm7/obsidian-vimrc-support/discussions/146
exmap CodeBlockAdmonitionNote obcommand code-block-from-selection:17f30753-d5f4-4953-abed-5027a25ede58
map san :CodeBlockAdmonitionNote
exmap CodeBlockSelectionAdmonitionNote jscommand { editor.setSelections([selection]); this.app.commands.commands['code-block-from-selection:17f30753-d5f4-4953-abed-5027a25ede58'].callback() }
vmap san :CodeBlockSelectionAdmonitionNote

exmap CodeBlockAdmonitionBrainstorm obcommand code-block-from-selection:36a8b91d-c4f1-4ac4-999c-7bfc53c998c1
map sab :CodeBlockAdmonitionBrainstorm
exmap CodeBlockSelectionAdmonitionBrainstorm jscommand { editor.setSelections([selection]); this.app.commands.commands['code-block-from-selection:36a8b91d-c4f1-4ac4-999c-7bfc53c998c1'].callback() }
vmap sab :CodeBlockSelectionAdmonitionBrainstorm

exmap CodeBlockAdmonitionQuote obcommand code-block-from-selection:91dc799c-4f7e-4d75-9cde-d9e6db990a5a
map saq :CodeBlockAdmonitionQuote
exmap CodeBlockSelectionAdmonitionQuote jscommand { editor.setSelections([selection]); this.app.commands.commands['code-block-from-selection:91dc799c-4f7e-4d75-9cde-d9e6db990a5a'].callback() }
vmap saq :CodeBlockSelectionAdmonitionQuote

exmap CodeBlockAdmonitionContext obcommand code-block-from-selection:cb332ef3-8053-42b0-88c9-a233e6dae6d0
map sac :CodeBlockAdmonitionContext
exmap CodeBlockSelectionAdmonitionContext jscommand { editor.setSelections([selection]); this.app.commands.commands['code-block-from-selection:cb332ef3-8053-42b0-88c9-a233e6dae6d0'].callback() }
vmap sac :CodeBlockSelectionAdmonitionContext

exmap CodeBlockAdmonitionRoutine obcommand code-block-from-selection:31f32950-d8df-4d8a-9ca3-91a34d2a67ab
map sar :CodeBlockAdmonitionRoutine
exmap CodeBlockSelectionAdmonitionRoutine jscommand { editor.setSelections([selection]); this.app.commands.commands['code-block-from-selection:31f32950-d8df-4d8a-9ca3-91a34d2a67ab'].callback() }
vmap sar :CodeBlockSelectionAdmonitionRoutine

exmap CodeBlockAdmonitionThink obcommand code-block-from-selection:655b28f0-353f-479e-bc5a-c0b422b987c9
map sat :655b28f0-353f-479e-bc5a-c0b422b987c9
exmap CodeBlockSelectionAdmonitionThink jscommand { editor.setSelections([selection]); this.app.commands.commands['code-block-from-selection:655b28f0-353f-479e-bc5a-c0b422b987c9'].callback() }
vmap sat :CodeBlockSelectionAdmonitionThink

" Emulate Folding https://vimhelp.org/fold.txt.html#fold-commands
" exmap togglefold obcommand editor:toggle-fold
" nmap zo :togglefold
"
" exmap unfoldall obcommand editor:unfold-all
" nmap zR :unfoldall
"
" exmap foldall obcommand editor:fold-all
" nmap zM :foldall

" Emulate Tab Switching https://vimhelp.org/tabpage.txt.html#gt
" requires Pane Relief: https://github.com/pjeby/pane-relief
exmap tabnext obcommand pane-relief:go-next
nmap gt :tabnext
exmap tabprev obcommand pane-relief:go-prev
nmap gT :tabprev
" Same as CMD+\
nmap g\ :tabnext

exmap openlink obcommand editor:open-link-in-new-leaf
nmap go :openlink
nmap gd :openlink

" [g]oto [f]ile (= Follow Link under cursor)
exmap followLinkUnderCursor obcommand editor:follow-link
nmap gf :followLinkUnderCursor

" Link Jump (similar to Vimium's f)
exmap linkjump obcommand mrj-jump-to-link:activate-lightspeed-jump
nmap ,f :linkjump

" g; go to last change - https://vimhelp.org/motion.txt.html#g%3B
nmap g; u<C-r>

" exmap cursorBackward obcommand heycalmdown-navigate-cursor-history:cursor-position-backward
" exmap cursorForward heycalmdown-navigate-cursor-history:cursor-position-forward
" nmap g; :cursorBackward
" nmap g' :cursorForward

" mapping next/previous heading
exmap nextHeading jsfile .obsidian.markdown-helper.js {jumpHeading(true)}
exmap prevHeading jsfile .obsidian.markdown-helper.js {jumpHeading(false)}
nmap g] :nextHeading
nmap g[ :prevHeading

exmap scrollToCenterTop70p jsfile .obsidian.markdown-helper.js {scrollToCursor(0.7)}
nmap zz :scrollToCenterTop70p

" rename file
exmap renameFile obcommand Obsidian-VimEx:file-rename-modal
nmap gr :renameFile

" mapping vs/hs as workspace split
exmap vs obcommand workspace:split-vertical
exmap sp obcommand workspace:split-vertical
exmap hs obcommand workspace:split-horizontal
nmap <C-w>v :vs
nmap <C-w>s :hs

" window controls
exmap wq obcommand workspace:close
exmap q obcommand workspace:close

" focus
exmap focusLeft obcommand editor:focus-left
exmap focusRight obcommand editor:focus-right
exmap focusBottom obcommand editor:focus-bottom
exmap focusTop obcommand editor:focus-top
nmap <C-w>h :focusLeft
nmap <C-w>l :focusRight
nmap <C-w>j :focusBottom
nmap <C-w>k :focusTop

" Blockquote
exmap toggleBlockquote obcommand editor:toggle-blockquote
nmap ,< :toggleBlockquote
nmap ,> :toggleBlockquote

" complete a Markdown task
exmap toggleTask obcommand editor:toggle-checklist-status
nmap ,x :toggleTask

" Zoom in/out
exmap zoomIn obcommand obsidian-zoom:zoom-in
exmap zoomOut obcommand obsidian-zoom:zoom-out
nmap zi :zoomIn
nmap zo :zoomOut

nmap &a :zoomOut
nmap &b :nextHeading
nmap &c :zoomIn
nmap &d :prevHeading
nmap z] &a&b&c
nmap z[ &a&d&c

" Stille Mode
exmap toggleStille obcommand obsidian-stille:toggleStille
nmap zs :toggleStille
nmap ,s :toggleStille
