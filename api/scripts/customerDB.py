import requests
from bs4 import BeautifulSoup
from collections import deque
from threading import Thread, Lock
import multiprocessing, logging
from multiprocessing import Pool, TimeoutError, Queue
import time
import os
import xml.etree.ElementTree as ET
from lxml import html
import re
import pprint





logger = multiprocessing.log_to_stderr()
logger.setLevel(logging.INFO)

def getLinks(url, depth):
  links = []
  visited_dict[url] = 0
  try:
    page = requests.get(url)
    html_content = html.fromstring(page.content)
    for (element, attribute, link, pos) in html_content.iterlinks():
      if link.startswith( 'http' ):
        links.append(link)
  except:
    logger.error("Error" + url)
#   logger.info("Founds links: " + str(len(links)))
  return links

if __name__ == '__main__':
  baseUrl = "http://www.alexa.com/topsites"
  visited_dict = {}
  q = Queue()
  q.put(baseUrl)
  with Pool() as pool:
    depth = 0
    max_depth = 30
    for depth in range(max_depth):
      res_list = []
      while not q.empty():
        link = q.get()
        if link in visited_dict:
          visited_dict[link] += 1
        else:
          visited_dict[link] = 0
          res = pool.apply_async(getLinks,(link,))
          res_list.append(res)    
      try:
        for res in res_list:
          for link in res.get(timeout=5):
            q.put(link)
      except TimeoutError:
          logger.error(TimeoutError)
          
          
  print(q.qsize())
  while not q.empty():
    link = q.get()
    if link in visited_dict:
      visited_dict[link] += 1
    else:
      visited_dict[link] = 0
      
  plainLinks = {}
  for key in visited_dict:
    # Get every part of the link up to the TLD
    pattern = re.compile("http(s*)://([a-zA-Z0-9_\.]*)")
    match = re.match(pattern, key)
    if match:
      _link = match.group(0)
      pattern = re.compile("(?:http(s*)://)(((.*)[a-zA-Z]*)\.{1}\w+$)")      
      match = re.match(pattern, _link)
      if match:
        base_url = match.group(2).split('.')
        base_url = base_url[-2]+"."+base_url[-1]
        plainLinks[base_url] = plainLinks[base_url] + 1 if base_url in plainLinks else 0
       
  pprint.pprint( plainLinks )
  print("Now the pool is closed and no longer available")

