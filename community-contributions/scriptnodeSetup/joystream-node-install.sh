#!/bin/bash
# My public key 5EyRepuyZTM2rjHwbGfjBmjutaR5QTxLULcra2aToigtpxb6
# My node name wasabi

echo "****************************************************************************"
echo "*      This script will install and configure your Joystream node.         *"
echo "*      The script was created based on the official instructions:          *"
echo "*      https://github.com/Joystream/helpdesk/tree/master/roles/validators  *"
echo "****************************************************************************"

cd
wget -q https://github.com/Joystream/joystream/releases/download/v9.3.0/joystream-node-5.1.0-9d9e77751-x86_64-linux-gnu.tar.gz
tar -vxf joystream-node-5.1.0-9d9e77751-x86_64-linux-gnu.tar.gz
wget -q https://github.com/Joystream/joystream/releases/download/v9.3.0/joy-testnet-5.json

printf "Enter your node name and press [ENTER]: "
read NODENAME

echo "[Unit]
Description=Joystream Node
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$HOME
ExecStart=$HOME/joystream-node --chain joy-testnet-5.json --pruning archive --validator --name $NODENAME --log runtime,txpool,transaction-pool,trace=sync
Restart=on-failure
RestartSec=3
LimitNOFILE=10000

[Install]
WantedBy=multi-user.target" > joystream-node.service

sudo mv joystream-node.service /etc/systemd/system/joystream-node.service
sudo systemctl daemon-reload
sudo systemctl start joystream-node
sudo systemctl enable joystream-node

echo "${GREEN}===============\nYour node is fully installed and running.\nNow go to the site (https://telemetry.joystream.org/#/Joystream) and find your node by the name you gave it.\n\nWait for complete synchronization and proceed to the next step - Validator Setup\n(read - https://github.com/Joystream/helpdesk/tree/master/roles/validators#validator-setup).\n===============\033[0m"
