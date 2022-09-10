import requests
import json
#import csv
from tabulate import tabulate
from itertools import groupby
from operator import itemgetter
import numpy as np

url = 'https://joystream2.yyagi.cloud/graphql'
#url = 'https://query.joystream.org/graphql'
file_name = "{}-12:00-objects.txt"
file_server = "http://87.236.146.74:8000/"
operators = [{'id':"0x2bc", 'bucket': 16},{'id':"alexznet", 'bucket': 2},{'id':"Craci_BwareLabs", 'bucket': 10},{'id':"GodsHunter", 'bucket': 6},{'id':"joystreamstats", 'bucket': 1},{'id':"l1dev", 'bucket': 4},{'id':"maxlevush", 'bucket': 3},{'id':"mmx1916", 'bucket': 9},{'id':"razumv", 'bucket': 11},{'id':"yyagi", 'bucket': 17}, {'id':"sieemma", 'bucket': 12} ]
credential = {'username': '', 'password' :'joystream'}
query_group = "storageWorkingGroup"
max_backets = 5 

#def queryGrapql(query, url= 'https://query.joystream.org/graphql' ):
def queryGrapql(query, url= 'https://joystream2.yyagi.cloud/graphql' ):
  headers = {'Accept-Encoding': 'gzip, deflate, br', 'Content-Type': 'application/json',
           'Accept': 'application/json',  'Connection': 'keep-alive', 'DNT': '1',
                   'Origin': 'https://query.joystream.org' }
  response = requests.post(url, headers=headers, json=query)
  return response.json()['data']


def get_bags(start_time='', end_time=''):
  if start_time and end_time :
    query = {"query": 'query MyQuery {{ storageBags( limit: 33000, offset: 0, where: {{createdAt_gt: "{}" , createdAt_lt: "{}"}}) {{  storageBuckets  {{ id }} id deletedAt  }} }}'.format(start_time, end_time) }
  else:
    query = {"query": 'query MyQuery { storageBags( limit: 33000, offset: 0) {  storageBuckets  { id } id deletedAt  }} ' }
    data = queryGrapql(query)['storageBags']
    return data

def get_objects(start_time='',end_time=''):
  if start_time and end_time :
    query_created = {"query":'query MyQuery {{ storageBags(limit: 33000, offset: 0,where: {{createdAt_gt: "{}" , createdAt_lt: "{}"}}) {{ storageBuckets  {{ id }} id }} }}'.format(start_time, end_time) }
  else :
    query_created = {"query":'query MyQuery { storageBags(limit: 33000, offset: 0) { storageBuckets  { id } id } }' }
  objects_created  = queryGrapql(query_created)['storageBags']
  for obj in objects_created:
    obj['storageBagId'] = obj['storageBagId'].split(":")[2]
  return objects_created


def get_bags_nums(start_time = '', end_time = ''):
  data_created, data_deleted = {},{}
  if start_time and end_time :
    query_created = {"query": 'query MyQuery {{ storageBags( limit: 33000, offset: 0, where: {{createdAt_gt: "{}" , createdAt_lt: "{}"}}) {{  storageBuckets  {{ id }} id deletedAt }} }}'.format(start_time, end_time) }
  else :
    query_created = {"query": 'query MyQuery { storageBags(limit: 33000, offset:0) {  storageBuckets  { id } id deletedAt} }'}
  data_created  = queryGrapql(query_created)['storageBags']
  return data_created 

def sort_bags_nums(data):
  for record in data:
    i = 0
    for item in record['storageBuckets']:
      record['storageBuckets_'+str(i)] = item['id']
      i += 1
    while i < max_backets :
      record['storageBuckets_'+str(i)] = 'X'
      i += 1
    record.pop('storageBuckets')
  return data 
  
def print_bags():
  data = get_bags()
  data = sort_bags_nums(data)
  print_table(data, master_key = 'id', sort_key = 'id')

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
    except UnicodeEncodeError:
        result = tabulate(table, headers, tablefmt="grid")
        print(result)

if __name__ == '__main__':
  print_bags()
