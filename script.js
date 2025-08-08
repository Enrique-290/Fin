
// ====== DATA SEED ======
const seedServicios = [
  {servicio:"Mensualidad normal", tipo:"Mensualidad", segmento:"Normal", precio:350},
  {servicio:"Mensualidad socios", tipo:"Mensualidad", segmento:"Socios", precio:300},
  {servicio:"Mensualidad VIP", tipo:"Mensualidad", segmento:"VIP", precio:250},
  {servicio:"Semana normal", tipo:"Semana", segmento:"Normal", precio:150},
  {servicio:"Semana socios", tipo:"Semana", segmento:"Socios", precio:130},
  {servicio:"Semana VIP", tipo:"Semana", segmento:"VIP", precio:100},
  {servicio:"Visita normal", tipo:"Visita", segmento:"Normal", precio:50},
  {servicio:"Visita socio", tipo:"Visita", segmento:"Socios", precio:30},
  {servicio:"Visita VIP", tipo:"Visita", segmento:"VIP", precio:25},
];
const seedProductos = [
  {sku:"", nombre:"Agua Bonafont 1L", categoria:"Agua", precioVenta:14, precioCompra:"", stock:20, imagen:""},
  {sku:"", nombre:"Agua Bonafont 2L", categoria:"Agua", precioVenta:20, precioCompra:"", stock:20, imagen:""},
  {sku:"", nombre:"Agua Bonafont 1.5L", categoria:"Agua", precioVenta:16, precioCompra:"", stock:20, imagen:""},
  {sku:"", nombre:"Gatorade 1L", categoria:"Hidratante", precioVenta:26, precioCompra:"", stock:20, imagen:""},
  {sku:"", nombre:"Gatorade 600ml", categoria:"Hidratante", precioVenta:20, precioCompra:"", stock:20, imagen:""},
  {sku:"", nombre:"Volt Blue", categoria:"Energética", precioVenta:22, precioCompra:"", stock:20, imagen:""},
  {sku:"", nombre:"Volt Yellow", categoria:"Energética", precioVenta:22, precioCompra:"", stock:20, imagen:""},
  {sku:"", nombre:"Volt Pink", categoria:"Energética", precioVenta:22, precioCompra:"", stock:20, imagen:""},
  {sku:"", nombre:"Electrolit", categoria:"Hidratante", precioVenta:25, precioCompra:"", stock:20, imagen:""},
  {sku:"", nombre:"T Proteína Whey", categoria:"Suplemento", precioVenta:25, precioCompra:"", stock:20, imagen:""},
  {sku:"", nombre:"T Proteína Mass", categoria:"Suplemento", precioVenta:35, precioCompra:"", stock:20, imagen:""},
  {sku:"", nombre:"Óxido", categoria:"Suplemento", precioVenta:25, precioCompra:"", stock:20, imagen:""},
];
const LS = {
  get(k, def){ try{ return JSON.parse(localStorage.getItem(k)) ?? def }catch(e){ return def } },
  set(k, v){ localStorage.setItem(k, JSON.stringify(v)) }
};
if(!LS.get("servicios")) LS.set("servicios", seedServicios);
if(!LS.get("productos")) LS.set("productos", seedProductos);
if(!LS.get("ventas")) LS.set("ventas", []);
if(!LS.get("clientes")) LS.set("clientes", []);

// ====== LOGIN (mantén tus correos) ======
const allowed = ["enri290@gmail.com","dinamitagym00@gmail.com"];
let currentUser = null;
document.getElementById("btnLogin").onclick = () => {
  const mail = document.getElementById("email").value.trim().toLowerCase();
  if(allowed.includes(mail)){
    currentUser = mail;
    document.getElementById("userBox").innerHTML = `Bienvenido, ${mail}`;
    document.getElementById("nav").classList.remove("hidden");
    showView("ventas");
    render();
  } else alert("Correo no autorizado");
};

// ====== NAV ======
document.querySelectorAll("nav button").forEach(b=> b.onclick = ()=> showView(b.dataset.view));
function showView(id){
  document.querySelectorAll(".view").forEach(v=>v.classList.add("hidden"));
  document.getElementById("view-"+id).classList.remove("hidden");
  if(id==="historial") drawHistorial();
  if(id==="clientes") drawClientes();
  if(id==="catalogo") renderCatalogo();
}

