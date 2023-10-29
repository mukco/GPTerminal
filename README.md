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


## Run gpterm
```bash
➜  ~ gpterm
The last command was: npm run foo.

## Are you sure that is the one you want to debug? (Y/n)

Y
Debugging npm run foo


# Debugger's response:

 This error typically occurs when there is no package.json file in your current directory. Please ensure that a package.json file exists in your project directory and you're located in the project root directory when running commands. If no package.json exists in your project you can create one with the npm init command.


# Code snippet:

 npm init -y


Debugger marked npm init -y as executable. Do you want to run it? (Y/n)

n
```
