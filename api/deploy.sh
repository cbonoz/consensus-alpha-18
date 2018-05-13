DATE_STAMP=`date -u '+%Y-%m-%d_%Hhrs-%M-%S'`
APP_VERSION="behold-reddot_${DATE_STAMP}"
APP_VERSION_FILE="behold-api_${DATE_STAMP}.zip"

S3_BUCKET="elasticbeanstalk.behold.ai"
S3_DIR="api/elastic-beanstalk-versions"
S3_KEY="${S3_DIR}/${APP_VERSION_FILE}"
S3_PATH="s3://${S3_BUCKET}/${S3_DIR}/"

EB_ENV_NAME="beholdai-reddot"
EB_APP_NAME="Red Dot Elastic Beanstalk Service"

export AWS_PROFILE=peter-new-behold
export AWS_DEFAULT_REGION=eu-west-2

rm -r *behold-*zip

echo "Creating Zip files ${APP_VERSION}"
zip -r "${APP_VERSION_FILE}" * .ebextensions/

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
