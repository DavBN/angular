import { CommonModule } from '@angular/common'; //---> Importación de angular
import { Component, OnInit } from '@angular/core'; //---> Importación de módulos angular
import { ProductosComponent } from '../productos/productos.component'; //---> Importación del componente productos
import { ReportesService } from '../services/reportes.service'; //---> Importación del service para usarlo
import { Router } from '@angular/router'; //---> Importación de routes 
import { FormsModule } from '@angular/forms'; //---> Importación del formulario para validación

@Component({ //---> Componente
  selector: 'app-home', //---> Selector para usar el componente en otros componentes
  standalone: true, //---> Standandole para validación de que es un componente independiente
  imports: [CommonModule, FormsModule], //---> Importaciones para uso del formulario
  templateUrl: './home.component.html', //---> URl del html
  styleUrls: ['./home.component.css'] //---> URL del css
})
export class HomeComponent  { //---> Componente de home

  constructor( //---> Constructor
    private reportesService: ReportesService, //---> Se usa el service para poder acceder a sus funciones
    private router: Router //---> Se usa el router para las rutas
  ) { }

  logout() { //---> Función de cerrar sesión
    this.reportesService.cerrarSesion().subscribe({ //---> Se hace el llamdo
      next: (response) => { //---> Se hace la petición
        localStorage.removeItem('user'); //---> Cuándo todo se cumpla se pide que los datos del usuario sean eliminados de sesión
        this.router.navigate(['/iniciar-sesion']); //---> Una vez se cierre sesión se redirigira al usuario al inicio de sesión
        this.router.navigateByUrl('/iniciar-sesion', { replaceUrl: true }); //---> Se aplica una cada de seguridad para que no se pueda acceder a otra url sino solo inicio de sesión
      },
      error: (error) => { //---> Manejo de errores
        console.error('Error al cerrar sesión', error); //---> Error en consola
        this.router.navigate(['/iniciar-sesion']); //---> En caso de cualquier error nuevamente será directo a inicio de sesión
      }
    });
  }
}
