set dotenv-load

alias r := run
alias f := fmt

export EDITOR := 'vim'

default:
  just --list

run:
	yarn start

fmt:
	prettier --write .
