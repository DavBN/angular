import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { routes } from './app-routing.module';
export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes),  HttpClientModule, ReactiveFormsModule ]
};

