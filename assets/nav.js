/**
 * Created by lujin on 2016/5/14.
 */

//const storage = require('electron-json-storage');

//storage.get()

const fs = require('fs');
const path = require('path');

const electron = require('electron');
const ipc = electron.ipcRenderer;


document.body.addEventListener('click', function(event){
    if(event.target.dataset.section){
        handleSectionTrigger(event);
    }
});

showMainContent();

function handleSectionTrigger(event){
    hideAllSectionAndDeselectButtons();

    event.target.classList.add('is-selected');
    //const sectionId = event.target.dataset.section + '-section';
    //console.log(sectionId);
    //document.getElementById(sectionId).classList.add('is-shown');

    //const buttonId = event.target.getAttribute('id');
    const content = document.querySelector('.content');

    //const links = document.querySelectorAll('link[rel="import"]');
    //let template = links[0].import.querySelector('.task-template');
    //let clone = document.importNode(template.content, true);
    var data = fs.readFileSync("F:/微云下载/arlon/sections/demo.html","utf-8");
    console.log(data);

    //fs.open('F:/微云下载/arlon/sections/demo.html', 'r', function(f){
    //    console.log(f);
    //});
    //var h1 = document.createElement('h1');
    //h1.innerText = "hello electron...";
    //var section = document.createElement('section');
    //section.innerText = data;
    var section = parseDom(data);
    content.replaceChild(section, document.querySelector('.section'));
}


function hideAllSectionAndDeselectButtons(){
    const sections = document.querySelectorAll('.js-section.is-shown');
    Array.prototype.forEach.call(sections, function(section){
        section.classList.remove('is-shown');
    });

    const buttons = document.querySelectorAll('.nav-button.is-selected');
    Array.prototype.forEach.call(buttons, function(button){
        button.classList.remove('is-selected');
    })
}

function showMainContent () {
    document.querySelector('.js-nav').classList.add('is-shown');
    document.querySelector('.js-content').classList.add('is-shown');
}


function parseDom(html){
    var section = document.createElement('section');
    section.classList.add('section');
    section.classList.add('js-section');
    section.classList.add('is-shown');
    section.innerHTML = html;
    return section;
}

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
    var navClass = document.querySelector('.nav').classList;
    if(inArray('hide-navigate-bar', navClass)){
        navClass.remove('hide-navigate-bar');
    }else{
        navClass.add('hide-navigate-bar');
    }
});

/**
 * 响应markdown预览菜单的点击事件
 */
ipc.on('toggle-markdown-prev', function(event){
    console.log('markdown preview...');
    var sourceClass = document.querySelector('.section-source').classList;
    var prevClass = document.querySelector('.section-html').classList;
    if(inArray('section-prev-change', sourceClass)){
        sourceClass.remove('section-prev-change');

        prevClass.remove('section-prev');
        prevClass.remove('is-shown');
    }else{
        sourceClass.add('section-prev-change');

        prevClass.add('section-prev');
        prevClass.add('is-shown');
    }
});


