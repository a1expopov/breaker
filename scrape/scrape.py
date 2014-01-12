#!/usr/bin/python
import re
import urllib2

url = urllib2.urlopen('http://www.thecreativeham.com/agencies/new-york.php')
doc = url.read()

domains = [domain for www, domain in re.findall('<td><a href="http://(www\.)?(.+?)/?"[^>]+>', doc)]

with open('scraped-domains.txt', 'wb') as fp:
  fp.write('\n'.join(domains))
