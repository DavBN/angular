import { Injectable } from '@angular/core'; //---> Importación de angular
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router'; //---> Importación de angular con el Can
import { Observable } from 'rxjs'; //---> Importación de angular
import { ReportesService } from './services/reportes.service'; //---> Importación de angular 

@Injectable({ //---> Injectable
  providedIn: 'root' //---> Root
})
export class AuthGuard implements CanActivate { //---> Clase de authguard con implementación del CanActive

  constructor(private ReportesService: ReportesService, private router: Router) {} //---> Constructor

  canActivate( //---> CanActivate
    route: ActivatedRouteSnapshot, //---> Datos de la ruta activa
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean { //---> Estado del enrutador
    if (this.ReportesService.Autenticado()) { //---> Se verifica que el usuario este autenticado por métodos del service
      return true; //---> De ser correcto se procede a dar permiso al usuario de navegar
    } else { //---> De lo contrario
      this.router.navigate(['/iniciar-sesion']); //---> Redirige al usuario al inicio de sesión de no estar autenticado, no le permite ver nada solo el login
      return false; //---> No da acceso al usuario 
    }
  }
}
