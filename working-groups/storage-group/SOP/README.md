# Run Query node
All storage nodes are required to run a QN locally in the storage node.
All storage node are required to provide a link to thier QN GrapqL.

Failure will result in the rewards reduced by %25

# Eleastic search
All storage nodes are required to:
- Configure the Storage node to send metrics  to ES
- Configure  metricbeat to send metrics  to ES
- Configure  packetbeat to send metrics  to ES

Failure will result in the rewards reduced by %75

# metadata in format
All storage nodes are required to configure metadata as per the guide.
Failure will result in the rewards reduced by %25

# Keep a disk usage space less than 80%
All storage nodes are required to Keep a disk usage space less than 80%.

Failure will result in:
- Remove all Bags
- Rewards reduced by %75

# Up time

All storage nodes are required to
- Monthly up time %98
- weekly uptime %95

Failure will result in:
- Remove all Bags
- Rewards reduced by %50

# Down time (Hours): 
Failure will result in:
- 1 hr  : Disable new bags
- 3 hrs : Remove all Bags
- 24 hrs:  Disable rewards 
- 48 hrs: Evict worker

# Node not accepting upload (Hours):
Failure will result in:
- 1 hr : Disable new bags
- 3 hrs: Remove all Bags
- 24 hrs: Disable rewards 
- 48 hrs: Evict worker
