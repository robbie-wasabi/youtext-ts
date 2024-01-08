#!/bin/bash

# Prompt the user for input text
read -p "Enter your text: " text

# URL encode the text
encoded_text=$(jq -nr --arg url "$text" '$url|@uri')

echo $encoded_text