import { Component, OnInit } from '@angular/core'; //---> Importación modulo de angular
import { Router } from '@angular/router'; //---> Importaciónde routes para rutas
import { ReportesService } from '../services/reportes.service'; //---> Importación del services para su uso
import { FormsModule } from '@angular/forms'; //---> Importación del forsmodule para los formularios de validación
import { CommonModule } from '@angular/common'; //---> Importación de angular
import { HomeComponent } from '../home/home.component'; //---> Importación del componente home
import Swal from 'sweetalert2'; //---> Importación de sweet alert
import { FooterRowOutlet } from '@angular/cdk/table'; //---> Importación de angular
import { FooterComponent } from '../footer/footer.component'; //---> Importación del componente footer
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';


@Component({ //---> Componente
  selector: 'app-productos', //---> Selector para importar en otro componente
  standalone: true,  //---> Validación de que es un componente standalone, ósea independiente
  imports: [FormsModule, CommonModule, HomeComponent, FooterComponent], //---> Importaciones necesarias para poder usar los componentes y mostrarlos
  templateUrl: './productos.component.html', //---> URL del html
  styleUrls: ['./productos.component.css'] //---> URL del css
})
export class ProductosComponent implements OnInit { //---> Clase del componente con implementación para iniciar valores
  productos: any[] = []; //---> Arrya de productos vacío
  nombre: string = ''; //---> Nombre del producto
  precio: number = 0; //---> Precio del producto
  productoEdit: boolean = false; //---> Productos editados
  productoId: number | null = null; //---> El id del producto
  esAdmin: boolean = false; //---> Validación de si es administrador o no
  selectedFile: File | null = null; 
  imagen: string | null = null;



  constructor( //---> Constructor
    private reportesService: ReportesService, //---> Service para usar los servicios 
    private router: Router, //---> Routes para uso de rutas
  ) {}

  ngOnInit(): void { //---> Iniciar variables
    this.listarProductos(); //---> Función de listar los productos
    this. verificarRol(); //---> Función que verifica el rol del usuario
  }

 
  verificarRol(): void { //---> Función de verificación del rol del usuario
    const usuario = JSON.parse(localStorage.getItem('user') || '{}'); //---> Constante con usuario, se le pasa el párametro de user que contiene todos los datos del usuario incluído el rol
    this.esAdmin = usuario?.rol === 'admin'; //---> Si el usuario es admin puede eliminar los productos, como también se valida que no se muestre esto al usuario con rol usuario
  }

  onFileSelected(event: any): void { //---> Función que selecciona un archivo
    const file = event.target.files[0]; //---> Toma el archivo
    if (file) { //---> Valida si el archivo es válido
        this.selectedFile = file; //---> Se le asigna el archivo seleccionado
        console.log('Archivo seleccionado:', this.selectedFile); //---> Mensaje en consola del navegador
    } else { //---> En caso de no seleccionarse ningún archivo
        console.error('No se seleccionó ningún archivo.'); //---> Mensaje de error en la consola
    }
}

  listarProductos(): void { //---> Función de listar productos
    this.reportesService.listarProductos().subscribe( //---> Se hace el llamado al service de listarproductos
      response => { //---> Petición
        this.productos = response.productos || []; //---> Si tiene un valor válido entonces se le asigna un valor y si no un array vacío
      },
      error => { //---> Manejo de error
        console.error('Error al listar productos:', error); //---> Error en consola
        Swal.fire({ //---> Swal para alertas
          icon: 'error', //---> Icono de error
          title: 'Error', //---> Título de la alerta
          text: 'No se pudieron listar los productos.' //---> Texto de la alerta
        });
      }
    );
  }

