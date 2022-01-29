import {ApiGatewayEvent} from '../common/apigateway/apigateway-event';
import {ApiGatewayResponse} from '../common/apigateway/apigateway-response';

import {expires} from '../common/util/util';
import config from '../common/config';

// import { v4 as uuidv4 } from 'uuid';

export const handler = async (
  event: ApiGatewayEvent
): Promise<ApiGatewayResponse> => {
  console.log('event: ', event);
  const statusCode = 200;
  // const headers = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
  const body = JSON.stringify({status: 'ok'});

  console.log('EventBusName: ', config.EventBusName);
  console.log('expires', expires());

  // console.log('uuidv4: ', uuidv4());

  return {statusCode, body};
};
