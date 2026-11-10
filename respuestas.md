# Respuestas

##Ejercicio 0

********api-rastro (main)
$ git push

remote: error: GH013: Repository rule violations found for refs/heads/main.
remote: Review all repository rules at https://github.com/laumarva99/api-rastro/rules?ref=refs%2Fheads%2Fmain
remote: 
remote: - Changes must be made through a pull request.
remote: 
remote: - 2 of 2 required status checks are expected.
remote: 
To https://github.com/laumarva99/api-rastro.git
 ! [remote rejected] main -> main (push declined due to repository rule violations)
error: failed to push some refs to 'https://github.com/laumarva99/api-rastro.git'



GitHub no deja subir cambios a main sin una pull request y pasar los checks





##Ejercicio 1

********api-rastro (feature/database-connection)
$ curl -i http://localhost:3000/api/health
HTTP/1.1 500 Internal Server Error
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 38
ETag: W/"26-TPHq3SznkB5cu6Yb1UG+2oZzErE"
Date: Mon, 09 Nov 2026 15:47:11 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Error interno del servidor"}


Cuando MongoDB está apagado, el servidor da un error 500 después de unos 5 segundos porque no puede conectarse a la base de datos (//5 de index.ts). El middleware de errores detecta el problema y muestra un mensaje de error sin mostrar información interna del servidor



##Ejercicio 2

Cuando recibimos un dato desde la URL, llega como texto. Pero MongoDB necesita que el precio sea un número (380) y no un texto ("380")
