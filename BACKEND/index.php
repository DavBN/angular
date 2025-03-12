<?php
//CORS
header("Access-Control-Allow-Origin: *"); //Angular
header("Access-Control-Allow-Credentials: true"); // Credenciales
header("Access-Control-Allow-Methods: GET, POST, DELETE, PUT, OPTIONS"); //Accione
header("Access-Control-Allow-Headers: Content-Type, Authorization"); //Cabeceras
header('Content-Type: application/json'); // Contenido
session_start(); // Inicio de sesion
require('./config/database.php'); // Conexión a la base de datos

// FUNCIONES DEL SOFTWARE
function crearUsuario($nombre, $email, $rol, $password) //Función de crear el usuario
{
    global $conn; // Conexión
    $passwordHash = password_hash($password, PASSWORD_DEFAULT); // Hash para encriptar la contraseña
    $sql = "INSERT INTO usuarios (nombre, email, rol, password) VALUES (?, ?, ?, ?)"; // Hace la consulta SQL
    $stmt = $conn->prepare($sql); // Se prepara la consulta
    $stmt->bind_param("ssss", $nombre, $email, $rol, $passwordHash); // Se toiman los parametros
    return $stmt->execute(); // Se ejecuta la consulta
}

function iniciarSesion($email, $password) // Función para iniciar sesión
{
    global $conn; // Conexión
    $sql = "SELECT * FROM usuarios WHERE email = ?"; // Consulta 
    $stmt = $conn->prepare($sql); // Se prepara la consulta
    $stmt->bind_param("s", $email); // Se toman parametros
    $stmt->execute(); // Se ejecuta la consulta
    $result = $stmt->get_result(); // Obtiene el resultado
    if ($result && $result->num_rows > 0) { // Válida si hay un resultado
        $usuario = $result->fetch_assoc(); // Obtiene el usuario
        if (password_verify($password, $usuario['password'])) { // Válida la contraseña de este
            $_SESSION['usuario_id'] = $usuario['id']; // Guarda en sesión el id del usuario
            $_SESSION['usuario_nombre'] = $usuario['nombre']; // Guarda en sesión el nombre del usuario
            $_SESSION['usuario_rol'] = $usuario['rol']; // Guarda en sesión el rol del usuario
            $_SESSION['usuario_email'] = $usuario['email']; // Guarda en sesión el email del usuario
            return $usuario; // Retorna el usuario con sus datos
        }
    }
    return null; // Si no hay un usuario retorna null
}

function crearProducto($nombreProducto, $precio, $imagen = null) // Función para crear el producto
{
    global $conn; // Conexión
    $usuarioId = $_SESSION['usuario_id']; // // Se obtiene el id del usuario en sesión
    $sql = "INSERT INTO productos (nombre, precio, imagen, id_usuario) VALUES (?, ?, ?, ?)"; // Consulta SQL
    $stmt = $conn->prepare($sql); // Se prepara la consulta SQL
    $stmt->bind_param("sdss", $nombreProducto, $precio, $imagen, $usuarioId); // Se toman parametros
    return $stmt->execute(); // Se ejecuta la consulta
}

function eliminarUsuario($usuarioId) // Función para eliminar un usuario
{
    global $conn; // Conexión
    $sql = "DELETE FROM usuarios WHERE id = ?"; // Consulta SQL
    $stmt = $conn->prepare($sql); // Se prepara la consulta SQL
    $stmt->bind_param("i", $usuarioId); // Se toman parametros
    return $stmt->execute(); // Se ejecuta la consulta
}

function eliminarProducto($productoId) // Función para eliminar un producto
{
    global $conn; // Conexión
    $sql = "DELETE FROM productos WHERE id = ?"; // Consulta SQL
    $stmt = $conn->prepare($sql); // Se prepara la consulta SQL
    $stmt->bind_param("i", $productoId); // Se toman parametros
    return $stmt->execute(); // Se ejecuta la consulta
}

function actualizarUsuario($usuarioId, $nombre, $email, $rol, $password = null) // Función para actualizar los usuarios
{
    global $conn; // Conexión
    $sql = "UPDATE usuarios SET nombre = ?, email = ?, rol = ?"; // Consulta SQL
    if ($password) { // Verifica si hay una contraseña
        $passwordHash = password_hash($password, PASSWORD_DEFAULT); // Se encripta la contraseña
        $sql .= ", password = ?"; // Se agrega la contraseña a la consulta
    }
    $sql .= " WHERE id = ?"; // Se agrega el id a la consulta
    $stmt = $conn->prepare($sql); // Se prepara la consulta 
    if ($password) { // Verifica si hay una contraseña
        $stmt->bind_param("ssssi", $nombre, $email, $rol, $passwordHash, $usuarioId); // Toma de parametros
    } else { // si no hay contraseña se procede
        $stmt->bind_param("sssi", $nombre, $email, $rol, $usuarioId); // Toma de parametros
    }
    return $stmt->execute(); // Se ejecuta la consulta
}

