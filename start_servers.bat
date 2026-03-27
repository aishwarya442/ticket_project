@echo off
echo Starting Django Backend in a new window...
start cmd /k "python manage.py runserver 8000"

echo Starting React Frontend in a new window...
start cmd /k "cd frontend && npm start"

echo Generating your public internet link...
start cmd /k "timeout /t 7 && node share.js"

echo Everything is starting up automatically! You can safely close this main window.
exit
