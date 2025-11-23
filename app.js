/* ============================================
   CONFIG
============================================ */
const API = "https://script.google.com/macros/s/AKfycbwDU8A5i08hKEC9ktw2r1tAy5LHOidirQZAjWA_cvnr21DC2DZvQ-Fk6tJXPHc8oY5v/exec";


/* ============================================
   FUNZIONE TOAST (NOTIFICA)
============================================ */
function toast(msg){
    const t = document.getElementById("toast");
    t.innerText = msg;
    t.style.display = "block";
    setTimeout(() => t.style.display = "none", 2500);
}


/* ============================================
   CAMBIO PAGINA
============================================ */
function showPage(id){
    document.querySelectorAll(".page").forEach(p => p.classList.remove("visible"));
    document.getElementById(id).classList.add("visible");
}


/* ============================================
   LOGIN
============================================ */
async function login(){
    let nome = document.getElementById("loginNome").value.trim();
    let pin  = document.getElementById("loginPin").value.trim();

    if(!nome || !pin){
        errore("loginErrore", "Inserisci nome e PIN");
        return;
    }

    let res = await fetch(`${API}?action=checkPin&nome=${encodeURIComponent(nome)}&pin=${pin}`);
    let out = await res.json();

    if(out.status === "OK"){
        sessionStorage.setItem("autista", nome);
        document.getElementById("welcomeText").innerText = "Benvenuto, " + nome;
        showPage("page-home");
    } else {
        errore("loginErrore", "PIN errato");
    }
}

function errore(id, msg){
    let el = document.getElementById(id);
    el.innerText = msg;
    el.style.display = "block";
    setTimeout(() => el.style.display = "none", 2500);
}


/* ============================================
   LOGOUT
============================================ */
function logout(){
    sessionStorage.clear();
    showPage("page-login");
}


/* ============================================
   CAMBIO TIPO PRESENZA
============================================ */
function cambiaTipo(){
    const tipo = document.getElementById("tipoPresenza").value;
    const desc = document.getElementById("descrizionePresenza");
    const bloccoTurni = document.getElementById("bloccoTurni");

    // Nascondo turno di default
    bloccoTurni.style.display = "none";

    // Tipi con descrizione automatica
    const auto = {
        Riposo: "Riposo",
        Festivo: "Festivo",
        Infortunio: "Infortunio",
        Malattia: "Malattia",
        Assente: "Assente",
        Ferie: "Ferie",
        Permesso: "Permesso"
    };

    if(auto[tipo]){
        desc.value = auto[tipo];
        return;
    }

    if(tipo === "Turno"){
        desc.value = "";
        bloccoTurni.style.display = "block";
        caricaTurni();
        return;
    }

    // Noleggio / Nessuno
    desc.value = "";
}


/* ============================================
   CARICA ELENCO TURNI DAL BACKEND
============================================ */
async function caricaTurni(){
    let sel = document.getElementById("turnoElenco");
    sel.innerHTML = "";
    try{
        let res = await fetch(`${API}?action=getTurni`);
        let out = await res.json();
        if(out.status === "OK"){
            out.data.forEach(t => {
                let opt = document.createElement("option");
                opt.value = t;
                opt.innerText = t;
                sel.appendChild(opt);
            });
        }
    }catch(e){
        console.error(e);
    }
}


/* ============================================
   SALVATAGGIO PRESENZA
============================================ */
async function salvaPresenza(){
    const nome = sessionStorage.getItem("autista");
    if(!nome){
        toast("Sessione scaduta");
        showPage("page-login");
        return;
    }

    const dataP = document.getElementById("dataPresenza").value;
    const tipo  = document.getElementById("tipoPresenza").value;
    const desc  = document.getElementById("descrizionePresenza").value;
    const o1    = document.getElementById("oraInizio").value;
    const o2    = document.getElementById("oraFine").value;

    if(!dataP){
        toast("Seleziona una data");
        return;
    }

    const payload = {
        action: "addPresenza",
        nome: nome,
        data: dataP,
        tipo: tipo,
        desc: desc,
        o1: o1,
        o2: o2
    };

    let res = await fetch(API, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(payload)
    });

    toast("Presenza salvata");
}


/* ============================================
   CARICA STORICO
============================================ */
async function caricaStorico(){
    const nome = sessionStorage.getItem("autista");
    let box = document.getElementById("listaStorico");
    box.innerHTML = "";

    let res = await fetch(`${API}?action=getPresenzeAutista&nome=${encodeURIComponent(nome)}`);
    let out = await res.json();

    if(out.status !== "OK") return;

    out.data.forEach(p => {
        let div = document.createElement("div");
        div.className = "card-presenza";

        div.innerHTML = `
            <span><b>${p.data}</b></span>
            <span>${p.desc}</span>
            <span>${p.o1 || ""} → ${p.o2 || ""}</span>

            <button onclick="eliminaPresenza('${p.id}')"
                class="btn-primary" style="margin-top:10px;background:#d9534f;">
                Elimina
            </button>
        `;

        box.appendChild(div);
    });
}


/* ============================================
   ELIMINAZIONE PRESENZA
============================================ */
async function eliminaPresenza(id){
    if(!confirm("Eliminare questa presenza?")) return;

    let res = await fetch(`${API}?action=deletePresenza&id=${id}`);
    let out = await res.json();

    if(out.status === "OK"){
        toast("Eliminata");
        caricaStorico();
    }
}
