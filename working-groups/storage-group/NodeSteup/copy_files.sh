#!/bin/bash
# Copy files in 10 concurrent transfer
# Needed variables below

SERVER="server.name"
USERNAME="username"
PASSWORD="password"
DIR="/target/to/copy/to/directory"
FILEDIR="/local/files/directory"

# Create work Directory 
mkdir WORKDIR
cd WORKDIR

# install needed software
apt install sshpass rsync -y

#Create 10 files with list of files to be transfered
find $FILEDIR -maxdepth 1  -type f  > my_files.txt 
split my_files.txt -n l/10 split_

#Transfer files
for file in split_*; do sshpass -p $PASSWORD rsync -avz -e "ssh -o StrictHostKeyChecking=no" --files-from=$file / $USERNAME@$SERVER:$DIR & done; wait
