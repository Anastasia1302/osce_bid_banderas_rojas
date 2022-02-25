import { default as flagData } from './modules/flags_data.js';

const ITEMPERPAGE = 10

let DATA = []
let FILTERS = {}
let ORDERS = {
    flag: 'asc'
}

const load = async() => {
    //const response = await fetch('./data/test.csv')
    const response = await fetch('./data/banderas_rojas_malla_08Feb2022.csv')
    let data = await response.text()
    data = parseCSVtoArrObject(data)

    data = fixTypesData(data)
    DATA = data

    renderCalls(data)
    setRangeDates(data)
    setSectorList(data)
    setTipoProcesoSeleccionList(data)
    setObjetoContractualList(data)
    setRangeAmounts(data)
    setFlagsList(data)
}
load()


const parseCSVtoArrObject = (text) => {

    let rows = text.split(/\r\n/)
    if (rows.length === 1) {
        rows = text.split(/\n/)
    }
    let headers = rows.splice(0, 1)
    headers = headers[0].split('#')
    return rows.map(row => {
        const obj = {}
        const cols = row.split('#')
        cols.forEach((col, i) => {
            obj[headers[i]] = col
        })
        return obj
    })
}

const fixTypesData = (arr) => {
    // Convert dates to datatypes Date
    let fixArr = arr.map(row => {
            row.fechaconvocatoria = new Date(row.fechaconvocatoria)
            return row
        })
        // Convert amounts to datatypes Float
    fixArr = fixArr.map(row => {
            if (hasFloatStructure(row.monto_convocatoria)) {
                row.monto_convocatoria = parseFloat(row.monto_convocatoria)
            }
            return row
        })
        // Convert cantidad_banderas_si to Int
    fixArr = fixArr.map(row => {
            row.cantidad_banderas_si = parseInt(row.cantidad_banderas_si)
            return row
        })
        // Convert codigoconvocatoria to Int
    fixArr = fixArr.map(row => {
            row.codigoconvocatoria = parseInt(row.codigoconvocatoria)
            return row
        })
        // Extrac active flags
    fixArr = fixArr.map(row => {
        row.activeflags = getActiveFlags(row)
        return row
    })
    return fixArr

}

const getActiveFlags = (row) => {
    const keys = Object.keys(row)
    const flags = keys.filter(key => key.match(/^bandera_?(\d{1,2}a?)$/))
    const activeflags = flags.filter(key => row[key] == "Si")
    return activeflags
}

// TABLE RENDERS

const renderCalls = (arr, page = 1) => {

    FILTERS.page = page

    const filterArr = filterCalls(arr)
    const filterAndOrderArr = orderCalls(filterArr)

    const paginator = generateHTMLPaginator(filterAndOrderArr.length, page)
    renderPaginator(paginator)

    const callList = document.getElementById('call-list')
    callList.innerHTML = ''

    const callsInPage = getItemsPerPage(filterAndOrderArr, page)
    callsInPage.forEach(row => {
        const flagsHTML = generateHTMLFlags(row.activeflags, row)
        callList.innerHTML += generateHTMLCall(row, flagsHTML)
    })
}

const generateHTMLCall = (row, flags = '') => {
    return `<tr data-bs-toggle="collapse" data-bs-target="${'#collapseTable' + row.codigoconvocatoria}" aria-expanded="false" aria-controls="${'collapseTable' + row.codigoconvocatoria}" class="table-striped">
                <th class="center middle cursor-pointer" scope="row">${row.codigoconvocatoria}</th>
                <td class="cursor-pointer">${row.entidad}</td>
                <td class="center middle cursor-pointer">${row.tipoprocesoseleccion}</td>
                <td class="right middle cursor-pointer">${row.monto_convocatoria != '' ? 'S/ ' + parseFloat(row.monto_convocatoria).toFixed(2).replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") : 'Sin información'}</td>
                <td class="center middle cursor-pointer">${row.cantidad_banderas_si}</td>
            </tr>
            <tr class="collapse" id="${'collapseTable' + row.codigoconvocatoria}">
                <td colspan="5">
                    <div class="row p-3">
                        <div class="col-md-3 col-sm-6 col-12 mt-2">
                            <h6>Código de convocatoria:</h6>
                            <p class="m-0">${row.codigoconvocatoria}</p>
                        </div>
                        <div class="col-md-6 col-sm-6 col-12 mt-2">
                            <h6>Tipo de proceso de selección:</h6>
                            <p class="m-0">${row.tipoprocesoseleccion}</p>
                        </div>
                        <div class="col-md-3 col-sm-6 col-12 mt-2">
                            <h6>Objeto contractual:</h6>
                            <p class="m-0">${row.objetocontractual}</p>
                        </div>
                        <div class="col-md-3 col-sm-6 col-12 mt-2">
                            <h6>RUC de la entidad:</h6>
                            <p class="m-0">${row.ruc_entidad}</p>
                        </div>
                        <div class="col-md-9 col-sm-6 col-12 mt-2">
                            <h6>Nombre de la entidad:</h6>
                            <p class="m-0">${row.entidad}</p>
                        </div>
                        <div class="col-md-3 col-sm-6 col-12 mt-2">
                            <h6>Proceso:</h6>
                            <p class="m-0">${row.proceso}</p>
                        </div>
                        <div class="col-md-9 col-sm-6 col-12 mt-2">
                            <h6>Descripción del objeto:</h6>
                            <p class="m-0">${row.descripcion_proceso}</p>
                        </div>
                        <div class="col-md-3 col-sm-6 col-12 mt-2">
                            <h6>Fecha de convocatoria:</h6>
                            <p class="m-0">${new Date(row.fechaconvocatoria).toLocaleDateString("en-GB")}</p>
                        </div>
                        <div class="col-md-6 col-sm-6 col-12 mt-2">
                            <h6>Sector:</h6>
                            <p class="m-0">${row.sector}</p>
                        </div>
                        <div class="col-md-3 col-sm-6 col-12 mt-2">
                            <h6>Año:</h6>
                            <p class="m-0">${row.anio}</p>
                        </div>
                        ${flags}
                    </div>
                </td>
            </tr>`
}

