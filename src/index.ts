import cmd from 'node-cmd'
import { marked } from 'marked';
import  readline from 'readline'
import { openAiApi } from './api'
import { isEmpty } from 'lodash'
import { program } from 'commander'
import { markedTerminal } from 'marked-terminal'

marked.use(markedTerminal())

program.option('--debug')
program.parse()

const options = program.opts()

let chat
let answer
let executable
let commandResult

cmd.runSync("chmod 777./scripts/last_command.sh")
const command = cmd.runSync("sh ./scripts/last_command.sh").data.trim()

const lastCommdQuestion = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

lastCommdQuestion.question(marked.parse(`The last command was: **${command}**. \n\n ## Are you sure that is the one you want to debug? (Y/n)`), async (debug) => {
  lastCommdQuestion.close()

  if (debug !== "Y") {
    console.log(marked.parse(`# Exiting debugger..`))
  }

  if (debug == "Y") {
    console.log(marked.parse(`Debugging **${command}**`))
    commandResult = cmd.runSync(`${command}`)

    if (commandResult.stderr || commandResult.err) {
      chat = await openAiApi.debug(command, commandResult.stderr)
      answer = JSON.parse(chat.response)
      executable = answer.commandExecutable

      console.log(marked.parse(`# Debugger's response: \n\n ${answer.message}`))
      console.log(marked.parse(`# Code snippet: \n\n ${answer.snippet}`))
    }

    if (isEmpty(commandResult) || (isEmpty(commandResult.stderr) && isEmpty(commandResult.err))) {
      console.log(`Did not encounter an error running ${command}. This is the output\n\n`, commandResult.data)
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
})

