#/bin/bash

# Specify the number of latency tests to perform
PINGS=5

# Specify the domain name of providers to test
PROVIDER1_DOMAIN=dp.0x2bc.com
PROVIDER2_DOMAIN=sieemmanodes.com
PROVIDER3_DOMAIN=joystream.koalva.io
PROVIDER4_DOMAIN=tiguan08.com
PROVIDER5_DOMAIN=


function check_provider1
{
begin=1
end=$((PINGS+1))
for (( i = begin; i < end; i++ )); do
PROVIDER_URL=https://"$PROVIDER1_DOMAIN"/distributor/api/v1/status
ts=$(date +%s%N)
status=$(curl -s "$PROVIDER_URL")
if [ -z $status ]
then
echo "No Response"
else
LATENCY=$((($(date +%s%N) - $ts)/1000000))
echo $LATENCY >> ~/latency_report.txt
fi
done
AVERAGE_LAT=$(awk '{s+=$1}END{print "",s/NR}' RS=" " ~/latency_report.txt)
MIN=$(cut -f1 -d"," ~/latency_report.txt | sort -n | head -1)
MAX=$(cut -f1 -d"," ~/latency_report.txt | sort -n | tail -1)
ASSET_URL="https://"$PROVIDER1_DOMAIN"/distributor/api/v1/assets/493"
PROVIDER_BW=$(wget $ASSET_URL -O /dev/null  2>&1 | grep -oP '(?<= \()\d+\.?\d+ \SB/s(?=\) )')
echo "Report for $PROVIDER1_DOMAIN"
echo Average Latency: "$AVERAGE_LAT"ms
echo Minimum Latency: "$MIN"ms
echo Maximum Latency: "$MAX"ms
echo D/L Rate: "$PROVIDER_BW"
}


function check_provider2
{
begin=1
end=$((PINGS+1))
for (( i = begin; i < end; i++ )); do
PROVIDER_URL="https://"$PROVIDER2_DOMAIN"/distributor/api/v1/status"
ts=$(date +%s%N)
status=$(curl -s "$PROVIDER_URL")
if [ -z $status ]
then
echo "No Response"
else
LATENCY=$((($(date +%s%N) - $ts)/1000000))
echo $LATENCY >> ~/latency_report.txt
fi
done
AVERAGE_LAT=$(awk '{s+=$1}END{print "",s/NR}' RS=" " ~/latency_report.txt)
MIN=$(cut -f1 -d"," ~/latency_report.txt | sort -n | head -1)
MAX=$(cut -f1 -d"," ~/latency_report.txt | sort -n | tail -1)
ASSET_URL="https://"$PROVIDER2_DOMAIN"/distributor/api/v1/assets/493"
PROVIDER_BW=$(wget $ASSET_URL -O /dev/null  2>&1 | grep -oP '(?<= \()\d+\.?\d+ \SB/s(?=\) )')
echo "Report for $PROVIDER2_DOMAIN"
echo Average Latency: "$AVERAGE_LAT"ms
echo Minimum Latency: "$MIN"ms
echo Maximum Latency: "$MAX"ms
echo D/L Rate: "$PROVIDER_BW"
}


function check_provider3
{
begin=1
end=$((PINGS+1))
for (( i = begin; i < end; i++ )); do
PROVIDER_URL="https://"$PROVIDER3_DOMAIN"/distributor/api/v1/status"
ts=$(date +%s%N)
status=$(curl -s "$PROVIDER_URL")
if [ -z $status ]
then
echo "No Response"
else
LATENCY=$((($(date +%s%N) - $ts)/1000000))
echo $LATENCY >> ~/latency_report.txt
fi
done
AVERAGE_LAT=$(awk '{s+=$1}END{print "",s/NR}' RS=" " ~/latency_report.txt)
MIN=$(cut -f1 -d"," ~/latency_report.txt | sort -n | head -1)
MAX=$(cut -f1 -d"," ~/latency_report.txt | sort -n | tail -1)
ASSET_URL="https://"$PROVIDER3_DOMAIN"/distributor/api/v1/assets/493"
PROVIDER_BW=$(wget $ASSET_URL -O /dev/null  2>&1 | grep -oP '(?<= \()\d+\.?\d+ \SB/s(?=\) )')
echo "Report for $PROVIDER3_DOMAIN"
echo Average Latency: "$AVERAGE_LAT"ms
echo Minimum Latency: "$MIN"ms
echo Maximum Latency: "$MAX"ms
echo D/L Rate: "$PROVIDER_BW"
}

