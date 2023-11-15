#!/bin/bash
# Copy files in 10 concurrent transfer
# Needed variables below

NUM_PROCESSORS=10
SERVER="server.name"
USERNAME="username"
PASSWORD="password"
TARGET_DIR="/target/to/copy/to/directory"
FILEDIR="/local/files/directory"
WORKDIR="WORKDIR"

# Create work Directory 
mkdir -p $WORKDIR
cd $WORKDIR

# install needed software
apt install sshpass rsync -y
#apt install sshpass rsync pv tmux -y

rm split_
#Create 10 files with list of files to be transfered
find $FILEDIR -maxdepth 1  -type f  > files_list.txt 
split files_list.txt -n l/$NUM_PROCESSORS split_

#Transfer files
for file in split_*; do sshpass -p $PASSWORD rsync -avz -e "ssh -o StrictHostKeyChecking=no" --files-from=$file / $USERNAME@$SERVER:$DIR & done; wait
#for file in split_*; do tmux new-session -d -s $file 'sshpass -p $PASSWORD rsync -avz -e "ssh -o StrictHostKeyChecking=no" --files-from=$file / $USERNAME@$SERVER:$TARGET_DIR | pv -lep -s $(wc -l $FILEDIR | cut -d " " -f1) ' done; wait

rm split_
