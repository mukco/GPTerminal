# GPTerminal
Faster debugging with ChatGPT.

## Install Bun
```bash
curl -fsSL https://bun.sh/install | bash
```

## Add OpenAI API Key
```bash
export OPEN_AI_API_TOKEN=your_token
```

## Run failed command
```bash
➜  ~ npm run foo

# Error
pm ERR!  code ENOENT
npm ERR! syscall open
npm ERR! path /Users/foo/package.json
npm ERR! errno -2
npm ERR! enoent ENOENT: no such file or directory, open '/Users/foo/package.json'
npm ERR! enoent This is related to npm not being able to find a file.
npm ERR! enoent

npm ERR! A complete log of this run can be found in:
npm ERR! /Users/foo/.npm/_logs/2023-10-29T20_27_47_598Z-debug-0.log
```


## Run gpterm and choose command to debug
```bash
➜  ~ gpterm
? Please choose a command to debug: (Use arrow keys)
❯ gpterm
  clear
  gpterm
  npm run foo
  gpterm
  Exit
```
## gpterm debugs command
```bash
Debugging npm run foo


# Debugger's response:

 It seems like the package.json file is missing which is required for npm to run. Please ensure it is present in the correct directory and try again.


# Code snippet:

 touch package.json


Debugger marked touch package.json as executable. Do you want to run it? (Y/n)

n
```
