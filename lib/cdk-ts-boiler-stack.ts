import {Duration, Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';

import {Runtime} from 'aws-cdk-lib/aws-lambda';
import {NodejsFunction} from 'aws-cdk-lib/aws-lambda-nodejs';
import * as iam from 'aws-cdk-lib/aws-iam';

import {SingleTable} from './constructs/single-table';

export class CdkTsBoilerStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const entityTable = new SingleTable({
      construct: this,
      name: 'testTable',
      nIndexes: 1,
    }).createDdbTable();

    // TODO: Move this to SingleTable construct
    const entityTableCrudPolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      resources: [entityTable.tableArn],
      actions: [
        'dynamodb:GetItem',
        'dynamodb:DeleteItem',
        'dynamodb:PutItem',
        'dynamodb:Scan',
        'dynamodb:Query',
        'dynamodb:UpdateItem',
        'dynamodb:BatchWriteItem',
        'dynamodb:BatchGetItem',
        'dynamodb:DescribeTable',
        'dynamodb:ConditionCheckItem',
      ],
    });

    const statusGetLambda = new NodejsFunction(this, 'StatusGet', {
      memorySize: 1024,
      timeout: Duration.seconds(30),
      runtime: Runtime.NODEJS_14_X,
      handler: 'handler',
      entry: './src/handlers/status-get.ts',
      bundling: {
        minify: true,
        // externalModules: ['aws-sdk'],
      },
    });
    statusGetLambda.addToRolePolicy(entityTableCrudPolicy);

    new NodejsFunction(this, 'UserGet', {
      memorySize: 1024,
      timeout: Duration.seconds(30),
      runtime: Runtime.NODEJS_14_X,
      handler: 'handler',
      entry: './src/handlers/user-get.ts',
      bundling: {
        minify: true,
      },
    });
  }
}
