# Overview

The script below installs [Node Exporter](https://github.com/prometheus/node_exporter) and [Prometheus](https://github.com/prometheus/prometheus) as systemd services. Node Exporter will be exposed on `0.0.0.0:9100`, while Prometheus will be exposed on `0.0.0.0:9090`. Please take into account the fact that the script assumes that you have the Joystream node exposing metrics on the same host on `localhost:9615` and the Joystream storage node running as a systemd service called `storage-node.service`.

Note: The script assumes you are running as `root` and it has been tested on a host running Ubuntu 22.04 LTS.

# Usage

You should first clone the repo and modify the following variables according to your preference.

```
git clone https://github.com/yasiryagi/community-repo.git
cd community-repo/working-groups/storage-group/NodeSetup/monitoring-systemd

# use your preferred text editor such as vi/vim/nano
vi install_monitoring_stack.sh

# change the following variables according to your preference
PROMETHEUS_VERSION=2.41.0 # latest version at the moment of writing was 2.41.0
NODE_EXPORTER_VERSION=1.5.0 # latest version at the moment of writing was 1.5.0
NODE_EXPORTER_TARGET="localhost:9100" # according to default installation of Node Exporter
JOYSTREAM_NODE_TARGET="localhost:9615" # according to default installation of Joystream node
MONITOR_LABEL="CUSTOM_LABEL" # identify your Joystream storage node
```

Afterwards, run the script and you will install the monitoring stack described above.

```
chmod ugo+x install_monitoring_stack.sh
./install_monitoring_stack.sh
```

# Checks

You should have 2 new systemd services running that you can check through the commands below. Also, you should be able to access the prometheus server by typing in your browser `http://<HOST_IP>:9090` (Note: it would be recommended that you expose the Prometheus server through Caddy/Nginx and only use this approach for testing purposes; also, make sure that the `9090` port is reachable from your IP).

```
# check that Node Exporter is running
systemctl status node_exporter.service

# check the logs of Node Exporter
journalctl -fu node_exporter.service

# check that Prometheus is running
systemctl status prometheus.service

# check the logs of Prometheus
journalctl -fu prometheus.service
```