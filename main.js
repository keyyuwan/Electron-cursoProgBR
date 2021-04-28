const { app, BrowserWindow, ipcMain, Menu, globalShortcut } = require('electron')
const path = require('path')
const os = require('os')

// mudando o comportamento de acordo com o ambiente (produção/desenvolvimento)
const isDev = (process.env.NODE_ENV !== undefined && process.env.NODE_ENV === "development") 
? true 
: false

// verificando se é Mac pro app não sumir da barra de baixo quando fechado a janela
const isMac = (process.platform === "darwin") ? true : false

function createWindow() {
    const window = new BrowserWindow({
        width: 600,
        height: 600,
        backgroundColor: "eee",
        // não mostrar a janela enqt o conteúdo não estiver pronto
        show: false,
        icon: path.join(__dirname, "assets/icons/progbrIcon.svg"),
        // consigo usar métodos do node no front-end
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
    })

    window.loadFile('./src/index.html')

    if (isDev) {
        window.webContents.openDevTools()
    }

    // resolver o problema de demorar pra carregar o conteúdo
    // pq só mostra a janela quanto o conteúdo estiver pronto pra ser mostrado
    window.once('ready-to-show', () => {
        window.show()
        // mandando msg do back-end pro front-end
        setTimeout(() => {
            window.webContents.send("cpu_name", os.cpus()[0].model)
        }, 3000)

        const menuTemplate = [
            { role: 'appMenu' },
            { role: 'fileMenu' },
            // menu personalizado
            {
                label: "Window",
                submenu: [
                    {
                        label: "New Window",
                        click: () => {createWindow()}
                    },
                    { type: "separator" }, // linha de separação
                    {
                        label: "Close All Windows",
                        accelerator: "CmdOrCtrl+a",
                        click: () => { BrowserWindow.getAllWindows().forEach(window => { window.close() }) }
                    }
                ]
            }
        ]
        const menu = Menu.buildFromTemplate(menuTemplate)
        Menu.setApplicationMenu(menu)
    })
}

app.whenReady().then(() => {
    createWindow()

    globalShortcut.register("CmdOrCtrl+d", () => {
        console.log("Global shortcut executado")
        BrowserWindow.getAllWindows()[0].setAlwaysOnTop(true)
        BrowserWindow.getAllWindows()[0].setAlwaysOnTop(false)
    })
})

// executa logo antes e fechar
app.on("will-quit", () => {
    globalShortcut.unregisterAll()
})

// quando acontecer esse evento (janelas fechadas), execute o callback
app.on("window-all-closed", () => {
    console.log("Todas as janelas fechadas")

    if (!isMac) {
        app.quit()
    }
})

// evento (clicar no app)
app.on("activate", () => {
    // verificando se já tem alguma janela aberta
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})

// pegando a mensagem do front-end
ipcMain.on("open_new_window", () => {
    createWindow()
})