  crearProducto(): void { //---> Función para crear un producto
    if (!this.nombre || !this.precio) { //---> Primero valida que los campos no estén vacíos
      Swal.fire('Error', 'Todos los campos son obligatorios', 'error'); //---> Mensaje de alerta de error en caso de estarlo
      return; //---> Retorna para no ejecutarse
    }
  
    if (this.selectedFile) { //---> En caso de seleccionar un archivo
      this.reportesService.subirImagen(this.selectedFile).subscribe( //---> Se hace el llamado al service de subir la imagen
        (response: any) => { //---> Petición
          if (response.status === 'success') { //---> En caso de tener éxito la respuesta
            const imagen = response.url; //---> Se le asigna la url de la imagen
            this.reportesService.crearProducto(this.nombre, this.precio, imagen).subscribe( //---> Se hace el llamado al service de crear el producto
              (responseProducto) => { //---> Petición
                if (responseProducto.status === 'success') { //---> En caso de tener éxito la respuesta
                  Swal.fire('Producto creado', 'El producto fue creado con éxito.', 'success'); //---> Mensaje de éxito
                  this.listarProductos(); //---> Se listan los productos
                } else { //---> En caso de error
                  console.error('Error al crear el producto:', responseProducto); //---> Mensaje de error 
                  Swal.fire('Advertencia', responseProducto.message, 'warning'); //---> Mensaje de advertencia en caso
                }
              },
              (errorProducto) => { //---> Manejo de errores
                console.error('Error al crear el producto:', errorProducto); //---> Mensaje de error 
                Swal.fire('Error', 'Hubo un error al crear el producto.', 'error'); //---> Mensaje de error
              }
            );
          } else { //---> En caso de error
            console.error('Error al subir la imagen:', response); //---> Mensaje de error
            Swal.fire('Error', 'No se pudo subir la imagen', 'error'); //---> Mensaje de error
          }
        },
        (errorImagen) => { //---> Manejo de errores
          console.error('Error al subir la imagen:', errorImagen); //---> Mensaje de error
          Swal.fire('Error', 'Hubo un error al subir la imagen.', 'error'); //---> Mensaje de error
        }
      );
    } else { //---> En caso no de no seleeccionar un archivo
      this.reportesService.crearProducto(this.nombre, this.precio, null).subscribe( //---> Se hace nuevamente el llamado al service
        (responseProducto) => { //---> petición
          if (responseProducto.status === 'success') { //---> Validación de éxito
            Swal.fire('Producto creado', 'El producto fue creado con éxito.', 'success'); //---> Mensaje de éxito
            this.listarProductos(); //---> Devuelve la lista de productos
          } else { //---> En caso de error
            console.error('Error al crear el producto:', responseProducto); //---> Mensaje de error
            Swal.fire('Advertencia', responseProducto.message, 'warning'); //---> Mensaje de advertencia
          }
        },
        (errorProducto) => { //---> Manejo de errores
          console.error('Error al crear el producto:', errorProducto); //---> Mensaje de error
          Swal.fire('Error', 'Hubo un error al crear el producto.', 'error'); //---> Mensaje de error
        }
      );
    }
  }
  