function check_provider4
{
begin=1
end=$((PINGS+1))
for (( i = begin; i < end; i++ )); do
PROVIDER_URL="https://"$PROVIDER4_DOMAIN"/distributor/api/v1/status"
ts=$(date +%s%N)
status=$(curl -s "$PROVIDER_URL")
if [ -z $status ]
then
echo "No Response"
else
LATENCY=$((($(date +%s%N) - $ts)/1000000))
echo $LATENCY >> ~/latency_report.txt
fi
done
AVERAGE_LAT=$(awk '{s+=$1}END{print "",s/NR}' RS=" " ~/latency_report.txt)
MIN=$(cut -f1 -d"," ~/latency_report.txt | sort -n | head -1)
MAX=$(cut -f1 -d"," ~/latency_report.txt | sort -n | tail -1)
ASSET_URL="https://"$PROVIDER4_DOMAIN"/distributor/api/v1/assets/493"
PROVIDER_BW=$(wget $ASSET_URL -O /dev/null  2>&1 | grep -oP '(?<= \()\d+\.?\d+ \SB/s(?=\) )')
echo "Report for $PROVIDER4_DOMAIN"
echo Average Latency: "$AVERAGE_LAT"ms
echo Minimum Latency: "$MIN"ms
echo Maximum Latency: "$MAX"ms
echo D/L Rate: "$PROVIDER_BW"
}

function check_provider5
{
begin=1
end=$((PINGS+1))
for (( i = begin; i < end; i++ )); do
PROVIDER_URL="https://"$PROVIDER5_DOMAIN"/distributor/api/v1/status"
ts=$(date +%s%N)
status=$(curl -s "$PROVIDER_URL")
if [ -z $status ]
then
echo "No Response"
else
LATENCY=$((($(date +%s%N) - $ts)/1000000))
echo $LATENCY >> ~/latency_report.txt
fi
done
AVERAGE_LAT=$(awk '{s+=$1}END{print "",s/NR}' RS=" " ~/latency_report.txt)
MIN=$(cut -f1 -d"," ~/latency_report.txt | sort -n | head -1)
MAX=$(cut -f1 -d"," ~/latency_report.txt | sort -n | tail -1)
ASSET_URL="https://"$PROVIDER5_DOMAIN"/distributor/api/v1/assets/493"
PROVIDER_BW=$(wget $ASSET_URL -O /dev/null  2>&1 | grep -oP '(?<= \()\d+\.?\d+ \SB/s(?=\) )')
echo "Report for $PROVIDER5_DOMAIN"
echo Average Latency: "$AVERAGE_LAT"ms
echo Minimum Latency: "$MIN"ms
echo Maximum Latency: "$MAX"ms
echo D/L Rate: "$PROVIDER_BW"

}


if [[ ! -z "$PROVIDER1_DOMAIN" ]]
then
check_provider1
rm ~/latency_report.txt
fi

if [[ ! -z "$PROVIDER2_DOMAIN" ]]
then
check_provider2
rm ~/latency_report.txt
fi

if [[ ! -z "$PROVIDER3_DOMAIN" ]]
then
check_provider3
rm ~/latency_report.txt
fi

if [[ ! -z "$PROVIDER4_DOMAIN" ]]
then
check_provider4
rm ~/latency_report.txt
fi

if [[ ! -z "$PROVIDER5_DOMAIN" ]]
then
check_provider5
rm ~/latency_report.txt
fi
