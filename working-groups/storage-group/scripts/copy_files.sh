#!/bin/bash

NUM_PROCESSORS=10
SERVER="<SERVER_IP>"
USERNAME="<USERNAME>"
PASSWORD="<PASSWORD>"
TARGET_DIR="<DIRECTORY_PATH_IN_THE_NEW_SERVER>"
FILEDIR="<ASSETS_PATH_IN_THE_OLD_SERVER>"
WORKDIR="WORKDIR"
LOGFILE="copied_files.log"

# Install needed software if not already installed (Uncomment as needed)
# apt-get update && apt-get install sshpass rsync pv tmux -y
if [ ! -d $WORKDIR ]; then
    mkdir -p $WORKDIR
fi
cd $WORKDIR

# Remove any split_ prefix files if they exist to avoid confusion
rm split_* 2>/dev/null

# Generate a list of files to be transferred, excluding those already copied
find $FILEDIR -maxdepth 1 -type f | grep -vFf $LOGFILE >files_list.txt

# If there are no files to copy, exit
if [ ! -s files_list.txt ]; then
    echo "All files have already been copied."
    exit 0
fi

# Split the list for parallel processing
split files_list.txt -n l/$NUM_PROCESSORS split_

#####################

# Setup a trap to catch SIGINT (Ctrl+C) and exit gracefully
trap "echo 'Script interrupted by user. Exiting...'; exit" SIGINT

# Transfer files
for file in split_*; do
    while IFS= read -r line; do
        sshpass -p $PASSWORD rsync -avz -e "ssh -o StrictHostKeyChecking=no" "$line" $USERNAME@$SERVER:"$TARGET_DIR" >/dev/null 2>&1 && echo "$line" >>$LOGFILE && echo "$line"
    done <"$file" &
    #sshpass -p $PASSWORD rsync -avz -e "ssh -o StrictHostKeyChecking=no" --files-from=$file / $USERNAME@$SERVER:$DIR >/dev/null 2>&1 && echo "$line" >>$LOGFILE && echo "$line" &
done

#####################

wait

echo "All files have been copied."

# Cleanup split files after transfer
rm split_*
