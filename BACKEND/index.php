<?php
header("Access-Control-Allow-Origin: http://localhost:4200"); //---> Aceptación del servidor de angular
header("Access-Control-Allow-Credentials: true"); //---> Activación de las credenciales para almacenar los datos del usuario
header("Access-Control-Allow-Methods: GET, POST, DELETE, PUT, OPTIONS"); //---> Métodos para la consulta y el manejo de admnistrador    
header("Access-Control-Allow-Headers: Content-Type, Authorization"); //---> Autorización 
header('Content-Type: application/json'); //---> Aceptación de formato JSON para ser leído por angular
session_start(); //---> Inicio de sesión en PHP
require('./config/database.php'); //---> Require para traer la conexión a la base de datos


//---> FUNCIONES DEL SOFTWARE Y CONSULTAS <---//
function crearUsuario($nombre, $email, $rol, $password) //---> Función para la creación de usuarios
{
    global $conn; //---> Global con la conexión 
    $passwordHash = password_hash($password, PASSWORD_DEFAULT); //---> Función que hashea la contraseña para almacenarla
    $sql = "INSERT INTO usuarios (nombre, email, rol, password) VALUES (?, ?, ?, ?)"; //---> Inserción de los datos ingresados
    $stmt = $conn->prepare($sql); //---> Sentencia preparada para evitar inyección SQL
    $stmt->bind_param("ssss", $nombre, $email, $rol, $passwordHash); //---> Sentencia preparada para evitar inyección SQL
    return $stmt->execute(); //---> Retorna la sentencia ejecutada
}


function iniciarSesion($email, $password) //---> Función de iniciar sesión
{
    global $conn; //---> Global con la conexión
    $sql = "SELECT * FROM usuarios WHERE email= ?"; //---> Seleccionar el usuario de acuerdo a su email en la base de datos
    $stmt = $conn->prepare($sql); //---> Sentencia preparada para evitar inyección SQL
    $stmt->bind_param("s", $email); //---> Sentencia preparada para evitar inyección SQL
    $stmt->execute(); //---> Ejecución de consulta
    $result = $stmt->get_result(); //---> Retorna el resultado de la consulta
    if ($result && $result->num_rows > 0) { //---> Comprobación de que el resultado es válido y no vacío o nulo
        $usuario = $result->fetch_assoc(); //---> Obtención del primer resultado y se guarda como un array asociativo
        if (password_verify($password, $usuario['password'])) { //---> Verificación de la contraseña que proporciona el usuario, se compara con la de la base de datos
            $_SESSION['usuario_id'] = $usuario['id']; //---> Almacena el id del usuario para ser manejado en sesión
            $_SESSION['usuario_nombre'] = $usuario['nombre']; //---> Almacena el nombre del usuario en sesión
            $_SESSION['usuario_rol'] = $usuario['rol']; //---> Almacena el rol del usuario para manejo de sesión dependiendo de su rol
            $_SESSION['usuario_email'] = $usuario['email']; //---> Almacena el correo del usuario en sesión
            return $usuario; //---> Retorna los datos del usuario en array
        }
    }
    return null; //---> Retorna null si no se cumple el bloque if inicial
}


function crearProducto($nombreProducto, $precio) //---> Función para crear productos
{
    global $conn; //---> Global con la conexión
    $usuarioId = $_SESSION['usuario_id']; //---> Obtiene el id del usuario que está en sesión, previamente debe iniciar sesión
    $sql = "INSERT INTO productos (nombre, precio, id_usuario) VALUES (?,?,?)"; //---> Inserción de los datos proporcionados y los almacena en base de datos
    $stmt = $conn->prepare($sql); //---> Sentencia preparada para evitar inyección SQL
    $stmt->bind_param("sdi", $nombreProducto, $precio, $usuarioId); //---> Sentencia preparada con los valores
    return $stmt->execute(); //---> Retorna la ejecución de de la consulta
}


function eliminarUsuario($usuarioId) //---> Función para eliminar usuarios
{
    global $conn; //---> Global con la conexión
    $sql = "DELETE FROM usuarios WHERE id=?"; //---> Eliminación del usuario por medio de su id
    $stmt = $conn->prepare($sql); //---> Sentencia preparada y consulta
    $stmt->bind_param("i", $usuarioId); //---> Parametros de la sentencia
    return $stmt->execute(); //---> Retorna la ejecución de la consulta
}

function eliminarProducto($productoId) //---> Función para eliminar productos
{
    global $conn;  //---> Global con la conexión
    $sql = "DELETE FROM productos WHERE id=?"; //---> Eliminación del producto por su id
    $stmt = $conn->prepare($sql); //---> Sentencia preparada y consulta
    $stmt->bind_param("i", $productoId); //---> Parametros de la sentencia
    return $stmt->execute(); //---> Retorna la ejecución de la consulta
}