const generateHTMLFlag = (id, row) => {
    return `<tr data-bs-toggle="collapse" data-bs-target="#collapseTableNest${row.codigoconvocatoria}_${id}" aria-expanded="false" aria-controls="collapseTableNest${row.codigoconvocatoria}_${id}">
                <th class="center middle cursor-pointer" scope="row">${flagData[id].nombre}</th>
                <td class="cursor-pointer">${flagData[id].descripcion}</td>
                <td class="center middle cursor-pointer">${flagData[id].etapa}</td>
            </tr>
            <tr class="collapse" id="collapseTableNest${row.codigoconvocatoria}_${id}">
                <td colspan="5">
                    <div class="p-2">
                        ${row.hasOwnProperty(id + "_version") ? "<h6>Número de versiones:</h6><p>" + row[id + "_version"] + "</p>" : ''}
                        ${row.hasOwnProperty(id + "_umbral_versionesPAC") ? "<h6>Umbral:</h6><p>" + row[id + "_umbral_versionesPAC"] + "</p>" : ''}
                        ${row.hasOwnProperty(id + "_grupo_entidad") ? "<h6>Grupo de entidad (presupuesto):</h6><p>" + row[id + "_grupo_entidad"] + "</p>" : ''}
                        ${row.hasOwnProperty(id + "_ente_%contrdirecta_item_mayor_2SD") ? fortmatItemsBandera2(row[id + "_ente_%contrdirecta_item_mayor_2SD"]) : ''}
                        ${row.hasOwnProperty(id + "_FechaAdj_Posterior_FechaDGR") ? formatItemsBandera8(row[id + "_FechaAdj_Posterior_FechaDGR"]) : ''}
                        ${row.hasOwnProperty(id + "_tipoprocesoseleccion_pac") ? "<h6>Tipo de proceso de selección según tabla PAC:</h6><p>" + row[id + "_tipoprocesoseleccion_pac"] + "</p>" : ''}
                        ${row.hasOwnProperty(id + "_tipoprocesoseleccion_adj") ? "<h6>Tipo de proceso de selección según tabla Adjudicaciones:</h6><p>" + row[id + "_tipoprocesoseleccion_adj"] + "</p>" : ''}
                        ${row.hasOwnProperty(id + "_dif_convocatoria_presentacionpropuestas") ? formatItemsBandera3a(new Date(row.fechaconvocatoria).toLocaleDateString("en-GB"), new Date(row.fechapresentacionpropuesta).toLocaleDateString("en-GB"), row[id + "_dif_convocatoria_presentacionpropuestas"], row[id + "_umbral"]) : ''}
                        ${row.hasOwnProperty(id + "_items_adjudicados_plazo_inferior_a_ley") ? formatItemsBandera17(row[id + "_umbral"], row[id + "_items_adjudicados_plazo_inferior_a_ley"]) : ''}
                        ${row.hasOwnProperty("df_" + id + "_itemscontratados_plazo_mayor_ley") ? formatItemsBandera22(row[id + "_umbral"], row["df_" + id + "_itemscontratados_plazo_mayor_ley"]) : ''}
                        ${row.hasOwnProperty(id + "_cantidad_ruc_postores") ? "<h6>Número de postores:</h6><p>0</p>" : ''}
                        ${row.hasOwnProperty(id + "_cant_ruc_codigo_postor") ? "<h6>Número de postores:</h6><p>" + row[id + "_cant_ruc_codigo_postor"] + "</p>" : ''}
                        ${row.hasOwnProperty(id + "_cant_rucparticipante") ? "<h6>Número de participantes:</h6><p>" + row[id + "_cant_rucparticipante"] + "</p>" : ''}
                        ${row.hasOwnProperty(id + "_ratio_postor_participante") ? "<h6>Ratio:</h6><p>" + row[id + "_ratio_postor_participante"] + "%</p>" : ''}
                        ${row.hasOwnProperty(id + "_umbral_ratio_postor_participante") ? "<h6>Umbral:</h6><p>" + row[id + "_umbral_ratio_postor_participante"] + "%</p>" : ''}
                        ${row.hasOwnProperty(id + "_proveedores_primera_vez") ? formatItemsProveedores(row[id + "_proveedores_primera_vez"]) : ''}
                        ${row.hasOwnProperty(id + "_items_nunca_antes_adjudicados_por_postor") ? fortmatItemsBandera5a(row[id + "_items_nunca_antes_adjudicados_por_postor"]) : ''}
                        ${row.hasOwnProperty(id + "_RUC_nohabido_nohallado") ? formatItemsEstadoRuc(row[id + "_RUC_nohabido_nohallado"]) : ''}
                        ${row.hasOwnProperty(id + "_postores_codflia_porcentaje_adj_vs_postulado") ? formatItemsBandera16(row[id + "_postores_codflia_porcentaje_adj_vs_postulado"]) : ''}
                        ${row.hasOwnProperty(id + "_items_cercanos_valor_referencia") ? formatItemsBandera15(row[id + "_items_cercanos_valor_referencia"]) : ''}
                        ${row.hasOwnProperty(id + "_precio_unitario_item_vs_historico") ? formatItemsBandera19(row[id + "_precio_unitario_item_vs_historico"]) : ''}
                        ${row.hasOwnProperty(id + "_atributos23a") ? formatItemsBandera23a(row[id + "_atributos23a"]) : ''}
                        ${row.hasOwnProperty(id + "_atributos27") ? formatItemsBandera27(row[id + "_atributos27"]) : ''}
                        ${row.hasOwnProperty(id + "_contrato_item_montorefitem_vs_montocontratoitem") ? formatItemsBandera29(row[id + "_contrato_item_montorefitem_vs_montocontratoitem"]) : ''}                    
                    </div>
                    <div class="metodologia">
                        <a class="btn-metodologia" data-bs-toggle="collapse" href="#collapseMetodologia${flagData[id].nombre}" role="button" aria-expanded="false" aria-controls="collapseMetodologia${flagData[id].nombre}">
                            <span style="padding-right: 5px">Ver la metodología</span>
                            <img src="image/down_arrow.png" alt="Collapse">
                        </a>
                    </div>
                    <div class="collapse" id="collapseMetodologia${flagData[id].nombre}">
                        <div class="metodologia-content">
                            ${flagData[id].metodologia}
                        </div>
                    </div>
                </td>
            </tr>`
}

const formatItemsProveedores = (value) => {
    const valueFix = value.replaceAll("(", "[").replaceAll(")", "]").replaceAll("'", '"');

    try {
        const obj = JSON.parse(valueFix)
        let content = ''
        let stringAcumulador = ""

        for (let val of obj) {
            stringAcumulador += `<tr>
                                    <td class="center middle">${val[0]}</td>
                                    <td class="center middle">${val[1]}</td>
                                </tr>`
        }

        return `<table class="table custom-striped table-bordered mt-2">
                    <thead>
                        <tr>
                            <th class="center middle" scope="col">RUC</th>
                            <th class="center middle" scope="col">Razón social</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${stringAcumulador}
                    </tbody>
                </table>`
    } catch(e){
        console.log(e)
        return `<p></p>`
    }
}

const formatItemsBandera15 = (value) => {
    const valueFix = value.replaceAll('"", ""','""|""')
                    .replaceAll('""',"")
                    .replaceAll('"[',"[")
                    .replaceAll(']"',"]")
                    .replaceAll("}","]")
                    .replaceAll("{","[")
                    .replaceAll(":[","***[")
                    .slice(1,-1)
                    .split("|")

    let stringAcumulador = ""

    for (let i = 0; i < valueFix.length; i++) {
        const arr = valueFix[i].slice(1,-1).split("***")
        const arrDetail = arr[1].slice(2,-2).split(";")
        const ruc = arr[0].split(": ")[1]

        stringAcumulador += `<tr>
                            <td class="center middle">${ruc.split(",")[0]}</td>
                            <td class="center middle">${ruc.split(",")[1]}</td>
                            <td class="center middle">${arrDetail[0].split(": ")[1] !== "0" ? arrDetail[0].split(": ")[1] : "Sin información"}</td>
                            <td class="center middle">${arrDetail[1].split(": ")[1] !== "nan" ? arrDetail[1].split(": ")[1] : "Sin información"}</td>
                            <td class="center middle">${arrDetail[3].split(": ")[1]}</td>
                            <td class="center middle">${arrDetail[4].split(": ")[1]}</td>
                        </tr>`
    }

    return `<table class="table custom-striped table-bordered mt-2">
        <thead>
            <tr>
                <th class="center middle" scope="col">RUC postor</th>
                <th class="center middle" scope="col">Razón social</th>
                <th class="center middle" scope="col">Número de ítem en convocatoria</th>
                <th class="center middle" scope="col">Código ítem</th>
                <th class="center middle" scope="col">Monto referencial</th>
                <th class="center middle" scope="col">Monto del postor</th>
            </tr>
        </thead>
        <tbody>
            ${stringAcumulador}
        </tbody>
    </table>`
}

