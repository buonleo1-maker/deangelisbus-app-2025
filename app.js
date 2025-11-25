/********************************************************************
 * DEANGELISBUS – APP.JS COMPLETO E FUNZIONANTE (2025)
 ********************************************************************/

// ======================
// CONFIGURAZIONE API
// ======================
const API = "https://script.google.com/macros/s/AKfycbzJoyuIP9k6Y8TDtMyrTUSZokfTqYvWLr2dccsIwmc0w_dbaNdBsDfVFseCN_ihSBw/exec";

// ======================
// VARIABILI GLOBALI
// ======================
let AUTISTA_LOGGATO = "";

// ======================
// TOAST
// ======================
function toast(msg){
    const t = document.getElementById("toast");
    t.innerText = msg;
    t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), 3000);
}

// ======================
// NAVIGAZIONE
// ======================
function showPage(id){
    document.querySelectorAll(".page").forEach(p => p.classList.remove("visible"));
    document.getElementById(id).classList.add("visible");
}

// ======================
// LOGIN
// ======================
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
            showPage("page-home");
        } else {
            document.getElementById("loginErrore").innerText = "Credenziali errate.";
        }

    }catch(e){
        document.getElementById("loginErrore").innerText = "Errore di connessione.";
    }
}

// ======================
// LOGOUT
// ======================
function logout(){
    AUTISTA_LOGGATO = "";
    showPage("page-login");
}

// ======================
// CAMBIA TIPO
// ======================
async function cambiaTipo(){
    const tipo = document.getElementById("tipoPresenza").value;
    const bloccoTurni = document.getElementById("bloccoTurni");

    if(tipo === "Turno"){
        bloccoTurni.style.display = "block";
        await caricaTurni();
    } else {
        bloccoTurni.style.display = "none";
    }
}

// ======================
// CARICA TURNI
// ======================
async function caricaTurni(){
    try{
        let url = `${API}?action=getTurni`;
        let res = await fetch(url);
        let json = await res.json();

        const sel = document.getElementById("turnoElenco");
        sel.innerHTML = "";

        if(json.status === "OK"){
            json.data.forEach(t => {
                let opt = document.createElement("option");
                opt.value = t;
                opt.innerText = t;
                sel.appendChild(opt);
            });
        }

    }catch(e){
        toast("Errore caricamento turni");
    }
}

// ======================
// SALVA PRESENZA (POST)
// ======================
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

    // === COSTRUIAMO LA QUERY STRING ===
    let url = `${API}?action=addPresenza`
            + `&nome=${encodeURIComponent(AUTISTA_LOGGATO)}`
            + `&data=${encodeURIComponent(data)}`
            + `&tipo=${encodeURIComponent(tipo)}`
            + `&desc=${encodeURIComponent(desc)}`
            + `&o1=${encodeURIComponent(o1)}`
            + `&o2=${encodeURIComponent(o2)}`;

    try{
        let res = await fetch(url);
        let json = await res.json();

        if(json.status === "OK"){
            toast("Presenza salvata!");
        } else {
            toast("Errore salvatag

// ======================
// CARICA STORICO
// ======================
async function caricaStorico(){

    let container = document.getElementById("listaStorico");
    container.innerHTML = "<p>Caricamento...</p>";

    try{
        let url = `${API}?action=getPresenzeAutista&nome=${encodeURIComponent(AUTISTA_LOGGATO)}`;
        let res = await fetch(url);
        let json = await res.json();

        container.innerHTML = "";

        if(json.status === "OK" && json.data.length > 0){

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

        } else {
            container.innerHTML = "<p>Nessuna presenza registrata.</p>";
        }

    }catch(e){
        container.innerHTML = "<p>Errore caricamento storico.</p>";
    }
}
