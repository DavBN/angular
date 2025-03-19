import { RouterModule, Routes } from '@angular/router';
import { CrearUsuarioComponent } from './crear-usuario/crear-usuario.component';
import { NgModule } from '@angular/core';
import { IniciarSesionComponent } from './iniciar-sesion/iniciar-sesion.component';
import { HomeComponent } from './home/home.component';
import { AdminComponent } from './admin/admin.component';
import { ProductosComponent } from './productos/productos.component';
import { AuthGuard } from './auth.guard';


export const routes: Routes = [
    { path: '', redirectTo: '/iniciar-sesion', pathMatch: 'full' },
    { path: 'home', component: HomeComponent, canActivate: [AuthGuard]  },
    { path: 'productos', component: ProductosComponent, canActivate: [AuthGuard] },
    { path: 'iniciar-sesion', component: IniciarSesionComponent },
    { path: 'admin', component: AdminComponent, children: [], canActivate: [AuthGuard] },
    { path: '**', redirectTo: '/iniciar-sesion' }
];


@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
