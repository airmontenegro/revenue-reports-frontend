import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import {
  MSAL_INSTANCE,
  MsalService,
  MsalGuard,
  MsalBroadcastService
} from '@azure/msal-angular';
import { PublicClientApplication } from '@azure/msal-browser';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

export function msalInstanceFactory() {
  const msalInstance =  new PublicClientApplication({
    auth: {
      clientId: 'ecaca527-492f-4199-ad73-eec3edbbedc2',
      authority: 'https://login.microsoftonline.com/b4870f45-b80d-47ef-954b-49c9d1800c9d',
      redirectUri: 'http://localhost:4200',
    },
    cache: {
      cacheLocation: 'localStorage',
      storeAuthStateInCookie: false,
    },
  });
    msalInstance.initialize();

  return msalInstance;
}

bootstrapApplication(App, {
 providers: [
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: MSAL_INSTANCE,
      useFactory: msalInstanceFactory,
    },
    MsalService,
    MsalGuard,
    MsalBroadcastService,
  ],
}).catch(err => console.error(err));