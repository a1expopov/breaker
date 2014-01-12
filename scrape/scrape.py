#!/usr/bin/python
import re
import urllib2

url = urllib2.urlopen('http://www.thecreativeham.com/agencies/new-york.php')
doc = url.read()

domains = re.findall('<td><a href="([^"]+)"[^>]+>', doc)
print domains
