import mongoose, { model } from "mongoose";

const usuarioSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        trim:true,
        unique:true,
    },
    email:{
        type:String,
        required:true,
        trim:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    },
    tipoUsuario: {
        type: String,
        enum: ['admin', 'usuario'],
        default: 'usuario',
        required: true
    },
    salt:{
        type:String,
        required:true
    }
},
{
    timestamps:true
}
);

export default mongoose.model( 'User' , usuarioSchema);