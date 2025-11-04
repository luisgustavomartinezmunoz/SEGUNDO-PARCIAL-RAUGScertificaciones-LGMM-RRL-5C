# SEGUNDO-PARCIAL-RAUGScertificaciones-LGMM-RRL-5C
SEGUNDO PARCIAL / RAUGS / LGMM RRL / 5C
Estructura del proyecto
RAUGS.CERTIFICADOS.PROYECTOFRONT-END.LGMM.RRL.5C/
│
├── back/                      # Backend con Node.js y Express
│   ├── controllers/           # Controladores para manejar las rutas
│   ├── data/                  # Arreglos de objetos (usuarios, preguntas, certificaciones)
│   ├── middleware/            # Middleware de verificación de token
│   ├── routes/                # Rutas del servidor (auth, exam, contact)
│   ├── public/images/         # Imágenes (firmas y logotipos para los certificados)
│   ├── server.js              # Archivo principal del servidor
│   ├── package.json
│   └── package-lock.json
│
└── front/                     # Frontend con HTML, CSS y JS
    ├── css/                   # Estilos generales
    ├── js/                    # Lógica del frontend y conexión con la API
    ├── images/                # Imágenes del sitio (logo, favicon, banners)
    ├── index.html             # Página principal
    ├── certificaciones.html   # Página de certificaciones
    ├── contacto.html          # Página de contacto
    ├── nosotros.html          # Página de información del equipo
    └── examen.html            # Página del examen activo

Instalación y ejecución

Clonar el repositorio:

git clone https://github.com/luisgustavomartinezmunoz/SEGUNDO-PARCIAL-RAUGScertificaciones-LGMM-RRL-5C.git


Entrar a la carpeta del backend:

cd RAUGS.CERTIFICADOS.PROYECTOFRONT-END.LGMM.RRL.5C/back


Instalar dependencias:

npm install


Ejecutar el servidor:

npm start


Abrir el sitio en el navegador:

http://localhost:3000
