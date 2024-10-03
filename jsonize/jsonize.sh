#!/bin/bash


#author: COLLOMB LOAN
INPUT_START=$1
SIZE=$2

cd Imjson || exit
pwd
ls
python3 split.py

./Imjson output.txt "$SIZE"
mv out.json ../jsons || exit

rm -f output.txt
cd ../jsons || exit
mv out.json "$INPUT_START.json" || exit
