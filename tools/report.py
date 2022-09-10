import requests
import json
#import csv
from tabulate import tabulate
from itertools import groupby
from operator import itemgetter
import numpy as np
import matplotlib.pyplot as plt

url = 'https://joystream2.yyagi.cloud/graphql'
#url = 'https://query.joystream.org/graphql'
file_name = "{}-12:00-objects.txt"
file_server = "http://87.236.146.74:8000/"
operators = [{'id':"0x2bc", 'bucket': 0},{'id':"alexznet", 'bucket': 2},{'id':"Craci_BwareLabs", 'bucket': 10},{'id':"GodsHunter", 'bucket': 6},{'id':"joystreamstats", 'bucket': 1},{'id':"l1dev", 'bucket': 4},{'id':"maxlevush", 'bucket': 3},{'id':"mmx1916", 'bucket': 9},{'id':"razumv", 'bucket': 11},{'id':"yyagi", 'bucket': 8}, {'id':"sieemma", 'bucket': 12} ]
credential = {'username': '', 'password' :'joystream'}
query_group = "storageWorkingGroup"

#def queryGrapql(query, url= 'https://query.joystream.org/graphql' ):
def queryGrapql(query, url= 'https://joystream2.yyagi.cloud/graphql' ):
  headers = {'Accept-Encoding': 'gzip, deflate, br', 'Content-Type': 'application/json',
           'Accept': 'application/json',  'Connection': 'keep-alive', 'DNT': '1', 
		   'Origin': 'https://query.joystream.org' }
  response = requests.post(url, headers=headers, json=query)
  return response.json()['data']

def get_councils_period(url):
  query = {"query":'query MyQuery{ electedCouncils { electedAtBlock endedAtBlock endedAtTime electedAtTime } }'}
  data  = queryGrapql(query, url)['electedCouncils']
  #data = sorted(data, key = itemgetter('endedAtBlock'), reverse=True)
  if data[-1]['endedAtTime'] == None:
    data.pop(-1)
  data = sorted(data, key = itemgetter('endedAtBlock'))
  period = len(data)
  return data[-1], data[-2], data[0], period

def get_backets(url, start_time = '', end_time = '', createdat = False, deletedat = False):
  if start_time and end_time :
    if createdat :
      query = {"query":'query MyQuery {{  storageBuckets ( where: {{createdAt_gt: "{}" , createdAt_lt: "{}"}}){{    id    dataObjectsSize    dataObjectsSizeLimit    dataObjectsCount    bags {{      id  createdAt  }}  }}}}'.format(start_time, end_time)}
    elif deletedat:
      query = {"query":'query MyQuery {{  storageBuckets ( where: {{deletedAt_gt: "{}" , deletedAt_lt: "{}"}}){{    id    dataObjectsSize    dataObjectsSizeLimit    dataObjectsCount    bags {{      id  createdAt  }}  }}}}'.format(start_time, end_time)}
  else:
    query = {"query":"query MyQuery {  storageBuckets {    id    dataObjectsSize    dataObjectsSizeLimit    dataObjectsCount    bags {      id  createdAt  }  }}"}
  data  = queryGrapql(query, url)['storageBuckets']
  for record in data:
    record['bags'] = len(record['bags'])
    record['Utilization'] = int(record['dataObjectsSize'])/int(record['dataObjectsSizeLimit'])
    record['dataObjectsSize, GB'] = int(record['dataObjectsSize']) / 1074790400
  #keys = list(data[0].keys())
  #file_name= 'backets_info_'+ time.strftime("%Y%m%d%H%M%S")+'.csv'
  # with open(file_name, 'w') as csvfile:
  #  writer = csv.DictWriter(csvfile, fieldnames = keys)
  #  writer.writeheader()
  #  writer.writerows(data)
  #return file_name
  return data

