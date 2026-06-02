/*function textoError(mensaje){
    var mensajeUsuario, mensajeOriginal;
    switch(mensaje){
        case 'Registro agregado':
            mensajeUsuario:"Registro agregado correctamente";
            mensajeOriginal:"Registro agregado correctamente";
        break;
        case 'Usuario duplicado':
            mensajeUsuario = "Error, el suseario o correo ya existe";
            mensajeOriginal = "usuario duplicado";   
        break;
        case 'ingreso correcto':
            mensajeUsuario ="ingreso correcto";
            mensajeOriginal = "ingreso correcto";
        break;
        case 'datos incorrectos':
            mensajeUsuario ="Datos incorrectos";
            mensajeOriginal = "datos incorrectos";
        break;
    default:
        mensajeUsuario = "Error desconocido";
        mensajeOriginal = mensaje;           
    }

    if(mensaje == "MongooseError: Operation `users.insertOne()` buffering timed out after 10000ms"){
        mensajeUsuario = "Error al guardar el registro";
        mensajeOriginal = "MongooseError: Operation useers, insertOne()";
    }
    return{
        mensajeUsuario,
        mensajeOriginal
    }
}*/

export function mensajes(status, message, mensajeUsuario, mensajeOriginal = "", token = ""){
    //console.log(error);
    //const {mensajeUsuario, mensajeOriginal} = textoError(error);
    return{
        status,
        message,
        mensajeUsuario,
        mensajeOriginal,
        token
    }
}