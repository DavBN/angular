import { Component, OnInit } from '@angular/core'; //---> Importaciones de los modulos 
import { ReportesService } from '../services/reportes.service'; //---> Importanción del service
import Swal from 'sweetalert2'; //---> Importación de sweet alert para alertas
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; //---> Importación de formularios reactivos
import { CommonModule } from '@angular/common'; //---> Módulo de angular
import { ProductosComponent } from '../productos/productos.component'; //---> Importación del componente productos
import { FooterComponent } from '../footer/footer.component'; //---> Importación del componente footer

@Component({ //---> Componente
  selector: 'app-admin', //---> Selector para usar
  standalone: true, //---> Inidicación de que el componente es independiente no requiere modulos
  imports: [ReactiveFormsModule, CommonModule, FormsModule, ProductosComponent, FooterComponent], //---> Importaciones para poder usar 
  templateUrl: './admin.component.html', //---> Url para usar el html
  styleUrl: './admin.component.css' //---> Url dónde se ubica el css
})
export class AdminComponent implements OnInit { //---> Clase del componente y oninit para guardar datos y mantenerlos iniciados
  selectedTab: number = 1; //---> Aquí se controla la pestaña que selecciona el admin
  usuarios: any[] = []; //---> Carga la lista de usuarios que viene desde el backend
  nuevoUsuario: any = { //---> Contiene los atributos del nuevo usuario
    nombre: '', //---> Nombre del nuevo usuario
    email: '', //---> Correo del nuevo usuario
    rol: '', //---> Rol del nuevo usuario
    password: '', //---> Contraseña del nuevo usuario

  };
  usuarioSeleccionado: any = null; //---> Aquí se selecciona el nuevo usuario a editar

  selectTab(tabIndex: number) { //---> Cambia la pestaña seleccionada
    this.selectedTab = tabIndex; //---> Selección 
  }

  constructor(private reportesService: ReportesService) { } //---> Constructor del componente que inicializa el servicio del api de service

  ngOnInit(): void { //---> Aquí se ejecuta un método cuándo se inicia el componente
    this.listarUsuarios(); //---> Carga la lista de todos los usuarios para ser visible
  }
  listarUsuarios(): void { //---> Aquí se obtiene la lista de usuarios que vienen desde el backend
    this.reportesService.listarUsuarios().subscribe( //---> Función para listar los usuarios con conexión al service
      (response) => { //---> Petición
        this.usuarios = response.usuarios; //---> Actualiza la lista de usuarios
      },
      (error) => { //---> Manejo de error
        console.error(error); //---> Manejo de error
      }
    );
  }

  crearUsuario(): void { //---> Función para crear nuevo usuario
    const { nombre, email, rol, password } = this.nuevoUsuario; //---> Constante con los valores o atributos del usuario a crear de caracter obligatorio
    this.reportesService.crearUsuario(nombre, email, rol, password).subscribe( //---> Se pasan los valores para ser tomados y leídos
      (response) => { //---> Petición
        Swal.fire('Usuario creado con éxito', response.message, 'success'); //---> Alerta de éxito al crear un nuevo usuario
        this.listarUsuarios(); //---> Lista los usuarios y me muestra el nuevo usuario al final de la lista
        this.nuevoUsuario = { nombre: '', email: '', rol: '', password: '' }; //---> Aquí se limpia el formulario
      },
      (error) => { //---> Manejo de error
        Swal.fire('Error al crear el usuario', error.message, 'error'); //---> En caso de tener error se muestra una alerta de error
      }
    );
  }

  seleccionarUsuario(usuario: any): void { //---> Selección de usuario para editar
    this.usuarioSeleccionado = { ...usuario }; //---> Se hace una clonación del usuario seleccionado

  }

  actualizarUsuario(): void { //---> Función que actualiza los datos del usuario existente
    if (this.usuarioSeleccionado) { //---> Operación de verificación del usuario seleccionado
      const { nombre, email, rol } = this.usuarioSeleccionado; //---> Constante con los atributos del usuario seleccionado
      const usuarioId = this.usuarioSeleccionado.id; //---> Constante con el id del usuario seleccionado
      this.reportesService.actualizarUsuario(usuarioId, nombre, email, rol) //---> Se pasan los atributos para ser tomados y leídos
        .subscribe(
          response => { //---> Petición
            Swal.fire('Usuario actualizado con éxito', response.message, 'success'); //---> Mensaje de éxito en caso de tener éxito la operación
            this.listarUsuarios(); //---> Actualiza y lista nuevamente los usuarios mostrando los nuevos atributos del usuario seleccionado
            this.usuarioSeleccionado = null; //---> Limpia la selección
          },
          error => { //---> Manejo de error
            Swal.fire('Error al actualizar el usuario', error.message, 'error'); //---> Mensaje de error en caso de fallar la operación
          }
        );
    }
  }

  eliminarUsuario(usuarioId: number): void { //---> Función de eliminar un usuario por su id
    Swal.fire({ //---> Swal para alertas
      title: '¿Eliminar usuario?', //---> Título que se muestra en la alerta antes de eliminar un usuario
      text: 'Acción no reconocida', //---> Texto en caso de no reconocer una acción prevista
      icon: 'warning', //---> Icono de warning o peligro
      showCancelButton: true, //---> Muestra un botón para cancelar la acción
      confirmButtonText: 'Eliminar', //---> Texto que esta dentro del botón para confirmación
      cancelButtonText: 'Cancelar Acción', //---> Texto que esta dentro del botón para cancelar acción
    }).then((result) => { //---> Resultado
      if (result.isConfirmed) { //---> Operación de verificación si el usuario confirma la eliminación
        this.reportesService.eliminarUsuario(usuarioId).subscribe( //---> Se ejecuta la acción con los valores
          (response) => { //---> Petición
            Swal.fire('Usuario eliminado con éxito', response.message, 'success'); //---> Mensaje de éxito en caso de ser exitosa la operación y la eliminación del usuario
            this.listarUsuarios(); //---> Actualiza y lista los usuarios que quedan en base de datos luego de la eliminación
          },
          (error) => { //---> Manejo de error
            console.log(error) //---> Error en consola
            Swal.fire('Erro al eliminar el usuario', error.message, 'error'); //---> Mensaje de error en caso de fallar la operación
          }
        );
      }
    });
  }
}
