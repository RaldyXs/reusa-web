"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_js_1 = require("../config/database.js");
const CANTIDAD_USUARIOS = 100;
const nombres = [
    "Ana",
    "Carlos",
    "María",
    "José",
    "Laura",
    "Pedro",
    "Sofía",
    "Miguel",
    "Daniela",
    "Luis",
    "Paola",
    "Andrés",
    "Camila",
    "Fernando",
    "Gabriela",
    "Javier",
    "Patricia",
    "Roberto",
    "Valentina",
    "Samuel",
];
const apellidos = [
    "Pérez",
    "Rodríguez",
    "García",
    "Martínez",
    "Sánchez",
    "Ramírez",
    "Torres",
    "Díaz",
    "Reyes",
    "Mendoza",
    "Castillo",
    "Jiménez",
    "Ortiz",
    "Vargas",
    "Morales",
];
const ubicaciones = [
    "Santo Domingo",
    "Los Alcarrizos",
    "Santiago",
    "La Vega",
    "San Cristóbal",
    "Bonao",
    "Puerto Plata",
    "Baní",
    "San Pedro de Macorís",
    "La Romana",
];
const titulosPorCategoria = {
    electronica: [
        "Televisor inteligente",
        "Bocina Bluetooth",
        "Audífonos inalámbricos",
        "Tablet en buen estado",
        "Consola de videojuegos",
    ],
    hogar: [
        "Juego de comedor",
        "Nevera en excelente estado",
        "Estufa de cuatro hornillas",
        "Lavadora automática",
        "Abanico de pedestal",
    ],
    vehiculos: [
        "Motocicleta económica",
        "Bicicleta de montaña",
        "Aros deportivos",
        "Radio para vehículo",
        "Juego de neumáticos",
    ],
    ropa: [
        "Vestido elegante",
        "Zapatos deportivos",
        "Camisa para hombre",
        "Cartera para mujer",
        "Pantalón nuevo",
    ],
    deportes: [
        "Bicicleta deportiva",
        "Juego de pesas",
        "Pelota de baloncesto",
        "Guantes de boxeo",
        "Caminadora eléctrica",
    ],
    otros: [
        "Artículo en excelente estado",
        "Producto poco usado",
        "Accesorio práctico",
        "Equipo disponible",
        "Artículo de oportunidad",
    ],
};
const condiciones = [
    "nuevo",
    "usado",
    "reparado",
];
const estados = [
    "activo",
    "activo",
    "activo",
    "activo",
    "vendido",
    "archivado",
];
function seleccionarAleatorio(elementos) {
    const elemento = elementos[Math.floor(Math.random() * elementos.length)];
    if (elemento === undefined) {
        throw new Error("No se pudo seleccionar un elemento aleatorio");
    }
    return elemento;
}
function normalizarTexto(texto) {
    return texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase();
}
function generarTelefono(indice) {
    const numero = String(1000000 + indice).slice(-7);
    return `809-${numero.slice(0, 3)}-${numero.slice(3)}`;
}
function generarPrecio() {
    const precioBase = Math.floor(Math.random() * 45000) +
        500;
    return Math.round(precioBase / 50) * 50;
}
function generarFechaPasada() {
    const ahora = new Date();
    const diasPasados = Math.floor(Math.random() * 365);
    const horasPasadas = Math.floor(Math.random() * 24);
    ahora.setDate(ahora.getDate() - diasPasados);
    ahora.setHours(ahora.getHours() - horasPasadas);
    return ahora;
}
async function limpiarDatosDemo() {
    const conexion = await database_js_1.pool.getConnection();
    try {
        await conexion.beginTransaction();
        await conexion.execute(`
        DELETE FROM articulos
        WHERE vendedor_id IN (
          SELECT usuario_id
          FROM usuarios
          WHERE email LIKE 'demo%@reusa.test'
        )
      `);
        await conexion.execute(`
        DELETE FROM usuarios
        WHERE email LIKE 'demo%@reusa.test'
      `);
        await conexion.commit();
    }
    catch (error) {
        await conexion.rollback();
        throw error;
    }
    finally {
        conexion.release();
    }
}
async function insertarDatosDemo() {
    const conexion = await database_js_1.pool.getConnection();
    try {
        const [categorias] = await conexion.execute(`
          SELECT
            categoria_id,
            nombre
          FROM categorias
          WHERE activo = 1
          ORDER BY categoria_id
        `);
        if (categorias.length === 0) {
            throw new Error("No existen categorías activas. Crea al menos una categoría antes de ejecutar el seed.");
        }
        const contrasenaCifrada = await bcryptjs_1.default.hash("Demo1234", 10);
        await conexion.beginTransaction();
        let publicacionesInsertadas = 0;
        for (let indice = 1; indice <= CANTIDAD_USUARIOS; indice += 1) {
            const nombre = seleccionarAleatorio(nombres);
            const apellido = seleccionarAleatorio(apellidos);
            const ubicacion = seleccionarAleatorio(ubicaciones);
            const email = `demo${indice}@reusa.test`;
            const telefono = generarTelefono(indice);
            const fechaRegistro = generarFechaPasada();
            const activo = Math.random() < 0.9 ? 1 : 0;
            const [resultadoUsuario] = await conexion.execute(`
            INSERT INTO usuarios (
              nombre,
              apellido,
              email,
              contrasena,
              telefono,
              ubicacion,
              rol,
              activo,
              fecha_registro
            )
            VALUES (
              ?,
              ?,
              ?,
              ?,
              ?,
              ?,
              'usuario',
              ?,
              ?
            )
          `, [
                nombre,
                apellido,
                email,
                contrasenaCifrada,
                telefono,
                ubicacion,
                activo,
                fechaRegistro,
            ]);
            const usuarioId = resultadoUsuario.insertId;
            const cantidadPublicaciones = Math.floor(Math.random() * 4) +
                1;
            for (let numeroPublicacion = 1; numeroPublicacion <=
                cantidadPublicaciones; numeroPublicacion += 1) {
                const categoria = seleccionarAleatorio(categorias);
                const nombreNormalizado = normalizarTexto(categoria.nombre);
                const titulos = titulosPorCategoria[nombreNormalizado] ?? titulosPorCategoria.otros;
                if (!titulos) {
                    throw new Error("No se encontraron títulos de prueba");
                }
                const tituloBase = seleccionarAleatorio(titulos);
                const titulo = `${tituloBase} ${indice}-${numeroPublicacion}`;
                const condicion = seleccionarAleatorio(condiciones);
                const estado = seleccionarAleatorio(estados);
                const archivado = estado === "archivado"
                    ? 1
                    : 0;
                const precio = generarPrecio();
                const fechaPublicacion = generarFechaPasada();
                const descripcion = `${tituloBase} disponible en ${ubicacion}. Producto de demostración creado para visualizar y probar el marketplace Re-Usa Web.`;
                await conexion.execute(`
            INSERT INTO articulos (
              vendedor_id,
              categoria_id,
              titulo,
              descripcion,
              precio,
              condicion,
              ubicacion,
              estado,
              fecha_publicacion,
              fecha_actualizacion,
              archivado
            )
            VALUES (
              ?,
              ?,
              ?,
              ?,
              ?,
              ?,
              ?,
              ?,
              ?,
              ?,
              ?
            )
          `, [
                    usuarioId,
                    categoria.categoria_id,
                    titulo,
                    descripcion,
                    precio,
                    condicion,
                    ubicacion,
                    estado,
                    fechaPublicacion,
                    fechaPublicacion,
                    archivado,
                ]);
                publicacionesInsertadas += 1;
            }
        }
        await conexion.commit();
        console.log(`Se insertaron ${CANTIDAD_USUARIOS} usuarios de demostración.`);
        console.log(`Se insertaron ${publicacionesInsertadas} publicaciones de demostración.`);
        console.log("Contraseña de todas las cuentas demo: Demo1234");
    }
    catch (error) {
        await conexion.rollback();
        throw error;
    }
    finally {
        conexion.release();
    }
}
async function ejecutarSeed() {
    try {
        console.log("Eliminando datos demo anteriores...");
        await limpiarDatosDemo();
        console.log("Creando datos de demostración...");
        await insertarDatosDemo();
    }
    catch (error) {
        console.error("No se pudieron generar los datos de demostración:", error);
        process.exitCode = 1;
    }
    finally {
        await database_js_1.pool.end();
    }
}
void ejecutarSeed();