function actualizarUsuario($usuarioId, $nombre, $email, $rol, $password = null) //---> Función para actualizar usuario
{
    global $conn; //---> Global con la conexión
    $sql = "UPDATE usuarios SET nombre= ?, email= ?, rol= ?"; //---> Actualización de usuario en base de datos
    if ($password) { //---> Verificación de la contraseña
        $passwordHash = password_hash($password, PASSWORD_DEFAULT); //---> Método de hasheo para guardarla
        $sql .= ", password = ?"; //---> Valor contraseña
    }
    $sql .= " WHERE id=?"; //---> Id del usuario en base de datos
    $stmt = $conn->prepare($sql); //---> Sentencia preparada y consulta
    if ($password) { //---> Verificación de contraseña a actualizar si es así la guarda
        $stmt->bind_param("ssssi", $nombre, $email, $rol, $passwordHash, $usuarioId); //---> Parametros a guardar
    } else { //---> Si no hay contraseña se guardan solo los valores
        $stmt->bind_param("ssss",  $nombre, $email, $rol, $usuarioId); //---> Parametros a guardar
    }
    return $stmt->execute(); //---> Retorna la ejecución de la consulta
}


function actualizarProducto($productoId, $nombreProducto, $precio) //---> Función par actualizar un producto
{
    global $conn; //---> Global con la conexión
    $sql = "UPDATE productos SET nombre=?, precio=? WHERE id=?"; //---> Actualización del producto en base de datos
    $stmt = $conn->prepare($sql); //---> Sentencia preparada y consulta
    $stmt->bind_param("sdi", $nombreProducto, $precio, $productoId); //---> Parametros a guardar en consulta
    return $stmt->execute(); //---> Retorna la ejecución de la consulta
}


