// src/config/cognito.js
export const cognitoConfig = {
  Auth: {
    region: 'us-east-1',
    userPoolId: 'us-east-1_OWGJIHWbR',
    userPoolWebClientId: '2t9elmqo217fecocfk1pp15pdr',
    mandatorySignIn: false,
    authenticationFlowType: 'USER_SRP_AUTH',
    oauth: {
      domain: '', // We'll add this later if you want hosted UI
      scope: ['email', 'openid', 'profile'],
      redirectSignIn: window.location.origin,
      redirectSignOut: window.location.origin,
      responseType: 'code'
    }
  }
};