def get_rewards(start_time, end_time):
  query = '{{ rewardPaidEvents(limit: 33000, offset: 0, where: {{group: {{id_eq: "storageWorkingGroup"}}, createdAt_gt: "{}", createdAt_lt: "{}"}}) {{ paymentType amount workerId }} }}'.format(start_time, end_time)
  query_dict = {"query": query}
  data = queryGrapql(query_dict,url)['rewardPaidEvents']
  total = 0
  result = []
  sorted_data = sorted(data, key = itemgetter('workerId'))
  for key, values in groupby(sorted_data, key = itemgetter('workerId')):
    worker_total = 0
    for value in list(values):
      worker_total += int(value["amount"])
    result.append({'workerId':key, 'worker_total':worker_total})
    total += worker_total
  return total,result

def get_new_opening(start_time, end_time):
  query = '{{ openingAddedEvents(where: {{group: {{id_eq: "storageWorkingGroup"}}, createdAt_gt: "{}", createdAt_lt: "{}"}}) {{ opening {{ createdAt id openingcanceledeventopening {{ createdAt }} }} }} }}'.format(start_time, end_time)
  query_dict = {"query": query}
  data = queryGrapql(query_dict,url)['openingAddedEvents']
  result = []
  if len(data) == 0:
    return 0,result
  for record in data:
    if len(record['opening']['openingcanceledeventopening']) == 0:
      result.append({'id': record['opening']['id'], 'createdAt': record['opening']['createdAt']})
  length = len(result)
  return length,result

def get_new_hire(start_time, end_time):
  query = '{{ openingFilledEvents(where: {{group: {{id_eq: "storageWorkingGroup"}}, createdAt_gt: "{}", createdAt_lt: "{}"}}) {{ createdAt  workersHired {{ id membershipId}}}}}}'.format(start_time, end_time)
  query_dict = {"query": query}
  data = queryGrapql(query_dict,url)['openingFilledEvents']
  result = []
  if len(data) == 0:
    return 0,result
  for record in data:
    record['workersHired'][0]['createdAt'] = record['createdAt']
    result.append(record['workersHired'][0])
  length = len(result)
  return length, result

def get_slashes(start_time, end_time):
  query = '{{ stakeSlashedEvents(where: {{group: {{id_eq: "storageWorkingGroup", createdAt_gt: "{}", createdAt_lt: "{}"}}}}) {{ createdAt worker {{ membershipId }} slashedAmount workerId }}}}'.format(start_time, end_time)
  query_dict = {"query": query}
  data = queryGrapql(query_dict,url)['stakeSlashedEvents']
  length = len(data)
  if length > 0:
   for record in data:
     record["worker"] = record["worker"]["membershipId"]
  return length,data

def get_termination(start_time, end_time):
  query = '{{ terminatedWorkerEvents(where: {{group: {{id_eq: "storageWorkingGroup"}}, createdAt_gt: "{}", createdAt_lt: "{}"}}) {{createdAt workerId worker {{membershipId}} }}}}'.format(start_time, end_time)
  query_dict = {"query": query}
  data = queryGrapql(query_dict,url)['terminatedWorkerEvents']
  length = len(data)
  if length > 0:
   for record in data:
     record["worker"] = record["worker"]["membershipId"]
  return length,data

def get_bags_nums(start_time = '', end_time = ''):
  if start_time and end_time :
    query_created = {"query": 'query MyQuery {{ storageBags( limit: 33000, offset: 0, where: {{createdAt_gt: "{}" , createdAt_lt: "{}"}}) {{  id }} }}'.format(start_time, end_time) }
    query_deleted = {"query": 'query MyQuery {{ storageBags( limit: 33000, offset: 0, where: {{deletedAt_gt: "{}" , deletedAt_lt: "{}"}}) {{  id }} }}'.format(start_time, end_time) }
  else :
    query_created = {"query": 'query MyQuery { storageBags(limit: 3000, offset:0) {  id } }'}
    query_deleted = {"query": 'query MyQuery { storageBags(limit: 3000, offset:0) {  id } }'}
  data_created  = queryGrapql(query_created)['storageBags']
  data_deleted  = queryGrapql(query_deleted)['storageBags']
  num_bags_created = len(data_created)
  num_bags_deleted = len(data_deleted)
  return {"bag created": num_bags_created, "bags deleted": num_bags_deleted}
 