//---> LÓGICA DE LAS FUNCIONES <---//
if ($_SERVER['REQUEST_METHOD'] === 'POST') { //---> Verificación de la solicitud, en este caso es post para envio de información al servidor
    global  $conn; //---> Global con la conexión
    $data = json_decode(file_get_contents("php://input"), true); //---> Toma los datos enviados en JSON y los pasa al array asociativo
    if (isset($data['accion'])) { //---> Verificación de que accion este dentro de los datos
        if ($data['accion'] === 'crear_usuario') { //---> Si la acción es de crear el usuario pues se crea un usuario
            if ($_SESSION['usuario_rol'] === 'admin' && isset($data['nombre'], $data['rol'], $data['password'], $data['email'])) { //---> Verificación del rol en sesión
                $nombre = $data['nombre']; //---> Valor del nombre en variable
                $rol = $data['rol']; //---> Valor del rol en variable
                $password = $data['password']; //---> Valor de la contraseña en variable
                $email = $data['email']; //---> Valor del correo en variable
                if (crearUsuario($nombre, $email, $rol, $password)) { //---> Se hace el llamado a la función para crear el usuario - solo si es true devuelve el mensaje de éxito
                    echo json_encode(['status' => 'success', 'message' => 'El usuario ha sido creado con éxito']); //---> De tener éxito devuelve el mensaje de éxito
                } else {
                    echo json_encode(['status' => 'error', 'message' => 'Erro al crear el usuario']); //---> De retornar false devuelve un error al crear el usuario
                }
            } else {
                echo json_encode(['status' => 'error', 'message' => 'No tienes acceso, solo administradores']); //---> De no ser admin o los datos no son, devuelve el error
            }
        }

        //---> Inicio de sesión
        elseif ($data['accion'] === 'login') { //---> Validación de la acción y si es login se querrá iniciar sesión
            $email = $data['email'] ?? ''; //---> Valor del correo en variable
            $password = $data['password'] ?? ''; //---> Valor de la contraseña en variable
            $usuario = iniciarSesion($email, $password); //---> Se hace el llamado a la función de inicio de sesión y se pasan los valores para verificación de inicio
            if ($usuario) { //---> Verificación para la función para saber si es un usuario válido
                $_SESSION['usuario_rol'] = $usuario['rol']; //---> Se guarda el rol del usuario en sesión
                echo json_encode([ //---> Array que contiene mensaje de éxito en JSON
                    'status' => 'success', //---> Estado de éxito
                    'message' => 'Inicio de sesión con éxito', //---> Mensaje de éxito
                    'usuario' => $usuario, //---> Envuelve todos los datos del usuario
                    'rol' => $usuario['rol'] //---> Se incluye el rol del usuario
                ]);
            } else { //---> De no ser encontrado el user o que los datos proporcionados por el no coincidan se procede al error
                echo json_encode(['status' => 'error', 'message' => 'Error al iniciar sesión']); //---> Mensaje de error
            }
        }

        //---> Creación de producto por el cliente o usuario
        elseif ($data['accion'] === 'crear_producto') { //---> Validación del la acción y si es crear un producto se querrá crear un producto
            if (isset($_SESSION['usuario_id'])) { //---> Verificación si el usuario inicio sesión y si existe el mismo con ese id
                $nombreProducto = $data['nombre_producto'] ?? ''; //---> Valor del nombre producto en variable
                $precio = $data['precio'] ?? 0; //---> Valor del precio de producto en variable
                if (crearProducto($nombreProducto, $precio)) { //---> Verificación de la función para el intento de crear un producto con los datos ingresados
                    echo json_encode(['status' => 'success', 'message' => 'El producto ha sido creado con éxito']); //---> De tener éxito se crea el producto y muestra mensaje
                } else { //---> De encontrarse un error se muestra un mensaje de error
                    echo json_encode(['status' => 'error', 'message' => 'No se puedo crear el producto']); //---> Mensaje de error
                }
            } else { //---> Si el usuario no ha iniciado sesión debe iniciar primero sesión para realizar una acción
                echo json_encode(['status' => 'error', 'message' => 'Debes iniciar primero sesión']); //---> Mensaje de inicio
            }
        }

        //---> Eliminación de usuarios solo por el administrador o el que tenga rol de admin
        elseif ($data['accion'] === 'eliminar_usuario') { //---> Validación de la acción y si es eliminar usuario se querrá eliminar un usuario
            if ($_SESSION['usuario_rol'] === 'admin' && isset($data['usuario_id'])) { //---> Verificación de que el usuario tenga el rol admin y si se envia el id del usuario que se desea eliminar
                $usuarioId = $data['usuario_id']; //---> Se aigna el id del usuario a eliminar
                if (eliminarUsuario($usuarioId)) { //---> Verificación de la función de eliminar usuario para intentar eliminar el usuario
                    echo json_encode(['status' => 'success', 'message' => 'EL usuario ha sido eliminado con éxito']); //---> De tener éxito muestra el mensaje de éxito
                } else { //---> De fallar la eliminación del usuario muestra mensaje de error
                    echo json_encode(['status' => 'error', 'message' => 'Error al eliminar el usuario']); //---> Mensaje de error
                }
            } else { //---> De no haber iniciado sesión o de no ser administrador mostrará el mensaje de error
                echo json_encode(['status' => 'error', 'message' => 'No tienes acceso']); //---> Mensaje de error
            }
        }

        //---> Actualizar usuario pero solo el administrador
        elseif ($data['accion'] === 'actualizar_usuario') { //---> validación de la acción y si es actualizar usuario se querrá actualizar un usuario
            if ($_SESSION['usuario_rol'] === 'admin' && isset($data['usuario_id'], $data['nombre'], $data['rol'], $data['email'])) { //---> Verifica si el usuario tiene el rol admin y los datos del usuario a actualizar
                $usuarioId = $data['usuario_id']; //---> Se asigna el id del usuario a actualizar
                $nombre = $data['nombre']; //---> Valor del nombre en variable
                $rol = $data['rol']; //---> Valor del rol en variable
                $email = $data['email']; //---> Valor del correo en variable
                $password = $data['password'] ?? null; //---> Valor de la contraseña en variable
                if (actualizarUsuario($usuarioId, $nombre, $email, $rol, $password)) { //---> Verificación de la función actualizar usuario para intentar actualizar el mismo
                    echo json_encode(['status' => 'success', 'message' => 'El usuario ha sido actualizado con éxito']); //---> De tener éxito la operación muestra mensaje de éxito
                } else { //---> De haber tenido un error se muestra un mensaje de error
                    echo json_encode(['status' => 'error', 'message' => 'Error al actualizar el usuario']); //---> Mensaje de error
                }
            } else { //---> De no haber iniciado sesión o no tener el rol de administrador se muestra mensaje de error
                echo json_encode(['status' => 'error', 'message' => 'No tienes acceso']); //---> Mensaje de error
            }
        }

        //---> Actualizar producto admin o usuario
        elseif ($data['accion'] === 'actualizar_producto') { //---> Validación de la acción si es actualizar producto se querrá actualizar un producto
            //var_dump($_SESSION['usuario_id'], $_SESSION['usuario_rol']);
            if (
                isset($_SESSION['usuario_id']) && //---> Se comprueba que el usuario este autenticado
                (isset($_SESSION['usuario_rol']) && //---> Se comprueba que se le asigne un rol al usuario
                    ($_SESSION['usuario_rol'] === 'admin' || $_SESSION['usuario_rol'] === 'usuario')) && //---> Se comprueba si el rol es admin o usuario
                isset($data['producto_id'], $data['nombre_producto'], $data['precio']) //---> Se comprueba que se envian los datos que se requieren
            ) {
                $productoId = $data['producto_id']; //---> Id del producto que se quiere actualizar
                $nombreProducto = $data['nombre_producto']; //---> Aquí se asigna el nuevo nombre del producto
                $precio = $data['precio']; //---> Aquí se asigna el nuevo precio del producto
                if (actualizarProducto($productoId, $nombreProducto, $precio)) { //---> Verificación de la función actualizar producto para intentar actualizar un producto
                    echo json_encode(['status' => 'success', 'message' => 'El producto ha sido actualizado con éxito']); //---> De tener éxito la operación se muestra mensaje de éxito
                } else { //---> De fallar la operación se muestra un mensaje de error
                    echo json_encode(['status' => 'error', 'message' => 'Error al actualizar el producto']); //---> Mensaje de error
                }
            } else { //---> De no haber iniciado sesión o no ser administrador se muestra mensaje de error
                echo json_encode(['status' => 'error', 'message' => 'No tienes acceso']); //---> Mensaje de error
            }
        }

        // ---> Eliminar producto solo admin
        elseif ($data['accion'] === 'eliminar_producto') { //---> Validación de la acción eliminar producto y si es, se querrá eliminar un producto
            if ($_SESSION['usuario_rol'] === 'admin' && isset($data['producto_id'])) { //---> Se comprueba que el rol del usuario sea admin y que se envíe el id del producto
                $productoId = $data['producto_id']; //---> Se asigna el id del producto a eliminar
                if (eliminarProducto($productoId)) { //---> Verificación de la función eliminar producto para intentar eliminar el producto
                    echo json_encode(['status' => 'success', 'message' => 'El producto ha sido eliminado con éxito']); //---> De tener éxito se muestra mensaje de éxito
                } else { //---> De fallar la operación de muestra mensaje de error
                    echo json_encode(['status' => 'error', 'message' => 'Error al eliminar el producto']); //---> Mensaje de error
                }
            } else { //---> De no haber iniciado sesión o de no ser administrador se muestra mensaje de error
                echo json_encode(['status' => 'error', 'message' => 'No tienes acceso']); //---> Mensaje de error
            }
        }
    }
}


