import { HttpClient, HttpHeaders } from '@angular/common/http';//---> Importación de http 
import { Injectable } from '@angular/core'; //---> Importación de angular
import { Observable } from 'rxjs'; //---> Importación de angular

@Injectable({ //---> Injectable
  providedIn: 'root' //---> Root
})
export class ReportesService { //---> Clase del componente
  private apiUrl = 'http://localhost:3000/BACKEND/index.php'; //---> Url de la API que viene desde php
  private headers = new HttpHeaders({ 'Content-Type': 'application/json' }); //---> header de tipo JSON para leer y entender los datos enviados desde el backend

  constructor(private http: HttpClient) { } //---> Constructor

  Autenticado(): boolean { //---> Aquí se maneja si el usuario está autenticado, esto con el fin de luego remover sus datos de sesión cuándo la finalice
    return !!localStorage.getItem('user'); //---> Se almacena los datos del usuario
  }

  crearUsuario(nombre: string, email: string, rol: string, password: string): Observable<any> { //---> Método para crear un nuevo usuario y recibe los párametros establecidos desde el backend
    const body = { nombre, email, rol, password, accion: 'crear_usuario' }; //---> Contiene los datos necesarios para enviar la solicitud Http POST
    return this.http.post(this.apiUrl, body, { headers: this.headers, withCredentials: true }); //---> Se habilita el uso de credenciales o cookies en sesión

  }

  iniciarSesion(email: string, password: string): Observable<any> { //---> Método para iniciar sesión y recibe los párametros establecidos en backend
    const body = { accion: 'login', email, password }; //---> Contiene los datos necesarios para enviar la solicitud http POST
    return this.http.post(this.apiUrl, body, { headers: this.headers, withCredentials: true }); //---> Se habilita el uso de credenciales o cookies en sesión
  }

  crearProducto(nombreProducto: string, precio: number, imagen?: string | null): Observable<any> { //---> Método para crear un producto y recibe los párametros establecidos en backend
    const body = { accion: 'crear_producto', nombre_producto: nombreProducto, precio, imagen }; //---> Contiene los datos necesarios para enviar la solicitud http POST
    console.log(body);
    return this.http.post(this.apiUrl, body, { headers: this.headers, withCredentials: true });  //---> Se habilita el uso de credenciales o cookies en sesión
  }

  eliminarUsuario(usuarioId: number): Observable<any> { //---> Método para eliminar un usuario y recibe los párametros establecidos en backend
    const body = { accion: 'eliminar_usuario', usuario_id: usuarioId }; //---> Contiene los datos necesarios para enviar la solicitud http POST
    return this.http.post(this.apiUrl, body, { headers: this.headers, withCredentials: true }); //---> Se habilita el uso de credenciales o cookies en sesión
  }

  eliminarProducto(productoId: number): Observable<any> { //---> Método para eliminar un producto y recibe los párametros establecidos en backend
    const body = { accion: 'eliminar_producto', producto_id: productoId }; //---> Contiene los datos necesarios para enviar la solicitud http POST
    return this.http.post(this.apiUrl, body, { headers: this.headers, withCredentials: true }); //---> Se habilita el uso de credenciales o cookies en sesión
  }

  listarUsuarios(): Observable<any> { //---> Método para listar todos los usuarios
    return this.http.get(`${this.apiUrl}?accion=listar_usuarios`, { headers: this.headers, withCredentials: true });  //---> Se habilita el uso de credenciales o cookies en sesión y trae la acción del backend que lista todos los usuarios por GET
  }

  cerrarSesion(): Observable<any> { //---> Método de cerrar sesión
    localStorage.removeItem('user'); //---> Se remueve los valores o datos del usuario en user, esto borra los datos de sesión y envía al usuario de vuelta al inicio de sesión
    const body = { accion: 'logout' }; //---> Contiene los datos necesarios para enviar la solicitud http POST
    return this.http.post(this.apiUrl, body, { headers: this.headers, withCredentials: true });  //---> Se habilita el uso de credenciales o cookies en sesión
  }

  actualizarUsuario(usuarioId: number, nombre: string, email: string, rol: string): Observable<any> { //---> Método para actualizar un usuario y recibe los párametros establecidos en backend
    const body = { accion: 'actualizar_usuario', usuario_id: usuarioId, nombre, email, rol }; //---> Contiene los datos necesarios para enviar la solicitud http POST
    return this.http.post(this.apiUrl, body, { headers: this.headers, withCredentials: true }); //---> Se habilita el uso de credenciales o cookies en sesión
  }

  actualizarProducto(productoId: number | null, nombreProducto: string, precio: number, imagen?: string | null): Observable<any> { //---> Método para actualizar un producto y recibe los párametros establecidos en backend
    const body = { accion: 'actualizar_producto', producto_id: productoId, nombre_producto: nombreProducto, precio, imagen }; //---> Contiene los datos necesarios para enviar la solicitud http POST
    return this.http.post(this.apiUrl, body, { headers: this.headers, withCredentials: true }); //---> Se habilita el uso de credenciales o cookies en sesión
  }

  listarProductos(): Observable<any> { //---> Método para listar todos los productos
    return this.http.get(`${this.apiUrl}?accion=listar_productos`, { headers: this.headers, withCredentials: true }); //---> Se habilita el uso de credenciales o cookies en sesión y trae la acción del backend que lista todos los productos por GET
  }
  subirImagen(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('accion', 'subir_imagen'); 
    formData.append('imagen', file); 
    return this.http.post(this.apiUrl, formData, { withCredentials: true });
  }
}

