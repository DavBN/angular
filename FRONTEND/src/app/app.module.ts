import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CrearUsuarioComponent } from './crear-usuario/crear-usuario.component';
import { HttpClientModule } from '@angular/common/http';
import { IniciarSesionComponent } from './iniciar-sesion/iniciar-sesion.component';
import { HomeComponent } from './home/home.component';
import { AdminComponent } from './admin/admin.component';
import { AppRoutingModule } from './app-routing.module';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { ReportesService } from './services/reportes.service';

@NgModule({
  declarations: [
    AppComponent, 
    AdminComponent,
    HomeComponent,
    CrearUsuarioComponent,
    IniciarSesionComponent,
    MatCardModule
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    HttpClientModule,
    FormsModule,
    AppRoutingModule,
    CommonModule,
    ReportesService
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