def get_bags(start_time='', end_time=''):
  if start_time and end_time :
    query = {"query": 'query MyQuery {{ storageBags( limit: 33000, offset: 0, where: {{createdAt_gt: "{}" , createdAt_lt: "{}"}}) {{  id createdAt deletedAt }} }}'.format(start_time, end_time) }
  else:
    query = {"query": 'query MyQuery { storageBags( limit: 33000, offset: 0) {  id createdAt deletedAt }} ' }
    data = queryGrapql(query)['storageBags']
    return len(data), data

def get_objects(start_time='',end_time=''):
  if start_time and end_time :
    query_created = {"query":'query MyQuery {{ storageDataObjects(limit: 33000, offset: 0,where: {{createdAt_gt: "{}" , createdAt_lt: "{}"}}) {{ createdAt size id storageBagId }} }}'.format(start_time, end_time) }
  else :
    query_created = {"query":'query MyQuery { storageDataObjects(limit: 33000, offset: 0) { createdAt deletedAt size id storageBagId } }' }
  objects_created  = queryGrapql(query_created)['storageDataObjects']
  for obj in objects_created: 
    obj['storageBagId'] = obj['storageBagId'].split(":")[2]
  return objects_created
  
def get_objects_files(file_server, operators, end_date, credential):
  result= []
  file = end_date+"-12:00-objects.txt" 
  for operator in operators:
    url = file_server+operator['id']+"/"+file 
    response = requests.get(url, auth=(credential['username'], credential['password']))
    if response.status_code == 200 and not response.text.startswith('<!DOCTYPE html>'):
      result.append({'operator':operator['id'], 'file': file, 'response': response.content}) 
  return result 

def load_objects(lines):
  objects_file = []	
  for line in lines:
    if line.startswith('d') or line.startswith('total') or not line.strip():
      continue
    line_split = line.split(",")
    objects_file.append({'size': line_split[4], 'id': line_split[8].strip('\n')})
  return objects_file
    
def load_objects_from_server(data):
  objects_file = []	
  for operator in data:
    opertor_response = operator['response'].decode("utf-8") 
    lines = opertor_response.split('\r\n')
    objects_file.append({'operator': operator['operator'],'objects':load_objects(lines)})
  return objects_file
  
def load_objects_from_file(file_name):
  objects_file = []	
  with open(file_name) as f:
    lines = f.readlines()
  objects_file = objects_file = load_objects(lines)
  return objects_file
  
def compare_objects(file_objects, objects):
    lost = []
    for obj in objects:
      found = False
      for file_obj in file_objects:
        if obj['id'] == file_obj['id']:
          found = True
          break
      if not found:
        lost.append(obj)
    return lost

def get_lost(start_time, end_time):
  query = '{{ storageDataObjects(limit: 3000, offset: 0, where: {{isAccepted_eq: false, createdAt_gt: "{}", createdAt_lt: "{}"}}) {{ createdAt size id storageBagId }}}}'.format(start_time, end_time)
  query_dict = {"query": query}
  data = queryGrapql(query_dict,url)['storageDataObjects']
  for obj in data:
    obj['storageBagId'] = obj['storageBagId'].split(":")[2]
  length = len(data)
  return length,data

def objects_stats(start_time='',end_time=''):
  data_created = get_objects(start_time,end_time)
  num_objects_created = len(data_created)
  total_size = 0
  sizes = {'<10 MB': 0,'<100 MB': 0,'<1000 MB': 0,'<10000 MB': 0,'<100000 MB': 0,'<1000000 MB': 0}
  sizes_range = {'0-10 MB': 0,'10-100 MB': 0,'100-1000 MB': 0,'1000-10000 MB': 0,'10000-100000 MB': 0,'100000-10000000 MB': 0}
  total_size,sizes,sizes_range =get_0bjects_ranges(data_created,total_size,sizes,sizes_range)
  bags_stats = bag_stats(data_created)
  return num_objects_created, total_size,sizes,sizes_range,bags_stats
 
