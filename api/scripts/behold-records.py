import boto3
from faker import Factory
fake = Factory.create()

dynamodb = boto3.resource('dynamodb')

table = dynamodb.Table('behold-records')

table.meta.client.get_waiter('table_exists').wait(TableName='behold-records')

with table.batch_writer() as batch:
  cliendIDList = [
    'google-oauth2|109562365479342355339',
    'google-oauth2|112074212990640336524',
    'google-oauth2|115195216205362144230',
		'google-oauth2|115032836871617936031'
  ]
  n = len(cliendIDList)
  for i in range(30):
    batch.put_item(
      Item={
    'user_id': cliendIDList[i%n],
    'id': fake.uuid4(),
    'creation_time': i * 1000,
    "messageType": "DFT",
	"Event": {
		"segmentTypeID": "EVN",
		"eventTypeCode": "P03",
		"recordedDateTime": {
			"year": 2017,
			"month": 4,
			"day": 12,
			"hour": 14,
			"minute": 13,
			"second": 43
		},
		"eventReasonCode": "N/A"
	},
	"Patient": {
		"ecwMrn": "123456789",
		"patientID": fake.uuid4(),
		"name": {
			"firstName": fake.first_name(),
			"lastName": fake.last_name(),
			"middleName": "SampleMiddle"
		},
		"dob": {
			"year": fake.day_of_month(),
			"month": fake.month(),
			"day": fake.year()
		},
		"sex": "M",
		"race": "White",
		"address": {
			"street1": fake.street_address(),
			"street2": fake.secondary_address(),
			"city": fake.city(),
			"state": fake.state_abbr(),
			"zip": fake.zipcode()
		},
		"primaryContact": {
			"phone": fake.phone_number(),
			"email": fake.email()
		},
		"otherContacts": [
			{
				"phone": fake.phone_number(),
				"email": fake.email()
			}, {
				"phone": fake.phone_number(),
				"email": fake.email()
			}
		],
      "primaryLanguage": "English",
      "maritalStatus": "Married",
      "encounterAccountNumber": {
        "patientID": "32801465",
        "assigningAuthority": "AA"
      },
      "ssn": "999999999",
      "ethnicity": "Non Hispanic",
      "defaultFacilityID": "8bbde90e",
      "statementFlag": "Flag",
      "statementSignatureDate": {
        "year": 2017,
        "month": 4,
        "day": 12
      },
      "previousName": "PreviousLastName"
    },
     "PatientVisit": {
      "assignedPatientLocation": {
        "code": "loc12345",
        "description": "AssignedPatientLocationDescription"
      },
      "primaryCareDoctor": {
        "providerID": "12345",
        "lastName": "DrCareFamily",
        "firstName": "DrCareGiven",
        "middleName": "DrCareMiddle",
        "suffix": "Jr.",
        "prefix": "Dr"
      },
      "referringProvider": {
        "providerID": "12345",
        "lastName": "DrReferringFamily",
        "firstName": "DrReferringGiven",
        "middleName": "ReferringMiddle",
        "suffix": "Jr.",
        "prefix": "Dr"
      },
      "renderingProvider": {
        "providerID": "12345",
        "lastName": "DrConsultingFamily",
        "firstName": "DrConsultingGiven",
        "middleName": "ConsultingMiddle",
        "suffix": "Jr.",
        "prefix": "Dr"
      },
      "externalVisitID": "c63655d5087",
      "admitDateTime": {
        "year": 2017,
        "month": 4,
        "day": 12,
        "hour": 14,
        "minute": 13,
        "second": 43
      },
      "alternateVisitID": "e95cfd1d082"
    },
    "FinancialTransaction": [{
      "sequenceNumber": 44,
      "transactionDateTime": {
        "year": 2017,
        "month": 4,
        "day": 12,
        "hour": 14,
        "minute": 13,
        "second": 43
      },
      "transactionPostingDate": {
        "year": 2017,
        "month": 4,
        "day": 12,
        "hour": 14,
        "minute": 13,
        "second": 43
      },
      "type": "CG",
      "CPTCode": "96999",
      "quantity": "730",
      "departmentCode": "DepartmentId",
      "assignedPatientLocation": {
        "code": "cc920ff",
        "description": "LocationDescription"
      },
      "diagnosisCode": {
        "icd10CMCodes": [{
          "code": "A02.23",
          "description": "Salmonella arthritis"
        }, {
          "code": "B42.82",
          "description": "Sporotrichosis arthritis"
        }, {
          "code": "B06.82",
          "description": "Rubella arthritis"
        }, {
          "code": "M00.159",
          "description": "Pneumococcal arthritis, unspecified hip"
        }]
      },
      "performedBy": {
        "code": "Code",
        "firstName": "SampleFirst",
        "lastName": "SampleFirst",
        "middleName": "SampleFirst"
      },
      "orderingProvider": {
        "code": "Code"
      },
      "unitCost": "12.00",
      "procedureCode": "21263",
      "modifier": {
        "codes": [{
          "code": "22",
          "description": "Unusual procedural services"
        }, {
          "code": "33",
          "description": "Preventive service"
        }, {
          "code": "62",
          "description": "Two surgeons"
        }, {
          "code": "59",
          "description": "Distinct procedural service"
        }]
      }
    }],
     "Diagnosis": [{
      "icd10CMCodes": [{
        "code": "A02.23",
        "description": "Salmonella arthritis"
      }, {
        "code": "B42.82",
        "description": "Sporotrichosis arthritis"
      }, {
        "code": "B06.82",
        "description": "Rubella arthritis"
      }, {
        "code": "M00.159",
        "description": "Pneumococcal arthritis, unspecified hip"
      }]
    }],
       "Guarantor": {
      "id": "2134344",
      "name": {
        "firstName": "SampleFirst",
        "lastName": "SampleFirst",
        "middleName": "SampleFirst"
      },
      "dob": {
        "year": 2017,
        "month": 4,
        "day": 12
      },
      "sex": "M",
      "relationship": "2",
      "address": {
        "street1": "123 Main Str",
        "street2": "NE",
        "city": "Westboro",
        "state": "MA",
        "zipCode": "01581"
      },
      "primaryContact": {
        "phone": "5085085085",
        "email": "person@mail.com"
      },
      "otherContacts": [{
        "phone": "5085085085",
        "email": "person@mail.com"
      }, {
        "phone": "5085085085",
        "email": "person@mail.com"
      }]
    },
     "InsuranceGroup": [{
      "planID": "1234568",
      "companyID": "9876543",
      "coverageType": "C",
      "name": "Medicare",
      "address": {
        "street1": "PO Box",
        "street2": "981204",
        "city": "El Paso",
        "state": "TX",
        "postalCode": "79998"
      },
      "groupNumber": "0",
      "nameInsured": {
        "firstName": "SampleFirst",
        "lastName": "SampleFirst",
        "middleName": "SampleFirst"
      },
      "relationshipToPatient ": "2",
      "insuredAddress": {
        "street1": "123 Main Str",
        "street2": "NE",
        "city": "Westboro",
        "state": "MA",
        "postalCode": "01581"
      },
      "policyNumber": "123456"
    }, {
      "planID": "1234568",
      "companyID": "9876543",
      "coverageType": "C",
      "name": "Medicare",
      "address": {
        "street1": "PO Box",
        "street2": "981204",
        "city": "El Paso",
        "state": "TX",
        "postalCode": "79998"
      },
      "groupNumber": "0",
      "nameInsured": {
        "firstName": "SampleFirst",
        "lastName": "SampleFirst",
        "middleName": "SampleFirst",
        "suffix": "Jr."
      },
      "relationshipToPatient ": "2",
      "insuredAddress": {
        "street1": "123 Main Str",
        "street2": "NE",
        "city": "Westboro",
        "state": "MA",
        "postalCode": "01581"
      },
      "policyNumber": "123456"
    }]
   } 
 )