function actualizarProducto($productoId, $nombreProducto, $precio, $imagen) //---> Función para actualizar los productos
{
    global $conn; // Conexión
    $sql = "UPDATE productos SET nombre = ?, precio = ?"; //---> Consulta SQL
    if ($imagen) { //---> Valida que hay una imagen
        $sql .= ", imagen = ?"; //---> Se agrega la imagen a la consulta
    }
    $sql .= " WHERE id = ?"; //---> Se agrega el id a la consulta
    $stmt = $conn->prepare($sql); //---> Se prepara la consulta
    if ($imagen) { //---> Se vuelve a validar si hay una imagen
        $stmt->bind_param("sdsi", $nombreProducto, $precio, $imagen, $productoId); //---> Se toman los parametros
    } else { //---> Si no hay una imagen se ejecuta sin imagen
        $stmt->bind_param("sdi", $nombreProducto, $precio, $productoId); //---> Se toman los parametros
    }
    return $stmt->execute(); //---> Se ejecuta la consulta
}


if ($_SERVER['REQUEST_METHOD'] === 'POST') { //---> Verificación del método que sea petición POST
    if (isset($_POST['accion']) && $_POST['accion'] === 'subir_imagen' && isset($_FILES['imagen'])) { //---> Verifica si existe una acción y esa acción es subir imagen y cuenta con un archivo tipo FILE
        $targetDir = __DIR__ . "/imagenes/"; //---> Carpeta dónde se guardarán las imagenes
        if (!is_dir($targetDir)) { //---> Verifica si la carpeta existe
            if (!mkdir($targetDir, 0777, true)) { //---> En caso no de no existir la carpeta, la crea
                echo json_encode(['status' => 'error', 'message' => 'No se pudo crear el directorio de imágenes']); //---> Mensaje de error en cao no poder crear la carpeta
                exit; //---> Fin del script
            }
        }
        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']; //---> Tipos de archivos o imagenes permitidas
        $fileType = mime_content_type($_FILES['imagen']['tmp_name']); //---> El tipo de archivo que se espera se suba
        if (!in_array($fileType, $allowedTypes)) { //---> Verifica si el tipo de archivo es permitido
            echo json_encode(['status' => 'error', 'message' => 'Tipo de archivo no permitido']); //---> Mensaje de error en caso de subir un archivo en formato no permitido
            exit; //---> Fin del script
        }
        $fileName = uniqid() . '_' . basename($_FILES['imagen']['name']); //---> Nombre del archivo 
        $targetFile = $targetDir . $fileName; //---> La ruta del archivo
        $baseUrl = "http://" . $_SERVER['HTTP_HOST']; //---> Establece una url base
        $relativePath = str_replace($_SERVER['DOCUMENT_ROOT'], '', $targetDir); //---> Ruta relativa establecida
        $publicUrl = $baseUrl . $relativePath . $fileName; //---> Url pública de la imagen para usar
        if ($_FILES['imagen']['error'] === UPLOAD_ERR_OK && move_uploaded_file($_FILES['imagen']['tmp_name'], $targetFile)) { //---> Verifica si no existen errores al subir una imagen y se agrega a la carpeta
            echo json_encode(['status' => 'success', 'message' => 'Imagen subida con éxito', 'url' => $publicUrl]); //---> Mensaje en caso de éxito al subir una imagen
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Error al subir la imagen']); //---> Mensaje en caso de erro al no poder subir la imagen
        }
        exit; //--> Fin del script
    }


    $data = json_decode(file_get_contents("php://input"), true); //---> Validación para obtener JSON
    if (isset($data['accion'])) { // Verificación de si hay una acción
        switch ($data['accion']) { // Switch para manejar las acciones por casos
            case 'crear_usuario': // Caso 1 para crear un usuario
                if ($_SESSION['usuario_rol'] === 'admin' && isset($data['nombre'], $data['email'], $data['rol'], $data['password'])) { // Verifica si el usuario es admin y contiene los datos del mismo
                    if (crearUsuario($data['nombre'], $data['email'], $data['rol'], $data['password'])) { // Verifica si se crea el usuario
                        echo json_encode(['status' => 'success', 'message' => 'Usuario creado con éxito']); // Mensaje de éxito en caso de tenerlo
                    } else { // si el usuario no se pudo crear
                        echo json_encode(['status' => 'error', 'message' => 'Error al crear el usuario']); // Mensaje de error al crear el usuario
                    }
                } else { // Si el usuario no es admin o no tiene los datos permitidos
                    echo json_encode(['status' => 'error', 'message' => 'Acceso denegado o datos incompletos']); // Mensaje de error no tiene acceso al apartado
                }
                break; // Fin del caso y sale

            case 'login': // Caso 2 para inicio de sesión
                if (isset($data['email'], $data['password'])) { // Verificación de datos
                    $usuario = iniciarSesion($data['email'], $data['password']); // Datos de inicio de sesión
                    if ($usuario) { // Valida si un usuario existe
                        echo json_encode(['status' => 'success', 'message' => 'Inicio de sesión exitoso', 'usuario' => $usuario]); // Mensaje de éxito en caso de que exista el usuario con esos datos
                    } else { // De no existir el usuario o poner datos incorrectos
                        echo json_encode(['status' => 'error', 'message' => 'Credenciales incorrectas']); // Mensaje de error al colocar datos incorrectos
                    }
                } else { // Si no se ponen los datos completos
                    echo json_encode(['status' => 'error', 'message' => 'Datos incompletos']); // Mensaje de error al poner datos incorrectos o incompletos
                }
                break; // Fin del caso y sale

            case 'crear_producto': // Caso 3 para crear el producto
                if (isset($_SESSION['usuario_id'], $data['nombre_producto'], $data['precio'])) { // Verifica los datos del producto y el usuario id que lo creo
                    $imagen = $data['imagen'] ?? null; 
                    if (crearProducto($data['nombre_producto'], $data['precio'], $imagen)) { // Verifica si se crea el producto
                        echo json_encode(['status' => 'success', 'message' => 'Producto creado con éxito']); // Mensaje de éxito al crear un producto
                    } else { // En caso no de crearse el producto
                        echo json_encode(['status' => 'error', 'message' => 'Error al crear el producto']); // Mensaje de error que indica que hubo error al crear el producto
                    }
                } else { // En caso de no haber iniciado sesión o poner datos incorrectos
                    echo json_encode(['status' => 'error', 'message' => 'Debes iniciar sesión o datos incompletos']); // Mensaje de error de primero iniciar sesión o poner datos correctos
                }
                break; // Fin del caso y sale

            case 'eliminar_usuario': // Caso 4 para eliminar el usuario
                if ($_SESSION['usuario_rol'] === 'admin' && isset($data['usuario_id'])) { // Verifica si el usuario es admin y si se usa el id del usuario a eliminar
                    if (eliminarUsuario($data['usuario_id'])) { // Verifica si se elimina ese usuario
                        echo json_encode(['status' => 'success', 'message' => 'Usuario eliminado con éxito']); // Mensaje de éxito en caso de eliminar con éxito el usuario
                    } else { // En caso de no haber eliminado el usuario
                        echo json_encode(['status' => 'error', 'message' => 'Error al eliminar el usuario']); // Mensaje de error al no poder eliminar el usuario
                    }
                } else { // En caso de no ser el administrador
                    echo json_encode(['status' => 'error', 'message' => 'Acceso denegado o datos incompletos']); // Mensaje de error por temas de acceso
                }
                break; // Fin del caso y sale

            case 'actualizar_usuario': // Caso 5 para actualizar los datos del usuario
                if ($_SESSION['usuario_rol'] === 'admin' && isset($data['usuario_id'], $data['nombre'], $data['email'], $data['rol'])) { // Se verifica si es admin y si tiene los datos del usuario
                    $password = $data['password'] ?? null; // Verifica si existe una contraseña
                    if (actualizarUsuario($data['usuario_id'], $data['nombre'], $data['email'], $data['rol'], $password)) { // Verificación de si se actualiza el usuario
                        echo json_encode(['status' => 'success', 'message' => 'Usuario actualizado con éxito']); // Mensaje de éxito en caso de actualizar con éxito los datos del usuario
                    } else { // En caso de no poder actualizar los datos
                        echo json_encode(['status' => 'error', 'message' => 'Error al actualizar el usuario']); // Mensaje de error al no poder actualizar los datos del usuario
                    }
                } else { // En caso no ser admin
                    echo json_encode(['status' => 'error', 'message' => 'Acceso denegado o datos incompletos']); // Mensaje de error de acceso denegado 
                }
                break; // Fin del caso y sale

            case 'actualizar_producto': // Caso 6 para actualizar los productos
                if (isset($_SESSION['usuario_id'], $data['producto_id'], $data['nombre_producto'], $data['precio'])) { // Verifica si hay inicio de sesión y los datos del producto
                    $imagen = $data['imagen'] ?? null; // Verificación de si hay una imagen
                    if (actualizarProducto($data['producto_id'], $data['nombre_producto'], $data['precio'], $imagen)) { // Verifica si se actualizan los datos del producto
                        echo json_encode(['status' => 'success', 'message' => 'Producto actualizado con éxito']); // Mensaje de éxito en caso de actualizar correctamente los datos
                    } else { // En caso de no poder actualizar los datos
                        echo json_encode(['status' => 'error', 'message' => 'Error al actualizar el producto']); // Mensaje de error al no poder actualizar los nuevos datos del producto
                    }
                } else { // En caso de no haber iniciado una sesión no podrá hacer la acción
                    echo json_encode(['status' => 'error', 'message' => 'Debes iniciar sesión o datos incompletos']); // Mensaje de error de debes iniciar sesión primero
                }
                break; // Fin del caso y sale

            case 'eliminar_producto': // Caso 7 para eliminar un producto
                if ($_SESSION['usuario_rol'] === 'admin' && isset($data['producto_id'])) { // Verifica si es admin y si se tiene el id del producto
                    if (eliminarProducto($data['producto_id'])) { // Verificación de si se elimina el producto
                        echo json_encode(['status' => 'success', 'message' => 'Producto eliminado con éxito']); // Mensaje de éxito en caso de eliminar el producto correctamente
                    } else { // En caso de no poder eliminar el producto
                        echo json_encode(['status' => 'error', 'message' => 'Error al eliminar el producto']); // Mensaje de error de no poder eliminar el producto
                    }
                } else { // En caso de no ser admin
                    echo json_encode(['status' => 'error', 'message' => 'Acceso denegado o datos incompletos']); // Mensaje de error de acceso denegado
                }
                break; // Fin del caso y sale

                case 'metodo_post_activado': 
                    echo json_encode(['status' => 'success', 'message' => 'metodo post activado'], JSON_PRETTY_PRINT);
                    break;

            case 'logout': // Caso 8 para cerrar la sesión
                session_unset(); // Limpia la sesión del usuario
                session_destroy(); // Destruye la sesión del usuario
                echo json_encode(['status' => 'success', 'message' => 'Sesión cerrada con éxito']); // Mensaje de éxito para inidicar el correcto cierre de sesión
                break; // Fin del caso y sale

            default: // Caso por defecto
                echo json_encode(['status' => 'error', 'message' => 'Acción no válida']); // Mensaje de error de una acción no válida
                break; // Fin del caso y sale
        }
    } else { // En caso de no existir una acción
        echo json_encode(['status' => 'error', 'message' => 'No hay una acción especifica']); // Mensaje de error no haber indicado una acción
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') { // Verificación del método de la petición es get
    if (isset($_GET['accion'])) { // Verifica si hay una acción
        switch ($_GET['accion']) { // Switch para manejar los casos
            case 'listar_usuarios': // Caso 1 para listar los usuarios
                if ($_SESSION['usuario_rol'] === 'admin') { // Verifica si el usuario es admin
                    $sql = "SELECT * FROM usuarios"; // Consulta SQL
                    $result = $conn->query($sql); // Se ejecuta la consulta
                    $usuarios = []; // Se crea un arreglo de usuario
                    while ($row = $result->fetch_assoc()) { // Se recorre el resultado 
                        $usuarios[] = $row; // Se agrega el resultado al arreglo
                    }
                    echo json_encode(['usuarios' => $usuarios]); // Se muestra el resultado del arreglo
                } else { // En caso de no ser admin
                    echo json_encode(['status' => 'error', 'message' => 'no tienes acceso']); // Mensaje de error no tiene el acceso
                }
                break; // Fin del caso y sale

                case 'metodo_get_activado': 
                    echo json_encode(['status' => 'success', 'message' => 'metodo get activado'], JSON_PRETTY_PRINT);
                    break;

            case 'listar_productos': // Caso 2 para listar los productos
                $sql = "SELECT * FROM productos"; // Consulta SQL
                $result = $conn->query($sql); // Se ejecuta la consulta
                $productos = []; // Se crea un arreglo de productos
                while ($row = $result->fetch_assoc()) { // Recorre el resultado 
                    $productos[] = $row; // Se agrega el resultado al arreglo
                }
                echo json_encode(['productos' => $productos]); // Se muestra el resultado del arreglo
                break; // Fin del caso y sale

            default: // Caso por defecto
                echo json_encode(['status' => 'Error', 'message' => 'Acción no válida']); // Mensaje de error de acción no válida
                break; // Fin del caso y sale
        }
    } else { // En caso de existir una acción
        echo json_encode(['status' => 'Error', 'message' => 'No hay una acción o método especifico, por favor redireccione']); // Mensaje de error de no haber una acción
    }
} else { // En caso de no ser un método ya sea post o get
    echo json_encode(['status' => 'Error', 'message' => 'No soportado']); // Mensaje de error de no soportado
}

$conn->close(); // Cierre de la conexión
exit; // Fin del script


