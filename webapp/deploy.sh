

DATE_STAMP=`date -u '+%Y-%m-%d_%Hhrs-%M-%S'`
APP_VERSION="behold-webapp_${DATE_STAMP}"
APP_VERSION_FILE="behold-webapp_${DATE_STAMP}.zip"

S3_BUCKET="elasticbeanstalk.behold.ai"
S3_DIR="webapp/elastic-beanstalk-versions"
S3_KEY="${S3_DIR}/${APP_VERSION_FILE}"
S3_PATH="s3://${S3_BUCKET}/${S3_DIR}/"

EB_ENV_NAME="behold-webapp"
EB_APP_NAME="Behold.ai WebApp"

export AWS_PROFILE=peter-new-behold
export AWS_DEFAULT_REGION=eu-west-2

# +44-7479-646157
# +44-7575-542255

rm -r *behold-webapp*
set -e
npm run deploy:prod
echo "Creating Zip files ${APP_VERSION}"
cd server
zip -r --exclude=*node_modules*  "../${APP_VERSION_FILE}" *
echo `pwd`
cd ../
zip -r "${APP_VERSION_FILE}" dist .ebextensions/
echo "Uploading to S3: ${S3_PATH}"
aws s3 cp "${APP_VERSION_FILE}" "${S3_PATH}"

echo "Uploading the application to Elastic Beanstalk application: ${EB_APP_NAME}"
aws elasticbeanstalk create-application-version \
  --application-name "${EB_APP_NAME}" \
  --version-label "${APP_VERSION}" \
  --source-bundle S3Bucket="$S3_BUCKET",S3Key="${S3_KEY}" \
  --no-auto-create-application \
  --process

 echo "Deploy the application to Elastic Beanstalk application: ${EB_ENV_NAME}"
 aws elasticbeanstalk update-environment \
  --environment-name "${EB_ENV_NAME}" \
  --version-label "${APP_VERSION}"
