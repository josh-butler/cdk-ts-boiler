import {Duration, Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';

import {Runtime} from 'aws-cdk-lib/aws-lambda';
import {NodejsFunction} from 'aws-cdk-lib/aws-lambda-nodejs';

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
  }
}
