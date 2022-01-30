import {Construct} from 'constructs';

import {RemovalPolicy} from 'aws-cdk-lib';

import {Table, BillingMode, AttributeType} from 'aws-cdk-lib/aws-dynamodb';

export interface ISingleTable {
  createDdbTable(tableName: string): Table;
}

export interface SingleTableProps {
  construct: Construct;
}

export class SingleTable implements ISingleTable {
  // protected stackName: string;
  protected props: SingleTableProps;

  constructor(props: SingleTableProps) {
    // this.stackName = props.stackName;
    this.props = props;
  }

  createDdbTable(tableName: string): Table {
    const table = new Table(this.props.construct, tableName, {
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
      pointInTimeRecovery: false,
      partitionKey: {name: 'pk', type: AttributeType.STRING},
      sortKey: {name: 'sk', type: AttributeType.STRING},
    });

    return table;
  }
}
