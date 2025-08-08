
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
  {sku:"", nombre:"Agua Bonafont 1L", categoria:"Agua", precioVenta:14, precioCompra:"", stock:20},
  {sku:"", nombre:"Agua Bonafont 2L", categoria:"Agua", precioVenta:20, precioCompra:"", stock:20},
  {sku:"", nombre:"Agua Bonafont 1.5L", categoria:"Agua", precioVenta:16, precioCompra:"", stock:20},
  {sku:"", nombre:"Gatorade 1L", categoria:"Hidratante", precioVenta:26, precioCompra:"", stock:20},
  {sku:"", nombre:"Gatorade 600ml", categoria:"Hidratante", precioVenta:20, precioCompra:"", stock:20},
  {sku:"", nombre:"Volt Blue", categoria:"Energética", precioVenta:22, precioCompra:"", stock:20},
  {sku:"", nombre:"Volt Yellow", categoria:"Energética", precioVenta:22, precioCompra:"", stock:20},
  {sku:"", nombre:"Volt Pink", categoria:"Energética", precioVenta:22, precioCompra:"", stock:20},
  {sku:"", nombre:"Electrolit", categoria:"Hidratante", precioVenta:25, precioCompra:"", stock:20},
  {sku:"", nombre:"T Proteína Whey", categoria:"Suplemento", precioVenta:25, precioCompra:"", stock:20},
  {sku:"", nombre:"T Proteína Mass", categoria:"Suplemento", precioVenta:35, precioCompra:"", stock:20},
  {sku:"", nombre:"Óxido", categoria:"Suplemento", precioVenta:25, precioCompra:"", stock:20},
];
const LS = {
  get(k, def){ try{ return JSON.parse(localStorage.getItem(k)) ?? def }catch(e){ return def } },
  set(k, v){ localStorage.setItem(k, JSON.stringify(v)) }
};
if(!LS.get("servicios")) LS.set("servicios", seedServicios);
if(!LS.get("productos")) LS.set("productos", seedProductos);
if(!LS.get("ventas")) LS.set("ventas", []);
if(!LS.get("clientes")) LS.set("clientes", []);
if(!LS.get("membresias")) LS.set("membresias", []);

const allowed = ["enri290@gmail.com","dinamitagym00@gmail.com"];
let currentUser = null;
document.getElementById("btnLogin").onclick = () => {
  const mail = document.getElementById("email").value.trim().toLowerCase();
  if(allowed.includes(mail)){
    currentUser = mail;
    document.getElementById("userBox").innerHTML = `Bienvenido, ${mail}`;
    document.getElementById("nav").classList.remove("hidden");
    showView("ventas");
  } else alert("Correo no autorizado");
};

document.querySelectorAll("nav button").forEach(b=>{
  b.onclick = ()=> showView(b.dataset.view);
});
function showView(id){
  document.querySelectorAll(".view").forEach(v=>v.classList.add("hidden"));
  document.getElementById("view-"+id).classList.remove("hidden");
}

// Ventas
const selServicio = document.getElementById("selServicio");
const selProducto = document.getElementById("selProducto");
const carritoBody = document.querySelector("#tblCarrito tbody");
const totalVentaEl = document.getElementById("totalVenta");
const ticketMsg = document.getElementById("ticketMsg");
let carrito = [];

function renderSelects(){
  selServicio.innerHTML = LS.get("servicios",[]).map((s,i)=>`<option value="${i}">${s.servicio} - $${s.precio}</option>`).join("");
  selProducto.innerHTML = LS.get("productos",[]).map((p,i)=>`<option value="${i}">${p.nombre} - $${p.precioVenta}</option>`).join("");
}
renderSelects();

document.getElementById("addServicio").onclick = () => {
  const i = parseInt(selServicio.value); const c = parseInt(document.getElementById("cantServicio").value||1);
  const s = LS.get("servicios",[])[i];
  carrito.push({tipo:"servicio", nombre:s.servicio, precio:s.precio, cant:c});
  drawCarrito();
};
document.getElementById("addProducto").onclick = () => {
  const i = parseInt(selProducto.value); const c = parseInt(document.getElementById("cantProducto").value||1);
  const p = LS.get("productos",[])[i];
  carrito.push({tipo:"producto", idx:i, nombre:p.nombre, precio:p.precioVenta, cant:c});
  drawCarrito();
};
function drawCarrito(){
  carritoBody.innerHTML = "";
  let total = 0;
  carrito.forEach((it,idx)=>{
    const sub = it.precio * it.cant; total += sub;
    carritoBody.innerHTML += `<tr><td>${it.nombre}</td><td>${it.cant}</td><td>$${it.precio}</td><td>$${sub}</td><td><button data-i="${idx}" class="del">X</button></td></tr>`;
  });
  totalVentaEl.textContent = total;
  document.querySelectorAll(".del").forEach(b=> b.onclick = ()=>{ carrito.splice(parseInt(b.dataset.i),1); drawCarrito(); });
}

document.getElementById("confirmarVenta").onclick = () => {
  if(!currentUser) return alert("Inicia sesión");
  if(carrito.length===0) return alert("Agrega items");
  const productos = LS.get("productos",[]);
  carrito.forEach(it=>{
    if(it.tipo==="producto" && productos[it.idx]){
      productos[it.idx].stock = (parseInt(productos[it.idx].stock||0) - it.cant);
      if(productos[it.idx].stock < 0) productos[it.idx].stock = 0;
    }
  });
  LS.set("productos", productos);
  drawInventario();
  const total = carrito.reduce((a,b)=> a + b.precio*b.cant, 0);
  const venta = {fecha:new Date().toISOString(), usuario: currentUser, metodo: document.getElementById("metodoPago").value, total, items:carrito};
  const ventas = LS.get("ventas",[]); ventas.unshift(venta); LS.set("ventas", ventas);
  carrito = []; drawCarrito();
  ticketMsg.textContent = "✅ Venta registrada";
  setTimeout(()=> ticketMsg.textContent="", 2000);
};

