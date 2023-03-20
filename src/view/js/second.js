/* html */
const second_img = document.getElementById('second_img');
/* html */
const { ipcRenderer } = require("electron");

ipcRenderer.on('showImg', (event, { name, src }) => {
    console.log(name, src);
    second_img.src = src;
    second_img.alt = name;
})