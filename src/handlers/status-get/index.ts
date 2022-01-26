import { ApiGatewayEvent } from '../../common/apigateway/apigateway-event';
import { ApiGatewayResponse } from '../../common/apigateway/apigateway-response';

import { expires } from '../../common/util/util';
import config from '../../common/config';

export const handler = async (event: ApiGatewayEvent): Promise<ApiGatewayResponse> => {
  console.log('event: ', event);
  const statusCode = 200;
  // const headers = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
  const body = JSON.stringify({ status: 'ok' });

  console.log('EventBusName: ', config.EventBusName);
  console.log('expires', expires());

  return { statusCode, body };
};