import mongoose from 'mongoose';

const villaSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  titulo: {
    type: String,
    required: true
  },
  categoria: {
    type: String,
    required: true
  },
  precio: {
    type: Number,
    required: true
  },
  descripcion: {
    type: String,
    required: true
  },
  icono: {
    type: String,
    default: "fa-city"
  },
  tags: {
    type: String
  }
}, {
  timestamps: true,
  collection: "villas"
});

export default mongoose.model('Villa', villaSchema);