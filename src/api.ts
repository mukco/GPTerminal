import OpenAi from "openai"

const openai = new OpenAi({
  apiKey: process.env.OPEN_AI_API_TOKEN
})

const prompt = (command, error) => `
  You're a programmer.
  You just encounter this ${error} running this ${command}.
  Can you debug it to the best of your abilities?
  Be concise in your response. Return a command you think may fix it as a code snippet.
  If you can not, return "I can not debug this" as your response.
  If the command you return is a valid command and executable (does not need any additional information from the user) in shell return true in the json response as a boolean.
  Always return your response as json. In this fomat {"message": "<your response>", snippet: "<code snippet>", "commandExecutable": "<true or false>" }
  Omit anything but the json from your response.
`

const openAiApi = {
  debug: async (command, error) => {
    let chat =  await openai.chat.completions.create({
      model: "gpt-4",
      messages:
      [{"role": "user", "content": prompt(command, error) }]
    })
    return { response: chat.choices[0].message.content }
  }
}

export { openAiApi }