const formatItemsBandera23a = (value) => {
    const arr = value.replaceAll(";**","; ").replaceAll("**","").slice(1)

    let stringAcumulador = ""

    const arrContent = arr.split("; ")

    stringAcumulador += `<tr>
                            <td class="center middle">${arrContent[3]}</td>
                            <td class="center middle">${arrContent[0].split(":")[1] !== "0" ? arrContent[0].split(":")[1] : "Sin información"}</td>
                            <td class="center middle">${arrContent[1].split(":")[1]}</td>
                            <td class="center middle">${arrContent[2].split(":")[1]}</td>
                            <td class="center middle">${arrContent[4].split(":")[1]}</td>
                            <td class="center middle">${arrContent[5].split(":")[1]}</td>
                            <td class="center middle">${arrContent[6].split(":")[1]}</td>
                            <td class="center middle">23% - 25%</td>
                        </tr>`

    return `<table class="table custom-striped table-bordered mt-2">
        <thead>
            <tr>
                <th class="center middle" scope="col"></th>
                <th class="center middle" scope="col">Número de contrato</th>
                <th class="center middle" scope="col">RUC proveedor</th>
                <th class="center middle" scope="col">Razón social</th>
                <th class="center middle" scope="col">Monto reducción</th>
                <th class="center middle" scope="col">Monto total</th>
                <th class="center middle" scope="col">Porcentaje</th>
                <th class="center middle" scope="col">Umbral</th>
            </tr>
        </thead>
        <tbody>
            ${stringAcumulador}
        </tbody>
    </table>`
}

const formatItemsBandera27 = (value) => {
    const arr = value.split(" | ")

    let stringAcumulador = ""

    for (let i = 0; i < arr.length; i++) {

        const arrContent = arr[i].split("; ")

        stringAcumulador += `<tr>
                                <td class="center middle">${arrContent[1].split(":")[1]}</td>
                                <td class="center middle">${arrContent[2].split(":")[1]}</td>
                                <td class="center middle">${arrContent[4].split(":")[1] !== " nan" ? arrContent[4].split(":")[1] : "Sin información"}</td>
                                <td class="center middle">${arrContent[5].split(":")[1]}</td>
                                <td class="center middle">${arrContent[6].split(":")[1]}</td>
                                <td class="center middle">${arrContent[7].split(":")[1]}</td>
                            </tr>`

    }

    return `<table class="table custom-striped table-bordered mt-2">
        <thead>
            <tr>
                <th class="center middle" scope="col">RUC proveedor</th>
                <th class="center middle" scope="col">Razón social</th>
                <th class="center middle" scope="col">Itemcubso</th>
                <th class="center middle" scope="col">Monto contratado item</th>
                <th class="center middle" scope="col">Monto postulación item</th>
                <th class="center middle" scope="col">Diferencia</th>
            </tr>
        </thead>
        <tbody>
            ${stringAcumulador}
        </tbody>
    </table>`
}

const formatItemsBandera29 = (value) => {
    const arr = value.split(" | ")

    let stringAcumulador = ""

    for (let i = 0; i < arr.length; i++) {

        const arrContent = arr[i].split("; ")

        stringAcumulador += `<tr>
                                <td class="center middle">${arrContent[1].split(":")[1]}</td>
                                <td class="center middle">${arrContent[2].split(":")[1]}</td>
                                <td class="center middle">${arrContent[4].split(":")[1] !== " 0" ? arrContent[4].split(":")[1] : "Sin información"}</td>
                                <td class="center middle">${arrContent[5].split(":")[1]}</td>
                                <td class="center middle">${arrContent[6].split(":")[1]}</td>
                                <td class="center middle">${arrContent[7].split(":")[1]}</td>
                                <td class="center middle">30%</td>
                            </tr>`

    }

    return `<table class="table custom-striped table-bordered mt-2">
        <thead>
            <tr>
                <th class="center middle" scope="col">RUC proveedor</th>
                <th class="center middle" scope="col">Razón social</th>
                <th class="center middle" scope="col">Itemcubso</th>
                <th class="center middle" scope="col">Monto contratado item (MCT)</th>
                <th class="center middle" scope="col">Monto referencial item (MRI)</th>
                <th class="center middle" scope="col">Incremento: MCI/MRI-1</th>
                <th class="center middle" scope="col">Umbral</th>
            </tr>
        </thead>
        <tbody>
            ${stringAcumulador}
        </tbody>
    </table>`
}

const formatItemsBandera19 = (value) => {
    value = value.replaceAll("\n", '')
    value = value.replaceAll("'", '"')
    const item = JSON.parse(value)
    const keysItem = Object.keys(item)
    const valuesItem = Object.values(item)

    let stringAcumulador = ""

    let c = 0;
    for (let valueItem of valuesItem) {
        if (typeof valueItem === 'object') {
            stringAcumulador += `<tr>
                                         <td class="center middle">${keysItem[c].split(" -")[0].split(" ")[1]}</td>
                                         <td class="center middle">${keysItem[c].split(" -")[1].split(" ")[1]}</td>
                                         <td class="center middle">${valueItem[0].split(" ")[2]}</td>
                                         <td class="center middle">${valueItem[3].split(" ")[1]}</td>
                                         <td class="center middle">${valueItem[4].split(": ")[1].slice(1,-1).replaceAll(" ", ", ")}</td>
                                     </tr>`
        } else {
            if (keysItem[c] != "item None") {
                stringAcumulador += `<tr>
                                        <td class="center middle">${keysItem[c] == "item None" ? "Sin información" : keysItem[c].split(" -")[0].split(" ")[1]}</td>
                                        <td class="center middle">${keysItem[c] == "item None" ? "Sin información" : keysItem[c].split(" -")[1].split(" ")[1]}</td>
                                        <td class="center middle"  colspan="4">${valueItem}</td>
                                    </tr>`
            }
        }
        c++;
    }
    return `<table class="table custom-striped table-bordered mt-2">
        <thead>
            <tr>
                <th class="center middle" scope="col">Código ítem</th>
                <th class="center middle" scope="col">Unidad</th>
                <th class="center middle" scope="col">Precio Unitario</th>
                <th class="center middle" scope="col">Umbral</th>
                <th class="center middle" scope="col">Convocatorias</th>
            </tr>
        </thead>
        <tbody>
            ${stringAcumulador}
        </tbody>
    </table>`
}