  actualizarProducto(): void { //---> Función para actualizar productos
    if (!this.productoId) {  //---> Validación de que el producto no esté vacío
      Swal.fire('Error', 'No se ha seleccionado ningún producto para actualizar.', 'error'); //---> Mensaje de error en caso de estarlo
      return; //---> Retorna para no ejecutarse
    }
  
    if (!this.nombre || !this.precio) { //---> Validación de que los campos no estén vacíos
      Swal.fire('Error', 'Todos los campos son obligatorios', 'error'); //---> Mensaje de error en caso de estarlo
      return; //---> Retorna para no ejecutarse
    }
  
    if (this.selectedFile) { //---> En caso de haber seleccionado un archivo
      this.reportesService.subirImagen(this.selectedFile).subscribe( //---> Se hace el llamado al service de subir imagen
        (response: any) => { //---> petición
          if (response.status === 'success') { //---> Validación de éxito
            const imagenUrl = response.url; //---> Se le asigna la url de la imagen
            this.reportesService.actualizarProducto(this.productoId, this.nombre, this.precio, imagenUrl).subscribe( //---> Se hace el llamdo al service
              (responseProducto) => { //---> Petición
                if (responseProducto.status === 'success') { //---> Validación de éxito
                  Swal.fire('Producto actualizado', 'El producto fue actualizado con éxito.', 'success'); //---> Mensaje de éxito
                  this.listarProductos(); //---> Devuelve la lista de productos
                  this.cancelarEdicion();  //---> Cancela la edición
                } else { //---> En caso de error
                  Swal.fire('Advertencia', responseProducto.message, 'warning'); //---> Mensaje de advertencia
                }
              },
              (errorProducto) => { //---> Manejo de errores
                console.error('Error al actualizar producto:', errorProducto); //---> Mensaje de error
                Swal.fire('Error', 'Hubo un error al actualizar el producto.', 'error'); //---> Mensaje de error
              }
            );
          } else { //---> En caso de error
            Swal.fire('Error', 'No se pudo subir la imagen', 'error'); //---> Mensaje de error
          }
        },
        (errorImagen) => { //---> Manejo de errores
          console.error('Error al subir la imagen:', errorImagen); //---> Mensaje de error
          Swal.fire('Error', 'Hubo un error al subir la imagen.', 'error'); //---> Mensaje de error
        }
      );
    } else { //---> En caso de no haber seleccionado un archivo

      this.reportesService.actualizarProducto(this.productoId, this.nombre, this.precio, null).subscribe( //---> Se hace el llamado al service
        (responseProducto) => { //---> Petición
          if (responseProducto.status === 'success') { //---> Validación de éxito
            Swal.fire('Producto actualizado', 'El producto fue actualizado con éxito.', 'success'); //---> Mensaje de éxito
            this.listarProductos(); //---> Devuelve la lista de productos
            this.cancelarEdicion();  //---> Cancela la edición
          } else { //---> En caso de error
            Swal.fire('Advertencia', responseProducto.message, 'warning'); //---> Mensaje de advertencia
          }
        },
        (errorProducto) => { //---> Manejo de errores
          console.error('Error al actualizar producto:', errorProducto); //---> Mensaje de error
          Swal.fire('Error', 'Hubo un error al actualizar el producto.', 'error'); //---> Mensaje de error
        }
      );
    }
  }

  eliminarProducto(productoId: number): void { //---> Función de eliminar producto por su ID
    Swal.fire({ //---> Swal para alertas
      title: '¿Eliminar el producto?', //---> Título de alerta
      text: 'La acción no se puede remediar', //---> Texto de la alerta
      icon: 'warning', //---> Icono de warning o precaución
      showCancelButton: true, //---> Botón de cancelar accción
      confirmButtonText: 'Eliminar', //---> Confirmar la acción de eliminar
      cancelButtonText: 'Cancelar', //---> Confirmar cancelar la acción de eliminar
    }).then((result) => { //---> Depende de la acción se muestran los debidos mensajes de éxito o error
      if(result.isConfirmed){ //---> Se valida la confimación de cualquier acción
        this.reportesService.eliminarProducto(productoId).subscribe( //---> Se hace el llamado de la función al service
          (response) => { //---> Petición
            Swal.fire('Producto eliminado con éxtio', response.message, 'success'); //---> Mensaje de éxito si el producto se eliminó con éxito
            this.listarProductos(); //---> Muestra todos los productos y no mostrará el producto que fue eliminado, solo lista los que quedan en base de datos
          },
          (error) => { //---> Manejo de errores
            console.log(error); //---> Mensaje de error en consola
            Swal.fire('Erro al eliminar el producto', error.message, 'error'); //---> Mensaje de error en caso de arrojar error
          }
        );
      }
    });
  }

  editarProducto(producto: any): void { //---> Aquí se llama cuándo el usuario va a editar un producto
    this.productoEdit = true; //---> Se pasa a true, ya que comienza el false 
    this.productoId = producto.id; //---> Se copian las propiedades para ser usadas 
    this.nombre = producto.nombre; //---> Se copian las propiedades para ser usadas 
    this.precio = producto.precio; //---> Se copian las propiedades para ser usadas 
    this.selectedFile = null; // Para permitir la carga de una nueva imagen
    this.imagen = producto.imagen; // Asignar la imagen actual del producto
  }
  
  cancelarEdicion(): void { //---> Aquí se llama cuándo el usuario cancela la operación 
    this.productoEdit = false; //---> Se restauran las propiedades o valor inicial
    this.productoId = null; //---> Se restauran las propiedades o valor inicial
    this.nombre = ''; //---> Se restauran las propiedades o valor inicial
    this.precio = 0; //---> Se restauran las propiedades o valor inicial
  }
}