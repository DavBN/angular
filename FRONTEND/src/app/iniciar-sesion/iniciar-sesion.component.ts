import { Component } from '@angular/core'; //---> Importación modulo de angular
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'; //---> Importación de los formularios y validación
import { ReportesService } from '../services/reportes.service'; //---> Importación del service para ser usado
import { Router } from '@angular/router'; //---> Importación del router para rutas
import { CommonModule } from '@angular/common'; //---> Importación módulo de angular

@Component({ //---> Componente
  selector: 'app-iniciar-sesion', //---> Selector para ser usado en otros componentes
  standalone: true, //---> Validación de que el componente es standalone y es independiente
  imports: [ReactiveFormsModule, CommonModule], //---> Importaciones del formulario para validación
  templateUrl: './iniciar-sesion.component.html', //---> URL del html
  styleUrls: ['./iniciar-sesion.component.css'] //---> URL del css
})
export class IniciarSesionComponent { //---> Clase del componente
  loginForm: FormGroup; //---> Validación login
  errorMessage: string = ''; //---> Inicia el mensaje de error en vacío

  constructor( //---> Constructor
    private fb: FormBuilder, //---> Controla el form 
    private reportesService: ReportesService, //---> Uso del service para acceder a sus funciones
    private router: Router //---> Routes para las rutas
  ) {
    this.loginForm = this.fb.group({ //---> Valida y crea una instancia del formgroup ya definido
      email: ['', [Validators.required, Validators.email]], //---> Validación de que los campos son requeridos
      password: ['', Validators.required] //---> Validación de que el campo es requerido
    });
  }

  iniciarSesion() { //---> Función de iniciar sesión
    if (this.loginForm.invalid) { //---> Si la información ingresada en el formulario es inválida se moestrará el mensaje de error
      this.errorMessage = '¡Recuerda que deben ser credenciales válidas!'; //---> Mensaje de error
      return; //---> Retorno
    }

    const { email, password } = this.loginForm.value; //---> Constante con los valores de correo y contraseña

    this.reportesService.iniciarSesion(email, password).subscribe({ //---> Hacemos el llamdo al service y función
      next: (response) => { //---> Se hace la petición
        if (response.status === 'success' && response.usuario) { //---> Si el estado es de éxito y las credenciales del usuario son correctas entonces pasa la validación
          localStorage.setItem('user', JSON.stringify(response.usuario)); //---> Al pasar la validación se guardan los datos del usuario en user para mantener en sesión
            const usuario = response.usuario;  //---> Constante de usuario
            console.log(usuario); //---> Permite ver los datos del usuario almacenado en sesión
          if (response.usuario.rol === 'admin') { //---> Si el usuario tiene rol de administrador será redirigido a otra página
            this.router.navigate(['/admin']); //---> Página del administrador
          } else if (response.usuario.rol === 'usuario') { //---> Y si el usuario tiene rol de usuario será redirigido a otra página
            this.router.navigate(['/productos']); //---> Página de productos
          } else { //---> No tener el usuario un rol predefinido se mostrar un un mensaje de error
            this.errorMessage = 'El rol no existe'; //---> Mensaje de error
          }
        } else { //---> Y de en caso de fallar toda la operación, entonces se muestra el error al iniciar sesión
          this.errorMessage = response.message || 'Error al iniciar sesión'; //---> Mensaje de error
        }
      },
      error: (err) => { //---> En caso de que el servidor falle se muestra un error
        this.errorMessage = '¡Ups!, el servidor falló'; //---> Mensaje de error
      }
    });
  }}    