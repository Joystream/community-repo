#/bin/bash

PROVIDER1_DOMAIN=dp.0x2bc.com
PROVIDER2_DOMAIN=sieemmanodes.com
PROVIDER3_DOMAIN=joystream.koalva.io
PROVIDER4_DOMAIN=tiguan08.com
PROVIDER5_DOMAIN=


function check_provider1
{
begin=1
end=6
for (( i = begin; i < end; i++ )); do
PROVIDER_URL=https://"$PROVIDER1_DOMAIN"/distributor/api/v1/status
ts=$(date +%s%N)
status=$(curl -s "$PROVIDER_URL")
if [ -z $status ]
then
echo "No Response"
else 
echo -e "Round trip to $PROVIDER_URL in mili-second: $((($(date +%s%N) - $ts)/1000000))\n"
fi
done
ASSET_URL="https://"$PROVIDER1_DOMAIN"/distributor/api/v1/assets/493"
PROVIDER_BW=$(wget $ASSET_URL -O /dev/null  2>&1 | grep -oP '(?<= \()\d+\.?\d+ \SB/s(?=\) )')
echo Download Rate = $PROVIDER_BW
}


function check_provider2
{
begin=1
end=6
for (( i = begin; i < end; i++ )); do
PROVIDER_URL="https://"$PROVIDER2_DOMAIN"/distributor/api/v1/status"
ts=$(date +%s%N)
status=$(curl -s "$PROVIDER_URL")
if [ -z $status ]
then
echo "No Response"
else 
echo -e "Round trip to $PROVIDER_URL in mili-second: $((($(date +%s%N) - $ts)/1000000))\n"
fi
done
ASSET_URL="https://"$PROVIDER_DOMAIN"/distributor/api/v1/assets/493"
PROVIDER_BW=$(wget $ASSET_URL -O /dev/null  2>&1 | grep -oP '(?<= \()\d+\.?\d+ \SB/s(?=\) )')
echo Download Rate = $PROVIDER_BW
}


function check_provider3
{
begin=1
end=6
for (( i = begin; i < end; i++ )); do
PROVIDER_URL="https://"$PROVIDER3_DOMAIN"/distributor/api/v1/status"
ts=$(date +%s%N)
status=$(curl -s "$PROVIDER_URL")
if [ -z $status ]
then
echo "No Response"
else 
echo -e "Round trip to $PROVIDER_URL in mili-second: $((($(date +%s%N) - $ts)/1000000))\n"
fi
done
ASSET_URL="https://"$PROVIDER3_DOMAIN"/distributor/api/v1/assets/493"
PROVIDER_BW=$(wget $ASSET_URL -O /dev/null  2>&1 | grep -oP '(?<= \()\d+\.?\d+ \SB/s(?=\) )')
echo Download Rate = $PROVIDER_BW
}

function check_provider4
{
begin=1
end=6
for (( i = begin; i < end; i++ )); do
PROVIDER_URL="https://"$PROVIDER4_DOMAIN"/distributor/api/v1/status"
ts=$(date +%s%N)
status=$(curl -s "$PROVIDER_URL")
if [ -z $status ]
then
echo "No Response"
else 
echo -e "Round trip to $PROVIDER_URL in mili-second: $((($(date +%s%N) - $ts)/1000000))\n"
fi
done
ASSET_URL="https://"$PROVIDER4_DOMAIN"/distributor/api/v1/assets/493"
PROVIDER_BW=$(wget $ASSET_URL -O /dev/null  2>&1 | grep -oP '(?<= \()\d+\.?\d+ \SB/s(?=\) )')
echo Download Rate = $PROVIDER_BW
}

check_provider1
check_provider2
check_provider3
check_provider4
