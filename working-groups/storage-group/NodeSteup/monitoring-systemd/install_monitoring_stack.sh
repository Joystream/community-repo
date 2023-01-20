#!/bin/bash

PROMETHEUS_VERSION=2.41.0 # latest version at the moment of writing was 2.41.0
NODE_EXPORTER_VERSION=1.5.0 # latest version at the moment of writing was 1.5.0
NODE_EXPORTER_TARGET="localhost:9100" # according to default installation of Node Exporter
JOYSTREAM_NODE_TARGET="localhost:9615" # according to default installation of Joystream node
MONITOR_LABEL="CUSTOM_LABEL" # identify your Joystream storage node

# install node_exporter
wget https://github.com/prometheus/node_exporter/releases/download/v${NODE_EXPORTER_VERSION}/node_exporter-${NODE_EXPORTER_VERSION}.linux-amd64.tar.gz
tar xvf node_exporter-*.tar.gz
sudo cp ./node_exporter-${NODE_EXPORTER_VERSION}.linux-amd64/node_exporter /usr/local/bin/
sudo useradd --no-create-home --shell /usr/sbin/nologin node_exporter
sudo chown node_exporter:node_exporter /usr/local/bin/node_exporter
rm -rf ./node_exporter*

cat > /etc/systemd/system/node_exporter.service <<EOF
[Unit]
Description=Node Exporter
Wants=network-online.target
After=network-online.target
[Service]
User=node_exporter
Group=node_exporter
Type=simple
ExecStart=/usr/local/bin/node_exporter
[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable node_exporter.service
sudo systemctl start node_exporter.service

# install prometheus
wget https://github.com/prometheus/prometheus/releases/download/v${PROMETHEUS_VERSION}/prometheus-${PROMETHEUS_VERSION}.linux-amd64.tar.gz
tar xvf prometheus-*.tar.gz
sudo cp ./prometheus-${PROMETHEUS_VERSION}.linux-amd64/prometheus /usr/local/bin/
sudo useradd --no-create-home --shell /usr/sbin/nologin prometheus
sudo chown prometheus:prometheus /usr/local/bin/prometheus

sudo mkdir -p /etc/prometheus/tsdb
sudo cp -R ./prometheus-${PROMETHEUS_VERSION}.linux-amd64/console* /etc/prometheus
rm -rf ./prometheus*

# prepare config file
cat > /etc/prometheus/prometheus.yml <<EOF
global:
  scrape_interval:     15s
  evaluation_interval: 15s

  # Attach these labels to any time series or alerts when communicating with
  # external systems (federation, remote storage, Alertmanager).
  external_labels:
      monitor: '${MONITOR_LABEL}'

# A scrape configuration containing exactly one endpoint to scrape.
scrape_configs:
  - job_name: 'nodeexporter'
    scrape_interval: 10s
    static_configs:
      - targets: ['${NODE_EXPORTER_TARGET}']

  - job_name: 'prometheus'
    scrape_interval: 10s
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'joystream-node'
    scrape_interval: 15s
    static_configs:
      - targets: ['${JOYSTREAM_NODE_TARGET}']

EOF
sudo chown -R prometheus:prometheus /etc/prometheus

cat > /etc/systemd/system/prometheus.service <<EOF
[Unit]
Description=Prometheus
Wants=network-online.target
After=network-online.target
[Service]
User=prometheus
Group=prometheus
Type=simple
ExecStart=/usr/local/bin/prometheus --web.enable-lifecycle --web.console.libraries=/etc/prometheus/console_libraries --web.console.templates=/etc/prometheus/consoles --storage.tsdb.path=/etc/prometheus/tsdb --storage.tsdb.retention.time=200h --config.file=/etc/prometheus/prometheus.yml
[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable prometheus.service
sudo systemctl start prometheus.service