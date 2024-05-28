function describeYabaiCommand(command: string): string {
    const descriptions: { regex: RegExp, description: string }[] = [
        { regex: /^yabai\s*-m\s*window\s*--focus\s*west$/, description: "Focus window to the west" },
        { regex: /^yabai\s*-m\s*window\s*--focus\s*south$/, description: "Focus window to the south" },
        { regex: /^yabai\s*-m\s*window\s*--focus\s*north$/, description: "Focus window to the north" },
        { regex: /^yabai\s*-m\s*window\s*--focus\s*east$/, description: "Focus window to the east" },
        { regex: /^yabai\s*-m\s*window\s*--swap\s*south$/, description: "Swap window with the one to the south" },
        { regex: /^yabai\s*-m\s*window\s*--swap\s*north$/, description: "Swap window with the one to the north" },
        { regex: /^yabai\s*-m\s*window\s*--swap\s*west$/, description: "Swap window with the one to the west" },
        { regex: /^yabai\s*-m\s*window\s*--swap\s*east$/, description: "Swap window with the one to the east" },
        { regex: /^yabai\s*-m\s*window\s*--warp\s*south$/, description: "Warp window to the south" },
        { regex: /^yabai\s*-m\s*window\s*--warp\s*north$/, description: "Warp window to the north" },
        { regex: /^yabai\s*-m\s*window\s*--warp\s*west$/, description: "Warp window to the west" },
        { regex: /^yabai\s*-m\s*window\s*--warp\s*east$/, description: "Warp window to the east" },
        { regex: /^yabai\s*-m\s*window\s*--space\s*recent\s*&&\s*yabai\s*-m\s*space\s*--focus\s*recent$/, description: "Send window to recent desktop and follow focus" },
        { regex: /^yabai\s*-m\s*window\s*--space\s*prev\s*&&\s*yabai\s*-m\s*space\s*--focus\s*prev$/, description: "Send window to previous desktop and follow focus" },
        { regex: /^yabai\s*-m\s*window\s*--space\s*next\s*&&\s*yabai\s*-m\s*space\s*--focus\s*next$/, description: "Send window to next desktop and follow focus" },
        { regex: /^yabai\s*-m\s*window\s*--space\s*(\d+)\s*&&\s*yabai\s*-m\s*space\s*--focus\s*\1$/, description: "Send window to desktop $1 and follow focus" },
        { regex: /^yabai\s*-m\s*window\s*--space\s*10\s*&&\s*yabai\s*-m\s*space\s*--focus\s*10$/, description: "Send window to desktop 10 and follow focus" },
        { regex: /^yabai\s*-m\s*window\s*--move\s*rel:-30:0$/, description: "Move floating window left" },
        { regex: /^yabai\s*-m\s*window\s*--move\s*rel:0:30$/, description: "Move floating window down" },
        { regex: /^yabai\s*-m\s*window\s*--move\s*rel:0:-30$/, description: "Move floating window up" },
        { regex: /^yabai\s*-m\s*window\s*--move\s*rel:30:0$/, description: "Move floating window right" },
        { regex: /^yabai\s*-m\s*window\s*--resize\s*left:-20:0$/, description: "Decrease window size left" },
        { regex: /^yabai\s*-m\s*window\s*--resize\s*bottom:0:-20$/, description: "Decrease window size down" },
        { regex: /^yabai\s*-m\s*window\s*--resize\s*top:0:20$/, description: "Decrease window size up" },
        { regex: /^yabai\s*-m\s*window\s*--resize\s*right:20:0$/, description: "Decrease window size right" },
    ];

    for (const { regex, description } of descriptions) {
        if (regex.test(command)) {
            return `Yabai: ${description}` ;
        }
    }

    return "Command not found";
}

// Test the function
const command: string = "yabai -m window --swap south";
console.log(describeYabaiCommand(command));
