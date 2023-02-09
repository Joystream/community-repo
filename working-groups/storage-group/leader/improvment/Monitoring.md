An extention to colossus to add a distributed monitoring.

## Monitoring 
### Node status 
- On chain status, node status:
  - Maintenance 
  - Failed
  - Deactivated 
  - Active   
### Monitoring structure 
How to scale monitoring as the system scales up. Currently expected monitoring i.e. [Lighthouse](https://github.com/Joystream/joystream/issues/4270) is centeralized, which is good for now, but could failure to function as the system grow. Below is a proposal for a dynamic monitoring system 
- Each node monitor a configurable number of nodes, with min 2.  
- Each node monitored by configurable number of node, with min 2.  
- Create a Merkle tree to track who is monitoring who.
- Node failure leads to Merkle tree branch reconvergance. 
- Failed node upon recovery get added back to the Merkle tree as a leaf. 
### Health check
- Inability to resolve host
- Inability to connect to host
- Inability to initiate upload
- Inability to initiate download
- Measure upload spead
- Measure download speed. 
### Pay
- Asscociate pay per block with health status/ Node status 
