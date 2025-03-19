import { Component, NgModule, OnInit } from '@angular/core'; //---> Importación de angular
import { Router, NavigationEnd } from '@angular/router'; //---> Importación de navegación de rutas angular
import { FooterComponent } from './footer/footer.component'; //---> Importación del componente footer
import { RouterOutlet } from '@angular/router'; //---> Importación de navegación
import { CrearUsuarioComponent } from './crear-usuario/crear-usuario.component'; //---> Importación de componente de creación de usuario
import { IniciarSesionComponent } from './iniciar-sesion/iniciar-sesion.component'; //---> Importación del componente de inicio de sesión
import { HomeComponent } from './home/home.component'; //---> Importación del componente home
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; //---> Importación de formulario reactivo
import { CommonModule } from '@angular/common'; //---> Importación de angular

@Component({ //---> Componente
  selector: 'app-root', //---> Selector para ser usado en otros componentes
  standalone: true, //---> Valida que el componente es standalone, no requiere modulos
  imports: [RouterOutlet, CrearUsuarioComponent, IniciarSesionComponent, HomeComponent, FooterComponent, FormsModule, ReactiveFormsModule, CommonModule], //---> Importaciones de los componentes y los formularios para poder hacer validaciones 
  templateUrl: './app.component.html', //---> URL del html
  styleUrls: ['./app.component.css'] //---> URL del css
})
export class AppComponent implements OnInit { //---> Clase del componente con implementación de inicio de variables o valores
  title = 'proyecto'; //---> Título
  footer = true;  //---> Se inicia la clase footer en true

  constructor(private router: Router) {} //---> Constructor
  ngOnInit(): void { //---> Inicia variables
    this.router.events.subscribe(event => { //---> Si la ruta tiene un evento hace la siguiente operación
      if (event instanceof NavigationEnd) { //---> Si evento es una instancia de la navegación
        if (event.urlAfterRedirects === '/iniciar-sesion') { //---> Si se está en la ruta inicio de sesión no se muestra el componente footer
          this.footer = false; //---> En caso de estar en inicio de sesión es false para el footer
        } else { //---> De lo contrario, ósea en otra ruta se muestra el footer
          this.footer = true; //---> Footer en true
        }
      }
    });
  }
}