const formatItemsBandera3a = (fc, fpp, days, umbral) => {
    let stringAcumulador = ""

    stringAcumulador += `<tr>
                            <td class="center middle">${fc}</td>
                            <td class="center middle">${fpp}</td>
                            <td class="center middle">${days}</td>
                            <td class="center middle">${umbral}</td>
                        </tr>`

    return `<table class="table custom-striped table-bordered mt-2">
        <thead>
            <tr>
                <th class="center middle" scope="col">Fecha convocatoria (FC)</th>
                <th class="center middle" scope="col">Fecha presentación propuesta (FPP)</th>
                <th class="center middle" scope="col">Número de días hábiles entre FC y FPP</th>
                <th class="center middle" scope="col">Umbral</th>
            </tr>
        </thead>
        <tbody>
            ${stringAcumulador}
        </tbody>
    </table>`
}

const formatItemsEstadoRuc = (value) => {
    const arr = value.split(";")

    let stringAcumulador = ""

    for (let i = 0; i < arr.length; i++) {

        const arrContent = arr[i].split(":")

        stringAcumulador += `<h6>${arrContent[0] + ":"}</h6>
            <p>${arrContent[1]}</p>`
    }

    return stringAcumulador
}

const formatItemsBandera16 = (value) => {
    const arr = value.replaceAll(";","|")
                        .replaceAll("-R","; R")
                        .replaceAll("-C","; C")
                        .replaceAll("-F","; F")
                        .replaceAll("-P","; P")
                        .split("|")

    let stringAcumulador = ""

    for (let i = 0; i < arr.length; i++) {

        const arrContent = arr[i].split(";")

        stringAcumulador += `<tr>
                                <td class="center middle">${arrContent[0].split(":")[1]}</td>
                                <td class="center middle">${arrContent[1].split(":")[1]}</td>
                                <td class="center middle">${arrContent[2].split(":")[1]}</td>
                                <td class="center middle">${arrContent[3].split(":")[1]}</td>
                                <td class="center middle">${arrContent[4].split(":")[1]}</td>
                                <td class="center middle">${arrContent[5].split(":")[1]}</td>
                                <td class="center middle">${arrContent[6].split(":")[1]}</td>
                                <td class="center middle">90%</td>
                            </tr>`

    }

    return `<table class="table custom-striped table-bordered mt-2">
        <thead>
            <tr>
                <th class="center middle" scope="col">RUC postor</th>
                <th class="center middle" scope="col">Razón social</th>
                <th class="center middle" scope="col">Código familia</th>
                <th class="center middle" scope="col">Familia</th>
                <th class="center middle" scope="col">Número de postulaciones</th>
                <th class="center middle" scope="col">Número de contratos ganados</th>
                <th class="center middle" scope="col">Número de contratos ganados / Número de postulaciones</th>
                <th class="center middle" scope="col">Umbral</th>
            </tr>
        </thead>
        <tbody>
            ${stringAcumulador}
        </tbody>
    </table>`
}

const formatItemsBandera17 = (umbral, value) => {
    const arr = value.split("|")

    let stringAcumuladorConsorcioNo = ""
    let stringAcumuladorConsorcioSi = ""

    for (let i = 0; i < arr.length; i++) {

        const arrContent = arr[i].split(";")
        const consorcio = arrContent[0].split(":")[1]

        if ( consorcio === "No") {

            stringAcumuladorConsorcioNo += `<tr>
                                    <td class="center middle">${consorcio}</td>
                                    <td class="center middle">${arrContent[1].split(":")[1]}</td>
                                    <td class="center middle">${arrContent[2].split(":")[1]}</td>
                                    <td class="center middle">${arrContent[3].split(":")[1] !== "nan" ? arrContent[3].split(":")[1] : "Sin información"}</td>
                                    <td class="center middle">${new Date(arrContent[4]).toLocaleDateString("en-GB")}</td>
                                    <td class="center middle">${new Date(arrContent[5]).toLocaleDateString("en-GB")}</td>
                                    <td class="center middle">${parseInt(arrContent[6].split(":")[1])}</td>
                                    <td class="center middle">${umbral}</td>
                                </tr>`
        } else {
            stringAcumuladorConsorcioSi += `<tr>
                                    <td class="center middle">${consorcio}</td>
                                    <td class="center middle">${arrContent[2].split(":")[1]}</td>
                                    <td class="center middle">${arrContent[3].split(":")[1] !== "nan" ? arrContent[3].split(":")[1] : "Sin información"}</td>
                                    <td class="center middle">${new Date(arrContent[4]).toLocaleDateString("en-GB")}</td>
                                    <td class="center middle">${new Date(arrContent[5]).toLocaleDateString("en-GB")}</td>
                                    <td class="center middle">${parseInt(arrContent[6].split(":")[1])}</td>
                                    <td class="center middle">${umbral}</td>
                                </tr>`
        }
    }

    const tableConsorcioSi = (stringAcumuladorConsorcioSi.length>0) ? `
        <table class="table custom-striped table-bordered mt-2">
            <thead>
                <tr>
                    <th class="center middle" scope="col">Consorcio</th>
                    <th class="center middle" scope="col">Razón social</th>
                    <th class="center middle" scope="col">Código ítem</th>
                    <th class="center middle" scope="col">Fecha de Buena Pro (FBP)</th>
                    <th class="center middle" scope="col">Fecha de Consentimiento Buena Pro (FCBP)</th>
                    <th class="center middle" scope="col">Número de días hábiles entre FBP y FCBP</th>
                    <th class="center middle" scope="col">Umbral</th>
                </tr>
            </thead>
            <tbody>
                ${stringAcumuladorConsorcioSi}
            </tbody>
        </table>` : ""

    const tableConsorcioNo = (stringAcumuladorConsorcioNo.length>0) ?  `
        <table class="table custom-striped table-bordered mt-2">
            <thead>
                <tr>
                    <th class="center middle" scope="col">Consorcio</th>
                    <th class="center middle" scope="col">RUC o RUC miembro consorcio</th>
                    <th class="center middle" scope="col">Razón social</th>
                    <th class="center middle" scope="col">Código ítem</th>
                    <th class="center middle" scope="col">Fecha de Buena Pro (FBP)</th>
                    <th class="center middle" scope="col">Fecha de Consentimiento Buena Pro (FCBP)</th>
                    <th class="center middle" scope="col">Número de días hábiles entre FBP y FCBP</th>
                    <th class="center middle" scope="col">Umbral</th>
                </tr>
            </thead>
            <tbody>
                ${stringAcumuladorConsorcioNo}
            </tbody>
        </table>` : ""

    return tableConsorcioSi + tableConsorcioNo
}

const formatItemsBandera8 = (value) => {
    const arr = value.replaceAll(", |  ",",| ").split("|")

    let stringAcumulador = ""

    for (let i = 0; i < arr.length; i++) {

        const arrContent = arr[i].slice(1,-1).split(";")

        stringAcumulador += `<tr>
                                <td class="center middle">${arrContent[1].split(":")[1] !== "nan" ? arrContent[1].split(":")[1] : "Sin información"}</td>
                                <td class="center middle">${new Date(arrContent[3]).toLocaleDateString("en-GB")}</td>
                                <td class="center middle">${new Date(arrContent[4]).toLocaleDateString("en-GB")}</td>
                                <td class="center middle">${arrContent[5].split(":")[1]}</td>
                            </tr>`

    }

    return `<table class="table custom-striped table-bordered m-0">
        <thead>
            <tr>
                <th class="center middle" scope="col">Código item</th>
                <th class="center middle" scope="col">Fecha consentimiento Buena Pro</th>
                <th class="center middle" scope="col">Fecha de oficio o dictamen</th>
                <th class="center middle" scope="col">Resultado</th>
            </tr>
        </thead>
        <tbody>
            ${stringAcumulador}
        </tbody>
    </table>`
}

