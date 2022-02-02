import {Construct} from 'constructs';

import {RemovalPolicy} from 'aws-cdk-lib';

import {Table, BillingMode, AttributeType} from 'aws-cdk-lib/aws-dynamodb';

export interface ISingleTable {
  createDdbTable(tableName: string): Table;
}

export interface SingleTableProps {
  construct: Construct;
  name: string;
  nIndexes?: number;
}

export class SingleTable implements ISingleTable {
  // protected stackName: string;
  protected props: SingleTableProps;

  constructor(props: SingleTableProps) {
    // this.stackName = props.stackName;
    this.props = props;
  }

  createDdbTable(): Table {
    const {construct, name, nIndexes = 0} = this.props;

    const table = new Table(construct, name, {
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
      pointInTimeRecovery: false,
      partitionKey: {name: 'pk', type: AttributeType.STRING},
      sortKey: {name: 'sk', type: AttributeType.STRING},
    });

    // add correct number of GSIs, if any
    for (let i = 0; i < nIndexes; i++) {
      const num = i + 1;
      table.addGlobalSecondaryIndex({
        indexName: `GSI${num}`,
        partitionKey: {name: `GSI${num}pk`, type: AttributeType.STRING},
        sortKey: {name: `GSI${num}sk`, type: AttributeType.STRING},
      });
    }

    return table;
  }
}