// ====== RENDER SELECTS Y PREVIEW ======
function render(){
  const prods = LS.get("productos",[]);
  const selP = document.getElementById("selProducto");
  selP.innerHTML = prods.map((p,i)=>`<option value="${i}">${p.nombre} - $${p.precioVenta}</option>`).join("");
  selP.onchange = ()=> showPreview();
  showPreview();

  const selS = document.getElementById("mTipo");
  selS.innerHTML = LS.get("servicios",[]).map((s,i)=>`<option value="${i}">${s.servicio} - $${s.precio}</option>`).join("");
}
function showPreview(){
  const prods = LS.get("productos",[]);
  const i = parseInt(document.getElementById("selProducto").value || 0);
  const p = prods[i];
  const prev = document.getElementById("previewProducto");
  prev.innerHTML = p?.imagen ? `<img src="${p.imagen}" alt="${p.nombre}"/>` : "<small class='muted'>Sin imagen</small>";
}

// ====== CLIENTES ======
function drawClientes(){
  const tb = document.querySelector("#tblClientes tbody");
  const arr = LS.get("clientes",[]);
  tb.innerHTML = "";
  arr.forEach(c=> tb.innerHTML += `<tr><td>${c.nombre}</td><td>${c.tel||""}</td></tr>`);
}
document.getElementById("cAgregar").onclick = ()=>{
  const n = document.getElementById("cNombre").value.trim();
  if(!n) return alert("Nombre requerido");
  const t = document.getElementById("cTel").value.trim();
  const arr = LS.get("clientes",[]);
  arr.unshift({nombre:n, tel:t});
  LS.set("clientes", arr);
  drawClientes();
};

// ====== BUSCADOR CLIENTE EN MEMBRESÍAS ======
const mBuscar = document.getElementById("mBuscar");
const mResultados = document.getElementById("mResultados");
let mClienteSel = null;
mBuscar.oninput = ()=>{
  const q = mBuscar.value.toLowerCase().trim();
  const arr = LS.get("clientes",[]);
  const res = arr.filter(c=> c.nombre.toLowerCase().includes(q));
  mResultados.innerHTML = res.map((c,i)=>`<div data-i="${i}">${c.nombre} ${c.tel?(" - "+c.tel):""}</div>`).join("");
  mResultados.querySelectorAll("div").forEach(d=> d.onclick = ()=>{
    const i = parseInt(d.dataset.i);
    mClienteSel = res[i];
    mBuscar.value = mClienteSel.nombre;
    mResultados.innerHTML = "";
  });
};

// ====== VENTAS ======
let carrito = [];
const carritoBody = document.querySelector("#tblCarrito tbody");
function drawCarrito(){
  carritoBody.innerHTML = "";
  let total = 0;
  carrito.forEach((it,idx)=>{
    const sub = it.precio * it.cant; total += sub;
    const img = it.imagen ? `<img src="${it.imagen}" style="width:40px;height:40px;object-fit:cover;border-radius:4px;border:1px solid #eee"/>` : "-";
    carritoBody.innerHTML += `<tr><td>${it.nombre}</td><td>${img}</td><td>${it.cant}</td><td>$${it.precio}</td><td>$${sub}</td><td><button data-i="${idx}" class="del">X</button></td></tr>`;
  });
  document.getElementById("totalVenta").textContent = total;
  document.querySelectorAll(".del").forEach(b=> b.onclick = ()=>{ carrito.splice(parseInt(b.dataset.i),1); drawCarrito(); });
}
document.getElementById("addProducto").onclick = () => {
  const i = parseInt(document.getElementById("selProducto").value || 0);
  const c = parseInt(document.getElementById("cantProducto").value||1);
  const p = LS.get("productos",[])[i];
  carrito.push({tipo:"producto", nombre:p.nombre, precio:p.precioVenta, cant:c, imagen:p.imagen||""});
  drawCarrito();
};
document.getElementById("confirmarVenta").onclick = async () => {
  if(!currentUser) return alert("Inicia sesión");
  if(carrito.length===0) return alert("Agrega items");
  const total = carrito.reduce((a,b)=> a + b.precio*b.cant, 0);
  const venta = {fecha:new Date().toISOString(), tipo:"Producto", cliente:"-", metodo: document.getElementById("metodoPago").value, total, items:carrito};
  const ventas = LS.get("ventas",[]); ventas.unshift(venta); LS.set("ventas", ventas);
  showTicket(venta);
  carrito = []; drawCarrito();
};