const formatItemsBandera22 = (umbral, value) => {
    const arr = value.split("|")

    let stringAcumuladorConsorcioNo = ""
    let stringAcumuladorConsorcioSi = ""

    for (let i = 0; i < arr.length; i++) {

        const arrContent = arr[i].split("; ")
        const consorcio = arrContent[0].split(":")[1]

        if ( consorcio === "No") {

            stringAcumuladorConsorcioNo += `<tr>
                                                <td class="center middle">${arrContent[0].split(":")[1]}</td>
                                                <td class="center middle">${arrContent[1].split(":")[1]}</td>
                                                <td class="center middle">${arrContent[2].split(":")[1]}</td>
                                                <td class="center middle">${arrContent[3].split(":")[1] !== "nan" ? arrContent[3].split(":")[1] : "Sin información"}</td>
                                                <td class="center middle">${new Date(arrContent[5]).toLocaleDateString("en-GB")}</td>
                                                <td class="center middle">${new Date(arrContent[6]).toLocaleDateString("en-GB")}</td>
                                                <td class="center middle">${parseInt(arrContent[7].split(":")[1])}</td>
                                                <td class="center middle">${umbral}</td>
                                            </tr>`
        } else {
            stringAcumuladorConsorcioSi += `<tr>
                                                <td class="center middle">${arrContent[0].split(":")[1]}</td>
                                                <td class="center middle">${arrContent[2].split(":")[1]}</td>
                                                <td class="center middle">${arrContent[3].split(":")[1] !== "nan" ? arrContent[3].split(":")[1] : "Sin información"}</td>
                                                <td class="center middle">${new Date(arrContent[5]).toLocaleDateString("en-GB")}</td>
                                                <td class="center middle">${new Date(arrContent[6]).toLocaleDateString("en-GB")}</td>
                                                <td class="center middle">${parseInt(arrContent[7].split(":")[1])}</td>
                                                <td class="center middle">${umbral}</td>
                                            </tr>`
        }
    }

    const tableConsorcioSi = (stringAcumuladorConsorcioSi.length>0) ? `<table class="table custom-striped table-bordered mt-2">
        <thead>
            <tr>
            <th class="center middle" scope="col">Consorcio</th>
            <th class="center middle" scope="col">Razón social</th>
            <th class="center middle" scope="col">Código item</th>
            <th class="center middle" scope="col">Fecha consentimiento Buena Pro</th>
            <th class="center middle" scope="col">Fecha suscripción de contrato</th>
            <th class="center middle" scope="col">Diferencia</th>
            <th class="center middle" scope="col">Umbral</th>
            </tr>
        </thead>
        <tbody>
            ${stringAcumuladorConsorcioSi}
        </tbody>
    </table>` : ""

    const tableConsorcioNo = (stringAcumuladorConsorcioNo.length>0) ?  `<table class="table custom-striped table-bordered mt-2">
    <thead>
        <tr>
            <th class="center middle" scope="col">Consorcio</th>
            <th class="center middle" scope="col">RUC o RUC miembro consorcio</th>
            <th class="center middle" scope="col">Razón social</th>
            <th class="center middle" scope="col">Código item</th>
            <th class="center middle" scope="col">Fecha consentimiento Buena Pro</th>
            <th class="center middle" scope="col">Fecha suscripción de contrato</th>
            <th class="center middle" scope="col">Diferencia</th>
            <th class="center middle" scope="col">Umbral</th>
        </tr>
    </thead>
    <tbody>
        ${stringAcumuladorConsorcioNo}
    </tbody>
    </table>` : ""

    return tableConsorcioSi + tableConsorcioNo
}

const fortmatItemsBandera5a = (value) => {
    const valueFix = value.replaceAll("\'","\"")
                            .replaceAll("\(","[")
                            .replaceAll("\)","]")
                            .replaceAll("\{","[")
                            .replaceAll("\}","]")
                            .replaceAll(":",",")

    const arr = JSON.parse(valueFix)
    let stringAcumulador = ""

    for(let i = 0; i < arr.length; i = i+2 ) { 
        const ruc = arr[i] 
        const grupoContratos = arr[i+1][0]

        stringAcumulador += `
                <tr>
                    <td class="center middle">${ruc[0]}</td>
                    <td class="center middle">${ruc[1]}</td>
                    <td class="center middle">${grupoContratos[0]}</td>
                    <td class="center middle">${grupoContratos[1]}</td>
                    <td class="center middle">${grupoContratos[2]}</td>
                </tr>
            `
    }

    return `<table class="table custom-striped table-bordered mt-2">
        <thead>
            <tr>
                <th class="center middle" scope="col">RUC</th>
                <th class="center middle" scope="col">Razón social</th>
                <th class="center middle" scope="col">Código grupo</th>
                <th class="center middle" scope="col">Grupo</th>
                <th class="center middle" scope="col">
                    <p class="mb-2">Códigos grupos contratos anteriores</p>
                    <a class="btn-metodologia" href="data/banderas_rojas_codigosgrupos_gruposdescripcion.xlsx" download>
                        <span style="padding-right: 5px">Tabla de códigos de grupo</span>
                        <img src="image/download.png" alt="Download">
                    </a>
                </th>
            </tr>
        </thead>
        <tbody>
            ${stringAcumulador}
        </tbody>
    </table>`
}

const fortmatItemsBandera2 = (value) => {
    const content = value
    const changeQuotes = content.replaceAll("\'", "\"")

    const parseJson = JSON.parse(changeQuotes)
    const keysObject = Object.keys(parseJson)

    let stringAcumulador = ""

    for (let i = 0; i < keysObject.length; i++) {
        if (typeof parseJson[keysObject[i]] == "object") {
            stringAcumulador += `
                <tr>
                    <td class="center middle">${keysObject[i].split(" ")[1]}</td>
                    <td class="center middle">${parseJson[keysObject[i]]["Porcentaje_ente"] + "%"}</td>
                    <td class="center middle">${parseJson[keysObject[i]]["Umbral"] + "%"}</td>
                </tr>
            `
        }
    }

    return `<table class="table custom-striped table-bordered mt-2">
        <thead>
            <tr>
                <th class="center middle" scope="col">Itemcubso</th>
                <th class="center middle" scope="col">Porcentaje ente</th>
                <th class="center middle" scope="col">Umbral</th>
            </tr>
        </thead>
        <tbody>
            ${stringAcumulador}
        </tbody>
    </table>`
}