def get_0bjects_ranges(data_created,total_size,sizes,sizes_range): 
  for record in data_created:
    size  = int(record['size'])
    total_size += size
    size = size / 1048576
    if size < 10:
      sizes['<10 MB'] += 1
      sizes['<100 MB'] += 1
      sizes['<1000 MB'] += 1
      sizes['<10000 MB'] += 1
      sizes['<100000 MB'] += 1
      sizes['<1000000 MB'] += 1
    elif size < 100:
      sizes['<100 MB'] += 1
      sizes['<1000 MB'] += 1
      sizes['<10000 MB'] += 1
      sizes['<100000 MB'] += 1
      sizes['<1000000 MB'] += 1
    elif size < 1000:
      sizes['<1000 MB'] += 1
      sizes['<10000 MB'] += 1
      sizes['<100000 MB'] += 1
      sizes['<1000000 MB'] += 1
    elif size < 10000:
      sizes['<10000 MB'] += 1
      sizes['<100000 MB'] += 1
      sizes['<1000000 MB'] += 1
    elif size < 100000:
      sizes['<100000 MB'] += 1
      sizes['<1000000 MB'] += 1
    else:
      sizes['<1000000 MB'] += 1
   
    if size < 10:
      sizes_range['0-10 MB'] += 1
    elif size < 100:
      sizes_range['10-100 MB'] += 1
    elif size < 1000:
      sizes_range['100-1000 MB'] += 1
    elif size < 10000:
      sizes_range['1000-10000 MB'] += 1
    elif size < 100000:
      sizes_range['10000-100000 MB'] += 1
    else:
      sizes_range['100000-10000000 MB'] += 1
  return  total_size, sizes, sizes_range

def get_grouped_obj_dates(data, action):
  result = {}
  data =  sorted(data, key = itemgetter(action))
  for key, records in groupby(data, key = itemgetter(action)):
    records = list(records)
    size = 0
    num_objects = len(records)
    for record in records:
      size += int(record['size'])
    result[key] = { 'size': size, 'num_objects': num_objects}
  return result

def get_draw_objects(file1name, file2name):
  data = get_objects()
  created_objects = []
  deleted_objects = []
  for record in data:
    record['createdAt'] =  record['createdAt'].split('T')[0]
    created_objects.append({'createdAt': record['createdAt'], 'size': record['size']})
    if record['deletedAt']:
      record['deletedAt'] =  record['deletedAt'].split('T')[0]
      deleted_objects.append({'deletedAt': record['deletedAt'], 'size': record['size']})
  num_created_objects = len(created_objects)
  num_deleted_objects = len(deleted_objects)

  if num_created_objects > 0:
    created_objects = get_grouped_obj_dates(created_objects, 'createdAt')
  if num_deleted_objects > 0:
    deleted_objects = get_grouped_obj_dates(deleted_objects, 'deletedAt')
    for key, value in deleted_objects.items:
      created_objects[key]['size'] -= value['size']
      created_objects[key]['num_objects'] -= value['num_objects']
  dates = list(created_objects.keys())
  sizes = [round(int(k['size'])/1074790400, 2) for k in created_objects.values()]
  for index, size in enumerate(sizes):
    if index == 0:
      continue
    sizes[index] += sizes[index-1]
  num_objects = [k['num_objects'] for k in created_objects.values()]
  for index, num_object in enumerate(num_objects):
    if index == 0:
      continue
    num_objects[index] += num_objects[index-1]  
  

  plot(dates[1:], sizes[1:], 'Size (Sum, GB)', 'Dates', 'Size', 0, 750 , 10, 25,file1name)
  plot(dates[1:], num_objects[1:], 'Number of Objects', 'Dates', 'Number of Objects', 0, 12000, 10, 500,file2name)

def plot(x, y, title, x_label, y_label, x_start, y_start, x_spacing, y_spacing,filename):
  fig, ax = plt.subplots()
  fig.set_size_inches(15, 10)
  plt.plot(x, y)
  ax.set_xticks(np.arange(x_start, len(x)+1, x_spacing))
  ax.set_yticks(np.arange(y_start, max(y), y_spacing))
  ax.set_title(title)
  ax.set(xlabel=x_label, ylabel=y_label)
  plt.xticks(rotation=45)
  plt.yticks(rotation=45)
  fig.set_dpi(100)
  fig.savefig(filename)
  plt.close()

