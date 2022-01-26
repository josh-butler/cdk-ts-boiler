import { ApiGatewayEvent } from '../../common/apigateway/apigateway-event';
import { ApiGatewayResponse } from '../../common/apigateway/apigateway-response';

export const handler = async (event: ApiGatewayEvent): Promise<ApiGatewayResponse> => {
  console.log('event: ', event);
  const statusCode = 200;
  const body = JSON.stringify({ data: { id: 'abc123' } });

  console.log('GET JOBS');

  return { statusCode, body };
};