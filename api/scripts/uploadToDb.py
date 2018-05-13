import json
import uuid
from copy import deepcopy
from pprint import pprint
import os
import boto3

# SETUP
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('ICD-10-CM-codes')
data = []

# Load JSON of all codes
filepath = '/Users/radhikamattoo/Desktop/icd_10_cm_codes.json'
with open(filepath) as datafile:
    data = json.load(datafile)

# Query DynamoDB for a code
def fetchItem(test_id, test_code):
    try:
        response = table.get_item(
            Key={
                'id': test_id,
                'icd_10_cm_code' : test_code
            }
        )
        item = response['Item']
        return item
    except Exception as e:
        return e

# Batch write the JSON of codes to DynamoDB
startIndex = 0 #in case the upload fails during - easy restart
with table.batch_writer() as batch:
    for idx, item in enumerate(data):
        if idx >= startIndex:
            batch.put_item(
                Item = {
                    'id': item['id'],
                    'category': item['fields']['category'],
                    'icd_10_cm_code': item['fields']['icd_10_cm_code'],
                    'chapter_coderange': item['fields']['chapter_coderange'],
                    'block_coderange': item['fields']['block_coderange'],
                    'icd_10_cm_description': item['fields']['icd_10_cm_description']
                }
            )
            print "Uploaded item:" + item['fields']['icd_10_cm_code'] + " at index " + str(idx)
print "Finished batch writing to ICD-10-CM-codes table."

# Test that all items have been uploaded
row_count = len(data) - 1
test_id = data[row_count]['id']
test_code = data[row_count]['fields']['icd_10_cm_code']
print fetchItem(test_id, test_code)
