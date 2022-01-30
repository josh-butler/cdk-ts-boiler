import {Duration, Stack, StackProps, RemovalPolicy} from 'aws-cdk-lib';
import {Construct} from 'constructs';

import {Runtime} from 'aws-cdk-lib/aws-lambda';
import {NodejsFunction} from 'aws-cdk-lib/aws-lambda-nodejs';
// import {Table, BillingMode, AttributeType} from 'aws-cdk-lib/aws-dynamodb';

import {SingleTable} from './constructs/single-table';

export class CdkTsBoilerStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new NodejsFunction(this, 'my-function', {
      memorySize: 1024,
      timeout: Duration.seconds(5),
      runtime: Runtime.NODEJS_14_X,
      handler: 'handler',
      entry: './src/handlers/status-get.ts',
      bundling: {
        minify: true,
        // externalModules: ['aws-sdk'],
      },
    });

    new NodejsFunction(this, 'StatusGet', {
      memorySize: 1024,
      timeout: Duration.seconds(5),
      runtime: Runtime.NODEJS_14_X,
      handler: 'handler',
      entry: './src/handlers/status-getz.ts',
      bundling: {
        minify: true,
        // externalModules: ['aws-sdk'],
      },
    });

    // const singleTable = new SingleTable({construct: this});
    const table = new SingleTable({construct: this}).createDdbTable(
      'testTable1'
    );
    // const table = singleTable.createDdbTable('testTable');
    // const table = new Table(this, 'tableId', {
    //   billingMode: BillingMode.PAY_PER_REQUEST,
    //   removalPolicy: RemovalPolicy.DESTROY,
    //   pointInTimeRecovery: false,
    //   partitionKey: {name: 'pk', type: AttributeType.STRING},
    //   sortKey: {name: 'sk', type: AttributeType.STRING},
    // });

    // table.addGlobalSecondaryIndex({
    //   indexName: 'GSI1',
    //   partitionKey: {name: 'GSI1pk', type: AttributeType.STRING},
    //   sortKey: {name: 'GSI1sk', type: AttributeType.STRING},
    // });

    console.log('table name 👉', table.tableName);
    console.log('table arn 👉', table.tableArn);
  }
}
