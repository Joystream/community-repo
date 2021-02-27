#!/bin/bash
#My public key 5EyRepuyZTM2rjHwbGfjBmjutaR5QTxLULcra2aToigtpxb6
#My node name wasabi
clear
echo "****************************************************************************"
echo "*      This script will install and configure your Joystream node.         *"
echo "*      The script was created based on the official instructions and the   *"
echo "*      working community instructions:                                     *"
echo "*      https://github.com/Joystream/helpdesk/tree/master/roles/validators  *"
echo "*      https://seainvestments1.medium.com/b3608a8be10e                     *"
echo "****************************************************************************"
read -n 1 -s -r -p "Press any key to continue or CTRL+C to exit ... "
GREEN='\033[0;32m'      #  ${GREEN}
sudo apt-get update
sudo rm /etc/systemd/system/joystream-node.service
wget https://github.com/Joystream/joystream/releases/download/v7.5.0/joystream-node-3.3.0-fdb75f5ec-x86_64-linux-gnu.tar.gz
tar -vxf joystream-node-3.3.0-fdb75f5ec-x86_64-linux-gnu.tar.gz
wget https://github.com/Joystream/joystream/releases/download/v7.5.0/joy-testnet-4.json

cd /etc/systemd/system
sudo touch joystream-node.service

read -p "Enter your node name and press [ENTER]:" username

echo [Unit] | sudo tee --append /etc/systemd/system/joystream-node.service
echo Description=Joystream Node | sudo tee --append /etc/systemd/system/joystream-node.service

echo [Service] | sudo tee --append /etc/systemd/system/joystream-node.service
echo Type=simple | sudo tee --append /etc/systemd/system/joystream-node.service
echo User=$USER | sudo tee --append /etc/systemd/system/joystream-node.service
echo WorkingDirectory=$HOME/ | sudo tee --append /etc/systemd/system/joystream-node.service

echo ExecStart=$HOME/joystream-node \\| sudo tee --append /etc/systemd/system/joystream-node.service

echo --chain joy-testnet-4.json \\| sudo tee --append /etc/systemd/system/joystream-node.service
echo --pruning archive \\| sudo tee --append /etc/systemd/system/joystream-node.service
echo --validator \\| sudo tee --append /etc/systemd/system/joystream-node.service
echo --name $username| sudo tee --append /etc/systemd/system/joystream-node.service
echo Restart=on-failure | sudo tee --append /etc/systemd/system/joystream-node.service
echo RestartSec=3 | sudo tee --append /etc/systemd/system/joystream-node.service
echo LimitNOFILE=8192 | sudo tee --append /etc/systemd/system/joystream-node.service

echo [Install] | sudo tee --append /etc/systemd/system/joystream-node.service
echo WantedBy=multi-user.target | sudo tee --append /etc/systemd/system/joystream-node.service

sudo systemctl daemon-reload
sudo systemctl start joystream-node
sudo systemctl enable joystream-node
clear
echo -e "${GREEN}===============\nYour node is fully installed and running.\nNow go to the site (https://telemetry.polkadot.io/#list/Joystream) and find your node by the name you gave it.\n\nWait for complete synchronization and proceed to the next step - Validator Setup\n(read - https://github.com/Joystream/helpdesk/tree/master/roles/validators#validator-setup).\n===============\033[0m"