// ====== SERVICIOS / MEMBRESÍAS ======
document.getElementById("mVender").onclick = ()=>{
  const i = parseInt(document.getElementById("mTipo").value || 0);
  const s = LS.get("servicios",[])[i];
  const cli = mClienteSel ? mClienteSel.nombre : mBuscar.value.trim() || "Sin nombre";
  const inicio = document.getElementById("mInicio").value;
  const fin = document.getElementById("mFin").value;
  const acceso = document.getElementById("mAcceso").checked;
  const venta = {
    fecha:new Date().toISOString(),
    tipo:"Servicio",
    cliente: cli,
    metodo: "servicio",
    total: s.precio,
    items:[{nombre:s.servicio, cant:1, precio:s.precio}],
    detalle:{inicio, fin, acceso}
  };
  const ventas = LS.get("ventas",[]); ventas.unshift(venta); LS.set("ventas", ventas);
  document.getElementById("mMsg").textContent = "✅ Servicio vendido";
  setTimeout(()=> document.getElementById("mMsg").textContent="", 1500);
  showTicket(venta);
};

// ====== TICKET (modal + export mejorado) ======
const ticketModal = document.getElementById("ticketModal");
function openModal(){ ticketModal.classList.remove("hidden"); document.body.classList.add("modal-open"); }
function closeModal(){ ticketModal.classList.add("hidden"); document.body.classList.remove("modal-open"); }
document.getElementById("tkClose").onclick = closeModal;
ticketModal.addEventListener("click", (e)=>{ const area = document.getElementById("ticketArea"); if(!area.contains(e.target)) closeModal(); });
window.addEventListener("keydown", (e)=>{ if(e.key==="Escape" && !ticketModal.classList.contains("hidden")) closeModal(); });

function showTicket(venta){
  document.getElementById("tkFecha").textContent = new Date(venta.fecha).toLocaleString();
  document.getElementById("tkCliente").textContent = venta.cliente ? ("Cliente: " + venta.cliente) : "";
  const tb = document.getElementById("tkItems");
  tb.innerHTML = venta.items.map(it=>`<tr><td>${it.nombre}</td><td>${it.cant}</td><td>$${it.precio}</td><td>$${it.precio*it.cant}</td></tr>`).join("");
  document.getElementById("tkTotal").textContent = "$" + venta.total;
  openModal();
}

document.getElementById("tkPrint").onclick = ()=>{ window.print(); setTimeout(closeModal,500); };
document.getElementById("tkIMG").onclick = async ()=>{
  const area = document.getElementById("ticketArea");
  const canvas = await html2canvas(area, {backgroundColor:"#fff", scale:2});
  const link = document.createElement("a");
  link.download = "ticket_dinamita.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
  setTimeout(closeModal, 300);
};
document.getElementById("tkPDF").onclick = async ()=>{
  const area = document.getElementById("ticketArea");
  const canvas = await html2canvas(area, {backgroundColor:"#fff", scale:2});
  const imgData = canvas.toDataURL("image/png");
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({unit:"pt", format:"a4"});
  const pageWidth = pdf.internal.pageSize.getWidth();
  const ratio = canvas.height / canvas.width;
  const imgWidth = Math.min(pageWidth - 40, pageWidth);
  const imgHeight = imgWidth * ratio;
  pdf.addImage(imgData, "PNG", 20, 20, imgWidth, imgHeight);
  pdf.save("ticket_dinamita.pdf");
  setTimeout(closeModal, 300);
};

// ====== CATALOGO (CRUD + EDITOR CON IMAGEN) ======
function buildCrud(tableEl, data, cols, onEdit){
  const head = "<thead><tr>" + cols.map(c=>`<th>${c.label}</th>`).join("") + "<th></th></tr></thead>";
  let body = "<tbody>";
  data.forEach((row,i)=>{
    body += "<tr>";
    cols.forEach(c=>{
      const val = row[c.key] ?? "";
      if(c.key === "imagen"){
        body += `<td>${val ? "<img src='"+val+"' style='width:40px;height:40px;object-fit:cover;border-radius:4px;border:1px solid #eee'/>" : "-"}</td>`;
      } else {
        body += `<td>${val}</td>`;
      }
    });
    body += `<td>
      <button class="btn-outline" data-edit="${i}">Editar</button>
      <button class="btn-outline" data-del="${i}">Borrar</button>
    </td>`;
    body += "</tr>";
  });
  body += "</tbody>";
  tableEl.innerHTML = head + body;

  tableEl.querySelectorAll("[data-del]").forEach(btn=>{
    btn.onclick = ()=>{ const i = parseInt(btn.dataset.del); data.splice(i,1); renderCatalogo(); };
  });
  tableEl.querySelectorAll("[data-edit]").forEach(btn=>{
    btn.onclick = ()=>{ const i = parseInt(btn.dataset.edit); onEdit(i) };
  });
}

