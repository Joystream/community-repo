import requests
import json
#import csv
from tabulate import tabulate
from itertools import groupby
from operator import itemgetter
import time

url = 'https://query.joystream.org/graphql'
#url = 'https://query.joystream.org/graphql'
file_name = "{}-12:00-objects.txt"
file_server = "http://87.236.146.74:8000/"
credential = {'username': '', 'password' :'joystream'}
query_group = "storageWorkingGroup"

#def queryGrapql(query, url= 'https://query.joystream.org/graphql' ):
def queryGrapql(query, url= 'https://query.joystream.org/graphql' ):
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
  return data[-1], data[-2], data[-3], data[-4], period

def get_bucket_url():
  query = {"query":'query MyQuery{ storageBuckets { id operatorMetadata { nodeEndpoint}  }}'}
  data  = queryGrapql(query, url)['storageBuckets']
  result = {}
  for item in data:
    result[item['id']] = item['operatorMetadata']['nodeEndpoint']
  return result
   

def get_objects_count(start_time='', end_time=''):
  if start_time and end_time :
      query = {"query": 'query MyQuery {{ storageDataObjectsConnection ( where: {{isAccepted_eq: true,createdAt_gt: "{}" , createdAt_lt: "{}"}}) {{  totalCount  }} }}'.format(start_time, end_time) }
  else:
      query = {"query": 'query MyQuery { storageDataObjectsConnection ( where: {isAccepted_eq: true}) {  totalCount }}' }
  data = queryGrapql(query)['storageDataObjectsConnection']["totalCount"]
  return data

def get_objects(start_time='',end_time='',obj_count=33000, limit=33000, bucket=''):
  import math
  loop= math.ceil(obj_count/limit)
  offset=0
  obj_data=[]
  for i in range(loop):
    if start_time and end_time :
      query_created = {"query":'query MyQuery {{ storageDataObjects(limit: {}, offset: {}, orderBy: createdAt_ASC,where: {{isAccepted_eq: true, createdAt_gt: "{}" , createdAt_lt: "{}"}}) {{ createdAt size id storageBagId storageBag {{ storageBuckets {{ id }} }} }} }}'.format(limit, offset, start_time, end_time) }
      objs_file = 'objs_'+start_time
    else :
      query_created = {"query":'query MyQuery {{ storageDataObjects(limit: {}, offset: {}, orderBy: createdAt_ASC, where: {{isAccepted_eq: true}}) {{ createdAt deletedAt size id storageBagId storageBag {{ storageBuckets {{ id }} }} }} }}'.format(limit, offset) }
      objs_file = 'objs_all'
    objects_created  = queryGrapql(query_created)['storageDataObjects']
    obj_data += objects_created
    offset += limit
  temp=[]
  if bucket :
     for obj in obj_data:
       buckets = obj["storageBag"]["storageBuckets"]
       for item in buckets:
         if item["id"]==bucket:
           temp.append(obj)
     obj_data = temp
     objs_file = 'objs_'+bucket
  with open(objs_file, 'w') as file:
    json.dump(obj_data, file)
    file.close()
  return obj_data

def get_object_list(obj_data):
  objs = []
  for item in obj_data:
    objs.append(item['id'])
  objs.sort()
  return objs

def get_objs_node(bucket, url):
  url = url+'api/v1/state/data-objects'
  #print(url)
  response = requests.get(url)
  #response.sort()
  result = response.json()
  objs_file = 'objs_node_bucket_'+bucket
  with open(objs_file, 'w') as file:
    json.dump(result, file)
    file.close()
  return result
 
def get_all_objs_nodes():
  urls = get_bucket_url()
  all_objs_nodes_dic={}
  all_objs_nodes = []
  for item in urls:
    url = urls[item]
    objs = get_objs_node(item,url)
    print('Object for bucket {} -- {}'.format(item,len(objs)))
    all_objs_nodes_dic[item]=objs
    all_objs_nodes = list(set(all_objs_nodes) | set(objs))
  all_objs_nodes.sort()
  objs_file = 'objs_node_bucket_all'
  with open(objs_file, 'w') as file:
    json.dump(all_objs_nodes, file)
    file.close()
  print('Total objects {}'.format(len(all_objs_nodes)))
  return all_objs_nodes,all_objs_nodes_dic

