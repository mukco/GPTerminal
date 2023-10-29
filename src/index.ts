#!/usr/bin/env bun

import cmd from 'node-cmd'
import readline from 'readline'
import { marked } from 'marked'
import inquirer from 'inquirer'
import { openAiApi } from './api'
import isEmpty from 'lodash/isEmpty'
import compact from 'lodash/compact'
import { program } from 'commander'
import { markedTerminal } from 'marked-terminal'


marked.use(markedTerminal())

program.option('--debug')
program.parse()

// Future use
const options = program.opts()

let chat
let answer
let executable

cmd.runSync("chmod +x ./index.js")

let commandResult = cmd.runSync("cat ~/.zsh_history | tail -n 5 | head -n 5 | cut -d ';' -f 2")
const commands = commandResult?.data?.split("\n") ?? ""

async function promptUser(commands) {
  const questions = [
    {
      type: 'list',
      name: 'userChoice',
      message: 'Please choose a command to debug:',
      choices: compact([ ...commands, 'Exit']),
    }
  ]

  const answers = await inquirer.prompt(questions);
  const selectedOption = answers.userChoice

  if (commands.includes(selectedOption)) {
    console.log(marked.parse(`Debugging **${selectedOption}**`))
    commandResult = cmd.runSync(`${selectedOption}`)

    if (commandResult.stderr || commandResult.err) {
      chat = await openAiApi.debug(selectedOption, commandResult.stderr)
      answer = JSON.parse(chat.response)
      executable = answer.commandExecutable

      console.log(marked.parse(`# Debugger's response: \n\n ${answer.message}`))
      console.log(marked.parse(`# Code snippet: \n\n ${answer.snippet}`))
    }

    if (isEmpty(commandResult) || (isEmpty(commandResult.stderr) && isEmpty(commandResult.err))) {
      console.log(`Did not encounter an error running ${selectedOption}. This is the output\n\n`, commandResult.data)
    }
  }

  if (executable == true || executable == "true") {
    const executeQuestion = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    executeQuestion.question(marked.parse(`Debugger marked **${answer.snippet}** as executable. Do you want to run it? (Y/n)`), async (commandAnswer) => {
      executeQuestion.close()

      if (commandAnswer == "Y") {
        commandResult = cmd.runSync(`${answer.snippet}`)

        console.log(marked.parse(`# Running command: \n\n ${answer.snippet}`))

        if (commandResult.stderr || commandResult.err) {
          console.log(marked.parse(`# Encounterd error when running command: \n\n ${commandResult.stderr}`))
        }

        if (isEmpty(commandResult) || (isEmpty(commandResult.stderr) && isEmpty(commandResult.err))) {
          console.log(marked.parse(`# Command output: \n\n ${commandResult.data}`))
        }

        if (commandResult.data) {
          console.log(marked.parse(`# Command output: \n\n ${commandResult.data}`))
        }
      }
    })
  }

  if (selectedOption === 'Exit') {
    console.log(marked.parse(`# Exiting debugger..`))
    return
  }
}

await promptUser(commands)
