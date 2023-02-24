# Standard Operation procedure 


## Storage setup 

All storage node are required to run/configure:
- Run a local validator 
- Run a local Query node
- Run Storage node
- Configure Storage node for Elastic search
- Storage node Metadata in format: All storage nodes are required to configure metadata as per the guide.
- Run Prometheus providing host, storage node and docker metrics


All storage node are required to provide access to:
- QN GraphQL URL
- Storage node URL
- Storage node URL
- Promrtheus URL


### **Failure will result in:**
- **Remove all Bags**
- **Rewards reduced by %100**



## Node performance

### Keep a disk usage space less than 80%

All storage nodes are required to Keep a disk usage space less than 80%.

#### **Failure will result in:**
- **Disable new bags**
- **Rewards reduced by %75**

### Up time

All storage nodes are required to

- Monthly up time %99
- weekly uptime %95

#### **Failure will result in:**
- **Rewards reduced by %50 for the next council**

Exception: exclude down time arranged with the lead in advance.

### Down time (Hours from point of detection)

#### **Failure will result in:**
- **1 hr  : Disable new bags**
- **3 hrs : Remove all Bags**
- **24 hrs:  Disable rewards till the node is back in service and verified** 
- **120 hrs: Evict worker**

Exception: exclude down time arranged with the lead in advance.

### Node not accepting upload (Hours from point of detection)

#### **Failure will result in:**
- **1 hr : Disable new bags**
- **3 hrs: Remove all Bags**
- **24 hrs: Disable rewards till the node is back in service and verified** 
- **120 hrs: Evict worker**

Exception: exclude down time arranged with the lead in advance.


## Communication

All workers are required to respond to queries within 24 hrs

- Urgent:        : (12 hrs) bug fix, server issue, system issue  etc..
- Medium priority: (36 hrs) work related queries.
- Low priority:    (48 hrs) none work related queries

### **Failure will result in:**
- **Rewards reduced by %10 every 12 hours**

## Comply to new requirement by the council 
All storage nodes are required to comply to any requirement by the council within 7 days. 

**Failure will result in the rewards reduced by %100**

<style>
    .heatMap tr:nth-child(0) { background: Gray; }
    .heatMap tr:nth-child(1) { background: blue; }
    .heatMap tr:nth-child(5) { background: blue; }
    .heatMap tr:nth-child(10) { background: blue; }
	.heatMap tr:nth-child(12) { background: blue; }
</style>

<div class="heatMap">

| Storage setup                                                |                                                                                                                                                                             |                                                                                                                                                                                             |                                                      |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Setup Requirement                                            | Detail                                                                                                                                                                      | Failure will result                                                                                                                                                                         | Exception                                            |
| All storage node are required to run/configure               | - Run a local validator<br> Run a local Query node<br> - Run Storage node <br> - Configure Storage node for Elastic search<br> - Storage node Metadata in format: All storage nodes are required to configure metadata as per the guide.<br> - Run Prometheus providing host, storage node and docker metrics  | **Remove all Bags**<br>**Rewards reduced by %100**<br>             |                                                      |
| All storage node are required to provide access to           | - QN GraphQL URL <br> Storage node URL  <br> - Storage node URL  <br> - Promrtheus URL   <br> - Promrtheus URL                                                              | **Remove all Bags**<br>**Rewards reduced by %100**<br>                                                                                                                                      |                                                      |
|                                                              |                                                                                                                                                                             |                                                                                                                                                                                             |                                                      |
| Node performance                                             |                                                                                                                                                                             |                                                                                                                                                                                             |                                                      |
| Keep a disk usage space less than 80%                        | All storage nodes are required to Keep a disk usage space less than 80%                                                                                                     | **Disable new bags**<br>**Rewards reduced by %75**<br>                                                                                                                                      |                                                      |
| Up time                                                      | All storage nodes are required to monthly up time %99                                                                                                                       | **Rewards reduced by %50 for the next council**                                                                                                                                             | exclude down time arranged with the lead in advance. |
| Down time                                                    |                                                                                                                                                                             | **1 hr : Disable new bags**<br>**3 hrs : Remove all Bags**<br>**24 hrs: Disable rewards till the node is back in service and verified**<br>**120 hrs: Evict worker**<br>                    | exclude down time arranged with the lead in advance  |
| Node not accepting upload                                    |                                                                                                                                                                             | **1 hr : Disable new bags**<br>**3 hrs: Remove all Bags**<br>**24 hrs: Disable rewards till the node is back in service and verified**<br>**120 hrs: Evict worker**<br><br>                 | exclude down time arranged with the lead in advance  |
|                                                              |                                                                                                                                                                             |                                                                                                                                                                                             |                                                      |
| Communication                                                |                                                                                                                                                                             |                                                                                                                                                                                             |                                                      |
| All workers are required to respond to queries within 24 hrs | - Urgent: (12 hrs) bug fix, server issue, system issue<br>- Medium priority: (36 hrs) work related queries.<br>- Low priority:(48 hrs) none work related queries<br><br>    | **Rewards reduced by %10 every 12 hours**                                                                                                                                                   |                                                      |
|                                                              |                                                                                                                                                                             |                                                                                                                                                                                             |                                                      |
| Council                                                      |                                                                                                                                                                             |                                                                                                                                                                                             |                                                      |
| Comply to new requirement by the council                     | All storage nodes are required to comply to any requirement by the council within 7 days.                                                                                   | **Rewards reduced by %100**                                                                                                                                                                 |                                                      |

</div>

# Ref
- All rewards reduction is from full salary.
- Reduction can happen till minimum rewards of 1 Joy. 
- Reward reduction is reverted once the issue is addressed.