def get_lost_objs(obj_data, objs_all_nodes):
  #objs_all_nodes_set = set(objs_all_nodes)
  #print(obj_data)
  time.sleep(5.5)
  #print(objs_all_nodes)
  objs = get_object_list(obj_data)
  result = [x for x in  objs if x not in objs_all_nodes]
  print('lost results {}'.format(result))
  return result


if __name__ == '__main__':
  #last_council,previous_council,previous2_council,previous3_council,  period = get_councils_period(url)
  #report = ''
  #first_time = first_council['electedAtTime']
  #start_time = last_council['electedAtTime']
  #end_time   = last_council['endedAtTime']
  #start_date = start_time.split('T')[0]
  #end_date = end_time.split('T')[0]
  #previous_start_time = previous_council['electedAtTime']
  #previous_end_time   = previous_council['endedAtTime']
  #file_name = 'report-'+end_time
  #print(start_time)
  #print(end_time)
  #print('Full report for the Term: {} \n\n'.format(period-1))
  #print('Start date: {} \n'.format(start_date))
  #print('End date: {} \n'.format(end_date))
  #print('Start Time: {}\n'.format(start_time))
  #print('End Time: {}\n'.format(end_time))
  #print('Start Block: {}\n'.format(last_council['electedAtBlock']))
  #print('End Block: {}\n'.format(last_council['endedAtBlock']))
  
  #objects_num_qn = get_objects_count(start_time,end_time)
  #print(objects_num_qn)
  #obj_data=get_objects(start_time,end_time,objects_num_qn)
  ##objs = get_object_list(obj_data)
  #objs_all_nodes = get_all_objs_nodes()
  #lost = get_lost_objs(obj_data, objs_all_nodes)
  #print('Number Lost Objects {}'.format(len(lost)))
  last_council,previous_council,previous2_council,previous3_council,  period = get_councils_period(url)
  #start_times=[last_council['electedAtTime'],previous_council['electedAtTime'],previous2_council['electedAtTime']]
  #end_times=[last_council['endedAtTime'],previous_council['endedAtTime'],previous2_council['endedAtTime']]
  start_time = last_council['electedAtTime']
  end_time   = last_council['endedAtTime']
  previous_start_time = previous_council['electedAtTime']
  previous_end_time   = previous_council['endedAtTime']
  #print(start_times)
  #print(end_times)
  print('Full report for the Term: {} \n\n'.format(period))
  print('Start Time: {}\n'.format(start_time))
  print('End Time: {}\n'.format(end_time))
  print('Start Block: {}\n'.format(last_council['electedAtBlock']))
  print('End Block: {}\n'.format(last_council['endedAtBlock']))


  objs_all_nodes,objs_all_nodes_dic = get_all_objs_nodes()
  #for start_time,end_time in zip(start_times,end_times):
  #print('Start Time {} and End Time {}'.format(start_time, end_time))
  objects_num_qn = get_objects_count()
  print('Number of All Objectsi  in nodes {}'.format(objects_num_qn))
  print('All objetcs collection in progress---->')
  obj_data=get_objects()
  lost = get_lost_objs(obj_data, objs_all_nodes)
  print('Number Lost Objects {}'.format(len(lost)))

  #for start_time,end_time in zip(start_times,end_times):
  objects_num_qn = get_objects_count(start_time,end_time)
  print('Number of Period {} Objects {}'.format(start_time, objects_num_qn))
  print('Period objetcs collection in progress---->')
  obj_data=get_objects(start_time,end_time,objects_num_qn) 
  print('Period Lost search in progress---->')
  lost = get_lost_objs(obj_data, objs_all_nodes)
  print('Number Lost Objects {}'.format(len(lost)))

  for bucket,objs_node in objs_all_nodes_dic.items():
    print('Bucket {} objetcs collection in progress---->'.format(bucket))
    obj_data=get_objects(bucket=bucket)
    print('Bucket {} Lost search in progress---->'.format(bucket))
    lost = get_lost_objs(obj_data, objs_node)
    print('Number Lost Objects {}'.format(len(lost)))

