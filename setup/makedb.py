#!/usr/bin/python
import sys
import csv
import redis
import re
import json

server = redis.Redis()
server.flushall()

with open(sys.argv[1]) as fp:

  for row in csv.DictReader(fp):
    domain = row['email'].split('@')[1].lower()
    format = row['format'] + '@' + domain

    server.zadd("domains", domain, 0)

    server.hmset("meta:{}".format(domain),
      {"primary": format,
       "domain": domain,
       "tld": domain.split(".")[-1]
      }
    ) 

    server.zadd("raw:mail:{}".format(domain), row['email'], 0)

    for i in range(len(domain) - 1):
      prefix = domain[0:(i + 1)]
      server.zadd("autocomplete", prefix, 0)
    server.zadd("autocomplete", domain + "*", 0)   
