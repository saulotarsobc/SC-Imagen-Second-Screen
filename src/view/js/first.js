/* elemento html */
const add_img = document.getElementById('add_img'),
    midias_list = document.getElementById('midias_list'),
    drop = document.getElementById('drop')
/* elemento html */

/* drag and drop */
drop.addEventListener('dragover', (e) => {
    e.stopPropagation();
    e.preventDefault();
});
drop.addEventListener('drop', (e) => {
    e.stopPropagation();
    e.preventDefault();
    for (const { name, path: src } of e.dataTransfer.files) {
        // console.log(name, path);
        Imagens.create({ name, src })
            .then(() => {
                carregarImgsOnDb();
            })
            .catch((e) => {
                console.log("erro: ", e);
            });
    };
    carregarImgsOnDb();
});
/* drag and drop */

const { ipcRenderer } = require("electron");
const { Sequelize, DataTypes } = require("sequelize");
const remote = require("@electron/remote");

/* db */
const path = require("path");
const appPath = remote.app.getPath("userData");
const dbFile = path.join(appPath, "dbFile.sqlite");
const sequelize = new Sequelize({ dialect: "sqlite", storage: dbFile });
const Imagens = sequelize.define("imagens", { name: { type: DataTypes.STRING }, src: { type: DataTypes.STRING } });
/* db */

Imagens.sync({ alter: true });

add_img.addEventListener("click", async () => {
    ipcRenderer.send("addImage");
});

ipcRenderer.on("addImage", async (events, { name, src }) => {
    Imagens.create({ name, src })
        .then((data) => {
            // console.log(data);
            carregarImgsOnDb();
        })
        .catch((e) => {
            console.log("erro: ", e);
        });
});

const carregarImgsOnDb = () => {
    Imagens.findAll({ raw: true })
        .then(imgs => {
            midias_list.innerHTML = '';

            imgs.map(({ name, src, id }) => {
                midias_list.innerHTML += `<div class="item" data-src="${src}" data-id="${id}">
                    <p class="nome">${name}</p>
                    <div class="divisor"></div>
                <div class="wrap">
                    <div class="img">
                    <img src="${src}" alt="${name}">
                    </div>
                    <div class="controls">
                    <div class="play play_deletar" data-id="${id}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-cast" viewBox="0 0 16 16">
                            <path d="m7.646 9.354-3.792 3.792a.5.5 0 0 0 .353.854h7.586a.5.5 0 0 0 .354-.854L8.354 9.354a.5.5 0 0 0-.708 0z"/>
                            <path d="M11.414 11H14.5a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.5-.5h-13a.5.5 0 0 0-.5.5v7a.5.5 0 0 0 .5.5h3.086l-1 1H1.5A1.5 1.5 0 0 1 0 10.5v-7A1.5 1.5 0 0 1 1.5 2h13A1.5 1.5 0 0 1 16 3.5v7a1.5 1.5 0 0 1-1.5 1.5h-2.086l-1-1z"/>
                        </svg>
                    </div>
                    <div class="deletar play_deletar" data-id="${id}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-trash3" viewBox="0 0 16 16">
                            <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11Zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5h9.916Zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47ZM8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5Z"/>
                        </svg>
                    </div>
                    </div>
                </div>
              </div>
            </div>`;
            });

            document.querySelectorAll(".deletar")
                .forEach((deletar) => {
                    deletar.addEventListener("click", () => apagarImagem(deletar.dataset.id));
                });
            document.querySelectorAll(".play")
                .forEach((play) => {
                    play.addEventListener("click", () => showImg(play.dataset.id));
                });
        })
        .catch(e => {
            console.log('erro ao buscar imagens', e);
        });
};

const apagarImagem = (id) => {
    Imagens.destroy({ where: { id } })
        .then(res => {
            (res) ? console.log('sucesso') : console.log('ID não exite');
        })
        .catch(e => {
            console.log('falha ao tentar apagar imagem', e);
        });
    carregarImgsOnDb();
};

const showImg = (id) => {
    Imagens.findOne({ where: { id }, raw: true })
        .then(img => {
            ipcRenderer.send('showImg', img)
        })
        .catch(e => {
            console.log('erro ao buscar imagem', e)
        })
}

/* init */
carregarImgsOnDb();