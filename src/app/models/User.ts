


export class User {
  _id: string;
  firstname: string;
  lastname: string;
  deviceStats: {
    deviceToken?: string;
    notificationEndpointArn?: string;
    platform?: 'android' | 'ios';
  };
  preferences: {

  }
}