def get_created_deleted_bags(data):
  created_bags = []
  deleted_bags = []
  for record in data:
    record['createdAt'] =  record['createdAt'].split('T')[0]
    created_bags.append({'createdAt': record['createdAt'], 'id': record['id']})
    if record['deletedAt']:
      record['deletedAt'] =  record['deletedAt'].split('T')[0]
      deleted_bags.append({'deletedAt': record['deletedAt'], 'id': record['id']})
  return created_bags,deleted_bags

def get_draw_bags(filename):
  num, data = get_bags()
  created_bags ,deleted_bags = get_created_deleted_bags(data)
  num_created_bags = len(created_bags)
  num_deleted_bags = len(deleted_bags)
  bags = {}
  if num_created_bags > 0:
    created_bags = sort_bags(created_bags, 'createdAt')
    for key, record in created_bags.items():
        bags[key] = len(record)
  if num_deleted_bags > 0:
    deleted_bags = sort_bags(deleted_bags, 'deletedAt')
    for key, record in deleted_objects.items():
      bags[key] -= len(record)
  dates = list(bags.keys())
  num_bags = [k for k in bags.values()]
  for index, num_bag in enumerate(num_bags):
    if index == 0:
      continue
    num_bags[index] += num_bags[index-1]
  plot(dates[1:], num_bags[1:], 'Number of Bags {}'.format(num_created_bags - num_deleted_bags), 'Dates', 'Number of Bags', 0, 250 , 3, 50,filename)

def sort_bags(data, key):
  bags = {}
  sorted_data = sorted(data, key = itemgetter(key))
  for key, value in groupby(sorted_data, key = itemgetter(key)):
    #key = key.split(":")[2]
    bags[key]= list(value)
  return(bags)
 
def bag_stats(data_created): 
  bags = sort_bags(data_created, 'storageBagId')
  #print(bags)
  result= []
  for key, value in bags.items():
    bag = {}
    bag['id'] = key
    total_size = 0
    bag['objects_num'] = len(value)
    for obj in value:
      total_size += int(obj['size'])
    bag['total_size bytes'] = total_size
    bag['average_size bytes'] = int(total_size / bag['objects_num'])
    result.append(bag)
  return result

def print_table(data, master_key = '', sort_key = ''):
    if sort_key:
        data = sorted(data, key = itemgetter(sort_key), reverse=True)
    headers = [*data[0]]
    if master_key:
        headers.append(master_key)
        headers.remove(master_key)
        headers = [master_key] + headers
    table = []
    for line in data:
        row = []
        if master_key:
            value = line.pop(master_key)
            row.append(value)
        for key in [*line]:
            row.append(line[key])
        table.append(row)
    try:
        result = tabulate(table, headers, tablefmt="github")
        print(result)
        return result
    except UnicodeEncodeError:
        result = tabulate(table, headers, tablefmt="grid")
        print(result)
        return result

