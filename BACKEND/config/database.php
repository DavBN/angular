<?php
$host = "localhost"; //---> El host de la base de datos
$username = "root"; //---> El username que se usa en workbench
$password = "123456789"; //---> Contraseña del workbench
$dbname = "sistema_archivos"; //---> Base de datos 

$conn = new mysqli($host, $username, $password, $dbname); //---> Conexión con mysqli - pasando las variables para poder ser usadas en la conexión

if ($conn->connect_error) { //---> Validación de la conexión y error
    die("Connection failed: " . $conn->connect_error);  //--->  Si la conexión falla mostrar error 
}
?>

