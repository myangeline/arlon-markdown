/**
 * Created by lujin on 2016/5/12.
 */
"use strict";
const fs = require('fs');
const childProcess =  require('child_process');

module.exports = function (electron) {

    this.remote = electron.remote;
    const dialog = electron.dialog;

    this.template = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'New File',
                    accelerator: 'CmdOrCtrl+N',
                },
                {
                    label: 'New Window',
                    accelerator: 'Shift+CmdOrCtrl+N',
                    click: function () {
                        const BrowserWindow = electron.BrowserWindow;
                        new BrowserWindow({
                            width: 800,
                            height: 600
                        });

                        // and load the index.html of the app.
                        // mainWindow.loadURL('file://' + __dirname + '/index.html');
                    }
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Open File',
                    accelerator: 'CmdOrCtrl+O',
                    click: function (item, focusedWindow) {
                        onOpenFileClick(focusedWindow);
                    }
                },
                {
                    label: 'Open Folder',
                    click: function(item, focusedWindow){
                        onOpenFolderClick(focusedWindow);
                    }
                },
                {
                    label: 'Open Recent',
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Save',
                    accelerator: 'CmdOrCtrl+S',
                },
                {
                    label: 'Save As',
                    accelerator: 'Shift+CmdOrCtrl+S',
                },
                {
                    label: 'Save All',
                },
                {
                    type: "separator"
                },
                {
                    label: 'Exit',
                }
            ]
        },
        {
            label: 'Edit',
            submenu: [
                {
                    label: 'Undo',
                    accelerator: 'CmdOrCtrl+Z',
                    role: 'undo'
                },
                {
                    label: 'Redo',
                    accelerator: 'Shift+CmdOrCtrl+Z',
                    role: 'redo'
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Cut',
                    accelerator: 'CmdOrCtrl+X',
                    role: 'cut'
                },
                {
                    label: 'Copy',
                    accelerator: 'CmdOrCtrl+C',
                    role: 'copy'
                },
                {
                    label: 'Paste',
                    accelerator: 'CmdOrCtrl+V',
                    role: 'paste'
                },
                {
                    label: 'Select All',
                    accelerator: 'CmdOrCtrl+A',
                    role: 'selectall'
                },
            ]
        },
        {
            label: 'View',
            submenu: [
                {
                    label: 'Reload',
                    accelerator: 'CmdOrCtrl+R',
                    click: function (item, focusedWindow) {
                        if (focusedWindow)
                            focusedWindow.reload();
                    }
                },
                {
                    label: 'Toggle Nav Bar',
                    accelerator: 'Shift+CmdOrCtrl+B',
                    click: function (item, focusedWindow) {
                        toggleNavBar(focusedWindow);
                    }
                },
                {
                    label: 'Toggle Markdown Preview',
                    accelerator: 'CmdOrCtrl+P',
                    click: function (item, focusedWindow) {
                        togglePreview(focusedWindow);
                    }
                },
                {
                    label: 'Toggle Full Screen',
                    accelerator: (function () {
                        if (process.platform == 'darwin')
                            return 'Ctrl+Command+F';
                        else
                            return 'F11';
                    })(),
                    click: function (item, focusedWindow) {
                        if (focusedWindow)
                            focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
                    }
                },
                {
                    label: 'Toggle Developer Tools',
                    accelerator: (function () {
                        if (process.platform == 'darwin')
                            return 'Alt+Command+I';
                        else
                            return 'Ctrl+Shift+I';
                    })(),
                    click: function (item, focusedWindow) {
                        if (focusedWindow)
                            focusedWindow.webContents.toggleDevTools();
                    }
                },
            ]
        },
        {
            label: 'Tools',
            submenu: [
                {
                    label: 'Git Add',
                    click: function (item, focusedWindow) {
                        onGitAddClick(focusedWindow);
                    }
                },
                {
                    label: 'Git Commit',
                    click: function (item, focusedWindow) {

                    }
                },
                {
                    label: 'Git Pull',
                    click: function (item, focusedWindow) {

                    }
                },
                {
                    label: 'Git Push',
                    click: function (item, focusedWindow) {

                    }
                }
            ]
        },
        {
            label: 'Help',
            role: 'help',
            submenu: [
                {
                    label: 'Learn More',
                    click: function () {
                        electron.shell.openExternal('http://electron.atom.io')
                    }
                },
                {
                    label: 'About',
                    click: function () {
                        console.log('about me...');
                        electron.shell.openExternal('https://bing.com');
                    }
                }
            ]
        },

    ];

    this.createMenu = function () {
        const Menu = electron.Menu;
        var menu = Menu.buildFromTemplate(this.template);
        Menu.setApplicationMenu(menu);
    };

    function toggleNavBar(focusedWindow){
        focusedWindow.webContents.send('toggle-nav-bar');
    }

    function togglePreview(focusedWindow){
        focusedWindow.webContents.send('toggle-markdown-prev');
    }

    function onOpenFolderClick(focusedWindow){
        dialog.showOpenDialog({
            properties: ['openDirectory'],
            filters: [
                { name: 'Markdown', extensions: ['md', 'markdown'] }
            ]
        }, function(files){
            if (files && files.length > 0){
                focusedWindow.webContents.send('open-folder', files[0]);
            }
        });

    }

    function onOpenFileClick(focusedWindow){
        dialog.showOpenDialog({
            properties: ['openFile'],
            filters: [
                { name: 'Markdown', extensions: ['md', 'markdown'] }
            ]
        }, function(files){
            if (files && files.length > 0){
                focusedWindow.webContents.send('open-file', files[0]);
            }
        });
    }

    function onGitAddClick(focusedWindow){
        run_cmd( "G:\\Program Files\\Git\\bin\\git.exe", ["show"], function(text) { console.log (text) });
        focusedWindow.webContents.send('git-add');
    }

    function run_cmd(cmd, args, callback ) {
        var spawn = childProcess.spawn;
        var child = spawn(cmd, args);
        var resp = "";

        child.stdout.on('data', function (buffer) { resp += buffer.toString() });
        child.stdout.on('end', function() { callback (resp) });
    }

};