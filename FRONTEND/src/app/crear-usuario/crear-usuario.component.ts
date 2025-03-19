import { Component } from '@angular/core'; //---> Importación modulo de angular
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'; //---> Importación de formularios reactivos y validaciones
import { ReportesService } from '../services/reportes.service'; //---> Importación del api que contiene el servicio
import { CommonModule } from '@angular/common'; //---> Importacion de angular
import { Router } from '@angular/router'; //---> Importación del router de angular

@Component({ //---> Componente
  selector: 'app-crear-usuario', //---> Selector del componente
  standalone: true, //---> Componente independiente no requiere un módulo
  imports: [ReactiveFormsModule, CommonModule], //---> Módulos necesarios para validación
  templateUrl: './crear-usuario.component.html', //---> Ruta del archivo html
  styleUrls: ['./crear-usuario.component.css'] //---> Ruta del archivo css
})
export class CrearUsuarioComponent { //---> Clase del componente
  usuarioForm: FormGroup; //---> Define el formulario reactivo para validar

  constructor(private fb: FormBuilder, private reportesService: ReportesService, private router: Router) { //---> Constructor para inyectar los servicios y poder crear el form
    this.usuarioForm = this.fb.group({ //---> Inicia el formulario con los controles y validaciones
      nombre: ['', Validators.required], //---> Nombre del usuario que es obligatorio
      email: ['', [Validators.required, Validators.email]], //---> Correo del usuario que es obligatorio
      password: ['', Validators.required], //---> Contraseña del usuario que es obligatoria
      rol: ['', Validators.required] //---> Rol del usuario que es obligatorio
    });
  }

  crearUsuario() { //---> Método para crear el usuario
    if (this.usuarioForm.valid) { //---> Operación que verifica si el formulario es válido
      this.reportesService.crearUsuario(this.usuarioForm.value.nombre, this.usuarioForm.value.email, this.usuarioForm.value.rol, this.usuarioForm.value.password) //---> Usa el servicio para crear el usuario
        .subscribe(response => { //---> Petición
          alert('El usuario a sido creado con éxito'); //---> Mensaje de éxito en caso de ser exitosa la operación
          this.router.navigate(['/iniciar-sesion']); //---> Redirige a la página de inicio de sesión
        }, error => { //---> Manejo de error
          alert('Error al crear el usuario'); //---> Mensaje de error en caso de fallar la operación
        });
    }
  }
}
