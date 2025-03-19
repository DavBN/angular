import { bootstrapApplication } from '@angular/platform-browser'; //---> Importación de boostrap
import { HttpClientModule } from '@angular/common/http'; //---> Importación de http
import { importProvidersFrom, ApplicationConfig } from '@angular/core'; //---> Importación de angular
import { provideRouter } from '@angular/router'; //---> Importación de router
import { AppComponent } from './app/app.component'; //---> Importación del componente app
import { HomeComponent } from './app/home/home.component'; //---> Importación del componente home 
import { IniciarSesionComponent } from './app/iniciar-sesion/iniciar-sesion.component'; //---> Importación del componente de inicio de sesión
import { AdminComponent } from './app/admin/admin.component'; //---> Importación del componente de admin 
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async'; //---> Importación de angular
import { ProductosComponent } from './app/productos/productos.component'; //---> Importación del componente de productos
import { AuthGuard } from './app/auth.guard'; //---> Importación del authguard



const appConfig: ApplicationConfig = { //--->Constante
  providers: [ //---> Provider
    provideRouter([ //---> Rutas
      { path: '', redirectTo: '/iniciar-sesion', pathMatch: 'full' }, //---> Ruta de inicio de sesión siempre serán devueltos a esta
      { path: 'home', component: HomeComponent , canActivate: [AuthGuard]}, //---> Ruta de home protegida donde entran los usuarios con rol usuario
      { path: 'iniciar-sesion', component: IniciarSesionComponent }, //---> Ruta de inicio de sesión
      { path: 'admin', component: AdminComponent, canActivate: [AuthGuard] },  //---> Ruta del admin
      { path: 'productos', component: ProductosComponent, canActivate: [AuthGuard]  }, //---> Ruta de productos protegida
      { path: '**', redirectTo: '/iniciar-sesion' } //---> Ruta por defecto
    ]),
    importProvidersFrom(HttpClientModule), provideAnimationsAsync() 
  ]
};

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