// Catalogo CRUD
function buildCrud(tableEl, data, cols){
  const head = "<thead><tr>" + cols.map(c=>`<th>${c.label}</th>`).join("") + "<th></th></tr></thead>";
  let body = "<tbody>";
  data.forEach((row,i)=>{
    body += "<tr>";
    cols.forEach(c=>{
      body += `<td contenteditable data-col="${c.key}" data-i="${i}">${row[c.key]??""}</td>`;
    });
    body += `<td><button class="delRow" data-i="${i}">Borrar</button></td>`;
    body += "</tr>";
  });
  body += "</tbody>";
  tableEl.innerHTML = head + body;
  tableEl.querySelectorAll("[contenteditable]").forEach(td=>{
    td.oninput = ()=>{
      const i = parseInt(td.dataset.i); const col = td.dataset.col;
      data[i][col] = td.innerText.trim();
    }
  });
  tableEl.querySelectorAll(".delRow").forEach(btn=> btn.onclick = ()=>{
    const i = parseInt(btn.dataset.i); data.splice(i,1); buildCrud(tableEl, data, cols);
  });
}

function renderCatalogo(){
  const serv = LS.get("servicios",[]);
  const prods = LS.get("productos",[]);
  buildCrud(document.getElementById("tblServicios"), serv, [
    {key:"servicio", label:"Servicio"},
    {key:"tipo", label:"Tipo"},
    {key:"segmento", label:"Segmento"},
    {key:"precio", label:"Precio"}
  ]);
  buildCrud(document.getElementById("tblProductos"), prods, [
    {key:"sku", label:"SKU"},
    {key:"nombre", label:"Nombre"},
    {key:"categoria", label:"Categoría"},
    {key:"precioVenta", label:"Precio Venta"},
    {key:"precioCompra", label:"Precio Compra"},
    {key:"stock", label:"Stock"}
  ]);
  document.getElementById("addRowServicio").onclick = ()=>{ serv.push({servicio:"Nuevo", tipo:"", segmento:"", precio:0}); renderCatalogo(); };
  document.getElementById("addRowProducto").onclick = ()=>{ prods.push({sku:"", nombre:"Nuevo", categoria:"", precioVenta:0, precioCompra:"", stock:0}); renderCatalogo(); };
  document.getElementById("guardarCatalogo").onclick = ()=>{ LS.set("servicios",serv); LS.set("productos",prods); document.getElementById("saveMsg").textContent="Guardado"; setTimeout(()=>document.getElementById("saveMsg").textContent="",1500); renderSelects(); drawInventario(); };
}

// Inventario
function drawInventario(){
  const prods = LS.get("productos",[]);
  const tb = document.querySelector("#tblInv tbody");
  tb.innerHTML = "";
  prods.forEach(p=>{
    tb.innerHTML += `<tr><td>${p.sku||""}</td><td>${p.nombre}</td><td>${p.categoria}</td><td>${p.stock||0}</td></tr>`;
  });
}

// Membresías
function setupMembresias(){
  const sel = document.getElementById("mTipo");
  sel.innerHTML = LS.get("servicios",[])
    .filter(s=> s.tipo.toLowerCase()!=="visita")
    .map(s=> `<option value="${s.servicio}">${s.servicio} - $${s.precio}</option>`).join("");
  document.getElementById("mRegistrar").onclick = ()=>{
    const nombre = document.getElementById("mCli").value.trim();
    if(!nombre) return alert("Nombre requerido");
    const tipo = sel.value;
    const membs = LS.get("membresias",[]);
    membs.unshift({cliente:nombre, tipo, fecha:new Date().toISOString(), estado:"Activa"});
    LS.set("membresias", membs);
    document.getElementById("mMsg").textContent = "✅ Membresía registrada";
    setTimeout(()=> document.getElementById("mMsg").textContent="", 1500);
  };
}

// Clientes
function drawClientes(){
  const tb = document.querySelector("#tblClientes tbody");
  const arr = LS.get("clientes",[]);
  tb.innerHTML = "";
  arr.forEach(c=> tb.innerHTML += `<tr><td>${c.nombre}</td><td>${c.tel||""}</td></tr>`);
  document.getElementById("cAgregar").onclick = ()=>{
    const n = document.getElementById("cNombre").value.trim();
    if(!n) return alert("Nombre requerido");
    const t = document.getElementById("cTel").value.trim();
    arr.unshift({nombre:n, tel:t});
    LS.set("clientes", arr);
    drawClientes();
  };
}

// Historial
function drawHistorial(){
  const tb = document.querySelector("#tblHistorial tbody");
  const arr = LS.get("ventas",[]);
  tb.innerHTML = "";
  arr.forEach(v=> tb.innerHTML += `<tr><td>${new Date(v.fecha).toLocaleString()}</td><td>${v.usuario}</td><td>${v.metodo}</td><td>$${v.total}</td></tr>`);
}

// Init
function init(){
  renderCatalogo();
  drawInventario();
  setupMembresias();
  drawClientes();
  drawHistorial();
}
init();
