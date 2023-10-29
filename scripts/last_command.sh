#!/bin/bash

command=$(cat ~/.zsh_history | tail -n 2 | head -n 1 | cut -d ';' -f 2)
echo $command