const generateHTMLFlags = (activeFlags, row) => {
    if (activeFlags.length > 0) {
        let flagsHTML = activeFlags.map(idFlag => {
            return generateHTMLFlag(idFlag, row)
        })
        flagsHTML = flagsHTML.join('')

        return `<div class="col-12 mt-4">
            <h6 class="mb-3">Banderas encontradas:</h6>
            <table class="table table-bordered m-0">
                <thead>
                    <tr>
                        <th class="gray-header center middle" scope="col"><span>Bandera</span></th>
                        <th class="gray-header center middle" scope="col"><span>Descripción</span></th>
                        <th class="gray-header center middle" scope="col"><span>Etapa</span></th>
                    </tr>
                </thead>
                <tbody>
                ${flagsHTML}
                </tbody>
            </table>
        </div>`
    }
    return ''
}

const generateHTMLFlagsModal = () => {
    const aGlosario = document.getElementById('flags-list')

    const values = Object.values(flagData)
    const keys = Object.keys(flagData)
    const keysReplace = keys.map(x => parseFloat(x.replace("_", "").replace("bandera", "").replace("a", ".5")))


    for (let i=0; i < values.length; i++) {
        values[i].valor = keysReplace[i]
    }

    const flagsSort = values.sort((a, b) => a.valor - b.valor)

    let stringAcumulador = ""

    for (let e of flagsSort) {
        stringAcumulador += `<tr>
                                <th class="center middle" scope="row">${e.nombre}</th>
                                <td class="middle">${e.descripcion}</td>
                                <td class="center middle">${e.etapa}</td>
                            </tr>`
    }

    aGlosario.innerHTML = stringAcumulador
}

generateHTMLFlagsModal()

const generateHTMLPaginator = (itemsLength, page = 1, itemsPerPage = ITEMPERPAGE, maxButtons = 9) => {

    const pages = Math.ceil(itemsLength / itemsPerPage);

    const arrButtons = []
    if (pages > 1) {
        arrButtons.push(generateButtonPaginatorHTNL('&laquo;', '', (page == 1), false, "onclick=handlePage(this)"));
    }
    if (pages <= maxButtons - 2) {
        for (let i = 1; i <= pages; i++) {
            arrButtons.push(generateButtonPaginatorHTNL(i, (i == pages) ? 'last-page' : "", false, (page == i), "onclick=handlePage(this)"))
        }
    } else {
        if (page <= maxButtons - 5) {
            for (let i = 1; i <= maxButtons - 4; i++) {
                arrButtons.push(generateButtonPaginatorHTNL(i, (i == pages) ? 'last-page' : "", false, (page == i), "onclick=handlePage(this)"))
            }
            arrButtons.push(generateButtonPaginatorHTNL('...', '', false, false, ''))
            arrButtons.push(generateButtonPaginatorHTNL(pages, 'last-page', false, (page == pages), "onclick=handlePage(this)"))
        } else if (page + (maxButtons - 4) > pages) {
            arrButtons.push(generateButtonPaginatorHTNL(1, '', false, (page == 1), "onclick=handlePage(this)"))
            arrButtons.push(generateButtonPaginatorHTNL('...', '', false, false, ''))
            for (let i = pages - (maxButtons - 5); i <= pages; i++) {
                arrButtons.push(generateButtonPaginatorHTNL(i, (i == pages) ? 'last-page' : "", false, (page == i), "onclick=handlePage(this)"))
            }
        } else {
            arrButtons.push(generateButtonPaginatorHTNL(1, '', false, (page == 1), "onclick=handlePage(this)"))
            arrButtons.push(generateButtonPaginatorHTNL('...', '', false, false, ''))
            for (let i = page - ((maxButtons - 7) / 2); i <= page + ((maxButtons - 7) / 2); i++) {
                arrButtons.push(generateButtonPaginatorHTNL(i, (i == pages) ? 'last-page' : "", false, (page == i), "onclick=handlePage(this)"))
            }
            arrButtons.push(generateButtonPaginatorHTNL('...', '', false, false, ''))
            arrButtons.push(generateButtonPaginatorHTNL(pages, 'last-page', false, (page == pages), "onclick=handlePage(this)"))
        }
    }
    if (pages > 1) {
        arrButtons.push(generateButtonPaginatorHTNL('&raquo;', '', (page == pages), false, "onclick=handlePage(this)"));
    }


    const buttons = arrButtons.join('')
    const paginator = `<nav>
        <ul class="pagination m-0 justify-content-center">
            ${buttons}
        </ul>
    </nav>`
    return paginator
}

const generateButtonPaginatorHTNL = (value, id = '', disabled = false, active = false, callback = '') => {
    return `<li ${callback} class=" page-item ${(disabled) ? "disabled" : ""} ${(active) ? "active" : ""}">
        <a class="page-link" ${(id != '') ? 'id="' + id + '"' : ""} >${value}</a>
    </li>`
}

const renderPaginator = (paginator) => {
    const paginatorTarget = document.getElementById('paginator')
    paginatorTarget.innerHTML = paginator
}

const getItemsPerPage = (items, page = 1, itemsPerPage = ITEMPERPAGE) => {
    return items.slice((page - 1) * itemsPerPage, page * itemsPerPage)
}

// SETS

