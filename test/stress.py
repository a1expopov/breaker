#!/usr/bin/python
import threading as th
import urllib2
import Queue
import redis
import random
import sys
import json

queue = Queue.Queue()
outputs = Queue.Queue()

class Worker(th.Thread):

  def run(self):
    while True:
      q = queue.get()
      r = urllib2.urlopen("http://localhost:8080/suggest?company={}".format(q))
      outputs.put((q, json.loads(r.read())))
      queue.task_done()

server = redis.Redis()
i = 0
ceil = server.zcard("autocomplete") - 1
while i < int(sys.argv[1]):
  ind = random.randint(0, ceil)
  f = server.zrange("autocomplete", ind, ind)[0]
  if not "*" in f:
    print f
    queue.put(f)
    i += 1

n = 10
for i in range(n):
  w = Worker()
  w.setDaemon(True)
  w.start()

queue.join()

while True:
  try:
    pair = outputs.get_nowait()
  except Queue.Empty:
    break
  else:
    print pair[0], pair[1]
