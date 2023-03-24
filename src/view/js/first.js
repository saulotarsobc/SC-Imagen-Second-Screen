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
                <div class="img">
                  <p class="nome">${name}</p>
                  <hr style="margin-bottom: 3px; width: 100%;">
                  <img src="${src}" alt="${name}">
                </div>
                <div class="controls">
                  <div class="play" data-id="${id}">Exibir</div>
                  <div class="deletar" data-id="${id}">Apagar</div>
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