//---> Listado de todos los usuarios en base de datos
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['accion']) && $_GET['accion'] === 'listar_usuarios') { //---> Se comprueba que el método sea get y si la acción es listar usuarios
    if ($_SESSION['usuario_rol'] === 'admin') { //---> Se valida que el rol del usuario sea admin para poder visualizar el listado de usuarios
        $sql = "SELECT * FROM usuarios"; //---> Se prepara la consulta que obtiene todos los usuarios
        $result = $conn->query($sql); //---> Se ejecuta la consulta en base de datos
        $usuarios = []; //---> Se crea un array vacío que contendrá los usuarios
        while ($row = $result->fetch_assoc()) { //---> se recorre cada fila y se añade al array de usuarios
            $usuarios[] = $row; //---> Proceso
        }
        echo json_encode(['usuarios' => $usuarios]); //---> Se devuelve los usuarios en JSON
    } else { //---> De no haber iniciado sesión o no ser administrador devulve un mensaje de error
        echo json_encode(['status' => 'error', 'message' => 'No tienes acceso']); //---> Mensaje de error
    }
}

//---> Listado de todos los productos en base de datos
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['accion']) && $_GET['accion'] === 'listar_productos') { //---> Se comprueba que el método es get y que la acción es listar productos
    $sql = "SELECT * FROM productos"; //---> Se prepara la consulta que obtiene todos los productos
    $result = $conn->query($sql); //---> Se ejecuta la consulta en base de datos
    $productos = []; //---> Se crea un array vacío que contendrá los productos
    while ($row = $result->fetch_assoc()) { //---> se recorre cada fila y se añade al array de productos
        $productos[] = $row; //---> Proceso
    }
    echo json_encode(["productos" => $productos]); //---> Se devuelven los productos en JSON
}

//---> Cerrar Sesión
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($data['accion']) && $data['accion'] === 'logout') { //---> Se comprueba que el método sea post y que la acción sea cerrar sesión
    session_unset(); //---> Limpia toda variable de sesión
    session_destroy(); //---> Destruye la sesión actual
    echo json_encode(['status' => 'success', 'message' => 'Sesión finalizada con éxito']); //---> Se devuelve el mensaje de éxito en JSON
}
exit; //---> Finalización del script una vez se procese la solicitud
$conn->close(); //---> Se cierra la conexión a la base de datos