let editIdx = -1;
function renderCatalogo(){
  const serv = LS.get("servicios",[]);
  const prods = LS.get("productos",[]);
  // Servicios
  buildCrud(document.getElementById("tblServicios"), serv, [
    {key:"servicio", label:"Servicio"},
    {key:"tipo", label:"Tipo"},
    {key:"segmento", label:"Segmento"},
    {key:"precio", label:"Precio"}
  ], ()=>{});
  // Productos con editor
  buildCrud(document.getElementById("tblProductos"), prods, [
    {key:"sku", label:"SKU"},
    {key:"nombre", label:"Nombre"},
    {key:"categoria", label:"Categoría"},
    {key:"precioVenta", label:"Precio Venta"},
    {key:"stock", label:"Stock"},
    {key:"imagen", label:"Imagen"}
  ], (i)=> openEditorProducto(i));

  document.getElementById("addRowServicio").onclick = ()=>{ serv.push({servicio:"Nuevo", tipo:"", segmento:"", precio:0}); LS.set("servicios",serv); renderCatalogo(); };
  document.getElementById("addRowProducto").onclick = ()=>{ prods.push({sku:"", nombre:"Nuevo", categoria:"", precioVenta:0, precioCompra:"", stock:0, imagen:""}); LS.set("productos",prods); renderCatalogo(); };

  document.getElementById("guardarCatalogo").onclick = ()=>{
    LS.set("servicios",serv); LS.set("productos",prods);
    document.getElementById("saveMsg").textContent="Guardado";
    setTimeout(()=>document.getElementById("saveMsg").textContent="",1500);
    render(); // refrescar selects y preview
  };
}

function openEditorProducto(i){
  const prods = LS.get("productos",[]);
  editIdx = i;
  const p = prods[i];
  const editor = document.getElementById("editorProducto");
  editor.hidden = false;
  document.getElementById("eNombre").value = p.nombre||"";
  document.getElementById("eSKU").value = p.sku||"";
  document.getElementById("eCategoria").value = p.categoria||"";
  document.getElementById("ePrecioVenta").value = p.precioVenta||0;
  document.getElementById("ePrecioCompra").value = p.precioCompra||"";
  document.getElementById("eStock").value = p.stock||0;
  document.getElementById("ePreview").innerHTML = p.imagen ? `<img src="${p.imagen}" style="max-width:140px;border:1px solid #eee;border-radius:8px"/>` : "<small class='muted'>Sin imagen</small>";
}

document.getElementById("eImagenFile").addEventListener("change", (e)=>{
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = (ev)=>{
    const dataUrl = ev.target.result;
    document.getElementById("ePreview").innerHTML = `<img src="${dataUrl}" style="max-width:140px;border:1px solid #eee;border-radius:8px"/>`;
    const prods = LS.get("productos",[]);
    if(editIdx>-1) prods[editIdx].imagen = dataUrl;
    LS.set("productos", prods);
  };
  reader.readAsDataURL(file);
});

document.getElementById("eGuardar").onclick = ()=>{
  const prods = LS.get("productos",[]);
  if(editIdx<0) return;
  const p = prods[editIdx];
  p.nombre = document.getElementById("eNombre").value.trim();
  p.sku = document.getElementById("eSKU").value.trim();
  p.categoria = document.getElementById("eCategoria").value.trim();
  p.precioVenta = parseFloat(document.getElementById("ePrecioVenta").value||0);
  p.precioCompra = document.getElementById("ePrecioCompra").value;
  p.stock = parseInt(document.getElementById("eStock").value||0);
  LS.set("productos", prods);
  document.getElementById("editorProducto").hidden = true;
  renderCatalogo();
  render();
};

document.getElementById("eCancelar").onclick = ()=>{
  document.getElementById("editorProducto").hidden = true;
  editIdx = -1;
};

// ====== HISTORIAL ======
function drawHistorial(){
  const tb = document.querySelector("#tblHistorial tbody");
  const arr = LS.get("ventas",[]);
  tb.innerHTML = "";
  arr.forEach(v=> tb.innerHTML += `<tr><td>${new Date(v.fecha).toLocaleString()}</td><td>${v.tipo}</td><td>${v.cliente||"-"}</td><td>${v.metodo}</td><td>$${v.total}</td></tr>`);
}

// ====== INIT ======
function init(){
  render();
  renderCatalogo();
  drawClientes();
}
init();
