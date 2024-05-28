import { To, KeyCode, Manipulator, KarabinerRules } from "./types";

/**
 * Custom way to describe a command in a layer
 */
export interface LayerCommand {
  to: To[];
  description?: string;
}

type HyperKeySublayer = {
  // The ? is necessary, otherwise we'd have to define something for _every_ key code
  [key_code in KeyCode]?: LayerCommand;
};

/**
 * Create a Hyper Key sublayer, where every command is prefixed with a key
 * e.g. Hyper + O ("Open") is the "open applications" layer, I can press
 * e.g. Hyper + O + G ("Google Chrome") to open Chrome
 */
export function createHyperSubLayer(
  sublayer_key: KeyCode,
  commands: HyperKeySublayer,
  allSubLayerVariables: string[]
): Manipulator[] {
  const subLayerVariableName = generateSubLayerVariableName(sublayer_key);

  return [
    // When Hyper + sublayer_key is pressed, set the variable to 1; on key_up, set it to 0 again
    {
      description: `Toggle Hyper sublayer ${sublayer_key}`,
      type: "basic",
      from: {
        key_code: sublayer_key,
        modifiers: {
          optional: ["any"],
        },
      },
      to_after_key_up: [
        {
          set_variable: {
            name: subLayerVariableName,
            // The default value of a variable is 0: https://karabiner-elements.pqrs.org/docs/json/complex-modifications-manipulator-definition/conditions/variable/
            // That means by using 0 and 1 we can filter for "0" in the conditions below and it'll work on startup
            value: 0,
          },
        },
      ],
      to: [
        {
          set_variable: {
            name: subLayerVariableName,
            value: 1,
          },
        },
      ],
      // This enables us to press other sublayer keys in the current sublayer
      // (e.g. Hyper + O > M even though Hyper + M is also a sublayer)
      // basically, only trigger a sublayer if no other sublayer is active
      conditions: [
        ...allSubLayerVariables
          .filter(
            (subLayerVariable) => subLayerVariable !== subLayerVariableName
          )
          .map((subLayerVariable) => ({
            type: "variable_if" as const,
            name: subLayerVariable,
            value: 0,
          })),
        {
          type: "variable_if",
          name: "hyper",
          value: 1,
        },
      ],
    },
    // Define the individual commands that are meant to trigger in the sublayer
    ...(Object.keys(commands) as (keyof typeof commands)[]).map(
      (command_key): Manipulator => ({
        ...commands[command_key],
        type: "basic" as const,
        from: {
          key_code: command_key,
          modifiers: {
            optional: ["any"],
          },
        },
        // Only trigger this command if the variable is 1 (i.e., if Hyper + sublayer is held)
        conditions: [
          {
            type: "variable_if",
            name: subLayerVariableName,
            value: 1,
          },
        ],
      })
    ),
  ];
}

/**
 * Create all hyper sublayers. This needs to be a single function, as well need to
 * have all the hyper variable names in order to filter them and make sure only one
 * activates at a time
 */
export function createHyperSubLayers(subLayers: {
  [key_code in KeyCode]?: HyperKeySublayer | LayerCommand;
}): KarabinerRules[] {
  const allSubLayerVariables = (
    Object.keys(subLayers) as (keyof typeof subLayers)[]
  ).map((sublayer_key) => generateSubLayerVariableName(sublayer_key));

  return Object.entries(subLayers).map(([key, value]) =>
    "to" in value
      ? {
          description: `Hyper Key + ${key}`,
          manipulators: [
            {
              ...value,
              type: "basic" as const,
              from: {
                key_code: key as KeyCode,
                modifiers: {
                  optional: ["any"],
                },
              },
              conditions: [
                {
                  type: "variable_if",
                  name: "hyper",
                  value: 1,
                },
                ...allSubLayerVariables.map((subLayerVariable) => ({
                  type: "variable_if" as const,
                  name: subLayerVariable,
                  value: 0,
                })),
              ],
            },
          ],
        }
      : {
          description: `Hyper Key sublayer "${key}"`,
          manipulators: createHyperSubLayer(
            key as KeyCode,
            value,
            allSubLayerVariables
          ),
        }
  );
}

function generateSubLayerVariableName(key: KeyCode) {
  return `hyper_sublayer_${key}`;
}

/**
 * Shortcut for "open" shell command
 */
export function open(...what: string[]): LayerCommand {
  return {
    to: what.map((w) => ({
      shell_command: `open ${w}`,
    })),
    description: `Open ${what.join(" & ")}`,
  };
}

/**
 * Utility function to create a LayerCommand from a tagged template literal
 * where each line is a shell command to be executed.
 */
export function shell(
  strings: TemplateStringsArray,
  ...values: any[]
): LayerCommand {
  const commands = strings.reduce((acc, str, i) => {
    const value = i < values.length ? values[i] : "";
    const lines = (str + value)
      .split("\n")
      .filter((line) => line.trim() !== "");
    acc.push(...lines);
    return acc;
  }, [] as string[]);

  return {
    to: commands.map((command) => ({
      shell_command: command.trim(),
    })),
    description: commands.join(" && "),
  };
}

/**
 * Shortcut for managing window sizing with Rectangle
 */
export function rectangle(name: string): LayerCommand {
  return {
    to: [
      {
        shell_command: `open -g rectangle://execute-action?name=${name}`,
      },
    ],
    description: `Window: ${name}`,
  };
}


function describeYabaiCommand(command) {
    const descriptions = [
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
            return description;
        }
    }

    return "Command not found";
}

  /**
   *
 * Shortcut for managing window management with yabai
 */
export function yabai(shell_command: string): LayerCommand {
  return {
    to: [
      {
        shell_command,
      },
    ],
    description: `Yabai: ${shell_command}`,
  };
}

/**
 * Shortcut for "Open an app" command (of which there are a bunch)
 */
export function app(name: string): LayerCommand {
  return open(`-a '${name}.app'`);
}
