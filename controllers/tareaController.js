const Tarea = require('../models/Tarea')
const Proyecto = require('../models/Proyecto')
const {validationResult} = require('express-validator')

//crea una nueva tarea
exports.crearTarea = async (req, res) => {

  //revisar si hay errores
  const errores = validationResult(req)
  if(!errores.isEmpty()) {
    return res.status(400).json({errores: errores.array()})
  }

  try {
    
    //extraer el proyecto y comprobar si hay errores
    const {proyecto} = req.body

    const existeProyecto = await Proyecto.findById(proyecto)
    if(!existeProyecto) {
      return res.status(404).json({msg: 'Proyecto no encontrado'})
    }

    //revisar si el proyecto actual pertence al usuario autenticado
    if(existeProyecto.creador.toString() !== req.usuario.id) {
      return res.status(401).json({msg: 'No autorizado'})
    }

    //creamos la tarea
    const tarea = new Tarea(req.body)
    await tarea.save()
    res.json({tarea})

  } catch (error) {
    console.log(error)
    res.status(500).send('Hubo un error creando tarea')
  }

}

//obtiene las tareas por proyecto
exports.obtenerTareas = async (req, res) => {
  try {
    //extraer el proyecto y comprobar si hay errores
    const {proyecto} = req.query

    const existeProyecto = await Proyecto.findById(proyecto)
    if(!existeProyecto) {
      return res.status(404).json({msg: 'Proyecto no encontrado'})
    }

    //revisar si el proyecto actual pertence al usuario autenticado
    if(existeProyecto.creador.toString() !== req.usuario.id) {
      return res.status(401).json({msg: 'No autorizado'})
    }

    //obtener las tareas por proyecto
    const tareas = await Tarea.find({proyecto}).sort({creado: -1})
    res.json({tareas})

  } catch (error) {
    console.log(error)
    res.status(500).send('Hubo un error')
  }
}

//actualizar una tarea
exports.actualizarTarea = async (req, res) => {
  try {
    //extraer el proyecto y comprobar si hay errores
    const {proyecto, nombre, estado} = req.body

    //revisar si la tarea existe
    let tarea = await Tarea.findById(req.params.id)

    if(!tarea) {
      return res.status(404).json({msg: 'No existe esa tarea'})
    }

    //extraer proyecto
    const existeProyecto = await Proyecto.findById(proyecto)

    //revisar si el proyecto actual pertence al usuario autenticado
    if(existeProyecto.creador.toString() !== req.usuario.id) {
      return res.status(401).json({msg: 'No autorizado'})
    }

    //crear un objeto con la nueva informacion
    const nuevaTarea = {}

    nuevaTarea.nombre = nombre
    nuevaTarea.estado = estado

    //guardar tarea
    tarea = await Tarea.findOneAndUpdate({_id: req.params.id}, nuevaTarea, {new: true})

    res.json({tarea})

  } catch (error) {
    console.log(error)
    res.status(500).send('Hubo un error actualizando tarea')
  }
}

//elimina una tarea
exports.eliminarTarea = async (req, res) => {
  try {
    //extraer el proyecto y comprobar si hay errores
    const {proyecto} = req.query

    //revisar si la tarea existe
    let tarea = await Tarea.findById(req.params.id)

    if(!tarea) {
      return res.status(404).json({msg: 'No existe esa tarea'})
    }

    //extraer proyecto
    const existeProyecto = await Proyecto.findById(proyecto)

    //revisar si el proyecto actual pertence al usuario autenticado
    if(existeProyecto.creador.toString() !== req.usuario.id) {
      return res.status(401).json({msg: 'No autorizado'})
    }

    //eliminar
    await Tarea.findOneAndRemove({_id: req.params.id})
    res.json({msg: 'Tarea eliminada'})

  } catch (error) {
    console.log(error)
    res.status(500).send('Hubo un error actualizando tarea')
  }
}