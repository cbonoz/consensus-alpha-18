#Need to iterate further into HTML pages for specific codes
import requests
from bs4 import BeautifulSoup
import json
import uuid
from copy import deepcopy
import os

icd10dataBaseUrl = "http://www.icd10data.com/ICD10CM/Codes"
page = requests.get(icd10dataBaseUrl)
soup = BeautifulSoup(page.content, 'html.parser')
codeList = []
codeIdentifiers = soup.findAll("ul")
cutoff = 14

def getCodes(subcodeUrl, subcodeItem):
    codePage = requests.get(subcodeUrl)
    codeSoup = BeautifulSoup(codePage.content, 'html.parser')
    codeBody = codeSoup.find('div', {"class": "codeDetail"})
    print subcodeUrl
    codeItem = deepcopy(subcodeItem)
    icd_code = codeBody.find("span", {"class": "identifier2"}).get_text()
    icd_description = codeBody.find('h1', {"class": "codeIdentifier"}).find_next_sibling().find('h2').get_text()

    codeItem['fields']['icd_10_cm_code'] = icd_code
    codeItem['fields']['icd_10_cm_code_description'] = icd_description

    codeList.append(codeItem)

def getSubcodes(parentUrl, parentItem):
    subcodePage = requests.get(parentUrl)
    subcodeSoup = BeautifulSoup(subcodePage.content, 'html.parser')
    subcodeBody = subcodeSoup.findAll("div", {"class" : "contentBlurb"})
    greenArrow = "/images/bullet_triangle_green.png"
    redArrow = "/images/bullet_triangle_red.png"
    for subcodeBlurb in subcodeBody:
        if(subcodeBlurb.findAll('div', {"class" : "codeDetail"})):
            for subcode in list(subcodeBlurb.findAll('div', {"class": "nowrap"})):
                try:
                    arrow = subcode.find('img', {"class": "img specificImage"})['src']
                except TypeError:
                    if(subcode.find('img', {"class": "img divTextHelp"})):
                        continue
                    else:
                        recursiveUrl =  icd10dataBaseUrl + subcode.find('span', {"class": "codeHierarchyIdentifier identifier"}).find('a', {"class": "identifier"})['href']
                        getSubcodes(recursiveUrl, parentItem)
                if(arrow == greenArrow):
                    #enter that href and pass into getCodes
                    codeUrl = icd10dataBaseUrl + subcode.find('span', {"class": "codeHierarchyIdentifier"}).find('a', {"class": "identifier"})['href']
                    getCodes(codeUrl, parentItem)
                else:
                    continue

def getParents(blockUrl, blockItem):
  parentList = []
  parentPage = requests.get(blockUrl)
  parentSoup = BeautifulSoup(parentPage.content, 'html.parser')
  parentBody = parentSoup.findAll("div",{"class" : "contentBlurb"})
  for parentBlurb in parentSoup.findAll("div",{"class" : "contentBlurb"}):
    if (parentBlurb.findAll('ul',{"class" : "noTopPadding"}) ):
      for parent in list(parentBlurb.findAll('li')):
        parentItem = deepcopy(blockItem)
        parentItem['fields']['category_description'] = parent.contents[3].strip()
        parentItem['fields']['category'] = parent.find("a").contents[0].strip()
        parentItem['id'] = str(uuid.uuid4())
        parentUrl = icd10dataBaseUrl +  parent.find("a")['href']
        codes = getSubcodes(parentUrl, parentItem)


def getBlocks(chapterUrl, chapterItem):
  blockList = []
  blockPage = requests.get(chapterUrl)
  blockSoup = BeautifulSoup(blockPage.content, 'html.parser')
  blockBody = blockSoup.findAll("div",{"class" : "contentBlurb"})

  for blockBlurb in blockSoup.findAll("div",{"class" : "contentBlurb"}):
    if (blockBlurb.findAll('ul',{"class" : "noTopPadding"}) ):
      for block in list(blockBlurb.findAll('li')):
        blockItem = deepcopy(chapterItem)
        blockItem['fields']['block_description'] = block.contents[3].strip()
        blockItem['fields']['block_coderange'] = block.find("a").contents[0].strip()
        blockUrl = icd10dataBaseUrl +  block.find("a")['href']
        parents = getParents(blockUrl, blockItem)



with open('data/detailedCodes.json') as jsonfile:
    codeList = json.load(jsonfile)

for chapter in list(codeIdentifiers):
  if (chapter.findPreviousSibling('h1',{"class" : "codeIdentifier"}) ):
    chapterItems = chapter.findAll("li")
    for idx, chptItem in enumerate(list(chapterItems)):
        if (idx >= cutoff):
            chapterItem = {}
            cloudSearchEntry = {
              'type': 'add',
            }
            chapterUrl = icd10dataBaseUrl + "/" + chptItem.find("a")['href']
            chapterItem["chapter_description"] = chptItem.contents[3].strip()
            chapterItem["chapter_coderange"] = chptItem.find("a").contents[0].strip()
            cloudSearchEntry['fields'] = chapterItem
            print chapterItem["chapter_coderange"] , idx
            blocks = getBlocks(chapterUrl, cloudSearchEntry)
            with open('data/detailedCodes.json', 'w') as outfile:
              json.dump(codeList, outfile, indent=4, sort_keys=True)
