#!/usr/bin/env bun
// @bun
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getProtoOf = Object.getPrototypeOf;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __toESM = (mod, isNodeMode, target) => {
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: () => mod[key],
        enumerable: true
      });
  return to;
};
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);
var __require = (id) => {
  return import.meta.require(id);
};

// node_modules/node-cmd/cmd.js
var require_cmd = __commonJS((exports, module) => {
  var runCommand = function(command, callback) {
    return exec(command, function() {
      return function(err, data, stderr) {
        if (!callback)
          return;
        callback(err, data, stderr);
      };
    }(callback));
  };
  var runSync = function(command) {
    try {
      return {
        data: execSync(command).toString(),
        err: null,
        stderr: null
      };
    } catch (error) {
      return {
        data: null,
        err: error.stderr.toString(),
        stderr: error.stderr.toString()
      };
    }
  };
  var { exec, execSync } = import.meta.require("child_process");
  var commandline = {
    run: runCommand,
    runSync
  };
  module.exports = commandline;
});

// node_modules/commander/lib/error.js
var require_error = __commonJS((exports) => {
  class CommanderError extends Error {
    constructor(exitCode, code, message) {
      super(message);
      Error.captureStackTrace(this, this.constructor);
      this.name = this.constructor.name;
      this.code = code;
      this.exitCode = exitCode;
      this.nestedError = undefined;
    }
  }

  class InvalidArgumentError extends CommanderError {
    constructor(message) {
      super(1, "commander.invalidArgument", message);
      Error.captureStackTrace(this, this.constructor);
      this.name = this.constructor.name;
    }
  }
  exports.CommanderError = CommanderError;
  exports.InvalidArgumentError = InvalidArgumentError;
});

// node_modules/commander/lib/argument.js
var require_argument = __commonJS((exports) => {
  var humanReadableArgName = function(arg) {
    const nameOutput = arg.name() + (arg.variadic === true ? "..." : "");
    return arg.required ? "<" + nameOutput + ">" : "[" + nameOutput + "]";
  };
  var { InvalidArgumentError } = require_error();

  class Argument {
    constructor(name, description) {
      this.description = description || "";
      this.variadic = false;
      this.parseArg = undefined;
      this.defaultValue = undefined;
      this.defaultValueDescription = undefined;
      this.argChoices = undefined;
      switch (name[0]) {
        case "<":
          this.required = true;
          this._name = name.slice(1, -1);
          break;
        case "[":
          this.required = false;
          this._name = name.slice(1, -1);
          break;
        default:
          this.required = true;
          this._name = name;
          break;
      }
      if (this._name.length > 3 && this._name.slice(-3) === "...") {
        this.variadic = true;
        this._name = this._name.slice(0, -3);
      }
    }
    name() {
      return this._name;
    }
    _concatValue(value, previous) {
      if (previous === this.defaultValue || !Array.isArray(previous)) {
        return [value];
      }
      return previous.concat(value);
    }
    default(value, description) {
      this.defaultValue = value;
      this.defaultValueDescription = description;
      return this;
    }
    argParser(fn) {
      this.parseArg = fn;
      return this;
    }
    choices(values) {
      this.argChoices = values.slice();
      this.parseArg = (arg, previous) => {
        if (!this.argChoices.includes(arg)) {
          throw new InvalidArgumentError(`Allowed choices are ${this.argChoices.join(", ")}.`);
        }
        if (this.variadic) {
          return this._concatValue(arg, previous);
        }
        return arg;
      };
      return this;
    }
    argRequired() {
      this.required = true;
      return this;
    }
    argOptional() {
      this.required = false;
      return this;
    }
  }
  exports.Argument = Argument;
  exports.humanReadableArgName = humanReadableArgName;
});

// node_modules/commander/lib/help.js
var require_help = __commonJS((exports) => {
  var { humanReadableArgName } = require_argument();

  class Help {
    constructor() {
      this.helpWidth = undefined;
      this.sortSubcommands = false;
      this.sortOptions = false;
      this.showGlobalOptions = false;
    }
    visibleCommands(cmd) {
      const visibleCommands = cmd.commands.filter((cmd2) => !cmd2._hidden);
      if (cmd._hasImplicitHelpCommand()) {
        const [, helpName, helpArgs] = cmd._helpCommandnameAndArgs.match(/([^ ]+) *(.*)/);
        const helpCommand = cmd.createCommand(helpName).helpOption(false);
        helpCommand.description(cmd._helpCommandDescription);
        if (helpArgs)
          helpCommand.arguments(helpArgs);
        visibleCommands.push(helpCommand);
      }
      if (this.sortSubcommands) {
        visibleCommands.sort((a, b) => {
          return a.name().localeCompare(b.name());
        });
      }
      return visibleCommands;
    }
    compareOptions(a, b) {
      const getSortKey = (option) => {
        return option.short ? option.short.replace(/^-/, "") : option.long.replace(/^--/, "");
      };
      return getSortKey(a).localeCompare(getSortKey(b));
    }
    visibleOptions(cmd) {
      const visibleOptions = cmd.options.filter((option) => !option.hidden);
      const showShortHelpFlag = cmd._hasHelpOption && cmd._helpShortFlag && !cmd._findOption(cmd._helpShortFlag);
      const showLongHelpFlag = cmd._hasHelpOption && !cmd._findOption(cmd._helpLongFlag);
      if (showShortHelpFlag || showLongHelpFlag) {
        let helpOption;
        if (!showShortHelpFlag) {
          helpOption = cmd.createOption(cmd._helpLongFlag, cmd._helpDescription);
        } else if (!showLongHelpFlag) {
          helpOption = cmd.createOption(cmd._helpShortFlag, cmd._helpDescription);
        } else {
          helpOption = cmd.createOption(cmd._helpFlags, cmd._helpDescription);
        }
        visibleOptions.push(helpOption);
      }
      if (this.sortOptions) {
        visibleOptions.sort(this.compareOptions);
      }
      return visibleOptions;
    }
    visibleGlobalOptions(cmd) {
      if (!this.showGlobalOptions)
        return [];
      const globalOptions = [];
      for (let ancestorCmd = cmd.parent;ancestorCmd; ancestorCmd = ancestorCmd.parent) {
        const visibleOptions = ancestorCmd.options.filter((option) => !option.hidden);
        globalOptions.push(...visibleOptions);
      }
      if (this.sortOptions) {
        globalOptions.sort(this.compareOptions);
      }
      return globalOptions;
    }
    visibleArguments(cmd) {
      if (cmd._argsDescription) {
        cmd.registeredArguments.forEach((argument) => {
          argument.description = argument.description || cmd._argsDescription[argument.name()] || "";
        });
      }
      if (cmd.registeredArguments.find((argument) => argument.description)) {
        return cmd.registeredArguments;
      }
      return [];
    }
    subcommandTerm(cmd) {
      const args = cmd.registeredArguments.map((arg) => humanReadableArgName(arg)).join(" ");
      return cmd._name + (cmd._aliases[0] ? "|" + cmd._aliases[0] : "") + (cmd.options.length ? " [options]" : "") + (args ? " " + args : "");
    }
    optionTerm(option) {
      return option.flags;
    }
    argumentTerm(argument) {
      return argument.name();
    }
    longestSubcommandTermLength(cmd, helper) {
      return helper.visibleCommands(cmd).reduce((max, command) => {
        return Math.max(max, helper.subcommandTerm(command).length);
      }, 0);
    }
    longestOptionTermLength(cmd, helper) {
      return helper.visibleOptions(cmd).reduce((max, option) => {
        return Math.max(max, helper.optionTerm(option).length);
      }, 0);
    }
    longestGlobalOptionTermLength(cmd, helper) {
      return helper.visibleGlobalOptions(cmd).reduce((max, option) => {
        return Math.max(max, helper.optionTerm(option).length);
      }, 0);
    }
    longestArgumentTermLength(cmd, helper) {
      return helper.visibleArguments(cmd).reduce((max, argument) => {
        return Math.max(max, helper.argumentTerm(argument).length);
      }, 0);
    }
    commandUsage(cmd) {
      let cmdName = cmd._name;
      if (cmd._aliases[0]) {
        cmdName = cmdName + "|" + cmd._aliases[0];
      }
      let ancestorCmdNames = "";
      for (let ancestorCmd = cmd.parent;ancestorCmd; ancestorCmd = ancestorCmd.parent) {
        ancestorCmdNames = ancestorCmd.name() + " " + ancestorCmdNames;
      }
      return ancestorCmdNames + cmdName + " " + cmd.usage();
    }
    commandDescription(cmd) {
      return cmd.description();
    }
    subcommandDescription(cmd) {
      return cmd.summary() || cmd.description();
    }
    optionDescription(option) {
      const extraInfo = [];
      if (option.argChoices) {
        extraInfo.push(`choices: ${option.argChoices.map((choice) => JSON.stringify(choice)).join(", ")}`);
      }
      if (option.defaultValue !== undefined) {
        const showDefault = option.required || option.optional || option.isBoolean() && typeof option.defaultValue === "boolean";
        if (showDefault) {
          extraInfo.push(`default: ${option.defaultValueDescription || JSON.stringify(option.defaultValue)}`);
        }
      }
      if (option.presetArg !== undefined && option.optional) {
        extraInfo.push(`preset: ${JSON.stringify(option.presetArg)}`);
      }
      if (option.envVar !== undefined) {
        extraInfo.push(`env: ${option.envVar}`);
      }
      if (extraInfo.length > 0) {
        return `${option.description} (${extraInfo.join(", ")})`;
      }
      return option.description;
    }
    argumentDescription(argument) {
      const extraInfo = [];
      if (argument.argChoices) {
        extraInfo.push(`choices: ${argument.argChoices.map((choice) => JSON.stringify(choice)).join(", ")}`);
      }
      if (argument.defaultValue !== undefined) {
        extraInfo.push(`default: ${argument.defaultValueDescription || JSON.stringify(argument.defaultValue)}`);
      }
      if (extraInfo.length > 0) {
        const extraDescripton = `(${extraInfo.join(", ")})`;
        if (argument.description) {
          return `${argument.description} ${extraDescripton}`;
        }
        return extraDescripton;
      }
      return argument.description;
    }
    formatHelp(cmd, helper) {
      const termWidth = helper.padWidth(cmd, helper);
      const helpWidth = helper.helpWidth || 80;
      const itemIndentWidth = 2;
      const itemSeparatorWidth = 2;
      function formatItem(term, description) {
        if (description) {
          const fullText = `${term.padEnd(termWidth + itemSeparatorWidth)}${description}`;
          return helper.wrap(fullText, helpWidth - itemIndentWidth, termWidth + itemSeparatorWidth);
        }
        return term;
      }
      function formatList(textArray) {
        return textArray.join("\n").replace(/^/gm, " ".repeat(itemIndentWidth));
      }
      let output = [`Usage: ${helper.commandUsage(cmd)}`, ""];
      const commandDescription = helper.commandDescription(cmd);
      if (commandDescription.length > 0) {
        output = output.concat([helper.wrap(commandDescription, helpWidth, 0), ""]);
      }
      const argumentList = helper.visibleArguments(cmd).map((argument) => {
        return formatItem(helper.argumentTerm(argument), helper.argumentDescription(argument));
      });
      if (argumentList.length > 0) {
        output = output.concat(["Arguments:", formatList(argumentList), ""]);
      }
      const optionList = helper.visibleOptions(cmd).map((option) => {
        return formatItem(helper.optionTerm(option), helper.optionDescription(option));
      });
      if (optionList.length > 0) {
        output = output.concat(["Options:", formatList(optionList), ""]);
      }
      if (this.showGlobalOptions) {
        const globalOptionList = helper.visibleGlobalOptions(cmd).map((option) => {
          return formatItem(helper.optionTerm(option), helper.optionDescription(option));
        });
        if (globalOptionList.length > 0) {
          output = output.concat(["Global Options:", formatList(globalOptionList), ""]);
        }
      }
      const commandList = helper.visibleCommands(cmd).map((cmd2) => {
        return formatItem(helper.subcommandTerm(cmd2), helper.subcommandDescription(cmd2));
      });
      if (commandList.length > 0) {
        output = output.concat(["Commands:", formatList(commandList), ""]);
      }
      return output.join("\n");
    }
    padWidth(cmd, helper) {
      return Math.max(helper.longestOptionTermLength(cmd, helper), helper.longestGlobalOptionTermLength(cmd, helper), helper.longestSubcommandTermLength(cmd, helper), helper.longestArgumentTermLength(cmd, helper));
    }
    wrap(str, width, indent, minColumnWidth = 40) {
      const indents = " \\f\\t\\v\xA0\u1680\u2000-\u200A\u202F\u205F\u3000\uFEFF";
      const manualIndent = new RegExp(`[\\n][${indents}]+`);
      if (str.match(manualIndent))
        return str;
      const columnWidth = width - indent;
      if (columnWidth < minColumnWidth)
        return str;
      const leadingStr = str.slice(0, indent);
      const columnText = str.slice(indent).replace("\r\n", "\n");
      const indentString = " ".repeat(indent);
      const zeroWidthSpace = "\u200B";
      const breaks = `\\s${zeroWidthSpace}`;
      const regex = new RegExp(`\n|.{1,${columnWidth - 1}}([${breaks}]|\$)|[^${breaks}]+?([${breaks}]|\$)`, "g");
      const lines = columnText.match(regex) || [];
      return leadingStr + lines.map((line, i) => {
        if (line === "\n")
          return "";
        return (i > 0 ? indentString : "") + line.trimEnd();
      }).join("\n");
    }
  }
  exports.Help = Help;
});

// node_modules/commander/lib/option.js
var require_option = __commonJS((exports) => {
  var camelcase = function(str) {
    return str.split("-").reduce((str2, word) => {
      return str2 + word[0].toUpperCase() + word.slice(1);
    });
  };
  var splitOptionFlags = function(flags) {
    let shortFlag;
    let longFlag;
    const flagParts = flags.split(/[ |,]+/);
    if (flagParts.length > 1 && !/^[[<]/.test(flagParts[1]))
      shortFlag = flagParts.shift();
    longFlag = flagParts.shift();
    if (!shortFlag && /^-[^-]$/.test(longFlag)) {
      shortFlag = longFlag;
      longFlag = undefined;
    }
    return { shortFlag, longFlag };
  };
  var { InvalidArgumentError } = require_error();

  class Option {
    constructor(flags, description) {
      this.flags = flags;
      this.description = description || "";
      this.required = flags.includes("<");
      this.optional = flags.includes("[");
      this.variadic = /\w\.\.\.[>\]]$/.test(flags);
      this.mandatory = false;
      const optionFlags = splitOptionFlags(flags);
      this.short = optionFlags.shortFlag;
      this.long = optionFlags.longFlag;
      this.negate = false;
      if (this.long) {
        this.negate = this.long.startsWith("--no-");
      }
      this.defaultValue = undefined;
      this.defaultValueDescription = undefined;
      this.presetArg = undefined;
      this.envVar = undefined;
      this.parseArg = undefined;
      this.hidden = false;
      this.argChoices = undefined;
      this.conflictsWith = [];
      this.implied = undefined;
    }
    default(value, description) {
      this.defaultValue = value;
      this.defaultValueDescription = description;
      return this;
    }
    preset(arg) {
      this.presetArg = arg;
      return this;
    }
    conflicts(names) {
      this.conflictsWith = this.conflictsWith.concat(names);
      return this;
    }
    implies(impliedOptionValues) {
      let newImplied = impliedOptionValues;
      if (typeof impliedOptionValues === "string") {
        newImplied = { [impliedOptionValues]: true };
      }
      this.implied = Object.assign(this.implied || {}, newImplied);
      return this;
    }
    env(name) {
      this.envVar = name;
      return this;
    }
    argParser(fn) {
      this.parseArg = fn;
      return this;
    }
    makeOptionMandatory(mandatory = true) {
      this.mandatory = !!mandatory;
      return this;
    }
    hideHelp(hide = true) {
      this.hidden = !!hide;
      return this;
    }
    _concatValue(value, previous) {
      if (previous === this.defaultValue || !Array.isArray(previous)) {
        return [value];
      }
      return previous.concat(value);
    }
    choices(values) {
      this.argChoices = values.slice();
      this.parseArg = (arg, previous) => {
        if (!this.argChoices.includes(arg)) {
          throw new InvalidArgumentError(`Allowed choices are ${this.argChoices.join(", ")}.`);
        }
        if (this.variadic) {
          return this._concatValue(arg, previous);
        }
        return arg;
      };
      return this;
    }
    name() {
      if (this.long) {
        return this.long.replace(/^--/, "");
      }
      return this.short.replace(/^-/, "");
    }
    attributeName() {
      return camelcase(this.name().replace(/^no-/, ""));
    }
    is(arg) {
      return this.short === arg || this.long === arg;
    }
    isBoolean() {
      return !this.required && !this.optional && !this.negate;
    }
  }

  class DualOptions {
    constructor(options2) {
      this.positiveOptions = new Map;
      this.negativeOptions = new Map;
      this.dualOptions = new Set;
      options2.forEach((option) => {
        if (option.negate) {
          this.negativeOptions.set(option.attributeName(), option);
        } else {
          this.positiveOptions.set(option.attributeName(), option);
        }
      });
      this.negativeOptions.forEach((value, key) => {
        if (this.positiveOptions.has(key)) {
          this.dualOptions.add(key);
        }
      });
    }
    valueFromOption(value, option) {
      const optionKey = option.attributeName();
      if (!this.dualOptions.has(optionKey))
        return true;
      const preset = this.negativeOptions.get(optionKey).presetArg;
      const negativeValue = preset !== undefined ? preset : false;
      return option.negate === (negativeValue === value);
    }
  }
  exports.Option = Option;
  exports.splitOptionFlags = splitOptionFlags;
  exports.DualOptions = DualOptions;
});

// node_modules/commander/lib/suggestSimilar.js
var require_suggestSimilar = __commonJS((exports) => {
  var editDistance = function(a, b) {
    if (Math.abs(a.length - b.length) > maxDistance)
      return Math.max(a.length, b.length);
    const d = [];
    for (let i = 0;i <= a.length; i++) {
      d[i] = [i];
    }
    for (let j = 0;j <= b.length; j++) {
      d[0][j] = j;
    }
    for (let j = 1;j <= b.length; j++) {
      for (let i = 1;i <= a.length; i++) {
        let cost = 1;
        if (a[i - 1] === b[j - 1]) {
          cost = 0;
        } else {
          cost = 1;
        }
        d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
        if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
          d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
        }
      }
    }
    return d[a.length][b.length];
  };
  var suggestSimilar = function(word, candidates) {
    if (!candidates || candidates.length === 0)
      return "";
    candidates = Array.from(new Set(candidates));
    const searchingOptions = word.startsWith("--");
    if (searchingOptions) {
      word = word.slice(2);
      candidates = candidates.map((candidate) => candidate.slice(2));
    }
    let similar = [];
    let bestDistance = maxDistance;
    const minSimilarity = 0.4;
    candidates.forEach((candidate) => {
      if (candidate.length <= 1)
        return;
      const distance = editDistance(word, candidate);
      const length = Math.max(word.length, candidate.length);
      const similarity = (length - distance) / length;
      if (similarity > minSimilarity) {
        if (distance < bestDistance) {
          bestDistance = distance;
          similar = [candidate];
        } else if (distance === bestDistance) {
          similar.push(candidate);
        }
      }
    });
    similar.sort((a, b) => a.localeCompare(b));
    if (searchingOptions) {
      similar = similar.map((candidate) => `--${candidate}`);
    }
    if (similar.length > 1) {
      return `\n(Did you mean one of ${similar.join(", ")}?)`;
    }
    if (similar.length === 1) {
      return `\n(Did you mean ${similar[0]}?)`;
    }
    return "";
  };
  var maxDistance = 3;
  exports.suggestSimilar = suggestSimilar;
});

// node_modules/commander/lib/command.js
var require_command = __commonJS((exports) => {
  var outputHelpIfRequested = function(cmd, args) {
    const helpOption = cmd._hasHelpOption && args.find((arg) => arg === cmd._helpLongFlag || arg === cmd._helpShortFlag);
    if (helpOption) {
      cmd.outputHelp();
      cmd._exit(0, "commander.helpDisplayed", "(outputHelp)");
    }
  };
  var incrementNodeInspectorPort = function(args) {
    return args.map((arg) => {
      if (!arg.startsWith("--inspect")) {
        return arg;
      }
      let debugOption;
      let debugHost = "127.0.0.1";
      let debugPort = "9229";
      let match;
      if ((match = arg.match(/^(--inspect(-brk)?)$/)) !== null) {
        debugOption = match[1];
      } else if ((match = arg.match(/^(--inspect(-brk|-port)?)=([^:]+)$/)) !== null) {
        debugOption = match[1];
        if (/^\d+$/.test(match[3])) {
          debugPort = match[3];
        } else {
          debugHost = match[3];
        }
      } else if ((match = arg.match(/^(--inspect(-brk|-port)?)=([^:]+):(\d+)$/)) !== null) {
        debugOption = match[1];
        debugHost = match[3];
        debugPort = match[4];
      }
      if (debugOption && debugPort !== "0") {
        return `${debugOption}=${debugHost}:${parseInt(debugPort) + 1}`;
      }
      return arg;
    });
  };
  var EventEmitter = import.meta.require("events").EventEmitter;
  var childProcess = import.meta.require("child_process");
  var path = import.meta.require("path");
  var fs = import.meta.require("fs");
  var process2 = import.meta.require("process");
  var { Argument, humanReadableArgName } = require_argument();
  var { CommanderError } = require_error();
  var { Help } = require_help();
  var { Option, splitOptionFlags, DualOptions } = require_option();
  var { suggestSimilar } = require_suggestSimilar();

  class Command extends EventEmitter {
    constructor(name) {
      super();
      this.commands = [];
      this.options = [];
      this.parent = null;
      this._allowUnknownOption = false;
      this._allowExcessArguments = true;
      this.registeredArguments = [];
      this._args = this.registeredArguments;
      this.args = [];
      this.rawArgs = [];
      this.processedArgs = [];
      this._scriptPath = null;
      this._name = name || "";
      this._optionValues = {};
      this._optionValueSources = {};
      this._storeOptionsAsProperties = false;
      this._actionHandler = null;
      this._executableHandler = false;
      this._executableFile = null;
      this._executableDir = null;
      this._defaultCommandName = null;
      this._exitCallback = null;
      this._aliases = [];
      this._combineFlagAndOptionalValue = true;
      this._description = "";
      this._summary = "";
      this._argsDescription = undefined;
      this._enablePositionalOptions = false;
      this._passThroughOptions = false;
      this._lifeCycleHooks = {};
      this._showHelpAfterError = false;
      this._showSuggestionAfterError = true;
      this._outputConfiguration = {
        writeOut: (str) => process2.stdout.write(str),
        writeErr: (str) => process2.stderr.write(str),
        getOutHelpWidth: () => process2.stdout.isTTY ? process2.stdout.columns : undefined,
        getErrHelpWidth: () => process2.stderr.isTTY ? process2.stderr.columns : undefined,
        outputError: (str, write) => write(str)
      };
      this._hidden = false;
      this._hasHelpOption = true;
      this._helpFlags = "-h, --help";
      this._helpDescription = "display help for command";
      this._helpShortFlag = "-h";
      this._helpLongFlag = "--help";
      this._addImplicitHelpCommand = undefined;
      this._helpCommandName = "help";
      this._helpCommandnameAndArgs = "help [command]";
      this._helpCommandDescription = "display help for command";
      this._helpConfiguration = {};
    }
    copyInheritedSettings(sourceCommand) {
      this._outputConfiguration = sourceCommand._outputConfiguration;
      this._hasHelpOption = sourceCommand._hasHelpOption;
      this._helpFlags = sourceCommand._helpFlags;
      this._helpDescription = sourceCommand._helpDescription;
      this._helpShortFlag = sourceCommand._helpShortFlag;
      this._helpLongFlag = sourceCommand._helpLongFlag;
      this._helpCommandName = sourceCommand._helpCommandName;
      this._helpCommandnameAndArgs = sourceCommand._helpCommandnameAndArgs;
      this._helpCommandDescription = sourceCommand._helpCommandDescription;
      this._helpConfiguration = sourceCommand._helpConfiguration;
      this._exitCallback = sourceCommand._exitCallback;
      this._storeOptionsAsProperties = sourceCommand._storeOptionsAsProperties;
      this._combineFlagAndOptionalValue = sourceCommand._combineFlagAndOptionalValue;
      this._allowExcessArguments = sourceCommand._allowExcessArguments;
      this._enablePositionalOptions = sourceCommand._enablePositionalOptions;
      this._showHelpAfterError = sourceCommand._showHelpAfterError;
      this._showSuggestionAfterError = sourceCommand._showSuggestionAfterError;
      return this;
    }
    _getCommandAndAncestors() {
      const result = [];
      for (let command = this;command; command = command.parent) {
        result.push(command);
      }
      return result;
    }
    command(nameAndArgs, actionOptsOrExecDesc, execOpts) {
      let desc = actionOptsOrExecDesc;
      let opts = execOpts;
      if (typeof desc === "object" && desc !== null) {
        opts = desc;
        desc = null;
      }
      opts = opts || {};
      const [, name, args] = nameAndArgs.match(/([^ ]+) *(.*)/);
      const cmd = this.createCommand(name);
      if (desc) {
        cmd.description(desc);
        cmd._executableHandler = true;
      }
      if (opts.isDefault)
        this._defaultCommandName = cmd._name;
      cmd._hidden = !!(opts.noHelp || opts.hidden);
      cmd._executableFile = opts.executableFile || null;
      if (args)
        cmd.arguments(args);
      this.commands.push(cmd);
      cmd.parent = this;
      cmd.copyInheritedSettings(this);
      if (desc)
        return this;
      return cmd;
    }
    createCommand(name) {
      return new Command(name);
    }
    createHelp() {
      return Object.assign(new Help, this.configureHelp());
    }
    configureHelp(configuration) {
      if (configuration === undefined)
        return this._helpConfiguration;
      this._helpConfiguration = configuration;
      return this;
    }
    configureOutput(configuration) {
      if (configuration === undefined)
        return this._outputConfiguration;
      Object.assign(this._outputConfiguration, configuration);
      return this;
    }
    showHelpAfterError(displayHelp = true) {
      if (typeof displayHelp !== "string")
        displayHelp = !!displayHelp;
      this._showHelpAfterError = displayHelp;
      return this;
    }
    showSuggestionAfterError(displaySuggestion = true) {
      this._showSuggestionAfterError = !!displaySuggestion;
      return this;
    }
    addCommand(cmd, opts) {
      if (!cmd._name) {
        throw new Error(`Command passed to .addCommand() must have a name
- specify the name in Command constructor or using .name()`);
      }
      opts = opts || {};
      if (opts.isDefault)
        this._defaultCommandName = cmd._name;
      if (opts.noHelp || opts.hidden)
        cmd._hidden = true;
      this.commands.push(cmd);
      cmd.parent = this;
      return this;
    }
    createArgument(name, description) {
      return new Argument(name, description);
    }
    argument(name, description, fn, defaultValue) {
      const argument = this.createArgument(name, description);
      if (typeof fn === "function") {
        argument.default(defaultValue).argParser(fn);
      } else {
        argument.default(fn);
      }
      this.addArgument(argument);
      return this;
    }
    arguments(names) {
      names.trim().split(/ +/).forEach((detail) => {
        this.argument(detail);
      });
      return this;
    }
    addArgument(argument) {
      const previousArgument = this.registeredArguments.slice(-1)[0];
      if (previousArgument && previousArgument.variadic) {
        throw new Error(`only the last argument can be variadic '${previousArgument.name()}'`);
      }
      if (argument.required && argument.defaultValue !== undefined && argument.parseArg === undefined) {
        throw new Error(`a default value for a required argument is never used: '${argument.name()}'`);
      }
      this.registeredArguments.push(argument);
      return this;
    }
    addHelpCommand(enableOrNameAndArgs, description) {
      if (enableOrNameAndArgs === false) {
        this._addImplicitHelpCommand = false;
      } else {
        this._addImplicitHelpCommand = true;
        if (typeof enableOrNameAndArgs === "string") {
          this._helpCommandName = enableOrNameAndArgs.split(" ")[0];
          this._helpCommandnameAndArgs = enableOrNameAndArgs;
        }
        this._helpCommandDescription = description || this._helpCommandDescription;
      }
      return this;
    }
    _hasImplicitHelpCommand() {
      if (this._addImplicitHelpCommand === undefined) {
        return this.commands.length && !this._actionHandler && !this._findCommand("help");
      }
      return this._addImplicitHelpCommand;
    }
    hook(event, listener) {
      const allowedValues = ["preSubcommand", "preAction", "postAction"];
      if (!allowedValues.includes(event)) {
        throw new Error(`Unexpected value for event passed to hook : '${event}'.
Expecting one of '${allowedValues.join("', '")}'`);
      }
      if (this._lifeCycleHooks[event]) {
        this._lifeCycleHooks[event].push(listener);
      } else {
        this._lifeCycleHooks[event] = [listener];
      }
      return this;
    }
    exitOverride(fn) {
      if (fn) {
        this._exitCallback = fn;
      } else {
        this._exitCallback = (err) => {
          if (err.code !== "commander.executeSubCommandAsync") {
            throw err;
          } else {
          }
        };
      }
      return this;
    }
    _exit(exitCode, code, message) {
      if (this._exitCallback) {
        this._exitCallback(new CommanderError(exitCode, code, message));
      }
      process2.exit(exitCode);
    }
    action(fn) {
      const listener = (args) => {
        const expectedArgsCount = this.registeredArguments.length;
        const actionArgs = args.slice(0, expectedArgsCount);
        if (this._storeOptionsAsProperties) {
          actionArgs[expectedArgsCount] = this;
        } else {
          actionArgs[expectedArgsCount] = this.opts();
        }
        actionArgs.push(this);
        return fn.apply(this, actionArgs);
      };
      this._actionHandler = listener;
      return this;
    }
    createOption(flags, description) {
      return new Option(flags, description);
    }
    _callParseArg(target, value, previous, invalidArgumentMessage) {
      try {
        return target.parseArg(value, previous);
      } catch (err) {
        if (err.code === "commander.invalidArgument") {
          const message = `${invalidArgumentMessage} ${err.message}`;
          this.error(message, { exitCode: err.exitCode, code: err.code });
        }
        throw err;
      }
    }
    addOption(option) {
      const oname = option.name();
      const name = option.attributeName();
      if (option.negate) {
        const positiveLongFlag = option.long.replace(/^--no-/, "--");
        if (!this._findOption(positiveLongFlag)) {
          this.setOptionValueWithSource(name, option.defaultValue === undefined ? true : option.defaultValue, "default");
        }
      } else if (option.defaultValue !== undefined) {
        this.setOptionValueWithSource(name, option.defaultValue, "default");
      }
      this.options.push(option);
      const handleOptionValue = (val, invalidValueMessage, valueSource) => {
        if (val == null && option.presetArg !== undefined) {
          val = option.presetArg;
        }
        const oldValue = this.getOptionValue(name);
        if (val !== null && option.parseArg) {
          val = this._callParseArg(option, val, oldValue, invalidValueMessage);
        } else if (val !== null && option.variadic) {
          val = option._concatValue(val, oldValue);
        }
        if (val == null) {
          if (option.negate) {
            val = false;
          } else if (option.isBoolean() || option.optional) {
            val = true;
          } else {
            val = "";
          }
        }
        this.setOptionValueWithSource(name, val, valueSource);
      };
      this.on("option:" + oname, (val) => {
        const invalidValueMessage = `error: option '${option.flags}' argument '${val}' is invalid.`;
        handleOptionValue(val, invalidValueMessage, "cli");
      });
      if (option.envVar) {
        this.on("optionEnv:" + oname, (val) => {
          const invalidValueMessage = `error: option '${option.flags}' value '${val}' from env '${option.envVar}' is invalid.`;
          handleOptionValue(val, invalidValueMessage, "env");
        });
      }
      return this;
    }
    _optionEx(config, flags, description, fn, defaultValue) {
      if (typeof flags === "object" && flags instanceof Option) {
        throw new Error("To add an Option object use addOption() instead of option() or requiredOption()");
      }
      const option = this.createOption(flags, description);
      option.makeOptionMandatory(!!config.mandatory);
      if (typeof fn === "function") {
        option.default(defaultValue).argParser(fn);
      } else if (fn instanceof RegExp) {
        const regex = fn;
        fn = (val, def) => {
          const m = regex.exec(val);
          return m ? m[0] : def;
        };
        option.default(defaultValue).argParser(fn);
      } else {
        option.default(fn);
      }
      return this.addOption(option);
    }
    option(flags, description, parseArg, defaultValue) {
      return this._optionEx({}, flags, description, parseArg, defaultValue);
    }
    requiredOption(flags, description, parseArg, defaultValue) {
      return this._optionEx({ mandatory: true }, flags, description, parseArg, defaultValue);
    }
    combineFlagAndOptionalValue(combine = true) {
      this._combineFlagAndOptionalValue = !!combine;
      return this;
    }
    allowUnknownOption(allowUnknown = true) {
      this._allowUnknownOption = !!allowUnknown;
      return this;
    }
    allowExcessArguments(allowExcess = true) {
      this._allowExcessArguments = !!allowExcess;
      return this;
    }
    enablePositionalOptions(positional = true) {
      this._enablePositionalOptions = !!positional;
      return this;
    }
    passThroughOptions(passThrough = true) {
      this._passThroughOptions = !!passThrough;
      if (!!this.parent && passThrough && !this.parent._enablePositionalOptions) {
        throw new Error("passThroughOptions can not be used without turning on enablePositionalOptions for parent command(s)");
      }
      return this;
    }
    storeOptionsAsProperties(storeAsProperties = true) {
      if (this.options.length) {
        throw new Error("call .storeOptionsAsProperties() before adding options");
      }
      this._storeOptionsAsProperties = !!storeAsProperties;
      return this;
    }
    getOptionValue(key) {
      if (this._storeOptionsAsProperties) {
        return this[key];
      }
      return this._optionValues[key];
    }
    setOptionValue(key, value) {
      return this.setOptionValueWithSource(key, value, undefined);
    }
    setOptionValueWithSource(key, value, source) {
      if (this._storeOptionsAsProperties) {
        this[key] = value;
      } else {
        this._optionValues[key] = value;
      }
      this._optionValueSources[key] = source;
      return this;
    }
    getOptionValueSource(key) {
      return this._optionValueSources[key];
    }
    getOptionValueSourceWithGlobals(key) {
      let source;
      this._getCommandAndAncestors().forEach((cmd) => {
        if (cmd.getOptionValueSource(key) !== undefined) {
          source = cmd.getOptionValueSource(key);
        }
      });
      return source;
    }
    _prepareUserArgs(argv, parseOptions) {
      if (argv !== undefined && !Array.isArray(argv)) {
        throw new Error("first parameter to parse must be array or undefined");
      }
      parseOptions = parseOptions || {};
      if (argv === undefined) {
        argv = process2.argv;
        if (process2.versions && process2.versions.electron) {
          parseOptions.from = "electron";
        }
      }
      this.rawArgs = argv.slice();
      let userArgs;
      switch (parseOptions.from) {
        case undefined:
        case "node":
          this._scriptPath = argv[1];
          userArgs = argv.slice(2);
          break;
        case "electron":
          if (process2.defaultApp) {
            this._scriptPath = argv[1];
            userArgs = argv.slice(2);
          } else {
            userArgs = argv.slice(1);
          }
          break;
        case "user":
          userArgs = argv.slice(0);
          break;
        default:
          throw new Error(`unexpected parse option { from: '${parseOptions.from}' }`);
      }
      if (!this._name && this._scriptPath)
        this.nameFromFilename(this._scriptPath);
      this._name = this._name || "program";
      return userArgs;
    }
    parse(argv, parseOptions) {
      const userArgs = this._prepareUserArgs(argv, parseOptions);
      this._parseCommand([], userArgs);
      return this;
    }
    async parseAsync(argv, parseOptions) {
      const userArgs = this._prepareUserArgs(argv, parseOptions);
      await this._parseCommand([], userArgs);
      return this;
    }
    _executeSubCommand(subcommand, args) {
      args = args.slice();
      let launchWithNode = false;
      const sourceExt = [".js", ".ts", ".tsx", ".mjs", ".cjs"];
      function findFile(baseDir, baseName) {
        const localBin = path.resolve(baseDir, baseName);
        if (fs.existsSync(localBin))
          return localBin;
        if (sourceExt.includes(path.extname(baseName)))
          return;
        const foundExt = sourceExt.find((ext) => fs.existsSync(`${localBin}${ext}`));
        if (foundExt)
          return `${localBin}${foundExt}`;
        return;
      }
      this._checkForMissingMandatoryOptions();
      this._checkForConflictingOptions();
      let executableFile = subcommand._executableFile || `${this._name}-${subcommand._name}`;
      let executableDir = this._executableDir || "";
      if (this._scriptPath) {
        let resolvedScriptPath;
        try {
          resolvedScriptPath = fs.realpathSync(this._scriptPath);
        } catch (err) {
          resolvedScriptPath = this._scriptPath;
        }
        executableDir = path.resolve(path.dirname(resolvedScriptPath), executableDir);
      }
      if (executableDir) {
        let localFile = findFile(executableDir, executableFile);
        if (!localFile && !subcommand._executableFile && this._scriptPath) {
          const legacyName = path.basename(this._scriptPath, path.extname(this._scriptPath));
          if (legacyName !== this._name) {
            localFile = findFile(executableDir, `${legacyName}-${subcommand._name}`);
          }
        }
        executableFile = localFile || executableFile;
      }
      launchWithNode = sourceExt.includes(path.extname(executableFile));
      let proc;
      if (process2.platform !== "win32") {
        if (launchWithNode) {
          args.unshift(executableFile);
          args = incrementNodeInspectorPort(process2.execArgv).concat(args);
          proc = childProcess.spawn(process2.argv[0], args, { stdio: "inherit" });
        } else {
          proc = childProcess.spawn(executableFile, args, { stdio: "inherit" });
        }
      } else {
        args.unshift(executableFile);
        args = incrementNodeInspectorPort(process2.execArgv).concat(args);
        proc = childProcess.spawn(process2.execPath, args, { stdio: "inherit" });
      }
      if (!proc.killed) {
        const signals = ["SIGUSR1", "SIGUSR2", "SIGTERM", "SIGINT", "SIGHUP"];
        signals.forEach((signal) => {
          process2.on(signal, () => {
            if (proc.killed === false && proc.exitCode === null) {
              proc.kill(signal);
            }
          });
        });
      }
      const exitCallback = this._exitCallback;
      if (!exitCallback) {
        proc.on("close", process2.exit.bind(process2));
      } else {
        proc.on("close", () => {
          exitCallback(new CommanderError(process2.exitCode || 0, "commander.executeSubCommandAsync", "(close)"));
        });
      }
      proc.on("error", (err) => {
        if (err.code === "ENOENT") {
          const executableDirMessage = executableDir ? `searched for local subcommand relative to directory '${executableDir}'` : "no directory for search for local subcommand, use .executableDir() to supply a custom directory";
          const executableMissing = `'${executableFile}' does not exist
 - if '${subcommand._name}' is not meant to be an executable command, remove description parameter from '.command()' and use '.description()' instead
 - if the default executable name is not suitable, use the executableFile option to supply a custom name or path
 - ${executableDirMessage}`;
          throw new Error(executableMissing);
        } else if (err.code === "EACCES") {
          throw new Error(`'${executableFile}' not executable`);
        }
        if (!exitCallback) {
          process2.exit(1);
        } else {
          const wrappedError = new CommanderError(1, "commander.executeSubCommandAsync", "(error)");
          wrappedError.nestedError = err;
          exitCallback(wrappedError);
        }
      });
      this.runningCommand = proc;
    }
    _dispatchSubcommand(commandName, operands, unknown) {
      const subCommand = this._findCommand(commandName);
      if (!subCommand)
        this.help({ error: true });
      let promiseChain;
      promiseChain = this._chainOrCallSubCommandHook(promiseChain, subCommand, "preSubcommand");
      promiseChain = this._chainOrCall(promiseChain, () => {
        if (subCommand._executableHandler) {
          this._executeSubCommand(subCommand, operands.concat(unknown));
        } else {
          return subCommand._parseCommand(operands, unknown);
        }
      });
      return promiseChain;
    }
    _dispatchHelpCommand(subcommandName) {
      if (!subcommandName) {
        this.help();
      }
      const subCommand = this._findCommand(subcommandName);
      if (subCommand && !subCommand._executableHandler) {
        subCommand.help();
      }
      return this._dispatchSubcommand(subcommandName, [], [
        this._helpLongFlag || this._helpShortFlag
      ]);
    }
    _checkNumberOfArguments() {
      this.registeredArguments.forEach((arg, i) => {
        if (arg.required && this.args[i] == null) {
          this.missingArgument(arg.name());
        }
      });
      if (this.registeredArguments.length > 0 && this.registeredArguments[this.registeredArguments.length - 1].variadic) {
        return;
      }
      if (this.args.length > this.registeredArguments.length) {
        this._excessArguments(this.args);
      }
    }
    _processArguments() {
      const myParseArg = (argument, value, previous) => {
        let parsedValue = value;
        if (value !== null && argument.parseArg) {
          const invalidValueMessage = `error: command-argument value '${value}' is invalid for argument '${argument.name()}'.`;
          parsedValue = this._callParseArg(argument, value, previous, invalidValueMessage);
        }
        return parsedValue;
      };
      this._checkNumberOfArguments();
      const processedArgs = [];
      this.registeredArguments.forEach((declaredArg, index) => {
        let value = declaredArg.defaultValue;
        if (declaredArg.variadic) {
          if (index < this.args.length) {
            value = this.args.slice(index);
            if (declaredArg.parseArg) {
              value = value.reduce((processed, v) => {
                return myParseArg(declaredArg, v, processed);
              }, declaredArg.defaultValue);
            }
          } else if (value === undefined) {
            value = [];
          }
        } else if (index < this.args.length) {
          value = this.args[index];
          if (declaredArg.parseArg) {
            value = myParseArg(declaredArg, value, declaredArg.defaultValue);
          }
        }
        processedArgs[index] = value;
      });
      this.processedArgs = processedArgs;
    }
    _chainOrCall(promise, fn) {
      if (promise && promise.then && typeof promise.then === "function") {
        return promise.then(() => fn());
      }
      return fn();
    }
    _chainOrCallHooks(promise, event) {
      let result = promise;
      const hooks = [];
      this._getCommandAndAncestors().reverse().filter((cmd) => cmd._lifeCycleHooks[event] !== undefined).forEach((hookedCommand) => {
        hookedCommand._lifeCycleHooks[event].forEach((callback) => {
          hooks.push({ hookedCommand, callback });
        });
      });
      if (event === "postAction") {
        hooks.reverse();
      }
      hooks.forEach((hookDetail) => {
        result = this._chainOrCall(result, () => {
          return hookDetail.callback(hookDetail.hookedCommand, this);
        });
      });
      return result;
    }
    _chainOrCallSubCommandHook(promise, subCommand, event) {
      let result = promise;
      if (this._lifeCycleHooks[event] !== undefined) {
        this._lifeCycleHooks[event].forEach((hook) => {
          result = this._chainOrCall(result, () => {
            return hook(this, subCommand);
          });
        });
      }
      return result;
    }
    _parseCommand(operands, unknown) {
      const parsed = this.parseOptions(unknown);
      this._parseOptionsEnv();
      this._parseOptionsImplied();
      operands = operands.concat(parsed.operands);
      unknown = parsed.unknown;
      this.args = operands.concat(unknown);
      if (operands && this._findCommand(operands[0])) {
        return this._dispatchSubcommand(operands[0], operands.slice(1), unknown);
      }
      if (this._hasImplicitHelpCommand() && operands[0] === this._helpCommandName) {
        return this._dispatchHelpCommand(operands[1]);
      }
      if (this._defaultCommandName) {
        outputHelpIfRequested(this, unknown);
        return this._dispatchSubcommand(this._defaultCommandName, operands, unknown);
      }
      if (this.commands.length && this.args.length === 0 && !this._actionHandler && !this._defaultCommandName) {
        this.help({ error: true });
      }
      outputHelpIfRequested(this, parsed.unknown);
      this._checkForMissingMandatoryOptions();
      this._checkForConflictingOptions();
      const checkForUnknownOptions = () => {
        if (parsed.unknown.length > 0) {
          this.unknownOption(parsed.unknown[0]);
        }
      };
      const commandEvent = `command:${this.name()}`;
      if (this._actionHandler) {
        checkForUnknownOptions();
        this._processArguments();
        let promiseChain;
        promiseChain = this._chainOrCallHooks(promiseChain, "preAction");
        promiseChain = this._chainOrCall(promiseChain, () => this._actionHandler(this.processedArgs));
        if (this.parent) {
          promiseChain = this._chainOrCall(promiseChain, () => {
            this.parent.emit(commandEvent, operands, unknown);
          });
        }
        promiseChain = this._chainOrCallHooks(promiseChain, "postAction");
        return promiseChain;
      }
      if (this.parent && this.parent.listenerCount(commandEvent)) {
        checkForUnknownOptions();
        this._processArguments();
        this.parent.emit(commandEvent, operands, unknown);
      } else if (operands.length) {
        if (this._findCommand("*")) {
          return this._dispatchSubcommand("*", operands, unknown);
        }
        if (this.listenerCount("command:*")) {
          this.emit("command:*", operands, unknown);
        } else if (this.commands.length) {
          this.unknownCommand();
        } else {
          checkForUnknownOptions();
          this._processArguments();
        }
      } else if (this.commands.length) {
        checkForUnknownOptions();
        this.help({ error: true });
      } else {
        checkForUnknownOptions();
        this._processArguments();
      }
    }
    _findCommand(name) {
      if (!name)
        return;
      return this.commands.find((cmd) => cmd._name === name || cmd._aliases.includes(name));
    }
    _findOption(arg) {
      return this.options.find((option) => option.is(arg));
    }
    _checkForMissingMandatoryOptions() {
      this._getCommandAndAncestors().forEach((cmd) => {
        cmd.options.forEach((anOption) => {
          if (anOption.mandatory && cmd.getOptionValue(anOption.attributeName()) === undefined) {
            cmd.missingMandatoryOptionValue(anOption);
          }
        });
      });
    }
    _checkForConflictingLocalOptions() {
      const definedNonDefaultOptions = this.options.filter((option) => {
        const optionKey = option.attributeName();
        if (this.getOptionValue(optionKey) === undefined) {
          return false;
        }
        return this.getOptionValueSource(optionKey) !== "default";
      });
      const optionsWithConflicting = definedNonDefaultOptions.filter((option) => option.conflictsWith.length > 0);
      optionsWithConflicting.forEach((option) => {
        const conflictingAndDefined = definedNonDefaultOptions.find((defined) => option.conflictsWith.includes(defined.attributeName()));
        if (conflictingAndDefined) {
          this._conflictingOption(option, conflictingAndDefined);
        }
      });
    }
    _checkForConflictingOptions() {
      this._getCommandAndAncestors().forEach((cmd) => {
        cmd._checkForConflictingLocalOptions();
      });
    }
    parseOptions(argv) {
      const operands = [];
      const unknown = [];
      let dest = operands;
      const args = argv.slice();
      function maybeOption(arg) {
        return arg.length > 1 && arg[0] === "-";
      }
      let activeVariadicOption = null;
      while (args.length) {
        const arg = args.shift();
        if (arg === "--") {
          if (dest === unknown)
            dest.push(arg);
          dest.push(...args);
          break;
        }
        if (activeVariadicOption && !maybeOption(arg)) {
          this.emit(`option:${activeVariadicOption.name()}`, arg);
          continue;
        }
        activeVariadicOption = null;
        if (maybeOption(arg)) {
          const option = this._findOption(arg);
          if (option) {
            if (option.required) {
              const value = args.shift();
              if (value === undefined)
                this.optionMissingArgument(option);
              this.emit(`option:${option.name()}`, value);
            } else if (option.optional) {
              let value = null;
              if (args.length > 0 && !maybeOption(args[0])) {
                value = args.shift();
              }
              this.emit(`option:${option.name()}`, value);
            } else {
              this.emit(`option:${option.name()}`);
            }
            activeVariadicOption = option.variadic ? option : null;
            continue;
          }
        }
        if (arg.length > 2 && arg[0] === "-" && arg[1] !== "-") {
          const option = this._findOption(`-${arg[1]}`);
          if (option) {
            if (option.required || option.optional && this._combineFlagAndOptionalValue) {
              this.emit(`option:${option.name()}`, arg.slice(2));
            } else {
              this.emit(`option:${option.name()}`);
              args.unshift(`-${arg.slice(2)}`);
            }
            continue;
          }
        }
        if (/^--[^=]+=/.test(arg)) {
          const index = arg.indexOf("=");
          const option = this._findOption(arg.slice(0, index));
          if (option && (option.required || option.optional)) {
            this.emit(`option:${option.name()}`, arg.slice(index + 1));
            continue;
          }
        }
        if (maybeOption(arg)) {
          dest = unknown;
        }
        if ((this._enablePositionalOptions || this._passThroughOptions) && operands.length === 0 && unknown.length === 0) {
          if (this._findCommand(arg)) {
            operands.push(arg);
            if (args.length > 0)
              unknown.push(...args);
            break;
          } else if (arg === this._helpCommandName && this._hasImplicitHelpCommand()) {
            operands.push(arg);
            if (args.length > 0)
              operands.push(...args);
            break;
          } else if (this._defaultCommandName) {
            unknown.push(arg);
            if (args.length > 0)
              unknown.push(...args);
            break;
          }
        }
        if (this._passThroughOptions) {
          dest.push(arg);
          if (args.length > 0)
            dest.push(...args);
          break;
        }
        dest.push(arg);
      }
      return { operands, unknown };
    }
    opts() {
      if (this._storeOptionsAsProperties) {
        const result = {};
        const len = this.options.length;
        for (let i = 0;i < len; i++) {
          const key = this.options[i].attributeName();
          result[key] = key === this._versionOptionName ? this._version : this[key];
        }
        return result;
      }
      return this._optionValues;
    }
    optsWithGlobals() {
      return this._getCommandAndAncestors().reduce((combinedOptions, cmd) => Object.assign(combinedOptions, cmd.opts()), {});
    }
    error(message, errorOptions) {
      this._outputConfiguration.outputError(`${message}\n`, this._outputConfiguration.writeErr);
      if (typeof this._showHelpAfterError === "string") {
        this._outputConfiguration.writeErr(`${this._showHelpAfterError}\n`);
      } else if (this._showHelpAfterError) {
        this._outputConfiguration.writeErr("\n");
        this.outputHelp({ error: true });
      }
      const config = errorOptions || {};
      const exitCode = config.exitCode || 1;
      const code = config.code || "commander.error";
      this._exit(exitCode, code, message);
    }
    _parseOptionsEnv() {
      this.options.forEach((option) => {
        if (option.envVar && (option.envVar in process2.env)) {
          const optionKey = option.attributeName();
          if (this.getOptionValue(optionKey) === undefined || ["default", "config", "env"].includes(this.getOptionValueSource(optionKey))) {
            if (option.required || option.optional) {
              this.emit(`optionEnv:${option.name()}`, process2.env[option.envVar]);
            } else {
              this.emit(`optionEnv:${option.name()}`);
            }
          }
        }
      });
    }
    _parseOptionsImplied() {
      const dualHelper = new DualOptions(this.options);
      const hasCustomOptionValue = (optionKey) => {
        return this.getOptionValue(optionKey) !== undefined && !["default", "implied"].includes(this.getOptionValueSource(optionKey));
      };
      this.options.filter((option) => option.implied !== undefined && hasCustomOptionValue(option.attributeName()) && dualHelper.valueFromOption(this.getOptionValue(option.attributeName()), option)).forEach((option) => {
        Object.keys(option.implied).filter((impliedKey) => !hasCustomOptionValue(impliedKey)).forEach((impliedKey) => {
          this.setOptionValueWithSource(impliedKey, option.implied[impliedKey], "implied");
        });
      });
    }
    missingArgument(name) {
      const message = `error: missing required argument '${name}'`;
      this.error(message, { code: "commander.missingArgument" });
    }
    optionMissingArgument(option) {
      const message = `error: option '${option.flags}' argument missing`;
      this.error(message, { code: "commander.optionMissingArgument" });
    }
    missingMandatoryOptionValue(option) {
      const message = `error: required option '${option.flags}' not specified`;
      this.error(message, { code: "commander.missingMandatoryOptionValue" });
    }
    _conflictingOption(option, conflictingOption) {
      const findBestOptionFromValue = (option2) => {
        const optionKey = option2.attributeName();
        const optionValue = this.getOptionValue(optionKey);
        const negativeOption = this.options.find((target) => target.negate && optionKey === target.attributeName());
        const positiveOption = this.options.find((target) => !target.negate && optionKey === target.attributeName());
        if (negativeOption && (negativeOption.presetArg === undefined && optionValue === false || negativeOption.presetArg !== undefined && optionValue === negativeOption.presetArg)) {
          return negativeOption;
        }
        return positiveOption || option2;
      };
      const getErrorMessage = (option2) => {
        const bestOption = findBestOptionFromValue(option2);
        const optionKey = bestOption.attributeName();
        const source = this.getOptionValueSource(optionKey);
        if (source === "env") {
          return `environment variable '${bestOption.envVar}'`;
        }
        return `option '${bestOption.flags}'`;
      };
      const message = `error: ${getErrorMessage(option)} cannot be used with ${getErrorMessage(conflictingOption)}`;
      this.error(message, { code: "commander.conflictingOption" });
    }
    unknownOption(flag) {
      if (this._allowUnknownOption)
        return;
      let suggestion = "";
      if (flag.startsWith("--") && this._showSuggestionAfterError) {
        let candidateFlags = [];
        let command = this;
        do {
          const moreFlags = command.createHelp().visibleOptions(command).filter((option) => option.long).map((option) => option.long);
          candidateFlags = candidateFlags.concat(moreFlags);
          command = command.parent;
        } while (command && !command._enablePositionalOptions);
        suggestion = suggestSimilar(flag, candidateFlags);
      }
      const message = `error: unknown option '${flag}'${suggestion}`;
      this.error(message, { code: "commander.unknownOption" });
    }
    _excessArguments(receivedArgs) {
      if (this._allowExcessArguments)
        return;
      const expected = this.registeredArguments.length;
      const s = expected === 1 ? "" : "s";
      const forSubcommand = this.parent ? ` for '${this.name()}'` : "";
      const message = `error: too many arguments${forSubcommand}. Expected ${expected} argument${s} but got ${receivedArgs.length}.`;
      this.error(message, { code: "commander.excessArguments" });
    }
    unknownCommand() {
      const unknownName = this.args[0];
      let suggestion = "";
      if (this._showSuggestionAfterError) {
        const candidateNames = [];
        this.createHelp().visibleCommands(this).forEach((command) => {
          candidateNames.push(command.name());
          if (command.alias())
            candidateNames.push(command.alias());
        });
        suggestion = suggestSimilar(unknownName, candidateNames);
      }
      const message = `error: unknown command '${unknownName}'${suggestion}`;
      this.error(message, { code: "commander.unknownCommand" });
    }
    version(str, flags, description) {
      if (str === undefined)
        return this._version;
      this._version = str;
      flags = flags || "-V, --version";
      description = description || "output the version number";
      const versionOption = this.createOption(flags, description);
      this._versionOptionName = versionOption.attributeName();
      this.options.push(versionOption);
      this.on("option:" + versionOption.name(), () => {
        this._outputConfiguration.writeOut(`${str}\n`);
        this._exit(0, "commander.version", str);
      });
      return this;
    }
    description(str, argsDescription) {
      if (str === undefined && argsDescription === undefined)
        return this._description;
      this._description = str;
      if (argsDescription) {
        this._argsDescription = argsDescription;
      }
      return this;
    }
    summary(str) {
      if (str === undefined)
        return this._summary;
      this._summary = str;
      return this;
    }
    alias(alias) {
      if (alias === undefined)
        return this._aliases[0];
      let command = this;
      if (this.commands.length !== 0 && this.commands[this.commands.length - 1]._executableHandler) {
        command = this.commands[this.commands.length - 1];
      }
      if (alias === command._name)
        throw new Error("Command alias can\'t be the same as its name");
      command._aliases.push(alias);
      return this;
    }
    aliases(aliases) {
      if (aliases === undefined)
        return this._aliases;
      aliases.forEach((alias) => this.alias(alias));
      return this;
    }
    usage(str) {
      if (str === undefined) {
        if (this._usage)
          return this._usage;
        const args = this.registeredArguments.map((arg) => {
          return humanReadableArgName(arg);
        });
        return [].concat(this.options.length || this._hasHelpOption ? "[options]" : [], this.commands.length ? "[command]" : [], this.registeredArguments.length ? args : []).join(" ");
      }
      this._usage = str;
      return this;
    }
    name(str) {
      if (str === undefined)
        return this._name;
      this._name = str;
      return this;
    }
    nameFromFilename(filename) {
      this._name = path.basename(filename, path.extname(filename));
      return this;
    }
    executableDir(path2) {
      if (path2 === undefined)
        return this._executableDir;
      this._executableDir = path2;
      return this;
    }
    helpInformation(contextOptions) {
      const helper = this.createHelp();
      if (helper.helpWidth === undefined) {
        helper.helpWidth = contextOptions && contextOptions.error ? this._outputConfiguration.getErrHelpWidth() : this._outputConfiguration.getOutHelpWidth();
      }
      return helper.formatHelp(this, helper);
    }
    _getHelpContext(contextOptions) {
      contextOptions = contextOptions || {};
      const context = { error: !!contextOptions.error };
      let write;
      if (context.error) {
        write = (arg) => this._outputConfiguration.writeErr(arg);
      } else {
        write = (arg) => this._outputConfiguration.writeOut(arg);
      }
      context.write = contextOptions.write || write;
      context.command = this;
      return context;
    }
    outputHelp(contextOptions) {
      let deprecatedCallback;
      if (typeof contextOptions === "function") {
        deprecatedCallback = contextOptions;
        contextOptions = undefined;
      }
      const context = this._getHelpContext(contextOptions);
      this._getCommandAndAncestors().reverse().forEach((command) => command.emit("beforeAllHelp", context));
      this.emit("beforeHelp", context);
      let helpInformation = this.helpInformation(context);
      if (deprecatedCallback) {
        helpInformation = deprecatedCallback(helpInformation);
        if (typeof helpInformation !== "string" && !Buffer.isBuffer(helpInformation)) {
          throw new Error("outputHelp callback must return a string or a Buffer");
        }
      }
      context.write(helpInformation);
      if (this._helpLongFlag) {
        this.emit(this._helpLongFlag);
      }
      this.emit("afterHelp", context);
      this._getCommandAndAncestors().forEach((command) => command.emit("afterAllHelp", context));
    }
    helpOption(flags, description) {
      if (typeof flags === "boolean") {
        this._hasHelpOption = flags;
        return this;
      }
      this._helpFlags = flags || this._helpFlags;
      this._helpDescription = description || this._helpDescription;
      const helpFlags = splitOptionFlags(this._helpFlags);
      this._helpShortFlag = helpFlags.shortFlag;
      this._helpLongFlag = helpFlags.longFlag;
      return this;
    }
    help(contextOptions) {
      this.outputHelp(contextOptions);
      let exitCode = process2.exitCode || 0;
      if (exitCode === 0 && contextOptions && typeof contextOptions !== "function" && contextOptions.error) {
        exitCode = 1;
      }
      this._exit(exitCode, "commander.help", "(outputHelp)");
    }
    addHelpText(position, text) {
      const allowedValues = ["beforeAll", "before", "after", "afterAll"];
      if (!allowedValues.includes(position)) {
        throw new Error(`Unexpected value for position to addHelpText.
Expecting one of '${allowedValues.join("', '")}'`);
      }
      const helpEvent = `${position}Help`;
      this.on(helpEvent, (context) => {
        let helpStr;
        if (typeof text === "function") {
          helpStr = text({ error: context.error, command: context.command });
        } else {
          helpStr = text;
        }
        if (helpStr) {
          context.write(`${helpStr}\n`);
        }
      });
      return this;
    }
  }
  exports.Command = Command;
});

// node_modules/commander/index.js
var require_commander = __commonJS((exports, module) => {
  var { Argument } = require_argument();
  var { Command } = require_command();
  var { CommanderError, InvalidArgumentError } = require_error();
  var { Help } = require_help();
  var { Option } = require_option();
  exports = module.exports = new Command;
  exports.program = exports;
  exports.Command = Command;
  exports.Option = Option;
  exports.Argument = Argument;
  exports.Help = Help;
  exports.CommanderError = CommanderError;
  exports.InvalidArgumentError = InvalidArgumentError;
  exports.InvalidOptionArgumentError = InvalidArgumentError;
});

// node_modules/lodash/_isPrototype.js
var require__isPrototype = __commonJS((exports, module) => {
  var isPrototype = function(value) {
    var Ctor = value && value.constructor, proto = typeof Ctor == "function" && Ctor.prototype || objectProto;
    return value === proto;
  };
  var objectProto = Object.prototype;
  module.exports = isPrototype;
});

// node_modules/lodash/_overArg.js
var require__overArg = __commonJS((exports, module) => {
  var overArg = function(func, transform) {
    return function(arg) {
      return func(transform(arg));
    };
  };
  module.exports = overArg;
});

// node_modules/lodash/_nativeKeys.js
var require__nativeKeys = __commonJS((exports, module) => {
  var overArg = require__overArg();
  var nativeKeys = overArg(Object.keys, Object);
  module.exports = nativeKeys;
});

// node_modules/lodash/_baseKeys.js
var require__baseKeys = __commonJS((exports, module) => {
  var baseKeys = function(object) {
    if (!isPrototype(object)) {
      return nativeKeys(object);
    }
    var result = [];
    for (var key in Object(object)) {
      if (hasOwnProperty.call(object, key) && key != "constructor") {
        result.push(key);
      }
    }
    return result;
  };
  var isPrototype = require__isPrototype();
  var nativeKeys = require__nativeKeys();
  var objectProto = Object.prototype;
  var hasOwnProperty = objectProto.hasOwnProperty;
  module.exports = baseKeys;
});

// node_modules/lodash/_freeGlobal.js
var require__freeGlobal = __commonJS((exports, module) => {
  var freeGlobal = typeof global == "object" && global && global.Object === Object && global;
  module.exports = freeGlobal;
});

// node_modules/lodash/_root.js
var require__root = __commonJS((exports, module) => {
  var freeGlobal = require__freeGlobal();
  var freeSelf = typeof self == "object" && self && self.Object === Object && self;
  var root = freeGlobal || freeSelf || Function("return this")();
  module.exports = root;
});

// node_modules/lodash/_Symbol.js
var require__Symbol = __commonJS((exports, module) => {
  var root = require__root();
  var Symbol2 = root.Symbol;
  module.exports = Symbol2;
});

// node_modules/lodash/_getRawTag.js
var require__getRawTag = __commonJS((exports, module) => {
  var getRawTag = function(value) {
    var isOwn = hasOwnProperty.call(value, symToStringTag), tag = value[symToStringTag];
    try {
      value[symToStringTag] = undefined;
      var unmasked = true;
    } catch (e) {
    }
    var result = nativeObjectToString.call(value);
    if (unmasked) {
      if (isOwn) {
        value[symToStringTag] = tag;
      } else {
        delete value[symToStringTag];
      }
    }
    return result;
  };
  var Symbol2 = require__Symbol();
  var objectProto = Object.prototype;
  var hasOwnProperty = objectProto.hasOwnProperty;
  var nativeObjectToString = objectProto.toString;
  var symToStringTag = Symbol2 ? Symbol2.toStringTag : undefined;
  module.exports = getRawTag;
});

// node_modules/lodash/_objectToString.js
var require__objectToString = __commonJS((exports, module) => {
  var objectToString = function(value) {
    return nativeObjectToString.call(value);
  };
  var objectProto = Object.prototype;
  var nativeObjectToString = objectProto.toString;
  module.exports = objectToString;
});

// node_modules/lodash/_baseGetTag.js
var require__baseGetTag = __commonJS((exports, module) => {
  var baseGetTag = function(value) {
    if (value == null) {
      return value === undefined ? undefinedTag : nullTag;
    }
    return symToStringTag && (symToStringTag in Object(value)) ? getRawTag(value) : objectToString(value);
  };
  var Symbol2 = require__Symbol();
  var getRawTag = require__getRawTag();
  var objectToString = require__objectToString();
  var nullTag = "[object Null]";
  var undefinedTag = "[object Undefined]";
  var symToStringTag = Symbol2 ? Symbol2.toStringTag : undefined;
  module.exports = baseGetTag;
});

// node_modules/lodash/isObject.js
var require_isObject = __commonJS((exports, module) => {
  var isObject = function(value) {
    var type = typeof value;
    return value != null && (type == "object" || type == "function");
  };
  module.exports = isObject;
});

// node_modules/lodash/isFunction.js
var require_isFunction = __commonJS((exports, module) => {
  var isFunction = function(value) {
    if (!isObject(value)) {
      return false;
    }
    var tag = baseGetTag(value);
    return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
  };
  var baseGetTag = require__baseGetTag();
  var isObject = require_isObject();
  var asyncTag = "[object AsyncFunction]";
  var funcTag = "[object Function]";
  var genTag = "[object GeneratorFunction]";
  var proxyTag = "[object Proxy]";
  module.exports = isFunction;
});

// node_modules/lodash/_coreJsData.js
var require__coreJsData = __commonJS((exports, module) => {
  var root = require__root();
  var coreJsData = root["__core-js_shared__"];
  module.exports = coreJsData;
});

// node_modules/lodash/_isMasked.js
var require__isMasked = __commonJS((exports, module) => {
  var isMasked = function(func) {
    return !!maskSrcKey && (maskSrcKey in func);
  };
  var coreJsData = require__coreJsData();
  var maskSrcKey = function() {
    var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || "");
    return uid ? "Symbol(src)_1." + uid : "";
  }();
  module.exports = isMasked;
});

// node_modules/lodash/_toSource.js
var require__toSource = __commonJS((exports, module) => {
  var toSource = function(func) {
    if (func != null) {
      try {
        return funcToString.call(func);
      } catch (e) {
      }
      try {
        return func + "";
      } catch (e) {
      }
    }
    return "";
  };
  var funcProto = Function.prototype;
  var funcToString = funcProto.toString;
  module.exports = toSource;
});

// node_modules/lodash/_baseIsNative.js
var require__baseIsNative = __commonJS((exports, module) => {
  var baseIsNative = function(value) {
    if (!isObject(value) || isMasked(value)) {
      return false;
    }
    var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
    return pattern.test(toSource(value));
  };
  var isFunction = require_isFunction();
  var isMasked = require__isMasked();
  var isObject = require_isObject();
  var toSource = require__toSource();
  var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
  var reIsHostCtor = /^\[object .+?Constructor\]$/;
  var funcProto = Function.prototype;
  var objectProto = Object.prototype;
  var funcToString = funcProto.toString;
  var hasOwnProperty = objectProto.hasOwnProperty;
  var reIsNative = RegExp("^" + funcToString.call(hasOwnProperty).replace(reRegExpChar, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$");
  module.exports = baseIsNative;
});

// node_modules/lodash/_getValue.js
var require__getValue = __commonJS((exports, module) => {
  var getValue = function(object, key) {
    return object == null ? undefined : object[key];
  };
  module.exports = getValue;
});

// node_modules/lodash/_getNative.js
var require__getNative = __commonJS((exports, module) => {
  var getNative = function(object, key) {
    var value = getValue(object, key);
    return baseIsNative(value) ? value : undefined;
  };
  var baseIsNative = require__baseIsNative();
  var getValue = require__getValue();
  module.exports = getNative;
});

// node_modules/lodash/_DataView.js
var require__DataView = __commonJS((exports, module) => {
  var getNative = require__getNative();
  var root = require__root();
  var DataView = getNative(root, "DataView");
  module.exports = DataView;
});

// node_modules/lodash/_Map.js
var require__Map = __commonJS((exports, module) => {
  var getNative = require__getNative();
  var root = require__root();
  var Map2 = getNative(root, "Map");
  module.exports = Map2;
});

// node_modules/lodash/_Promise.js
var require__Promise = __commonJS((exports, module) => {
  var getNative = require__getNative();
  var root = require__root();
  var Promise2 = getNative(root, "Promise");
  module.exports = Promise2;
});

// node_modules/lodash/_Set.js
var require__Set = __commonJS((exports, module) => {
  var getNative = require__getNative();
  var root = require__root();
  var Set2 = getNative(root, "Set");
  module.exports = Set2;
});

// node_modules/lodash/_WeakMap.js
var require__WeakMap = __commonJS((exports, module) => {
  var getNative = require__getNative();
  var root = require__root();
  var WeakMap2 = getNative(root, "WeakMap");
  module.exports = WeakMap2;
});

// node_modules/lodash/_getTag.js
var require__getTag = __commonJS((exports, module) => {
  var DataView = require__DataView();
  var Map2 = require__Map();
  var Promise2 = require__Promise();
  var Set2 = require__Set();
  var WeakMap2 = require__WeakMap();
  var baseGetTag = require__baseGetTag();
  var toSource = require__toSource();
  var mapTag = "[object Map]";
  var objectTag = "[object Object]";
  var promiseTag = "[object Promise]";
  var setTag = "[object Set]";
  var weakMapTag = "[object WeakMap]";
  var dataViewTag = "[object DataView]";
  var dataViewCtorString = toSource(DataView);
  var mapCtorString = toSource(Map2);
  var promiseCtorString = toSource(Promise2);
  var setCtorString = toSource(Set2);
  var weakMapCtorString = toSource(WeakMap2);
  var getTag = baseGetTag;
  if (DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag || Map2 && getTag(new Map2) != mapTag || Promise2 && getTag(Promise2.resolve()) != promiseTag || Set2 && getTag(new Set2) != setTag || WeakMap2 && getTag(new WeakMap2) != weakMapTag) {
    getTag = function(value) {
      var result = baseGetTag(value), Ctor = result == objectTag ? value.constructor : undefined, ctorString = Ctor ? toSource(Ctor) : "";
      if (ctorString) {
        switch (ctorString) {
          case dataViewCtorString:
            return dataViewTag;
          case mapCtorString:
            return mapTag;
          case promiseCtorString:
            return promiseTag;
          case setCtorString:
            return setTag;
          case weakMapCtorString:
            return weakMapTag;
        }
      }
      return result;
    };
  }
  module.exports = getTag;
});

// node_modules/lodash/isObjectLike.js
var require_isObjectLike = __commonJS((exports, module) => {
  var isObjectLike = function(value) {
    return value != null && typeof value == "object";
  };
  module.exports = isObjectLike;
});

// node_modules/lodash/_baseIsArguments.js
var require__baseIsArguments = __commonJS((exports, module) => {
  var baseIsArguments = function(value) {
    return isObjectLike(value) && baseGetTag(value) == argsTag;
  };
  var baseGetTag = require__baseGetTag();
  var isObjectLike = require_isObjectLike();
  var argsTag = "[object Arguments]";
  module.exports = baseIsArguments;
});

// node_modules/lodash/isArguments.js
var require_isArguments = __commonJS((exports, module) => {
  var baseIsArguments = require__baseIsArguments();
  var isObjectLike = require_isObjectLike();
  var objectProto = Object.prototype;
  var hasOwnProperty = objectProto.hasOwnProperty;
  var propertyIsEnumerable = objectProto.propertyIsEnumerable;
  var isArguments = baseIsArguments(function() {
    return arguments;
  }()) ? baseIsArguments : function(value) {
    return isObjectLike(value) && hasOwnProperty.call(value, "callee") && !propertyIsEnumerable.call(value, "callee");
  };
  module.exports = isArguments;
});

// node_modules/lodash/isArray.js
var require_isArray = __commonJS((exports, module) => {
  var isArray = Array.isArray;
  module.exports = isArray;
});

// node_modules/lodash/isLength.js
var require_isLength = __commonJS((exports, module) => {
  var isLength = function(value) {
    return typeof value == "number" && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
  };
  var MAX_SAFE_INTEGER = 9007199254740991;
  module.exports = isLength;
});

// node_modules/lodash/isArrayLike.js
var require_isArrayLike = __commonJS((exports, module) => {
  var isArrayLike = function(value) {
    return value != null && isLength(value.length) && !isFunction(value);
  };
  var isFunction = require_isFunction();
  var isLength = require_isLength();
  module.exports = isArrayLike;
});

// node_modules/lodash/stubFalse.js
var require_stubFalse = __commonJS((exports, module) => {
  var stubFalse = function() {
    return false;
  };
  module.exports = stubFalse;
});

// node_modules/lodash/isBuffer.js
var require_isBuffer = __commonJS((exports, module) => {
  var root = require__root();
  var stubFalse = require_stubFalse();
  var freeExports = typeof exports == "object" && exports && !exports.nodeType && exports;
  var freeModule = freeExports && typeof module == "object" && module && !module.nodeType && module;
  var moduleExports = freeModule && freeModule.exports === freeExports;
  var Buffer2 = moduleExports ? root.Buffer : undefined;
  var nativeIsBuffer = Buffer2 ? Buffer2.isBuffer : undefined;
  var isBuffer = nativeIsBuffer || stubFalse;
  module.exports = isBuffer;
});

// node_modules/lodash/_baseIsTypedArray.js
var require__baseIsTypedArray = __commonJS((exports, module) => {
  var baseIsTypedArray = function(value) {
    return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
  };
  var baseGetTag = require__baseGetTag();
  var isLength = require_isLength();
  var isObjectLike = require_isObjectLike();
  var argsTag = "[object Arguments]";
  var arrayTag = "[object Array]";
  var boolTag = "[object Boolean]";
  var dateTag = "[object Date]";
  var errorTag = "[object Error]";
  var funcTag = "[object Function]";
  var mapTag = "[object Map]";
  var numberTag = "[object Number]";
  var objectTag = "[object Object]";
  var regexpTag = "[object RegExp]";
  var setTag = "[object Set]";
  var stringTag = "[object String]";
  var weakMapTag = "[object WeakMap]";
  var arrayBufferTag = "[object ArrayBuffer]";
  var dataViewTag = "[object DataView]";
  var float32Tag = "[object Float32Array]";
  var float64Tag = "[object Float64Array]";
  var int8Tag = "[object Int8Array]";
  var int16Tag = "[object Int16Array]";
  var int32Tag = "[object Int32Array]";
  var uint8Tag = "[object Uint8Array]";
  var uint8ClampedTag = "[object Uint8ClampedArray]";
  var uint16Tag = "[object Uint16Array]";
  var uint32Tag = "[object Uint32Array]";
  var typedArrayTags = {};
  typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
  typedArrayTags[argsTag] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] = typedArrayTags[dataViewTag] = typedArrayTags[dateTag] = typedArrayTags[errorTag] = typedArrayTags[funcTag] = typedArrayTags[mapTag] = typedArrayTags[numberTag] = typedArrayTags[objectTag] = typedArrayTags[regexpTag] = typedArrayTags[setTag] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;
  module.exports = baseIsTypedArray;
});

// node_modules/lodash/_baseUnary.js
var require__baseUnary = __commonJS((exports, module) => {
  var baseUnary = function(func) {
    return function(value) {
      return func(value);
    };
  };
  module.exports = baseUnary;
});

// node_modules/lodash/_nodeUtil.js
var require__nodeUtil = __commonJS((exports, module) => {
  var freeGlobal = require__freeGlobal();
  var freeExports = typeof exports == "object" && exports && !exports.nodeType && exports;
  var freeModule = freeExports && typeof module == "object" && module && !module.nodeType && module;
  var moduleExports = freeModule && freeModule.exports === freeExports;
  var freeProcess = moduleExports && freeGlobal.process;
  var nodeUtil = function() {
    try {
      var types = freeModule && freeModule.require && freeModule.require("util").types;
      if (types) {
        return types;
      }
      return freeProcess && freeProcess.binding && freeProcess.binding("util");
    } catch (e) {
    }
  }();
  module.exports = nodeUtil;
});

// node_modules/lodash/isTypedArray.js
var require_isTypedArray = __commonJS((exports, module) => {
  var baseIsTypedArray = require__baseIsTypedArray();
  var baseUnary = require__baseUnary();
  var nodeUtil = require__nodeUtil();
  var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;
  var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;
  module.exports = isTypedArray;
});

// node_modules/lodash/isEmpty.js
var require_isEmpty = __commonJS((exports, module) => {
  var isEmpty = function(value) {
    if (value == null) {
      return true;
    }
    if (isArrayLike(value) && (isArray(value) || typeof value == "string" || typeof value.splice == "function" || isBuffer(value) || isTypedArray(value) || isArguments(value))) {
      return !value.length;
    }
    var tag = getTag(value);
    if (tag == mapTag || tag == setTag) {
      return !value.size;
    }
    if (isPrototype(value)) {
      return !baseKeys(value).length;
    }
    for (var key in value) {
      if (hasOwnProperty.call(value, key)) {
        return false;
      }
    }
    return true;
  };
  var baseKeys = require__baseKeys();
  var getTag = require__getTag();
  var isArguments = require_isArguments();
  var isArray = require_isArray();
  var isArrayLike = require_isArrayLike();
  var isBuffer = require_isBuffer();
  var isPrototype = require__isPrototype();
  var isTypedArray = require_isTypedArray();
  var mapTag = "[object Map]";
  var setTag = "[object Set]";
  var objectProto = Object.prototype;
  var hasOwnProperty = objectProto.hasOwnProperty;
  module.exports = isEmpty;
});

// node_modules/cli-table3/src/debug.js
var require_debug = __commonJS((exports, module) => {
  var messages = [];
  var level2 = 0;
  var debug2 = (msg, min) => {
    if (level2 >= min) {
      messages.push(msg);
    }
  };
  debug2.WARN = 1;
  debug2.INFO = 2;
  debug2.DEBUG = 3;
  debug2.reset = () => {
    messages = [];
  };
  debug2.setDebugLevel = (v) => {
    level2 = v;
  };
  debug2.warn = (msg) => debug2(msg, debug2.WARN);
  debug2.info = (msg) => debug2(msg, debug2.INFO);
  debug2.debug = (msg) => debug2(msg, debug2.DEBUG);
  debug2.debugMessages = () => messages;
  module.exports = debug2;
});

// node_modules/ansi-regex/index.js
var require_ansi_regex = __commonJS((exports, module) => {
  module.exports = ({ onlyFirst = false } = {}) => {
    const pattern = [
      "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)",
      "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))"
    ].join("|");
    return new RegExp(pattern, onlyFirst ? undefined : "g");
  };
});

// node_modules/strip-ansi/index.js
var require_strip_ansi = __commonJS((exports, module) => {
  var ansiRegex = require_ansi_regex();
  module.exports = (string) => typeof string === "string" ? string.replace(ansiRegex(), "") : string;
});

// node_modules/is-fullwidth-code-point/index.js
var require_is_fullwidth_code_point = __commonJS((exports, module) => {
  var isFullwidthCodePoint = (codePoint) => {
    if (Number.isNaN(codePoint)) {
      return false;
    }
    if (codePoint >= 4352 && (codePoint <= 4447 || codePoint === 9001 || codePoint === 9002 || 11904 <= codePoint && codePoint <= 12871 && codePoint !== 12351 || 12880 <= codePoint && codePoint <= 19903 || 19968 <= codePoint && codePoint <= 42182 || 43360 <= codePoint && codePoint <= 43388 || 44032 <= codePoint && codePoint <= 55203 || 63744 <= codePoint && codePoint <= 64255 || 65040 <= codePoint && codePoint <= 65049 || 65072 <= codePoint && codePoint <= 65131 || 65281 <= codePoint && codePoint <= 65376 || 65504 <= codePoint && codePoint <= 65510 || 110592 <= codePoint && codePoint <= 110593 || 127488 <= codePoint && codePoint <= 127569 || 131072 <= codePoint && codePoint <= 262141)) {
      return true;
    }
    return false;
  };
  module.exports = isFullwidthCodePoint;
  module.exports.default = isFullwidthCodePoint;
});

// node_modules/emoji-regex/index.js
var require_emoji_regex = __commonJS((exports, module) => {
  module.exports = function() {
    return /\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62(?:\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67|\uDB40\uDC73\uDB40\uDC63\uDB40\uDC74|\uDB40\uDC77\uDB40\uDC6C\uDB40\uDC73)\uDB40\uDC7F|\uD83D\uDC68(?:\uD83C\uDFFC\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68\uD83C\uDFFB|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFE])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFE\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFD])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFC])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83D\uDC68|(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D[\uDC66\uDC67])|[\u2695\u2696\u2708]\uFE0F|\uD83D[\uDC66\uDC67]|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|(?:\uD83C\uDFFB\u200D[\u2695\u2696\u2708]|\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708])\uFE0F|\uD83C\uDFFB\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C[\uDFFB-\uDFFF])|(?:\uD83E\uDDD1\uD83C\uDFFB\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFC\u200D\uD83E\uDD1D\u200D\uD83D\uDC69)\uD83C\uDFFB|\uD83E\uDDD1(?:\uD83C\uDFFF\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1(?:\uD83C[\uDFFB-\uDFFF])|\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1)|(?:\uD83E\uDDD1\uD83C\uDFFE\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFF\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFB-\uDFFE])|(?:\uD83E\uDDD1\uD83C\uDFFC\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFD\u200D\uD83E\uDD1D\u200D\uD83D\uDC69)(?:\uD83C[\uDFFB\uDFFC])|\uD83D\uDC69(?:\uD83C\uDFFE\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFD\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFC\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFD-\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFB\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFC-\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD]))|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|(?:\uD83E\uDDD1\uD83C\uDFFD\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFE\u200D\uD83E\uDD1D\u200D\uD83D\uDC69)(?:\uD83C[\uDFFB-\uDFFD])|\uD83D\uDC69\u200D\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D[\uDC66\uDC67])|(?:\uD83D\uDC41\uFE0F\u200D\uD83D\uDDE8|\uD83D\uDC69(?:\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708]|\uD83C\uDFFB\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])|(?:(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)\uFE0F|\uD83D\uDC6F|\uD83E[\uDD3C\uDDDE\uDDDF])\u200D[\u2640\u2642]|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642]|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD6-\uDDDD])(?:(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642]|\u200D[\u2640\u2642])|\uD83C\uDFF4\u200D\u2620)\uFE0F|\uD83D\uDC69\u200D\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|\uD83C\uDFF3\uFE0F\u200D\uD83C\uDF08|\uD83D\uDC15\u200D\uD83E\uDDBA|\uD83D\uDC69\u200D\uD83D\uDC66|\uD83D\uDC69\u200D\uD83D\uDC67|\uD83C\uDDFD\uD83C\uDDF0|\uD83C\uDDF4\uD83C\uDDF2|\uD83C\uDDF6\uD83C\uDDE6|[#\*0-9]\uFE0F\u20E3|\uD83C\uDDE7(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEF\uDDF1-\uDDF4\uDDF6-\uDDF9\uDDFB\uDDFC\uDDFE\uDDFF])|\uD83C\uDDF9(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDED\uDDEF-\uDDF4\uDDF7\uDDF9\uDDFB\uDDFC\uDDFF])|\uD83C\uDDEA(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDED\uDDF7-\uDDFA])|\uD83E\uDDD1(?:\uD83C[\uDFFB-\uDFFF])|\uD83C\uDDF7(?:\uD83C[\uDDEA\uDDF4\uDDF8\uDDFA\uDDFC])|\uD83D\uDC69(?:\uD83C[\uDFFB-\uDFFF])|\uD83C\uDDF2(?:\uD83C[\uDDE6\uDDE8-\uDDED\uDDF0-\uDDFF])|\uD83C\uDDE6(?:\uD83C[\uDDE8-\uDDEC\uDDEE\uDDF1\uDDF2\uDDF4\uDDF6-\uDDFA\uDDFC\uDDFD\uDDFF])|\uD83C\uDDF0(?:\uD83C[\uDDEA\uDDEC-\uDDEE\uDDF2\uDDF3\uDDF5\uDDF7\uDDFC\uDDFE\uDDFF])|\uD83C\uDDED(?:\uD83C[\uDDF0\uDDF2\uDDF3\uDDF7\uDDF9\uDDFA])|\uD83C\uDDE9(?:\uD83C[\uDDEA\uDDEC\uDDEF\uDDF0\uDDF2\uDDF4\uDDFF])|\uD83C\uDDFE(?:\uD83C[\uDDEA\uDDF9])|\uD83C\uDDEC(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEE\uDDF1-\uDDF3\uDDF5-\uDDFA\uDDFC\uDDFE])|\uD83C\uDDF8(?:\uD83C[\uDDE6-\uDDEA\uDDEC-\uDDF4\uDDF7-\uDDF9\uDDFB\uDDFD-\uDDFF])|\uD83C\uDDEB(?:\uD83C[\uDDEE-\uDDF0\uDDF2\uDDF4\uDDF7])|\uD83C\uDDF5(?:\uD83C[\uDDE6\uDDEA-\uDDED\uDDF0-\uDDF3\uDDF7-\uDDF9\uDDFC\uDDFE])|\uD83C\uDDFB(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDEE\uDDF3\uDDFA])|\uD83C\uDDF3(?:\uD83C[\uDDE6\uDDE8\uDDEA-\uDDEC\uDDEE\uDDF1\uDDF4\uDDF5\uDDF7\uDDFA\uDDFF])|\uD83C\uDDE8(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDEE\uDDF0-\uDDF5\uDDF7\uDDFA-\uDDFF])|\uD83C\uDDF1(?:\uD83C[\uDDE6-\uDDE8\uDDEE\uDDF0\uDDF7-\uDDFB\uDDFE])|\uD83C\uDDFF(?:\uD83C[\uDDE6\uDDF2\uDDFC])|\uD83C\uDDFC(?:\uD83C[\uDDEB\uDDF8])|\uD83C\uDDFA(?:\uD83C[\uDDE6\uDDEC\uDDF2\uDDF3\uDDF8\uDDFE\uDDFF])|\uD83C\uDDEE(?:\uD83C[\uDDE8-\uDDEA\uDDF1-\uDDF4\uDDF6-\uDDF9])|\uD83C\uDDEF(?:\uD83C[\uDDEA\uDDF2\uDDF4\uDDF5])|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u261D\u270A-\u270D]|\uD83C[\uDF85\uDFC2\uDFC7]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC6B-\uDC6D\uDC70\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDCAA\uDD74\uDD7A\uDD90\uDD95\uDD96\uDE4C\uDE4F\uDEC0\uDECC]|\uD83E[\uDD0F\uDD18-\uDD1C\uDD1E\uDD1F\uDD30-\uDD36\uDDB5\uDDB6\uDDBB\uDDD2-\uDDD5])(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u231A\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD\u25FE\u2614\u2615\u2648-\u2653\u267F\u2693\u26A1\u26AA\u26AB\u26BD\u26BE\u26C4\u26C5\u26CE\u26D4\u26EA\u26F2\u26F3\u26F5\u26FA\u26FD\u2705\u270A\u270B\u2728\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B1B\u2B1C\u2B50\u2B55]|\uD83C[\uDC04\uDCCF\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF7C\uDF7E-\uDF93\uDFA0-\uDFCA\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF4\uDFF8-\uDFFF]|\uD83D[\uDC00-\uDC3E\uDC40\uDC42-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDD7A\uDD95\uDD96\uDDA4\uDDFB-\uDE4F\uDE80-\uDEC5\uDECC\uDED0-\uDED2\uDED5\uDEEB\uDEEC\uDEF4-\uDEFA\uDFE0-\uDFEB]|\uD83E[\uDD0D-\uDD3A\uDD3C-\uDD45\uDD47-\uDD71\uDD73-\uDD76\uDD7A-\uDDA2\uDDA5-\uDDAA\uDDAE-\uDDCA\uDDCD-\uDDFF\uDE70-\uDE73\uDE78-\uDE7A\uDE80-\uDE82\uDE90-\uDE95])|(?:[#\*0-9\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23E9-\u23F3\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB-\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u261D\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u2648-\u2653\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u267F\u2692-\u2697\u2699\u269B\u269C\u26A0\u26A1\u26AA\u26AB\u26B0\u26B1\u26BD\u26BE\u26C4\u26C5\u26C8\u26CE\u26CF\u26D1\u26D3\u26D4\u26E9\u26EA\u26F0-\u26F5\u26F7-\u26FA\u26FD\u2702\u2705\u2708-\u270D\u270F\u2712\u2714\u2716\u271D\u2721\u2728\u2733\u2734\u2744\u2747\u274C\u274E\u2753-\u2755\u2757\u2763\u2764\u2795-\u2797\u27A1\u27B0\u27BF\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B50\u2B55\u3030\u303D\u3297\u3299]|\uD83C[\uDC04\uDCCF\uDD70\uDD71\uDD7E\uDD7F\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE02\uDE1A\uDE2F\uDE32-\uDE3A\uDE50\uDE51\uDF00-\uDF21\uDF24-\uDF93\uDF96\uDF97\uDF99-\uDF9B\uDF9E-\uDFF0\uDFF3-\uDFF5\uDFF7-\uDFFF]|\uD83D[\uDC00-\uDCFD\uDCFF-\uDD3D\uDD49-\uDD4E\uDD50-\uDD67\uDD6F\uDD70\uDD73-\uDD7A\uDD87\uDD8A-\uDD8D\uDD90\uDD95\uDD96\uDDA4\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA-\uDE4F\uDE80-\uDEC5\uDECB-\uDED2\uDED5\uDEE0-\uDEE5\uDEE9\uDEEB\uDEEC\uDEF0\uDEF3-\uDEFA\uDFE0-\uDFEB]|\uD83E[\uDD0D-\uDD3A\uDD3C-\uDD45\uDD47-\uDD71\uDD73-\uDD76\uDD7A-\uDDA2\uDDA5-\uDDAA\uDDAE-\uDDCA\uDDCD-\uDDFF\uDE70-\uDE73\uDE78-\uDE7A\uDE80-\uDE82\uDE90-\uDE95])\uFE0F|(?:[\u261D\u26F9\u270A-\u270D]|\uD83C[\uDF85\uDFC2-\uDFC4\uDFC7\uDFCA-\uDFCC]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66-\uDC78\uDC7C\uDC81-\uDC83\uDC85-\uDC87\uDC8F\uDC91\uDCAA\uDD74\uDD75\uDD7A\uDD90\uDD95\uDD96\uDE45-\uDE47\uDE4B-\uDE4F\uDEA3\uDEB4-\uDEB6\uDEC0\uDECC]|\uD83E[\uDD0F\uDD18-\uDD1F\uDD26\uDD30-\uDD39\uDD3C-\uDD3E\uDDB5\uDDB6\uDDB8\uDDB9\uDDBB\uDDCD-\uDDCF\uDDD1-\uDDDD])/g;
  };
});

// node_modules/string-width/index.js
var require_string_width = __commonJS((exports, module) => {
  var stripAnsi = require_strip_ansi();
  var isFullwidthCodePoint = require_is_fullwidth_code_point();
  var emojiRegex = require_emoji_regex();
  var stringWidth = (string) => {
    if (typeof string !== "string" || string.length === 0) {
      return 0;
    }
    string = stripAnsi(string);
    if (string.length === 0) {
      return 0;
    }
    string = string.replace(emojiRegex(), "  ");
    let width = 0;
    for (let i = 0;i < string.length; i++) {
      const code = string.codePointAt(i);
      if (code <= 31 || code >= 127 && code <= 159) {
        continue;
      }
      if (code >= 768 && code <= 879) {
        continue;
      }
      if (code > 65535) {
        i++;
      }
      width += isFullwidthCodePoint(code) ? 2 : 1;
    }
    return width;
  };
  module.exports = stringWidth;
  module.exports.default = stringWidth;
});

// node_modules/cli-table3/src/utils.js
var require_utils = __commonJS((exports, module) => {
  var codeRegex = function(capture) {
    return capture ? /\u001b\[((?:\d*;){0,5}\d*)m/g : /\u001b\[(?:\d*;){0,5}\d*m/g;
  };
  var strlen = function(str) {
    let code = codeRegex();
    let stripped = ("" + str).replace(code, "");
    let split = stripped.split("\n");
    return split.reduce(function(memo, s) {
      return stringWidth(s) > memo ? stringWidth(s) : memo;
    }, 0);
  };
  var repeat = function(str, times) {
    return Array(times + 1).join(str);
  };
  var pad = function(str, len, pad2, dir) {
    let length = strlen(str);
    if (len + 1 >= length) {
      let padlen = len - length;
      switch (dir) {
        case "right": {
          str = repeat(pad2, padlen) + str;
          break;
        }
        case "center": {
          let right = Math.ceil(padlen / 2);
          let left = padlen - right;
          str = repeat(pad2, left) + str + repeat(pad2, right);
          break;
        }
        default: {
          str = str + repeat(pad2, padlen);
          break;
        }
      }
    }
    return str;
  };
  var addToCodeCache = function(name, on, off) {
    on = "\x1B[" + on + "m";
    off = "\x1B[" + off + "m";
    codeCache[on] = { set: name, to: true };
    codeCache[off] = { set: name, to: false };
    codeCache[name] = { on, off };
  };
  var updateState = function(state, controlChars) {
    let controlCode = controlChars[1] ? parseInt(controlChars[1].split(";")[0]) : 0;
    if (controlCode >= 30 && controlCode <= 39 || controlCode >= 90 && controlCode <= 97) {
      state.lastForegroundAdded = controlChars[0];
      return;
    }
    if (controlCode >= 40 && controlCode <= 49 || controlCode >= 100 && controlCode <= 107) {
      state.lastBackgroundAdded = controlChars[0];
      return;
    }
    if (controlCode === 0) {
      for (let i in state) {
        if (Object.prototype.hasOwnProperty.call(state, i)) {
          delete state[i];
        }
      }
      return;
    }
    let info = codeCache[controlChars[0]];
    if (info) {
      state[info.set] = info.to;
    }
  };
  var readState = function(line) {
    let code = codeRegex(true);
    let controlChars = code.exec(line);
    let state = {};
    while (controlChars !== null) {
      updateState(state, controlChars);
      controlChars = code.exec(line);
    }
    return state;
  };
  var unwindState = function(state, ret) {
    let lastBackgroundAdded = state.lastBackgroundAdded;
    let lastForegroundAdded = state.lastForegroundAdded;
    delete state.lastBackgroundAdded;
    delete state.lastForegroundAdded;
    Object.keys(state).forEach(function(key) {
      if (state[key]) {
        ret += codeCache[key].off;
      }
    });
    if (lastBackgroundAdded && lastBackgroundAdded != "\x1B[49m") {
      ret += "\x1B[49m";
    }
    if (lastForegroundAdded && lastForegroundAdded != "\x1B[39m") {
      ret += "\x1B[39m";
    }
    return ret;
  };
  var rewindState = function(state, ret) {
    let lastBackgroundAdded = state.lastBackgroundAdded;
    let lastForegroundAdded = state.lastForegroundAdded;
    delete state.lastBackgroundAdded;
    delete state.lastForegroundAdded;
    Object.keys(state).forEach(function(key) {
      if (state[key]) {
        ret = codeCache[key].on + ret;
      }
    });
    if (lastBackgroundAdded && lastBackgroundAdded != "\x1B[49m") {
      ret = lastBackgroundAdded + ret;
    }
    if (lastForegroundAdded && lastForegroundAdded != "\x1B[39m") {
      ret = lastForegroundAdded + ret;
    }
    return ret;
  };
  var truncateWidth = function(str, desiredLength) {
    if (str.length === strlen(str)) {
      return str.substr(0, desiredLength);
    }
    while (strlen(str) > desiredLength) {
      str = str.slice(0, -1);
    }
    return str;
  };
  var truncateWidthWithAnsi = function(str, desiredLength) {
    let code = codeRegex(true);
    let split = str.split(codeRegex());
    let splitIndex = 0;
    let retLen = 0;
    let ret = "";
    let myArray;
    let state = {};
    while (retLen < desiredLength) {
      myArray = code.exec(str);
      let toAdd = split[splitIndex];
      splitIndex++;
      if (retLen + strlen(toAdd) > desiredLength) {
        toAdd = truncateWidth(toAdd, desiredLength - retLen);
      }
      ret += toAdd;
      retLen += strlen(toAdd);
      if (retLen < desiredLength) {
        if (!myArray) {
          break;
        }
        ret += myArray[0];
        updateState(state, myArray);
      }
    }
    return unwindState(state, ret);
  };
  var truncate = function(str, desiredLength, truncateChar) {
    truncateChar = truncateChar || "\u2026";
    let lengthOfStr = strlen(str);
    if (lengthOfStr <= desiredLength) {
      return str;
    }
    desiredLength -= strlen(truncateChar);
    let ret = truncateWidthWithAnsi(str, desiredLength);
    return ret + truncateChar;
  };
  var defaultOptions = function() {
    return {
      chars: {
        top: "\u2500",
        "top-mid": "\u252C",
        "top-left": "\u250C",
        "top-right": "\u2510",
        bottom: "\u2500",
        "bottom-mid": "\u2534",
        "bottom-left": "\u2514",
        "bottom-right": "\u2518",
        left: "\u2502",
        "left-mid": "\u251C",
        mid: "\u2500",
        "mid-mid": "\u253C",
        right: "\u2502",
        "right-mid": "\u2524",
        middle: "\u2502"
      },
      truncate: "\u2026",
      colWidths: [],
      rowHeights: [],
      colAligns: [],
      rowAligns: [],
      style: {
        "padding-left": 1,
        "padding-right": 1,
        head: ["red"],
        border: ["grey"],
        compact: false
      },
      head: []
    };
  };
  var mergeOptions = function(options2, defaults) {
    options2 = options2 || {};
    defaults = defaults || defaultOptions();
    let ret = Object.assign({}, defaults, options2);
    ret.chars = Object.assign({}, defaults.chars, options2.chars);
    ret.style = Object.assign({}, defaults.style, options2.style);
    return ret;
  };
  var wordWrap = function(maxLength, input) {
    let lines = [];
    let split = input.split(/(\s+)/g);
    let line = [];
    let lineLength = 0;
    let whitespace;
    for (let i = 0;i < split.length; i += 2) {
      let word = split[i];
      let newLength = lineLength + strlen(word);
      if (lineLength > 0 && whitespace) {
        newLength += whitespace.length;
      }
      if (newLength > maxLength) {
        if (lineLength !== 0) {
          lines.push(line.join(""));
        }
        line = [word];
        lineLength = strlen(word);
      } else {
        line.push(whitespace || "", word);
        lineLength = newLength;
      }
      whitespace = split[i + 1];
    }
    if (lineLength) {
      lines.push(line.join(""));
    }
    return lines;
  };
  var textWrap = function(maxLength, input) {
    let lines = [];
    let line = "";
    function pushLine(str, ws) {
      if (line.length && ws)
        line += ws;
      line += str;
      while (line.length > maxLength) {
        lines.push(line.slice(0, maxLength));
        line = line.slice(maxLength);
      }
    }
    let split = input.split(/(\s+)/g);
    for (let i = 0;i < split.length; i += 2) {
      pushLine(split[i], i && split[i - 1]);
    }
    if (line.length)
      lines.push(line);
    return lines;
  };
  var multiLineWordWrap = function(maxLength, input, wrapOnWordBoundary = true) {
    let output = [];
    input = input.split("\n");
    const handler = wrapOnWordBoundary ? wordWrap : textWrap;
    for (let i = 0;i < input.length; i++) {
      output.push.apply(output, handler(maxLength, input[i]));
    }
    return output;
  };
  var colorizeLines = function(input) {
    let state = {};
    let output = [];
    for (let i = 0;i < input.length; i++) {
      let line = rewindState(state, input[i]);
      state = readState(line);
      let temp = Object.assign({}, state);
      output.push(unwindState(temp, line));
    }
    return output;
  };
  var hyperlink = function(url, text) {
    const OSC = "\x1B]";
    const BEL = "\x07";
    const SEP = ";";
    return [OSC, "8", SEP, SEP, url || text, BEL, text, OSC, "8", SEP, SEP, BEL].join("");
  };
  var stringWidth = require_string_width();
  var codeCache = {};
  addToCodeCache("bold", 1, 22);
  addToCodeCache("italics", 3, 23);
  addToCodeCache("underline", 4, 24);
  addToCodeCache("inverse", 7, 27);
  addToCodeCache("strikethrough", 9, 29);
  module.exports = {
    strlen,
    repeat,
    pad,
    truncate,
    mergeOptions,
    wordWrap: multiLineWordWrap,
    colorizeLines,
    hyperlink
  };
});

// node_modules/@colors/colors/lib/styles.js
var require_styles = __commonJS((exports, module) => {
  var styles3 = {};
  module["exports"] = styles3;
  var codes = {
    reset: [0, 0],
    bold: [1, 22],
    dim: [2, 22],
    italic: [3, 23],
    underline: [4, 24],
    inverse: [7, 27],
    hidden: [8, 28],
    strikethrough: [9, 29],
    black: [30, 39],
    red: [31, 39],
    green: [32, 39],
    yellow: [33, 39],
    blue: [34, 39],
    magenta: [35, 39],
    cyan: [36, 39],
    white: [37, 39],
    gray: [90, 39],
    grey: [90, 39],
    brightRed: [91, 39],
    brightGreen: [92, 39],
    brightYellow: [93, 39],
    brightBlue: [94, 39],
    brightMagenta: [95, 39],
    brightCyan: [96, 39],
    brightWhite: [97, 39],
    bgBlack: [40, 49],
    bgRed: [41, 49],
    bgGreen: [42, 49],
    bgYellow: [43, 49],
    bgBlue: [44, 49],
    bgMagenta: [45, 49],
    bgCyan: [46, 49],
    bgWhite: [47, 49],
    bgGray: [100, 49],
    bgGrey: [100, 49],
    bgBrightRed: [101, 49],
    bgBrightGreen: [102, 49],
    bgBrightYellow: [103, 49],
    bgBrightBlue: [104, 49],
    bgBrightMagenta: [105, 49],
    bgBrightCyan: [106, 49],
    bgBrightWhite: [107, 49],
    blackBG: [40, 49],
    redBG: [41, 49],
    greenBG: [42, 49],
    yellowBG: [43, 49],
    blueBG: [44, 49],
    magentaBG: [45, 49],
    cyanBG: [46, 49],
    whiteBG: [47, 49]
  };
  Object.keys(codes).forEach(function(key) {
    var val = codes[key];
    var style = styles3[key] = [];
    style.open = "\x1B[" + val[0] + "m";
    style.close = "\x1B[" + val[1] + "m";
  });
});

// node_modules/@colors/colors/lib/system/has-flag.js
var require_has_flag = __commonJS((exports, module) => {
  module.exports = function(flag, argv) {
    argv = argv || process.argv;
    var terminatorPos = argv.indexOf("--");
    var prefix = /^-{1,2}/.test(flag) ? "" : "--";
    var pos = argv.indexOf(prefix + flag);
    return pos !== -1 && (terminatorPos === -1 ? true : pos < terminatorPos);
  };
});

// node_modules/@colors/colors/lib/system/supports-colors.js
var require_supports_colors = __commonJS((exports, module) => {
  var translateLevel = function(level2) {
    if (level2 === 0) {
      return false;
    }
    return {
      level: level2,
      hasBasic: true,
      has256: level2 >= 2,
      has16m: level2 >= 3
    };
  };
  var supportsColor2 = function(stream) {
    if (forceColor === false) {
      return 0;
    }
    if (hasFlag("color=16m") || hasFlag("color=full") || hasFlag("color=truecolor")) {
      return 3;
    }
    if (hasFlag("color=256")) {
      return 2;
    }
    if (stream && !stream.isTTY && forceColor !== true) {
      return 0;
    }
    var min = forceColor ? 1 : 0;
    if (process.platform === "win32") {
      var osRelease = os.release().split(".");
      if (Number(process.versions.node.split(".")[0]) >= 8 && Number(osRelease[0]) >= 10 && Number(osRelease[2]) >= 10586) {
        return Number(osRelease[2]) >= 14931 ? 3 : 2;
      }
      return 1;
    }
    if ("CI" in env) {
      if (["TRAVIS", "CIRCLECI", "APPVEYOR", "GITLAB_CI"].some(function(sign) {
        return sign in env;
      }) || env.CI_NAME === "codeship") {
        return 1;
      }
      return min;
    }
    if ("TEAMCITY_VERSION" in env) {
      return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
    }
    if ("TERM_PROGRAM" in env) {
      var version2 = parseInt((env.TERM_PROGRAM_VERSION || "").split(".")[0], 10);
      switch (env.TERM_PROGRAM) {
        case "iTerm.app":
          return version2 >= 3 ? 3 : 2;
        case "Hyper":
          return 3;
        case "Apple_Terminal":
          return 2;
      }
    }
    if (/-256(color)?$/i.test(env.TERM)) {
      return 2;
    }
    if (/^screen|^xterm|^vt100|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) {
      return 1;
    }
    if ("COLORTERM" in env) {
      return 1;
    }
    if (env.TERM === "dumb") {
      return min;
    }
    return min;
  };
  var getSupportLevel = function(stream) {
    var level2 = supportsColor2(stream);
    return translateLevel(level2);
  };
  var os = import.meta.require("os");
  var hasFlag = require_has_flag();
  var env = process.env;
  var forceColor = undefined;
  if (hasFlag("no-color") || hasFlag("no-colors") || hasFlag("color=false")) {
    forceColor = false;
  } else if (hasFlag("color") || hasFlag("colors") || hasFlag("color=true") || hasFlag("color=always")) {
    forceColor = true;
  }
  if ("FORCE_COLOR" in env) {
    forceColor = env.FORCE_COLOR.length === 0 || parseInt(env.FORCE_COLOR, 10) !== 0;
  }
  module.exports = {
    supportsColor: getSupportLevel,
    stdout: getSupportLevel(process.stdout),
    stderr: getSupportLevel(process.stderr)
  };
});

// node_modules/@colors/colors/lib/custom/trap.js
var require_trap = __commonJS((exports, module) => {
  module["exports"] = function runTheTrap(text, options2) {
    var result = "";
    text = text || "Run the trap, drop the bass";
    text = text.split("");
    var trap = {
      a: ["@", "\u0104", "\u023A", "\u0245", "\u0394", "\u039B", "\u0414"],
      b: ["\xDF", "\u0181", "\u0243", "\u026E", "\u03B2", "\u0E3F"],
      c: ["\xA9", "\u023B", "\u03FE"],
      d: ["\xD0", "\u018A", "\u0500", "\u0501", "\u0502", "\u0503"],
      e: [
        "\xCB",
        "\u0115",
        "\u018E",
        "\u0258",
        "\u03A3",
        "\u03BE",
        "\u04BC",
        "\u0A6C"
      ],
      f: ["\u04FA"],
      g: ["\u0262"],
      h: ["\u0126", "\u0195", "\u04A2", "\u04BA", "\u04C7", "\u050A"],
      i: ["\u0F0F"],
      j: ["\u0134"],
      k: ["\u0138", "\u04A0", "\u04C3", "\u051E"],
      l: ["\u0139"],
      m: ["\u028D", "\u04CD", "\u04CE", "\u0520", "\u0521", "\u0D69"],
      n: ["\xD1", "\u014B", "\u019D", "\u0376", "\u03A0", "\u048A"],
      o: [
        "\xD8",
        "\xF5",
        "\xF8",
        "\u01FE",
        "\u0298",
        "\u047A",
        "\u05DD",
        "\u06DD",
        "\u0E4F"
      ],
      p: ["\u01F7", "\u048E"],
      q: ["\u09CD"],
      r: ["\xAE", "\u01A6", "\u0210", "\u024C", "\u0280", "\u042F"],
      s: ["\xA7", "\u03DE", "\u03DF", "\u03E8"],
      t: ["\u0141", "\u0166", "\u0373"],
      u: ["\u01B1", "\u054D"],
      v: ["\u05D8"],
      w: ["\u0428", "\u0460", "\u047C", "\u0D70"],
      x: ["\u04B2", "\u04FE", "\u04FC", "\u04FD"],
      y: ["\xA5", "\u04B0", "\u04CB"],
      z: ["\u01B5", "\u0240"]
    };
    text.forEach(function(c) {
      c = c.toLowerCase();
      var chars = trap[c] || [" "];
      var rand = Math.floor(Math.random() * chars.length);
      if (typeof trap[c] !== "undefined") {
        result += trap[c][rand];
      } else {
        result += c;
      }
    });
    return result;
  };
});

// node_modules/@colors/colors/lib/custom/zalgo.js
var require_zalgo = __commonJS((exports, module) => {
  module["exports"] = function zalgo(text, options2) {
    text = text || "   he is here   ";
    var soul = {
      up: [
        "\u030D",
        "\u030E",
        "\u0304",
        "\u0305",
        "\u033F",
        "\u0311",
        "\u0306",
        "\u0310",
        "\u0352",
        "\u0357",
        "\u0351",
        "\u0307",
        "\u0308",
        "\u030A",
        "\u0342",
        "\u0313",
        "\u0308",
        "\u034A",
        "\u034B",
        "\u034C",
        "\u0303",
        "\u0302",
        "\u030C",
        "\u0350",
        "\u0300",
        "\u0301",
        "\u030B",
        "\u030F",
        "\u0312",
        "\u0313",
        "\u0314",
        "\u033D",
        "\u0309",
        "\u0363",
        "\u0364",
        "\u0365",
        "\u0366",
        "\u0367",
        "\u0368",
        "\u0369",
        "\u036A",
        "\u036B",
        "\u036C",
        "\u036D",
        "\u036E",
        "\u036F",
        "\u033E",
        "\u035B",
        "\u0346",
        "\u031A"
      ],
      down: [
        "\u0316",
        "\u0317",
        "\u0318",
        "\u0319",
        "\u031C",
        "\u031D",
        "\u031E",
        "\u031F",
        "\u0320",
        "\u0324",
        "\u0325",
        "\u0326",
        "\u0329",
        "\u032A",
        "\u032B",
        "\u032C",
        "\u032D",
        "\u032E",
        "\u032F",
        "\u0330",
        "\u0331",
        "\u0332",
        "\u0333",
        "\u0339",
        "\u033A",
        "\u033B",
        "\u033C",
        "\u0345",
        "\u0347",
        "\u0348",
        "\u0349",
        "\u034D",
        "\u034E",
        "\u0353",
        "\u0354",
        "\u0355",
        "\u0356",
        "\u0359",
        "\u035A",
        "\u0323"
      ],
      mid: [
        "\u0315",
        "\u031B",
        "\u0300",
        "\u0301",
        "\u0358",
        "\u0321",
        "\u0322",
        "\u0327",
        "\u0328",
        "\u0334",
        "\u0335",
        "\u0336",
        "\u035C",
        "\u035D",
        "\u035E",
        "\u035F",
        "\u0360",
        "\u0362",
        "\u0338",
        "\u0337",
        "\u0361",
        " \u0489"
      ]
    };
    var all = [].concat(soul.up, soul.down, soul.mid);
    function randomNumber(range) {
      var r = Math.floor(Math.random() * range);
      return r;
    }
    function isChar(character) {
      var bool = false;
      all.filter(function(i) {
        bool = i === character;
      });
      return bool;
    }
    function heComes(text2, options3) {
      var result = "";
      var counts;
      var l;
      options3 = options3 || {};
      options3["up"] = typeof options3["up"] !== "undefined" ? options3["up"] : true;
      options3["mid"] = typeof options3["mid"] !== "undefined" ? options3["mid"] : true;
      options3["down"] = typeof options3["down"] !== "undefined" ? options3["down"] : true;
      options3["size"] = typeof options3["size"] !== "undefined" ? options3["size"] : "maxi";
      text2 = text2.split("");
      for (l in text2) {
        if (isChar(l)) {
          continue;
        }
        result = result + text2[l];
        counts = { up: 0, down: 0, mid: 0 };
        switch (options3.size) {
          case "mini":
            counts.up = randomNumber(8);
            counts.mid = randomNumber(2);
            counts.down = randomNumber(8);
            break;
          case "maxi":
            counts.up = randomNumber(16) + 3;
            counts.mid = randomNumber(4) + 1;
            counts.down = randomNumber(64) + 3;
            break;
          default:
            counts.up = randomNumber(8) + 1;
            counts.mid = randomNumber(6) / 2;
            counts.down = randomNumber(8) + 1;
            break;
        }
        var arr = ["up", "mid", "down"];
        for (var d in arr) {
          var index = arr[d];
          for (var i = 0;i <= counts[index]; i++) {
            if (options3[index]) {
              result = result + soul[index][randomNumber(soul[index].length)];
            }
          }
        }
      }
      return result;
    }
    return heComes(text, options2);
  };
});

// node_modules/@colors/colors/lib/maps/america.js
var require_america = __commonJS((exports, module) => {
  module["exports"] = function(colors) {
    return function(letter, i, exploded) {
      if (letter === " ")
        return letter;
      switch (i % 3) {
        case 0:
          return colors.red(letter);
        case 1:
          return colors.white(letter);
        case 2:
          return colors.blue(letter);
      }
    };
  };
});

// node_modules/@colors/colors/lib/maps/zebra.js
var require_zebra = __commonJS((exports, module) => {
  module["exports"] = function(colors) {
    return function(letter, i, exploded) {
      return i % 2 === 0 ? letter : colors.inverse(letter);
    };
  };
});

// node_modules/@colors/colors/lib/maps/rainbow.js
var require_rainbow = __commonJS((exports, module) => {
  module["exports"] = function(colors) {
    var rainbowColors = ["red", "yellow", "green", "blue", "magenta"];
    return function(letter, i, exploded) {
      if (letter === " ") {
        return letter;
      } else {
        return colors[rainbowColors[i++ % rainbowColors.length]](letter);
      }
    };
  };
});

// node_modules/@colors/colors/lib/maps/random.js
var require_random = __commonJS((exports, module) => {
  module["exports"] = function(colors) {
    var available = [
      "underline",
      "inverse",
      "grey",
      "yellow",
      "red",
      "green",
      "blue",
      "white",
      "cyan",
      "magenta",
      "brightYellow",
      "brightRed",
      "brightGreen",
      "brightBlue",
      "brightWhite",
      "brightCyan",
      "brightMagenta"
    ];
    return function(letter, i, exploded) {
      return letter === " " ? letter : colors[available[Math.round(Math.random() * (available.length - 2))]](letter);
    };
  };
});

// node_modules/@colors/colors/lib/colors.js
var require_colors = __commonJS((exports, module) => {
  var build = function(_styles) {
    var builder = function builder() {
      return applyStyle2.apply(builder, arguments);
    };
    builder._styles = _styles;
    builder.__proto__ = proto2;
    return builder;
  };
  var applyStyle2 = function() {
    var args = Array.prototype.slice.call(arguments);
    var str = args.map(function(arg) {
      if (arg != null && arg.constructor === String) {
        return arg;
      } else {
        return util.inspect(arg);
      }
    }).join(" ");
    if (!colors.enabled || !str) {
      return str;
    }
    var newLinesPresent = str.indexOf("\n") != -1;
    var nestedStyles = this._styles;
    var i = nestedStyles.length;
    while (i--) {
      var code = ansiStyles2[nestedStyles[i]];
      str = code.open + str.replace(code.closeRe, code.open) + code.close;
      if (newLinesPresent) {
        str = str.replace(newLineRegex, function(match) {
          return code.close + match + code.open;
        });
      }
    }
    return str;
  };
  var init = function() {
    var ret = {};
    Object.keys(styles3).forEach(function(name) {
      ret[name] = {
        get: function() {
          return build([name]);
        }
      };
    });
    return ret;
  };
  var colors = {};
  module["exports"] = colors;
  colors.themes = {};
  var util = import.meta.require("util");
  var ansiStyles2 = colors.styles = require_styles();
  var defineProps = Object.defineProperties;
  var newLineRegex = new RegExp(/[\r\n]+/g);
  colors.supportsColor = require_supports_colors().supportsColor;
  if (typeof colors.enabled === "undefined") {
    colors.enabled = colors.supportsColor() !== false;
  }
  colors.enable = function() {
    colors.enabled = true;
  };
  colors.disable = function() {
    colors.enabled = false;
  };
  colors.stripColors = colors.strip = function(str) {
    return ("" + str).replace(/\x1B\[\d+m/g, "");
  };
  var stylize = colors.stylize = function stylize(str, style) {
    if (!colors.enabled) {
      return str + "";
    }
    var styleMap = ansiStyles2[style];
    if (!styleMap && (style in colors)) {
      return colors[style](str);
    }
    return styleMap.open + str + styleMap.close;
  };
  var matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g;
  var escapeStringRegexp = function(str) {
    if (typeof str !== "string") {
      throw new TypeError("Expected a string");
    }
    return str.replace(matchOperatorsRe, "\\$&");
  };
  var styles3 = function() {
    var ret = {};
    ansiStyles2.grey = ansiStyles2.gray;
    Object.keys(ansiStyles2).forEach(function(key) {
      ansiStyles2[key].closeRe = new RegExp(escapeStringRegexp(ansiStyles2[key].close), "g");
      ret[key] = {
        get: function() {
          return build(this._styles.concat(key));
        }
      };
    });
    return ret;
  }();
  var proto2 = defineProps(function colors() {
  }, styles3);
  colors.setTheme = function(theme) {
    if (typeof theme === "string") {
      console.log("colors.setTheme now only accepts an object, not a string.  If you are trying to set a theme from a file, it is now your (the caller\'s) responsibility to require the file.  The old syntax looked like colors.setTheme(__dirname + \'/../themes/generic-logging.js\'); The new syntax looks like colors.setTheme(require(__dirname + \'/../themes/generic-logging.js\'));");
      return;
    }
    for (var style in theme) {
      (function(style2) {
        colors[style2] = function(str) {
          if (typeof theme[style2] === "object") {
            var out = str;
            for (var i in theme[style2]) {
              out = colors[theme[style2][i]](out);
            }
            return out;
          }
          return colors[theme[style2]](str);
        };
      })(style);
    }
  };
  var sequencer = function sequencer(map2, str) {
    var exploded = str.split("");
    exploded = exploded.map(map2);
    return exploded.join("");
  };
  colors.trap = require_trap();
  colors.zalgo = require_zalgo();
  colors.maps = {};
  colors.maps.america = require_america()(colors);
  colors.maps.zebra = require_zebra()(colors);
  colors.maps.rainbow = require_rainbow()(colors);
  colors.maps.random = require_random()(colors);
  for (map in colors.maps) {
    (function(map2) {
      colors[map2] = function(str) {
        return sequencer(colors.maps[map2], str);
      };
    })(map);
  }
  var map;
  defineProps(colors, init());
});

// node_modules/@colors/colors/safe.js
var require_safe = __commonJS((exports, module) => {
  var colors = require_colors();
  module["exports"] = colors;
});

// node_modules/cli-table3/src/cell.js
var require_cell = __commonJS((exports, module) => {
  var firstDefined = function(...args) {
    return args.filter((v) => v !== undefined && v !== null).shift();
  };
  var setOption = function(objA, objB, nameB, targetObj) {
    let nameA = nameB.split("-");
    if (nameA.length > 1) {
      nameA[1] = nameA[1].charAt(0).toUpperCase() + nameA[1].substr(1);
      nameA = nameA.join("");
      targetObj[nameA] = firstDefined(objA[nameA], objA[nameB], objB[nameA], objB[nameB]);
    } else {
      targetObj[nameB] = firstDefined(objA[nameB], objB[nameB]);
    }
  };
  var findDimension = function(dimensionTable, startingIndex, span) {
    let ret = dimensionTable[startingIndex];
    for (let i = 1;i < span; i++) {
      ret += 1 + dimensionTable[startingIndex + i];
    }
    return ret;
  };
  var sumPlusOne = function(a, b) {
    return a + b + 1;
  };
  var { info, debug: debug2 } = require_debug();
  var utils = require_utils();

  class Cell {
    constructor(options2) {
      this.setOptions(options2);
      this.x = null;
      this.y = null;
    }
    setOptions(options2) {
      if (["boolean", "number", "string"].indexOf(typeof options2) !== -1) {
        options2 = { content: "" + options2 };
      }
      options2 = options2 || {};
      this.options = options2;
      let content = options2.content;
      if (["boolean", "number", "string"].indexOf(typeof content) !== -1) {
        this.content = String(content);
      } else if (!content) {
        this.content = this.options.href || "";
      } else {
        throw new Error("Content needs to be a primitive, got: " + typeof content);
      }
      this.colSpan = options2.colSpan || 1;
      this.rowSpan = options2.rowSpan || 1;
      if (this.options.href) {
        Object.defineProperty(this, "href", {
          get() {
            return this.options.href;
          }
        });
      }
    }
    mergeTableOptions(tableOptions, cells) {
      this.cells = cells;
      let optionsChars = this.options.chars || {};
      let tableChars = tableOptions.chars;
      let chars = this.chars = {};
      CHAR_NAMES.forEach(function(name) {
        setOption(optionsChars, tableChars, name, chars);
      });
      this.truncate = this.options.truncate || tableOptions.truncate;
      let style = this.options.style = this.options.style || {};
      let tableStyle = tableOptions.style;
      setOption(style, tableStyle, "padding-left", this);
      setOption(style, tableStyle, "padding-right", this);
      this.head = style.head || tableStyle.head;
      this.border = style.border || tableStyle.border;
      this.fixedWidth = tableOptions.colWidths[this.x];
      this.lines = this.computeLines(tableOptions);
      this.desiredWidth = utils.strlen(this.content) + this.paddingLeft + this.paddingRight;
      this.desiredHeight = this.lines.length;
    }
    computeLines(tableOptions) {
      const tableWordWrap = tableOptions.wordWrap || tableOptions.textWrap;
      const { wordWrap = tableWordWrap } = this.options;
      if (this.fixedWidth && wordWrap) {
        this.fixedWidth -= this.paddingLeft + this.paddingRight;
        if (this.colSpan) {
          let i = 1;
          while (i < this.colSpan) {
            this.fixedWidth += tableOptions.colWidths[this.x + i];
            i++;
          }
        }
        const { wrapOnWordBoundary: tableWrapOnWordBoundary = true } = tableOptions;
        const { wrapOnWordBoundary = tableWrapOnWordBoundary } = this.options;
        return this.wrapLines(utils.wordWrap(this.fixedWidth, this.content, wrapOnWordBoundary));
      }
      return this.wrapLines(this.content.split("\n"));
    }
    wrapLines(computedLines) {
      const lines = utils.colorizeLines(computedLines);
      if (this.href) {
        return lines.map((line) => utils.hyperlink(this.href, line));
      }
      return lines;
    }
    init(tableOptions) {
      let x = this.x;
      let y = this.y;
      this.widths = tableOptions.colWidths.slice(x, x + this.colSpan);
      this.heights = tableOptions.rowHeights.slice(y, y + this.rowSpan);
      this.width = this.widths.reduce(sumPlusOne, -1);
      this.height = this.heights.reduce(sumPlusOne, -1);
      this.hAlign = this.options.hAlign || tableOptions.colAligns[x];
      this.vAlign = this.options.vAlign || tableOptions.rowAligns[y];
      this.drawRight = x + this.colSpan == tableOptions.colWidths.length;
    }
    draw(lineNum, spanningCell) {
      if (lineNum == "top")
        return this.drawTop(this.drawRight);
      if (lineNum == "bottom")
        return this.drawBottom(this.drawRight);
      let content = utils.truncate(this.content, 10, this.truncate);
      if (!lineNum) {
        info(`${this.y}-${this.x}: ${this.rowSpan - lineNum}x${this.colSpan} Cell ${content}`);
      } else {
      }
      let padLen = Math.max(this.height - this.lines.length, 0);
      let padTop;
      switch (this.vAlign) {
        case "center":
          padTop = Math.ceil(padLen / 2);
          break;
        case "bottom":
          padTop = padLen;
          break;
        default:
          padTop = 0;
      }
      if (lineNum < padTop || lineNum >= padTop + this.lines.length) {
        return this.drawEmpty(this.drawRight, spanningCell);
      }
      let forceTruncation = this.lines.length > this.height && lineNum + 1 >= this.height;
      return this.drawLine(lineNum - padTop, this.drawRight, forceTruncation, spanningCell);
    }
    drawTop(drawRight) {
      let content = [];
      if (this.cells) {
        this.widths.forEach(function(width, index) {
          content.push(this._topLeftChar(index));
          content.push(utils.repeat(this.chars[this.y == 0 ? "top" : "mid"], width));
        }, this);
      } else {
        content.push(this._topLeftChar(0));
        content.push(utils.repeat(this.chars[this.y == 0 ? "top" : "mid"], this.width));
      }
      if (drawRight) {
        content.push(this.chars[this.y == 0 ? "topRight" : "rightMid"]);
      }
      return this.wrapWithStyleColors("border", content.join(""));
    }
    _topLeftChar(offset) {
      let x = this.x + offset;
      let leftChar;
      if (this.y == 0) {
        leftChar = x == 0 ? "topLeft" : offset == 0 ? "topMid" : "top";
      } else {
        if (x == 0) {
          leftChar = "leftMid";
        } else {
          leftChar = offset == 0 ? "midMid" : "bottomMid";
          if (this.cells) {
            let spanAbove = this.cells[this.y - 1][x] instanceof Cell.ColSpanCell;
            if (spanAbove) {
              leftChar = offset == 0 ? "topMid" : "mid";
            }
            if (offset == 0) {
              let i = 1;
              while (this.cells[this.y][x - i] instanceof Cell.ColSpanCell) {
                i++;
              }
              if (this.cells[this.y][x - i] instanceof Cell.RowSpanCell) {
                leftChar = "leftMid";
              }
            }
          }
        }
      }
      return this.chars[leftChar];
    }
    wrapWithStyleColors(styleProperty, content) {
      if (this[styleProperty] && this[styleProperty].length) {
        try {
          let colors = require_safe();
          for (let i = this[styleProperty].length - 1;i >= 0; i--) {
            colors = colors[this[styleProperty][i]];
          }
          return colors(content);
        } catch (e) {
          return content;
        }
      } else {
        return content;
      }
    }
    drawLine(lineNum, drawRight, forceTruncationSymbol, spanningCell) {
      let left = this.chars[this.x == 0 ? "left" : "middle"];
      if (this.x && spanningCell && this.cells) {
        let cellLeft = this.cells[this.y + spanningCell][this.x - 1];
        while (cellLeft instanceof ColSpanCell) {
          cellLeft = this.cells[cellLeft.y][cellLeft.x - 1];
        }
        if (!(cellLeft instanceof RowSpanCell)) {
          left = this.chars["rightMid"];
        }
      }
      let leftPadding = utils.repeat(" ", this.paddingLeft);
      let right = drawRight ? this.chars["right"] : "";
      let rightPadding = utils.repeat(" ", this.paddingRight);
      let line = this.lines[lineNum];
      let len = this.width - (this.paddingLeft + this.paddingRight);
      if (forceTruncationSymbol)
        line += this.truncate || "\u2026";
      let content = utils.truncate(line, len, this.truncate);
      content = utils.pad(content, len, " ", this.hAlign);
      content = leftPadding + content + rightPadding;
      return this.stylizeLine(left, content, right);
    }
    stylizeLine(left, content, right) {
      left = this.wrapWithStyleColors("border", left);
      right = this.wrapWithStyleColors("border", right);
      if (this.y === 0) {
        content = this.wrapWithStyleColors("head", content);
      }
      return left + content + right;
    }
    drawBottom(drawRight) {
      let left = this.chars[this.x == 0 ? "bottomLeft" : "bottomMid"];
      let content = utils.repeat(this.chars.bottom, this.width);
      let right = drawRight ? this.chars["bottomRight"] : "";
      return this.wrapWithStyleColors("border", left + content + right);
    }
    drawEmpty(drawRight, spanningCell) {
      let left = this.chars[this.x == 0 ? "left" : "middle"];
      if (this.x && spanningCell && this.cells) {
        let cellLeft = this.cells[this.y + spanningCell][this.x - 1];
        while (cellLeft instanceof ColSpanCell) {
          cellLeft = this.cells[cellLeft.y][cellLeft.x - 1];
        }
        if (!(cellLeft instanceof RowSpanCell)) {
          left = this.chars["rightMid"];
        }
      }
      let right = drawRight ? this.chars["right"] : "";
      let content = utils.repeat(" ", this.width);
      return this.stylizeLine(left, content, right);
    }
  }

  class ColSpanCell {
    constructor() {
    }
    draw(lineNum) {
      if (typeof lineNum === "number") {
        debug2(`${this.y}-${this.x}: 1x1 ColSpanCell`);
      }
      return "";
    }
    init() {
    }
    mergeTableOptions() {
    }
  }

  class RowSpanCell {
    constructor(originalCell) {
      this.originalCell = originalCell;
    }
    init(tableOptions) {
      let y = this.y;
      let originalY = this.originalCell.y;
      this.cellOffset = y - originalY;
      this.offset = findDimension(tableOptions.rowHeights, originalY, this.cellOffset);
    }
    draw(lineNum) {
      if (lineNum == "top") {
        return this.originalCell.draw(this.offset, this.cellOffset);
      }
      if (lineNum == "bottom") {
        return this.originalCell.draw("bottom");
      }
      debug2(`${this.y}-${this.x}: 1x${this.colSpan} RowSpanCell for ${this.originalCell.content}`);
      return this.originalCell.draw(this.offset + 1 + lineNum);
    }
    mergeTableOptions() {
    }
  }
  var CHAR_NAMES = [
    "top",
    "top-mid",
    "top-left",
    "top-right",
    "bottom",
    "bottom-mid",
    "bottom-left",
    "bottom-right",
    "left",
    "left-mid",
    "mid",
    "mid-mid",
    "right",
    "right-mid",
    "middle"
  ];
  module.exports = Cell;
  module.exports.ColSpanCell = ColSpanCell;
  module.exports.RowSpanCell = RowSpanCell;
});

// node_modules/cli-table3/src/layout-manager.js
var require_layout_manager = __commonJS((exports, module) => {
  var makeComputeWidths = function(colSpan, desiredWidth, x, forcedMin) {
    return function(vals, table) {
      let result = [];
      let spanners = [];
      let auto2 = {};
      table.forEach(function(row) {
        row.forEach(function(cell) {
          if ((cell[colSpan] || 1) > 1) {
            spanners.push(cell);
          } else {
            result[cell[x]] = Math.max(result[cell[x]] || 0, cell[desiredWidth] || 0, forcedMin);
          }
        });
      });
      vals.forEach(function(val, index) {
        if (typeof val === "number") {
          result[index] = val;
        }
      });
      for (let k = spanners.length - 1;k >= 0; k--) {
        let cell = spanners[k];
        let span = cell[colSpan];
        let col = cell[x];
        let existingWidth = result[col];
        let editableCols = typeof vals[col] === "number" ? 0 : 1;
        if (typeof existingWidth === "number") {
          for (let i = 1;i < span; i++) {
            existingWidth += 1 + result[col + i];
            if (typeof vals[col + i] !== "number") {
              editableCols++;
            }
          }
        } else {
          existingWidth = desiredWidth === "desiredWidth" ? cell.desiredWidth - 1 : 1;
          if (!auto2[col] || auto2[col] < existingWidth) {
            auto2[col] = existingWidth;
          }
        }
        if (cell[desiredWidth] > existingWidth) {
          let i = 0;
          while (editableCols > 0 && cell[desiredWidth] > existingWidth) {
            if (typeof vals[col + i] !== "number") {
              let dif = Math.round((cell[desiredWidth] - existingWidth) / editableCols);
              existingWidth += dif;
              result[col + i] += dif;
              editableCols--;
            }
            i++;
          }
        }
      }
      Object.assign(vals, result, auto2);
      for (let j = 0;j < vals.length; j++) {
        vals[j] = Math.max(forcedMin, vals[j] || 0);
      }
    };
  };
  var { warn, debug: debug2 } = require_debug();
  var Cell = require_cell();
  var { ColSpanCell, RowSpanCell } = Cell;
  (function() {
    function next(alloc, col) {
      if (alloc[col] > 0) {
        return next(alloc, col + 1);
      }
      return col;
    }
    function layoutTable(table) {
      let alloc = {};
      table.forEach(function(row, rowIndex) {
        let col = 0;
        row.forEach(function(cell) {
          cell.y = rowIndex;
          cell.x = rowIndex ? next(alloc, col) : col;
          const rowSpan = cell.rowSpan || 1;
          const colSpan = cell.colSpan || 1;
          if (rowSpan > 1) {
            for (let cs = 0;cs < colSpan; cs++) {
              alloc[cell.x + cs] = rowSpan;
            }
          }
          col = cell.x + colSpan;
        });
        Object.keys(alloc).forEach((idx) => {
          alloc[idx]--;
          if (alloc[idx] < 1)
            delete alloc[idx];
        });
      });
    }
    function maxWidth(table) {
      let mw = 0;
      table.forEach(function(row) {
        row.forEach(function(cell) {
          mw = Math.max(mw, cell.x + (cell.colSpan || 1));
        });
      });
      return mw;
    }
    function maxHeight(table) {
      return table.length;
    }
    function cellsConflict(cell1, cell2) {
      let yMin1 = cell1.y;
      let yMax1 = cell1.y - 1 + (cell1.rowSpan || 1);
      let yMin2 = cell2.y;
      let yMax2 = cell2.y - 1 + (cell2.rowSpan || 1);
      let yConflict = !(yMin1 > yMax2 || yMin2 > yMax1);
      let xMin1 = cell1.x;
      let xMax1 = cell1.x - 1 + (cell1.colSpan || 1);
      let xMin2 = cell2.x;
      let xMax2 = cell2.x - 1 + (cell2.colSpan || 1);
      let xConflict = !(xMin1 > xMax2 || xMin2 > xMax1);
      return yConflict && xConflict;
    }
    function conflictExists(rows, x, y) {
      let i_max = Math.min(rows.length - 1, y);
      let cell = { x, y };
      for (let i = 0;i <= i_max; i++) {
        let row = rows[i];
        for (let j = 0;j < row.length; j++) {
          if (cellsConflict(cell, row[j])) {
            return true;
          }
        }
      }
      return false;
    }
    function allBlank(rows, y, xMin, xMax) {
      for (let x = xMin;x < xMax; x++) {
        if (conflictExists(rows, x, y)) {
          return false;
        }
      }
      return true;
    }
    function addRowSpanCells(table) {
      table.forEach(function(row, rowIndex) {
        row.forEach(function(cell) {
          for (let i = 1;i < cell.rowSpan; i++) {
            let rowSpanCell = new RowSpanCell(cell);
            rowSpanCell.x = cell.x;
            rowSpanCell.y = cell.y + i;
            rowSpanCell.colSpan = cell.colSpan;
            insertCell(rowSpanCell, table[rowIndex + i]);
          }
        });
      });
    }
    function addColSpanCells(cellRows) {
      for (let rowIndex = cellRows.length - 1;rowIndex >= 0; rowIndex--) {
        let cellColumns = cellRows[rowIndex];
        for (let columnIndex = 0;columnIndex < cellColumns.length; columnIndex++) {
          let cell = cellColumns[columnIndex];
          for (let k = 1;k < cell.colSpan; k++) {
            let colSpanCell = new ColSpanCell;
            colSpanCell.x = cell.x + k;
            colSpanCell.y = cell.y;
            cellColumns.splice(columnIndex + 1, 0, colSpanCell);
          }
        }
      }
    }
    function insertCell(cell, row) {
      let x = 0;
      while (x < row.length && row[x].x < cell.x) {
        x++;
      }
      row.splice(x, 0, cell);
    }
    function fillInTable(table) {
      let h_max = maxHeight(table);
      let w_max = maxWidth(table);
      debug2(`Max rows: ${h_max}; Max cols: ${w_max}`);
      for (let y = 0;y < h_max; y++) {
        for (let x = 0;x < w_max; x++) {
          if (!conflictExists(table, x, y)) {
            let opts = { x, y, colSpan: 1, rowSpan: 1 };
            x++;
            while (x < w_max && !conflictExists(table, x, y)) {
              opts.colSpan++;
              x++;
            }
            let y2 = y + 1;
            while (y2 < h_max && allBlank(table, y2, opts.x, opts.x + opts.colSpan)) {
              opts.rowSpan++;
              y2++;
            }
            let cell = new Cell(opts);
            cell.x = opts.x;
            cell.y = opts.y;
            warn(`Missing cell at ${cell.y}-${cell.x}.`);
            insertCell(cell, table[y]);
          }
        }
      }
    }
    function generateCells(rows) {
      return rows.map(function(row) {
        if (!Array.isArray(row)) {
          let key = Object.keys(row)[0];
          row = row[key];
          if (Array.isArray(row)) {
            row = row.slice();
            row.unshift(key);
          } else {
            row = [key, row];
          }
        }
        return row.map(function(cell) {
          return new Cell(cell);
        });
      });
    }
    function makeTableLayout(rows) {
      let cellRows = generateCells(rows);
      layoutTable(cellRows);
      fillInTable(cellRows);
      addRowSpanCells(cellRows);
      addColSpanCells(cellRows);
      return cellRows;
    }
    module.exports = {
      makeTableLayout,
      layoutTable,
      addRowSpanCells,
      maxWidth,
      fillInTable,
      computeWidths: makeComputeWidths("colSpan", "desiredWidth", "x", 1),
      computeHeights: makeComputeWidths("rowSpan", "desiredHeight", "y", 1)
    };
  })();
});

// node_modules/cli-table3/src/table.js
var require_table = __commonJS((exports, module) => {
  var doDraw = function(row, lineNum, result) {
    let line = [];
    row.forEach(function(cell) {
      line.push(cell.draw(lineNum));
    });
    let str = line.join("");
    if (str.length)
      result.push(str);
  };
  var debug2 = require_debug();
  var utils = require_utils();
  var tableLayout = require_layout_manager();

  class Table extends Array {
    constructor(opts) {
      super();
      const options2 = utils.mergeOptions(opts);
      Object.defineProperty(this, "options", {
        value: options2,
        enumerable: options2.debug
      });
      if (options2.debug) {
        switch (typeof options2.debug) {
          case "boolean":
            debug2.setDebugLevel(debug2.WARN);
            break;
          case "number":
            debug2.setDebugLevel(options2.debug);
            break;
          case "string":
            debug2.setDebugLevel(parseInt(options2.debug, 10));
            break;
          default:
            debug2.setDebugLevel(debug2.WARN);
            debug2.warn(`Debug option is expected to be boolean, number, or string. Received a ${typeof options2.debug}`);
        }
        Object.defineProperty(this, "messages", {
          get() {
            return debug2.debugMessages();
          }
        });
      }
    }
    toString() {
      let array = this;
      let headersPresent = this.options.head && this.options.head.length;
      if (headersPresent) {
        array = [this.options.head];
        if (this.length) {
          array.push.apply(array, this);
        }
      } else {
        this.options.style.head = [];
      }
      let cells = tableLayout.makeTableLayout(array);
      cells.forEach(function(row) {
        row.forEach(function(cell) {
          cell.mergeTableOptions(this.options, cells);
        }, this);
      }, this);
      tableLayout.computeWidths(this.options.colWidths, cells);
      tableLayout.computeHeights(this.options.rowHeights, cells);
      cells.forEach(function(row) {
        row.forEach(function(cell) {
          cell.init(this.options);
        }, this);
      }, this);
      let result = [];
      for (let rowIndex = 0;rowIndex < cells.length; rowIndex++) {
        let row = cells[rowIndex];
        let heightOfRow = this.options.rowHeights[rowIndex];
        if (rowIndex === 0 || !this.options.style.compact || rowIndex == 1 && headersPresent) {
          doDraw(row, "top", result);
        }
        for (let lineNum = 0;lineNum < heightOfRow; lineNum++) {
          doDraw(row, lineNum, result);
        }
        if (rowIndex + 1 == cells.length) {
          doDraw(row, "bottom", result);
        }
      }
      return result.join("\n");
    }
    get width() {
      let str = this.toString().split("\n");
      return str[0].length;
    }
  }
  Table.reset = () => debug2.reset();
  module.exports = Table;
});

// node_modules/esprima/dist/esprima.js
var require_esprima = __commonJS((exports, module) => {
  (function webpackUniversalModuleDefinition(root, factory) {
    if (typeof exports === "object" && typeof module === "object")
      module.exports = factory();
    else if (typeof define === "function" && define.amd)
      define([], factory);
    else if (typeof exports === "object")
      exports["esprima"] = factory();
    else
      root["esprima"] = factory();
  })(exports, function() {
    return function(modules) {
      var installedModules = {};
      function __webpack_require__(moduleId) {
        if (installedModules[moduleId])
          return installedModules[moduleId].exports;
        var module2 = installedModules[moduleId] = {
          exports: {},
          id: moduleId,
          loaded: false
        };
        modules[moduleId].call(module2.exports, module2, module2.exports, __webpack_require__);
        module2.loaded = true;
        return module2.exports;
      }
      __webpack_require__.m = modules;
      __webpack_require__.c = installedModules;
      __webpack_require__.p = "";
      return __webpack_require__(0);
    }([
      function(module2, exports2, __webpack_require__) {
        Object.defineProperty(exports2, "__esModule", { value: true });
        var comment_handler_1 = __webpack_require__(1);
        var jsx_parser_1 = __webpack_require__(3);
        var parser_1 = __webpack_require__(8);
        var tokenizer_1 = __webpack_require__(15);
        function parse(code, options2, delegate) {
          var commentHandler = null;
          var proxyDelegate = function(node, metadata) {
            if (delegate) {
              delegate(node, metadata);
            }
            if (commentHandler) {
              commentHandler.visit(node, metadata);
            }
          };
          var parserDelegate = typeof delegate === "function" ? proxyDelegate : null;
          var collectComment = false;
          if (options2) {
            collectComment = typeof options2.comment === "boolean" && options2.comment;
            var attachComment = typeof options2.attachComment === "boolean" && options2.attachComment;
            if (collectComment || attachComment) {
              commentHandler = new comment_handler_1.CommentHandler;
              commentHandler.attach = attachComment;
              options2.comment = true;
              parserDelegate = proxyDelegate;
            }
          }
          var isModule = false;
          if (options2 && typeof options2.sourceType === "string") {
            isModule = options2.sourceType === "module";
          }
          var parser2;
          if (options2 && typeof options2.jsx === "boolean" && options2.jsx) {
            parser2 = new jsx_parser_1.JSXParser(code, options2, parserDelegate);
          } else {
            parser2 = new parser_1.Parser(code, options2, parserDelegate);
          }
          var program2 = isModule ? parser2.parseModule() : parser2.parseScript();
          var ast = program2;
          if (collectComment && commentHandler) {
            ast.comments = commentHandler.comments;
          }
          if (parser2.config.tokens) {
            ast.tokens = parser2.tokens;
          }
          if (parser2.config.tolerant) {
            ast.errors = parser2.errorHandler.errors;
          }
          return ast;
        }
        exports2.parse = parse;
        function parseModule(code, options2, delegate) {
          var parsingOptions = options2 || {};
          parsingOptions.sourceType = "module";
          return parse(code, parsingOptions, delegate);
        }
        exports2.parseModule = parseModule;
        function parseScript(code, options2, delegate) {
          var parsingOptions = options2 || {};
          parsingOptions.sourceType = "script";
          return parse(code, parsingOptions, delegate);
        }
        exports2.parseScript = parseScript;
        function tokenize(code, options2, delegate) {
          var tokenizer = new tokenizer_1.Tokenizer(code, options2);
          var tokens;
          tokens = [];
          try {
            while (true) {
              var token = tokenizer.getNextToken();
              if (!token) {
                break;
              }
              if (delegate) {
                token = delegate(token);
              }
              tokens.push(token);
            }
          } catch (e) {
            tokenizer.errorHandler.tolerate(e);
          }
          if (tokenizer.errorHandler.tolerant) {
            tokens.errors = tokenizer.errors();
          }
          return tokens;
        }
        exports2.tokenize = tokenize;
        var syntax_1 = __webpack_require__(2);
        exports2.Syntax = syntax_1.Syntax;
        exports2.version = "4.0.1";
      },
      function(module2, exports2, __webpack_require__) {
        Object.defineProperty(exports2, "__esModule", { value: true });
        var syntax_1 = __webpack_require__(2);
        var CommentHandler = function() {
          function CommentHandler2() {
            this.attach = false;
            this.comments = [];
            this.stack = [];
            this.leading = [];
            this.trailing = [];
          }
          CommentHandler2.prototype.insertInnerComments = function(node, metadata) {
            if (node.type === syntax_1.Syntax.BlockStatement && node.body.length === 0) {
              var innerComments = [];
              for (var i = this.leading.length - 1;i >= 0; --i) {
                var entry = this.leading[i];
                if (metadata.end.offset >= entry.start) {
                  innerComments.unshift(entry.comment);
                  this.leading.splice(i, 1);
                  this.trailing.splice(i, 1);
                }
              }
              if (innerComments.length) {
                node.innerComments = innerComments;
              }
            }
          };
          CommentHandler2.prototype.findTrailingComments = function(metadata) {
            var trailingComments = [];
            if (this.trailing.length > 0) {
              for (var i = this.trailing.length - 1;i >= 0; --i) {
                var entry_1 = this.trailing[i];
                if (entry_1.start >= metadata.end.offset) {
                  trailingComments.unshift(entry_1.comment);
                }
              }
              this.trailing.length = 0;
              return trailingComments;
            }
            var entry = this.stack[this.stack.length - 1];
            if (entry && entry.node.trailingComments) {
              var firstComment = entry.node.trailingComments[0];
              if (firstComment && firstComment.range[0] >= metadata.end.offset) {
                trailingComments = entry.node.trailingComments;
                delete entry.node.trailingComments;
              }
            }
            return trailingComments;
          };
          CommentHandler2.prototype.findLeadingComments = function(metadata) {
            var leadingComments = [];
            var target;
            while (this.stack.length > 0) {
              var entry = this.stack[this.stack.length - 1];
              if (entry && entry.start >= metadata.start.offset) {
                target = entry.node;
                this.stack.pop();
              } else {
                break;
              }
            }
            if (target) {
              var count = target.leadingComments ? target.leadingComments.length : 0;
              for (var i = count - 1;i >= 0; --i) {
                var comment = target.leadingComments[i];
                if (comment.range[1] <= metadata.start.offset) {
                  leadingComments.unshift(comment);
                  target.leadingComments.splice(i, 1);
                }
              }
              if (target.leadingComments && target.leadingComments.length === 0) {
                delete target.leadingComments;
              }
              return leadingComments;
            }
            for (var i = this.leading.length - 1;i >= 0; --i) {
              var entry = this.leading[i];
              if (entry.start <= metadata.start.offset) {
                leadingComments.unshift(entry.comment);
                this.leading.splice(i, 1);
              }
            }
            return leadingComments;
          };
          CommentHandler2.prototype.visitNode = function(node, metadata) {
            if (node.type === syntax_1.Syntax.Program && node.body.length > 0) {
              return;
            }
            this.insertInnerComments(node, metadata);
            var trailingComments = this.findTrailingComments(metadata);
            var leadingComments = this.findLeadingComments(metadata);
            if (leadingComments.length > 0) {
              node.leadingComments = leadingComments;
            }
            if (trailingComments.length > 0) {
              node.trailingComments = trailingComments;
            }
            this.stack.push({
              node,
              start: metadata.start.offset
            });
          };
          CommentHandler2.prototype.visitComment = function(node, metadata) {
            var type = node.type[0] === "L" ? "Line" : "Block";
            var comment = {
              type,
              value: node.value
            };
            if (node.range) {
              comment.range = node.range;
            }
            if (node.loc) {
              comment.loc = node.loc;
            }
            this.comments.push(comment);
            if (this.attach) {
              var entry = {
                comment: {
                  type,
                  value: node.value,
                  range: [metadata.start.offset, metadata.end.offset]
                },
                start: metadata.start.offset
              };
              if (node.loc) {
                entry.comment.loc = node.loc;
              }
              node.type = type;
              this.leading.push(entry);
              this.trailing.push(entry);
            }
          };
          CommentHandler2.prototype.visit = function(node, metadata) {
            if (node.type === "LineComment") {
              this.visitComment(node, metadata);
            } else if (node.type === "BlockComment") {
              this.visitComment(node, metadata);
            } else if (this.attach) {
              this.visitNode(node, metadata);
            }
          };
          return CommentHandler2;
        }();
        exports2.CommentHandler = CommentHandler;
      },
      function(module2, exports2) {
        Object.defineProperty(exports2, "__esModule", { value: true });
        exports2.Syntax = {
          AssignmentExpression: "AssignmentExpression",
          AssignmentPattern: "AssignmentPattern",
          ArrayExpression: "ArrayExpression",
          ArrayPattern: "ArrayPattern",
          ArrowFunctionExpression: "ArrowFunctionExpression",
          AwaitExpression: "AwaitExpression",
          BlockStatement: "BlockStatement",
          BinaryExpression: "BinaryExpression",
          BreakStatement: "BreakStatement",
          CallExpression: "CallExpression",
          CatchClause: "CatchClause",
          ClassBody: "ClassBody",
          ClassDeclaration: "ClassDeclaration",
          ClassExpression: "ClassExpression",
          ConditionalExpression: "ConditionalExpression",
          ContinueStatement: "ContinueStatement",
          DoWhileStatement: "DoWhileStatement",
          DebuggerStatement: "DebuggerStatement",
          EmptyStatement: "EmptyStatement",
          ExportAllDeclaration: "ExportAllDeclaration",
          ExportDefaultDeclaration: "ExportDefaultDeclaration",
          ExportNamedDeclaration: "ExportNamedDeclaration",
          ExportSpecifier: "ExportSpecifier",
          ExpressionStatement: "ExpressionStatement",
          ForStatement: "ForStatement",
          ForOfStatement: "ForOfStatement",
          ForInStatement: "ForInStatement",
          FunctionDeclaration: "FunctionDeclaration",
          FunctionExpression: "FunctionExpression",
          Identifier: "Identifier",
          IfStatement: "IfStatement",
          ImportDeclaration: "ImportDeclaration",
          ImportDefaultSpecifier: "ImportDefaultSpecifier",
          ImportNamespaceSpecifier: "ImportNamespaceSpecifier",
          ImportSpecifier: "ImportSpecifier",
          Literal: "Literal",
          LabeledStatement: "LabeledStatement",
          LogicalExpression: "LogicalExpression",
          MemberExpression: "MemberExpression",
          MetaProperty: "MetaProperty",
          MethodDefinition: "MethodDefinition",
          NewExpression: "NewExpression",
          ObjectExpression: "ObjectExpression",
          ObjectPattern: "ObjectPattern",
          Program: "Program",
          Property: "Property",
          RestElement: "RestElement",
          ReturnStatement: "ReturnStatement",
          SequenceExpression: "SequenceExpression",
          SpreadElement: "SpreadElement",
          Super: "Super",
          SwitchCase: "SwitchCase",
          SwitchStatement: "SwitchStatement",
          TaggedTemplateExpression: "TaggedTemplateExpression",
          TemplateElement: "TemplateElement",
          TemplateLiteral: "TemplateLiteral",
          ThisExpression: "ThisExpression",
          ThrowStatement: "ThrowStatement",
          TryStatement: "TryStatement",
          UnaryExpression: "UnaryExpression",
          UpdateExpression: "UpdateExpression",
          VariableDeclaration: "VariableDeclaration",
          VariableDeclarator: "VariableDeclarator",
          WhileStatement: "WhileStatement",
          WithStatement: "WithStatement",
          YieldExpression: "YieldExpression"
        };
      },
      function(module2, exports2, __webpack_require__) {
        var __extends = this && this.__extends || function() {
          var extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d, b) {
            d.__proto__ = b;
          } || function(d, b) {
            for (var p in b)
              if (b.hasOwnProperty(p))
                d[p] = b[p];
          };
          return function(d, b) {
            extendStatics(d, b);
            function __() {
              this.constructor = d;
            }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __);
          };
        }();
        Object.defineProperty(exports2, "__esModule", { value: true });
        var character_1 = __webpack_require__(4);
        var JSXNode = __webpack_require__(5);
        var jsx_syntax_1 = __webpack_require__(6);
        var Node = __webpack_require__(7);
        var parser_1 = __webpack_require__(8);
        var token_1 = __webpack_require__(13);
        var xhtml_entities_1 = __webpack_require__(14);
        token_1.TokenName[100] = "JSXIdentifier";
        token_1.TokenName[101] = "JSXText";
        function getQualifiedElementName(elementName) {
          var qualifiedName;
          switch (elementName.type) {
            case jsx_syntax_1.JSXSyntax.JSXIdentifier:
              var id = elementName;
              qualifiedName = id.name;
              break;
            case jsx_syntax_1.JSXSyntax.JSXNamespacedName:
              var ns = elementName;
              qualifiedName = getQualifiedElementName(ns.namespace) + ":" + getQualifiedElementName(ns.name);
              break;
            case jsx_syntax_1.JSXSyntax.JSXMemberExpression:
              var expr = elementName;
              qualifiedName = getQualifiedElementName(expr.object) + "." + getQualifiedElementName(expr.property);
              break;
            default:
              break;
          }
          return qualifiedName;
        }
        var JSXParser = function(_super) {
          __extends(JSXParser2, _super);
          function JSXParser2(code, options2, delegate) {
            return _super.call(this, code, options2, delegate) || this;
          }
          JSXParser2.prototype.parsePrimaryExpression = function() {
            return this.match("<") ? this.parseJSXRoot() : _super.prototype.parsePrimaryExpression.call(this);
          };
          JSXParser2.prototype.startJSX = function() {
            this.scanner.index = this.startMarker.index;
            this.scanner.lineNumber = this.startMarker.line;
            this.scanner.lineStart = this.startMarker.index - this.startMarker.column;
          };
          JSXParser2.prototype.finishJSX = function() {
            this.nextToken();
          };
          JSXParser2.prototype.reenterJSX = function() {
            this.startJSX();
            this.expectJSX("}");
            if (this.config.tokens) {
              this.tokens.pop();
            }
          };
          JSXParser2.prototype.createJSXNode = function() {
            this.collectComments();
            return {
              index: this.scanner.index,
              line: this.scanner.lineNumber,
              column: this.scanner.index - this.scanner.lineStart
            };
          };
          JSXParser2.prototype.createJSXChildNode = function() {
            return {
              index: this.scanner.index,
              line: this.scanner.lineNumber,
              column: this.scanner.index - this.scanner.lineStart
            };
          };
          JSXParser2.prototype.scanXHTMLEntity = function(quote) {
            var result = "&";
            var valid = true;
            var terminated = false;
            var numeric = false;
            var hex = false;
            while (!this.scanner.eof() && valid && !terminated) {
              var ch = this.scanner.source[this.scanner.index];
              if (ch === quote) {
                break;
              }
              terminated = ch === ";";
              result += ch;
              ++this.scanner.index;
              if (!terminated) {
                switch (result.length) {
                  case 2:
                    numeric = ch === "#";
                    break;
                  case 3:
                    if (numeric) {
                      hex = ch === "x";
                      valid = hex || character_1.Character.isDecimalDigit(ch.charCodeAt(0));
                      numeric = numeric && !hex;
                    }
                    break;
                  default:
                    valid = valid && !(numeric && !character_1.Character.isDecimalDigit(ch.charCodeAt(0)));
                    valid = valid && !(hex && !character_1.Character.isHexDigit(ch.charCodeAt(0)));
                    break;
                }
              }
            }
            if (valid && terminated && result.length > 2) {
              var str = result.substr(1, result.length - 2);
              if (numeric && str.length > 1) {
                result = String.fromCharCode(parseInt(str.substr(1), 10));
              } else if (hex && str.length > 2) {
                result = String.fromCharCode(parseInt("0" + str.substr(1), 16));
              } else if (!numeric && !hex && xhtml_entities_1.XHTMLEntities[str]) {
                result = xhtml_entities_1.XHTMLEntities[str];
              }
            }
            return result;
          };
          JSXParser2.prototype.lexJSX = function() {
            var cp = this.scanner.source.charCodeAt(this.scanner.index);
            if (cp === 60 || cp === 62 || cp === 47 || cp === 58 || cp === 61 || cp === 123 || cp === 125) {
              var value = this.scanner.source[this.scanner.index++];
              return {
                type: 7,
                value,
                lineNumber: this.scanner.lineNumber,
                lineStart: this.scanner.lineStart,
                start: this.scanner.index - 1,
                end: this.scanner.index
              };
            }
            if (cp === 34 || cp === 39) {
              var start = this.scanner.index;
              var quote = this.scanner.source[this.scanner.index++];
              var str = "";
              while (!this.scanner.eof()) {
                var ch = this.scanner.source[this.scanner.index++];
                if (ch === quote) {
                  break;
                } else if (ch === "&") {
                  str += this.scanXHTMLEntity(quote);
                } else {
                  str += ch;
                }
              }
              return {
                type: 8,
                value: str,
                lineNumber: this.scanner.lineNumber,
                lineStart: this.scanner.lineStart,
                start,
                end: this.scanner.index
              };
            }
            if (cp === 46) {
              var n1 = this.scanner.source.charCodeAt(this.scanner.index + 1);
              var n2 = this.scanner.source.charCodeAt(this.scanner.index + 2);
              var value = n1 === 46 && n2 === 46 ? "..." : ".";
              var start = this.scanner.index;
              this.scanner.index += value.length;
              return {
                type: 7,
                value,
                lineNumber: this.scanner.lineNumber,
                lineStart: this.scanner.lineStart,
                start,
                end: this.scanner.index
              };
            }
            if (cp === 96) {
              return {
                type: 10,
                value: "",
                lineNumber: this.scanner.lineNumber,
                lineStart: this.scanner.lineStart,
                start: this.scanner.index,
                end: this.scanner.index
              };
            }
            if (character_1.Character.isIdentifierStart(cp) && cp !== 92) {
              var start = this.scanner.index;
              ++this.scanner.index;
              while (!this.scanner.eof()) {
                var ch = this.scanner.source.charCodeAt(this.scanner.index);
                if (character_1.Character.isIdentifierPart(ch) && ch !== 92) {
                  ++this.scanner.index;
                } else if (ch === 45) {
                  ++this.scanner.index;
                } else {
                  break;
                }
              }
              var id = this.scanner.source.slice(start, this.scanner.index);
              return {
                type: 100,
                value: id,
                lineNumber: this.scanner.lineNumber,
                lineStart: this.scanner.lineStart,
                start,
                end: this.scanner.index
              };
            }
            return this.scanner.lex();
          };
          JSXParser2.prototype.nextJSXToken = function() {
            this.collectComments();
            this.startMarker.index = this.scanner.index;
            this.startMarker.line = this.scanner.lineNumber;
            this.startMarker.column = this.scanner.index - this.scanner.lineStart;
            var token = this.lexJSX();
            this.lastMarker.index = this.scanner.index;
            this.lastMarker.line = this.scanner.lineNumber;
            this.lastMarker.column = this.scanner.index - this.scanner.lineStart;
            if (this.config.tokens) {
              this.tokens.push(this.convertToken(token));
            }
            return token;
          };
          JSXParser2.prototype.nextJSXText = function() {
            this.startMarker.index = this.scanner.index;
            this.startMarker.line = this.scanner.lineNumber;
            this.startMarker.column = this.scanner.index - this.scanner.lineStart;
            var start = this.scanner.index;
            var text = "";
            while (!this.scanner.eof()) {
              var ch = this.scanner.source[this.scanner.index];
              if (ch === "{" || ch === "<") {
                break;
              }
              ++this.scanner.index;
              text += ch;
              if (character_1.Character.isLineTerminator(ch.charCodeAt(0))) {
                ++this.scanner.lineNumber;
                if (ch === "\r" && this.scanner.source[this.scanner.index] === "\n") {
                  ++this.scanner.index;
                }
                this.scanner.lineStart = this.scanner.index;
              }
            }
            this.lastMarker.index = this.scanner.index;
            this.lastMarker.line = this.scanner.lineNumber;
            this.lastMarker.column = this.scanner.index - this.scanner.lineStart;
            var token = {
              type: 101,
              value: text,
              lineNumber: this.scanner.lineNumber,
              lineStart: this.scanner.lineStart,
              start,
              end: this.scanner.index
            };
            if (text.length > 0 && this.config.tokens) {
              this.tokens.push(this.convertToken(token));
            }
            return token;
          };
          JSXParser2.prototype.peekJSXToken = function() {
            var state = this.scanner.saveState();
            this.scanner.scanComments();
            var next = this.lexJSX();
            this.scanner.restoreState(state);
            return next;
          };
          JSXParser2.prototype.expectJSX = function(value) {
            var token = this.nextJSXToken();
            if (token.type !== 7 || token.value !== value) {
              this.throwUnexpectedToken(token);
            }
          };
          JSXParser2.prototype.matchJSX = function(value) {
            var next = this.peekJSXToken();
            return next.type === 7 && next.value === value;
          };
          JSXParser2.prototype.parseJSXIdentifier = function() {
            var node = this.createJSXNode();
            var token = this.nextJSXToken();
            if (token.type !== 100) {
              this.throwUnexpectedToken(token);
            }
            return this.finalize(node, new JSXNode.JSXIdentifier(token.value));
          };
          JSXParser2.prototype.parseJSXElementName = function() {
            var node = this.createJSXNode();
            var elementName = this.parseJSXIdentifier();
            if (this.matchJSX(":")) {
              var namespace = elementName;
              this.expectJSX(":");
              var name_1 = this.parseJSXIdentifier();
              elementName = this.finalize(node, new JSXNode.JSXNamespacedName(namespace, name_1));
            } else if (this.matchJSX(".")) {
              while (this.matchJSX(".")) {
                var object = elementName;
                this.expectJSX(".");
                var property = this.parseJSXIdentifier();
                elementName = this.finalize(node, new JSXNode.JSXMemberExpression(object, property));
              }
            }
            return elementName;
          };
          JSXParser2.prototype.parseJSXAttributeName = function() {
            var node = this.createJSXNode();
            var attributeName;
            var identifier = this.parseJSXIdentifier();
            if (this.matchJSX(":")) {
              var namespace = identifier;
              this.expectJSX(":");
              var name_2 = this.parseJSXIdentifier();
              attributeName = this.finalize(node, new JSXNode.JSXNamespacedName(namespace, name_2));
            } else {
              attributeName = identifier;
            }
            return attributeName;
          };
          JSXParser2.prototype.parseJSXStringLiteralAttribute = function() {
            var node = this.createJSXNode();
            var token = this.nextJSXToken();
            if (token.type !== 8) {
              this.throwUnexpectedToken(token);
            }
            var raw = this.getTokenRaw(token);
            return this.finalize(node, new Node.Literal(token.value, raw));
          };
          JSXParser2.prototype.parseJSXExpressionAttribute = function() {
            var node = this.createJSXNode();
            this.expectJSX("{");
            this.finishJSX();
            if (this.match("}")) {
              this.tolerateError("JSX attributes must only be assigned a non-empty expression");
            }
            var expression = this.parseAssignmentExpression();
            this.reenterJSX();
            return this.finalize(node, new JSXNode.JSXExpressionContainer(expression));
          };
          JSXParser2.prototype.parseJSXAttributeValue = function() {
            return this.matchJSX("{") ? this.parseJSXExpressionAttribute() : this.matchJSX("<") ? this.parseJSXElement() : this.parseJSXStringLiteralAttribute();
          };
          JSXParser2.prototype.parseJSXNameValueAttribute = function() {
            var node = this.createJSXNode();
            var name = this.parseJSXAttributeName();
            var value = null;
            if (this.matchJSX("=")) {
              this.expectJSX("=");
              value = this.parseJSXAttributeValue();
            }
            return this.finalize(node, new JSXNode.JSXAttribute(name, value));
          };
          JSXParser2.prototype.parseJSXSpreadAttribute = function() {
            var node = this.createJSXNode();
            this.expectJSX("{");
            this.expectJSX("...");
            this.finishJSX();
            var argument = this.parseAssignmentExpression();
            this.reenterJSX();
            return this.finalize(node, new JSXNode.JSXSpreadAttribute(argument));
          };
          JSXParser2.prototype.parseJSXAttributes = function() {
            var attributes = [];
            while (!this.matchJSX("/") && !this.matchJSX(">")) {
              var attribute = this.matchJSX("{") ? this.parseJSXSpreadAttribute() : this.parseJSXNameValueAttribute();
              attributes.push(attribute);
            }
            return attributes;
          };
          JSXParser2.prototype.parseJSXOpeningElement = function() {
            var node = this.createJSXNode();
            this.expectJSX("<");
            var name = this.parseJSXElementName();
            var attributes = this.parseJSXAttributes();
            var selfClosing = this.matchJSX("/");
            if (selfClosing) {
              this.expectJSX("/");
            }
            this.expectJSX(">");
            return this.finalize(node, new JSXNode.JSXOpeningElement(name, selfClosing, attributes));
          };
          JSXParser2.prototype.parseJSXBoundaryElement = function() {
            var node = this.createJSXNode();
            this.expectJSX("<");
            if (this.matchJSX("/")) {
              this.expectJSX("/");
              var name_3 = this.parseJSXElementName();
              this.expectJSX(">");
              return this.finalize(node, new JSXNode.JSXClosingElement(name_3));
            }
            var name = this.parseJSXElementName();
            var attributes = this.parseJSXAttributes();
            var selfClosing = this.matchJSX("/");
            if (selfClosing) {
              this.expectJSX("/");
            }
            this.expectJSX(">");
            return this.finalize(node, new JSXNode.JSXOpeningElement(name, selfClosing, attributes));
          };
          JSXParser2.prototype.parseJSXEmptyExpression = function() {
            var node = this.createJSXChildNode();
            this.collectComments();
            this.lastMarker.index = this.scanner.index;
            this.lastMarker.line = this.scanner.lineNumber;
            this.lastMarker.column = this.scanner.index - this.scanner.lineStart;
            return this.finalize(node, new JSXNode.JSXEmptyExpression);
          };
          JSXParser2.prototype.parseJSXExpressionContainer = function() {
            var node = this.createJSXNode();
            this.expectJSX("{");
            var expression;
            if (this.matchJSX("}")) {
              expression = this.parseJSXEmptyExpression();
              this.expectJSX("}");
            } else {
              this.finishJSX();
              expression = this.parseAssignmentExpression();
              this.reenterJSX();
            }
            return this.finalize(node, new JSXNode.JSXExpressionContainer(expression));
          };
          JSXParser2.prototype.parseJSXChildren = function() {
            var children = [];
            while (!this.scanner.eof()) {
              var node = this.createJSXChildNode();
              var token = this.nextJSXText();
              if (token.start < token.end) {
                var raw = this.getTokenRaw(token);
                var child = this.finalize(node, new JSXNode.JSXText(token.value, raw));
                children.push(child);
              }
              if (this.scanner.source[this.scanner.index] === "{") {
                var container = this.parseJSXExpressionContainer();
                children.push(container);
              } else {
                break;
              }
            }
            return children;
          };
          JSXParser2.prototype.parseComplexJSXElement = function(el) {
            var stack = [];
            while (!this.scanner.eof()) {
              el.children = el.children.concat(this.parseJSXChildren());
              var node = this.createJSXChildNode();
              var element = this.parseJSXBoundaryElement();
              if (element.type === jsx_syntax_1.JSXSyntax.JSXOpeningElement) {
                var opening = element;
                if (opening.selfClosing) {
                  var child = this.finalize(node, new JSXNode.JSXElement(opening, [], null));
                  el.children.push(child);
                } else {
                  stack.push(el);
                  el = { node, opening, closing: null, children: [] };
                }
              }
              if (element.type === jsx_syntax_1.JSXSyntax.JSXClosingElement) {
                el.closing = element;
                var open_1 = getQualifiedElementName(el.opening.name);
                var close_1 = getQualifiedElementName(el.closing.name);
                if (open_1 !== close_1) {
                  this.tolerateError("Expected corresponding JSX closing tag for %0", open_1);
                }
                if (stack.length > 0) {
                  var child = this.finalize(el.node, new JSXNode.JSXElement(el.opening, el.children, el.closing));
                  el = stack[stack.length - 1];
                  el.children.push(child);
                  stack.pop();
                } else {
                  break;
                }
              }
            }
            return el;
          };
          JSXParser2.prototype.parseJSXElement = function() {
            var node = this.createJSXNode();
            var opening = this.parseJSXOpeningElement();
            var children = [];
            var closing = null;
            if (!opening.selfClosing) {
              var el = this.parseComplexJSXElement({ node, opening, closing, children });
              children = el.children;
              closing = el.closing;
            }
            return this.finalize(node, new JSXNode.JSXElement(opening, children, closing));
          };
          JSXParser2.prototype.parseJSXRoot = function() {
            if (this.config.tokens) {
              this.tokens.pop();
            }
            this.startJSX();
            var element = this.parseJSXElement();
            this.finishJSX();
            return element;
          };
          JSXParser2.prototype.isStartOfExpression = function() {
            return _super.prototype.isStartOfExpression.call(this) || this.match("<");
          };
          return JSXParser2;
        }(parser_1.Parser);
        exports2.JSXParser = JSXParser;
      },
      function(module2, exports2) {
        Object.defineProperty(exports2, "__esModule", { value: true });
        var Regex = {
          NonAsciiIdentifierStart: /[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0-\u08B4\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2118-\u211D\u2124\u2126\u2128\u212A-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309B-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FD5\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AD\uA7B0-\uA7B7\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF30-\uDF4A\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2]|\uD804[\uDC03-\uDC37\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE2B\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61]|\uD805[\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE80-\uDEAA\uDF00-\uDF19]|\uD806[\uDCA0-\uDCDF\uDCFF\uDEC0-\uDEF8]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|[\uD80C\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50\uDF93-\uDF9F]|\uD82C[\uDC00\uDC01]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD83A[\uDC00-\uDCC4]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1]|\uD87E[\uDC00-\uDE1D]/,
          NonAsciiIdentifierPart: /[\xAA\xB5\xB7\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0300-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u0483-\u0487\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05F0-\u05F2\u0610-\u061A\u0620-\u0669\u066E-\u06D3\u06D5-\u06DC\u06DF-\u06E8\u06EA-\u06FC\u06FF\u0710-\u074A\u074D-\u07B1\u07C0-\u07F5\u07FA\u0800-\u082D\u0840-\u085B\u08A0-\u08B4\u08E3-\u0963\u0966-\u096F\u0971-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AEF\u0AF9\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B6F\u0B71\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BEF\u0C00-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58-\u0C5A\u0C60-\u0C63\u0C66-\u0C6F\u0C81-\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2\u0D01-\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D-\u0D44\u0D46-\u0D48\u0D4A-\u0D4E\u0D57\u0D5F-\u0D63\u0D66-\u0D6F\u0D7A-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F6C\u0F71-\u0F84\u0F86-\u0F97\u0F99-\u0FBC\u0FC6\u1000-\u1049\u1050-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u135F\u1369-\u1371\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17D3\u17D7\u17DC\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u1820-\u1877\u1880-\u18AA\u18B0-\u18F5\u1900-\u191E\u1920-\u192B\u1930-\u193B\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19DA\u1A00-\u1A1B\u1A20-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA7\u1AB0-\u1ABD\u1B00-\u1B4B\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1BF3\u1C00-\u1C37\u1C40-\u1C49\u1C4D-\u1C7D\u1CD0-\u1CD2\u1CD4-\u1CF6\u1CF8\u1CF9\u1D00-\u1DF5\u1DFC-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u200C\u200D\u203F\u2040\u2054\u2071\u207F\u2090-\u209C\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2102\u2107\u210A-\u2113\u2115\u2118-\u211D\u2124\u2126\u2128\u212A-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D7F-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u3005-\u3007\u3021-\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u3099-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FD5\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66F\uA674-\uA67D\uA67F-\uA6F1\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AD\uA7B0-\uA7B7\uA7F7-\uA827\uA840-\uA873\uA880-\uA8C4\uA8D0-\uA8D9\uA8E0-\uA8F7\uA8FB\uA8FD\uA900-\uA92D\uA930-\uA953\uA960-\uA97C\uA980-\uA9C0\uA9CF-\uA9D9\uA9E0-\uA9FE\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA60-\uAA76\uAA7A-\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF6\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABEA\uABEC\uABED\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE00-\uFE0F\uFE20-\uFE2F\uFE33\uFE34\uFE4D-\uFE4F\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF3F\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDDFD\uDE80-\uDE9C\uDEA0-\uDED0\uDEE0\uDF00-\uDF1F\uDF30-\uDF4A\uDF50-\uDF7A\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCA0-\uDCA9\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00-\uDE03\uDE05\uDE06\uDE0C-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE38-\uDE3A\uDE3F\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE6\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2]|\uD804[\uDC00-\uDC46\uDC66-\uDC6F\uDC7F-\uDCBA\uDCD0-\uDCE8\uDCF0-\uDCF9\uDD00-\uDD34\uDD36-\uDD3F\uDD50-\uDD73\uDD76\uDD80-\uDDC4\uDDCA-\uDDCC\uDDD0-\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE37\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEEA\uDEF0-\uDEF9\uDF00-\uDF03\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3C-\uDF44\uDF47\uDF48\uDF4B-\uDF4D\uDF50\uDF57\uDF5D-\uDF63\uDF66-\uDF6C\uDF70-\uDF74]|\uD805[\uDC80-\uDCC5\uDCC7\uDCD0-\uDCD9\uDD80-\uDDB5\uDDB8-\uDDC0\uDDD8-\uDDDD\uDE00-\uDE40\uDE44\uDE50-\uDE59\uDE80-\uDEB7\uDEC0-\uDEC9\uDF00-\uDF19\uDF1D-\uDF2B\uDF30-\uDF39]|\uD806[\uDCA0-\uDCE9\uDCFF\uDEC0-\uDEF8]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|[\uD80C\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE60-\uDE69\uDED0-\uDEED\uDEF0-\uDEF4\uDF00-\uDF36\uDF40-\uDF43\uDF50-\uDF59\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50-\uDF7E\uDF8F-\uDF9F]|\uD82C[\uDC00\uDC01]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99\uDC9D\uDC9E]|\uD834[\uDD65-\uDD69\uDD6D-\uDD72\uDD7B-\uDD82\uDD85-\uDD8B\uDDAA-\uDDAD\uDE42-\uDE44]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB\uDFCE-\uDFFF]|\uD836[\uDE00-\uDE36\uDE3B-\uDE6C\uDE75\uDE84\uDE9B-\uDE9F\uDEA1-\uDEAF]|\uD83A[\uDC00-\uDCC4\uDCD0-\uDCD6]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1]|\uD87E[\uDC00-\uDE1D]|\uDB40[\uDD00-\uDDEF]/
        };
        exports2.Character = {
          fromCodePoint: function(cp) {
            return cp < 65536 ? String.fromCharCode(cp) : String.fromCharCode(55296 + (cp - 65536 >> 10)) + String.fromCharCode(56320 + (cp - 65536 & 1023));
          },
          isWhiteSpace: function(cp) {
            return cp === 32 || cp === 9 || cp === 11 || cp === 12 || cp === 160 || cp >= 5760 && [5760, 8192, 8193, 8194, 8195, 8196, 8197, 8198, 8199, 8200, 8201, 8202, 8239, 8287, 12288, 65279].indexOf(cp) >= 0;
          },
          isLineTerminator: function(cp) {
            return cp === 10 || cp === 13 || cp === 8232 || cp === 8233;
          },
          isIdentifierStart: function(cp) {
            return cp === 36 || cp === 95 || cp >= 65 && cp <= 90 || cp >= 97 && cp <= 122 || cp === 92 || cp >= 128 && Regex.NonAsciiIdentifierStart.test(exports2.Character.fromCodePoint(cp));
          },
          isIdentifierPart: function(cp) {
            return cp === 36 || cp === 95 || cp >= 65 && cp <= 90 || cp >= 97 && cp <= 122 || cp >= 48 && cp <= 57 || cp === 92 || cp >= 128 && Regex.NonAsciiIdentifierPart.test(exports2.Character.fromCodePoint(cp));
          },
          isDecimalDigit: function(cp) {
            return cp >= 48 && cp <= 57;
          },
          isHexDigit: function(cp) {
            return cp >= 48 && cp <= 57 || cp >= 65 && cp <= 70 || cp >= 97 && cp <= 102;
          },
          isOctalDigit: function(cp) {
            return cp >= 48 && cp <= 55;
          }
        };
      },
      function(module2, exports2, __webpack_require__) {
        Object.defineProperty(exports2, "__esModule", { value: true });
        var jsx_syntax_1 = __webpack_require__(6);
        var JSXClosingElement = function() {
          function JSXClosingElement2(name) {
            this.type = jsx_syntax_1.JSXSyntax.JSXClosingElement;
            this.name = name;
          }
          return JSXClosingElement2;
        }();
        exports2.JSXClosingElement = JSXClosingElement;
        var JSXElement = function() {
          function JSXElement2(openingElement, children, closingElement) {
            this.type = jsx_syntax_1.JSXSyntax.JSXElement;
            this.openingElement = openingElement;
            this.children = children;
            this.closingElement = closingElement;
          }
          return JSXElement2;
        }();
        exports2.JSXElement = JSXElement;
        var JSXEmptyExpression = function() {
          function JSXEmptyExpression2() {
            this.type = jsx_syntax_1.JSXSyntax.JSXEmptyExpression;
          }
          return JSXEmptyExpression2;
        }();
        exports2.JSXEmptyExpression = JSXEmptyExpression;
        var JSXExpressionContainer = function() {
          function JSXExpressionContainer2(expression) {
            this.type = jsx_syntax_1.JSXSyntax.JSXExpressionContainer;
            this.expression = expression;
          }
          return JSXExpressionContainer2;
        }();
        exports2.JSXExpressionContainer = JSXExpressionContainer;
        var JSXIdentifier = function() {
          function JSXIdentifier2(name) {
            this.type = jsx_syntax_1.JSXSyntax.JSXIdentifier;
            this.name = name;
          }
          return JSXIdentifier2;
        }();
        exports2.JSXIdentifier = JSXIdentifier;
        var JSXMemberExpression = function() {
          function JSXMemberExpression2(object, property) {
            this.type = jsx_syntax_1.JSXSyntax.JSXMemberExpression;
            this.object = object;
            this.property = property;
          }
          return JSXMemberExpression2;
        }();
        exports2.JSXMemberExpression = JSXMemberExpression;
        var JSXAttribute = function() {
          function JSXAttribute2(name, value) {
            this.type = jsx_syntax_1.JSXSyntax.JSXAttribute;
            this.name = name;
            this.value = value;
          }
          return JSXAttribute2;
        }();
        exports2.JSXAttribute = JSXAttribute;
        var JSXNamespacedName = function() {
          function JSXNamespacedName2(namespace, name) {
            this.type = jsx_syntax_1.JSXSyntax.JSXNamespacedName;
            this.namespace = namespace;
            this.name = name;
          }
          return JSXNamespacedName2;
        }();
        exports2.JSXNamespacedName = JSXNamespacedName;
        var JSXOpeningElement = function() {
          function JSXOpeningElement2(name, selfClosing, attributes) {
            this.type = jsx_syntax_1.JSXSyntax.JSXOpeningElement;
            this.name = name;
            this.selfClosing = selfClosing;
            this.attributes = attributes;
          }
          return JSXOpeningElement2;
        }();
        exports2.JSXOpeningElement = JSXOpeningElement;
        var JSXSpreadAttribute = function() {
          function JSXSpreadAttribute2(argument) {
            this.type = jsx_syntax_1.JSXSyntax.JSXSpreadAttribute;
            this.argument = argument;
          }
          return JSXSpreadAttribute2;
        }();
        exports2.JSXSpreadAttribute = JSXSpreadAttribute;
        var JSXText = function() {
          function JSXText2(value, raw) {
            this.type = jsx_syntax_1.JSXSyntax.JSXText;
            this.value = value;
            this.raw = raw;
          }
          return JSXText2;
        }();
        exports2.JSXText = JSXText;
      },
      function(module2, exports2) {
        Object.defineProperty(exports2, "__esModule", { value: true });
        exports2.JSXSyntax = {
          JSXAttribute: "JSXAttribute",
          JSXClosingElement: "JSXClosingElement",
          JSXElement: "JSXElement",
          JSXEmptyExpression: "JSXEmptyExpression",
          JSXExpressionContainer: "JSXExpressionContainer",
          JSXIdentifier: "JSXIdentifier",
          JSXMemberExpression: "JSXMemberExpression",
          JSXNamespacedName: "JSXNamespacedName",
          JSXOpeningElement: "JSXOpeningElement",
          JSXSpreadAttribute: "JSXSpreadAttribute",
          JSXText: "JSXText"
        };
      },
      function(module2, exports2, __webpack_require__) {
        Object.defineProperty(exports2, "__esModule", { value: true });
        var syntax_1 = __webpack_require__(2);
        var ArrayExpression = function() {
          function ArrayExpression2(elements) {
            this.type = syntax_1.Syntax.ArrayExpression;
            this.elements = elements;
          }
          return ArrayExpression2;
        }();
        exports2.ArrayExpression = ArrayExpression;
        var ArrayPattern = function() {
          function ArrayPattern2(elements) {
            this.type = syntax_1.Syntax.ArrayPattern;
            this.elements = elements;
          }
          return ArrayPattern2;
        }();
        exports2.ArrayPattern = ArrayPattern;
        var ArrowFunctionExpression = function() {
          function ArrowFunctionExpression2(params, body, expression) {
            this.type = syntax_1.Syntax.ArrowFunctionExpression;
            this.id = null;
            this.params = params;
            this.body = body;
            this.generator = false;
            this.expression = expression;
            this.async = false;
          }
          return ArrowFunctionExpression2;
        }();
        exports2.ArrowFunctionExpression = ArrowFunctionExpression;
        var AssignmentExpression = function() {
          function AssignmentExpression2(operator, left, right) {
            this.type = syntax_1.Syntax.AssignmentExpression;
            this.operator = operator;
            this.left = left;
            this.right = right;
          }
          return AssignmentExpression2;
        }();
        exports2.AssignmentExpression = AssignmentExpression;
        var AssignmentPattern = function() {
          function AssignmentPattern2(left, right) {
            this.type = syntax_1.Syntax.AssignmentPattern;
            this.left = left;
            this.right = right;
          }
          return AssignmentPattern2;
        }();
        exports2.AssignmentPattern = AssignmentPattern;
        var AsyncArrowFunctionExpression = function() {
          function AsyncArrowFunctionExpression2(params, body, expression) {
            this.type = syntax_1.Syntax.ArrowFunctionExpression;
            this.id = null;
            this.params = params;
            this.body = body;
            this.generator = false;
            this.expression = expression;
            this.async = true;
          }
          return AsyncArrowFunctionExpression2;
        }();
        exports2.AsyncArrowFunctionExpression = AsyncArrowFunctionExpression;
        var AsyncFunctionDeclaration = function() {
          function AsyncFunctionDeclaration2(id, params, body) {
            this.type = syntax_1.Syntax.FunctionDeclaration;
            this.id = id;
            this.params = params;
            this.body = body;
            this.generator = false;
            this.expression = false;
            this.async = true;
          }
          return AsyncFunctionDeclaration2;
        }();
        exports2.AsyncFunctionDeclaration = AsyncFunctionDeclaration;
        var AsyncFunctionExpression = function() {
          function AsyncFunctionExpression2(id, params, body) {
            this.type = syntax_1.Syntax.FunctionExpression;
            this.id = id;
            this.params = params;
            this.body = body;
            this.generator = false;
            this.expression = false;
            this.async = true;
          }
          return AsyncFunctionExpression2;
        }();
        exports2.AsyncFunctionExpression = AsyncFunctionExpression;
        var AwaitExpression = function() {
          function AwaitExpression2(argument) {
            this.type = syntax_1.Syntax.AwaitExpression;
            this.argument = argument;
          }
          return AwaitExpression2;
        }();
        exports2.AwaitExpression = AwaitExpression;
        var BinaryExpression = function() {
          function BinaryExpression2(operator, left, right) {
            var logical = operator === "||" || operator === "&&";
            this.type = logical ? syntax_1.Syntax.LogicalExpression : syntax_1.Syntax.BinaryExpression;
            this.operator = operator;
            this.left = left;
            this.right = right;
          }
          return BinaryExpression2;
        }();
        exports2.BinaryExpression = BinaryExpression;
        var BlockStatement = function() {
          function BlockStatement2(body) {
            this.type = syntax_1.Syntax.BlockStatement;
            this.body = body;
          }
          return BlockStatement2;
        }();
        exports2.BlockStatement = BlockStatement;
        var BreakStatement = function() {
          function BreakStatement2(label) {
            this.type = syntax_1.Syntax.BreakStatement;
            this.label = label;
          }
          return BreakStatement2;
        }();
        exports2.BreakStatement = BreakStatement;
        var CallExpression = function() {
          function CallExpression2(callee, args) {
            this.type = syntax_1.Syntax.CallExpression;
            this.callee = callee;
            this.arguments = args;
          }
          return CallExpression2;
        }();
        exports2.CallExpression = CallExpression;
        var CatchClause = function() {
          function CatchClause2(param, body) {
            this.type = syntax_1.Syntax.CatchClause;
            this.param = param;
            this.body = body;
          }
          return CatchClause2;
        }();
        exports2.CatchClause = CatchClause;
        var ClassBody = function() {
          function ClassBody2(body) {
            this.type = syntax_1.Syntax.ClassBody;
            this.body = body;
          }
          return ClassBody2;
        }();
        exports2.ClassBody = ClassBody;
        var ClassDeclaration = function() {
          function ClassDeclaration2(id, superClass, body) {
            this.type = syntax_1.Syntax.ClassDeclaration;
            this.id = id;
            this.superClass = superClass;
            this.body = body;
          }
          return ClassDeclaration2;
        }();
        exports2.ClassDeclaration = ClassDeclaration;
        var ClassExpression = function() {
          function ClassExpression2(id, superClass, body) {
            this.type = syntax_1.Syntax.ClassExpression;
            this.id = id;
            this.superClass = superClass;
            this.body = body;
          }
          return ClassExpression2;
        }();
        exports2.ClassExpression = ClassExpression;
        var ComputedMemberExpression = function() {
          function ComputedMemberExpression2(object, property) {
            this.type = syntax_1.Syntax.MemberExpression;
            this.computed = true;
            this.object = object;
            this.property = property;
          }
          return ComputedMemberExpression2;
        }();
        exports2.ComputedMemberExpression = ComputedMemberExpression;
        var ConditionalExpression = function() {
          function ConditionalExpression2(test, consequent, alternate) {
            this.type = syntax_1.Syntax.ConditionalExpression;
            this.test = test;
            this.consequent = consequent;
            this.alternate = alternate;
          }
          return ConditionalExpression2;
        }();
        exports2.ConditionalExpression = ConditionalExpression;
        var ContinueStatement = function() {
          function ContinueStatement2(label) {
            this.type = syntax_1.Syntax.ContinueStatement;
            this.label = label;
          }
          return ContinueStatement2;
        }();
        exports2.ContinueStatement = ContinueStatement;
        var DebuggerStatement = function() {
          function DebuggerStatement2() {
            this.type = syntax_1.Syntax.DebuggerStatement;
          }
          return DebuggerStatement2;
        }();
        exports2.DebuggerStatement = DebuggerStatement;
        var Directive = function() {
          function Directive2(expression, directive) {
            this.type = syntax_1.Syntax.ExpressionStatement;
            this.expression = expression;
            this.directive = directive;
          }
          return Directive2;
        }();
        exports2.Directive = Directive;
        var DoWhileStatement = function() {
          function DoWhileStatement2(body, test) {
            this.type = syntax_1.Syntax.DoWhileStatement;
            this.body = body;
            this.test = test;
          }
          return DoWhileStatement2;
        }();
        exports2.DoWhileStatement = DoWhileStatement;
        var EmptyStatement = function() {
          function EmptyStatement2() {
            this.type = syntax_1.Syntax.EmptyStatement;
          }
          return EmptyStatement2;
        }();
        exports2.EmptyStatement = EmptyStatement;
        var ExportAllDeclaration = function() {
          function ExportAllDeclaration2(source) {
            this.type = syntax_1.Syntax.ExportAllDeclaration;
            this.source = source;
          }
          return ExportAllDeclaration2;
        }();
        exports2.ExportAllDeclaration = ExportAllDeclaration;
        var ExportDefaultDeclaration = function() {
          function ExportDefaultDeclaration2(declaration) {
            this.type = syntax_1.Syntax.ExportDefaultDeclaration;
            this.declaration = declaration;
          }
          return ExportDefaultDeclaration2;
        }();
        exports2.ExportDefaultDeclaration = ExportDefaultDeclaration;
        var ExportNamedDeclaration = function() {
          function ExportNamedDeclaration2(declaration, specifiers, source) {
            this.type = syntax_1.Syntax.ExportNamedDeclaration;
            this.declaration = declaration;
            this.specifiers = specifiers;
            this.source = source;
          }
          return ExportNamedDeclaration2;
        }();
        exports2.ExportNamedDeclaration = ExportNamedDeclaration;
        var ExportSpecifier = function() {
          function ExportSpecifier2(local, exported) {
            this.type = syntax_1.Syntax.ExportSpecifier;
            this.exported = exported;
            this.local = local;
          }
          return ExportSpecifier2;
        }();
        exports2.ExportSpecifier = ExportSpecifier;
        var ExpressionStatement = function() {
          function ExpressionStatement2(expression) {
            this.type = syntax_1.Syntax.ExpressionStatement;
            this.expression = expression;
          }
          return ExpressionStatement2;
        }();
        exports2.ExpressionStatement = ExpressionStatement;
        var ForInStatement = function() {
          function ForInStatement2(left, right, body) {
            this.type = syntax_1.Syntax.ForInStatement;
            this.left = left;
            this.right = right;
            this.body = body;
            this.each = false;
          }
          return ForInStatement2;
        }();
        exports2.ForInStatement = ForInStatement;
        var ForOfStatement = function() {
          function ForOfStatement2(left, right, body) {
            this.type = syntax_1.Syntax.ForOfStatement;
            this.left = left;
            this.right = right;
            this.body = body;
          }
          return ForOfStatement2;
        }();
        exports2.ForOfStatement = ForOfStatement;
        var ForStatement = function() {
          function ForStatement2(init, test, update, body) {
            this.type = syntax_1.Syntax.ForStatement;
            this.init = init;
            this.test = test;
            this.update = update;
            this.body = body;
          }
          return ForStatement2;
        }();
        exports2.ForStatement = ForStatement;
        var FunctionDeclaration = function() {
          function FunctionDeclaration2(id, params, body, generator) {
            this.type = syntax_1.Syntax.FunctionDeclaration;
            this.id = id;
            this.params = params;
            this.body = body;
            this.generator = generator;
            this.expression = false;
            this.async = false;
          }
          return FunctionDeclaration2;
        }();
        exports2.FunctionDeclaration = FunctionDeclaration;
        var FunctionExpression = function() {
          function FunctionExpression2(id, params, body, generator) {
            this.type = syntax_1.Syntax.FunctionExpression;
            this.id = id;
            this.params = params;
            this.body = body;
            this.generator = generator;
            this.expression = false;
            this.async = false;
          }
          return FunctionExpression2;
        }();
        exports2.FunctionExpression = FunctionExpression;
        var Identifier = function() {
          function Identifier2(name) {
            this.type = syntax_1.Syntax.Identifier;
            this.name = name;
          }
          return Identifier2;
        }();
        exports2.Identifier = Identifier;
        var IfStatement = function() {
          function IfStatement2(test, consequent, alternate) {
            this.type = syntax_1.Syntax.IfStatement;
            this.test = test;
            this.consequent = consequent;
            this.alternate = alternate;
          }
          return IfStatement2;
        }();
        exports2.IfStatement = IfStatement;
        var ImportDeclaration = function() {
          function ImportDeclaration2(specifiers, source) {
            this.type = syntax_1.Syntax.ImportDeclaration;
            this.specifiers = specifiers;
            this.source = source;
          }
          return ImportDeclaration2;
        }();
        exports2.ImportDeclaration = ImportDeclaration;
        var ImportDefaultSpecifier = function() {
          function ImportDefaultSpecifier2(local) {
            this.type = syntax_1.Syntax.ImportDefaultSpecifier;
            this.local = local;
          }
          return ImportDefaultSpecifier2;
        }();
        exports2.ImportDefaultSpecifier = ImportDefaultSpecifier;
        var ImportNamespaceSpecifier = function() {
          function ImportNamespaceSpecifier2(local) {
            this.type = syntax_1.Syntax.ImportNamespaceSpecifier;
            this.local = local;
          }
          return ImportNamespaceSpecifier2;
        }();
        exports2.ImportNamespaceSpecifier = ImportNamespaceSpecifier;
        var ImportSpecifier = function() {
          function ImportSpecifier2(local, imported) {
            this.type = syntax_1.Syntax.ImportSpecifier;
            this.local = local;
            this.imported = imported;
          }
          return ImportSpecifier2;
        }();
        exports2.ImportSpecifier = ImportSpecifier;
        var LabeledStatement = function() {
          function LabeledStatement2(label, body) {
            this.type = syntax_1.Syntax.LabeledStatement;
            this.label = label;
            this.body = body;
          }
          return LabeledStatement2;
        }();
        exports2.LabeledStatement = LabeledStatement;
        var Literal = function() {
          function Literal2(value, raw) {
            this.type = syntax_1.Syntax.Literal;
            this.value = value;
            this.raw = raw;
          }
          return Literal2;
        }();
        exports2.Literal = Literal;
        var MetaProperty = function() {
          function MetaProperty2(meta, property) {
            this.type = syntax_1.Syntax.MetaProperty;
            this.meta = meta;
            this.property = property;
          }
          return MetaProperty2;
        }();
        exports2.MetaProperty = MetaProperty;
        var MethodDefinition = function() {
          function MethodDefinition2(key, computed, value, kind2, isStatic) {
            this.type = syntax_1.Syntax.MethodDefinition;
            this.key = key;
            this.computed = computed;
            this.value = value;
            this.kind = kind2;
            this.static = isStatic;
          }
          return MethodDefinition2;
        }();
        exports2.MethodDefinition = MethodDefinition;
        var Module = function() {
          function Module2(body) {
            this.type = syntax_1.Syntax.Program;
            this.body = body;
            this.sourceType = "module";
          }
          return Module2;
        }();
        exports2.Module = Module;
        var NewExpression = function() {
          function NewExpression2(callee, args) {
            this.type = syntax_1.Syntax.NewExpression;
            this.callee = callee;
            this.arguments = args;
          }
          return NewExpression2;
        }();
        exports2.NewExpression = NewExpression;
        var ObjectExpression = function() {
          function ObjectExpression2(properties) {
            this.type = syntax_1.Syntax.ObjectExpression;
            this.properties = properties;
          }
          return ObjectExpression2;
        }();
        exports2.ObjectExpression = ObjectExpression;
        var ObjectPattern = function() {
          function ObjectPattern2(properties) {
            this.type = syntax_1.Syntax.ObjectPattern;
            this.properties = properties;
          }
          return ObjectPattern2;
        }();
        exports2.ObjectPattern = ObjectPattern;
        var Property = function() {
          function Property2(kind2, key, computed, value, method, shorthand) {
            this.type = syntax_1.Syntax.Property;
            this.key = key;
            this.computed = computed;
            this.value = value;
            this.kind = kind2;
            this.method = method;
            this.shorthand = shorthand;
          }
          return Property2;
        }();
        exports2.Property = Property;
        var RegexLiteral = function() {
          function RegexLiteral2(value, raw, pattern, flags) {
            this.type = syntax_1.Syntax.Literal;
            this.value = value;
            this.raw = raw;
            this.regex = { pattern, flags };
          }
          return RegexLiteral2;
        }();
        exports2.RegexLiteral = RegexLiteral;
        var RestElement = function() {
          function RestElement2(argument) {
            this.type = syntax_1.Syntax.RestElement;
            this.argument = argument;
          }
          return RestElement2;
        }();
        exports2.RestElement = RestElement;
        var ReturnStatement = function() {
          function ReturnStatement2(argument) {
            this.type = syntax_1.Syntax.ReturnStatement;
            this.argument = argument;
          }
          return ReturnStatement2;
        }();
        exports2.ReturnStatement = ReturnStatement;
        var Script = function() {
          function Script2(body) {
            this.type = syntax_1.Syntax.Program;
            this.body = body;
            this.sourceType = "script";
          }
          return Script2;
        }();
        exports2.Script = Script;
        var SequenceExpression = function() {
          function SequenceExpression2(expressions) {
            this.type = syntax_1.Syntax.SequenceExpression;
            this.expressions = expressions;
          }
          return SequenceExpression2;
        }();
        exports2.SequenceExpression = SequenceExpression;
        var SpreadElement = function() {
          function SpreadElement2(argument) {
            this.type = syntax_1.Syntax.SpreadElement;
            this.argument = argument;
          }
          return SpreadElement2;
        }();
        exports2.SpreadElement = SpreadElement;
        var StaticMemberExpression = function() {
          function StaticMemberExpression2(object, property) {
            this.type = syntax_1.Syntax.MemberExpression;
            this.computed = false;
            this.object = object;
            this.property = property;
          }
          return StaticMemberExpression2;
        }();
        exports2.StaticMemberExpression = StaticMemberExpression;
        var Super = function() {
          function Super2() {
            this.type = syntax_1.Syntax.Super;
          }
          return Super2;
        }();
        exports2.Super = Super;
        var SwitchCase = function() {
          function SwitchCase2(test, consequent) {
            this.type = syntax_1.Syntax.SwitchCase;
            this.test = test;
            this.consequent = consequent;
          }
          return SwitchCase2;
        }();
        exports2.SwitchCase = SwitchCase;
        var SwitchStatement = function() {
          function SwitchStatement2(discriminant, cases) {
            this.type = syntax_1.Syntax.SwitchStatement;
            this.discriminant = discriminant;
            this.cases = cases;
          }
          return SwitchStatement2;
        }();
        exports2.SwitchStatement = SwitchStatement;
        var TaggedTemplateExpression = function() {
          function TaggedTemplateExpression2(tag, quasi) {
            this.type = syntax_1.Syntax.TaggedTemplateExpression;
            this.tag = tag;
            this.quasi = quasi;
          }
          return TaggedTemplateExpression2;
        }();
        exports2.TaggedTemplateExpression = TaggedTemplateExpression;
        var TemplateElement = function() {
          function TemplateElement2(value, tail) {
            this.type = syntax_1.Syntax.TemplateElement;
            this.value = value;
            this.tail = tail;
          }
          return TemplateElement2;
        }();
        exports2.TemplateElement = TemplateElement;
        var TemplateLiteral = function() {
          function TemplateLiteral2(quasis, expressions) {
            this.type = syntax_1.Syntax.TemplateLiteral;
            this.quasis = quasis;
            this.expressions = expressions;
          }
          return TemplateLiteral2;
        }();
        exports2.TemplateLiteral = TemplateLiteral;
        var ThisExpression = function() {
          function ThisExpression2() {
            this.type = syntax_1.Syntax.ThisExpression;
          }
          return ThisExpression2;
        }();
        exports2.ThisExpression = ThisExpression;
        var ThrowStatement = function() {
          function ThrowStatement2(argument) {
            this.type = syntax_1.Syntax.ThrowStatement;
            this.argument = argument;
          }
          return ThrowStatement2;
        }();
        exports2.ThrowStatement = ThrowStatement;
        var TryStatement = function() {
          function TryStatement2(block2, handler, finalizer) {
            this.type = syntax_1.Syntax.TryStatement;
            this.block = block2;
            this.handler = handler;
            this.finalizer = finalizer;
          }
          return TryStatement2;
        }();
        exports2.TryStatement = TryStatement;
        var UnaryExpression = function() {
          function UnaryExpression2(operator, argument) {
            this.type = syntax_1.Syntax.UnaryExpression;
            this.operator = operator;
            this.argument = argument;
            this.prefix = true;
          }
          return UnaryExpression2;
        }();
        exports2.UnaryExpression = UnaryExpression;
        var UpdateExpression = function() {
          function UpdateExpression2(operator, argument, prefix) {
            this.type = syntax_1.Syntax.UpdateExpression;
            this.operator = operator;
            this.argument = argument;
            this.prefix = prefix;
          }
          return UpdateExpression2;
        }();
        exports2.UpdateExpression = UpdateExpression;
        var VariableDeclaration = function() {
          function VariableDeclaration2(declarations, kind2) {
            this.type = syntax_1.Syntax.VariableDeclaration;
            this.declarations = declarations;
            this.kind = kind2;
          }
          return VariableDeclaration2;
        }();
        exports2.VariableDeclaration = VariableDeclaration;
        var VariableDeclarator = function() {
          function VariableDeclarator2(id, init) {
            this.type = syntax_1.Syntax.VariableDeclarator;
            this.id = id;
            this.init = init;
          }
          return VariableDeclarator2;
        }();
        exports2.VariableDeclarator = VariableDeclarator;
        var WhileStatement = function() {
          function WhileStatement2(test, body) {
            this.type = syntax_1.Syntax.WhileStatement;
            this.test = test;
            this.body = body;
          }
          return WhileStatement2;
        }();
        exports2.WhileStatement = WhileStatement;
        var WithStatement = function() {
          function WithStatement2(object, body) {
            this.type = syntax_1.Syntax.WithStatement;
            this.object = object;
            this.body = body;
          }
          return WithStatement2;
        }();
        exports2.WithStatement = WithStatement;
        var YieldExpression = function() {
          function YieldExpression2(argument, delegate) {
            this.type = syntax_1.Syntax.YieldExpression;
            this.argument = argument;
            this.delegate = delegate;
          }
          return YieldExpression2;
        }();
        exports2.YieldExpression = YieldExpression;
      },
      function(module2, exports2, __webpack_require__) {
        Object.defineProperty(exports2, "__esModule", { value: true });
        var assert_1 = __webpack_require__(9);
        var error_handler_1 = __webpack_require__(10);
        var messages_1 = __webpack_require__(11);
        var Node = __webpack_require__(7);
        var scanner_1 = __webpack_require__(12);
        var syntax_1 = __webpack_require__(2);
        var token_1 = __webpack_require__(13);
        var ArrowParameterPlaceHolder = "ArrowParameterPlaceHolder";
        var Parser = function() {
          function Parser2(code, options2, delegate) {
            if (options2 === undefined) {
              options2 = {};
            }
            this.config = {
              range: typeof options2.range === "boolean" && options2.range,
              loc: typeof options2.loc === "boolean" && options2.loc,
              source: null,
              tokens: typeof options2.tokens === "boolean" && options2.tokens,
              comment: typeof options2.comment === "boolean" && options2.comment,
              tolerant: typeof options2.tolerant === "boolean" && options2.tolerant
            };
            if (this.config.loc && options2.source && options2.source !== null) {
              this.config.source = String(options2.source);
            }
            this.delegate = delegate;
            this.errorHandler = new error_handler_1.ErrorHandler;
            this.errorHandler.tolerant = this.config.tolerant;
            this.scanner = new scanner_1.Scanner(code, this.errorHandler);
            this.scanner.trackComment = this.config.comment;
            this.operatorPrecedence = {
              ")": 0,
              ";": 0,
              ",": 0,
              "=": 0,
              "]": 0,
              "||": 1,
              "&&": 2,
              "|": 3,
              "^": 4,
              "&": 5,
              "==": 6,
              "!=": 6,
              "===": 6,
              "!==": 6,
              "<": 7,
              ">": 7,
              "<=": 7,
              ">=": 7,
              "<<": 8,
              ">>": 8,
              ">>>": 8,
              "+": 9,
              "-": 9,
              "*": 11,
              "/": 11,
              "%": 11
            };
            this.lookahead = {
              type: 2,
              value: "",
              lineNumber: this.scanner.lineNumber,
              lineStart: 0,
              start: 0,
              end: 0
            };
            this.hasLineTerminator = false;
            this.context = {
              isModule: false,
              await: false,
              allowIn: true,
              allowStrictDirective: true,
              allowYield: true,
              firstCoverInitializedNameError: null,
              isAssignmentTarget: false,
              isBindingElement: false,
              inFunctionBody: false,
              inIteration: false,
              inSwitch: false,
              labelSet: {},
              strict: false
            };
            this.tokens = [];
            this.startMarker = {
              index: 0,
              line: this.scanner.lineNumber,
              column: 0
            };
            this.lastMarker = {
              index: 0,
              line: this.scanner.lineNumber,
              column: 0
            };
            this.nextToken();
            this.lastMarker = {
              index: this.scanner.index,
              line: this.scanner.lineNumber,
              column: this.scanner.index - this.scanner.lineStart
            };
          }
          Parser2.prototype.throwError = function(messageFormat) {
            var values = [];
            for (var _i = 1;_i < arguments.length; _i++) {
              values[_i - 1] = arguments[_i];
            }
            var args = Array.prototype.slice.call(arguments, 1);
            var msg = messageFormat.replace(/%(\d)/g, function(whole, idx) {
              assert_1.assert(idx < args.length, "Message reference must be in range");
              return args[idx];
            });
            var index = this.lastMarker.index;
            var line = this.lastMarker.line;
            var column = this.lastMarker.column + 1;
            throw this.errorHandler.createError(index, line, column, msg);
          };
          Parser2.prototype.tolerateError = function(messageFormat) {
            var values = [];
            for (var _i = 1;_i < arguments.length; _i++) {
              values[_i - 1] = arguments[_i];
            }
            var args = Array.prototype.slice.call(arguments, 1);
            var msg = messageFormat.replace(/%(\d)/g, function(whole, idx) {
              assert_1.assert(idx < args.length, "Message reference must be in range");
              return args[idx];
            });
            var index = this.lastMarker.index;
            var line = this.scanner.lineNumber;
            var column = this.lastMarker.column + 1;
            this.errorHandler.tolerateError(index, line, column, msg);
          };
          Parser2.prototype.unexpectedTokenError = function(token, message) {
            var msg = message || messages_1.Messages.UnexpectedToken;
            var value;
            if (token) {
              if (!message) {
                msg = token.type === 2 ? messages_1.Messages.UnexpectedEOS : token.type === 3 ? messages_1.Messages.UnexpectedIdentifier : token.type === 6 ? messages_1.Messages.UnexpectedNumber : token.type === 8 ? messages_1.Messages.UnexpectedString : token.type === 10 ? messages_1.Messages.UnexpectedTemplate : messages_1.Messages.UnexpectedToken;
                if (token.type === 4) {
                  if (this.scanner.isFutureReservedWord(token.value)) {
                    msg = messages_1.Messages.UnexpectedReserved;
                  } else if (this.context.strict && this.scanner.isStrictModeReservedWord(token.value)) {
                    msg = messages_1.Messages.StrictReservedWord;
                  }
                }
              }
              value = token.value;
            } else {
              value = "ILLEGAL";
            }
            msg = msg.replace("%0", value);
            if (token && typeof token.lineNumber === "number") {
              var index = token.start;
              var line = token.lineNumber;
              var lastMarkerLineStart = this.lastMarker.index - this.lastMarker.column;
              var column = token.start - lastMarkerLineStart + 1;
              return this.errorHandler.createError(index, line, column, msg);
            } else {
              var index = this.lastMarker.index;
              var line = this.lastMarker.line;
              var column = this.lastMarker.column + 1;
              return this.errorHandler.createError(index, line, column, msg);
            }
          };
          Parser2.prototype.throwUnexpectedToken = function(token, message) {
            throw this.unexpectedTokenError(token, message);
          };
          Parser2.prototype.tolerateUnexpectedToken = function(token, message) {
            this.errorHandler.tolerate(this.unexpectedTokenError(token, message));
          };
          Parser2.prototype.collectComments = function() {
            if (!this.config.comment) {
              this.scanner.scanComments();
            } else {
              var comments = this.scanner.scanComments();
              if (comments.length > 0 && this.delegate) {
                for (var i = 0;i < comments.length; ++i) {
                  var e = comments[i];
                  var node = undefined;
                  node = {
                    type: e.multiLine ? "BlockComment" : "LineComment",
                    value: this.scanner.source.slice(e.slice[0], e.slice[1])
                  };
                  if (this.config.range) {
                    node.range = e.range;
                  }
                  if (this.config.loc) {
                    node.loc = e.loc;
                  }
                  var metadata = {
                    start: {
                      line: e.loc.start.line,
                      column: e.loc.start.column,
                      offset: e.range[0]
                    },
                    end: {
                      line: e.loc.end.line,
                      column: e.loc.end.column,
                      offset: e.range[1]
                    }
                  };
                  this.delegate(node, metadata);
                }
              }
            }
          };
          Parser2.prototype.getTokenRaw = function(token) {
            return this.scanner.source.slice(token.start, token.end);
          };
          Parser2.prototype.convertToken = function(token) {
            var t = {
              type: token_1.TokenName[token.type],
              value: this.getTokenRaw(token)
            };
            if (this.config.range) {
              t.range = [token.start, token.end];
            }
            if (this.config.loc) {
              t.loc = {
                start: {
                  line: this.startMarker.line,
                  column: this.startMarker.column
                },
                end: {
                  line: this.scanner.lineNumber,
                  column: this.scanner.index - this.scanner.lineStart
                }
              };
            }
            if (token.type === 9) {
              var pattern = token.pattern;
              var flags = token.flags;
              t.regex = { pattern, flags };
            }
            return t;
          };
          Parser2.prototype.nextToken = function() {
            var token = this.lookahead;
            this.lastMarker.index = this.scanner.index;
            this.lastMarker.line = this.scanner.lineNumber;
            this.lastMarker.column = this.scanner.index - this.scanner.lineStart;
            this.collectComments();
            if (this.scanner.index !== this.startMarker.index) {
              this.startMarker.index = this.scanner.index;
              this.startMarker.line = this.scanner.lineNumber;
              this.startMarker.column = this.scanner.index - this.scanner.lineStart;
            }
            var next = this.scanner.lex();
            this.hasLineTerminator = token.lineNumber !== next.lineNumber;
            if (next && this.context.strict && next.type === 3) {
              if (this.scanner.isStrictModeReservedWord(next.value)) {
                next.type = 4;
              }
            }
            this.lookahead = next;
            if (this.config.tokens && next.type !== 2) {
              this.tokens.push(this.convertToken(next));
            }
            return token;
          };
          Parser2.prototype.nextRegexToken = function() {
            this.collectComments();
            var token = this.scanner.scanRegExp();
            if (this.config.tokens) {
              this.tokens.pop();
              this.tokens.push(this.convertToken(token));
            }
            this.lookahead = token;
            this.nextToken();
            return token;
          };
          Parser2.prototype.createNode = function() {
            return {
              index: this.startMarker.index,
              line: this.startMarker.line,
              column: this.startMarker.column
            };
          };
          Parser2.prototype.startNode = function(token, lastLineStart) {
            if (lastLineStart === undefined) {
              lastLineStart = 0;
            }
            var column = token.start - token.lineStart;
            var line = token.lineNumber;
            if (column < 0) {
              column += lastLineStart;
              line--;
            }
            return {
              index: token.start,
              line,
              column
            };
          };
          Parser2.prototype.finalize = function(marker, node) {
            if (this.config.range) {
              node.range = [marker.index, this.lastMarker.index];
            }
            if (this.config.loc) {
              node.loc = {
                start: {
                  line: marker.line,
                  column: marker.column
                },
                end: {
                  line: this.lastMarker.line,
                  column: this.lastMarker.column
                }
              };
              if (this.config.source) {
                node.loc.source = this.config.source;
              }
            }
            if (this.delegate) {
              var metadata = {
                start: {
                  line: marker.line,
                  column: marker.column,
                  offset: marker.index
                },
                end: {
                  line: this.lastMarker.line,
                  column: this.lastMarker.column,
                  offset: this.lastMarker.index
                }
              };
              this.delegate(node, metadata);
            }
            return node;
          };
          Parser2.prototype.expect = function(value) {
            var token = this.nextToken();
            if (token.type !== 7 || token.value !== value) {
              this.throwUnexpectedToken(token);
            }
          };
          Parser2.prototype.expectCommaSeparator = function() {
            if (this.config.tolerant) {
              var token = this.lookahead;
              if (token.type === 7 && token.value === ",") {
                this.nextToken();
              } else if (token.type === 7 && token.value === ";") {
                this.nextToken();
                this.tolerateUnexpectedToken(token);
              } else {
                this.tolerateUnexpectedToken(token, messages_1.Messages.UnexpectedToken);
              }
            } else {
              this.expect(",");
            }
          };
          Parser2.prototype.expectKeyword = function(keyword) {
            var token = this.nextToken();
            if (token.type !== 4 || token.value !== keyword) {
              this.throwUnexpectedToken(token);
            }
          };
          Parser2.prototype.match = function(value) {
            return this.lookahead.type === 7 && this.lookahead.value === value;
          };
          Parser2.prototype.matchKeyword = function(keyword) {
            return this.lookahead.type === 4 && this.lookahead.value === keyword;
          };
          Parser2.prototype.matchContextualKeyword = function(keyword) {
            return this.lookahead.type === 3 && this.lookahead.value === keyword;
          };
          Parser2.prototype.matchAssign = function() {
            if (this.lookahead.type !== 7) {
              return false;
            }
            var op = this.lookahead.value;
            return op === "=" || op === "*=" || op === "**=" || op === "/=" || op === "%=" || op === "+=" || op === "-=" || op === "<<=" || op === ">>=" || op === ">>>=" || op === "&=" || op === "^=" || op === "|=";
          };
          Parser2.prototype.isolateCoverGrammar = function(parseFunction) {
            var previousIsBindingElement = this.context.isBindingElement;
            var previousIsAssignmentTarget = this.context.isAssignmentTarget;
            var previousFirstCoverInitializedNameError = this.context.firstCoverInitializedNameError;
            this.context.isBindingElement = true;
            this.context.isAssignmentTarget = true;
            this.context.firstCoverInitializedNameError = null;
            var result = parseFunction.call(this);
            if (this.context.firstCoverInitializedNameError !== null) {
              this.throwUnexpectedToken(this.context.firstCoverInitializedNameError);
            }
            this.context.isBindingElement = previousIsBindingElement;
            this.context.isAssignmentTarget = previousIsAssignmentTarget;
            this.context.firstCoverInitializedNameError = previousFirstCoverInitializedNameError;
            return result;
          };
          Parser2.prototype.inheritCoverGrammar = function(parseFunction) {
            var previousIsBindingElement = this.context.isBindingElement;
            var previousIsAssignmentTarget = this.context.isAssignmentTarget;
            var previousFirstCoverInitializedNameError = this.context.firstCoverInitializedNameError;
            this.context.isBindingElement = true;
            this.context.isAssignmentTarget = true;
            this.context.firstCoverInitializedNameError = null;
            var result = parseFunction.call(this);
            this.context.isBindingElement = this.context.isBindingElement && previousIsBindingElement;
            this.context.isAssignmentTarget = this.context.isAssignmentTarget && previousIsAssignmentTarget;
            this.context.firstCoverInitializedNameError = previousFirstCoverInitializedNameError || this.context.firstCoverInitializedNameError;
            return result;
          };
          Parser2.prototype.consumeSemicolon = function() {
            if (this.match(";")) {
              this.nextToken();
            } else if (!this.hasLineTerminator) {
              if (this.lookahead.type !== 2 && !this.match("}")) {
                this.throwUnexpectedToken(this.lookahead);
              }
              this.lastMarker.index = this.startMarker.index;
              this.lastMarker.line = this.startMarker.line;
              this.lastMarker.column = this.startMarker.column;
            }
          };
          Parser2.prototype.parsePrimaryExpression = function() {
            var node = this.createNode();
            var expr;
            var token, raw;
            switch (this.lookahead.type) {
              case 3:
                if ((this.context.isModule || this.context.await) && this.lookahead.value === "await") {
                  this.tolerateUnexpectedToken(this.lookahead);
                }
                expr = this.matchAsyncFunction() ? this.parseFunctionExpression() : this.finalize(node, new Node.Identifier(this.nextToken().value));
                break;
              case 6:
              case 8:
                if (this.context.strict && this.lookahead.octal) {
                  this.tolerateUnexpectedToken(this.lookahead, messages_1.Messages.StrictOctalLiteral);
                }
                this.context.isAssignmentTarget = false;
                this.context.isBindingElement = false;
                token = this.nextToken();
                raw = this.getTokenRaw(token);
                expr = this.finalize(node, new Node.Literal(token.value, raw));
                break;
              case 1:
                this.context.isAssignmentTarget = false;
                this.context.isBindingElement = false;
                token = this.nextToken();
                raw = this.getTokenRaw(token);
                expr = this.finalize(node, new Node.Literal(token.value === "true", raw));
                break;
              case 5:
                this.context.isAssignmentTarget = false;
                this.context.isBindingElement = false;
                token = this.nextToken();
                raw = this.getTokenRaw(token);
                expr = this.finalize(node, new Node.Literal(null, raw));
                break;
              case 10:
                expr = this.parseTemplateLiteral();
                break;
              case 7:
                switch (this.lookahead.value) {
                  case "(":
                    this.context.isBindingElement = false;
                    expr = this.inheritCoverGrammar(this.parseGroupExpression);
                    break;
                  case "[":
                    expr = this.inheritCoverGrammar(this.parseArrayInitializer);
                    break;
                  case "{":
                    expr = this.inheritCoverGrammar(this.parseObjectInitializer);
                    break;
                  case "/":
                  case "/=":
                    this.context.isAssignmentTarget = false;
                    this.context.isBindingElement = false;
                    this.scanner.index = this.startMarker.index;
                    token = this.nextRegexToken();
                    raw = this.getTokenRaw(token);
                    expr = this.finalize(node, new Node.RegexLiteral(token.regex, raw, token.pattern, token.flags));
                    break;
                  default:
                    expr = this.throwUnexpectedToken(this.nextToken());
                }
                break;
              case 4:
                if (!this.context.strict && this.context.allowYield && this.matchKeyword("yield")) {
                  expr = this.parseIdentifierName();
                } else if (!this.context.strict && this.matchKeyword("let")) {
                  expr = this.finalize(node, new Node.Identifier(this.nextToken().value));
                } else {
                  this.context.isAssignmentTarget = false;
                  this.context.isBindingElement = false;
                  if (this.matchKeyword("function")) {
                    expr = this.parseFunctionExpression();
                  } else if (this.matchKeyword("this")) {
                    this.nextToken();
                    expr = this.finalize(node, new Node.ThisExpression);
                  } else if (this.matchKeyword("class")) {
                    expr = this.parseClassExpression();
                  } else {
                    expr = this.throwUnexpectedToken(this.nextToken());
                  }
                }
                break;
              default:
                expr = this.throwUnexpectedToken(this.nextToken());
            }
            return expr;
          };
          Parser2.prototype.parseSpreadElement = function() {
            var node = this.createNode();
            this.expect("...");
            var arg = this.inheritCoverGrammar(this.parseAssignmentExpression);
            return this.finalize(node, new Node.SpreadElement(arg));
          };
          Parser2.prototype.parseArrayInitializer = function() {
            var node = this.createNode();
            var elements = [];
            this.expect("[");
            while (!this.match("]")) {
              if (this.match(",")) {
                this.nextToken();
                elements.push(null);
              } else if (this.match("...")) {
                var element = this.parseSpreadElement();
                if (!this.match("]")) {
                  this.context.isAssignmentTarget = false;
                  this.context.isBindingElement = false;
                  this.expect(",");
                }
                elements.push(element);
              } else {
                elements.push(this.inheritCoverGrammar(this.parseAssignmentExpression));
                if (!this.match("]")) {
                  this.expect(",");
                }
              }
            }
            this.expect("]");
            return this.finalize(node, new Node.ArrayExpression(elements));
          };
          Parser2.prototype.parsePropertyMethod = function(params) {
            this.context.isAssignmentTarget = false;
            this.context.isBindingElement = false;
            var previousStrict = this.context.strict;
            var previousAllowStrictDirective = this.context.allowStrictDirective;
            this.context.allowStrictDirective = params.simple;
            var body = this.isolateCoverGrammar(this.parseFunctionSourceElements);
            if (this.context.strict && params.firstRestricted) {
              this.tolerateUnexpectedToken(params.firstRestricted, params.message);
            }
            if (this.context.strict && params.stricted) {
              this.tolerateUnexpectedToken(params.stricted, params.message);
            }
            this.context.strict = previousStrict;
            this.context.allowStrictDirective = previousAllowStrictDirective;
            return body;
          };
          Parser2.prototype.parsePropertyMethodFunction = function() {
            var isGenerator = false;
            var node = this.createNode();
            var previousAllowYield = this.context.allowYield;
            this.context.allowYield = true;
            var params = this.parseFormalParameters();
            var method = this.parsePropertyMethod(params);
            this.context.allowYield = previousAllowYield;
            return this.finalize(node, new Node.FunctionExpression(null, params.params, method, isGenerator));
          };
          Parser2.prototype.parsePropertyMethodAsyncFunction = function() {
            var node = this.createNode();
            var previousAllowYield = this.context.allowYield;
            var previousAwait = this.context.await;
            this.context.allowYield = false;
            this.context.await = true;
            var params = this.parseFormalParameters();
            var method = this.parsePropertyMethod(params);
            this.context.allowYield = previousAllowYield;
            this.context.await = previousAwait;
            return this.finalize(node, new Node.AsyncFunctionExpression(null, params.params, method));
          };
          Parser2.prototype.parseObjectPropertyKey = function() {
            var node = this.createNode();
            var token = this.nextToken();
            var key;
            switch (token.type) {
              case 8:
              case 6:
                if (this.context.strict && token.octal) {
                  this.tolerateUnexpectedToken(token, messages_1.Messages.StrictOctalLiteral);
                }
                var raw = this.getTokenRaw(token);
                key = this.finalize(node, new Node.Literal(token.value, raw));
                break;
              case 3:
              case 1:
              case 5:
              case 4:
                key = this.finalize(node, new Node.Identifier(token.value));
                break;
              case 7:
                if (token.value === "[") {
                  key = this.isolateCoverGrammar(this.parseAssignmentExpression);
                  this.expect("]");
                } else {
                  key = this.throwUnexpectedToken(token);
                }
                break;
              default:
                key = this.throwUnexpectedToken(token);
            }
            return key;
          };
          Parser2.prototype.isPropertyKey = function(key, value) {
            return key.type === syntax_1.Syntax.Identifier && key.name === value || key.type === syntax_1.Syntax.Literal && key.value === value;
          };
          Parser2.prototype.parseObjectProperty = function(hasProto) {
            var node = this.createNode();
            var token = this.lookahead;
            var kind2;
            var key = null;
            var value = null;
            var computed = false;
            var method = false;
            var shorthand = false;
            var isAsync = false;
            if (token.type === 3) {
              var id = token.value;
              this.nextToken();
              computed = this.match("[");
              isAsync = !this.hasLineTerminator && id === "async" && !this.match(":") && !this.match("(") && !this.match("*") && !this.match(",");
              key = isAsync ? this.parseObjectPropertyKey() : this.finalize(node, new Node.Identifier(id));
            } else if (this.match("*")) {
              this.nextToken();
            } else {
              computed = this.match("[");
              key = this.parseObjectPropertyKey();
            }
            var lookaheadPropertyKey = this.qualifiedPropertyName(this.lookahead);
            if (token.type === 3 && !isAsync && token.value === "get" && lookaheadPropertyKey) {
              kind2 = "get";
              computed = this.match("[");
              key = this.parseObjectPropertyKey();
              this.context.allowYield = false;
              value = this.parseGetterMethod();
            } else if (token.type === 3 && !isAsync && token.value === "set" && lookaheadPropertyKey) {
              kind2 = "set";
              computed = this.match("[");
              key = this.parseObjectPropertyKey();
              value = this.parseSetterMethod();
            } else if (token.type === 7 && token.value === "*" && lookaheadPropertyKey) {
              kind2 = "init";
              computed = this.match("[");
              key = this.parseObjectPropertyKey();
              value = this.parseGeneratorMethod();
              method = true;
            } else {
              if (!key) {
                this.throwUnexpectedToken(this.lookahead);
              }
              kind2 = "init";
              if (this.match(":") && !isAsync) {
                if (!computed && this.isPropertyKey(key, "__proto__")) {
                  if (hasProto.value) {
                    this.tolerateError(messages_1.Messages.DuplicateProtoProperty);
                  }
                  hasProto.value = true;
                }
                this.nextToken();
                value = this.inheritCoverGrammar(this.parseAssignmentExpression);
              } else if (this.match("(")) {
                value = isAsync ? this.parsePropertyMethodAsyncFunction() : this.parsePropertyMethodFunction();
                method = true;
              } else if (token.type === 3) {
                var id = this.finalize(node, new Node.Identifier(token.value));
                if (this.match("=")) {
                  this.context.firstCoverInitializedNameError = this.lookahead;
                  this.nextToken();
                  shorthand = true;
                  var init = this.isolateCoverGrammar(this.parseAssignmentExpression);
                  value = this.finalize(node, new Node.AssignmentPattern(id, init));
                } else {
                  shorthand = true;
                  value = id;
                }
              } else {
                this.throwUnexpectedToken(this.nextToken());
              }
            }
            return this.finalize(node, new Node.Property(kind2, key, computed, value, method, shorthand));
          };
          Parser2.prototype.parseObjectInitializer = function() {
            var node = this.createNode();
            this.expect("{");
            var properties = [];
            var hasProto = { value: false };
            while (!this.match("}")) {
              properties.push(this.parseObjectProperty(hasProto));
              if (!this.match("}")) {
                this.expectCommaSeparator();
              }
            }
            this.expect("}");
            return this.finalize(node, new Node.ObjectExpression(properties));
          };
          Parser2.prototype.parseTemplateHead = function() {
            assert_1.assert(this.lookahead.head, "Template literal must start with a template head");
            var node = this.createNode();
            var token = this.nextToken();
            var raw = token.value;
            var cooked = token.cooked;
            return this.finalize(node, new Node.TemplateElement({ raw, cooked }, token.tail));
          };
          Parser2.prototype.parseTemplateElement = function() {
            if (this.lookahead.type !== 10) {
              this.throwUnexpectedToken();
            }
            var node = this.createNode();
            var token = this.nextToken();
            var raw = token.value;
            var cooked = token.cooked;
            return this.finalize(node, new Node.TemplateElement({ raw, cooked }, token.tail));
          };
          Parser2.prototype.parseTemplateLiteral = function() {
            var node = this.createNode();
            var expressions = [];
            var quasis = [];
            var quasi = this.parseTemplateHead();
            quasis.push(quasi);
            while (!quasi.tail) {
              expressions.push(this.parseExpression());
              quasi = this.parseTemplateElement();
              quasis.push(quasi);
            }
            return this.finalize(node, new Node.TemplateLiteral(quasis, expressions));
          };
          Parser2.prototype.reinterpretExpressionAsPattern = function(expr) {
            switch (expr.type) {
              case syntax_1.Syntax.Identifier:
              case syntax_1.Syntax.MemberExpression:
              case syntax_1.Syntax.RestElement:
              case syntax_1.Syntax.AssignmentPattern:
                break;
              case syntax_1.Syntax.SpreadElement:
                expr.type = syntax_1.Syntax.RestElement;
                this.reinterpretExpressionAsPattern(expr.argument);
                break;
              case syntax_1.Syntax.ArrayExpression:
                expr.type = syntax_1.Syntax.ArrayPattern;
                for (var i = 0;i < expr.elements.length; i++) {
                  if (expr.elements[i] !== null) {
                    this.reinterpretExpressionAsPattern(expr.elements[i]);
                  }
                }
                break;
              case syntax_1.Syntax.ObjectExpression:
                expr.type = syntax_1.Syntax.ObjectPattern;
                for (var i = 0;i < expr.properties.length; i++) {
                  this.reinterpretExpressionAsPattern(expr.properties[i].value);
                }
                break;
              case syntax_1.Syntax.AssignmentExpression:
                expr.type = syntax_1.Syntax.AssignmentPattern;
                delete expr.operator;
                this.reinterpretExpressionAsPattern(expr.left);
                break;
              default:
                break;
            }
          };
          Parser2.prototype.parseGroupExpression = function() {
            var expr;
            this.expect("(");
            if (this.match(")")) {
              this.nextToken();
              if (!this.match("=>")) {
                this.expect("=>");
              }
              expr = {
                type: ArrowParameterPlaceHolder,
                params: [],
                async: false
              };
            } else {
              var startToken = this.lookahead;
              var params = [];
              if (this.match("...")) {
                expr = this.parseRestElement(params);
                this.expect(")");
                if (!this.match("=>")) {
                  this.expect("=>");
                }
                expr = {
                  type: ArrowParameterPlaceHolder,
                  params: [expr],
                  async: false
                };
              } else {
                var arrow = false;
                this.context.isBindingElement = true;
                expr = this.inheritCoverGrammar(this.parseAssignmentExpression);
                if (this.match(",")) {
                  var expressions = [];
                  this.context.isAssignmentTarget = false;
                  expressions.push(expr);
                  while (this.lookahead.type !== 2) {
                    if (!this.match(",")) {
                      break;
                    }
                    this.nextToken();
                    if (this.match(")")) {
                      this.nextToken();
                      for (var i = 0;i < expressions.length; i++) {
                        this.reinterpretExpressionAsPattern(expressions[i]);
                      }
                      arrow = true;
                      expr = {
                        type: ArrowParameterPlaceHolder,
                        params: expressions,
                        async: false
                      };
                    } else if (this.match("...")) {
                      if (!this.context.isBindingElement) {
                        this.throwUnexpectedToken(this.lookahead);
                      }
                      expressions.push(this.parseRestElement(params));
                      this.expect(")");
                      if (!this.match("=>")) {
                        this.expect("=>");
                      }
                      this.context.isBindingElement = false;
                      for (var i = 0;i < expressions.length; i++) {
                        this.reinterpretExpressionAsPattern(expressions[i]);
                      }
                      arrow = true;
                      expr = {
                        type: ArrowParameterPlaceHolder,
                        params: expressions,
                        async: false
                      };
                    } else {
                      expressions.push(this.inheritCoverGrammar(this.parseAssignmentExpression));
                    }
                    if (arrow) {
                      break;
                    }
                  }
                  if (!arrow) {
                    expr = this.finalize(this.startNode(startToken), new Node.SequenceExpression(expressions));
                  }
                }
                if (!arrow) {
                  this.expect(")");
                  if (this.match("=>")) {
                    if (expr.type === syntax_1.Syntax.Identifier && expr.name === "yield") {
                      arrow = true;
                      expr = {
                        type: ArrowParameterPlaceHolder,
                        params: [expr],
                        async: false
                      };
                    }
                    if (!arrow) {
                      if (!this.context.isBindingElement) {
                        this.throwUnexpectedToken(this.lookahead);
                      }
                      if (expr.type === syntax_1.Syntax.SequenceExpression) {
                        for (var i = 0;i < expr.expressions.length; i++) {
                          this.reinterpretExpressionAsPattern(expr.expressions[i]);
                        }
                      } else {
                        this.reinterpretExpressionAsPattern(expr);
                      }
                      var parameters = expr.type === syntax_1.Syntax.SequenceExpression ? expr.expressions : [expr];
                      expr = {
                        type: ArrowParameterPlaceHolder,
                        params: parameters,
                        async: false
                      };
                    }
                  }
                  this.context.isBindingElement = false;
                }
              }
            }
            return expr;
          };
          Parser2.prototype.parseArguments = function() {
            this.expect("(");
            var args = [];
            if (!this.match(")")) {
              while (true) {
                var expr = this.match("...") ? this.parseSpreadElement() : this.isolateCoverGrammar(this.parseAssignmentExpression);
                args.push(expr);
                if (this.match(")")) {
                  break;
                }
                this.expectCommaSeparator();
                if (this.match(")")) {
                  break;
                }
              }
            }
            this.expect(")");
            return args;
          };
          Parser2.prototype.isIdentifierName = function(token) {
            return token.type === 3 || token.type === 4 || token.type === 1 || token.type === 5;
          };
          Parser2.prototype.parseIdentifierName = function() {
            var node = this.createNode();
            var token = this.nextToken();
            if (!this.isIdentifierName(token)) {
              this.throwUnexpectedToken(token);
            }
            return this.finalize(node, new Node.Identifier(token.value));
          };
          Parser2.prototype.parseNewExpression = function() {
            var node = this.createNode();
            var id = this.parseIdentifierName();
            assert_1.assert(id.name === "new", "New expression must start with `new`");
            var expr;
            if (this.match(".")) {
              this.nextToken();
              if (this.lookahead.type === 3 && this.context.inFunctionBody && this.lookahead.value === "target") {
                var property = this.parseIdentifierName();
                expr = new Node.MetaProperty(id, property);
              } else {
                this.throwUnexpectedToken(this.lookahead);
              }
            } else {
              var callee = this.isolateCoverGrammar(this.parseLeftHandSideExpression);
              var args = this.match("(") ? this.parseArguments() : [];
              expr = new Node.NewExpression(callee, args);
              this.context.isAssignmentTarget = false;
              this.context.isBindingElement = false;
            }
            return this.finalize(node, expr);
          };
          Parser2.prototype.parseAsyncArgument = function() {
            var arg = this.parseAssignmentExpression();
            this.context.firstCoverInitializedNameError = null;
            return arg;
          };
          Parser2.prototype.parseAsyncArguments = function() {
            this.expect("(");
            var args = [];
            if (!this.match(")")) {
              while (true) {
                var expr = this.match("...") ? this.parseSpreadElement() : this.isolateCoverGrammar(this.parseAsyncArgument);
                args.push(expr);
                if (this.match(")")) {
                  break;
                }
                this.expectCommaSeparator();
                if (this.match(")")) {
                  break;
                }
              }
            }
            this.expect(")");
            return args;
          };
          Parser2.prototype.parseLeftHandSideExpressionAllowCall = function() {
            var startToken = this.lookahead;
            var maybeAsync = this.matchContextualKeyword("async");
            var previousAllowIn = this.context.allowIn;
            this.context.allowIn = true;
            var expr;
            if (this.matchKeyword("super") && this.context.inFunctionBody) {
              expr = this.createNode();
              this.nextToken();
              expr = this.finalize(expr, new Node.Super);
              if (!this.match("(") && !this.match(".") && !this.match("[")) {
                this.throwUnexpectedToken(this.lookahead);
              }
            } else {
              expr = this.inheritCoverGrammar(this.matchKeyword("new") ? this.parseNewExpression : this.parsePrimaryExpression);
            }
            while (true) {
              if (this.match(".")) {
                this.context.isBindingElement = false;
                this.context.isAssignmentTarget = true;
                this.expect(".");
                var property = this.parseIdentifierName();
                expr = this.finalize(this.startNode(startToken), new Node.StaticMemberExpression(expr, property));
              } else if (this.match("(")) {
                var asyncArrow = maybeAsync && startToken.lineNumber === this.lookahead.lineNumber;
                this.context.isBindingElement = false;
                this.context.isAssignmentTarget = false;
                var args = asyncArrow ? this.parseAsyncArguments() : this.parseArguments();
                expr = this.finalize(this.startNode(startToken), new Node.CallExpression(expr, args));
                if (asyncArrow && this.match("=>")) {
                  for (var i = 0;i < args.length; ++i) {
                    this.reinterpretExpressionAsPattern(args[i]);
                  }
                  expr = {
                    type: ArrowParameterPlaceHolder,
                    params: args,
                    async: true
                  };
                }
              } else if (this.match("[")) {
                this.context.isBindingElement = false;
                this.context.isAssignmentTarget = true;
                this.expect("[");
                var property = this.isolateCoverGrammar(this.parseExpression);
                this.expect("]");
                expr = this.finalize(this.startNode(startToken), new Node.ComputedMemberExpression(expr, property));
              } else if (this.lookahead.type === 10 && this.lookahead.head) {
                var quasi = this.parseTemplateLiteral();
                expr = this.finalize(this.startNode(startToken), new Node.TaggedTemplateExpression(expr, quasi));
              } else {
                break;
              }
            }
            this.context.allowIn = previousAllowIn;
            return expr;
          };
          Parser2.prototype.parseSuper = function() {
            var node = this.createNode();
            this.expectKeyword("super");
            if (!this.match("[") && !this.match(".")) {
              this.throwUnexpectedToken(this.lookahead);
            }
            return this.finalize(node, new Node.Super);
          };
          Parser2.prototype.parseLeftHandSideExpression = function() {
            assert_1.assert(this.context.allowIn, "callee of new expression always allow in keyword.");
            var node = this.startNode(this.lookahead);
            var expr = this.matchKeyword("super") && this.context.inFunctionBody ? this.parseSuper() : this.inheritCoverGrammar(this.matchKeyword("new") ? this.parseNewExpression : this.parsePrimaryExpression);
            while (true) {
              if (this.match("[")) {
                this.context.isBindingElement = false;
                this.context.isAssignmentTarget = true;
                this.expect("[");
                var property = this.isolateCoverGrammar(this.parseExpression);
                this.expect("]");
                expr = this.finalize(node, new Node.ComputedMemberExpression(expr, property));
              } else if (this.match(".")) {
                this.context.isBindingElement = false;
                this.context.isAssignmentTarget = true;
                this.expect(".");
                var property = this.parseIdentifierName();
                expr = this.finalize(node, new Node.StaticMemberExpression(expr, property));
              } else if (this.lookahead.type === 10 && this.lookahead.head) {
                var quasi = this.parseTemplateLiteral();
                expr = this.finalize(node, new Node.TaggedTemplateExpression(expr, quasi));
              } else {
                break;
              }
            }
            return expr;
          };
          Parser2.prototype.parseUpdateExpression = function() {
            var expr;
            var startToken = this.lookahead;
            if (this.match("++") || this.match("--")) {
              var node = this.startNode(startToken);
              var token = this.nextToken();
              expr = this.inheritCoverGrammar(this.parseUnaryExpression);
              if (this.context.strict && expr.type === syntax_1.Syntax.Identifier && this.scanner.isRestrictedWord(expr.name)) {
                this.tolerateError(messages_1.Messages.StrictLHSPrefix);
              }
              if (!this.context.isAssignmentTarget) {
                this.tolerateError(messages_1.Messages.InvalidLHSInAssignment);
              }
              var prefix = true;
              expr = this.finalize(node, new Node.UpdateExpression(token.value, expr, prefix));
              this.context.isAssignmentTarget = false;
              this.context.isBindingElement = false;
            } else {
              expr = this.inheritCoverGrammar(this.parseLeftHandSideExpressionAllowCall);
              if (!this.hasLineTerminator && this.lookahead.type === 7) {
                if (this.match("++") || this.match("--")) {
                  if (this.context.strict && expr.type === syntax_1.Syntax.Identifier && this.scanner.isRestrictedWord(expr.name)) {
                    this.tolerateError(messages_1.Messages.StrictLHSPostfix);
                  }
                  if (!this.context.isAssignmentTarget) {
                    this.tolerateError(messages_1.Messages.InvalidLHSInAssignment);
                  }
                  this.context.isAssignmentTarget = false;
                  this.context.isBindingElement = false;
                  var operator = this.nextToken().value;
                  var prefix = false;
                  expr = this.finalize(this.startNode(startToken), new Node.UpdateExpression(operator, expr, prefix));
                }
              }
            }
            return expr;
          };
          Parser2.prototype.parseAwaitExpression = function() {
            var node = this.createNode();
            this.nextToken();
            var argument = this.parseUnaryExpression();
            return this.finalize(node, new Node.AwaitExpression(argument));
          };
          Parser2.prototype.parseUnaryExpression = function() {
            var expr;
            if (this.match("+") || this.match("-") || this.match("~") || this.match("!") || this.matchKeyword("delete") || this.matchKeyword("void") || this.matchKeyword("typeof")) {
              var node = this.startNode(this.lookahead);
              var token = this.nextToken();
              expr = this.inheritCoverGrammar(this.parseUnaryExpression);
              expr = this.finalize(node, new Node.UnaryExpression(token.value, expr));
              if (this.context.strict && expr.operator === "delete" && expr.argument.type === syntax_1.Syntax.Identifier) {
                this.tolerateError(messages_1.Messages.StrictDelete);
              }
              this.context.isAssignmentTarget = false;
              this.context.isBindingElement = false;
            } else if (this.context.await && this.matchContextualKeyword("await")) {
              expr = this.parseAwaitExpression();
            } else {
              expr = this.parseUpdateExpression();
            }
            return expr;
          };
          Parser2.prototype.parseExponentiationExpression = function() {
            var startToken = this.lookahead;
            var expr = this.inheritCoverGrammar(this.parseUnaryExpression);
            if (expr.type !== syntax_1.Syntax.UnaryExpression && this.match("**")) {
              this.nextToken();
              this.context.isAssignmentTarget = false;
              this.context.isBindingElement = false;
              var left = expr;
              var right = this.isolateCoverGrammar(this.parseExponentiationExpression);
              expr = this.finalize(this.startNode(startToken), new Node.BinaryExpression("**", left, right));
            }
            return expr;
          };
          Parser2.prototype.binaryPrecedence = function(token) {
            var op = token.value;
            var precedence;
            if (token.type === 7) {
              precedence = this.operatorPrecedence[op] || 0;
            } else if (token.type === 4) {
              precedence = op === "instanceof" || this.context.allowIn && op === "in" ? 7 : 0;
            } else {
              precedence = 0;
            }
            return precedence;
          };
          Parser2.prototype.parseBinaryExpression = function() {
            var startToken = this.lookahead;
            var expr = this.inheritCoverGrammar(this.parseExponentiationExpression);
            var token = this.lookahead;
            var prec = this.binaryPrecedence(token);
            if (prec > 0) {
              this.nextToken();
              this.context.isAssignmentTarget = false;
              this.context.isBindingElement = false;
              var markers = [startToken, this.lookahead];
              var left = expr;
              var right = this.isolateCoverGrammar(this.parseExponentiationExpression);
              var stack = [left, token.value, right];
              var precedences = [prec];
              while (true) {
                prec = this.binaryPrecedence(this.lookahead);
                if (prec <= 0) {
                  break;
                }
                while (stack.length > 2 && prec <= precedences[precedences.length - 1]) {
                  right = stack.pop();
                  var operator = stack.pop();
                  precedences.pop();
                  left = stack.pop();
                  markers.pop();
                  var node = this.startNode(markers[markers.length - 1]);
                  stack.push(this.finalize(node, new Node.BinaryExpression(operator, left, right)));
                }
                stack.push(this.nextToken().value);
                precedences.push(prec);
                markers.push(this.lookahead);
                stack.push(this.isolateCoverGrammar(this.parseExponentiationExpression));
              }
              var i = stack.length - 1;
              expr = stack[i];
              var lastMarker = markers.pop();
              while (i > 1) {
                var marker = markers.pop();
                var lastLineStart = lastMarker && lastMarker.lineStart;
                var node = this.startNode(marker, lastLineStart);
                var operator = stack[i - 1];
                expr = this.finalize(node, new Node.BinaryExpression(operator, stack[i - 2], expr));
                i -= 2;
                lastMarker = marker;
              }
            }
            return expr;
          };
          Parser2.prototype.parseConditionalExpression = function() {
            var startToken = this.lookahead;
            var expr = this.inheritCoverGrammar(this.parseBinaryExpression);
            if (this.match("?")) {
              this.nextToken();
              var previousAllowIn = this.context.allowIn;
              this.context.allowIn = true;
              var consequent = this.isolateCoverGrammar(this.parseAssignmentExpression);
              this.context.allowIn = previousAllowIn;
              this.expect(":");
              var alternate = this.isolateCoverGrammar(this.parseAssignmentExpression);
              expr = this.finalize(this.startNode(startToken), new Node.ConditionalExpression(expr, consequent, alternate));
              this.context.isAssignmentTarget = false;
              this.context.isBindingElement = false;
            }
            return expr;
          };
          Parser2.prototype.checkPatternParam = function(options2, param) {
            switch (param.type) {
              case syntax_1.Syntax.Identifier:
                this.validateParam(options2, param, param.name);
                break;
              case syntax_1.Syntax.RestElement:
                this.checkPatternParam(options2, param.argument);
                break;
              case syntax_1.Syntax.AssignmentPattern:
                this.checkPatternParam(options2, param.left);
                break;
              case syntax_1.Syntax.ArrayPattern:
                for (var i = 0;i < param.elements.length; i++) {
                  if (param.elements[i] !== null) {
                    this.checkPatternParam(options2, param.elements[i]);
                  }
                }
                break;
              case syntax_1.Syntax.ObjectPattern:
                for (var i = 0;i < param.properties.length; i++) {
                  this.checkPatternParam(options2, param.properties[i].value);
                }
                break;
              default:
                break;
            }
            options2.simple = options2.simple && param instanceof Node.Identifier;
          };
          Parser2.prototype.reinterpretAsCoverFormalsList = function(expr) {
            var params = [expr];
            var options2;
            var asyncArrow = false;
            switch (expr.type) {
              case syntax_1.Syntax.Identifier:
                break;
              case ArrowParameterPlaceHolder:
                params = expr.params;
                asyncArrow = expr.async;
                break;
              default:
                return null;
            }
            options2 = {
              simple: true,
              paramSet: {}
            };
            for (var i = 0;i < params.length; ++i) {
              var param = params[i];
              if (param.type === syntax_1.Syntax.AssignmentPattern) {
                if (param.right.type === syntax_1.Syntax.YieldExpression) {
                  if (param.right.argument) {
                    this.throwUnexpectedToken(this.lookahead);
                  }
                  param.right.type = syntax_1.Syntax.Identifier;
                  param.right.name = "yield";
                  delete param.right.argument;
                  delete param.right.delegate;
                }
              } else if (asyncArrow && param.type === syntax_1.Syntax.Identifier && param.name === "await") {
                this.throwUnexpectedToken(this.lookahead);
              }
              this.checkPatternParam(options2, param);
              params[i] = param;
            }
            if (this.context.strict || !this.context.allowYield) {
              for (var i = 0;i < params.length; ++i) {
                var param = params[i];
                if (param.type === syntax_1.Syntax.YieldExpression) {
                  this.throwUnexpectedToken(this.lookahead);
                }
              }
            }
            if (options2.message === messages_1.Messages.StrictParamDupe) {
              var token = this.context.strict ? options2.stricted : options2.firstRestricted;
              this.throwUnexpectedToken(token, options2.message);
            }
            return {
              simple: options2.simple,
              params,
              stricted: options2.stricted,
              firstRestricted: options2.firstRestricted,
              message: options2.message
            };
          };
          Parser2.prototype.parseAssignmentExpression = function() {
            var expr;
            if (!this.context.allowYield && this.matchKeyword("yield")) {
              expr = this.parseYieldExpression();
            } else {
              var startToken = this.lookahead;
              var token = startToken;
              expr = this.parseConditionalExpression();
              if (token.type === 3 && token.lineNumber === this.lookahead.lineNumber && token.value === "async") {
                if (this.lookahead.type === 3 || this.matchKeyword("yield")) {
                  var arg = this.parsePrimaryExpression();
                  this.reinterpretExpressionAsPattern(arg);
                  expr = {
                    type: ArrowParameterPlaceHolder,
                    params: [arg],
                    async: true
                  };
                }
              }
              if (expr.type === ArrowParameterPlaceHolder || this.match("=>")) {
                this.context.isAssignmentTarget = false;
                this.context.isBindingElement = false;
                var isAsync = expr.async;
                var list = this.reinterpretAsCoverFormalsList(expr);
                if (list) {
                  if (this.hasLineTerminator) {
                    this.tolerateUnexpectedToken(this.lookahead);
                  }
                  this.context.firstCoverInitializedNameError = null;
                  var previousStrict = this.context.strict;
                  var previousAllowStrictDirective = this.context.allowStrictDirective;
                  this.context.allowStrictDirective = list.simple;
                  var previousAllowYield = this.context.allowYield;
                  var previousAwait = this.context.await;
                  this.context.allowYield = true;
                  this.context.await = isAsync;
                  var node = this.startNode(startToken);
                  this.expect("=>");
                  var body = undefined;
                  if (this.match("{")) {
                    var previousAllowIn = this.context.allowIn;
                    this.context.allowIn = true;
                    body = this.parseFunctionSourceElements();
                    this.context.allowIn = previousAllowIn;
                  } else {
                    body = this.isolateCoverGrammar(this.parseAssignmentExpression);
                  }
                  var expression = body.type !== syntax_1.Syntax.BlockStatement;
                  if (this.context.strict && list.firstRestricted) {
                    this.throwUnexpectedToken(list.firstRestricted, list.message);
                  }
                  if (this.context.strict && list.stricted) {
                    this.tolerateUnexpectedToken(list.stricted, list.message);
                  }
                  expr = isAsync ? this.finalize(node, new Node.AsyncArrowFunctionExpression(list.params, body, expression)) : this.finalize(node, new Node.ArrowFunctionExpression(list.params, body, expression));
                  this.context.strict = previousStrict;
                  this.context.allowStrictDirective = previousAllowStrictDirective;
                  this.context.allowYield = previousAllowYield;
                  this.context.await = previousAwait;
                }
              } else {
                if (this.matchAssign()) {
                  if (!this.context.isAssignmentTarget) {
                    this.tolerateError(messages_1.Messages.InvalidLHSInAssignment);
                  }
                  if (this.context.strict && expr.type === syntax_1.Syntax.Identifier) {
                    var id = expr;
                    if (this.scanner.isRestrictedWord(id.name)) {
                      this.tolerateUnexpectedToken(token, messages_1.Messages.StrictLHSAssignment);
                    }
                    if (this.scanner.isStrictModeReservedWord(id.name)) {
                      this.tolerateUnexpectedToken(token, messages_1.Messages.StrictReservedWord);
                    }
                  }
                  if (!this.match("=")) {
                    this.context.isAssignmentTarget = false;
                    this.context.isBindingElement = false;
                  } else {
                    this.reinterpretExpressionAsPattern(expr);
                  }
                  token = this.nextToken();
                  var operator = token.value;
                  var right = this.isolateCoverGrammar(this.parseAssignmentExpression);
                  expr = this.finalize(this.startNode(startToken), new Node.AssignmentExpression(operator, expr, right));
                  this.context.firstCoverInitializedNameError = null;
                }
              }
            }
            return expr;
          };
          Parser2.prototype.parseExpression = function() {
            var startToken = this.lookahead;
            var expr = this.isolateCoverGrammar(this.parseAssignmentExpression);
            if (this.match(",")) {
              var expressions = [];
              expressions.push(expr);
              while (this.lookahead.type !== 2) {
                if (!this.match(",")) {
                  break;
                }
                this.nextToken();
                expressions.push(this.isolateCoverGrammar(this.parseAssignmentExpression));
              }
              expr = this.finalize(this.startNode(startToken), new Node.SequenceExpression(expressions));
            }
            return expr;
          };
          Parser2.prototype.parseStatementListItem = function() {
            var statement;
            this.context.isAssignmentTarget = true;
            this.context.isBindingElement = true;
            if (this.lookahead.type === 4) {
              switch (this.lookahead.value) {
                case "export":
                  if (!this.context.isModule) {
                    this.tolerateUnexpectedToken(this.lookahead, messages_1.Messages.IllegalExportDeclaration);
                  }
                  statement = this.parseExportDeclaration();
                  break;
                case "import":
                  if (!this.context.isModule) {
                    this.tolerateUnexpectedToken(this.lookahead, messages_1.Messages.IllegalImportDeclaration);
                  }
                  statement = this.parseImportDeclaration();
                  break;
                case "const":
                  statement = this.parseLexicalDeclaration({ inFor: false });
                  break;
                case "function":
                  statement = this.parseFunctionDeclaration();
                  break;
                case "class":
                  statement = this.parseClassDeclaration();
                  break;
                case "let":
                  statement = this.isLexicalDeclaration() ? this.parseLexicalDeclaration({ inFor: false }) : this.parseStatement();
                  break;
                default:
                  statement = this.parseStatement();
                  break;
              }
            } else {
              statement = this.parseStatement();
            }
            return statement;
          };
          Parser2.prototype.parseBlock = function() {
            var node = this.createNode();
            this.expect("{");
            var block2 = [];
            while (true) {
              if (this.match("}")) {
                break;
              }
              block2.push(this.parseStatementListItem());
            }
            this.expect("}");
            return this.finalize(node, new Node.BlockStatement(block2));
          };
          Parser2.prototype.parseLexicalBinding = function(kind2, options2) {
            var node = this.createNode();
            var params = [];
            var id = this.parsePattern(params, kind2);
            if (this.context.strict && id.type === syntax_1.Syntax.Identifier) {
              if (this.scanner.isRestrictedWord(id.name)) {
                this.tolerateError(messages_1.Messages.StrictVarName);
              }
            }
            var init = null;
            if (kind2 === "const") {
              if (!this.matchKeyword("in") && !this.matchContextualKeyword("of")) {
                if (this.match("=")) {
                  this.nextToken();
                  init = this.isolateCoverGrammar(this.parseAssignmentExpression);
                } else {
                  this.throwError(messages_1.Messages.DeclarationMissingInitializer, "const");
                }
              }
            } else if (!options2.inFor && id.type !== syntax_1.Syntax.Identifier || this.match("=")) {
              this.expect("=");
              init = this.isolateCoverGrammar(this.parseAssignmentExpression);
            }
            return this.finalize(node, new Node.VariableDeclarator(id, init));
          };
          Parser2.prototype.parseBindingList = function(kind2, options2) {
            var list = [this.parseLexicalBinding(kind2, options2)];
            while (this.match(",")) {
              this.nextToken();
              list.push(this.parseLexicalBinding(kind2, options2));
            }
            return list;
          };
          Parser2.prototype.isLexicalDeclaration = function() {
            var state = this.scanner.saveState();
            this.scanner.scanComments();
            var next = this.scanner.lex();
            this.scanner.restoreState(state);
            return next.type === 3 || next.type === 7 && next.value === "[" || next.type === 7 && next.value === "{" || next.type === 4 && next.value === "let" || next.type === 4 && next.value === "yield";
          };
          Parser2.prototype.parseLexicalDeclaration = function(options2) {
            var node = this.createNode();
            var kind2 = this.nextToken().value;
            assert_1.assert(kind2 === "let" || kind2 === "const", "Lexical declaration must be either let or const");
            var declarations = this.parseBindingList(kind2, options2);
            this.consumeSemicolon();
            return this.finalize(node, new Node.VariableDeclaration(declarations, kind2));
          };
          Parser2.prototype.parseBindingRestElement = function(params, kind2) {
            var node = this.createNode();
            this.expect("...");
            var arg = this.parsePattern(params, kind2);
            return this.finalize(node, new Node.RestElement(arg));
          };
          Parser2.prototype.parseArrayPattern = function(params, kind2) {
            var node = this.createNode();
            this.expect("[");
            var elements = [];
            while (!this.match("]")) {
              if (this.match(",")) {
                this.nextToken();
                elements.push(null);
              } else {
                if (this.match("...")) {
                  elements.push(this.parseBindingRestElement(params, kind2));
                  break;
                } else {
                  elements.push(this.parsePatternWithDefault(params, kind2));
                }
                if (!this.match("]")) {
                  this.expect(",");
                }
              }
            }
            this.expect("]");
            return this.finalize(node, new Node.ArrayPattern(elements));
          };
          Parser2.prototype.parsePropertyPattern = function(params, kind2) {
            var node = this.createNode();
            var computed = false;
            var shorthand = false;
            var method = false;
            var key;
            var value;
            if (this.lookahead.type === 3) {
              var keyToken = this.lookahead;
              key = this.parseVariableIdentifier();
              var init = this.finalize(node, new Node.Identifier(keyToken.value));
              if (this.match("=")) {
                params.push(keyToken);
                shorthand = true;
                this.nextToken();
                var expr = this.parseAssignmentExpression();
                value = this.finalize(this.startNode(keyToken), new Node.AssignmentPattern(init, expr));
              } else if (!this.match(":")) {
                params.push(keyToken);
                shorthand = true;
                value = init;
              } else {
                this.expect(":");
                value = this.parsePatternWithDefault(params, kind2);
              }
            } else {
              computed = this.match("[");
              key = this.parseObjectPropertyKey();
              this.expect(":");
              value = this.parsePatternWithDefault(params, kind2);
            }
            return this.finalize(node, new Node.Property("init", key, computed, value, method, shorthand));
          };
          Parser2.prototype.parseObjectPattern = function(params, kind2) {
            var node = this.createNode();
            var properties = [];
            this.expect("{");
            while (!this.match("}")) {
              properties.push(this.parsePropertyPattern(params, kind2));
              if (!this.match("}")) {
                this.expect(",");
              }
            }
            this.expect("}");
            return this.finalize(node, new Node.ObjectPattern(properties));
          };
          Parser2.prototype.parsePattern = function(params, kind2) {
            var pattern;
            if (this.match("[")) {
              pattern = this.parseArrayPattern(params, kind2);
            } else if (this.match("{")) {
              pattern = this.parseObjectPattern(params, kind2);
            } else {
              if (this.matchKeyword("let") && (kind2 === "const" || kind2 === "let")) {
                this.tolerateUnexpectedToken(this.lookahead, messages_1.Messages.LetInLexicalBinding);
              }
              params.push(this.lookahead);
              pattern = this.parseVariableIdentifier(kind2);
            }
            return pattern;
          };
          Parser2.prototype.parsePatternWithDefault = function(params, kind2) {
            var startToken = this.lookahead;
            var pattern = this.parsePattern(params, kind2);
            if (this.match("=")) {
              this.nextToken();
              var previousAllowYield = this.context.allowYield;
              this.context.allowYield = true;
              var right = this.isolateCoverGrammar(this.parseAssignmentExpression);
              this.context.allowYield = previousAllowYield;
              pattern = this.finalize(this.startNode(startToken), new Node.AssignmentPattern(pattern, right));
            }
            return pattern;
          };
          Parser2.prototype.parseVariableIdentifier = function(kind2) {
            var node = this.createNode();
            var token = this.nextToken();
            if (token.type === 4 && token.value === "yield") {
              if (this.context.strict) {
                this.tolerateUnexpectedToken(token, messages_1.Messages.StrictReservedWord);
              } else if (!this.context.allowYield) {
                this.throwUnexpectedToken(token);
              }
            } else if (token.type !== 3) {
              if (this.context.strict && token.type === 4 && this.scanner.isStrictModeReservedWord(token.value)) {
                this.tolerateUnexpectedToken(token, messages_1.Messages.StrictReservedWord);
              } else {
                if (this.context.strict || token.value !== "let" || kind2 !== "var") {
                  this.throwUnexpectedToken(token);
                }
              }
            } else if ((this.context.isModule || this.context.await) && token.type === 3 && token.value === "await") {
              this.tolerateUnexpectedToken(token);
            }
            return this.finalize(node, new Node.Identifier(token.value));
          };
          Parser2.prototype.parseVariableDeclaration = function(options2) {
            var node = this.createNode();
            var params = [];
            var id = this.parsePattern(params, "var");
            if (this.context.strict && id.type === syntax_1.Syntax.Identifier) {
              if (this.scanner.isRestrictedWord(id.name)) {
                this.tolerateError(messages_1.Messages.StrictVarName);
              }
            }
            var init = null;
            if (this.match("=")) {
              this.nextToken();
              init = this.isolateCoverGrammar(this.parseAssignmentExpression);
            } else if (id.type !== syntax_1.Syntax.Identifier && !options2.inFor) {
              this.expect("=");
            }
            return this.finalize(node, new Node.VariableDeclarator(id, init));
          };
          Parser2.prototype.parseVariableDeclarationList = function(options2) {
            var opt = { inFor: options2.inFor };
            var list = [];
            list.push(this.parseVariableDeclaration(opt));
            while (this.match(",")) {
              this.nextToken();
              list.push(this.parseVariableDeclaration(opt));
            }
            return list;
          };
          Parser2.prototype.parseVariableStatement = function() {
            var node = this.createNode();
            this.expectKeyword("var");
            var declarations = this.parseVariableDeclarationList({ inFor: false });
            this.consumeSemicolon();
            return this.finalize(node, new Node.VariableDeclaration(declarations, "var"));
          };
          Parser2.prototype.parseEmptyStatement = function() {
            var node = this.createNode();
            this.expect(";");
            return this.finalize(node, new Node.EmptyStatement);
          };
          Parser2.prototype.parseExpressionStatement = function() {
            var node = this.createNode();
            var expr = this.parseExpression();
            this.consumeSemicolon();
            return this.finalize(node, new Node.ExpressionStatement(expr));
          };
          Parser2.prototype.parseIfClause = function() {
            if (this.context.strict && this.matchKeyword("function")) {
              this.tolerateError(messages_1.Messages.StrictFunction);
            }
            return this.parseStatement();
          };
          Parser2.prototype.parseIfStatement = function() {
            var node = this.createNode();
            var consequent;
            var alternate = null;
            this.expectKeyword("if");
            this.expect("(");
            var test = this.parseExpression();
            if (!this.match(")") && this.config.tolerant) {
              this.tolerateUnexpectedToken(this.nextToken());
              consequent = this.finalize(this.createNode(), new Node.EmptyStatement);
            } else {
              this.expect(")");
              consequent = this.parseIfClause();
              if (this.matchKeyword("else")) {
                this.nextToken();
                alternate = this.parseIfClause();
              }
            }
            return this.finalize(node, new Node.IfStatement(test, consequent, alternate));
          };
          Parser2.prototype.parseDoWhileStatement = function() {
            var node = this.createNode();
            this.expectKeyword("do");
            var previousInIteration = this.context.inIteration;
            this.context.inIteration = true;
            var body = this.parseStatement();
            this.context.inIteration = previousInIteration;
            this.expectKeyword("while");
            this.expect("(");
            var test = this.parseExpression();
            if (!this.match(")") && this.config.tolerant) {
              this.tolerateUnexpectedToken(this.nextToken());
            } else {
              this.expect(")");
              if (this.match(";")) {
                this.nextToken();
              }
            }
            return this.finalize(node, new Node.DoWhileStatement(body, test));
          };
          Parser2.prototype.parseWhileStatement = function() {
            var node = this.createNode();
            var body;
            this.expectKeyword("while");
            this.expect("(");
            var test = this.parseExpression();
            if (!this.match(")") && this.config.tolerant) {
              this.tolerateUnexpectedToken(this.nextToken());
              body = this.finalize(this.createNode(), new Node.EmptyStatement);
            } else {
              this.expect(")");
              var previousInIteration = this.context.inIteration;
              this.context.inIteration = true;
              body = this.parseStatement();
              this.context.inIteration = previousInIteration;
            }
            return this.finalize(node, new Node.WhileStatement(test, body));
          };
          Parser2.prototype.parseForStatement = function() {
            var init = null;
            var test = null;
            var update = null;
            var forIn = true;
            var left, right;
            var node = this.createNode();
            this.expectKeyword("for");
            this.expect("(");
            if (this.match(";")) {
              this.nextToken();
            } else {
              if (this.matchKeyword("var")) {
                init = this.createNode();
                this.nextToken();
                var previousAllowIn = this.context.allowIn;
                this.context.allowIn = false;
                var declarations = this.parseVariableDeclarationList({ inFor: true });
                this.context.allowIn = previousAllowIn;
                if (declarations.length === 1 && this.matchKeyword("in")) {
                  var decl = declarations[0];
                  if (decl.init && (decl.id.type === syntax_1.Syntax.ArrayPattern || decl.id.type === syntax_1.Syntax.ObjectPattern || this.context.strict)) {
                    this.tolerateError(messages_1.Messages.ForInOfLoopInitializer, "for-in");
                  }
                  init = this.finalize(init, new Node.VariableDeclaration(declarations, "var"));
                  this.nextToken();
                  left = init;
                  right = this.parseExpression();
                  init = null;
                } else if (declarations.length === 1 && declarations[0].init === null && this.matchContextualKeyword("of")) {
                  init = this.finalize(init, new Node.VariableDeclaration(declarations, "var"));
                  this.nextToken();
                  left = init;
                  right = this.parseAssignmentExpression();
                  init = null;
                  forIn = false;
                } else {
                  init = this.finalize(init, new Node.VariableDeclaration(declarations, "var"));
                  this.expect(";");
                }
              } else if (this.matchKeyword("const") || this.matchKeyword("let")) {
                init = this.createNode();
                var kind2 = this.nextToken().value;
                if (!this.context.strict && this.lookahead.value === "in") {
                  init = this.finalize(init, new Node.Identifier(kind2));
                  this.nextToken();
                  left = init;
                  right = this.parseExpression();
                  init = null;
                } else {
                  var previousAllowIn = this.context.allowIn;
                  this.context.allowIn = false;
                  var declarations = this.parseBindingList(kind2, { inFor: true });
                  this.context.allowIn = previousAllowIn;
                  if (declarations.length === 1 && declarations[0].init === null && this.matchKeyword("in")) {
                    init = this.finalize(init, new Node.VariableDeclaration(declarations, kind2));
                    this.nextToken();
                    left = init;
                    right = this.parseExpression();
                    init = null;
                  } else if (declarations.length === 1 && declarations[0].init === null && this.matchContextualKeyword("of")) {
                    init = this.finalize(init, new Node.VariableDeclaration(declarations, kind2));
                    this.nextToken();
                    left = init;
                    right = this.parseAssignmentExpression();
                    init = null;
                    forIn = false;
                  } else {
                    this.consumeSemicolon();
                    init = this.finalize(init, new Node.VariableDeclaration(declarations, kind2));
                  }
                }
              } else {
                var initStartToken = this.lookahead;
                var previousAllowIn = this.context.allowIn;
                this.context.allowIn = false;
                init = this.inheritCoverGrammar(this.parseAssignmentExpression);
                this.context.allowIn = previousAllowIn;
                if (this.matchKeyword("in")) {
                  if (!this.context.isAssignmentTarget || init.type === syntax_1.Syntax.AssignmentExpression) {
                    this.tolerateError(messages_1.Messages.InvalidLHSInForIn);
                  }
                  this.nextToken();
                  this.reinterpretExpressionAsPattern(init);
                  left = init;
                  right = this.parseExpression();
                  init = null;
                } else if (this.matchContextualKeyword("of")) {
                  if (!this.context.isAssignmentTarget || init.type === syntax_1.Syntax.AssignmentExpression) {
                    this.tolerateError(messages_1.Messages.InvalidLHSInForLoop);
                  }
                  this.nextToken();
                  this.reinterpretExpressionAsPattern(init);
                  left = init;
                  right = this.parseAssignmentExpression();
                  init = null;
                  forIn = false;
                } else {
                  if (this.match(",")) {
                    var initSeq = [init];
                    while (this.match(",")) {
                      this.nextToken();
                      initSeq.push(this.isolateCoverGrammar(this.parseAssignmentExpression));
                    }
                    init = this.finalize(this.startNode(initStartToken), new Node.SequenceExpression(initSeq));
                  }
                  this.expect(";");
                }
              }
            }
            if (typeof left === "undefined") {
              if (!this.match(";")) {
                test = this.parseExpression();
              }
              this.expect(";");
              if (!this.match(")")) {
                update = this.parseExpression();
              }
            }
            var body;
            if (!this.match(")") && this.config.tolerant) {
              this.tolerateUnexpectedToken(this.nextToken());
              body = this.finalize(this.createNode(), new Node.EmptyStatement);
            } else {
              this.expect(")");
              var previousInIteration = this.context.inIteration;
              this.context.inIteration = true;
              body = this.isolateCoverGrammar(this.parseStatement);
              this.context.inIteration = previousInIteration;
            }
            return typeof left === "undefined" ? this.finalize(node, new Node.ForStatement(init, test, update, body)) : forIn ? this.finalize(node, new Node.ForInStatement(left, right, body)) : this.finalize(node, new Node.ForOfStatement(left, right, body));
          };
          Parser2.prototype.parseContinueStatement = function() {
            var node = this.createNode();
            this.expectKeyword("continue");
            var label = null;
            if (this.lookahead.type === 3 && !this.hasLineTerminator) {
              var id = this.parseVariableIdentifier();
              label = id;
              var key = "$" + id.name;
              if (!Object.prototype.hasOwnProperty.call(this.context.labelSet, key)) {
                this.throwError(messages_1.Messages.UnknownLabel, id.name);
              }
            }
            this.consumeSemicolon();
            if (label === null && !this.context.inIteration) {
              this.throwError(messages_1.Messages.IllegalContinue);
            }
            return this.finalize(node, new Node.ContinueStatement(label));
          };
          Parser2.prototype.parseBreakStatement = function() {
            var node = this.createNode();
            this.expectKeyword("break");
            var label = null;
            if (this.lookahead.type === 3 && !this.hasLineTerminator) {
              var id = this.parseVariableIdentifier();
              var key = "$" + id.name;
              if (!Object.prototype.hasOwnProperty.call(this.context.labelSet, key)) {
                this.throwError(messages_1.Messages.UnknownLabel, id.name);
              }
              label = id;
            }
            this.consumeSemicolon();
            if (label === null && !this.context.inIteration && !this.context.inSwitch) {
              this.throwError(messages_1.Messages.IllegalBreak);
            }
            return this.finalize(node, new Node.BreakStatement(label));
          };
          Parser2.prototype.parseReturnStatement = function() {
            if (!this.context.inFunctionBody) {
              this.tolerateError(messages_1.Messages.IllegalReturn);
            }
            var node = this.createNode();
            this.expectKeyword("return");
            var hasArgument = !this.match(";") && !this.match("}") && !this.hasLineTerminator && this.lookahead.type !== 2 || this.lookahead.type === 8 || this.lookahead.type === 10;
            var argument = hasArgument ? this.parseExpression() : null;
            this.consumeSemicolon();
            return this.finalize(node, new Node.ReturnStatement(argument));
          };
          Parser2.prototype.parseWithStatement = function() {
            if (this.context.strict) {
              this.tolerateError(messages_1.Messages.StrictModeWith);
            }
            var node = this.createNode();
            var body;
            this.expectKeyword("with");
            this.expect("(");
            var object = this.parseExpression();
            if (!this.match(")") && this.config.tolerant) {
              this.tolerateUnexpectedToken(this.nextToken());
              body = this.finalize(this.createNode(), new Node.EmptyStatement);
            } else {
              this.expect(")");
              body = this.parseStatement();
            }
            return this.finalize(node, new Node.WithStatement(object, body));
          };
          Parser2.prototype.parseSwitchCase = function() {
            var node = this.createNode();
            var test;
            if (this.matchKeyword("default")) {
              this.nextToken();
              test = null;
            } else {
              this.expectKeyword("case");
              test = this.parseExpression();
            }
            this.expect(":");
            var consequent = [];
            while (true) {
              if (this.match("}") || this.matchKeyword("default") || this.matchKeyword("case")) {
                break;
              }
              consequent.push(this.parseStatementListItem());
            }
            return this.finalize(node, new Node.SwitchCase(test, consequent));
          };
          Parser2.prototype.parseSwitchStatement = function() {
            var node = this.createNode();
            this.expectKeyword("switch");
            this.expect("(");
            var discriminant = this.parseExpression();
            this.expect(")");
            var previousInSwitch = this.context.inSwitch;
            this.context.inSwitch = true;
            var cases = [];
            var defaultFound = false;
            this.expect("{");
            while (true) {
              if (this.match("}")) {
                break;
              }
              var clause = this.parseSwitchCase();
              if (clause.test === null) {
                if (defaultFound) {
                  this.throwError(messages_1.Messages.MultipleDefaultsInSwitch);
                }
                defaultFound = true;
              }
              cases.push(clause);
            }
            this.expect("}");
            this.context.inSwitch = previousInSwitch;
            return this.finalize(node, new Node.SwitchStatement(discriminant, cases));
          };
          Parser2.prototype.parseLabelledStatement = function() {
            var node = this.createNode();
            var expr = this.parseExpression();
            var statement;
            if (expr.type === syntax_1.Syntax.Identifier && this.match(":")) {
              this.nextToken();
              var id = expr;
              var key = "$" + id.name;
              if (Object.prototype.hasOwnProperty.call(this.context.labelSet, key)) {
                this.throwError(messages_1.Messages.Redeclaration, "Label", id.name);
              }
              this.context.labelSet[key] = true;
              var body = undefined;
              if (this.matchKeyword("class")) {
                this.tolerateUnexpectedToken(this.lookahead);
                body = this.parseClassDeclaration();
              } else if (this.matchKeyword("function")) {
                var token = this.lookahead;
                var declaration = this.parseFunctionDeclaration();
                if (this.context.strict) {
                  this.tolerateUnexpectedToken(token, messages_1.Messages.StrictFunction);
                } else if (declaration.generator) {
                  this.tolerateUnexpectedToken(token, messages_1.Messages.GeneratorInLegacyContext);
                }
                body = declaration;
              } else {
                body = this.parseStatement();
              }
              delete this.context.labelSet[key];
              statement = new Node.LabeledStatement(id, body);
            } else {
              this.consumeSemicolon();
              statement = new Node.ExpressionStatement(expr);
            }
            return this.finalize(node, statement);
          };
          Parser2.prototype.parseThrowStatement = function() {
            var node = this.createNode();
            this.expectKeyword("throw");
            if (this.hasLineTerminator) {
              this.throwError(messages_1.Messages.NewlineAfterThrow);
            }
            var argument = this.parseExpression();
            this.consumeSemicolon();
            return this.finalize(node, new Node.ThrowStatement(argument));
          };
          Parser2.prototype.parseCatchClause = function() {
            var node = this.createNode();
            this.expectKeyword("catch");
            this.expect("(");
            if (this.match(")")) {
              this.throwUnexpectedToken(this.lookahead);
            }
            var params = [];
            var param = this.parsePattern(params);
            var paramMap = {};
            for (var i = 0;i < params.length; i++) {
              var key = "$" + params[i].value;
              if (Object.prototype.hasOwnProperty.call(paramMap, key)) {
                this.tolerateError(messages_1.Messages.DuplicateBinding, params[i].value);
              }
              paramMap[key] = true;
            }
            if (this.context.strict && param.type === syntax_1.Syntax.Identifier) {
              if (this.scanner.isRestrictedWord(param.name)) {
                this.tolerateError(messages_1.Messages.StrictCatchVariable);
              }
            }
            this.expect(")");
            var body = this.parseBlock();
            return this.finalize(node, new Node.CatchClause(param, body));
          };
          Parser2.prototype.parseFinallyClause = function() {
            this.expectKeyword("finally");
            return this.parseBlock();
          };
          Parser2.prototype.parseTryStatement = function() {
            var node = this.createNode();
            this.expectKeyword("try");
            var block2 = this.parseBlock();
            var handler = this.matchKeyword("catch") ? this.parseCatchClause() : null;
            var finalizer = this.matchKeyword("finally") ? this.parseFinallyClause() : null;
            if (!handler && !finalizer) {
              this.throwError(messages_1.Messages.NoCatchOrFinally);
            }
            return this.finalize(node, new Node.TryStatement(block2, handler, finalizer));
          };
          Parser2.prototype.parseDebuggerStatement = function() {
            var node = this.createNode();
            this.expectKeyword("debugger");
            this.consumeSemicolon();
            return this.finalize(node, new Node.DebuggerStatement);
          };
          Parser2.prototype.parseStatement = function() {
            var statement;
            switch (this.lookahead.type) {
              case 1:
              case 5:
              case 6:
              case 8:
              case 10:
              case 9:
                statement = this.parseExpressionStatement();
                break;
              case 7:
                var value = this.lookahead.value;
                if (value === "{") {
                  statement = this.parseBlock();
                } else if (value === "(") {
                  statement = this.parseExpressionStatement();
                } else if (value === ";") {
                  statement = this.parseEmptyStatement();
                } else {
                  statement = this.parseExpressionStatement();
                }
                break;
              case 3:
                statement = this.matchAsyncFunction() ? this.parseFunctionDeclaration() : this.parseLabelledStatement();
                break;
              case 4:
                switch (this.lookahead.value) {
                  case "break":
                    statement = this.parseBreakStatement();
                    break;
                  case "continue":
                    statement = this.parseContinueStatement();
                    break;
                  case "debugger":
                    statement = this.parseDebuggerStatement();
                    break;
                  case "do":
                    statement = this.parseDoWhileStatement();
                    break;
                  case "for":
                    statement = this.parseForStatement();
                    break;
                  case "function":
                    statement = this.parseFunctionDeclaration();
                    break;
                  case "if":
                    statement = this.parseIfStatement();
                    break;
                  case "return":
                    statement = this.parseReturnStatement();
                    break;
                  case "switch":
                    statement = this.parseSwitchStatement();
                    break;
                  case "throw":
                    statement = this.parseThrowStatement();
                    break;
                  case "try":
                    statement = this.parseTryStatement();
                    break;
                  case "var":
                    statement = this.parseVariableStatement();
                    break;
                  case "while":
                    statement = this.parseWhileStatement();
                    break;
                  case "with":
                    statement = this.parseWithStatement();
                    break;
                  default:
                    statement = this.parseExpressionStatement();
                    break;
                }
                break;
              default:
                statement = this.throwUnexpectedToken(this.lookahead);
            }
            return statement;
          };
          Parser2.prototype.parseFunctionSourceElements = function() {
            var node = this.createNode();
            this.expect("{");
            var body = this.parseDirectivePrologues();
            var previousLabelSet = this.context.labelSet;
            var previousInIteration = this.context.inIteration;
            var previousInSwitch = this.context.inSwitch;
            var previousInFunctionBody = this.context.inFunctionBody;
            this.context.labelSet = {};
            this.context.inIteration = false;
            this.context.inSwitch = false;
            this.context.inFunctionBody = true;
            while (this.lookahead.type !== 2) {
              if (this.match("}")) {
                break;
              }
              body.push(this.parseStatementListItem());
            }
            this.expect("}");
            this.context.labelSet = previousLabelSet;
            this.context.inIteration = previousInIteration;
            this.context.inSwitch = previousInSwitch;
            this.context.inFunctionBody = previousInFunctionBody;
            return this.finalize(node, new Node.BlockStatement(body));
          };
          Parser2.prototype.validateParam = function(options2, param, name) {
            var key = "$" + name;
            if (this.context.strict) {
              if (this.scanner.isRestrictedWord(name)) {
                options2.stricted = param;
                options2.message = messages_1.Messages.StrictParamName;
              }
              if (Object.prototype.hasOwnProperty.call(options2.paramSet, key)) {
                options2.stricted = param;
                options2.message = messages_1.Messages.StrictParamDupe;
              }
            } else if (!options2.firstRestricted) {
              if (this.scanner.isRestrictedWord(name)) {
                options2.firstRestricted = param;
                options2.message = messages_1.Messages.StrictParamName;
              } else if (this.scanner.isStrictModeReservedWord(name)) {
                options2.firstRestricted = param;
                options2.message = messages_1.Messages.StrictReservedWord;
              } else if (Object.prototype.hasOwnProperty.call(options2.paramSet, key)) {
                options2.stricted = param;
                options2.message = messages_1.Messages.StrictParamDupe;
              }
            }
            if (typeof Object.defineProperty === "function") {
              Object.defineProperty(options2.paramSet, key, { value: true, enumerable: true, writable: true, configurable: true });
            } else {
              options2.paramSet[key] = true;
            }
          };
          Parser2.prototype.parseRestElement = function(params) {
            var node = this.createNode();
            this.expect("...");
            var arg = this.parsePattern(params);
            if (this.match("=")) {
              this.throwError(messages_1.Messages.DefaultRestParameter);
            }
            if (!this.match(")")) {
              this.throwError(messages_1.Messages.ParameterAfterRestParameter);
            }
            return this.finalize(node, new Node.RestElement(arg));
          };
          Parser2.prototype.parseFormalParameter = function(options2) {
            var params = [];
            var param = this.match("...") ? this.parseRestElement(params) : this.parsePatternWithDefault(params);
            for (var i = 0;i < params.length; i++) {
              this.validateParam(options2, params[i], params[i].value);
            }
            options2.simple = options2.simple && param instanceof Node.Identifier;
            options2.params.push(param);
          };
          Parser2.prototype.parseFormalParameters = function(firstRestricted) {
            var options2;
            options2 = {
              simple: true,
              params: [],
              firstRestricted
            };
            this.expect("(");
            if (!this.match(")")) {
              options2.paramSet = {};
              while (this.lookahead.type !== 2) {
                this.parseFormalParameter(options2);
                if (this.match(")")) {
                  break;
                }
                this.expect(",");
                if (this.match(")")) {
                  break;
                }
              }
            }
            this.expect(")");
            return {
              simple: options2.simple,
              params: options2.params,
              stricted: options2.stricted,
              firstRestricted: options2.firstRestricted,
              message: options2.message
            };
          };
          Parser2.prototype.matchAsyncFunction = function() {
            var match = this.matchContextualKeyword("async");
            if (match) {
              var state = this.scanner.saveState();
              this.scanner.scanComments();
              var next = this.scanner.lex();
              this.scanner.restoreState(state);
              match = state.lineNumber === next.lineNumber && next.type === 4 && next.value === "function";
            }
            return match;
          };
          Parser2.prototype.parseFunctionDeclaration = function(identifierIsOptional) {
            var node = this.createNode();
            var isAsync = this.matchContextualKeyword("async");
            if (isAsync) {
              this.nextToken();
            }
            this.expectKeyword("function");
            var isGenerator = isAsync ? false : this.match("*");
            if (isGenerator) {
              this.nextToken();
            }
            var message;
            var id = null;
            var firstRestricted = null;
            if (!identifierIsOptional || !this.match("(")) {
              var token = this.lookahead;
              id = this.parseVariableIdentifier();
              if (this.context.strict) {
                if (this.scanner.isRestrictedWord(token.value)) {
                  this.tolerateUnexpectedToken(token, messages_1.Messages.StrictFunctionName);
                }
              } else {
                if (this.scanner.isRestrictedWord(token.value)) {
                  firstRestricted = token;
                  message = messages_1.Messages.StrictFunctionName;
                } else if (this.scanner.isStrictModeReservedWord(token.value)) {
                  firstRestricted = token;
                  message = messages_1.Messages.StrictReservedWord;
                }
              }
            }
            var previousAllowAwait = this.context.await;
            var previousAllowYield = this.context.allowYield;
            this.context.await = isAsync;
            this.context.allowYield = !isGenerator;
            var formalParameters = this.parseFormalParameters(firstRestricted);
            var params = formalParameters.params;
            var stricted = formalParameters.stricted;
            firstRestricted = formalParameters.firstRestricted;
            if (formalParameters.message) {
              message = formalParameters.message;
            }
            var previousStrict = this.context.strict;
            var previousAllowStrictDirective = this.context.allowStrictDirective;
            this.context.allowStrictDirective = formalParameters.simple;
            var body = this.parseFunctionSourceElements();
            if (this.context.strict && firstRestricted) {
              this.throwUnexpectedToken(firstRestricted, message);
            }
            if (this.context.strict && stricted) {
              this.tolerateUnexpectedToken(stricted, message);
            }
            this.context.strict = previousStrict;
            this.context.allowStrictDirective = previousAllowStrictDirective;
            this.context.await = previousAllowAwait;
            this.context.allowYield = previousAllowYield;
            return isAsync ? this.finalize(node, new Node.AsyncFunctionDeclaration(id, params, body)) : this.finalize(node, new Node.FunctionDeclaration(id, params, body, isGenerator));
          };
          Parser2.prototype.parseFunctionExpression = function() {
            var node = this.createNode();
            var isAsync = this.matchContextualKeyword("async");
            if (isAsync) {
              this.nextToken();
            }
            this.expectKeyword("function");
            var isGenerator = isAsync ? false : this.match("*");
            if (isGenerator) {
              this.nextToken();
            }
            var message;
            var id = null;
            var firstRestricted;
            var previousAllowAwait = this.context.await;
            var previousAllowYield = this.context.allowYield;
            this.context.await = isAsync;
            this.context.allowYield = !isGenerator;
            if (!this.match("(")) {
              var token = this.lookahead;
              id = !this.context.strict && !isGenerator && this.matchKeyword("yield") ? this.parseIdentifierName() : this.parseVariableIdentifier();
              if (this.context.strict) {
                if (this.scanner.isRestrictedWord(token.value)) {
                  this.tolerateUnexpectedToken(token, messages_1.Messages.StrictFunctionName);
                }
              } else {
                if (this.scanner.isRestrictedWord(token.value)) {
                  firstRestricted = token;
                  message = messages_1.Messages.StrictFunctionName;
                } else if (this.scanner.isStrictModeReservedWord(token.value)) {
                  firstRestricted = token;
                  message = messages_1.Messages.StrictReservedWord;
                }
              }
            }
            var formalParameters = this.parseFormalParameters(firstRestricted);
            var params = formalParameters.params;
            var stricted = formalParameters.stricted;
            firstRestricted = formalParameters.firstRestricted;
            if (formalParameters.message) {
              message = formalParameters.message;
            }
            var previousStrict = this.context.strict;
            var previousAllowStrictDirective = this.context.allowStrictDirective;
            this.context.allowStrictDirective = formalParameters.simple;
            var body = this.parseFunctionSourceElements();
            if (this.context.strict && firstRestricted) {
              this.throwUnexpectedToken(firstRestricted, message);
            }
            if (this.context.strict && stricted) {
              this.tolerateUnexpectedToken(stricted, message);
            }
            this.context.strict = previousStrict;
            this.context.allowStrictDirective = previousAllowStrictDirective;
            this.context.await = previousAllowAwait;
            this.context.allowYield = previousAllowYield;
            return isAsync ? this.finalize(node, new Node.AsyncFunctionExpression(id, params, body)) : this.finalize(node, new Node.FunctionExpression(id, params, body, isGenerator));
          };
          Parser2.prototype.parseDirective = function() {
            var token = this.lookahead;
            var node = this.createNode();
            var expr = this.parseExpression();
            var directive = expr.type === syntax_1.Syntax.Literal ? this.getTokenRaw(token).slice(1, -1) : null;
            this.consumeSemicolon();
            return this.finalize(node, directive ? new Node.Directive(expr, directive) : new Node.ExpressionStatement(expr));
          };
          Parser2.prototype.parseDirectivePrologues = function() {
            var firstRestricted = null;
            var body = [];
            while (true) {
              var token = this.lookahead;
              if (token.type !== 8) {
                break;
              }
              var statement = this.parseDirective();
              body.push(statement);
              var directive = statement.directive;
              if (typeof directive !== "string") {
                break;
              }
              if (directive === "use strict") {
                this.context.strict = true;
                if (firstRestricted) {
                  this.tolerateUnexpectedToken(firstRestricted, messages_1.Messages.StrictOctalLiteral);
                }
                if (!this.context.allowStrictDirective) {
                  this.tolerateUnexpectedToken(token, messages_1.Messages.IllegalLanguageModeDirective);
                }
              } else {
                if (!firstRestricted && token.octal) {
                  firstRestricted = token;
                }
              }
            }
            return body;
          };
          Parser2.prototype.qualifiedPropertyName = function(token) {
            switch (token.type) {
              case 3:
              case 8:
              case 1:
              case 5:
              case 6:
              case 4:
                return true;
              case 7:
                return token.value === "[";
              default:
                break;
            }
            return false;
          };
          Parser2.prototype.parseGetterMethod = function() {
            var node = this.createNode();
            var isGenerator = false;
            var previousAllowYield = this.context.allowYield;
            this.context.allowYield = !isGenerator;
            var formalParameters = this.parseFormalParameters();
            if (formalParameters.params.length > 0) {
              this.tolerateError(messages_1.Messages.BadGetterArity);
            }
            var method = this.parsePropertyMethod(formalParameters);
            this.context.allowYield = previousAllowYield;
            return this.finalize(node, new Node.FunctionExpression(null, formalParameters.params, method, isGenerator));
          };
          Parser2.prototype.parseSetterMethod = function() {
            var node = this.createNode();
            var isGenerator = false;
            var previousAllowYield = this.context.allowYield;
            this.context.allowYield = !isGenerator;
            var formalParameters = this.parseFormalParameters();
            if (formalParameters.params.length !== 1) {
              this.tolerateError(messages_1.Messages.BadSetterArity);
            } else if (formalParameters.params[0] instanceof Node.RestElement) {
              this.tolerateError(messages_1.Messages.BadSetterRestParameter);
            }
            var method = this.parsePropertyMethod(formalParameters);
            this.context.allowYield = previousAllowYield;
            return this.finalize(node, new Node.FunctionExpression(null, formalParameters.params, method, isGenerator));
          };
          Parser2.prototype.parseGeneratorMethod = function() {
            var node = this.createNode();
            var isGenerator = true;
            var previousAllowYield = this.context.allowYield;
            this.context.allowYield = true;
            var params = this.parseFormalParameters();
            this.context.allowYield = false;
            var method = this.parsePropertyMethod(params);
            this.context.allowYield = previousAllowYield;
            return this.finalize(node, new Node.FunctionExpression(null, params.params, method, isGenerator));
          };
          Parser2.prototype.isStartOfExpression = function() {
            var start = true;
            var value = this.lookahead.value;
            switch (this.lookahead.type) {
              case 7:
                start = value === "[" || value === "(" || value === "{" || value === "+" || value === "-" || value === "!" || value === "~" || value === "++" || value === "--" || value === "/" || value === "/=";
                break;
              case 4:
                start = value === "class" || value === "delete" || value === "function" || value === "let" || value === "new" || value === "super" || value === "this" || value === "typeof" || value === "void" || value === "yield";
                break;
              default:
                break;
            }
            return start;
          };
          Parser2.prototype.parseYieldExpression = function() {
            var node = this.createNode();
            this.expectKeyword("yield");
            var argument = null;
            var delegate = false;
            if (!this.hasLineTerminator) {
              var previousAllowYield = this.context.allowYield;
              this.context.allowYield = false;
              delegate = this.match("*");
              if (delegate) {
                this.nextToken();
                argument = this.parseAssignmentExpression();
              } else if (this.isStartOfExpression()) {
                argument = this.parseAssignmentExpression();
              }
              this.context.allowYield = previousAllowYield;
            }
            return this.finalize(node, new Node.YieldExpression(argument, delegate));
          };
          Parser2.prototype.parseClassElement = function(hasConstructor) {
            var token = this.lookahead;
            var node = this.createNode();
            var kind2 = "";
            var key = null;
            var value = null;
            var computed = false;
            var method = false;
            var isStatic = false;
            var isAsync = false;
            if (this.match("*")) {
              this.nextToken();
            } else {
              computed = this.match("[");
              key = this.parseObjectPropertyKey();
              var id = key;
              if (id.name === "static" && (this.qualifiedPropertyName(this.lookahead) || this.match("*"))) {
                token = this.lookahead;
                isStatic = true;
                computed = this.match("[");
                if (this.match("*")) {
                  this.nextToken();
                } else {
                  key = this.parseObjectPropertyKey();
                }
              }
              if (token.type === 3 && !this.hasLineTerminator && token.value === "async") {
                var punctuator = this.lookahead.value;
                if (punctuator !== ":" && punctuator !== "(" && punctuator !== "*") {
                  isAsync = true;
                  token = this.lookahead;
                  key = this.parseObjectPropertyKey();
                  if (token.type === 3 && token.value === "constructor") {
                    this.tolerateUnexpectedToken(token, messages_1.Messages.ConstructorIsAsync);
                  }
                }
              }
            }
            var lookaheadPropertyKey = this.qualifiedPropertyName(this.lookahead);
            if (token.type === 3) {
              if (token.value === "get" && lookaheadPropertyKey) {
                kind2 = "get";
                computed = this.match("[");
                key = this.parseObjectPropertyKey();
                this.context.allowYield = false;
                value = this.parseGetterMethod();
              } else if (token.value === "set" && lookaheadPropertyKey) {
                kind2 = "set";
                computed = this.match("[");
                key = this.parseObjectPropertyKey();
                value = this.parseSetterMethod();
              }
            } else if (token.type === 7 && token.value === "*" && lookaheadPropertyKey) {
              kind2 = "init";
              computed = this.match("[");
              key = this.parseObjectPropertyKey();
              value = this.parseGeneratorMethod();
              method = true;
            }
            if (!kind2 && key && this.match("(")) {
              kind2 = "init";
              value = isAsync ? this.parsePropertyMethodAsyncFunction() : this.parsePropertyMethodFunction();
              method = true;
            }
            if (!kind2) {
              this.throwUnexpectedToken(this.lookahead);
            }
            if (kind2 === "init") {
              kind2 = "method";
            }
            if (!computed) {
              if (isStatic && this.isPropertyKey(key, "prototype")) {
                this.throwUnexpectedToken(token, messages_1.Messages.StaticPrototype);
              }
              if (!isStatic && this.isPropertyKey(key, "constructor")) {
                if (kind2 !== "method" || !method || value && value.generator) {
                  this.throwUnexpectedToken(token, messages_1.Messages.ConstructorSpecialMethod);
                }
                if (hasConstructor.value) {
                  this.throwUnexpectedToken(token, messages_1.Messages.DuplicateConstructor);
                } else {
                  hasConstructor.value = true;
                }
                kind2 = "constructor";
              }
            }
            return this.finalize(node, new Node.MethodDefinition(key, computed, value, kind2, isStatic));
          };
          Parser2.prototype.parseClassElementList = function() {
            var body = [];
            var hasConstructor = { value: false };
            this.expect("{");
            while (!this.match("}")) {
              if (this.match(";")) {
                this.nextToken();
              } else {
                body.push(this.parseClassElement(hasConstructor));
              }
            }
            this.expect("}");
            return body;
          };
          Parser2.prototype.parseClassBody = function() {
            var node = this.createNode();
            var elementList = this.parseClassElementList();
            return this.finalize(node, new Node.ClassBody(elementList));
          };
          Parser2.prototype.parseClassDeclaration = function(identifierIsOptional) {
            var node = this.createNode();
            var previousStrict = this.context.strict;
            this.context.strict = true;
            this.expectKeyword("class");
            var id = identifierIsOptional && this.lookahead.type !== 3 ? null : this.parseVariableIdentifier();
            var superClass = null;
            if (this.matchKeyword("extends")) {
              this.nextToken();
              superClass = this.isolateCoverGrammar(this.parseLeftHandSideExpressionAllowCall);
            }
            var classBody = this.parseClassBody();
            this.context.strict = previousStrict;
            return this.finalize(node, new Node.ClassDeclaration(id, superClass, classBody));
          };
          Parser2.prototype.parseClassExpression = function() {
            var node = this.createNode();
            var previousStrict = this.context.strict;
            this.context.strict = true;
            this.expectKeyword("class");
            var id = this.lookahead.type === 3 ? this.parseVariableIdentifier() : null;
            var superClass = null;
            if (this.matchKeyword("extends")) {
              this.nextToken();
              superClass = this.isolateCoverGrammar(this.parseLeftHandSideExpressionAllowCall);
            }
            var classBody = this.parseClassBody();
            this.context.strict = previousStrict;
            return this.finalize(node, new Node.ClassExpression(id, superClass, classBody));
          };
          Parser2.prototype.parseModule = function() {
            this.context.strict = true;
            this.context.isModule = true;
            this.scanner.isModule = true;
            var node = this.createNode();
            var body = this.parseDirectivePrologues();
            while (this.lookahead.type !== 2) {
              body.push(this.parseStatementListItem());
            }
            return this.finalize(node, new Node.Module(body));
          };
          Parser2.prototype.parseScript = function() {
            var node = this.createNode();
            var body = this.parseDirectivePrologues();
            while (this.lookahead.type !== 2) {
              body.push(this.parseStatementListItem());
            }
            return this.finalize(node, new Node.Script(body));
          };
          Parser2.prototype.parseModuleSpecifier = function() {
            var node = this.createNode();
            if (this.lookahead.type !== 8) {
              this.throwError(messages_1.Messages.InvalidModuleSpecifier);
            }
            var token = this.nextToken();
            var raw = this.getTokenRaw(token);
            return this.finalize(node, new Node.Literal(token.value, raw));
          };
          Parser2.prototype.parseImportSpecifier = function() {
            var node = this.createNode();
            var imported;
            var local;
            if (this.lookahead.type === 3) {
              imported = this.parseVariableIdentifier();
              local = imported;
              if (this.matchContextualKeyword("as")) {
                this.nextToken();
                local = this.parseVariableIdentifier();
              }
            } else {
              imported = this.parseIdentifierName();
              local = imported;
              if (this.matchContextualKeyword("as")) {
                this.nextToken();
                local = this.parseVariableIdentifier();
              } else {
                this.throwUnexpectedToken(this.nextToken());
              }
            }
            return this.finalize(node, new Node.ImportSpecifier(local, imported));
          };
          Parser2.prototype.parseNamedImports = function() {
            this.expect("{");
            var specifiers = [];
            while (!this.match("}")) {
              specifiers.push(this.parseImportSpecifier());
              if (!this.match("}")) {
                this.expect(",");
              }
            }
            this.expect("}");
            return specifiers;
          };
          Parser2.prototype.parseImportDefaultSpecifier = function() {
            var node = this.createNode();
            var local = this.parseIdentifierName();
            return this.finalize(node, new Node.ImportDefaultSpecifier(local));
          };
          Parser2.prototype.parseImportNamespaceSpecifier = function() {
            var node = this.createNode();
            this.expect("*");
            if (!this.matchContextualKeyword("as")) {
              this.throwError(messages_1.Messages.NoAsAfterImportNamespace);
            }
            this.nextToken();
            var local = this.parseIdentifierName();
            return this.finalize(node, new Node.ImportNamespaceSpecifier(local));
          };
          Parser2.prototype.parseImportDeclaration = function() {
            if (this.context.inFunctionBody) {
              this.throwError(messages_1.Messages.IllegalImportDeclaration);
            }
            var node = this.createNode();
            this.expectKeyword("import");
            var src;
            var specifiers = [];
            if (this.lookahead.type === 8) {
              src = this.parseModuleSpecifier();
            } else {
              if (this.match("{")) {
                specifiers = specifiers.concat(this.parseNamedImports());
              } else if (this.match("*")) {
                specifiers.push(this.parseImportNamespaceSpecifier());
              } else if (this.isIdentifierName(this.lookahead) && !this.matchKeyword("default")) {
                specifiers.push(this.parseImportDefaultSpecifier());
                if (this.match(",")) {
                  this.nextToken();
                  if (this.match("*")) {
                    specifiers.push(this.parseImportNamespaceSpecifier());
                  } else if (this.match("{")) {
                    specifiers = specifiers.concat(this.parseNamedImports());
                  } else {
                    this.throwUnexpectedToken(this.lookahead);
                  }
                }
              } else {
                this.throwUnexpectedToken(this.nextToken());
              }
              if (!this.matchContextualKeyword("from")) {
                var message = this.lookahead.value ? messages_1.Messages.UnexpectedToken : messages_1.Messages.MissingFromClause;
                this.throwError(message, this.lookahead.value);
              }
              this.nextToken();
              src = this.parseModuleSpecifier();
            }
            this.consumeSemicolon();
            return this.finalize(node, new Node.ImportDeclaration(specifiers, src));
          };
          Parser2.prototype.parseExportSpecifier = function() {
            var node = this.createNode();
            var local = this.parseIdentifierName();
            var exported = local;
            if (this.matchContextualKeyword("as")) {
              this.nextToken();
              exported = this.parseIdentifierName();
            }
            return this.finalize(node, new Node.ExportSpecifier(local, exported));
          };
          Parser2.prototype.parseExportDeclaration = function() {
            if (this.context.inFunctionBody) {
              this.throwError(messages_1.Messages.IllegalExportDeclaration);
            }
            var node = this.createNode();
            this.expectKeyword("export");
            var exportDeclaration;
            if (this.matchKeyword("default")) {
              this.nextToken();
              if (this.matchKeyword("function")) {
                var declaration = this.parseFunctionDeclaration(true);
                exportDeclaration = this.finalize(node, new Node.ExportDefaultDeclaration(declaration));
              } else if (this.matchKeyword("class")) {
                var declaration = this.parseClassDeclaration(true);
                exportDeclaration = this.finalize(node, new Node.ExportDefaultDeclaration(declaration));
              } else if (this.matchContextualKeyword("async")) {
                var declaration = this.matchAsyncFunction() ? this.parseFunctionDeclaration(true) : this.parseAssignmentExpression();
                exportDeclaration = this.finalize(node, new Node.ExportDefaultDeclaration(declaration));
              } else {
                if (this.matchContextualKeyword("from")) {
                  this.throwError(messages_1.Messages.UnexpectedToken, this.lookahead.value);
                }
                var declaration = this.match("{") ? this.parseObjectInitializer() : this.match("[") ? this.parseArrayInitializer() : this.parseAssignmentExpression();
                this.consumeSemicolon();
                exportDeclaration = this.finalize(node, new Node.ExportDefaultDeclaration(declaration));
              }
            } else if (this.match("*")) {
              this.nextToken();
              if (!this.matchContextualKeyword("from")) {
                var message = this.lookahead.value ? messages_1.Messages.UnexpectedToken : messages_1.Messages.MissingFromClause;
                this.throwError(message, this.lookahead.value);
              }
              this.nextToken();
              var src = this.parseModuleSpecifier();
              this.consumeSemicolon();
              exportDeclaration = this.finalize(node, new Node.ExportAllDeclaration(src));
            } else if (this.lookahead.type === 4) {
              var declaration = undefined;
              switch (this.lookahead.value) {
                case "let":
                case "const":
                  declaration = this.parseLexicalDeclaration({ inFor: false });
                  break;
                case "var":
                case "class":
                case "function":
                  declaration = this.parseStatementListItem();
                  break;
                default:
                  this.throwUnexpectedToken(this.lookahead);
              }
              exportDeclaration = this.finalize(node, new Node.ExportNamedDeclaration(declaration, [], null));
            } else if (this.matchAsyncFunction()) {
              var declaration = this.parseFunctionDeclaration();
              exportDeclaration = this.finalize(node, new Node.ExportNamedDeclaration(declaration, [], null));
            } else {
              var specifiers = [];
              var source = null;
              var isExportFromIdentifier = false;
              this.expect("{");
              while (!this.match("}")) {
                isExportFromIdentifier = isExportFromIdentifier || this.matchKeyword("default");
                specifiers.push(this.parseExportSpecifier());
                if (!this.match("}")) {
                  this.expect(",");
                }
              }
              this.expect("}");
              if (this.matchContextualKeyword("from")) {
                this.nextToken();
                source = this.parseModuleSpecifier();
                this.consumeSemicolon();
              } else if (isExportFromIdentifier) {
                var message = this.lookahead.value ? messages_1.Messages.UnexpectedToken : messages_1.Messages.MissingFromClause;
                this.throwError(message, this.lookahead.value);
              } else {
                this.consumeSemicolon();
              }
              exportDeclaration = this.finalize(node, new Node.ExportNamedDeclaration(null, specifiers, source));
            }
            return exportDeclaration;
          };
          return Parser2;
        }();
        exports2.Parser = Parser;
      },
      function(module2, exports2) {
        Object.defineProperty(exports2, "__esModule", { value: true });
        function assert(condition, message) {
          if (!condition) {
            throw new Error("ASSERT: " + message);
          }
        }
        exports2.assert = assert;
      },
      function(module2, exports2) {
        Object.defineProperty(exports2, "__esModule", { value: true });
        var ErrorHandler = function() {
          function ErrorHandler2() {
            this.errors = [];
            this.tolerant = false;
          }
          ErrorHandler2.prototype.recordError = function(error5) {
            this.errors.push(error5);
          };
          ErrorHandler2.prototype.tolerate = function(error5) {
            if (this.tolerant) {
              this.recordError(error5);
            } else {
              throw error5;
            }
          };
          ErrorHandler2.prototype.constructError = function(msg, column) {
            var error5 = new Error(msg);
            try {
              throw error5;
            } catch (base) {
              if (Object.create && Object.defineProperty) {
                error5 = Object.create(base);
                Object.defineProperty(error5, "column", { value: column });
              }
            }
            return error5;
          };
          ErrorHandler2.prototype.createError = function(index, line, col, description) {
            var msg = "Line " + line + ": " + description;
            var error5 = this.constructError(msg, col);
            error5.index = index;
            error5.lineNumber = line;
            error5.description = description;
            return error5;
          };
          ErrorHandler2.prototype.throwError = function(index, line, col, description) {
            throw this.createError(index, line, col, description);
          };
          ErrorHandler2.prototype.tolerateError = function(index, line, col, description) {
            var error5 = this.createError(index, line, col, description);
            if (this.tolerant) {
              this.recordError(error5);
            } else {
              throw error5;
            }
          };
          return ErrorHandler2;
        }();
        exports2.ErrorHandler = ErrorHandler;
      },
      function(module2, exports2) {
        Object.defineProperty(exports2, "__esModule", { value: true });
        exports2.Messages = {
          BadGetterArity: "Getter must not have any formal parameters",
          BadSetterArity: "Setter must have exactly one formal parameter",
          BadSetterRestParameter: "Setter function argument must not be a rest parameter",
          ConstructorIsAsync: "Class constructor may not be an async method",
          ConstructorSpecialMethod: "Class constructor may not be an accessor",
          DeclarationMissingInitializer: "Missing initializer in %0 declaration",
          DefaultRestParameter: "Unexpected token =",
          DuplicateBinding: "Duplicate binding %0",
          DuplicateConstructor: "A class may only have one constructor",
          DuplicateProtoProperty: "Duplicate __proto__ fields are not allowed in object literals",
          ForInOfLoopInitializer: "%0 loop variable declaration may not have an initializer",
          GeneratorInLegacyContext: "Generator declarations are not allowed in legacy contexts",
          IllegalBreak: "Illegal break statement",
          IllegalContinue: "Illegal continue statement",
          IllegalExportDeclaration: "Unexpected token",
          IllegalImportDeclaration: "Unexpected token",
          IllegalLanguageModeDirective: "Illegal \'use strict\' directive in function with non-simple parameter list",
          IllegalReturn: "Illegal return statement",
          InvalidEscapedReservedWord: "Keyword must not contain escaped characters",
          InvalidHexEscapeSequence: "Invalid hexadecimal escape sequence",
          InvalidLHSInAssignment: "Invalid left-hand side in assignment",
          InvalidLHSInForIn: "Invalid left-hand side in for-in",
          InvalidLHSInForLoop: "Invalid left-hand side in for-loop",
          InvalidModuleSpecifier: "Unexpected token",
          InvalidRegExp: "Invalid regular expression",
          LetInLexicalBinding: "let is disallowed as a lexically bound name",
          MissingFromClause: "Unexpected token",
          MultipleDefaultsInSwitch: "More than one default clause in switch statement",
          NewlineAfterThrow: "Illegal newline after throw",
          NoAsAfterImportNamespace: "Unexpected token",
          NoCatchOrFinally: "Missing catch or finally after try",
          ParameterAfterRestParameter: "Rest parameter must be last formal parameter",
          Redeclaration: "%0 \'%1\' has already been declared",
          StaticPrototype: "Classes may not have static property named prototype",
          StrictCatchVariable: "Catch variable may not be eval or arguments in strict mode",
          StrictDelete: "Delete of an unqualified identifier in strict mode.",
          StrictFunction: "In strict mode code, functions can only be declared at top level or inside a block",
          StrictFunctionName: "Function name may not be eval or arguments in strict mode",
          StrictLHSAssignment: "Assignment to eval or arguments is not allowed in strict mode",
          StrictLHSPostfix: "Postfix increment/decrement may not have eval or arguments operand in strict mode",
          StrictLHSPrefix: "Prefix increment/decrement may not have eval or arguments operand in strict mode",
          StrictModeWith: "Strict mode code may not include a with statement",
          StrictOctalLiteral: "Octal literals are not allowed in strict mode.",
          StrictParamDupe: "Strict mode function may not have duplicate parameter names",
          StrictParamName: "Parameter name eval or arguments is not allowed in strict mode",
          StrictReservedWord: "Use of future reserved word in strict mode",
          StrictVarName: "Variable name may not be eval or arguments in strict mode",
          TemplateOctalLiteral: "Octal literals are not allowed in template strings.",
          UnexpectedEOS: "Unexpected end of input",
          UnexpectedIdentifier: "Unexpected identifier",
          UnexpectedNumber: "Unexpected number",
          UnexpectedReserved: "Unexpected reserved word",
          UnexpectedString: "Unexpected string",
          UnexpectedTemplate: "Unexpected quasi %0",
          UnexpectedToken: "Unexpected token %0",
          UnexpectedTokenIllegal: "Unexpected token ILLEGAL",
          UnknownLabel: "Undefined label \'%0\'",
          UnterminatedRegExp: "Invalid regular expression: missing /"
        };
      },
      function(module2, exports2, __webpack_require__) {
        Object.defineProperty(exports2, "__esModule", { value: true });
        var assert_1 = __webpack_require__(9);
        var character_1 = __webpack_require__(4);
        var messages_1 = __webpack_require__(11);
        function hexValue(ch) {
          return "0123456789abcdef".indexOf(ch.toLowerCase());
        }
        function octalValue(ch) {
          return "01234567".indexOf(ch);
        }
        var Scanner = function() {
          function Scanner2(code, handler) {
            this.source = code;
            this.errorHandler = handler;
            this.trackComment = false;
            this.isModule = false;
            this.length = code.length;
            this.index = 0;
            this.lineNumber = code.length > 0 ? 1 : 0;
            this.lineStart = 0;
            this.curlyStack = [];
          }
          Scanner2.prototype.saveState = function() {
            return {
              index: this.index,
              lineNumber: this.lineNumber,
              lineStart: this.lineStart
            };
          };
          Scanner2.prototype.restoreState = function(state) {
            this.index = state.index;
            this.lineNumber = state.lineNumber;
            this.lineStart = state.lineStart;
          };
          Scanner2.prototype.eof = function() {
            return this.index >= this.length;
          };
          Scanner2.prototype.throwUnexpectedToken = function(message) {
            if (message === undefined) {
              message = messages_1.Messages.UnexpectedTokenIllegal;
            }
            return this.errorHandler.throwError(this.index, this.lineNumber, this.index - this.lineStart + 1, message);
          };
          Scanner2.prototype.tolerateUnexpectedToken = function(message) {
            if (message === undefined) {
              message = messages_1.Messages.UnexpectedTokenIllegal;
            }
            this.errorHandler.tolerateError(this.index, this.lineNumber, this.index - this.lineStart + 1, message);
          };
          Scanner2.prototype.skipSingleLineComment = function(offset) {
            var comments = [];
            var start, loc;
            if (this.trackComment) {
              comments = [];
              start = this.index - offset;
              loc = {
                start: {
                  line: this.lineNumber,
                  column: this.index - this.lineStart - offset
                },
                end: {}
              };
            }
            while (!this.eof()) {
              var ch = this.source.charCodeAt(this.index);
              ++this.index;
              if (character_1.Character.isLineTerminator(ch)) {
                if (this.trackComment) {
                  loc.end = {
                    line: this.lineNumber,
                    column: this.index - this.lineStart - 1
                  };
                  var entry = {
                    multiLine: false,
                    slice: [start + offset, this.index - 1],
                    range: [start, this.index - 1],
                    loc
                  };
                  comments.push(entry);
                }
                if (ch === 13 && this.source.charCodeAt(this.index) === 10) {
                  ++this.index;
                }
                ++this.lineNumber;
                this.lineStart = this.index;
                return comments;
              }
            }
            if (this.trackComment) {
              loc.end = {
                line: this.lineNumber,
                column: this.index - this.lineStart
              };
              var entry = {
                multiLine: false,
                slice: [start + offset, this.index],
                range: [start, this.index],
                loc
              };
              comments.push(entry);
            }
            return comments;
          };
          Scanner2.prototype.skipMultiLineComment = function() {
            var comments = [];
            var start, loc;
            if (this.trackComment) {
              comments = [];
              start = this.index - 2;
              loc = {
                start: {
                  line: this.lineNumber,
                  column: this.index - this.lineStart - 2
                },
                end: {}
              };
            }
            while (!this.eof()) {
              var ch = this.source.charCodeAt(this.index);
              if (character_1.Character.isLineTerminator(ch)) {
                if (ch === 13 && this.source.charCodeAt(this.index + 1) === 10) {
                  ++this.index;
                }
                ++this.lineNumber;
                ++this.index;
                this.lineStart = this.index;
              } else if (ch === 42) {
                if (this.source.charCodeAt(this.index + 1) === 47) {
                  this.index += 2;
                  if (this.trackComment) {
                    loc.end = {
                      line: this.lineNumber,
                      column: this.index - this.lineStart
                    };
                    var entry = {
                      multiLine: true,
                      slice: [start + 2, this.index - 2],
                      range: [start, this.index],
                      loc
                    };
                    comments.push(entry);
                  }
                  return comments;
                }
                ++this.index;
              } else {
                ++this.index;
              }
            }
            if (this.trackComment) {
              loc.end = {
                line: this.lineNumber,
                column: this.index - this.lineStart
              };
              var entry = {
                multiLine: true,
                slice: [start + 2, this.index],
                range: [start, this.index],
                loc
              };
              comments.push(entry);
            }
            this.tolerateUnexpectedToken();
            return comments;
          };
          Scanner2.prototype.scanComments = function() {
            var comments;
            if (this.trackComment) {
              comments = [];
            }
            var start = this.index === 0;
            while (!this.eof()) {
              var ch = this.source.charCodeAt(this.index);
              if (character_1.Character.isWhiteSpace(ch)) {
                ++this.index;
              } else if (character_1.Character.isLineTerminator(ch)) {
                ++this.index;
                if (ch === 13 && this.source.charCodeAt(this.index) === 10) {
                  ++this.index;
                }
                ++this.lineNumber;
                this.lineStart = this.index;
                start = true;
              } else if (ch === 47) {
                ch = this.source.charCodeAt(this.index + 1);
                if (ch === 47) {
                  this.index += 2;
                  var comment = this.skipSingleLineComment(2);
                  if (this.trackComment) {
                    comments = comments.concat(comment);
                  }
                  start = true;
                } else if (ch === 42) {
                  this.index += 2;
                  var comment = this.skipMultiLineComment();
                  if (this.trackComment) {
                    comments = comments.concat(comment);
                  }
                } else {
                  break;
                }
              } else if (start && ch === 45) {
                if (this.source.charCodeAt(this.index + 1) === 45 && this.source.charCodeAt(this.index + 2) === 62) {
                  this.index += 3;
                  var comment = this.skipSingleLineComment(3);
                  if (this.trackComment) {
                    comments = comments.concat(comment);
                  }
                } else {
                  break;
                }
              } else if (ch === 60 && !this.isModule) {
                if (this.source.slice(this.index + 1, this.index + 4) === "!--") {
                  this.index += 4;
                  var comment = this.skipSingleLineComment(4);
                  if (this.trackComment) {
                    comments = comments.concat(comment);
                  }
                } else {
                  break;
                }
              } else {
                break;
              }
            }
            return comments;
          };
          Scanner2.prototype.isFutureReservedWord = function(id) {
            switch (id) {
              case "enum":
              case "export":
              case "import":
              case "super":
                return true;
              default:
                return false;
            }
          };
          Scanner2.prototype.isStrictModeReservedWord = function(id) {
            switch (id) {
              case "implements":
              case "interface":
              case "package":
              case "private":
              case "protected":
              case "public":
              case "static":
              case "yield":
              case "let":
                return true;
              default:
                return false;
            }
          };
          Scanner2.prototype.isRestrictedWord = function(id) {
            return id === "eval" || id === "arguments";
          };
          Scanner2.prototype.isKeyword = function(id) {
            switch (id.length) {
              case 2:
                return id === "if" || id === "in" || id === "do";
              case 3:
                return id === "var" || id === "for" || id === "new" || id === "try" || id === "let";
              case 4:
                return id === "this" || id === "else" || id === "case" || id === "void" || id === "with" || id === "enum";
              case 5:
                return id === "while" || id === "break" || id === "catch" || id === "throw" || id === "const" || id === "yield" || id === "class" || id === "super";
              case 6:
                return id === "return" || id === "typeof" || id === "delete" || id === "switch" || id === "export" || id === "import";
              case 7:
                return id === "default" || id === "finally" || id === "extends";
              case 8:
                return id === "function" || id === "continue" || id === "debugger";
              case 10:
                return id === "instanceof";
              default:
                return false;
            }
          };
          Scanner2.prototype.codePointAt = function(i) {
            var cp = this.source.charCodeAt(i);
            if (cp >= 55296 && cp <= 56319) {
              var second = this.source.charCodeAt(i + 1);
              if (second >= 56320 && second <= 57343) {
                var first = cp;
                cp = (first - 55296) * 1024 + second - 56320 + 65536;
              }
            }
            return cp;
          };
          Scanner2.prototype.scanHexEscape = function(prefix) {
            var len = prefix === "u" ? 4 : 2;
            var code = 0;
            for (var i = 0;i < len; ++i) {
              if (!this.eof() && character_1.Character.isHexDigit(this.source.charCodeAt(this.index))) {
                code = code * 16 + hexValue(this.source[this.index++]);
              } else {
                return null;
              }
            }
            return String.fromCharCode(code);
          };
          Scanner2.prototype.scanUnicodeCodePointEscape = function() {
            var ch = this.source[this.index];
            var code = 0;
            if (ch === "}") {
              this.throwUnexpectedToken();
            }
            while (!this.eof()) {
              ch = this.source[this.index++];
              if (!character_1.Character.isHexDigit(ch.charCodeAt(0))) {
                break;
              }
              code = code * 16 + hexValue(ch);
            }
            if (code > 1114111 || ch !== "}") {
              this.throwUnexpectedToken();
            }
            return character_1.Character.fromCodePoint(code);
          };
          Scanner2.prototype.getIdentifier = function() {
            var start = this.index++;
            while (!this.eof()) {
              var ch = this.source.charCodeAt(this.index);
              if (ch === 92) {
                this.index = start;
                return this.getComplexIdentifier();
              } else if (ch >= 55296 && ch < 57343) {
                this.index = start;
                return this.getComplexIdentifier();
              }
              if (character_1.Character.isIdentifierPart(ch)) {
                ++this.index;
              } else {
                break;
              }
            }
            return this.source.slice(start, this.index);
          };
          Scanner2.prototype.getComplexIdentifier = function() {
            var cp = this.codePointAt(this.index);
            var id = character_1.Character.fromCodePoint(cp);
            this.index += id.length;
            var ch;
            if (cp === 92) {
              if (this.source.charCodeAt(this.index) !== 117) {
                this.throwUnexpectedToken();
              }
              ++this.index;
              if (this.source[this.index] === "{") {
                ++this.index;
                ch = this.scanUnicodeCodePointEscape();
              } else {
                ch = this.scanHexEscape("u");
                if (ch === null || ch === "\\" || !character_1.Character.isIdentifierStart(ch.charCodeAt(0))) {
                  this.throwUnexpectedToken();
                }
              }
              id = ch;
            }
            while (!this.eof()) {
              cp = this.codePointAt(this.index);
              if (!character_1.Character.isIdentifierPart(cp)) {
                break;
              }
              ch = character_1.Character.fromCodePoint(cp);
              id += ch;
              this.index += ch.length;
              if (cp === 92) {
                id = id.substr(0, id.length - 1);
                if (this.source.charCodeAt(this.index) !== 117) {
                  this.throwUnexpectedToken();
                }
                ++this.index;
                if (this.source[this.index] === "{") {
                  ++this.index;
                  ch = this.scanUnicodeCodePointEscape();
                } else {
                  ch = this.scanHexEscape("u");
                  if (ch === null || ch === "\\" || !character_1.Character.isIdentifierPart(ch.charCodeAt(0))) {
                    this.throwUnexpectedToken();
                  }
                }
                id += ch;
              }
            }
            return id;
          };
          Scanner2.prototype.octalToDecimal = function(ch) {
            var octal = ch !== "0";
            var code = octalValue(ch);
            if (!this.eof() && character_1.Character.isOctalDigit(this.source.charCodeAt(this.index))) {
              octal = true;
              code = code * 8 + octalValue(this.source[this.index++]);
              if ("0123".indexOf(ch) >= 0 && !this.eof() && character_1.Character.isOctalDigit(this.source.charCodeAt(this.index))) {
                code = code * 8 + octalValue(this.source[this.index++]);
              }
            }
            return {
              code,
              octal
            };
          };
          Scanner2.prototype.scanIdentifier = function() {
            var type;
            var start = this.index;
            var id = this.source.charCodeAt(start) === 92 ? this.getComplexIdentifier() : this.getIdentifier();
            if (id.length === 1) {
              type = 3;
            } else if (this.isKeyword(id)) {
              type = 4;
            } else if (id === "null") {
              type = 5;
            } else if (id === "true" || id === "false") {
              type = 1;
            } else {
              type = 3;
            }
            if (type !== 3 && start + id.length !== this.index) {
              var restore = this.index;
              this.index = start;
              this.tolerateUnexpectedToken(messages_1.Messages.InvalidEscapedReservedWord);
              this.index = restore;
            }
            return {
              type,
              value: id,
              lineNumber: this.lineNumber,
              lineStart: this.lineStart,
              start,
              end: this.index
            };
          };
          Scanner2.prototype.scanPunctuator = function() {
            var start = this.index;
            var str = this.source[this.index];
            switch (str) {
              case "(":
              case "{":
                if (str === "{") {
                  this.curlyStack.push("{");
                }
                ++this.index;
                break;
              case ".":
                ++this.index;
                if (this.source[this.index] === "." && this.source[this.index + 1] === ".") {
                  this.index += 2;
                  str = "...";
                }
                break;
              case "}":
                ++this.index;
                this.curlyStack.pop();
                break;
              case ")":
              case ";":
              case ",":
              case "[":
              case "]":
              case ":":
              case "?":
              case "~":
                ++this.index;
                break;
              default:
                str = this.source.substr(this.index, 4);
                if (str === ">>>=") {
                  this.index += 4;
                } else {
                  str = str.substr(0, 3);
                  if (str === "===" || str === "!==" || str === ">>>" || str === "<<=" || str === ">>=" || str === "**=") {
                    this.index += 3;
                  } else {
                    str = str.substr(0, 2);
                    if (str === "&&" || str === "||" || str === "==" || str === "!=" || str === "+=" || str === "-=" || str === "*=" || str === "/=" || str === "++" || str === "--" || str === "<<" || str === ">>" || str === "&=" || str === "|=" || str === "^=" || str === "%=" || str === "<=" || str === ">=" || str === "=>" || str === "**") {
                      this.index += 2;
                    } else {
                      str = this.source[this.index];
                      if ("<>=!+-*%&|^/".indexOf(str) >= 0) {
                        ++this.index;
                      }
                    }
                  }
                }
            }
            if (this.index === start) {
              this.throwUnexpectedToken();
            }
            return {
              type: 7,
              value: str,
              lineNumber: this.lineNumber,
              lineStart: this.lineStart,
              start,
              end: this.index
            };
          };
          Scanner2.prototype.scanHexLiteral = function(start) {
            var num = "";
            while (!this.eof()) {
              if (!character_1.Character.isHexDigit(this.source.charCodeAt(this.index))) {
                break;
              }
              num += this.source[this.index++];
            }
            if (num.length === 0) {
              this.throwUnexpectedToken();
            }
            if (character_1.Character.isIdentifierStart(this.source.charCodeAt(this.index))) {
              this.throwUnexpectedToken();
            }
            return {
              type: 6,
              value: parseInt("0x" + num, 16),
              lineNumber: this.lineNumber,
              lineStart: this.lineStart,
              start,
              end: this.index
            };
          };
          Scanner2.prototype.scanBinaryLiteral = function(start) {
            var num = "";
            var ch;
            while (!this.eof()) {
              ch = this.source[this.index];
              if (ch !== "0" && ch !== "1") {
                break;
              }
              num += this.source[this.index++];
            }
            if (num.length === 0) {
              this.throwUnexpectedToken();
            }
            if (!this.eof()) {
              ch = this.source.charCodeAt(this.index);
              if (character_1.Character.isIdentifierStart(ch) || character_1.Character.isDecimalDigit(ch)) {
                this.throwUnexpectedToken();
              }
            }
            return {
              type: 6,
              value: parseInt(num, 2),
              lineNumber: this.lineNumber,
              lineStart: this.lineStart,
              start,
              end: this.index
            };
          };
          Scanner2.prototype.scanOctalLiteral = function(prefix, start) {
            var num = "";
            var octal = false;
            if (character_1.Character.isOctalDigit(prefix.charCodeAt(0))) {
              octal = true;
              num = "0" + this.source[this.index++];
            } else {
              ++this.index;
            }
            while (!this.eof()) {
              if (!character_1.Character.isOctalDigit(this.source.charCodeAt(this.index))) {
                break;
              }
              num += this.source[this.index++];
            }
            if (!octal && num.length === 0) {
              this.throwUnexpectedToken();
            }
            if (character_1.Character.isIdentifierStart(this.source.charCodeAt(this.index)) || character_1.Character.isDecimalDigit(this.source.charCodeAt(this.index))) {
              this.throwUnexpectedToken();
            }
            return {
              type: 6,
              value: parseInt(num, 8),
              octal,
              lineNumber: this.lineNumber,
              lineStart: this.lineStart,
              start,
              end: this.index
            };
          };
          Scanner2.prototype.isImplicitOctalLiteral = function() {
            for (var i = this.index + 1;i < this.length; ++i) {
              var ch = this.source[i];
              if (ch === "8" || ch === "9") {
                return false;
              }
              if (!character_1.Character.isOctalDigit(ch.charCodeAt(0))) {
                return true;
              }
            }
            return true;
          };
          Scanner2.prototype.scanNumericLiteral = function() {
            var start = this.index;
            var ch = this.source[start];
            assert_1.assert(character_1.Character.isDecimalDigit(ch.charCodeAt(0)) || ch === ".", "Numeric literal must start with a decimal digit or a decimal point");
            var num = "";
            if (ch !== ".") {
              num = this.source[this.index++];
              ch = this.source[this.index];
              if (num === "0") {
                if (ch === "x" || ch === "X") {
                  ++this.index;
                  return this.scanHexLiteral(start);
                }
                if (ch === "b" || ch === "B") {
                  ++this.index;
                  return this.scanBinaryLiteral(start);
                }
                if (ch === "o" || ch === "O") {
                  return this.scanOctalLiteral(ch, start);
                }
                if (ch && character_1.Character.isOctalDigit(ch.charCodeAt(0))) {
                  if (this.isImplicitOctalLiteral()) {
                    return this.scanOctalLiteral(ch, start);
                  }
                }
              }
              while (character_1.Character.isDecimalDigit(this.source.charCodeAt(this.index))) {
                num += this.source[this.index++];
              }
              ch = this.source[this.index];
            }
            if (ch === ".") {
              num += this.source[this.index++];
              while (character_1.Character.isDecimalDigit(this.source.charCodeAt(this.index))) {
                num += this.source[this.index++];
              }
              ch = this.source[this.index];
            }
            if (ch === "e" || ch === "E") {
              num += this.source[this.index++];
              ch = this.source[this.index];
              if (ch === "+" || ch === "-") {
                num += this.source[this.index++];
              }
              if (character_1.Character.isDecimalDigit(this.source.charCodeAt(this.index))) {
                while (character_1.Character.isDecimalDigit(this.source.charCodeAt(this.index))) {
                  num += this.source[this.index++];
                }
              } else {
                this.throwUnexpectedToken();
              }
            }
            if (character_1.Character.isIdentifierStart(this.source.charCodeAt(this.index))) {
              this.throwUnexpectedToken();
            }
            return {
              type: 6,
              value: parseFloat(num),
              lineNumber: this.lineNumber,
              lineStart: this.lineStart,
              start,
              end: this.index
            };
          };
          Scanner2.prototype.scanStringLiteral = function() {
            var start = this.index;
            var quote = this.source[start];
            assert_1.assert(quote === "\'" || quote === '"', "String literal must starts with a quote");
            ++this.index;
            var octal = false;
            var str = "";
            while (!this.eof()) {
              var ch = this.source[this.index++];
              if (ch === quote) {
                quote = "";
                break;
              } else if (ch === "\\") {
                ch = this.source[this.index++];
                if (!ch || !character_1.Character.isLineTerminator(ch.charCodeAt(0))) {
                  switch (ch) {
                    case "u":
                      if (this.source[this.index] === "{") {
                        ++this.index;
                        str += this.scanUnicodeCodePointEscape();
                      } else {
                        var unescaped_1 = this.scanHexEscape(ch);
                        if (unescaped_1 === null) {
                          this.throwUnexpectedToken();
                        }
                        str += unescaped_1;
                      }
                      break;
                    case "x":
                      var unescaped = this.scanHexEscape(ch);
                      if (unescaped === null) {
                        this.throwUnexpectedToken(messages_1.Messages.InvalidHexEscapeSequence);
                      }
                      str += unescaped;
                      break;
                    case "n":
                      str += "\n";
                      break;
                    case "r":
                      str += "\r";
                      break;
                    case "t":
                      str += "\t";
                      break;
                    case "b":
                      str += "\b";
                      break;
                    case "f":
                      str += "\f";
                      break;
                    case "v":
                      str += "\v";
                      break;
                    case "8":
                    case "9":
                      str += ch;
                      this.tolerateUnexpectedToken();
                      break;
                    default:
                      if (ch && character_1.Character.isOctalDigit(ch.charCodeAt(0))) {
                        var octToDec = this.octalToDecimal(ch);
                        octal = octToDec.octal || octal;
                        str += String.fromCharCode(octToDec.code);
                      } else {
                        str += ch;
                      }
                      break;
                  }
                } else {
                  ++this.lineNumber;
                  if (ch === "\r" && this.source[this.index] === "\n") {
                    ++this.index;
                  }
                  this.lineStart = this.index;
                }
              } else if (character_1.Character.isLineTerminator(ch.charCodeAt(0))) {
                break;
              } else {
                str += ch;
              }
            }
            if (quote !== "") {
              this.index = start;
              this.throwUnexpectedToken();
            }
            return {
              type: 8,
              value: str,
              octal,
              lineNumber: this.lineNumber,
              lineStart: this.lineStart,
              start,
              end: this.index
            };
          };
          Scanner2.prototype.scanTemplate = function() {
            var cooked = "";
            var terminated = false;
            var start = this.index;
            var head = this.source[start] === "`";
            var tail = false;
            var rawOffset = 2;
            ++this.index;
            while (!this.eof()) {
              var ch = this.source[this.index++];
              if (ch === "`") {
                rawOffset = 1;
                tail = true;
                terminated = true;
                break;
              } else if (ch === "$") {
                if (this.source[this.index] === "{") {
                  this.curlyStack.push("${");
                  ++this.index;
                  terminated = true;
                  break;
                }
                cooked += ch;
              } else if (ch === "\\") {
                ch = this.source[this.index++];
                if (!character_1.Character.isLineTerminator(ch.charCodeAt(0))) {
                  switch (ch) {
                    case "n":
                      cooked += "\n";
                      break;
                    case "r":
                      cooked += "\r";
                      break;
                    case "t":
                      cooked += "\t";
                      break;
                    case "u":
                      if (this.source[this.index] === "{") {
                        ++this.index;
                        cooked += this.scanUnicodeCodePointEscape();
                      } else {
                        var restore = this.index;
                        var unescaped_2 = this.scanHexEscape(ch);
                        if (unescaped_2 !== null) {
                          cooked += unescaped_2;
                        } else {
                          this.index = restore;
                          cooked += ch;
                        }
                      }
                      break;
                    case "x":
                      var unescaped = this.scanHexEscape(ch);
                      if (unescaped === null) {
                        this.throwUnexpectedToken(messages_1.Messages.InvalidHexEscapeSequence);
                      }
                      cooked += unescaped;
                      break;
                    case "b":
                      cooked += "\b";
                      break;
                    case "f":
                      cooked += "\f";
                      break;
                    case "v":
                      cooked += "\v";
                      break;
                    default:
                      if (ch === "0") {
                        if (character_1.Character.isDecimalDigit(this.source.charCodeAt(this.index))) {
                          this.throwUnexpectedToken(messages_1.Messages.TemplateOctalLiteral);
                        }
                        cooked += "\0";
                      } else if (character_1.Character.isOctalDigit(ch.charCodeAt(0))) {
                        this.throwUnexpectedToken(messages_1.Messages.TemplateOctalLiteral);
                      } else {
                        cooked += ch;
                      }
                      break;
                  }
                } else {
                  ++this.lineNumber;
                  if (ch === "\r" && this.source[this.index] === "\n") {
                    ++this.index;
                  }
                  this.lineStart = this.index;
                }
              } else if (character_1.Character.isLineTerminator(ch.charCodeAt(0))) {
                ++this.lineNumber;
                if (ch === "\r" && this.source[this.index] === "\n") {
                  ++this.index;
                }
                this.lineStart = this.index;
                cooked += "\n";
              } else {
                cooked += ch;
              }
            }
            if (!terminated) {
              this.throwUnexpectedToken();
            }
            if (!head) {
              this.curlyStack.pop();
            }
            return {
              type: 10,
              value: this.source.slice(start + 1, this.index - rawOffset),
              cooked,
              head,
              tail,
              lineNumber: this.lineNumber,
              lineStart: this.lineStart,
              start,
              end: this.index
            };
          };
          Scanner2.prototype.testRegExp = function(pattern, flags) {
            var astralSubstitute = "\uFFFF";
            var tmp = pattern;
            var self2 = this;
            if (flags.indexOf("u") >= 0) {
              tmp = tmp.replace(/\\u\{([0-9a-fA-F]+)\}|\\u([a-fA-F0-9]{4})/g, function($0, $1, $2) {
                var codePoint = parseInt($1 || $2, 16);
                if (codePoint > 1114111) {
                  self2.throwUnexpectedToken(messages_1.Messages.InvalidRegExp);
                }
                if (codePoint <= 65535) {
                  return String.fromCharCode(codePoint);
                }
                return astralSubstitute;
              }).replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, astralSubstitute);
            }
            try {
              RegExp(tmp);
            } catch (e) {
              this.throwUnexpectedToken(messages_1.Messages.InvalidRegExp);
            }
            try {
              return new RegExp(pattern, flags);
            } catch (exception) {
              return null;
            }
          };
          Scanner2.prototype.scanRegExpBody = function() {
            var ch = this.source[this.index];
            assert_1.assert(ch === "/", "Regular expression literal must start with a slash");
            var str = this.source[this.index++];
            var classMarker = false;
            var terminated = false;
            while (!this.eof()) {
              ch = this.source[this.index++];
              str += ch;
              if (ch === "\\") {
                ch = this.source[this.index++];
                if (character_1.Character.isLineTerminator(ch.charCodeAt(0))) {
                  this.throwUnexpectedToken(messages_1.Messages.UnterminatedRegExp);
                }
                str += ch;
              } else if (character_1.Character.isLineTerminator(ch.charCodeAt(0))) {
                this.throwUnexpectedToken(messages_1.Messages.UnterminatedRegExp);
              } else if (classMarker) {
                if (ch === "]") {
                  classMarker = false;
                }
              } else {
                if (ch === "/") {
                  terminated = true;
                  break;
                } else if (ch === "[") {
                  classMarker = true;
                }
              }
            }
            if (!terminated) {
              this.throwUnexpectedToken(messages_1.Messages.UnterminatedRegExp);
            }
            return str.substr(1, str.length - 2);
          };
          Scanner2.prototype.scanRegExpFlags = function() {
            var str = "";
            var flags = "";
            while (!this.eof()) {
              var ch = this.source[this.index];
              if (!character_1.Character.isIdentifierPart(ch.charCodeAt(0))) {
                break;
              }
              ++this.index;
              if (ch === "\\" && !this.eof()) {
                ch = this.source[this.index];
                if (ch === "u") {
                  ++this.index;
                  var restore = this.index;
                  var char = this.scanHexEscape("u");
                  if (char !== null) {
                    flags += char;
                    for (str += "\\u";restore < this.index; ++restore) {
                      str += this.source[restore];
                    }
                  } else {
                    this.index = restore;
                    flags += "u";
                    str += "\\u";
                  }
                  this.tolerateUnexpectedToken();
                } else {
                  str += "\\";
                  this.tolerateUnexpectedToken();
                }
              } else {
                flags += ch;
                str += ch;
              }
            }
            return flags;
          };
          Scanner2.prototype.scanRegExp = function() {
            var start = this.index;
            var pattern = this.scanRegExpBody();
            var flags = this.scanRegExpFlags();
            var value = this.testRegExp(pattern, flags);
            return {
              type: 9,
              value: "",
              pattern,
              flags,
              regex: value,
              lineNumber: this.lineNumber,
              lineStart: this.lineStart,
              start,
              end: this.index
            };
          };
          Scanner2.prototype.lex = function() {
            if (this.eof()) {
              return {
                type: 2,
                value: "",
                lineNumber: this.lineNumber,
                lineStart: this.lineStart,
                start: this.index,
                end: this.index
              };
            }
            var cp = this.source.charCodeAt(this.index);
            if (character_1.Character.isIdentifierStart(cp)) {
              return this.scanIdentifier();
            }
            if (cp === 40 || cp === 41 || cp === 59) {
              return this.scanPunctuator();
            }
            if (cp === 39 || cp === 34) {
              return this.scanStringLiteral();
            }
            if (cp === 46) {
              if (character_1.Character.isDecimalDigit(this.source.charCodeAt(this.index + 1))) {
                return this.scanNumericLiteral();
              }
              return this.scanPunctuator();
            }
            if (character_1.Character.isDecimalDigit(cp)) {
              return this.scanNumericLiteral();
            }
            if (cp === 96 || cp === 125 && this.curlyStack[this.curlyStack.length - 1] === "${") {
              return this.scanTemplate();
            }
            if (cp >= 55296 && cp < 57343) {
              if (character_1.Character.isIdentifierStart(this.codePointAt(this.index))) {
                return this.scanIdentifier();
              }
            }
            return this.scanPunctuator();
          };
          return Scanner2;
        }();
        exports2.Scanner = Scanner;
      },
      function(module2, exports2) {
        Object.defineProperty(exports2, "__esModule", { value: true });
        exports2.TokenName = {};
        exports2.TokenName[1] = "Boolean";
        exports2.TokenName[2] = "<end>";
        exports2.TokenName[3] = "Identifier";
        exports2.TokenName[4] = "Keyword";
        exports2.TokenName[5] = "Null";
        exports2.TokenName[6] = "Numeric";
        exports2.TokenName[7] = "Punctuator";
        exports2.TokenName[8] = "String";
        exports2.TokenName[9] = "RegularExpression";
        exports2.TokenName[10] = "Template";
      },
      function(module2, exports2) {
        Object.defineProperty(exports2, "__esModule", { value: true });
        exports2.XHTMLEntities = {
          quot: '"',
          amp: "&",
          apos: "'",
          gt: ">",
          nbsp: "\xA0",
          iexcl: "\xA1",
          cent: "\xA2",
          pound: "\xA3",
          curren: "\xA4",
          yen: "\xA5",
          brvbar: "\xA6",
          sect: "\xA7",
          uml: "\xA8",
          copy: "\xA9",
          ordf: "\xAA",
          laquo: "\xAB",
          not: "\xAC",
          shy: "\xAD",
          reg: "\xAE",
          macr: "\xAF",
          deg: "\xB0",
          plusmn: "\xB1",
          sup2: "\xB2",
          sup3: "\xB3",
          acute: "\xB4",
          micro: "\xB5",
          para: "\xB6",
          middot: "\xB7",
          cedil: "\xB8",
          sup1: "\xB9",
          ordm: "\xBA",
          raquo: "\xBB",
          frac14: "\xBC",
          frac12: "\xBD",
          frac34: "\xBE",
          iquest: "\xBF",
          Agrave: "\xC0",
          Aacute: "\xC1",
          Acirc: "\xC2",
          Atilde: "\xC3",
          Auml: "\xC4",
          Aring: "\xC5",
          AElig: "\xC6",
          Ccedil: "\xC7",
          Egrave: "\xC8",
          Eacute: "\xC9",
          Ecirc: "\xCA",
          Euml: "\xCB",
          Igrave: "\xCC",
          Iacute: "\xCD",
          Icirc: "\xCE",
          Iuml: "\xCF",
          ETH: "\xD0",
          Ntilde: "\xD1",
          Ograve: "\xD2",
          Oacute: "\xD3",
          Ocirc: "\xD4",
          Otilde: "\xD5",
          Ouml: "\xD6",
          times: "\xD7",
          Oslash: "\xD8",
          Ugrave: "\xD9",
          Uacute: "\xDA",
          Ucirc: "\xDB",
          Uuml: "\xDC",
          Yacute: "\xDD",
          THORN: "\xDE",
          szlig: "\xDF",
          agrave: "\xE0",
          aacute: "\xE1",
          acirc: "\xE2",
          atilde: "\xE3",
          auml: "\xE4",
          aring: "\xE5",
          aelig: "\xE6",
          ccedil: "\xE7",
          egrave: "\xE8",
          eacute: "\xE9",
          ecirc: "\xEA",
          euml: "\xEB",
          igrave: "\xEC",
          iacute: "\xED",
          icirc: "\xEE",
          iuml: "\xEF",
          eth: "\xF0",
          ntilde: "\xF1",
          ograve: "\xF2",
          oacute: "\xF3",
          ocirc: "\xF4",
          otilde: "\xF5",
          ouml: "\xF6",
          divide: "\xF7",
          oslash: "\xF8",
          ugrave: "\xF9",
          uacute: "\xFA",
          ucirc: "\xFB",
          uuml: "\xFC",
          yacute: "\xFD",
          thorn: "\xFE",
          yuml: "\xFF",
          OElig: "\u0152",
          oelig: "\u0153",
          Scaron: "\u0160",
          scaron: "\u0161",
          Yuml: "\u0178",
          fnof: "\u0192",
          circ: "\u02C6",
          tilde: "\u02DC",
          Alpha: "\u0391",
          Beta: "\u0392",
          Gamma: "\u0393",
          Delta: "\u0394",
          Epsilon: "\u0395",
          Zeta: "\u0396",
          Eta: "\u0397",
          Theta: "\u0398",
          Iota: "\u0399",
          Kappa: "\u039A",
          Lambda: "\u039B",
          Mu: "\u039C",
          Nu: "\u039D",
          Xi: "\u039E",
          Omicron: "\u039F",
          Pi: "\u03A0",
          Rho: "\u03A1",
          Sigma: "\u03A3",
          Tau: "\u03A4",
          Upsilon: "\u03A5",
          Phi: "\u03A6",
          Chi: "\u03A7",
          Psi: "\u03A8",
          Omega: "\u03A9",
          alpha: "\u03B1",
          beta: "\u03B2",
          gamma: "\u03B3",
          delta: "\u03B4",
          epsilon: "\u03B5",
          zeta: "\u03B6",
          eta: "\u03B7",
          theta: "\u03B8",
          iota: "\u03B9",
          kappa: "\u03BA",
          lambda: "\u03BB",
          mu: "\u03BC",
          nu: "\u03BD",
          xi: "\u03BE",
          omicron: "\u03BF",
          pi: "\u03C0",
          rho: "\u03C1",
          sigmaf: "\u03C2",
          sigma: "\u03C3",
          tau: "\u03C4",
          upsilon: "\u03C5",
          phi: "\u03C6",
          chi: "\u03C7",
          psi: "\u03C8",
          omega: "\u03C9",
          thetasym: "\u03D1",
          upsih: "\u03D2",
          piv: "\u03D6",
          ensp: "\u2002",
          emsp: "\u2003",
          thinsp: "\u2009",
          zwnj: "\u200C",
          zwj: "\u200D",
          lrm: "\u200E",
          rlm: "\u200F",
          ndash: "\u2013",
          mdash: "\u2014",
          lsquo: "\u2018",
          rsquo: "\u2019",
          sbquo: "\u201A",
          ldquo: "\u201C",
          rdquo: "\u201D",
          bdquo: "\u201E",
          dagger: "\u2020",
          Dagger: "\u2021",
          bull: "\u2022",
          hellip: "\u2026",
          permil: "\u2030",
          prime: "\u2032",
          Prime: "\u2033",
          lsaquo: "\u2039",
          rsaquo: "\u203A",
          oline: "\u203E",
          frasl: "\u2044",
          euro: "\u20AC",
          image: "\u2111",
          weierp: "\u2118",
          real: "\u211C",
          trade: "\u2122",
          alefsym: "\u2135",
          larr: "\u2190",
          uarr: "\u2191",
          rarr: "\u2192",
          darr: "\u2193",
          harr: "\u2194",
          crarr: "\u21B5",
          lArr: "\u21D0",
          uArr: "\u21D1",
          rArr: "\u21D2",
          dArr: "\u21D3",
          hArr: "\u21D4",
          forall: "\u2200",
          part: "\u2202",
          exist: "\u2203",
          empty: "\u2205",
          nabla: "\u2207",
          isin: "\u2208",
          notin: "\u2209",
          ni: "\u220B",
          prod: "\u220F",
          sum: "\u2211",
          minus: "\u2212",
          lowast: "\u2217",
          radic: "\u221A",
          prop: "\u221D",
          infin: "\u221E",
          ang: "\u2220",
          and: "\u2227",
          or: "\u2228",
          cap: "\u2229",
          cup: "\u222A",
          int: "\u222B",
          there4: "\u2234",
          sim: "\u223C",
          cong: "\u2245",
          asymp: "\u2248",
          ne: "\u2260",
          equiv: "\u2261",
          le: "\u2264",
          ge: "\u2265",
          sub: "\u2282",
          sup: "\u2283",
          nsub: "\u2284",
          sube: "\u2286",
          supe: "\u2287",
          oplus: "\u2295",
          otimes: "\u2297",
          perp: "\u22A5",
          sdot: "\u22C5",
          lceil: "\u2308",
          rceil: "\u2309",
          lfloor: "\u230A",
          rfloor: "\u230B",
          loz: "\u25CA",
          spades: "\u2660",
          clubs: "\u2663",
          hearts: "\u2665",
          diams: "\u2666",
          lang: "\u27E8",
          rang: "\u27E9"
        };
      },
      function(module2, exports2, __webpack_require__) {
        Object.defineProperty(exports2, "__esModule", { value: true });
        var error_handler_1 = __webpack_require__(10);
        var scanner_1 = __webpack_require__(12);
        var token_1 = __webpack_require__(13);
        var Reader = function() {
          function Reader2() {
            this.values = [];
            this.curly = this.paren = -1;
          }
          Reader2.prototype.beforeFunctionExpression = function(t) {
            return [
              "(",
              "{",
              "[",
              "in",
              "typeof",
              "instanceof",
              "new",
              "return",
              "case",
              "delete",
              "throw",
              "void",
              "=",
              "+=",
              "-=",
              "*=",
              "**=",
              "/=",
              "%=",
              "<<=",
              ">>=",
              ">>>=",
              "&=",
              "|=",
              "^=",
              ",",
              "+",
              "-",
              "*",
              "**",
              "/",
              "%",
              "++",
              "--",
              "<<",
              ">>",
              ">>>",
              "&",
              "|",
              "^",
              "!",
              "~",
              "&&",
              "||",
              "?",
              ":",
              "===",
              "==",
              ">=",
              "<=",
              "<",
              ">",
              "!=",
              "!=="
            ].indexOf(t) >= 0;
          };
          Reader2.prototype.isRegexStart = function() {
            var previous = this.values[this.values.length - 1];
            var regex = previous !== null;
            switch (previous) {
              case "this":
              case "]":
                regex = false;
                break;
              case ")":
                var keyword = this.values[this.paren - 1];
                regex = keyword === "if" || keyword === "while" || keyword === "for" || keyword === "with";
                break;
              case "}":
                regex = false;
                if (this.values[this.curly - 3] === "function") {
                  var check = this.values[this.curly - 4];
                  regex = check ? !this.beforeFunctionExpression(check) : false;
                } else if (this.values[this.curly - 4] === "function") {
                  var check = this.values[this.curly - 5];
                  regex = check ? !this.beforeFunctionExpression(check) : true;
                }
                break;
              default:
                break;
            }
            return regex;
          };
          Reader2.prototype.push = function(token) {
            if (token.type === 7 || token.type === 4) {
              if (token.value === "{") {
                this.curly = this.values.length;
              } else if (token.value === "(") {
                this.paren = this.values.length;
              }
              this.values.push(token.value);
            } else {
              this.values.push(null);
            }
          };
          return Reader2;
        }();
        var Tokenizer = function() {
          function Tokenizer2(code, config) {
            this.errorHandler = new error_handler_1.ErrorHandler;
            this.errorHandler.tolerant = config ? typeof config.tolerant === "boolean" && config.tolerant : false;
            this.scanner = new scanner_1.Scanner(code, this.errorHandler);
            this.scanner.trackComment = config ? typeof config.comment === "boolean" && config.comment : false;
            this.trackRange = config ? typeof config.range === "boolean" && config.range : false;
            this.trackLoc = config ? typeof config.loc === "boolean" && config.loc : false;
            this.buffer = [];
            this.reader = new Reader;
          }
          Tokenizer2.prototype.errors = function() {
            return this.errorHandler.errors;
          };
          Tokenizer2.prototype.getNextToken = function() {
            if (this.buffer.length === 0) {
              var comments = this.scanner.scanComments();
              if (this.scanner.trackComment) {
                for (var i = 0;i < comments.length; ++i) {
                  var e = comments[i];
                  var value = this.scanner.source.slice(e.slice[0], e.slice[1]);
                  var comment = {
                    type: e.multiLine ? "BlockComment" : "LineComment",
                    value
                  };
                  if (this.trackRange) {
                    comment.range = e.range;
                  }
                  if (this.trackLoc) {
                    comment.loc = e.loc;
                  }
                  this.buffer.push(comment);
                }
              }
              if (!this.scanner.eof()) {
                var loc = undefined;
                if (this.trackLoc) {
                  loc = {
                    start: {
                      line: this.scanner.lineNumber,
                      column: this.scanner.index - this.scanner.lineStart
                    },
                    end: {}
                  };
                }
                var startRegex = this.scanner.source[this.scanner.index] === "/" && this.reader.isRegexStart();
                var token = startRegex ? this.scanner.scanRegExp() : this.scanner.lex();
                this.reader.push(token);
                var entry = {
                  type: token_1.TokenName[token.type],
                  value: this.scanner.source.slice(token.start, token.end)
                };
                if (this.trackRange) {
                  entry.range = [token.start, token.end];
                }
                if (this.trackLoc) {
                  loc.end = {
                    line: this.scanner.lineNumber,
                    column: this.scanner.index - this.scanner.lineStart
                  };
                  entry.loc = loc;
                }
                if (token.type === 9) {
                  var pattern = token.pattern;
                  var flags = token.flags;
                  entry.regex = { pattern, flags };
                }
                this.buffer.push(entry);
              }
            }
            return this.buffer.shift();
          };
          return Tokenizer2;
        }();
        exports2.Tokenizer = Tokenizer;
      }
    ]);
  });
});

// node_modules/redeyed/redeyed.js
var require_redeyed = __commonJS((exports, module) => {
  (function() {
    var esprima;
    var exportFn;
    var toString2 = Object.prototype.toString;
    if (typeof module === "object" && typeof exports === "object" && typeof require === "function") {
      esprima = require_esprima();
      exportFn = function(redeyed) {
        module.exports = redeyed;
      };
      bootstrap(esprima, exportFn);
    } else if (typeof define === "function" && define.amd) {
      define(["esprima"], function(esprima2) {
        return bootstrap(esprima2);
      });
    } else if (typeof window === "object") {
      window.redeyed = bootstrap(window.esprima);
    }
    function bootstrap(esprima2, exportFn2) {
      function isFunction(obj) {
        return toString2.call(obj) === "[object Function]";
      }
      function isString(obj) {
        return toString2.call(obj) === "[object String]";
      }
      function isObject(obj) {
        return toString2.call(obj) === "[object Object]";
      }
      function surroundWith(before, after) {
        return function(s) {
          return before + s + after;
        };
      }
      function isNonCircular(key) {
        return key !== "_parent";
      }
      function objectizeString(value) {
        var vals = value.split(":");
        if (vals.length === 0 || vals.length > 2) {
          throw new Error("illegal string config: " + value + '\nShould be of format "before:after"');
        }
        if (vals.length === 1 || vals[1].length === 0) {
          return vals.indexOf(":") < 0 ? { _before: vals[0] } : { _after: vals[0] };
        } else {
          return { _before: vals[0], _after: vals[1] };
        }
      }
      function objectize(node) {
        function resolve(value, key) {
          if (!value._parent)
            return;
          if (value._parent._default && value._parent._default[key])
            return value._parent._default[key];
          var root = value._parent._parent;
          if (!root)
            return;
          return root._default ? root._default[key] : undefined;
        }
        function process2(key) {
          var value = node[key];
          if (!value)
            return;
          if (isFunction(value))
            return;
          if (isString(value)) {
            node[key] = value = objectizeString(value);
          }
          value._parent = node;
          if (isObject(value)) {
            if (!value._before && !value._after)
              return objectize(value);
            value._before = value._before || resolve(value, "_before");
            value._after = value._after || resolve(value, "_after");
            return;
          }
          throw new Error("nodes need to be either {String}, {Object} or {Function}." + value + " is neither.");
        }
        if (node._default)
          process2("_default");
        Object.keys(node).filter(function(key) {
          return isNonCircular(key) && node.hasOwnProperty(key) && key !== "_before" && key !== "_after" && key !== "_default";
        }).forEach(process2);
      }
      function functionize(node) {
        Object.keys(node).filter(function(key) {
          return isNonCircular(key) && node.hasOwnProperty(key);
        }).forEach(function(key) {
          var value = node[key];
          if (isFunction(value))
            return;
          if (isObject(value)) {
            if (!value._before && !value._after)
              return functionize(value);
            var before = value._before || "";
            var after = value._after || "";
            node[key] = surroundWith(before, after);
            return node[key];
          }
        });
      }
      function normalize(root) {
        objectize(root);
        functionize(root);
      }
      function mergeTokensAndComments(tokens, comments) {
        var all = {};
        function addToAllByRangeStart(t) {
          all[t.range[0]] = t;
        }
        tokens.forEach(addToAllByRangeStart);
        comments.forEach(addToAllByRangeStart);
        return Object.keys(all).map(function(k) {
          return all[k];
        });
      }
      function redeyed(code, config, opts) {
        opts = opts || {};
        var parser2 = opts.parser || esprima2;
        var jsx = !!opts.jsx;
        var buildAst = jsx || !!opts.buildAst;
        var hashbang = "";
        var ast;
        var tokens;
        var comments;
        var lastSplitEnd = 0;
        var splits = [];
        var transformedCode;
        var all;
        var info;
        if (code[0] === "#" && code[1] === "!") {
          hashbang = code.substr(0, code.indexOf("\n") + 1);
          code = Array.apply(0, Array(hashbang.length)).join(" ") + "\n" + code.substr(hashbang.length);
        }
        if (buildAst) {
          ast = parser2.parse(code, { tokens: true, comment: true, range: true, loc: true, tolerant: true, jsx: true });
          tokens = ast.tokens;
          comments = ast.comments;
        } else {
          tokens = [];
          comments = [];
          parser2.tokenize(code, { range: true, loc: true, comment: true }, function(token2) {
            if (token2.type === "LineComment") {
              token2.type = "Line";
              comments.push(token2);
            } else if (token2.type === "BlockComment") {
              token2.type = "Block";
              comments.push(token2);
            } else {
              if (token2.type === "Identifier" && token2.value === "static")
                token2.type = "Keyword";
              tokens.push(token2);
            }
          });
        }
        normalize(config);
        function tokenIndex(tokens2, tkn, start2) {
          var current;
          var rangeStart = tkn.range[0];
          for (current = start2;current < tokens2.length; current++) {
            if (tokens2[current].range[0] === rangeStart)
              return current;
          }
          throw new Error("Token %s not found at or after index: %d", tkn, start2);
        }
        function process2(surround2) {
          var result;
          var currentIndex;
          var nextIndex;
          var skip = 0;
          var splitEnd;
          result = surround2(code.slice(start, end), info);
          if (isObject(result)) {
            splits.push(result.replacement);
            currentIndex = info.tokenIndex;
            nextIndex = tokenIndex(info.tokens, result.skipPastToken, currentIndex);
            skip = nextIndex - currentIndex;
            splitEnd = skip > 0 ? tokens[nextIndex - 1].range[1] : end;
          } else {
            splits.push(result);
            splitEnd = end;
          }
          return { skip, splitEnd };
        }
        function addSplit(start2, end2, surround2, info2) {
          var result;
          var skip = 0;
          if (start2 >= end2)
            return;
          if (surround2) {
            result = process2(surround2);
            skip = result.skip;
            lastSplitEnd = result.splitEnd;
          } else {
            splits.push(code.slice(start2, end2));
            lastSplitEnd = end2;
          }
          return skip;
        }
        all = mergeTokensAndComments(tokens, comments);
        for (var tokenIdx = 0;tokenIdx < all.length; tokenIdx++) {
          var token = all[tokenIdx];
          var surroundForType = config[token.type];
          var surround;
          var start;
          var end;
          if (surroundForType) {
            surround = surroundForType && surroundForType.hasOwnProperty(token.value) && surroundForType[token.value] && isFunction(surroundForType[token.value]) ? surroundForType[token.value] : surroundForType._default;
            start = token.range[0];
            end = token.range[1];
            addSplit(lastSplitEnd, start);
            info = { tokenIndex: tokenIdx, tokens: all, ast, code };
            tokenIdx += addSplit(start, end, surround, info);
          }
        }
        if (lastSplitEnd < code.length) {
          addSplit(lastSplitEnd, code.length);
        }
        if (!opts.nojoin) {
          transformedCode = splits.join("");
          if (hashbang.length > 0) {
            transformedCode = hashbang + transformedCode.substr(hashbang.length);
          }
        }
        return {
          ast,
          tokens,
          comments,
          splits,
          code: transformedCode
        };
      }
      return exportFn2 ? exportFn2(redeyed) : redeyed;
    }
  })();
});

// node_modules/ansicolors/ansicolors.js
var require_ansicolors = __commonJS((exports, module) => {
  var colorNums = {
    white: 37,
    black: 30,
    blue: 34,
    cyan: 36,
    green: 32,
    magenta: 35,
    red: 31,
    yellow: 33,
    brightBlack: 90,
    brightRed: 91,
    brightGreen: 92,
    brightYellow: 93,
    brightBlue: 94,
    brightMagenta: 95,
    brightCyan: 96,
    brightWhite: 97
  };
  var backgroundColorNums = {
    bgBlack: 40,
    bgRed: 41,
    bgGreen: 42,
    bgYellow: 43,
    bgBlue: 44,
    bgMagenta: 45,
    bgCyan: 46,
    bgWhite: 47,
    bgBrightBlack: 100,
    bgBrightRed: 101,
    bgBrightGreen: 102,
    bgBrightYellow: 103,
    bgBrightBlue: 104,
    bgBrightMagenta: 105,
    bgBrightCyan: 106,
    bgBrightWhite: 107
  };
  var open = {};
  var close = {};
  var colors = {};
  Object.keys(colorNums).forEach(function(k) {
    var o = open[k] = "\x1B[" + colorNums[k] + "m";
    var c = close[k] = "\x1B[39m";
    colors[k] = function(s) {
      return o + s + c;
    };
  });
  Object.keys(backgroundColorNums).forEach(function(k) {
    var o = open[k] = "\x1B[" + backgroundColorNums[k] + "m";
    var c = close[k] = "\x1B[49m";
    colors[k] = function(s) {
      return o + s + c;
    };
  });
  module.exports = colors;
  colors.open = open;
  colors.close = close;
});

// node_modules/cardinal/themes/default.js
var require_default = __commonJS((exports, module) => {
  var colors = require_ansicolors();
  module.exports = {
    Boolean: {
      true: undefined,
      false: undefined,
      _default: colors.brightRed
    },
    Identifier: {
      undefined: colors.brightBlack,
      self: colors.brightRed,
      console: colors.blue,
      log: colors.blue,
      warn: colors.red,
      error: colors.brightRed,
      _default: colors.white
    },
    Null: {
      _default: colors.brightBlack
    },
    Numeric: {
      _default: colors.blue
    },
    String: {
      _default: function(s, info) {
        var nextToken = info.tokens[info.tokenIndex + 1];
        return nextToken && nextToken.type === "Punctuator" && nextToken.value === ":" ? colors.green(s) : colors.brightGreen(s);
      }
    },
    Keyword: {
      break: undefined,
      case: undefined,
      catch: colors.cyan,
      class: undefined,
      const: undefined,
      continue: undefined,
      debugger: undefined,
      default: undefined,
      delete: colors.red,
      do: undefined,
      else: undefined,
      enum: undefined,
      export: undefined,
      extends: undefined,
      finally: colors.cyan,
      for: undefined,
      function: undefined,
      if: undefined,
      implements: undefined,
      import: undefined,
      in: undefined,
      instanceof: undefined,
      let: undefined,
      new: colors.red,
      package: undefined,
      private: undefined,
      protected: undefined,
      public: undefined,
      return: colors.red,
      static: undefined,
      super: undefined,
      switch: undefined,
      this: colors.brightRed,
      throw: undefined,
      try: colors.cyan,
      typeof: undefined,
      var: colors.green,
      void: undefined,
      while: undefined,
      with: undefined,
      yield: undefined,
      _default: colors.brightBlue
    },
    Punctuator: {
      ";": colors.brightBlack,
      ".": colors.green,
      ",": colors.green,
      "{": colors.yellow,
      "}": colors.yellow,
      "(": colors.brightBlack,
      ")": colors.brightBlack,
      "[": colors.yellow,
      "]": colors.yellow,
      "<": undefined,
      ">": undefined,
      "+": undefined,
      "-": undefined,
      "*": undefined,
      "%": undefined,
      "&": undefined,
      "|": undefined,
      "^": undefined,
      "!": undefined,
      "~": undefined,
      "?": undefined,
      ":": undefined,
      "=": undefined,
      "<=": undefined,
      ">=": undefined,
      "==": undefined,
      "!=": undefined,
      "++": undefined,
      "--": undefined,
      "<<": undefined,
      ">>": undefined,
      "&&": undefined,
      "||": undefined,
      "+=": undefined,
      "-=": undefined,
      "*=": undefined,
      "%=": undefined,
      "&=": undefined,
      "|=": undefined,
      "^=": undefined,
      "/=": undefined,
      "=>": undefined,
      "**": undefined,
      "===": undefined,
      "!==": undefined,
      ">>>": undefined,
      "<<=": undefined,
      ">>=": undefined,
      "...": undefined,
      "**=": undefined,
      ">>>=": undefined,
      _default: colors.brightYellow
    },
    Line: {
      _default: colors.brightBlack
    },
    Block: {
      _default: colors.brightBlack
    },
    JSXAttribute: {
      _default: colors.magenta
    },
    JSXClosingElement: {
      _default: colors.magenta
    },
    JSXElement: {
      _default: colors.magenta
    },
    JSXEmptyExpression: {
      _default: colors.magenta
    },
    JSXExpressionContainer: {
      _default: colors.magenta
    },
    JSXIdentifier: {
      className: colors.blue,
      _default: colors.magenta
    },
    JSXMemberExpression: {
      _default: colors.magenta
    },
    JSXNamespacedName: {
      _default: colors.magenta
    },
    JSXOpeningElement: {
      _default: colors.magenta
    },
    JSXSpreadAttribute: {
      _default: colors.magenta
    },
    JSXText: {
      _default: colors.brightGreen
    },
    _default: undefined
  };
});

// node_modules/cardinal/lib/highlight.js
var require_highlight = __commonJS((exports, module) => {
  var trimEmptyLines = function(lines) {
    var line = lines.pop();
    while (!line || !line.length) {
      line = lines.pop();
    }
    if (line)
      lines.push(line);
  };
  var addLinenos = function(highlightedCode, firstline) {
    var highlightedLines = highlightedCode.split("\n");
    trimEmptyLines(highlightedLines);
    var linesLen = highlightedLines.length;
    var lines = [];
    var totalDigits;
    var lineno;
    function getDigits(n) {
      if (n < 10)
        return 1;
      if (n < 100)
        return 2;
      if (n < 1000)
        return 3;
      if (n < 1e4)
        return 4;
      return 5;
    }
    function pad(n, totalDigits2) {
      var padDigits = totalDigits2 - getDigits(n);
      switch (padDigits) {
        case 0:
          return "" + n;
        case 1:
          return " " + n;
        case 2:
          return "  " + n;
        case 3:
          return "   " + n;
        case 4:
          return "    " + n;
        case 5:
          return "     " + n;
      }
    }
    totalDigits = getDigits(linesLen + firstline - 1);
    for (var i = 0;i < linesLen; i++) {
      lineno = colorSurround(pad(i + firstline, totalDigits) + ": ").replace(surroundClose, "");
      lines.push(lineno + highlightedLines[i]);
    }
    return lines.join("\n");
  };
  var redeyed = require_redeyed();
  var theme = require_default();
  var colors = require_ansicolors();
  var colorSurround = colors.brightBlack;
  var surroundClose = "\x1B[39m";
  module.exports = function highlight(code, opts) {
    opts = opts || {};
    try {
      var result = redeyed(code, opts.theme || theme, { jsx: !!opts.jsx });
      var firstline = opts.firstline && !isNaN(opts.firstline) ? opts.firstline : 1;
      return opts.linenos ? addLinenos(result.code, firstline) : result.code;
    } catch (e) {
      e.message = "Unable to perform highlight. The code contained syntax errors: " + e.message;
      throw e;
    }
  };
});

// node_modules/cardinal/lib/highlightFile.js
var require_highlightFile = __commonJS((exports, module) => {
  var isFunction = function(obj) {
    return toString.call(obj) === "[object Function]";
  };
  var fs = import.meta.require("fs");
  var highlight = require_highlight();
  module.exports = function highlightFile(fullPath, opts, cb) {
    if (isFunction(opts)) {
      cb = opts;
      opts = {};
    }
    opts = opts || {};
    fs.readFile(fullPath, "utf-8", function(err, code) {
      if (err)
        return cb(err);
      try {
        cb(null, highlight(code, opts));
      } catch (e) {
        cb(e);
      }
    });
  };
});

// node_modules/cardinal/lib/highlightFileSync.js
var require_highlightFileSync = __commonJS((exports, module) => {
  var fs = import.meta.require("fs");
  var highlight = require_highlight();
  module.exports = function highlightFileSync(fullPath, opts) {
    var code = fs.readFileSync(fullPath, "utf-8");
    opts = opts || {};
    return highlight(code, opts);
  };
});

// node_modules/cardinal/cardinal.js
var require_cardinal = __commonJS((exports, module) => {
  module.exports = {
    highlight: require_highlight(),
    highlightFile: require_highlightFile(),
    highlightFileSync: require_highlightFileSync()
  };
});

// node_modules/@sindresorhus/is/dist/index.js
var require_dist = __commonJS((exports, module) => {
  var isTypedArrayName = function(name) {
    return typedArrayTypeNames.includes(name);
  };
  var isObjectTypeName = function(name) {
    return objectTypeNames.includes(name);
  };
  var isPrimitiveTypeName = function(name) {
    return primitiveTypeNames.includes(name);
  };
  var isOfType = function(type) {
    return (value) => typeof value === type;
  };
  var is = function(value) {
    if (value === null) {
      return "null";
    }
    switch (typeof value) {
      case "undefined":
        return "undefined";
      case "string":
        return "string";
      case "number":
        return "number";
      case "boolean":
        return "boolean";
      case "function":
        return "Function";
      case "bigint":
        return "bigint";
      case "symbol":
        return "symbol";
      default:
    }
    if (is.observable(value)) {
      return "Observable";
    }
    if (is.array(value)) {
      return "Array";
    }
    if (is.buffer(value)) {
      return "Buffer";
    }
    const tagType = getObjectType(value);
    if (tagType) {
      return tagType;
    }
    if (value instanceof String || value instanceof Boolean || value instanceof Number) {
      throw new TypeError("Please don\'t use object wrappers for primitive types");
    }
    return "Object";
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  var typedArrayTypeNames = [
    "Int8Array",
    "Uint8Array",
    "Uint8ClampedArray",
    "Int16Array",
    "Uint16Array",
    "Int32Array",
    "Uint32Array",
    "Float32Array",
    "Float64Array",
    "BigInt64Array",
    "BigUint64Array"
  ];
  var objectTypeNames = [
    "Function",
    "Generator",
    "AsyncGenerator",
    "GeneratorFunction",
    "AsyncGeneratorFunction",
    "AsyncFunction",
    "Observable",
    "Array",
    "Buffer",
    "Object",
    "RegExp",
    "Date",
    "Error",
    "Map",
    "Set",
    "WeakMap",
    "WeakSet",
    "ArrayBuffer",
    "SharedArrayBuffer",
    "DataView",
    "Promise",
    "URL",
    "HTMLElement",
    ...typedArrayTypeNames
  ];
  var primitiveTypeNames = [
    "null",
    "undefined",
    "string",
    "number",
    "bigint",
    "boolean",
    "symbol"
  ];
  var { toString: toString2 } = Object.prototype;
  var getObjectType = (value) => {
    const objectTypeName = toString2.call(value).slice(8, -1);
    if (/HTML\w+Element/.test(objectTypeName) && is.domElement(value)) {
      return "HTMLElement";
    }
    if (isObjectTypeName(objectTypeName)) {
      return objectTypeName;
    }
    return;
  };
  var isObjectOfType = (type) => (value) => getObjectType(value) === type;
  is.undefined = isOfType("undefined");
  is.string = isOfType("string");
  var isNumberType = isOfType("number");
  is.number = (value) => isNumberType(value) && !is.nan(value);
  is.bigint = isOfType("bigint");
  is.function_ = isOfType("function");
  is.null_ = (value) => value === null;
  is.class_ = (value) => is.function_(value) && value.toString().startsWith("class ");
  is.boolean = (value) => value === true || value === false;
  is.symbol = isOfType("symbol");
  is.numericString = (value) => is.string(value) && !is.emptyStringOrWhitespace(value) && !Number.isNaN(Number(value));
  is.array = (value, assertion) => {
    if (!Array.isArray(value)) {
      return false;
    }
    if (!is.function_(assertion)) {
      return true;
    }
    return value.every(assertion);
  };
  is.buffer = (value) => {
    var _a2, _b, _c, _d;
    return (_d = (_c = (_b = (_a2 = value) === null || _a2 === undefined ? undefined : _a2.constructor) === null || _b === undefined ? undefined : _b.isBuffer) === null || _c === undefined ? undefined : _c.call(_b, value)) !== null && _d !== undefined ? _d : false;
  };
  is.nullOrUndefined = (value) => is.null_(value) || is.undefined(value);
  is.object = (value) => !is.null_(value) && (typeof value === "object" || is.function_(value));
  is.iterable = (value) => {
    var _a2;
    return is.function_((_a2 = value) === null || _a2 === undefined ? undefined : _a2[Symbol.iterator]);
  };
  is.asyncIterable = (value) => {
    var _a2;
    return is.function_((_a2 = value) === null || _a2 === undefined ? undefined : _a2[Symbol.asyncIterator]);
  };
  is.generator = (value) => is.iterable(value) && is.function_(value.next) && is.function_(value.throw);
  is.asyncGenerator = (value) => is.asyncIterable(value) && is.function_(value.next) && is.function_(value.throw);
  is.nativePromise = (value) => isObjectOfType("Promise")(value);
  var hasPromiseAPI = (value) => {
    var _a2, _b;
    return is.function_((_a2 = value) === null || _a2 === undefined ? undefined : _a2.then) && is.function_((_b = value) === null || _b === undefined ? undefined : _b.catch);
  };
  is.promise = (value) => is.nativePromise(value) || hasPromiseAPI(value);
  is.generatorFunction = isObjectOfType("GeneratorFunction");
  is.asyncGeneratorFunction = (value) => getObjectType(value) === "AsyncGeneratorFunction";
  is.asyncFunction = (value) => getObjectType(value) === "AsyncFunction";
  is.boundFunction = (value) => is.function_(value) && !value.hasOwnProperty("prototype");
  is.regExp = isObjectOfType("RegExp");
  is.date = isObjectOfType("Date");
  is.error = isObjectOfType("Error");
  is.map = (value) => isObjectOfType("Map")(value);
  is.set = (value) => isObjectOfType("Set")(value);
  is.weakMap = (value) => isObjectOfType("WeakMap")(value);
  is.weakSet = (value) => isObjectOfType("WeakSet")(value);
  is.int8Array = isObjectOfType("Int8Array");
  is.uint8Array = isObjectOfType("Uint8Array");
  is.uint8ClampedArray = isObjectOfType("Uint8ClampedArray");
  is.int16Array = isObjectOfType("Int16Array");
  is.uint16Array = isObjectOfType("Uint16Array");
  is.int32Array = isObjectOfType("Int32Array");
  is.uint32Array = isObjectOfType("Uint32Array");
  is.float32Array = isObjectOfType("Float32Array");
  is.float64Array = isObjectOfType("Float64Array");
  is.bigInt64Array = isObjectOfType("BigInt64Array");
  is.bigUint64Array = isObjectOfType("BigUint64Array");
  is.arrayBuffer = isObjectOfType("ArrayBuffer");
  is.sharedArrayBuffer = isObjectOfType("SharedArrayBuffer");
  is.dataView = isObjectOfType("DataView");
  is.directInstanceOf = (instance, class_) => Object.getPrototypeOf(instance) === class_.prototype;
  is.urlInstance = (value) => isObjectOfType("URL")(value);
  is.urlString = (value) => {
    if (!is.string(value)) {
      return false;
    }
    try {
      new URL(value);
      return true;
    } catch (_a2) {
      return false;
    }
  };
  is.truthy = (value) => Boolean(value);
  is.falsy = (value) => !value;
  is.nan = (value) => Number.isNaN(value);
  is.primitive = (value) => is.null_(value) || isPrimitiveTypeName(typeof value);
  is.integer = (value) => Number.isInteger(value);
  is.safeInteger = (value) => Number.isSafeInteger(value);
  is.plainObject = (value) => {
    if (toString2.call(value) !== "[object Object]") {
      return false;
    }
    const prototype = Object.getPrototypeOf(value);
    return prototype === null || prototype === Object.getPrototypeOf({});
  };
  is.typedArray = (value) => isTypedArrayName(getObjectType(value));
  var isValidLength = (value) => is.safeInteger(value) && value >= 0;
  is.arrayLike = (value) => !is.nullOrUndefined(value) && !is.function_(value) && isValidLength(value.length);
  is.inRange = (value, range) => {
    if (is.number(range)) {
      return value >= Math.min(0, range) && value <= Math.max(range, 0);
    }
    if (is.array(range) && range.length === 2) {
      return value >= Math.min(...range) && value <= Math.max(...range);
    }
    throw new TypeError(`Invalid range: ${JSON.stringify(range)}`);
  };
  var NODE_TYPE_ELEMENT = 1;
  var DOM_PROPERTIES_TO_CHECK = [
    "innerHTML",
    "ownerDocument",
    "style",
    "attributes",
    "nodeValue"
  ];
  is.domElement = (value) => {
    return is.object(value) && value.nodeType === NODE_TYPE_ELEMENT && is.string(value.nodeName) && !is.plainObject(value) && DOM_PROPERTIES_TO_CHECK.every((property) => (property in value));
  };
  is.observable = (value) => {
    var _a2, _b, _c, _d;
    if (!value) {
      return false;
    }
    if (value === ((_b = (_a2 = value)[Symbol.observable]) === null || _b === undefined ? undefined : _b.call(_a2))) {
      return true;
    }
    if (value === ((_d = (_c = value)["@@observable"]) === null || _d === undefined ? undefined : _d.call(_c))) {
      return true;
    }
    return false;
  };
  is.nodeStream = (value) => is.object(value) && is.function_(value.pipe) && !is.observable(value);
  is.infinite = (value) => value === Infinity || value === (-Infinity);
  var isAbsoluteMod2 = (remainder) => (value) => is.integer(value) && Math.abs(value % 2) === remainder;
  is.evenInteger = isAbsoluteMod2(0);
  is.oddInteger = isAbsoluteMod2(1);
  is.emptyArray = (value) => is.array(value) && value.length === 0;
  is.nonEmptyArray = (value) => is.array(value) && value.length > 0;
  is.emptyString = (value) => is.string(value) && value.length === 0;
  is.nonEmptyString = (value) => is.string(value) && value.length > 0;
  var isWhiteSpaceString = (value) => is.string(value) && !/\S/.test(value);
  is.emptyStringOrWhitespace = (value) => is.emptyString(value) || isWhiteSpaceString(value);
  is.emptyObject = (value) => is.object(value) && !is.map(value) && !is.set(value) && Object.keys(value).length === 0;
  is.nonEmptyObject = (value) => is.object(value) && !is.map(value) && !is.set(value) && Object.keys(value).length > 0;
  is.emptySet = (value) => is.set(value) && value.size === 0;
  is.nonEmptySet = (value) => is.set(value) && value.size > 0;
  is.emptyMap = (value) => is.map(value) && value.size === 0;
  is.nonEmptyMap = (value) => is.map(value) && value.size > 0;
  var predicateOnArray = (method, predicate, values) => {
    if (!is.function_(predicate)) {
      throw new TypeError(`Invalid predicate: ${JSON.stringify(predicate)}`);
    }
    if (values.length === 0) {
      throw new TypeError("Invalid number of values");
    }
    return method.call(values, predicate);
  };
  is.any = (predicate, ...values) => {
    const predicates = is.array(predicate) ? predicate : [predicate];
    return predicates.some((singlePredicate) => predicateOnArray(Array.prototype.some, singlePredicate, values));
  };
  is.all = (predicate, ...values) => predicateOnArray(Array.prototype.every, predicate, values);
  var assertType = (condition, description, value) => {
    if (!condition) {
      throw new TypeError(`Expected value which is \`${description}\`, received value of type \`${is(value)}\`.`);
    }
  };
  exports.assert = {
    undefined: (value) => assertType(is.undefined(value), "undefined", value),
    string: (value) => assertType(is.string(value), "string", value),
    number: (value) => assertType(is.number(value), "number", value),
    bigint: (value) => assertType(is.bigint(value), "bigint", value),
    function_: (value) => assertType(is.function_(value), "Function", value),
    null_: (value) => assertType(is.null_(value), "null", value),
    class_: (value) => assertType(is.class_(value), "Class", value),
    boolean: (value) => assertType(is.boolean(value), "boolean", value),
    symbol: (value) => assertType(is.symbol(value), "symbol", value),
    numericString: (value) => assertType(is.numericString(value), "string with a number", value),
    array: (value, assertion) => {
      const assert = assertType;
      assert(is.array(value), "Array", value);
      if (assertion) {
        value.forEach(assertion);
      }
    },
    buffer: (value) => assertType(is.buffer(value), "Buffer", value),
    nullOrUndefined: (value) => assertType(is.nullOrUndefined(value), "null or undefined", value),
    object: (value) => assertType(is.object(value), "Object", value),
    iterable: (value) => assertType(is.iterable(value), "Iterable", value),
    asyncIterable: (value) => assertType(is.asyncIterable(value), "AsyncIterable", value),
    generator: (value) => assertType(is.generator(value), "Generator", value),
    asyncGenerator: (value) => assertType(is.asyncGenerator(value), "AsyncGenerator", value),
    nativePromise: (value) => assertType(is.nativePromise(value), "native Promise", value),
    promise: (value) => assertType(is.promise(value), "Promise", value),
    generatorFunction: (value) => assertType(is.generatorFunction(value), "GeneratorFunction", value),
    asyncGeneratorFunction: (value) => assertType(is.asyncGeneratorFunction(value), "AsyncGeneratorFunction", value),
    asyncFunction: (value) => assertType(is.asyncFunction(value), "AsyncFunction", value),
    boundFunction: (value) => assertType(is.boundFunction(value), "Function", value),
    regExp: (value) => assertType(is.regExp(value), "RegExp", value),
    date: (value) => assertType(is.date(value), "Date", value),
    error: (value) => assertType(is.error(value), "Error", value),
    map: (value) => assertType(is.map(value), "Map", value),
    set: (value) => assertType(is.set(value), "Set", value),
    weakMap: (value) => assertType(is.weakMap(value), "WeakMap", value),
    weakSet: (value) => assertType(is.weakSet(value), "WeakSet", value),
    int8Array: (value) => assertType(is.int8Array(value), "Int8Array", value),
    uint8Array: (value) => assertType(is.uint8Array(value), "Uint8Array", value),
    uint8ClampedArray: (value) => assertType(is.uint8ClampedArray(value), "Uint8ClampedArray", value),
    int16Array: (value) => assertType(is.int16Array(value), "Int16Array", value),
    uint16Array: (value) => assertType(is.uint16Array(value), "Uint16Array", value),
    int32Array: (value) => assertType(is.int32Array(value), "Int32Array", value),
    uint32Array: (value) => assertType(is.uint32Array(value), "Uint32Array", value),
    float32Array: (value) => assertType(is.float32Array(value), "Float32Array", value),
    float64Array: (value) => assertType(is.float64Array(value), "Float64Array", value),
    bigInt64Array: (value) => assertType(is.bigInt64Array(value), "BigInt64Array", value),
    bigUint64Array: (value) => assertType(is.bigUint64Array(value), "BigUint64Array", value),
    arrayBuffer: (value) => assertType(is.arrayBuffer(value), "ArrayBuffer", value),
    sharedArrayBuffer: (value) => assertType(is.sharedArrayBuffer(value), "SharedArrayBuffer", value),
    dataView: (value) => assertType(is.dataView(value), "DataView", value),
    urlInstance: (value) => assertType(is.urlInstance(value), "URL", value),
    urlString: (value) => assertType(is.urlString(value), "string with a URL", value),
    truthy: (value) => assertType(is.truthy(value), "truthy", value),
    falsy: (value) => assertType(is.falsy(value), "falsy", value),
    nan: (value) => assertType(is.nan(value), "NaN", value),
    primitive: (value) => assertType(is.primitive(value), "primitive", value),
    integer: (value) => assertType(is.integer(value), "integer", value),
    safeInteger: (value) => assertType(is.safeInteger(value), "integer", value),
    plainObject: (value) => assertType(is.plainObject(value), "plain object", value),
    typedArray: (value) => assertType(is.typedArray(value), "TypedArray", value),
    arrayLike: (value) => assertType(is.arrayLike(value), "array-like", value),
    domElement: (value) => assertType(is.domElement(value), "HTMLElement", value),
    observable: (value) => assertType(is.observable(value), "Observable", value),
    nodeStream: (value) => assertType(is.nodeStream(value), "Node.js Stream", value),
    infinite: (value) => assertType(is.infinite(value), "infinite number", value),
    emptyArray: (value) => assertType(is.emptyArray(value), "empty array", value),
    nonEmptyArray: (value) => assertType(is.nonEmptyArray(value), "non-empty array", value),
    emptyString: (value) => assertType(is.emptyString(value), "empty string", value),
    nonEmptyString: (value) => assertType(is.nonEmptyString(value), "non-empty string", value),
    emptyStringOrWhitespace: (value) => assertType(is.emptyStringOrWhitespace(value), "empty string or whitespace", value),
    emptyObject: (value) => assertType(is.emptyObject(value), "empty object", value),
    nonEmptyObject: (value) => assertType(is.nonEmptyObject(value), "non-empty object", value),
    emptySet: (value) => assertType(is.emptySet(value), "empty set", value),
    nonEmptySet: (value) => assertType(is.nonEmptySet(value), "non-empty set", value),
    emptyMap: (value) => assertType(is.emptyMap(value), "empty map", value),
    nonEmptyMap: (value) => assertType(is.nonEmptyMap(value), "non-empty map", value),
    evenInteger: (value) => assertType(is.evenInteger(value), "even integer", value),
    oddInteger: (value) => assertType(is.oddInteger(value), "odd integer", value),
    directInstanceOf: (instance, class_) => assertType(is.directInstanceOf(instance, class_), "T", instance),
    inRange: (value, range) => assertType(is.inRange(value, range), "in range", value),
    any: (predicate, ...values) => assertType(is.any(predicate, ...values), "predicate returns truthy for any value", values),
    all: (predicate, ...values) => assertType(is.all(predicate, ...values), "predicate returns truthy for all values", values)
  };
  Object.defineProperties(is, {
    class: {
      value: is.class_
    },
    function: {
      value: is.function_
    },
    null: {
      value: is.null_
    }
  });
  Object.defineProperties(exports.assert, {
    class: {
      value: exports.assert.class_
    },
    function: {
      value: exports.assert.function_
    },
    null: {
      value: exports.assert.null_
    }
  });
  exports.default = is;
  module.exports = is;
  module.exports.default = is;
  module.exports.assert = exports.assert;
});

// node_modules/emojilib/emojis.json
var require_emojis = __commonJS((exports, module) => {
  module.exports = {
    grinning: {
      keywords: ["face", "smile", "happy", "joy", ":D", "grin"],
      char: "\uD83D\uDE00",
      fitzpatrick_scale: false,
      category: "people"
    },
    grimacing: {
      keywords: ["face", "grimace", "teeth"],
      char: "\uD83D\uDE2C",
      fitzpatrick_scale: false,
      category: "people"
    },
    grin: {
      keywords: ["face", "happy", "smile", "joy", "kawaii"],
      char: "\uD83D\uDE01",
      fitzpatrick_scale: false,
      category: "people"
    },
    joy: {
      keywords: ["face", "cry", "tears", "weep", "happy", "happytears", "haha"],
      char: "\uD83D\uDE02",
      fitzpatrick_scale: false,
      category: "people"
    },
    rofl: {
      keywords: ["face", "rolling", "floor", "laughing", "lol", "haha"],
      char: "\uD83E\uDD23",
      fitzpatrick_scale: false,
      category: "people"
    },
    partying: {
      keywords: ["face", "celebration", "woohoo"],
      char: "\uD83E\uDD73",
      fitzpatrick_scale: false,
      category: "people"
    },
    smiley: {
      keywords: ["face", "happy", "joy", "haha", ":D", ":)", "smile", "funny"],
      char: "\uD83D\uDE03",
      fitzpatrick_scale: false,
      category: "people"
    },
    smile: {
      keywords: ["face", "happy", "joy", "funny", "haha", "laugh", "like", ":D", ":)"],
      char: "\uD83D\uDE04",
      fitzpatrick_scale: false,
      category: "people"
    },
    sweat_smile: {
      keywords: ["face", "hot", "happy", "laugh", "sweat", "smile", "relief"],
      char: "\uD83D\uDE05",
      fitzpatrick_scale: false,
      category: "people"
    },
    laughing: {
      keywords: ["happy", "joy", "lol", "satisfied", "haha", "face", "glad", "XD", "laugh"],
      char: "\uD83D\uDE06",
      fitzpatrick_scale: false,
      category: "people"
    },
    innocent: {
      keywords: ["face", "angel", "heaven", "halo"],
      char: "\uD83D\uDE07",
      fitzpatrick_scale: false,
      category: "people"
    },
    wink: {
      keywords: ["face", "happy", "mischievous", "secret", ";)", "smile", "eye"],
      char: "\uD83D\uDE09",
      fitzpatrick_scale: false,
      category: "people"
    },
    blush: {
      keywords: ["face", "smile", "happy", "flushed", "crush", "embarrassed", "shy", "joy"],
      char: "\uD83D\uDE0A",
      fitzpatrick_scale: false,
      category: "people"
    },
    slightly_smiling_face: {
      keywords: ["face", "smile"],
      char: "\uD83D\uDE42",
      fitzpatrick_scale: false,
      category: "people"
    },
    upside_down_face: {
      keywords: ["face", "flipped", "silly", "smile"],
      char: "\uD83D\uDE43",
      fitzpatrick_scale: false,
      category: "people"
    },
    relaxed: {
      keywords: ["face", "blush", "massage", "happiness"],
      char: "\u263A\uFE0F",
      fitzpatrick_scale: false,
      category: "people"
    },
    yum: {
      keywords: ["happy", "joy", "tongue", "smile", "face", "silly", "yummy", "nom", "delicious", "savouring"],
      char: "\uD83D\uDE0B",
      fitzpatrick_scale: false,
      category: "people"
    },
    relieved: {
      keywords: ["face", "relaxed", "phew", "massage", "happiness"],
      char: "\uD83D\uDE0C",
      fitzpatrick_scale: false,
      category: "people"
    },
    heart_eyes: {
      keywords: ["face", "love", "like", "affection", "valentines", "infatuation", "crush", "heart"],
      char: "\uD83D\uDE0D",
      fitzpatrick_scale: false,
      category: "people"
    },
    smiling_face_with_three_hearts: {
      keywords: ["face", "love", "like", "affection", "valentines", "infatuation", "crush", "hearts", "adore"],
      char: "\uD83E\uDD70",
      fitzpatrick_scale: false,
      category: "people"
    },
    kissing_heart: {
      keywords: ["face", "love", "like", "affection", "valentines", "infatuation", "kiss"],
      char: "\uD83D\uDE18",
      fitzpatrick_scale: false,
      category: "people"
    },
    kissing: {
      keywords: ["love", "like", "face", "3", "valentines", "infatuation", "kiss"],
      char: "\uD83D\uDE17",
      fitzpatrick_scale: false,
      category: "people"
    },
    kissing_smiling_eyes: {
      keywords: ["face", "affection", "valentines", "infatuation", "kiss"],
      char: "\uD83D\uDE19",
      fitzpatrick_scale: false,
      category: "people"
    },
    kissing_closed_eyes: {
      keywords: ["face", "love", "like", "affection", "valentines", "infatuation", "kiss"],
      char: "\uD83D\uDE1A",
      fitzpatrick_scale: false,
      category: "people"
    },
    stuck_out_tongue_winking_eye: {
      keywords: ["face", "prank", "childish", "playful", "mischievous", "smile", "wink", "tongue"],
      char: "\uD83D\uDE1C",
      fitzpatrick_scale: false,
      category: "people"
    },
    zany: {
      keywords: ["face", "goofy", "crazy"],
      char: "\uD83E\uDD2A",
      fitzpatrick_scale: false,
      category: "people"
    },
    raised_eyebrow: {
      keywords: ["face", "distrust", "scepticism", "disapproval", "disbelief", "surprise"],
      char: "\uD83E\uDD28",
      fitzpatrick_scale: false,
      category: "people"
    },
    monocle: {
      keywords: ["face", "stuffy", "wealthy"],
      char: "\uD83E\uDDD0",
      fitzpatrick_scale: false,
      category: "people"
    },
    stuck_out_tongue_closed_eyes: {
      keywords: ["face", "prank", "playful", "mischievous", "smile", "tongue"],
      char: "\uD83D\uDE1D",
      fitzpatrick_scale: false,
      category: "people"
    },
    stuck_out_tongue: {
      keywords: ["face", "prank", "childish", "playful", "mischievous", "smile", "tongue"],
      char: "\uD83D\uDE1B",
      fitzpatrick_scale: false,
      category: "people"
    },
    money_mouth_face: {
      keywords: ["face", "rich", "dollar", "money"],
      char: "\uD83E\uDD11",
      fitzpatrick_scale: false,
      category: "people"
    },
    nerd_face: {
      keywords: ["face", "nerdy", "geek", "dork"],
      char: "\uD83E\uDD13",
      fitzpatrick_scale: false,
      category: "people"
    },
    sunglasses: {
      keywords: ["face", "cool", "smile", "summer", "beach", "sunglass"],
      char: "\uD83D\uDE0E",
      fitzpatrick_scale: false,
      category: "people"
    },
    star_struck: {
      keywords: ["face", "smile", "starry", "eyes", "grinning"],
      char: "\uD83E\uDD29",
      fitzpatrick_scale: false,
      category: "people"
    },
    clown_face: {
      keywords: ["face"],
      char: "\uD83E\uDD21",
      fitzpatrick_scale: false,
      category: "people"
    },
    cowboy_hat_face: {
      keywords: ["face", "cowgirl", "hat"],
      char: "\uD83E\uDD20",
      fitzpatrick_scale: false,
      category: "people"
    },
    hugs: {
      keywords: ["face", "smile", "hug"],
      char: "\uD83E\uDD17",
      fitzpatrick_scale: false,
      category: "people"
    },
    smirk: {
      keywords: ["face", "smile", "mean", "prank", "smug", "sarcasm"],
      char: "\uD83D\uDE0F",
      fitzpatrick_scale: false,
      category: "people"
    },
    no_mouth: {
      keywords: ["face", "hellokitty"],
      char: "\uD83D\uDE36",
      fitzpatrick_scale: false,
      category: "people"
    },
    neutral_face: {
      keywords: ["indifference", "meh", ":|", "neutral"],
      char: "\uD83D\uDE10",
      fitzpatrick_scale: false,
      category: "people"
    },
    expressionless: {
      keywords: ["face", "indifferent", "-_-", "meh", "deadpan"],
      char: "\uD83D\uDE11",
      fitzpatrick_scale: false,
      category: "people"
    },
    unamused: {
      keywords: ["indifference", "bored", "straight face", "serious", "sarcasm", "unimpressed", "skeptical", "dubious", "side_eye"],
      char: "\uD83D\uDE12",
      fitzpatrick_scale: false,
      category: "people"
    },
    roll_eyes: {
      keywords: ["face", "eyeroll", "frustrated"],
      char: "\uD83D\uDE44",
      fitzpatrick_scale: false,
      category: "people"
    },
    thinking: {
      keywords: ["face", "hmmm", "think", "consider"],
      char: "\uD83E\uDD14",
      fitzpatrick_scale: false,
      category: "people"
    },
    lying_face: {
      keywords: ["face", "lie", "pinocchio"],
      char: "\uD83E\uDD25",
      fitzpatrick_scale: false,
      category: "people"
    },
    hand_over_mouth: {
      keywords: ["face", "whoops", "shock", "surprise"],
      char: "\uD83E\uDD2D",
      fitzpatrick_scale: false,
      category: "people"
    },
    shushing: {
      keywords: ["face", "quiet", "shhh"],
      char: "\uD83E\uDD2B",
      fitzpatrick_scale: false,
      category: "people"
    },
    symbols_over_mouth: {
      keywords: ["face", "swearing", "cursing", "cussing", "profanity", "expletive"],
      char: "\uD83E\uDD2C",
      fitzpatrick_scale: false,
      category: "people"
    },
    exploding_head: {
      keywords: ["face", "shocked", "mind", "blown"],
      char: "\uD83E\uDD2F",
      fitzpatrick_scale: false,
      category: "people"
    },
    flushed: {
      keywords: ["face", "blush", "shy", "flattered"],
      char: "\uD83D\uDE33",
      fitzpatrick_scale: false,
      category: "people"
    },
    disappointed: {
      keywords: ["face", "sad", "upset", "depressed", ":("],
      char: "\uD83D\uDE1E",
      fitzpatrick_scale: false,
      category: "people"
    },
    worried: {
      keywords: ["face", "concern", "nervous", ":("],
      char: "\uD83D\uDE1F",
      fitzpatrick_scale: false,
      category: "people"
    },
    angry: {
      keywords: ["mad", "face", "annoyed", "frustrated"],
      char: "\uD83D\uDE20",
      fitzpatrick_scale: false,
      category: "people"
    },
    rage: {
      keywords: ["angry", "mad", "hate", "despise"],
      char: "\uD83D\uDE21",
      fitzpatrick_scale: false,
      category: "people"
    },
    pensive: {
      keywords: ["face", "sad", "depressed", "upset"],
      char: "\uD83D\uDE14",
      fitzpatrick_scale: false,
      category: "people"
    },
    confused: {
      keywords: ["face", "indifference", "huh", "weird", "hmmm", ":/"],
      char: "\uD83D\uDE15",
      fitzpatrick_scale: false,
      category: "people"
    },
    slightly_frowning_face: {
      keywords: ["face", "frowning", "disappointed", "sad", "upset"],
      char: "\uD83D\uDE41",
      fitzpatrick_scale: false,
      category: "people"
    },
    frowning_face: {
      keywords: ["face", "sad", "upset", "frown"],
      char: "\u2639",
      fitzpatrick_scale: false,
      category: "people"
    },
    persevere: {
      keywords: ["face", "sick", "no", "upset", "oops"],
      char: "\uD83D\uDE23",
      fitzpatrick_scale: false,
      category: "people"
    },
    confounded: {
      keywords: ["face", "confused", "sick", "unwell", "oops", ":S"],
      char: "\uD83D\uDE16",
      fitzpatrick_scale: false,
      category: "people"
    },
    tired_face: {
      keywords: ["sick", "whine", "upset", "frustrated"],
      char: "\uD83D\uDE2B",
      fitzpatrick_scale: false,
      category: "people"
    },
    weary: {
      keywords: ["face", "tired", "sleepy", "sad", "frustrated", "upset"],
      char: "\uD83D\uDE29",
      fitzpatrick_scale: false,
      category: "people"
    },
    pleading: {
      keywords: ["face", "begging", "mercy"],
      char: "\uD83E\uDD7A",
      fitzpatrick_scale: false,
      category: "people"
    },
    triumph: {
      keywords: ["face", "gas", "phew", "proud", "pride"],
      char: "\uD83D\uDE24",
      fitzpatrick_scale: false,
      category: "people"
    },
    open_mouth: {
      keywords: ["face", "surprise", "impressed", "wow", "whoa", ":O"],
      char: "\uD83D\uDE2E",
      fitzpatrick_scale: false,
      category: "people"
    },
    scream: {
      keywords: ["face", "munch", "scared", "omg"],
      char: "\uD83D\uDE31",
      fitzpatrick_scale: false,
      category: "people"
    },
    fearful: {
      keywords: ["face", "scared", "terrified", "nervous", "oops", "huh"],
      char: "\uD83D\uDE28",
      fitzpatrick_scale: false,
      category: "people"
    },
    cold_sweat: {
      keywords: ["face", "nervous", "sweat"],
      char: "\uD83D\uDE30",
      fitzpatrick_scale: false,
      category: "people"
    },
    hushed: {
      keywords: ["face", "woo", "shh"],
      char: "\uD83D\uDE2F",
      fitzpatrick_scale: false,
      category: "people"
    },
    frowning: {
      keywords: ["face", "aw", "what"],
      char: "\uD83D\uDE26",
      fitzpatrick_scale: false,
      category: "people"
    },
    anguished: {
      keywords: ["face", "stunned", "nervous"],
      char: "\uD83D\uDE27",
      fitzpatrick_scale: false,
      category: "people"
    },
    cry: {
      keywords: ["face", "tears", "sad", "depressed", "upset", ":'("],
      char: "\uD83D\uDE22",
      fitzpatrick_scale: false,
      category: "people"
    },
    disappointed_relieved: {
      keywords: ["face", "phew", "sweat", "nervous"],
      char: "\uD83D\uDE25",
      fitzpatrick_scale: false,
      category: "people"
    },
    drooling_face: {
      keywords: ["face"],
      char: "\uD83E\uDD24",
      fitzpatrick_scale: false,
      category: "people"
    },
    sleepy: {
      keywords: ["face", "tired", "rest", "nap"],
      char: "\uD83D\uDE2A",
      fitzpatrick_scale: false,
      category: "people"
    },
    sweat: {
      keywords: ["face", "hot", "sad", "tired", "exercise"],
      char: "\uD83D\uDE13",
      fitzpatrick_scale: false,
      category: "people"
    },
    hot: {
      keywords: ["face", "feverish", "heat", "red", "sweating"],
      char: "\uD83E\uDD75",
      fitzpatrick_scale: false,
      category: "people"
    },
    cold: {
      keywords: ["face", "blue", "freezing", "frozen", "frostbite", "icicles"],
      char: "\uD83E\uDD76",
      fitzpatrick_scale: false,
      category: "people"
    },
    sob: {
      keywords: ["face", "cry", "tears", "sad", "upset", "depressed"],
      char: "\uD83D\uDE2D",
      fitzpatrick_scale: false,
      category: "people"
    },
    dizzy_face: {
      keywords: ["spent", "unconscious", "xox", "dizzy"],
      char: "\uD83D\uDE35",
      fitzpatrick_scale: false,
      category: "people"
    },
    astonished: {
      keywords: ["face", "xox", "surprised", "poisoned"],
      char: "\uD83D\uDE32",
      fitzpatrick_scale: false,
      category: "people"
    },
    zipper_mouth_face: {
      keywords: ["face", "sealed", "zipper", "secret"],
      char: "\uD83E\uDD10",
      fitzpatrick_scale: false,
      category: "people"
    },
    nauseated_face: {
      keywords: ["face", "vomit", "gross", "green", "sick", "throw up", "ill"],
      char: "\uD83E\uDD22",
      fitzpatrick_scale: false,
      category: "people"
    },
    sneezing_face: {
      keywords: ["face", "gesundheit", "sneeze", "sick", "allergy"],
      char: "\uD83E\uDD27",
      fitzpatrick_scale: false,
      category: "people"
    },
    vomiting: {
      keywords: ["face", "sick"],
      char: "\uD83E\uDD2E",
      fitzpatrick_scale: false,
      category: "people"
    },
    mask: {
      keywords: ["face", "sick", "ill", "disease"],
      char: "\uD83D\uDE37",
      fitzpatrick_scale: false,
      category: "people"
    },
    face_with_thermometer: {
      keywords: ["sick", "temperature", "thermometer", "cold", "fever"],
      char: "\uD83E\uDD12",
      fitzpatrick_scale: false,
      category: "people"
    },
    face_with_head_bandage: {
      keywords: ["injured", "clumsy", "bandage", "hurt"],
      char: "\uD83E\uDD15",
      fitzpatrick_scale: false,
      category: "people"
    },
    woozy: {
      keywords: ["face", "dizzy", "intoxicated", "tipsy", "wavy"],
      char: "\uD83E\uDD74",
      fitzpatrick_scale: false,
      category: "people"
    },
    sleeping: {
      keywords: ["face", "tired", "sleepy", "night", "zzz"],
      char: "\uD83D\uDE34",
      fitzpatrick_scale: false,
      category: "people"
    },
    zzz: {
      keywords: ["sleepy", "tired", "dream"],
      char: "\uD83D\uDCA4",
      fitzpatrick_scale: false,
      category: "people"
    },
    poop: {
      keywords: ["hankey", "shitface", "fail", "turd", "shit"],
      char: "\uD83D\uDCA9",
      fitzpatrick_scale: false,
      category: "people"
    },
    smiling_imp: {
      keywords: ["devil", "horns"],
      char: "\uD83D\uDE08",
      fitzpatrick_scale: false,
      category: "people"
    },
    imp: {
      keywords: ["devil", "angry", "horns"],
      char: "\uD83D\uDC7F",
      fitzpatrick_scale: false,
      category: "people"
    },
    japanese_ogre: {
      keywords: ["monster", "red", "mask", "halloween", "scary", "creepy", "devil", "demon", "japanese", "ogre"],
      char: "\uD83D\uDC79",
      fitzpatrick_scale: false,
      category: "people"
    },
    japanese_goblin: {
      keywords: ["red", "evil", "mask", "monster", "scary", "creepy", "japanese", "goblin"],
      char: "\uD83D\uDC7A",
      fitzpatrick_scale: false,
      category: "people"
    },
    skull: {
      keywords: ["dead", "skeleton", "creepy", "death"],
      char: "\uD83D\uDC80",
      fitzpatrick_scale: false,
      category: "people"
    },
    ghost: {
      keywords: ["halloween", "spooky", "scary"],
      char: "\uD83D\uDC7B",
      fitzpatrick_scale: false,
      category: "people"
    },
    alien: {
      keywords: ["UFO", "paul", "weird", "outer_space"],
      char: "\uD83D\uDC7D",
      fitzpatrick_scale: false,
      category: "people"
    },
    robot: {
      keywords: ["computer", "machine", "bot"],
      char: "\uD83E\uDD16",
      fitzpatrick_scale: false,
      category: "people"
    },
    smiley_cat: {
      keywords: ["animal", "cats", "happy", "smile"],
      char: "\uD83D\uDE3A",
      fitzpatrick_scale: false,
      category: "people"
    },
    smile_cat: {
      keywords: ["animal", "cats", "smile"],
      char: "\uD83D\uDE38",
      fitzpatrick_scale: false,
      category: "people"
    },
    joy_cat: {
      keywords: ["animal", "cats", "haha", "happy", "tears"],
      char: "\uD83D\uDE39",
      fitzpatrick_scale: false,
      category: "people"
    },
    heart_eyes_cat: {
      keywords: ["animal", "love", "like", "affection", "cats", "valentines", "heart"],
      char: "\uD83D\uDE3B",
      fitzpatrick_scale: false,
      category: "people"
    },
    smirk_cat: {
      keywords: ["animal", "cats", "smirk"],
      char: "\uD83D\uDE3C",
      fitzpatrick_scale: false,
      category: "people"
    },
    kissing_cat: {
      keywords: ["animal", "cats", "kiss"],
      char: "\uD83D\uDE3D",
      fitzpatrick_scale: false,
      category: "people"
    },
    scream_cat: {
      keywords: ["animal", "cats", "munch", "scared", "scream"],
      char: "\uD83D\uDE40",
      fitzpatrick_scale: false,
      category: "people"
    },
    crying_cat_face: {
      keywords: ["animal", "tears", "weep", "sad", "cats", "upset", "cry"],
      char: "\uD83D\uDE3F",
      fitzpatrick_scale: false,
      category: "people"
    },
    pouting_cat: {
      keywords: ["animal", "cats"],
      char: "\uD83D\uDE3E",
      fitzpatrick_scale: false,
      category: "people"
    },
    palms_up: {
      keywords: ["hands", "gesture", "cupped", "prayer"],
      char: "\uD83E\uDD32",
      fitzpatrick_scale: true,
      category: "people"
    },
    raised_hands: {
      keywords: ["gesture", "hooray", "yea", "celebration", "hands"],
      char: "\uD83D\uDE4C",
      fitzpatrick_scale: true,
      category: "people"
    },
    clap: {
      keywords: ["hands", "praise", "applause", "congrats", "yay"],
      char: "\uD83D\uDC4F",
      fitzpatrick_scale: true,
      category: "people"
    },
    wave: {
      keywords: ["hands", "gesture", "goodbye", "solong", "farewell", "hello", "hi", "palm"],
      char: "\uD83D\uDC4B",
      fitzpatrick_scale: true,
      category: "people"
    },
    call_me_hand: {
      keywords: ["hands", "gesture"],
      char: "\uD83E\uDD19",
      fitzpatrick_scale: true,
      category: "people"
    },
    "+1": {
      keywords: ["thumbsup", "yes", "awesome", "good", "agree", "accept", "cool", "hand", "like"],
      char: "\uD83D\uDC4D",
      fitzpatrick_scale: true,
      category: "people"
    },
    "-1": {
      keywords: ["thumbsdown", "no", "dislike", "hand"],
      char: "\uD83D\uDC4E",
      fitzpatrick_scale: true,
      category: "people"
    },
    facepunch: {
      keywords: ["angry", "violence", "fist", "hit", "attack", "hand"],
      char: "\uD83D\uDC4A",
      fitzpatrick_scale: true,
      category: "people"
    },
    fist: {
      keywords: ["fingers", "hand", "grasp"],
      char: "\u270A",
      fitzpatrick_scale: true,
      category: "people"
    },
    fist_left: {
      keywords: ["hand", "fistbump"],
      char: "\uD83E\uDD1B",
      fitzpatrick_scale: true,
      category: "people"
    },
    fist_right: {
      keywords: ["hand", "fistbump"],
      char: "\uD83E\uDD1C",
      fitzpatrick_scale: true,
      category: "people"
    },
    v: {
      keywords: ["fingers", "ohyeah", "hand", "peace", "victory", "two"],
      char: "\u270C",
      fitzpatrick_scale: true,
      category: "people"
    },
    ok_hand: {
      keywords: ["fingers", "limbs", "perfect", "ok", "okay"],
      char: "\uD83D\uDC4C",
      fitzpatrick_scale: true,
      category: "people"
    },
    raised_hand: {
      keywords: ["fingers", "stop", "highfive", "palm", "ban"],
      char: "\u270B",
      fitzpatrick_scale: true,
      category: "people"
    },
    raised_back_of_hand: {
      keywords: ["fingers", "raised", "backhand"],
      char: "\uD83E\uDD1A",
      fitzpatrick_scale: true,
      category: "people"
    },
    open_hands: {
      keywords: ["fingers", "butterfly", "hands", "open"],
      char: "\uD83D\uDC50",
      fitzpatrick_scale: true,
      category: "people"
    },
    muscle: {
      keywords: ["arm", "flex", "hand", "summer", "strong", "biceps"],
      char: "\uD83D\uDCAA",
      fitzpatrick_scale: true,
      category: "people"
    },
    pray: {
      keywords: ["please", "hope", "wish", "namaste", "highfive"],
      char: "\uD83D\uDE4F",
      fitzpatrick_scale: true,
      category: "people"
    },
    foot: {
      keywords: ["kick", "stomp"],
      char: "\uD83E\uDDB6",
      fitzpatrick_scale: true,
      category: "people"
    },
    leg: {
      keywords: ["kick", "limb"],
      char: "\uD83E\uDDB5",
      fitzpatrick_scale: true,
      category: "people"
    },
    handshake: {
      keywords: ["agreement", "shake"],
      char: "\uD83E\uDD1D",
      fitzpatrick_scale: false,
      category: "people"
    },
    point_up: {
      keywords: ["hand", "fingers", "direction", "up"],
      char: "\u261D",
      fitzpatrick_scale: true,
      category: "people"
    },
    point_up_2: {
      keywords: ["fingers", "hand", "direction", "up"],
      char: "\uD83D\uDC46",
      fitzpatrick_scale: true,
      category: "people"
    },
    point_down: {
      keywords: ["fingers", "hand", "direction", "down"],
      char: "\uD83D\uDC47",
      fitzpatrick_scale: true,
      category: "people"
    },
    point_left: {
      keywords: ["direction", "fingers", "hand", "left"],
      char: "\uD83D\uDC48",
      fitzpatrick_scale: true,
      category: "people"
    },
    point_right: {
      keywords: ["fingers", "hand", "direction", "right"],
      char: "\uD83D\uDC49",
      fitzpatrick_scale: true,
      category: "people"
    },
    fu: {
      keywords: ["hand", "fingers", "rude", "middle", "flipping"],
      char: "\uD83D\uDD95",
      fitzpatrick_scale: true,
      category: "people"
    },
    raised_hand_with_fingers_splayed: {
      keywords: ["hand", "fingers", "palm"],
      char: "\uD83D\uDD90",
      fitzpatrick_scale: true,
      category: "people"
    },
    love_you: {
      keywords: ["hand", "fingers", "gesture"],
      char: "\uD83E\uDD1F",
      fitzpatrick_scale: true,
      category: "people"
    },
    metal: {
      keywords: ["hand", "fingers", "evil_eye", "sign_of_horns", "rock_on"],
      char: "\uD83E\uDD18",
      fitzpatrick_scale: true,
      category: "people"
    },
    crossed_fingers: {
      keywords: ["good", "lucky"],
      char: "\uD83E\uDD1E",
      fitzpatrick_scale: true,
      category: "people"
    },
    vulcan_salute: {
      keywords: ["hand", "fingers", "spock", "star trek"],
      char: "\uD83D\uDD96",
      fitzpatrick_scale: true,
      category: "people"
    },
    writing_hand: {
      keywords: ["lower_left_ballpoint_pen", "stationery", "write", "compose"],
      char: "\u270D",
      fitzpatrick_scale: true,
      category: "people"
    },
    selfie: {
      keywords: ["camera", "phone"],
      char: "\uD83E\uDD33",
      fitzpatrick_scale: true,
      category: "people"
    },
    nail_care: {
      keywords: ["beauty", "manicure", "finger", "fashion", "nail"],
      char: "\uD83D\uDC85",
      fitzpatrick_scale: true,
      category: "people"
    },
    lips: {
      keywords: ["mouth", "kiss"],
      char: "\uD83D\uDC44",
      fitzpatrick_scale: false,
      category: "people"
    },
    tooth: {
      keywords: ["teeth", "dentist"],
      char: "\uD83E\uDDB7",
      fitzpatrick_scale: false,
      category: "people"
    },
    tongue: {
      keywords: ["mouth", "playful"],
      char: "\uD83D\uDC45",
      fitzpatrick_scale: false,
      category: "people"
    },
    ear: {
      keywords: ["face", "hear", "sound", "listen"],
      char: "\uD83D\uDC42",
      fitzpatrick_scale: true,
      category: "people"
    },
    nose: {
      keywords: ["smell", "sniff"],
      char: "\uD83D\uDC43",
      fitzpatrick_scale: true,
      category: "people"
    },
    eye: {
      keywords: ["face", "look", "see", "watch", "stare"],
      char: "\uD83D\uDC41",
      fitzpatrick_scale: false,
      category: "people"
    },
    eyes: {
      keywords: ["look", "watch", "stalk", "peek", "see"],
      char: "\uD83D\uDC40",
      fitzpatrick_scale: false,
      category: "people"
    },
    brain: {
      keywords: ["smart", "intelligent"],
      char: "\uD83E\uDDE0",
      fitzpatrick_scale: false,
      category: "people"
    },
    bust_in_silhouette: {
      keywords: ["user", "person", "human"],
      char: "\uD83D\uDC64",
      fitzpatrick_scale: false,
      category: "people"
    },
    busts_in_silhouette: {
      keywords: ["user", "person", "human", "group", "team"],
      char: "\uD83D\uDC65",
      fitzpatrick_scale: false,
      category: "people"
    },
    speaking_head: {
      keywords: ["user", "person", "human", "sing", "say", "talk"],
      char: "\uD83D\uDDE3",
      fitzpatrick_scale: false,
      category: "people"
    },
    baby: {
      keywords: ["child", "boy", "girl", "toddler"],
      char: "\uD83D\uDC76",
      fitzpatrick_scale: true,
      category: "people"
    },
    child: {
      keywords: ["gender-neutral", "young"],
      char: "\uD83E\uDDD2",
      fitzpatrick_scale: true,
      category: "people"
    },
    boy: {
      keywords: ["man", "male", "guy", "teenager"],
      char: "\uD83D\uDC66",
      fitzpatrick_scale: true,
      category: "people"
    },
    girl: {
      keywords: ["female", "woman", "teenager"],
      char: "\uD83D\uDC67",
      fitzpatrick_scale: true,
      category: "people"
    },
    adult: {
      keywords: ["gender-neutral", "person"],
      char: "\uD83E\uDDD1",
      fitzpatrick_scale: true,
      category: "people"
    },
    man: {
      keywords: ["mustache", "father", "dad", "guy", "classy", "sir", "moustache"],
      char: "\uD83D\uDC68",
      fitzpatrick_scale: true,
      category: "people"
    },
    woman: {
      keywords: ["female", "girls", "lady"],
      char: "\uD83D\uDC69",
      fitzpatrick_scale: true,
      category: "people"
    },
    blonde_woman: {
      keywords: ["woman", "female", "girl", "blonde", "person"],
      char: "\uD83D\uDC71\u200D\u2640\uFE0F",
      fitzpatrick_scale: true,
      category: "people"
    },
    blonde_man: {
      keywords: ["man", "male", "boy", "blonde", "guy", "person"],
      char: "\uD83D\uDC71",
      fitzpatrick_scale: true,
      category: "people"
    },
    bearded_person: {
      keywords: ["person", "bewhiskered"],
      char: "\uD83E\uDDD4",
      fitzpatrick_scale: true,
      category: "people"
    },
    older_adult: {
      keywords: ["human", "elder", "senior", "gender-neutral"],
      char: "\uD83E\uDDD3",
      fitzpatrick_scale: true,
      category: "people"
    },
    older_man: {
      keywords: ["human", "male", "men", "old", "elder", "senior"],
      char: "\uD83D\uDC74",
      fitzpatrick_scale: true,
      category: "people"
    },
    older_woman: {
      keywords: ["human", "female", "women", "lady", "old", "elder", "senior"],
      char: "\uD83D\uDC75",
      fitzpatrick_scale: true,
      category: "people"
    },
    man_with_gua_pi_mao: {
      keywords: ["male", "boy", "chinese"],
      char: "\uD83D\uDC72",
      fitzpatrick_scale: true,
      category: "people"
    },
    woman_with_headscarf: {
      keywords: ["female", "hijab", "mantilla", "tichel"],
      char: "\uD83E\uDDD5",
      fitzpatrick_scale: true,
      category: "people"
    },
    woman_with_turban: {
      keywords: ["female", "indian", "hinduism", "arabs", "woman"],
      char: "\uD83D\uDC73\u200D\u2640\uFE0F",
      fitzpatrick_scale: true,
      category: "people"
    },
    man_with_turban: {
      keywords: ["male", "indian", "hinduism", "arabs"],
      char: "\uD83D\uDC73",
      fitzpatrick_scale: true,
      category: "people"
    },
    policewoman: {
      keywords: ["woman", "police", "law", "legal", "enforcement", "arrest", "911", "female"],
      char: "\uD83D\uDC6E\u200D\u2640\uFE0F",
      fitzpatrick_scale: true,
      category: "people"
    },
    policeman: {
      keywords: ["man", "police", "law", "legal", "enforcement", "arrest", "911"],
      char: "\uD83D\uDC6E",
      fitzpatrick_scale: true,
      category: "people"
    },
    construction_worker_woman: {
      keywords: ["female", "human", "wip", "build", "construction", "worker", "labor", "woman"],
      char: "\uD83D\uDC77\u200D\u2640\uFE0F",
      fitzpatrick_scale: true,
      category: "people"
    },
    construction_worker_man: {
      keywords: ["male", "human", "wip", "guy", "build", "construction", "worker", "labor"],
      char: "\uD83D\uDC77",
      fitzpatrick_scale: true,
      category: "people"
    },
    guardswoman: {
      keywords: ["uk", "gb", "british", "female", "royal", "woman"],
      char: "\uD83D\uDC82\u200D\u2640\uFE0F",
      fitzpatrick_scale: true,
      category: "people"
    },
    guardsman: {
      keywords: ["uk", "gb", "british", "male", "guy", "royal"],
      char: "\uD83D\uDC82",
      fitzpatrick_scale: true,
      category: "people"
    },
    female_detective: {
      keywords: ["human", "spy", "detective", "female", "woman"],
      char: "\uD83D\uDD75\uFE0F\u200D\u2640\uFE0F",
      fitzpatrick_scale: true,
      category: "people"
    },
    male_detective: {
      keywords: ["human", "spy", "detective"],
      char: "\uD83D\uDD75",
      fitzpatrick_scale: true,
      category: "people"
    },
    woman_health_worker: {
      keywords: ["doctor", "nurse", "therapist", "healthcare", "woman", "human"],
      char: "\uD83D\uDC69\u200D\u2695\uFE0F",
      fitzpatrick_scale: true,
      category: "people"
    },
    man_health_worker: {
      keywords: ["doctor", "nurse", "therapist", "healthcare", "man", "human"],
      char: "\uD83D\uDC68\u200D\u2695\uFE0F",
      fitzpatrick_scale: true,
      category: "people"
    },
    woman_farmer: {
      keywords: ["rancher", "gardener", "woman", "human"],
      char: "\uD83D\uDC69\u200D\uD83C\uDF3E",
      fitzpatrick_scale: true,
      category: "people"
    },
    man_farmer: {
      keywords: ["rancher", "gardener", "man", "human"],
      char: "\uD83D\uDC68\u200D\uD83C\uDF3E",
      fitzpatrick_scale: true,
      category: "people"
    },
    woman_cook: {
      keywords: ["chef", "woman", "human"],
      char: "\uD83D\uDC69\u200D\uD83C\uDF73",
      fitzpatrick_scale: true,
      category: "people"
    },
    man_cook: {
      keywords: ["chef", "man", "human"],
      char: "\uD83D\uDC68\u200D\uD83C\uDF73",
      fitzpatrick_scale: true,
      category: "people"
    },
    woman_student: {
      keywords: ["graduate", "woman", "human"],
      char: "\uD83D\uDC69\u200D\uD83C\uDF93",
      fitzpatrick_scale: true,
      category: "people"
    },
    man_student: {
      keywords: ["graduate", "man", "human"],
      char: "\uD83D\uDC68\u200D\uD83C\uDF93",
      fitzpatrick_scale: true,
      category: "people"
    },
    woman_singer: {
      keywords: ["rockstar", "entertainer", "woman", "human"],
      char: "\uD83D\uDC69\u200D\uD83C\uDFA4",
      fitzpatrick_scale: true,
      category: "people"
    },
    man_singer: {
      keywords: ["rockstar", "entertainer", "man", "human"],
      char: "\uD83D\uDC68\u200D\uD83C\uDFA4",
      fitzpatrick_scale: true,
      category: "people"
    },
    woman_teacher: {
      keywords: ["instructor", "professor", "woman", "human"],
      char: "\uD83D\uDC69\u200D\uD83C\uDFEB",
      fitzpatrick_scale: true,
      category: "people"
    },
    man_teacher: {
      keywords: ["instructor", "professor", "man", "human"],
      char: "\uD83D\uDC68\u200D\uD83C\uDFEB",
      fitzpatrick_scale: true,
      category: "people"
    },
    woman_factory_worker: {
      keywords: ["assembly", "industrial", "woman", "human"],
      char: "\uD83D\uDC69\u200D\uD83C\uDFED",
      fitzpatrick_scale: true,
      category: "people"
    },
    man_factory_worker: {
      keywords: ["assembly", "industrial", "man", "human"],
      char: "\uD83D\uDC68\u200D\uD83C\uDFED",
      fitzpatrick_scale: true,
      category: "people"
    },
    woman_technologist: {
      keywords: ["coder", "developer", "engineer", "programmer", "software", "woman", "human", "laptop", "computer"],
      char: "\uD83D\uDC69\u200D\uD83D\uDCBB",
      fitzpatrick_scale: true,
      category: "people"
    },
    man_technologist: {
      keywords: ["coder", "developer", "engineer", "programmer", "software", "man", "human", "laptop", "computer"],
      char: "\uD83D\uDC68\u200D\uD83D\uDCBB",
      fitzpatrick_scale: true,
      category: "people"
    },
    woman_office_worker: {
      keywords: ["business", "manager", "woman", "human"],
      char: "\uD83D\uDC69\u200D\uD83D\uDCBC",
      fitzpatrick_scale: true,
      category: "people"
    },
    man_office_worker: {
      keywords: ["business", "manager", "man", "human"],
      char: "\uD83D\uDC68\u200D\uD83D\uDCBC",
      fitzpatrick_scale: true,
      category: "people"
    },
    woman_mechanic: {
      keywords: ["plumber", "woman", "human", "wrench"],
      char: "\uD83D\uDC69\u200D\uD83D\uDD27",
      fitzpatrick_scale: true,
      category: "people"
    },
    man_mechanic: {
      keywords: ["plumber", "man", "human", "wrench"],
      char: "\uD83D\uDC68\u200D\uD83D\uDD27",
      fitzpatrick_scale: true,
      category: "people"
    },
    woman_scientist: {
      keywords: ["biologist", "chemist", "engineer", "physicist", "woman", "human"],
      char: "\uD83D\uDC69\u200D\uD83D\uDD2C",
      fitzpatrick_scale: true,
      category: "people"
    },
    man_scientist: {
      keywords: ["biologist", "chemist", "engineer", "physicist", "man", "human"],
      char: "\uD83D\uDC68\u200D\uD83D\uDD2C",
      fitzpatrick_scale: true,
      category: "people"
    },
    woman_artist: {
      keywords: ["painter", "woman", "human"],
      char: "\uD83D\uDC69\u200D\uD83C\uDFA8",
      fitzpatrick_scale: true,
      category: "people"
    },
    man_artist: {
      keywords: ["painter", "man", "human"],
      char: "\uD83D\uDC68\u200D\uD83C\uDFA8",
      fitzpatrick_scale: true,
      category: "people"
    },
    woman_firefighter: {
      keywords: ["fireman", "woman", "human"],
      char: "\uD83D\uDC69\u200D\uD83D\uDE92",
      fitzpatrick_scale: true,
      category: "people"
    },
    man_firefighter: {
      keywords: ["fireman", "man", "human"],
      char: "\uD83D\uDC68\u200D\uD83D\uDE92",
      fitzpatrick_scale: true,
      category: "people"
    },
    woman_pilot: {
      keywords: ["aviator", "plane", "woman", "human"],
      char: "\uD83D\uDC69\u200D\u2708\uFE0F",
      fitzpatrick_scale: true,
      category: "people"
    },
    man_pilot: {
      keywords: ["aviator", "plane", "man", "human"],
      char: "\uD83D\uDC68\u200D\u2708\uFE0F",
      fitzpatrick_scale: true,
      category: "people"
    },
    woman_astronaut: {
      keywords: ["space", "rocket", "woman", "human"],
      char: "\uD83D\uDC69\u200D\uD83D\uDE80",
      fitzpatrick_scale: true,
      category: "people"
    },
    man_astronaut: {
      keywords: ["space", "rocket", "man", "human"],
      char: "\uD83D\uDC68\u200D\uD83D\uDE80",
      fitzpatrick_scale: true,
      category: "people"
    },
    woman_judge: {
      keywords: ["justice", "court", "woman", "human"],
      char: "\uD83D\uDC69\u200D\u2696\uFE0F",
      fitzpatrick_scale: true,
      category: "people"
    },
    man_judge: {
      keywords: ["justice", "court", "man", "human"],
      char: "\uD83D\uDC68\u200D\u2696\uFE0F",
      fitzpatrick_scale: true,
      category: "people"
    },
    woman_superhero: {
      keywords: ["woman", "female", "good", "heroine", "superpowers"],
      char: "\uD83E\uDDB8\u200D\u2640\uFE0F",
      fitzpatrick_scale: true,
      category: "people"
    },
    man_superhero: {
      keywords: ["man", "male", "good", "hero", "superpowers"],
      char: "\uD83E\uDDB8\u200D\u2642\uFE0F",
      fitzpatrick_scale: true,
      category: "people"
    },
    woman_supervillain: {
      keywords: ["woman", "female", "evil", "bad", "criminal", "heroine", "superpowers"],
      char: "\uD83E\uDDB9\u200D\u2640\uFE0F",
      fitzpatrick_scale: true,
      category: "people"
    },
    man_supervillain: {
      keywords: ["man", "male", "evil", "bad", "criminal", "hero", "superpowers"],
      char: "\uD83E\uDDB9\u200D\u2642\uFE0F",
      fitzpatrick_scale: true,
      category: "people"
    },
    mrs_claus: {
      keywords: ["woman", "female", "xmas", "mother christmas"],
      char: "\uD83E\uDD36",
      fitzpatrick_scale: true,
      category: "people"
    },
    santa: {
      keywords: ["festival", "man", "male", "xmas", "father christmas"],
      char: "\uD83C\uDF85",
      fitzpatrick_scale: true,
      category: "people"
    },
    sorceress: {
      keywords: ["woman", "female", "mage", "witch"],
      char: "\uD83E\uDDD9\u200D\u2640\uFE0F",
      fitzpatrick_scale: true,
      category: "people"
    },
    wizard: {
      keywords: ["man", "male", "mage", "sorcerer"],
      char: "\uD83E\uDDD9\u200D\u2642\uFE0F",
      fitzpatrick_scale: true,
      category: "people"
    },
    woman_elf: {
      keywords: ["woman", "female"],
      char: "\uD83E\uDDDD\u200D\u2640\uFE0F",
      fitzpatrick_scale: true,
      category: "people"
    },
    man_elf: {
      keywords: ["man", "male"],
      char: "\uD83E\uDDDD\u200D\u2642\uFE0F",
      fitzpatrick_scale: true,
      category: "people"
    },
    woman_vampire: {
      keywords: ["woman", "female"],
      char: "\uD83E\uDDDB\u200D\u2640\uFE0F",
      fitzpatrick_scale: true,
      category: "people"
    },
    man_vampire: {
      keywords: ["man", "male", "dracula"],
      char: "\uD83E\uDDDB\u200D\u2642\uFE0F",
      fitzpatrick_scale: true,
      category: "people"
    },
    woman_zombie: {
      keywords: ["woman", "female", "undead", "walking dead"],
      char: "\uD83E\uDDDF\u200D\u2640\uFE0F",
      fitzpatrick_scale: false,
      category: "people"
    },
    man_zombie: {
      keywords: ["man", "male", "dracula", "undead", "walking dead"],
      char: "\uD83E\uDDDF\u200D\u2642\uFE0F",
      fitzpatrick_scale: false,
      category: "people"
    },
    woman_genie: {
      keywords: ["woman", "female"],
      char: "\uD83E\uDDDE\u200D\u2640\uFE0F",
      fitzpatrick_scale: false,
      category: "people"
    },
    man_genie: {
      keywords: ["man", "male"],
      char: "\uD83E\uDDDE\u200D\u2642\uFE0F",
      fitzpatrick_scale: false,
      category: "people"
    },
    mermaid: {
      keywords: ["woman", "female", "merwoman", "ariel"],
      char: "\uD83E\uDDDC\u200D\u2640\uFE0F",
      fitzpatrick_scale: true,
      category: "people"
    },
    merman: {
      keywords: ["man", "male", "triton"],
      char: "\uD83E\uDDDC\u200D\u2642\uFE0F",
      fitzpatrick_scale: true,
      category: "people"
    },
    woman_fairy: {
      keywords: ["woman", "female"],
      char: "\uD83E\uDDDA\u200D\u2640\uFE0F",
      fitzpatrick_scale: true,
      category: "people"
    },
    man_fairy: {
      keywords: ["man", "male"],
      char: "\uD83E\uDDDA\u200D\u2642\uFE0F",
      fitzpatrick_scale: true,
      category: "people"
    },
    angel: {
      keywords: ["heaven", "wings", "halo"],
      char: "\uD83D\uDC7C",
      fitzpatrick_scale: true,
      category: "people"
    },
    pregnant_woman: {
      keywords: ["baby"],
      char: "\uD83E\uDD30",
      fitzpatrick_scale: true,
      category: "people"
    },
    breastfeeding: {
      keywords: ["nursing", "baby"],
      char: "\uD83E\uDD31",
      fitzpatrick_scale: true,
      category: "people"
    },
    princess: {
      keywords: ["girl", "woman", "female", "blond", "crown", "royal", "queen"],
      char: "\uD83D\uDC78",
      fitzpatrick_scale: true,
      category: "people"
    },
    prince: {
      keywords: ["boy", "man", "male", "crown", "royal", "king"],
      char: "\uD83E\uDD34",
      fitzpatrick_scale: true,
      category: "people"
    },
    bride_with_veil: {
      keywords: ["couple", "marriage", "wedding", "woman", "bride"],
      char: "\uD83D\uDC70",
      fitzpatrick_scale: true,
      category: "people"
    },
    man_in_tuxedo: {
      keywords: ["couple", "marriage", "wedding", "groom"],
      char: "\uD83E\uDD35",
      fitzpatrick_scale: true,
      category: "people"
    },
    running_woman: {
      keywords: ["woman", "walking", "exercise", "race", "running", "female"],
      char: "\uD83C\uDFC3\u200D\u2640\uFE0F",
      fitzpatrick_scale: true,
      category: "people"
    },
    running_man: {
      keywords: ["man", "walking", "exercise", "race", "running"],
      char: "\uD83C\uDFC3",
      fitzpatrick_scale: true,
      category: "people"
    },
    walking_woman: {
      keywords: ["human", "feet", "steps", "woman", "female"],
      char: "\uD83D\uDEB6\u200D\u2640\uFE0F",
      fitzpatrick_scale: true,
      category: "people"
    },
    walking_man: {
      keywords: ["human", "feet", "steps"],
      char: "\uD83D\uDEB6",
      fitzpatrick_scale: true,
      category: "people"
    },
    dancer: {
      keywords: ["female", "girl", "woman", "fun"],
      char: "\uD83D\uDC83",
      fitzpatrick_scale: true,
      category: "people"
    },
    man_dancing: {
      keywords: ["male", "boy", "fun", "dancer"],
      char: "\uD83D\uDD7A",
      fitzpatrick_scale: true,
      category: "people"
    },
    dancing_women: {
      keywords: ["female", "bunny", "women", "girls"],
      char: "\uD83D\uDC6F",
      fitzpatrick_scale: false,
      category: "people"
    },
    dancing_men: {
      keywords: ["male", "bunny", "men", "boys"],
      char: "\uD83D\uDC6F\u200D\u2642\uFE0F",
      fitzpatrick_scale: false,
      category: "people"
    },
    couple: {
      keywords: ["pair", "people", "human", "love", "date", "dating", "like", "affection", "valentines", "marriage"],
      char: "\uD83D\uDC6B",
      fitzpatrick_scale: false,
      category: "people"
    },
    two_men_holding_hands: {
      keywords: ["pair", "couple", "love", "like", "bromance", "friendship", "people", "human"],
      char: "\uD83D\uDC6C",
      fitzpatrick_scale: false,
      category: "people"
    },
    two_women_holding_hands: {
      keywords: ["pair", "friendship", "couple", "love", "like", "female", "people", "human"],
      char: "\uD83D\uDC6D",
      fitzpatrick_scale: false,
      category: "people"
    },
    bowing_woman: {
      keywords: ["woman", "female", "girl"],
      char: "\uD83D\uDE47\u200D\u2640\uFE0F",
      fitzpatrick_scale: true,
      category: "people"
    },
    bowing_man: {
      keywords: ["man", "male", "boy"],
      char: "\uD83D\uDE47",
      fitzpatrick_scale: true,
      category: "people"
    },
    man_facepalming: {
      keywords: ["man", "male", "boy", "disbelief"],
      char: "\uD83E\uDD26\u200D\u2642\uFE0F",
      fitzpatrick_scale: true,
      category: "people"
    },
    woman_facepalming: {
      keywords: ["woman", "female", "girl", "disbelief"],
      char: "\uD83E\uDD26\u200D\u2640\uFE0F",
      fitzpatrick_scale: true,
      category: "people"
    },
    woman_shrugging: {
      keywords: ["woman", "female", "girl", "confused", "indifferent", "doubt"],
      char: "\uD83E\uDD37",
      fitzpatrick_scale: true,
      category: "people"
    },
    man_shrugging: {
      keywords: ["man", "male", "boy", "confused", "indifferent", "doubt"],
      char: "\uD83E\uDD37\u200D\u2642\uFE0F",
      fitzpatrick_scale: true,
      category: "people"
    },
    tipping_hand_woman: {
      keywords: ["female", "girl", "woman", "human", "information"],
      char: "\uD83D\uDC81",
      fitzpatrick_scale: true,
      category: "people"
    },
    tipping_hand_man: {
      keywords: ["male", "boy", "man", "human", "information"],
      char: "\uD83D\uDC81\u200D\u2642\uFE0F",
      fitzpatrick_scale: true,
      category: "people"
    },
    no_good_woman: {
      keywords: ["female", "girl", "woman", "nope"],
      char: "\uD83D\uDE45",
      fitzpatrick_scale: true,
      category: "people"
    },
    no_good_man: {
      keywords: ["male", "boy", "man", "nope"],
      char: "\uD83D\uDE45\u200D\u2642\uFE0F",
      fitzpatrick_scale: true,
      category: "people"
    },
    ok_woman: {
      keywords: ["women", "girl", "female", "pink", "human", "woman"],
      char: "\uD83D\uDE46",
      fitzpatrick_scale: true,
      category: "people"
    },
    ok_man: {
      keywords: ["men", "boy", "male", "blue", "human", "man"],
      char: "\uD83D\uDE46\u200D\u2642\uFE0F",
      fitzpatrick_scale: true,
      category: "people"
    },
    raising_hand_woman: {
      keywords: ["female", "girl", "woman"],
      char: "\uD83D\uDE4B",
      fitzpatrick_scale: true,
      category: "people"
    },
    raising_hand_man: {
      keywords: ["male", "boy", "man"],
      char: "\uD83D\uDE4B\u200D\u2642\uFE0F",
      fitzpatrick_scale: true,
      category: "people"
    },
    pouting_woman: {
      keywords: ["female", "girl", "woman"],
      char: "\uD83D\uDE4E",
      fitzpatrick_scale: true,
      category: "people"
    },
    pouting_man: {
      keywords: ["male", "boy", "man"],
      char: "\uD83D\uDE4E\u200D\u2642\uFE0F",
      fitzpatrick_scale: true,
      category: "people"
    },
    frowning_woman: {
      keywords: ["female", "girl", "woman", "sad", "depressed", "discouraged", "unhappy"],
      char: "\uD83D\uDE4D",
      fitzpatrick_scale: true,
      category: "people"
    },
    frowning_man: {
      keywords: ["male", "boy", "man", "sad", "depressed", "discouraged", "unhappy"],
      char: "\uD83D\uDE4D\u200D\u2642\uFE0F",
      fitzpatrick_scale: true,
      category: "people"
    },
    haircut_woman: {
      keywords: ["female", "girl", "woman"],
      char: "\uD83D\uDC87",
      fitzpatrick_scale: true,
      category: "people"
    },
    haircut_man: {
      keywords: ["male", "boy", "man"],
      char: "\uD83D\uDC87\u200D\u2642\uFE0F",
      fitzpatrick_scale: true,
      category: "people"
    },
    massage_woman: {
      keywords: ["female", "girl", "woman", "head"],
      char: "\uD83D\uDC86",
      fitzpatrick_scale: true,
      category: "people"
    },
    massage_man: {
      keywords: ["male", "boy", "man", "head"],
      char: "\uD83D\uDC86\u200D\u2642\uFE0F",
      fitzpatrick_scale: true,
      category: "people"
    },
    woman_in_steamy_room: {
      keywords: ["female", "woman", "spa", "steamroom", "sauna"],
      char: "\uD83E\uDDD6\u200D\u2640\uFE0F",
      fitzpatrick_scale: true,
      category: "people"
    },
    man_in_steamy_room: {
      keywords: ["male", "man", "spa", "steamroom", "sauna"],
      char: "\uD83E\uDDD6\u200D\u2642\uFE0F",
      fitzpatrick_scale: true,
      category: "people"
    },
    couple_with_heart_woman_man: {
      keywords: ["pair", "love", "like", "affection", "human", "dating", "valentines", "marriage"],
      char: "\uD83D\uDC91",
      fitzpatrick_scale: false,
      category: "people"
    },
    couple_with_heart_woman_woman: {
      keywords: ["pair", "love", "like", "affection", "human", "dating", "valentines", "marriage"],
      char: "\uD83D\uDC69\u200D\u2764\uFE0F\u200D\uD83D\uDC69",
      fitzpatrick_scale: false,
      category: "people"
    },
    couple_with_heart_man_man: {
      keywords: ["pair", "love", "like", "affection", "human", "dating", "valentines", "marriage"],
      char: "\uD83D\uDC68\u200D\u2764\uFE0F\u200D\uD83D\uDC68",
      fitzpatrick_scale: false,
      category: "people"
    },
    couplekiss_man_woman: {
      keywords: ["pair", "valentines", "love", "like", "dating", "marriage"],
      char: "\uD83D\uDC8F",
      fitzpatrick_scale: false,
      category: "people"
    },
    couplekiss_woman_woman: {
      keywords: ["pair", "valentines", "love", "like", "dating", "marriage"],
      char: "\uD83D\uDC69\u200D\u2764\uFE0F\u200D\uD83D\uDC8B\u200D\uD83D\uDC69",
      fitzpatrick_scale: false,
      category: "people"
    },
    couplekiss_man_man: {
      keywords: ["pair", "valentines", "love", "like", "dating", "marriage"],
      char: "\uD83D\uDC68\u200D\u2764\uFE0F\u200D\uD83D\uDC8B\u200D\uD83D\uDC68",
      fitzpatrick_scale: false,
      category: "people"
    },
    family_man_woman_boy: {
      keywords: ["home", "parents", "child", "mom", "dad", "father", "mother", "people", "human"],
      char: "\uD83D\uDC6A",
      fitzpatrick_scale: false,
      category: "people"
    },
    family_man_woman_girl: {
      keywords: ["home", "parents", "people", "human", "child"],
      char: "\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67",
      fitzpatrick_scale: false,
      category: "people"
    },
    family_man_woman_girl_boy: {
      keywords: ["home", "parents", "people", "human", "children"],
      char: "\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67\u200D\uD83D\uDC66",
      fitzpatrick_scale: false,
      category: "people"
    },
    family_man_woman_boy_boy: {
      keywords: ["home", "parents", "people", "human", "children"],
      char: "\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC66\u200D\uD83D\uDC66",
      fitzpatrick_scale: false,
      category: "people"
    },
    family_man_woman_girl_girl: {
      keywords: ["home", "parents", "people", "human", "children"],
      char: "\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67\u200D\uD83D\uDC67",
      fitzpatrick_scale: false,
      category: "people"
    },
    family_woman_woman_boy: {
      keywords: ["home", "parents", "people", "human", "children"],
      char: "\uD83D\uDC69\u200D\uD83D\uDC69\u200D\uD83D\uDC66",
      fitzpatrick_scale: false,
      category: "people"
    },
    family_woman_woman_girl: {
      keywords: ["home", "parents", "people", "human", "children"],
      char: "\uD83D\uDC69\u200D\uD83D\uDC69\u200D\uD83D\uDC67",
      fitzpatrick_scale: false,
      category: "people"
    },
    family_woman_woman_girl_boy: {
      keywords: ["home", "parents", "people", "human", "children"],
      char: "\uD83D\uDC69\u200D\uD83D\uDC69\u200D\uD83D\uDC67\u200D\uD83D\uDC66",
      fitzpatrick_scale: false,
      category: "people"
    },
    family_woman_woman_boy_boy: {
      keywords: ["home", "parents", "people", "human", "children"],
      char: "\uD83D\uDC69\u200D\uD83D\uDC69\u200D\uD83D\uDC66\u200D\uD83D\uDC66",
      fitzpatrick_scale: false,
      category: "people"
    },
    family_woman_woman_girl_girl: {
      keywords: ["home", "parents", "people", "human", "children"],
      char: "\uD83D\uDC69\u200D\uD83D\uDC69\u200D\uD83D\uDC67\u200D\uD83D\uDC67",
      fitzpatrick_scale: false,
      category: "people"
    },
    family_man_man_boy: {
      keywords: ["home", "parents", "people", "human", "children"],
      char: "\uD83D\uDC68\u200D\uD83D\uDC68\u200D\uD83D\uDC66",
      fitzpatrick_scale: false,
      category: "people"
    },
    family_man_man_girl: {
      keywords: ["home", "parents", "people", "human", "children"],
      char: "\uD83D\uDC68\u200D\uD83D\uDC68\u200D\uD83D\uDC67",
      fitzpatrick_scale: false,
      category: "people"
    },
    family_man_man_girl_boy: {
      keywords: ["home", "parents", "people", "human", "children"],
      char: "\uD83D\uDC68\u200D\uD83D\uDC68\u200D\uD83D\uDC67\u200D\uD83D\uDC66",
      fitzpatrick_scale: false,
      category: "people"
    },
    family_man_man_boy_boy: {
      keywords: ["home", "parents", "people", "human", "children"],
      char: "\uD83D\uDC68\u200D\uD83D\uDC68\u200D\uD83D\uDC66\u200D\uD83D\uDC66",
      fitzpatrick_scale: false,
      category: "people"
    },
    family_man_man_girl_girl: {
      keywords: ["home", "parents", "people", "human", "children"],
      char: "\uD83D\uDC68\u200D\uD83D\uDC68\u200D\uD83D\uDC67\u200D\uD83D\uDC67",
      fitzpatrick_scale: false,
      category: "people"
    },
    family_woman_boy: {
      keywords: ["home", "parent", "people", "human", "child"],
      char: "\uD83D\uDC69\u200D\uD83D\uDC66",
      fitzpatrick_scale: false,
      category: "people"
    },
    family_woman_girl: {
      keywords: ["home", "parent", "people", "human", "child"],
      char: "\uD83D\uDC69\u200D\uD83D\uDC67",
      fitzpatrick_scale: false,
      category: "people"
    },
    family_woman_girl_boy: {
      keywords: ["home", "parent", "people", "human", "children"],
      char: "\uD83D\uDC69\u200D\uD83D\uDC67\u200D\uD83D\uDC66",
      fitzpatrick_scale: false,
      category: "people"
    },
    family_woman_boy_boy: {
      keywords: ["home", "parent", "people", "human", "children"],
      char: "\uD83D\uDC69\u200D\uD83D\uDC66\u200D\uD83D\uDC66",
      fitzpatrick_scale: false,
      category: "people"
    },
    family_woman_girl_girl: {
      keywords: ["home", "parent", "people", "human", "children"],
      char: "\uD83D\uDC69\u200D\uD83D\uDC67\u200D\uD83D\uDC67",
      fitzpatrick_scale: false,
      category: "people"
    },
    family_man_boy: {
      keywords: ["home", "parent", "people", "human", "child"],
      char: "\uD83D\uDC68\u200D\uD83D\uDC66",
      fitzpatrick_scale: false,
      category: "people"
    },
    family_man_girl: {
      keywords: ["home", "parent", "people", "human", "child"],
      char: "\uD83D\uDC68\u200D\uD83D\uDC67",
      fitzpatrick_scale: false,
      category: "people"
    },
    family_man_girl_boy: {
      keywords: ["home", "parent", "people", "human", "children"],
      char: "\uD83D\uDC68\u200D\uD83D\uDC67\u200D\uD83D\uDC66",
      fitzpatrick_scale: false,
      category: "people"
    },
    family_man_boy_boy: {
      keywords: ["home", "parent", "people", "human", "children"],
      char: "\uD83D\uDC68\u200D\uD83D\uDC66\u200D\uD83D\uDC66",
      fitzpatrick_scale: false,
      category: "people"
    },
    family_man_girl_girl: {
      keywords: ["home", "parent", "people", "human", "children"],
      char: "\uD83D\uDC68\u200D\uD83D\uDC67\u200D\uD83D\uDC67",
      fitzpatrick_scale: false,
      category: "people"
    },
    yarn: {
      keywords: ["ball", "crochet", "knit"],
      char: "\uD83E\uDDF6",
      fitzpatrick_scale: false,
      category: "people"
    },
    thread: {
      keywords: ["needle", "sewing", "spool", "string"],
      char: "\uD83E\uDDF5",
      fitzpatrick_scale: false,
      category: "people"
    },
    coat: {
      keywords: ["jacket"],
      char: "\uD83E\uDDE5",
      fitzpatrick_scale: false,
      category: "people"
    },
    labcoat: {
      keywords: ["doctor", "experiment", "scientist", "chemist"],
      char: "\uD83E\uDD7C",
      fitzpatrick_scale: false,
      category: "people"
    },
    womans_clothes: {
      keywords: ["fashion", "shopping_bags", "female"],
      char: "\uD83D\uDC5A",
      fitzpatrick_scale: false,
      category: "people"
    },
    tshirt: {
      keywords: ["fashion", "cloth", "casual", "shirt", "tee"],
      char: "\uD83D\uDC55",
      fitzpatrick_scale: false,
      category: "people"
    },
    jeans: {
      keywords: ["fashion", "shopping"],
      char: "\uD83D\uDC56",
      fitzpatrick_scale: false,
      category: "people"
    },
    necktie: {
      keywords: ["shirt", "suitup", "formal", "fashion", "cloth", "business"],
      char: "\uD83D\uDC54",
      fitzpatrick_scale: false,
      category: "people"
    },
    dress: {
      keywords: ["clothes", "fashion", "shopping"],
      char: "\uD83D\uDC57",
      fitzpatrick_scale: false,
      category: "people"
    },
    bikini: {
      keywords: ["swimming", "female", "woman", "girl", "fashion", "beach", "summer"],
      char: "\uD83D\uDC59",
      fitzpatrick_scale: false,
      category: "people"
    },
    kimono: {
      keywords: ["dress", "fashion", "women", "female", "japanese"],
      char: "\uD83D\uDC58",
      fitzpatrick_scale: false,
      category: "people"
    },
    lipstick: {
      keywords: ["female", "girl", "fashion", "woman"],
      char: "\uD83D\uDC84",
      fitzpatrick_scale: false,
      category: "people"
    },
    kiss: {
      keywords: ["face", "lips", "love", "like", "affection", "valentines"],
      char: "\uD83D\uDC8B",
      fitzpatrick_scale: false,
      category: "people"
    },
    footprints: {
      keywords: ["feet", "tracking", "walking", "beach"],
      char: "\uD83D\uDC63",
      fitzpatrick_scale: false,
      category: "people"
    },
    flat_shoe: {
      keywords: ["ballet", "slip-on", "slipper"],
      char: "\uD83E\uDD7F",
      fitzpatrick_scale: false,
      category: "people"
    },
    high_heel: {
      keywords: ["fashion", "shoes", "female", "pumps", "stiletto"],
      char: "\uD83D\uDC60",
      fitzpatrick_scale: false,
      category: "people"
    },
    sandal: {
      keywords: ["shoes", "fashion", "flip flops"],
      char: "\uD83D\uDC61",
      fitzpatrick_scale: false,
      category: "people"
    },
    boot: {
      keywords: ["shoes", "fashion"],
      char: "\uD83D\uDC62",
      fitzpatrick_scale: false,
      category: "people"
    },
    mans_shoe: {
      keywords: ["fashion", "male"],
      char: "\uD83D\uDC5E",
      fitzpatrick_scale: false,
      category: "people"
    },
    athletic_shoe: {
      keywords: ["shoes", "sports", "sneakers"],
      char: "\uD83D\uDC5F",
      fitzpatrick_scale: false,
      category: "people"
    },
    hiking_boot: {
      keywords: ["backpacking", "camping", "hiking"],
      char: "\uD83E\uDD7E",
      fitzpatrick_scale: false,
      category: "people"
    },
    socks: {
      keywords: ["stockings", "clothes"],
      char: "\uD83E\uDDE6",
      fitzpatrick_scale: false,
      category: "people"
    },
    gloves: {
      keywords: ["hands", "winter", "clothes"],
      char: "\uD83E\uDDE4",
      fitzpatrick_scale: false,
      category: "people"
    },
    scarf: {
      keywords: ["neck", "winter", "clothes"],
      char: "\uD83E\uDDE3",
      fitzpatrick_scale: false,
      category: "people"
    },
    womans_hat: {
      keywords: ["fashion", "accessories", "female", "lady", "spring"],
      char: "\uD83D\uDC52",
      fitzpatrick_scale: false,
      category: "people"
    },
    tophat: {
      keywords: ["magic", "gentleman", "classy", "circus"],
      char: "\uD83C\uDFA9",
      fitzpatrick_scale: false,
      category: "people"
    },
    billed_hat: {
      keywords: ["cap", "baseball"],
      char: "\uD83E\uDDE2",
      fitzpatrick_scale: false,
      category: "people"
    },
    rescue_worker_helmet: {
      keywords: ["construction", "build"],
      char: "\u26D1",
      fitzpatrick_scale: false,
      category: "people"
    },
    mortar_board: {
      keywords: ["school", "college", "degree", "university", "graduation", "cap", "hat", "legal", "learn", "education"],
      char: "\uD83C\uDF93",
      fitzpatrick_scale: false,
      category: "people"
    },
    crown: {
      keywords: ["king", "kod", "leader", "royalty", "lord"],
      char: "\uD83D\uDC51",
      fitzpatrick_scale: false,
      category: "people"
    },
    school_satchel: {
      keywords: ["student", "education", "bag", "backpack"],
      char: "\uD83C\uDF92",
      fitzpatrick_scale: false,
      category: "people"
    },
    luggage: {
      keywords: ["packing", "travel"],
      char: "\uD83E\uDDF3",
      fitzpatrick_scale: false,
      category: "people"
    },
    pouch: {
      keywords: ["bag", "accessories", "shopping"],
      char: "\uD83D\uDC5D",
      fitzpatrick_scale: false,
      category: "people"
    },
    purse: {
      keywords: ["fashion", "accessories", "money", "sales", "shopping"],
      char: "\uD83D\uDC5B",
      fitzpatrick_scale: false,
      category: "people"
    },
    handbag: {
      keywords: ["fashion", "accessory", "accessories", "shopping"],
      char: "\uD83D\uDC5C",
      fitzpatrick_scale: false,
      category: "people"
    },
    briefcase: {
      keywords: ["business", "documents", "work", "law", "legal", "job", "career"],
      char: "\uD83D\uDCBC",
      fitzpatrick_scale: false,
      category: "people"
    },
    eyeglasses: {
      keywords: ["fashion", "accessories", "eyesight", "nerdy", "dork", "geek"],
      char: "\uD83D\uDC53",
      fitzpatrick_scale: false,
      category: "people"
    },
    dark_sunglasses: {
      keywords: ["face", "cool", "accessories"],
      char: "\uD83D\uDD76",
      fitzpatrick_scale: false,
      category: "people"
    },
    goggles: {
      keywords: ["eyes", "protection", "safety"],
      char: "\uD83E\uDD7D",
      fitzpatrick_scale: false,
      category: "people"
    },
    ring: {
      keywords: ["wedding", "propose", "marriage", "valentines", "diamond", "fashion", "jewelry", "gem", "engagement"],
      char: "\uD83D\uDC8D",
      fitzpatrick_scale: false,
      category: "people"
    },
    closed_umbrella: {
      keywords: ["weather", "rain", "drizzle"],
      char: "\uD83C\uDF02",
      fitzpatrick_scale: false,
      category: "people"
    },
    dog: {
      keywords: ["animal", "friend", "nature", "woof", "puppy", "pet", "faithful"],
      char: "\uD83D\uDC36",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    cat: {
      keywords: ["animal", "meow", "nature", "pet", "kitten"],
      char: "\uD83D\uDC31",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    mouse: {
      keywords: ["animal", "nature", "cheese_wedge", "rodent"],
      char: "\uD83D\uDC2D",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    hamster: {
      keywords: ["animal", "nature"],
      char: "\uD83D\uDC39",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    rabbit: {
      keywords: ["animal", "nature", "pet", "spring", "magic", "bunny"],
      char: "\uD83D\uDC30",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    fox_face: {
      keywords: ["animal", "nature", "face"],
      char: "\uD83E\uDD8A",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    bear: {
      keywords: ["animal", "nature", "wild"],
      char: "\uD83D\uDC3B",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    panda_face: {
      keywords: ["animal", "nature", "panda"],
      char: "\uD83D\uDC3C",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    koala: {
      keywords: ["animal", "nature"],
      char: "\uD83D\uDC28",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    tiger: {
      keywords: ["animal", "cat", "danger", "wild", "nature", "roar"],
      char: "\uD83D\uDC2F",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    lion: {
      keywords: ["animal", "nature"],
      char: "\uD83E\uDD81",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    cow: {
      keywords: ["beef", "ox", "animal", "nature", "moo", "milk"],
      char: "\uD83D\uDC2E",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    pig: {
      keywords: ["animal", "oink", "nature"],
      char: "\uD83D\uDC37",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    pig_nose: {
      keywords: ["animal", "oink"],
      char: "\uD83D\uDC3D",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    frog: {
      keywords: ["animal", "nature", "croak", "toad"],
      char: "\uD83D\uDC38",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    squid: {
      keywords: ["animal", "nature", "ocean", "sea"],
      char: "\uD83E\uDD91",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    octopus: {
      keywords: ["animal", "creature", "ocean", "sea", "nature", "beach"],
      char: "\uD83D\uDC19",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    shrimp: {
      keywords: ["animal", "ocean", "nature", "seafood"],
      char: "\uD83E\uDD90",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    monkey_face: {
      keywords: ["animal", "nature", "circus"],
      char: "\uD83D\uDC35",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    gorilla: {
      keywords: ["animal", "nature", "circus"],
      char: "\uD83E\uDD8D",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    see_no_evil: {
      keywords: ["monkey", "animal", "nature", "haha"],
      char: "\uD83D\uDE48",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    hear_no_evil: {
      keywords: ["animal", "monkey", "nature"],
      char: "\uD83D\uDE49",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    speak_no_evil: {
      keywords: ["monkey", "animal", "nature", "omg"],
      char: "\uD83D\uDE4A",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    monkey: {
      keywords: ["animal", "nature", "banana", "circus"],
      char: "\uD83D\uDC12",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    chicken: {
      keywords: ["animal", "cluck", "nature", "bird"],
      char: "\uD83D\uDC14",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    penguin: {
      keywords: ["animal", "nature"],
      char: "\uD83D\uDC27",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    bird: {
      keywords: ["animal", "nature", "fly", "tweet", "spring"],
      char: "\uD83D\uDC26",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    baby_chick: {
      keywords: ["animal", "chicken", "bird"],
      char: "\uD83D\uDC24",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    hatching_chick: {
      keywords: ["animal", "chicken", "egg", "born", "baby", "bird"],
      char: "\uD83D\uDC23",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    hatched_chick: {
      keywords: ["animal", "chicken", "baby", "bird"],
      char: "\uD83D\uDC25",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    duck: {
      keywords: ["animal", "nature", "bird", "mallard"],
      char: "\uD83E\uDD86",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    eagle: {
      keywords: ["animal", "nature", "bird"],
      char: "\uD83E\uDD85",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    owl: {
      keywords: ["animal", "nature", "bird", "hoot"],
      char: "\uD83E\uDD89",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    bat: {
      keywords: ["animal", "nature", "blind", "vampire"],
      char: "\uD83E\uDD87",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    wolf: {
      keywords: ["animal", "nature", "wild"],
      char: "\uD83D\uDC3A",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    boar: {
      keywords: ["animal", "nature"],
      char: "\uD83D\uDC17",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    horse: {
      keywords: ["animal", "brown", "nature"],
      char: "\uD83D\uDC34",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    unicorn: {
      keywords: ["animal", "nature", "mystical"],
      char: "\uD83E\uDD84",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    honeybee: {
      keywords: ["animal", "insect", "nature", "bug", "spring", "honey"],
      char: "\uD83D\uDC1D",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    bug: {
      keywords: ["animal", "insect", "nature", "worm"],
      char: "\uD83D\uDC1B",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    butterfly: {
      keywords: ["animal", "insect", "nature", "caterpillar"],
      char: "\uD83E\uDD8B",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    snail: {
      keywords: ["slow", "animal", "shell"],
      char: "\uD83D\uDC0C",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    beetle: {
      keywords: ["animal", "insect", "nature", "ladybug"],
      char: "\uD83D\uDC1E",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    ant: {
      keywords: ["animal", "insect", "nature", "bug"],
      char: "\uD83D\uDC1C",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    grasshopper: {
      keywords: ["animal", "cricket", "chirp"],
      char: "\uD83E\uDD97",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    spider: {
      keywords: ["animal", "arachnid"],
      char: "\uD83D\uDD77",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    scorpion: {
      keywords: ["animal", "arachnid"],
      char: "\uD83E\uDD82",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    crab: {
      keywords: ["animal", "crustacean"],
      char: "\uD83E\uDD80",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    snake: {
      keywords: ["animal", "evil", "nature", "hiss", "python"],
      char: "\uD83D\uDC0D",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    lizard: {
      keywords: ["animal", "nature", "reptile"],
      char: "\uD83E\uDD8E",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    "t-rex": {
      keywords: ["animal", "nature", "dinosaur", "tyrannosaurus", "extinct"],
      char: "\uD83E\uDD96",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    sauropod: {
      keywords: ["animal", "nature", "dinosaur", "brachiosaurus", "brontosaurus", "diplodocus", "extinct"],
      char: "\uD83E\uDD95",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    turtle: {
      keywords: ["animal", "slow", "nature", "tortoise"],
      char: "\uD83D\uDC22",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    tropical_fish: {
      keywords: ["animal", "swim", "ocean", "beach", "nemo"],
      char: "\uD83D\uDC20",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    fish: {
      keywords: ["animal", "food", "nature"],
      char: "\uD83D\uDC1F",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    blowfish: {
      keywords: ["animal", "nature", "food", "sea", "ocean"],
      char: "\uD83D\uDC21",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    dolphin: {
      keywords: ["animal", "nature", "fish", "sea", "ocean", "flipper", "fins", "beach"],
      char: "\uD83D\uDC2C",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    shark: {
      keywords: ["animal", "nature", "fish", "sea", "ocean", "jaws", "fins", "beach"],
      char: "\uD83E\uDD88",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    whale: {
      keywords: ["animal", "nature", "sea", "ocean"],
      char: "\uD83D\uDC33",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    whale2: {
      keywords: ["animal", "nature", "sea", "ocean"],
      char: "\uD83D\uDC0B",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    crocodile: {
      keywords: ["animal", "nature", "reptile", "lizard", "alligator"],
      char: "\uD83D\uDC0A",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    leopard: {
      keywords: ["animal", "nature"],
      char: "\uD83D\uDC06",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    zebra: {
      keywords: ["animal", "nature", "stripes", "safari"],
      char: "\uD83E\uDD93",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    tiger2: {
      keywords: ["animal", "nature", "roar"],
      char: "\uD83D\uDC05",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    water_buffalo: {
      keywords: ["animal", "nature", "ox", "cow"],
      char: "\uD83D\uDC03",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    ox: {
      keywords: ["animal", "cow", "beef"],
      char: "\uD83D\uDC02",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    cow2: {
      keywords: ["beef", "ox", "animal", "nature", "moo", "milk"],
      char: "\uD83D\uDC04",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    deer: {
      keywords: ["animal", "nature", "horns", "venison"],
      char: "\uD83E\uDD8C",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    dromedary_camel: {
      keywords: ["animal", "hot", "desert", "hump"],
      char: "\uD83D\uDC2A",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    camel: {
      keywords: ["animal", "nature", "hot", "desert", "hump"],
      char: "\uD83D\uDC2B",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    giraffe: {
      keywords: ["animal", "nature", "spots", "safari"],
      char: "\uD83E\uDD92",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    elephant: {
      keywords: ["animal", "nature", "nose", "th", "circus"],
      char: "\uD83D\uDC18",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    rhinoceros: {
      keywords: ["animal", "nature", "horn"],
      char: "\uD83E\uDD8F",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    goat: {
      keywords: ["animal", "nature"],
      char: "\uD83D\uDC10",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    ram: {
      keywords: ["animal", "sheep", "nature"],
      char: "\uD83D\uDC0F",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    sheep: {
      keywords: ["animal", "nature", "wool", "shipit"],
      char: "\uD83D\uDC11",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    racehorse: {
      keywords: ["animal", "gamble", "luck"],
      char: "\uD83D\uDC0E",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    pig2: {
      keywords: ["animal", "nature"],
      char: "\uD83D\uDC16",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    rat: {
      keywords: ["animal", "mouse", "rodent"],
      char: "\uD83D\uDC00",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    mouse2: {
      keywords: ["animal", "nature", "rodent"],
      char: "\uD83D\uDC01",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    rooster: {
      keywords: ["animal", "nature", "chicken"],
      char: "\uD83D\uDC13",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    turkey: {
      keywords: ["animal", "bird"],
      char: "\uD83E\uDD83",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    dove: {
      keywords: ["animal", "bird"],
      char: "\uD83D\uDD4A",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    dog2: {
      keywords: ["animal", "nature", "friend", "doge", "pet", "faithful"],
      char: "\uD83D\uDC15",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    poodle: {
      keywords: ["dog", "animal", "101", "nature", "pet"],
      char: "\uD83D\uDC29",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    cat2: {
      keywords: ["animal", "meow", "pet", "cats"],
      char: "\uD83D\uDC08",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    rabbit2: {
      keywords: ["animal", "nature", "pet", "magic", "spring"],
      char: "\uD83D\uDC07",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    chipmunk: {
      keywords: ["animal", "nature", "rodent", "squirrel"],
      char: "\uD83D\uDC3F",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    hedgehog: {
      keywords: ["animal", "nature", "spiny"],
      char: "\uD83E\uDD94",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    raccoon: {
      keywords: ["animal", "nature"],
      char: "\uD83E\uDD9D",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    llama: {
      keywords: ["animal", "nature", "alpaca"],
      char: "\uD83E\uDD99",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    hippopotamus: {
      keywords: ["animal", "nature"],
      char: "\uD83E\uDD9B",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    kangaroo: {
      keywords: ["animal", "nature", "australia", "joey", "hop", "marsupial"],
      char: "\uD83E\uDD98",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    badger: {
      keywords: ["animal", "nature", "honey"],
      char: "\uD83E\uDDA1",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    swan: {
      keywords: ["animal", "nature", "bird"],
      char: "\uD83E\uDDA2",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    peacock: {
      keywords: ["animal", "nature", "peahen", "bird"],
      char: "\uD83E\uDD9A",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    parrot: {
      keywords: ["animal", "nature", "bird", "pirate", "talk"],
      char: "\uD83E\uDD9C",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    lobster: {
      keywords: ["animal", "nature", "bisque", "claws", "seafood"],
      char: "\uD83E\uDD9E",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    mosquito: {
      keywords: ["animal", "nature", "insect", "malaria"],
      char: "\uD83E\uDD9F",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    paw_prints: {
      keywords: ["animal", "tracking", "footprints", "dog", "cat", "pet", "feet"],
      char: "\uD83D\uDC3E",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    dragon: {
      keywords: ["animal", "myth", "nature", "chinese", "green"],
      char: "\uD83D\uDC09",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    dragon_face: {
      keywords: ["animal", "myth", "nature", "chinese", "green"],
      char: "\uD83D\uDC32",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    cactus: {
      keywords: ["vegetable", "plant", "nature"],
      char: "\uD83C\uDF35",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    christmas_tree: {
      keywords: ["festival", "vacation", "december", "xmas", "celebration"],
      char: "\uD83C\uDF84",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    evergreen_tree: {
      keywords: ["plant", "nature"],
      char: "\uD83C\uDF32",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    deciduous_tree: {
      keywords: ["plant", "nature"],
      char: "\uD83C\uDF33",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    palm_tree: {
      keywords: ["plant", "vegetable", "nature", "summer", "beach", "mojito", "tropical"],
      char: "\uD83C\uDF34",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    seedling: {
      keywords: ["plant", "nature", "grass", "lawn", "spring"],
      char: "\uD83C\uDF31",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    herb: {
      keywords: ["vegetable", "plant", "medicine", "weed", "grass", "lawn"],
      char: "\uD83C\uDF3F",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    shamrock: {
      keywords: ["vegetable", "plant", "nature", "irish", "clover"],
      char: "\u2618",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    four_leaf_clover: {
      keywords: ["vegetable", "plant", "nature", "lucky", "irish"],
      char: "\uD83C\uDF40",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    bamboo: {
      keywords: ["plant", "nature", "vegetable", "panda", "pine_decoration"],
      char: "\uD83C\uDF8D",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    tanabata_tree: {
      keywords: ["plant", "nature", "branch", "summer"],
      char: "\uD83C\uDF8B",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    leaves: {
      keywords: ["nature", "plant", "tree", "vegetable", "grass", "lawn", "spring"],
      char: "\uD83C\uDF43",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    fallen_leaf: {
      keywords: ["nature", "plant", "vegetable", "leaves"],
      char: "\uD83C\uDF42",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    maple_leaf: {
      keywords: ["nature", "plant", "vegetable", "ca", "fall"],
      char: "\uD83C\uDF41",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    ear_of_rice: {
      keywords: ["nature", "plant"],
      char: "\uD83C\uDF3E",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    hibiscus: {
      keywords: ["plant", "vegetable", "flowers", "beach"],
      char: "\uD83C\uDF3A",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    sunflower: {
      keywords: ["nature", "plant", "fall"],
      char: "\uD83C\uDF3B",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    rose: {
      keywords: ["flowers", "valentines", "love", "spring"],
      char: "\uD83C\uDF39",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    wilted_flower: {
      keywords: ["plant", "nature", "flower"],
      char: "\uD83E\uDD40",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    tulip: {
      keywords: ["flowers", "plant", "nature", "summer", "spring"],
      char: "\uD83C\uDF37",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    blossom: {
      keywords: ["nature", "flowers", "yellow"],
      char: "\uD83C\uDF3C",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    cherry_blossom: {
      keywords: ["nature", "plant", "spring", "flower"],
      char: "\uD83C\uDF38",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    bouquet: {
      keywords: ["flowers", "nature", "spring"],
      char: "\uD83D\uDC90",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    mushroom: {
      keywords: ["plant", "vegetable"],
      char: "\uD83C\uDF44",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    chestnut: {
      keywords: ["food", "squirrel"],
      char: "\uD83C\uDF30",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    jack_o_lantern: {
      keywords: ["halloween", "light", "pumpkin", "creepy", "fall"],
      char: "\uD83C\uDF83",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    shell: {
      keywords: ["nature", "sea", "beach"],
      char: "\uD83D\uDC1A",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    spider_web: {
      keywords: ["animal", "insect", "arachnid", "silk"],
      char: "\uD83D\uDD78",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    earth_americas: {
      keywords: ["globe", "world", "USA", "international"],
      char: "\uD83C\uDF0E",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    earth_africa: {
      keywords: ["globe", "world", "international"],
      char: "\uD83C\uDF0D",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    earth_asia: {
      keywords: ["globe", "world", "east", "international"],
      char: "\uD83C\uDF0F",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    full_moon: {
      keywords: ["nature", "yellow", "twilight", "planet", "space", "night", "evening", "sleep"],
      char: "\uD83C\uDF15",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    waning_gibbous_moon: {
      keywords: ["nature", "twilight", "planet", "space", "night", "evening", "sleep", "waxing_gibbous_moon"],
      char: "\uD83C\uDF16",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    last_quarter_moon: {
      keywords: ["nature", "twilight", "planet", "space", "night", "evening", "sleep"],
      char: "\uD83C\uDF17",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    waning_crescent_moon: {
      keywords: ["nature", "twilight", "planet", "space", "night", "evening", "sleep"],
      char: "\uD83C\uDF18",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    new_moon: {
      keywords: ["nature", "twilight", "planet", "space", "night", "evening", "sleep"],
      char: "\uD83C\uDF11",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    waxing_crescent_moon: {
      keywords: ["nature", "twilight", "planet", "space", "night", "evening", "sleep"],
      char: "\uD83C\uDF12",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    first_quarter_moon: {
      keywords: ["nature", "twilight", "planet", "space", "night", "evening", "sleep"],
      char: "\uD83C\uDF13",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    waxing_gibbous_moon: {
      keywords: ["nature", "night", "sky", "gray", "twilight", "planet", "space", "evening", "sleep"],
      char: "\uD83C\uDF14",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    new_moon_with_face: {
      keywords: ["nature", "twilight", "planet", "space", "night", "evening", "sleep"],
      char: "\uD83C\uDF1A",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    full_moon_with_face: {
      keywords: ["nature", "twilight", "planet", "space", "night", "evening", "sleep"],
      char: "\uD83C\uDF1D",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    first_quarter_moon_with_face: {
      keywords: ["nature", "twilight", "planet", "space", "night", "evening", "sleep"],
      char: "\uD83C\uDF1B",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    last_quarter_moon_with_face: {
      keywords: ["nature", "twilight", "planet", "space", "night", "evening", "sleep"],
      char: "\uD83C\uDF1C",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    sun_with_face: {
      keywords: ["nature", "morning", "sky"],
      char: "\uD83C\uDF1E",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    crescent_moon: {
      keywords: ["night", "sleep", "sky", "evening", "magic"],
      char: "\uD83C\uDF19",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    star: {
      keywords: ["night", "yellow"],
      char: "\u2B50",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    star2: {
      keywords: ["night", "sparkle", "awesome", "good", "magic"],
      char: "\uD83C\uDF1F",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    dizzy: {
      keywords: ["star", "sparkle", "shoot", "magic"],
      char: "\uD83D\uDCAB",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    sparkles: {
      keywords: ["stars", "shine", "shiny", "cool", "awesome", "good", "magic"],
      char: "\u2728",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    comet: {
      keywords: ["space"],
      char: "\u2604",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    sunny: {
      keywords: ["weather", "nature", "brightness", "summer", "beach", "spring"],
      char: "\u2600\uFE0F",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    sun_behind_small_cloud: {
      keywords: ["weather"],
      char: "\uD83C\uDF24",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    partly_sunny: {
      keywords: ["weather", "nature", "cloudy", "morning", "fall", "spring"],
      char: "\u26C5",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    sun_behind_large_cloud: {
      keywords: ["weather"],
      char: "\uD83C\uDF25",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    sun_behind_rain_cloud: {
      keywords: ["weather"],
      char: "\uD83C\uDF26",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    cloud: {
      keywords: ["weather", "sky"],
      char: "\u2601\uFE0F",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    cloud_with_rain: {
      keywords: ["weather"],
      char: "\uD83C\uDF27",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    cloud_with_lightning_and_rain: {
      keywords: ["weather", "lightning"],
      char: "\u26C8",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    cloud_with_lightning: {
      keywords: ["weather", "thunder"],
      char: "\uD83C\uDF29",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    zap: {
      keywords: ["thunder", "weather", "lightning bolt", "fast"],
      char: "\u26A1",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    fire: {
      keywords: ["hot", "cook", "flame"],
      char: "\uD83D\uDD25",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    boom: {
      keywords: ["bomb", "explode", "explosion", "collision", "blown"],
      char: "\uD83D\uDCA5",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    snowflake: {
      keywords: ["winter", "season", "cold", "weather", "christmas", "xmas"],
      char: "\u2744\uFE0F",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    cloud_with_snow: {
      keywords: ["weather"],
      char: "\uD83C\uDF28",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    snowman: {
      keywords: ["winter", "season", "cold", "weather", "christmas", "xmas", "frozen", "without_snow"],
      char: "\u26C4",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    snowman_with_snow: {
      keywords: ["winter", "season", "cold", "weather", "christmas", "xmas", "frozen"],
      char: "\u2603",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    wind_face: {
      keywords: ["gust", "air"],
      char: "\uD83C\uDF2C",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    dash: {
      keywords: ["wind", "air", "fast", "shoo", "fart", "smoke", "puff"],
      char: "\uD83D\uDCA8",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    tornado: {
      keywords: ["weather", "cyclone", "twister"],
      char: "\uD83C\uDF2A",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    fog: {
      keywords: ["weather"],
      char: "\uD83C\uDF2B",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    open_umbrella: {
      keywords: ["weather", "spring"],
      char: "\u2602",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    umbrella: {
      keywords: ["rainy", "weather", "spring"],
      char: "\u2614",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    droplet: {
      keywords: ["water", "drip", "faucet", "spring"],
      char: "\uD83D\uDCA7",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    sweat_drops: {
      keywords: ["water", "drip", "oops"],
      char: "\uD83D\uDCA6",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    ocean: {
      keywords: ["sea", "water", "wave", "nature", "tsunami", "disaster"],
      char: "\uD83C\uDF0A",
      fitzpatrick_scale: false,
      category: "animals_and_nature"
    },
    green_apple: {
      keywords: ["fruit", "nature"],
      char: "\uD83C\uDF4F",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    apple: {
      keywords: ["fruit", "mac", "school"],
      char: "\uD83C\uDF4E",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    pear: {
      keywords: ["fruit", "nature", "food"],
      char: "\uD83C\uDF50",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    tangerine: {
      keywords: ["food", "fruit", "nature", "orange"],
      char: "\uD83C\uDF4A",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    lemon: {
      keywords: ["fruit", "nature"],
      char: "\uD83C\uDF4B",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    banana: {
      keywords: ["fruit", "food", "monkey"],
      char: "\uD83C\uDF4C",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    watermelon: {
      keywords: ["fruit", "food", "picnic", "summer"],
      char: "\uD83C\uDF49",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    grapes: {
      keywords: ["fruit", "food", "wine"],
      char: "\uD83C\uDF47",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    strawberry: {
      keywords: ["fruit", "food", "nature"],
      char: "\uD83C\uDF53",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    melon: {
      keywords: ["fruit", "nature", "food"],
      char: "\uD83C\uDF48",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    cherries: {
      keywords: ["food", "fruit"],
      char: "\uD83C\uDF52",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    peach: {
      keywords: ["fruit", "nature", "food"],
      char: "\uD83C\uDF51",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    pineapple: {
      keywords: ["fruit", "nature", "food"],
      char: "\uD83C\uDF4D",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    coconut: {
      keywords: ["fruit", "nature", "food", "palm"],
      char: "\uD83E\uDD65",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    kiwi_fruit: {
      keywords: ["fruit", "food"],
      char: "\uD83E\uDD5D",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    mango: {
      keywords: ["fruit", "food", "tropical"],
      char: "\uD83E\uDD6D",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    avocado: {
      keywords: ["fruit", "food"],
      char: "\uD83E\uDD51",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    broccoli: {
      keywords: ["fruit", "food", "vegetable"],
      char: "\uD83E\uDD66",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    tomato: {
      keywords: ["fruit", "vegetable", "nature", "food"],
      char: "\uD83C\uDF45",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    eggplant: {
      keywords: ["vegetable", "nature", "food", "aubergine"],
      char: "\uD83C\uDF46",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    cucumber: {
      keywords: ["fruit", "food", "pickle"],
      char: "\uD83E\uDD52",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    carrot: {
      keywords: ["vegetable", "food", "orange"],
      char: "\uD83E\uDD55",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    hot_pepper: {
      keywords: ["food", "spicy", "chilli", "chili"],
      char: "\uD83C\uDF36",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    potato: {
      keywords: ["food", "tuber", "vegatable", "starch"],
      char: "\uD83E\uDD54",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    corn: {
      keywords: ["food", "vegetable", "plant"],
      char: "\uD83C\uDF3D",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    leafy_greens: {
      keywords: ["food", "vegetable", "plant", "bok choy", "cabbage", "kale", "lettuce"],
      char: "\uD83E\uDD6C",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    sweet_potato: {
      keywords: ["food", "nature"],
      char: "\uD83C\uDF60",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    peanuts: {
      keywords: ["food", "nut"],
      char: "\uD83E\uDD5C",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    honey_pot: {
      keywords: ["bees", "sweet", "kitchen"],
      char: "\uD83C\uDF6F",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    croissant: {
      keywords: ["food", "bread", "french"],
      char: "\uD83E\uDD50",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    bread: {
      keywords: ["food", "wheat", "breakfast", "toast"],
      char: "\uD83C\uDF5E",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    baguette_bread: {
      keywords: ["food", "bread", "french"],
      char: "\uD83E\uDD56",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    bagel: {
      keywords: ["food", "bread", "bakery", "schmear"],
      char: "\uD83E\uDD6F",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    pretzel: {
      keywords: ["food", "bread", "twisted"],
      char: "\uD83E\uDD68",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    cheese: {
      keywords: ["food", "chadder"],
      char: "\uD83E\uDDC0",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    egg: {
      keywords: ["food", "chicken", "breakfast"],
      char: "\uD83E\uDD5A",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    bacon: {
      keywords: ["food", "breakfast", "pork", "pig", "meat"],
      char: "\uD83E\uDD53",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    steak: {
      keywords: ["food", "cow", "meat", "cut", "chop", "lambchop", "porkchop"],
      char: "\uD83E\uDD69",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    pancakes: {
      keywords: ["food", "breakfast", "flapjacks", "hotcakes"],
      char: "\uD83E\uDD5E",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    poultry_leg: {
      keywords: ["food", "meat", "drumstick", "bird", "chicken", "turkey"],
      char: "\uD83C\uDF57",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    meat_on_bone: {
      keywords: ["good", "food", "drumstick"],
      char: "\uD83C\uDF56",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    bone: {
      keywords: ["skeleton"],
      char: "\uD83E\uDDB4",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    fried_shrimp: {
      keywords: ["food", "animal", "appetizer", "summer"],
      char: "\uD83C\uDF64",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    fried_egg: {
      keywords: ["food", "breakfast", "kitchen", "egg"],
      char: "\uD83C\uDF73",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    hamburger: {
      keywords: ["meat", "fast food", "beef", "cheeseburger", "mcdonalds", "burger king"],
      char: "\uD83C\uDF54",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    fries: {
      keywords: ["chips", "snack", "fast food"],
      char: "\uD83C\uDF5F",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    stuffed_flatbread: {
      keywords: ["food", "flatbread", "stuffed", "gyro"],
      char: "\uD83E\uDD59",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    hotdog: {
      keywords: ["food", "frankfurter"],
      char: "\uD83C\uDF2D",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    pizza: {
      keywords: ["food", "party"],
      char: "\uD83C\uDF55",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    sandwich: {
      keywords: ["food", "lunch", "bread"],
      char: "\uD83E\uDD6A",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    canned_food: {
      keywords: ["food", "soup"],
      char: "\uD83E\uDD6B",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    spaghetti: {
      keywords: ["food", "italian", "noodle"],
      char: "\uD83C\uDF5D",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    taco: {
      keywords: ["food", "mexican"],
      char: "\uD83C\uDF2E",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    burrito: {
      keywords: ["food", "mexican"],
      char: "\uD83C\uDF2F",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    green_salad: {
      keywords: ["food", "healthy", "lettuce"],
      char: "\uD83E\uDD57",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    shallow_pan_of_food: {
      keywords: ["food", "cooking", "casserole", "paella"],
      char: "\uD83E\uDD58",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    ramen: {
      keywords: ["food", "japanese", "noodle", "chopsticks"],
      char: "\uD83C\uDF5C",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    stew: {
      keywords: ["food", "meat", "soup"],
      char: "\uD83C\uDF72",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    fish_cake: {
      keywords: ["food", "japan", "sea", "beach", "narutomaki", "pink", "swirl", "kamaboko", "surimi", "ramen"],
      char: "\uD83C\uDF65",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    fortune_cookie: {
      keywords: ["food", "prophecy"],
      char: "\uD83E\uDD60",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    sushi: {
      keywords: ["food", "fish", "japanese", "rice"],
      char: "\uD83C\uDF63",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    bento: {
      keywords: ["food", "japanese", "box"],
      char: "\uD83C\uDF71",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    curry: {
      keywords: ["food", "spicy", "hot", "indian"],
      char: "\uD83C\uDF5B",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    rice_ball: {
      keywords: ["food", "japanese"],
      char: "\uD83C\uDF59",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    rice: {
      keywords: ["food", "china", "asian"],
      char: "\uD83C\uDF5A",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    rice_cracker: {
      keywords: ["food", "japanese"],
      char: "\uD83C\uDF58",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    oden: {
      keywords: ["food", "japanese"],
      char: "\uD83C\uDF62",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    dango: {
      keywords: ["food", "dessert", "sweet", "japanese", "barbecue", "meat"],
      char: "\uD83C\uDF61",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    shaved_ice: {
      keywords: ["hot", "dessert", "summer"],
      char: "\uD83C\uDF67",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    ice_cream: {
      keywords: ["food", "hot", "dessert"],
      char: "\uD83C\uDF68",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    icecream: {
      keywords: ["food", "hot", "dessert", "summer"],
      char: "\uD83C\uDF66",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    pie: {
      keywords: ["food", "dessert", "pastry"],
      char: "\uD83E\uDD67",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    cake: {
      keywords: ["food", "dessert"],
      char: "\uD83C\uDF70",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    cupcake: {
      keywords: ["food", "dessert", "bakery", "sweet"],
      char: "\uD83E\uDDC1",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    moon_cake: {
      keywords: ["food", "autumn"],
      char: "\uD83E\uDD6E",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    birthday: {
      keywords: ["food", "dessert", "cake"],
      char: "\uD83C\uDF82",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    custard: {
      keywords: ["dessert", "food"],
      char: "\uD83C\uDF6E",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    candy: {
      keywords: ["snack", "dessert", "sweet", "lolly"],
      char: "\uD83C\uDF6C",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    lollipop: {
      keywords: ["food", "snack", "candy", "sweet"],
      char: "\uD83C\uDF6D",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    chocolate_bar: {
      keywords: ["food", "snack", "dessert", "sweet"],
      char: "\uD83C\uDF6B",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    popcorn: {
      keywords: ["food", "movie theater", "films", "snack"],
      char: "\uD83C\uDF7F",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    dumpling: {
      keywords: ["food", "empanada", "pierogi", "potsticker"],
      char: "\uD83E\uDD5F",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    doughnut: {
      keywords: ["food", "dessert", "snack", "sweet", "donut"],
      char: "\uD83C\uDF69",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    cookie: {
      keywords: ["food", "snack", "oreo", "chocolate", "sweet", "dessert"],
      char: "\uD83C\uDF6A",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    milk_glass: {
      keywords: ["beverage", "drink", "cow"],
      char: "\uD83E\uDD5B",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    beer: {
      keywords: ["relax", "beverage", "drink", "drunk", "party", "pub", "summer", "alcohol", "booze"],
      char: "\uD83C\uDF7A",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    beers: {
      keywords: ["relax", "beverage", "drink", "drunk", "party", "pub", "summer", "alcohol", "booze"],
      char: "\uD83C\uDF7B",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    clinking_glasses: {
      keywords: ["beverage", "drink", "party", "alcohol", "celebrate", "cheers", "wine", "champagne", "toast"],
      char: "\uD83E\uDD42",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    wine_glass: {
      keywords: ["drink", "beverage", "drunk", "alcohol", "booze"],
      char: "\uD83C\uDF77",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    tumbler_glass: {
      keywords: ["drink", "beverage", "drunk", "alcohol", "liquor", "booze", "bourbon", "scotch", "whisky", "glass", "shot"],
      char: "\uD83E\uDD43",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    cocktail: {
      keywords: ["drink", "drunk", "alcohol", "beverage", "booze", "mojito"],
      char: "\uD83C\uDF78",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    tropical_drink: {
      keywords: ["beverage", "cocktail", "summer", "beach", "alcohol", "booze", "mojito"],
      char: "\uD83C\uDF79",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    champagne: {
      keywords: ["drink", "wine", "bottle", "celebration"],
      char: "\uD83C\uDF7E",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    sake: {
      keywords: ["wine", "drink", "drunk", "beverage", "japanese", "alcohol", "booze"],
      char: "\uD83C\uDF76",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    tea: {
      keywords: ["drink", "bowl", "breakfast", "green", "british"],
      char: "\uD83C\uDF75",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    cup_with_straw: {
      keywords: ["drink", "soda"],
      char: "\uD83E\uDD64",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    coffee: {
      keywords: ["beverage", "caffeine", "latte", "espresso"],
      char: "\u2615",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    baby_bottle: {
      keywords: ["food", "container", "milk"],
      char: "\uD83C\uDF7C",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    salt: {
      keywords: ["condiment", "shaker"],
      char: "\uD83E\uDDC2",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    spoon: {
      keywords: ["cutlery", "kitchen", "tableware"],
      char: "\uD83E\uDD44",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    fork_and_knife: {
      keywords: ["cutlery", "kitchen"],
      char: "\uD83C\uDF74",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    plate_with_cutlery: {
      keywords: ["food", "eat", "meal", "lunch", "dinner", "restaurant"],
      char: "\uD83C\uDF7D",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    bowl_with_spoon: {
      keywords: ["food", "breakfast", "cereal", "oatmeal", "porridge"],
      char: "\uD83E\uDD63",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    takeout_box: {
      keywords: ["food", "leftovers"],
      char: "\uD83E\uDD61",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    chopsticks: {
      keywords: ["food"],
      char: "\uD83E\uDD62",
      fitzpatrick_scale: false,
      category: "food_and_drink"
    },
    soccer: {
      keywords: ["sports", "football"],
      char: "\u26BD",
      fitzpatrick_scale: false,
      category: "activity"
    },
    basketball: {
      keywords: ["sports", "balls", "NBA"],
      char: "\uD83C\uDFC0",
      fitzpatrick_scale: false,
      category: "activity"
    },
    football: {
      keywords: ["sports", "balls", "NFL"],
      char: "\uD83C\uDFC8",
      fitzpatrick_scale: false,
      category: "activity"
    },
    baseball: {
      keywords: ["sports", "balls"],
      char: "\u26BE",
      fitzpatrick_scale: false,
      category: "activity"
    },
    softball: {
      keywords: ["sports", "balls"],
      char: "\uD83E\uDD4E",
      fitzpatrick_scale: false,
      category: "activity"
    },
    tennis: {
      keywords: ["sports", "balls", "green"],
      char: "\uD83C\uDFBE",
      fitzpatrick_scale: false,
      category: "activity"
    },
    volleyball: {
      keywords: ["sports", "balls"],
      char: "\uD83C\uDFD0",
      fitzpatrick_scale: false,
      category: "activity"
    },
    rugby_football: {
      keywords: ["sports", "team"],
      char: "\uD83C\uDFC9",
      fitzpatrick_scale: false,
      category: "activity"
    },
    flying_disc: {
      keywords: ["sports", "frisbee", "ultimate"],
      char: "\uD83E\uDD4F",
      fitzpatrick_scale: false,
      category: "activity"
    },
    "8ball": {
      keywords: ["pool", "hobby", "game", "luck", "magic"],
      char: "\uD83C\uDFB1",
      fitzpatrick_scale: false,
      category: "activity"
    },
    golf: {
      keywords: ["sports", "business", "flag", "hole", "summer"],
      char: "\u26F3",
      fitzpatrick_scale: false,
      category: "activity"
    },
    golfing_woman: {
      keywords: ["sports", "business", "woman", "female"],
      char: "\uD83C\uDFCC\uFE0F\u200D\u2640\uFE0F",
      fitzpatrick_scale: false,
      category: "activity"
    },
    golfing_man: {
      keywords: ["sports", "business"],
      char: "\uD83C\uDFCC",
      fitzpatrick_scale: true,
      category: "activity"
    },
    ping_pong: {
      keywords: ["sports", "pingpong"],
      char: "\uD83C\uDFD3",
      fitzpatrick_scale: false,
      category: "activity"
    },
    badminton: {
      keywords: ["sports"],
      char: "\uD83C\uDFF8",
      fitzpatrick_scale: false,
      category: "activity"
    },
    goal_net: {
      keywords: ["sports"],
      char: "\uD83E\uDD45",
      fitzpatrick_scale: false,
      category: "activity"
    },
    ice_hockey: {
      keywords: ["sports"],
      char: "\uD83C\uDFD2",
      fitzpatrick_scale: false,
      category: "activity"
    },
    field_hockey: {
      keywords: ["sports"],
      char: "\uD83C\uDFD1",
      fitzpatrick_scale: false,
      category: "activity"
    },
    lacrosse: {
      keywords: ["sports", "ball", "stick"],
      char: "\uD83E\uDD4D",
      fitzpatrick_scale: false,
      category: "activity"
    },
    cricket: {
      keywords: ["sports"],
      char: "\uD83C\uDFCF",
      fitzpatrick_scale: false,
      category: "activity"
    },
    ski: {
      keywords: ["sports", "winter", "cold", "snow"],
      char: "\uD83C\uDFBF",
      fitzpatrick_scale: false,
      category: "activity"
    },
    skier: {
      keywords: ["sports", "winter", "snow"],
      char: "\u26F7",
      fitzpatrick_scale: false,
      category: "activity"
    },
    snowboarder: {
      keywords: ["sports", "winter"],
      char: "\uD83C\uDFC2",
      fitzpatrick_scale: true,
      category: "activity"
    },
    person_fencing: {
      keywords: ["sports", "fencing", "sword"],
      char: "\uD83E\uDD3A",
      fitzpatrick_scale: false,
      category: "activity"
    },
    women_wrestling: {
      keywords: ["sports", "wrestlers"],
      char: "\uD83E\uDD3C\u200D\u2640\uFE0F",
      fitzpatrick_scale: false,
      category: "activity"
    },
    men_wrestling: {
      keywords: ["sports", "wrestlers"],
      char: "\uD83E\uDD3C\u200D\u2642\uFE0F",
      fitzpatrick_scale: false,
      category: "activity"
    },
    woman_cartwheeling: {
      keywords: ["gymnastics"],
      char: "\uD83E\uDD38\u200D\u2640\uFE0F",
      fitzpatrick_scale: true,
      category: "activity"
    },
    man_cartwheeling: {
      keywords: ["gymnastics"],
      char: "\uD83E\uDD38\u200D\u2642\uFE0F",
      fitzpatrick_scale: true,
      category: "activity"
    },
    woman_playing_handball: {
      keywords: ["sports"],
      char: "\uD83E\uDD3E\u200D\u2640\uFE0F",
      fitzpatrick_scale: true,
      category: "activity"
    },
    man_playing_handball: {
      keywords: ["sports"],
      char: "\uD83E\uDD3E\u200D\u2642\uFE0F",
      fitzpatrick_scale: true,
      category: "activity"
    },
    ice_skate: {
      keywords: ["sports"],
      char: "\u26F8",
      fitzpatrick_scale: false,
      category: "activity"
    },
    curling_stone: {
      keywords: ["sports"],
      char: "\uD83E\uDD4C",
      fitzpatrick_scale: false,
      category: "activity"
    },
    skateboard: {
      keywords: ["board"],
      char: "\uD83D\uDEF9",
      fitzpatrick_scale: false,
      category: "activity"
    },
    sled: {
      keywords: ["sleigh", "luge", "toboggan"],
      char: "\uD83D\uDEF7",
      fitzpatrick_scale: false,
      category: "activity"
    },
    bow_and_arrow: {
      keywords: ["sports"],
      char: "\uD83C\uDFF9",
      fitzpatrick_scale: false,
      category: "activity"
    },
    fishing_pole_and_fish: {
      keywords: ["food", "hobby", "summer"],
      char: "\uD83C\uDFA3",
      fitzpatrick_scale: false,
      category: "activity"
    },
    boxing_glove: {
      keywords: ["sports", "fighting"],
      char: "\uD83E\uDD4A",
      fitzpatrick_scale: false,
      category: "activity"
    },
    martial_arts_uniform: {
      keywords: ["judo", "karate", "taekwondo"],
      char: "\uD83E\uDD4B",
      fitzpatrick_scale: false,
      category: "activity"
    },
    rowing_woman: {
      keywords: ["sports", "hobby", "water", "ship", "woman", "female"],
      char: "\uD83D\uDEA3\u200D\u2640\uFE0F",
      fitzpatrick_scale: true,
      category: "activity"
    },
    rowing_man: {
      keywords: ["sports", "hobby", "water", "ship"],
      char: "\uD83D\uDEA3",
      fitzpatrick_scale: true,
      category: "activity"
    },
    climbing_woman: {
      keywords: ["sports", "hobby", "woman", "female", "rock"],
      char: "\uD83E\uDDD7\u200D\u2640\uFE0F",
      fitzpatrick_scale: true,
      category: "activity"
    },
    climbing_man: {
      keywords: ["sports", "hobby", "man", "male", "rock"],
      char: "\uD83E\uDDD7\u200D\u2642\uFE0F",
      fitzpatrick_scale: true,
      category: "activity"
    },
    swimming_woman: {
      keywords: ["sports", "exercise", "human", "athlete", "water", "summer", "woman", "female"],
      char: "\uD83C\uDFCA\u200D\u2640\uFE0F",
      fitzpatrick_scale: true,
      category: "activity"
    },
    swimming_man: {
      keywords: ["sports", "exercise", "human", "athlete", "water", "summer"],
      char: "\uD83C\uDFCA",
      fitzpatrick_scale: true,
      category: "activity"
    },
    woman_playing_water_polo: {
      keywords: ["sports", "pool"],
      char: "\uD83E\uDD3D\u200D\u2640\uFE0F",
      fitzpatrick_scale: true,
      category: "activity"
    },
    man_playing_water_polo: {
      keywords: ["sports", "pool"],
      char: "\uD83E\uDD3D\u200D\u2642\uFE0F",
      fitzpatrick_scale: true,
      category: "activity"
    },
    woman_in_lotus_position: {
      keywords: ["woman", "female", "meditation", "yoga", "serenity", "zen", "mindfulness"],
      char: "\uD83E\uDDD8\u200D\u2640\uFE0F",
      fitzpatrick_scale: true,
      category: "activity"
    },
    man_in_lotus_position: {
      keywords: ["man", "male", "meditation", "yoga", "serenity", "zen", "mindfulness"],
      char: "\uD83E\uDDD8\u200D\u2642\uFE0F",
      fitzpatrick_scale: true,
      category: "activity"
    },
    surfing_woman: {
      keywords: ["sports", "ocean", "sea", "summer", "beach", "woman", "female"],
      char: "\uD83C\uDFC4\u200D\u2640\uFE0F",
      fitzpatrick_scale: true,
      category: "activity"
    },
    surfing_man: {
      keywords: ["sports", "ocean", "sea", "summer", "beach"],
      char: "\uD83C\uDFC4",
      fitzpatrick_scale: true,
      category: "activity"
    },
    bath: {
      keywords: ["clean", "shower", "bathroom"],
      char: "\uD83D\uDEC0",
      fitzpatrick_scale: true,
      category: "activity"
    },
    basketball_woman: {
      keywords: ["sports", "human", "woman", "female"],
      char: "\u26F9\uFE0F\u200D\u2640\uFE0F",
      fitzpatrick_scale: true,
      category: "activity"
    },
    basketball_man: {
      keywords: ["sports", "human"],
      char: "\u26F9",
      fitzpatrick_scale: true,
      category: "activity"
    },
    weight_lifting_woman: {
      keywords: ["sports", "training", "exercise", "woman", "female"],
      char: "\uD83C\uDFCB\uFE0F\u200D\u2640\uFE0F",
      fitzpatrick_scale: true,
      category: "activity"
    },
    weight_lifting_man: {
      keywords: ["sports", "training", "exercise"],
      char: "\uD83C\uDFCB",
      fitzpatrick_scale: true,
      category: "activity"
    },
    biking_woman: {
      keywords: ["sports", "bike", "exercise", "hipster", "woman", "female"],
      char: "\uD83D\uDEB4\u200D\u2640\uFE0F",
      fitzpatrick_scale: true,
      category: "activity"
    },
    biking_man: {
      keywords: ["sports", "bike", "exercise", "hipster"],
      char: "\uD83D\uDEB4",
      fitzpatrick_scale: true,
      category: "activity"
    },
    mountain_biking_woman: {
      keywords: ["transportation", "sports", "human", "race", "bike", "woman", "female"],
      char: "\uD83D\uDEB5\u200D\u2640\uFE0F",
      fitzpatrick_scale: true,
      category: "activity"
    },
    mountain_biking_man: {
      keywords: ["transportation", "sports", "human", "race", "bike"],
      char: "\uD83D\uDEB5",
      fitzpatrick_scale: true,
      category: "activity"
    },
    horse_racing: {
      keywords: ["animal", "betting", "competition", "gambling", "luck"],
      char: "\uD83C\uDFC7",
      fitzpatrick_scale: true,
      category: "activity"
    },
    business_suit_levitating: {
      keywords: ["suit", "business", "levitate", "hover", "jump"],
      char: "\uD83D\uDD74",
      fitzpatrick_scale: true,
      category: "activity"
    },
    trophy: {
      keywords: ["win", "award", "contest", "place", "ftw", "ceremony"],
      char: "\uD83C\uDFC6",
      fitzpatrick_scale: false,
      category: "activity"
    },
    running_shirt_with_sash: {
      keywords: ["play", "pageant"],
      char: "\uD83C\uDFBD",
      fitzpatrick_scale: false,
      category: "activity"
    },
    medal_sports: {
      keywords: ["award", "winning"],
      char: "\uD83C\uDFC5",
      fitzpatrick_scale: false,
      category: "activity"
    },
    medal_military: {
      keywords: ["award", "winning", "army"],
      char: "\uD83C\uDF96",
      fitzpatrick_scale: false,
      category: "activity"
    },
    "1st_place_medal": {
      keywords: ["award", "winning", "first"],
      char: "\uD83E\uDD47",
      fitzpatrick_scale: false,
      category: "activity"
    },
    "2nd_place_medal": {
      keywords: ["award", "second"],
      char: "\uD83E\uDD48",
      fitzpatrick_scale: false,
      category: "activity"
    },
    "3rd_place_medal": {
      keywords: ["award", "third"],
      char: "\uD83E\uDD49",
      fitzpatrick_scale: false,
      category: "activity"
    },
    reminder_ribbon: {
      keywords: ["sports", "cause", "support", "awareness"],
      char: "\uD83C\uDF97",
      fitzpatrick_scale: false,
      category: "activity"
    },
    rosette: {
      keywords: ["flower", "decoration", "military"],
      char: "\uD83C\uDFF5",
      fitzpatrick_scale: false,
      category: "activity"
    },
    ticket: {
      keywords: ["event", "concert", "pass"],
      char: "\uD83C\uDFAB",
      fitzpatrick_scale: false,
      category: "activity"
    },
    tickets: {
      keywords: ["sports", "concert", "entrance"],
      char: "\uD83C\uDF9F",
      fitzpatrick_scale: false,
      category: "activity"
    },
    performing_arts: {
      keywords: ["acting", "theater", "drama"],
      char: "\uD83C\uDFAD",
      fitzpatrick_scale: false,
      category: "activity"
    },
    art: {
      keywords: ["design", "paint", "draw", "colors"],
      char: "\uD83C\uDFA8",
      fitzpatrick_scale: false,
      category: "activity"
    },
    circus_tent: {
      keywords: ["festival", "carnival", "party"],
      char: "\uD83C\uDFAA",
      fitzpatrick_scale: false,
      category: "activity"
    },
    woman_juggling: {
      keywords: ["juggle", "balance", "skill", "multitask"],
      char: "\uD83E\uDD39\u200D\u2640\uFE0F",
      fitzpatrick_scale: true,
      category: "activity"
    },
    man_juggling: {
      keywords: ["juggle", "balance", "skill", "multitask"],
      char: "\uD83E\uDD39\u200D\u2642\uFE0F",
      fitzpatrick_scale: true,
      category: "activity"
    },
    microphone: {
      keywords: ["sound", "music", "PA", "sing", "talkshow"],
      char: "\uD83C\uDFA4",
      fitzpatrick_scale: false,
      category: "activity"
    },
    headphones: {
      keywords: ["music", "score", "gadgets"],
      char: "\uD83C\uDFA7",
      fitzpatrick_scale: false,
      category: "activity"
    },
    musical_score: {
      keywords: ["treble", "clef", "compose"],
      char: "\uD83C\uDFBC",
      fitzpatrick_scale: false,
      category: "activity"
    },
    musical_keyboard: {
      keywords: ["piano", "instrument", "compose"],
      char: "\uD83C\uDFB9",
      fitzpatrick_scale: false,
      category: "activity"
    },
    drum: {
      keywords: ["music", "instrument", "drumsticks", "snare"],
      char: "\uD83E\uDD41",
      fitzpatrick_scale: false,
      category: "activity"
    },
    saxophone: {
      keywords: ["music", "instrument", "jazz", "blues"],
      char: "\uD83C\uDFB7",
      fitzpatrick_scale: false,
      category: "activity"
    },
    trumpet: {
      keywords: ["music", "brass"],
      char: "\uD83C\uDFBA",
      fitzpatrick_scale: false,
      category: "activity"
    },
    guitar: {
      keywords: ["music", "instrument"],
      char: "\uD83C\uDFB8",
      fitzpatrick_scale: false,
      category: "activity"
    },
    violin: {
      keywords: ["music", "instrument", "orchestra", "symphony"],
      char: "\uD83C\uDFBB",
      fitzpatrick_scale: false,
      category: "activity"
    },
    clapper: {
      keywords: ["movie", "film", "record"],
      char: "\uD83C\uDFAC",
      fitzpatrick_scale: false,
      category: "activity"
    },
    video_game: {
      keywords: ["play", "console", "PS4", "controller"],
      char: "\uD83C\uDFAE",
      fitzpatrick_scale: false,
      category: "activity"
    },
    space_invader: {
      keywords: ["game", "arcade", "play"],
      char: "\uD83D\uDC7E",
      fitzpatrick_scale: false,
      category: "activity"
    },
    dart: {
      keywords: ["game", "play", "bar", "target", "bullseye"],
      char: "\uD83C\uDFAF",
      fitzpatrick_scale: false,
      category: "activity"
    },
    game_die: {
      keywords: ["dice", "random", "tabletop", "play", "luck"],
      char: "\uD83C\uDFB2",
      fitzpatrick_scale: false,
      category: "activity"
    },
    chess_pawn: {
      keywords: ["expendable"],
      char: "\u265F",
      fitzpatrick_scale: false,
      category: "activity"
    },
    slot_machine: {
      keywords: ["bet", "gamble", "vegas", "fruit machine", "luck", "casino"],
      char: "\uD83C\uDFB0",
      fitzpatrick_scale: false,
      category: "activity"
    },
    jigsaw: {
      keywords: ["interlocking", "puzzle", "piece"],
      char: "\uD83E\uDDE9",
      fitzpatrick_scale: false,
      category: "activity"
    },
    bowling: {
      keywords: ["sports", "fun", "play"],
      char: "\uD83C\uDFB3",
      fitzpatrick_scale: false,
      category: "activity"
    },
    red_car: {
      keywords: ["red", "transportation", "vehicle"],
      char: "\uD83D\uDE97",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    taxi: {
      keywords: ["uber", "vehicle", "cars", "transportation"],
      char: "\uD83D\uDE95",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    blue_car: {
      keywords: ["transportation", "vehicle"],
      char: "\uD83D\uDE99",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    bus: {
      keywords: ["car", "vehicle", "transportation"],
      char: "\uD83D\uDE8C",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    trolleybus: {
      keywords: ["bart", "transportation", "vehicle"],
      char: "\uD83D\uDE8E",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    racing_car: {
      keywords: ["sports", "race", "fast", "formula", "f1"],
      char: "\uD83C\uDFCE",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    police_car: {
      keywords: ["vehicle", "cars", "transportation", "law", "legal", "enforcement"],
      char: "\uD83D\uDE93",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    ambulance: {
      keywords: ["health", "911", "hospital"],
      char: "\uD83D\uDE91",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    fire_engine: {
      keywords: ["transportation", "cars", "vehicle"],
      char: "\uD83D\uDE92",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    minibus: {
      keywords: ["vehicle", "car", "transportation"],
      char: "\uD83D\uDE90",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    truck: {
      keywords: ["cars", "transportation"],
      char: "\uD83D\uDE9A",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    articulated_lorry: {
      keywords: ["vehicle", "cars", "transportation", "express"],
      char: "\uD83D\uDE9B",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    tractor: {
      keywords: ["vehicle", "car", "farming", "agriculture"],
      char: "\uD83D\uDE9C",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    kick_scooter: {
      keywords: ["vehicle", "kick", "razor"],
      char: "\uD83D\uDEF4",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    motorcycle: {
      keywords: ["race", "sports", "fast"],
      char: "\uD83C\uDFCD",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    bike: {
      keywords: ["sports", "bicycle", "exercise", "hipster"],
      char: "\uD83D\uDEB2",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    motor_scooter: {
      keywords: ["vehicle", "vespa", "sasha"],
      char: "\uD83D\uDEF5",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    rotating_light: {
      keywords: ["police", "ambulance", "911", "emergency", "alert", "error", "pinged", "law", "legal"],
      char: "\uD83D\uDEA8",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    oncoming_police_car: {
      keywords: ["vehicle", "law", "legal", "enforcement", "911"],
      char: "\uD83D\uDE94",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    oncoming_bus: {
      keywords: ["vehicle", "transportation"],
      char: "\uD83D\uDE8D",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    oncoming_automobile: {
      keywords: ["car", "vehicle", "transportation"],
      char: "\uD83D\uDE98",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    oncoming_taxi: {
      keywords: ["vehicle", "cars", "uber"],
      char: "\uD83D\uDE96",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    aerial_tramway: {
      keywords: ["transportation", "vehicle", "ski"],
      char: "\uD83D\uDEA1",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    mountain_cableway: {
      keywords: ["transportation", "vehicle", "ski"],
      char: "\uD83D\uDEA0",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    suspension_railway: {
      keywords: ["vehicle", "transportation"],
      char: "\uD83D\uDE9F",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    railway_car: {
      keywords: ["transportation", "vehicle"],
      char: "\uD83D\uDE83",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    train: {
      keywords: ["transportation", "vehicle", "carriage", "public", "travel"],
      char: "\uD83D\uDE8B",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    monorail: {
      keywords: ["transportation", "vehicle"],
      char: "\uD83D\uDE9D",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    bullettrain_side: {
      keywords: ["transportation", "vehicle"],
      char: "\uD83D\uDE84",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    bullettrain_front: {
      keywords: ["transportation", "vehicle", "speed", "fast", "public", "travel"],
      char: "\uD83D\uDE85",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    light_rail: {
      keywords: ["transportation", "vehicle"],
      char: "\uD83D\uDE88",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    mountain_railway: {
      keywords: ["transportation", "vehicle"],
      char: "\uD83D\uDE9E",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    steam_locomotive: {
      keywords: ["transportation", "vehicle", "train"],
      char: "\uD83D\uDE82",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    train2: {
      keywords: ["transportation", "vehicle"],
      char: "\uD83D\uDE86",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    metro: {
      keywords: ["transportation", "blue-square", "mrt", "underground", "tube"],
      char: "\uD83D\uDE87",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    tram: {
      keywords: ["transportation", "vehicle"],
      char: "\uD83D\uDE8A",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    station: {
      keywords: ["transportation", "vehicle", "public"],
      char: "\uD83D\uDE89",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    flying_saucer: {
      keywords: ["transportation", "vehicle", "ufo"],
      char: "\uD83D\uDEF8",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    helicopter: {
      keywords: ["transportation", "vehicle", "fly"],
      char: "\uD83D\uDE81",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    small_airplane: {
      keywords: ["flight", "transportation", "fly", "vehicle"],
      char: "\uD83D\uDEE9",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    airplane: {
      keywords: ["vehicle", "transportation", "flight", "fly"],
      char: "\u2708\uFE0F",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    flight_departure: {
      keywords: ["airport", "flight", "landing"],
      char: "\uD83D\uDEEB",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    flight_arrival: {
      keywords: ["airport", "flight", "boarding"],
      char: "\uD83D\uDEEC",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    sailboat: {
      keywords: ["ship", "summer", "transportation", "water", "sailing"],
      char: "\u26F5",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    motor_boat: {
      keywords: ["ship"],
      char: "\uD83D\uDEE5",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    speedboat: {
      keywords: ["ship", "transportation", "vehicle", "summer"],
      char: "\uD83D\uDEA4",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    ferry: {
      keywords: ["boat", "ship", "yacht"],
      char: "\u26F4",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    passenger_ship: {
      keywords: ["yacht", "cruise", "ferry"],
      char: "\uD83D\uDEF3",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    rocket: {
      keywords: ["launch", "ship", "staffmode", "NASA", "outer space", "outer_space", "fly"],
      char: "\uD83D\uDE80",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    artificial_satellite: {
      keywords: ["communication", "gps", "orbit", "spaceflight", "NASA", "ISS"],
      char: "\uD83D\uDEF0",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    seat: {
      keywords: ["sit", "airplane", "transport", "bus", "flight", "fly"],
      char: "\uD83D\uDCBA",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    canoe: {
      keywords: ["boat", "paddle", "water", "ship"],
      char: "\uD83D\uDEF6",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    anchor: {
      keywords: ["ship", "ferry", "sea", "boat"],
      char: "\u2693",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    construction: {
      keywords: ["wip", "progress", "caution", "warning"],
      char: "\uD83D\uDEA7",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    fuelpump: {
      keywords: ["gas station", "petroleum"],
      char: "\u26FD",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    busstop: {
      keywords: ["transportation", "wait"],
      char: "\uD83D\uDE8F",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    vertical_traffic_light: {
      keywords: ["transportation", "driving"],
      char: "\uD83D\uDEA6",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    traffic_light: {
      keywords: ["transportation", "signal"],
      char: "\uD83D\uDEA5",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    checkered_flag: {
      keywords: ["contest", "finishline", "race", "gokart"],
      char: "\uD83C\uDFC1",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    ship: {
      keywords: ["transportation", "titanic", "deploy"],
      char: "\uD83D\uDEA2",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    ferris_wheel: {
      keywords: ["photo", "carnival", "londoneye"],
      char: "\uD83C\uDFA1",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    roller_coaster: {
      keywords: ["carnival", "playground", "photo", "fun"],
      char: "\uD83C\uDFA2",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    carousel_horse: {
      keywords: ["photo", "carnival"],
      char: "\uD83C\uDFA0",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    building_construction: {
      keywords: ["wip", "working", "progress"],
      char: "\uD83C\uDFD7",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    foggy: {
      keywords: ["photo", "mountain"],
      char: "\uD83C\uDF01",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    tokyo_tower: {
      keywords: ["photo", "japanese"],
      char: "\uD83D\uDDFC",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    factory: {
      keywords: ["building", "industry", "pollution", "smoke"],
      char: "\uD83C\uDFED",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    fountain: {
      keywords: ["photo", "summer", "water", "fresh"],
      char: "\u26F2",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    rice_scene: {
      keywords: ["photo", "japan", "asia", "tsukimi"],
      char: "\uD83C\uDF91",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    mountain: {
      keywords: ["photo", "nature", "environment"],
      char: "\u26F0",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    mountain_snow: {
      keywords: ["photo", "nature", "environment", "winter", "cold"],
      char: "\uD83C\uDFD4",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    mount_fuji: {
      keywords: ["photo", "mountain", "nature", "japanese"],
      char: "\uD83D\uDDFB",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    volcano: {
      keywords: ["photo", "nature", "disaster"],
      char: "\uD83C\uDF0B",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    japan: {
      keywords: ["nation", "country", "japanese", "asia"],
      char: "\uD83D\uDDFE",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    camping: {
      keywords: ["photo", "outdoors", "tent"],
      char: "\uD83C\uDFD5",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    tent: {
      keywords: ["photo", "camping", "outdoors"],
      char: "\u26FA",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    national_park: {
      keywords: ["photo", "environment", "nature"],
      char: "\uD83C\uDFDE",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    motorway: {
      keywords: ["road", "cupertino", "interstate", "highway"],
      char: "\uD83D\uDEE3",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    railway_track: {
      keywords: ["train", "transportation"],
      char: "\uD83D\uDEE4",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    sunrise: {
      keywords: ["morning", "view", "vacation", "photo"],
      char: "\uD83C\uDF05",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    sunrise_over_mountains: {
      keywords: ["view", "vacation", "photo"],
      char: "\uD83C\uDF04",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    desert: {
      keywords: ["photo", "warm", "saharah"],
      char: "\uD83C\uDFDC",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    beach_umbrella: {
      keywords: ["weather", "summer", "sunny", "sand", "mojito"],
      char: "\uD83C\uDFD6",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    desert_island: {
      keywords: ["photo", "tropical", "mojito"],
      char: "\uD83C\uDFDD",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    city_sunrise: {
      keywords: ["photo", "good morning", "dawn"],
      char: "\uD83C\uDF07",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    city_sunset: {
      keywords: ["photo", "evening", "sky", "buildings"],
      char: "\uD83C\uDF06",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    cityscape: {
      keywords: ["photo", "night life", "urban"],
      char: "\uD83C\uDFD9",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    night_with_stars: {
      keywords: ["evening", "city", "downtown"],
      char: "\uD83C\uDF03",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    bridge_at_night: {
      keywords: ["photo", "sanfrancisco"],
      char: "\uD83C\uDF09",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    milky_way: {
      keywords: ["photo", "space", "stars"],
      char: "\uD83C\uDF0C",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    stars: {
      keywords: ["night", "photo"],
      char: "\uD83C\uDF20",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    sparkler: {
      keywords: ["stars", "night", "shine"],
      char: "\uD83C\uDF87",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    fireworks: {
      keywords: ["photo", "festival", "carnival", "congratulations"],
      char: "\uD83C\uDF86",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    rainbow: {
      keywords: ["nature", "happy", "unicorn_face", "photo", "sky", "spring"],
      char: "\uD83C\uDF08",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    houses: {
      keywords: ["buildings", "photo"],
      char: "\uD83C\uDFD8",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    european_castle: {
      keywords: ["building", "royalty", "history"],
      char: "\uD83C\uDFF0",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    japanese_castle: {
      keywords: ["photo", "building"],
      char: "\uD83C\uDFEF",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    stadium: {
      keywords: ["photo", "place", "sports", "concert", "venue"],
      char: "\uD83C\uDFDF",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    statue_of_liberty: {
      keywords: ["american", "newyork"],
      char: "\uD83D\uDDFD",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    house: {
      keywords: ["building", "home"],
      char: "\uD83C\uDFE0",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    house_with_garden: {
      keywords: ["home", "plant", "nature"],
      char: "\uD83C\uDFE1",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    derelict_house: {
      keywords: ["abandon", "evict", "broken", "building"],
      char: "\uD83C\uDFDA",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    office: {
      keywords: ["building", "bureau", "work"],
      char: "\uD83C\uDFE2",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    department_store: {
      keywords: ["building", "shopping", "mall"],
      char: "\uD83C\uDFEC",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    post_office: {
      keywords: ["building", "envelope", "communication"],
      char: "\uD83C\uDFE3",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    european_post_office: {
      keywords: ["building", "email"],
      char: "\uD83C\uDFE4",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    hospital: {
      keywords: ["building", "health", "surgery", "doctor"],
      char: "\uD83C\uDFE5",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    bank: {
      keywords: ["building", "money", "sales", "cash", "business", "enterprise"],
      char: "\uD83C\uDFE6",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    hotel: {
      keywords: ["building", "accomodation", "checkin"],
      char: "\uD83C\uDFE8",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    convenience_store: {
      keywords: ["building", "shopping", "groceries"],
      char: "\uD83C\uDFEA",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    school: {
      keywords: ["building", "student", "education", "learn", "teach"],
      char: "\uD83C\uDFEB",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    love_hotel: {
      keywords: ["like", "affection", "dating"],
      char: "\uD83C\uDFE9",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    wedding: {
      keywords: ["love", "like", "affection", "couple", "marriage", "bride", "groom"],
      char: "\uD83D\uDC92",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    classical_building: {
      keywords: ["art", "culture", "history"],
      char: "\uD83C\uDFDB",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    church: {
      keywords: ["building", "religion", "christ"],
      char: "\u26EA",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    mosque: {
      keywords: ["islam", "worship", "minaret"],
      char: "\uD83D\uDD4C",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    synagogue: {
      keywords: ["judaism", "worship", "temple", "jewish"],
      char: "\uD83D\uDD4D",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    kaaba: {
      keywords: ["mecca", "mosque", "islam"],
      char: "\uD83D\uDD4B",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    shinto_shrine: {
      keywords: ["temple", "japan", "kyoto"],
      char: "\u26E9",
      fitzpatrick_scale: false,
      category: "travel_and_places"
    },
    watch: {
      keywords: ["time", "accessories"],
      char: "\u231A",
      fitzpatrick_scale: false,
      category: "objects"
    },
    iphone: {
      keywords: ["technology", "apple", "gadgets", "dial"],
      char: "\uD83D\uDCF1",
      fitzpatrick_scale: false,
      category: "objects"
    },
    calling: {
      keywords: ["iphone", "incoming"],
      char: "\uD83D\uDCF2",
      fitzpatrick_scale: false,
      category: "objects"
    },
    computer: {
      keywords: ["technology", "laptop", "screen", "display", "monitor"],
      char: "\uD83D\uDCBB",
      fitzpatrick_scale: false,
      category: "objects"
    },
    keyboard: {
      keywords: ["technology", "computer", "type", "input", "text"],
      char: "\u2328",
      fitzpatrick_scale: false,
      category: "objects"
    },
    desktop_computer: {
      keywords: ["technology", "computing", "screen"],
      char: "\uD83D\uDDA5",
      fitzpatrick_scale: false,
      category: "objects"
    },
    printer: {
      keywords: ["paper", "ink"],
      char: "\uD83D\uDDA8",
      fitzpatrick_scale: false,
      category: "objects"
    },
    computer_mouse: {
      keywords: ["click"],
      char: "\uD83D\uDDB1",
      fitzpatrick_scale: false,
      category: "objects"
    },
    trackball: {
      keywords: ["technology", "trackpad"],
      char: "\uD83D\uDDB2",
      fitzpatrick_scale: false,
      category: "objects"
    },
    joystick: {
      keywords: ["game", "play"],
      char: "\uD83D\uDD79",
      fitzpatrick_scale: false,
      category: "objects"
    },
    clamp: {
      keywords: ["tool"],
      char: "\uD83D\uDDDC",
      fitzpatrick_scale: false,
      category: "objects"
    },
    minidisc: {
      keywords: ["technology", "record", "data", "disk", "90s"],
      char: "\uD83D\uDCBD",
      fitzpatrick_scale: false,
      category: "objects"
    },
    floppy_disk: {
      keywords: ["oldschool", "technology", "save", "90s", "80s"],
      char: "\uD83D\uDCBE",
      fitzpatrick_scale: false,
      category: "objects"
    },
    cd: {
      keywords: ["technology", "dvd", "disk", "disc", "90s"],
      char: "\uD83D\uDCBF",
      fitzpatrick_scale: false,
      category: "objects"
    },
    dvd: {
      keywords: ["cd", "disk", "disc"],
      char: "\uD83D\uDCC0",
      fitzpatrick_scale: false,
      category: "objects"
    },
    vhs: {
      keywords: ["record", "video", "oldschool", "90s", "80s"],
      char: "\uD83D\uDCFC",
      fitzpatrick_scale: false,
      category: "objects"
    },
    camera: {
      keywords: ["gadgets", "photography"],
      char: "\uD83D\uDCF7",
      fitzpatrick_scale: false,
      category: "objects"
    },
    camera_flash: {
      keywords: ["photography", "gadgets"],
      char: "\uD83D\uDCF8",
      fitzpatrick_scale: false,
      category: "objects"
    },
    video_camera: {
      keywords: ["film", "record"],
      char: "\uD83D\uDCF9",
      fitzpatrick_scale: false,
      category: "objects"
    },
    movie_camera: {
      keywords: ["film", "record"],
      char: "\uD83C\uDFA5",
      fitzpatrick_scale: false,
      category: "objects"
    },
    film_projector: {
      keywords: ["video", "tape", "record", "movie"],
      char: "\uD83D\uDCFD",
      fitzpatrick_scale: false,
      category: "objects"
    },
    film_strip: {
      keywords: ["movie"],
      char: "\uD83C\uDF9E",
      fitzpatrick_scale: false,
      category: "objects"
    },
    telephone_receiver: {
      keywords: ["technology", "communication", "dial"],
      char: "\uD83D\uDCDE",
      fitzpatrick_scale: false,
      category: "objects"
    },
    phone: {
      keywords: ["technology", "communication", "dial", "telephone"],
      char: "\u260E\uFE0F",
      fitzpatrick_scale: false,
      category: "objects"
    },
    pager: {
      keywords: ["bbcall", "oldschool", "90s"],
      char: "\uD83D\uDCDF",
      fitzpatrick_scale: false,
      category: "objects"
    },
    fax: {
      keywords: ["communication", "technology"],
      char: "\uD83D\uDCE0",
      fitzpatrick_scale: false,
      category: "objects"
    },
    tv: {
      keywords: ["technology", "program", "oldschool", "show", "television"],
      char: "\uD83D\uDCFA",
      fitzpatrick_scale: false,
      category: "objects"
    },
    radio: {
      keywords: ["communication", "music", "podcast", "program"],
      char: "\uD83D\uDCFB",
      fitzpatrick_scale: false,
      category: "objects"
    },
    studio_microphone: {
      keywords: ["sing", "recording", "artist", "talkshow"],
      char: "\uD83C\uDF99",
      fitzpatrick_scale: false,
      category: "objects"
    },
    level_slider: {
      keywords: ["scale"],
      char: "\uD83C\uDF9A",
      fitzpatrick_scale: false,
      category: "objects"
    },
    control_knobs: {
      keywords: ["dial"],
      char: "\uD83C\uDF9B",
      fitzpatrick_scale: false,
      category: "objects"
    },
    compass: {
      keywords: ["magnetic", "navigation", "orienteering"],
      char: "\uD83E\uDDED",
      fitzpatrick_scale: false,
      category: "objects"
    },
    stopwatch: {
      keywords: ["time", "deadline"],
      char: "\u23F1",
      fitzpatrick_scale: false,
      category: "objects"
    },
    timer_clock: {
      keywords: ["alarm"],
      char: "\u23F2",
      fitzpatrick_scale: false,
      category: "objects"
    },
    alarm_clock: {
      keywords: ["time", "wake"],
      char: "\u23F0",
      fitzpatrick_scale: false,
      category: "objects"
    },
    mantelpiece_clock: {
      keywords: ["time"],
      char: "\uD83D\uDD70",
      fitzpatrick_scale: false,
      category: "objects"
    },
    hourglass_flowing_sand: {
      keywords: ["oldschool", "time", "countdown"],
      char: "\u23F3",
      fitzpatrick_scale: false,
      category: "objects"
    },
    hourglass: {
      keywords: ["time", "clock", "oldschool", "limit", "exam", "quiz", "test"],
      char: "\u231B",
      fitzpatrick_scale: false,
      category: "objects"
    },
    satellite: {
      keywords: ["communication", "future", "radio", "space"],
      char: "\uD83D\uDCE1",
      fitzpatrick_scale: false,
      category: "objects"
    },
    battery: {
      keywords: ["power", "energy", "sustain"],
      char: "\uD83D\uDD0B",
      fitzpatrick_scale: false,
      category: "objects"
    },
    electric_plug: {
      keywords: ["charger", "power"],
      char: "\uD83D\uDD0C",
      fitzpatrick_scale: false,
      category: "objects"
    },
    bulb: {
      keywords: ["light", "electricity", "idea"],
      char: "\uD83D\uDCA1",
      fitzpatrick_scale: false,
      category: "objects"
    },
    flashlight: {
      keywords: ["dark", "camping", "sight", "night"],
      char: "\uD83D\uDD26",
      fitzpatrick_scale: false,
      category: "objects"
    },
    candle: {
      keywords: ["fire", "wax"],
      char: "\uD83D\uDD6F",
      fitzpatrick_scale: false,
      category: "objects"
    },
    fire_extinguisher: {
      keywords: ["quench"],
      char: "\uD83E\uDDEF",
      fitzpatrick_scale: false,
      category: "objects"
    },
    wastebasket: {
      keywords: ["bin", "trash", "rubbish", "garbage", "toss"],
      char: "\uD83D\uDDD1",
      fitzpatrick_scale: false,
      category: "objects"
    },
    oil_drum: {
      keywords: ["barrell"],
      char: "\uD83D\uDEE2",
      fitzpatrick_scale: false,
      category: "objects"
    },
    money_with_wings: {
      keywords: ["dollar", "bills", "payment", "sale"],
      char: "\uD83D\uDCB8",
      fitzpatrick_scale: false,
      category: "objects"
    },
    dollar: {
      keywords: ["money", "sales", "bill", "currency"],
      char: "\uD83D\uDCB5",
      fitzpatrick_scale: false,
      category: "objects"
    },
    yen: {
      keywords: ["money", "sales", "japanese", "dollar", "currency"],
      char: "\uD83D\uDCB4",
      fitzpatrick_scale: false,
      category: "objects"
    },
    euro: {
      keywords: ["money", "sales", "dollar", "currency"],
      char: "\uD83D\uDCB6",
      fitzpatrick_scale: false,
      category: "objects"
    },
    pound: {
      keywords: ["british", "sterling", "money", "sales", "bills", "uk", "england", "currency"],
      char: "\uD83D\uDCB7",
      fitzpatrick_scale: false,
      category: "objects"
    },
    moneybag: {
      keywords: ["dollar", "payment", "coins", "sale"],
      char: "\uD83D\uDCB0",
      fitzpatrick_scale: false,
      category: "objects"
    },
    credit_card: {
      keywords: ["money", "sales", "dollar", "bill", "payment", "shopping"],
      char: "\uD83D\uDCB3",
      fitzpatrick_scale: false,
      category: "objects"
    },
    gem: {
      keywords: ["blue", "ruby", "diamond", "jewelry"],
      char: "\uD83D\uDC8E",
      fitzpatrick_scale: false,
      category: "objects"
    },
    balance_scale: {
      keywords: ["law", "fairness", "weight"],
      char: "\u2696",
      fitzpatrick_scale: false,
      category: "objects"
    },
    toolbox: {
      keywords: ["tools", "diy", "fix", "maintainer", "mechanic"],
      char: "\uD83E\uDDF0",
      fitzpatrick_scale: false,
      category: "objects"
    },
    wrench: {
      keywords: ["tools", "diy", "ikea", "fix", "maintainer"],
      char: "\uD83D\uDD27",
      fitzpatrick_scale: false,
      category: "objects"
    },
    hammer: {
      keywords: ["tools", "build", "create"],
      char: "\uD83D\uDD28",
      fitzpatrick_scale: false,
      category: "objects"
    },
    hammer_and_pick: {
      keywords: ["tools", "build", "create"],
      char: "\u2692",
      fitzpatrick_scale: false,
      category: "objects"
    },
    hammer_and_wrench: {
      keywords: ["tools", "build", "create"],
      char: "\uD83D\uDEE0",
      fitzpatrick_scale: false,
      category: "objects"
    },
    pick: {
      keywords: ["tools", "dig"],
      char: "\u26CF",
      fitzpatrick_scale: false,
      category: "objects"
    },
    nut_and_bolt: {
      keywords: ["handy", "tools", "fix"],
      char: "\uD83D\uDD29",
      fitzpatrick_scale: false,
      category: "objects"
    },
    gear: {
      keywords: ["cog"],
      char: "\u2699",
      fitzpatrick_scale: false,
      category: "objects"
    },
    brick: {
      keywords: ["bricks"],
      char: "\uD83E\uDDF1",
      fitzpatrick_scale: false,
      category: "objects"
    },
    chains: {
      keywords: ["lock", "arrest"],
      char: "\u26D3",
      fitzpatrick_scale: false,
      category: "objects"
    },
    magnet: {
      keywords: ["attraction", "magnetic"],
      char: "\uD83E\uDDF2",
      fitzpatrick_scale: false,
      category: "objects"
    },
    gun: {
      keywords: ["violence", "weapon", "pistol", "revolver"],
      char: "\uD83D\uDD2B",
      fitzpatrick_scale: false,
      category: "objects"
    },
    bomb: {
      keywords: ["boom", "explode", "explosion", "terrorism"],
      char: "\uD83D\uDCA3",
      fitzpatrick_scale: false,
      category: "objects"
    },
    firecracker: {
      keywords: ["dynamite", "boom", "explode", "explosion", "explosive"],
      char: "\uD83E\uDDE8",
      fitzpatrick_scale: false,
      category: "objects"
    },
    hocho: {
      keywords: ["knife", "blade", "cutlery", "kitchen", "weapon"],
      char: "\uD83D\uDD2A",
      fitzpatrick_scale: false,
      category: "objects"
    },
    dagger: {
      keywords: ["weapon"],
      char: "\uD83D\uDDE1",
      fitzpatrick_scale: false,
      category: "objects"
    },
    crossed_swords: {
      keywords: ["weapon"],
      char: "\u2694",
      fitzpatrick_scale: false,
      category: "objects"
    },
    shield: {
      keywords: ["protection", "security"],
      char: "\uD83D\uDEE1",
      fitzpatrick_scale: false,
      category: "objects"
    },
    smoking: {
      keywords: ["kills", "tobacco", "cigarette", "joint", "smoke"],
      char: "\uD83D\uDEAC",
      fitzpatrick_scale: false,
      category: "objects"
    },
    skull_and_crossbones: {
      keywords: ["poison", "danger", "deadly", "scary", "death", "pirate", "evil"],
      char: "\u2620",
      fitzpatrick_scale: false,
      category: "objects"
    },
    coffin: {
      keywords: ["vampire", "dead", "die", "death", "rip", "graveyard", "cemetery", "casket", "funeral", "box"],
      char: "\u26B0",
      fitzpatrick_scale: false,
      category: "objects"
    },
    funeral_urn: {
      keywords: ["dead", "die", "death", "rip", "ashes"],
      char: "\u26B1",
      fitzpatrick_scale: false,
      category: "objects"
    },
    amphora: {
      keywords: ["vase", "jar"],
      char: "\uD83C\uDFFA",
      fitzpatrick_scale: false,
      category: "objects"
    },
    crystal_ball: {
      keywords: ["disco", "party", "magic", "circus", "fortune_teller"],
      char: "\uD83D\uDD2E",
      fitzpatrick_scale: false,
      category: "objects"
    },
    prayer_beads: {
      keywords: ["dhikr", "religious"],
      char: "\uD83D\uDCFF",
      fitzpatrick_scale: false,
      category: "objects"
    },
    nazar_amulet: {
      keywords: ["bead", "charm"],
      char: "\uD83E\uDDFF",
      fitzpatrick_scale: false,
      category: "objects"
    },
    barber: {
      keywords: ["hair", "salon", "style"],
      char: "\uD83D\uDC88",
      fitzpatrick_scale: false,
      category: "objects"
    },
    alembic: {
      keywords: ["distilling", "science", "experiment", "chemistry"],
      char: "\u2697",
      fitzpatrick_scale: false,
      category: "objects"
    },
    telescope: {
      keywords: ["stars", "space", "zoom", "science", "astronomy"],
      char: "\uD83D\uDD2D",
      fitzpatrick_scale: false,
      category: "objects"
    },
    microscope: {
      keywords: ["laboratory", "experiment", "zoomin", "science", "study"],
      char: "\uD83D\uDD2C",
      fitzpatrick_scale: false,
      category: "objects"
    },
    hole: {
      keywords: ["embarrassing"],
      char: "\uD83D\uDD73",
      fitzpatrick_scale: false,
      category: "objects"
    },
    pill: {
      keywords: ["health", "medicine", "doctor", "pharmacy", "drug"],
      char: "\uD83D\uDC8A",
      fitzpatrick_scale: false,
      category: "objects"
    },
    syringe: {
      keywords: ["health", "hospital", "drugs", "blood", "medicine", "needle", "doctor", "nurse"],
      char: "\uD83D\uDC89",
      fitzpatrick_scale: false,
      category: "objects"
    },
    dna: {
      keywords: ["biologist", "genetics", "life"],
      char: "\uD83E\uDDEC",
      fitzpatrick_scale: false,
      category: "objects"
    },
    microbe: {
      keywords: ["amoeba", "bacteria", "germs"],
      char: "\uD83E\uDDA0",
      fitzpatrick_scale: false,
      category: "objects"
    },
    petri_dish: {
      keywords: ["bacteria", "biology", "culture", "lab"],
      char: "\uD83E\uDDEB",
      fitzpatrick_scale: false,
      category: "objects"
    },
    test_tube: {
      keywords: ["chemistry", "experiment", "lab", "science"],
      char: "\uD83E\uDDEA",
      fitzpatrick_scale: false,
      category: "objects"
    },
    thermometer: {
      keywords: ["weather", "temperature", "hot", "cold"],
      char: "\uD83C\uDF21",
      fitzpatrick_scale: false,
      category: "objects"
    },
    broom: {
      keywords: ["cleaning", "sweeping", "witch"],
      char: "\uD83E\uDDF9",
      fitzpatrick_scale: false,
      category: "objects"
    },
    basket: {
      keywords: ["laundry"],
      char: "\uD83E\uDDFA",
      fitzpatrick_scale: false,
      category: "objects"
    },
    toilet_paper: {
      keywords: ["roll"],
      char: "\uD83E\uDDFB",
      fitzpatrick_scale: false,
      category: "objects"
    },
    label: {
      keywords: ["sale", "tag"],
      char: "\uD83C\uDFF7",
      fitzpatrick_scale: false,
      category: "objects"
    },
    bookmark: {
      keywords: ["favorite", "label", "save"],
      char: "\uD83D\uDD16",
      fitzpatrick_scale: false,
      category: "objects"
    },
    toilet: {
      keywords: ["restroom", "wc", "washroom", "bathroom", "potty"],
      char: "\uD83D\uDEBD",
      fitzpatrick_scale: false,
      category: "objects"
    },
    shower: {
      keywords: ["clean", "water", "bathroom"],
      char: "\uD83D\uDEBF",
      fitzpatrick_scale: false,
      category: "objects"
    },
    bathtub: {
      keywords: ["clean", "shower", "bathroom"],
      char: "\uD83D\uDEC1",
      fitzpatrick_scale: false,
      category: "objects"
    },
    soap: {
      keywords: ["bar", "bathing", "cleaning", "lather"],
      char: "\uD83E\uDDFC",
      fitzpatrick_scale: false,
      category: "objects"
    },
    sponge: {
      keywords: ["absorbing", "cleaning", "porous"],
      char: "\uD83E\uDDFD",
      fitzpatrick_scale: false,
      category: "objects"
    },
    lotion_bottle: {
      keywords: ["moisturizer", "sunscreen"],
      char: "\uD83E\uDDF4",
      fitzpatrick_scale: false,
      category: "objects"
    },
    key: {
      keywords: ["lock", "door", "password"],
      char: "\uD83D\uDD11",
      fitzpatrick_scale: false,
      category: "objects"
    },
    old_key: {
      keywords: ["lock", "door", "password"],
      char: "\uD83D\uDDDD",
      fitzpatrick_scale: false,
      category: "objects"
    },
    couch_and_lamp: {
      keywords: ["read", "chill"],
      char: "\uD83D\uDECB",
      fitzpatrick_scale: false,
      category: "objects"
    },
    sleeping_bed: {
      keywords: ["bed", "rest"],
      char: "\uD83D\uDECC",
      fitzpatrick_scale: true,
      category: "objects"
    },
    bed: {
      keywords: ["sleep", "rest"],
      char: "\uD83D\uDECF",
      fitzpatrick_scale: false,
      category: "objects"
    },
    door: {
      keywords: ["house", "entry", "exit"],
      char: "\uD83D\uDEAA",
      fitzpatrick_scale: false,
      category: "objects"
    },
    bellhop_bell: {
      keywords: ["service"],
      char: "\uD83D\uDECE",
      fitzpatrick_scale: false,
      category: "objects"
    },
    teddy_bear: {
      keywords: ["plush", "stuffed"],
      char: "\uD83E\uDDF8",
      fitzpatrick_scale: false,
      category: "objects"
    },
    framed_picture: {
      keywords: ["photography"],
      char: "\uD83D\uDDBC",
      fitzpatrick_scale: false,
      category: "objects"
    },
    world_map: {
      keywords: ["location", "direction"],
      char: "\uD83D\uDDFA",
      fitzpatrick_scale: false,
      category: "objects"
    },
    parasol_on_ground: {
      keywords: ["weather", "summer"],
      char: "\u26F1",
      fitzpatrick_scale: false,
      category: "objects"
    },
    moyai: {
      keywords: ["rock", "easter island", "moai"],
      char: "\uD83D\uDDFF",
      fitzpatrick_scale: false,
      category: "objects"
    },
    shopping: {
      keywords: ["mall", "buy", "purchase"],
      char: "\uD83D\uDECD",
      fitzpatrick_scale: false,
      category: "objects"
    },
    shopping_cart: {
      keywords: ["trolley"],
      char: "\uD83D\uDED2",
      fitzpatrick_scale: false,
      category: "objects"
    },
    balloon: {
      keywords: ["party", "celebration", "birthday", "circus"],
      char: "\uD83C\uDF88",
      fitzpatrick_scale: false,
      category: "objects"
    },
    flags: {
      keywords: ["fish", "japanese", "koinobori", "carp", "banner"],
      char: "\uD83C\uDF8F",
      fitzpatrick_scale: false,
      category: "objects"
    },
    ribbon: {
      keywords: ["decoration", "pink", "girl", "bowtie"],
      char: "\uD83C\uDF80",
      fitzpatrick_scale: false,
      category: "objects"
    },
    gift: {
      keywords: ["present", "birthday", "christmas", "xmas"],
      char: "\uD83C\uDF81",
      fitzpatrick_scale: false,
      category: "objects"
    },
    confetti_ball: {
      keywords: ["festival", "party", "birthday", "circus"],
      char: "\uD83C\uDF8A",
      fitzpatrick_scale: false,
      category: "objects"
    },
    tada: {
      keywords: ["party", "congratulations", "birthday", "magic", "circus", "celebration"],
      char: "\uD83C\uDF89",
      fitzpatrick_scale: false,
      category: "objects"
    },
    dolls: {
      keywords: ["japanese", "toy", "kimono"],
      char: "\uD83C\uDF8E",
      fitzpatrick_scale: false,
      category: "objects"
    },
    wind_chime: {
      keywords: ["nature", "ding", "spring", "bell"],
      char: "\uD83C\uDF90",
      fitzpatrick_scale: false,
      category: "objects"
    },
    crossed_flags: {
      keywords: ["japanese", "nation", "country", "border"],
      char: "\uD83C\uDF8C",
      fitzpatrick_scale: false,
      category: "objects"
    },
    izakaya_lantern: {
      keywords: ["light", "paper", "halloween", "spooky"],
      char: "\uD83C\uDFEE",
      fitzpatrick_scale: false,
      category: "objects"
    },
    red_envelope: {
      keywords: ["gift"],
      char: "\uD83E\uDDE7",
      fitzpatrick_scale: false,
      category: "objects"
    },
    email: {
      keywords: ["letter", "postal", "inbox", "communication"],
      char: "\u2709\uFE0F",
      fitzpatrick_scale: false,
      category: "objects"
    },
    envelope_with_arrow: {
      keywords: ["email", "communication"],
      char: "\uD83D\uDCE9",
      fitzpatrick_scale: false,
      category: "objects"
    },
    incoming_envelope: {
      keywords: ["email", "inbox"],
      char: "\uD83D\uDCE8",
      fitzpatrick_scale: false,
      category: "objects"
    },
    "e-mail": {
      keywords: ["communication", "inbox"],
      char: "\uD83D\uDCE7",
      fitzpatrick_scale: false,
      category: "objects"
    },
    love_letter: {
      keywords: ["email", "like", "affection", "envelope", "valentines"],
      char: "\uD83D\uDC8C",
      fitzpatrick_scale: false,
      category: "objects"
    },
    postbox: {
      keywords: ["email", "letter", "envelope"],
      char: "\uD83D\uDCEE",
      fitzpatrick_scale: false,
      category: "objects"
    },
    mailbox_closed: {
      keywords: ["email", "communication", "inbox"],
      char: "\uD83D\uDCEA",
      fitzpatrick_scale: false,
      category: "objects"
    },
    mailbox: {
      keywords: ["email", "inbox", "communication"],
      char: "\uD83D\uDCEB",
      fitzpatrick_scale: false,
      category: "objects"
    },
    mailbox_with_mail: {
      keywords: ["email", "inbox", "communication"],
      char: "\uD83D\uDCEC",
      fitzpatrick_scale: false,
      category: "objects"
    },
    mailbox_with_no_mail: {
      keywords: ["email", "inbox"],
      char: "\uD83D\uDCED",
      fitzpatrick_scale: false,
      category: "objects"
    },
    package: {
      keywords: ["mail", "gift", "cardboard", "box", "moving"],
      char: "\uD83D\uDCE6",
      fitzpatrick_scale: false,
      category: "objects"
    },
    postal_horn: {
      keywords: ["instrument", "music"],
      char: "\uD83D\uDCEF",
      fitzpatrick_scale: false,
      category: "objects"
    },
    inbox_tray: {
      keywords: ["email", "documents"],
      char: "\uD83D\uDCE5",
      fitzpatrick_scale: false,
      category: "objects"
    },
    outbox_tray: {
      keywords: ["inbox", "email"],
      char: "\uD83D\uDCE4",
      fitzpatrick_scale: false,
      category: "objects"
    },
    scroll: {
      keywords: ["documents", "ancient", "history", "paper"],
      char: "\uD83D\uDCDC",
      fitzpatrick_scale: false,
      category: "objects"
    },
    page_with_curl: {
      keywords: ["documents", "office", "paper"],
      char: "\uD83D\uDCC3",
      fitzpatrick_scale: false,
      category: "objects"
    },
    bookmark_tabs: {
      keywords: ["favorite", "save", "order", "tidy"],
      char: "\uD83D\uDCD1",
      fitzpatrick_scale: false,
      category: "objects"
    },
    receipt: {
      keywords: ["accounting", "expenses"],
      char: "\uD83E\uDDFE",
      fitzpatrick_scale: false,
      category: "objects"
    },
    bar_chart: {
      keywords: ["graph", "presentation", "stats"],
      char: "\uD83D\uDCCA",
      fitzpatrick_scale: false,
      category: "objects"
    },
    chart_with_upwards_trend: {
      keywords: ["graph", "presentation", "stats", "recovery", "business", "economics", "money", "sales", "good", "success"],
      char: "\uD83D\uDCC8",
      fitzpatrick_scale: false,
      category: "objects"
    },
    chart_with_downwards_trend: {
      keywords: ["graph", "presentation", "stats", "recession", "business", "economics", "money", "sales", "bad", "failure"],
      char: "\uD83D\uDCC9",
      fitzpatrick_scale: false,
      category: "objects"
    },
    page_facing_up: {
      keywords: ["documents", "office", "paper", "information"],
      char: "\uD83D\uDCC4",
      fitzpatrick_scale: false,
      category: "objects"
    },
    date: {
      keywords: ["calendar", "schedule"],
      char: "\uD83D\uDCC5",
      fitzpatrick_scale: false,
      category: "objects"
    },
    calendar: {
      keywords: ["schedule", "date", "planning"],
      char: "\uD83D\uDCC6",
      fitzpatrick_scale: false,
      category: "objects"
    },
    spiral_calendar: {
      keywords: ["date", "schedule", "planning"],
      char: "\uD83D\uDDD3",
      fitzpatrick_scale: false,
      category: "objects"
    },
    card_index: {
      keywords: ["business", "stationery"],
      char: "\uD83D\uDCC7",
      fitzpatrick_scale: false,
      category: "objects"
    },
    card_file_box: {
      keywords: ["business", "stationery"],
      char: "\uD83D\uDDC3",
      fitzpatrick_scale: false,
      category: "objects"
    },
    ballot_box: {
      keywords: ["election", "vote"],
      char: "\uD83D\uDDF3",
      fitzpatrick_scale: false,
      category: "objects"
    },
    file_cabinet: {
      keywords: ["filing", "organizing"],
      char: "\uD83D\uDDC4",
      fitzpatrick_scale: false,
      category: "objects"
    },
    clipboard: {
      keywords: ["stationery", "documents"],
      char: "\uD83D\uDCCB",
      fitzpatrick_scale: false,
      category: "objects"
    },
    spiral_notepad: {
      keywords: ["memo", "stationery"],
      char: "\uD83D\uDDD2",
      fitzpatrick_scale: false,
      category: "objects"
    },
    file_folder: {
      keywords: ["documents", "business", "office"],
      char: "\uD83D\uDCC1",
      fitzpatrick_scale: false,
      category: "objects"
    },
    open_file_folder: {
      keywords: ["documents", "load"],
      char: "\uD83D\uDCC2",
      fitzpatrick_scale: false,
      category: "objects"
    },
    card_index_dividers: {
      keywords: ["organizing", "business", "stationery"],
      char: "\uD83D\uDDC2",
      fitzpatrick_scale: false,
      category: "objects"
    },
    newspaper_roll: {
      keywords: ["press", "headline"],
      char: "\uD83D\uDDDE",
      fitzpatrick_scale: false,
      category: "objects"
    },
    newspaper: {
      keywords: ["press", "headline"],
      char: "\uD83D\uDCF0",
      fitzpatrick_scale: false,
      category: "objects"
    },
    notebook: {
      keywords: ["stationery", "record", "notes", "paper", "study"],
      char: "\uD83D\uDCD3",
      fitzpatrick_scale: false,
      category: "objects"
    },
    closed_book: {
      keywords: ["read", "library", "knowledge", "textbook", "learn"],
      char: "\uD83D\uDCD5",
      fitzpatrick_scale: false,
      category: "objects"
    },
    green_book: {
      keywords: ["read", "library", "knowledge", "study"],
      char: "\uD83D\uDCD7",
      fitzpatrick_scale: false,
      category: "objects"
    },
    blue_book: {
      keywords: ["read", "library", "knowledge", "learn", "study"],
      char: "\uD83D\uDCD8",
      fitzpatrick_scale: false,
      category: "objects"
    },
    orange_book: {
      keywords: ["read", "library", "knowledge", "textbook", "study"],
      char: "\uD83D\uDCD9",
      fitzpatrick_scale: false,
      category: "objects"
    },
    notebook_with_decorative_cover: {
      keywords: ["classroom", "notes", "record", "paper", "study"],
      char: "\uD83D\uDCD4",
      fitzpatrick_scale: false,
      category: "objects"
    },
    ledger: {
      keywords: ["notes", "paper"],
      char: "\uD83D\uDCD2",
      fitzpatrick_scale: false,
      category: "objects"
    },
    books: {
      keywords: ["literature", "library", "study"],
      char: "\uD83D\uDCDA",
      fitzpatrick_scale: false,
      category: "objects"
    },
    open_book: {
      keywords: ["book", "read", "library", "knowledge", "literature", "learn", "study"],
      char: "\uD83D\uDCD6",
      fitzpatrick_scale: false,
      category: "objects"
    },
    safety_pin: {
      keywords: ["diaper"],
      char: "\uD83E\uDDF7",
      fitzpatrick_scale: false,
      category: "objects"
    },
    link: {
      keywords: ["rings", "url"],
      char: "\uD83D\uDD17",
      fitzpatrick_scale: false,
      category: "objects"
    },
    paperclip: {
      keywords: ["documents", "stationery"],
      char: "\uD83D\uDCCE",
      fitzpatrick_scale: false,
      category: "objects"
    },
    paperclips: {
      keywords: ["documents", "stationery"],
      char: "\uD83D\uDD87",
      fitzpatrick_scale: false,
      category: "objects"
    },
    scissors: {
      keywords: ["stationery", "cut"],
      char: "\u2702\uFE0F",
      fitzpatrick_scale: false,
      category: "objects"
    },
    triangular_ruler: {
      keywords: ["stationery", "math", "architect", "sketch"],
      char: "\uD83D\uDCD0",
      fitzpatrick_scale: false,
      category: "objects"
    },
    straight_ruler: {
      keywords: ["stationery", "calculate", "length", "math", "school", "drawing", "architect", "sketch"],
      char: "\uD83D\uDCCF",
      fitzpatrick_scale: false,
      category: "objects"
    },
    abacus: {
      keywords: ["calculation"],
      char: "\uD83E\uDDEE",
      fitzpatrick_scale: false,
      category: "objects"
    },
    pushpin: {
      keywords: ["stationery", "mark", "here"],
      char: "\uD83D\uDCCC",
      fitzpatrick_scale: false,
      category: "objects"
    },
    round_pushpin: {
      keywords: ["stationery", "location", "map", "here"],
      char: "\uD83D\uDCCD",
      fitzpatrick_scale: false,
      category: "objects"
    },
    triangular_flag_on_post: {
      keywords: ["mark", "milestone", "place"],
      char: "\uD83D\uDEA9",
      fitzpatrick_scale: false,
      category: "objects"
    },
    white_flag: {
      keywords: ["losing", "loser", "lost", "surrender", "give up", "fail"],
      char: "\uD83C\uDFF3",
      fitzpatrick_scale: false,
      category: "objects"
    },
    black_flag: {
      keywords: ["pirate"],
      char: "\uD83C\uDFF4",
      fitzpatrick_scale: false,
      category: "objects"
    },
    rainbow_flag: {
      keywords: ["flag", "rainbow", "pride", "gay", "lgbt", "glbt", "queer", "homosexual", "lesbian", "bisexual", "transgender"],
      char: "\uD83C\uDFF3\uFE0F\u200D\uD83C\uDF08",
      fitzpatrick_scale: false,
      category: "objects"
    },
    closed_lock_with_key: {
      keywords: ["security", "privacy"],
      char: "\uD83D\uDD10",
      fitzpatrick_scale: false,
      category: "objects"
    },
    lock: {
      keywords: ["security", "password", "padlock"],
      char: "\uD83D\uDD12",
      fitzpatrick_scale: false,
      category: "objects"
    },
    unlock: {
      keywords: ["privacy", "security"],
      char: "\uD83D\uDD13",
      fitzpatrick_scale: false,
      category: "objects"
    },
    lock_with_ink_pen: {
      keywords: ["security", "secret"],
      char: "\uD83D\uDD0F",
      fitzpatrick_scale: false,
      category: "objects"
    },
    pen: {
      keywords: ["stationery", "writing", "write"],
      char: "\uD83D\uDD8A",
      fitzpatrick_scale: false,
      category: "objects"
    },
    fountain_pen: {
      keywords: ["stationery", "writing", "write"],
      char: "\uD83D\uDD8B",
      fitzpatrick_scale: false,
      category: "objects"
    },
    black_nib: {
      keywords: ["pen", "stationery", "writing", "write"],
      char: "\u2712\uFE0F",
      fitzpatrick_scale: false,
      category: "objects"
    },
    memo: {
      keywords: ["write", "documents", "stationery", "pencil", "paper", "writing", "legal", "exam", "quiz", "test", "study", "compose"],
      char: "\uD83D\uDCDD",
      fitzpatrick_scale: false,
      category: "objects"
    },
    pencil2: {
      keywords: ["stationery", "write", "paper", "writing", "school", "study"],
      char: "\u270F\uFE0F",
      fitzpatrick_scale: false,
      category: "objects"
    },
    crayon: {
      keywords: ["drawing", "creativity"],
      char: "\uD83D\uDD8D",
      fitzpatrick_scale: false,
      category: "objects"
    },
    paintbrush: {
      keywords: ["drawing", "creativity", "art"],
      char: "\uD83D\uDD8C",
      fitzpatrick_scale: false,
      category: "objects"
    },
    mag: {
      keywords: ["search", "zoom", "find", "detective"],
      char: "\uD83D\uDD0D",
      fitzpatrick_scale: false,
      category: "objects"
    },
    mag_right: {
      keywords: ["search", "zoom", "find", "detective"],
      char: "\uD83D\uDD0E",
      fitzpatrick_scale: false,
      category: "objects"
    },
    heart: {
      keywords: ["love", "like", "valentines"],
      char: "\u2764\uFE0F",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    orange_heart: {
      keywords: ["love", "like", "affection", "valentines"],
      char: "\uD83E\uDDE1",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    yellow_heart: {
      keywords: ["love", "like", "affection", "valentines"],
      char: "\uD83D\uDC9B",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    green_heart: {
      keywords: ["love", "like", "affection", "valentines"],
      char: "\uD83D\uDC9A",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    blue_heart: {
      keywords: ["love", "like", "affection", "valentines"],
      char: "\uD83D\uDC99",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    purple_heart: {
      keywords: ["love", "like", "affection", "valentines"],
      char: "\uD83D\uDC9C",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    black_heart: {
      keywords: ["evil"],
      char: "\uD83D\uDDA4",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    broken_heart: {
      keywords: ["sad", "sorry", "break", "heart", "heartbreak"],
      char: "\uD83D\uDC94",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    heavy_heart_exclamation: {
      keywords: ["decoration", "love"],
      char: "\u2763",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    two_hearts: {
      keywords: ["love", "like", "affection", "valentines", "heart"],
      char: "\uD83D\uDC95",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    revolving_hearts: {
      keywords: ["love", "like", "affection", "valentines"],
      char: "\uD83D\uDC9E",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    heartbeat: {
      keywords: ["love", "like", "affection", "valentines", "pink", "heart"],
      char: "\uD83D\uDC93",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    heartpulse: {
      keywords: ["like", "love", "affection", "valentines", "pink"],
      char: "\uD83D\uDC97",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    sparkling_heart: {
      keywords: ["love", "like", "affection", "valentines"],
      char: "\uD83D\uDC96",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    cupid: {
      keywords: ["love", "like", "heart", "affection", "valentines"],
      char: "\uD83D\uDC98",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    gift_heart: {
      keywords: ["love", "valentines"],
      char: "\uD83D\uDC9D",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    heart_decoration: {
      keywords: ["purple-square", "love", "like"],
      char: "\uD83D\uDC9F",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    peace_symbol: {
      keywords: ["hippie"],
      char: "\u262E",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    latin_cross: {
      keywords: ["christianity"],
      char: "\u271D",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    star_and_crescent: {
      keywords: ["islam"],
      char: "\u262A",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    om: {
      keywords: ["hinduism", "buddhism", "sikhism", "jainism"],
      char: "\uD83D\uDD49",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    wheel_of_dharma: {
      keywords: ["hinduism", "buddhism", "sikhism", "jainism"],
      char: "\u2638",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    star_of_david: {
      keywords: ["judaism"],
      char: "\u2721",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    six_pointed_star: {
      keywords: ["purple-square", "religion", "jewish", "hexagram"],
      char: "\uD83D\uDD2F",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    menorah: {
      keywords: ["hanukkah", "candles", "jewish"],
      char: "\uD83D\uDD4E",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    yin_yang: {
      keywords: ["balance"],
      char: "\u262F",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    orthodox_cross: {
      keywords: ["suppedaneum", "religion"],
      char: "\u2626",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    place_of_worship: {
      keywords: ["religion", "church", "temple", "prayer"],
      char: "\uD83D\uDED0",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    ophiuchus: {
      keywords: ["sign", "purple-square", "constellation", "astrology"],
      char: "\u26CE",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    aries: {
      keywords: ["sign", "purple-square", "zodiac", "astrology"],
      char: "\u2648",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    taurus: {
      keywords: ["purple-square", "sign", "zodiac", "astrology"],
      char: "\u2649",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    gemini: {
      keywords: ["sign", "zodiac", "purple-square", "astrology"],
      char: "\u264A",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    cancer: {
      keywords: ["sign", "zodiac", "purple-square", "astrology"],
      char: "\u264B",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    leo: {
      keywords: ["sign", "purple-square", "zodiac", "astrology"],
      char: "\u264C",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    virgo: {
      keywords: ["sign", "zodiac", "purple-square", "astrology"],
      char: "\u264D",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    libra: {
      keywords: ["sign", "purple-square", "zodiac", "astrology"],
      char: "\u264E",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    scorpius: {
      keywords: ["sign", "zodiac", "purple-square", "astrology", "scorpio"],
      char: "\u264F",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    sagittarius: {
      keywords: ["sign", "zodiac", "purple-square", "astrology"],
      char: "\u2650",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    capricorn: {
      keywords: ["sign", "zodiac", "purple-square", "astrology"],
      char: "\u2651",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    aquarius: {
      keywords: ["sign", "purple-square", "zodiac", "astrology"],
      char: "\u2652",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    pisces: {
      keywords: ["purple-square", "sign", "zodiac", "astrology"],
      char: "\u2653",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    id: {
      keywords: ["purple-square", "words"],
      char: "\uD83C\uDD94",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    atom_symbol: {
      keywords: ["science", "physics", "chemistry"],
      char: "\u269B",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    u7a7a: {
      keywords: ["kanji", "japanese", "chinese", "empty", "sky", "blue-square"],
      char: "\uD83C\uDE33",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    u5272: {
      keywords: ["cut", "divide", "chinese", "kanji", "pink-square"],
      char: "\uD83C\uDE39",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    radioactive: {
      keywords: ["nuclear", "danger"],
      char: "\u2622",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    biohazard: {
      keywords: ["danger"],
      char: "\u2623",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    mobile_phone_off: {
      keywords: ["mute", "orange-square", "silence", "quiet"],
      char: "\uD83D\uDCF4",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    vibration_mode: {
      keywords: ["orange-square", "phone"],
      char: "\uD83D\uDCF3",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    u6709: {
      keywords: ["orange-square", "chinese", "have", "kanji"],
      char: "\uD83C\uDE36",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    u7121: {
      keywords: ["nothing", "chinese", "kanji", "japanese", "orange-square"],
      char: "\uD83C\uDE1A",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    u7533: {
      keywords: ["chinese", "japanese", "kanji", "orange-square"],
      char: "\uD83C\uDE38",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    u55b6: {
      keywords: ["japanese", "opening hours", "orange-square"],
      char: "\uD83C\uDE3A",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    u6708: {
      keywords: ["chinese", "month", "moon", "japanese", "orange-square", "kanji"],
      char: "\uD83C\uDE37\uFE0F",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    eight_pointed_black_star: {
      keywords: ["orange-square", "shape", "polygon"],
      char: "\u2734\uFE0F",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    vs: {
      keywords: ["words", "orange-square"],
      char: "\uD83C\uDD9A",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    accept: {
      keywords: ["ok", "good", "chinese", "kanji", "agree", "yes", "orange-circle"],
      char: "\uD83C\uDE51",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    white_flower: {
      keywords: ["japanese", "spring"],
      char: "\uD83D\uDCAE",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    ideograph_advantage: {
      keywords: ["chinese", "kanji", "obtain", "get", "circle"],
      char: "\uD83C\uDE50",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    secret: {
      keywords: ["privacy", "chinese", "sshh", "kanji", "red-circle"],
      char: "\u3299\uFE0F",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    congratulations: {
      keywords: ["chinese", "kanji", "japanese", "red-circle"],
      char: "\u3297\uFE0F",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    u5408: {
      keywords: ["japanese", "chinese", "join", "kanji", "red-square"],
      char: "\uD83C\uDE34",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    u6e80: {
      keywords: ["full", "chinese", "japanese", "red-square", "kanji"],
      char: "\uD83C\uDE35",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    u7981: {
      keywords: ["kanji", "japanese", "chinese", "forbidden", "limit", "restricted", "red-square"],
      char: "\uD83C\uDE32",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    a: {
      keywords: ["red-square", "alphabet", "letter"],
      char: "\uD83C\uDD70\uFE0F",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    b: {
      keywords: ["red-square", "alphabet", "letter"],
      char: "\uD83C\uDD71\uFE0F",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    ab: {
      keywords: ["red-square", "alphabet"],
      char: "\uD83C\uDD8E",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    cl: {
      keywords: ["alphabet", "words", "red-square"],
      char: "\uD83C\uDD91",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    o2: {
      keywords: ["alphabet", "red-square", "letter"],
      char: "\uD83C\uDD7E\uFE0F",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    sos: {
      keywords: ["help", "red-square", "words", "emergency", "911"],
      char: "\uD83C\uDD98",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    no_entry: {
      keywords: ["limit", "security", "privacy", "bad", "denied", "stop", "circle"],
      char: "\u26D4",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    name_badge: {
      keywords: ["fire", "forbid"],
      char: "\uD83D\uDCDB",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    no_entry_sign: {
      keywords: ["forbid", "stop", "limit", "denied", "disallow", "circle"],
      char: "\uD83D\uDEAB",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    x: {
      keywords: ["no", "delete", "remove", "cancel", "red"],
      char: "\u274C",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    o: {
      keywords: ["circle", "round"],
      char: "\u2B55",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    stop_sign: {
      keywords: ["stop"],
      char: "\uD83D\uDED1",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    anger: {
      keywords: ["angry", "mad"],
      char: "\uD83D\uDCA2",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    hotsprings: {
      keywords: ["bath", "warm", "relax"],
      char: "\u2668\uFE0F",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    no_pedestrians: {
      keywords: ["rules", "crossing", "walking", "circle"],
      char: "\uD83D\uDEB7",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    do_not_litter: {
      keywords: ["trash", "bin", "garbage", "circle"],
      char: "\uD83D\uDEAF",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    no_bicycles: {
      keywords: ["cyclist", "prohibited", "circle"],
      char: "\uD83D\uDEB3",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    "non-potable_water": {
      keywords: ["drink", "faucet", "tap", "circle"],
      char: "\uD83D\uDEB1",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    underage: {
      keywords: ["18", "drink", "pub", "night", "minor", "circle"],
      char: "\uD83D\uDD1E",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    no_mobile_phones: {
      keywords: ["iphone", "mute", "circle"],
      char: "\uD83D\uDCF5",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    exclamation: {
      keywords: ["heavy_exclamation_mark", "danger", "surprise", "punctuation", "wow", "warning"],
      char: "\u2757",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    grey_exclamation: {
      keywords: ["surprise", "punctuation", "gray", "wow", "warning"],
      char: "\u2755",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    question: {
      keywords: ["doubt", "confused"],
      char: "\u2753",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    grey_question: {
      keywords: ["doubts", "gray", "huh", "confused"],
      char: "\u2754",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    bangbang: {
      keywords: ["exclamation", "surprise"],
      char: "\u203C\uFE0F",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    interrobang: {
      keywords: ["wat", "punctuation", "surprise"],
      char: "\u2049\uFE0F",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    "100": {
      keywords: ["score", "perfect", "numbers", "century", "exam", "quiz", "test", "pass", "hundred"],
      char: "\uD83D\uDCAF",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    low_brightness: {
      keywords: ["sun", "afternoon", "warm", "summer"],
      char: "\uD83D\uDD05",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    high_brightness: {
      keywords: ["sun", "light"],
      char: "\uD83D\uDD06",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    trident: {
      keywords: ["weapon", "spear"],
      char: "\uD83D\uDD31",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    fleur_de_lis: {
      keywords: ["decorative", "scout"],
      char: "\u269C",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    part_alternation_mark: {
      keywords: ["graph", "presentation", "stats", "business", "economics", "bad"],
      char: "\u303D\uFE0F",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    warning: {
      keywords: ["exclamation", "wip", "alert", "error", "problem", "issue"],
      char: "\u26A0\uFE0F",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    children_crossing: {
      keywords: ["school", "warning", "danger", "sign", "driving", "yellow-diamond"],
      char: "\uD83D\uDEB8",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    beginner: {
      keywords: ["badge", "shield"],
      char: "\uD83D\uDD30",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    recycle: {
      keywords: ["arrow", "environment", "garbage", "trash"],
      char: "\u267B\uFE0F",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    u6307: {
      keywords: ["chinese", "point", "green-square", "kanji"],
      char: "\uD83C\uDE2F",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    chart: {
      keywords: ["green-square", "graph", "presentation", "stats"],
      char: "\uD83D\uDCB9",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    sparkle: {
      keywords: ["stars", "green-square", "awesome", "good", "fireworks"],
      char: "\u2747\uFE0F",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    eight_spoked_asterisk: {
      keywords: ["star", "sparkle", "green-square"],
      char: "\u2733\uFE0F",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    negative_squared_cross_mark: {
      keywords: ["x", "green-square", "no", "deny"],
      char: "\u274E",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    white_check_mark: {
      keywords: ["green-square", "ok", "agree", "vote", "election", "answer", "tick"],
      char: "\u2705",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    diamond_shape_with_a_dot_inside: {
      keywords: ["jewel", "blue", "gem", "crystal", "fancy"],
      char: "\uD83D\uDCA0",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    cyclone: {
      keywords: ["weather", "swirl", "blue", "cloud", "vortex", "spiral", "whirlpool", "spin", "tornado", "hurricane", "typhoon"],
      char: "\uD83C\uDF00",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    loop: {
      keywords: ["tape", "cassette"],
      char: "\u27BF",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    globe_with_meridians: {
      keywords: ["earth", "international", "world", "internet", "interweb", "i18n"],
      char: "\uD83C\uDF10",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    m: {
      keywords: ["alphabet", "blue-circle", "letter"],
      char: "\u24C2\uFE0F",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    atm: {
      keywords: ["money", "sales", "cash", "blue-square", "payment", "bank"],
      char: "\uD83C\uDFE7",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    sa: {
      keywords: ["japanese", "blue-square", "katakana"],
      char: "\uD83C\uDE02\uFE0F",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    passport_control: {
      keywords: ["custom", "blue-square"],
      char: "\uD83D\uDEC2",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    customs: {
      keywords: ["passport", "border", "blue-square"],
      char: "\uD83D\uDEC3",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    baggage_claim: {
      keywords: ["blue-square", "airport", "transport"],
      char: "\uD83D\uDEC4",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    left_luggage: {
      keywords: ["blue-square", "travel"],
      char: "\uD83D\uDEC5",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    wheelchair: {
      keywords: ["blue-square", "disabled", "a11y", "accessibility"],
      char: "\u267F",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    no_smoking: {
      keywords: ["cigarette", "blue-square", "smell", "smoke"],
      char: "\uD83D\uDEAD",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    wc: {
      keywords: ["toilet", "restroom", "blue-square"],
      char: "\uD83D\uDEBE",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    parking: {
      keywords: ["cars", "blue-square", "alphabet", "letter"],
      char: "\uD83C\uDD7F\uFE0F",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    potable_water: {
      keywords: ["blue-square", "liquid", "restroom", "cleaning", "faucet"],
      char: "\uD83D\uDEB0",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    mens: {
      keywords: ["toilet", "restroom", "wc", "blue-square", "gender", "male"],
      char: "\uD83D\uDEB9",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    womens: {
      keywords: ["purple-square", "woman", "female", "toilet", "loo", "restroom", "gender"],
      char: "\uD83D\uDEBA",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    baby_symbol: {
      keywords: ["orange-square", "child"],
      char: "\uD83D\uDEBC",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    restroom: {
      keywords: ["blue-square", "toilet", "refresh", "wc", "gender"],
      char: "\uD83D\uDEBB",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    put_litter_in_its_place: {
      keywords: ["blue-square", "sign", "human", "info"],
      char: "\uD83D\uDEAE",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    cinema: {
      keywords: ["blue-square", "record", "film", "movie", "curtain", "stage", "theater"],
      char: "\uD83C\uDFA6",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    signal_strength: {
      keywords: ["blue-square", "reception", "phone", "internet", "connection", "wifi", "bluetooth", "bars"],
      char: "\uD83D\uDCF6",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    koko: {
      keywords: ["blue-square", "here", "katakana", "japanese", "destination"],
      char: "\uD83C\uDE01",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    ng: {
      keywords: ["blue-square", "words", "shape", "icon"],
      char: "\uD83C\uDD96",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    ok: {
      keywords: ["good", "agree", "yes", "blue-square"],
      char: "\uD83C\uDD97",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    up: {
      keywords: ["blue-square", "above", "high"],
      char: "\uD83C\uDD99",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    cool: {
      keywords: ["words", "blue-square"],
      char: "\uD83C\uDD92",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    new: {
      keywords: ["blue-square", "words", "start"],
      char: "\uD83C\uDD95",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    free: {
      keywords: ["blue-square", "words"],
      char: "\uD83C\uDD93",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    zero: {
      keywords: ["0", "numbers", "blue-square", "null"],
      char: "0\uFE0F\u20E3",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    one: {
      keywords: ["blue-square", "numbers", "1"],
      char: "1\uFE0F\u20E3",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    two: {
      keywords: ["numbers", "2", "prime", "blue-square"],
      char: "2\uFE0F\u20E3",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    three: {
      keywords: ["3", "numbers", "prime", "blue-square"],
      char: "3\uFE0F\u20E3",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    four: {
      keywords: ["4", "numbers", "blue-square"],
      char: "4\uFE0F\u20E3",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    five: {
      keywords: ["5", "numbers", "blue-square", "prime"],
      char: "5\uFE0F\u20E3",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    six: {
      keywords: ["6", "numbers", "blue-square"],
      char: "6\uFE0F\u20E3",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    seven: {
      keywords: ["7", "numbers", "blue-square", "prime"],
      char: "7\uFE0F\u20E3",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    eight: {
      keywords: ["8", "blue-square", "numbers"],
      char: "8\uFE0F\u20E3",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    nine: {
      keywords: ["blue-square", "numbers", "9"],
      char: "9\uFE0F\u20E3",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    keycap_ten: {
      keywords: ["numbers", "10", "blue-square"],
      char: "\uD83D\uDD1F",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    asterisk: {
      keywords: ["star", "keycap"],
      char: "*\u20E3",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    "1234": {
      keywords: ["numbers", "blue-square"],
      char: "\uD83D\uDD22",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    eject_button: {
      keywords: ["blue-square"],
      char: "\u23CF\uFE0F",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    arrow_forward: {
      keywords: ["blue-square", "right", "direction", "play"],
      char: "\u25B6\uFE0F",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    pause_button: {
      keywords: ["pause", "blue-square"],
      char: "\u23F8",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    next_track_button: {
      keywords: ["forward", "next", "blue-square"],
      char: "\u23ED",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    stop_button: {
      keywords: ["blue-square"],
      char: "\u23F9",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    record_button: {
      keywords: ["blue-square"],
      char: "\u23FA",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    play_or_pause_button: {
      keywords: ["blue-square", "play", "pause"],
      char: "\u23EF",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    previous_track_button: {
      keywords: ["backward"],
      char: "\u23EE",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    fast_forward: {
      keywords: ["blue-square", "play", "speed", "continue"],
      char: "\u23E9",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    rewind: {
      keywords: ["play", "blue-square"],
      char: "\u23EA",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    twisted_rightwards_arrows: {
      keywords: ["blue-square", "shuffle", "music", "random"],
      char: "\uD83D\uDD00",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    repeat: {
      keywords: ["loop", "record"],
      char: "\uD83D\uDD01",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    repeat_one: {
      keywords: ["blue-square", "loop"],
      char: "\uD83D\uDD02",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    arrow_backward: {
      keywords: ["blue-square", "left", "direction"],
      char: "\u25C0\uFE0F",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    arrow_up_small: {
      keywords: ["blue-square", "triangle", "direction", "point", "forward", "top"],
      char: "\uD83D\uDD3C",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    arrow_down_small: {
      keywords: ["blue-square", "direction", "bottom"],
      char: "\uD83D\uDD3D",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    arrow_double_up: {
      keywords: ["blue-square", "direction", "top"],
      char: "\u23EB",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    arrow_double_down: {
      keywords: ["blue-square", "direction", "bottom"],
      char: "\u23EC",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    arrow_right: {
      keywords: ["blue-square", "next"],
      char: "\u27A1\uFE0F",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    arrow_left: {
      keywords: ["blue-square", "previous", "back"],
      char: "\u2B05\uFE0F",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    arrow_up: {
      keywords: ["blue-square", "continue", "top", "direction"],
      char: "\u2B06\uFE0F",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    arrow_down: {
      keywords: ["blue-square", "direction", "bottom"],
      char: "\u2B07\uFE0F",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    arrow_upper_right: {
      keywords: ["blue-square", "point", "direction", "diagonal", "northeast"],
      char: "\u2197\uFE0F",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    arrow_lower_right: {
      keywords: ["blue-square", "direction", "diagonal", "southeast"],
      char: "\u2198\uFE0F",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    arrow_lower_left: {
      keywords: ["blue-square", "direction", "diagonal", "southwest"],
      char: "\u2199\uFE0F",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    arrow_upper_left: {
      keywords: ["blue-square", "point", "direction", "diagonal", "northwest"],
      char: "\u2196\uFE0F",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    arrow_up_down: {
      keywords: ["blue-square", "direction", "way", "vertical"],
      char: "\u2195\uFE0F",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    left_right_arrow: {
      keywords: ["shape", "direction", "horizontal", "sideways"],
      char: "\u2194\uFE0F",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    arrows_counterclockwise: {
      keywords: ["blue-square", "sync", "cycle"],
      char: "\uD83D\uDD04",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    arrow_right_hook: {
      keywords: ["blue-square", "return", "rotate", "direction"],
      char: "\u21AA\uFE0F",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    leftwards_arrow_with_hook: {
      keywords: ["back", "return", "blue-square", "undo", "enter"],
      char: "\u21A9\uFE0F",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    arrow_heading_up: {
      keywords: ["blue-square", "direction", "top"],
      char: "\u2934\uFE0F",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    arrow_heading_down: {
      keywords: ["blue-square", "direction", "bottom"],
      char: "\u2935\uFE0F",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    hash: {
      keywords: ["symbol", "blue-square", "twitter"],
      char: "#\uFE0F\u20E3",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    information_source: {
      keywords: ["blue-square", "alphabet", "letter"],
      char: "\u2139\uFE0F",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    abc: {
      keywords: ["blue-square", "alphabet"],
      char: "\uD83D\uDD24",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    abcd: {
      keywords: ["blue-square", "alphabet"],
      char: "\uD83D\uDD21",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    capital_abcd: {
      keywords: ["alphabet", "words", "blue-square"],
      char: "\uD83D\uDD20",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    symbols: {
      keywords: ["blue-square", "music", "note", "ampersand", "percent", "glyphs", "characters"],
      char: "\uD83D\uDD23",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    musical_note: {
      keywords: ["score", "tone", "sound"],
      char: "\uD83C\uDFB5",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    notes: {
      keywords: ["music", "score"],
      char: "\uD83C\uDFB6",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    wavy_dash: {
      keywords: ["draw", "line", "moustache", "mustache", "squiggle", "scribble"],
      char: "\u3030\uFE0F",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    curly_loop: {
      keywords: ["scribble", "draw", "shape", "squiggle"],
      char: "\u27B0",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    heavy_check_mark: {
      keywords: ["ok", "nike", "answer", "yes", "tick"],
      char: "\u2714\uFE0F",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    arrows_clockwise: {
      keywords: ["sync", "cycle", "round", "repeat"],
      char: "\uD83D\uDD03",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    heavy_plus_sign: {
      keywords: ["math", "calculation", "addition", "more", "increase"],
      char: "\u2795",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    heavy_minus_sign: {
      keywords: ["math", "calculation", "subtract", "less"],
      char: "\u2796",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    heavy_division_sign: {
      keywords: ["divide", "math", "calculation"],
      char: "\u2797",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    heavy_multiplication_x: {
      keywords: ["math", "calculation"],
      char: "\u2716\uFE0F",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    infinity: {
      keywords: ["forever"],
      char: "\u267E",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    heavy_dollar_sign: {
      keywords: ["money", "sales", "payment", "currency", "buck"],
      char: "\uD83D\uDCB2",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    currency_exchange: {
      keywords: ["money", "sales", "dollar", "travel"],
      char: "\uD83D\uDCB1",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    copyright: {
      keywords: ["ip", "license", "circle", "law", "legal"],
      char: "\xA9\uFE0F",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    registered: {
      keywords: ["alphabet", "circle"],
      char: "\xAE\uFE0F",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    tm: {
      keywords: ["trademark", "brand", "law", "legal"],
      char: "\u2122\uFE0F",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    end: {
      keywords: ["words", "arrow"],
      char: "\uD83D\uDD1A",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    back: {
      keywords: ["arrow", "words", "return"],
      char: "\uD83D\uDD19",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    on: {
      keywords: ["arrow", "words"],
      char: "\uD83D\uDD1B",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    top: {
      keywords: ["words", "blue-square"],
      char: "\uD83D\uDD1D",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    soon: {
      keywords: ["arrow", "words"],
      char: "\uD83D\uDD1C",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    ballot_box_with_check: {
      keywords: ["ok", "agree", "confirm", "black-square", "vote", "election", "yes", "tick"],
      char: "\u2611\uFE0F",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    radio_button: {
      keywords: ["input", "old", "music", "circle"],
      char: "\uD83D\uDD18",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    white_circle: {
      keywords: ["shape", "round"],
      char: "\u26AA",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    black_circle: {
      keywords: ["shape", "button", "round"],
      char: "\u26AB",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    red_circle: {
      keywords: ["shape", "error", "danger"],
      char: "\uD83D\uDD34",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    large_blue_circle: {
      keywords: ["shape", "icon", "button"],
      char: "\uD83D\uDD35",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    small_orange_diamond: {
      keywords: ["shape", "jewel", "gem"],
      char: "\uD83D\uDD38",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    small_blue_diamond: {
      keywords: ["shape", "jewel", "gem"],
      char: "\uD83D\uDD39",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    large_orange_diamond: {
      keywords: ["shape", "jewel", "gem"],
      char: "\uD83D\uDD36",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    large_blue_diamond: {
      keywords: ["shape", "jewel", "gem"],
      char: "\uD83D\uDD37",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    small_red_triangle: {
      keywords: ["shape", "direction", "up", "top"],
      char: "\uD83D\uDD3A",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    black_small_square: {
      keywords: ["shape", "icon"],
      char: "\u25AA\uFE0F",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    white_small_square: {
      keywords: ["shape", "icon"],
      char: "\u25AB\uFE0F",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    black_large_square: {
      keywords: ["shape", "icon", "button"],
      char: "\u2B1B",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    white_large_square: {
      keywords: ["shape", "icon", "stone", "button"],
      char: "\u2B1C",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    small_red_triangle_down: {
      keywords: ["shape", "direction", "bottom"],
      char: "\uD83D\uDD3B",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    black_medium_square: {
      keywords: ["shape", "button", "icon"],
      char: "\u25FC\uFE0F",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    white_medium_square: {
      keywords: ["shape", "stone", "icon"],
      char: "\u25FB\uFE0F",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    black_medium_small_square: {
      keywords: ["icon", "shape", "button"],
      char: "\u25FE",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    white_medium_small_square: {
      keywords: ["shape", "stone", "icon", "button"],
      char: "\u25FD",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    black_square_button: {
      keywords: ["shape", "input", "frame"],
      char: "\uD83D\uDD32",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    white_square_button: {
      keywords: ["shape", "input"],
      char: "\uD83D\uDD33",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    speaker: {
      keywords: ["sound", "volume", "silence", "broadcast"],
      char: "\uD83D\uDD08",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    sound: {
      keywords: ["volume", "speaker", "broadcast"],
      char: "\uD83D\uDD09",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    loud_sound: {
      keywords: ["volume", "noise", "noisy", "speaker", "broadcast"],
      char: "\uD83D\uDD0A",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    mute: {
      keywords: ["sound", "volume", "silence", "quiet"],
      char: "\uD83D\uDD07",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    mega: {
      keywords: ["sound", "speaker", "volume"],
      char: "\uD83D\uDCE3",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    loudspeaker: {
      keywords: ["volume", "sound"],
      char: "\uD83D\uDCE2",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    bell: {
      keywords: ["sound", "notification", "christmas", "xmas", "chime"],
      char: "\uD83D\uDD14",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    no_bell: {
      keywords: ["sound", "volume", "mute", "quiet", "silent"],
      char: "\uD83D\uDD15",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    black_joker: {
      keywords: ["poker", "cards", "game", "play", "magic"],
      char: "\uD83C\uDCCF",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    mahjong: {
      keywords: ["game", "play", "chinese", "kanji"],
      char: "\uD83C\uDC04",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    spades: {
      keywords: ["poker", "cards", "suits", "magic"],
      char: "\u2660\uFE0F",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    clubs: {
      keywords: ["poker", "cards", "magic", "suits"],
      char: "\u2663\uFE0F",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    hearts: {
      keywords: ["poker", "cards", "magic", "suits"],
      char: "\u2665\uFE0F",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    diamonds: {
      keywords: ["poker", "cards", "magic", "suits"],
      char: "\u2666\uFE0F",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    flower_playing_cards: {
      keywords: ["game", "sunset", "red"],
      char: "\uD83C\uDFB4",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    thought_balloon: {
      keywords: ["bubble", "cloud", "speech", "thinking", "dream"],
      char: "\uD83D\uDCAD",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    right_anger_bubble: {
      keywords: ["caption", "speech", "thinking", "mad"],
      char: "\uD83D\uDDEF",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    speech_balloon: {
      keywords: ["bubble", "words", "message", "talk", "chatting"],
      char: "\uD83D\uDCAC",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    left_speech_bubble: {
      keywords: ["words", "message", "talk", "chatting"],
      char: "\uD83D\uDDE8",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    clock1: {
      keywords: ["time", "late", "early", "schedule"],
      char: "\uD83D\uDD50",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    clock2: {
      keywords: ["time", "late", "early", "schedule"],
      char: "\uD83D\uDD51",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    clock3: {
      keywords: ["time", "late", "early", "schedule"],
      char: "\uD83D\uDD52",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    clock4: {
      keywords: ["time", "late", "early", "schedule"],
      char: "\uD83D\uDD53",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    clock5: {
      keywords: ["time", "late", "early", "schedule"],
      char: "\uD83D\uDD54",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    clock6: {
      keywords: ["time", "late", "early", "schedule", "dawn", "dusk"],
      char: "\uD83D\uDD55",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    clock7: {
      keywords: ["time", "late", "early", "schedule"],
      char: "\uD83D\uDD56",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    clock8: {
      keywords: ["time", "late", "early", "schedule"],
      char: "\uD83D\uDD57",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    clock9: {
      keywords: ["time", "late", "early", "schedule"],
      char: "\uD83D\uDD58",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    clock10: {
      keywords: ["time", "late", "early", "schedule"],
      char: "\uD83D\uDD59",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    clock11: {
      keywords: ["time", "late", "early", "schedule"],
      char: "\uD83D\uDD5A",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    clock12: {
      keywords: ["time", "noon", "midnight", "midday", "late", "early", "schedule"],
      char: "\uD83D\uDD5B",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    clock130: {
      keywords: ["time", "late", "early", "schedule"],
      char: "\uD83D\uDD5C",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    clock230: {
      keywords: ["time", "late", "early", "schedule"],
      char: "\uD83D\uDD5D",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    clock330: {
      keywords: ["time", "late", "early", "schedule"],
      char: "\uD83D\uDD5E",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    clock430: {
      keywords: ["time", "late", "early", "schedule"],
      char: "\uD83D\uDD5F",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    clock530: {
      keywords: ["time", "late", "early", "schedule"],
      char: "\uD83D\uDD60",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    clock630: {
      keywords: ["time", "late", "early", "schedule"],
      char: "\uD83D\uDD61",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    clock730: {
      keywords: ["time", "late", "early", "schedule"],
      char: "\uD83D\uDD62",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    clock830: {
      keywords: ["time", "late", "early", "schedule"],
      char: "\uD83D\uDD63",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    clock930: {
      keywords: ["time", "late", "early", "schedule"],
      char: "\uD83D\uDD64",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    clock1030: {
      keywords: ["time", "late", "early", "schedule"],
      char: "\uD83D\uDD65",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    clock1130: {
      keywords: ["time", "late", "early", "schedule"],
      char: "\uD83D\uDD66",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    clock1230: {
      keywords: ["time", "late", "early", "schedule"],
      char: "\uD83D\uDD67",
      fitzpatrick_scale: false,
      category: "symbols"
    },
    afghanistan: {
      keywords: ["af", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDE6\uD83C\uDDEB",
      fitzpatrick_scale: false,
      category: "flags"
    },
    aland_islands: {
      keywords: ["\xC5land", "islands", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDE6\uD83C\uDDFD",
      fitzpatrick_scale: false,
      category: "flags"
    },
    albania: {
      keywords: ["al", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDE6\uD83C\uDDF1",
      fitzpatrick_scale: false,
      category: "flags"
    },
    algeria: {
      keywords: ["dz", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDE9\uD83C\uDDFF",
      fitzpatrick_scale: false,
      category: "flags"
    },
    american_samoa: {
      keywords: ["american", "ws", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDE6\uD83C\uDDF8",
      fitzpatrick_scale: false,
      category: "flags"
    },
    andorra: {
      keywords: ["ad", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDE6\uD83C\uDDE9",
      fitzpatrick_scale: false,
      category: "flags"
    },
    angola: {
      keywords: ["ao", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDE6\uD83C\uDDF4",
      fitzpatrick_scale: false,
      category: "flags"
    },
    anguilla: {
      keywords: ["ai", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDE6\uD83C\uDDEE",
      fitzpatrick_scale: false,
      category: "flags"
    },
    antarctica: {
      keywords: ["aq", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDE6\uD83C\uDDF6",
      fitzpatrick_scale: false,
      category: "flags"
    },
    antigua_barbuda: {
      keywords: ["antigua", "barbuda", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDE6\uD83C\uDDEC",
      fitzpatrick_scale: false,
      category: "flags"
    },
    argentina: {
      keywords: ["ar", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDE6\uD83C\uDDF7",
      fitzpatrick_scale: false,
      category: "flags"
    },
    armenia: {
      keywords: ["am", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDE6\uD83C\uDDF2",
      fitzpatrick_scale: false,
      category: "flags"
    },
    aruba: {
      keywords: ["aw", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDE6\uD83C\uDDFC",
      fitzpatrick_scale: false,
      category: "flags"
    },
    australia: {
      keywords: ["au", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDE6\uD83C\uDDFA",
      fitzpatrick_scale: false,
      category: "flags"
    },
    austria: {
      keywords: ["at", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDE6\uD83C\uDDF9",
      fitzpatrick_scale: false,
      category: "flags"
    },
    azerbaijan: {
      keywords: ["az", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDE6\uD83C\uDDFF",
      fitzpatrick_scale: false,
      category: "flags"
    },
    bahamas: {
      keywords: ["bs", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDE7\uD83C\uDDF8",
      fitzpatrick_scale: false,
      category: "flags"
    },
    bahrain: {
      keywords: ["bh", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDE7\uD83C\uDDED",
      fitzpatrick_scale: false,
      category: "flags"
    },
    bangladesh: {
      keywords: ["bd", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDE7\uD83C\uDDE9",
      fitzpatrick_scale: false,
      category: "flags"
    },
    barbados: {
      keywords: ["bb", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDE7\uD83C\uDDE7",
      fitzpatrick_scale: false,
      category: "flags"
    },
    belarus: {
      keywords: ["by", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDE7\uD83C\uDDFE",
      fitzpatrick_scale: false,
      category: "flags"
    },
    belgium: {
      keywords: ["be", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDE7\uD83C\uDDEA",
      fitzpatrick_scale: false,
      category: "flags"
    },
    belize: {
      keywords: ["bz", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDE7\uD83C\uDDFF",
      fitzpatrick_scale: false,
      category: "flags"
    },
    benin: {
      keywords: ["bj", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDE7\uD83C\uDDEF",
      fitzpatrick_scale: false,
      category: "flags"
    },
    bermuda: {
      keywords: ["bm", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDE7\uD83C\uDDF2",
      fitzpatrick_scale: false,
      category: "flags"
    },
    bhutan: {
      keywords: ["bt", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDE7\uD83C\uDDF9",
      fitzpatrick_scale: false,
      category: "flags"
    },
    bolivia: {
      keywords: ["bo", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDE7\uD83C\uDDF4",
      fitzpatrick_scale: false,
      category: "flags"
    },
    caribbean_netherlands: {
      keywords: ["bonaire", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDE7\uD83C\uDDF6",
      fitzpatrick_scale: false,
      category: "flags"
    },
    bosnia_herzegovina: {
      keywords: ["bosnia", "herzegovina", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDE7\uD83C\uDDE6",
      fitzpatrick_scale: false,
      category: "flags"
    },
    botswana: {
      keywords: ["bw", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDE7\uD83C\uDDFC",
      fitzpatrick_scale: false,
      category: "flags"
    },
    brazil: {
      keywords: ["br", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDE7\uD83C\uDDF7",
      fitzpatrick_scale: false,
      category: "flags"
    },
    british_indian_ocean_territory: {
      keywords: ["british", "indian", "ocean", "territory", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDEE\uD83C\uDDF4",
      fitzpatrick_scale: false,
      category: "flags"
    },
    british_virgin_islands: {
      keywords: ["british", "virgin", "islands", "bvi", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDFB\uD83C\uDDEC",
      fitzpatrick_scale: false,
      category: "flags"
    },
    brunei: {
      keywords: ["bn", "darussalam", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDE7\uD83C\uDDF3",
      fitzpatrick_scale: false,
      category: "flags"
    },
    bulgaria: {
      keywords: ["bg", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDE7\uD83C\uDDEC",
      fitzpatrick_scale: false,
      category: "flags"
    },
    burkina_faso: {
      keywords: ["burkina", "faso", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDE7\uD83C\uDDEB",
      fitzpatrick_scale: false,
      category: "flags"
    },
    burundi: {
      keywords: ["bi", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDE7\uD83C\uDDEE",
      fitzpatrick_scale: false,
      category: "flags"
    },
    cape_verde: {
      keywords: ["cabo", "verde", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDE8\uD83C\uDDFB",
      fitzpatrick_scale: false,
      category: "flags"
    },
    cambodia: {
      keywords: ["kh", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF0\uD83C\uDDED",
      fitzpatrick_scale: false,
      category: "flags"
    },
    cameroon: {
      keywords: ["cm", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDE8\uD83C\uDDF2",
      fitzpatrick_scale: false,
      category: "flags"
    },
    canada: {
      keywords: ["ca", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDE8\uD83C\uDDE6",
      fitzpatrick_scale: false,
      category: "flags"
    },
    canary_islands: {
      keywords: ["canary", "islands", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDEE\uD83C\uDDE8",
      fitzpatrick_scale: false,
      category: "flags"
    },
    cayman_islands: {
      keywords: ["cayman", "islands", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF0\uD83C\uDDFE",
      fitzpatrick_scale: false,
      category: "flags"
    },
    central_african_republic: {
      keywords: ["central", "african", "republic", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDE8\uD83C\uDDEB",
      fitzpatrick_scale: false,
      category: "flags"
    },
    chad: {
      keywords: ["td", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF9\uD83C\uDDE9",
      fitzpatrick_scale: false,
      category: "flags"
    },
    chile: {
      keywords: ["flag", "nation", "country", "banner"],
      char: "\uD83C\uDDE8\uD83C\uDDF1",
      fitzpatrick_scale: false,
      category: "flags"
    },
    cn: {
      keywords: ["china", "chinese", "prc", "flag", "country", "nation", "banner"],
      char: "\uD83C\uDDE8\uD83C\uDDF3",
      fitzpatrick_scale: false,
      category: "flags"
    },
    christmas_island: {
      keywords: ["christmas", "island", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDE8\uD83C\uDDFD",
      fitzpatrick_scale: false,
      category: "flags"
    },
    cocos_islands: {
      keywords: ["cocos", "keeling", "islands", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDE8\uD83C\uDDE8",
      fitzpatrick_scale: false,
      category: "flags"
    },
    colombia: {
      keywords: ["co", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDE8\uD83C\uDDF4",
      fitzpatrick_scale: false,
      category: "flags"
    },
    comoros: {
      keywords: ["km", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF0\uD83C\uDDF2",
      fitzpatrick_scale: false,
      category: "flags"
    },
    congo_brazzaville: {
      keywords: ["congo", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDE8\uD83C\uDDEC",
      fitzpatrick_scale: false,
      category: "flags"
    },
    congo_kinshasa: {
      keywords: ["congo", "democratic", "republic", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDE8\uD83C\uDDE9",
      fitzpatrick_scale: false,
      category: "flags"
    },
    cook_islands: {
      keywords: ["cook", "islands", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDE8\uD83C\uDDF0",
      fitzpatrick_scale: false,
      category: "flags"
    },
    costa_rica: {
      keywords: ["costa", "rica", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDE8\uD83C\uDDF7",
      fitzpatrick_scale: false,
      category: "flags"
    },
    croatia: {
      keywords: ["hr", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDED\uD83C\uDDF7",
      fitzpatrick_scale: false,
      category: "flags"
    },
    cuba: {
      keywords: ["cu", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDE8\uD83C\uDDFA",
      fitzpatrick_scale: false,
      category: "flags"
    },
    curacao: {
      keywords: ["cura\xE7ao", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDE8\uD83C\uDDFC",
      fitzpatrick_scale: false,
      category: "flags"
    },
    cyprus: {
      keywords: ["cy", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDE8\uD83C\uDDFE",
      fitzpatrick_scale: false,
      category: "flags"
    },
    czech_republic: {
      keywords: ["cz", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDE8\uD83C\uDDFF",
      fitzpatrick_scale: false,
      category: "flags"
    },
    denmark: {
      keywords: ["dk", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDE9\uD83C\uDDF0",
      fitzpatrick_scale: false,
      category: "flags"
    },
    djibouti: {
      keywords: ["dj", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDE9\uD83C\uDDEF",
      fitzpatrick_scale: false,
      category: "flags"
    },
    dominica: {
      keywords: ["dm", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDE9\uD83C\uDDF2",
      fitzpatrick_scale: false,
      category: "flags"
    },
    dominican_republic: {
      keywords: ["dominican", "republic", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDE9\uD83C\uDDF4",
      fitzpatrick_scale: false,
      category: "flags"
    },
    ecuador: {
      keywords: ["ec", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDEA\uD83C\uDDE8",
      fitzpatrick_scale: false,
      category: "flags"
    },
    egypt: {
      keywords: ["eg", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDEA\uD83C\uDDEC",
      fitzpatrick_scale: false,
      category: "flags"
    },
    el_salvador: {
      keywords: ["el", "salvador", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF8\uD83C\uDDFB",
      fitzpatrick_scale: false,
      category: "flags"
    },
    equatorial_guinea: {
      keywords: ["equatorial", "gn", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDEC\uD83C\uDDF6",
      fitzpatrick_scale: false,
      category: "flags"
    },
    eritrea: {
      keywords: ["er", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDEA\uD83C\uDDF7",
      fitzpatrick_scale: false,
      category: "flags"
    },
    estonia: {
      keywords: ["ee", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDEA\uD83C\uDDEA",
      fitzpatrick_scale: false,
      category: "flags"
    },
    ethiopia: {
      keywords: ["et", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDEA\uD83C\uDDF9",
      fitzpatrick_scale: false,
      category: "flags"
    },
    eu: {
      keywords: ["european", "union", "flag", "banner"],
      char: "\uD83C\uDDEA\uD83C\uDDFA",
      fitzpatrick_scale: false,
      category: "flags"
    },
    falkland_islands: {
      keywords: ["falkland", "islands", "malvinas", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDEB\uD83C\uDDF0",
      fitzpatrick_scale: false,
      category: "flags"
    },
    faroe_islands: {
      keywords: ["faroe", "islands", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDEB\uD83C\uDDF4",
      fitzpatrick_scale: false,
      category: "flags"
    },
    fiji: {
      keywords: ["fj", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDEB\uD83C\uDDEF",
      fitzpatrick_scale: false,
      category: "flags"
    },
    finland: {
      keywords: ["fi", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDEB\uD83C\uDDEE",
      fitzpatrick_scale: false,
      category: "flags"
    },
    fr: {
      keywords: ["banner", "flag", "nation", "france", "french", "country"],
      char: "\uD83C\uDDEB\uD83C\uDDF7",
      fitzpatrick_scale: false,
      category: "flags"
    },
    french_guiana: {
      keywords: ["french", "guiana", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDEC\uD83C\uDDEB",
      fitzpatrick_scale: false,
      category: "flags"
    },
    french_polynesia: {
      keywords: ["french", "polynesia", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF5\uD83C\uDDEB",
      fitzpatrick_scale: false,
      category: "flags"
    },
    french_southern_territories: {
      keywords: ["french", "southern", "territories", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF9\uD83C\uDDEB",
      fitzpatrick_scale: false,
      category: "flags"
    },
    gabon: {
      keywords: ["ga", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDEC\uD83C\uDDE6",
      fitzpatrick_scale: false,
      category: "flags"
    },
    gambia: {
      keywords: ["gm", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDEC\uD83C\uDDF2",
      fitzpatrick_scale: false,
      category: "flags"
    },
    georgia: {
      keywords: ["ge", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDEC\uD83C\uDDEA",
      fitzpatrick_scale: false,
      category: "flags"
    },
    de: {
      keywords: ["german", "nation", "flag", "country", "banner"],
      char: "\uD83C\uDDE9\uD83C\uDDEA",
      fitzpatrick_scale: false,
      category: "flags"
    },
    ghana: {
      keywords: ["gh", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDEC\uD83C\uDDED",
      fitzpatrick_scale: false,
      category: "flags"
    },
    gibraltar: {
      keywords: ["gi", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDEC\uD83C\uDDEE",
      fitzpatrick_scale: false,
      category: "flags"
    },
    greece: {
      keywords: ["gr", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDEC\uD83C\uDDF7",
      fitzpatrick_scale: false,
      category: "flags"
    },
    greenland: {
      keywords: ["gl", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDEC\uD83C\uDDF1",
      fitzpatrick_scale: false,
      category: "flags"
    },
    grenada: {
      keywords: ["gd", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDEC\uD83C\uDDE9",
      fitzpatrick_scale: false,
      category: "flags"
    },
    guadeloupe: {
      keywords: ["gp", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDEC\uD83C\uDDF5",
      fitzpatrick_scale: false,
      category: "flags"
    },
    guam: {
      keywords: ["gu", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDEC\uD83C\uDDFA",
      fitzpatrick_scale: false,
      category: "flags"
    },
    guatemala: {
      keywords: ["gt", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDEC\uD83C\uDDF9",
      fitzpatrick_scale: false,
      category: "flags"
    },
    guernsey: {
      keywords: ["gg", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDEC\uD83C\uDDEC",
      fitzpatrick_scale: false,
      category: "flags"
    },
    guinea: {
      keywords: ["gn", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDEC\uD83C\uDDF3",
      fitzpatrick_scale: false,
      category: "flags"
    },
    guinea_bissau: {
      keywords: ["gw", "bissau", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDEC\uD83C\uDDFC",
      fitzpatrick_scale: false,
      category: "flags"
    },
    guyana: {
      keywords: ["gy", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDEC\uD83C\uDDFE",
      fitzpatrick_scale: false,
      category: "flags"
    },
    haiti: {
      keywords: ["ht", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDED\uD83C\uDDF9",
      fitzpatrick_scale: false,
      category: "flags"
    },
    honduras: {
      keywords: ["hn", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDED\uD83C\uDDF3",
      fitzpatrick_scale: false,
      category: "flags"
    },
    hong_kong: {
      keywords: ["hong", "kong", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDED\uD83C\uDDF0",
      fitzpatrick_scale: false,
      category: "flags"
    },
    hungary: {
      keywords: ["hu", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDED\uD83C\uDDFA",
      fitzpatrick_scale: false,
      category: "flags"
    },
    iceland: {
      keywords: ["is", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDEE\uD83C\uDDF8",
      fitzpatrick_scale: false,
      category: "flags"
    },
    india: {
      keywords: ["in", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDEE\uD83C\uDDF3",
      fitzpatrick_scale: false,
      category: "flags"
    },
    indonesia: {
      keywords: ["flag", "nation", "country", "banner"],
      char: "\uD83C\uDDEE\uD83C\uDDE9",
      fitzpatrick_scale: false,
      category: "flags"
    },
    iran: {
      keywords: ["iran,", "islamic", "republic", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDEE\uD83C\uDDF7",
      fitzpatrick_scale: false,
      category: "flags"
    },
    iraq: {
      keywords: ["iq", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDEE\uD83C\uDDF6",
      fitzpatrick_scale: false,
      category: "flags"
    },
    ireland: {
      keywords: ["ie", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDEE\uD83C\uDDEA",
      fitzpatrick_scale: false,
      category: "flags"
    },
    isle_of_man: {
      keywords: ["isle", "man", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDEE\uD83C\uDDF2",
      fitzpatrick_scale: false,
      category: "flags"
    },
    israel: {
      keywords: ["il", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDEE\uD83C\uDDF1",
      fitzpatrick_scale: false,
      category: "flags"
    },
    it: {
      keywords: ["italy", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDEE\uD83C\uDDF9",
      fitzpatrick_scale: false,
      category: "flags"
    },
    cote_divoire: {
      keywords: ["ivory", "coast", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDE8\uD83C\uDDEE",
      fitzpatrick_scale: false,
      category: "flags"
    },
    jamaica: {
      keywords: ["jm", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDEF\uD83C\uDDF2",
      fitzpatrick_scale: false,
      category: "flags"
    },
    jp: {
      keywords: ["japanese", "nation", "flag", "country", "banner"],
      char: "\uD83C\uDDEF\uD83C\uDDF5",
      fitzpatrick_scale: false,
      category: "flags"
    },
    jersey: {
      keywords: ["je", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDEF\uD83C\uDDEA",
      fitzpatrick_scale: false,
      category: "flags"
    },
    jordan: {
      keywords: ["jo", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDEF\uD83C\uDDF4",
      fitzpatrick_scale: false,
      category: "flags"
    },
    kazakhstan: {
      keywords: ["kz", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF0\uD83C\uDDFF",
      fitzpatrick_scale: false,
      category: "flags"
    },
    kenya: {
      keywords: ["ke", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF0\uD83C\uDDEA",
      fitzpatrick_scale: false,
      category: "flags"
    },
    kiribati: {
      keywords: ["ki", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF0\uD83C\uDDEE",
      fitzpatrick_scale: false,
      category: "flags"
    },
    kosovo: {
      keywords: ["xk", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDFD\uD83C\uDDF0",
      fitzpatrick_scale: false,
      category: "flags"
    },
    kuwait: {
      keywords: ["kw", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF0\uD83C\uDDFC",
      fitzpatrick_scale: false,
      category: "flags"
    },
    kyrgyzstan: {
      keywords: ["kg", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF0\uD83C\uDDEC",
      fitzpatrick_scale: false,
      category: "flags"
    },
    laos: {
      keywords: ["lao", "democratic", "republic", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF1\uD83C\uDDE6",
      fitzpatrick_scale: false,
      category: "flags"
    },
    latvia: {
      keywords: ["lv", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF1\uD83C\uDDFB",
      fitzpatrick_scale: false,
      category: "flags"
    },
    lebanon: {
      keywords: ["lb", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF1\uD83C\uDDE7",
      fitzpatrick_scale: false,
      category: "flags"
    },
    lesotho: {
      keywords: ["ls", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF1\uD83C\uDDF8",
      fitzpatrick_scale: false,
      category: "flags"
    },
    liberia: {
      keywords: ["lr", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF1\uD83C\uDDF7",
      fitzpatrick_scale: false,
      category: "flags"
    },
    libya: {
      keywords: ["ly", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF1\uD83C\uDDFE",
      fitzpatrick_scale: false,
      category: "flags"
    },
    liechtenstein: {
      keywords: ["li", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF1\uD83C\uDDEE",
      fitzpatrick_scale: false,
      category: "flags"
    },
    lithuania: {
      keywords: ["lt", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF1\uD83C\uDDF9",
      fitzpatrick_scale: false,
      category: "flags"
    },
    luxembourg: {
      keywords: ["lu", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF1\uD83C\uDDFA",
      fitzpatrick_scale: false,
      category: "flags"
    },
    macau: {
      keywords: ["macao", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF2\uD83C\uDDF4",
      fitzpatrick_scale: false,
      category: "flags"
    },
    macedonia: {
      keywords: ["macedonia,", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF2\uD83C\uDDF0",
      fitzpatrick_scale: false,
      category: "flags"
    },
    madagascar: {
      keywords: ["mg", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF2\uD83C\uDDEC",
      fitzpatrick_scale: false,
      category: "flags"
    },
    malawi: {
      keywords: ["mw", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF2\uD83C\uDDFC",
      fitzpatrick_scale: false,
      category: "flags"
    },
    malaysia: {
      keywords: ["my", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF2\uD83C\uDDFE",
      fitzpatrick_scale: false,
      category: "flags"
    },
    maldives: {
      keywords: ["mv", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF2\uD83C\uDDFB",
      fitzpatrick_scale: false,
      category: "flags"
    },
    mali: {
      keywords: ["ml", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF2\uD83C\uDDF1",
      fitzpatrick_scale: false,
      category: "flags"
    },
    malta: {
      keywords: ["mt", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF2\uD83C\uDDF9",
      fitzpatrick_scale: false,
      category: "flags"
    },
    marshall_islands: {
      keywords: ["marshall", "islands", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF2\uD83C\uDDED",
      fitzpatrick_scale: false,
      category: "flags"
    },
    martinique: {
      keywords: ["mq", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF2\uD83C\uDDF6",
      fitzpatrick_scale: false,
      category: "flags"
    },
    mauritania: {
      keywords: ["mr", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF2\uD83C\uDDF7",
      fitzpatrick_scale: false,
      category: "flags"
    },
    mauritius: {
      keywords: ["mu", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF2\uD83C\uDDFA",
      fitzpatrick_scale: false,
      category: "flags"
    },
    mayotte: {
      keywords: ["yt", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDFE\uD83C\uDDF9",
      fitzpatrick_scale: false,
      category: "flags"
    },
    mexico: {
      keywords: ["mx", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF2\uD83C\uDDFD",
      fitzpatrick_scale: false,
      category: "flags"
    },
    micronesia: {
      keywords: ["micronesia,", "federated", "states", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDEB\uD83C\uDDF2",
      fitzpatrick_scale: false,
      category: "flags"
    },
    moldova: {
      keywords: ["moldova,", "republic", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF2\uD83C\uDDE9",
      fitzpatrick_scale: false,
      category: "flags"
    },
    monaco: {
      keywords: ["mc", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF2\uD83C\uDDE8",
      fitzpatrick_scale: false,
      category: "flags"
    },
    mongolia: {
      keywords: ["mn", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF2\uD83C\uDDF3",
      fitzpatrick_scale: false,
      category: "flags"
    },
    montenegro: {
      keywords: ["me", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF2\uD83C\uDDEA",
      fitzpatrick_scale: false,
      category: "flags"
    },
    montserrat: {
      keywords: ["ms", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF2\uD83C\uDDF8",
      fitzpatrick_scale: false,
      category: "flags"
    },
    morocco: {
      keywords: ["ma", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF2\uD83C\uDDE6",
      fitzpatrick_scale: false,
      category: "flags"
    },
    mozambique: {
      keywords: ["mz", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF2\uD83C\uDDFF",
      fitzpatrick_scale: false,
      category: "flags"
    },
    myanmar: {
      keywords: ["mm", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF2\uD83C\uDDF2",
      fitzpatrick_scale: false,
      category: "flags"
    },
    namibia: {
      keywords: ["na", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF3\uD83C\uDDE6",
      fitzpatrick_scale: false,
      category: "flags"
    },
    nauru: {
      keywords: ["nr", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF3\uD83C\uDDF7",
      fitzpatrick_scale: false,
      category: "flags"
    },
    nepal: {
      keywords: ["np", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF3\uD83C\uDDF5",
      fitzpatrick_scale: false,
      category: "flags"
    },
    netherlands: {
      keywords: ["nl", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF3\uD83C\uDDF1",
      fitzpatrick_scale: false,
      category: "flags"
    },
    new_caledonia: {
      keywords: ["new", "caledonia", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF3\uD83C\uDDE8",
      fitzpatrick_scale: false,
      category: "flags"
    },
    new_zealand: {
      keywords: ["new", "zealand", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF3\uD83C\uDDFF",
      fitzpatrick_scale: false,
      category: "flags"
    },
    nicaragua: {
      keywords: ["ni", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF3\uD83C\uDDEE",
      fitzpatrick_scale: false,
      category: "flags"
    },
    niger: {
      keywords: ["ne", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF3\uD83C\uDDEA",
      fitzpatrick_scale: false,
      category: "flags"
    },
    nigeria: {
      keywords: ["flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF3\uD83C\uDDEC",
      fitzpatrick_scale: false,
      category: "flags"
    },
    niue: {
      keywords: ["nu", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF3\uD83C\uDDFA",
      fitzpatrick_scale: false,
      category: "flags"
    },
    norfolk_island: {
      keywords: ["norfolk", "island", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF3\uD83C\uDDEB",
      fitzpatrick_scale: false,
      category: "flags"
    },
    northern_mariana_islands: {
      keywords: ["northern", "mariana", "islands", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF2\uD83C\uDDF5",
      fitzpatrick_scale: false,
      category: "flags"
    },
    north_korea: {
      keywords: ["north", "korea", "nation", "flag", "country", "banner"],
      char: "\uD83C\uDDF0\uD83C\uDDF5",
      fitzpatrick_scale: false,
      category: "flags"
    },
    norway: {
      keywords: ["no", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF3\uD83C\uDDF4",
      fitzpatrick_scale: false,
      category: "flags"
    },
    oman: {
      keywords: ["om_symbol", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF4\uD83C\uDDF2",
      fitzpatrick_scale: false,
      category: "flags"
    },
    pakistan: {
      keywords: ["pk", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF5\uD83C\uDDF0",
      fitzpatrick_scale: false,
      category: "flags"
    },
    palau: {
      keywords: ["pw", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF5\uD83C\uDDFC",
      fitzpatrick_scale: false,
      category: "flags"
    },
    palestinian_territories: {
      keywords: ["palestine", "palestinian", "territories", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF5\uD83C\uDDF8",
      fitzpatrick_scale: false,
      category: "flags"
    },
    panama: {
      keywords: ["pa", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF5\uD83C\uDDE6",
      fitzpatrick_scale: false,
      category: "flags"
    },
    papua_new_guinea: {
      keywords: ["papua", "new", "guinea", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF5\uD83C\uDDEC",
      fitzpatrick_scale: false,
      category: "flags"
    },
    paraguay: {
      keywords: ["py", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF5\uD83C\uDDFE",
      fitzpatrick_scale: false,
      category: "flags"
    },
    peru: {
      keywords: ["pe", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF5\uD83C\uDDEA",
      fitzpatrick_scale: false,
      category: "flags"
    },
    philippines: {
      keywords: ["ph", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF5\uD83C\uDDED",
      fitzpatrick_scale: false,
      category: "flags"
    },
    pitcairn_islands: {
      keywords: ["pitcairn", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF5\uD83C\uDDF3",
      fitzpatrick_scale: false,
      category: "flags"
    },
    poland: {
      keywords: ["pl", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF5\uD83C\uDDF1",
      fitzpatrick_scale: false,
      category: "flags"
    },
    portugal: {
      keywords: ["pt", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF5\uD83C\uDDF9",
      fitzpatrick_scale: false,
      category: "flags"
    },
    puerto_rico: {
      keywords: ["puerto", "rico", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF5\uD83C\uDDF7",
      fitzpatrick_scale: false,
      category: "flags"
    },
    qatar: {
      keywords: ["qa", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF6\uD83C\uDDE6",
      fitzpatrick_scale: false,
      category: "flags"
    },
    reunion: {
      keywords: ["r\xE9union", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF7\uD83C\uDDEA",
      fitzpatrick_scale: false,
      category: "flags"
    },
    romania: {
      keywords: ["ro", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF7\uD83C\uDDF4",
      fitzpatrick_scale: false,
      category: "flags"
    },
    ru: {
      keywords: ["russian", "federation", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF7\uD83C\uDDFA",
      fitzpatrick_scale: false,
      category: "flags"
    },
    rwanda: {
      keywords: ["rw", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF7\uD83C\uDDFC",
      fitzpatrick_scale: false,
      category: "flags"
    },
    st_barthelemy: {
      keywords: ["saint", "barth\xE9lemy", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDE7\uD83C\uDDF1",
      fitzpatrick_scale: false,
      category: "flags"
    },
    st_helena: {
      keywords: ["saint", "helena", "ascension", "tristan", "cunha", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF8\uD83C\uDDED",
      fitzpatrick_scale: false,
      category: "flags"
    },
    st_kitts_nevis: {
      keywords: ["saint", "kitts", "nevis", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF0\uD83C\uDDF3",
      fitzpatrick_scale: false,
      category: "flags"
    },
    st_lucia: {
      keywords: ["saint", "lucia", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF1\uD83C\uDDE8",
      fitzpatrick_scale: false,
      category: "flags"
    },
    st_pierre_miquelon: {
      keywords: ["saint", "pierre", "miquelon", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF5\uD83C\uDDF2",
      fitzpatrick_scale: false,
      category: "flags"
    },
    st_vincent_grenadines: {
      keywords: ["saint", "vincent", "grenadines", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDFB\uD83C\uDDE8",
      fitzpatrick_scale: false,
      category: "flags"
    },
    samoa: {
      keywords: ["ws", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDFC\uD83C\uDDF8",
      fitzpatrick_scale: false,
      category: "flags"
    },
    san_marino: {
      keywords: ["san", "marino", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF8\uD83C\uDDF2",
      fitzpatrick_scale: false,
      category: "flags"
    },
    sao_tome_principe: {
      keywords: ["sao", "tome", "principe", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF8\uD83C\uDDF9",
      fitzpatrick_scale: false,
      category: "flags"
    },
    saudi_arabia: {
      keywords: ["flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF8\uD83C\uDDE6",
      fitzpatrick_scale: false,
      category: "flags"
    },
    senegal: {
      keywords: ["sn", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF8\uD83C\uDDF3",
      fitzpatrick_scale: false,
      category: "flags"
    },
    serbia: {
      keywords: ["rs", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF7\uD83C\uDDF8",
      fitzpatrick_scale: false,
      category: "flags"
    },
    seychelles: {
      keywords: ["sc", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF8\uD83C\uDDE8",
      fitzpatrick_scale: false,
      category: "flags"
    },
    sierra_leone: {
      keywords: ["sierra", "leone", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF8\uD83C\uDDF1",
      fitzpatrick_scale: false,
      category: "flags"
    },
    singapore: {
      keywords: ["sg", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF8\uD83C\uDDEC",
      fitzpatrick_scale: false,
      category: "flags"
    },
    sint_maarten: {
      keywords: ["sint", "maarten", "dutch", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF8\uD83C\uDDFD",
      fitzpatrick_scale: false,
      category: "flags"
    },
    slovakia: {
      keywords: ["sk", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF8\uD83C\uDDF0",
      fitzpatrick_scale: false,
      category: "flags"
    },
    slovenia: {
      keywords: ["si", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF8\uD83C\uDDEE",
      fitzpatrick_scale: false,
      category: "flags"
    },
    solomon_islands: {
      keywords: ["solomon", "islands", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF8\uD83C\uDDE7",
      fitzpatrick_scale: false,
      category: "flags"
    },
    somalia: {
      keywords: ["so", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF8\uD83C\uDDF4",
      fitzpatrick_scale: false,
      category: "flags"
    },
    south_africa: {
      keywords: ["south", "africa", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDFF\uD83C\uDDE6",
      fitzpatrick_scale: false,
      category: "flags"
    },
    south_georgia_south_sandwich_islands: {
      keywords: ["south", "georgia", "sandwich", "islands", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDEC\uD83C\uDDF8",
      fitzpatrick_scale: false,
      category: "flags"
    },
    kr: {
      keywords: ["south", "korea", "nation", "flag", "country", "banner"],
      char: "\uD83C\uDDF0\uD83C\uDDF7",
      fitzpatrick_scale: false,
      category: "flags"
    },
    south_sudan: {
      keywords: ["south", "sd", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF8\uD83C\uDDF8",
      fitzpatrick_scale: false,
      category: "flags"
    },
    es: {
      keywords: ["spain", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDEA\uD83C\uDDF8",
      fitzpatrick_scale: false,
      category: "flags"
    },
    sri_lanka: {
      keywords: ["sri", "lanka", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF1\uD83C\uDDF0",
      fitzpatrick_scale: false,
      category: "flags"
    },
    sudan: {
      keywords: ["sd", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF8\uD83C\uDDE9",
      fitzpatrick_scale: false,
      category: "flags"
    },
    suriname: {
      keywords: ["sr", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF8\uD83C\uDDF7",
      fitzpatrick_scale: false,
      category: "flags"
    },
    swaziland: {
      keywords: ["sz", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF8\uD83C\uDDFF",
      fitzpatrick_scale: false,
      category: "flags"
    },
    sweden: {
      keywords: ["se", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF8\uD83C\uDDEA",
      fitzpatrick_scale: false,
      category: "flags"
    },
    switzerland: {
      keywords: ["ch", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDE8\uD83C\uDDED",
      fitzpatrick_scale: false,
      category: "flags"
    },
    syria: {
      keywords: ["syrian", "arab", "republic", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF8\uD83C\uDDFE",
      fitzpatrick_scale: false,
      category: "flags"
    },
    taiwan: {
      keywords: ["tw", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF9\uD83C\uDDFC",
      fitzpatrick_scale: false,
      category: "flags"
    },
    tajikistan: {
      keywords: ["tj", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF9\uD83C\uDDEF",
      fitzpatrick_scale: false,
      category: "flags"
    },
    tanzania: {
      keywords: ["tanzania,", "united", "republic", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF9\uD83C\uDDFF",
      fitzpatrick_scale: false,
      category: "flags"
    },
    thailand: {
      keywords: ["th", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF9\uD83C\uDDED",
      fitzpatrick_scale: false,
      category: "flags"
    },
    timor_leste: {
      keywords: ["timor", "leste", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF9\uD83C\uDDF1",
      fitzpatrick_scale: false,
      category: "flags"
    },
    togo: {
      keywords: ["tg", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF9\uD83C\uDDEC",
      fitzpatrick_scale: false,
      category: "flags"
    },
    tokelau: {
      keywords: ["tk", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF9\uD83C\uDDF0",
      fitzpatrick_scale: false,
      category: "flags"
    },
    tonga: {
      keywords: ["to", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF9\uD83C\uDDF4",
      fitzpatrick_scale: false,
      category: "flags"
    },
    trinidad_tobago: {
      keywords: ["trinidad", "tobago", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF9\uD83C\uDDF9",
      fitzpatrick_scale: false,
      category: "flags"
    },
    tunisia: {
      keywords: ["tn", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF9\uD83C\uDDF3",
      fitzpatrick_scale: false,
      category: "flags"
    },
    tr: {
      keywords: ["turkey", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF9\uD83C\uDDF7",
      fitzpatrick_scale: false,
      category: "flags"
    },
    turkmenistan: {
      keywords: ["flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF9\uD83C\uDDF2",
      fitzpatrick_scale: false,
      category: "flags"
    },
    turks_caicos_islands: {
      keywords: ["turks", "caicos", "islands", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF9\uD83C\uDDE8",
      fitzpatrick_scale: false,
      category: "flags"
    },
    tuvalu: {
      keywords: ["flag", "nation", "country", "banner"],
      char: "\uD83C\uDDF9\uD83C\uDDFB",
      fitzpatrick_scale: false,
      category: "flags"
    },
    uganda: {
      keywords: ["ug", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDFA\uD83C\uDDEC",
      fitzpatrick_scale: false,
      category: "flags"
    },
    ukraine: {
      keywords: ["ua", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDFA\uD83C\uDDE6",
      fitzpatrick_scale: false,
      category: "flags"
    },
    united_arab_emirates: {
      keywords: ["united", "arab", "emirates", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDE6\uD83C\uDDEA",
      fitzpatrick_scale: false,
      category: "flags"
    },
    uk: {
      keywords: ["united", "kingdom", "great", "britain", "northern", "ireland", "flag", "nation", "country", "banner", "british", "UK", "english", "england", "union jack"],
      char: "\uD83C\uDDEC\uD83C\uDDE7",
      fitzpatrick_scale: false,
      category: "flags"
    },
    england: {
      keywords: ["flag", "english"],
      char: "\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67\uDB40\uDC7F",
      fitzpatrick_scale: false,
      category: "flags"
    },
    scotland: {
      keywords: ["flag", "scottish"],
      char: "\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62\uDB40\uDC73\uDB40\uDC63\uDB40\uDC74\uDB40\uDC7F",
      fitzpatrick_scale: false,
      category: "flags"
    },
    wales: {
      keywords: ["flag", "welsh"],
      char: "\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62\uDB40\uDC77\uDB40\uDC6C\uDB40\uDC73\uDB40\uDC7F",
      fitzpatrick_scale: false,
      category: "flags"
    },
    us: {
      keywords: ["united", "states", "america", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDFA\uD83C\uDDF8",
      fitzpatrick_scale: false,
      category: "flags"
    },
    us_virgin_islands: {
      keywords: ["virgin", "islands", "us", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDFB\uD83C\uDDEE",
      fitzpatrick_scale: false,
      category: "flags"
    },
    uruguay: {
      keywords: ["uy", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDFA\uD83C\uDDFE",
      fitzpatrick_scale: false,
      category: "flags"
    },
    uzbekistan: {
      keywords: ["uz", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDFA\uD83C\uDDFF",
      fitzpatrick_scale: false,
      category: "flags"
    },
    vanuatu: {
      keywords: ["vu", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDFB\uD83C\uDDFA",
      fitzpatrick_scale: false,
      category: "flags"
    },
    vatican_city: {
      keywords: ["vatican", "city", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDFB\uD83C\uDDE6",
      fitzpatrick_scale: false,
      category: "flags"
    },
    venezuela: {
      keywords: ["ve", "bolivarian", "republic", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDFB\uD83C\uDDEA",
      fitzpatrick_scale: false,
      category: "flags"
    },
    vietnam: {
      keywords: ["viet", "nam", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDFB\uD83C\uDDF3",
      fitzpatrick_scale: false,
      category: "flags"
    },
    wallis_futuna: {
      keywords: ["wallis", "futuna", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDFC\uD83C\uDDEB",
      fitzpatrick_scale: false,
      category: "flags"
    },
    western_sahara: {
      keywords: ["western", "sahara", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDEA\uD83C\uDDED",
      fitzpatrick_scale: false,
      category: "flags"
    },
    yemen: {
      keywords: ["ye", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDFE\uD83C\uDDEA",
      fitzpatrick_scale: false,
      category: "flags"
    },
    zambia: {
      keywords: ["zm", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDFF\uD83C\uDDF2",
      fitzpatrick_scale: false,
      category: "flags"
    },
    zimbabwe: {
      keywords: ["zw", "flag", "nation", "country", "banner"],
      char: "\uD83C\uDDFF\uD83C\uDDFC",
      fitzpatrick_scale: false,
      category: "flags"
    },
    united_nations: {
      keywords: ["un", "flag", "banner"],
      char: "\uD83C\uDDFA\uD83C\uDDF3",
      fitzpatrick_scale: false,
      category: "flags"
    },
    pirate_flag: {
      keywords: ["skull", "crossbones", "flag", "banner"],
      char: "\uD83C\uDFF4\u200D\u2620\uFE0F",
      fitzpatrick_scale: false,
      category: "flags"
    }
  };
});

// node_modules/emojilib/ordered.json
var require_ordered = __commonJS((exports, module) => {
  module.exports = [
    "grinning",
    "smiley",
    "smile",
    "grin",
    "laughing",
    "sweat_smile",
    "joy",
    "rofl",
    "relaxed",
    "blush",
    "innocent",
    "slightly_smiling_face",
    "upside_down_face",
    "wink",
    "relieved",
    "heart_eyes",
    "smiling_face_with_three_hearts",
    "kissing_heart",
    "kissing",
    "kissing_smiling_eyes",
    "kissing_closed_eyes",
    "yum",
    "stuck_out_tongue",
    "stuck_out_tongue_closed_eyes",
    "stuck_out_tongue_winking_eye",
    "zany",
    "raised_eyebrow",
    "monocle",
    "nerd_face",
    "sunglasses",
    "star_struck",
    "partying",
    "smirk",
    "unamused",
    "disappointed",
    "pensive",
    "worried",
    "confused",
    "slightly_frowning_face",
    "frowning_face",
    "persevere",
    "confounded",
    "tired_face",
    "weary",
    "pleading",
    "cry",
    "sob",
    "triumph",
    "angry",
    "rage",
    "symbols_over_mouth",
    "exploding_head",
    "flushed",
    "hot",
    "cold",
    "scream",
    "fearful",
    "cold_sweat",
    "disappointed_relieved",
    "sweat",
    "hugs",
    "thinking",
    "hand_over_mouth",
    "shushing",
    "lying_face",
    "no_mouth",
    "neutral_face",
    "expressionless",
    "grimacing",
    "roll_eyes",
    "hushed",
    "frowning",
    "anguished",
    "open_mouth",
    "astonished",
    "sleeping",
    "drooling_face",
    "sleepy",
    "dizzy_face",
    "zipper_mouth_face",
    "woozy",
    "nauseated_face",
    "vomiting",
    "sneezing_face",
    "mask",
    "face_with_thermometer",
    "face_with_head_bandage",
    "money_mouth_face",
    "cowboy_hat_face",
    "smiling_imp",
    "imp",
    "japanese_ogre",
    "japanese_goblin",
    "clown_face",
    "poop",
    "ghost",
    "skull",
    "skull_and_crossbones",
    "alien",
    "space_invader",
    "robot",
    "jack_o_lantern",
    "smiley_cat",
    "smile_cat",
    "joy_cat",
    "heart_eyes_cat",
    "smirk_cat",
    "kissing_cat",
    "scream_cat",
    "crying_cat_face",
    "pouting_cat",
    "palms_up",
    "open_hands",
    "raised_hands",
    "clap",
    "handshake",
    "+1",
    "-1",
    "facepunch",
    "fist",
    "fist_left",
    "fist_right",
    "crossed_fingers",
    "v",
    "love_you",
    "metal",
    "ok_hand",
    "point_left",
    "point_right",
    "point_up",
    "point_down",
    "point_up_2",
    "raised_hand",
    "raised_back_of_hand",
    "raised_hand_with_fingers_splayed",
    "vulcan_salute",
    "wave",
    "call_me_hand",
    "muscle",
    "fu",
    "writing_hand",
    "pray",
    "foot",
    "leg",
    "ring",
    "lipstick",
    "kiss",
    "lips",
    "tooth",
    "tongue",
    "ear",
    "nose",
    "footprints",
    "eye",
    "eyes",
    "brain",
    "speaking_head",
    "bust_in_silhouette",
    "busts_in_silhouette",
    "baby",
    "girl",
    "child",
    "boy",
    "woman",
    "adult",
    "man",
    "blonde_woman",
    "blonde_man",
    "bearded_person",
    "older_woman",
    "older_adult",
    "older_man",
    "man_with_gua_pi_mao",
    "woman_with_headscarf",
    "woman_with_turban",
    "man_with_turban",
    "policewoman",
    "policeman",
    "construction_worker_woman",
    "construction_worker_man",
    "guardswoman",
    "guardsman",
    "female_detective",
    "male_detective",
    "woman_health_worker",
    "man_health_worker",
    "woman_farmer",
    "man_farmer",
    "woman_cook",
    "man_cook",
    "woman_student",
    "man_student",
    "woman_singer",
    "man_singer",
    "woman_teacher",
    "man_teacher",
    "woman_factory_worker",
    "man_factory_worker",
    "woman_technologist",
    "man_technologist",
    "woman_office_worker",
    "man_office_worker",
    "woman_mechanic",
    "man_mechanic",
    "woman_scientist",
    "man_scientist",
    "woman_artist",
    "man_artist",
    "woman_firefighter",
    "man_firefighter",
    "woman_pilot",
    "man_pilot",
    "woman_astronaut",
    "man_astronaut",
    "woman_judge",
    "man_judge",
    "bride_with_veil",
    "man_in_tuxedo",
    "princess",
    "prince",
    "woman_superhero",
    "man_superhero",
    "woman_supervillain",
    "man_supervillain",
    "mrs_claus",
    "santa",
    "sorceress",
    "wizard",
    "woman_elf",
    "man_elf",
    "woman_vampire",
    "man_vampire",
    "woman_zombie",
    "man_zombie",
    "woman_genie",
    "man_genie",
    "mermaid",
    "merman",
    "woman_fairy",
    "man_fairy",
    "angel",
    "pregnant_woman",
    "breastfeeding",
    "bowing_woman",
    "bowing_man",
    "tipping_hand_woman",
    "tipping_hand_man",
    "no_good_woman",
    "no_good_man",
    "ok_woman",
    "ok_man",
    "raising_hand_woman",
    "raising_hand_man",
    "woman_facepalming",
    "man_facepalming",
    "woman_shrugging",
    "man_shrugging",
    "pouting_woman",
    "pouting_man",
    "frowning_woman",
    "frowning_man",
    "haircut_woman",
    "haircut_man",
    "massage_woman",
    "massage_man",
    "woman_in_steamy_room",
    "man_in_steamy_room",
    "nail_care",
    "selfie",
    "dancer",
    "man_dancing",
    "dancing_women",
    "dancing_men",
    "business_suit_levitating",
    "walking_woman",
    "walking_man",
    "running_woman",
    "running_man",
    "couple",
    "two_women_holding_hands",
    "two_men_holding_hands",
    "couple_with_heart_woman_man",
    "couple_with_heart_woman_woman",
    "couple_with_heart_man_man",
    "couplekiss_man_woman",
    "couplekiss_woman_woman",
    "couplekiss_man_man",
    "family_man_woman_boy",
    "family_man_woman_girl",
    "family_man_woman_girl_boy",
    "family_man_woman_boy_boy",
    "family_man_woman_girl_girl",
    "family_woman_woman_boy",
    "family_woman_woman_girl",
    "family_woman_woman_girl_boy",
    "family_woman_woman_boy_boy",
    "family_woman_woman_girl_girl",
    "family_man_man_boy",
    "family_man_man_girl",
    "family_man_man_girl_boy",
    "family_man_man_boy_boy",
    "family_man_man_girl_girl",
    "family_woman_boy",
    "family_woman_girl",
    "family_woman_girl_boy",
    "family_woman_boy_boy",
    "family_woman_girl_girl",
    "family_man_boy",
    "family_man_girl",
    "family_man_girl_boy",
    "family_man_boy_boy",
    "family_man_girl_girl",
    "yarn",
    "thread",
    "coat",
    "labcoat",
    "womans_clothes",
    "tshirt",
    "jeans",
    "necktie",
    "dress",
    "bikini",
    "kimono",
    "flat_shoe",
    "high_heel",
    "sandal",
    "boot",
    "mans_shoe",
    "athletic_shoe",
    "hiking_boot",
    "socks",
    "gloves",
    "scarf",
    "tophat",
    "billed_hat",
    "womans_hat",
    "mortar_board",
    "rescue_worker_helmet",
    "crown",
    "pouch",
    "purse",
    "handbag",
    "briefcase",
    "school_satchel",
    "luggage",
    "eyeglasses",
    "dark_sunglasses",
    "goggles",
    "closed_umbrella",
    "dog",
    "cat",
    "mouse",
    "hamster",
    "rabbit",
    "fox_face",
    "bear",
    "panda_face",
    "koala",
    "tiger",
    "lion",
    "cow",
    "pig",
    "pig_nose",
    "frog",
    "monkey_face",
    "see_no_evil",
    "hear_no_evil",
    "speak_no_evil",
    "monkey",
    "chicken",
    "penguin",
    "bird",
    "baby_chick",
    "hatching_chick",
    "hatched_chick",
    "duck",
    "eagle",
    "owl",
    "bat",
    "wolf",
    "boar",
    "horse",
    "unicorn",
    "honeybee",
    "bug",
    "butterfly",
    "snail",
    "shell",
    "beetle",
    "ant",
    "mosquito",
    "grasshopper",
    "spider",
    "spider_web",
    "scorpion",
    "turtle",
    "snake",
    "lizard",
    "t-rex",
    "sauropod",
    "octopus",
    "squid",
    "shrimp",
    "lobster",
    "crab",
    "blowfish",
    "tropical_fish",
    "fish",
    "dolphin",
    "whale",
    "whale2",
    "shark",
    "crocodile",
    "tiger2",
    "leopard",
    "zebra",
    "gorilla",
    "elephant",
    "hippopotamus",
    "rhinoceros",
    "dromedary_camel",
    "giraffe",
    "kangaroo",
    "camel",
    "water_buffalo",
    "ox",
    "cow2",
    "racehorse",
    "pig2",
    "ram",
    "sheep",
    "llama",
    "goat",
    "deer",
    "dog2",
    "poodle",
    "cat2",
    "rooster",
    "turkey",
    "peacock",
    "parrot",
    "swan",
    "dove",
    "rabbit2",
    "raccoon",
    "badger",
    "rat",
    "mouse2",
    "chipmunk",
    "hedgehog",
    "paw_prints",
    "dragon",
    "dragon_face",
    "cactus",
    "christmas_tree",
    "evergreen_tree",
    "deciduous_tree",
    "palm_tree",
    "seedling",
    "herb",
    "shamrock",
    "four_leaf_clover",
    "bamboo",
    "tanabata_tree",
    "leaves",
    "fallen_leaf",
    "maple_leaf",
    "ear_of_rice",
    "hibiscus",
    "sunflower",
    "rose",
    "wilted_flower",
    "tulip",
    "blossom",
    "cherry_blossom",
    "bouquet",
    "mushroom",
    "earth_americas",
    "earth_africa",
    "earth_asia",
    "full_moon",
    "waning_gibbous_moon",
    "last_quarter_moon",
    "waning_crescent_moon",
    "new_moon",
    "waxing_crescent_moon",
    "first_quarter_moon",
    "waxing_gibbous_moon",
    "new_moon_with_face",
    "full_moon_with_face",
    "first_quarter_moon_with_face",
    "last_quarter_moon_with_face",
    "sun_with_face",
    "crescent_moon",
    "star",
    "star2",
    "dizzy",
    "sparkles",
    "comet",
    "sunny",
    "sun_behind_small_cloud",
    "partly_sunny",
    "sun_behind_large_cloud",
    "sun_behind_rain_cloud",
    "cloud",
    "cloud_with_rain",
    "cloud_with_lightning_and_rain",
    "cloud_with_lightning",
    "zap",
    "fire",
    "boom",
    "snowflake",
    "cloud_with_snow",
    "snowman",
    "snowman_with_snow",
    "wind_face",
    "dash",
    "tornado",
    "fog",
    "open_umbrella",
    "umbrella",
    "droplet",
    "sweat_drops",
    "ocean",
    "green_apple",
    "apple",
    "pear",
    "tangerine",
    "lemon",
    "banana",
    "watermelon",
    "grapes",
    "strawberry",
    "melon",
    "cherries",
    "peach",
    "mango",
    "pineapple",
    "coconut",
    "kiwi_fruit",
    "tomato",
    "eggplant",
    "avocado",
    "broccoli",
    "leafy_greens",
    "cucumber",
    "hot_pepper",
    "corn",
    "carrot",
    "potato",
    "sweet_potato",
    "croissant",
    "bagel",
    "bread",
    "baguette_bread",
    "pretzel",
    "cheese",
    "egg",
    "fried_egg",
    "pancakes",
    "bacon",
    "steak",
    "poultry_leg",
    "meat_on_bone",
    "bone",
    "hotdog",
    "hamburger",
    "fries",
    "pizza",
    "sandwich",
    "stuffed_flatbread",
    "taco",
    "burrito",
    "green_salad",
    "shallow_pan_of_food",
    "canned_food",
    "spaghetti",
    "ramen",
    "stew",
    "curry",
    "sushi",
    "bento",
    "fried_shrimp",
    "rice_ball",
    "rice",
    "rice_cracker",
    "fish_cake",
    "fortune_cookie",
    "moon_cake",
    "oden",
    "dango",
    "shaved_ice",
    "ice_cream",
    "icecream",
    "pie",
    "cupcake",
    "cake",
    "birthday",
    "custard",
    "lollipop",
    "candy",
    "chocolate_bar",
    "popcorn",
    "doughnut",
    "dumpling",
    "cookie",
    "chestnut",
    "peanuts",
    "honey_pot",
    "milk_glass",
    "baby_bottle",
    "coffee",
    "tea",
    "cup_with_straw",
    "sake",
    "beer",
    "beers",
    "clinking_glasses",
    "wine_glass",
    "tumbler_glass",
    "cocktail",
    "tropical_drink",
    "champagne",
    "spoon",
    "fork_and_knife",
    "plate_with_cutlery",
    "bowl_with_spoon",
    "takeout_box",
    "chopsticks",
    "salt",
    "soccer",
    "basketball",
    "football",
    "baseball",
    "softball",
    "tennis",
    "volleyball",
    "rugby_football",
    "flying_disc",
    "8ball",
    "golf",
    "golfing_woman",
    "golfing_man",
    "ping_pong",
    "badminton",
    "goal_net",
    "ice_hockey",
    "field_hockey",
    "lacrosse",
    "cricket",
    "ski",
    "skier",
    "snowboarder",
    "person_fencing",
    "women_wrestling",
    "men_wrestling",
    "woman_cartwheeling",
    "man_cartwheeling",
    "woman_playing_handball",
    "man_playing_handball",
    "ice_skate",
    "curling_stone",
    "skateboard",
    "sled",
    "bow_and_arrow",
    "fishing_pole_and_fish",
    "boxing_glove",
    "martial_arts_uniform",
    "rowing_woman",
    "rowing_man",
    "climbing_woman",
    "climbing_man",
    "swimming_woman",
    "swimming_man",
    "woman_playing_water_polo",
    "man_playing_water_polo",
    "woman_in_lotus_position",
    "man_in_lotus_position",
    "surfing_woman",
    "surfing_man",
    "basketball_woman",
    "basketball_man",
    "weight_lifting_woman",
    "weight_lifting_man",
    "biking_woman",
    "biking_man",
    "mountain_biking_woman",
    "mountain_biking_man",
    "horse_racing",
    "trophy",
    "running_shirt_with_sash",
    "medal_sports",
    "medal_military",
    "1st_place_medal",
    "2nd_place_medal",
    "3rd_place_medal",
    "reminder_ribbon",
    "rosette",
    "ticket",
    "tickets",
    "performing_arts",
    "art",
    "circus_tent",
    "woman_juggling",
    "man_juggling",
    "microphone",
    "headphones",
    "musical_score",
    "musical_keyboard",
    "drum",
    "saxophone",
    "trumpet",
    "guitar",
    "violin",
    "clapper",
    "video_game",
    "dart",
    "game_die",
    "chess_pawn",
    "slot_machine",
    "jigsaw",
    "bowling",
    "red_car",
    "taxi",
    "blue_car",
    "bus",
    "trolleybus",
    "racing_car",
    "police_car",
    "ambulance",
    "fire_engine",
    "minibus",
    "truck",
    "articulated_lorry",
    "tractor",
    "kick_scooter",
    "motorcycle",
    "bike",
    "motor_scooter",
    "rotating_light",
    "oncoming_police_car",
    "oncoming_bus",
    "oncoming_automobile",
    "oncoming_taxi",
    "aerial_tramway",
    "mountain_cableway",
    "suspension_railway",
    "railway_car",
    "train",
    "monorail",
    "bullettrain_side",
    "bullettrain_front",
    "light_rail",
    "mountain_railway",
    "steam_locomotive",
    "train2",
    "metro",
    "tram",
    "station",
    "flying_saucer",
    "helicopter",
    "small_airplane",
    "airplane",
    "flight_departure",
    "flight_arrival",
    "sailboat",
    "motor_boat",
    "speedboat",
    "ferry",
    "passenger_ship",
    "rocket",
    "artificial_satellite",
    "seat",
    "canoe",
    "anchor",
    "construction",
    "fuelpump",
    "busstop",
    "vertical_traffic_light",
    "traffic_light",
    "ship",
    "ferris_wheel",
    "roller_coaster",
    "carousel_horse",
    "building_construction",
    "foggy",
    "tokyo_tower",
    "factory",
    "fountain",
    "rice_scene",
    "mountain",
    "mountain_snow",
    "mount_fuji",
    "volcano",
    "japan",
    "camping",
    "tent",
    "national_park",
    "motorway",
    "railway_track",
    "sunrise",
    "sunrise_over_mountains",
    "desert",
    "beach_umbrella",
    "desert_island",
    "city_sunrise",
    "city_sunset",
    "cityscape",
    "night_with_stars",
    "bridge_at_night",
    "milky_way",
    "stars",
    "sparkler",
    "fireworks",
    "rainbow",
    "houses",
    "european_castle",
    "japanese_castle",
    "stadium",
    "statue_of_liberty",
    "house",
    "house_with_garden",
    "derelict_house",
    "office",
    "department_store",
    "post_office",
    "european_post_office",
    "hospital",
    "bank",
    "hotel",
    "convenience_store",
    "school",
    "love_hotel",
    "wedding",
    "classical_building",
    "church",
    "mosque",
    "synagogue",
    "kaaba",
    "shinto_shrine",
    "watch",
    "iphone",
    "calling",
    "computer",
    "keyboard",
    "desktop_computer",
    "printer",
    "computer_mouse",
    "trackball",
    "joystick",
    "clamp",
    "minidisc",
    "floppy_disk",
    "cd",
    "dvd",
    "vhs",
    "camera",
    "camera_flash",
    "video_camera",
    "movie_camera",
    "film_projector",
    "film_strip",
    "telephone_receiver",
    "phone",
    "pager",
    "fax",
    "tv",
    "radio",
    "studio_microphone",
    "level_slider",
    "control_knobs",
    "compass",
    "stopwatch",
    "timer_clock",
    "alarm_clock",
    "mantelpiece_clock",
    "hourglass_flowing_sand",
    "hourglass",
    "satellite",
    "battery",
    "electric_plug",
    "bulb",
    "flashlight",
    "candle",
    "fire_extinguisher",
    "wastebasket",
    "oil_drum",
    "money_with_wings",
    "dollar",
    "yen",
    "euro",
    "pound",
    "moneybag",
    "credit_card",
    "gem",
    "balance_scale",
    "toolbox",
    "wrench",
    "hammer",
    "hammer_and_pick",
    "hammer_and_wrench",
    "pick",
    "nut_and_bolt",
    "gear",
    "brick",
    "chains",
    "magnet",
    "gun",
    "bomb",
    "firecracker",
    "hocho",
    "dagger",
    "crossed_swords",
    "shield",
    "smoking",
    "coffin",
    "funeral_urn",
    "amphora",
    "crystal_ball",
    "prayer_beads",
    "nazar_amulet",
    "barber",
    "alembic",
    "telescope",
    "microscope",
    "hole",
    "pill",
    "syringe",
    "dna",
    "microbe",
    "petri_dish",
    "test_tube",
    "thermometer",
    "broom",
    "basket",
    "toilet_paper",
    "label",
    "bookmark",
    "toilet",
    "shower",
    "bathtub",
    "bath",
    "soap",
    "sponge",
    "lotion_bottle",
    "key",
    "old_key",
    "couch_and_lamp",
    "sleeping_bed",
    "bed",
    "door",
    "bellhop_bell",
    "teddy_bear",
    "framed_picture",
    "world_map",
    "parasol_on_ground",
    "moyai",
    "shopping",
    "shopping_cart",
    "balloon",
    "flags",
    "ribbon",
    "gift",
    "confetti_ball",
    "tada",
    "dolls",
    "wind_chime",
    "crossed_flags",
    "izakaya_lantern",
    "red_envelope",
    "email",
    "envelope_with_arrow",
    "incoming_envelope",
    "e-mail",
    "love_letter",
    "postbox",
    "mailbox_closed",
    "mailbox",
    "mailbox_with_mail",
    "mailbox_with_no_mail",
    "package",
    "postal_horn",
    "inbox_tray",
    "outbox_tray",
    "scroll",
    "page_with_curl",
    "bookmark_tabs",
    "receipt",
    "bar_chart",
    "chart_with_upwards_trend",
    "chart_with_downwards_trend",
    "page_facing_up",
    "date",
    "calendar",
    "spiral_calendar",
    "card_index",
    "card_file_box",
    "ballot_box",
    "file_cabinet",
    "clipboard",
    "spiral_notepad",
    "file_folder",
    "open_file_folder",
    "card_index_dividers",
    "newspaper_roll",
    "newspaper",
    "notebook",
    "closed_book",
    "green_book",
    "blue_book",
    "orange_book",
    "notebook_with_decorative_cover",
    "ledger",
    "books",
    "open_book",
    "safety_pin",
    "link",
    "paperclip",
    "paperclips",
    "scissors",
    "triangular_ruler",
    "straight_ruler",
    "abacus",
    "pushpin",
    "round_pushpin",
    "closed_lock_with_key",
    "lock",
    "unlock",
    "lock_with_ink_pen",
    "pen",
    "fountain_pen",
    "black_nib",
    "memo",
    "pencil2",
    "crayon",
    "paintbrush",
    "mag",
    "mag_right",
    "heart",
    "orange_heart",
    "yellow_heart",
    "green_heart",
    "blue_heart",
    "purple_heart",
    "black_heart",
    "broken_heart",
    "heavy_heart_exclamation",
    "two_hearts",
    "revolving_hearts",
    "heartbeat",
    "heartpulse",
    "sparkling_heart",
    "cupid",
    "gift_heart",
    "heart_decoration",
    "peace_symbol",
    "latin_cross",
    "star_and_crescent",
    "om",
    "wheel_of_dharma",
    "star_of_david",
    "six_pointed_star",
    "menorah",
    "yin_yang",
    "orthodox_cross",
    "place_of_worship",
    "ophiuchus",
    "aries",
    "taurus",
    "gemini",
    "cancer",
    "leo",
    "virgo",
    "libra",
    "scorpius",
    "sagittarius",
    "capricorn",
    "aquarius",
    "pisces",
    "id",
    "atom_symbol",
    "u7a7a",
    "u5272",
    "radioactive",
    "biohazard",
    "mobile_phone_off",
    "vibration_mode",
    "u6709",
    "u7121",
    "u7533",
    "u55b6",
    "u6708",
    "eight_pointed_black_star",
    "vs",
    "accept",
    "white_flower",
    "ideograph_advantage",
    "secret",
    "congratulations",
    "u5408",
    "u6e80",
    "u7981",
    "a",
    "b",
    "ab",
    "cl",
    "o2",
    "sos",
    "no_entry",
    "name_badge",
    "no_entry_sign",
    "x",
    "o",
    "stop_sign",
    "anger",
    "hotsprings",
    "no_pedestrians",
    "do_not_litter",
    "no_bicycles",
    "non-potable_water",
    "underage",
    "no_mobile_phones",
    "exclamation",
    "grey_exclamation",
    "question",
    "grey_question",
    "bangbang",
    "interrobang",
    "100",
    "low_brightness",
    "high_brightness",
    "trident",
    "fleur_de_lis",
    "part_alternation_mark",
    "warning",
    "children_crossing",
    "beginner",
    "recycle",
    "u6307",
    "chart",
    "sparkle",
    "eight_spoked_asterisk",
    "negative_squared_cross_mark",
    "white_check_mark",
    "diamond_shape_with_a_dot_inside",
    "cyclone",
    "loop",
    "globe_with_meridians",
    "m",
    "atm",
    "zzz",
    "sa",
    "passport_control",
    "customs",
    "baggage_claim",
    "left_luggage",
    "wheelchair",
    "no_smoking",
    "wc",
    "parking",
    "potable_water",
    "mens",
    "womens",
    "baby_symbol",
    "restroom",
    "put_litter_in_its_place",
    "cinema",
    "signal_strength",
    "koko",
    "ng",
    "ok",
    "up",
    "cool",
    "new",
    "free",
    "zero",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "keycap_ten",
    "asterisk",
    "1234",
    "eject_button",
    "arrow_forward",
    "pause_button",
    "next_track_button",
    "stop_button",
    "record_button",
    "play_or_pause_button",
    "previous_track_button",
    "fast_forward",
    "rewind",
    "twisted_rightwards_arrows",
    "repeat",
    "repeat_one",
    "arrow_backward",
    "arrow_up_small",
    "arrow_down_small",
    "arrow_double_up",
    "arrow_double_down",
    "arrow_right",
    "arrow_left",
    "arrow_up",
    "arrow_down",
    "arrow_upper_right",
    "arrow_lower_right",
    "arrow_lower_left",
    "arrow_upper_left",
    "arrow_up_down",
    "left_right_arrow",
    "arrows_counterclockwise",
    "arrow_right_hook",
    "leftwards_arrow_with_hook",
    "arrow_heading_up",
    "arrow_heading_down",
    "hash",
    "information_source",
    "abc",
    "abcd",
    "capital_abcd",
    "symbols",
    "musical_note",
    "notes",
    "wavy_dash",
    "curly_loop",
    "heavy_check_mark",
    "arrows_clockwise",
    "heavy_plus_sign",
    "heavy_minus_sign",
    "heavy_division_sign",
    "heavy_multiplication_x",
    "infinity",
    "heavy_dollar_sign",
    "currency_exchange",
    "copyright",
    "registered",
    "tm",
    "end",
    "back",
    "on",
    "top",
    "soon",
    "ballot_box_with_check",
    "radio_button",
    "white_circle",
    "black_circle",
    "red_circle",
    "large_blue_circle",
    "small_orange_diamond",
    "small_blue_diamond",
    "large_orange_diamond",
    "large_blue_diamond",
    "small_red_triangle",
    "black_small_square",
    "white_small_square",
    "black_large_square",
    "white_large_square",
    "small_red_triangle_down",
    "black_medium_square",
    "white_medium_square",
    "black_medium_small_square",
    "white_medium_small_square",
    "black_square_button",
    "white_square_button",
    "speaker",
    "sound",
    "loud_sound",
    "mute",
    "mega",
    "loudspeaker",
    "bell",
    "no_bell",
    "black_joker",
    "mahjong",
    "spades",
    "clubs",
    "hearts",
    "diamonds",
    "flower_playing_cards",
    "thought_balloon",
    "right_anger_bubble",
    "speech_balloon",
    "left_speech_bubble",
    "clock1",
    "clock2",
    "clock3",
    "clock4",
    "clock5",
    "clock6",
    "clock7",
    "clock8",
    "clock9",
    "clock10",
    "clock11",
    "clock12",
    "clock130",
    "clock230",
    "clock330",
    "clock430",
    "clock530",
    "clock630",
    "clock730",
    "clock830",
    "clock930",
    "clock1030",
    "clock1130",
    "clock1230",
    "white_flag",
    "black_flag",
    "pirate_flag",
    "checkered_flag",
    "triangular_flag_on_post",
    "rainbow_flag",
    "united_nations",
    "afghanistan",
    "aland_islands",
    "albania",
    "algeria",
    "american_samoa",
    "andorra",
    "angola",
    "anguilla",
    "antarctica",
    "antigua_barbuda",
    "argentina",
    "armenia",
    "aruba",
    "australia",
    "austria",
    "azerbaijan",
    "bahamas",
    "bahrain",
    "bangladesh",
    "barbados",
    "belarus",
    "belgium",
    "belize",
    "benin",
    "bermuda",
    "bhutan",
    "bolivia",
    "caribbean_netherlands",
    "bosnia_herzegovina",
    "botswana",
    "brazil",
    "british_indian_ocean_territory",
    "british_virgin_islands",
    "brunei",
    "bulgaria",
    "burkina_faso",
    "burundi",
    "cape_verde",
    "cambodia",
    "cameroon",
    "canada",
    "canary_islands",
    "cayman_islands",
    "central_african_republic",
    "chad",
    "chile",
    "cn",
    "christmas_island",
    "cocos_islands",
    "colombia",
    "comoros",
    "congo_brazzaville",
    "congo_kinshasa",
    "cook_islands",
    "costa_rica",
    "croatia",
    "cuba",
    "curacao",
    "cyprus",
    "czech_republic",
    "denmark",
    "djibouti",
    "dominica",
    "dominican_republic",
    "ecuador",
    "egypt",
    "el_salvador",
    "equatorial_guinea",
    "eritrea",
    "estonia",
    "ethiopia",
    "eu",
    "falkland_islands",
    "faroe_islands",
    "fiji",
    "finland",
    "fr",
    "french_guiana",
    "french_polynesia",
    "french_southern_territories",
    "gabon",
    "gambia",
    "georgia",
    "de",
    "ghana",
    "gibraltar",
    "greece",
    "greenland",
    "grenada",
    "guadeloupe",
    "guam",
    "guatemala",
    "guernsey",
    "guinea",
    "guinea_bissau",
    "guyana",
    "haiti",
    "honduras",
    "hong_kong",
    "hungary",
    "iceland",
    "india",
    "indonesia",
    "iran",
    "iraq",
    "ireland",
    "isle_of_man",
    "israel",
    "it",
    "cote_divoire",
    "jamaica",
    "jp",
    "jersey",
    "jordan",
    "kazakhstan",
    "kenya",
    "kiribati",
    "kosovo",
    "kuwait",
    "kyrgyzstan",
    "laos",
    "latvia",
    "lebanon",
    "lesotho",
    "liberia",
    "libya",
    "liechtenstein",
    "lithuania",
    "luxembourg",
    "macau",
    "macedonia",
    "madagascar",
    "malawi",
    "malaysia",
    "maldives",
    "mali",
    "malta",
    "marshall_islands",
    "martinique",
    "mauritania",
    "mauritius",
    "mayotte",
    "mexico",
    "micronesia",
    "moldova",
    "monaco",
    "mongolia",
    "montenegro",
    "montserrat",
    "morocco",
    "mozambique",
    "myanmar",
    "namibia",
    "nauru",
    "nepal",
    "netherlands",
    "new_caledonia",
    "new_zealand",
    "nicaragua",
    "niger",
    "nigeria",
    "niue",
    "norfolk_island",
    "northern_mariana_islands",
    "north_korea",
    "norway",
    "oman",
    "pakistan",
    "palau",
    "palestinian_territories",
    "panama",
    "papua_new_guinea",
    "paraguay",
    "peru",
    "philippines",
    "pitcairn_islands",
    "poland",
    "portugal",
    "puerto_rico",
    "qatar",
    "reunion",
    "romania",
    "ru",
    "rwanda",
    "st_barthelemy",
    "st_helena",
    "st_kitts_nevis",
    "st_lucia",
    "st_pierre_miquelon",
    "st_vincent_grenadines",
    "samoa",
    "san_marino",
    "sao_tome_principe",
    "saudi_arabia",
    "senegal",
    "serbia",
    "seychelles",
    "sierra_leone",
    "singapore",
    "sint_maarten",
    "slovakia",
    "slovenia",
    "solomon_islands",
    "somalia",
    "south_africa",
    "south_georgia_south_sandwich_islands",
    "kr",
    "south_sudan",
    "es",
    "sri_lanka",
    "sudan",
    "suriname",
    "swaziland",
    "sweden",
    "switzerland",
    "syria",
    "taiwan",
    "tajikistan",
    "tanzania",
    "thailand",
    "timor_leste",
    "togo",
    "tokelau",
    "tonga",
    "trinidad_tobago",
    "tunisia",
    "tr",
    "turkmenistan",
    "turks_caicos_islands",
    "tuvalu",
    "uganda",
    "ukraine",
    "united_arab_emirates",
    "uk",
    "england",
    "scotland",
    "wales",
    "us",
    "us_virgin_islands",
    "uruguay",
    "uzbekistan",
    "vanuatu",
    "vatican_city",
    "venezuela",
    "vietnam",
    "wallis_futuna",
    "western_sahara",
    "yemen",
    "zambia",
    "zimbabwe"
  ];
});

// node_modules/emojilib/index.js
var require_emojilib = __commonJS((exports, module) => {
  module.exports = {
    lib: require_emojis(),
    ordered: require_ordered(),
    fitzpatrick_scale_modifiers: ["\uD83C\uDFFB", "\uD83C\uDFFC", "\uD83C\uDFFD", "\uD83C\uDFFE", "\uD83C\uDFFF"]
  };
});

// node_modules/char-regex/index.js
var require_char_regex = __commonJS((exports, module) => {
  module.exports = () => {
    const astralRange = "\\ud800-\\udfff";
    const comboMarksRange = "\\u0300-\\u036f";
    const comboHalfMarksRange = "\\ufe20-\\ufe2f";
    const comboSymbolsRange = "\\u20d0-\\u20ff";
    const comboMarksExtendedRange = "\\u1ab0-\\u1aff";
    const comboMarksSupplementRange = "\\u1dc0-\\u1dff";
    const comboRange = comboMarksRange + comboHalfMarksRange + comboSymbolsRange + comboMarksExtendedRange + comboMarksSupplementRange;
    const varRange = "\\ufe0e\\ufe0f";
    const familyRange = "\\uD83D\\uDC69\\uD83C\\uDFFB\\u200D\\uD83C\\uDF93";
    const astral = `[${astralRange}]`;
    const combo = `[${comboRange}]`;
    const fitz = "\\ud83c[\\udffb-\\udfff]";
    const modifier = `(?:${combo}|${fitz})`;
    const nonAstral = `[^${astralRange}]`;
    const regional = "(?:\\uD83C[\\uDDE6-\\uDDFF]){2}";
    const surrogatePair = "[\\ud800-\\udbff][\\udc00-\\udfff]";
    const zwj = "\\u200d";
    const blackFlag = "(?:\\ud83c\\udff4\\udb40\\udc67\\udb40\\udc62\\udb40(?:\\udc65|\\udc73|\\udc77)\\udb40(?:\\udc6e|\\udc63|\\udc6c)\\udb40(?:\\udc67|\\udc74|\\udc73)\\udb40\\udc7f)";
    const family = `[${familyRange}]`;
    const optModifier = `${modifier}?`;
    const optVar = `[${varRange}]?`;
    const optJoin = `(?:${zwj}(?:${[nonAstral, regional, surrogatePair].join("|")})${optVar + optModifier})*`;
    const seq = optVar + optModifier + optJoin;
    const nonAstralCombo = `${nonAstral}${combo}?`;
    const symbol = `(?:${[nonAstralCombo, combo, regional, surrogatePair, astral, family].join("|")})`;
    return new RegExp(`${blackFlag}|${fitz}(?=${fitz})|${symbol + seq}`, "g");
  };
});

// node_modules/unicode-emoji-modifier-base/index.js
var require_unicode_emoji_modifier_base = __commonJS((exports, module) => {
  module.exports = new Set([
    9757,
    9977,
    9994,
    9995,
    9996,
    9997,
    127877,
    127939,
    127940,
    127946,
    127947,
    128066,
    128067,
    128070,
    128071,
    128072,
    128073,
    128074,
    128075,
    128076,
    128077,
    128078,
    128079,
    128080,
    128102,
    128103,
    128104,
    128105,
    128110,
    128112,
    128113,
    128114,
    128115,
    128116,
    128117,
    128118,
    128119,
    128120,
    128124,
    128129,
    128130,
    128131,
    128133,
    128134,
    128135,
    128170,
    128373,
    128378,
    128400,
    128405,
    128406,
    128581,
    128582,
    128583,
    128587,
    128588,
    128589,
    128590,
    128591,
    128675,
    128692,
    128693,
    128694,
    128704,
    129304,
    129305,
    129306,
    129307,
    129308,
    129309,
    129310,
    129318,
    129328,
    129331,
    129332,
    129333,
    129334,
    129335,
    129336,
    129337,
    129340,
    129341,
    129342
  ]);
});

// node_modules/skin-tone/index.js
var require_skin_tone = __commonJS((exports, module) => {
  var emojiModifierBase = require_unicode_emoji_modifier_base();
  var skinTones = new Map([
    ["none", ""],
    ["white", "\uD83C\uDFFB"],
    ["creamWhite", "\uD83C\uDFFC"],
    ["lightBrown", "\uD83C\uDFFD"],
    ["brown", "\uD83C\uDFFE"],
    ["darkBrown", "\uD83C\uDFFF"]
  ]);
  module.exports = (emoji, tone) => {
    if (!skinTones.has(tone)) {
      throw new TypeError(`Unexpected \`skinTone\` name: ${tone}`);
    }
    emoji = emoji.replace(/[\u{1f3fb}-\u{1f3ff}]/u, "");
    if (emojiModifierBase.has(emoji.codePointAt(0)) && tone !== "none") {
      emoji += skinTones.get(tone);
    }
    return emoji;
  };
});

// node_modules/supports-hyperlinks/browser.js
var require_browser = __commonJS((exports, module) => {
  module.exports = {
    stdin: false,
    stderr: false,
    supportsHyperlink: function() {
      return false;
    }
  };
});

// src/index.ts
var import_node_cmd = __toESM(require_cmd(), 1);
import readline from "readline";

// node_modules/marked/lib/marked.esm.js
var _getDefaults = function() {
  return {
    async: false,
    breaks: false,
    extensions: null,
    gfm: true,
    hooks: null,
    pedantic: false,
    renderer: null,
    silent: false,
    tokenizer: null,
    walkTokens: null
  };
};
var changeDefaults = function(newDefaults) {
  _defaults = newDefaults;
};
var escape = function(html, encode) {
  if (encode) {
    if (escapeTest.test(html)) {
      return html.replace(escapeReplace, getEscapeReplacement);
    }
  } else {
    if (escapeTestNoEncode.test(html)) {
      return html.replace(escapeReplaceNoEncode, getEscapeReplacement);
    }
  }
  return html;
};
var unescape2 = function(html) {
  return html.replace(unescapeTest, (_, n) => {
    n = n.toLowerCase();
    if (n === "colon")
      return ":";
    if (n.charAt(0) === "#") {
      return n.charAt(1) === "x" ? String.fromCharCode(parseInt(n.substring(2), 16)) : String.fromCharCode(+n.substring(1));
    }
    return "";
  });
};
var edit = function(regex, opt) {
  regex = typeof regex === "string" ? regex : regex.source;
  opt = opt || "";
  const obj = {
    replace: (name, val) => {
      val = typeof val === "object" && ("source" in val) ? val.source : val;
      val = val.replace(caret, "$1");
      regex = regex.replace(name, val);
      return obj;
    },
    getRegex: () => {
      return new RegExp(regex, opt);
    }
  };
  return obj;
};
var cleanUrl = function(href) {
  try {
    href = encodeURI(href).replace(/%25/g, "%");
  } catch (e) {
    return null;
  }
  return href;
};
var splitCells = function(tableRow, count) {
  const row = tableRow.replace(/\|/g, (match, offset, str) => {
    let escaped = false;
    let curr = offset;
    while (--curr >= 0 && str[curr] === "\\")
      escaped = !escaped;
    if (escaped) {
      return "|";
    } else {
      return " |";
    }
  }), cells = row.split(/ \|/);
  let i = 0;
  if (!cells[0].trim()) {
    cells.shift();
  }
  if (cells.length > 0 && !cells[cells.length - 1].trim()) {
    cells.pop();
  }
  if (count) {
    if (cells.length > count) {
      cells.splice(count);
    } else {
      while (cells.length < count)
        cells.push("");
    }
  }
  for (;i < cells.length; i++) {
    cells[i] = cells[i].trim().replace(/\\\|/g, "|");
  }
  return cells;
};
var rtrim = function(str, c, invert) {
  const l = str.length;
  if (l === 0) {
    return "";
  }
  let suffLen = 0;
  while (suffLen < l) {
    const currChar = str.charAt(l - suffLen - 1);
    if (currChar === c && !invert) {
      suffLen++;
    } else if (currChar !== c && invert) {
      suffLen++;
    } else {
      break;
    }
  }
  return str.slice(0, l - suffLen);
};
var findClosingBracket = function(str, b) {
  if (str.indexOf(b[1]) === -1) {
    return -1;
  }
  let level = 0;
  for (let i = 0;i < str.length; i++) {
    if (str[i] === "\\") {
      i++;
    } else if (str[i] === b[0]) {
      level++;
    } else if (str[i] === b[1]) {
      level--;
      if (level < 0) {
        return i;
      }
    }
  }
  return -1;
};
var outputLink = function(cap, link, raw, lexer) {
  const href = link.href;
  const title = link.title ? escape(link.title) : null;
  const text = cap[1].replace(/\\([\[\]])/g, "$1");
  if (cap[0].charAt(0) !== "!") {
    lexer.state.inLink = true;
    const token = {
      type: "link",
      raw,
      href,
      title,
      text,
      tokens: lexer.inlineTokens(text)
    };
    lexer.state.inLink = false;
    return token;
  }
  return {
    type: "image",
    raw,
    href,
    title,
    text: escape(text)
  };
};
var indentCodeCompensation = function(raw, text) {
  const matchIndentToCode = raw.match(/^(\s+)(?:```)/);
  if (matchIndentToCode === null) {
    return text;
  }
  const indentToCode = matchIndentToCode[1];
  return text.split("\n").map((node) => {
    const matchIndentInNode = node.match(/^\s+/);
    if (matchIndentInNode === null) {
      return node;
    }
    const [indentInNode] = matchIndentInNode;
    if (indentInNode.length >= indentToCode.length) {
      return node.slice(indentToCode.length);
    }
    return node;
  }).join("\n");
};
var marked = function(src, opt) {
  return markedInstance.parse(src, opt);
};
var _defaults = _getDefaults();
var escapeTest = /[&<>"']/;
var escapeReplace = new RegExp(escapeTest.source, "g");
var escapeTestNoEncode = /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/;
var escapeReplaceNoEncode = new RegExp(escapeTestNoEncode.source, "g");
var escapeReplacements = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
};
var getEscapeReplacement = (ch) => escapeReplacements[ch];
var unescapeTest = /&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig;
var caret = /(^|[^\[])\^/g;
var noopTest = { exec: () => null };

class _Tokenizer {
  options;
  rules;
  lexer;
  constructor(options) {
    this.options = options || _defaults;
  }
  space(src) {
    const cap = this.rules.block.newline.exec(src);
    if (cap && cap[0].length > 0) {
      return {
        type: "space",
        raw: cap[0]
      };
    }
  }
  code(src) {
    const cap = this.rules.block.code.exec(src);
    if (cap) {
      const text = cap[0].replace(/^ {1,4}/gm, "");
      return {
        type: "code",
        raw: cap[0],
        codeBlockStyle: "indented",
        text: !this.options.pedantic ? rtrim(text, "\n") : text
      };
    }
  }
  fences(src) {
    const cap = this.rules.block.fences.exec(src);
    if (cap) {
      const raw = cap[0];
      const text = indentCodeCompensation(raw, cap[3] || "");
      return {
        type: "code",
        raw,
        lang: cap[2] ? cap[2].trim().replace(this.rules.inline._escapes, "$1") : cap[2],
        text
      };
    }
  }
  heading(src) {
    const cap = this.rules.block.heading.exec(src);
    if (cap) {
      let text = cap[2].trim();
      if (/#$/.test(text)) {
        const trimmed = rtrim(text, "#");
        if (this.options.pedantic) {
          text = trimmed.trim();
        } else if (!trimmed || / $/.test(trimmed)) {
          text = trimmed.trim();
        }
      }
      return {
        type: "heading",
        raw: cap[0],
        depth: cap[1].length,
        text,
        tokens: this.lexer.inline(text)
      };
    }
  }
  hr(src) {
    const cap = this.rules.block.hr.exec(src);
    if (cap) {
      return {
        type: "hr",
        raw: cap[0]
      };
    }
  }
  blockquote(src) {
    const cap = this.rules.block.blockquote.exec(src);
    if (cap) {
      const text = rtrim(cap[0].replace(/^ *>[ \t]?/gm, ""), "\n");
      const top = this.lexer.state.top;
      this.lexer.state.top = true;
      const tokens = this.lexer.blockTokens(text);
      this.lexer.state.top = top;
      return {
        type: "blockquote",
        raw: cap[0],
        tokens,
        text
      };
    }
  }
  list(src) {
    let cap = this.rules.block.list.exec(src);
    if (cap) {
      let bull = cap[1].trim();
      const isordered = bull.length > 1;
      const list = {
        type: "list",
        raw: "",
        ordered: isordered,
        start: isordered ? +bull.slice(0, -1) : "",
        loose: false,
        items: []
      };
      bull = isordered ? `\\d{1,9}\\${bull.slice(-1)}` : `\\${bull}`;
      if (this.options.pedantic) {
        bull = isordered ? bull : "[*+-]";
      }
      const itemRegex = new RegExp(`^( {0,3}${bull})((?:[\t ][^\\n]*)?(?:\\n|\$))`);
      let raw = "";
      let itemContents = "";
      let endsWithBlankLine = false;
      while (src) {
        let endEarly = false;
        if (!(cap = itemRegex.exec(src))) {
          break;
        }
        if (this.rules.block.hr.test(src)) {
          break;
        }
        raw = cap[0];
        src = src.substring(raw.length);
        let line = cap[2].split("\n", 1)[0].replace(/^\t+/, (t) => " ".repeat(3 * t.length));
        let nextLine = src.split("\n", 1)[0];
        let indent = 0;
        if (this.options.pedantic) {
          indent = 2;
          itemContents = line.trimStart();
        } else {
          indent = cap[2].search(/[^ ]/);
          indent = indent > 4 ? 1 : indent;
          itemContents = line.slice(indent);
          indent += cap[1].length;
        }
        let blankLine = false;
        if (!line && /^ *$/.test(nextLine)) {
          raw += nextLine + "\n";
          src = src.substring(nextLine.length + 1);
          endEarly = true;
        }
        if (!endEarly) {
          const nextBulletRegex = new RegExp(`^ {0,${Math.min(3, indent - 1)}}(?:[*+-]|\\d{1,9}[.)])((?:[ \t][^\\n]*)?(?:\\n|\$))`);
          const hrRegex = new RegExp(`^ {0,${Math.min(3, indent - 1)}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|\$)`);
          const fencesBeginRegex = new RegExp(`^ {0,${Math.min(3, indent - 1)}}(?:\`\`\`|~~~)`);
          const headingBeginRegex = new RegExp(`^ {0,${Math.min(3, indent - 1)}}#`);
          while (src) {
            const rawLine = src.split("\n", 1)[0];
            nextLine = rawLine;
            if (this.options.pedantic) {
              nextLine = nextLine.replace(/^ {1,4}(?=( {4})*[^ ])/g, "  ");
            }
            if (fencesBeginRegex.test(nextLine)) {
              break;
            }
            if (headingBeginRegex.test(nextLine)) {
              break;
            }
            if (nextBulletRegex.test(nextLine)) {
              break;
            }
            if (hrRegex.test(src)) {
              break;
            }
            if (nextLine.search(/[^ ]/) >= indent || !nextLine.trim()) {
              itemContents += "\n" + nextLine.slice(indent);
            } else {
              if (blankLine) {
                break;
              }
              if (line.search(/[^ ]/) >= 4) {
                break;
              }
              if (fencesBeginRegex.test(line)) {
                break;
              }
              if (headingBeginRegex.test(line)) {
                break;
              }
              if (hrRegex.test(line)) {
                break;
              }
              itemContents += "\n" + nextLine;
            }
            if (!blankLine && !nextLine.trim()) {
              blankLine = true;
            }
            raw += rawLine + "\n";
            src = src.substring(rawLine.length + 1);
            line = nextLine.slice(indent);
          }
        }
        if (!list.loose) {
          if (endsWithBlankLine) {
            list.loose = true;
          } else if (/\n *\n *$/.test(raw)) {
            endsWithBlankLine = true;
          }
        }
        let istask = null;
        let ischecked;
        if (this.options.gfm) {
          istask = /^\[[ xX]\] /.exec(itemContents);
          if (istask) {
            ischecked = istask[0] !== "[ ] ";
            itemContents = itemContents.replace(/^\[[ xX]\] +/, "");
          }
        }
        list.items.push({
          type: "list_item",
          raw,
          task: !!istask,
          checked: ischecked,
          loose: false,
          text: itemContents,
          tokens: []
        });
        list.raw += raw;
      }
      list.items[list.items.length - 1].raw = raw.trimEnd();
      list.items[list.items.length - 1].text = itemContents.trimEnd();
      list.raw = list.raw.trimEnd();
      for (let i = 0;i < list.items.length; i++) {
        this.lexer.state.top = false;
        list.items[i].tokens = this.lexer.blockTokens(list.items[i].text, []);
        if (!list.loose) {
          const spacers = list.items[i].tokens.filter((t) => t.type === "space");
          const hasMultipleLineBreaks = spacers.length > 0 && spacers.some((t) => /\n.*\n/.test(t.raw));
          list.loose = hasMultipleLineBreaks;
        }
      }
      if (list.loose) {
        for (let i = 0;i < list.items.length; i++) {
          list.items[i].loose = true;
        }
      }
      return list;
    }
  }
  html(src) {
    const cap = this.rules.block.html.exec(src);
    if (cap) {
      const token = {
        type: "html",
        block: true,
        raw: cap[0],
        pre: cap[1] === "pre" || cap[1] === "script" || cap[1] === "style",
        text: cap[0]
      };
      return token;
    }
  }
  def(src) {
    const cap = this.rules.block.def.exec(src);
    if (cap) {
      const tag = cap[1].toLowerCase().replace(/\s+/g, " ");
      const href = cap[2] ? cap[2].replace(/^<(.*)>$/, "$1").replace(this.rules.inline._escapes, "$1") : "";
      const title = cap[3] ? cap[3].substring(1, cap[3].length - 1).replace(this.rules.inline._escapes, "$1") : cap[3];
      return {
        type: "def",
        tag,
        raw: cap[0],
        href,
        title
      };
    }
  }
  table(src) {
    const cap = this.rules.block.table.exec(src);
    if (cap) {
      if (!/[:|]/.test(cap[2])) {
        return;
      }
      const item = {
        type: "table",
        raw: cap[0],
        header: splitCells(cap[1]).map((c) => {
          return { text: c, tokens: [] };
        }),
        align: cap[2].replace(/^\||\| *$/g, "").split("|"),
        rows: cap[3] && cap[3].trim() ? cap[3].replace(/\n[ \t]*$/, "").split("\n") : []
      };
      if (item.header.length === item.align.length) {
        let l = item.align.length;
        let i, j, k, row;
        for (i = 0;i < l; i++) {
          const align = item.align[i];
          if (align) {
            if (/^ *-+: *$/.test(align)) {
              item.align[i] = "right";
            } else if (/^ *:-+: *$/.test(align)) {
              item.align[i] = "center";
            } else if (/^ *:-+ *$/.test(align)) {
              item.align[i] = "left";
            } else {
              item.align[i] = null;
            }
          }
        }
        l = item.rows.length;
        for (i = 0;i < l; i++) {
          item.rows[i] = splitCells(item.rows[i], item.header.length).map((c) => {
            return { text: c, tokens: [] };
          });
        }
        l = item.header.length;
        for (j = 0;j < l; j++) {
          item.header[j].tokens = this.lexer.inline(item.header[j].text);
        }
        l = item.rows.length;
        for (j = 0;j < l; j++) {
          row = item.rows[j];
          for (k = 0;k < row.length; k++) {
            row[k].tokens = this.lexer.inline(row[k].text);
          }
        }
        return item;
      }
    }
  }
  lheading(src) {
    const cap = this.rules.block.lheading.exec(src);
    if (cap) {
      return {
        type: "heading",
        raw: cap[0],
        depth: cap[2].charAt(0) === "=" ? 1 : 2,
        text: cap[1],
        tokens: this.lexer.inline(cap[1])
      };
    }
  }
  paragraph(src) {
    const cap = this.rules.block.paragraph.exec(src);
    if (cap) {
      const text = cap[1].charAt(cap[1].length - 1) === "\n" ? cap[1].slice(0, -1) : cap[1];
      return {
        type: "paragraph",
        raw: cap[0],
        text,
        tokens: this.lexer.inline(text)
      };
    }
  }
  text(src) {
    const cap = this.rules.block.text.exec(src);
    if (cap) {
      return {
        type: "text",
        raw: cap[0],
        text: cap[0],
        tokens: this.lexer.inline(cap[0])
      };
    }
  }
  escape(src) {
    const cap = this.rules.inline.escape.exec(src);
    if (cap) {
      return {
        type: "escape",
        raw: cap[0],
        text: escape(cap[1])
      };
    }
  }
  tag(src) {
    const cap = this.rules.inline.tag.exec(src);
    if (cap) {
      if (!this.lexer.state.inLink && /^<a /i.test(cap[0])) {
        this.lexer.state.inLink = true;
      } else if (this.lexer.state.inLink && /^<\/a>/i.test(cap[0])) {
        this.lexer.state.inLink = false;
      }
      if (!this.lexer.state.inRawBlock && /^<(pre|code|kbd|script)(\s|>)/i.test(cap[0])) {
        this.lexer.state.inRawBlock = true;
      } else if (this.lexer.state.inRawBlock && /^<\/(pre|code|kbd|script)(\s|>)/i.test(cap[0])) {
        this.lexer.state.inRawBlock = false;
      }
      return {
        type: "html",
        raw: cap[0],
        inLink: this.lexer.state.inLink,
        inRawBlock: this.lexer.state.inRawBlock,
        block: false,
        text: cap[0]
      };
    }
  }
  link(src) {
    const cap = this.rules.inline.link.exec(src);
    if (cap) {
      const trimmedUrl = cap[2].trim();
      if (!this.options.pedantic && /^</.test(trimmedUrl)) {
        if (!/>$/.test(trimmedUrl)) {
          return;
        }
        const rtrimSlash = rtrim(trimmedUrl.slice(0, -1), "\\");
        if ((trimmedUrl.length - rtrimSlash.length) % 2 === 0) {
          return;
        }
      } else {
        const lastParenIndex = findClosingBracket(cap[2], "()");
        if (lastParenIndex > -1) {
          const start = cap[0].indexOf("!") === 0 ? 5 : 4;
          const linkLen = start + cap[1].length + lastParenIndex;
          cap[2] = cap[2].substring(0, lastParenIndex);
          cap[0] = cap[0].substring(0, linkLen).trim();
          cap[3] = "";
        }
      }
      let href = cap[2];
      let title = "";
      if (this.options.pedantic) {
        const link = /^([^'"]*[^\s])\s+(['"])(.*)\2/.exec(href);
        if (link) {
          href = link[1];
          title = link[3];
        }
      } else {
        title = cap[3] ? cap[3].slice(1, -1) : "";
      }
      href = href.trim();
      if (/^</.test(href)) {
        if (this.options.pedantic && !/>$/.test(trimmedUrl)) {
          href = href.slice(1);
        } else {
          href = href.slice(1, -1);
        }
      }
      return outputLink(cap, {
        href: href ? href.replace(this.rules.inline._escapes, "$1") : href,
        title: title ? title.replace(this.rules.inline._escapes, "$1") : title
      }, cap[0], this.lexer);
    }
  }
  reflink(src, links) {
    let cap;
    if ((cap = this.rules.inline.reflink.exec(src)) || (cap = this.rules.inline.nolink.exec(src))) {
      let link = (cap[2] || cap[1]).replace(/\s+/g, " ");
      link = links[link.toLowerCase()];
      if (!link) {
        const text = cap[0].charAt(0);
        return {
          type: "text",
          raw: text,
          text
        };
      }
      return outputLink(cap, link, cap[0], this.lexer);
    }
  }
  emStrong(src, maskedSrc, prevChar = "") {
    let match = this.rules.inline.emStrong.lDelim.exec(src);
    if (!match)
      return;
    if (match[3] && prevChar.match(/[\p{L}\p{N}]/u))
      return;
    const nextChar = match[1] || match[2] || "";
    if (!nextChar || !prevChar || this.rules.inline.punctuation.exec(prevChar)) {
      const lLength = [...match[0]].length - 1;
      let rDelim, rLength, delimTotal = lLength, midDelimTotal = 0;
      const endReg = match[0][0] === "*" ? this.rules.inline.emStrong.rDelimAst : this.rules.inline.emStrong.rDelimUnd;
      endReg.lastIndex = 0;
      maskedSrc = maskedSrc.slice(-1 * src.length + match[0].length - 1);
      while ((match = endReg.exec(maskedSrc)) != null) {
        rDelim = match[1] || match[2] || match[3] || match[4] || match[5] || match[6];
        if (!rDelim)
          continue;
        rLength = [...rDelim].length;
        if (match[3] || match[4]) {
          delimTotal += rLength;
          continue;
        } else if (match[5] || match[6]) {
          if (lLength % 3 && !((lLength + rLength) % 3)) {
            midDelimTotal += rLength;
            continue;
          }
        }
        delimTotal -= rLength;
        if (delimTotal > 0)
          continue;
        rLength = Math.min(rLength, rLength + delimTotal + midDelimTotal);
        const raw = [...src].slice(0, lLength + match.index + rLength + 1).join("");
        if (Math.min(lLength, rLength) % 2) {
          const text2 = raw.slice(1, -1);
          return {
            type: "em",
            raw,
            text: text2,
            tokens: this.lexer.inlineTokens(text2)
          };
        }
        const text = raw.slice(2, -2);
        return {
          type: "strong",
          raw,
          text,
          tokens: this.lexer.inlineTokens(text)
        };
      }
    }
  }
  codespan(src) {
    const cap = this.rules.inline.code.exec(src);
    if (cap) {
      let text = cap[2].replace(/\n/g, " ");
      const hasNonSpaceChars = /[^ ]/.test(text);
      const hasSpaceCharsOnBothEnds = /^ /.test(text) && / $/.test(text);
      if (hasNonSpaceChars && hasSpaceCharsOnBothEnds) {
        text = text.substring(1, text.length - 1);
      }
      text = escape(text, true);
      return {
        type: "codespan",
        raw: cap[0],
        text
      };
    }
  }
  br(src) {
    const cap = this.rules.inline.br.exec(src);
    if (cap) {
      return {
        type: "br",
        raw: cap[0]
      };
    }
  }
  del(src) {
    const cap = this.rules.inline.del.exec(src);
    if (cap) {
      return {
        type: "del",
        raw: cap[0],
        text: cap[2],
        tokens: this.lexer.inlineTokens(cap[2])
      };
    }
  }
  autolink(src) {
    const cap = this.rules.inline.autolink.exec(src);
    if (cap) {
      let text, href;
      if (cap[2] === "@") {
        text = escape(cap[1]);
        href = "mailto:" + text;
      } else {
        text = escape(cap[1]);
        href = text;
      }
      return {
        type: "link",
        raw: cap[0],
        text,
        href,
        tokens: [
          {
            type: "text",
            raw: text,
            text
          }
        ]
      };
    }
  }
  url(src) {
    let cap;
    if (cap = this.rules.inline.url.exec(src)) {
      let text, href;
      if (cap[2] === "@") {
        text = escape(cap[0]);
        href = "mailto:" + text;
      } else {
        let prevCapZero;
        do {
          prevCapZero = cap[0];
          cap[0] = this.rules.inline._backpedal.exec(cap[0])[0];
        } while (prevCapZero !== cap[0]);
        text = escape(cap[0]);
        if (cap[1] === "www.") {
          href = "http://" + cap[0];
        } else {
          href = cap[0];
        }
      }
      return {
        type: "link",
        raw: cap[0],
        text,
        href,
        tokens: [
          {
            type: "text",
            raw: text,
            text
          }
        ]
      };
    }
  }
  inlineText(src) {
    const cap = this.rules.inline.text.exec(src);
    if (cap) {
      let text;
      if (this.lexer.state.inRawBlock) {
        text = cap[0];
      } else {
        text = escape(cap[0]);
      }
      return {
        type: "text",
        raw: cap[0],
        text
      };
    }
  }
}
var block = {
  newline: /^(?: *(?:\n|$))+/,
  code: /^( {4}[^\n]+(?:\n(?: *(?:\n|$))*)?)+/,
  fences: /^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/,
  hr: /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/,
  heading: /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/,
  blockquote: /^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/,
  list: /^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/,
  html: "^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n *)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n *)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n *)+\\n|$))",
  def: /^ {0,3}\[(label)\]: *(?:\n *)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n *)?| *\n *)(title))? *(?:\n+|$)/,
  table: noopTest,
  lheading: /^(?!bull )((?:.|\n(?!\s*?\n|bull ))+?)\n {0,3}(=+|-+) *(?:\n+|$)/,
  _paragraph: /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/,
  text: /^[^\n]+/
};
block._label = /(?!\s*\])(?:\\.|[^\[\]\\])+/;
block._title = /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/;
block.def = edit(block.def).replace("label", block._label).replace("title", block._title).getRegex();
block.bullet = /(?:[*+-]|\d{1,9}[.)])/;
block.listItemStart = edit(/^( *)(bull) */).replace("bull", block.bullet).getRegex();
block.list = edit(block.list).replace(/bull/g, block.bullet).replace("hr", "\\n+(?=\\1?(?:(?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$))").replace("def", "\\n+(?=" + block.def.source + ")").getRegex();
block._tag = "address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|section|source|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul";
block._comment = /<!--(?!-?>)[\s\S]*?(?:-->|$)/;
block.html = edit(block.html, "i").replace("comment", block._comment).replace("tag", block._tag).replace("attribute", / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex();
block.lheading = edit(block.lheading).replace(/bull/g, block.bullet).getRegex();
block.paragraph = edit(block._paragraph).replace("hr", block.hr).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("|table", "").replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", block._tag).getRegex();
block.blockquote = edit(block.blockquote).replace("paragraph", block.paragraph).getRegex();
block.normal = { ...block };
block.gfm = {
  ...block.normal,
  table: "^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)"
};
block.gfm.table = edit(block.gfm.table).replace("hr", block.hr).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("blockquote", " {0,3}>").replace("code", " {4}[^\\n]").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", block._tag).getRegex();
block.gfm.paragraph = edit(block._paragraph).replace("hr", block.hr).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("table", block.gfm.table).replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", block._tag).getRegex();
block.pedantic = {
  ...block.normal,
  html: edit('^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|\'[^\']*\'|\\s[^\'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))').replace("comment", block._comment).replace(/tag/g, "(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),
  def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,
  heading: /^(#{1,6})(.*)(?:\n+|$)/,
  fences: noopTest,
  lheading: /^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,
  paragraph: edit(block.normal._paragraph).replace("hr", block.hr).replace("heading", " *#{1,6} *[^\n]").replace("lheading", block.lheading).replace("blockquote", " {0,3}>").replace("|fences", "").replace("|list", "").replace("|html", "").getRegex()
};
var inline = {
  escape: /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,
  autolink: /^<(scheme:[^\s\x00-\x1f<>]*|email)>/,
  url: noopTest,
  tag: "^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>",
  link: /^!?\[(label)\]\(\s*(href)(?:\s+(title))?\s*\)/,
  reflink: /^!?\[(label)\]\[(ref)\]/,
  nolink: /^!?\[(ref)\](?:\[\])?/,
  reflinkSearch: "reflink|nolink(?!\\()",
  emStrong: {
    lDelim: /^(?:\*+(?:((?!\*)[punct])|[^\s*]))|^_+(?:((?!_)[punct])|([^\s_]))/,
    rDelimAst: /^[^_*]*?__[^_*]*?\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\*)[punct](\*+)(?=[\s]|$)|[^punct\s](\*+)(?!\*)(?=[punct\s]|$)|(?!\*)[punct\s](\*+)(?=[^punct\s])|[\s](\*+)(?!\*)(?=[punct])|(?!\*)[punct](\*+)(?!\*)(?=[punct])|[^punct\s](\*+)(?=[^punct\s])/,
    rDelimUnd: /^[^_*]*?\*\*[^_*]*?_[^_*]*?(?=\*\*)|[^_]+(?=[^_])|(?!_)[punct](_+)(?=[\s]|$)|[^punct\s](_+)(?!_)(?=[punct\s]|$)|(?!_)[punct\s](_+)(?=[^punct\s])|[\s](_+)(?!_)(?=[punct])|(?!_)[punct](_+)(?!_)(?=[punct])/
  },
  code: /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,
  br: /^( {2,}|\\)\n(?!\s*$)/,
  del: noopTest,
  text: /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/,
  punctuation: /^((?![*_])[\spunctuation])/
};
inline._punctuation = "\\p{P}$+<=>`^|~";
inline.punctuation = edit(inline.punctuation, "u").replace(/punctuation/g, inline._punctuation).getRegex();
inline.blockSkip = /\[[^[\]]*?\]\([^\(\)]*?\)|`[^`]*?`|<[^<>]*?>/g;
inline.anyPunctuation = /\\[punct]/g;
inline._escapes = /\\([punct])/g;
inline._comment = edit(block._comment).replace("(?:-->|$)", "-->").getRegex();
inline.emStrong.lDelim = edit(inline.emStrong.lDelim, "u").replace(/punct/g, inline._punctuation).getRegex();
inline.emStrong.rDelimAst = edit(inline.emStrong.rDelimAst, "gu").replace(/punct/g, inline._punctuation).getRegex();
inline.emStrong.rDelimUnd = edit(inline.emStrong.rDelimUnd, "gu").replace(/punct/g, inline._punctuation).getRegex();
inline.anyPunctuation = edit(inline.anyPunctuation, "gu").replace(/punct/g, inline._punctuation).getRegex();
inline._escapes = edit(inline._escapes, "gu").replace(/punct/g, inline._punctuation).getRegex();
inline._scheme = /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/;
inline._email = /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/;
inline.autolink = edit(inline.autolink).replace("scheme", inline._scheme).replace("email", inline._email).getRegex();
inline._attribute = /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/;
inline.tag = edit(inline.tag).replace("comment", inline._comment).replace("attribute", inline._attribute).getRegex();
inline._label = /(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/;
inline._href = /<(?:\\.|[^\n<>\\])+>|[^\s\x00-\x1f]*/;
inline._title = /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/;
inline.link = edit(inline.link).replace("label", inline._label).replace("href", inline._href).replace("title", inline._title).getRegex();
inline.reflink = edit(inline.reflink).replace("label", inline._label).replace("ref", block._label).getRegex();
inline.nolink = edit(inline.nolink).replace("ref", block._label).getRegex();
inline.reflinkSearch = edit(inline.reflinkSearch, "g").replace("reflink", inline.reflink).replace("nolink", inline.nolink).getRegex();
inline.normal = { ...inline };
inline.pedantic = {
  ...inline.normal,
  strong: {
    start: /^__|\*\*/,
    middle: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
    endAst: /\*\*(?!\*)/g,
    endUnd: /__(?!_)/g
  },
  em: {
    start: /^_|\*/,
    middle: /^()\*(?=\S)([\s\S]*?\S)\*(?!\*)|^_(?=\S)([\s\S]*?\S)_(?!_)/,
    endAst: /\*(?!\*)/g,
    endUnd: /_(?!_)/g
  },
  link: edit(/^!?\[(label)\]\((.*?)\)/).replace("label", inline._label).getRegex(),
  reflink: edit(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label", inline._label).getRegex()
};
inline.gfm = {
  ...inline.normal,
  escape: edit(inline.escape).replace("])", "~|])").getRegex(),
  _extended_email: /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/,
  url: /^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/,
  _backpedal: /(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,
  del: /^(~~?)(?=[^\s~])([\s\S]*?[^\s~])\1(?=[^~]|$)/,
  text: /^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/
};
inline.gfm.url = edit(inline.gfm.url, "i").replace("email", inline.gfm._extended_email).getRegex();
inline.breaks = {
  ...inline.gfm,
  br: edit(inline.br).replace("{2,}", "*").getRegex(),
  text: edit(inline.gfm.text).replace("\\b_", "\\b_| {2,}\\n").replace(/\{2,\}/g, "*").getRegex()
};

class _Lexer {
  tokens;
  options;
  state;
  tokenizer;
  inlineQueue;
  constructor(options) {
    this.tokens = [];
    this.tokens.links = Object.create(null);
    this.options = options || _defaults;
    this.options.tokenizer = this.options.tokenizer || new _Tokenizer;
    this.tokenizer = this.options.tokenizer;
    this.tokenizer.options = this.options;
    this.tokenizer.lexer = this;
    this.inlineQueue = [];
    this.state = {
      inLink: false,
      inRawBlock: false,
      top: true
    };
    const rules = {
      block: block.normal,
      inline: inline.normal
    };
    if (this.options.pedantic) {
      rules.block = block.pedantic;
      rules.inline = inline.pedantic;
    } else if (this.options.gfm) {
      rules.block = block.gfm;
      if (this.options.breaks) {
        rules.inline = inline.breaks;
      } else {
        rules.inline = inline.gfm;
      }
    }
    this.tokenizer.rules = rules;
  }
  static get rules() {
    return {
      block,
      inline
    };
  }
  static lex(src, options) {
    const lexer = new _Lexer(options);
    return lexer.lex(src);
  }
  static lexInline(src, options) {
    const lexer = new _Lexer(options);
    return lexer.inlineTokens(src);
  }
  lex(src) {
    src = src.replace(/\r\n|\r/g, "\n");
    this.blockTokens(src, this.tokens);
    let next;
    while (next = this.inlineQueue.shift()) {
      this.inlineTokens(next.src, next.tokens);
    }
    return this.tokens;
  }
  blockTokens(src, tokens = []) {
    if (this.options.pedantic) {
      src = src.replace(/\t/g, "    ").replace(/^ +$/gm, "");
    } else {
      src = src.replace(/^( *)(\t+)/gm, (_, leading, tabs) => {
        return leading + "    ".repeat(tabs.length);
      });
    }
    let token;
    let lastToken;
    let cutSrc;
    let lastParagraphClipped;
    while (src) {
      if (this.options.extensions && this.options.extensions.block && this.options.extensions.block.some((extTokenizer) => {
        if (token = extTokenizer.call({ lexer: this }, src, tokens)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          return true;
        }
        return false;
      })) {
        continue;
      }
      if (token = this.tokenizer.space(src)) {
        src = src.substring(token.raw.length);
        if (token.raw.length === 1 && tokens.length > 0) {
          tokens[tokens.length - 1].raw += "\n";
        } else {
          tokens.push(token);
        }
        continue;
      }
      if (token = this.tokenizer.code(src)) {
        src = src.substring(token.raw.length);
        lastToken = tokens[tokens.length - 1];
        if (lastToken && (lastToken.type === "paragraph" || lastToken.type === "text")) {
          lastToken.raw += "\n" + token.raw;
          lastToken.text += "\n" + token.text;
          this.inlineQueue[this.inlineQueue.length - 1].src = lastToken.text;
        } else {
          tokens.push(token);
        }
        continue;
      }
      if (token = this.tokenizer.fences(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.heading(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.hr(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.blockquote(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.list(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.html(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.def(src)) {
        src = src.substring(token.raw.length);
        lastToken = tokens[tokens.length - 1];
        if (lastToken && (lastToken.type === "paragraph" || lastToken.type === "text")) {
          lastToken.raw += "\n" + token.raw;
          lastToken.text += "\n" + token.raw;
          this.inlineQueue[this.inlineQueue.length - 1].src = lastToken.text;
        } else if (!this.tokens.links[token.tag]) {
          this.tokens.links[token.tag] = {
            href: token.href,
            title: token.title
          };
        }
        continue;
      }
      if (token = this.tokenizer.table(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.lheading(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      cutSrc = src;
      if (this.options.extensions && this.options.extensions.startBlock) {
        let startIndex = Infinity;
        const tempSrc = src.slice(1);
        let tempStart;
        this.options.extensions.startBlock.forEach((getStartIndex) => {
          tempStart = getStartIndex.call({ lexer: this }, tempSrc);
          if (typeof tempStart === "number" && tempStart >= 0) {
            startIndex = Math.min(startIndex, tempStart);
          }
        });
        if (startIndex < Infinity && startIndex >= 0) {
          cutSrc = src.substring(0, startIndex + 1);
        }
      }
      if (this.state.top && (token = this.tokenizer.paragraph(cutSrc))) {
        lastToken = tokens[tokens.length - 1];
        if (lastParagraphClipped && lastToken.type === "paragraph") {
          lastToken.raw += "\n" + token.raw;
          lastToken.text += "\n" + token.text;
          this.inlineQueue.pop();
          this.inlineQueue[this.inlineQueue.length - 1].src = lastToken.text;
        } else {
          tokens.push(token);
        }
        lastParagraphClipped = cutSrc.length !== src.length;
        src = src.substring(token.raw.length);
        continue;
      }
      if (token = this.tokenizer.text(src)) {
        src = src.substring(token.raw.length);
        lastToken = tokens[tokens.length - 1];
        if (lastToken && lastToken.type === "text") {
          lastToken.raw += "\n" + token.raw;
          lastToken.text += "\n" + token.text;
          this.inlineQueue.pop();
          this.inlineQueue[this.inlineQueue.length - 1].src = lastToken.text;
        } else {
          tokens.push(token);
        }
        continue;
      }
      if (src) {
        const errMsg = "Infinite loop on byte: " + src.charCodeAt(0);
        if (this.options.silent) {
          console.error(errMsg);
          break;
        } else {
          throw new Error(errMsg);
        }
      }
    }
    this.state.top = true;
    return tokens;
  }
  inline(src, tokens = []) {
    this.inlineQueue.push({ src, tokens });
    return tokens;
  }
  inlineTokens(src, tokens = []) {
    let token, lastToken, cutSrc;
    let maskedSrc = src;
    let match;
    let keepPrevChar, prevChar;
    if (this.tokens.links) {
      const links = Object.keys(this.tokens.links);
      if (links.length > 0) {
        while ((match = this.tokenizer.rules.inline.reflinkSearch.exec(maskedSrc)) != null) {
          if (links.includes(match[0].slice(match[0].lastIndexOf("[") + 1, -1))) {
            maskedSrc = maskedSrc.slice(0, match.index) + "[" + "a".repeat(match[0].length - 2) + "]" + maskedSrc.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex);
          }
        }
      }
    }
    while ((match = this.tokenizer.rules.inline.blockSkip.exec(maskedSrc)) != null) {
      maskedSrc = maskedSrc.slice(0, match.index) + "[" + "a".repeat(match[0].length - 2) + "]" + maskedSrc.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);
    }
    while ((match = this.tokenizer.rules.inline.anyPunctuation.exec(maskedSrc)) != null) {
      maskedSrc = maskedSrc.slice(0, match.index) + "++" + maskedSrc.slice(this.tokenizer.rules.inline.anyPunctuation.lastIndex);
    }
    while (src) {
      if (!keepPrevChar) {
        prevChar = "";
      }
      keepPrevChar = false;
      if (this.options.extensions && this.options.extensions.inline && this.options.extensions.inline.some((extTokenizer) => {
        if (token = extTokenizer.call({ lexer: this }, src, tokens)) {
          src = src.substring(token.raw.length);
          tokens.push(token);
          return true;
        }
        return false;
      })) {
        continue;
      }
      if (token = this.tokenizer.escape(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.tag(src)) {
        src = src.substring(token.raw.length);
        lastToken = tokens[tokens.length - 1];
        if (lastToken && token.type === "text" && lastToken.type === "text") {
          lastToken.raw += token.raw;
          lastToken.text += token.text;
        } else {
          tokens.push(token);
        }
        continue;
      }
      if (token = this.tokenizer.link(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.reflink(src, this.tokens.links)) {
        src = src.substring(token.raw.length);
        lastToken = tokens[tokens.length - 1];
        if (lastToken && token.type === "text" && lastToken.type === "text") {
          lastToken.raw += token.raw;
          lastToken.text += token.text;
        } else {
          tokens.push(token);
        }
        continue;
      }
      if (token = this.tokenizer.emStrong(src, maskedSrc, prevChar)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.codespan(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.br(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.del(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (token = this.tokenizer.autolink(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      if (!this.state.inLink && (token = this.tokenizer.url(src))) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }
      cutSrc = src;
      if (this.options.extensions && this.options.extensions.startInline) {
        let startIndex = Infinity;
        const tempSrc = src.slice(1);
        let tempStart;
        this.options.extensions.startInline.forEach((getStartIndex) => {
          tempStart = getStartIndex.call({ lexer: this }, tempSrc);
          if (typeof tempStart === "number" && tempStart >= 0) {
            startIndex = Math.min(startIndex, tempStart);
          }
        });
        if (startIndex < Infinity && startIndex >= 0) {
          cutSrc = src.substring(0, startIndex + 1);
        }
      }
      if (token = this.tokenizer.inlineText(cutSrc)) {
        src = src.substring(token.raw.length);
        if (token.raw.slice(-1) !== "_") {
          prevChar = token.raw.slice(-1);
        }
        keepPrevChar = true;
        lastToken = tokens[tokens.length - 1];
        if (lastToken && lastToken.type === "text") {
          lastToken.raw += token.raw;
          lastToken.text += token.text;
        } else {
          tokens.push(token);
        }
        continue;
      }
      if (src) {
        const errMsg = "Infinite loop on byte: " + src.charCodeAt(0);
        if (this.options.silent) {
          console.error(errMsg);
          break;
        } else {
          throw new Error(errMsg);
        }
      }
    }
    return tokens;
  }
}

class _Renderer {
  options;
  constructor(options) {
    this.options = options || _defaults;
  }
  code(code, infostring, escaped) {
    const lang = (infostring || "").match(/^\S*/)?.[0];
    code = code.replace(/\n$/, "") + "\n";
    if (!lang) {
      return "<pre><code>" + (escaped ? code : escape(code, true)) + "</code></pre>\n";
    }
    return '<pre><code class="language-' + escape(lang) + '">' + (escaped ? code : escape(code, true)) + "</code></pre>\n";
  }
  blockquote(quote) {
    return `<blockquote>\n${quote}</blockquote>\n`;
  }
  html(html, block2) {
    return html;
  }
  heading(text, level, raw) {
    return `<h${level}>${text}</h${level}>\n`;
  }
  hr() {
    return "<hr>\n";
  }
  list(body, ordered, start) {
    const type = ordered ? "ol" : "ul";
    const startatt = ordered && start !== 1 ? ' start="' + start + '"' : "";
    return "<" + type + startatt + ">\n" + body + "</" + type + ">\n";
  }
  listitem(text, task, checked) {
    return `<li>${text}</li>\n`;
  }
  checkbox(checked) {
    return "<input " + (checked ? 'checked="" ' : "") + 'disabled="" type="checkbox">';
  }
  paragraph(text) {
    return `<p>${text}</p>\n`;
  }
  table(header, body) {
    if (body)
      body = `<tbody>${body}</tbody>`;
    return "<table>\n<thead>\n" + header + "</thead>\n" + body + "</table>\n";
  }
  tablerow(content) {
    return `<tr>\n${content}</tr>\n`;
  }
  tablecell(content, flags) {
    const type = flags.header ? "th" : "td";
    const tag = flags.align ? `<${type} align="${flags.align}">` : `<${type}>`;
    return tag + content + `</${type}>\n`;
  }
  strong(text) {
    return `<strong>${text}</strong>`;
  }
  em(text) {
    return `<em>${text}</em>`;
  }
  codespan(text) {
    return `<code>${text}</code>`;
  }
  br() {
    return "<br>";
  }
  del(text) {
    return `<del>${text}</del>`;
  }
  link(href, title, text) {
    const cleanHref = cleanUrl(href);
    if (cleanHref === null) {
      return text;
    }
    href = cleanHref;
    let out = '<a href="' + href + '"';
    if (title) {
      out += ' title="' + title + '"';
    }
    out += ">" + text + "</a>";
    return out;
  }
  image(href, title, text) {
    const cleanHref = cleanUrl(href);
    if (cleanHref === null) {
      return text;
    }
    href = cleanHref;
    let out = `<img src="${href}" alt="${text}"`;
    if (title) {
      out += ` title="${title}"`;
    }
    out += ">";
    return out;
  }
  text(text) {
    return text;
  }
}

class _TextRenderer {
  strong(text) {
    return text;
  }
  em(text) {
    return text;
  }
  codespan(text) {
    return text;
  }
  del(text) {
    return text;
  }
  html(text) {
    return text;
  }
  text(text) {
    return text;
  }
  link(href, title, text) {
    return "" + text;
  }
  image(href, title, text) {
    return "" + text;
  }
  br() {
    return "";
  }
}

class _Parser {
  options;
  renderer;
  textRenderer;
  constructor(options) {
    this.options = options || _defaults;
    this.options.renderer = this.options.renderer || new _Renderer;
    this.renderer = this.options.renderer;
    this.renderer.options = this.options;
    this.textRenderer = new _TextRenderer;
  }
  static parse(tokens, options) {
    const parser = new _Parser(options);
    return parser.parse(tokens);
  }
  static parseInline(tokens, options) {
    const parser = new _Parser(options);
    return parser.parseInline(tokens);
  }
  parse(tokens, top = true) {
    let out = "";
    for (let i = 0;i < tokens.length; i++) {
      const token = tokens[i];
      if (this.options.extensions && this.options.extensions.renderers && this.options.extensions.renderers[token.type]) {
        const genericToken = token;
        const ret = this.options.extensions.renderers[genericToken.type].call({ parser: this }, genericToken);
        if (ret !== false || !["space", "hr", "heading", "code", "table", "blockquote", "list", "html", "paragraph", "text"].includes(genericToken.type)) {
          out += ret || "";
          continue;
        }
      }
      switch (token.type) {
        case "space": {
          continue;
        }
        case "hr": {
          out += this.renderer.hr();
          continue;
        }
        case "heading": {
          const headingToken = token;
          out += this.renderer.heading(this.parseInline(headingToken.tokens), headingToken.depth, unescape2(this.parseInline(headingToken.tokens, this.textRenderer)));
          continue;
        }
        case "code": {
          const codeToken = token;
          out += this.renderer.code(codeToken.text, codeToken.lang, !!codeToken.escaped);
          continue;
        }
        case "table": {
          const tableToken = token;
          let header = "";
          let cell = "";
          for (let j = 0;j < tableToken.header.length; j++) {
            cell += this.renderer.tablecell(this.parseInline(tableToken.header[j].tokens), { header: true, align: tableToken.align[j] });
          }
          header += this.renderer.tablerow(cell);
          let body = "";
          for (let j = 0;j < tableToken.rows.length; j++) {
            const row = tableToken.rows[j];
            cell = "";
            for (let k = 0;k < row.length; k++) {
              cell += this.renderer.tablecell(this.parseInline(row[k].tokens), { header: false, align: tableToken.align[k] });
            }
            body += this.renderer.tablerow(cell);
          }
          out += this.renderer.table(header, body);
          continue;
        }
        case "blockquote": {
          const blockquoteToken = token;
          const body = this.parse(blockquoteToken.tokens);
          out += this.renderer.blockquote(body);
          continue;
        }
        case "list": {
          const listToken = token;
          const ordered = listToken.ordered;
          const start = listToken.start;
          const loose = listToken.loose;
          let body = "";
          for (let j = 0;j < listToken.items.length; j++) {
            const item = listToken.items[j];
            const checked = item.checked;
            const task = item.task;
            let itemBody = "";
            if (item.task) {
              const checkbox = this.renderer.checkbox(!!checked);
              if (loose) {
                if (item.tokens.length > 0 && item.tokens[0].type === "paragraph") {
                  item.tokens[0].text = checkbox + " " + item.tokens[0].text;
                  if (item.tokens[0].tokens && item.tokens[0].tokens.length > 0 && item.tokens[0].tokens[0].type === "text") {
                    item.tokens[0].tokens[0].text = checkbox + " " + item.tokens[0].tokens[0].text;
                  }
                } else {
                  item.tokens.unshift({
                    type: "text",
                    text: checkbox + " "
                  });
                }
              } else {
                itemBody += checkbox + " ";
              }
            }
            itemBody += this.parse(item.tokens, loose);
            body += this.renderer.listitem(itemBody, task, !!checked);
          }
          out += this.renderer.list(body, ordered, start);
          continue;
        }
        case "html": {
          const htmlToken = token;
          out += this.renderer.html(htmlToken.text, htmlToken.block);
          continue;
        }
        case "paragraph": {
          const paragraphToken = token;
          out += this.renderer.paragraph(this.parseInline(paragraphToken.tokens));
          continue;
        }
        case "text": {
          let textToken = token;
          let body = textToken.tokens ? this.parseInline(textToken.tokens) : textToken.text;
          while (i + 1 < tokens.length && tokens[i + 1].type === "text") {
            textToken = tokens[++i];
            body += "\n" + (textToken.tokens ? this.parseInline(textToken.tokens) : textToken.text);
          }
          out += top ? this.renderer.paragraph(body) : body;
          continue;
        }
        default: {
          const errMsg = 'Token with "' + token.type + '" type was not found.';
          if (this.options.silent) {
            console.error(errMsg);
            return "";
          } else {
            throw new Error(errMsg);
          }
        }
      }
    }
    return out;
  }
  parseInline(tokens, renderer) {
    renderer = renderer || this.renderer;
    let out = "";
    for (let i = 0;i < tokens.length; i++) {
      const token = tokens[i];
      if (this.options.extensions && this.options.extensions.renderers && this.options.extensions.renderers[token.type]) {
        const ret = this.options.extensions.renderers[token.type].call({ parser: this }, token);
        if (ret !== false || !["escape", "html", "link", "image", "strong", "em", "codespan", "br", "del", "text"].includes(token.type)) {
          out += ret || "";
          continue;
        }
      }
      switch (token.type) {
        case "escape": {
          const escapeToken = token;
          out += renderer.text(escapeToken.text);
          break;
        }
        case "html": {
          const tagToken = token;
          out += renderer.html(tagToken.text);
          break;
        }
        case "link": {
          const linkToken = token;
          out += renderer.link(linkToken.href, linkToken.title, this.parseInline(linkToken.tokens, renderer));
          break;
        }
        case "image": {
          const imageToken = token;
          out += renderer.image(imageToken.href, imageToken.title, imageToken.text);
          break;
        }
        case "strong": {
          const strongToken = token;
          out += renderer.strong(this.parseInline(strongToken.tokens, renderer));
          break;
        }
        case "em": {
          const emToken = token;
          out += renderer.em(this.parseInline(emToken.tokens, renderer));
          break;
        }
        case "codespan": {
          const codespanToken = token;
          out += renderer.codespan(codespanToken.text);
          break;
        }
        case "br": {
          out += renderer.br();
          break;
        }
        case "del": {
          const delToken = token;
          out += renderer.del(this.parseInline(delToken.tokens, renderer));
          break;
        }
        case "text": {
          const textToken = token;
          out += renderer.text(textToken.text);
          break;
        }
        default: {
          const errMsg = 'Token with "' + token.type + '" type was not found.';
          if (this.options.silent) {
            console.error(errMsg);
            return "";
          } else {
            throw new Error(errMsg);
          }
        }
      }
    }
    return out;
  }
}

class _Hooks {
  options;
  constructor(options) {
    this.options = options || _defaults;
  }
  static passThroughHooks = new Set([
    "preprocess",
    "postprocess"
  ]);
  preprocess(markdown) {
    return markdown;
  }
  postprocess(html) {
    return html;
  }
}

class Marked {
  defaults = _getDefaults();
  options = this.setOptions;
  parse = this.#parseMarkdown(_Lexer.lex, _Parser.parse);
  parseInline = this.#parseMarkdown(_Lexer.lexInline, _Parser.parseInline);
  Parser = _Parser;
  parser = _Parser.parse;
  Renderer = _Renderer;
  TextRenderer = _TextRenderer;
  Lexer = _Lexer;
  lexer = _Lexer.lex;
  Tokenizer = _Tokenizer;
  Hooks = _Hooks;
  constructor(...args) {
    this.use(...args);
  }
  walkTokens(tokens, callback) {
    let values = [];
    for (const token of tokens) {
      values = values.concat(callback.call(this, token));
      switch (token.type) {
        case "table": {
          const tableToken = token;
          for (const cell of tableToken.header) {
            values = values.concat(this.walkTokens(cell.tokens, callback));
          }
          for (const row of tableToken.rows) {
            for (const cell of row) {
              values = values.concat(this.walkTokens(cell.tokens, callback));
            }
          }
          break;
        }
        case "list": {
          const listToken = token;
          values = values.concat(this.walkTokens(listToken.items, callback));
          break;
        }
        default: {
          const genericToken = token;
          if (this.defaults.extensions?.childTokens?.[genericToken.type]) {
            this.defaults.extensions.childTokens[genericToken.type].forEach((childTokens) => {
              values = values.concat(this.walkTokens(genericToken[childTokens], callback));
            });
          } else if (genericToken.tokens) {
            values = values.concat(this.walkTokens(genericToken.tokens, callback));
          }
        }
      }
    }
    return values;
  }
  use(...args) {
    const extensions = this.defaults.extensions || { renderers: {}, childTokens: {} };
    args.forEach((pack) => {
      const opts = { ...pack };
      opts.async = this.defaults.async || opts.async || false;
      if (pack.extensions) {
        pack.extensions.forEach((ext) => {
          if (!ext.name) {
            throw new Error("extension name required");
          }
          if ("renderer" in ext) {
            const prevRenderer = extensions.renderers[ext.name];
            if (prevRenderer) {
              extensions.renderers[ext.name] = function(...args2) {
                let ret = ext.renderer.apply(this, args2);
                if (ret === false) {
                  ret = prevRenderer.apply(this, args2);
                }
                return ret;
              };
            } else {
              extensions.renderers[ext.name] = ext.renderer;
            }
          }
          if ("tokenizer" in ext) {
            if (!ext.level || ext.level !== "block" && ext.level !== "inline") {
              throw new Error("extension level must be 'block' or 'inline'");
            }
            const extLevel = extensions[ext.level];
            if (extLevel) {
              extLevel.unshift(ext.tokenizer);
            } else {
              extensions[ext.level] = [ext.tokenizer];
            }
            if (ext.start) {
              if (ext.level === "block") {
                if (extensions.startBlock) {
                  extensions.startBlock.push(ext.start);
                } else {
                  extensions.startBlock = [ext.start];
                }
              } else if (ext.level === "inline") {
                if (extensions.startInline) {
                  extensions.startInline.push(ext.start);
                } else {
                  extensions.startInline = [ext.start];
                }
              }
            }
          }
          if (("childTokens" in ext) && ext.childTokens) {
            extensions.childTokens[ext.name] = ext.childTokens;
          }
        });
        opts.extensions = extensions;
      }
      if (pack.renderer) {
        const renderer = this.defaults.renderer || new _Renderer(this.defaults);
        for (const prop in pack.renderer) {
          const rendererFunc = pack.renderer[prop];
          const rendererKey = prop;
          const prevRenderer = renderer[rendererKey];
          renderer[rendererKey] = (...args2) => {
            let ret = rendererFunc.apply(renderer, args2);
            if (ret === false) {
              ret = prevRenderer.apply(renderer, args2);
            }
            return ret || "";
          };
        }
        opts.renderer = renderer;
      }
      if (pack.tokenizer) {
        const tokenizer = this.defaults.tokenizer || new _Tokenizer(this.defaults);
        for (const prop in pack.tokenizer) {
          const tokenizerFunc = pack.tokenizer[prop];
          const tokenizerKey = prop;
          const prevTokenizer = tokenizer[tokenizerKey];
          tokenizer[tokenizerKey] = (...args2) => {
            let ret = tokenizerFunc.apply(tokenizer, args2);
            if (ret === false) {
              ret = prevTokenizer.apply(tokenizer, args2);
            }
            return ret;
          };
        }
        opts.tokenizer = tokenizer;
      }
      if (pack.hooks) {
        const hooks = this.defaults.hooks || new _Hooks;
        for (const prop in pack.hooks) {
          const hooksFunc = pack.hooks[prop];
          const hooksKey = prop;
          const prevHook = hooks[hooksKey];
          if (_Hooks.passThroughHooks.has(prop)) {
            hooks[hooksKey] = (arg) => {
              if (this.defaults.async) {
                return Promise.resolve(hooksFunc.call(hooks, arg)).then((ret2) => {
                  return prevHook.call(hooks, ret2);
                });
              }
              const ret = hooksFunc.call(hooks, arg);
              return prevHook.call(hooks, ret);
            };
          } else {
            hooks[hooksKey] = (...args2) => {
              let ret = hooksFunc.apply(hooks, args2);
              if (ret === false) {
                ret = prevHook.apply(hooks, args2);
              }
              return ret;
            };
          }
        }
        opts.hooks = hooks;
      }
      if (pack.walkTokens) {
        const walkTokens = this.defaults.walkTokens;
        const packWalktokens = pack.walkTokens;
        opts.walkTokens = function(token) {
          let values = [];
          values.push(packWalktokens.call(this, token));
          if (walkTokens) {
            values = values.concat(walkTokens.call(this, token));
          }
          return values;
        };
      }
      this.defaults = { ...this.defaults, ...opts };
    });
    return this;
  }
  setOptions(opt) {
    this.defaults = { ...this.defaults, ...opt };
    return this;
  }
  #parseMarkdown(lexer, parser) {
    return (src, options) => {
      const origOpt = { ...options };
      const opt = { ...this.defaults, ...origOpt };
      if (this.defaults.async === true && origOpt.async === false) {
        if (!opt.silent) {
          console.warn("marked(): The async option was set to true by an extension. The async: false option sent to parse will be ignored.");
        }
        opt.async = true;
      }
      const throwError = this.#onError(!!opt.silent, !!opt.async);
      if (typeof src === "undefined" || src === null) {
        return throwError(new Error("marked(): input parameter is undefined or null"));
      }
      if (typeof src !== "string") {
        return throwError(new Error("marked(): input parameter is of type " + Object.prototype.toString.call(src) + ", string expected"));
      }
      if (opt.hooks) {
        opt.hooks.options = opt;
      }
      if (opt.async) {
        return Promise.resolve(opt.hooks ? opt.hooks.preprocess(src) : src).then((src2) => lexer(src2, opt)).then((tokens) => opt.walkTokens ? Promise.all(this.walkTokens(tokens, opt.walkTokens)).then(() => tokens) : tokens).then((tokens) => parser(tokens, opt)).then((html) => opt.hooks ? opt.hooks.postprocess(html) : html).catch(throwError);
      }
      try {
        if (opt.hooks) {
          src = opt.hooks.preprocess(src);
        }
        const tokens = lexer(src, opt);
        if (opt.walkTokens) {
          this.walkTokens(tokens, opt.walkTokens);
        }
        let html = parser(tokens, opt);
        if (opt.hooks) {
          html = opt.hooks.postprocess(html);
        }
        return html;
      } catch (e) {
        return throwError(e);
      }
    };
  }
  #onError(silent, async) {
    return (e) => {
      e.message += "\nPlease report this to https://github.com/markedjs/marked.";
      if (silent) {
        const msg = "<p>An error occurred:</p><pre>" + escape(e.message + "", true) + "</pre>";
        if (async) {
          return Promise.resolve(msg);
        }
        return msg;
      }
      if (async) {
        return Promise.reject(e);
      }
      throw e;
    };
  }
}
var markedInstance = new Marked;
marked.options = marked.setOptions = function(options) {
  markedInstance.setOptions(options);
  marked.defaults = markedInstance.defaults;
  changeDefaults(marked.defaults);
  return marked;
};
marked.getDefaults = _getDefaults;
marked.defaults = _defaults;
marked.use = function(...args) {
  markedInstance.use(...args);
  marked.defaults = markedInstance.defaults;
  changeDefaults(marked.defaults);
  return marked;
};
marked.walkTokens = function(tokens, callback) {
  return markedInstance.walkTokens(tokens, callback);
};
marked.parseInline = markedInstance.parseInline;
marked.Parser = _Parser;
marked.parser = _Parser.parse;
marked.Renderer = _Renderer;
marked.TextRenderer = _TextRenderer;
marked.Lexer = _Lexer;
marked.lexer = _Lexer.lex;
marked.Tokenizer = _Tokenizer;
marked.Hooks = _Hooks;
marked.parse = marked;
var options = marked.options;
var setOptions = marked.setOptions;
var use = marked.use;
var walkTokens = marked.walkTokens;
var parseInline = marked.parseInline;
var parser = _Parser.parse;
var lexer = _Lexer.lex;

// node_modules/openai/version.mjs
var VERSION = "4.14.1";

// node_modules/openai/_shims/registry.mjs
function setShims(shims, options2 = { auto: false }) {
  if (auto) {
    throw new Error(`you must \`import 'openai/shims/${shims.kind}'\` before importing anything else from openai`);
  }
  if (kind) {
    throw new Error(`can't \`import 'openai/shims/${shims.kind}'\` after \`import 'openai/shims/${kind}'\``);
  }
  auto = options2.auto;
  kind = shims.kind;
  fetch2 = shims.fetch;
  Request2 = shims.Request;
  Response2 = shims.Response;
  Headers2 = shims.Headers;
  FormData2 = shims.FormData;
  Blob2 = shims.Blob;
  File2 = shims.File;
  ReadableStream2 = shims.ReadableStream;
  getMultipartRequestOptions = shims.getMultipartRequestOptions;
  getDefaultAgent = shims.getDefaultAgent;
  fileFromPath = shims.fileFromPath;
  isFsReadStream = shims.isFsReadStream;
}
var auto = false;
var kind = undefined;
var fetch2 = undefined;
var Request2 = undefined;
var Response2 = undefined;
var Headers2 = undefined;
var FormData2 = undefined;
var Blob2 = undefined;
var File2 = undefined;
var ReadableStream2 = undefined;
var getMultipartRequestOptions = undefined;
var getDefaultAgent = undefined;
var fileFromPath = undefined;
var isFsReadStream = undefined;

// node_modules/openai/_shims/MultipartBody.mjs
class MultipartBody {
  constructor(body) {
    this.body = body;
  }
  get [Symbol.toStringTag]() {
    return "MultipartBody";
  }
}

// node_modules/openai/_shims/web-runtime.mjs
function getRuntime({ manuallyImported } = {}) {
  const recommendation = manuallyImported ? `You may need to use polyfills` : `Add one of these imports before your first \`import \u2026 from 'openai'\`:
- \`import 'openai/shims/node'\` (if you're running on Node)
- \`import 'openai/shims/web'\` (otherwise)
`;
  let _fetch, _Request, _Response, _Headers;
  try {
    _fetch = fetch;
    _Request = Request;
    _Response = Response;
    _Headers = Headers;
  } catch (error) {
    throw new Error(`this environment is missing the following Web Fetch API type: ${error.message}. ${recommendation}`);
  }
  return {
    kind: "web",
    fetch: _fetch,
    Request: _Request,
    Response: _Response,
    Headers: _Headers,
    FormData: typeof FormData !== "undefined" ? FormData : class FormData3 {
      constructor() {
        throw new Error(`file uploads aren't supported in this environment yet as 'FormData' is undefined. ${recommendation}`);
      }
    },
    Blob: typeof Blob !== "undefined" ? Blob : class Blob3 {
      constructor() {
        throw new Error(`file uploads aren't supported in this environment yet as 'Blob' is undefined. ${recommendation}`);
      }
    },
    File: typeof File !== "undefined" ? File : class File3 {
      constructor() {
        throw new Error(`file uploads aren't supported in this environment yet as 'File' is undefined. ${recommendation}`);
      }
    },
    ReadableStream: typeof ReadableStream !== "undefined" ? ReadableStream : class ReadableStream3 {
      constructor() {
        throw new Error(`streaming isn't supported in this environment yet as 'ReadableStream' is undefined. ${recommendation}`);
      }
    },
    getMultipartRequestOptions: async (form, opts) => ({
      ...opts,
      body: new MultipartBody(form)
    }),
    getDefaultAgent: (url) => {
      return;
    },
    fileFromPath: () => {
      throw new Error("The `fileFromPath` function is only supported in Node. See the README for more details: https://www.github.com/openai/openai-node#file-uploads");
    },
    isFsReadStream: (value) => false
  };
}

// node_modules/openai/_shims/index.mjs
if (!kind)
  setShims(getRuntime(), { auto: true });

// node_modules/openai/error.mjs
class OpenAIError extends Error {
}

class APIError extends OpenAIError {
  constructor(status, error, message, headers) {
    super(`${APIError.makeMessage(status, error, message)}`);
    this.status = status;
    this.headers = headers;
    const data = error;
    this.error = data;
    this.code = data?.["code"];
    this.param = data?.["param"];
    this.type = data?.["type"];
  }
  static makeMessage(status, error, message) {
    const msg = error?.message ? typeof error.message === "string" ? error.message : JSON.stringify(error.message) : error ? JSON.stringify(error) : message;
    if (status && msg) {
      return `${status} ${msg}`;
    }
    if (status) {
      return `${status} status code (no body)`;
    }
    if (msg) {
      return msg;
    }
    return "(no status code or body)";
  }
  static generate(status, errorResponse, message, headers) {
    if (!status) {
      return new APIConnectionError({ cause: castToError(errorResponse) });
    }
    const error = errorResponse?.["error"];
    if (status === 400) {
      return new BadRequestError(status, error, message, headers);
    }
    if (status === 401) {
      return new AuthenticationError(status, error, message, headers);
    }
    if (status === 403) {
      return new PermissionDeniedError(status, error, message, headers);
    }
    if (status === 404) {
      return new NotFoundError(status, error, message, headers);
    }
    if (status === 409) {
      return new ConflictError(status, error, message, headers);
    }
    if (status === 422) {
      return new UnprocessableEntityError(status, error, message, headers);
    }
    if (status === 429) {
      return new RateLimitError(status, error, message, headers);
    }
    if (status >= 500) {
      return new InternalServerError(status, error, message, headers);
    }
    return new APIError(status, error, message, headers);
  }
}

class APIUserAbortError extends APIError {
  constructor({ message } = {}) {
    super(undefined, undefined, message || "Request was aborted.", undefined);
    this.status = undefined;
  }
}

class APIConnectionError extends APIError {
  constructor({ message, cause }) {
    super(undefined, undefined, message || "Connection error.", undefined);
    this.status = undefined;
    if (cause)
      this.cause = cause;
  }
}

class APIConnectionTimeoutError extends APIConnectionError {
  constructor({ message } = {}) {
    super({ message: message ?? "Request timed out." });
  }
}

class BadRequestError extends APIError {
  constructor() {
    super(...arguments);
    this.status = 400;
  }
}

class AuthenticationError extends APIError {
  constructor() {
    super(...arguments);
    this.status = 401;
  }
}

class PermissionDeniedError extends APIError {
  constructor() {
    super(...arguments);
    this.status = 403;
  }
}

class NotFoundError extends APIError {
  constructor() {
    super(...arguments);
    this.status = 404;
  }
}

class ConflictError extends APIError {
  constructor() {
    super(...arguments);
    this.status = 409;
  }
}

class UnprocessableEntityError extends APIError {
  constructor() {
    super(...arguments);
    this.status = 422;
  }
}

class RateLimitError extends APIError {
  constructor() {
    super(...arguments);
    this.status = 429;
  }
}

class InternalServerError extends APIError {
}

// node_modules/openai/streaming.mjs
var partition = function(str, delimiter) {
  const index = str.indexOf(delimiter);
  if (index !== -1) {
    return [str.substring(0, index), delimiter, str.substring(index + delimiter.length)];
  }
  return [str, "", ""];
};
var readableStreamAsyncIterable = function(stream) {
  if (stream[Symbol.asyncIterator])
    return stream;
  const reader = stream.getReader();
  return {
    async next() {
      try {
        const result = await reader.read();
        if (result?.done)
          reader.releaseLock();
        return result;
      } catch (e) {
        reader.releaseLock();
        throw e;
      }
    },
    async return() {
      const cancelPromise = reader.cancel();
      reader.releaseLock();
      await cancelPromise;
      return { done: true, value: undefined };
    },
    [Symbol.asyncIterator]() {
      return this;
    }
  };
};

class Stream {
  constructor(iterator, controller) {
    this.iterator = iterator;
    this.controller = controller;
  }
  static fromSSEResponse(response, controller) {
    let consumed = false;
    const decoder = new SSEDecoder;
    async function* iterMessages() {
      if (!response.body) {
        controller.abort();
        throw new OpenAIError(`Attempted to iterate over a response with no body`);
      }
      const lineDecoder = new LineDecoder;
      const iter = readableStreamAsyncIterable(response.body);
      for await (const chunk of iter) {
        for (const line of lineDecoder.decode(chunk)) {
          const sse = decoder.decode(line);
          if (sse)
            yield sse;
        }
      }
      for (const line of lineDecoder.flush()) {
        const sse = decoder.decode(line);
        if (sse)
          yield sse;
      }
    }
    async function* iterator() {
      if (consumed) {
        throw new Error("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      }
      consumed = true;
      let done = false;
      try {
        for await (const sse of iterMessages()) {
          if (done)
            continue;
          if (sse.data.startsWith("[DONE]")) {
            done = true;
            continue;
          }
          if (sse.event === null) {
            let data;
            try {
              data = JSON.parse(sse.data);
            } catch (e) {
              console.error(`Could not parse message into JSON:`, sse.data);
              console.error(`From chunk:`, sse.raw);
              throw e;
            }
            if (data && data.error) {
              throw new APIError(undefined, data.error, undefined, undefined);
            }
            yield data;
          }
        }
        done = true;
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError")
          return;
        throw e;
      } finally {
        if (!done)
          controller.abort();
      }
    }
    return new Stream(iterator, controller);
  }
  static fromReadableStream(readableStream, controller) {
    let consumed = false;
    async function* iterLines() {
      const lineDecoder = new LineDecoder;
      const iter = readableStreamAsyncIterable(readableStream);
      for await (const chunk of iter) {
        for (const line of lineDecoder.decode(chunk)) {
          yield line;
        }
      }
      for (const line of lineDecoder.flush()) {
        yield line;
      }
    }
    async function* iterator() {
      if (consumed) {
        throw new Error("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      }
      consumed = true;
      let done = false;
      try {
        for await (const line of iterLines()) {
          if (done)
            continue;
          if (line)
            yield JSON.parse(line);
        }
        done = true;
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError")
          return;
        throw e;
      } finally {
        if (!done)
          controller.abort();
      }
    }
    return new Stream(iterator, controller);
  }
  [Symbol.asyncIterator]() {
    return this.iterator();
  }
  tee() {
    const left = [];
    const right = [];
    const iterator = this.iterator();
    const teeIterator = (queue) => {
      return {
        next: () => {
          if (queue.length === 0) {
            const result = iterator.next();
            left.push(result);
            right.push(result);
          }
          return queue.shift();
        }
      };
    };
    return [
      new Stream(() => teeIterator(left), this.controller),
      new Stream(() => teeIterator(right), this.controller)
    ];
  }
  toReadableStream() {
    const self2 = this;
    let iter;
    const encoder = new TextEncoder;
    return new ReadableStream2({
      async start() {
        iter = self2[Symbol.asyncIterator]();
      },
      async pull(ctrl) {
        try {
          const { value, done } = await iter.next();
          if (done)
            return ctrl.close();
          const bytes = encoder.encode(JSON.stringify(value) + "\n");
          ctrl.enqueue(bytes);
        } catch (err) {
          ctrl.error(err);
        }
      },
      async cancel() {
        await iter.return?.();
      }
    });
  }
}

class SSEDecoder {
  constructor() {
    this.event = null;
    this.data = [];
    this.chunks = [];
  }
  decode(line) {
    if (line.endsWith("\r")) {
      line = line.substring(0, line.length - 1);
    }
    if (!line) {
      if (!this.event && !this.data.length)
        return null;
      const sse = {
        event: this.event,
        data: this.data.join("\n"),
        raw: this.chunks
      };
      this.event = null;
      this.data = [];
      this.chunks = [];
      return sse;
    }
    this.chunks.push(line);
    if (line.startsWith(":")) {
      return null;
    }
    let [fieldname, _, value] = partition(line, ":");
    if (value.startsWith(" ")) {
      value = value.substring(1);
    }
    if (fieldname === "event") {
      this.event = value;
    } else if (fieldname === "data") {
      this.data.push(value);
    }
    return null;
  }
}

class LineDecoder {
  constructor() {
    this.buffer = [];
    this.trailingCR = false;
  }
  decode(chunk) {
    let text = this.decodeText(chunk);
    if (this.trailingCR) {
      text = "\r" + text;
      this.trailingCR = false;
    }
    if (text.endsWith("\r")) {
      this.trailingCR = true;
      text = text.slice(0, -1);
    }
    if (!text) {
      return [];
    }
    const trailingNewline = LineDecoder.NEWLINE_CHARS.has(text[text.length - 1] || "");
    let lines = text.split(LineDecoder.NEWLINE_REGEXP);
    if (lines.length === 1 && !trailingNewline) {
      this.buffer.push(lines[0]);
      return [];
    }
    if (this.buffer.length > 0) {
      lines = [this.buffer.join("") + lines[0], ...lines.slice(1)];
      this.buffer = [];
    }
    if (!trailingNewline) {
      this.buffer = [lines.pop() || ""];
    }
    return lines;
  }
  decodeText(bytes) {
    if (bytes == null)
      return "";
    if (typeof bytes === "string")
      return bytes;
    if (typeof Buffer !== "undefined") {
      if (bytes instanceof Buffer) {
        return bytes.toString();
      }
      if (bytes instanceof Uint8Array) {
        return Buffer.from(bytes).toString();
      }
      throw new OpenAIError(`Unexpected: received non-Uint8Array (${bytes.constructor.name}) stream chunk in an environment with a global "Buffer" defined, which this library assumes to be Node. Please report this error.`);
    }
    if (typeof TextDecoder !== "undefined") {
      if (bytes instanceof Uint8Array || bytes instanceof ArrayBuffer) {
        this.textDecoder ?? (this.textDecoder = new TextDecoder("utf8"));
        return this.textDecoder.decode(bytes);
      }
      throw new OpenAIError(`Unexpected: received non-Uint8Array/ArrayBuffer (${bytes.constructor.name}) in a web platform. Please report this error.`);
    }
    throw new OpenAIError(`Unexpected: neither Buffer nor TextDecoder are available as globals. Please report this error.`);
  }
  flush() {
    if (!this.buffer.length && !this.trailingCR) {
      return [];
    }
    const lines = [this.buffer.join("")];
    this.buffer = [];
    this.trailingCR = false;
    return lines;
  }
}
LineDecoder.NEWLINE_CHARS = new Set(["\n", "\r", "\v", "\f", "\x1C", "\x1D", "\x1E", "\x85", "\u2028", "\u2029"]);
LineDecoder.NEWLINE_REGEXP = /\r\n|[\n\r\x0b\x0c\x1c\x1d\x1e\x85\u2028\u2029]/g;

// node_modules/openai/uploads.mjs
async function toFile(value, name, options2 = {}) {
  value = await value;
  if (isResponseLike(value)) {
    const blob = await value.blob();
    name || (name = new URL(value.url).pathname.split(/[\\/]/).pop() ?? "unknown_file");
    return new File2([blob], name, options2);
  }
  const bits = await getBytes(value);
  name || (name = getName(value) ?? "unknown_file");
  if (!options2.type) {
    const type = bits[0]?.type;
    if (typeof type === "string") {
      options2 = { ...options2, type };
    }
  }
  return new File2(bits, name, options2);
}
async function getBytes(value) {
  let parts = [];
  if (typeof value === "string" || ArrayBuffer.isView(value) || value instanceof ArrayBuffer) {
    parts.push(value);
  } else if (isBlobLike(value)) {
    parts.push(await value.arrayBuffer());
  } else if (isAsyncIterableIterator(value)) {
    for await (const chunk of value) {
      parts.push(chunk);
    }
  } else {
    throw new Error(`Unexpected data type: ${typeof value}; constructor: ${value?.constructor?.name}; props: ${propsForError(value)}`);
  }
  return parts;
}
var propsForError = function(value) {
  const props = Object.getOwnPropertyNames(value);
  return `[${props.map((p) => `"${p}"`).join(", ")}]`;
};
var getName = function(value) {
  return getStringFromMaybeBuffer(value.name) || getStringFromMaybeBuffer(value.filename) || getStringFromMaybeBuffer(value.path)?.split(/[\\/]/).pop();
};
var isResponseLike = (value) => value != null && typeof value === "object" && typeof value.url === "string" && typeof value.blob === "function";
var isFileLike = (value) => value != null && typeof value === "object" && typeof value.name === "string" && typeof value.lastModified === "number" && isBlobLike(value);
var isBlobLike = (value) => value != null && typeof value === "object" && typeof value.size === "number" && typeof value.type === "string" && typeof value.text === "function" && typeof value.slice === "function" && typeof value.arrayBuffer === "function";
var isUploadable = (value) => {
  return isFileLike(value) || isResponseLike(value) || isFsReadStream(value);
};
var getStringFromMaybeBuffer = (x) => {
  if (typeof x === "string")
    return x;
  if (typeof Buffer !== "undefined" && x instanceof Buffer)
    return String(x);
  return;
};
var isAsyncIterableIterator = (value) => value != null && typeof value === "object" && typeof value[Symbol.asyncIterator] === "function";
var isMultipartBody = (body) => body && typeof body === "object" && body.body && body[Symbol.toStringTag] === "MultipartBody";
var multipartFormRequestOptions = async (opts) => {
  const form = await createForm(opts.body);
  return getMultipartRequestOptions(form, opts);
};
var createForm = async (body) => {
  const form = new FormData2;
  await Promise.all(Object.entries(body || {}).map(([key, value]) => addFormValue(form, key, value)));
  return form;
};
var addFormValue = async (form, key, value) => {
  if (value === undefined)
    return;
  if (value == null) {
    throw new TypeError(`Received null for "${key}"; to pass null in FormData, you must use the string 'null'`);
  }
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    form.append(key, String(value));
  } else if (isUploadable(value)) {
    const file = await toFile(value);
    form.append(key, file);
  } else if (Array.isArray(value)) {
    await Promise.all(value.map((entry) => addFormValue(form, key + "[]", entry)));
  } else if (typeof value === "object") {
    await Promise.all(Object.entries(value).map(([name, prop]) => addFormValue(form, `${key}[${name}]`, prop)));
  } else {
    throw new TypeError(`Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${value} instead`);
  }
};

// node_modules/openai/core.mjs
async function defaultParseResponse(props) {
  const { response } = props;
  if (props.options.stream) {
    debug("response", response.status, response.url, response.headers, response.body);
    return Stream.fromSSEResponse(response, props.controller);
  }
  if (response.status === 204) {
    return null;
  }
  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    const json = await response.json();
    debug("response", response.status, response.url, response.headers, json);
    return json;
  }
  const text = await response.text();
  debug("response", response.status, response.url, response.headers, text);
  return text;
}
var getBrowserInfo = function() {
  if (typeof navigator === "undefined" || !navigator) {
    return null;
  }
  const browserPatterns = [
    { key: "edge", pattern: /Edge(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "ie", pattern: /MSIE(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "ie", pattern: /Trident(?:.*rv\:(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "chrome", pattern: /Chrome(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "firefox", pattern: /Firefox(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "safari", pattern: /(?:Version\W+(\d+)\.(\d+)(?:\.(\d+))?)?(?:\W+Mobile\S*)?\W+Safari/ }
  ];
  for (const { key, pattern } of browserPatterns) {
    const match = pattern.exec(navigator.userAgent);
    if (match) {
      const major = match[1] || 0;
      const minor = match[2] || 0;
      const patch = match[3] || 0;
      return { browser: key, version: `${major}.${minor}.${patch}` };
    }
  }
  return null;
};
function isEmptyObj(obj) {
  if (!obj)
    return true;
  for (const _k in obj)
    return false;
  return true;
}
function hasOwn(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}
function debug(action, ...args) {
  if (typeof process !== "undefined" && process.env["DEBUG"] === "true") {
    console.log(`OpenAI:DEBUG:${action}`, ...args);
  }
}
var __classPrivateFieldSet = function(receiver, state, value, kind2, f) {
  if (kind2 === "m")
    throw new TypeError("Private method is not writable");
  if (kind2 === "a" && !f)
    throw new TypeError("Private accessor was defined without a setter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
    throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return kind2 === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
};
var __classPrivateFieldGet = function(receiver, state, kind2, f) {
  if (kind2 === "a" && !f)
    throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
    throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind2 === "m" ? f : kind2 === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _AbstractPage_client;

class APIPromise extends Promise {
  constructor(responsePromise, parseResponse = defaultParseResponse) {
    super((resolve) => {
      resolve(null);
    });
    this.responsePromise = responsePromise;
    this.parseResponse = parseResponse;
  }
  _thenUnwrap(transform) {
    return new APIPromise(this.responsePromise, async (props) => transform(await this.parseResponse(props)));
  }
  asResponse() {
    return this.responsePromise.then((p) => p.response);
  }
  async withResponse() {
    const [data, response] = await Promise.all([this.parse(), this.asResponse()]);
    return { data, response };
  }
  parse() {
    if (!this.parsedPromise) {
      this.parsedPromise = this.responsePromise.then(this.parseResponse);
    }
    return this.parsedPromise;
  }
  then(onfulfilled, onrejected) {
    return this.parse().then(onfulfilled, onrejected);
  }
  catch(onrejected) {
    return this.parse().catch(onrejected);
  }
  finally(onfinally) {
    return this.parse().finally(onfinally);
  }
}

class APIClient {
  constructor({
    baseURL,
    maxRetries = 2,
    timeout = 600000,
    httpAgent,
    fetch: overridenFetch
  }) {
    this.baseURL = baseURL;
    this.maxRetries = validatePositiveInteger("maxRetries", maxRetries);
    this.timeout = validatePositiveInteger("timeout", timeout);
    this.httpAgent = httpAgent;
    this.fetch = overridenFetch ?? fetch2;
  }
  authHeaders(opts) {
    return {};
  }
  defaultHeaders(opts) {
    return {
      Accept: "application/json",
      "Content-Type": "application/json",
      "User-Agent": this.getUserAgent(),
      ...getPlatformHeaders(),
      ...this.authHeaders(opts)
    };
  }
  validateHeaders(headers, customHeaders) {
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${uuid4()}`;
  }
  get(path, opts) {
    return this.methodRequest("get", path, opts);
  }
  post(path, opts) {
    return this.methodRequest("post", path, opts);
  }
  patch(path, opts) {
    return this.methodRequest("patch", path, opts);
  }
  put(path, opts) {
    return this.methodRequest("put", path, opts);
  }
  delete(path, opts) {
    return this.methodRequest("delete", path, opts);
  }
  methodRequest(method, path, opts) {
    return this.request(Promise.resolve(opts).then((opts2) => ({ method, path, ...opts2 })));
  }
  getAPIList(path, Page, opts) {
    return this.requestAPIList(Page, { method: "get", path, ...opts });
  }
  calculateContentLength(body) {
    if (typeof body === "string") {
      if (typeof Buffer !== "undefined") {
        return Buffer.byteLength(body, "utf8").toString();
      }
      if (typeof TextEncoder !== "undefined") {
        const encoder = new TextEncoder;
        const encoded = encoder.encode(body);
        return encoded.length.toString();
      }
    }
    return null;
  }
  buildRequest(options2) {
    const { method, path, query, headers = {} } = options2;
    const body = isMultipartBody(options2.body) ? options2.body.body : options2.body ? JSON.stringify(options2.body, null, 2) : null;
    const contentLength = this.calculateContentLength(body);
    const url = this.buildURL(path, query);
    if ("timeout" in options2)
      validatePositiveInteger("timeout", options2.timeout);
    const timeout = options2.timeout ?? this.timeout;
    const httpAgent = options2.httpAgent ?? this.httpAgent ?? getDefaultAgent(url);
    const minAgentTimeout = timeout + 1000;
    if (typeof httpAgent?.options?.timeout === "number" && minAgentTimeout > (httpAgent.options.timeout ?? 0)) {
      httpAgent.options.timeout = minAgentTimeout;
    }
    if (this.idempotencyHeader && method !== "get") {
      if (!options2.idempotencyKey)
        options2.idempotencyKey = this.defaultIdempotencyKey();
      headers[this.idempotencyHeader] = options2.idempotencyKey;
    }
    const reqHeaders = {
      ...contentLength && { "Content-Length": contentLength },
      ...this.defaultHeaders(options2),
      ...headers
    };
    if (isMultipartBody(options2.body) && kind !== "node") {
      delete reqHeaders["Content-Type"];
    }
    Object.keys(reqHeaders).forEach((key) => reqHeaders[key] === null && delete reqHeaders[key]);
    const req = {
      method,
      ...body && { body },
      headers: reqHeaders,
      ...httpAgent && { agent: httpAgent },
      signal: options2.signal ?? null
    };
    this.validateHeaders(reqHeaders, headers);
    return { req, url, timeout };
  }
  async prepareRequest(request, { url, options: options2 }) {
  }
  parseHeaders(headers) {
    return !headers ? {} : (Symbol.iterator in headers) ? Object.fromEntries(Array.from(headers).map((header) => [...header])) : { ...headers };
  }
  makeStatusError(status, error4, message, headers) {
    return APIError.generate(status, error4, message, headers);
  }
  request(options2, remainingRetries = null) {
    return new APIPromise(this.makeRequest(options2, remainingRetries));
  }
  async makeRequest(optionsInput, retriesRemaining) {
    const options2 = await optionsInput;
    if (retriesRemaining == null) {
      retriesRemaining = options2.maxRetries ?? this.maxRetries;
    }
    const { req, url, timeout } = this.buildRequest(options2);
    await this.prepareRequest(req, { url, options: options2 });
    debug("request", url, options2, req.headers);
    if (options2.signal?.aborted) {
      throw new APIUserAbortError;
    }
    const controller = new AbortController;
    const response = await this.fetchWithTimeout(url, req, timeout, controller).catch(castToError);
    if (response instanceof Error) {
      if (options2.signal?.aborted) {
        throw new APIUserAbortError;
      }
      if (retriesRemaining) {
        return this.retryRequest(options2, retriesRemaining);
      }
      if (response.name === "AbortError") {
        throw new APIConnectionTimeoutError;
      }
      throw new APIConnectionError({ cause: response });
    }
    const responseHeaders = createResponseHeaders(response.headers);
    if (!response.ok) {
      if (retriesRemaining && this.shouldRetry(response)) {
        return this.retryRequest(options2, retriesRemaining, responseHeaders);
      }
      const errText = await response.text().catch((e) => castToError(e).message);
      const errJSON = safeJSON(errText);
      const errMessage = errJSON ? undefined : errText;
      debug("response", response.status, url, responseHeaders, errMessage);
      const err = this.makeStatusError(response.status, errJSON, errMessage, responseHeaders);
      throw err;
    }
    return { response, options: options2, controller };
  }
  requestAPIList(Page, options2) {
    const request = this.makeRequest(options2, null);
    return new PagePromise(this, request, Page);
  }
  buildURL(path, query) {
    const url = isAbsoluteURL(path) ? new URL(path) : new URL(this.baseURL + (this.baseURL.endsWith("/") && path.startsWith("/") ? path.slice(1) : path));
    const defaultQuery = this.defaultQuery();
    if (!isEmptyObj(defaultQuery)) {
      query = { ...defaultQuery, ...query };
    }
    if (query) {
      url.search = this.stringifyQuery(query);
    }
    return url.toString();
  }
  stringifyQuery(query) {
    return Object.entries(query).filter(([_, value]) => typeof value !== "undefined").map(([key, value]) => {
      if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
        return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
      }
      if (value === null) {
        return `${encodeURIComponent(key)}=`;
      }
      throw new OpenAIError(`Cannot stringify type ${typeof value}; Expected string, number, boolean, or null. If you need to pass nested query parameters, you can manually encode them, e.g. { query: { 'foo[key1]': value1, 'foo[key2]': value2 } }, and please open a GitHub issue requesting better support for your use case.`);
    }).join("&");
  }
  async fetchWithTimeout(url, init, ms, controller) {
    const { signal, ...options2 } = init || {};
    if (signal)
      signal.addEventListener("abort", () => controller.abort());
    const timeout = setTimeout(() => controller.abort(), ms);
    return this.getRequestClient().fetch.call(undefined, url, { signal: controller.signal, ...options2 }).finally(() => {
      clearTimeout(timeout);
    });
  }
  getRequestClient() {
    return { fetch: this.fetch };
  }
  shouldRetry(response) {
    const shouldRetryHeader = response.headers.get("x-should-retry");
    if (shouldRetryHeader === "true")
      return true;
    if (shouldRetryHeader === "false")
      return false;
    if (response.status === 408)
      return true;
    if (response.status === 409)
      return true;
    if (response.status === 429)
      return true;
    if (response.status >= 500)
      return true;
    return false;
  }
  async retryRequest(options2, retriesRemaining, responseHeaders) {
    let timeoutMillis;
    const retryAfterHeader = responseHeaders?.["retry-after"];
    if (retryAfterHeader) {
      const timeoutSeconds = parseInt(retryAfterHeader);
      if (!Number.isNaN(timeoutSeconds)) {
        timeoutMillis = timeoutSeconds * 1000;
      } else {
        timeoutMillis = Date.parse(retryAfterHeader) - Date.now();
      }
    }
    if (!timeoutMillis || !Number.isInteger(timeoutMillis) || timeoutMillis <= 0 || timeoutMillis > 60 * 1000) {
      const maxRetries = options2.maxRetries ?? this.maxRetries;
      timeoutMillis = this.calculateDefaultRetryTimeoutMillis(retriesRemaining, maxRetries);
    }
    await sleep(timeoutMillis);
    return this.makeRequest(options2, retriesRemaining - 1);
  }
  calculateDefaultRetryTimeoutMillis(retriesRemaining, maxRetries) {
    const initialRetryDelay = 0.5;
    const maxRetryDelay = 8;
    const numRetries = maxRetries - retriesRemaining;
    const sleepSeconds = Math.min(initialRetryDelay * Math.pow(2, numRetries), maxRetryDelay);
    const jitter = 1 - Math.random() * 0.25;
    return sleepSeconds * jitter * 1000;
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${VERSION}`;
  }
}
class AbstractPage {
  constructor(client, response, body, options2) {
    _AbstractPage_client.set(this, undefined);
    __classPrivateFieldSet(this, _AbstractPage_client, client, "f");
    this.options = options2;
    this.response = response;
    this.body = body;
  }
  hasNextPage() {
    const items = this.getPaginatedItems();
    if (!items.length)
      return false;
    return this.nextPageInfo() != null;
  }
  async getNextPage() {
    const nextInfo = this.nextPageInfo();
    if (!nextInfo) {
      throw new OpenAIError("No next page expected; please check `.hasNextPage()` before calling `.getNextPage()`.");
    }
    const nextOptions = { ...this.options };
    if ("params" in nextInfo) {
      nextOptions.query = { ...nextOptions.query, ...nextInfo.params };
    } else if ("url" in nextInfo) {
      const params = [...Object.entries(nextOptions.query || {}), ...nextInfo.url.searchParams.entries()];
      for (const [key, value] of params) {
        nextInfo.url.searchParams.set(key, value);
      }
      nextOptions.query = undefined;
      nextOptions.path = nextInfo.url.toString();
    }
    return await __classPrivateFieldGet(this, _AbstractPage_client, "f").requestAPIList(this.constructor, nextOptions);
  }
  async* iterPages() {
    let page = this;
    yield page;
    while (page.hasNextPage()) {
      page = await page.getNextPage();
      yield page;
    }
  }
  async* [(_AbstractPage_client = new WeakMap, Symbol.asyncIterator)]() {
    for await (const page of this.iterPages()) {
      for (const item of page.getPaginatedItems()) {
        yield item;
      }
    }
  }
}

class PagePromise extends APIPromise {
  constructor(client, request, Page) {
    super(request, async (props) => new Page(client, props.response, await defaultParseResponse(props), props.options));
  }
  async* [Symbol.asyncIterator]() {
    const page = await this;
    for await (const item of page) {
      yield item;
    }
  }
}
var createResponseHeaders = (headers) => {
  return new Proxy(Object.fromEntries(headers.entries()), {
    get(target, name) {
      const key = name.toString();
      return target[key.toLowerCase()] || target[key];
    }
  });
};
var requestOptionsKeys = {
  method: true,
  path: true,
  query: true,
  body: true,
  headers: true,
  maxRetries: true,
  stream: true,
  timeout: true,
  httpAgent: true,
  signal: true,
  idempotencyKey: true
};
var isRequestOptions = (obj) => {
  return typeof obj === "object" && obj !== null && !isEmptyObj(obj) && Object.keys(obj).every((k) => hasOwn(requestOptionsKeys, k));
};
var getPlatformProperties = () => {
  if (typeof Deno !== "undefined" && Deno.build != null) {
    return {
      "X-Stainless-Lang": "js",
      "X-Stainless-Package-Version": VERSION,
      "X-Stainless-OS": normalizePlatform(Deno.build.os),
      "X-Stainless-Arch": normalizeArch(Deno.build.arch),
      "X-Stainless-Runtime": "deno",
      "X-Stainless-Runtime-Version": Deno.version
    };
  }
  if (typeof EdgeRuntime !== "undefined") {
    return {
      "X-Stainless-Lang": "js",
      "X-Stainless-Package-Version": VERSION,
      "X-Stainless-OS": "Unknown",
      "X-Stainless-Arch": `other:${EdgeRuntime}`,
      "X-Stainless-Runtime": "edge",
      "X-Stainless-Runtime-Version": process.version
    };
  }
  if (Object.prototype.toString.call(typeof process !== "undefined" ? process : 0) === "[object process]") {
    return {
      "X-Stainless-Lang": "js",
      "X-Stainless-Package-Version": VERSION,
      "X-Stainless-OS": normalizePlatform(process.platform),
      "X-Stainless-Arch": normalizeArch(process.arch),
      "X-Stainless-Runtime": "node",
      "X-Stainless-Runtime-Version": process.version
    };
  }
  const browserInfo = getBrowserInfo();
  if (browserInfo) {
    return {
      "X-Stainless-Lang": "js",
      "X-Stainless-Package-Version": VERSION,
      "X-Stainless-OS": "Unknown",
      "X-Stainless-Arch": "unknown",
      "X-Stainless-Runtime": `browser:${browserInfo.browser}`,
      "X-Stainless-Runtime-Version": browserInfo.version
    };
  }
  return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": VERSION,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": "unknown",
    "X-Stainless-Runtime-Version": "unknown"
  };
};
var normalizeArch = (arch) => {
  if (arch === "x32")
    return "x32";
  if (arch === "x86_64" || arch === "x64")
    return "x64";
  if (arch === "arm")
    return "arm";
  if (arch === "aarch64" || arch === "arm64")
    return "arm64";
  if (arch)
    return `other:${arch}`;
  return "unknown";
};
var normalizePlatform = (platform) => {
  platform = platform.toLowerCase();
  if (platform.includes("ios"))
    return "iOS";
  if (platform === "android")
    return "Android";
  if (platform === "darwin")
    return "MacOS";
  if (platform === "win32")
    return "Windows";
  if (platform === "freebsd")
    return "FreeBSD";
  if (platform === "openbsd")
    return "OpenBSD";
  if (platform === "linux")
    return "Linux";
  if (platform)
    return `Other:${platform}`;
  return "Unknown";
};
var _platformHeaders;
var getPlatformHeaders = () => {
  return _platformHeaders ?? (_platformHeaders = getPlatformProperties());
};
var safeJSON = (text) => {
  try {
    return JSON.parse(text);
  } catch (err) {
    return;
  }
};
var startsWithSchemeRegexp = new RegExp("^(?:[a-z]+:)?//", "i");
var isAbsoluteURL = (url) => {
  return startsWithSchemeRegexp.test(url);
};
var sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
var validatePositiveInteger = (name, n) => {
  if (typeof n !== "number" || !Number.isInteger(n)) {
    throw new OpenAIError(`${name} must be an integer`);
  }
  if (n < 0) {
    throw new OpenAIError(`${name} must be a positive integer`);
  }
  return n;
};
var castToError = (err) => {
  if (err instanceof Error)
    return err;
  return new Error(err);
};
var readEnv = (env) => {
  if (typeof process !== "undefined") {
    return process.env?.[env] ?? undefined;
  }
  if (typeof Deno !== "undefined") {
    return Deno.env?.get?.(env);
  }
  return;
};
var uuid4 = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === "x" ? r : r & 3 | 8;
    return v.toString(16);
  });
};
var isRunningInBrowser = () => {
  return typeof window !== "undefined" && typeof window.document !== "undefined" && typeof navigator !== "undefined";
};

// node_modules/openai/pagination.mjs
class Page extends AbstractPage {
  constructor(client, response, body, options2) {
    super(client, response, body, options2);
    this.data = body.data;
    this.object = body.object;
  }
  getPaginatedItems() {
    return this.data;
  }
  nextPageParams() {
    return null;
  }
  nextPageInfo() {
    return null;
  }
}

class CursorPage extends AbstractPage {
  constructor(client, response, body, options2) {
    super(client, response, body, options2);
    this.data = body.data;
  }
  getPaginatedItems() {
    return this.data;
  }
  nextPageParams() {
    const info = this.nextPageInfo();
    if (!info)
      return null;
    if ("params" in info)
      return info.params;
    const params = Object.fromEntries(info.url.searchParams);
    if (!Object.keys(params).length)
      return null;
    return params;
  }
  nextPageInfo() {
    if (!this.data?.length) {
      return null;
    }
    const next = this.data[this.data.length - 1]?.id;
    if (!next)
      return null;
    return { params: { after: next } };
  }
}

// node_modules/openai/resource.mjs
class APIResource {
  constructor(client) {
    this.client = client;
    this.get = client.get.bind(client);
    this.post = client.post.bind(client);
    this.patch = client.patch.bind(client);
    this.put = client.put.bind(client);
    this.delete = client.delete.bind(client);
    this.getAPIList = client.getAPIList.bind(client);
  }
}

// node_modules/openai/resources/chat/completions.mjs
class Completions extends APIResource {
  create(body, options2) {
    return this.post("/chat/completions", { body, ...options2, stream: body.stream ?? false });
  }
}
(function(Completions2) {
})(Completions || (Completions = {}));

// node_modules/openai/resources/chat/chat.mjs
class Chat extends APIResource {
  constructor() {
    super(...arguments);
    this.completions = new Completions(this.client);
  }
}
(function(Chat2) {
  Chat2.Completions = Completions;
})(Chat || (Chat = {}));
// node_modules/openai/resources/audio/transcriptions.mjs
class Transcriptions extends APIResource {
  create(body, options2) {
    return this.post("/audio/transcriptions", multipartFormRequestOptions({ body, ...options2 }));
  }
}
(function(Transcriptions2) {
})(Transcriptions || (Transcriptions = {}));

// node_modules/openai/resources/audio/translations.mjs
class Translations extends APIResource {
  create(body, options2) {
    return this.post("/audio/translations", multipartFormRequestOptions({ body, ...options2 }));
  }
}
(function(Translations2) {
})(Translations || (Translations = {}));

// node_modules/openai/resources/audio/audio.mjs
class Audio extends APIResource {
  constructor() {
    super(...arguments);
    this.transcriptions = new Transcriptions(this.client);
    this.translations = new Translations(this.client);
  }
}
(function(Audio2) {
  Audio2.Transcriptions = Transcriptions;
  Audio2.Translations = Translations;
})(Audio || (Audio = {}));
// node_modules/openai/resources/completions.mjs
class Completions2 extends APIResource {
  create(body, options2) {
    return this.post("/completions", { body, ...options2, stream: body.stream ?? false });
  }
}
(function(Completions3) {
})(Completions2 || (Completions2 = {}));
// node_modules/openai/resources/embeddings.mjs
class Embeddings extends APIResource {
  create(body, options2) {
    return this.post("/embeddings", { body, ...options2 });
  }
}
(function(Embeddings2) {
})(Embeddings || (Embeddings = {}));
// node_modules/openai/resources/edits.mjs
class Edits extends APIResource {
  create(body, options2) {
    return this.post("/edits", { body, ...options2 });
  }
}
(function(Edits2) {
})(Edits || (Edits = {}));
// node_modules/openai/resources/files.mjs
class Files extends APIResource {
  create(body, options2) {
    return this.post("/files", multipartFormRequestOptions({ body, ...options2 }));
  }
  retrieve(fileId, options2) {
    return this.get(`/files/${fileId}`, options2);
  }
  list(options2) {
    return this.getAPIList("/files", FileObjectsPage, options2);
  }
  del(fileId, options2) {
    return this.delete(`/files/${fileId}`, options2);
  }
  retrieveContent(fileId, options2) {
    return this.get(`/files/${fileId}/content`, {
      ...options2,
      headers: { Accept: "application/json", ...options2?.headers }
    });
  }
  async waitForProcessing(id, { pollInterval = 5000, maxWait = 30 * 60 * 1000 } = {}) {
    const TERMINAL_STATES = new Set(["processed", "error", "deleted"]);
    const start = Date.now();
    let file = await this.retrieve(id);
    while (!file.status || !TERMINAL_STATES.has(file.status)) {
      await sleep(pollInterval);
      file = await this.retrieve(id);
      if (Date.now() - start > maxWait) {
        throw new APIConnectionTimeoutError({
          message: `Giving up on waiting for file ${id} to finish processing after ${maxWait} milliseconds.`
        });
      }
    }
    return file;
  }
}

class FileObjectsPage extends Page {
}
(function(Files2) {
  Files2.FileObjectsPage = FileObjectsPage;
})(Files || (Files = {}));
// node_modules/openai/resources/fine-tunes.mjs
class FineTunes extends APIResource {
  create(body, options2) {
    return this.post("/fine-tunes", { body, ...options2 });
  }
  retrieve(fineTuneId, options2) {
    return this.get(`/fine-tunes/${fineTuneId}`, options2);
  }
  list(options2) {
    return this.getAPIList("/fine-tunes", FineTunesPage, options2);
  }
  cancel(fineTuneId, options2) {
    return this.post(`/fine-tunes/${fineTuneId}/cancel`, options2);
  }
  listEvents(fineTuneId, query, options2) {
    return this.get(`/fine-tunes/${fineTuneId}/events`, {
      query,
      timeout: 86400000,
      ...options2,
      stream: query?.stream ?? false
    });
  }
}

class FineTunesPage extends Page {
}
(function(FineTunes2) {
  FineTunes2.FineTunesPage = FineTunesPage;
})(FineTunes || (FineTunes = {}));
// node_modules/openai/resources/fine-tuning/jobs.mjs
class Jobs extends APIResource {
  create(body, options2) {
    return this.post("/fine_tuning/jobs", { body, ...options2 });
  }
  retrieve(fineTuningJobId, options2) {
    return this.get(`/fine_tuning/jobs/${fineTuningJobId}`, options2);
  }
  list(query = {}, options2) {
    if (isRequestOptions(query)) {
      return this.list({}, query);
    }
    return this.getAPIList("/fine_tuning/jobs", FineTuningJobsPage, { query, ...options2 });
  }
  cancel(fineTuningJobId, options2) {
    return this.post(`/fine_tuning/jobs/${fineTuningJobId}/cancel`, options2);
  }
  listEvents(fineTuningJobId, query = {}, options2) {
    if (isRequestOptions(query)) {
      return this.listEvents(fineTuningJobId, {}, query);
    }
    return this.getAPIList(`/fine_tuning/jobs/${fineTuningJobId}/events`, FineTuningJobEventsPage, {
      query,
      ...options2
    });
  }
}

class FineTuningJobsPage extends CursorPage {
}

class FineTuningJobEventsPage extends CursorPage {
}
(function(Jobs2) {
  Jobs2.FineTuningJobsPage = FineTuningJobsPage;
  Jobs2.FineTuningJobEventsPage = FineTuningJobEventsPage;
})(Jobs || (Jobs = {}));

// node_modules/openai/resources/fine-tuning/fine-tuning.mjs
class FineTuning extends APIResource {
  constructor() {
    super(...arguments);
    this.jobs = new Jobs(this.client);
  }
}
(function(FineTuning2) {
  FineTuning2.Jobs = Jobs;
  FineTuning2.FineTuningJobsPage = FineTuningJobsPage;
  FineTuning2.FineTuningJobEventsPage = FineTuningJobEventsPage;
})(FineTuning || (FineTuning = {}));
// node_modules/openai/resources/images.mjs
class Images extends APIResource {
  createVariation(body, options2) {
    return this.post("/images/variations", multipartFormRequestOptions({ body, ...options2 }));
  }
  edit(body, options2) {
    return this.post("/images/edits", multipartFormRequestOptions({ body, ...options2 }));
  }
  generate(body, options2) {
    return this.post("/images/generations", { body, ...options2 });
  }
}
(function(Images2) {
})(Images || (Images = {}));
// node_modules/openai/resources/models.mjs
class Models extends APIResource {
  retrieve(model, options2) {
    return this.get(`/models/${model}`, options2);
  }
  list(options2) {
    return this.getAPIList("/models", ModelsPage, options2);
  }
  del(model, options2) {
    return this.delete(`/models/${model}`, options2);
  }
}

class ModelsPage extends Page {
}
(function(Models2) {
  Models2.ModelsPage = ModelsPage;
})(Models || (Models = {}));
// node_modules/openai/resources/moderations.mjs
class Moderations extends APIResource {
  create(body, options2) {
    return this.post("/moderations", { body, ...options2 });
  }
}
(function(Moderations2) {
})(Moderations || (Moderations = {}));
// node_modules/openai/index.mjs
var _a;

class OpenAI extends APIClient {
  constructor({ apiKey = readEnv("OPENAI_API_KEY"), organization = readEnv("OPENAI_ORG_ID") ?? null, ...opts } = {}) {
    if (apiKey === undefined) {
      throw new OpenAIError("The OPENAI_API_KEY environment variable is missing or empty; either provide it, or instantiate the OpenAI client with an apiKey option, like new OpenAI({ apiKey: 'My API Key' }).");
    }
    const options2 = {
      apiKey,
      organization,
      ...opts,
      baseURL: opts.baseURL ?? `https://api.openai.com/v1`
    };
    if (!options2.dangerouslyAllowBrowser && isRunningInBrowser()) {
      throw new OpenAIError("It looks like you're running in a browser-like environment.\n\nThis is disabled by default, as it risks exposing your secret API credentials to attackers.\nIf you understand the risks and have appropriate mitigations in place,\nyou can set the `dangerouslyAllowBrowser` option to `true`, e.g.,\n\nnew OpenAI({ apiKey, dangerouslyAllowBrowser: true });\n\nhttps://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety\n");
    }
    super({
      baseURL: options2.baseURL,
      timeout: options2.timeout ?? 600000,
      httpAgent: options2.httpAgent,
      maxRetries: options2.maxRetries,
      fetch: options2.fetch
    });
    this.completions = new Completions2(this);
    this.chat = new Chat(this);
    this.edits = new Edits(this);
    this.embeddings = new Embeddings(this);
    this.files = new Files(this);
    this.images = new Images(this);
    this.audio = new Audio(this);
    this.moderations = new Moderations(this);
    this.models = new Models(this);
    this.fineTuning = new FineTuning(this);
    this.fineTunes = new FineTunes(this);
    this._options = options2;
    this.apiKey = apiKey;
    this.organization = organization;
  }
  defaultQuery() {
    return this._options.defaultQuery;
  }
  defaultHeaders(opts) {
    return {
      ...super.defaultHeaders(opts),
      "OpenAI-Organization": this.organization,
      ...this._options.defaultHeaders
    };
  }
  authHeaders(opts) {
    return { Authorization: `Bearer ${this.apiKey}` };
  }
}
_a = OpenAI;
OpenAI.OpenAI = _a;
OpenAI.OpenAIError = OpenAIError;
OpenAI.APIError = APIError;
OpenAI.APIConnectionError = APIConnectionError;
OpenAI.APIConnectionTimeoutError = APIConnectionTimeoutError;
OpenAI.APIUserAbortError = APIUserAbortError;
OpenAI.NotFoundError = NotFoundError;
OpenAI.ConflictError = ConflictError;
OpenAI.RateLimitError = RateLimitError;
OpenAI.BadRequestError = BadRequestError;
OpenAI.AuthenticationError = AuthenticationError;
OpenAI.InternalServerError = InternalServerError;
OpenAI.PermissionDeniedError = PermissionDeniedError;
OpenAI.UnprocessableEntityError = UnprocessableEntityError;
(function(OpenAI2) {
  OpenAI2.toFile = toFile;
  OpenAI2.fileFromPath = fileFromPath;
  OpenAI2.Page = Page;
  OpenAI2.CursorPage = CursorPage;
  OpenAI2.Completions = Completions2;
  OpenAI2.Chat = Chat;
  OpenAI2.Edits = Edits;
  OpenAI2.Embeddings = Embeddings;
  OpenAI2.Files = Files;
  OpenAI2.FileObjectsPage = FileObjectsPage;
  OpenAI2.Images = Images;
  OpenAI2.Audio = Audio;
  OpenAI2.Moderations = Moderations;
  OpenAI2.Models = Models;
  OpenAI2.ModelsPage = ModelsPage;
  OpenAI2.FineTuning = FineTuning;
  OpenAI2.FineTunes = FineTunes;
  OpenAI2.FineTunesPage = FineTunesPage;
})(OpenAI || (OpenAI = {}));
var openai_default = OpenAI;

// src/api.ts
var openai = new openai_default({
  apiKey: process.env.OPEN_AI_API_TOKEN
});
var prompt = (command, error5) => `
  You're a programmer.
  You just encountered this ${error5} running this ${command}.
  Can you debug it to the best of your abilities?
  Be concise in your response. Return a command you think may fix it as a code snippet.
  If you can not, return "I can not debug this" as your response.
  If the command you return is a valid command and executable (does not need any additional information from the user) in shell return true in the json response as a boolean.
  Always return your response as json. In this fomat {"message": "<your response>", snippet: "<code snippet>", "commandExecutable": "<true or false>" }
  Omit anything but the json from your response.
`;
var openAiApi = {
  debug: async (command, error5) => {
    let chat2 = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt(command, error5) }]
    });
    return { response: chat2.choices[0].message.content };
  }
};

// node_modules/commander/esm.mjs
var import_ = __toESM(require_commander(), 1);
var {
  program,
  createCommand,
  createArgument,
  createOption,
  CommanderError,
  InvalidArgumentError,
  InvalidOptionArgumentError,
  Command,
  Argument,
  Option,
  Help
} = import_.default;

// src/index.ts
var isEmpty = __toESM(require_isEmpty(), 1);

// node_modules/chalk/source/vendor/ansi-styles/index.js
var assembleStyles = function() {
  const codes = new Map;
  for (const [groupName, group] of Object.entries(styles)) {
    for (const [styleName, style] of Object.entries(group)) {
      styles[styleName] = {
        open: `\x1B[${style[0]}m`,
        close: `\x1B[${style[1]}m`
      };
      group[styleName] = styles[styleName];
      codes.set(style[0], style[1]);
    }
    Object.defineProperty(styles, groupName, {
      value: group,
      enumerable: false
    });
  }
  Object.defineProperty(styles, "codes", {
    value: codes,
    enumerable: false
  });
  styles.color.close = "\x1B[39m";
  styles.bgColor.close = "\x1B[49m";
  styles.color.ansi = wrapAnsi16();
  styles.color.ansi256 = wrapAnsi256();
  styles.color.ansi16m = wrapAnsi16m();
  styles.bgColor.ansi = wrapAnsi16(ANSI_BACKGROUND_OFFSET);
  styles.bgColor.ansi256 = wrapAnsi256(ANSI_BACKGROUND_OFFSET);
  styles.bgColor.ansi16m = wrapAnsi16m(ANSI_BACKGROUND_OFFSET);
  Object.defineProperties(styles, {
    rgbToAnsi256: {
      value(red, green, blue) {
        if (red === green && green === blue) {
          if (red < 8) {
            return 16;
          }
          if (red > 248) {
            return 231;
          }
          return Math.round((red - 8) / 247 * 24) + 232;
        }
        return 16 + 36 * Math.round(red / 255 * 5) + 6 * Math.round(green / 255 * 5) + Math.round(blue / 255 * 5);
      },
      enumerable: false
    },
    hexToRgb: {
      value(hex) {
        const matches = /[a-f\d]{6}|[a-f\d]{3}/i.exec(hex.toString(16));
        if (!matches) {
          return [0, 0, 0];
        }
        let [colorString] = matches;
        if (colorString.length === 3) {
          colorString = [...colorString].map((character) => character + character).join("");
        }
        const integer = Number.parseInt(colorString, 16);
        return [
          integer >> 16 & 255,
          integer >> 8 & 255,
          integer & 255
        ];
      },
      enumerable: false
    },
    hexToAnsi256: {
      value: (hex) => styles.rgbToAnsi256(...styles.hexToRgb(hex)),
      enumerable: false
    },
    ansi256ToAnsi: {
      value(code) {
        if (code < 8) {
          return 30 + code;
        }
        if (code < 16) {
          return 90 + (code - 8);
        }
        let red;
        let green;
        let blue;
        if (code >= 232) {
          red = ((code - 232) * 10 + 8) / 255;
          green = red;
          blue = red;
        } else {
          code -= 16;
          const remainder = code % 36;
          red = Math.floor(code / 36) / 5;
          green = Math.floor(remainder / 6) / 5;
          blue = remainder % 6 / 5;
        }
        const value = Math.max(red, green, blue) * 2;
        if (value === 0) {
          return 30;
        }
        let result = 30 + (Math.round(blue) << 2 | Math.round(green) << 1 | Math.round(red));
        if (value === 2) {
          result += 60;
        }
        return result;
      },
      enumerable: false
    },
    rgbToAnsi: {
      value: (red, green, blue) => styles.ansi256ToAnsi(styles.rgbToAnsi256(red, green, blue)),
      enumerable: false
    },
    hexToAnsi: {
      value: (hex) => styles.ansi256ToAnsi(styles.hexToAnsi256(hex)),
      enumerable: false
    }
  });
  return styles;
};
var ANSI_BACKGROUND_OFFSET = 10;
var wrapAnsi16 = (offset = 0) => (code) => `\x1B[${code + offset}m`;
var wrapAnsi256 = (offset = 0) => (code) => `\x1B[${38 + offset};5;${code}m`;
var wrapAnsi16m = (offset = 0) => (red, green, blue) => `\x1B[${38 + offset};2;${red};${green};${blue}m`;
var styles = {
  modifier: {
    reset: [0, 0],
    bold: [1, 22],
    dim: [2, 22],
    italic: [3, 23],
    underline: [4, 24],
    overline: [53, 55],
    inverse: [7, 27],
    hidden: [8, 28],
    strikethrough: [9, 29]
  },
  color: {
    black: [30, 39],
    red: [31, 39],
    green: [32, 39],
    yellow: [33, 39],
    blue: [34, 39],
    magenta: [35, 39],
    cyan: [36, 39],
    white: [37, 39],
    blackBright: [90, 39],
    gray: [90, 39],
    grey: [90, 39],
    redBright: [91, 39],
    greenBright: [92, 39],
    yellowBright: [93, 39],
    blueBright: [94, 39],
    magentaBright: [95, 39],
    cyanBright: [96, 39],
    whiteBright: [97, 39]
  },
  bgColor: {
    bgBlack: [40, 49],
    bgRed: [41, 49],
    bgGreen: [42, 49],
    bgYellow: [43, 49],
    bgBlue: [44, 49],
    bgMagenta: [45, 49],
    bgCyan: [46, 49],
    bgWhite: [47, 49],
    bgBlackBright: [100, 49],
    bgGray: [100, 49],
    bgGrey: [100, 49],
    bgRedBright: [101, 49],
    bgGreenBright: [102, 49],
    bgYellowBright: [103, 49],
    bgBlueBright: [104, 49],
    bgMagentaBright: [105, 49],
    bgCyanBright: [106, 49],
    bgWhiteBright: [107, 49]
  }
};
var modifierNames = Object.keys(styles.modifier);
var foregroundColorNames = Object.keys(styles.color);
var backgroundColorNames = Object.keys(styles.bgColor);
var colorNames = [...foregroundColorNames, ...backgroundColorNames];
var ansiStyles = assembleStyles();
var ansi_styles_default = ansiStyles;

// node_modules/chalk/source/vendor/supports-color/browser.js
var level = (() => {
  if (navigator.userAgentData) {
    const brand = navigator.userAgentData.brands.find(({ brand: brand2 }) => brand2 === "Chromium");
    if (brand && brand.version > 93) {
      return 3;
    }
  }
  if (/\b(Chrome|Chromium)\//.test(navigator.userAgent)) {
    return 1;
  }
  return 0;
})();
var colorSupport = level !== 0 && {
  level,
  hasBasic: true,
  has256: level >= 2,
  has16m: level >= 3
};
var supportsColor = {
  stdout: colorSupport,
  stderr: colorSupport
};
var browser_default = supportsColor;

// node_modules/chalk/source/utilities.js
function stringReplaceAll(string, substring, replacer) {
  let index = string.indexOf(substring);
  if (index === -1) {
    return string;
  }
  const substringLength = substring.length;
  let endIndex = 0;
  let returnValue = "";
  do {
    returnValue += string.slice(endIndex, index) + substring + replacer;
    endIndex = index + substringLength;
    index = string.indexOf(substring, endIndex);
  } while (index !== -1);
  returnValue += string.slice(endIndex);
  return returnValue;
}
function stringEncaseCRLFWithFirstIndex(string, prefix, postfix, index) {
  let endIndex = 0;
  let returnValue = "";
  do {
    const gotCR = string[index - 1] === "\r";
    returnValue += string.slice(endIndex, gotCR ? index - 1 : index) + prefix + (gotCR ? "\r\n" : "\n") + postfix;
    endIndex = index + 1;
    index = string.indexOf("\n", endIndex);
  } while (index !== -1);
  returnValue += string.slice(endIndex);
  return returnValue;
}

// node_modules/chalk/source/index.js
var createChalk = function(options2) {
  return chalkFactory(options2);
};
var { stdout: stdoutColor, stderr: stderrColor } = browser_default;
var GENERATOR = Symbol("GENERATOR");
var STYLER = Symbol("STYLER");
var IS_EMPTY = Symbol("IS_EMPTY");
var levelMapping = [
  "ansi",
  "ansi",
  "ansi256",
  "ansi16m"
];
var styles2 = Object.create(null);
var applyOptions = (object, options2 = {}) => {
  if (options2.level && !(Number.isInteger(options2.level) && options2.level >= 0 && options2.level <= 3)) {
    throw new Error("The `level` option should be an integer from 0 to 3");
  }
  const colorLevel = stdoutColor ? stdoutColor.level : 0;
  object.level = options2.level === undefined ? colorLevel : options2.level;
};
var chalkFactory = (options2) => {
  const chalk = (...strings) => strings.join(" ");
  applyOptions(chalk, options2);
  Object.setPrototypeOf(chalk, createChalk.prototype);
  return chalk;
};
Object.setPrototypeOf(createChalk.prototype, Function.prototype);
for (const [styleName, style] of Object.entries(ansi_styles_default)) {
  styles2[styleName] = {
    get() {
      const builder = createBuilder(this, createStyler(style.open, style.close, this[STYLER]), this[IS_EMPTY]);
      Object.defineProperty(this, styleName, { value: builder });
      return builder;
    }
  };
}
styles2.visible = {
  get() {
    const builder = createBuilder(this, this[STYLER], true);
    Object.defineProperty(this, "visible", { value: builder });
    return builder;
  }
};
var getModelAnsi = (model, level2, type, ...arguments_) => {
  if (model === "rgb") {
    if (level2 === "ansi16m") {
      return ansi_styles_default[type].ansi16m(...arguments_);
    }
    if (level2 === "ansi256") {
      return ansi_styles_default[type].ansi256(ansi_styles_default.rgbToAnsi256(...arguments_));
    }
    return ansi_styles_default[type].ansi(ansi_styles_default.rgbToAnsi(...arguments_));
  }
  if (model === "hex") {
    return getModelAnsi("rgb", level2, type, ...ansi_styles_default.hexToRgb(...arguments_));
  }
  return ansi_styles_default[type][model](...arguments_);
};
var usedModels = ["rgb", "hex", "ansi256"];
for (const model of usedModels) {
  styles2[model] = {
    get() {
      const { level: level2 } = this;
      return function(...arguments_) {
        const styler = createStyler(getModelAnsi(model, levelMapping[level2], "color", ...arguments_), ansi_styles_default.color.close, this[STYLER]);
        return createBuilder(this, styler, this[IS_EMPTY]);
      };
    }
  };
  const bgModel = "bg" + model[0].toUpperCase() + model.slice(1);
  styles2[bgModel] = {
    get() {
      const { level: level2 } = this;
      return function(...arguments_) {
        const styler = createStyler(getModelAnsi(model, levelMapping[level2], "bgColor", ...arguments_), ansi_styles_default.bgColor.close, this[STYLER]);
        return createBuilder(this, styler, this[IS_EMPTY]);
      };
    }
  };
}
var proto = Object.defineProperties(() => {
}, {
  ...styles2,
  level: {
    enumerable: true,
    get() {
      return this[GENERATOR].level;
    },
    set(level2) {
      this[GENERATOR].level = level2;
    }
  }
});
var createStyler = (open, close, parent) => {
  let openAll;
  let closeAll;
  if (parent === undefined) {
    openAll = open;
    closeAll = close;
  } else {
    openAll = parent.openAll + open;
    closeAll = close + parent.closeAll;
  }
  return {
    open,
    close,
    openAll,
    closeAll,
    parent
  };
};
var createBuilder = (self2, _styler, _isEmpty) => {
  const builder = (...arguments_) => applyStyle(builder, arguments_.length === 1 ? "" + arguments_[0] : arguments_.join(" "));
  Object.setPrototypeOf(builder, proto);
  builder[GENERATOR] = self2;
  builder[STYLER] = _styler;
  builder[IS_EMPTY] = _isEmpty;
  return builder;
};
var applyStyle = (self2, string) => {
  if (self2.level <= 0 || !string) {
    return self2[IS_EMPTY] ? "" : string;
  }
  let styler = self2[STYLER];
  if (styler === undefined) {
    return string;
  }
  const { openAll, closeAll } = styler;
  if (string.includes("\x1B")) {
    while (styler !== undefined) {
      string = stringReplaceAll(string, styler.close, styler.open);
      styler = styler.parent;
    }
  }
  const lfIndex = string.indexOf("\n");
  if (lfIndex !== -1) {
    string = stringEncaseCRLFWithFirstIndex(string, closeAll, openAll, lfIndex);
  }
  return openAll + string + closeAll;
};
Object.defineProperties(createChalk.prototype, styles2);
var chalk = createChalk();
var chalkStderr = createChalk({ level: stderrColor ? stderrColor.level : 0 });
var source_default = chalk;

// node_modules/marked-terminal/index.js
var import_cli_table3 = __toESM(require_table(), 1);
var import_cardinal = __toESM(require_cardinal(), 1);

// node_modules/node-emoji/lib/index.js
var import_emojilib = __toESM(require_emojilib(), 1);
var import_char_regex = __toESM(require_char_regex(), 1);
var normalizeCode = function(code) {
  return code.replace(nonSpacingRegex, "");
};
var normalizeName = function(name) {
  return /:.+:/.test(name) ? name.slice(1, -1) : name;
};
var is = __toESM(require_dist(), 1);
var import_skin_tone = __toESM(require_skin_tone(), 1);
var charRegexMatcher = import_char_regex.default();
var NON_SPACING_MARK = String.fromCharCode(65039);
var nonSpacingRegex = new RegExp(NON_SPACING_MARK, "g");
var emojiData = Object.entries(import_emojilib.default.lib).map(([name, { char: emoji }]) => [name, emoji]);
var emojiCodesByName = new Map(emojiData);
var emojiNamesByCode = new Map(emojiData.map(([name, emoji]) => [normalizeCode(emoji), name]));
var get = (codeOrName) => {
  is.assert.string(codeOrName);
  return emojiCodesByName.get(normalizeName(codeOrName));
};

// node_modules/ansi-escapes/index.js
import process2 from "process";
var ESC = "\x1B[";
var OSC = "\x1B]";
var BEL = "\x07";
var SEP = ";";
var isBrowser = typeof window !== "undefined" && typeof window.document !== "undefined";
var isTerminalApp = !isBrowser && process2.env.TERM_PROGRAM === "Apple_Terminal";
var isWindows = !isBrowser && process2.platform === "win32";
var cwdFunction = isBrowser ? () => {
  throw new Error("`process.cwd()` only works in Node.js, not the browser.");
} : process2.cwd;
var ansiEscapes = {};
ansiEscapes.cursorTo = (x, y) => {
  if (typeof x !== "number") {
    throw new TypeError("The `x` argument is required");
  }
  if (typeof y !== "number") {
    return ESC + (x + 1) + "G";
  }
  return ESC + (y + 1) + SEP + (x + 1) + "H";
};
ansiEscapes.cursorMove = (x, y) => {
  if (typeof x !== "number") {
    throw new TypeError("The `x` argument is required");
  }
  let returnValue = "";
  if (x < 0) {
    returnValue += ESC + -x + "D";
  } else if (x > 0) {
    returnValue += ESC + x + "C";
  }
  if (y < 0) {
    returnValue += ESC + -y + "A";
  } else if (y > 0) {
    returnValue += ESC + y + "B";
  }
  return returnValue;
};
ansiEscapes.cursorUp = (count = 1) => ESC + count + "A";
ansiEscapes.cursorDown = (count = 1) => ESC + count + "B";
ansiEscapes.cursorForward = (count = 1) => ESC + count + "C";
ansiEscapes.cursorBackward = (count = 1) => ESC + count + "D";
ansiEscapes.cursorLeft = ESC + "G";
ansiEscapes.cursorSavePosition = isTerminalApp ? "\x1B7" : ESC + "s";
ansiEscapes.cursorRestorePosition = isTerminalApp ? "\x1B8" : ESC + "u";
ansiEscapes.cursorGetPosition = ESC + "6n";
ansiEscapes.cursorNextLine = ESC + "E";
ansiEscapes.cursorPrevLine = ESC + "F";
ansiEscapes.cursorHide = ESC + "?25l";
ansiEscapes.cursorShow = ESC + "?25h";
ansiEscapes.eraseLines = (count) => {
  let clear = "";
  for (let i = 0;i < count; i++) {
    clear += ansiEscapes.eraseLine + (i < count - 1 ? ansiEscapes.cursorUp() : "");
  }
  if (count) {
    clear += ansiEscapes.cursorLeft;
  }
  return clear;
};
ansiEscapes.eraseEndLine = ESC + "K";
ansiEscapes.eraseStartLine = ESC + "1K";
ansiEscapes.eraseLine = ESC + "2K";
ansiEscapes.eraseDown = ESC + "J";
ansiEscapes.eraseUp = ESC + "1J";
ansiEscapes.eraseScreen = ESC + "2J";
ansiEscapes.scrollUp = ESC + "S";
ansiEscapes.scrollDown = ESC + "T";
ansiEscapes.clearScreen = "\x1Bc";
ansiEscapes.clearTerminal = isWindows ? `${ansiEscapes.eraseScreen}${ESC}0f` : `${ansiEscapes.eraseScreen}${ESC}3J${ESC}H`;
ansiEscapes.enterAlternativeScreen = ESC + "?1049h";
ansiEscapes.exitAlternativeScreen = ESC + "?1049l";
ansiEscapes.beep = BEL;
ansiEscapes.link = (text, url) => [
  OSC,
  "8",
  SEP,
  SEP,
  url,
  BEL,
  text,
  OSC,
  "8",
  SEP,
  SEP,
  BEL
].join("");
ansiEscapes.image = (buffer, options2 = {}) => {
  let returnValue = `${OSC}1337;File=inline=1`;
  if (options2.width) {
    returnValue += `;width=${options2.width}`;
  }
  if (options2.height) {
    returnValue += `;height=${options2.height}`;
  }
  if (options2.preserveAspectRatio === false) {
    returnValue += ";preserveAspectRatio=0";
  }
  return returnValue + ":" + buffer.toString("base64") + BEL;
};
ansiEscapes.iTerm = {
  setCwd: (cwd = cwdFunction()) => `${OSC}50;CurrentDir=${cwd}${BEL}`,
  annotation(message, options2 = {}) {
    let returnValue = `${OSC}1337;`;
    const hasX = typeof options2.x !== "undefined";
    const hasY = typeof options2.y !== "undefined";
    if ((hasX || hasY) && !(hasX && hasY && typeof options2.length !== "undefined")) {
      throw new Error("`x`, `y` and `length` must be defined when `x` or `y` is defined");
    }
    message = message.replace(/\|/g, "");
    returnValue += options2.isHidden ? "AddHiddenAnnotation=" : "AddAnnotation=";
    if (options2.length > 0) {
      returnValue += (hasX ? [message, options2.length, options2.x, options2.y] : [options2.length, message]).join("|");
    } else {
      returnValue += message;
    }
    return returnValue + BEL;
  }
};
var ansi_escapes_default = ansiEscapes;

// node_modules/marked-terminal/index.js
var import_supports_hyperlinks = __toESM(require_browser(), 1);
var Renderer = function(options2, highlightOptions) {
  this.o = Object.assign({}, defaultOptions, options2);
  this.tab = sanitizeTab(this.o.tab, defaultOptions.tab);
  this.tableSettings = this.o.tableOptions;
  this.emoji = this.o.emoji ? insertEmojis : identity;
  this.unescape = this.o.unescape ? unescapeEntities : identity;
  this.highlightOptions = highlightOptions || {};
  this.transform = compose(undoColon, this.unescape, this.emoji);
};
var textLength = function(str) {
  return str.replace(/\u001b\[(?:\d{1,3})(?:;\d{1,3})*m/g, "").length;
};
var fixHardReturn = function(text, reflow) {
  return reflow ? text.replace(HARD_RETURN, /\n/g) : text;
};
function markedTerminal(options2, highlightOptions) {
  const r = new Renderer(options2, highlightOptions);
  const funcs = [
    "text",
    "code",
    "blockquote",
    "html",
    "heading",
    "hr",
    "list",
    "listitem",
    "checkbox",
    "paragraph",
    "table",
    "tablerow",
    "tablecell",
    "strong",
    "em",
    "codespan",
    "br",
    "del",
    "link",
    "image"
  ];
  return funcs.reduce((extension, func) => {
    extension.renderer[func] = function(...args) {
      r.options = this.options;
      return r[func](...args);
    };
    return extension;
  }, { renderer: {} });
}
var reflowText = function(text, width, gfm) {
  var splitRe = gfm ? HARD_RETURN_GFM_RE : HARD_RETURN_RE, sections = text.split(splitRe), reflowed = [];
  sections.forEach(function(section) {
    var fragments = section.split(/(\u001b\[(?:\d{1,3})(?:;\d{1,3})*m)/g);
    var column = 0;
    var currentLine = "";
    var lastWasEscapeChar = false;
    while (fragments.length) {
      var fragment = fragments[0];
      if (fragment === "") {
        fragments.splice(0, 1);
        lastWasEscapeChar = false;
        continue;
      }
      if (!textLength(fragment)) {
        currentLine += fragment;
        fragments.splice(0, 1);
        lastWasEscapeChar = true;
        continue;
      }
      var words = fragment.split(/[ \t\n]+/);
      for (var i = 0;i < words.length; i++) {
        var word = words[i];
        var addSpace = column != 0;
        if (lastWasEscapeChar)
          addSpace = false;
        if (column + word.length + addSpace > width) {
          if (word.length <= width) {
            reflowed.push(currentLine);
            currentLine = word;
            column = word.length;
          } else {
            var w = word.substr(0, width - column - addSpace);
            if (addSpace)
              currentLine += " ";
            currentLine += w;
            reflowed.push(currentLine);
            currentLine = "";
            column = 0;
            word = word.substr(w.length);
            while (word.length) {
              var w = word.substr(0, width);
              if (!w.length)
                break;
              if (w.length < width) {
                currentLine = w;
                column = w.length;
                break;
              } else {
                reflowed.push(w);
                word = word.substr(width);
              }
            }
          }
        } else {
          if (addSpace) {
            currentLine += " ";
            column++;
          }
          currentLine += word;
          column += word.length;
        }
        lastWasEscapeChar = false;
      }
      fragments.splice(0, 1);
    }
    if (textLength(currentLine))
      reflowed.push(currentLine);
  });
  return reflowed.join("\n");
};
var indentLines = function(indent, text) {
  return text.replace(/(^|\n)(.+)/g, "$1" + indent + "$2");
};
var indentify = function(indent, text) {
  if (!text)
    return text;
  return indent + text.split("\n").join("\n" + indent);
};
var fixNestedLists = function(body, indent) {
  var regex = new RegExp("(\\S(?: |  )?)((?:" + indent + ")+)(" + POINT_REGEX + "(?:.*)+)$", "gm");
  return body.replace(regex, "$1\n" + indent + "$2$3");
};
var toSpaces = function(str) {
  return " ".repeat(str.length);
};
var bulletPointLine = function(indent, line) {
  return isPointedLine(line, indent) ? line : toSpaces(BULLET_POINT) + line;
};
var bulletPointLines = function(lines, indent) {
  var transform = bulletPointLine.bind(null, indent);
  return lines.split("\n").filter(identity).map(transform).join("\n");
};
var numberedLine = function(indent, line, num) {
  return isPointedLine(line, indent) ? {
    num: num + 1,
    line: line.replace(BULLET_POINT, numberedPoint(num + 1))
  } : {
    num,
    line: toSpaces(numberedPoint(num)) + line
  };
};
var numberedLines = function(lines, indent) {
  var transform = numberedLine.bind(null, indent);
  let num = 0;
  return lines.split("\n").filter(identity).map((line) => {
    const numbered = transform(line, num);
    num = numbered.num;
    return numbered.line;
  }).join("\n");
};
var list = function(body, ordered, indent) {
  body = body.trim();
  body = ordered ? numberedLines(body, indent) : bulletPointLines(body, indent);
  return body;
};
var section = function(text) {
  return text + "\n\n";
};
var highlight = function(code, lang, opts, hightlightOpts) {
  if (source_default.level === 0)
    return code;
  var style = opts.code;
  code = fixHardReturn(code, opts.reflowText);
  if (lang !== "javascript" && lang !== "js") {
    return style(code);
  }
  try {
    return import_cardinal.default.highlight(code, hightlightOpts);
  } catch (e) {
    return style(code);
  }
};
var insertEmojis = function(text) {
  return text.replace(/:([A-Za-z0-9_\-\+]+?):/g, function(emojiString) {
    var emojiSign = get(emojiString);
    if (!emojiSign)
      return emojiString;
    return emojiSign + " ";
  });
};
var hr = function(inputHrStr, length) {
  length = length || process.stdout.columns;
  return new Array(length).join(inputHrStr);
};
var undoColon = function(str) {
  return str.replace(COLON_REPLACER_REGEXP, ":");
};
var generateTableRow = function(text, escape2) {
  if (!text)
    return [];
  escape2 = escape2 || identity;
  var lines = escape2(text).split("\n");
  var data = [];
  lines.forEach(function(line) {
    if (!line)
      return;
    var parsed = line.replace(TABLE_ROW_WRAP_REGEXP, "").split(TABLE_CELL_SPLIT);
    data.push(parsed.splice(0, parsed.length - 1));
  });
  return data;
};
var escapeRegExp = function(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
};
var unescapeEntities = function(html) {
  return html.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
};
var identity = function(str) {
  return str;
};
var compose = function() {
  var funcs = arguments;
  return function() {
    var args = arguments;
    for (var i = funcs.length;i-- > 0; ) {
      args = [funcs[i].apply(this, args)];
    }
    return args[0];
  };
};
var isAllowedTabString = function(string) {
  return TAB_ALLOWED_CHARACTERS.some(function(char) {
    return string.match("^(" + char + ")+$");
  });
};
var sanitizeTab = function(tab, fallbackTab) {
  if (typeof tab === "number") {
    return new Array(tab + 1).join(" ");
  } else if (typeof tab === "string" && isAllowedTabString(tab)) {
    return tab;
  } else {
    return new Array(fallbackTab + 1).join(" ");
  }
};
var TABLE_CELL_SPLIT = "^*||*^";
var TABLE_ROW_WRAP = "*|*|*|*";
var TABLE_ROW_WRAP_REGEXP = new RegExp(escapeRegExp(TABLE_ROW_WRAP), "g");
var COLON_REPLACER = "*#COLON|*";
var COLON_REPLACER_REGEXP = new RegExp(escapeRegExp(COLON_REPLACER), "g");
var TAB_ALLOWED_CHARACTERS = ["\t"];
var HARD_RETURN = "\r";
var HARD_RETURN_RE = new RegExp(HARD_RETURN);
var HARD_RETURN_GFM_RE = new RegExp(HARD_RETURN + "|<br />");
var defaultOptions = {
  code: source_default.yellow,
  blockquote: source_default.gray.italic,
  html: source_default.gray,
  heading: source_default.green.bold,
  firstHeading: source_default.magenta.underline.bold,
  hr: source_default.reset,
  listitem: source_default.reset,
  list,
  table: source_default.reset,
  paragraph: source_default.reset,
  strong: source_default.bold,
  em: source_default.italic,
  codespan: source_default.yellow,
  del: source_default.dim.gray.strikethrough,
  link: source_default.blue,
  href: source_default.blue.underline,
  text: identity,
  unescape: true,
  emoji: true,
  width: 80,
  showSectionPrefix: true,
  reflowText: false,
  tab: 4,
  tableOptions: {}
};
Renderer.prototype.textLength = textLength;
Renderer.prototype.text = function(text) {
  return this.o.text(text);
};
Renderer.prototype.code = function(code, lang, escaped) {
  return section(indentify(this.tab, highlight(code, lang, this.o, this.highlightOptions)));
};
Renderer.prototype.blockquote = function(quote) {
  return section(this.o.blockquote(indentify(this.tab, quote.trim())));
};
Renderer.prototype.html = function(html) {
  return this.o.html(html);
};
Renderer.prototype.heading = function(text, level2, raw) {
  text = this.transform(text);
  var prefix = this.o.showSectionPrefix ? new Array(level2 + 1).join("#") + " " : "";
  text = prefix + text;
  if (this.o.reflowText) {
    text = reflowText(text, this.o.width, this.options.gfm);
  }
  return section(level2 === 1 ? this.o.firstHeading(text) : this.o.heading(text));
};
Renderer.prototype.hr = function() {
  return section(this.o.hr(hr("-", this.o.reflowText && this.o.width)));
};
Renderer.prototype.list = function(body, ordered) {
  body = this.o.list(body, ordered, this.tab);
  return section(fixNestedLists(indentLines(this.tab, body), this.tab));
};
Renderer.prototype.listitem = function(text) {
  var transform = compose(this.o.listitem, this.transform);
  var isNested = text.indexOf("\n") !== -1;
  if (isNested)
    text = text.trim();
  return "\n" + BULLET_POINT + transform(text);
};
Renderer.prototype.checkbox = function(checked) {
  return "[" + (checked ? "X" : " ") + "] ";
};
Renderer.prototype.paragraph = function(text) {
  var transform = compose(this.o.paragraph, this.transform);
  text = transform(text);
  if (this.o.reflowText) {
    text = reflowText(text, this.o.width, this.options.gfm);
  }
  return section(text);
};
Renderer.prototype.table = function(header, body) {
  var table = new import_cli_table3.default(Object.assign({}, {
    head: generateTableRow(header)[0]
  }, this.tableSettings));
  generateTableRow(body, this.transform).forEach(function(row) {
    table.push(row);
  });
  return section(this.o.table(table.toString()));
};
Renderer.prototype.tablerow = function(content) {
  return TABLE_ROW_WRAP + content + TABLE_ROW_WRAP + "\n";
};
Renderer.prototype.tablecell = function(content, flags) {
  return content + TABLE_CELL_SPLIT;
};
Renderer.prototype.strong = function(text) {
  return this.o.strong(text);
};
Renderer.prototype.em = function(text) {
  text = fixHardReturn(text, this.o.reflowText);
  return this.o.em(text);
};
Renderer.prototype.codespan = function(text) {
  text = fixHardReturn(text, this.o.reflowText);
  return this.o.codespan(text.replace(/:/g, COLON_REPLACER));
};
Renderer.prototype.br = function() {
  return this.o.reflowText ? HARD_RETURN : "\n";
};
Renderer.prototype.del = function(text) {
  return this.o.del(text);
};
Renderer.prototype.link = function(href, title, text) {
  if (this.options.sanitize) {
    try {
      var prot = decodeURIComponent(unescape(href)).replace(/[^\w:]/g, "").toLowerCase();
    } catch (e) {
      return "";
    }
    if (prot.indexOf("javascript:") === 0) {
      return "";
    }
  }
  var hasText = text && text !== href;
  var out = "";
  if (import_supports_hyperlinks.default.stdout) {
    let link = "";
    if (text) {
      link = this.o.href(this.emoji(text));
    } else {
      link = this.o.href(href);
    }
    out = ansi_escapes_default.link(link, href);
  } else {
    if (hasText)
      out += this.emoji(text) + " (";
    out += this.o.href(href);
    if (hasText)
      out += ")";
  }
  return this.o.link(out);
};
Renderer.prototype.image = function(href, title, text) {
  if (typeof this.o.image === "function") {
    return this.o.image(href, title, text);
  }
  var out = "![" + text;
  if (title)
    out += " \u2013 " + title;
  return out + "](" + href + ")\n";
};
var BULLET_POINT_REGEX = "\\*";
var NUMBERED_POINT_REGEX = "\\d+\\.";
var POINT_REGEX = "(?:" + [BULLET_POINT_REGEX, NUMBERED_POINT_REGEX].join("|") + ")";
var isPointedLine = function(line, indent) {
  return line.match("^(?:" + indent + ")*" + POINT_REGEX);
};
var BULLET_POINT = "* ";
var numberedPoint = function(n) {
  return n + ". ";
};

// src/index.ts
marked.use(markedTerminal());
program.option("--debug");
program.parse();
var options2 = program.opts();
var chat2;
var answer;
var executable;
import_node_cmd.default.runSync("chmod +x ./index.js");
var commandResult = import_node_cmd.default.runSync("cat ~/.zsh_history | tail -n 2 | head -n 1 | cut -d ';' -f 2");
var command = commandResult?.data?.trim() ?? "";
var lastCommdQuestion = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
lastCommdQuestion.question(marked.parse(`The last command was: **${command}**. \n\n ## Are you sure that is the one you want to debug? (Y/n)`), async (debug2) => {
  lastCommdQuestion.close();
  if (debug2 !== "Y") {
    console.log(marked.parse(`# Exiting debugger..`));
  }
  if (debug2 == "Y") {
    console.log(marked.parse(`Debugging **${command}**`));
    commandResult = import_node_cmd.default.runSync(`${command}`);
    if (commandResult.stderr || commandResult.err) {
      chat2 = await openAiApi.debug(command, commandResult.stderr);
      answer = JSON.parse(chat2.response);
      executable = answer.commandExecutable;
      console.log(marked.parse(`# Debugger's response: \n\n ${answer.message}`));
      console.log(marked.parse(`# Code snippet: \n\n ${answer.snippet}`));
    }
    if (isEmpty.default(commandResult) || isEmpty.default(commandResult.stderr) && isEmpty.default(commandResult.err)) {
      console.log(`Did not encounter an error running ${command}. This is the output\n\n`, commandResult.data);
    }
  }
  if (executable == true || executable == "true") {
    const executeQuestion = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    executeQuestion.question(marked.parse(`Debugger marked **${answer.snippet}** as executable. Do you want to run it? (Y/n)`), async (commandAnswer) => {
      executeQuestion.close();
      if (commandAnswer == "Y") {
        commandResult = import_node_cmd.default.runSync(`${answer.snippet}`);
        console.log(marked.parse(`# Running command: \n\n ${answer.snippet}`));
        if (commandResult.stderr || commandResult.err) {
          console.log(marked.parse(`# Encounterd error when running command: \n\n ${commandResult.stderr}`));
        }
        if (isEmpty.default(commandResult) || isEmpty.default(commandResult.stderr) && isEmpty.default(commandResult.err)) {
          console.log(marked.parse(`# Command output: \n\n ${commandResult.data}`));
        }
        if (commandResult.data) {
          console.log(marked.parse(`# Command output: \n\n ${commandResult.data}`));
        }
      }
    });
  }
});