const setRangeDates = (arr) => {

    const dates = arr.map(row => row.fechaconvocatoria)
    const maxDate = new Date(Math.max.apply(null, dates))
    const minDate = new Date(Math.min.apply(null, dates))
    flatpickr("#calendar-range", {
        mode: "range",
        dateFormat: "Y-m-d",
        conjunction: " :: ",
        locale: {
            firstDayOfWeek: 1,
            weekdays: {
                shorthand: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'],
                longhand: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
            },
            months: {
                shorthand: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Оct', 'Nov', 'Dic'],
                longhand: ['Enero', 'Febrero', 'Мarzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
            },
        },
        maxDate: maxDate,
        minDate: minDate
    })
}

const setRangeAmounts = (arr) => {

    const amounts = arr.filter(x => isNumber(x.monto_convocatoria)).map(x => x.monto_convocatoria)

    const maxAmount = Math.max.apply(null, amounts)
    const minAmount = Math.min.apply(null, amounts)

    const amountRangeMin = document.getElementById('amount-range-min')
    const amountRangeMax = document.getElementById('amount-range-max')

    amountRangeMin.setAttribute('min', minAmount)
    amountRangeMin.setAttribute('max', maxAmount)

    amountRangeMin.setAttribute('value', minAmount)

    amountRangeMax.setAttribute('min', minAmount)
    amountRangeMax.setAttribute('max', maxAmount)

    amountRangeMax.setAttribute('value', maxAmount)

    twoRangeSlider.init();

}

const setSectorList = (arr) => {
    const sectorTarget = document.getElementById('select-sector')
    const sectorsSet = new Set(arr.map(row => row.sector));

    const sectorsSort = [...sectorsSet].sort()

    sectorsSort.forEach(sector => {
        sectorTarget.innerHTML += `<option value="${sector}">${sector}</option>`
    })
}

const setTipoProcesoSeleccionList = (arr) => {
    const tipoProcesoSeleccionTarget = document.getElementById('select-tipoprocesoseleccion')
    const tipoProcesoSeleccionSet = new Set(arr.map(row => row.tipoprocesoseleccion));
    const tipoProcesoSeleccionSort = [...tipoProcesoSeleccionSet].sort()

    tipoProcesoSeleccionSort.forEach(tipoprocesoseleccion => {
        tipoProcesoSeleccionTarget.innerHTML += `<option value="${tipoprocesoseleccion}">${tipoprocesoseleccion}</option>`
    })
}

const setObjetoContractualList = (arr) => {
    const objetoContractualTarget = document.getElementById('select-objetocontractual')
    const objetoContractualSet = new Set(arr.map(row => row.objetocontractual));
    const objetoContractualSort = [...objetoContractualSet].sort()

    objetoContractualSort.forEach(objetocontractual => {
        objetoContractualTarget.innerHTML += `<option value="${objetocontractual}">${objetocontractual}</option>`
    })
}

const setFlagsList = (arr) => {
    const flagsTarget = document.getElementById('select-flags')
    let allFlags = []
    arr.map(row => row.activeflags).forEach(arrFlags => {
        allFlags = [...allFlags, ...arrFlags]
    })
    const flagsSet = new Set(allFlags);
    const flagsValue = [...flagsSet].map(x => parseFloat(x.replace("_", "").replace("bandera", "").replace("a", ".5")))

    const flags = []
    let i = 0;
    flagsSet.forEach((f) => {
        const obj = {}
        obj['value'] = flagsValue[i]
        obj['flag'] = f
        flags.push(obj)
        i++
    })

    const flagsArrSort = flags.sort((a, b) => a.value - b.value)

    flagsArrSort.forEach(flag => {
        flagsTarget.innerHTML += `<option value="${flag.flag}">${flagData[flag["flag"]].nombre}</option>`
    })
}

// FILTER

const filterCalls = (arr) => {

    let filterData = arr

    const minAmount = FILTERS.minAmount
    const maxAmount = FILTERS.maxAmount
    if (minAmount != undefined && maxAmount != undefined) {
        filterData = filterFloats(filterData, 'monto_convocatoria', minAmount, maxAmount)
    }

    const minDate = FILTERS.minDate
    const maxDate = FILTERS.maxDate
    if (minDate != undefined && maxDate != undefined) {
        filterData = filterDates(filterData, 'fechaconvocatoria', minDate, maxDate)
    }

    const sector = FILTERS.sector
    if (sector != undefined) {
        filterData = filterString(filterData, 'sector', sector)
    }

    const tipoprocesoseleccion = FILTERS.tipoprocesoseleccion
    if (tipoprocesoseleccion != undefined) {
        filterData = filterString(filterData, 'tipoprocesoseleccion', tipoprocesoseleccion)
    }

    const objetocontractual = FILTERS.objetocontractual
    if (objetocontractual != undefined) {
        filterData = filterString(filterData, 'objetocontractual', objetocontractual)
    }

    const flag = FILTERS.flag
    if (flag != undefined) {
        filterData = filterArray(filterData, 'activeflags', flag)
    }

    const ruc = FILTERS.ruc
    if (ruc != undefined && ruc != '') {
        filterData = filterStringSearch(filterData, 'ruc_entidad', ruc)
    }

    const anio = FILTERS.anio
    if (anio != undefined && anio != '') {
        filterData = filterStringSearch(filterData, 'anio', anio)
    }

    const nombreentidad = FILTERS.nombreentidad
    if (nombreentidad != undefined && nombreentidad != '') {
        filterData = filterStringSearch(filterData, 'entidad', nombreentidad)
    }

    const proceso = FILTERS.proceso
    if (proceso != undefined && proceso != '') {
        filterData = filterStringSearch(filterData, 'proceso', proceso)
    }

    const descripcion = FILTERS.descripcion
    if (descripcion != undefined && descripcion != '') {
        filterData = filterStringSearch(filterData, 'descripcion_proceso', descripcion)
    }

    const codigoconvocatoria = FILTERS.codigoconvocatoria
    if (codigoconvocatoria != undefined && codigoconvocatoria != '') {
        filterData = filterStringSearch(filterData, 'codigoconvocatoria', codigoconvocatoria)
    }

    return filterData
}

// ORDER

const orderCalls = (arr) => {
    let orderData = arr

    const codeOrder = ORDERS.code
    if (codeOrder != undefined) {
        orderData = orderNumbers(orderData, 'codigoconvocatoria', codeOrder)
    }

    const amountOrder = ORDERS.amount
    if (amountOrder != undefined) {
        orderData = orderNumbers(orderData, 'monto_convocatoria', amountOrder)
    }

    const flagOrder = ORDERS.flag
    if (flagOrder != undefined) {
        orderData = orderNumbers(orderData, 'cantidad_banderas_si', flagOrder)
    }

    const typeOrder = ORDERS.type
    if (typeOrder != undefined) {
        orderData = orderStrings(orderData, 'tipoprocesoseleccion', typeOrder)
    }

    const entityOrder = ORDERS.entity
    if (entityOrder != undefined) {
        orderData = orderStrings(orderData, 'entidad', entityOrder)
    }

    return orderData
}

// ORDER UTILITES

const orderNumbers = (items, key, order) => {
    items = items.map(item => {
        if (!isNumber(item[key])) item[key] = 0
        return item
    })
    return orderItems(items, key, order)
}

const orderStrings = (items, key, order) => {
    return orderItems(items, key, order)
}

const orderItems = (items, key, order) => {
    if (order == 'asc') {
        items = items.sort((a, b) => (a[key] > b[key]) ? 1 : -1)
        return items
    }
    if (order == 'des') {
        return items.sort((a, b) => (a[key] > b[key]) ? -1 : 1)
    }
}


// FILTERS UTILITIES

const filterDates = (items, key, min, max) => {
    return items.filter(item => (item[key] <= max && item[key] >= min))
}

const filterFloats = (items, key, min, max) => {
    const parseItems = items.filter(item => isNumber(item[key]))
    return parseItems.filter(item => (item[key] <= max && item[key] >= min))
}

const filterString = (items, key, value) => {
    return items.filter(item => (item[key] === value))
}

const filterArray = (items, key, value) => {
    return items.filter(item => (item[key].includes(value)))
}

const filterStringSearch = (items, key, value) => {
    const reSearch = new RegExp(value, 'i')
    return items.filter(item => (reSearch.test(item[key])))
}

// UTILITIES

const hasFloatStructure = (s) => {
    s = String(s)
    return s.match(/^[0-9]{1,}(\.[0-9]*)?$/)
}

const isNumber = (value) => {
    return typeof value === 'number' && isFinite(value);
}

// EVENT HANDLERS

const handlePage = (e) => {

    const buttonText = e.querySelector('a').innerHTML
    const activePage = FILTERS.page
    const lastPage = parseInt(document.getElementById('last-page').innerHTML)

    if (buttonText == '«') {
        if (activePage != 1) {
            renderCalls(DATA, activePage - 1)
        }
    } else if (buttonText == '»') {
        if (activePage != lastPage) {
            renderCalls(DATA, activePage + 1)
        }
    } else {
        const page = parseInt(buttonText)
        renderCalls(DATA, page)
    }
}

const setDatePickerListener = () => {
    const picker = document.getElementById('calendar-range')
    picker.addEventListener('change', (e) => {
        const dates = getDatesFromPicker(e.target.value)
        if (dates.length == 2) {
            FILTERS.minDate = dates[0]
            FILTERS.maxDate = dates[1]
            renderCalls(DATA)
        }
    })
}
setDatePickerListener()

const getDatesFromPicker = (value) => {
    const dates = value.split(' to ')
    return dates.map(d => {
        const date = new Date(d)
        return date
    })
}

const setSectorSelectListener = (() => {
    const sectorSelect = document.getElementById('select-sector')
    sectorSelect.addEventListener('change', (e) => {
        FILTERS.sector = e.target.value
        renderCalls(DATA)
    })

})
setSectorSelectListener()

const setTipoProcesoSeleccionSelectListener = () => {
    const tipoProcesoSeleccionSelect = document.getElementById('select-tipoprocesoseleccion')
    tipoProcesoSeleccionSelect.addEventListener('change', (e) => {
        FILTERS.tipoprocesoseleccion = e.target.value
        renderCalls(DATA)
    })

}
setTipoProcesoSeleccionSelectListener()

const setObjetoContractualSelectListener = () => {
    const objetoContractual = document.getElementById('select-objetocontractual')
    objetoContractual.addEventListener('change', (e) => {
        FILTERS.objetocontractual = e.target.value
        renderCalls(DATA)
    })

}
setObjetoContractualSelectListener()

const setAmountRangeListener = () => {
    const inputsRanges = document.querySelectorAll('.two-range-slider__input')
    inputsRanges.forEach(input => {
        input.addEventListener('change', (e) => {

            const id = e.target.id

            const minRangeValue = parseFloat(document.getElementById('amount-range-min').value)
            const maxRangeValue = parseFloat(document.getElementById('amount-range-max').value)

            FILTERS.minAmount = parseFloat(minRangeValue)
            FILTERS.maxAmount = parseFloat(maxRangeValue)

            let value = parseFloat(e.target.value)
            if (id == 'amount-range-max') {
                if (value < minRangeValue) {
                    e.target.value = minRangeValue * 1.2
                    value = minRangeValue * 1.2
                    FILTERS.maxAmount = value
                    document.querySelector(".js-two-range-slider-max-value").innerHTML = 'Max: S/' + parseInt(value)
                }
            } else if (id == 'amount-range-min') {
                if (value > maxRangeValue) {
                    e.target.value = maxRangeValue * 0.8
                    value = maxRangeValue * 0.8
                    FILTERS.minAmount = value
                    document.querySelector(".js-two-range-slider-min-value").innerHTML = 'Min: S/' + parseInt(value)
                }
            }
            if (FILTERS.maxAmount >= FILTERS.minAmount) {
                renderCalls(DATA)
            }
        })
    })
}
setAmountRangeListener()

const setFlagsSelectListener = () => {
    const flagSelect = document.getElementById('select-flags')
    flagSelect.addEventListener('change', (e) => {
        FILTERS.flag = e.target.value
        renderCalls(DATA)
        addFlagDescription(e.target.value)
    })
}
setFlagsSelectListener()

const addFlagDescription = (flag) => {
    const flagDescription = document.getElementById('flag-description')
    flagDescription.innerHTML = `Bandera ${flagData[flag].nombre}: ${flagData[flag].descripcion}`
}

const setSearchRucListener = () => {
    const rucSearch = document.getElementById('input-ruc')
    rucSearch.addEventListener('input', (e) => {
        FILTERS.ruc = e.target.value
        renderCalls(DATA)
    })
}
setSearchRucListener()

const setSearchAnioListener = () => {
    const anioSearch = document.getElementById('input-anio')
    anioSearch.addEventListener('input', (e) => {
        FILTERS.anio = e.target.value
        renderCalls(DATA)
    })
}
setSearchAnioListener()

const setSearchNombreEntidadListener = () => {
    const nombreEntidadSearch = document.getElementById('input-nombreentidad')
    nombreEntidadSearch.addEventListener('input', (e) => {
        FILTERS.nombreentidad = e.target.value
        renderCalls(DATA)
    })
}
setSearchNombreEntidadListener()

const setSearchProcesoListener = () => {
    const procesoSearch = document.getElementById('input-proceso')
    procesoSearch.addEventListener('input', (e) => {
        FILTERS.proceso = e.target.value
        renderCalls(DATA)
    })
}
setSearchProcesoListener()

const setSearchDescripcionListener = () => {
    const descripcionSearch = document.getElementById('input-descripcion')
    descripcionSearch.addEventListener('input', (e) => {
        FILTERS.descripcion = e.target.value
        renderCalls(DATA)
    })
}
setSearchDescripcionListener()

const setSearchCodigoConvocatoriaListener = () => {
    const codigoConvocatoriaSearch = document.getElementById('input-codigo-convocatoria')
    codigoConvocatoriaSearch.addEventListener('input', (e) => {
        FILTERS.codigoconvocatoria = e.target.value
        renderCalls(DATA)
    })
}
setSearchCodigoConvocatoriaListener()

const setTableHeaderListener = () => {
    const tableHeaders = document.getElementsByClassName('table-header');
    [...tableHeaders].forEach(tableHeader => {
        tableHeader.addEventListener('click', (e) => {

            const target = e.target.closest('.table-header');

            [...tableHeaders].forEach(th => {
                if (th != target) {
                    th.querySelector("img").classList.remove('rotate')
                }
            })

            target.querySelector("img").classList.toggle('rotate')

            const field = target.dataset.field
            const currentStatus = ORDERS[field];
            ORDERS = {}
            if (currentStatus == 'asc') {
                ORDERS[field] = 'des'
            } else {
                ORDERS[field] = 'asc'
            }
            renderCalls(DATA)

        })
    })
}
setTableHeaderListener()

const setResetFilterListeners = () => {
    const closes = document.querySelectorAll('.form-floating .btn-close')
    closes.forEach(close => {
        close.addEventListener('click', (e) => {
            const filterControl = e.target.closest('.form-floating')

            if (filterControl.querySelector('select')) {
                const select = filterControl.querySelector('select')
                select.getElementsByTagName('option')[0].selected = 'selected'
                if (select.id === "select-flags") {
                    document.getElementById('flag-description').innerHTML = ''
                }
            }
            if (filterControl.querySelector('input[type=text]')) {
                const inputText = filterControl.querySelector('input[type=text]')
                inputText.value = ''
            }
            if (filterControl.querySelector('input[type=number]')) {
                const inputNumber = filterControl.querySelector('input[type=number]')
                inputNumber.value = ''
            }
            if (filterControl.querySelector('input[type=range]')) {
                const inputRangeMin = filterControl.querySelector('input[type=range]#amount-range-min')
                inputRangeMin.value = inputRangeMin.min
                const inputRangeMax = filterControl.querySelector('input[type=range]#amount-range-max')
                inputRangeMax.value = inputRangeMax.max

            }

            const filter = filterControl.dataset.filter
            if (filter == 'amount') {
                delete FILTERS['minAmount']
                delete FILTERS['maxAmount']
                setRangeAmounts(DATA)
            } else if (filter == 'date') {
                delete FILTERS['minDate']
                delete FILTERS['maxDate']
                setRangeDates(DATA)
            } else {
                delete FILTERS[filter]
            }
            renderCalls(DATA)

        })
    })
}
setResetFilterListeners()


window.handlePage = handlePage