if __name__ == '__main__':
  last_council,previous_council,first_council, period = get_councils_period(url)
  report = ''
  first_time = first_council['electedAtTime']
  start_time = last_council['electedAtTime']
  end_time   = last_council['endedAtTime']
  start_date = start_time.split('T')[0]
  end_date = end_time.split('T')[0]
  previous_start_time = previous_council['electedAtTime']
  previous_end_time   = previous_council['endedAtTime']
  file_name = 'report-'+end_time 
  print(start_time)
  print(end_time)
  print('Full report for the Term: {} \n\n'.format(period-1))
  print('Start date: {} \n'.format(start_date))
  print('End date: {} \n'.format(end_date))
  report += 'Full report for the Term: {} \n\n'.format(period-1)
  report += 'Start date: {}  \n\n'.format(start_date)
  report += 'End date: {} \n\n'.format(end_date)
  print('Start Time: {}\n'.format(start_time))
  print('End Time: {}\n'.format(end_time))
  print('Start Block: {}\n'.format(last_council['electedAtBlock']))
  print('End Block: {}\n'.format(last_council['endedAtBlock']))
  report += 'Start Block: {} \n\n'.format(last_council['electedAtBlock'])
  report += 'End Block: {} \n\n'.format(last_council['endedAtBlock'])

  print('# Opening')
  num_openings, openings = get_new_opening(start_time, end_time)
  print('Number of openings: {}'.format(num_openings))
  report += '# Opening \n'
  report += 'Number of openings: {} \n'.format(num_openings)
  if num_openings > 0:
    tble = print_table(openings)
    report += tble+'\n'

  print('# Hiring')
  num_workers, hired_workers = get_new_hire(start_time, end_time)
  print('Number of hired works: {}'.format(num_workers))
  report += '# Hiring\n'
  report += 'Number of hired works: {}\n'.format(num_workers)
  if num_workers > 0:
    tble = print_table(hired_workers)
    report += tble+'\n'

  print('# Terminated workers')
  num_workers, terminated_workers = get_termination(start_time, end_time)
  print('Number of terminated workers: {}'.format(num_workers))
  report += '# Terminated workers \n'
  report += 'Number of terminated workers: {} \n'.format(num_workers)
  if num_workers > 0:
    tble = print_table(terminated_workers)
    report += tble+'\n'

  print('# Slashed workers')
  num_workers, slashed_workers = get_slashes(start_time, end_time)
  print('Number of slashed workers: {}'.format(num_workers))
  report += '# Slashed workers \n'
  report += 'Number of slashed workers: {} \n'.format(num_workers)
  if num_workers > 0:
    tble = print_table(slashed_workers)
    report += tble+'\n'

  print('# Rewards')
  report += '# Rewards\n'
  total_rewards,rewards =  get_rewards(start_time, end_time)
  print('Total Rewards: {}'.format(total_rewards))
  report += 'Total Rewards: {}\n'.format(total_rewards)
  tble = print_table(rewards)
  report += tble+'\n'
  
  print('# BUCKETS Info  ')
  report += '# BUCKETS Info  \n'
  buckets = get_backets(url)
  buckets_file = 'buckets_'+end_time
  with open(buckets_file, 'w') as file:
    json.dump(buckets, file)
    file.close()
  
  tble = print_table(buckets)
  report += tble+'\n'
  

  

  print('## BUCKETS CREATED')
  report += '## BUCKETS CREATED\n'
  buckets_created = get_backets(url,start_time,end_time,createdat = True)
  number_buckets_created = len(buckets_created)
  print('Bucket Created: {}'.format(number_buckets_created))
  report += 'Bucket Created: {}\n'.format(number_buckets_created)
  if number_buckets_created > 0:
    tble = print_table(buckets_created)
    report += tble+'\n'

  print('## BUCKETS DELETED')
  report += '## BUCKETS DELETED\n'
  buckets_deleted = get_backets(url,start_time,end_time,deletedat = True)
  number_buckets_deleted = len(buckets_deleted)
  print('Bucket Deleted: {}\n'.format(number_buckets_deleted))
  report += 'Bucket Deleted: {}\n'.format(number_buckets_deleted)
  if number_buckets_deleted > 0:
    tble = print_table(buckets_deleted)
    report += tble+'\n'

  print('## Bags')
  report += '## Bags\n'
  bags = get_bags_nums(start_time, end_time)
  print('Bags Created: {} \n'.format(bags['bag created']))
  print('Bags Deleted: {} \n'.format(bags['bags deleted']))
  report += 'Bags Created: {} \n\n'.format(bags['bag created'])
  report += 'Bags Deleted: {} \n\n'.format(bags['bags deleted'])
 
  print('# Objects Info during this Council Period')
  report += '# Objects Info during this Council Period \n'
  #print(get_objects(start_time,end_time))
  objects_num, total_size,sizes,sizes_range,bags_stats = objects_stats(start_time,end_time)
  print('Total Objects Size: {}\n'.format(objects_num))
  report += 'Total Objects Size: {} \n\n'.format(objects_num)
  print('Total Objects Size: {}\n'.format(total_size))
  report += 'Total Objects Size: {} bytes \n\n'.format(total_size)
  print('## Objects Size Distribution')
  report += '## Objects Size Distribution\n'
  tble = print_table([sizes])
  report += tble+'\n \r\n'
  print('\n')
  tble = print_table([sizes_range])
  report += tble+'\n'

  print('## Objects Size Distribution Per Bag')
  tble = print_table(bags_stats)
  report += '## Objects Size Distribution Per Bag \n'
  report += tble+'\n'

  print('# Total object Info')
  report += '# Total object Info \n'
  #print(get_objects(start_time,end_time))
  objects_num, total_size,sizes,sizes_range,bags_stats = objects_stats()
  print('Total Objects: {}\n'.format(objects_num))
  report += 'Total Objects: {} \n\n'.format(objects_num)
  print('Total Objects Size: {}\n'.format(total_size))
  report += 'Total Objects Size: {} bytes\n\n'.format(total_size)
  total_num_bags = len(bags_stats)
  print('Total Number of Bags in use: {}\n'.format(total_num_bags))
  report += 'Total Number of Bags in use: {} bytes\n\n'.format(total_num_bags)
  num, data = get_bags()
  created_bags ,deleted_bags = get_created_deleted_bags(data)
  num_created_bags = len(created_bags)
  num_deleted_bags = len(deleted_bags)
  total_num_bags = num_created_bags - num_deleted_bags
  print('Grand Total Number of Bags: {}\n'.format(total_num_bags))
  report += 'Grand Total Number of Bags: {} bytes\n\n'.format(total_num_bags)

  print('## Objects Size Distribution')
  report += '## Objects Size Distribution \n'
  tble = print_table([sizes])
  report += tble+'\n \r\n'
  print('\n')

  tble = print_table([sizes_range])
  report += tble+'\n'
  print('## Objects Size Distribution Per Bag')
  report += '## Objects Size Distribution Per Bag \n'
  tble = print_table(bags_stats, sort_key = 'total_size bytes')
  report += tble+'\n\n\n'

  image1_file = 'objects_size_{}'.format(end_date)
  image2_file = 'objects_number_{}'.format(end_date)
  get_draw_objects(image1_file, image2_file)
  report += '![objects sizes](./{}.png) \n'.format(image1_file)
  report += '![objects number](./{}.png)  \n'.format(image2_file)
  
  image3_file = 'bags_number_{}'.format(end_date)
  get_draw_bags(image3_file)
  report += '![objects sizes](./{}.png) \n'.format(image3_file)

  #print('# Lost Objects - Server compare')
  #report += '# Lost Objects - Server compare \n'
  master_objects = get_objects(start_time,end_time)
  #data = get_objects_files(file_server, operators, end_date, credential)
  #operators = load_objects_from_server(data)
  #operators_objects = []
  #for operator in operators:
  #  operators_objects = operators_objects + operator['objects']
  #lost = compare_objects(operators_objects, master_objects)
  total_objects = len(master_objects)
  #lost_object = len(lost)
  #print('Total Objects: {}\n'.format(total_objects))
  #print('Total Lost Objects: {}\n'.format(lost_object))
  #print('Percentage Lost Objects: %{}\n'.format(100*lost_object/total_objects))
  #if lost_object > 0:
  #  tble = print_table(lost, master_key = 'id')
  #report += 'Total Objects: {} \n\n'.format(total_objects)
  #report += 'Total Lost Objects: {} \n\n'.format(lost_object)
  #report += 'Percentage Lost Objects: %{} \n\n'.format(100*lost_object/total_objects)
  # report += tble+' \n'
  print('# Lost Objects - GraphQl')
  report += '# Lost Objects - GraphQl \n'
  number_lost, lost = get_lost(start_time,end_time)
  print('Total Objects: {}\n'.format(total_objects))
  print('Total Lost Objects: {}\n'.format(number_lost))
  print('Percentage Lost Objects: %{}\n'.format(100*number_lost/total_objects))
  if number_lost > 0:
    tble = print_table(lost, master_key = 'id')
  report += 'Total Objects: {} \n\n'.format(total_objects)
  report += 'Total Lost Objects: {} \n\n'.format(number_lost)
  report += 'Percentage Lost Objects: %{} \n\n'.format(100*number_lost/total_objects)
  report += tble+' \n'
  file_name = 'report_'+end_time+'.md'
  with open(file_name, 'w') as file:
    file.write(report)
    file.close()
