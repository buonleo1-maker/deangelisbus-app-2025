/********************************************************************
 * DEANGELISBUS – APP.JS AVANZATO 2025
 * Compatibile con backend Apps Script + UI moderna
 ********************************************************************/

// ---------------------------------------------------------------
// CONFIGURAZIONE API
// ---------------------------------------------------------------
const API = "https://script.google.com/macros/s/AKfycby0lV_uamAdEeEaDcjR2-_0x0x0cItfhVi-GiW5wWpeSt2Hhxbi5M5PlhiM0xZ69uNU/exec";

// ---------------------------------------------------------------
// VARIABILI GLOBALI
// ---------------------------------------------------------------
let AUTISTA_LOGGATO = "";


// ---------------------------------------------------------------
// FUNZIONE TOAST (messaggi)
// ---------------------------------------------------------------
function toast(msg){
    const t = document.getElementById("toast");
    t.innerText = msg;
    t.classList.add("show");
    setTimeout(()=> t.classList.remove("show"), 3000);
}


// ---------------------------------------------------------------
// CAMBIA PAGINA
// ---------------------------------------------------------------
function showPage(id){
    document.querySelectorAll(".page").forEach(p => p.classList.remove("visible"));
    document.getElementById(id).classList.add("visible");
}


// ---------------------------------------------------------------
// LOGIN
// ---------------------------------------------------------------
async function login(){
    let nome = document.getElementById("loginNome").value.trim();
    let pin  = document.getElementById("loginPin").value.trim();

    if(nome === "" || pin === ""){
        document.getElementById("loginErrore").innerText = "Inserisci nome e PIN.";
        return;
    }

    try{
        let url = `${API}?action=checkPin&nome=${encodeURIComponent(nome)}&pin=${encodeURIComponent(pin)}`;
        let res = await fetch(url);
        let json = await res.json();

        if(json.status === "OK" && json.data === true){
            AUTISTA_LOGGATO = nome;
            document.getElementById("welcomeText").innerText = "Benvenuto " + nome;
            document.getElementById("loginErrore").innerText = "";
            showPage("page-home");
        }else{
            document.getElementById("loginErrore").innerText = "Credenziali errate.";
        }

    }catch(e){
        document.getElementById("loginErrore").innerText = "Errore di connessione.";
    }
}


// ---------------------------------------------------------------
// LOGOUT
// ---------------------------------------------------------------
function logout(){
    AUTISTA_LOGGATO = "";
    showPage("page-login");
    document.getElementById("loginNome").value = "";
    document.getElementById("loginPin").value = "";
}


// ---------------------------------------------------------------
// CAMBIO TIPO PRESENZA
// ---------------------------------------------------------------
async function cambiaTipo(){
    const tipo = document.getElementById("tipoPresenza").value;
    const bloccoTurni = document.getElementById("bloccoTurni");
    const desc = document.getElementById("descrizionePresenza");

    if(tipo === "Turno"){
        bloccoTurni.style.display = "block";
        desc.value = "";
        caricaTurni();
    } else {
        bloccoTurni.style.display = "none";
    }
}


// ---------------------------------------------------------------
// CARICA TURNI
// ---------------------------------------------------------------
async function caricaTurni(){

    try{
        let url = `${API}?action=getTurni`;
        let res = await fetch(url);
        let json = await res.json();

        const select = document.getElementById("turnoElenco");
        select.innerHTML = "";

        if(json.status === "OK"){
            json.data.forEach(t => {
                let opt = document.createElement("option");
                opt.value = t;
                opt.innerText = t;
                select.appendChild(opt);
            });
        }

    }catch(e){
        toast("Errore caricamento turni");
    }
}


// ---------------------------------------------------------------
// SALVA PRESENZA (POST)
// ---------------------------------------------------------------
async function salvaPresenza(){

    let data = document.getElementById("dataPresenza").value;
    let tipo = document.getElementById("tipoPresenza").value;
    let desc = document.getElementById("descrizionePresenza").value;
    let o1   = document.getElementById("oraInizio").value;
    let o2   = document.getElementById("oraFine").value;

    if(tipo === "Turno"){
        desc = document.getElementById("turnoElenco").value;
    }

    if(data === "" || tipo === ""){
        toast("Compila data e tipo");
        return;
    }

    const payload = {
        action: "addPresenza",
        nome: AUTISTA_LOGGATO,
        data: data,
        tipo: tipo,
        desc: desc,
        o1: o1,
        o2: o2
    };

    try {

        let res = await fetch(API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
            body: JSON.stringify(payload)
        });

        let text = await res.text();  
        console.log("RISPOSTA RAW:", text);

        let json = JSON.parse(text);

        if(json.status === "OK"){
            toast("Presenza salvata correttamente");
        } else {
            toast("Errore salvataggio: " + json.message);
        }

    }catch(e){
        console.log(e);
        toast("Errore di rete");
    }
}

// ---------------------------------------------------------------
// CARICA STORICO PRESENZE
// ---------------------------------------------------------------
async function caricaStorico(){

    let container = document.getElementById("listaStorico");
    container.innerHTML = "";

    try{
        let url = `${API}?action=getPresenzeAutista&nome=${encodeURIComponent(AUTISTA_LOGGATO)}`;
        let res = await fetch(url);
        let json = await res.json();

        if(json.status === "OK"){

            if(json.data.length === 0){
                container.innerHTML = "<p>Nessuna presenza registrata.</p>";
                return;
            }

            json.data.forEach(p => {

                let div = document.createElement("div");
                div.className = "storico-card";

                div.innerHTML = `
                    <div><b>Data:</b> ${p.data}</div>
                    <div><b>Tipo:</b> ${p.tipo}</div>
                    <div><b>Descrizione:</b> ${p.desc}</div>
                    <div><b>Inizio:</b> ${p.o1}</div>
                    <div><b>Fine:</b> ${p.o2}</div>
                `;

                container.appendChild(div);
            });

        }

    }catch(e){
        container.innerHTML = "<p>Errore caricamento storico.</p>";
    }
}

