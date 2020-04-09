import AWS from 'aws-sdk';

AWS.config = new AWS.Config();
AWS.config.credentials = {
    secretAccessKey: process.env.AWS_SECRET,
    accessKeyId: process.env.AWS_ID
};
AWS.config.region = "eu-central-1";

export default AWS
