# [BEHOLD.AI](http://behold.ai) #

## Development
This README documents whatever steps are necessary to get your application up and running.
```
npm install
```
This README documents whatever steps are necessary to get your application up and running.
```
nodemon main.js
```

## Deployment
+ CD into the app directory.
```
cd behold-api/app
```
+ Zip the contents of the entire - including the `.ebextensions/` file. Name the zip file according to the following connvention.
```
zip -r "behold-api_$(date -u +"%FT%TZ").zip" * .ebextensions/
```

+ Upload to Amazon AWS S3 bucket `assets.behold.ai`
```
aws s3 cp behold-api\ 2017-04-25T13\:58\:41Z.zip s3://assets.behold.ai/api/elastic-beanstalk-versions/
```

+ Upload the application to Elastic Beanstalk application `behold-api`
```
aws elasticbeanstalk create-application-version --application-name behold-api --version-label "behold-api 2017-04-25T13:58:41Z" --source-bundle S3Bucket="assets.behold.ai",S3Key="api/elastic-beanstalk-versions/behold-api 2017-04-25T13:58:41Z.zip" --no-auto-create-application --process
```

+ Deploy the application to Elastic Beanstalk application `behold-api`
```
aws elasticbeanstalk update-environment --environment-name api-behold --version-label "Sample Application"
```


### REGEX BRANCH:
For the regex branch, OCR parsing is set up for PDFs and will be uploaded to Behold.ai's own database.

Once you have run ```npm start``` in your terminal, open another terminal session and run
```
curl -X POST http://localhost:8080/api/latest/ocr -F 'file=@INSERT_PATH_TO_PDF'
```
Please make sure to udse 'file=@', as this is necessary for both curl and our program. Then, simply wait for the OCR JSON results. Depending on the number of PDFs you give the program, it may take 1-3 minutes to see results.
