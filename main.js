"use strict";

const electron = require('electron');
const path = require('path');
const glob = require('glob');

const Menu = require('./main-process/menu');

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

var mainWindow = null;

function initialize(){
    var shouldQuit = makeSingleInstance();
    if(shouldQuit){
        return app.quit();
    }

    loadMainProcess();

    function createWindow() {
        var windowOptions = {
            width: 1080,
            minWidth: 680,
            height: 840
        };

        mainWindow = new BrowserWindow(windowOptions);
        mainWindow.loadURL(path.join('file://', __dirname, '/index.html'));

        mainWindow.on('close', function(){
            mainWindow = null;
        });

        makeMenu();
    }

    app.on('ready', function(){
        createWindow();
    });

    app.on('window-all-closed', function(){
        app.quit();
    });

    app.on('activate', function(){
        if(mainWindow === null){
            createWindow();
        }
    })
}

function makeSingleInstance(){
    return app.makeSingleInstance(function(){
        if(mainWindow){
            if(mainWindow.isMinimized()){
                mainWindow.restore();
            }
            mainWindow.focus();
        }
    })
}

function loadMainProcess(){
    var files = glob.sync(path.join(__dirname, 'main-process/**/*.js'));
    files.forEach(function(file){
        require(file);
    });
}


function makeMenu(){
    var menu = new Menu(electron);
    menu.createMenu();
}


switch (process.argv[1]){
    default:
        initialize();
}
