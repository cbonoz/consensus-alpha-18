# only use the lowest base for description
# facets should be coderanges, like chapter_coderane
# upload directly to CloudSearch instead of through dynamoDB
import json
import uuid
from copy import deepcopy
from pprint import pprint
import os
import boto3

max_items = 8000
batch_count = 1

items = []
with open('data/detailedCodes.json') as datafile:
    items = json.load(datafile)

# Editing for unique ids
# for item in items:
#     item['id'] = str(uuid.uuid4())
# with open('data/detailedCodes.json', 'w') as datafile:
#     json.dump(items, datafile, indent=4, sort_keys=True)

# CREATING BATCHES
batch_items = []
for idx, item in enumerate(items):
    if (idx != 0 and idx % max_items == 0) or (idx == len(items)-1):
        #save current data into new file, wipe current holder
        batch_file = "data/batches/batch" + str(batch_count) + ".json"
        with open(batch_file, 'w') as batchfile:
            json.dump(batch_items, batchfile, indent=4, sort_keys=True)
        batch_items = []
        batch_count += 1
    batch_items.append(item)

#CREATING DYNAMODB JSON
dynamodb = []
for itm in items:
    del itm['type']
    dynamodb.append(itm)
with open('data/icd_codes_for_dynamodb.json', 'w') as outfile:
    json.dump(dynamodb, outfile, indent=4, sort_keys=True)

#CREATING DELETE BATCHES
for batch_num in range(1,10):
    file_name = 'data/batch/batch' + str(batch_num) + '.json'
    with open(file_name) as datafile:
        items = json.load(datafile)
    delete_items = []
    for item in items:
        add = {
            "type": "delete",
            "id" : item["id"]
        }
        delete_items.append(add)
    delete_file_name = 'data/batches/batch' + str(batch_num) + 'delete.json'
    with open(delete_file_name, 'w') as outfile:
        json.dump(delete_items, outfile, indent=4, sort_keys=True)
