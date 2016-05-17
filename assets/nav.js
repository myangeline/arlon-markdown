/**
 * Created by lujin on 2016/5/14.
 */

//const storage = require('electron-json-storage');

//storage.get()

const fs = require('fs');
const path = require('path');

const electron = require('electron');
const ipc = electron.ipcRenderer;

const marked = require('marked');
const highlight = require('highlight.js');

marked.setOptions({
    highlight: function (code) {
        return highlight.highlightAuto(code).value;
    }
});


document.body.addEventListener('click', function(event){
    if(event.target.dataset.section){
        handleSectionTrigger(event);
    }
});

showMainContent();

function handleSectionTrigger(event){
    hideAllSectionAndDeselectButtons();

    event.target.classList.add('is-selected');

    var filePath = event.target.getAttribute('data-path');
    appendMarkdown(filePath);
    hideMarkdownPrev();
}


function hideAllSectionAndDeselectButtons(){
    // const sections = document.querySelectorAll('.js-section.is-shown');
    // Array.prototype.forEach.call(sections, function(section){
    //     section.classList.remove('is-shown');
    // });

    const buttons = document.querySelectorAll('.nav-button.is-selected');
    Array.prototype.forEach.call(buttons, function(button){
        button.classList.remove('is-selected');
    })
}

function showMainContent () {
    document.querySelector('.js-nav').classList.add('is-shown');
    document.querySelector('.js-content').classList.add('is-shown');
}


/*function parseDom(html){
    var section = document.createElement('section');
    var classList = section.classList;
    classList.add('section');
    classList.add('js-section');
    classList.add('section-source');
    classList.add('is-shown');
    section.innerHTML = html;
    return section;
}

function createPrevDom(node){
    var sectionPrev = node.cloneNode(true);
    var classList = sectionPrev.classList;
    classList.remove('section-source');
    classList.remove('is-shown');
    classList.add('section-html');
    return sectionPrev;
}*/

/**
 * 判断一个元素是被否在数组中
 * @param s
 * @param arrs
 * @returns {boolean}
 */
function inArray(s, arrs){
    for(var i=0; i<arrs.length; i++) {
        if(arrs[i] === s){
            return true;
        }
    }
    return false;
}

/**
 * 响应navigation菜单的点击事件
 */
ipc.on('toggle-nav-bar', function(event){
    toggleNavBar();
});

/**
 * 响应markdown预览菜单的点击事件
 */
ipc.on('toggle-markdown-prev', function(event){
    toggleMarkdownPrev();
});

ipc.on('open-folder', function(event, folderPath){
    var folderName = getPathKey(folderPath, 'name');
    var span = document.querySelector('.dir-root>span');
    span.innerHTML = folderName;

    walk(folderPath, 0, function(p, f){
       console.log(p, f);
        var div = document.createElement('div');
        div.setAttribute('data-section', 'windows');
        div.setAttribute('data-path', p);
        div.classList.add('nav-button');
        div.innerHTML = p;
        document.querySelector('.nav-sub-item').appendChild(div);
    });

    openNavBar();
});

ipc.on('open-file', function(event, filePath){
    /*var fileBase = getPathKey(filePath, 'base');
    var div = document.createElement('div');
    div.setAttribute('data-section', 'windows');
    div.setAttribute('data-path', filePath);
    div.classList.add('nav-button');
    div.innerHTML = fileBase;
    document.querySelector('.nav-sub-item').appendChild(div);*/
    appendNavItem(filePath);

    openNavBar();

    appendMarkdown(filePath);
});



function toggleNavBar(){
    var navClass = document.querySelector('.nav').classList;
    if(inArray('hide-navigate-bar', navClass)){
        navClass.remove('hide-navigate-bar');
    }else{
        navClass.add('hide-navigate-bar');
    }
}

function openNavBar(){
    var navClass = document.querySelector('.nav').classList;
    if(inArray('hide-navigate-bar', navClass)){
        navClass.remove('hide-navigate-bar');
    }
}

function toggleMarkdownPrev(){
    var sourceClass = document.querySelector('.section-source').classList;
    if(!inArray('is-shown', sourceClass)){
        hideMarkdownPrev();
    }else{
        showMarkdownPrev();
        appendMarkdownPrev();
    }
}


function hideMarkdownPrev(){
    var sourceClass = document.querySelector('.section-source').classList;
    var prevClass = document.querySelector('.section-html').classList;
    prevClass.remove('is-shown');
    sourceClass.add('is-shown');
}


function showMarkdownPrev(){
    var sourceClass = document.querySelector('.section-source').classList;
    var prevClass = document.querySelector('.section-html').classList;

    sourceClass.remove('is-shown');
    prevClass.add('is-shown');
}

function getPathKey(folderPath, key){
    var res = path.parse(folderPath);
    return res[key];
}


function walk(folderPath, floor, handleFile) {
    floor++;
    fs.readdir(folderPath, function(err, files) {
        if (err) {
            console.log('read dir error');
        } else {
            files.forEach(function(item) {
                var tmpPath = path.join(folderPath, item);
                fs.stat(tmpPath, function(err1, stats) {
                    if (err1) {
                        console.log('stat error');
                    } else {
                        if (stats.isDirectory()) {
                            console.log(tmpPath, ' is directory...');
                            walk(tmpPath, floor, handleFile);
                        } else {
                            handleFile(tmpPath, floor);
                        }
                    }
                })
            });

        }
    });
}

function appendMarkdown(filePath){
    var data = fs.readFileSync(filePath, "utf8");
    var textarea = document.createElement('textarea');
    textarea.setAttribute('name', 'markdown');
    textarea.classList.add('u-markdown');
    textarea.innerHTML = data;
    document.querySelector('.section-source').replaceChild(textarea, document.querySelector('.u-markdown'));
}

function appendMarkdownPrev(){
    var data = document.getElementsByClassName('u-markdown')[0].value;
    data = convertMarkdown(data);
    var div = document.createElement('div');
    div.classList.add('u-markdown-prev');
    div.classList.add('markdown');
    div.innerHTML = data;
    var sectionHtml = document.querySelector('.section-html');
    sectionHtml.replaceChild(div, document.querySelector('.u-markdown-prev'));
}


function appendNavItem(filePath){
    isPathExists(filePath);

    var fileBase = getPathKey(filePath, 'base');
    var div = document.createElement('div');
    div.setAttribute('data-section', 'windows');
    div.setAttribute('data-path', filePath);
    div.classList.add('nav-button');
    div.innerHTML = fileBase;
    document.querySelector('.nav-sub-item').appendChild(div);
}

/**
 * convert markdown to html
 * @param content
 * @returns {*}
 */
function convertMarkdown(content){
    return marked(content);
}


function isPathExists(path){
    var navButtons = document.querySelectorAll('.nav-sub-item>.nav-button');
    console.log(navButtons);
}